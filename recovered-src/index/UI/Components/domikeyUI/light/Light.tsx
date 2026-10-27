import React, { Fragment, useState } from 'react'
import { dj, dj2 } from '../../../../dj'
import { res } from '../../../../res'

import { LightRange } from '../../../utils/LightRange'
import { ColorPicker, PopUpBox } from './ColorPicker'

import {
    withProps,
    LightProp,
    wheelLightData,
    logoLightData,
} from '../../../utils/WithProps'

import { KeyboardBlocks } from '../home/Keyboard'
import { numToRgb, rgbToNum } from '../../../../unitys/rgbNum'
import { OutsideAlerter } from '../../../utils/OutsideAlerter'
import { DeviceStore } from '../../../../mobxStore/deviceStore'
import { baseW } from '../../../../screenConfig'

// test文件s
// import styled from '@emotion/styled'
// import { KeyboardLightAnimation } from '../light/test'
import { mobxStore, useStore } from '../../../../mobxStore/store'
import { useObserver } from 'mobx-react-lite'
import { getKeyPath } from '../../keyPath'
import { sleep } from '../../../../unitys/timeFunc'
import { store } from '../../../store'
import { blockCloud } from '../../../../../src/appConfig'
// test文件e


const ColorPickerWidth = 327
const ColorPickerHeight = 335
const NavbarWidth = 269
const DriverWidth = baseW

export const getLightRgb = (light: LightSetting) =>
    numToRgb(('rgb' in light && light.rgb) || 0)

const modeChange = (p: LightProp, type: string) => {
    //找到模式 对应的 type
    const tempType = type.slice(type.indexOf('&') + 1)
    if (tempType === p.light.type) return

    let tmpLayout = p.lightLayout.types.find((v) => v.type === type)
    let tmpLight: any = { type: type }

    const tmp = localStorage.getItem(type)

    if (tmp !== null) {
        tmpLight = JSON.parse(tmp)
    } else {
        if (tmpLayout !== undefined) {
            if (tmpLayout.minSpeed !== undefined && tmpLayout.maxSpeed !== undefined)
                tmpLight.speed = (tmpLayout.maxSpeed - tmpLayout.minSpeed) / 2

            if (tmpLayout.minValue !== undefined && tmpLayout.maxValue !== undefined)
                tmpLight.value = (tmpLayout.maxValue - tmpLayout.minValue) / 2

            if (tmpLayout.rgb !== undefined) tmpLight.rgb = rgbToNum(255, 69, 110)

            if (tmpLayout.options !== undefined) tmpLight.option = tmpLayout.options[0]
        }
    }
    localStorage.setItem(type, JSON.stringify(tmpLight))

    p.setLight(tmpLight)
}

export const modeKeyChange = (p: LightProp, type: string) => {
    const tempType = type.slice(type.indexOf('&') + 1)

    if (tempType === p.light.type) return
    let tmpLayout = p.lightLayout.types.find((v) => v.type === tempType)
    let tmpLight: any = { type: tempType }

    const tmp = localStorage.getItem(type)
    if (tmp !== null) {
        tmpLight = JSON.parse(tmp)
    } else {
        if (tmpLayout !== undefined) {
            if (tmpLayout.minSpeed !== undefined && tmpLayout.maxSpeed !== undefined)
                tmpLight.speed = (tmpLayout.maxSpeed - tmpLayout.minSpeed) / 2

            if (tmpLayout.minValue !== undefined && tmpLayout.maxValue !== undefined)
                tmpLight.value = tmpLayout.maxValue

            if (tmpLayout.rgb !== undefined) tmpLight.rgb = rgbToNum(255, 69, 110)
            if (tmpLayout.dazzle !== undefined) tmpLight.dazzle = true
            if (tmpLayout.options !== undefined) tmpLight.option = tmpLayout.options[0]
        }
    }


    localStorage.setItem(type, JSON.stringify(tmpLight))
    p.setLight(tmpLight)
}
export const lightCurrentLayout = (p: LightProp) => {
    const lightLayout = p.lightLayout.types.find(
        (value: { type: any }) => value.type === p.light.type
    )

    return lightLayout
        ? lightLayout
        : {
            maxSpeed: undefined,
            minSpeed: undefined,
            maxValue: undefined,
            minValue: undefined,
            options: undefined,
            rgb: undefined,
            dazzle: undefined
        }
}

const MouseLight = (p: LightProp) => {
    const onModeChange = (name: string) => modeChange(p, name)
    const layout = lightCurrentLayout(p)

    const isLayoutRgbExit =
        p.lightLayout.isRgb &&
        p.lightLayout.types.find((v) => v.type === p.light.type)?.rgb

    const color = isLayoutRgbExit ? getLightRgb(p.light) : { r: 0, g: 0, b: 0 }

    return (
        <dj.View w={891} h={480} x={0}>
            <dj.View w={280} h={28} x={0} y={30}>
                <dj.Text w={60} x={0} type={'SubTitle'} text={res.string.灯光模式} />
                <dj.ComboBox
                    w={200}
                    h={28}
                    x={70}
                    selectedValue={
                        DeviceStore.lightNameMap[p.light.type]
                            ? DeviceStore.lightNameMap[p.light.type]
                            : p.light.type
                    }
                    onChange={(index) => onModeChange(p.lightLayout.types[index].type)}
                    modes={p.lightLayout.types.map((v: { type: any }) =>
                        DeviceStore.lightNameMap[v.type]
                            ? DeviceStore.lightNameMap[v.type]
                            : v.type
                    )}
                />
            </dj.View>
            <dj.View w={334} h={28} y={101}>
                {layout.minSpeed !== undefined && (
                    <Fragment>
                        <dj.Text
                            w={30}
                            type={'SubTitle'}
                            text={res.string.亮度}
                            isDisabled={false}
                        />
                        <LightRange
                            min={layout.minValue === undefined ? 0 : layout.minValue}
                            max={layout.maxValue === undefined ? 5 : layout.maxValue}
                            leftDescription={res.text.暗()}
                            rightDescription={res.text.明()}
                            value={'speed' in p.light ? p.light.speed : 0}
                            setValue={(value) => {
                                'speed' in p.light &&
                                    p.setLight({
                                        ...p.light,
                                        speed: value,
                                    })
                            }}
                            isDisabled={false}
                        />
                    </Fragment>
                )}
                {layout.minValue !== undefined && (
                    <Fragment>
                        <dj.Text
                            w={30}
                            type={'SubTitle'}
                            text={res.string.速度}
                            isDisabled={false}
                        />
                        <LightRange
                            min={layout.minSpeed === undefined ? 0 : layout.minSpeed}
                            max={layout.maxSpeed === undefined ? 5 : layout.maxSpeed}
                            leftDescription={res.text.慢()}
                            rightDescription={res.text.快()}
                            value={'value' in p.light ? p.light.value : 0}
                            setValue={(value) => {
                                'value' in p.light &&
                                    p.setLight({
                                        ...p.light,
                                        value: value,
                                    })
                            }}
                            isDisabled={false}
                        />
                    </Fragment>
                )}
            </dj.View>
            {isLayoutRgbExit && (
                <dj.Text
                    h={14}
                    y={135}
                    type={'灯光界面提示'}
                    text={'请选择在使用呼吸模式和灯光常亮模式时要使用的颜色'}
                />
            )}
            <dj.View w={ColorPickerWidth} h={ColorPickerHeight} y={187}>
                <ColorPicker
                    color={color}
                    setColor={(rgb: number) =>
                        isLayoutRgbExit &&
                        'rgb' in p.light &&
                        p.setLight({ ...p.light, rgb: rgb })
                    }
                />
            </dj.View>
            {!isLayoutRgbExit && (
                <dj.View w={ColorPickerWidth} h={ColorPickerHeight} y={187}>
                    {''}
                </dj.View>
            )}

            <dj.Img w={186} h={366} x={612} y={52} imgBg={res.img.MG912} />
        </dj.View>
    )
}

export const PopColorPicker = (p: {
    color: { r: number; g: number; b: number }
    setColor: (rgb: number) => void
    clickHandle: (state: boolean) => void
    direction: 'up' | 'down'
    triangleX?: number
}) => {
    const [colorPickerEdit, setColorPickerEdit] = useState(false)

    const clickHanle = () => {
        !colorPickerEdit && p.clickHandle(false)
        setColorPickerEdit(false)
    }
    return (
        <PopUpBox direction={p.direction} triangleX={p.triangleX}>
            <OutsideAlerter clickOutsideHandle={clickHanle}>
                <dj.View>
                    <ColorPicker
                        color={p.color}
                        setColor={p.setColor}
                        setEdit={setColorPickerEdit}
                    />
                </dj.View>
            </OutsideAlerter>
        </PopUpBox>
    )
}

const KeyboardUserPic = (p: LightProp) => {
    const { lightLayout, deviceLayout, lightPic, setLightPic } = p
    //console.error(lightPic)
    const [popUp, setPopUp] = useState(false)
    const [key, setPosition] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
        hid: number;
        index: undefined | number
    }>({
        x: -1,
        y: -1,
        width: -1,
        height: -1,
        hid: -1,
        index: undefined
    })

    const setDegree = (keyHidCode: number, index: number | undefined) => {
        const copy = lightPic.slice()
        // console.error(lightPic);

        const findIndex = copy.findIndex((v) => v.hid === keyHidCode && v.index === index)
        // console.error(copy[findIndex]);

        if (findIndex === -1) return
        if (copy[findIndex].rgb === 0) {
            copy.splice(findIndex, 1, { hid: key.hid, rgb: 13158600, index: index })
        } else {
            copy.splice(findIndex, 1, { hid: key.hid, rgb: 0, index: index })
        }

        // console.error('findIndex', findIndex, key.hid, key.index, keyHidCode, index)
        // findIndex === -1
        //   ? copy.push({ hid: keyHidCode, rgb: 0, index: index })
        //   : copy.splice(findIndex, 1)
        if (index === undefined)
            setLightPic(copy)
    }

    const color = numToRgb(
        lightPic.find((v) => v.hid === key.hid && v.index === key.index) !== undefined
            ? lightPic.find((v) => v.hid === key.hid && v.index === key.index)!.rgb
            : 206
    )

    const setColor = (rgb: number) => {
        const copy = lightPic.slice()
        const findIndex = copy.findIndex((v) => v.hid === key.hid && v.index === key.index)
        //console.error('setColor', findIndex, key.hid, key.index)
        copy.splice(findIndex, 1, { hid: key.hid, rgb: rgb, index: key.index })

        setLightPic(copy)
    }
    const { isKeyStore } = useStore()
    isKeyStore.setColorPickerKey(popUp)

    const mouseDown = (
        keyHidCode: number,
        text: string,
        positionX: number,
        positionY: number,
        width: number,
        height: number,
        index?: number
    ) => {
        setPosition({
            x: positionX,
            y: positionY,
            width: width,
            height: height,
            hid: keyHidCode,
            index: index
        })
    }

    const mouseUp = (
        keyHidCode: number,
        text: string,
        positionX: number,
        positionY: number,
        width: number,
        height: number,
        index?: number
    ) => {
        if (lightLayout.isRgb) setPopUp(true)
        else setDegree(keyHidCode, index)
    }
    const x = key.x + key.width / 2 + ColorPickerWidth / 2 + NavbarWidth > DriverWidth
        ? DriverWidth - ColorPickerWidth - NavbarWidth
        : key.x - ColorPickerWidth / 2 + key.width / 2

    return (
        <Fragment>
            <dj.View w={871} h={288} y={159}>
                <KeyboardBlocks
                    deviceLayout={deviceLayout}
                    changedValue={lightPic.map((v) => {
                        return {
                            hid: v.hid,
                            mode: lightLayout.isRgb
                                ? {
                                    color: `rgb(${numToRgb(v.rgb).r},${numToRgb(v.rgb).g},${numToRgb(v.rgb).b
                                        })`,
                                    type: 'CustomWeight',
                                }
                                : {
                                    color: v.rgb !== 0 ? `rgb(${0xc8},${0xc8},${0xc8})` : 'rgb(0,0,0)',
                                    type: 'CustomWeight',
                                },
                            index: v.index
                        }
                    })}
                    mouseDown={mouseDown}
                    mouseUp={mouseUp}
                    mode={lightLayout.isRgb ? 'Multicolor' : 'Monochrome'}
                />
            </dj.View>

            {popUp && (
                <dj.View
                    x={x}
                    y={key.y - ColorPickerHeight - key.height / 2 + 159}>
                    <PopColorPicker
                        color={color}
                        setColor={setColor}
                        clickHandle={setPopUp}
                        direction={'up'}
                        triangleX={
                            key.x + key.width / 2 - (x) - 9
                        }
                    />
                </dj.View>
            )}
        </Fragment>
    )
}


const KeyboardLight = (p: LightProp) => {
    const onModeChange = (name: string) => modeKeyChange(p, name)
    const layout = lightCurrentLayout(p)

    const [popUp, setPopUp] = useState(false)

    const isLayoutRgbExit = p.lightLayout.isRgb && layout.rgb
    const isLayoutDazzleExit = p.lightLayout.isRgb && layout.dazzle

    const color = isLayoutRgbExit ? getLightRgb(p.light) : { r: 0, g: 0, b: 0 }

    const setColor = (rgb: number) => {
        isLayoutRgbExit && 'rgb' in p.light && p.setLight({ ...p.light, rgb: rgb, dazzle: false })
    }
    const { isKeyStore } = useStore()
    const { lightPageStore } = useStore()
    isKeyStore.setColorPickerKey(popUp)
    // console.error('KKKKKKEEEEEEYYYYYY',isKeyStore.lightKey && isKeyStore.colorPickerKey && isKeyStore.loginTipBoxKey);

    // document.onkeydown = () => {
    //     if (isKeyStore.lightKey && !isKeyStore.colorPickerKey && !isKeyStore.loginTipBoxKey && lightPageStore.pageIndex !== 2) {
    //         // console.error('无法输入');
    //         if (isKeyStore.isShare) {
    //             return true
    //         }
    //         return false
    //     }
    //     else {
    //         // console.error('输入ing');
    //         return true
    //     }
    // }

    const { deviceStore } = useStore()
    const { screenStore } = useStore()

    const id = deviceStore.currentDev?.deviceType.id
    const keyPath = getKeyPath()

    const screenArr = new Array();
    screenStore.getScreenArr();
    for (let i = 0; i < screenStore.screenArr.length; i++) {
        screenArr.push(res.text.屏幕() + (i + 1));
    }

    if (p.lightLayout.isFormal) {
        deviceStore.setFormalLightName()
    }
    return useObserver(() => {
        return (
            <dj.View w={891} h={480} x={0}>
                <dj.FlexView
                    flexDirection={'column'}
                    w={890}
                    h={110}
                    justifyContent={'space-between'}>
                    <dj.View relative w={890} h={28} y={30}>
                        {/* 灯光模式 */}
                        <dj.View w={280} h={28} x={0}>
                            <dj.FlexView
                                w={85}
                                style={{
                                    borderRadius: '30px 0 0 30px',
                                    background: '#fff',
                                    border: '1px solid #d0d1d1',
                                    borderRight: 'none'
                                }}
                            >
                                <dj.Text w={60} x={18} y={5} type={'Domikey_text'} text={res.string.灯光模式} />
                            </dj.FlexView>
                            <dj.MyComboBoxMui
                                className='notoutside'
                                w={200}
                                x={85}
                                selectedValue={
                                    DeviceStore.lightNameMap[p.light.type]
                                        ? DeviceStore.lightNameMap[p.light.type]
                                        : p.light.type}
                                // onChange={(index) => {
                                //   if (index !== deviceStore.currentProfile) {
                                //     deviceStore.setCurrentProfile(index)
                                //   }
                                // }}
                                // modes={changeList}
                                clickHandle={() => {
                                    if (deviceStore.keyboardOption?.powerSaveMode) return
                                    const name = id + '&' + p.light.type
                                    // localStorage.setItem(p.light.type, JSON.stringify(p.light))
                                    localStorage.setItem(name, JSON.stringify(p.light))
                                    isKeyStore.setIsShowLightSelect(!isKeyStore.isShowLightSelect);
                                    isKeyStore.setIsShowLightMethodSelect(false);
                                }}
                            />
                            {/* <dj.ComboBox
                                w={200}
                                h={28}
                                x={70}
                                selectedValue={
                                    DeviceStore.lightNameMap[p.light.type]
                                        ? DeviceStore.lightNameMap[p.light.type]
                                        : p.light.type
                                }
                                onChange={(index) => {
                                    if (deviceStore.keyboardOption?.powerSaveMode) return
                                    const type = id + '&' + p.lightLayout.types[index].type
                                    onModeChange(type)
                                }}
                                modes={
                                    deviceStore.keyboardOption?.powerSaveMode
                                        ? [res.text.关闭()]
                                        : p.lightLayout.types.map((v: { type: any }) =>
                                            DeviceStore.lightNameMap[v.type]
                                                ? DeviceStore.lightNameMap[v.type]
                                                : v.type
                                        )
                                }
                                clickHandle={() => {
                                    if (deviceStore.keyboardOption?.powerSaveMode) return
                                    const name = id + '&' + p.light.type
                                    // localStorage.setItem(p.light.type, JSON.stringify(p.light))
                                    localStorage.setItem(name, JSON.stringify(p.light))
                                }}
                            /> */}
                        </dj.View>

                        {/* speed */}
                        <dj.View w={334} h={28} x={332}>
                            <dj.FlexView
                                w={68}
                                style={{
                                    borderRadius: '30px 0 0 30px',
                                    background: '#fff',
                                    border: '1px solid #d0d1d1',
                                    borderRight: 'none'
                                }}
                            >
                                <dj.Text
                                    w={50}
                                    x={10}
                                    y={5}
                                    type={'Domikey_text'}
                                    text={res.string.速度}
                                    isDisabled={layout.minSpeed === undefined || (!!deviceStore.keyboardOption?.powerSaveMode)}
                                />
                            </dj.FlexView>
                            <dj.FlexView
                                w={305}
                                x={68}
                                style={{
                                    borderRadius: '0 30px 30px 0',
                                    background: '#fff',
                                    border: '1px solid #d0d1d1',
                                    borderRight: 'none'
                                }}
                            >
                                <dj.LightRange
                                    x={10}
                                    y={4}
                                    min={layout.minSpeed === undefined ? 0 : layout.minSpeed}
                                    max={layout.maxSpeed === undefined ? 4 : layout.maxSpeed}
                                    value={'speed' in p.light ? p.light.speed : 0}
                                    setValue={(value) => {
                                        'speed' in p.light &&
                                            p.setLight({
                                                ...p.light,
                                                speed: value,
                                            })
                                    }}
                                    leftDescription={res.text.慢()}
                                    rightDescription={res.text.快()}
                                    isDisabled={layout.minSpeed === undefined || (!!deviceStore.keyboardOption?.powerSaveMode)}
                                />
                            </dj.FlexView>
                        </dj.View>
                        {/* 当前使用颜色 */}
                        <dj.View w={120} h={28} x={727}>
                            {isLayoutRgbExit && !deviceStore.keyboardOption?.powerSaveMode && (
                                <Fragment>
                                    <dj.FlexView
                                        w={blockCloud ? 90 : 85}
                                        style={{
                                            borderRadius: '30px 0 0 30px',
                                            background: '#fff',
                                            border: '1px solid #d0d1d1',
                                            borderRight: 'none'
                                        }}
                                    >
                                        <dj.Text
                                            h={26}
                                            x={5}
                                            y={5}
                                            type={'Domikey_text'}
                                            text={res.string.当前色彩}
                                        />
                                    </dj.FlexView>
                                    <dj.FlexView
                                        w={65}
                                        x={blockCloud ? 90 : 85}
                                        style={{
                                            borderRadius: '0 30px 30px 0',
                                            background: '#fff',
                                            border: '1px solid #d0d1d1',
                                            borderRight: 'none'
                                        }}
                                    >
                                        <dj.ColorBlock
                                            w={40}
                                            h={22}
                                            x={22}
                                            y={3}
                                            bg={`rgb(${color.r},${color.g},${color.b})`}
                                            clickHandle={() => {
                                                setPopUp(!popUp)
                                            }}
                                        />
                                    </dj.FlexView>

                                </Fragment>
                            )}
                        </dj.View>

                        {/* {p.light.type === 'LightScreenColor' && !deviceStore.keyboardOption?.powerSaveMode
                            && <dj.View w={120} h={56} x={727}>
                                <div style={{
                                    width: 120,
                                    height: 56,
                                }}>
                                    <dj.ColorBlock
                                        w={120}
                                        h={56}
                                        y={0}
                                        bg={`rgba(
                  ${screenStore.screenDataArray[0]},
                  ${screenStore.screenDataArray[1]},
                  ${screenStore.screenDataArray[2]},
                  ${screenStore.screenDataArray[3] / 255}
                  )`}
                                    />
                                </div>
                            </dj.View>} */}

                    </dj.View>

                    <dj.View relative w={871} h={28} y={(process.platform !== 'darwin' && !deviceStore.keyboardOption?.powerSaveMode && p.light.type === 'LightMusicFollow2') ? -9 : 0}>
                        {/* Options */}
                        <dj.View w={280} h={28} x={0}>
                            <dj.FlexView
                                w={85}
                                style={{
                                    borderRadius: '30px 0 0 30px',
                                    background: '#fff',
                                    border: '1px solid #d0d1d1',
                                    borderRight: 'none'
                                }}
                            >
                                <dj.Text
                                    w={60} x={18} y={5}
                                    type={'Domikey_text'}
                                    text={res.text.播放方式()}
                                    isDisabled={layout.options === undefined && p.light.type !== "LightScreenColor" || (!!deviceStore.keyboardOption?.powerSaveMode)}
                                />
                            </dj.FlexView>
                            <dj.MyComboBoxMui
                                className='notoutside'
                                w={200}
                                x={85}
                                selectedValue={
                                    'option' in p.light && p.light.option && layout.options
                                        ? (DeviceStore.optionNameMap[p.light.option] ? DeviceStore.optionNameMap[p.light.option] : p.light.option)
                                        : undefined
                                }
                                // onChange={(index) => {
                                //   if (index !== deviceStore.currentProfile) {
                                //     deviceStore.setCurrentProfile(index)
                                //   }
                                // }}
                                // modes={changeList}
                                clickHandle={() => {
                                    if (layout.options === undefined && p.light.type !== "LightScreenColor" || (!!deviceStore.keyboardOption?.powerSaveMode)) {

                                    } else {
                                        isKeyStore.setIsShowLightMethodSelect(!isKeyStore.isShowLightMethodSelect);
                                        isKeyStore.setIsShowLightSelect(false);
                                    }
                                }}
                            />
                            {/* <dj.ComboBox
                                w={200}
                                h={28}
                                x={70}
                                onChange={async (index: number) => {
                                    if (p.light.type !== "LightScreenColor") {
                                        'option' in p.light &&
                                            layout.options &&
                                            p.setLight({ ...p.light, option: layout.options[index] })
                                    } else {

                                        mobxStore.toastStore.setState('bussy', 'screen')
                                        await sleep(2000)
                                        screenStore.setScreenIndex(index)
                                        mobxStore.toastStore.setState('idle', 'screen')
                                    }
                                }}
                                selectedValue={
                                    p.light.type === "LightScreenColor"
                                        ? screenArr[screenStore.screenIndex]
                                        : 'option' in p.light && p.light.option
                                            ? (DeviceStore.optionNameMap[p.light.option] ? DeviceStore.optionNameMap[p.light.option] : p.light.option)
                                            : undefined
                                }
                                // modes={layout.options === undefined ? [] : layout.options}
                                modes={
                                    deviceStore.keyboardOption?.powerSaveMode
                                        ? []
                                        : p.light.type === "LightScreenColor"
                                            ? screenArr
                                            : layout.options === undefined
                                                ? []
                                                : layout.options
                                                    ? layout.options.map((v: string) => DeviceStore.optionNameMap[v] ? DeviceStore.optionNameMap[v] : v)
                                                    : []
                                }
                                isDisabled={layout.options === undefined && p.light.type !== "LightScreenColor" || (!!deviceStore.keyboardOption?.powerSaveMode)}
                            /> */}
                        </dj.View>

                        {/* 亮度 */}
                        <dj.View w={334} h={28} x={332}>
                            <dj.FlexView
                                w={68}
                                style={{
                                    borderRadius: '30px 0 0 30px',
                                    background: '#fff',
                                    border: '1px solid #d0d1d1',
                                    borderRight: 'none'
                                }}
                            >
                                <dj.Text
                                    w={58}
                                    x={10}
                                    y={5}
                                    type={'Domikey_text'}
                                    text={res.string.亮度}
                                    isDisabled={layout.minValue === undefined || (!!deviceStore.keyboardOption?.powerSaveMode)}
                                />
                            </dj.FlexView>
                            <dj.FlexView
                                w={305}
                                x={68}
                                style={{
                                    borderRadius: '0 30px 30px 0',
                                    background: '#fff',
                                    border: '1px solid #d0d1d1',
                                    borderRight: 'none'
                                }}
                            >
                                <dj.LightRange
                                    x={10}
                                    y={4}
                                    min={layout.minValue === undefined ? 0 : layout.minValue}
                                    max={layout.maxValue === undefined ? 5 : layout.maxValue}
                                    leftDescription={res.text.暗()}
                                    rightDescription={res.text.明()}
                                    value={p.light.type === "LightScreenColor" ? 0 : 'value' in p.light ? p.light.value : 0}
                                    setValue={(value) => {
                                        'value' in p.light &&
                                            p.setLight({
                                                ...p.light,
                                                value: value,
                                            })

                                        // remberLight(p.light.type, p.light, 'value', value)
                                    }}
                                    isDisabled={layout.minValue === undefined || (!!deviceStore.keyboardOption?.powerSaveMode)}
                                />
                            </dj.FlexView>
                        </dj.View>
                    </dj.View>

                    <dj.View w={120} h={28} x={727} y={(process.platform !== 'darwin' && !deviceStore.keyboardOption?.powerSaveMode && p.light.type === 'LightMusicFollow2') ? 72 : 82}>
                        {isLayoutDazzleExit && !deviceStore.keyboardOption?.powerSaveMode && (
                            <Fragment>
                                <dj.FlexView
                                    w={blockCloud ? 90 : 85}
                                    style={{
                                        borderRadius: '30px 0 0 30px',
                                        background: '#fff',
                                        border: '1px solid #d0d1d1',
                                        borderRight: 'none'
                                    }}
                                >
                                    <dj.Text
                                        w={blockCloud ? 90 : 85}
                                        h={26}
                                        x={5}
                                        y={5}
                                        type={'Domikey_text'}
                                        text={res.string.RGB炫彩}
                                    />
                                </dj.FlexView>
                                <dj.FlexView
                                    w={65}
                                    x={blockCloud ? 90 : 85}
                                    style={{
                                        borderRadius: '0 30px 30px 0',
                                        background: '#fff',
                                        border: '1px solid #d0d1d1',
                                        borderRight: 'none'
                                    }}
                                >
                                    <dj.SwitchButton
                                        x={22}
                                        y={4}
                                        skey={p.light.dazzle}
                                        clickHandle={() => {
                                            isKeyStore.setDazzleKey(!p.light.dazzle)
                                            p.setLight({ ...p.light, dazzle: isKeyStore.dazzleKey })
                                        }}
                                        dazzle={true} />
                                </dj.FlexView>
                                {/* <dj.DazzleColorCheckBox
                                    w={80}
                                    h={16}
                                    y={0}
                                    text={res.string.炫彩}
                                    isBool={true}
                                    checkState={p.light.dazzle === undefined ? false : p.light.dazzle}
                                    type={'SubTitle_domikey'}
                                    clickHandle={() => {
                                        isKeyStore.setDazzleKey(!p.light.dazzle)
                                        p.setLight({ ...p.light, dazzle: isKeyStore.dazzleKey })
                                    }}
                                ></dj.DazzleColorCheckBox> */}
                            </Fragment>
                        )}
                    </dj.View>
                    {process.platform !== 'darwin' && !deviceStore.keyboardOption?.powerSaveMode && p.light.type === 'LightMusicFollow2' && <dj.View w={280} h={28} x={0} y={114}>
                        <dj.FlexView
                            w={85}
                            style={{
                                borderRadius: '30px 0 0 30px',
                                background: '#fff',
                                border: '1px solid #d0d1d1',
                                borderRight: 'none'
                            }}
                        >
                            <dj.Text
                                w={65}
                                x={18}
                                y={5}
                                type={'Domikey_text'}
                                text={res.text.音频驱动()}
                            />
                        </dj.FlexView>
                        <dj.MyComboBoxMui
                            w={200}
                            h={28}
                            x={85}
                            className='notoutside'
                            clickHandle={() => {
                                isKeyStore.setIsMusicSelect(!isKeyStore.isMusicSelect);
                            }}
                            selectedValue={deviceStore.isMusicNative ? 'RY Native' : 'wasapi'}
                        />

                    </dj.View>
                    }
                </dj.FlexView>

                {/* ---------- 灯光模式选择 --------- */}
                {
                    isKeyStore.isShowLightSelect &&
                    <OutsideAlerter
                        clickOutsideHandle={() => {
                            isKeyStore.setIsShowLightSelect(false)
                        }}
                    >
                        <dj.ComboBoxSelect
                            w={200}
                            h={300}
                            x={85}
                            y={58}
                            zIndex={999}
                            overflow={'hidden scroll'}
                            modes={
                                deviceStore.keyboardOption?.powerSaveMode
                                    ? [res.text.关闭()]
                                    : p.lightLayout.types.map((v: { type: any }) =>
                                        DeviceStore.lightNameMap[v.type]
                                            ? DeviceStore.lightNameMap[v.type]
                                            : v.type
                                    )
                            }
                            onChange={(index) => {
                                if (deviceStore.keyboardOption?.powerSaveMode) return
                                const type = id + '&' + p.lightLayout.types[index].type
                                onModeChange(type)
                                isKeyStore.setIsShowLightSelect(false);

                            }}
                        />
                    </OutsideAlerter>
                }

                {/* ---------- 灯光模式播放方式选择 --------- */}
                {
                    isKeyStore.isShowLightMethodSelect &&
                    <OutsideAlerter
                        clickOutsideHandle={() => {
                            isKeyStore.setIsShowLightMethodSelect(false)
                        }}
                    >
                        <dj.ComboBoxSelect
                            w={200}
                            h={p.light.type === "LightScreenColor" ? screenArr.length == 1 ? 30 : 60 : layout.options === undefined
                                ? 0 : layout.options?.length <= 1 ? 30 : 60}
                            x={85}
                            y={110}
                            zIndex={999}
                            overflow={'hidden scroll'}
                            modes={
                                deviceStore.keyboardOption?.powerSaveMode
                                    ? []
                                    : p.light.type === "LightScreenColor"
                                        ? screenArr
                                        : layout.options === undefined
                                            ? []
                                            : layout.options
                                                ? layout.options.map((v: string) => DeviceStore.optionNameMap[v] ? DeviceStore.optionNameMap[v] : v)
                                                : []
                            }
                            onChange={async (index: number) => {
                                if (p.light.type !== "LightScreenColor") {
                                    'option' in p.light &&
                                        layout.options &&
                                        p.light.option != layout.options[index] &&
                                        p.setLight({ ...p.light, option: layout.options[index] })

                                } else {
                                    if (screenStore.screenIndex == index) {

                                    } else {
                                        mobxStore.toastStore.setState('bussy', 'screen')
                                        await sleep(2000)
                                        screenStore.setScreenIndex(index)
                                        mobxStore.toastStore.setState('idle', 'screen')
                                    }
                                }
                                isKeyStore.setIsShowLightMethodSelect(false);
                            }}
                        />
                    </OutsideAlerter>
                }
                {/* ---------- 经典模式播放方式选择 --------- */}
                {
                    isKeyStore.isMusicSelect &&
                    <OutsideAlerter
                        clickOutsideHandle={() => {
                            isKeyStore.setIsMusicSelect(false)
                        }}
                    >
                        <dj.ComboBoxSelect
                            w={200}
                            h={60}
                            x={85}
                            y={58}
                            zIndex={999}
                            modes={['wasapi', 'RY Native']}
                            onChange={(index) => {
                                deviceStore.setIsMusicNative(Boolean(index))
                                isKeyStore.setIsMusicSelect(false);
                            }}
                        />
                    </OutsideAlerter>
                }
                {process.platform !== 'darwin' && !deviceStore.keyboardOption?.powerSaveMode && p.light.type === 'LightMusicFollow2' && <dj.HelpBox x={286} y={114} zIndex={999} title={res.text.如果wasapi线路无法正常输出请更换RYNative线路()} />}

                {deviceStore.keyboardOption?.powerSaveMode && <dj.View
                    h={20}
                    y={125}
                    x={(process.platform !== 'darwin' && !deviceStore.keyboardOption?.powerSaveMode && p.light.type === 'LightMusicFollow2') ? 330 : 0}>
                    <dj.Text
                        x={0}
                        type={'键盘提示'}
                        text={res.text.键盘已关闭灯光请打开灯光后重新切换灯效()}
                    />
                </dj.View>}
                {/* 键盘图 */}
                <dj.Img
                    w={871}
                    h={288}
                    y={159}
                    imgBg={
                        p.deviceName
                            ? keyPath
                            : res.img.MG912
                    }
                />

                {/* 颜色选择BOX */}
                {isLayoutRgbExit && popUp && (
                    <dj2.View2 x={690} y={60}>
                        <PopColorPicker
                            color={color}
                            setColor={setColor}
                            clickHandle={setPopUp}
                            direction={'down'}
                        />
                    </dj2.View2>
                )}


                {/* 遮罩层 */}
                {p.light.type === 'LightUserPicture' && <KeyboardUserPic {...p} />}
                {/* 
          关闭    LightOff
          常亮    LightAlwaysOn       有色盘
          呼吸    LightBreath         有色盘
          光波    LightWave    
          涟漪    LightRipple         有色盘
          雨滴    LightRaindrop       有色盘
          蛇形    LightSnake          有色盘
          跟随    LightPressAction    有色盘
          聚合    LightConverage      有色盘
          霓虹    LightNeon
          自定义  LightUserPicture
        */}
            </dj.View>
        )
    })

}



export const WheelLight = withProps(MouseLight, wheelLightData)
export const LogoLight = withProps(MouseLight, logoLightData)
export const RGBLight = withProps(KeyboardLight, wheelLightData)