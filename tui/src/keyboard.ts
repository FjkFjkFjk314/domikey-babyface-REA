// 键盘命令层 — 移植自 recovered-src/index/sdk/DriverIO/DeviceAPI/Common.ts
// 命令码表见 docs/REVERSE-ENGINEERING.md §5。所有 report 64 字节。

import { HidChannel, CheckSumType } from './hid.js'

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
  speed?: number  // 速度 (呼吸/霓虹/波浪等)
  option?: string // 方向/模式等, 按灯效解释
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

export class Keyboard {
  // 命令码 — Common.ts:22-45
  static readonly FEA_CMD_GET_INFOR = 0x8f
  static readonly FEA_CMD_GET_BATTERY = 0x83
  static readonly FEA_CMD_SET_LEDPARAM = 0x07
  static readonly FEA_CMD_GET_LEDPARAM = 0x87
  static readonly FEA_CMD_SET_REPORT = 0x04
  static readonly FEA_CMD_SET_PROFILE = 0x05

  constructor(
    private ch: HidChannel,
    private isBlue = false,
  ) {}

  // setLightSetting — Common.ts:49
  async setLight(lightSet: LightSetting): Promise<boolean> {
    const b = Buffer.alloc(64)
    b[0] = Keyboard.FEA_CMD_SET_LEDPARAM
    b[1] = LIGHT_EFFECT[lightSet.type]
    b[2] = lightSet.speed ?? 0
    b[3] = lightSet.value

    const effect = LIGHT_EFFECT[lightSet.type]
    let option = 0x07
    if (lightSet.type === 'LightWave') option = lightSet.option === 'right' ? 0 : 1
    if (lightSet.type === 'LightRipple')
      option = lightSet.option === 'full' ? (7 << 4) | 0 : (7 << 4) | 1
    if (lightSet.type === 'LightSnake')
      option = lightSet.option === 'z' ? (7 << 4) | 0 : (7 << 4) | 1
    if (lightSet.type === 'LightPressAction')
      option = lightSet.option === 'onToOff' ? (7 << 4) | 0 : (7 << 4) | 1
    if (lightSet.type === 'LightKaleidoscope')
      option = lightSet.option === 'out' ? (7 << 4) | 0 : (7 << 4) | 1
    b[4] = option
    void effect

    const checkSumType: CheckSumType = this.isBlue ? 1 : 0
    return this.ch.writeFeature(b, checkSumType)
  }

  // FEA_CMD_GET_BATTERY = 0x83, 电量在响应中由固件返回
  async getBattery(): Promise<number | undefined> {
    const b = Buffer.alloc(64)
    b[0] = Keyboard.FEA_CMD_GET_BATTERY
    const res = await this.ch.transact(b, this.isBlue ? 1 : 0)
    return res ? res[1] : undefined
  }

  async getInfo(): Promise<Buffer | undefined> {
    const b = Buffer.alloc(64)
    b[0] = Keyboard.FEA_CMD_GET_INFOR
    return this.ch.transact(b, 2)
  }
}
