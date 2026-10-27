
import { action, observable, reaction, IReactionDisposer, } from 'mobx'
import { DBService, getCurrentUser } from '../sdk/WebService'
import { Config, DeviceType } from '../sdk/DB'
import { BaseStore } from './baseStore'
import { mobxStore } from './store'
import { res } from '../res'
import { sleep } from '../unitys/timeFunc'
import { KeyboardInterface } from '../sdk/DriverIO/DeviceAPI/KeyboardInterface'
import { equals } from 'ramda'
import { getMicrophoneMute, setLightType } from '../sdk/DriverIO/usb/client'
import { numToByte4, specialFunTablectionMap, specialFunTablectionArr } from '../res/映射'
import { devArr, devlistList, venderSubject } from '../sdk/DriverIO/usb/DetectSupportDevice'
import { supportYC500Dev } from '../supportYC500Dev'
import { findId } from '../UI/utils/changeLanguage'

const kLoadingMessage = 'reading...'
let timer: NodeJS.Timeout
let tempTimer: NodeJS.Timeout

let deviceListChangeSubjectTimer: NodeJS.Timeout
export class DeviceStore extends BaseStore {
    static lightNameMap: { [key: string]: string } = {
        'LightOff': res.text.关闭(),
        'LightAlwaysOn': res.text.常亮(),
        'LightBreath': res.text.呼吸(),
        'LightWave': res.text.光波(),
        'LightRipple': res.text.涟漪(),
        'LightRaindrop': res.text.雨滴(),
        'LightSnake': res.text.蛇形(),
        'LightPressAction': res.text.跟随(),
        'LightConverage': res.text.聚合(),
        'LightNeon': res.text.霓虹(),
        'LightUserPicture': res.text.自定义(),
        'LightSingleRipple': res.text.激光(),
        'LightSineWave': res.text.正玄波(),
        'LightRoundRipple': res.text.烟花(),
        'LightMusicFollow': res.text.音乐律动(),
        'LightMusicFollow2': process.platform !== 'darwin' ? res.text.音乐律动2() : res.text.拾音灯(),
        'LightMusicFollow3': res.text.音乐律动(),
        'LightKaleidoscope': res.text.万花筒(),
        'LightLineWave': res.text.线性波浪(),
        'LightObliqueWave': res.text.斜波(),
        'LightGreedySnake': res.text.贪吃蛇(),
        'LightStarry': res.text.星空(),
        'LightWaterFall': res.text.瀑布(),
        'LightRingWaterFall': res.text.环形瀑布(),
        'LightLaser': res.text.激光2(),
        'LightCircleWave': res.text.圆波(),
        'LightDazzing': res.text.炫目(),
        'LightScreenColor': res.text.光影(),
        'LightRainDown': res.text.落雨(),
        'LightMeteor': res.text.流星(),
        'LightPressActionOff': res.text.单点灭(),
        'LightTrain': res.text.火车(),
        'LightFireWorks': res.text.焰火(),
    }

    static optionNameMap: { [key: string]: string } = {
        'right': res.text.右(),
        'left': res.text.左(),
        'up': res.text.上(),
        'down': res.text.下(),
        'upright': res.text.垂直(),
        'separate': res.text.分离(),
        'intersect': res.text.横断(),
        'out': res.text.外扩(),
        'in': res.text.吸引(),
        'anti-clockwise': res.text.逆时针(),
        'clockwise': res.text.顺时针(),
        'single': res.text.单列(),
        'full': res.text.外扩(),
        'z': res.text.z字型(),
        'return': res.text.折返(),
    }

    constructor() {
        super()
        venderSubject.subscribe(async v => {
            const devType = devArr.some(v => v.danglecommondev
                && -v.danglecommondev.mouseId === this.currentDev?.deviceType.id)
                ? 'mouse'
                : 'keyboard'
            if (v.devType !== devType) return

            if (v.type === '开始') {
                this.blockMusicFlow = true
                this.blockWeather = true
                this.blockScreenFlow = true
            }
            if (v.type === '停止') {
                clearTimeout(timer)
                clearTimeout(tempTimer)
                timer = setTimeout(() => {
                    this.blockMusicFlow = false
                    this.blockScreenFlow = false
                }, 500)
                this.blockWeather = false

            }
            if (v.type === '麦克风' && process.platform !== 'darwin') {
                // await toggleMicrophoneMute()
                await sleep(300)
                const status = await getMicrophoneMute()
                if (status !== 2) {
                    mobxStore.toastStore.setInfo(status === 1 ? res.text.麦克风已静音() : res.text.麦克风已开启())
                } else {
                    mobxStore.toastStore.setErr("未找到麦克风设备")
                }
            }
            if (v.type === '切灯效') {
                await this.getLightSetting()
            }
            if (v.type === '切配置') {
                this.getCurrentProfile()
                this.loadCurrentConfig(true)
            }
            if (v.type === '重置') {
                await this.stopLight()
                mobxStore.toastStore.setState('bussy', 'setReset type')
                await sleep(1000)
                this.setKeyboardDataReSet()
                if (this.isFnMode) this.isFnMode = false

                await this.loadCurrentConfig(true)
                this.removeLightLocal()
                mobxStore.toastStore.setState('idle', 'setReset type')
            }

            if (v.type === '省电模式') {
                this.getKeyboardOption()
                this.stopLight()
            }
            if (v.type === '常规模式') {
                this.getKeyboardOption()
                await sleep(100)
                if (this.currentDev?.deviceType.is24) {
                    await sleep(800)
                }
                if (this.currentDev?.deviceType.isblue) {
                    await sleep(800)
                }
                await this.startLight()
            }

            if (v.type === '切WIN' || v.type === '切MAC') {
                // if (this.keyboardOption?.system) {
                console.error("________WIN", v.type);
                mobxStore.toastStore.setState('bussy', 'loadCurrentConfig win')
                await this.loadCurrentConfig(true)
                mobxStore.toastStore.setState('idle', 'loadCurrentConfig win')
                // }
            }

            // if (v.type === '切MAC') {
            //     if (!this.keyboardOption?.system) {
            //         console.error("________MAC");
            //         mobxStore.toastStore.setState('bussy', 'loadCurrentConfig mac')
            //         await this.loadCurrentConfig(true)
            //         mobxStore.toastStore.setState('idle', 'loadCurrentConfig mac')

            //     }
            // }

            if (v.type === '切睡眠') {
                this.getSleepTime()
            }
        })

        reaction(() => this.currentConfig.light, async (v) => {
            if (this.musicReaction) {
                this.musicReaction()
                this.musicReaction = undefined
            }
            if ((v?.type === 'LightMusicFollow' || v?.type === 'LightMusicFollow2' || v?.type === 'LightMusicFollow3') && process.platform !== 'darwin') {
                mobxStore.musicFollowStore.start()
                if (v?.type === 'LightMusicFollow') {
                    this.musicReaction = reaction(() => mobxStore.musicFollowStore.musicDelt, async (v) => {
                        await this.setMusicFollow(v, 14)
                    })
                }

                if (v?.type === 'LightMusicFollow3') {
                    this.musicReaction = reaction(() => mobxStore.musicFollowStore.music3Delt, async (v) => {
                        await this.setMusicFollow(v, 0)
                    })
                }

                if (v?.type === 'LightMusicFollow2') {
                    this.musicReaction = reaction(() => mobxStore.musicFollowStore.music3Delt, async (v) => {
                        if (this.isMusicNative && process.platform !== 'darwin')
                            await this.setMusicFollow(v, 0)
                    })
                }
            } else {
                mobxStore.musicFollowStore.stop()
            }

            if (this.screenReaction) {
                this.screenReaction()
                this.screenReaction = undefined
            }
            if (v?.type === 'LightScreenColor' && process.platform !== 'darwin') {

                mobxStore.screenStore.start()
                this.screenReaction = reaction(() => mobxStore.screenStore.screenDataArray, (v) => {
                    if (this.isScreenNative) {
                        this.setScreen(v);
                    } else {
                        mobxStore.screenStore.stop()
                    }
                })

            } else {
                mobxStore.screenStore.stop()
            }


        })

        DBService.deviceListChangeSubject.subscribe(async v => {
            if (v.type === "设备插入") {
                clearTimeout(deviceListChangeSubjectTimer);
                deviceListChangeSubjectTimer = setTimeout(async () => {
                    // console.error('@@@@@@@@@@@@', v)
                    // 已在src/sdk/WebService/index.ts 停止音律/光影数据发送
                    this.refresh()
                    this.startWeather()
                }, 2 * 1000);
            } else {
                if (tempTimer != undefined) {
                    clearInterval(tempTimer)
                }
                // console.error("dddd: ", this.currentDev?.deviceType, v.deviceType);// 后续伤除
                // if (equals(this.currentDev?.deviceType.id, v.deviceType.id)
                //     && equals(this.currentDev?.deviceType.devAddr, v.deviceType.devAddr)) {
                //     console.error("111111111111111111111");// 后续伤除               
                this.refresh2()
                // }
            }

        })
    }
    private musicReaction: IReactionDisposer | undefined
    private screenReaction: IReactionDisposer | undefined
    @observable
    deviceArr = DBService.getDeviceInstanceArr()
    @observable
    currentSelectIndex = DBService.getDeviceSelectIndex()
    @observable
    currentDev = DBService.getCurrentDev()
    @observable
    currentConfig = new Config()
    @observable
    currentLightPic: UserPicItem[] | undefined = undefined
    @observable
    currentProfile: number | undefined = 0
    @observable
    isMusicNative: boolean = false;
    @observable
    isScreenNative: boolean = false;

    @observable
    fnIndex = 0

    @observable
    isFnMode = false
    @observable
    isAuto = false
    @observable
    isSwitch = false;
    @observable
    currentDevVersion = kLoadingMessage
    @observable
    currentOledVersion = '0'

    @observable
    severOledVersion = kLoadingMessage
    blockMusicFlow = false

    blockScreenFlow = false

    blockSetLight = false
    blockWeather = false
    @observable
    keyboardOption: KeyboardOption | undefined

    @observable
    mouseParam: MouseParam | undefined
    @observable
    dpiColorArr: number[] = []

    @action.bound
    async getDpiColor() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'mouse') return
        const arr = await this.currentDev.getDpiColor()
        if (arr === undefined) return

        this.dpiColorArr = [...arr]
        // this.mouseParam = v
        // for (let i = 0; i < arr.length; i += 3) {
        //     const nArr3 = arr.slice(i, i + 3)
        //     this.dpiColorArr.push(rgb2Num(nArr3[0], nArr3[1], nArr3[2]))
        // }
    }

    setDpiColor(dpiColorArr: number[]) {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'mouse') return
        this.doAsync(this.currentDev.setDpiColor, v => {
            if (v) {
                this.dpiColorArr = dpiColorArr
            }
        }, dpiColorArr)
    }

    @action.bound
    async getMouseParam() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'mouse') return
        const v = await this.currentDev.getMousePARAM()
        if (v === undefined) return
        this.mouseParam = v
    }

    setMouseParam(mp: MouseParam) {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'mouse') return
        this.doAsync(this.currentDev.setMousePARAM, v => {
            if (v) {
                this.mouseParam = mp
            }
        }, mp)
    }

    @action.bound
    async setTFTLCDData(gif: UImgData, progressCallBack?: (v: number) => void) {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        if (this.currentDev.deviceType.otherSetting?.LED === undefined) return
        await this.currentDev.setTFTLCDData(gif, progressCallBack)
    }
    @action.bound
    async getTFTLCDDataRGBImg(data: UImgRGBData & ImgStyle, gifLayer?: number) {
        if (!this.checkDev()) return false
        if (this.currentDev?.type !== 'keyboard') return false
        const isRgb = this.currentDev.deviceType.otherSetting?.LED?.isRgb
        if (isRgb === false || isRgb === undefined) return false
        return await this.currentDev.getTFTLCDDataRGBImg(isRgb, data, gifLayer)
    }
    @action.bound
    async setTFTLCDDataRGBImg(data: UImgRGBData & ImgStyle, progress?: (v: number) => void) {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        const isRgb = this.currentDev.deviceType.otherSetting?.LED?.isRgb
        if (isRgb === false || isRgb === undefined) return

        await this.currentDev.setTFTLCDDataRGBImg(isRgb, data, progress)
    }
    //自定义gif
    @action.bound
    async setUserGifStart() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        return await this.currentDev.setUserGifStart()
    }
    @action.bound
    async setUserGif(data: UGifData, progress?: (v: number) => void) {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        await this.currentDev.setUserGif(data, progress)
    }
    @action.bound
    setKeyboardDataReSet() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return

        this.currentDev!.setReDataReSet();
    }

    @action.bound
    setOLEDClock() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.currentDev!.setOLEDClock();
    }
    @action.bound
    async setOLEDWeather(today?: string, forecast?: string) { //天气预报
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        // if (this.blockWeather) return
        await this.currentDev!.setOLEDWeather(today, forecast);
    }
    @action.bound
    async setOLEDSysInfo() { //系统信息
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        await this.currentDev!.setOLEDSysInfo();
    }
    @action.bound
    startWeather() {
        const led = this.currentDev?.deviceType.otherSetting?.LED
        const weather = led ? led.weather : false
        if (weather) {
            const dev = this.currentDev?.deviceType;
            const devId = findId(dev) != 0 ? findId(dev) : 0
            let getId = localStorage.getItem("weatherId" + devId)
            if (getId != null) {
                let history: any = JSON.parse(getId)
                this.setOLEDWeather(history)
            }
            if (tempTimer != undefined) clearInterval(tempTimer)
            tempTimer = setInterval(async () => {
                while (mobxStore.toastStore.state === 'bussy') {
                    await sleep(1 * 1000)
                }
                if (this.blockWeather) {
                    await sleep(1 * 1000)
                }
                let getId = localStorage.getItem("weatherId" + devId)
                if (getId != null) {
                    let history: any = JSON.parse(getId)
                    this.setOLEDWeather(history)
                }
            }, 1000 * 60 * 60)
        }
    }
    @action.bound
    setKeyboardOption(powerSaveMode: boolean) {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        let tmp: KeyboardOption =
            this.keyboardOption !== undefined
                ? this.keyboardOption
                : {
                    winKeyLockControl: false,
                    system: false,
                    wasdKeyAndArrowKeyExchange: false,
                    ledOff: false,
                    sLedOff: false,
                    keyboardMode: false,
                    keyboardLockControl: false,
                    keyboardFnKeyMatrix: false,
                    powerSaveMode: false,
                }
        tmp.powerSaveMode = powerSaveMode
        this.doAsync(this.currentDev!.setKeyboardOption, async (v) => {
            if (v)
                this.keyboardOption = tmp
        }, tmp)
    }

    @action.bound
    getKeyboardOption() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.doAsync(this.currentDev!.getKeyboardOption, async (v) => {
            if (v) {
                this.keyboardOption = v
                this.blockSetLight = v.powerSaveMode
                if (v.powerSaveMode) {
                    await this.stopLight()
                } else {
                    await this.startLight()
                }
            }
        })
    }

    @action.bound
    setDeBounce(debounce: number) {
        if (!this.checkDev()) return
        if (this.currentDev === undefined) return
        this.doAsync(this.currentDev!.setDeBounce, (v) => {
            if (v) {
                mobxStore.otherStore.setCurrentOtherKey(debounce, 'deBounce')
            }
        }, debounce)
    }

    @action.bound
    getDeBounce() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.doAsync(this.currentDev!.getDeBounce, (v) => {
            mobxStore.otherStore.setCurrentOtherKey(v, 'deBounce')
        })
    }

    @action.bound
    setSleepTime(sleepKeyTime: SleepKeyTime) {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.doAsync(this.currentDev!.setSleepKeyTime, (v) => {
            if (v) {
                mobxStore.otherStore.setCurrentOtherKey(sleepKeyTime, 'sleep')
            }
        }, sleepKeyTime)
    }

    @action.bound
    getSleepTime() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.doAsync(this.currentDev!.getSleepKeyTime, (v) => {
            mobxStore.otherStore.setCurrentOtherKey(v, 'sleep')
        })
    }

    @action.bound
    getSLEDParam() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.doAsync(this.currentDev!.getSLEDParam, (v) => {
            this.currentConfig.logoLight = v
            this.saveCurrentConfig()

        })
    }

    @action.bound
    async setSLEDParam(light: LightSetting) {
        //console.log('ligth', light)
        if (this.blockSetLight) {
            mobxStore.toastStore.setInfo(res.text.灯带关闭请开启后切换())
            return
        }
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.doAsync(this.currentDev!.setSLEDParam, async (p) => {
            if (p) {
                this.currentConfig.logoLight = light
                this.saveCurrentConfig()
            }

        }, light)

    }

    setFormalLightName() {
        DeviceStore.lightNameMap = {
            'LightOff': res.text.关闭(),
            'LightAlwaysOn': res.text.常亮(),
            'LightBreath': res.text.动态呼吸(),
            'LightWave': res.text.随波逐流(),
            'LightRipple': res.text.碧波荡漾(),
            'LightRaindrop': res.text.繁星点点(),
            'LightSnake': res.text.川流不息(),
            'LightPressAction': res.text.如影随形(),
            'LightConverage': res.text.重峦叠嶂(),
            'LightNeon': res.text.光谱循环(),

            'LightSineWave': res.text.正弦波(),
            'LightKaleidoscope': res.text.彩泉涌动(),
            'LightLineWave': res.text.百花争艳(),
            'LightLaser': res.text.一石二鸟(),
            'LightCircleWave': res.text.峰回路转(),
            // 'LightDazzing': res.text.斜风细雨(),
            'LightUserPicture': res.text.自定义(),
            'LightMusicFollow': res.text.音乐律动(),
            'LightMusicFollow2': process.platform !== 'darwin' ? res.text.音乐律动2() : res.text.拾音灯(),
            'LightMusicFollow3': res.text.音乐律动(),
            'LightScreenColor': res.text.光影(),
            // ...............
            'LightSingleRipple': res.text.激光(),
            'LightRoundRipple': res.text.烟花(),
            'LightObliqueWave': res.text.斜波(),
            'LightGreedySnake': res.text.贪吃蛇(),
            'LightStarry': res.text.星空(),
            'LightWaterFall': res.text.瀑布(),
            'LightRingWaterFall': res.text.环形瀑布(),
            'LightRainDown': res.text.漫天飞雪(),
            'LightMeteor': res.text.流星(),
            'LightPressActionOff': res.text.踏雪无痕(),
            'LightDazzing': res.text.多彩纵横(),
            'LightFireWorks': res.text.层出不穷(),
            'LightUserColor': res.text.灯效编辑(),
            'LedClock': res.text.调整屏幕时间(),
            'LedCpu': res.text.系统信息(),
            'WRITEWORD': res.text.写字()
        }
    }

    async loadAddAction() {
        mobxStore.toastStore.setState('bussy', 'getKeyboardOption')
        this.getKeyboardOption()
        if (this.blockSetLight) {
            await this.stopLight()
        } else {
            await this.startLight()
        }
        mobxStore.toastStore.setState('idle', 'getKeyboardOption')

    }


    @action.bound
    private async loadCurrentConfig(manual: boolean = false) {
        return new Promise<void>(async resolve => {
            mobxStore.toastStore.setState('bussy', 'loadCurrentConfig Promise')
            await this.stopLight()
            await sleep(400);
            if (this.currentConfig.name === undefined) {
                this.currentConfig.name = 'loading...'
            }
            if (this.currentDev?.deviceType.displayName === 'help') {//所有救援都叫help
                resolve()
                return
            }
            // if (this.currentProfile === undefined)
            await this.getCurrentProfile()
            // await this.getMouseParam()
            // await this.getDpiColor()
            mobxStore.toastStore.setState('idle', 'loadCurrentConfig Promise')
            mobxStore.toastStore.setState('bussy', 'loadCurrentConfig Promise2')            //
            this.doAsync(DBService.loadCurrentConfig, (v) => {

                this.doAsync(DBService.devToConfig, async (dv) => {
                    // await sleep(100)
                    // this.getSleepTime()
                    //console.log('DDDDDVVVVVV', dv)

                    if (dv === undefined) {
                        console.log('设备状态读不出')
                        await this.creatNewConfigToCurrentAndSave('default', '')
                        resolve()
                        await this.loadAddAction()
                        mobxStore.toastStore.setState('idle', 'loadCurrentConfig Promise2')
                        return
                    }

                    if (v === undefined || !DBService.checkConfigValueEqual(v, dv)) {
                        //
                        console.log('当前状态与设备状态不同')
                        // console.log('数据库的值:', v?.value)
                        // console.log('设备里的值:', dv?.value)
                        console.log('查找数据里有没有相同的')
                        const sameConfig = await DBService.findSameConfig(dv)
                        if (sameConfig === undefined) {
                            console.log('没有找到相同的配置')
                            this.currentConfig = dv
                            this.currentConfig.name = this.isFnMode
                                ? this.currentDev?.deviceType.displayName + '_Fn'
                                : this.currentDev?.deviceType.displayName
                            this.currentConfig.category = ''
                            this.currentLightPic = this.currentConfig.lightPic
                            this.saveCurrentConfig().then(() => {
                                console.log('NNNAAAAMMEEEEE', this.currentConfig.name)
                                console.log('将设备状态作为当前状态', this.currentConfig.localId)
                                this.doAsync(DBService.setCurrentConfig, v => { }, this.currentConfig)
                                mobxStore.configStore.getConfigListFormDB()
                            })
                        } else {
                            console.log('找到相同的配置')
                            const sameConfigTmp = Object.assign({}, sameConfig)
                            sameConfigTmp.light = dv.light
                            this.currentConfig = sameConfigTmp
                            // this.currentConfig.light = dv.light
                            this.currentLightPic = this.currentConfig.lightPic
                        }

                        resolve()
                        await this.loadAddAction()
                        mobxStore.toastStore.setState('idle', 'loadCurrentConfig Promise2')
                        return
                    }
                    const config = Object.assign(v, dv)// v.light => 配置分享的灯效   dv.light => 读出来的灯效
                    this.currentConfig = config
                    this.currentLightPic = config.lightPic
                    resolve()
                    await this.loadAddAction()
                    mobxStore.toastStore.setState('idle', 'loadCurrentConfig Promise2')
                }, this.isFnMode, this.fnIndex, manual)
            })
        })

    }

    @action.bound
    async getLightSetting() {
        if (!this.checkDev()) return
        mobxStore.toastStore.setState('bussy', 'getLightSetting')
        await this.stopLight()
        if (
            this.currentConfig.light?.type.indexOf('LightMusicFollow') !== -1
            || this.currentConfig.light?.type.indexOf('LightScreenColor') !== -1
        ) await sleep(500)
        this.doAsync(this.currentDev!.getLightSetting, async v => {
            this.currentConfig.light = v

            if (v?.type === "LightUserPicture") {
                this.getLightPic()
            }

            if (v?.type === "LightScreenColor")
                await mobxStore.screenStore.getScreenArr()

            this.saveCurrentConfig()
            await this.startLight()
        })
        mobxStore.toastStore.setState('idle', 'getLightSetting')
    }

    @action.bound
    private refresh() {
        this.currentDev = DBService.getCurrentDev()
        //console.log('REFRESHHHHHHH', this.currentDev?.type)
        if (this.currentDev !== undefined && (this.currentConfig.name === undefined || this.currentConfig.name === 'default')) {
            this.getCurrentProfile().then(async v => {
                await this.loadCurrentConfig().then(v => mobxStore.configStore.getConfigListFormDB())
            })
        }
        this.deviceArr = DBService.getDeviceInstanceArr()
        this.currentSelectIndex = DBService.getDeviceSelectIndex()
        if (this.deviceArr.length === 0) this.currentConfig = new Config()

        //
        //console.log('!!!!!!!!!!', this.currentDev?.deviceType)
        if (this.currentDev?.deviceType.version) {
            this.currentDevVersion = this.currentDev?.deviceType.version
            if (this.currentDev?.deviceType.severVersion) {
                mobxStore.upgradeStore.setDevNeedUpgrade(Number(this.currentDev?.deviceType.version) < Number(this.currentDev?.deviceType.severVersion))
            }
        }


    }


    @action.bound
    private refresh2() {
        this.currentDev = DBService.getCurrentDev()
        //console.log('REFRESHHHHHHH', this.currentDev?.type)
        if (this.currentDev !== undefined) {
            if (!mobxStore.toastStore.sleepDevArr.find(v => equals(v.deviceType.devAddr, this.currentDev?.deviceType.devAddr))?.status) {
                this.getCurrentProfile().then(async v => {
                    if (this.currentConfig.name === undefined) {
                        await this.loadCurrentConfig().then(v => mobxStore.configStore.getConfigListFormDB())
                    }
                    await this.getLightSetting()
                })
            }
        }
        this.deviceArr = DBService.getDeviceInstanceArr()
        this.currentSelectIndex = DBService.getDeviceSelectIndex()
        if (this.deviceArr.length === 0) this.currentConfig = new Config()

        //
        //console.log('!!!!!!!!!!', this.currentDev?.deviceType)
        if (this.currentDev?.deviceType.version) {
            this.currentDevVersion = this.currentDev?.deviceType.version
            if (this.currentDev?.deviceType.severVersion) {
                mobxStore.upgradeStore.setDevNeedUpgrade(Number(this.currentDev?.deviceType.version) < Number(this.currentDev?.deviceType.severVersion))
            }
        }


    }

    // @action.bound
    // getLightTimer() {
    //     setInterval(async () => {
    //         if (!this.checkDev()) return
    //         if (this.currentDev?.type !== 'keyboard') return
    //         const light = await this.currentDev.getLightSetting()
    //         console.error("aaaaaaaaaaaaaalight:", light?.type);

    //     }, 2000)
    // }

    @action.bound
    async setCurrentSelectIndex(index: number) {
        if (this.currentSelectIndex === index) return
        this.isFnMode = false
        DBService.setDeviceSelectIndex(index)
        this.currentConfig = new Config()
        this.refresh()
    }




    @action.bound
    writeCurrentConfigToDev() {
        this.doAsync(DBService.configToDev, async () => {
            await this.startLight()
        }, this.currentConfig, this.isFnMode)
    }

    @action.bound
    checkDev() {
        if (this.currentDev === undefined) {

            mobxStore.toastStore.setErr(res.text.当前未检测到设备())
            return false
        }
        return true
    }
    @action.bound
    setCurrentFnIndex(index: number) {
        this.fnIndex = index
        this.loadCurrentConfig()
    }

    @action.bound
    async setIsFnMode(isFn: boolean) {
        mobxStore.toastStore.setState('bussy', 'setIsFnMode')
        this.isFnMode = isFn
        await this.loadCurrentConfig()
        mobxStore.toastStore.setState('idle', 'setIsFnMode')
    }
    @action.bound
    async setAutoOsen(isAuto: boolean) {

        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.doAsync(this.currentDev!.setAutoOsen, (v) => {
            if (v) {
                this.isAuto = !isAuto
            }
        }, !isAuto)
    }
    @action.bound
    getAutoOsen() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.doAsync(this.currentDev!.getAutoOsen, (v) => {
            this.isAuto = v
        })
    }
    //画板
    @action.bound
    async setOLEDLanguage(a: boolean) {

        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return


        this.doAsync(this.currentDev!.setOLEDLanguage, (v) => {
            if (v) {
                this.isSwitch = a
            }
        }, a)
    }

    @action.bound
    async getOLEDVersion() {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.currentOledVersion = '0'
        await this.doAsync(this.currentDev!.getOLEDversion, async (v) => {
            //console.log('VVVVVVVVV', v)
            if (v === undefined) return
            this.currentOledVersion = v.toString()
            console.log('ssssssssgetOLEDVersion', this.currentOledVersion);
        })
    }
    @action.bound
    async getCurrentProfile() {
        if (!this.checkDev()) return
        if (this.currentDev?.deviceType.displayName === 'help') return
        return this.doAsync(this.currentDev!.getCurrentProfile, async (v) => {
            if (v !== undefined && v >= 0) {
                this.currentProfile = this.currentDev!.currentProfile
            }
        })
    }
    @action.bound
    async setCurrentProfile(p: number) {
        if (!this.checkDev()) return
        return this.doAsync(this.currentDev!.setCurrentProfile, async (v) => {
            if (v) {
                mobxStore.toastStore.setState("bussy", "setCurrentProfile");
                if (process.platform !== 'win32')
                    await sleep(1000);
                await this.loadCurrentConfig()
                this.currentProfile = this.currentDev!.currentProfile
                mobxStore.toastStore.setState("idle", "setCurrentProfile");
            }
        }, p)
    }

    musicframeReady = true
    @action.bound
    async setMusicFollow(arr: Array<number>, flag: number) {
        if (!this.checkDev()) return
        if (this.currentDev === undefined) return
        // if (this.currentDev?.type !== 'keyboard') return
        if (!this.musicframeReady) return
        if (this.keyboardOption?.powerSaveMode) return
        if (!this.blockMusicFlow) {
            this.musicframeReady = false
            await this.currentDev.setMusicFollow(arr, flag, this.currentDev.deviceType.is24)
            this.musicframeReady = true
        }
    }
    screenFrameReady = true
    @action.bound
    async setScreen(uint8ClampedArray: Uint8ClampedArray) {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        if (!this.screenFrameReady) return
        if (this.keyboardOption?.powerSaveMode) return
        if (!this.blockScreenFlow) {
            this.screenFrameReady = false
            await this.currentDev.setScreen(uint8ClampedArray)
            this.screenFrameReady = true
        }
    }

    @action.bound
    async getDevVersion() {
        if (!this.checkDev()) return
        this.currentDevVersion = kLoadingMessage
        await this.doAsync(this.currentDev!.getFirmwareVersion, async (v) => {
            //console.log('VVVVVVVVV', v)
            if (v === undefined) return
            this.currentDevVersion = v.toString()
            const tDT = await DeviceType.findOne(this.currentDev?.deviceType.id)//防止救援升级魔改
            if (tDT === undefined) return
            tDT.version = v.toString()
            await tDT.save()
            this.saveCurrentConfig()
        })
    }
    @action.bound
    setReportRate(rate: 1000 | 500 | 250 | 125) {
        if (!this.checkDev()) return
        this.doAsync(this.currentDev!.setReportRate, (p) => {
            if (p) {
                this.currentConfig.reportRate = rate
                this.saveCurrentConfig()
            }

        }, rate)
    }
    @action.bound
    async setLightSetting(light: LightSetting) {
        if (this.blockSetLight) {
            mobxStore.toastStore.setInfo(res.text.灯效关闭请开启后切换())
            return
        }
        //console.log('ligth', light)
        if (!this.checkDev()) return
        await this.stopLight()
        this.doAsync(this.currentDev!.setLightSetting, async (p) => {
            if (p) {
                mobxStore.toastStore.setState('bussy', 'setLightSetting')
                this.currentConfig.light = light
                this.saveCurrentConfig()

                if (light.type === 'LightUserPicture' && light.option !== undefined) {
                    if (process.platform === 'darwin') await sleep(500)
                    await this.getLightPic()
                    // if (this.currentDev?.deviceType.is24 || this.currentDev?.deviceType.isblue) {
                    //     await sleep(100)
                    // }
                }

                if (light.type === 'LightMusicFollow' || light.type === 'LightMusicFollow3') {
                    mobxStore.musicFollowStore.stop()
                }

                if (light.type === 'LightMusicFollow2' && this.isMusicNative && process.platform !== 'darwin') {
                    mobxStore.musicFollowStore.stop()
                }
                if (light.type === 'LightScreenColor' && this.isScreenNative && process.platform !== 'darwin') {

                    mobxStore.screenStore.stop()
                }
                await this.startLight(light)
                mobxStore.toastStore.setState('idle', 'setLightSetting')

            }
        }, light)
    }
    @action.bound
    setLogoLightSetting(light: LightSetting) {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'mouse') return
        this.doAsync(this.currentDev.setLogoLightSetting, (p) => {
            if (p) {
                console.error(this.currentConfig)
                this.currentConfig.light = light
                this.saveCurrentConfig()
            }
        }, light)
    }

    @action.bound
    async getLightPic() {
        if (this.blockSetLight) {
            mobxStore.toastStore.setInfo(res.text.灯带关闭请开启后切换())
            return
        }
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return

        await this.doAsync(this.currentDev.getLightPic, (v) => {
            //console.error('!!!!!!!!!!!!!!', v)
            if (v) {
                this.currentLightPic = v
                // this.currentConfig.lightPic = v
                // this.saveCurrentConfig()
            }
        })
    }
    @action.bound
    setLightPicSimple(simplePic: UserPicItem, layer?: number) {
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.doAsync(this.currentDev.setLightPicSimple, v => {
            if (v) {
                this.currentConfig.lightPic?.map(v => {
                    if (equals(simplePic.hid, v.hid) && equals(simplePic.index, v.index)) v.rgb = simplePic.rgb
                })
                this.currentLightPic = this.currentConfig.lightPic
                this.saveCurrentConfig()
            }
        }, simplePic, layer)
    }

    @action.bound
    setLightPic(pic: UserPicItem[]) {
        //console.log(pic)
        if (!this.checkDev()) return
        if (this.currentDev?.type !== 'keyboard') return
        this.doAsync(this.currentDev.setLightPic, v => {
            if (v) {
                this.currentLightPic = pic
                this.currentConfig.lightPic = pic
                this.saveCurrentConfig()
            }
        }, pic)
    }

    @action.bound
    async stopLight() {
        mobxStore.musicFollowStore.stop()
        this.blockMusicFlow = true;
        this.blockScreenFlow = true;
        const devicePath = this.currentDev?.deviceType.devAddr.toString()
        if (devicePath) {
            const id = this.currentDev?.deviceType.id
            if (devlistList.some(
                v => id && (v.danglecommondev?.keyboardId === -id || v.danglecommondev?.mouseId === -id))) {
                if (id && devlistList.some(v => v.danglecommondev?.keyboardId === -id))
                    await setLightType(devicePath, 2, 0, 1)
                if (id && devlistList.some(v => v.danglecommondev?.mouseId === -id))
                    await setLightType(devicePath, 2, 0, 2)
            } else {
                await setLightType(devicePath, 2)
            }
        }
        if (this.currentDev?.deviceType.is24) {
            mobxStore.toastStore.setState('bussy', 'stopLight')
            await sleep(400);
            console.log("mode is 2.4G");
            mobxStore.toastStore.setState('idle', 'stopLight')
        }
    }
    @action.bound
    async setIsMusicNative(key: boolean) {
        this.isMusicNative = key
        await this.stopLight()
        await sleep(500)
        await this.startLight()
    }
    @action.bound
    async setIsScreenNative(key: boolean) {
        this.isScreenNative = key
        await this.stopLight()
        await sleep(500)
        await this.startLight()
    }

    @action.bound
    async startLight(light: LightSetting | undefined = this.currentConfig.light) {
        if (this.keyboardOption?.powerSaveMode) return
        if (light === undefined) return

        this.blockMusicFlow = false;
        this.blockScreenFlow = false;
        if ((light.type === 'LightMusicFollow'
            || light.type === 'LightMusicFollow2'
            || light.type === 'LightMusicFollow3')
            && process.platform !== 'darwin') {
            await mobxStore.musicFollowStore.start()
        }
        const devicePath = this.currentDev?.deviceType.devAddr.toString()
        if (devicePath === undefined) return

        if (light.type === 'LightMusicFollow2' && !this.isMusicNative) {
            if (!await mobxStore.musicFollowStore.checkMediaDeviceInfo() && process.platform !== 'darwin') {
                await mobxStore.musicFollowStore.musicStop()
            } else {
                if (process.platform === 'darwin')
                    await sleep(3000) // Avoid mac vender
                const id = this.currentDev?.deviceType.id
                if (devlistList.some(
                    v => id && (v.danglecommondev?.keyboardId === -id || v.danglecommondev?.mouseId === -id))) {
                    if (id && devlistList.some(v => v.danglecommondev?.keyboardId === -id))
                        await setLightType(devicePath, 0, 0, 1)
                    if (id && devlistList.some(v => v.danglecommondev?.mouseId === -id))
                        await setLightType(devicePath, 0, 0, 2)
                } else {
                    await setLightType(devicePath, 0)
                }
            }
        }

        if (light.type === 'LightScreenColor') {

            await mobxStore.screenStore.getScreenArr()
            if (this.isScreenNative && process.platform !== 'darwin') {
                mobxStore.screenStore.start()

                // await this.setLightSetting({ type: 'LightAlwaysOn', value: 4, rgb: rgbToNum(255, 0, 0) })
            } else {
                console.log('LightScreenColorstop');
                const id = this.currentDev?.deviceType.id
                if (devlistList.some(
                    v => id && (v.danglecommondev?.keyboardId === -id || v.danglecommondev?.mouseId === -id))) {
                    if (id && devlistList.some(v => v.danglecommondev?.keyboardId === -id))
                        await setLightType(devicePath, 1, mobxStore.screenStore.screenIndex, 1)
                    if (id && devlistList.some(v => v.danglecommondev?.mouseId === -id))
                        await setLightType(devicePath, 1, mobxStore.screenStore.screenIndex, 2)
                } else {
                    await setLightType(devicePath, 1, mobxStore.screenStore.screenIndex)
                }
            }
        }

    }
    @action.bound
    async setKeyConfigSimple(configValue: ConfigValue) {
        mobxStore.toastStore.setState('bussy', 'setKeyConfigSimple')
        await this.stopLight()

        if (!this.checkDev()) return
        if (this.currentDev === undefined) return

        const tmpCur = this.currentConfig.value === undefined ? [configValue] : [...this.currentConfig.value]
        const ts = tmpCur.find(v => v.original === configValue.original && v.index === configValue.index)
        if (ts !== undefined)
            tmpCur.splice(tmpCur.indexOf(ts), 1)

        tmpCur.push(configValue)
        if (this.isFnMode && this.currentDev.type === 'mouse') return
        if (this.currentDev.type !== 'keyboard') return // 先处理键盘  后续有鼠标删除
        this.doAsync(this.isFnMode ? this.currentDev.setFnKeyConfigSimple : this.currentDev.setKeyConfigSimple, async (p) => {
            if (p) {
                //console.log('configValue!!!!',configValue)
                if (configValue.type === 'combo' &&
                    configValue.original === configValue.key &&
                    configValue.skey === 'none' &&
                    configValue.key2 === 0
                ) {//恢复默认设置
                    const ts = tmpCur.find(v => v.original === configValue.original && v.index === configValue.index)
                    if (ts !== undefined)
                        tmpCur.splice(tmpCur.indexOf(ts), 1)
                }
                if (configValue.type === 'ConfigFunction') {
                    const tmp = numToByte4(configValue.original)
                    const sArr = specialFunTablectionMap[configValue.key]

                    if (equals(sArr, tmp)) {
                        if (specialFunTablectionArr.some(v => equals(v, tmp))) {
                            const ts = tmpCur.find(v => v.original === configValue.original && v.index === configValue.index)
                            if (ts !== undefined)
                                tmpCur.splice(tmpCur.indexOf(ts), 1)
                        }
                    }
                }
                this.currentConfig.value = tmpCur
                await this.saveCurrentConfig()
            }
            await sleep(100)
            await this.startLight()
            mobxStore.toastStore.setState('idle', 'setKeyConfigSimple')
        }, configValue, this.fnIndex);
    }

    @action.bound
    async setKeyConfig(configValue: ConfigValue) {
        mobxStore.toastStore.setState('bussy', 'setKeyConfig')
        // console.error('kkkkkkkkkkkkkk', this.currentConfig.light?.type);
        await this.stopLight()

        if (!this.checkDev()) return
        if (this.currentDev === undefined) {
            return
        }
        // console.error('configValueconfigValueconfigValueconfigValueconfigValue:', configValue)
        // console.error('this.currentConfig.value', this.currentConfig.value, configValue)
        const tmpCur = this.currentConfig.value === undefined ? [configValue] : [...this.currentConfig.value]
        const ts = tmpCur.find(v => v.original === configValue.original && v.index === configValue.index)
        if (ts !== undefined)
            tmpCur.splice(tmpCur.indexOf(ts), 1)

        tmpCur.push(configValue)
        //console.log('tmpCurtmpCurtmpCurtmpCur',tmpCur)
        //console.log('TTTTMMMMMPPPPPPPVVVVVCCCCUUT', tmpCur, this.currentConfig.value)
        if (this.isFnMode && this.currentDev.type === 'mouse') return

        this.doAsync(this.isFnMode ? (this.currentDev as KeyboardInterface).setFnKeyConfig : this.currentDev.setKeyConfig, async (p) => {
            if (p) {
                //console.log('configValue!!!!',configValue)
                if (configValue.type === 'combo' &&
                    configValue.original === configValue.key &&
                    configValue.skey === 'none' &&
                    configValue.key2 === 0
                ) {//恢复默认设置
                    // console.error('!!!!!!!!!', configValue.key.toString(16))
                    const ts = tmpCur.find(v => v.original === configValue.original && v.index === configValue.index)
                    // console.error('!!!!!!!##!!#',ts)
                    if (ts !== undefined)
                        tmpCur.splice(tmpCur.indexOf(ts), 1)
                    //console.log('!!!!!!',this.currentConfig.value)

                }
                if (configValue.type === 'ConfigFunction') {
                    const tmp = numToByte4(configValue.original)
                    const sArr = specialFunTablectionMap[configValue.key]

                    if (equals(sArr, tmp)) {
                        if (specialFunTablectionArr.some(v => equals(v, tmp))) {
                            const ts = tmpCur.find(v => v.original === configValue.original && v.index === configValue.index)
                            if (ts !== undefined)
                                tmpCur.splice(tmpCur.indexOf(ts), 1)
                        }
                    }
                }
                //console.log('????????????????', tmpCur, this.currentConfig.value)
                this.currentConfig.value = tmpCur
                //console.log('@@@@@@@@@@@@@@',this.currentConfig.value)
                //console.log('PPPPPP',p,configValue,this.currentConfig.value)
                this.saveCurrentConfig().then(v => {
                    //console.log('###########',this.currentConfig.value)
                })
            }
        }, tmpCur, this.fnIndex)
        await sleep(100)
        await this.startLight()
        mobxStore.toastStore.setState('idle', 'setKeyConfig')
    }

    /*  @action.bound
      setKeyConfig(configValues: ConfigValue[]) {
          if (!this.checkDev()) return
          if (this.currentDev === undefined || this.currentDev.type !== 'mouse') {
              return
          }
          this.doAsync(this.currentDev.setKeyConfig, (p) => {
              if (p) {
                  this.currentConfig.value = configValues
                  this.saveCurrentConfig()
              }
          }, configValues)
      }*/

    @action.bound
    async setReset() {
        if (!this.checkDev()) return
        await this.stopLight()
        if (this.currentProfile !== 0) this.currentProfile = 0;

        if (this.isFnMode) this.isFnMode = false

        this.doAsync(this.currentDev!.setReSet, async (v) => {
            if (v) {
                mobxStore.toastStore.setState('bussy', 'setReset -')
                await sleep(5 * 1000)
                await this.loadCurrentConfig()
                this.removeLightLocal()
                mobxStore.toastStore.setState('idle', 'setReset -')
            }
        })
    }

    @action.bound
    async reConnect() {
        if (!this.checkDev()) return
        await this.stopLight()
        console.log('reConnect');
        mobxStore.toastStore.setState('bussy', 'reConnect')
        await sleep(1 * 1000)
        await this.loadCurrentConfig()
        mobxStore.toastStore.setState('idle', 'reConnect')

    }

    removeLightLocal() {
        let lightLocal: string = ""
        if (this.currentDev?.deviceType.id !== undefined) {
            lightLocal = this.currentDev.deviceType.id + "&"
            this.currentDev?.deviceType.layout?.light.types.map(
                v => localStorage.removeItem(lightLocal + v.type))
        }
    }

    getLightLocal(lightType: string) {
        const tmp = localStorage.getItem(this.currentDev?.deviceType.id + "&" + lightType)
        if (tmp === null) return undefined
        const light: LightSetting = JSON.parse(tmp)
        return light
    }

    @action.bound
    setDpi(dpi: number[]) {
        if (!this.checkDev()) return
        if (this.currentDev === undefined || this.currentDev.type !== 'mouse') {
            return
        }
        this.doAsync(this.currentDev.setDPI, (p) => {
            if (p) {
                this.currentConfig.dpi = dpi
                this.saveCurrentConfig()
            }
        }, dpi)
    }

    @action.bound
    saveCurrentConfig() {
        return new Promise<void>(resolve => {
            const tmp = this.currentConfig
            this.currentConfig = new Config()
            Object.assign(this.currentConfig, tmp)
            //console.error('!!!!!!!!!!!!!!!!!', this.currentConfig)
            this.doAsync(DBService.saveConfig, (v) => { resolve() }, this.currentConfig)
        })
    }

    @action.bound
    async setCurrentConfig(config: Config) {
        if (this.currentDev === undefined) return
        await this.stopLight()

        const deviceName = this.currentDev
            ? this.currentDev.deviceType.name
                ? this.currentDev.deviceType.name
                : 'default'
            : 'default'

        const configDeviceName = config.deviceType?.name === undefined
            ? 'default'
            : config.deviceType?.name

        const isLayoutExit = deviceName in res.键鼠坐标
        const isConfigLayoutExit = configDeviceName in res.键鼠坐标
        const deviceLayout = res.键鼠坐标[isLayoutExit ? deviceName : 'default'].layout //当前layout
        const configLayout = res.键鼠坐标[isConfigLayoutExit ? configDeviceName : 'default'].layout //方案layout

        for (let i = 0; i < deviceLayout.length; i++) {
            const item = deviceLayout[i]

            if (!configLayout.some(v => equals(v.value, item.value) && equals(v.index, item.index))) {
                mobxStore.toastStore.setInfo(res.text.该方案与当前键盘键位不一致请勿设置())
                await this.startLight()
                return
            }

        }

        const profile = this.currentProfile ? this.currentProfile : 0
        if (this.currentDev?.allLayerConfigs !== undefined && config.value !== undefined) {
            const allMacros = [...this.currentDev.allLayerConfigs]
            const macros = [...(config.value.filter((v) => v.type === 'ConfigMacro') as ConfigMacro[])]
            // console.error("allMacros1111: ", allMacros.map(v => ({
            //     isFn: v.isFn,
            //     profile: v.profile,
            //     macro: v.macro
            // })));

            let index = allMacros.findIndex(v =>
                v.isFn === this.isFnMode
                && (this.isFnMode ? v.profile === this.fnIndex : v.profile === profile)
                && !macros.some(mv => equals(v.macro.index, mv.index)
                    && equals(v.macro.macro, mv.macro)
                    && equals(v.macro.macroType, mv.macroType)
                    && equals(v.macro.original, mv.original)
                    && equals(v.macro.repeatCount, mv.repeatCount)
                    && equals(v.macro.type, mv.type)))
            // 删除该层与macros里不的宏
            while (index !== -1) {
                allMacros.splice(index, 1)
                index = allMacros.findIndex(v =>
                    v.isFn === this.isFnMode
                    && (this.isFnMode ? v.profile === this.fnIndex : v.profile === profile)
                    && !macros.some(mv => equals(v.macro.index, mv.index)
                        && equals(v.macro.macro, mv.macro)
                        && equals(v.macro.macroType, mv.macroType)
                        && equals(v.macro.original, mv.original)
                        && equals(v.macro.repeatCount, mv.repeatCount)
                        && equals(v.macro.type, mv.type)))
            }
            // console.error("allMacros2222: ", allMacros.map(v => ({
            //     isFn: v.isFn,
            //     profile: v.profile,
            //     macro: v.macro
            // })));

            // console.error("mmmmmmmmmm: ", macros);

            for (let i = 0; i < macros.length; i++) {
                const macro = macros[i]

                for (let j = 0; j < allMacros.length; j++) {
                    const am = allMacros[j]

                    if (am.isFn === this.isFnMode
                        && this.isFnMode ? am.profile === this.fnIndex : am.profile === profile) {
                        if (!allMacros.some(av => (equals(av.macro.index, macro.index)
                            && equals(av.macro.macro, macro.macro)
                            && equals(av.macro.macroType, macro.macroType)
                            && equals(av.macro.original, macro.original)
                            && equals(av.macro.repeatCount, macro.repeatCount)
                            && equals(av.macro.type, macro.type))
                        )) {
                            allMacros.push({
                                isFn: this.isFnMode,
                                profile: this.isFnMode ? this.fnIndex : profile,
                                macro: macro
                            })
                        }
                    }
                }
            }

            // console.error("allMacros3333: ", allMacros.map(v => ({
            //     isFn: v.isFn,
            //     profile: v.profile,
            //     macro: v.macro
            // })));

            let max = 20
            if (supportYC500Dev.some(v => v.id === this.currentDev?.deviceType.id))
                max = 50

            if (allMacros.length > max) {
                mobxStore.toastStore.setErr(res.text.该方案的宏超出键盘最大存储范围无法设置())
                return
            }
        }

        if (this.currentConfig.light?.type !== 'LightUserPicture') {
            const light = this.currentDev?.deviceType.layout?.light.types.find(v => v.type === 'LightUserPicture')

            if (light !== undefined) {
                config.light = {
                    type: 'LightUserPicture',
                    value: light.maxValue !== undefined ? light.maxValue : 1,
                }
            }
        } else {
            if (config.lightPic != undefined && config.lightPic.length < deviceLayout.length) {
                for (let i = 0; i < deviceLayout.length; i++) {
                    const item = deviceLayout[i]
                    //自定义补充方框

                    if (!config.lightPic.some(v => equals(v.hid, item.value))) {
                        let picItem: {
                            hid: number,
                            rgb: number,
                            index?: number
                        } = { hid: item.value, rgb: 0 }
                        config.lightPic.push(picItem)

                    }

                }
            }
            config.light = this.currentConfig.light
        }
        this.currentConfig = config
        this.currentLightPic = config.lightPic

        this.doAsync(DBService.setCurrentConfig, (v) => {
            this.writeCurrentConfigToDev()
            mobxStore.configStore.getConfigListFormDB()
        }, this.currentConfig)
        if (process.platform === 'darwin') {
            sleep(1200)
        }

    }
    //临时方案
    @action.bound
    renameCurrentConfig(config: Config) {

        this.currentConfig.name = config.name
        this.saveCurrentConfig()
    }

    @action.bound
    async creatNewConfigToCurrentAndSave(name: string, category: string) {
        await this.stopLight()
        const config = new Config()
        config.name = name
        config.category = category
        config.reportRate = 500
        config.value = []
        config.light = {
            type: "LightAlwaysOn",
            value: 1,
            rgb: 16729454,
            dazzle: true
        }
        if (this.currentDev?.deviceType.logoLayout !== null) {
            config.logoLight = {
                type: "LightAlwaysOn",
                value: 1,
                rgb: 16729454,
                dazzle: true
            }
        }
        config.lightPic = new Array<UserPicItem>();
        this.currentLightPic = new Array<UserPicItem>()
        this.currentConfig.lightPic?.map(v => {
            const userPicItem: UserPicItem = {
                hid: v.hid,
                rgb: v.rgb,
                index: v.index
            }
            config.lightPic?.push(userPicItem)
            this.currentLightPic?.push(userPicItem)
        })
        this.currentConfig = config
        this.doAsync(DBService.saveConfig, (v) => {
            mobxStore.configStore.getConfigListFormDB()
            this.writeCurrentConfigToDev()
        }, this.currentConfig)

        sleep(1000 * 2)
    }

    ///
    @observable userDevList: DeviceType[] = []
    @action.bound
    getUserDevList() {
        this.doAsync(getCurrentUser, (v) => {

            if (v !== undefined && v.deviceTypes !== undefined)
                this.userDevList = [...v?.deviceTypes]
        })
    }



    commonHandleErr = (err: any) => {

        mobxStore.toastStore.setErr(err)
    }
    commonHandleSuccess = (v: any) => {
        if (typeof v === 'boolean' && v === false && !mobxStore.toastStore.isError) {
            mobxStore.toastStore.setErr(res.text.读取设备错误())
        }
    }

}


