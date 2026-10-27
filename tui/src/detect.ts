// HID 设备发现层 — 移植自 recovered-src/index/sdk/DriverIO/usb/DetectSupportDevice.ts
// 的 VID/PID 知识。官方软件的 device_type 表存于 SQLite,这里先内置已知 ID。

export interface HidCandidate {
  path: string
  vid: number
  pid: number
  product?: string
  manufacturer?: string
}

// 蓝牙 Dongle (VID 0x3151) 的 PID 白名单 — DetectSupportDevice.ts:307
export const BLUE_PIDS = new Set([0x4012, 0x4013, 0x401c, 0x401d, 0x401f, 0x4020, 0x4023, 0x4024])

// 2.4G 接收器 — DetectSupportDevice.ts:284
export const DONGLE_VID_PIDS: Array<[number, number]> = [
  [0x0461, 0x4001],
  [0x25a7, 0x2300],
  [0x0c45, 0x7040],
]

export const DOMIKEY_VID = 0x3151

export function isKnownDevice(vid: number, pid: number): boolean {
  if (vid === DOMIKEY_VID) return true // 直连 / 蓝牙
  return DONGLE_VID_PIDS.some(([v, p]) => v === vid && p === pid)
}

export function isBlueDevice(vid: number, pid: number): boolean {
  return vid === DOMIKEY_VID && BLUE_PIDS.has(pid)
}
