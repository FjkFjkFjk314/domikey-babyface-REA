import React, { useState } from 'react'
import { dj, dj2 } from '../../../dj'
import { res } from '../../../res'
import {
    withProps,
    LightProp,
    wheelLightData,
} from '../../utils/WithProps'

import { numToRgb, rgbToNum } from '../../../unitys/rgbNum'
import { DeviceStore } from '../../../mobxStore/deviceStore'

import { mobxStore, useStore } from '../../../mobxStore/store'
import { useObserver } from 'mobx-react-lite'
import { getKeyPath } from '../keyPath'
import { sleep } from '../../../unitys/timeFunc'
import { supportSONIXDev } from '../../../supportDev'
import { equals } from 'ramda'
import { blockCloud } from '../../../appConfig'
import styled from '@emotion/styled'
import { PopColorPicker, modeKeyChange } from './Light'
import { layoutToPicSize } from '../../../sdk/DriverIO/DeviceAPI/lightImgApi'
import { OutsideAlerter } from '../../../UI/utils/OutsideAlerter'

const Container = styled.div({
    position: 'relative',
    width: '100%',
    height: 460,
    overflowY: 'auto',
    overflowX: 'hidden',
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'gray',
        borderRadius: '5px',
    },
})
const UserLight = (p: LightProp) => {
    const { isKeyStore, deviceStore, userGifStore, toastStore, drawStore, shareImageStore } = useStore()
    const onModeChange = (name: string) => modeKeyChange(p, name)

    const [popUp, setPopUp] = useState(false)

    const color = numToRgb(userGifStore.drawColor)

    isKeyStore.setColorPickerKey(popUp)

    const id = deviceStore.currentDev?.deviceType.id
    const keyPath = getKeyPath()

    if (p.lightLayout.isFormal) {
        deviceStore.setFormalLightName()
    }

    const selectName = () => {
        const type =
            supportSONIXDev.some(v => v.id === deviceStore.currentDev?.deviceType.id) && p.light.type === 'LightMusicFollow3'
                ? 'LightMusicFollow2' : p.light.type

        const ttt = DeviceStore.lightNameMap[type]
            ? DeviceStore.lightNameMap[type]
            : type
        return ttt
    }
    const getLightName = () => {
        if (deviceStore.keyboardOption?.powerSaveMode) {
            return [res.text.关闭()]
        }
        const lightArr = p.lightLayout.types.map((v: { type: any }) => {
            return DeviceStore.lightNameMap[v.type]
                ? DeviceStore.lightNameMap[v.type]
                : v.type
        })
        const tmp = lightArr.findIndex(v => v === res.text.音乐律动())

        if (tmp !== -1 && supportSONIXDev.some(v => v.id === deviceStore.currentDev?.deviceType.id))
            lightArr[tmp] = res.text.音乐律动2()
        return lightArr
    }
    //自定义GIF
    const deviceName = deviceStore.currentDev
        ? deviceStore.currentDev.deviceType.name
            ? deviceStore.currentDev.deviceType.name
            : 'default'
        : 'default'
    const isLayoutExit = deviceName in res.键鼠坐标
    const deviceLayout = res.键鼠坐标[isLayoutExit ? deviceName : 'default'].layout
    const devicexy = res.键鼠坐标[isLayoutExit ? deviceName : 'default'].delt
    const currentMaxtrx = deviceStore.currentDev?.defaultMatrix != undefined ? deviceStore.currentDev?.defaultMatrix : []
    const [delayCount, setDelayCount] = useState<number | undefined>(undefined)
    const [hideDelay, setHideDelay] = useState(false)
    const [draw, setDraw] = useState(false)
    const [gain, setGain] = useState(false)
    const [randomColor, setRandomColor] = useState(false)
    const size = layoutToPicSize(deviceLayout)
    const drawKeyboard = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const x = (e.target as HTMLDivElement).offsetLeft
        const y = (e.target as HTMLDivElement).offsetTop

        const key = deviceLayout.find(v => devicexy.deltX + v.x === x && devicexy.deltY - v.y === y)
        if (key == undefined) return
        const tmp = userGifStore.currentUserPic.find(cv => equals(key.value, cv.hid) && equals(key.index, cv.index))
        if (tmp === undefined) return
        if (userGifStore.userPicFrames.length === 255 && userGifStore.autoRecord !== undefined) {
            toastStore.setInfo(res.text.最大只能添加() + 255);
            return
        }
        const pic = {
            hid: tmp.hid,
            index: tmp.index,
            rgb: tmp.rgb
        }

        let num = randomColor
            ? Math.round(Math.random() * 0xffffff)
            : rgbToNum(color.r, color.g, color.b)
        pic.rgb = num
        tmp.rgb = num

        if (userGifStore.autoRecord !== undefined)
            userGifStore.addRecordArrItem(pic)
    }

    const fileGif = async (f: File) => {
        if (f.type.indexOf('image') === -1) {
            toastStore.setInfo(res.text.请勿添加图片以外的文件());
            return
        }

        await userGifStore.file2frames(f, size, currentMaxtrx, p.deviceName)

    }
    const loadGif = async () => {
        if (userGifStore.userPicFrames.length > 255) {
            mobxStore.toastStore.setInfo(res.text.最大只能添加() + 255 + res.text.张图片());
            drawStore.setIsUp(false)
            return
        }
        let progress = 0
        drawStore.setPercentage(0)

        for (let i = 0; i < userGifStore.userPicFrames.length; i++) {
            const picArr = userGifStore.userPicFrames[i]
            progress = (i + 1) / userGifStore.userPicFrames.length
            const tmpData: UGifData = {
                picArr: picArr,
                currentFrame: i,
                frameNum: userGifStore.userPicFrames.length,
                frameDelay: userGifStore.delayArr[i],
            }
            await deviceStore.setUserGif(
                tmpData
            )
            drawStore.setPercentage(progress)

        }
        drawStore.setPercentage(0)
    }
    return useObserver(() => {
        return (
            <dj.View w={891} h={480} x={0} >
                {/* {!deviceStore.keyboardOption?.powerSaveMode && */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    width: '100%',
                    height: '100%'
                }}>
                    {/* 左边键盘图与播放 */}
                    <div
                        style={{ display: 'flex', alignItems: 'center', height: 303 }}>
                        <div
                            id={'aa'}
                            style={{ position: 'relative', width: 871, height: 288, marginLeft: -24, flex: '0 0 auto', userSelect: 'none' }}
                            onMouseDown={(e) => {
                                if (gain) return
                                setPopUp(false)
                                setDraw(true)
                                drawKeyboard(e)
                            }}
                            onMouseMove={(e) => {
                                if (!draw) return
                                setPopUp(false)
                                drawKeyboard(e)
                            }}
                            onMouseUp={() => {
                                setDraw(false)
                                setPopUp(false)
                                userGifStore.setCurrentSelect(userGifStore.currentSelect)
                                userGifStore.autoReRecordArr(currentMaxtrx)

                            }}
                            onMouseLeave={() => {
                                if (draw)
                                    userGifStore.autoReRecordArr(currentMaxtrx)

                                setDraw(false)
                                userGifStore.setCurrentSelect(userGifStore.currentSelect)
                            }}
                        >
                            <img
                                style={{ display: "block", width: 871, height: 288, pointerEvents: 'none' }}
                                src={p.deviceName
                                    ? keyPath
                                    : res.img.MG912}
                            />
                            {deviceLayout.map((v, i) => {
                                const pic = userGifStore.currentUserPic.find(cv => equals(v.value, cv.hid) && equals(v.index, cv.index))
                                return !v.knob && <div
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        left: devicexy.deltX + v.x,
                                        top: devicexy.deltY - v.y,
                                        width: v.w,
                                        height: v.h,
                                        backgroundColor: pic === undefined
                                            ? 'transparent'
                                            : `rgb(${numToRgb(pic.rgb).r}, ${numToRgb(pic.rgb).g},${numToRgb(pic.rgb).b})`,
                                        border: '1px solid #fff',
                                        borderRadius: 5,
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                        (pic !== undefined && gain) && userGifStore.setDrawColor(pic.rgb);
                                        // setGain(false) ;mobxStore.toastStore.setErr(res.text.取色完成())
                                    }}
                                />
                            })}
                        </div >
                        {/* 播放 */}
                        <dj.View w={800} h={130} y={310} >
                            <ScrollBox style={{ marginBottom: 10 }}>
                                {userGifStore.userPicFrames.map((v, i) => {
                                    return <div key={i} style={{ display: 'flex', flex: '0 0 auto', marginRight: 8 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <dj.Button
                                                relative
                                                w={40}
                                                h={20}
                                                isHightLight={i === userGifStore.currentSelect}
                                                clickHandle={() => { userGifStore.setCurrentSelect(i) }}
                                                mode={'filletBorder'}
                                                text={i + 1}
                                            />
                                            {!hideDelay && userGifStore.delayArr.length > 1 && <div style={{
                                                width: 40,
                                                height: 33,
                                                borderRadius: 5,
                                                background: 'gray',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginTop: 5
                                            }}>
                                                {delayCount !== i && <div style={{ width: 40, height: 33, textAlign: 'center', cursor: 'poniner' }}
                                                    onClick={() => setDelayCount(i)}>
                                                    <p style={{ height: 15, lineHeight: '15px', fontSize: 12 }}>{userGifStore.delayArr[i]}</p>
                                                    <p style={{ height: 15, lineHeight: '15px', fontSize: 12 }}>ms</p>
                                                </div>}
                                                {delayCount === i && <NumberInputStyle
                                                    autoFocus
                                                    onChange={(e) => {
                                                        let num = parseInt(e.target.value)
                                                        if (num > 255)
                                                            num = 255
                                                        if (num < 0 || Number.isNaN(num))
                                                            num = 0
                                                        e.target.value = num.toString()
                                                    }}
                                                    onFocus={() => {
                                                        isKeyStore.setIsinput(true);
                                                    }}
                                                    onBlur={(e) => {
                                                        let num = parseInt(e.target.value)
                                                        if (num > 255)
                                                            num = 255
                                                        if (num < 0 || Number.isNaN(num))
                                                            num = 0
                                                        setDelayCount(undefined)
                                                        if (num <= 0) {
                                                            userGifStore.delayArr[i] = 1
                                                        } else {
                                                            userGifStore.delayArr[i] = num
                                                        }

                                                    }}
                                                />}
                                            </div>
                                            }
                                        </div>
                                    </div>
                                })}
                            </ScrollBox>

                            {
                                userGifStore.userPicFrames.length > 1 &&
                                <div style={{ marginBottom: 10, display: 'flex', width: 671, height: 32, alignItems: 'center', marginTop: 20 }}>
                                    <dj.Button
                                        relative
                                        w={46}
                                        h={24}
                                        mode={'filletBorder'}
                                        text={'<'}
                                        clickHandle={() => {
                                            const num = userGifStore.currentSelect
                                            if (num > 0)
                                                userGifStore.setCurrentSelect(num - 1)
                                        }} />

                                    <div style={{ width: 400, margin: '0 5px' }}>
                                        <dj.UserSlide
                                            relative
                                            sliderW={400}
                                            w={400}
                                            h={15}
                                            y={-7}
                                            min={1}
                                            max={userGifStore.userPicFrames.length}
                                            value={userGifStore.currentSelect + 1}
                                            step={1}
                                            setValue={(value) => { userGifStore.setCurrentSelect(value - 1) }}
                                            isDisabled={false}
                                        />
                                    </div>

                                    <dj.Button clickHandle={() => {
                                        const num = userGifStore.currentSelect
                                        if (num < userGifStore.userPicFrames.length - 1)
                                            userGifStore.setCurrentSelect(num + 1)
                                    }}
                                        relative
                                        w={46}
                                        h={24}
                                        x={6}
                                        mode={'filletBorder'}
                                        text={'>'}
                                    />
                                    <dj.Button clickHandle={() => {
                                        userGifStore.setplay(true)
                                        if (userGifStore.currentSelect === userGifStore.userPicFrames.length - 1)
                                            userGifStore.setCurrentSelect(0)
                                        let num = userGifStore.currentSelect
                                        if (userGifStore.timer !== undefined) clearInterval(userGifStore.timer)
                                        const times = () => {
                                            if (num > userGifStore.userPicFrames.length - 1) {
                                                userGifStore.setplay(false)
                                                clearInterval(userGifStore.timer)
                                            } else {
                                                clearInterval(userGifStore.timer)
                                                userGifStore.setCurrentSelect(num)
                                                userGifStore.timer = setInterval(times, userGifStore.delayArr[num] * 10)
                                                num++

                                            }

                                        }
                                        userGifStore.timer = setInterval(times, userGifStore.delayArr[num] * 10)

                                    }}
                                        relative
                                        w={65}
                                        h={24}
                                        x={13}
                                        mode={'filletBorder'}
                                        text={res.string.播放}
                                    />
                                    <dj.Button clickHandle={() => {
                                        if (userGifStore.timer !== undefined) clearInterval(userGifStore.timer)
                                    }}
                                        relative
                                        w={65}
                                        h={24}
                                        x={20}
                                        mode={'filletBorder'}
                                        text={res.string.暂停}
                                    />
                                </div>
                            }

                        </dj.View>

                    </div>

                    <OutsideAlerter clickOutsideHandle={() => { userGifStore.setClickIcon(false); }}>
                        {/* 右边按钮 */}
                        <dj.Button
                            w={55}
                            h={55}
                            relative
                            x={43}
                            img={{
                                size: {
                                    w: 55,
                                    h: 55,
                                },
                                src: res.img.click,
                            }}
                            clickHandle={() => { userGifStore.setClickIcon(!userGifStore.clickIcon); setPopUp(false) }}
                            classname={'notoutside'}
                        />
                        {userGifStore.clickIcon && <dj.View w={193} h={460} form={'弹出框'} relative x={-161} y={-47}>
                            <Container>
                                <div style={{ paddingLeft: 8 }}>
                                    <Box style={{ height: 58, position: 'relative', marginTop: 15 }} >
                                        <dj.Text w={82} x={0} type={'SubTitle'} classname={'autoWidth'} text={res.string.灯光模式} />
                                        <dj.ComboBox
                                            w={180}
                                            h={28}
                                            y={30}
                                            selectedValue={selectName()}
                                            onChange={(index) => {
                                                if (deviceStore.keyboardOption?.powerSaveMode) return

                                                const type = id + '&' + p.lightLayout.types[index].type
                                                onModeChange(type)
                                            }}
                                            modes={getLightName()}
                                            clickHandle={() => {
                                                if (deviceStore.keyboardOption?.powerSaveMode) return
                                                const name = id + '&' + p.light.type

                                                // localStorage.setItem(p.light.type, JSON.stringify(p.light))
                                                localStorage.setItem(name, JSON.stringify(p.light))
                                            }}
                                        />
                                    </Box>
                                    <Box>
                                        <dj.Button
                                            relative
                                            w={175}
                                            h={32}
                                            text={res.string.选择图片}
                                            mode={'BorderBackground'}
                                            clickHandle={() => {
                                                const btn = document.getElementById('selectFileBtn')
                                                if (btn === null) return
                                                btn.click()
                                            }}
                                        />
                                        <input type={'file'} style={{ display: 'none' }} id={"selectFileBtn"} onChange={async (e) => {
                                            const btn = document.getElementById('selectFileBtn')
                                            if (btn === null) return
                                            const files = (btn as HTMLInputElement).files
                                            if (files === null) return
                                            await fileGif(files[0]);
                                            (btn as HTMLInputElement).value = '';

                                        }} />

                                    </Box>
                                    <Box style={{ height: 22, position: 'relative' }} >
                                        <dj.Text w={'auto'} h={20} text={res.string.颜色} type={'SubTitle'} />
                                        <dj.ColorBlock
                                            w={16}
                                            h={16}
                                            x={50}
                                            bg={`rgb(${numToRgb(userGifStore.drawColor).r},${numToRgb(userGifStore.drawColor).g},${numToRgb(userGifStore.drawColor).b})`}
                                            clickHandle={() => {
                                                setPopUp(!popUp)
                                            }}
                                        />
                                    </Box>
                                    <IButton text={gain ? res.string.正在取色 : res.string.取色} clickHandle={() => {
                                        if (gain) {
                                            setRandomColor(false)
                                        }
                                        setGain(!gain)
                                    }}
                                    />
                                    <Box style={{ height: 22, position: 'relative' }} >
                                        <dj.Text w={'auto'} h={20} text={res.string.所有帧率} type={'SubTitle'} />
                                        <dj.SpinBox
                                            w={66}
                                            h={22}
                                            x={103}
                                            min={1}
                                            max={255}
                                            value={userGifStore.frameDelay}
                                            step={1}
                                            setValue={(value: number) => {
                                                if (userGifStore.frameDelay > 255) {
                                                    userGifStore.setFrameDelay(255)
                                                    mobxStore.toastStore.setErr(res.text.输入的时间请勿超过255ms())
                                                } else {
                                                    userGifStore.setFrameDelay(value)
                                                    for (let i = 0; i < userGifStore.delayArr.length; i++) {
                                                        userGifStore.delayArr[i] = value
                                                    }
                                                }
                                            }}
                                            inputing={() => { isKeyStore.setIsinput(true) }}
                                            changeFinished={(value: number) => {
                                                if (userGifStore.frameDelay > 255) {
                                                    for (let i = 0; i < userGifStore.delayArr.length; i++) {
                                                        userGifStore.delayArr[i] = 255
                                                    }
                                                } else {
                                                    userGifStore.setFrameDelay(value)
                                                    for (let i = 0; i < userGifStore.delayArr.length; i++) {
                                                        userGifStore.delayArr[i] = value
                                                    }
                                                }

                                            }}
                                        />
                                    </Box>
                                    <IButton text={res.string.写入} clickHandle={async () => {
                                        if (deviceStore.keyboardOption?.powerSaveMode) {
                                            toastStore.setInfo(res.text.键盘已关闭灯光请打开灯光后重新切换灯效())
                                        } else {
                                            const dev = deviceStore.currentDev?.deviceType
                                            if (dev?.is24) {
                                                let tip = res.text.动态灯效提示()
                                                toastStore.setInfo(tip)
                                                return
                                            }
                                            drawStore.setIsUp(true)
                                            if (await deviceStore.setUserGifStart()) { await sleep(500) }
                                            else {
                                                drawStore.setIsUp(false)
                                                return
                                            }
                                            await loadGif()

                                            drawStore.setIsUp(false)
                                        }

                                    }} />
                                    <IButton text={res.string.保存到我的灯效作品} clickHandle={async () => {
                                        toastStore.setGIFState('bussy', 'save')
                                        await userGifStore.shareKeyboardGIF('', '', true)
                                        toastStore.setGIFState('idle', 'save')
                                    }} />
                                    {/* {!blockCloud && */}
                                    <IButton text={res.string.分享} clickHandle={async () => {
                                        // 设置进度条
                                        toastStore.setGIFState('bussy', 'share')
                                        shareImageStore.setIsLightImgShare(true)
                                        toastStore.setGIFState('idle', 'share')
                                    }} />
                                    {/* } */}

                                    <Box style={{ height: 22 }}>
                                        <dj.CheckBox
                                            checkState={hideDelay}
                                            clickHandle={(e) => { setHideDelay(e.target.checked) }}
                                            type={'Normal'}
                                            text={res.string.隐藏帧率} />
                                    </Box>
                                    <Box style={{ height: 22 }}>
                                        <dj.CheckBox
                                            checkState={randomColor}
                                            clickHandle={(e) => { setRandomColor(e.target.checked) }}
                                            type={'Normal'}
                                            text={res.string.随机颜色} />
                                    </Box>
                                    <Box style={{ height: 22 }}>
                                        <dj.CheckBox
                                            checkState={userGifStore.autoRecord === 'single'}
                                            clickHandle={(e) => {
                                                if (e.target.checked) userGifStore.setAutoRecord('single')
                                                else userGifStore.setAutoRecord(undefined)
                                            }}
                                            type={'Normal'}
                                            text={res.string.自动加帧单} />
                                    </Box>
                                    <Box style={{ height: 22 }}>
                                        <dj.CheckBox
                                            checkState={userGifStore.autoRecord === 'all'}
                                            clickHandle={(e) => {
                                                if (e.target.checked) userGifStore.setAutoRecord('all')
                                                else userGifStore.setAutoRecord(undefined)
                                            }}
                                            type={'Normal'}
                                            text={res.string.自动加帧满} />
                                    </Box>
                                    <IButton text={res.string.撤回自动加帧}
                                        isDisabled={userGifStore.autoRecord === undefined || userGifStore.remeberRecord === undefined}
                                        clickHandle={() => { userGifStore.revokeRecordAutoAdd(currentMaxtrx) }} />
                                    <IButton text={res.string.加帧} clickHandle={() => { userGifStore.addUserPic(currentMaxtrx); setGain(false) }} />
                                    <IButton text={res.string.减当前帧} clickHandle={() => { userGifStore.reduceUserPic(); setGain(false) }} />
                                    <IButton text={res.string.减所有帧} clickHandle={() => { userGifStore.reduceAllUserPic(currentMaxtrx); setGain(false) }} />
                                    <IButton text={res.string.复制上一帧} clickHandle={() => { userGifStore.copyPreFrame(); setGain(false) }} />
                                    <IButton text={res.string.清除颜色} clickHandle={() => { userGifStore.initCurrentUserPic(currentMaxtrx); setGain(false) }} />

                                </div>
                            </Container>
                        </dj.View>}
                    </OutsideAlerter>

                </div>
                {/* } */}


                {deviceStore.keyboardOption?.powerSaveMode && <dj.View
                    h={20}
                    y={452}>
                    <dj.Text
                        x={0}
                        type={'键盘提示'}
                        text={res.text.键盘已关闭灯光请打开灯光后重新切换灯效()}
                    />
                </dj.View>}
                {/* 颜色选择BOX */}
                {popUp && (
                    <dj2.View2 x={589} y={160}>
                        <PopColorPicker
                            color={color}
                            setColor={(rgb) => { userGifStore.setDrawColor(rgb); setPopUp(false); userGifStore.setClickIcon(true) }}
                            clickHandle={setPopUp}
                            direction={'down'}
                        />
                    </dj2.View2>
                )}


            </dj.View>
        )
    })

}



// export const WheelLight = withProps(MouseLight, wheelLightData)
// export const LogoLight = withProps(MouseLight, logoLightData)
export const CustomLight = withProps(UserLight, wheelLightData)
//自定义动态
const ScrollBox = styled.div({
    display: 'flex',
    alignItems: 'center',
    width: 671,
    height: 83,
    overflowX: 'auto',
    overflowY: 'hidden',
    // '&::-webkit-scrollbar': {
    //     height: '6px',
    // },

    // '&::-webkit-scrollbar-thumb': {
    //     background: '#1677ff',
    //     borderRadius: '5px',
    // },
})
const Box = styled.div({
    position: 'relative',
    marginBottom: 15,
    width: 180,
    height: 'auto'
})

const IButton = (p: {
    text: React.ReactNode,
    isDisabled?: boolean
    clickHandle: () => void
}) => {
    return <Box>
        <dj.Button
            w={175}
            h={blockCloud ? 36 : 30}
            relative
            mode={'BorderBackground'}
            text={p.text}
            clickHandle={p.clickHandle}
            isDisabled={p.isDisabled}
        />
    </Box>
}
const NumberInputStyle = styled.input({
    '&::-webkit-inner-spin-button': {
        opacity: 0,
        WebkitAppearance: 'none',
        margin: 0,
        pointerEvents: 'none',
    },
    width: 30,
    height: 30,
    lineHeight: '28px',
    border: '1px solid transparent',
    outline: 'none',
    textAlign: 'center',
    fontSize: 12
})