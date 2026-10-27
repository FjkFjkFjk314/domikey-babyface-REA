// import { numToRgb } from "../unitys/rgbNum";
import { numToRgb, rgbToNum } from "../../../../unitys/rgbNum";
import { arrTo16, numToByte4, specialFunTablectionArr, specialFunTablectionMap } from "../../../../res/映射";
import { MouseKey } from "../DeviceInterface";
import { YC200Common } from "../yc200/YC200Common";
import { mobxStore } from "../../../../mobxStore/store";
import { res, resLike } from "../../../../res";
import { sleep } from "../../../../unitys/timeFunc";
import { equals, sum } from "ramda";
import { readMsg } from "../../usb/client";
import { CheckSumType, DJDev } from "../../proto/driver_pb";
import { devlistList, HIDAttachSwich } from "../../usb/DetectSupportDevice";
import { valueForKey } from "../../../../../src/unitys/tableValueForKey";
import { buf2NumArr } from "../../../../unitys/buf2NumArr";

export class YC500Common extends YC200Common {
    FEA_CMD_SET_KEYMATRIX_SIMPLE = 0x13
    FEA_CMD_GET_KEYMATRIX_SIMPLE = 0x93
    FEA_CMD_SET_USERPIC_SIMPLE = 0x14
    FEA_CMD_GET_USERPIC_SIMPLE = 0x94
    FEA_CMD_SET_FN_SIMPLE = 0x15
    FEA_CMD_GET_FN_SIMPLE = 0x95
    FEA_CMD_SET_MACRO_SIMPLE = 0x16
    FEA_CMD_GET_MACRO_SIMPLE = 0x96
    FEA_CMD_SET_CMD_AUTOOSEN = 0x17
    FEA_CMD_GET_CMD_AUTOOSEN = 0x97
    FEA_CMD_SET_OLEDBOOTLOADER = 0x30
    FEA_CMD_GET_OLEDBOOTLOADER = 0xb0
    FEA_CMD_SET_OLEDBOOTSTART = 0x31
    FEA_CMD_GET_OLEDBOOTCHECKSUM = 0xb1
    FEA_CMD_GETOLED_VERSION = 0xAD
    FEA_CMD_SET_MLEDBOOTLOADER = 0x40;
    FEA_CMD_GET_MLEDBOOTLOADER = 0xc0;
    FEA_CMD_SET_MLEDBOOTSTART = 0x41;
    FEA_CMD_GET_MLEDBOOTCHECKSUM = 0xc1;

    MACROMAX = 50


    setAutoOsen = async (auto: boolean) => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_SET_CMD_AUTOOSEN
        b[1] = auto ? 1 : 0

        return await this.writeFeatureCmd(b, 0)
    }

    getAutoOsen = async () => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_CMD_AUTOOSEN

        const res = await this.commomFeature(b, 0)
        if (res === undefined) return false
        return Boolean(res[1])
    }

    setKeyConfigSimple = async (config: ConfigValue) => {
        // common key
        this.isFn = false
        const keyIndex = this.findIndexInDefaultMatrix(config.original, config.index)
        if (keyIndex === undefined) return false

        const changeArr = await this.configToChangeArr(config)
        if (changeArr === undefined) return false

        const b = Buffer.alloc(64);
        b[0] = this.FEA_CMD_SET_KEYMATRIX_SIMPLE;
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
        b[0] = this.FEA_CMD_SET_FN_SIMPLE;
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

    protected _setMacro = async (buf: Buffer, index: number) => {

        const b = Buffer.alloc(8)
        b[0] = this.FEA_CMD_SET_MACRO_SIMPLE
        b[1] = index

        let page = 0;
        for (let i = 0; i < 5; i++) {
            let ms = [...buf.slice(i * 56, 56 + i * 56)]
            if (ms.some(v => v !== 0)) {
                page++;
            }
        }

        for (let i = 0; i < page; i++) {
            b[2] = i
            b[3] = 56
            b[4] = i === page - 1 ? 1 : 0

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

    private configToChangeArr = async (config: ConfigValue, type?: boolean) => {
        if (this.allLayerConfigs === undefined) {
            this.allLayerConfigs = await this.getAllLayerMacros()
        }

        const canUseMacroIndexs = new Array<number>()
        const index = this.allLayerConfigs.findIndex(v => {
            const profile = this.currentProfile ? this.currentProfile : 0
            const p = this.isFn ? this.fnIndex : v.profile
            if (equals(v.macro.original, config.original)
                && equals(v.isFn, this.isFn)
                && equals(profile, p)) {
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

    configsToMatrix = async (configs: ConfigValue[]) => {
        const profile = this.currentProfile === undefined ? 0 : this.currentProfile
        const macros = [...(configs.filter((v) => v.type === 'ConfigMacro') as ConfigMacro[])]
        configs.map(v => {
            v.type === 'ConfigMacro' && (v.macroIndex = undefined)
        })

        if (macros.length > this.MACROMAX && configs[configs.length - 1].type === 'ConfigMacro') {
            // throw Error('宏最多写入20条')
            mobxStore.toastStore.setErr(res.text.宏最多写入50条())
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
            mobxStore.toastStore.setErr(res.text.宏最多写入50条())
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

    setLightPicSimple = async (simplePic: UserPicItem, layer?: number) => {
        const keyIndex = this.findIndexInDefaultMatrix(simplePic.hid, simplePic.index)

        if (keyIndex === undefined) return false

        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_SET_USERPIC_SIMPLE
        b[1] = layer ? layer : 0
        b[2] = keyIndex

        const t = numToRgb(simplePic.rgb)
        b[8] = t.r
        b[9] = t.g
        b[10] = t.b

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
    //屏幕版本
    getOLEDversion = async () => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GETOLED_VERSION
        let devicePath: string | undefined = undefined
        devicePath = devicePath === undefined ? this.deviceType.devAddr.toString() : devicePath
        if ((await this.writeFeatureCmd(b, 0, 10, devicePath, false)) === false) return 0
        let buf = await this.readFeatureCmd(100)

        if (buf === undefined || (buf !== null && buf[0] !== 0xAD)) return 0

        const res = buf?.readUInt16LE(1)

        if (res !== undefined) return res
        return 0
    }
    //屏幕升级
    oledBoot = async () => {
        console.log(`发进入boot命令 ${'0x' + this.FEA_CMD_SET_OLEDBOOTLOADER.toString(16)} , 0x55 , 0xaa , 0x55 , 0xdb`)
        let devicePath: string | undefined = undefined
        devicePath = devicePath === undefined ? this.deviceType.devAddr.toString() : devicePath
        const r = await this.send64([this.FEA_CMD_SET_OLEDBOOTLOADER, 0x55, 0xaa, 0x55, 0xaa, 0, 0, 0], 0, devicePath)
        if (!r) {
            console.log('发送 进入 boot 命令失败');
            return false
        }

        console.log('开始等待')
        await sleep(1000 * 3)
        console.log('等待结束')

        await this.send64([this.FEA_CMD_GET_OLEDBOOTLOADER], 0, devicePath)
        await sleep(100)
        const boot_buf = await readMsg(devicePath)
        if (boot_buf === undefined) {
            return false
        }

        if (boot_buf !== undefined && boot_buf[0] !== this.FEA_CMD_GET_OLEDBOOTLOADER) {
            mobxStore.toastStore.setErr(res.text.升级失败请插拔键盘和屏幕重试())
            return false
        }

        const boot_mode = Boolean(boot_buf[1])
        return boot_mode
    }
    commomFeatureOled = async (cmdBuf: number[], path: string,) => {
        const res = await this.send64(cmdBuf, CheckSumType.BIT7, path)
        if (!res) return undefined
        await sleep(100)
        const buf = await readMsg(path)
        // if (buf === undefined || !equals(buf[0], cmdBuf[0]))
        //     return undefined
        return buf
    }
    oledUpgrade = async (rawBuf: Buffer, progressCallBack: (v: number) => void) => {
        let devUpList: DJDev.AsObject[] | undefined
        let findCount = 0
        let devicePath: string | undefined = undefined
        while ((devUpList?.length === 0 || devUpList === undefined) && findCount < 100) {
            console.error("!!!!!!!!!!!!!")
            await sleep(500)

            devUpList = devlistList.filter(v => {
                console.error(v);
                return v.dev && v.dev.id === this.deviceType.id
            })

            findCount++
        }

        if (devUpList?.length === 0 || devUpList === undefined) {
            //alert('未检测到支持设备')
            HIDAttachSwich(true)
            console.error('找不到设备')
            return false
        }
        console.log(`发进入boot命令 ${'0x' + this.FEA_CMD_SET_OLEDBOOTLOADER.toString(16)} , 0x55 , 0xaa , 0x55 , 0xdb`)
        devicePath = devUpList === undefined || devUpList.length === 0 ? undefined : devUpList[0].dev?.path
        if (devicePath === undefined) return false
        const r = await this.send64([this.FEA_CMD_SET_OLEDBOOTLOADER, 0x55, 0xaa, 0x55, 0xaa, 0, 0, 0], 0, devicePath)
        if (!r) {
            console.log('发送 进入 boot 命令失败');
            return false
        }

        console.log('开始等待')
        await sleep(1000 * 3)
        console.log('等待结束')

        // await this.send64([this.FEA_CMD_GET_OLEDBOOTLOADER], 0, devicePath)
        // await sleep(100)
        // const boot_buf = await readMsg(devicePath)

        let boot_buf = await this.commomFeatureOled([this.FEA_CMD_GET_OLEDBOOTLOADER], devicePath)
        let k = 0
        while ((boot_buf === undefined || boot_buf[0] !== this.FEA_CMD_GET_OLEDBOOTLOADER) && k < 4) {
            await sleep(1000)
            boot_buf = await this.commomFeatureOled([this.FEA_CMD_GET_OLEDBOOTLOADER], devicePath)
            k++
        }
        if (boot_buf === undefined) {
            return false
        }
        if (boot_buf !== undefined && boot_buf[0] !== this.FEA_CMD_GET_OLEDBOOTLOADER) {
            mobxStore.toastStore.setErr(resLike.text.升级失败请插拔键盘和屏幕重试());
            return false
        }

        const boot_mode = Boolean(boot_buf[1])
        //boot结束

        if (!boot_mode) { mobxStore.toastStore.setErr(resLike.text.升级失败请插拔键盘和屏幕重试()); return false }
        const fBuf = rawBuf.slice(0x10000)
        console.log('数据大小: ', fBuf.length + ' kb');

        const onePackDataLength = 64
        const _dataPacketNum = Math.ceil(fBuf.length / (onePackDataLength))
        const allDataPacketNumInt16Buff = Buffer.alloc(2)
        allDataPacketNumInt16Buff.writeInt16LE(_dataPacketNum)
        console.log('发送数据包总数', _dataPacketNum)

        // let startTime = new Date().getTime()
        await this.send64([this.FEA_CMD_SET_OLEDBOOTSTART, allDataPacketNumInt16Buff[0], allDataPacketNumInt16Buff[1]], 0, devicePath)

        let num = 0;
        for (let i = 0; i < _dataPacketNum; i++) {
            const packDataLength = i * onePackDataLength > fBuf.length ? onePackDataLength - (i * onePackDataLength - fBuf.length) : onePackDataLength

            const tArr = [...fBuf.slice(i * onePackDataLength, i * onePackDataLength + packDataLength)]
            // await sleep(20)
            const res = await this.send64(tArr, 2, devicePath)

            for (let j = 0; j < tArr.length; j++) {
                num += tArr[j]
            }

            if (res) {
                progressCallBack(i / _dataPacketNum)
            } else {
                mobxStore.toastStore.setErr(resLike.text.发送升级数据失败())
                progressCallBack(1)
                return false
            }
        }
        // let endTime = new Date().getTime()
        // timeCallBack(Math.ceil((endTime - startTime) / 1000))

        console.log("TTTTTTTTotal: ", num);

        const totalBuff = Buffer.alloc(4)
        totalBuff.writeInt32LE(num)


        await this.send64([this.FEA_CMD_GET_OLEDBOOTCHECKSUM, totalBuff[0], totalBuff[1], totalBuff[2], totalBuff[3]], 0, devicePath)
        await sleep(1000 * 1)
        const res_buf = await readMsg(devicePath)
        if (res_buf === undefined) {
            return false
        }
        const res = res_buf[1]
        progressCallBack(1)
        return res === 0x55
    }

    mledUpgrade = async (rawBuf: Buffer, progressCallBack: (v: number) => void) => {
        progressCallBack(0)
        let devUpList: DJDev.AsObject[] | undefined
        let findCount = 0
        let devicePath: string | undefined = undefined
        while ((devUpList?.length === 0 || devUpList === undefined) && findCount < 100) {
            console.error("!!!!!!!!!!!!!")
            await sleep(500)
            devUpList = devlistList.filter(v => {
                console.error(v);
                return v.dev && v.dev.id === this.deviceType.id
            })
            findCount++
        }

        if (devUpList?.length === 0 || devUpList === undefined) {
            //alert('未检测到支持设备')
            HIDAttachSwich(true)
            console.error('找不到设备')
            return false
        }
        devicePath = devUpList === undefined || devUpList.length === 0 ? undefined : devUpList[0].dev?.path
        if (devicePath === undefined) return false
        // let devicePath = this.deviceType.devAddr.toString()
        console.log(`发进入boot命令 0x${this.FEA_CMD_SET_MLEDBOOTLOADER.toString(16)}, 0x55 , 0xaa , 0x55 , 0xaa`);
        const boots = await this.send64(
            [this.FEA_CMD_SET_MLEDBOOTLOADER, 0x55, 0xaa, 0x55, 0xaa, 0, 0, 0],
            CheckSumType.BIT7,
            devicePath
        )
        if (!boots) {
            console.log("发送 进入 boot 命令失败");
            return false
        }

        console.log("开始等待");
        await sleep(1000 * 3);
        console.log("等待结束");

        let buf: Buffer | undefined = undefined
        let count = 0;
        while ((buf === undefined || (buf[0] !== this.FEA_CMD_GET_MLEDBOOTLOADER || buf[1] !== 0x01)) && count < 5) {
            let res = await this.send64([this.FEA_CMD_GET_MLEDBOOTLOADER], CheckSumType.BIT7, devicePath)
            if (res) {
                await sleep(10)
                buf = await readMsg(devicePath)
            }
            count++
            await sleep(100)
        }

        if (buf === undefined || (buf[0] !== this.FEA_CMD_GET_MLEDBOOTLOADER || buf[1] !== 0x01)) return false

        let b = rawBuf.slice(0x10000);
        console.log('数据大小: ', b.length + ' kb');

        let onePackDataLength = 64;
        let _dataPacketNum = Math.ceil(b.length / onePackDataLength)
        let allDataPacketNumInt16Buff = Buffer.alloc(2)
        allDataPacketNumInt16Buff.writeInt16LE(_dataPacketNum)
        console.log('发送数据包总数', _dataPacketNum)

        await sleep(100)
        await this.send64([this.FEA_CMD_SET_MLEDBOOTSTART, allDataPacketNumInt16Buff[0], allDataPacketNumInt16Buff[1]], 0, devicePath)
        await sleep(100)

        let total = 0;
        for (let i = 0; i < _dataPacketNum; i++) {
            // let pack_data_length = 0
            const packDataLength = i * onePackDataLength > b.length ? onePackDataLength - (i * onePackDataLength - b.length) : onePackDataLength

            const tArr = buf2NumArr(b.slice(i * onePackDataLength, i * onePackDataLength + packDataLength))
            const res = await this.send64(tArr, 2, devicePath)
            total += sum(tArr)
            if (res) {
                progressCallBack(i / _dataPacketNum)
            } else {
                // mobxStore.toastStore.setErr('发送升级数据失败')
                progressCallBack(1)
                return false
            }
        }
        console.log("TTTTTTTTotal: ", total);
        const totalBuff = Buffer.alloc(4)
        totalBuff.writeInt32LE(total)

        let checks: Buffer | undefined = undefined
        count = 0;
        while (checks === undefined && count < 5) {
            await sleep(500);
            let res = await this.send64([this.FEA_CMD_GET_MLEDBOOTCHECKSUM, totalBuff[0], totalBuff[1], totalBuff[2], totalBuff[3]], CheckSumType.BIT7, devicePath)
            if (res) {
                await sleep(10)
                const b = await readMsg(devicePath)
                if (b !== undefined && b[1] === 0x55) {
                    checks = b
                }
            }
            count++
        }
        return checks === undefined
    }

    //点阵屏24灯效切换
    getOledEffect = async (): Promise<LightSetting | undefined> => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_GET_OLEDEFFECT
        const buf = await this.commomFeature(b, 0)
        if (buf === undefined) return undefined
        const oledType = buf[1]
        const speed = buf[2]
        const brightness = buf[3]
        const option = buf[4]
        const option1 = option >> 4
        let rgb = rgbToNum(buf[5], buf[6], buf[7])

        const option2 = option & 0b1111

        const optionToRgb = (op: number) => {
            if (op === this.DAZZLE || op === this.NORMAL) return
            const trgb = this.COMMONCOLOR[op]
            if (trgb !== undefined) rgb = trgb
        }
        const musicDazzle = option2 === 0 ? true : false
        const dazzle = option2 === this.DAZZLE ? true : false
        switch (oledType) {
            case 0:
                return {
                    type: 'LightOff',
                }
            case 1:
                return {
                    type: 'LightAlwaysOn',
                    value: brightness,
                    rgb: 0,
                }
            case 2:
                return {
                    type: 'LightBreath',
                    value: 0,
                    speed: speed,
                    rgb: 0,
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
            case 0x07:
                optionToRgb(option2)
                return {
                    type: 'LightSnake',
                    value: brightness,
                    speed: speed,
                    option: option1 === 0 ? 'z' : 'return',
                    rgb: rgb,
                    dazzle: dazzle
                }
            case 0x0B:
                optionToRgb(option2)
                return {
                    type: 'LightKaleidoscope',
                    option: option1 === 0 ? 'out' : 'in',
                    value: brightness,
                    speed: speed,
                    rgb: rgb,
                    dazzle: dazzle
                }
            case 0x11:
                optionToRgb(option2)
                return {
                    type: 'LightRainDown',
                    value: brightness,
                    speed: speed,
                    rgb: rgb,
                    dazzle: dazzle
                }
            case 0x12:
                optionToRgb(option2)
                return {
                    type: 'LightMeteor',
                    value: brightness,
                    speed: speed,
                    rgb: rgb,
                    dazzle: dazzle
                }
            case 0x14:
                const op = valueForKey(this.MP, option1)
                return {
                    type: 'LightMusicFollow3',
                    value: brightness,
                    option: op === undefined ? 'upright' : op,
                    rgb: rgbToNum(buf[5], buf[6], buf[7]),
                    dazzle: musicDazzle
                }
            case 0x15:
                return {
                    type: 'LightScreenColor',
                    value: 4,
                }
            case 0x16:
                const op2 = valueForKey(this.MP, option1)
                return {
                    type: 'LightMusicFollow2',
                    option: op2 === undefined ? 'upright' : op2,
                    value: brightness,
                    rgb: rgbToNum(buf[5], buf[6], buf[7]),
                    dazzle: musicDazzle
                }
            case 0x40:
                return {
                    type: 'LedClock',
                }
            case 0x41:
                return {
                    type: 'LedCpu',
                }
            case 0x42:
                return {
                    type: 'USER',
                }
            case 0x43:
                return {
                    type: 'WRITEWORD',
                }
            default:
                return undefined
        }
    }

    setOledEffect = async (setScreen: LightSetting) => {
        const b = Buffer.alloc(64)
        b[0] = this.FEA_CMD_SET_OLEDEFFECT
        let effect: number = 0
        let speed: number = 0
        let brightness: number = 0
        let option: number = 8
        let dazzle = setScreen.dazzle
        const musicKey = dazzle ? 0 : 4
        const n = dazzle ? this.DAZZLE : this.NORMAL
        switch (setScreen.type) {
            case 'LightOff':
                effect = 0x00
                break
            case 'LightAlwaysOn':
                effect = 0x01
                brightness = setScreen.value
                break
            case 'LightBreath':
                effect = 0x02
                speed = setScreen.speed
                brightness = setScreen.value
                break
            case 'LightNeon':
                effect = 0x03
                speed = setScreen.speed
                brightness = setScreen.value
                break
            case 'LightWave':
                effect = 0x04
                speed = setScreen.speed
                brightness = setScreen.value
                break
            case 'LightSnake':
                effect = 0x07
                speed = setScreen.speed
                brightness = setScreen.value
                break
            case 'LightKaleidoscope':
                effect = 0x0B
                speed = setScreen.speed
                brightness = setScreen.value
                break
            case 'LightRainDown':
                effect = 0x11
                speed = setScreen.speed
                brightness = setScreen.value
                option = n
                break
            case 'LightMeteor':
                effect = 0x12
                speed = setScreen.speed
                brightness = setScreen.value
                option = n
                break
            case 'LightMusicFollow3':
                b[0] = this.FEA_CMD_SET_LEDPARAM
                effect = 0x14
                brightness = setScreen.value
                break
            case 'LightScreenColor':
                b[0] = this.FEA_CMD_SET_LEDPARAM
                effect = 0x15
                brightness = 4
                break
            case 'LightMusicFollow2':
                b[0] = this.FEA_CMD_SET_LEDPARAM
                effect = 0x16
                brightness = setScreen.value
                break
            case 'LedClock':
                effect = 0x40
                break
            case 'LedCpu':
                effect = 0x41
            case 'USER':
                effect = 0x42
                break
            case 'WRITEWORD':
                effect = 0x43
                break
            default:
                break
        }

        b[1] = effect
        b[2] = 4 - speed
        b[3] = brightness

        if ('rgb' in setScreen && setScreen.rgb !== undefined) {
            let rgbTemp = setScreen.rgb
            if (rgbTemp === 0xffffff) rgbTemp = 0xfafffa
            const rgb = numToRgb(rgbTemp)
            b[5] = rgb.r
            b[6] = rgb.g
            b[7] = rgb.b
        }

        const buf = await this.writeFeatureCmd(b, 1, 500)


        if (!buf) return false
        await sleep(500)
        return true
    }

}

const mouseKeyTable: { [key in number]: Array<number> } = {
    [MouseKey.Left]: [0x01, 0x00, 0xf0, 0x00],
    [MouseKey.Right]: [0x01, 0x00, 0xf1, 0x00],
    [MouseKey.Middle]: [0x01, 0x00, 0xf2, 0x00],
    [MouseKey.Forward]: [0x01, 0x00, 0xf4, 0x00],
    [MouseKey.Back]: [0x01, 0x00, 0xf3, 0x00],
    [MouseKey.WheelLeft]: [0x01, 0x00, 0xf5, 0x00],
    [MouseKey.WheelRight]: [0x01, 0x00, 0xf6, 0x00],
    [MouseKey.WheelForward]: [0x01, 0x00, 0xf7, 0x00],
    [MouseKey.WheelBack]: [0x01, 0x00, 0xf8, 0x00],
    [MouseKey.Dpi]: [],
    [MouseKey.Key_1]: [],
    [MouseKey.Key_2]: [],
    [MouseKey.SCROLLUP]: [0x01, 0x00, 0xf5, 0x01],
    [MouseKey.SCROLLDOWN]: [0x01, 0x00, 0xf5, 0xff],
    [MouseKey.XUP]: [0x01, 0x00, 0xf6, 0xfb],
    [MouseKey.XDOWN]: [0x01, 0x00, 0xf6, 0x05],
    [MouseKey.YUP]: [0x01, 0x00, 0xf7, 0xfb],
    [MouseKey.YDOWN]: [0x01, 0x00, 0xf7, 0x05],
}

const skeyToHidTable: { [key in SpecialKey]: number } = {
    none: 0x00,
    alt: 226,
    ctrl: 224,
    shift: 0xe1,
    win: 227,
}