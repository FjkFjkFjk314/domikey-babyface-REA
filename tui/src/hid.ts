// HID feature-report 传输层。
// 对应原架构: 渲染层 --gRPC--> iot_driver.exe --HID--> 键盘
// TUI 去掉中间层, 直接用 node-hid 收发 64 字节 feature report (连同 1B Report ID 共 65 字节)。
//
// 校验和算法已通过逆向 iot_driver.exe (src\dj_hid_device\mod.rs @ 0x57465d-0x57479c) 完整还原,
// 详见 docs/REVERSE-ENGINEERING.md 第 4 节。

import { HID } from 'node-hid'

const REPORT_LEN = 64

export type CheckSumType = 0 | 1 | 2

// checkSumType = 0: 对 b[0..6] 共 7 字节求和取反, 写入 b[7]
export function checksum7(buf: Buffer): number {
  let sum = 0
  for (let i = 0; i < 7; i++) {
    sum += buf[i] ?? 0
  }
  return 255 - (sum & 0xff)
}

// checkSumType = 1: 对 b[0..7] 共 8 字节求和取反, 写入 b[8] (用于携带 RGB 的灯效命令)
export function checksum8(buf: Buffer): number {
  let sum = 0
  for (let i = 0; i < 8; i++) {
    sum += buf[i] ?? 0
  }
  return 255 - (sum & 0xff)
}

export function applyChecksum(buf: Buffer, checkSumType: CheckSumType): Buffer {
  const out = Buffer.alloc(REPORT_LEN)
  buf.copy(out, 0, 0, REPORT_LEN)
  if (checkSumType === 0) {
    out[7] = checksum7(out)
  } else if (checkSumType === 1) {
    out[8] = checksum8(out)
  }
  return out
}

export class HidChannel {
  private dev: HID

  constructor(path: string) {
    this.dev = new HID(path)
  }

  close(): void {
    this.dev.close()
  }

  // 对应 USBDevice.writeFeatureCmd (USBDevice.ts:92) 及 iot_driver.exe 的 hid_send_feature_report
  // Windows/Linux HID feature report 首字节为 Report ID (0x00), 随后是 64 字节 payload, 共 65 字节
  async writeFeature(buf: Buffer, checkSumType: CheckSumType = 2): Promise<boolean> {
    const payload = applyChecksum(buf, checkSumType)
    const reportWithId = Buffer.alloc(REPORT_LEN + 1)
    reportWithId[0] = 0x00
    payload.copy(reportWithId, 1)
    const bytesWritten = this.dev.sendFeatureReport(reportWithId)
    return bytesWritten >= REPORT_LEN
  }

  async readFeature(waitMs = 5): Promise<Buffer | undefined> {
    await sleep(waitMs)
    const res = this.dev.getFeatureReport(0, REPORT_LEN + 1)
    if (!res || res.length === 0) return undefined
    const raw = Buffer.from(res)
    // 若返回 65 字节(首字节为 Report ID 0x00), 剥离首字节返回 64 字节 payload
    return raw.length === REPORT_LEN + 1 ? raw.subarray(1) : raw
  }

  // 对应 USBDevice.commomFeature (USBDevice.ts:85): 写后读
  async transact(cmdBuf: Buffer, checkSumType: CheckSumType = 2): Promise<Buffer | undefined> {
    if (!(await this.writeFeature(cmdBuf, checkSumType))) return undefined
    return this.readFeature(5)
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
