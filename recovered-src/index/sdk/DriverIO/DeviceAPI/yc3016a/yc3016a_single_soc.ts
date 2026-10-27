import { numToRgb } from "../../../../unitys/rgbNum";
import { sleep } from "../../../../unitys/timeFunc";
import { YC500Common } from "../yc500/yc500Common";
import { defaultMatrix_yc3016a_lj_fd98t } from "./yc3016a_lj_fd98tMatrix";


export class YC3016A_SINGLE_SOC extends YC500Common {
    defaultMatrix = defaultMatrix_yc3016a_lj_fd98t

    DAZZLE = 0
    NORMAL = 0
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
            case 'LightRipple':
                effect = 0x05
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightRaindrop':
                effect = 0x06
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightSnake':
                effect = 0x07
                speed = lightSet.speed
                option = lightSet.option === 'z' || lightSet.option === undefined ? (0 << 4 | n) : (1 << 4 | n)
                brightness = lightSet.value
                break
            case 'LightPressAction':
                effect = 0x08
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightConverage':
                effect = 0x09
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightSineWave':
                effect = 0x0A
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightKaleidoscope':
                effect = 0x0B
                speed = lightSet.speed
                option = lightSet.option === 'out' || lightSet.option === undefined ? (0 << 4 | n) : (1 << 4 | n)
                brightness = lightSet.value
                break
            case 'LightLineWave':
                effect = 0x0C
                speed = lightSet.speed
                brightness = lightSet.value
                option = lightSet.option === 'right' || lightSet.option === undefined ? (0 << 4 | n) : (1 << 4 | n)
                break
            case 'LightUserPicture':
                effect = 0x0D
                option = lightSet.option !== undefined ? this.USEROP[lightSet.option] : 0
                brightness = lightSet.value
                break
            case 'LightLaser':
                effect = 0x0E
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightCircleWave':
                effect = 0x0F
                speed = lightSet.speed
                brightness = lightSet.value
                option = lightSet.option === 'anti-clockwise' || lightSet.option === undefined ? (0 << 4 | n) : (1 << 4 | n)
                break
            case 'LightDazzing':
                effect = 0x10
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightRainDown':
                effect = 0x11
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightMeteor':
                effect = 0x12
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightPressActionOff':
                effect = 0x13
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightMusicFollow3':
                effect = 0x14
                option = lightSet.option === undefined || lightSet.option === 'upright' ? (0 << 4) | musicKey : this.MP[lightSet.option] << 4 | musicKey
                brightness = lightSet.value
                break
            case 'LightScreenColor':
                effect = 0x15
                brightness = 4
                break
            case 'LightMusicFollow2':
                effect = 0x16
                brightness = lightSet.value
                option = lightSet.option === undefined || lightSet.option === 'upright' ? (0 << 4) | musicKey : this.MP[lightSet.option] << 4 | musicKey
                break
            case 'LightTrain':
                effect = 0x17
                speed = lightSet.speed
                brightness = lightSet.value
                option = n
                break
            case 'LightFireWorks':
                effect = 0x18
                speed = lightSet.speed
                brightness = lightSet.value
                option = lightSet.option === 'right' || lightSet.option === undefined ? (0 << 4 | n) : (1 << 4 | n)
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

        const buf = await this.writeFeatureCmd(b, 1, 500)

        if (!buf) return false
        await sleep(this.COMMONDELAY)
        return true
    }
}