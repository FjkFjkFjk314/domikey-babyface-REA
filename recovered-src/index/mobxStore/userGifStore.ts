import { Gif, GifFrame, GifUtil } from "gifwrap";
import Jimp from "jimp";
import { action, observable } from "mobx";
import { equals } from "ramda";
import { getImgAutoSize, layoutAddPicRGB, setJimpAuto } from "../sdk/DriverIO/DeviceAPI/imgApi";
import { defaultMatrix_Common } from "../sdk/DriverIO/DeviceAPI/CommonMatrix";
import { BaseStore } from "./baseStore";
import { mobxStore } from "./store";
import { res } from "../res";
import { rgb2Hex, rgbToNum } from "../unitys/rgbNum";
import { sleep } from "../unitys/timeFunc";
import { supportDev } from "../supportDev";
import { kCompany } from "../appConfig";
import * as path from 'path'
import zlib from 'zlib'

export const matrix2PicArr = (matrix: number[]) => {
    let picArr: UserPicItem[] = []

    for (let i = 0; i < matrix.length; i += 4) {
        const nArr4 = matrix.slice(i, i + 4)
        let hid = 0
        if (nArr4[0] === 0)
            hid = nArr4[2]
        else
            hid = nArr4[0] << 24 | nArr4[1] << 16 | nArr4[2] << 8 | nArr4[3]

        const findHid = picArr.filter(v => v.hid === hid)
        if (hid === undefined) {
            //wconsole.log('userpic hid 为0', hid, Math.floor(i / 3))
            continue
        }

        const tmp = {
            hid: hid,
            rgb: 0,
            // rgb: Math.round(Math.random() * 0xffffff),
            index: findHid.length === 0 ? undefined : findHid.length
        }

        picArr.push(tmp)
        // console.error(i / 4 + 1, tmp.hid, nArr4);
    }

    return picArr
}
const max = 255
export class UserGifStore extends BaseStore {

    constructor() {
        super();
        if (this.currentUserPic.length === 0 && this.userPicFrames.length === 0) {
            const arr = matrix2PicArr(defaultMatrix_Common)
            this.currentUserPic = [...arr]
            this.userPicFrames = [arr]
            this.delayArr = [50]
        }
    }
    @observable
    currentSelect: number = 0

    @observable
    currentUserPic: UserPicItem[] = []

    @observable
    userPicFrames: UserPicItem[][] = []

    @observable
    delayArr: number[] = []

    @observable
    upPicFrames: UserPicItem[][] = []

    @observable
    upDelayArr: number[] = []
    @observable
    frameDelay: number = 50
    @observable
    drawColor: number = 0xffffff
    @observable
    play: boolean = false
    @observable
    clickIcon: boolean = false
    @observable
    timer: NodeJS.Timeout | undefined
    @observable
    saveLight = Buffer.alloc(0)
    @observable
    lightPathBuf: Buffer | undefined
    @action.bound
    setLightPathBuf(p: Buffer | undefined) {
        this.lightPathBuf = p
    }
    @action.bound
    settimer(timer: NodeJS.Timeout | undefined) {
        this.timer = timer
    }
    @action.bound
    setDrawColor(drawColor: number) {
        this.drawColor = drawColor
    }
    @action.bound
    setFrameDelay = (index: number) => {
        this.frameDelay = index
    }
    @action.bound
    setplay = (key: boolean) => {
        this.play = key
    }
    @action.bound
    setClickIcon = (key: boolean) => {
        this.clickIcon = key
    }
    @observable
    initCurrentUserPic(matrix: number[]) {
        this.currentUserPic = matrix2PicArr(matrix)
        this.userPicFrames[this.currentSelect] = [...this.currentUserPic]
    }

    @action
    addUserPic(matrix: number[]) {
        // for (let i = 0; i < 254; i++) {
        //     const picArr = matrix2PicArr(matrix)
        //     this.userPicFrames.push(picArr)
        //     this.delayArr.push(50)
        // }
        if (this.userPicFrames.length >= max) {
            mobxStore.toastStore.setInfo(res.text.最大只能添加() + max + res.text.张图片());
            return
        }
        const num = this.currentSelect
        const picArr = matrix2PicArr(matrix)
        this.userPicFrames.splice(num + 1, 0, picArr)
        this.delayArr.splice(num + 1, 0, this.frameDelay)
        this.setCurrentSelect(num + 1)
    }

    @action
    reduceUserPic() {
        if (this.userPicFrames.length <= 1) {
            mobxStore.toastStore.setInfo(res.text.至少需要1张图())
            return;
        }
        this.userPicFrames.splice(this.currentSelect, 1)
        this.delayArr.splice(this.currentSelect, 1)
        if (this.currentSelect === this.userPicFrames.length) {
            this.currentSelect = this.userPicFrames.length - 1
        }
        this.currentUserPic = [...this.userPicFrames[this.currentSelect]]
    }

    @action
    reduceAllUserPic(matrix: number[]) {
        this.currentSelect = 0
        const arr = matrix2PicArr(matrix)
        this.currentUserPic = arr
        this.userPicFrames = [arr]
        this.delayArr = [50]
    }

    @action
    copyPreFrame() {
        let tmp: UserPicItem = { hid: 0, rgb: 0 }
        const i = this.currentSelect
        if (i !== 0) {
            this.userPicFrames[i] = []
            this.currentUserPic = []
            this.userPicFrames[i - 1].map(v => {
                tmp = Object.assign(tmp, v)
                this.userPicFrames[i].push(tmp)
                this.currentUserPic.push(tmp)
            })
        }
    }

    @action
    setCurrentSelect(num: number) {
        if (this.userPicFrames.length === 0) return
        this.userPicFrames[this.currentSelect] = [...this.currentUserPic]
        this.currentSelect = num
        this.currentUserPic = [...this.userPicFrames[num]]
    }

    @observable
    recordArr: UserPicItem[] = []

    @observable
    autoRecord: 'single' | 'all' | undefined

    @action
    setAutoRecord(bool: 'single' | 'all' | undefined) {
        this.autoRecord = bool
    }

    @action
    addRecordArrItem(pic: UserPicItem) {
        const index = this.recordArr.findIndex(v => equals(v.hid, pic.hid) && equals(v.index, pic.index))
        if (index !== -1) {
            this.recordArr[index].rgb = pic.rgb
        } else {
            this.recordArr.push(pic)
        }
    }

    @action
    autoReRecordArr(matrix: number[]) {
        if (this.autoRecord === undefined || this.recordArr.length === 0) return
        const len = this.recordArr.length + this.userPicFrames.length > max ? max - this.userPicFrames.length : this.recordArr.length

        const num = this.currentSelect
        const currentUserPic = [...this.userPicFrames[num]]
        let lastIndex = undefined;
        if (this.autoRecord === 'single') {
            for (let i = 0; i < this.recordArr.length; i++) {
                const pic = this.recordArr[i]
                const tmp = currentUserPic.find(v => equals(v.hid, pic.hid) && equals(v.index, pic.index))
                if (tmp !== undefined) tmp.rgb = 0
            }
            this.userPicFrames[num] = [...currentUserPic]

            const arr: UserPicItem[][] = []
            const delayArr: number[] = []

            for (let i = 0; i < len; i++) {
                const pic = this.recordArr[i]
                const picArr = matrix2PicArr(matrix)
                const tmp = picArr.find(v => equals(v.hid, pic.hid) && equals(v.index, pic.index))
                if (tmp !== undefined) tmp.rgb = pic.rgb
                arr.push([...picArr])
                delayArr.push(this.frameDelay)
            }

            this.userPicFrames = [...this.userPicFrames.splice(0, num + 1), ...arr, ...this.userPicFrames.splice(num + 1, this.userPicFrames.length)]
            this.delayArr = [...this.delayArr.splice(0, num + 1), ...delayArr, ...this.delayArr.splice(num + 1, this.userPicFrames.length)]
            lastIndex = num + len

        }

        if (this.autoRecord === 'all') {
            const arr: UserPicItem[][] = []
            const delayArr: number[] = []

            for (let i = 0; i < this.recordArr.length; i++) {
                const pic = this.recordArr[i]
                const tmp = currentUserPic.find(v => equals(v.hid, pic.hid) && equals(v.index, pic.index))
                if (tmp !== undefined) tmp.rgb = 0
            }

            // if (this.userPicFrames.length !== 1) {
            //     arr.push(currentUserPic)
            //     delayArr.push(this.frameDelay)
            // }

            for (let i = 0; i < len; i++) {
                const picArr = matrix2PicArr(matrix)
                picArr.map((v, i) => Object.assign(v, currentUserPic[i]))
                for (let j = 0; j < i + 1; j++) {
                    const pic = this.recordArr[j]
                    const tmp = picArr.find(v => equals(v.hid, pic.hid) && equals(v.index, pic.index))
                    if (tmp !== undefined) tmp.rgb = pic.rgb
                }
                arr.push([...picArr])
                delayArr.push(this.frameDelay)
            }
            // lastIndex = this.userPicFrames.length === 1 ? arr.length - 1 : this.currentSelect + arr.length - 1
            // this.userPicFrames = [...this.userPicFrames.slice(0, num), ...arr, ...this.userPicFrames.slice(num + 1, this.userPicFrames.length)]
            // this.delayArr = [...this.delayArr.slice(0, num), ...delayArr, ...this.delayArr.slice(num + 1, this.userPicFrames.length)]
            lastIndex = this.userPicFrames.length === 1 ? arr.length : this.currentSelect + arr.length
            this.userPicFrames = [...this.userPicFrames.slice(0, num + 1), ...arr, ...this.userPicFrames.slice(num + 2, this.userPicFrames.length)]
            this.delayArr = [...this.delayArr.slice(0, num + 1), ...delayArr, ...this.delayArr.slice(num + 2, this.userPicFrames.length)]
            this.currentUserPic = [...this.userPicFrames[num]]
        }

        if (lastIndex !== undefined) {
            this.remeberRecord = {
                num: lastIndex,
                arr: [...this.recordArr]
            }
            this.setCurrentSelect(lastIndex)
        }
        this.recordArr = new Array()
    }

    @observable
    remeberRecord: {
        num: number,
        arr: UserPicItem[]
    } | undefined

    @action
    revokeRecordAutoAdd(matrix: number[]) {
        if (this.remeberRecord === undefined) return
        const tmp = this.remeberRecord

        if (this.userPicFrames.length === 0) {
            this.currentSelect = 0
            this.initCurrentUserPic(matrix)
        } else if (tmp.arr.length > tmp.num) {
            this.setCurrentSelect(0)
            this.userPicFrames.splice(1, tmp.arr.length)
            this.delayArr.splice(1, tmp.arr.length)
        } else {
            if (this.userPicFrames.length - (tmp.num - tmp.arr.length) >= 0) {
                this.setCurrentSelect(tmp.num - tmp.arr.length)
                this.userPicFrames.splice(tmp.num - tmp.arr.length + 1, tmp.arr.length)
                this.delayArr.splice(tmp.num - tmp.arr.length + 1, tmp.arr.length)
            } else {

                this.setCurrentSelect(0)
                this.userPicFrames.splice(1, this.userPicFrames.length)
                this.delayArr.splice(1, this.userPicFrames.length)
            }
        }

        this.recordArr = new Array()
        this.remeberRecord = undefined
    }

    // 判断图片透明度
    checkTransparent = (lenna: Jimp) => {
        const cw = lenna.getWidth()
        const ch = lenna.getHeight()

        let j = 0;
        for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
                if (lenna.getPixelColor(x, y) === 0) {
                    j++
                }
            }
        }

        return j / (cw * ch)
    }
    @action
    async getLightGif(
        inputGif: Gif,
        size: { w: number, h: number },
        currentMaxtrx: number[],
        deviceName: string
    ) {
        const len = inputGif.frames.length > 255 ? 255 : inputGif.frames.length
        this.setCurrentSelect(0)
        this.userPicFrames = new Array()
        this.delayArr = new Array()
        this.userPicFrames = new Array(len)
        this.delayArr = new Array(len)
        let img = new Jimp(inputGif.width, inputGif.height)
        const s = getImgAutoSize(img, size.w, size.h)
        const f_transparency = inputGif.frames[0].getPalette().usesTransparency
        for (let i = 0; i < len; i++) {
            const v = inputGif.frames[i]
            let f = new Jimp(v.bitmap)
            const transparency = this.checkTransparent(f)
            if (!f_transparency) {
                // 处理视频转成的GIF
                img.resize(inputGif.width, inputGif.height)
            } else {
                if (v.bitmap.width === inputGif.width && v.bitmap.height === inputGif.height) {
                    img = new Jimp(inputGif.width, inputGif.height)
                } else {
                    if (i !== 0 && transparency >= 0.9) {
                        img.resize(inputGif.width, inputGif.height)
                    } else {
                        img = new Jimp(inputGif.width, inputGif.height)
                    }
                }
            }
            try {
                img.composite(f, v.xOffset, v.yOffset)
            } catch (e) {
                this.userPicFrames = [this.currentUserPic]
                this.delayArr = [50]
                return
            }
            let tmp = await Jimp.read(await img.getBufferAsync(Jimp.MIME_PNG))
            tmp = setJimpAuto(img, s.cw, s.ch, false, size.w, size.h);
            //待处理
            const picArr = await layoutAddPicRGB(matrix2PicArr(currentMaxtrx), tmp, deviceName)
            this.userPicFrames[i] = picArr
            this.delayArr[i] = v.delayCentisecs * 10 > 255 ? 255 : v.delayCentisecs * 10
            if (i === 0) this.currentUserPic = picArr
            if (i !== 0)
                this.setCurrentSelect(i)
            // loadStore.setLoadProgessNum(Math.ceil((i + 1) / len * 100))
        }
        let total = 0
        this.delayArr.map(v => total += v)
        this.setFrameDelay(Math.ceil(total / this.delayArr.length))
        this.setCurrentSelect(0)
    }

    @action
    async file2frames(
        f: File,
        size: { w: number, h: number },
        currentMaxtrx: number[],
        deviceName: string
    ) {
        if (f.type.includes('image/gif')) {
            let inputGif: Gif | undefined
            try {
                inputGif = await GifUtil.read(f.path)
            } catch (e: any) {
                if ((e as Error).message.indexOf('Invalid') !== -1) {
                    mobxStore.toastStore.setInfo(res.text.图片无效());
                } else if ((e as Error).message.indexOf('RangeError') !== -1) {
                    mobxStore.toastStore.setInfo(res.text.图片限制());
                } else {
                    mobxStore.toastStore.setInfo(res.text.无法完成请求());
                }
                console.error('eee1', e);
                mobxStore.toastStore.setGIFState('idle', 'fileGif')
                return
            }
            mobxStore.toastStore.setGIFState('bussy', 'fileGif')
            await this.getLightGif(inputGif, size, currentMaxtrx, deviceName)
            mobxStore.toastStore.setGIFState('idle', 'fileGif')
        } else {
            let img: Jimp | undefined
            mobxStore.toastStore.setGIFState('bussy', 'fileGif')
            try {
                img = await Jimp.read(f.path)
            } catch (e) {
                if ((e as Error).message.indexOf('Invalid') !== -1) {
                    mobxStore.toastStore.setInfo(res.text.图片无效());
                } else {
                    mobxStore.toastStore.setInfo(res.text.不支持该图片格式());
                }
                console.error("eeee2: ", e);
                mobxStore.toastStore.setGIFState('idle', 'fileGif')
                return
            }
            const s = getImgAutoSize(img, size.w, size.h)
            const lenna = setJimpAuto(img, s.cw, s.ch, false, size.w, size.h);
            //待处理
            await layoutAddPicRGB(this.currentUserPic, lenna, deviceName)
            mobxStore.toastStore.setGIFState('idle', 'fileGif')
        }
    }
    //下载到灯效编辑
    @action
    async keyboardGIF2frames(
        picDevId: number,
        buf: Buffer,
        currentMaxtrx: number[],
        isUp?: boolean
    ) {
        const inputGif = await GifUtil.read(buf)
        const frames = inputGif.frames
        const len = frames.length

        const picName = supportDev.find(v => v.id === picDevId)?.name
        if (picName === undefined) return
        const isLayoutExit = picName in res.键鼠坐标
        const picLayout = res.键鼠坐标[isLayoutExit ? picName : 'default'].layout
        const picxy = res.键鼠坐标[isLayoutExit ? picName : 'default'].delt
        if (isUp) {
            this.upPicFrames = new Array()
            this.upDelayArr = new Array()
            this.upPicFrames = new Array(len)
            this.upDelayArr = new Array(len)

        } else {
            this.setCurrentSelect(0)
            this.userPicFrames = new Array()
            this.delayArr = new Array()
            this.userPicFrames = new Array(len)
            this.delayArr = new Array(len)
        }


        for (let i = 0; i < len; i++) {
            const frame = frames[i]
            const img = new Jimp(frame.bitmap)
            const picArr = matrix2PicArr(currentMaxtrx)
            for (let i = 0; i < picLayout.length; i++) {
                const tmp = img.clone()
                const key = picLayout[i]
                if (key.knob) continue
                const tt = tmp.crop((picxy.deltX + key.x) / 10, (Math.abs(picxy.deltY - key.y)) / 10, key.w / 10, key.h / 10)
                const rgb = Jimp.intToRGBA(tt.getPixelColor(key.w / 10 / 2, key.h / 10 / 2))
                const pic = picArr.find(v => v.hid === key.value && v.index === key.index)
                if (pic !== undefined) {
                    pic.rgb = rgbToNum(rgb.r, rgb.g, rgb.b)
                }
            }
            if (isUp) {
                this.upPicFrames[i] = picArr
                this.upDelayArr[i] = frame.delayCentisecs * 10

            } else {
                this.userPicFrames[i] = picArr
                this.delayArr[i] = frame.delayCentisecs * 10
                if (i === 0) {
                    this.currentUserPic = picArr;
                }
                if (i !== 0) {
                    await sleep(1)
                    this.setCurrentSelect(i)
                }

            }

        }
        let total = 0
        if (isUp) {
            this.upDelayArr.map(v => total += v)

        } else {
            this.delayArr.map(v => total += v)
            this.setFrameDelay(Math.ceil(total / this.delayArr.length))
            this.setCurrentSelect(0)
        }

    }

    @action
    async shareKeyboardGIF(title: string, description: string, isSave?: boolean) {
        const dev = mobxStore.deviceStore.currentDev?.deviceType;
        if (dev === undefined) return
        if (dev.name === undefined || dev.id === undefined) return
        const isLayoutExit = dev.name in res.键鼠坐标
        const deviceLayout = res.键鼠坐标[isLayoutExit ? dev.name : 'default'].layout
        const devicexy = res.键鼠坐标[isLayoutExit ? dev.name : 'default'].delt
        const frames = new Array<GifFrame>()
        const arr = [...this.userPicFrames]
        const p = path.join(__dirname, '..', 'company', 'company_' + kCompany, 'dev', dev.name + '.png');
        for (let i = 0; i < arr.length; i++) {
            // let img = new Jimp(174, 58);
            const img = await Jimp.read(p)
            img.resize(87, 29)
            for (let x = 0; x < img.getWidth(); x++) {
                for (let y = 0; y < img.getHeight(); y++) {
                    const hid = deviceLayout.find(v => {
                        const minx = (devicexy.deltX + v.x) / 10
                        const maxx = (devicexy.deltX + v.x + v.w) / 10
                        const miny = (devicexy.deltY - v.y) / 10
                        const maxy = (devicexy.deltY - v.y + v.h) / 10
                        return x >= minx && x <= maxx && y >= miny && y <= maxy && !v.knob
                    })?.value
                    if (hid !== undefined) {
                        const rgb = arr[i].find(v => v.hid === hid)?.rgb
                        if (rgb !== undefined)
                            img.setPixelColor(Number(rgb2Hex(rgb)), x, y)
                    }
                }
            }
            const frame = new GifFrame(img.bitmap, { delayCentisecs: this.delayArr[i] / 10 })
            frame.xOffset = 0
            frame.yOffset = 0
            frames.push(frame)
        }
        GifUtil.quantizeDekker(frames, 256)
        let a = await GifUtil.write(path.join(__dirname, '..', 'test.gif'), frames)
        const buf = a.buffer;
        const deb = zlib.deflateRawSync(buf)
        if (isSave) {
            mobxStore.shareImageStore.shareLocalImage(deb, 'keyboard_gif', res.text.未命名())

        } else {
            let devIndex: number = supportDev.findIndex(v => v.id === dev.id)
            const devid = dev.id < 0 ?
                supportDev[devIndex + 1].displayName === supportDev[devIndex].displayName ?
                    supportDev[devIndex + 1].id : supportDev[devIndex - 1].id
                : dev.id
            mobxStore.shareImageStore.shareBitImage(title, description, devid, 0, "keyboard_gif", deb)
        }

    }
}