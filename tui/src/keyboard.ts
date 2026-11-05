// 键盘命令与自定义按键矩阵层 — 移植自 recovered-src/index/sdk/DriverIO/DeviceAPI/
// (dk2017.ts, YC200Common.ts, yc500Common.ts, Common.ts)
// 命令码表与 4 字节键位编码格式见 docs/REVERSE-ENGINEERING.md §4–§5。所有 report 64 字节。

import { HidChannel, CheckSumType, applyChecksum } from './hid.js'
import {
  DOMIKEY_MODELS,
  DomikeyModelSpec,
  HID_KEY_TABLE,
  SPECIAL_FUNCTION_MAP,
  SPECIAL_MOD_HID,
  SpecialModKey,
} from './keymap-data.js'

export type LightType =
  | 'LightOff'
  | 'LightAlwaysOn'
  | 'LightBreath'
  | 'LightNeon'
  | 'LightWave'
  | 'LightRipple'
  | 'LightRaindrop'
  | 'LightSnake'
  | 'LightPressAction'
  | 'LightConverage'
  | 'LightSineWave'
  | 'LightKaleidoscope'
  | 'LightLineWave'
  | 'LightUserPicture'

export interface LightSetting {
  type: LightType
  value: number   // 亮度 0~6
  speed?: number  // 速度 0~4
  option?: string // 方向/模式等, 按灯效解释
  rgb?: number    // 0xRRGGBB
  dazzle?: boolean
}

const LIGHT_EFFECT: Record<LightType, number> = {
  LightOff: 0x00,
  LightAlwaysOn: 0x01,
  LightBreath: 0x02,
  LightNeon: 0x03,
  LightWave: 0x04,
  LightRipple: 0x05,
  LightRaindrop: 0x06,
  LightSnake: 0x07,
  LightPressAction: 0x08,
  LightConverage: 0x09,
  LightSineWave: 0x0a,
  LightKaleidoscope: 0x0b,
  LightLineWave: 0x0c,
  LightUserPicture: 0x0d,
}

export type KeyAssignment =
  | { type: 'default' }
  | { type: 'forbidden' }
  | { type: 'single'; hid: number }
  | { type: 'combo'; mod1: SpecialModKey; mod2: SpecialModKey; hid: number }
  | { type: 'function'; name: string }
  | { type: 'macro'; macroType: 0 | 1 | 2; macroIndex: number }
  | { type: 'raw'; bytes: [number, number, number, number] }

export interface DecodedKeySlot {
  slotIndex: number
  bytes: [number, number, number, number]
  defaultBytes: [number, number, number, number]
  isModified: boolean
  label: string
  assignment: KeyAssignment
}

export function numToByte4(num: number): [number, number, number, number] {
  return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff]
}

export function byte4Equals(a: readonly number[], b: readonly number[]): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
}

// 对应 dk2017.ts:1591 findIndexInDefaultMatrix
export function findIndexInDefaultMatrix(
  defaultMatrix: readonly number[],
  hid: number,
  findIndex?: number,
): number | undefined {
  let currentFindIndex = 0
  const target: [number, number, number, number] =
    hid > 0xff ? numToByte4(hid) : [0x00, 0x00, hid & 0xff, 0x00]

  let slot = 0
  for (let i = 0; i < defaultMatrix.length; i += 4) {
    if (
      defaultMatrix[i] === target[0] &&
      defaultMatrix[i + 1] === target[1] &&
      defaultMatrix[i + 2] === target[2] &&
      defaultMatrix[i + 3] === target[3]
    ) {
      if (findIndex === undefined || findIndex === currentFindIndex) {
        return slot
      }
      currentFindIndex++
    }
    slot++
  }
  return undefined
}

export function getDefaultSlotBytes(
  defaultMatrix: readonly number[],
  slotIndex: number,
): [number, number, number, number] {
  const off = slotIndex * 4
  return [
    defaultMatrix[off] ?? 0,
    defaultMatrix[off + 1] ?? 0,
    defaultMatrix[off + 2] ?? 0,
    defaultMatrix[off + 3] ?? 0,
  ]
}

export function hidToLabel(hid: number): string {
  if (hid === 0x0a010000) return 'Fn'
  const entry = HID_KEY_TABLE.find((k) => k.hid === hid)
  if (entry) return entry.label
  const modEntry = Object.entries(SPECIAL_MOD_HID).find(([, v]) => v === hid && v !== 0)
  if (modEntry) return modEntry[0].toUpperCase()
  return `0x${hid.toString(16).toUpperCase()}`
}

// 将 KeyAssignment 编码为 4 字节矩阵项 changeArr[0..3]
export function encodeKeyAssignment(
  assignment: KeyAssignment,
  defaultBytes: [number, number, number, number] = [0, 0, 0, 0],
): [number, number, number, number] {
  switch (assignment.type) {
    case 'default':
      return [...defaultBytes]
    case 'forbidden':
      return [0x00, 0x00, 0x00, 0x00]
    case 'single':
      if (assignment.hid > 0xff) {
        return numToByte4(assignment.hid)
      }
      return [0x00, 0x00, assignment.hid & 0xff, 0x00]
    case 'combo': {
      const m1 = assignment.mod1
      const m2 = assignment.mod2
      const bothMods = m1 !== 'none' && m2 !== 'none'
      const sKey: SpecialModKey = m1 === 'none' ? m2 : m1
      const key1 = bothMods ? SPECIAL_MOD_HID[m2] : assignment.hid & 0xff
      const key2 = bothMods ? assignment.hid & 0xff : 0x00
      return [0x00, SPECIAL_MOD_HID[sKey], key1, key2]
    }
    case 'function': {
      const fnBytes = SPECIAL_FUNCTION_MAP[assignment.name]
      return fnBytes ? [...fnBytes] : [...defaultBytes]
    }
    case 'macro':
      return [0x09, assignment.macroType, assignment.macroIndex & 0xff, 0x00]
    case 'raw':
      return [...assignment.bytes]
  }
}

// 将 4 字节矩阵项解码为可读描述与 KeyAssignment
export function decodeSlotBytes(
  slotIndex: number,
  bytes: [number, number, number, number],
  defaultBytes: [number, number, number, number],
): DecodedKeySlot {
  const isModified = !byte4Equals(bytes, defaultBytes)
  const [b0, b1, b2, b3] = bytes

  if (b0 === 0 && b1 === 0 && b2 === 0 && b3 === 0) {
    return {
      slotIndex,
      bytes,
      defaultBytes,
      isModified,
      label: '禁用 (Disabled)',
      assignment: { type: 'forbidden' },
    }
  }

  for (const [fnName, fnArr] of Object.entries(SPECIAL_FUNCTION_MAP)) {
    if (byte4Equals(bytes, fnArr)) {
      return {
        slotIndex,
        bytes,
        defaultBytes,
        isModified,
        label: fnName,
        assignment: { type: 'function', name: fnName },
      }
    }
  }

  if (b0 === 0x00) {
    const mod1Entry = Object.entries(SPECIAL_MOD_HID).find(([, v]) => v === b1)
    const mod1: SpecialModKey = (mod1Entry?.[0] as SpecialModKey) ?? 'none'
    if (mod1 === 'none' && b3 === 0x00) {
      return {
        slotIndex,
        bytes,
        defaultBytes,
        isModified,
        label: hidToLabel(b2),
        assignment: { type: 'single', hid: b2 },
      }
    }
    const mod2Entry = b3 !== 0 ? Object.entries(SPECIAL_MOD_HID).find(([, v]) => v === b2) : undefined
    const mod2: SpecialModKey = (mod2Entry?.[0] as SpecialModKey) ?? 'none'
    const mainHid = b3 !== 0 ? b3 : b2
    const parts: string[] = []
    if (mod1 !== 'none') parts.push(mod1.toUpperCase())
    if (mod2 !== 'none') parts.push(mod2.toUpperCase())
    if (mainHid !== 0) parts.push(hidToLabel(mainHid))
    return {
      slotIndex,
      bytes,
      defaultBytes,
      isModified,
      label: parts.join(' + ') || 'Combo',
      assignment: { type: 'combo', mod1, mod2, hid: mainHid },
    }
  }

  if (b0 === 0x09) {
    const mt = (b1 === 1 ? 1 : b1 === 2 ? 2 : 0) as 0 | 1 | 2
    return {
      slotIndex,
      bytes,
      defaultBytes,
      isModified,
      label: `Macro #${b2}`,
      assignment: { type: 'macro', macroType: mt, macroIndex: b2 },
    }
  }

  return {
    slotIndex,
    bytes,
    defaultBytes,
    isModified,
    label: `[${bytes.map((x) => x.toString(16).padStart(2, '0')).join(' ')}]`,
    assignment: { type: 'raw', bytes },
  }
}

// 构造单键改键 64B Feature Report (0x13 普通层 / 0x15 Fn层, YC500Common.ts:53-98)
export function buildSetKeySimpleReport(
  profileOrFnLayer: number,
  slotIndex: number,
  changeArr: [number, number, number, number],
  isFn = false,
): Buffer {
  const b = Buffer.alloc(64)
  b[0] = isFn ? Keyboard.FEA_CMD_SET_FN_SIMPLE : Keyboard.FEA_CMD_SET_KEYMATRIX_SIMPLE
  b[1] = profileOrFnLayer & 0xff
  b[2] = slotIndex & 0xff
  b[8] = changeArr[0]
  b[9] = changeArr[1]
  b[10] = changeArr[2]
  b[11] = changeArr[3]
  return applyChecksum(b, 0)
}

// 构造全矩阵批量写入的分页 64B Feature Reports (0x09 普通层 / 0x10 Fn层, YC200Common.ts:258-291)
export function buildSetKeyMatrixReports(
  profileOrFnLayer: number,
  matrix: readonly number[],
  writePages = 9,
  isFn = false,
): Buffer[] {
  const reports: Buffer[] = []
  for (let page = 0; page < writePages; page++) {
    const b = Buffer.alloc(64)
    b[0] = isFn ? Keyboard.FEA_CMD_SET_FN_MATRIX : Keyboard.FEA_CMD_SET_KEYMATRIX
    b[1] = profileOrFnLayer & 0xff
    b[2] = 0xf8
    b[3] = 0x01
    b[4] = page & 0xff
    const slice = matrix.slice(page * 56, page * 56 + 56)
    for (let j = 0; j < slice.length; j++) {
      b[8 + j] = slice[j] ?? 0
    }
    reports.push(applyChecksum(b, 0))
  }
  return reports
}

// 构造读取全矩阵的分页请求包 (0x89 普通层 / 0x90 Fn层)
export function buildGetKeyMatrixRequest(
  profileOrFnLayer: number,
  page: number,
  isFn = false,
): Buffer {
  const b = Buffer.alloc(64)
  b[0] = isFn ? Keyboard.FEA_CMD_GET_FN_MATRIX : Keyboard.FEA_CMD_GET_KEYMATRIX
  b[1] = profileOrFnLayer & 0xff
  b[2] = page & 0xff
  return applyChecksum(b, 0)
}

export class Keyboard {
  // 命令码 — Common.ts:22-45, YC200Common.ts, yc500Common.ts:17-34
  static readonly FEA_CMD_SET_REV = 0x00
  static readonly FEA_CMD_GET_REV = 0x80
  static readonly FEA_CMD_SET_RESET = 0x02
  static readonly FEA_CMD_GET_BATTERY = 0x83
  static readonly FEA_CMD_SET_REPORT = 0x04
  static readonly FEA_CMD_GET_REPORT = 0x84
  static readonly FEA_CMD_SET_PROFILE = 0x05
  static readonly FEA_CMD_GET_PROFILE = 0x85
  static readonly FEA_CMD_SET_KBOPTION = 0x06
  static readonly FEA_CMD_GET_KBOPTION = 0x86
  static readonly FEA_CMD_SET_LEDPARAM = 0x07
  static readonly FEA_CMD_GET_LEDPARAM = 0x87
  static readonly FEA_CMD_SET_SLEDPARAM = 0x08
  static readonly FEA_CMD_GET_SLEDPARAM = 0x88
  static readonly FEA_CMD_SET_KEYMATRIX = 0x09
  static readonly FEA_CMD_GET_KEYMATRIX = 0x89
  static readonly FEA_CMD_SET_KEYENABLE = 0x0a
  static readonly FEA_CMD_GET_KEYENABLE = 0x8a
  static readonly FEA_CMD_SET_MACRO = 0x0b
  static readonly FEA_CMD_GET_MACRO = 0x8b
  static readonly FEA_CMD_SET_USERPIC = 0x0c
  static readonly FEA_CMD_GET_USERPIC = 0x8c
  static readonly FEA_CMD_SET_AUDIO = 0x0d
  static readonly FEA_CMD_SET_FN_MATRIX = 0x10
  static readonly FEA_CMD_GET_FN_MATRIX = 0x90
  static readonly FEA_CMD_SET_KEYMATRIX_SIMPLE = 0x13
  static readonly FEA_CMD_GET_KEYMATRIX_SIMPLE = 0x93
  static readonly FEA_CMD_SET_FN_SIMPLE = 0x15
  static readonly FEA_CMD_GET_FN_SIMPLE = 0x95
  static readonly FEA_CMD_GET_INFOR = 0x8f

  constructor(
    private ch: HidChannel,
    private isBlue = false,
    private model: DomikeyModelSpec = DOMIKEY_MODELS.dmk103,
  ) {}

  // setLightSetting — YZW_3098.ts / Common.ts (checkSumType = 1, 8字节校验写入 b[8])
  async setLight(lightSet: LightSetting): Promise<boolean> {
    const b = Buffer.alloc(64)
    b[0] = Keyboard.FEA_CMD_SET_LEDPARAM
    b[1] = LIGHT_EFFECT[lightSet.type]
    b[2] = 4 - (lightSet.speed ?? 2)
    b[3] = lightSet.value

    let option = lightSet.dazzle ? 7 : 8
    if (lightSet.type === 'LightWave') option = ((lightSet.option === 'right' ? 0 : 1) << 4) | option
    if (lightSet.type === 'LightSnake') option = ((lightSet.option === 'z' ? 0 : 1) << 4) | option
    if (lightSet.type === 'LightKaleidoscope')
      option = ((lightSet.option === 'out' ? 0 : 1) << 4) | option
    b[4] = option

    const rgb = lightSet.rgb ?? 0x00f5d4
    b[5] = (rgb >>> 16) & 0xff
    b[6] = (rgb >>> 8) & 0xff
    b[7] = rgb & 0xff

    return this.ch.writeFeature(b, 1)
  }

  // FEA_CMD_GET_BATTERY = 0x83, 电量在响应 b[1] 返回
  async getBattery(): Promise<number | undefined> {
    const b = Buffer.alloc(64)
    b[0] = Keyboard.FEA_CMD_GET_BATTERY
    const res = await this.ch.transact(b, 0)
    return res ? res[1] : undefined
  }

  async getInfo(): Promise<Buffer | undefined> {
    const b = Buffer.alloc(64)
    b[0] = Keyboard.FEA_CMD_GET_INFOR
    return this.ch.transact(b, 2)
  }

  async getProfile(): Promise<number | undefined> {
    const b = Buffer.alloc(64)
    b[0] = Keyboard.FEA_CMD_GET_PROFILE
    const res = await this.ch.transact(b, 0)
    return res ? res[1] : undefined
  }

  async setProfile(profile: number): Promise<boolean> {
    const b = Buffer.alloc(64)
    b[0] = Keyboard.FEA_CMD_SET_PROFILE
    b[1] = profile & 0xff
    return this.ch.writeFeature(b, 0)
  }

  async resetFactory(): Promise<boolean> {
    const b = Buffer.alloc(64)
    b[0] = Keyboard.FEA_CMD_SET_RESET
    return this.ch.writeFeature(b, 0)
  }

  async getKeyMatrix(profile = 0, isFn = false): Promise<number[] | undefined> {
    let res = Buffer.alloc(0)
    for (let page = 0; page < this.model.matrixPages; page++) {
      const req = buildGetKeyMatrixRequest(profile, page, isFn)
      const chunk = await this.ch.transact(req, 2)
      if (!chunk) return undefined
      res = Buffer.concat([res, chunk])
    }
    return [...res.subarray(0, this.model.defaultMatrix.length)]
  }

  async setKeySingle(
    profile: number,
    slotIndex: number,
    changeArr: [number, number, number, number],
    isFn = false,
  ): Promise<boolean> {
    const req = buildSetKeySimpleReport(profile, slotIndex, changeArr, isFn)
    return this.ch.writeFeature(req, 2)
  }

  async setKeyMatrixFull(
    profile: number,
    matrix: readonly number[],
    isFn = false,
  ): Promise<boolean> {
    const reports = buildSetKeyMatrixReports(profile, matrix, this.model.writePages, isFn)
    for (const rep of reports) {
      if (!(await this.ch.writeFeature(rep, 2))) return false
    }
    return true
  }
}
