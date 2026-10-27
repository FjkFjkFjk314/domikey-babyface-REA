import { remote } from 'electron'
import { observable, action, computed } from 'mobx'
import { ReturnUpgradeMSG, server_path, webUpgradeService } from '../sdk/WebUpgradeService'
import { kAppVersion, kSDKVersion } from '../appConfig'
import { res } from '../res'
import { DeviceType } from '../sdk/DB'
import { BaseStore } from './baseStore'
import { mobxStore } from './store'
import { devlistList, findSupportDevice, HIDAttachSwich, removeUSBDetect } from '../sdk/DriverIO/usb/DetectSupportDevice'
import { store } from '../UI/store'
import { sleep } from '../unitys/timeFunc'

let timer: NodeJS.Timeout | undefined
export class UpgradeStore extends BaseStore {
    constructor() {
        super()
        //autorun(() => console.log('nnnnneeeeeddddd', this.upgradeProgressApp))
    }

    @observable
    appNeedUpgrade = false
    @observable
    appVersion: webUpgradeService.AppType | undefined
    @observable
    devNeedUpgrade = false
    @observable
    fwVersion: webUpgradeService.FwType | undefined
    @observable
    iotNeedUpgrade = false
    @observable
    iotVersion: webUpgradeService.IotType | undefined
    @observable
    oledNeedUpgrade = false
    @observable
    mledNeedUpgrade = false
    @observable
    upgradeProgressDev = 1

    @observable
    upgradeProgressApp = 1

    @observable
    count = 3

    @action.bound
    startCountDwon() {
        this.count = 3
        this.stopCountDwon()
        timer = setInterval(() => {
            if (this.count <= 0) this.stopCountDwon()
            this.count--
        }, 1000)
    }

    @action.bound
    stopCountDwon() {
        if (timer) clearInterval(timer)
    }
    @action.bound
    setUpgradeProgressDev(p: number) {
        this.upgradeProgressDev = p
    }
    @action.bound
    setUpgradeProgressApp(p: number) {
        this.upgradeProgressApp = p
    }
    @action.bound
    setAppNeedUpgrade = (t: boolean) => {
        this.appNeedUpgrade = t
    }
    @action.bound
    setDevNeedUpgrade = (t: boolean) => {
        this.devNeedUpgrade = t
    }
    @action.bound
    setIotNeedUpgrade = (t: boolean) => {
        this.iotNeedUpgrade = t
    }
    @action.bound
    setOledNeedUpgrade = (t: boolean) => {
        this.oledNeedUpgrade = t
    }
    @action.bound
    setMledNeedUpgrade = (t: boolean) => {
        this.mledNeedUpgrade = t
    }
    @computed
    get appNeedUpgrade_() {
        return this.appNeedUpgrade
    }
    @computed
    get devNeedUpgrade_() {
        return this.devNeedUpgrade
    }

    reloadAPP() {
        mobxStore.toastStore.setInfo(res.text.驱动升级成功将自动重启())
        setTimeout(() => {
            remote.app.relaunch()
            remote.app.quit()
        }, 4000);
    }

    @action.bound
    async upgradeApp() {
        //console.log('@@@@@######$$$$$$')
        await this.checkAppVersion(true)
        await this.checkIotVersion(true)
        if ((this.appNeedUpgrade === false || this.appVersion === undefined)) {
            if (this.iotNeedUpgrade === false)
                mobxStore.toastStore.setInfo(res.text.驱动已经是最新版本无需更新())
            return
        }
        this.setUpgradeProgressApp(0)
        const progress = (v: number) => {
            let process = v
            if (this.iotNeedUpgrade && this.iotVersion !== undefined)
                process = v * 0.9
            this.setUpgradeProgressApp(process)
        }
        this.doAsync(webUpgradeService.downloadAppUpgradeFile, () => {
            if (this.iotNeedUpgrade && this.iotVersion !== undefined) {
                this.doAsync(webUpgradeService.downloadIotFile, () => {
                    this.setUpgradeProgressApp(1)
                    this.reloadAPP()
                }, this.iotVersion, process.platform === 'darwin' ? 'mac' : 'win')
            } else {
                this.reloadAPP()
            }

        }, this.appVersion.file_path, progress)
    }
    @action.bound
    async upgradeIot() {
        await this.checkIotVersion(true)
        this.setUpgradeProgressApp(0)

        if (!this.iotNeedUpgrade || this.iotVersion === undefined) return
        this.doAsync(webUpgradeService.downloadIotFile, () => {
            this.setUpgradeProgressApp(1)
            this.reloadAPP()
        }, this.iotVersion, process.platform === 'darwin' ? 'mac' : 'win')
    }
    @action.bound
    async upgradeDev(progressCallBack: (progress: number) => void) {
        if (this.fwVersion === undefined) return
        const progress = (v: number) => {
            progressCallBack(v)
        }
        if (mobxStore.deviceStore?.currentDev?.deviceType.id === undefined) return
        // iot / fw ==> buf =>> zlib.deflateRawSync(buf)
        const buf = await webUpgradeService.downloadDevUpgradeFile(this.fwVersion.file_path)
        console.log('upgradeDev', buf);
        if (buf === undefined || mobxStore.deviceStore.currentDev === undefined) return
        const res = await mobxStore.deviceStore.currentDev.upgrade(buf, progress)
        if (res) {
            mobxStore.deviceStore.getDevVersion()
            mobxStore.pageStore.setPageIndex(0)
            console.log(mobxStore.deviceStore.currentDevVersion === 'reading...', devlistList);
            if (mobxStore.deviceStore.currentDevVersion === 'reading...' && !this.oledNeedUpgrade) {
                mobxStore.deviceStore.deviceArr.length = 0
                console.log('sssssssssssss', mobxStore.deviceStore.deviceArr.length);
            }
        }
        this.setDevNeedUpgrade(false)
    }
    //屏幕升级
    // @action.bound
    // async upgradeOledDev(progressCallBack: (progress: number) => void) {
    //     //if (this.currentDev?.deviceType.upgradeFileName === undefined || this.currentDev?.deviceType.upgradeFileName === null) {
    //     if (this.fwVersion === undefined) return
    //     const progress = (v: number) => {
    //         progressCallBack(v)
    //     }
    //     if (mobxStore.deviceStore?.currentDev?.deviceType.id === undefined) return
    //     const buf = await webUpgradeService.downloadOledUpgradeFile(this.fwVersion.file_path)
    //     console.log('upgradeOledDev', buf);
    //     const dev = mobxStore.deviceStore.currentDev
    //     if (buf === undefined || dev === undefined) return
    //     if (dev.type !== 'keyboard') return
    //     const res = await dev.oledUpgrade(buf, progress)
    //     if (res) {
    //         mobxStore.pageStore.setPageIndex(0)
    //         await mobxStore.deviceStore.getOLEDVersion()
    //         HIDAttachSwich(true)
    //         mobxStore.deviceStore.reConnect()
    //         await mobxStore.deviceStore.getDevVersion()
    //         this.setOledNeedUpgrade(false)
    //     }
    // }

    @action.bound
    async upgradeDevTotal() {
        const dev = mobxStore.deviceStore.currentDev
        if (dev === undefined) return
        await this.checkFwVersion(true)
        if (
            (this.devNeedUpgrade === false && this.oledNeedUpgrade === false && !this.mledNeedUpgrade)
            || this.fwVersion === undefined) {
            //console.log('!!!!!!!!!',res.text.固件已经是最新版本无需更新())
            mobxStore.toastStore.setInfo(res.text.未查找到该固件())
            store.setState.devUpgradeOpen(false)
            this.stopCountDwon()
            return
        }
        let splitVersion = this.fwVersion.version_str.match(/[^_]+/ig)
        if (splitVersion === null || splitVersion.length === 0) return

        HIDAttachSwich(false)
        this.setUpgradeProgressDev(0)
        const progress = (v: number) => {
            this.setUpgradeProgressDev(v)
        }

        const upgrade_file = await webUpgradeService.downloadOledUpgradeFile(this.fwVersion)
        if (!this.devNeedUpgrade || upgrade_file.fw === undefined) {
            splitVersion.splice(0, 1)
        }
        if (!this.oledNeedUpgrade || upgrade_file.fwOled === undefined) {
            const index = splitVersion.findIndex(v => v.includes('oled'))
            if (index !== -1) splitVersion.splice(index, 1)
        }
        if (!this.mledNeedUpgrade || upgrade_file.fwMled === undefined) {
            const index = splitVersion.findIndex(v => v.includes('mled'))
            if (index !== -1) splitVersion.splice(index, 1)
        }

        const count = splitVersion.length
        for (let i = 0; i < splitVersion.length; i++) {
            const tmp = splitVersion[i]
            const t = tmp.match(/[^v]+/ig)
            if (t !== null && t.length === 1) {
                if (this.devNeedUpgrade && upgrade_file.fw !== undefined) {
                    await dev.upgrade(upgrade_file.fw, v => progress(v / count))
                    this.setDevNeedUpgrade(false)
                    HIDAttachSwich(false)
                }
            }
            if (tmp.includes('oled')) {
                if (this.oledNeedUpgrade && upgrade_file.fwOled !== undefined && dev.type === 'keyboard') {
                    await dev.oledUpgrade(upgrade_file.fwOled, v => progress(((1 / count) * i) + (v / count)))
                    this.setOledNeedUpgrade(false)
                }
            }
            if (tmp.includes('mled')) {
                if (this.mledNeedUpgrade && upgrade_file.fwMled !== undefined && dev.type === 'keyboard') {
                    await dev.mledUpgrade(upgrade_file.fwMled, v => progress(((1 / count) * i) + (v / count)))
                    this.setMledNeedUpgrade(false)
                }
            }
            progress((1 / count) * (i + 1))
        }
        HIDAttachSwich(true)
        progress(1)
        console.error("升级完成!!!!!!!!!!!!!!!!!!!!");
        HIDAttachSwich(false)
        await sleep(1000) // 避免识别太快进入救援模式页面
        removeUSBDetect(dev.deviceType.id!, dev.deviceType.devAddr.toString())
        HIDAttachSwich(true)
        await findSupportDevice()
        return

        // if (this.devNeedUpgrade && !this.oledNeedUpgrade) {
        //     await this.upgradeDev(progress)
        //     this.setUpgradeProgressDev(1)
        //     return
        // }

        // if (!this.devNeedUpgrade && this.oledNeedUpgrade) {
        //     await this.upgradeOledDev(progress)
        //     this.setUpgradeProgressDev(1)
        //     return
        // }

        // if (this.devNeedUpgrade && this.oledNeedUpgrade) {
        //     await this.upgradeDev(v => {
        //         this.setUpgradeProgressDev(v / 2)
        //     })

        //     HIDAttachSwich(false)
        //     this.setUpgradeProgressDev(0.5)
        //     await this.upgradeOledDev(v => {
        //         this.setUpgradeProgressDev(0.5 + (v / 2))
        //     })
        //     const dev = mobxStore.deviceStore.currentDev?.deviceType
        //     if (dev === undefined) {
        //         HIDAttachSwich(true)
        //         this.setUpgradeProgressDev(1)
        //         return
        //     }
        //     removeUSBDetect(Number(dev.id), dev.devAddr.toString())
        //     HIDAttachSwich(true)
        //     this.setUpgradeProgressDev(1)
        //     return
        // }

    }
    appVersionV1BiggerThanV2 = (v1: string, v2: string) => {
        const v1a = v1.split('.')
        const v2a = v2.split('.')

        if (v1a.length !== v2a.length || v1a.length < 3) {
            console.log('非法版本号')
            return false
        }
        console.error(v1, v2)
        const v1Nmuber = Number(v1a[0]) * 100000 + Number(v1a[1]) * 1000 + Number(v1a[2])
        const v2Nmuber = Number(v2a[0]) * 100000 + Number(v2a[1]) * 1000 + Number(v2a[2])
        console.log('v1:', v1Nmuber, '  v2:', v2Nmuber)
        return v1Nmuber > v2Nmuber

    }

    @action.bound
    getAppVersion() {
        return new Promise<webUpgradeService.AppType | undefined>(reslove => {
            this.doAsync(webUpgradeService.getAppVersion, v => {
                if (v.errCode !== 0) return reslove(undefined)
                return reslove(v.data)
            })
        })
    }

    @action.bound
    getFwVersion() {
        return new Promise<webUpgradeService.FwType | undefined>(reslove => {
            if (mobxStore.deviceStore.currentDev?.deviceType.id === undefined)
                return reslove(undefined)
            this.doAsync(webUpgradeService.getFwVersion, v => {
                if (v.errCode !== 0)
                    return reslove(undefined)
                return reslove(v.data)
            }, mobxStore.deviceStore.currentDev?.deviceType.id)
        })
    }

    @action.bound
    getIotVersion() {
        return new Promise<webUpgradeService.IotType | undefined>(reslove => {
            this.doAsync(webUpgradeService.getIotVersion, v => {
                if (v.errCode !== 0)
                    return reslove(undefined)
                return reslove(v.data)
            }, process.platform === 'darwin' ? 'mac' : 'win')
        })
    }

    setTips(str: string, warning: boolean = false) {
        if (!warning)
            mobxStore.toastStore.setInfo(str)
        else
            mobxStore.toastStore.setErr(str)
    }

    @action.bound
    async checkAppVersion(tip: boolean) {
        this.appVersion = undefined
        const appVersion = await this.getAppVersion()

        if (appVersion === undefined) return
        if (this.appVersionV1BiggerThanV2(appVersion.lowest_version_str, kAppVersion)) {
            if (tip)
                mobxStore.toastStore.setInfo(res.text.当前驱动版本过低请重新下载安装())
            this.setAppNeedUpgrade(false)
            this.appVersion = undefined
        } else {
            const bol = this.appVersionV1BiggerThanV2(appVersion.version_str, kAppVersion)
            this.setAppNeedUpgrade(bol)
            if (bol)
                this.appVersion = appVersion
        }
    }

    @action.bound
    async checkFwVersion(tip: boolean) {
        const deviceType = mobxStore.deviceStore.currentDev?.deviceType
        if (deviceType === undefined) return
        this.fwVersion = undefined
        const fwVersion = await this.getFwVersion()
        if (fwVersion === undefined) {
            this.setDevNeedUpgrade(false)
            this.setOledNeedUpgrade(false)
            this.setMledNeedUpgrade(false)
            if (tip && mobxStore.deviceStore.currentDev?.deviceType.displayName === 'help') {
                mobxStore.toastStore.setInfo(res.text.未查找到该固件())
            } else if (tip) {
                mobxStore.toastStore.setInfo(res.text.固件已经是最新版本无需更新())
            }
            console.log('该设备不在服务器中')
            return
        }
        let splitVersion = fwVersion.version_str.match(/[^_]+/ig)//带屏幕的
        let fwv: number | undefined
        let oledv: number | undefined
        let mledv: number | undefined
        if (splitVersion !== null) {
            for (let i = 0; i < splitVersion.length; i++) {
                let v = splitVersion[i]
                if (i === 0) fwv = this.fwVersionToNum(v, 'fw')
                if (v.includes('oled')) oledv = this.fwVersionToNum(v.slice(4, v.length), 'fw')
                if (v.includes('mled')) mledv = this.fwVersionToNum(v.slice(4, v.length), 'fw')
            }
        }
        console.log(oledv, 'fwVersion.version_str', fwVersion.version_str);

        if (fwv === undefined && oledv === undefined) {
            this.setDevNeedUpgrade(false)
            console.log('该设备不在服务器中')
            return
        }
        let fwbol: boolean = false
        if (fwv !== undefined) {
            fwbol = !isNaN(Number(mobxStore.deviceStore.currentDevVersion)) && Number(mobxStore.deviceStore.currentDevVersion) !== fwv
            this.setDevNeedUpgrade(fwbol)
        } else {
            this.setDevNeedUpgrade(false)
        }

        let oledbol: boolean = false
        if (oledv === undefined) {
            this.setOledNeedUpgrade(false)
        } else {
            oledbol = !isNaN(Number(mobxStore.deviceStore.currentOledVersion))
                && Number(mobxStore.deviceStore.currentOledVersion) !== oledv
            console.log(oledbol, oledv, 'oledv-------:', mobxStore.deviceStore.currentOledVersion,)

            this.setOledNeedUpgrade(oledbol)
        }

        let mledbol: boolean = false
        if (mledv !== undefined) {
            mledbol = !isNaN(Number(deviceType.mledVersion)) && deviceType.mledVersion !== mledv.toString(16)
            this.setMledNeedUpgrade(mledbol)
        } else {
            this.setMledNeedUpgrade(false)
        }

        if (fwbol || oledbol || mledbol) this.fwVersion = fwVersion


        if (this.appVersionV1BiggerThanV2(fwVersion.lowest_app_version_str, kAppVersion)) {
            this.setDevNeedUpgrade(false)
            this.setOledNeedUpgrade(false)
            this.setMledNeedUpgrade(false)
            this.fwVersion = undefined
            if (tip)
                mobxStore.toastStore.setErr(res.text.当前驱动版本过低已无法适配最新固件请更新驱动())
            return
        }

        if (mobxStore.deviceStore.currentDev === undefined)
            return

        // mobxStore.deviceStore.currentDev.deviceType.severVersion = fwVersion.version_str.toString()
        if (fwv !== undefined) {
            mobxStore.deviceStore.currentDev.deviceType.severVersion = fwv.toString()
        }
        if (oledv != undefined) {
            mobxStore.deviceStore.severOledVersion = oledv.toString()
        }


        DeviceType.find().then(v1 => {
            //console.log(this.devNeedUpgrade)
            v1.forEach(vv => {
                if (fwv !== undefined) {
                    vv.severVersion = fwv.toString()
                }
            })
            if (!this.devNeedUpgrade) {
                //mobxStore.toastStore.setInfo('已经是最新版本,无需更新')
            }
            // if (!this.oledNeedUpgrade && oledv != undefined) {
            //     mobxStore.toastStore.setInfo('屏幕已经是最新版本,无需更新')
            // }

        })
    }

    @action.bound
    async checkIotVersion(tip: boolean) {
        this.iotVersion = undefined
        const iotVersion = await this.getIotVersion()
        if (iotVersion === undefined && this.appVersion === undefined) {
            if (tip)
                mobxStore.toastStore.setInfo(res.text.驱动已经是最新版本无需更新())
            return
        }
        if (iotVersion === undefined) return
        const v1 = this.fwVersionToNum(kSDKVersion, 'iot')
        const v2 = this.fwVersionToNum(iotVersion.iot_driver_version_str, 'iot')
        if (v1 === undefined || v2 === undefined) {
            if (tip)
                mobxStore.toastStore.setInfo(res.text.驱动已经是最新版本无需更新())
            return
        }
        const bol = v1 < v2
        if (!bol && !this.appNeedUpgrade) {
            if (tip)
                mobxStore.toastStore.setInfo(res.text.驱动已经是最新版本无需更新())
            return
        }
        this.setIotNeedUpgrade(bol)
        if (bol) this.iotVersion = iotVersion
        console.error("BBBB: ", bol);

    }

    fwVersionToNum(version: string, type: 'fw' | 'iot') {
        if (version[0].toLocaleLowerCase() !== 'v') return undefined
        const str = version.slice(1, version.length)
        if (Number(str) === NaN) return undefined

        if (type === 'iot') return Number(str)

        return parseInt(str, 16)
    }

    commonHandleErr = (err: any) => {
        // mobxStore.toastStore.setErr(err)
        if (err.request !== undefined) {
            mobxStore.toastStore.setErr(res.text.网络连接失败())
        } else {
            mobxStore.toastStore.setErr(err)
        }
    }
    commonHandleSuccess = (v: any) => {
        if (v === undefined) return
        //if ('errCode' in v && v.errCode !== undefined) {
        const ret = v as ReturnUpgradeMSG
        if (ret.errCode !== 0 && ret.errMsg !== undefined) {
            if (ret.errMsg === 'Record not found'
                && (
                    ret.response?.config.url === server_path + '/get_fw_version'
                    || ret.response?.config.url === server_path + '/get_app_version'
                    || ret.response?.config.url === server_path + '/get_iot_version'
                )) return
            console.error('EERROORR -- > ', ret.errMsg.toString());

            mobxStore.toastStore.setErr(ret.errCode < 0 ? res.text.网络连接失败() : ret.errMsg.toString())

        }
        //}



    }
}
