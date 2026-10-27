// HID feature-report 传输层。
// 对应原架构: 渲染层 --gRPC--> iot_driver.exe --HID--> 键盘
// TUI 去掉中间层, 直接用 node-hid 收发 64 字节 feature report。
//
// ⚠ 未决: 校验和算法在 iot_driver.exe 内 (checkSumType 0=7字节/1=8字节/2=init),
// 见 docs/REVERSE-ENGINEERING.md 第 6 节。此处先留出接口,
// 拿到算法后填入 checksum7/checksum8 即可。

import { HID } from 'node-hid'

const REPORT_LEN = 64

export type CheckSumType = 0 | 1 | 2

// TODO(reverse): 用 REA 反编译 iot_driver.exe 或 USBPcap 抓包还原
export function checksum7(buf: Buffer): number {
  throw new Error('checksum7 not yet reversed (see docs/REVERSE-ENGINEERING.md §6)')
}

export function checksum8(buf: Buffer): number {
  throw new Error('checksum8 not yet reversed (see docs/REVERSE-ENGINEERING.md §6)')
}

export class HidChannel {
  private dev: HID

  constructor(path: string) {
    this.dev = new HID(path)
  }

  close(): void {
    this.dev.close()
  }

  // 对应 USBDevice.writeFeatureCmd / readFeatureCmd (USBDevice.ts:92)
  async writeFeature(buf: Buffer, checkSumType: CheckSumType = 2): Promise<boolean> {
    const report = Buffer.alloc(REPORT_LEN)
    buf.copy(report)
    if (report.length !== REPORT_LEN) return false
    // 校验和位置/算法待逆向; init 类型可能由固件忽略校验
    const bytesWritten = this.dev.sendFeatureReport(report)
    return bytesWritten === REPORT_LEN
  }

  async readFeature(waitMs = 5): Promise<Buffer | undefined> {
    await sleep(waitMs)
    const res = this.dev.getFeatureReport(0, REPORT_LEN)
    return res ? Buffer.from(res) : undefined
  }

  // 对应 USBDevice.commomFeature (USBDevice.ts:85): 写后读
  async transact(cmdBuf: Buffer, checkSumType: CheckSumType = 2): Promise<Buffer | undefined> {
    if (!(await this.writeFeature(cmdBuf, checkSumType))) return undefined
    return this.readFeature(5)
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
