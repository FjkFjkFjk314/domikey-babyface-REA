import { sleep } from "../../../../unitys/timeFunc";
import { YC500Common } from "../yc500/yc500Common";
import { defaultMatrix_yc3016a_k81_office_kb } from "./yc3016a_k81_office_kbMatrix";


export class YC3016A_K81_OFFICE_KB extends YC500Common {
    defaultMatrix = defaultMatrix_yc3016a_k81_office_kb
    BIGCMDDELAY = process.platform == 'darwin' ? 1000 : 100
    protected async _getKeyMatrix(profile?: number) {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_KEYMATRIX
        b[1] = profile !== undefined
            ? profile
            : this.currentProfile
                ? this.currentProfile
                : 0

        let res = Buffer.alloc(0)
        //matrix  640 
        for (let i = 0; i < 10; i++) {
            b[2] = i

            const buf = await this.commomFeature(b, 0)

            //if (buf === undefined) return undefined
            //const b1 = await this.readFeatureCmd(10)
            //console.error('BBBBBB', b, b[2])
            if (buf === undefined) throw '_getKeyMatrix !!!undefine'

            res = Buffer.concat([res, buf])
        }
        return res
    }
    protected async _getFnKeyMatrix(fnidex: number) {
        const b = Buffer.alloc(64)
        b[0] = 0x90
        b[1] = fnidex

        let res = Buffer.alloc(0)
        for (let i = 0; i < 10; i++) {
            b[2] = i
            const buf = await this.commomFeature(b, 0)

            //if (buf === undefined) return undefined
            //const b1 = await this.readFeatureCmd(10)
            //console.error('BBBBBB', b, b[2])
            if (buf === undefined) throw '_getFnKeyMatrix !!!undefine'

            res = Buffer.concat([res, buf])
        }
        return res
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
        for (let i = 0; i < 11; i++) {
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
            const sucess = await this.writeFeatureCmd(buf)

            if (!sucess) return false
        }
        await sleep(this.BIGCMDDELAY)
        return true
    }

    protected _setFnKeyConfig = async (matrix: number[], fnindex: number) => {
        //console.error('1111111')
        const b = new Array(8).fill(0)
        b[0] = 0x10
        b[1] = fnindex
        b[2] = 0xf8
        b[3] = 0x01
        /////

        ////
        //console.log('下命令 ！！！：', matrix)
        for (let i = 0; i < 11; i++) {
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
            const sucess = await this.writeFeatureCmd(buf)

            if (!sucess) return false
        }
        await sleep(this.BIGCMDDELAY)
        return true
    }

}