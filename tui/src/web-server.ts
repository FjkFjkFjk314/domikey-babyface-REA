#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { devices } from 'node-hid'
import { isKnownDevice, isBlueDevice } from './detect.js'
import { HidChannel } from './hid.js'
import { DOMIKEY_MODELS } from './keymap-data.js'
import { renderWebAppHtml } from './web-app.js'

const PORT = Number(process.env.PORT ?? 3820)
const HOST = process.env.HOST ?? '0.0.0.0'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.resolve(__dirname, '../assets')

function findDomikeyDevices() {
  try {
    return devices()
      .filter((d) => d.path && isKnownDevice(d.vendorId, d.productId))
      .map((d) => ({
        path: d.path!,
        vid: d.vendorId,
        pid: d.productId,
        usagePage: d.usagePage,
        usage: d.usage,
        product: d.product ?? 'Domikey Keyboard',
        manufacturer: d.manufacturer ?? 'Domikey',
        isBlue: isBlueDevice(d.vendorId, d.productId),
      }))
  } catch {
    return []
  }
}

function readJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

export function createWebServer() {
  const html = renderWebAppHtml()

  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)

    if ((req.method === 'GET' || req.method === 'HEAD') && (url.pathname === '/' || url.pathname === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(req.method === 'HEAD' ? undefined : html)
      return
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname.startsWith('/assets/')) {
      const fileName = path.basename(url.pathname)
      if (/^[a-zA-Z0-9_.-]+\.png$/.test(fileName)) {
        const filePath = path.join(ASSETS_DIR, fileName)
        if (fs.existsSync(filePath)) {
          const buf = fs.readFileSync(filePath)
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
          })
          res.end(req.method === 'HEAD' ? undefined : buf)
          return
        }
      }
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ ok: false, error: 'Asset not found' }))
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/devices') {
      const found = findDomikeyDevices()
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
      res.end(
        JSON.stringify({
          ok: true,
          devices: found,
          models: Object.keys(DOMIKEY_MODELS),
        }),
      )
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/hid/write') {
      try {
        const body = await readJsonBody(req)
        const reportArr = Array.isArray(body.report) ? (body.report as number[]) : []
        if (reportArr.length !== 64) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' })
          res.end(JSON.stringify({ ok: false, error: 'report must be 64 bytes' }))
          return
        }

        const reportBuf = Buffer.from(reportArr.map((x) => Number(x) & 0xff))
        const found = findDomikeyDevices()
        if (found.length > 0) {
          const target = found[0]!
          const ch = new HidChannel(target.path)
          try {
            // reportBuf 已在前端算好 b[7]/b[8] 校验和, 此处用 checkSumType = 2 直发
            const written = await ch.writeFeature(reportBuf, 2)
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
            res.end(
              JSON.stringify({
                ok: written,
                mode: 'hardware',
                device: target.product,
                message: `Sent 65B Feature Report to ${target.path}`,
              }),
            )
            return
          } finally {
            ch.close()
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(
          JSON.stringify({
            ok: true,
            mode: 'mock-bridge',
            message: '未检测到插入的物理键盘, Bridge 已在沙盒模式下确认 64B 报文有效',
          }),
        )
        return
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, error: (e as Error).message }))
        return
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ ok: false, error: 'Not Found' }))
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = createWebServer()
  server.listen(PORT, HOST, () => {
    console.log(`Domikey Web Keymap Manager listening on http://${HOST}:${PORT}`)
  })
}
