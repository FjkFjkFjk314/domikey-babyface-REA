import { action, observable } from 'mobx'
import { BaseStore } from './baseStore'
import { mobxStore } from './store'
import { res } from '../res'
import { ReturnImageMSG, webImageService } from '../sdk/WebImageService'
import * as path from 'path'
import * as fs from 'fs'
import { equals } from 'ramda'
import { sdk } from '../sdk'
import { store } from '../UI/store'
import { CImage } from '../sdk/DB/entity/cimage'
import zlib from "zlib"

export class ShareImageStore extends BaseStore {
    constructor() {
        super()
        // setTimeout(() => {
        //     when(() => mobxStore.pageStore.pageIndex === this.macrosPage, () => {
        //         this.autoRefresh()
        //     })
        //     reaction(() => mobxStore.deviceStore.currentDev, v => {
        //         this.autoRefresh()
        //     })
        // }, 100)

    }
    @observable currentShareImgListType: 'png' = 'png'
    @observable imagePageType: webImageService.ImgItemTab = 'hot'
    @observable imageShareList: webImageService.ImageShare[] = []
    @observable imagePageIndex: number = 1
    @observable imagePageCount = 1

    @observable imageIsReport: boolean = false
    @observable imageReportIndex: number | undefined
    @observable imageIsShare: boolean = false
    @observable isGIF: boolean = false
    //自定义动画
    @observable lightImgPageType: webImageService.ImgItemTab = 'hot'
    @observable isLightImgShare: boolean = false
    @observable lightImgIsReport: boolean = false
    @observable lightImgReportIndex: number | undefined

    @observable lightImgShareList: webImageService.ImageShare[] = []
    @observable lightImgPageIndex: number = 1
    @observable lightImgPageCount = 1
    @action.bound
    setIsLightImgShare(bool: boolean) {
        mobxStore.isKeyStore.setPopUpKey(bool)
        this.isLightImgShare = bool
    }
    @action.bound
    setIightImgIsReport(bool: boolean) {
        mobxStore.isKeyStore.setPopUpKey(bool)
        this.lightImgIsReport = bool
    }
    @action.bound
    setIightImgReportIndex(bool: number | undefined) {
        this.lightImgReportIndex = bool
    }
    //自定义动画
    @action.bound
    async getImgShareList(tab: webImageService.ImgItemTab, page: number, screen_type?: string, light?: boolean) {
        if (tab === 'like' || tab === 'arts') {
            if (mobxStore.userStore.user === undefined) {
                mobxStore.toastStore.setInfo(res.text.请登录后尝试())
                return
            }
        }
        console.log('图片刷新刷新刷新!!!!!!!!')

        mobxStore.toastStore.setState('bussy', 'getSharedImageList')
        const v = await webImageService.getSharedImageList(tab, page, screen_type)
        if (v.errCode !== 0) {
            if (v.errMsg === 'session err') {
                mobxStore.toastStore.setInfo(res.text.请登录后尝试())
                await sdk.ioFunc
                    .userLogout()
                    .then((data) => {
                        if (data.errCode === 0)
                            store.setState.user_Name('')
                    })
            }
            console.log('-----getImgShareList', v.errMsg);
            mobxStore.toastStore.setState('idle', 'getSharedImageList')
            return
        }
        if (light) {//自定义动画分享
            this.lightImgPageIndex = page
            this.lightImgPageCount = v.data.totle_count
            this.lightImgPageType = tab
        } else {
            this.imagePageIndex = page
            this.imagePageCount = v.data.totle_count
            this.imagePageType = tab
        }


        // 下载图片
        const imageP = path.join(__dirname, '..', 'downImage')
        if (!fs.existsSync(imageP))
            fs.mkdirSync(imageP)
        const files = fs.readdirSync(imageP)
        for (let i = 0; i < v.data.data.length; i++) {
            const t = v.data.data[i]
            if (t.bit_image !== undefined && !files.some(fv => t.bit_image !== undefined && equals(fv, t.bit_image.md5)))
                await webImageService.downloadImage(t.bit_image.md5)
        }
        if (light) {
            this.lightImgShareList = [...v.data.data]
        } else {
            this.imageShareList = [...v.data.data]
        }
        mobxStore.toastStore.setState('idle', 'getSharedImageList')

        // this.doAsync(webImageService.getSharedImageList, async v => {
        //     if (v.errCode !== 0) return

        //     this.imagePageIndex = page
        //     this.imagePageCount = v.data.totle_count
        //     this.imagePageType = tab
        //     // 下载图片
        //     const imageP = path.join(__dirname, '..', 'downImage')
        //     if (!fs.existsSync(imageP))
        //         fs.mkdirSync(imageP)
        //     const files = fs.readdirSync(imageP)
        //     for (let i = 0; i < v.data.data.length; i++) {
        //         const t = v.data.data[i]
        //         if (t.bit_image !== undefined && !files.some(fv => t.bit_image !== undefined && equals(fv, t.bit_image.md5)))
        //             await webImageService.downloadImage(t.bit_image.md5)
        //     }

        //     this.imageShareList = [...v.data.data]
        // }, tab, page)
    }


    @action.bound
    evaluateImage(bit_image_id: number, score: -1 | 0 | 1, light?: boolean) {
        if (mobxStore.userStore.user === undefined) {
            mobxStore.toastStore.setInfo(res.text.请登录后尝试())
            return
        }
        this.doAsync(webImageService.evaluateImage, async v => {
            if (v.errCode !== 0) return
            const ShareList = light ? this.lightImgShareList : this.imageShareList
            const pageCount = light ? this.lightImgPageCount : this.imagePageCount
            const pageType = light ? this.lightImgPageType : this.imagePageType
            const pageIndex = light ? this.lightImgPageIndex : this.imagePageIndex

            const index = ShareList.findIndex(v => v.bit_image.id === bit_image_id)
            if (index === -1) return
            const imageShare = ShareList[index]
            if (imageShare.my_score === 0 || imageShare.my_score === null) {
                if (score === -1) imageShare.dislike_count++
                if (score === 1) imageShare.like_count++
            }

            if (imageShare.my_score === 1) {
                imageShare.like_count--
                if (score === -1) imageShare.dislike_count++

                if (pageType === 'like')
                    ShareList.splice(index, 1)
            }

            if (imageShare.my_score === -1) {
                imageShare.dislike_count--
                if (score === 1) imageShare.like_count++
            }

            imageShare.my_score = score
            if (pageCount !== 1 && pageType === 'like') {
                if (ShareList.length !== 0) {
                    if (light) {
                        await this.getImgShareList(pageType, pageIndex, 'keyboard_gif', light)
                    } else {
                        await this.getImgShareList(pageType, pageIndex)
                    }

                }

                if (ShareList.length === 0 && pageIndex !== 1) {
                    if (light) {
                        await this.getImgShareList(pageType, pageIndex - 1, 'keyboard_gif', light)
                    } else {
                        await this.getImgShareList(pageType, pageIndex - 1)
                    }
                }
            }
        }, bit_image_id, score)
    }

    // @action.bound
    // async bitImage2Canvas(bit_image_id: number, add: boolean) {
    //     const imageShare = this.imageShareList.find(v => v.bit_image.id === bit_image_id)
    //     if (imageShare === undefined) return
    //     mobxStore.toastStore.setGIFState('bussy', 'file2Canvas')
    //     const p = path.join(__dirname, '..', 'downImage', imageShare.bit_image.md5)
    //     if (imageShare.bit_image.screen_type === 'PNG') {
    //         let img: Jimp | undefined
    //         try {
    //             img = await Jimp.read(p)
    //         } catch (e) {
    //             console.error("eeee: ", e);
    //             mobxStore.toastStore.setInfo(res.text.不支持该图片格式());
    //             mobxStore.toastStore.setGIFState('idle', 'file2Canvas')
    //             return
    //         }
    //         if (img === undefined) return
    //         await mobxStore.drawStore.img2DrawArr(img)
    //         // mobxStore.drawStore.currentDrawArr = fs.readFileSync(p)

    //         mobxStore.drawStore.saveCurrentDrawArr()
    //     } else {
    //         const inputGif = await GifUtil.read(p)
    //         if (inputGif.frames[0].delayCentisecs * 10 > 255)
    //             mobxStore.drawStore.setFrameDelay(255)
    //         else
    //             mobxStore.drawStore.setFrameDelay(inputGif.frames[0].delayCentisecs * 10)
    //         mobxStore.drawStore.setSeletIndex(0)
    //         await mobxStore.drawStore.gifCut2AllDrawArr(inputGif)
    //     }

    //     if (add) {
    //         imageShare.bit_image.download_times++
    //         this.downBitImageIdArr.push(bit_image_id)
    //     }
    //     mobxStore.toastStore.setGIFState('idle', 'file2Canvas')
    // }
    //灯效编辑直通灯效编辑
    @action.bound
    async addBitLightDownloadTime(image: webImageService.ImageShare, currentMaxtrx: number[]) {
        if (mobxStore.userStore.user === undefined) {
            mobxStore.toastStore.setInfo(res.text.请登录后尝试())
            return
        }
        // const md5_buf = fs.readFileSync(path.join(__dirname, '..', 'downImage', image.bit_image.md5))

        this.doAsync(webImageService.addBitImageDownloadTime, async v => {
            if (v.errCode !== 0) return

            const index = this.lightImgShareList.findIndex(v => v.bit_image.id === image.bit_image.id)

            if (index === -1) return
            this.lightImgShareList[index].bit_image.download_times++
            const p = path.join(__dirname, "..", "downImage", image.bit_image.md5)
            const b = fs.readFileSync(p)
            // toastStore.setGIFState('bussy', 'fileGif')
            await mobxStore.userGifStore.keyboardGIF2frames(image.bit_image.width, b, currentMaxtrx)
            // this.shareLocalImage(zlib.deflateRawSync(md5_buf), image.bit_image.screen_type.toLocaleLowerCase() === 'gif' ? 'gif' : 'png', image.bit_image.title)
            mobxStore.toastStore.setInfo(res.text.下载成功请返回灯效编辑查看())
        }, image.bit_image.id)
    }
    @action.bound
    async addBitLightImgDownloadTime(image: webImageService.ImageShare, currentMaxtrx: number[]) {
        if (mobxStore.userStore.user === undefined) {
            mobxStore.toastStore.setInfo(res.text.请登录后尝试())
            return
        }

        const md5_buf = fs.readFileSync(path.join(__dirname, '..', 'downImage', image.bit_image.md5))
        this.getLocalImageList()
        if (this.localLightImgList.some(v => v.data !== undefined && equals(zlib.inflateRawSync(v.data), md5_buf))) {
            let id = this.localLightImgList[this.localLightImgList.findIndex(v => v.data !== undefined && equals(zlib.inflateRawSync(v.data), md5_buf))].id
            if (id !== undefined) {
                this.setLocalImageName(id, image.bit_image.title)
            }

            mobxStore.toastStore.setInfo(res.text.我的作品已存在())
            return
        }

        this.doAsync(webImageService.addBitImageDownloadTime, async v => {
            if (v.errCode !== 0) return

            const index = this.lightImgShareList.findIndex(v => v.bit_image.id === image.bit_image.id)

            if (index === -1) return
            // if (this.localLightImgList.some(v => v.data !== undefined && equals(zlib.inflateRawSync(v.data), md5_buf))) {
            //     mobxStore.toastStore.setInfo(res.text.我的作品已存在())
            // } else {

            this.lightImgShareList[index].bit_image.download_times++
            this.shareLocalImage(zlib.deflateRawSync(md5_buf), 'keyboard_gif', image.bit_image.title)

            mobxStore.toastStore.setInfo(res.text.下载成功请返回我的作品查看())
            // }
        }, image.bit_image.id)
    }

    @action.bound
    async LightImgUploadTime(image: webImageService.ImageShare, currentMaxtrx: number[], isup: boolean) {
        // if (mobxStore.userStore.user === undefined) {
        //     mobxStore.toastStore.setInfo(res.text.请登录后尝试())
        //     return
        // }
        // const md5_buf = fs.readFileSync(path.join(__dirname, '..', 'downImage', image.bit_image.md5))

        // this.doAsync(webImageService.addBitImageDownloadTime, async v => {
        //     if (v.errCode !== 0) return

        const index = this.lightImgShareList.findIndex(v => v.bit_image.id === image.bit_image.id)

        if (index === -1) return
        // this.lightImgShareList[index].bit_image.download_times++
        const p = path.join(__dirname, "..", "downImage", image.bit_image.md5)
        const b = fs.readFileSync(p)
        // toastStore.setGIFState('bussy', 'fileGif')
        await mobxStore.userGifStore.keyboardGIF2frames(image.bit_image.width, b, currentMaxtrx, isup)
        // this.shareLocalImage(zlib.deflateRawSync(md5_buf), image.bit_image.screen_type.toLocaleLowerCase() === 'gif' ? 'gif' : 'png', image.bit_image.title)
        // }, image.bit_image.id)
    }
    //end灯效编辑
    @action.bound
    async addBitImageDownloadTime(image: webImageService.ImageShare) {
        if (mobxStore.userStore.user === undefined) {
            mobxStore.toastStore.setInfo(res.text.请登录后尝试())
            return
        }
        const md5_buf = fs.readFileSync(path.join(__dirname, '..', 'downImage', image.bit_image.md5))
        this.getLocalImageList()
        if (this.localImageList.some(v => v.data !== undefined && equals(zlib.inflateRawSync(v.data), md5_buf))) {
            let id = this.localImageList[this.localImageList.findIndex(v => v.data !== undefined && equals(zlib.inflateRawSync(v.data), md5_buf))].id
            if (id !== undefined) {
                this.setLocalImageName(id, image.bit_image.title)
            }
            mobxStore.toastStore.setInfo(res.text.我的作品已存在())
            return
        }
        this.doAsync(webImageService.addBitImageDownloadTime, async v => {
            if (v.errCode !== 0) return

            const index = this.imageShareList.findIndex(v => v.bit_image.id === image.bit_image.id)
            if (index === -1) return
            // if (this.localImageList.some(v => v.data !== undefined && equals(zlib.inflateRawSync(v.data), md5_buf))) {
            //     mobxStore.toastStore.setInfo(res.text.我的作品已存在())
            // } else {
            this.imageShareList[index].bit_image.download_times++
            this.shareLocalImage(zlib.deflateRawSync(md5_buf), image.bit_image.screen_type.toLocaleLowerCase() === 'gif' ? 'gif' : 'png', image.bit_image.title)
            console.error('addBitImageDownloadTime', this.imageShareList[index].bit_image.download_times);
            mobxStore.toastStore.setInfo(res.text.下载成功请返回我的作品查看())
            // }

        }, image.bit_image.id)
    }

    @action.bound
    deleteBitImage(bit_image_id: number, light?: boolean) {
        if (mobxStore.userStore.user === undefined) {
            mobxStore.toastStore.setInfo(res.text.请登录后尝试())
            return
        }
        const ShareList = light ? this.lightImgShareList : this.imageShareList
        const pageCount = light ? this.lightImgPageCount : this.imagePageCount
        const pageType = light ? this.lightImgPageType : this.imagePageType
        const pageIndex = light ? this.lightImgPageIndex : this.imagePageIndex
        this.doAsync(webImageService.deleteBitImage, async v => {
            if (v.errCode !== 0) return
            const index = ShareList.findIndex(v => v.bit_image.id === bit_image_id)
            if (index !== -1) ShareList.splice(index, 1)

            if (pageCount !== 1 && pageType === 'arts') {
                if (ShareList.length !== 0) {
                    if (light) {
                        await this.getImgShareList(pageType, pageIndex, 'keyboard_gif', light)
                    } else {
                        await this.getImgShareList(pageType, pageIndex)
                    }

                }

                if (ShareList.length === 0 && pageIndex !== 1) {
                    if (light) {
                        await this.getImgShareList(pageType, pageIndex - 1, 'keyboard_gif', light)
                    } else {
                        await this.getImgShareList(pageType, pageIndex - 1)
                    }
                }
            }
        }, bit_image_id)
    }

    @action.bound
    reportBitImage(
        bit_image_id: number,
        type: string,
        description: string
    ) {
        if (mobxStore.userStore.user === undefined) {
            mobxStore.toastStore.setInfo(res.text.请登录后尝试())
            return
        }
        this.doAsync(webImageService.reportBitImage, v => {
            if (v.errCode !== 0) return
            mobxStore.toastStore.setInfo(res.text.举报成功())
        }, bit_image_id, type, description)
    }

    @action.bound
    shareBitImage(
        title: string,
        description: string,
        width: number,
        height: number,
        screen_type: string,
        image: Buffer
    ) {
        if (mobxStore.userStore.user === undefined) {
            mobxStore.toastStore.setInfo(res.text.请登录后尝试())
            return
        }
        this.doAsync(webImageService.shareBitImage, v => {
            if (v.errCode !== 0) return
            mobxStore.toastStore.setInfo(res.text.分享成功())
        }, title, description, width, height, screen_type, image)
    }

    @action.bound
    setImageIsReport(bool: boolean) {
        mobxStore.isKeyStore.setPopUpKey(bool)
        this.imageIsReport = bool
    }

    @action.bound
    setImageReportIndex(index: number | undefined) {
        this.imageReportIndex = index
    }

    @action.bound
    setImageIsShare(bool: boolean) {
        mobxStore.isKeyStore.setPopUpKey(bool)
        this.imageIsShare = bool
    }

    @action.bound
    setImageIsGIF(bool: boolean) {
        this.isGIF = bool
    }


    @observable localImageList = new Array<CImage>()
    @observable localLightImgList = new Array<CImage>()

    @action.bound
    getLocalImageList() {
        this.doAsync(webImageService.getLocalImageList, async v => {
            if (v) {
                this.localImageList = []
                this.localLightImgList = []
                mobxStore.toastStore.setGIFState('bussy', 'file2')
                for (let i = 0; i < v.length; i++) {
                    if (v[i].screen_type === 'keyboard_gif') {
                        this.localLightImgList.push(v[i])
                    } else {
                        this.localImageList.push(v[i])
                    }

                }
                mobxStore.toastStore.setGIFState('idle', 'file2')
            }
            // if (v)
            //     this.localImageList = [...v]
        })
    }

    @action.bound
    shareLocalImage(data: Buffer, type: 'png' | 'gif' | 'keyboard_gif', title: string) {
        this.doAsync(webImageService.shareLocalImage, v => {
            if (v) {
                if (v.screen_type === 'keyboard_gif') {
                    this.localLightImgList.push(v)
                } else {
                    this.localImageList.push(v)
                }
            }
            // this.localImageList.push(v)`11
        }, data, type, title)
    }

    @action.bound
    deleteLocalImage(id: number, type?: 'keyboard_gif') {
        this.doAsync(webImageService.deleteLocalImage, v => {
            if (!v) return
            if (type === 'keyboard_gif') {
                const index = this.localLightImgList.findIndex(lv => lv.id === id)
                this.localLightImgList.splice(index, 1)
            } else {
                const index = this.localImageList.findIndex(lv => lv.id === id)
                this.localImageList.splice(index, 1)
            }

        }, id)
    }

    @action.bound
    setLocalImageName(id: number, title: string, type?: 'keyboard_gif') {
        this.doAsync(webImageService.setLocalImageName, v => {

            if (!v) return

            if (type === 'keyboard_gif') {
                const i = this.localLightImgList.findIndex(v => v.id === id)
                if (i !== -1)
                    this.localLightImgList[i].title = title
            } else {
                const i = this.localImageList.findIndex(v => v.id === id)
                console.log('ssssssss', id, title, i);

                if (i !== -1)
                    this.localImageList[i].title = title
            }

        }, id, title)
    }

    // end我的作品灯效编辑
    commonHandleErr = (err: any) => {
        mobxStore.toastStore.setErr(err)
    }
    commonHandleSuccess = async (v: any) => {
        const ret = v as ReturnImageMSG
        if (ret.errCode === 0) return

        if (ret.response !== undefined) {
            if (ret.response.status === 400 && ret.response.statusText === "Bad Request") {
                mobxStore.toastStore.setErr(res.text.请求过于频繁请稍候重试())
                return
            }
        }

        switch (ret.errMsg) {
            case '网络连接失败':
                mobxStore.toastStore.setErr(res.text.网络连接失败())
                break;
            case 'session错误':
                mobxStore.toastStore.setInfo(res.text.请登录后尝试())
                if (mobxStore.macroStore.currentSelectMacro?.user?.id == mobxStore.userStore.user?.id) mobxStore.macroStore.setCurrentRecMacroArr([]);
                await sdk.ioFunc
                    .userLogout()
                    .then((data) => {
                        if (data.errCode === 0)
                            store.setState.user_Name('')
                    })
                break;
            case 'remote auth err':
                mobxStore.toastStore.setInfo(res.text.请登录后尝试())
                if (mobxStore.macroStore.currentSelectMacro?.user?.id == mobxStore.userStore.user?.id) mobxStore.macroStore.setCurrentRecMacroArr([]);
                await sdk.ioFunc
                    .userLogout()
                    .then((data) => {
                        if (data.errCode === 0)
                            store.setState.user_Name('')
                    })
                break;
            case 'session err':
                mobxStore.toastStore.setInfo(res.text.请登录后尝试())
                if (mobxStore.macroStore.currentSelectMacro?.user?.id == mobxStore.userStore.user?.id) mobxStore.macroStore.setCurrentRecMacroArr([]);
                await sdk.ioFunc
                    .userLogout()
                    .then((data) => {
                        if (data.errCode === 0)
                            store.setState.user_Name('')
                    })
                break;
            default:
                mobxStore.toastStore.setInfo(ret.errMsg)
                break;
        }
    }
}
