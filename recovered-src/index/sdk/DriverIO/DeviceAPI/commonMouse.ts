import { valueForIndex, valueForKey } from '../../../unitys/tableValueForKey'
import { num2Rgb, numToRgb, rgb2Num, rgbToNum } from '../../../unitys/rgbNum'
import { sleep } from '../../../unitys/timeFunc'
import { USBDevice } from '../usb/USBDevice'
import { MouseInterface } from './MouseInterface'
import { arrTo16, numToByte4, specialFunTablectionArr, specialFunTablectionMap } from '../../../res/映射'
import { skeyToHidTable } from './dk2017'
import { defaultMatrix_CommonMouse } from './commonMouseMatrix'
import { equals } from 'ramda'
import { getBit, setBit } from '../../../unitys/bitOperation'
import { mobxStore } from '../../../mobxStore/store'
import { res } from '../../../res'
import { getDevFnLayer, getDevLayer } from '../../../unitys/getDevLyaer'
import { MouseKey } from './DeviceInterface'


export class CommonMouse extends USBDevice implements MouseInterface {
    FEA_CMD_SET_REV = 0x00
    FEA_CMD_GET_REV = 0x80
    FEA_CMD_SET_RESERT = 0x02
    FEA_CMD_GET_RESERT = 0x82
    // FEA_CMD_SET_BATTERY = 0x03(disable)
    // FEA_CMD_GET_BATTERY = 0x83(disable)
    FEA_CMD_SET_REPORT = 0x04
    FEA_CMD_GET_REPORT = 0x84
    FEA_CMD_SET_PROFILE = 0x05
    FEA_CMD_GET_PROFILE = 0x85
    FEA_CMD_SET_OPTION = 0x06
    FEA_CMD_GET_OPTION = 0x86
    FEA_CMD_SET_LEDPARAM = 0x07
    FEA_CMD_GET_LEDPARAM = 0x87
    FEA_CMD_SET_SLEDPARAM = 0x08
    FEA_CMD_GET_SLEDPARAM = 0x88
    FEA_CMD_SET_KEYMATRIX = 0x09
    FEA_CMD_GET_KEYMATRIX = 0x89
    FEA_CMD_SET_DPIVALUE = 0x0A
    FEA_CMD_GET_DPIVALUE = 0x8A
    FEA_CMD_SET_MACRO = 0x0B
    FEA_CMD_GET_MACRO = 0x8B
    FEA_CMD_SET_USERPIC = 0x0C
    FEA_CMD_GET_USERPIC = 0x8C
    FEA_CMD_SET_AUDIO = 0x0D
    // FEA_CMD_GET_AUDIO = 0x8D(disable)
    FEA_CMD_SET_WINDOS = 0x0E
    // FEA_CMD_SET_INFOR = 0x0F(disable)
    FEA_CMD_GET_INFOR = 0x8F
    FEA_CMD_SET_FN = 0x10
    FEA_CMD_GET_FN = 0x90
    FEA_CMD_SET_DEBOUNCE = 0x11
    FEA_CMD_GET_DEBOUNCE = 0x91
    FEA_CMD_SET_MOUSEPARAM = 0x13
    FEA_CMD_GET_MOUSEPARAM = 0x93
    FEA_CMD_INTO_TEST = 0x7E
    FEA_CMD_SET_BOOTLOATER = 0x7F
    FEA_CMD_SET_DPICOLOR = 0x14
    FEA_CMD_GET_DPICOLOR = 0x94

    type: 'mouse' = 'mouse'
    currentProfile: number | undefined = undefined
    defaultMatrix = defaultMatrix_CommonMouse
    allLayerConfigs: {
        isFn: boolean,
        profile: number,
        macro: ConfigMacro
    }[] | undefined = undefined
    reComData: REDATA = {
        profile: 0,
        matrix: undefined,
        marcroBuf: new Array(),
    }
    reFnData: REDATA = {
        profile: 0,
        matrix: undefined,
        marcroBuf: new Array(),
    }
    lightPic: UserPicItem[] | undefined = undefined
    isFn: boolean = false
    fnIndex: number = 0;

    BIGCMDDELAY = 500
    MAXSPEED = 4
    NORMAL = 7
    DAZZLE = 8
    WAVEOP = {
        'right': 0,
        'left': 1,
        'down': 2,
        'up': 3
    };
    COMMONCOLOR = {
        0: 0xff0000,
        1: 0xff80ff,
        2: 0xffff00,
        3: 0x00ff00,
        4: 0x00ffff,
        5: 0x0000ff,
        6: 0xff00ff,
    }
    MP = {
        'upright': 0,
        'separate': 1,
        'intersect': 2
    };
    MACROMAX = 20
    getFirmwareVersion = async () => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_REV
        const buf = await this.commomFeature(b, 0)
        //console.log('version', buf)
        return buf?.readUInt16LE(1)
    }

    setReportRate = async (
        rate: 1000 | 500 | 250 | 125,
    ) => {
        let num
        switch (rate) {
            case 1000:
                num = 0x01
                break
            case 500:
                num = 0x02
                break
            case 250:
                num = 0x04
                break
            case 125:
                num = 0x08
                break
            default:
                num = 0x00
                break
        }
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_SET_REPORT
        b[1] = this.currentProfile ? this.currentProfile : 0
        b[2] = num

        return await this.writeFeatureCmd(b, 0)
    }
    getReportRate = async () => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_REPORT
        b[1] = this.currentProfile ? this.currentProfile : 0
        const buf = await this.commomFeature(b, 0)
        const num = buf?.readUInt8(2)
        switch (num) {
            case 0x01:
                return 1000
            case 0x02:
                return 500
            case 0x04:
                return 250
            case 0x08:
                return 125

            default:
                return 'err'
        }
    }
    setDPI = async (arr: number[]) => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_SET_DPIVALUE
        b[1] = this.currentProfile ? this.currentProfile : 0

        for (let i = 0; i < arr.length; i++) {
            const buf = Buffer.alloc(2)
            buf.writeUInt16LE(arr[i])
            b[8 + i * 4] = buf[0]
            b[9 + i * 4] = buf[1]
            b[10 + i * 4] = buf[0]
            b[11 + i * 4] = buf[1]
        }

        return await this.writeFeatureCmd(b, 0)
    }
    getDpi = async () => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_DPIVALUE
        b[1] = this.currentProfile ? this.currentProfile : 0

        const buf = await this.commomFeature(b, 0)
        if (buf === undefined) return undefined

        const arr = new Array<number>()
        for (let i = 0; i < 4 * 8; i += 4) {
            const nArr2 = buf.slice(i + 8, i + 12)
            arr.push((nArr2[1] << 8) + nArr2[0])
        }
        return arr
    }

    setDeBounce = async (debounce: number) => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_SET_DEBOUNCE
        b[2] = debounce
        const buf = await this.writeFeatureCmd(b, 0)
        if (!buf) return false
        return true
    }

    getDeBounce = async () => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_DEBOUNCE
        const buf = await this.commomFeature(b, 0)

        if (buf !== undefined) {
            return buf[2]
        }
        return undefined
    }

    getCurrentProfile = async () => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_PROFILE
        const buf = await this.commomFeature(b, 0)
        if (buf === undefined) return undefined
        const num = buf.readUInt8(1)
        if (num != undefined && num >= 0) this.currentProfile = num
        return num
    }
    setCurrentProfile = async (profile: number = 0) => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_SET_PROFILE
        b[1] = profile

        const res = await this.writeFeatureCmd(b, 0)
        if (res) {
            this.currentProfile = profile
            return true
        }
        return false
    }

    getCurrentDpi(): Promise<{ dpiValue: number; dpiNum: number } | undefined> {
        throw new Error('Method not implemented.')
    }

    setLightSetting = async (lightSet: LightSetting) => {
        const b = Buffer.alloc(64)


        b[0] = this.FEA_CMD_SET_LEDPARAM

        let effect: number = 0
        let speed: number = 0
        let brightness: number = 0
        let option: number = 7
        let dazzle = lightSet.dazzle
        const n = dazzle ? this.DAZZLE : this.NORMAL
        const musicKey = dazzle ? 0 : 4

        switch (lightSet.type) {
            case 'LightOff':
                effect = 0x00
                break
            case 'LightAlwaysOn':
                effect = 0x01
                brightness = lightSet.value
                option = n
                break
            case 'LightBreath':
                effect = 0x02
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightNeon':
                effect = 0x03
                speed = lightSet.speed
                brightness = lightSet.value
                break
            case 'LightWave':
                effect = 0x04
                speed = lightSet.speed
                option = lightSet.option !== undefined ? (this.WAVEOP[lightSet.option] << 4 | n) : (this.WAVEOP['right'] << 4 | n)
                brightness = lightSet.value
                break
            case 'LightDazzing':
                effect = 0x05
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightLaser':
                effect = 0x06
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightMusicFollow':
                effect = 0x07
                option = lightSet.option === undefined || lightSet.option === 'upright' ? (0 << 4) | musicKey : this.MP[lightSet.option] << 4 | musicKey
                brightness = lightSet.value
                break
            case 'LightScreenColor':
                effect = 0x08
                brightness = 4
                break
            case 'LightMusicFollow2':
                effect = 0x09
                brightness = lightSet.value
                option = lightSet.option === undefined || lightSet.option === 'upright' ? (0 << 4) | musicKey : this.MP[lightSet.option] << 4 | musicKey
                break
            default:
                break
        }

        b[1] = effect
        b[2] = this.MAXSPEED - speed
        b[3] = brightness
        b[4] = option
        if ('rgb' in lightSet && lightSet.rgb !== undefined) {
            let rgbTemp = lightSet.rgb
            if (rgbTemp === 0xffffff) rgbTemp = 0xfafffa
            const rgb = numToRgb(rgbTemp)
            b[5] = rgb.r
            b[6] = rgb.g
            b[7] = rgb.b
        }
        if (lightSet.type === 'LightUserPicture') {
            b[5] = 0
            b[6] = 0xc8
            b[7] = 0xc8
        }

        const buf = await this.writeFeatureCmd(b, 1, this.BIGCMDDELAY)
        if (!buf) return false
        await sleep(this.BIGCMDDELAY)
        return true
    }
    setLogoLightSetting(lightSet: LightSetting): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    getLightSetting = async (): Promise<LightSetting | undefined> => {
        const rgbMap: {
            [key: number]: number
        } = this.COMMONCOLOR
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_LEDPARAM
        const buf = await this.commomFeature(b, 0)
        if (buf === undefined) return undefined
        const effect = buf[1]
        const speed = this.MAXSPEED - buf[2]
        const brightness = buf[3]
        const option = buf[4]
        let rgb = rgbToNum(buf[5], buf[6], buf[7])
        const option1 = option >> 4
        const option2 = option & 0b1111
        const optionToRgb = (op: number) => {
            if (op === this.NORMAL || op === this.DAZZLE) return
            const trgb = rgbMap[op]
            if (trgb !== undefined) rgb = trgb

        }
        const dazzle = option2 === this.DAZZLE ? true : false
        const musicDazzle = option2 === 0 ? true : false

        if (rgb === 0xfafffa) rgb = 0xffffff
        //console.log('!!!!!', effect, option)
        switch (effect) {
            case 0:
                return {
                    type: 'LightOff',
                }
            case 1:
                optionToRgb(option2)
                return {
                    type: 'LightAlwaysOn',
                    value: brightness,
                    rgb: rgb,
                    dazzle: dazzle
                }
            case 2:
                optionToRgb(option2)
                return {
                    type: 'LightBreath',
                    value: brightness,
                    speed: speed,
                    rgb: rgb,
                    dazzle: dazzle
                }
            case 3:
                return {
                    type: 'LightNeon',
                    value: brightness,
                    speed: speed,
                    option: option1 === 0 ? 'Default' : 'Random',
                }
            case 4:
                optionToRgb(option2)
                const wOp = valueForKey(this.WAVEOP, option1)
                return {
                    type: 'LightWave',
                    value: brightness,
                    speed: speed,
                    option: wOp === undefined ? 'right' : wOp,
                    rgb: rgb,
                    dazzle: dazzle
                }
            case 5:
                optionToRgb(option2)
                return {
                    type: 'LightDazzing',
                    value: brightness,
                    speed: speed,
                    rgb: rgb,
                    dazzle: dazzle
                }
            case 0x06:
                optionToRgb(option2)
                return {
                    type: 'LightLaser',
                    value: brightness,
                    speed: speed,
                    rgb: rgb,
                    dazzle: dazzle
                }
            case 0x07:
                const op = valueForKey(this.MP, option1)
                return {
                    type: 'LightMusicFollow',
                    value: brightness,
                    option: op === undefined ? 'upright' : op,
                    rgb: rgbToNum(buf[5], buf[6], buf[7]),
                    dazzle: musicDazzle
                }
            case 0x08:
                return {
                    type: 'LightScreenColor',
                    value: 4,
                }
            case 0x09:
                const op2 = valueForKey(this.MP, option1)
                return {
                    type: 'LightMusicFollow2',
                    option: op2 === undefined ? 'upright' : op2,
                    value: brightness,
                    rgb: rgbToNum(buf[5], buf[6], buf[7]),
                    dazzle: musicDazzle
                }
            default:
                return undefined
        }
    }
    getLogoLightSetting(): Promise<LightSetting | undefined> {
        throw new Error('Method not implemented.')
    }

    getKeyConfig = async (profile?: number, manual: boolean = false) => {
        let buf: Buffer | undefined
        if (this.reComData.matrix && this.reComData.profile === this.currentProfile && !manual)
            buf = this.reComData.matrix
        else
            buf = await this._getKeyMatrix(profile)
        if (buf === undefined) return undefined
        console.log('读出来的 matirx', buf)

        if (!manual || (!this.isFn && profile === this.currentProfile)) {
            this.reComData.matrix = buf
            this.reComData.profile = this.currentProfile ? this.currentProfile : 0
        }

        return await this.matrixToConfigValues([...buf], false)
    }

    getFnKeyConfig = async (fnindex: number, manual: boolean = false) => {
        this.fnIndex = fnindex
        let buf: Buffer | undefined
        // if (manual) {
        //   buf = await this._getFnKeyMatrix(fnindex)
        // } else {
        //   if (this.reFnData.matrix && this.reFnData.profile === fnindex)
        //     buf = this.reFnData.matrix
        //   else
        buf = await this._getFnKeyMatrix(fnindex)
        // }
        if (buf === undefined) return undefined
        console.log('读出来的 matirx2', buf)

        this.reFnData.matrix = buf
        this.reFnData.profile = fnindex
        return await this.matrixToConfigValues([...buf], true)
    }

    protected _getKeyMatrix = async (profile?: number) => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_KEYMATRIX
        b[1] = profile !== undefined
            ? profile
            : this.currentProfile
                ? this.currentProfile
                : 0

        let res = Buffer.alloc(0)
        for (let i = 0; i < 1; i++) {
            // b[2] = i
            const buf = await this.commomFeature(b, 0)

            if (buf === undefined) throw '_getKeyMatrix !!!undefine'

            res = Buffer.concat([res, buf])
        }
        return res
    }

    protected async _getFnKeyMatrix(fnidex: number) {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_FN
        b[1] = fnidex
        let res = Buffer.alloc(0)
        for (let i = 0; i < 1; i++) {
            b[2] = i
            const buf = await this.commomFeature(b, 0)

            //if (buf === undefined) return undefined
            //const b1 = await this.readFeatureCmd(10)
            //console.error('BBBBBB', b, b[2])
            if (buf === undefined) throw '_getFnKeyMatrix !!!undefine'

            res = Buffer.concat([res, buf])
        }
        await sleep(300)
        return res
    }

    matrixToConfigValues = async (matrix: Array<number>, isFn: boolean) => {
        if (matrix.length !== this.defaultMatrix.length) return []
        const configArr: Array<ConfigValue> = []
        for (let i = 0; i < matrix.length; i += 4) {
            const nArr4 = matrix.slice(i, i + 4)
            const dArr4 = this.defaultMatrix.slice(i, i + 4)
            let index: number = 0
            if (!equals(nArr4, dArr4)) {
                for (let j = 0; j < i; j += 4) {
                    if (equals(dArr4, this.defaultMatrix.slice(j, j + 4))) {
                        index++
                    }
                }
                let orginHid = valueForIndex(mouseKeyTable, dArr4)!
                //功能键 判断
                const tmpArr = specialFunTablectionArr.find(v => equals(v, dArr4))
                if (tmpArr) {
                    orginHid = arrTo16(tmpArr)
                }
                // if (equals(dArr4, [0x0a, 0x01, 0, 0])) {
                //   orginHid = 0x0a010000
                // }
                const tmpArr2 = specialFunTablectionArr.find(v => equals(v, nArr4))
                if (equals(nArr4, [0, 0, 1, 0])) {
                    configArr.push({
                        type: 'ConfigUnknown',
                        original: orginHid,
                        value: nArr4
                    })
                } else if (equals(nArr4, [0, 0, 0, 0])) {
                    //禁用
                    configArr.push({
                        type: 'forbidden',
                        original: orginHid,
                        index: index === 0 ? undefined : index
                    })
                } else if (nArr4[0] === 0) {
                    //组合键[0, skeyToHidTable[config.skey], config.key, config.key2]
                    configArr.push({
                        type: 'combo',
                        original: orginHid,
                        skey: valueForKey(skeyToHidTable, nArr4[1])!, // as SpecialKey,
                        key: nArr4[2],
                        key2: nArr4[3],
                        index: index === 0 ? undefined : index
                    })
                } else if (nArr4[0] === 1) {
                    //鼠标键 [...mouseKeyTable[config.key]]
                    configArr.push({
                        type: 'ConfigChangeToMouseBtn',
                        original: orginHid,
                        key: valueForIndex(mouseKeyTable, nArr4)!, //Number(valueForKey(mouseKeyTable, nArr4))
                        index: index === 0 ? undefined : index
                    })
                } else if (
                    nArr4[0] === 3
                    || nArr4[0] === 0x08
                    || nArr4[0] === 0x0a
                    || nArr4[0] === 0x0b
                    || nArr4[0] === 0x0d
                    || nArr4[0] === 0x0e
                    || nArr4[0] === 0x12
                    || nArr4[0] === 0x13
                    || nArr4[0] === 0x14
                ) {
                    //特殊功能 [...specialFunTablectionMap[config.key]]
                    if (nArr4[0] === 0x0b) {
                        configArr.push({
                            type: 'ConfigFunction',
                            original: orginHid,
                            key: '火力', // as CommonSpecialFuntion
                            value: nArr4,
                            index: index === 0 ? undefined : index
                        })
                        continue;
                    }
                    if (nArr4[0] === 0x13 && nArr4[2] === 0x04) {
                        configArr.push({
                            type: 'ConfigFunction',
                            original: orginHid,
                            key: 'dpi_shift', // as CommonSpecialFuntion
                            value: nArr4,
                            index: index === 0 ? undefined : index
                        })
                        continue;
                    }
                    if (nArr4[0] === 0x14) {
                        configArr.push({
                            type: 'ConfigFunction',
                            original: orginHid,
                            key: 'adjust_shot', // as CommonSpecialFuntion
                            value: nArr4,
                            index: index === 0 ? undefined : index
                        })
                        continue;
                    }
                    const p = valueForKey(specialFunTablectionMap, [...nArr4])
                    if (p === undefined) {
                        configArr.push({
                            type: 'ConfigUnknown',
                            original: orginHid,
                            value: nArr4,
                            index: index === 0 ? undefined : index
                        })
                    } else {
                        configArr.push({
                            type: 'ConfigFunction',
                            original: orginHid,
                            key: p, // as CommonSpecialFuntion
                            index: index === 0 ? undefined : index
                        })
                    }

                } else if (nArr4[0] === 9) {
                    //宏
                    let mt: MacroRepeatType
                    switch (nArr4[1]) {
                        case 0:
                            mt = 'repeat_times'
                            break
                        case 2:
                            mt = 'touch_repeat'
                            break
                        case 1:
                            mt = 'on_off'
                            break
                        default:
                            mt = 'repeat_times'
                            break
                    }
                    let macroEventArr

                    const res = await this.getMacro(nArr4[2])
                    if (res !== undefined)
                        macroEventArr = res

                    configArr.push({
                        type: 'ConfigMacro',
                        original: orginHid,
                        macro: macroEventArr === undefined ? [] : macroEventArr.macroEvents,
                        macroType: mt,
                        repeatCount: macroEventArr === undefined ? 0 : macroEventArr.repeatCount,
                        index: index === 0 ? undefined : index,
                        macroIndex: nArr4[2]
                    })
                }
                else if (tmpArr2 && equals(nArr4, tmpArr2)) {
                    configArr.push({
                        type: 'combo',
                        original: orginHid,
                        skey: 'none',
                        key: arrTo16(tmpArr2),
                        key2: 0,
                        index: index === 0 ? undefined : index
                    })
                }
                // else if (equals(nArr4, [0x0a, 0x01, 0, 0])) {//改建改为fn 正常不会发生
                //   console.log('改 fn 按键', nArr4, dArr4)
                //   configArr.push({
                //     type: 'combo',
                //     original: orginHid,
                //     skey: 'none',
                //     key: 0x0a010000,
                //     key2: 0,
                //     index: index === 0 ? undefined : index
                //   })
                // }
                else {
                    console.error('matrix 未知类型:', nArr4)
                }
            }
        }
        return configArr
    }

    getMacro = async (index: number) => {
        let res = Buffer.alloc(0)
        if (this.isFn) {
            if (this.reFnData.marcroBuf[index] === undefined) {
                const b = Buffer.alloc(64)
                b[0] = this.FEA_CMD_GET_MACRO
                b[1] = index
                for (let i = 0; i < 4; i++) {
                    b[2] = i
                    const buf = await this.commomFeature(b, 0)
                    if (buf === undefined) return undefined
                    res = Buffer.concat([res, buf])
                }
                this.reFnData.marcroBuf[index] = res
            } else {
                res = this.reFnData.marcroBuf[index]
            }
        } else {
            if (this.reComData.marcroBuf[index] === undefined) {
                const b = Buffer.alloc(64)
                b[0] = this.FEA_CMD_GET_MACRO
                b[1] = index
                for (let i = 0; i < 4; i++) {
                    b[2] = i
                    const buf = await this.commomFeature(b, 0)
                    if (buf === undefined) return undefined
                    res = Buffer.concat([res, buf])
                }
                this.reComData.marcroBuf[index] = res
            } else {
                res = this.reComData.marcroBuf[index]
            }
        }
        return this.buffToMacroEvents(res)
    }

    buffToMacroEvents = (macroBuff: Buffer) => {
        console.log('读出来的宏', macroBuff)
        const macroEvents: MacroEvent[] = []
        const repeatConut = macroBuff.readUInt16LE(0)
        let index = 2
        let tBuff = macroBuff.slice(index, index + 4)
        index += 4
        while (index < macroBuff.length) {
            //console.log(tBuff, index, macroBuff.length)
            if (tBuff[0] === 0xf9) {//指针移动
                /*v1
                          0x00 0xf9 [   0x00 0x00  ]
                          Y    X    [  delay       ]
                */
                /*v2
                          xy:
                          
                          delay<127
                          
                          0xf9  | delay | x | y
                          
                          delay>= 127
                          
                          0xf9 | 0 | x | y | delay_L | delay_H
          
                */
                macroEvents.push({
                    type: 'mouse_move',
                    dx: tBuff[2],
                    dy: tBuff[3],
                })
                let delay = 0
                if (tBuff[1] !== 0) {
                    delay = tBuff[1] >> 1
                } else {
                    const t = macroBuff.slice(index, index + 2)
                    index += 2
                    delay = t.readUInt16LE(0)
                }
                macroEvents.push({
                    type: 'delay',
                    value: delay
                })
                // const t = macroBuff.slice(index, index + 4)
                // index += 4

                // macroEvents.push({
                //   type: 'mouse_move',
                //   dy: t.readInt8(0),
                //   dx: t.readInt8(1),
                // })
                // const delay = t.readUInt16LE(2)
                // macroEvents.push({
                //   type: 'delay',
                //   value: delay
                // })
            } else {//按键
                if (tBuff[0] <= 0xef && tBuff[0] >= 0x04) {//键盘

                    console.error('!!!!!!!!!!!!!!! 0::::', tBuff[0], '         1:::', tBuff[1], getBit(tBuff[1], 7))
                    macroEvents.push({
                        type: 'keyboard',
                        action: getBit(tBuff[1], 7) === 0 ? 'up' : 'down',
                        value: tBuff[0]
                    })
                } else {
                    const mk = valueForKey(mouseKeyTable, [0x01, 0, tBuff[0], 0])
                    if (mk !== undefined) {
                        macroEvents.push({
                            type: 'mouse_button',
                            action: getBit(tBuff[1], 7) === 0 ? 'up' : 'down',
                            value: Number(mk)
                        })
                    }
                }
                let delay = 0
                if ((tBuff[1] & 0x7f) !== 0) {

                    delay = tBuff[1] & 0x7f
                    index -= 2

                } else {
                    delay = tBuff.readUInt16LE(2)
                }
                macroEvents.push({
                    type: 'delay',
                    value: delay
                })

            }




            tBuff = macroBuff.slice(index, index + 4)
            if (equals(tBuff, Buffer.from([0, 0, 0, 0]))) break
            index += 4


        }
        // const t = macroEvents[macroEvents.length - 1]
        // if (t.type === 'delay' && t.value === 0) {
        //   macroEvents.pop()
        // }
        console.log('@@@@@', macroEvents.filter(v => !(v.type === 'delay' && v.value === 0)))
        return {
            macroEvents: macroEvents.filter(v => !(v.type === 'delay' && v.value === 0)),
            repeatCount: repeatConut
        }
    }

    setReSet = async () => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_SET_RESERT
        const res = await this.writeFeatureCmd(b, 0)
        if (res) {
            this.currentProfile = 0
            //   this.reComData = {
            //     profile: 0,
            //     matrix: Buffer.from(this.defaultMatrix),
            //     marcroBuf: new Array()
            //   }
            //   this.reFnData = {
            //     profile: 0,
            //     matrix: undefined,
            //     marcroBuf: new Array()
            //   }
            //   this.lightPic = undefined
            this.allLayerConfigs = []
        }
        return res
    }

    setMousePARAM = async (mp: MouseParam) => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_SET_MOUSEPARAM
        b[8] = mp.xSensitivity
        b[9] = mp.ySensitivity
        b[10] = mp.buttonChange
        b[11] = mp.wheelToButton
        b[12] = mp.buttonToWheel
        b[13] = mp.liftCutOff
        b[14] = mp.angelSnap
        for (let i = 0; i < 8; i++) {
            b[15 + i] = mp.DPIStage[i]
        }
        return await this.writeFeatureCmd(b, 0)
    }

    getMousePARAM = async () => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_MOUSEPARAM
        const buf = await this.commomFeature(b, 0)
        if (buf === undefined) return undefined
        const mp: MouseParam = {
            xSensitivity: buf[1],
            ySensitivity: buf[2],
            buttonChange: buf[3],
            wheelToButton: buf[4],
            buttonToWheel: buf[5],
            liftCutOff: buf[6],
            angelSnap: b[7],
            DPIStage: [...buf.slice(8, 16)],
        }
        return mp
    }

    setKeyConfig = async (configs: ConfigValue[]) => {
        this.isFn = false
        const matrix = await this.configsToMatrix(configs)
        if (matrix === undefined) return undefined
        this.reComData.matrix = Buffer.from(matrix)
        return await this._setKeyConfig(matrix)
    }

    setFnKeyConfig = async (configs: ConfigValue[], fnindex: number) => {
        this.isFn = true
        this.fnIndex = fnindex
        const matrix = await this.configsToMatrix(configs)
        if (matrix === undefined) return undefined
        this.reFnData.matrix = Buffer.from(matrix)
        return await this._setFnKeyConfig(matrix, fnindex)
    }

    protected _setKeyConfig = async (matrix: number[]) => {
        //console.error('1111111')
        const b = new Array(8).fill(0)
        b[0] = this.FEA_CMD_SET_KEYMATRIX
        b[1] = this.currentProfile
        b[2] = 0xf8
        b[3] = 0x01
        /////

        ////
        //console.log('下命令 ！！！：', matrix)
        for (let i = 0; i < 9; i++) {
            b[4] = i

            let ms = matrix.slice(i * 56, 56 + i * 56)
            if (ms.length < 56) {
                ms = ms.concat(new Array(56 - ms.length).fill(0))
            }
            //console.error('SSSSS', b, b.concat(ms))
            let sum = 0
            for (let n = 0; n < 7; n++) {
                sum += b[n]
            }
            b[7] = 255 - (sum & 0xff)
            const buf = Buffer.from(b.concat(ms))
            const sucess = await this.writeFeatureCmd(buf, 0)

            if (!sucess) return false
        }
        await sleep(this.BIGCMDDELAY)
        return true
    }

    protected _setFnKeyConfig = async (matrix: number[], fnindex: number) => {
        //console.error('1111111')
        const b = new Array(8).fill(0)
        b[0] = this.FEA_CMD_SET_FN
        b[1] = fnindex
        b[2] = 0xf8
        b[3] = 0x01
        /////

        ////
        //console.log('下命令 ！！！：', matrix)
        for (let i = 0; i < 9; i++) {
            b[4] = i

            let ms = matrix.slice(i * 56, 56 + i * 56)
            if (ms.length < 56) {
                ms = ms.concat(new Array(56 - ms.length).fill(0))
            }
            //console.error('SSSSS', b, b.concat(ms))
            let sum = 0
            for (let n = 0; n < 7; n++) {
                sum += b[n]
            }
            b[7] = 255 - (sum & 0xff)
            const buf = Buffer.from(b.concat(ms))
            const sucess = await this.writeFeatureCmd(buf, 0)

            if (!sucess) return false
        }
        await sleep(50)
        return true
    }

    setKeyConfigSimple = async (config: ConfigValue) => {
        // common key
        this.isFn = false
        const keyIndex = this.findIndexInDefaultMatrix(config.original, config.index)

        if (keyIndex === undefined) return false

        const changeArr = await this.configToChangeArr(config)

        if (changeArr === undefined) return false

        const b = Buffer.alloc(64);
        b[0] = this.FEA_CMD_SET_KEYMATRIX;
        b[1] = this.currentProfile ? this.currentProfile : 0;

        b[2] = keyIndex;

        b[8] = changeArr[0]
        b[9] = changeArr[1]
        b[10] = changeArr[2]
        b[11] = changeArr[3]


        const currentKeyIndex = this.findCurrentIndexInDefaultMatrix(config.original, config.index)
        if (currentKeyIndex !== undefined && this.reComData.matrix !== undefined) {
            for (let i = 0; i < changeArr.length; i++) {
                this.reComData.matrix[currentKeyIndex + i] = changeArr[i]
            }
        }

        return await this.writeFeatureCmd(b, 0)
    }

    setFnKeyConfigSimple = async (config: ConfigValue, fnindex: number) => {
        this.isFn = true
        const keyIndex = this.findIndexInDefaultMatrix(config.original, config.index)
        if (keyIndex === undefined) return false

        const changeArr = await this.configToChangeArr(config)
        if (changeArr === undefined) return false

        const b = Buffer.alloc(64);
        b[0] = this.FEA_CMD_SET_FN;
        b[1] = fnindex;

        b[2] = keyIndex;

        b[8] = changeArr[0]
        b[9] = changeArr[1]
        b[10] = changeArr[2]
        b[11] = changeArr[3]
        const currentKeyIndex = this.findCurrentIndexInDefaultMatrix(config.original, config.index)
        if (currentKeyIndex !== undefined && this.reFnData.matrix !== undefined) {
            for (let i = 0; i < changeArr.length; i++) {
                this.reFnData.matrix[currentKeyIndex + i] = changeArr[i]
            }
        }

        return await this.writeFeatureCmd(b, 0)
    }

    configsToMatrix = async (configs: ConfigValue[]) => {
        const profile = this.currentProfile === undefined ? 0 : this.currentProfile
        const macros = [...(configs.filter((v) => v.type === 'ConfigMacro') as ConfigMacro[])]
        configs.map(v => {
            v.type === 'ConfigMacro' && (v.macroIndex = undefined)
        })

        if (macros.length > this.MACROMAX && configs[configs.length - 1].type === 'ConfigMacro') {
            // throw Error('宏最多写入20条')
            mobxStore.toastStore.setErr(res.text.宏最多写入20条())
            return
        }

        if (this.allLayerConfigs !== undefined) {
            let index = this.allLayerConfigs.findIndex(v =>
                v.isFn === this.isFn
                && (this.isFn ? v.profile === this.fnIndex : v.profile === profile)
                && !macros.some(mv => equals(v.macro.index, mv.index)
                    && equals(v.macro.macro, mv.macro)
                    && equals(v.macro.macroType, mv.macroType)
                    && equals(v.macro.original, mv.original)
                    && equals(v.macro.repeatCount, mv.repeatCount)
                    && equals(v.macro.type, mv.type)))
            while (index !== -1) {
                this.allLayerConfigs.splice(index, 1)
                index = this.allLayerConfigs.findIndex(v =>
                    v.isFn === this.isFn
                    && (this.isFn ? v.profile === this.fnIndex : v.profile === profile)
                    && !macros.some(mv => equals(v.macro.index, mv.index)
                        && equals(v.macro.macro, mv.macro)
                        && equals(v.macro.macroType, mv.macroType)
                        && equals(v.macro.original, mv.original)
                        && equals(v.macro.repeatCount, mv.repeatCount)
                        && equals(v.macro.type, mv.type)))
            }
        }
        const canUseMacroIndexs = new Array<number>()
        if (this.allLayerConfigs === undefined) {
            this.allLayerConfigs = await this.getAllLayerMacros()
        }

        console.error("ALLLAYERCONGIGS: ", this.allLayerConfigs.map(v => ({
            isFn: v.isFn,
            profile: v.profile,
            macro: v.macro
        })));

        const ams = [...this.allLayerConfigs]
        if (macros.length > 0) {
            for (let i = 0; i < ams.length; i++) {
                const macro = ams[i].macro
                if (macro.macroIndex === undefined) continue;
                if (macro.macroIndex > this.MACROMAX) continue;
                canUseMacroIndexs.push(macro.macroIndex)
            }
        }

        for (let i = 0; i < macros.length; i++) {
            const macro = macros[i]

            if (!ams.some(av => av.isFn === this.isFn && (this.isFn ? av.profile === this.fnIndex : av.profile === profile) && (equals(av.macro.index, macro.index)
                && equals(av.macro.macro, macro.macro)
                && equals(av.macro.macroType, macro.macroType)
                && equals(av.macro.original, macro.original)
                && equals(av.macro.repeatCount, macro.repeatCount)
                && equals(av.macro.type, macro.type))
            )) {
                ams.push({
                    isFn: this.isFn,
                    profile: this.isFn ? this.fnIndex : profile,
                    macro: macro
                })
            }
        }

        if (ams.length > this.MACROMAX) {
            mobxStore.toastStore.setErr(res.text.宏最多写入20条())
            return
        }

        const allChangeArr: {
            changeArr: number[],
            orginHid: number,
            index?: number
        }[] = []
        for (let i = 0; i < configs.length; i++) {
            let changeArr: number[] = [0, 0, 0, 0]
            const config = configs[i]
            switch (config.type) {
                case 'forbidden':
                    changeArr = [0, 0, 0, 0]
                    break
                case 'combo':
                    // 特殊按键恢复默认
                    if (specialFunTablectionArr.findIndex(v => arrTo16(v) === config.original && arrTo16(v) === config.key) === -1) {
                        changeArr = [0, skeyToHidTable[config.skey], config.key, config.key2]
                    } else {
                        changeArr = [...numToByte4(config.key)]
                    }
                    break
                case 'ConfigChangeToMouseBtn':
                    if (mouseKeyTable[config.key] !== undefined)
                        changeArr = [...mouseKeyTable[config.key]]
                    break
                case 'ConfigFunction':
                    changeArr = [...specialFunTablectionMap[config.key]]
                    break
                case 'ConfigUnknown':
                    changeArr = [...config.value]
                    break
                case 'ConfigMacro':
                    let mt: number
                    switch (config.macroType) {
                        case 'repeat_times':
                            mt = 0
                            break
                        case 'touch_repeat':
                            mt = 2
                            break
                        case 'on_off':
                            mt = 1
                            break
                        default:
                            mt = 0
                            break
                    }
                    /**
                     * config里不存在macroIndex  未下载过该宏
                     */
                    if (!this.allLayerConfigs.some(v => v.isFn === this.isFn
                        && (this.isFn ? v.profile === this.fnIndex : v.profile === profile)
                        && (equals(v.macro.index, config.index)
                            && equals(v.macro.macro, config.macro)
                            && equals(v.macro.macroType, config.macroType)
                            && equals(v.macro.original, config.original)
                            && equals(v.macro.repeatCount, config.repeatCount)
                            && equals(v.macro.type, config.type)))) {
                        if (config.macroIndex === undefined) {
                            console.error("MMMM-1111");
                            let index = 0
                            while (index >= this.MACROMAX || changeArr[0] !== 0x09) {
                                if (canUseMacroIndexs.some(v => v === index)) {
                                    index++
                                } else {
                                    canUseMacroIndexs.push(index)
                                    changeArr = [9, mt, index, 0]
                                    config.macroIndex = index
                                    this.allLayerConfigs.push({
                                        isFn: this.isFn,
                                        profile: this.isFn ? this.fnIndex : profile,
                                        macro: config
                                    })
                                    if (!(await this.setMacro(config, index)))
                                        throw Error('写入宏失败')
                                }
                            }
                        }
                    } else {
                        console.error("MMMM-2222");
                        const sameConfig = this.allLayerConfigs.find(v =>
                            equals(v.macro.index, config.index)
                            && equals(v.macro.macro, config.macro)
                            && equals(v.macro.macroType, config.macroType)
                            && equals(v.macro.original, config.original)
                            && equals(v.macro.repeatCount, config.repeatCount)
                            && equals(v.macro.type, config.type))?.macro
                        if (sameConfig !== undefined) {
                            console.error("MMMM-3333");
                            if (sameConfig.macroIndex !== undefined) {
                                console.error("MMMM-4444");
                                changeArr = [9, mt, sameConfig.macroIndex, 0]
                                config.macroIndex = sameConfig.macroIndex
                            }
                        }
                    }

                    console.error("CCCCCAAAAARRRRR: ", changeArr);
                    if (equals(changeArr, [0, 0, 0, 0])) break;
                    // 查询宏的位置
                    const tmp = this.allLayerConfigs?.findIndex(v => (this.isFn ? v.profile === this.fnIndex : v.profile === profile)
                        && v.macro.original === config.original && this.isFn === v.isFn)

                    const tmpConfig: ConfigMacro = {
                        index: config.index,
                        macro: config.macro,
                        macroIndex: config.macroIndex,
                        macroType: config.macroType,
                        original: config.original,
                        repeatCount: config.repeatCount,
                        type: config.type,
                    }
                    if (tmp !== undefined && tmp !== -1 && this.allLayerConfigs) {
                        this.allLayerConfigs[tmp] = {
                            isFn: this.isFn,
                            profile: this.isFn ? this.fnIndex : profile,
                            macro: tmpConfig
                        }
                    } else {
                        this.allLayerConfigs?.push({
                            isFn: this.isFn,
                            profile: this.isFn ? this.fnIndex : profile,
                            macro: tmpConfig
                        })
                    }
                    break
                default:
                    changeArr = [0, 0, 0, 0]
                    break
            }

            allChangeArr.push({
                changeArr: changeArr,
                orginHid: config.original,
                index: config.index
            })
        }

        console.error("ALLLAYERCONGIGS-END: ", this.allLayerConfigs.map(v => ({
            isFn: v.isFn,
            profile: v.profile,
            macro: v.macro
        })));

        const matrix = this.changeAllConfig(allChangeArr)
        console.log('下命令 ! ! ! : ', matrix)
        return matrix
    }

    setMacro = async (macros: ConfigMacro, index: number) => {

        console.log('setMacrosetMacrosetMacrosetMacrosetMacrosetMacrosetMacrosetMacrosetMacro', macros)


        const marcoArr: MacroEvent[] = macros.macro

        const buf = Buffer.alloc(256)
        let bufIndex = 0
        //写入重复次数
        buf.writeUInt16LE(macros.repeatCount, 0)
        bufIndex += 2
        let needDely = false
        //
        console.log('marcoArrmarcoArrmarcoArrmarcoArr', marcoArr)
        for (let i = 0; i < marcoArr.length; i++) {

            const setAttr = (cur: MouseButton | MouseMove | KeyBoard) => {
                let attrNum = 0
                if (i + 1 < marcoArr.length) {
                    const m = marcoArr[i + 1]
                    if (m.type === 'delay' && m.value <= 127) {
                        attrNum = m.value
                    }
                }
                if (cur.type !== 'mouse_move')
                    attrNum = cur.action === 'down' ? setBit(attrNum, 7, 1) : setBit(attrNum, 7, 0)
                console.log('attrNum :', attrNum)
                buf.writeUInt8(attrNum, bufIndex)
                bufIndex++
                needDely = true
                if ((attrNum & 0x7f) > 0) {
                    needDely = false
                    i++
                }

            }
            const tmpME = marcoArr[i]
            console.log('tmpMEtmpMEtmpMEtmpMEtmpME', tmpME, i, needDely)
            if (tmpME.type !== 'delay' && needDely === true) {
                buf.writeUInt16LE(0, bufIndex) //必须有间隔
                bufIndex += 2
            }


            switch (tmpME.type) {
                case 'delay':
                    if (needDely) {
                        buf.writeUInt16LE(tmpME.value, bufIndex)
                        bufIndex += 2
                    } else {
                        buf.writeUInt16LE(0, bufIndex)
                        bufIndex += 2
                        buf.writeUInt16LE(tmpME.value, bufIndex)
                        bufIndex += 2
                    }
                    needDely = false
                    break
                case 'keyboard':
                    buf.writeUInt8(tmpME.value, bufIndex)
                    bufIndex++
                    needDely = true//写这里为了消除警告 tslint bug
                    setAttr(tmpME)
                    break
                case 'mouse_button':
                    buf.writeUInt8(mouseKeyTable[tmpME.value][2], bufIndex)
                    bufIndex++
                    setAttr(tmpME)
                    break
                case 'mouse_move':
                    /*v1
                              0x00 0xf9 [   0x00 0x00  ]
                              Y    X    [  delay       ]
                    */
                    /*v2
                              xy:
                              
                              delay<127
                              
                              0xf9  | delay | x | y
                              
                              delay>= 127
                              
                              0xf9 | 0 | x | y | delay_L | delay_H
          
                    */
                    buf.writeUInt8(0xf9, bufIndex)
                    bufIndex++
                    setAttr(tmpME)
                    buf.writeInt8(tmpME.dx, bufIndex)
                    bufIndex++
                    buf.writeInt8(tmpME.dy, bufIndex)
                    bufIndex++
                    break
                default:
                    break
            }
            //console.log('第i次 buf', buf, i, needDely, tmpME)
        }
        //

        // console.error('11111111111 L   ::: ', buf)
        console.log('写入的红', [...buf].map(v => v.toString(16)))

        if (this.isFn)
            this.reFnData.marcroBuf[index] = buf
        else
            this.reComData.marcroBuf[index] = buf
        return await this._setMacro(buf, index)
    }

    protected _setMacro = async (buf: Buffer, index: number) => {
        const b = Buffer.alloc(8)
        b[0] = this.FEA_CMD_SET_MACRO
        b[1] = index
        b[2] = 0x00
        b[3] = 0x01
        for (let i = 0; i < 5; i++) {
            b[4] = i

            let ms = [...buf.slice(i * 56, 56 + i * 56)]
            if (ms.length < 56) {
                ms = ms.concat(new Array(56 - ms.length).fill(0))
            }
            const bufS = Buffer.from([...b, ...ms])

            // if (this.deviceType.is24) {
            //     const res = await this.checkStatus(true);
            //     if (res === undefined) return false;
            //     if (!res.isSend) return false;
            // }

            const sucess = await this.writeFeatureCmd(bufS, 0)

            // console.error('bufSbufSbufS', bufS);
            // console.error('sucesssucess', sucess);
            if (!sucess) return false
        }
        await sleep(this.BIGCMDDELAY)
        return true
    }

    getAllLayerMacros = async () => {
        const layer = getDevLayer(this.deviceType!.id!) === 0 ? 1 : getDevLayer(this.deviceType!.id!)
        const allLayerConfigs: {
            isFn: boolean,
            profile: number,
            macro: ConfigMacro
        }[] = []

        const profile = this.currentProfile === undefined ? 0 : this.currentProfile
        for (let i = 0; i < layer; i++) {
            let c
            if (!this.isFn && i === profile && this.reComData.matrix) {
                const matrix = new Array<number>()
                for (let i = 0; i < this.reComData.matrix?.length; i++) {
                    matrix.push(this.reComData.matrix[i])
                }
                c = await this.matrixToConfigValues(matrix, false)
            } else
                c = await this.getKeyConfig(i, true)
            if (c === undefined) continue
            c.map(v => {
                if (v.type === 'ConfigMacro') {
                    allLayerConfigs.push({
                        isFn: false,
                        profile: i,
                        macro: v
                    })
                }
            })
            if (this.deviceType.is24 || this.deviceType.isblue)
                await sleep(5) // 避免菊花超时
        }

        const fnLayer = getDevFnLayer(this.deviceType!.id!)
        for (let i = 0; i < fnLayer; i++) {
            const c = await this.getFnKeyConfig(i, true)
            if (c === undefined) continue
            c.map(v => {
                if (v.type === 'ConfigMacro') {
                    allLayerConfigs.push({
                        isFn: false,
                        profile: i,
                        macro: v
                    })
                }
            })
            if (this.deviceType.is24 || this.deviceType.isblue)
                await sleep(5) // 避免菊花超时
        }

        this.allLayerConfigs = allLayerConfigs
        return allLayerConfigs
    }

    changeAllConfig = (changeArr: {
        changeArr: number[],
        orginHid: number,
        index?: number
    }[]) => {
        let res = [...this.defaultMatrix]
        changeArr.forEach(v => {
            const t = this.changeMatrix(v.orginHid, v.changeArr, res, v.index)
            if (t !== undefined) res = t
        })
        return res
    }

    changeMatrix = (
        orginHid: number,
        changeArr: Array<number>,
        currentMatrix: Array<number>,
        index?: number
    ) => {
        // console.error('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', orginHid, changeArr)
        const copyMatrix = [...currentMatrix]
        let i = 2
        let isExist = false
        let searchCount = 0
        const numArr = new Array()
        for (let n = 0; n < specialFunTablectionArr.length; n++) {
            const tmp = arrTo16(specialFunTablectionArr[n])
            numArr.push(tmp)
        }
        for (; i < this.defaultMatrix.length; i += 4) {
            //判断fn
            const tmpIndex = numArr.findIndex((v: number) => equals(v, orginHid))
            if (tmpIndex !== -1) {
                if (equals(this.defaultMatrix.slice(i - 2, i + 2), specialFunTablectionArr[tmpIndex])) {
                    if (index === undefined || searchCount === index) {
                        isExist = true
                        break
                    } else {
                        searchCount++
                        continue
                    }
                }
            }
            // if (orginHid === 0x0a010000) {
            //   //改建为fn
            //   if (equals(this.defaultMatrix.slice(i - 2, i + 2), [0x0a, 0x01, 0, 0])) {
            //     if (index === undefined || searchCount === index) {
            //       isExist = true
            //       break
            //     } else {
            //       searchCount++
            //       continue
            //     }
            //   }
            // }

            if (equals(this.defaultMatrix.slice(i - 2, i + 2), [0, 0, orginHid, 0])) {
                if (index === undefined || searchCount === index) {
                    isExist = true
                    break
                } else {
                    searchCount++
                    continue
                }
            }
        }

        if (!isExist) return undefined

        copyMatrix[i - 1 - 1] = changeArr[0]
        copyMatrix[i - 1] = changeArr[1]
        copyMatrix[i] = changeArr[2]
        copyMatrix[i + 1] = changeArr[3]
        return copyMatrix
    }

    findIndexInDefaultMatrix = (hid: number, findIndex?: number) => {
        let currentFindeIndex = 0
        const numArr = new Array()
        for (var i = 0; i < specialFunTablectionArr.length; i++) {
            const tmp = arrTo16(specialFunTablectionArr[i])
            numArr.push(tmp)
        }
        const tmpNum = numArr.find(v => equals(v, hid))
        let index = 0
        if (tmpNum) {//fn 特殊处理
            for (let i = 0; i < this.defaultMatrix.length; i += 4) {
                const buf = Buffer.from(this.defaultMatrix.slice(i, i + 4))
                if (hid === buf.readUInt32BE()) {
                    if (findIndex === undefined || findIndex == currentFindeIndex) {
                        return index
                    } else {
                        currentFindeIndex++
                    }

                }
                index++
            }
        }

        for (let i = 0; i < this.defaultMatrix.length; i += 4) {
            const dArr4 = this.defaultMatrix.slice(i, i + 4)
            if (equals([0, 0, hid, 0], dArr4)) {
                if (findIndex === undefined || findIndex == currentFindeIndex) {
                    return index
                } else {
                    currentFindeIndex++
                }
            }

            if (equals([...mouseKeyTable[hid]], dArr4)) {
                if (findIndex === undefined || findIndex == currentFindeIndex) {
                    return index
                } else {
                    currentFindeIndex++
                }
            }

            if (hid > 0xff) { // 处理未加入映射specialFncComboKey/specialBasicFnc的特殊按键
                if (equals(numToByte4(hid), dArr4)) {
                    if (findIndex === undefined || findIndex == currentFindeIndex) {
                        return index
                    } else {
                        currentFindeIndex++
                    }
                }
            }
            index++
        }
        return undefined
    }

    private configToChangeArr = async (config: ConfigValue, type?: boolean) => {
        if (this.allLayerConfigs === undefined) {
            this.allLayerConfigs = await this.getAllLayerMacros()
        }

        const canUseMacroIndexs = new Array<number>()
        const index = this.allLayerConfigs.findIndex(v => {
            const profile = this.currentProfile ? this.currentProfile : 0
            if (equals(v.macro.original, config.original)
                && equals(v.isFn, this.isFn)
                && equals(profile, v.profile)) {
                return true
            }
            return false
        })
        if (index !== -1) {
            this.allLayerConfigs.splice(index, 1)
        }
        const ams = this.allLayerConfigs
        for (let i = 0; i < ams.length; i++) {
            const macro = ams[i].macro
            if (macro.macroIndex === undefined) continue;
            if (macro.macroIndex > this.MACROMAX) continue;
            canUseMacroIndexs.push(macro.macroIndex)
        }

        if (config.type === 'ConfigMacro' && canUseMacroIndexs.length >= this.MACROMAX) {
            mobxStore.toastStore.setErr(res.text.宏最多写入50条())
            return
        }

        let changeArr = [0, 0, 0, 0]

        switch (config.type) {
            case 'forbidden':
                changeArr = [0, 0, 0, 0]
                break
            case 'combo':
                // 特殊按键恢复默认
                if (specialFunTablectionArr.findIndex(v => arrTo16(v) === config.original && arrTo16(v) === config.key) === -1) {
                    changeArr = [0, skeyToHidTable[config.skey], config.key, config.key2]
                } else {
                    changeArr = [...numToByte4(config.key)]
                }
                break
            case 'ConfigChangeToMouseBtn':
                if (mouseKeyTable[config.key] !== undefined)
                    changeArr = [...mouseKeyTable[config.key]]
                break
            case 'ConfigFunction':
                if (config.value === undefined)
                    changeArr = [...specialFunTablectionMap[config.key]]
                else
                    changeArr = [...config.value]
                break
            case 'ConfigUnknown':
                changeArr = [...config.value]
                break
            case 'ConfigMacro':
                let mt: number
                switch (config.macroType) {
                    case 'repeat_times':
                        mt = 0
                        break
                    case 'touch_repeat':
                        mt = 2
                        break
                    case 'on_off':
                        mt = 1
                        break
                    default:
                        mt = 0
                        break
                }

                let i = 0;
                while (i >= this.MACROMAX || changeArr[0] !== 0x09) {
                    if (canUseMacroIndexs.some(v => v === i)) {
                        i++
                    } else {
                        const profile = this.currentProfile ? this.currentProfile : 0
                        changeArr = [9, mt, i, 0]
                        this.allLayerConfigs.push({
                            isFn: this.isFn,
                            profile: this.isFn ? this.fnIndex : profile,
                            macro: config
                        })
                        config.macroIndex = i
                        if (!(await this.setMacro(config, i)))
                            throw Error('写入宏失败')
                    }
                }
                break
            default:
                changeArr = [0, 0, 0, 0]
                break
        }

        return changeArr
    }

    findCurrentIndexInDefaultMatrix = (hid: number, findIndex?: number) => {
        const tmpArr = specialFunTablectionArr.find(v => arrTo16(v) === hid)

        let currentKeyIndex: number | undefined
        let index = findIndex
        let searchCount = 0
        for (let j = 0; j < this.defaultMatrix.length; j += 4) {
            const nArr4 = this.defaultMatrix.slice(j, j + 4)
            if (
                (equals(nArr4, tmpArr) && tmpArr !== undefined)
                || equals(nArr4, [0, 0, hid, 0])
            ) {
                if (index === undefined || searchCount === index) {
                    currentKeyIndex = j
                    break
                } else {
                    searchCount++
                    continue
                }
            }
        }

        return currentKeyIndex
    }

    checkMacroLenthIsFull = (marcoArr: MacroEvent[]) => {
        let bufIndex = 0
        bufIndex += 2
        let needDely = false

        for (let i = 0; i < marcoArr.length; i++) {

            const setAttr = (cur: MouseButton | MouseMove | KeyBoard) => {
                let attrNum = 0
                if (i + 1 < marcoArr.length) {
                    const m = marcoArr[i + 1]
                    if (m.type === 'delay' && m.value <= 127) {
                        attrNum = m.value
                    }
                }

                if (cur.type !== 'mouse_move')
                    attrNum = (attrNum << 1) | (cur.action === 'down' ? 1 : 0)
                bufIndex++
                needDely = true
                if (attrNum > 1) {
                    needDely = false
                    i++
                }
            }
            const tmpME = marcoArr[i]

            if (tmpME.type !== 'delay' && needDely === true) {
                bufIndex += 2
            }
            switch (tmpME.type) {
                case 'delay':
                    if (needDely) {
                        bufIndex += 2
                    } else {
                        bufIndex += 2
                        bufIndex += 2
                    }
                    needDely = false
                    break
                case 'keyboard':
                    bufIndex++
                    needDely = true//写这里为了消除警告 tslint bug
                    setAttr(tmpME)
                    break
                case 'mouse_button':
                    bufIndex++
                    setAttr(tmpME)
                    break
                case 'mouse_move':
                    bufIndex++
                    setAttr(tmpME)
                    bufIndex++
                    bufIndex++
                    break
                default:
                    break
            }
            if (bufIndex >= 256 - 8) return true
            //console.log('第i次 buf', buf, i, needDely, tmpME)
        }
        return false
    }

    getDpiColor = async () => {
        const b = Buffer.alloc(8)
        b[0] = this.FEA_CMD_GET_DPICOLOR
        const buf = await this.commomFeature(b, 0);
        if (buf === undefined) return undefined

        const nArr = [...buf.slice(1, 25)]
        const arr = new Array()
        for (let i = 0; i < nArr.length; i += 3) {
            const nArr3 = nArr.slice(i, i + 3)
            arr.push(rgb2Num(nArr3[0], nArr3[1], nArr3[2]))
        }
        return arr
    }

    setDpiColor = async (arr: number[]) => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_SET_DPICOLOR

        for (let i = 0; i < arr.length; i++) {
            const rgb = num2Rgb(arr[i])
            b[8 + 3 * i] = rgb.r
            b[9 + 3 * i] = rgb.g
            b[10 + 3 * i] = rgb.b
        }

        return await this.writeFeatureCmd(b, 0)
    }

    setMusicFollow = async (arr: Array<number>, flag: number, needfe: boolean = false) => {
        let hanleArr = arr.slice(flag, flag + 32)
        if (this.deviceType.is24 && needfe)
            await this.fe_24_set_next_pack_length(hanleArr.length / 2)

        while (hanleArr.filter(v => v !== 0).length < 5 && flag > 0) {
            flag--
            hanleArr = arr.slice(flag, flag + 32)
        }

        const b = new Array<number>(this.deviceType.is24 || this.deviceType.isblue ? 1 : 8).fill(0)
        b[0] = this.FEA_CMD_SET_AUDIO

        const sendArr = b.concat(...hanleArr)
        let sendBuf = sendArr.concat(new Array(64 - sendArr.length).fill(0))
        // let tmp = sendBuf

        if (this.deviceType.is24 || this.deviceType.isblue) {
            for (var i = 0; i < hanleArr.length / 2; i++) {
                sendBuf[i + 1] = hanleArr[2 * i] | hanleArr[2 * i + 1] << 4;
            }
        }

        let tmp = Buffer.from(sendBuf)

        if (this.deviceType.is24 || this.deviceType.isblue) {
            if (this.deviceType.is24)
                return await this.writeRawFeatureCmd(tmp, 2, 0)
            else {
                sendBuf.splice(0, 0, 0x56, 0x0c)
                tmp = Buffer.from(sendBuf)
                return await this.writeRawFeatureCmd(tmp, 2, 0)
            }
        } else {
            return await this.writeRawFeatureCmd(tmp, 0, 0)
        }
    }
    upgrade: (filePath: Buffer, progressCallBack: (v: number) => void) => Promise<boolean> = async (filePath: Buffer, progressCallBack: (v: number) => void) => false

}

export const mouseKeyTable: { [key in number]: Array<number> } = {
    [MouseKey.Left]: [0x00, 0x00, 0xf0, 0x00],
    [MouseKey.Right]: [0x00, 0x00, 0xf1, 0x00],
    [MouseKey.Middle]: [0x00, 0x00, 0xf2, 0x00],
    [MouseKey.Forward]: [0x00, 0x00, 0xf3, 0x00],
    [MouseKey.Back]: [0x00, 0x00, 0xf4, 0x00],
    [MouseKey.WheelLeft]: [0x00, 0x00, 0xf5, 0x00],
    [MouseKey.WheelRight]: [0x00, 0x00, 0xf6, 0x00],
    [MouseKey.WheelForward]: [0x00, 0x00, 0xf7, 0x00],
    [MouseKey.WheelBack]: [0x00, 0x00, 0xf8, 0x00],
    [MouseKey.Dpi]: [],
    [MouseKey.Key_1]: [],
    [MouseKey.Key_2]: [],
    [MouseKey.SCROLLUP]: [0x00, 0x00, 0xf5, 0x01],
    [MouseKey.SCROLLDOWN]: [0x00, 0x00, 0xf5, 0xff],
    [MouseKey.XUP]: [0x00, 0x00, 0xf6, 0xfb],
    [MouseKey.XDOWN]: [0x00, 0x00, 0xf6, 0x05],
    [MouseKey.YUP]: [0x00, 0x00, 0xf7, 0xfb],
    [MouseKey.YDOWN]: [0x00, 0x00, 0xf7, 0x05],
}