import React, { Fragment, useEffect, useState } from 'react'
import { dj, dj2 } from '../../../dj'
import { res } from '../../../res'

import { LightRange } from '../../utils/LightRange'
import { ColorPicker, PopUpBox } from './ColorPicker'

import {
    withProps,
    LightProp,
    wheelLightData,
    logoLightData,
} from '../../utils/WithProps'

import { KeyboardBlocks } from '../home/Keyboard'
import { numToRgb, rgbToNum } from '../../../unitys/rgbNum'
import { OutsideAlerter } from '../../utils/OutsideAlerter'
import { DeviceStore } from '../../../mobxStore/deviceStore'
import { baseW } from '../../../screenConfig'

// test文件s
// import styled from '@emotion/styled'
// import { KeyboardLightAnimation } from '../light/test'
import { mobxStore, useStore } from '../../../mobxStore/store'
import { useObserver } from 'mobx-react-lite'
import { getKeyPath } from '../keyPath'
import { sleep } from '../../../unitys/timeFunc'
import { supportSONIXDev } from '../../../supportDev'
import { equals } from 'ramda'
import { blockCloud } from '../../../appConfig'
import { CustomLight } from './UserLight'
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

            if (tmpLayout.rgb !== undefined) tmpLight.rgb = rgbToNum(188, 188, 188)

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

            if (tmpLayout.rgb !== undefined) tmpLight.rgb = rgbToNum(188, 188, 188)
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
    const isLayoutDazzleExit = p.lightLayout.isRgb && layout.dazzle
    const { isKeyStore } = useStore()
    return (
        <dj.View w={891} h={480} x={0}>
            <dj.View w={280} h={35} x={0} y={30}>
                <dj.Text w={70} x={0} type={'SubTitle'} text={res.string.灯光模式} />
                <dj.ComboBox
                    w={200}
                    h={28}
                    x={79}
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
            <dj.View w={334} h={60} y={72}>
                {layout.minValue !== undefined && (
                    <dj.View w={334} h={35} x={0}>
                        <dj.Text
                            w={80}
                            classname={'autoWidth'}
                            type={'SubTitle'}
                            text={res.string.亮度}
                            isDisabled={layout.minValue === undefined}
                        />
                        <LightRange
                            min={layout.minValue === undefined ? 0 : layout.minValue}
                            max={layout.maxValue === undefined ? 5 : layout.maxValue}
                            leftDescription={res.text.暗()}
                            rightDescription={res.text.明()}
                            value={'value' in p.light ? p.light.value : 0}
                            setValue={(value) => {
                                'value' in p.light &&
                                    p.setLight({
                                        ...p.light,
                                        value: value,
                                    })
                            }}
                            isDisabled={layout.minValue === undefined}
                        />
                    </dj.View>
                )}
                {layout.minSpeed !== undefined && (
                    <dj.View w={334} h={35} y={28}>
                        <dj.Text
                            w={blockCloud ? 80 : 70}
                            x={0}
                            classname={'autoWidth'}
                            type={'SubTitle'}
                            text={res.string.速度}
                            isDisabled={layout.minSpeed === undefined}
                        />
                        <LightRange
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
                            isDisabled={layout.minSpeed === undefined}
                        />
                    </dj.View>
                )}
            </dj.View>
            {
                isLayoutRgbExit && (
                    <dj.Text
                        h={14}
                        y={135}
                        type={'灯光界面提示'}
                        text={res.string.请选择在使用呼吸模式和灯光常亮模式时要使用的颜色}
                    />
                )
            }
            <dj.View w={120} h={28} x={0} y={160}>
                {isLayoutDazzleExit && (
                    <Fragment>
                        <dj.DazzleColorCheckBox
                            w={60}
                            h={16}
                            y={0}
                            text={res.string.炫彩}
                            isBool={true}
                            checkState={p.light.dazzle === undefined ? false : p.light.dazzle}
                            type={'Normal'}
                            clickHandle={() => {
                                isKeyStore.setDazzleKey(!p.light.dazzle)
                                p.setLight({ ...p.light, dazzle: isKeyStore.dazzleKey })
                            }}
                        ></dj.DazzleColorCheckBox>
                    </Fragment>
                )}
            </dj.View>
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
            {
                !isLayoutRgbExit && (
                    <dj.View w={ColorPickerWidth} h={ColorPickerHeight} y={187}>
                        {''}
                    </dj.View>
                )
            }

            <dj.Img w={186} h={366} x={612} y={52} imgBg={res.img.MG912} />
        </dj.View >
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
    const { isKeyStore, userPicStore } = useStore()
    //console.error(lightPic)
    // const [popUp, setPopUp] = useState(false)
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
            copy.splice(findIndex, 1, { hid: keyHidCode, rgb: 13158600, index: index })
        } else {
            copy.splice(findIndex, 1, { hid: keyHidCode, rgb: 0, index: index })
        }

        // console.error('findIndex', findIndex, key.hid, key.index, keyHidCode, index)
        // findIndex === -1
        //   ? copy.push({ hid: keyHidCode, rgb: 0, index: index })
        //   : copy.splice(findIndex, 1)
        if (index === undefined && !isKeyStore.isMultiSelect)
            setLightPic(copy, copy[findIndex])
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

        setLightPic(copy, copy[findIndex])
    }

    const mouseDown = (
        keyHidCode: number,
        text: string,
        positionX: number,
        positionY: number,
        width: number,
        height: number,
        index?: number,
    ) => {
        setPosition({
            x: positionX,
            y: positionY,
            width: width,
            height: height,
            hid: keyHidCode,
            index: index
        })
        // console.error('点击到拉', keyHidCode);
        const tmpI = userPicStore.colorArr.findIndex(v => (v.hid === keyHidCode) && (v.index === index))

        if (tmpI !== -1 && isKeyStore.isMultiSelect) {
            userPicStore.colorArr.splice(tmpI, 1, {
                x: positionX,
                y: positionY,
                width: width,
                height: height,
                hid: keyHidCode,
                index: index,
                rgb: {
                    r: userPicStore.userColor.r,
                    g: userPicStore.userColor.g,
                    b: userPicStore.userColor.b,
                }
            })
            return
        }
        if (keyHidCode !== -1 && isKeyStore.isMultiSelect) {
            // console.error('push ------------ ', {
            //     x: positionX,
            //     y: positionY,
            //     width: width,
            //     height: height,
            //     hid: keyHidCode,
            //     index: index,
            //     rgb: {
            //         r: userPicStore.userColor.r,
            //         g: userPicStore.userColor.g,
            //         b: userPicStore.userColor.b,
            //     }
            // });
            userPicStore.colorArr.push({
                x: positionX,
                y: positionY,
                width: width,
                height: height,
                hid: keyHidCode,
                index: index,
                rgb: {
                    r: userPicStore.userColor.r,
                    g: userPicStore.userColor.g,
                    b: userPicStore.userColor.b,
                }
            })

        }
        if (p.lightLayout.isRgb) {
            isKeyStore.setColorPickerKey(true)
        }
        // userPicStore.colorArr.map((v, i) => {
        //     console.error(v);
        // })
        // console.error('------------------------');


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
        if (lightLayout.isRgb) userPicStore.setPopUp(true)
        else setDegree(keyHidCode, index)
    }
    const x = key.x + key.width / 2 + ColorPickerWidth / 2 + NavbarWidth > DriverWidth
        ? DriverWidth - ColorPickerWidth - NavbarWidth
        : key.x - ColorPickerWidth / 2 + key.width / 2


    return useObserver(() => {
        return (
            <Fragment>
                <dj.View w={871} h={288} y={159}>
                    <KeyboardBlocks
                        deviceLayout={deviceLayout}
                        changedValue={lightPic.map((v) => {
                            if (isKeyStore.isMultiSelect) {
                                let tmp = userPicStore.colorArr.find(uv => (uv.hid === v.hid) && (uv.index === v.index))
                                if (tmp !== undefined)
                                    return {
                                        hid: v.hid,
                                        mode: lightLayout.isRgb
                                            ? {
                                                color: `rgb(${tmp.rgb.r},${tmp.rgb.g},${tmp.rgb.b
                                                    })`,
                                                type: 'CustomWeight',
                                            }
                                            : {
                                                color: `rgb(${tmp.rgb.r},${tmp.rgb.g},${tmp.rgb.b
                                                    })`,
                                                type: 'CustomWeight',
                                            },
                                        index: v.index
                                    }
                            }
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

                {userPicStore.popUp && !isKeyStore.isMultiSelect && (
                    <dj.View
                        zIndex={2}
                        x={x}
                        y={key.y - ColorPickerHeight - key.height / 2 + 159}>
                        <PopColorPicker
                            color={color}
                            setColor={setColor}
                            clickHandle={userPicStore.setPopUp}
                            direction={'up'}
                            triangleX={
                                key.x + key.width / 2 - (x) - 9
                            }
                        />
                    </dj.View>
                )}
            </Fragment>
        )
    })
}


const KeyboardLight = (p: LightProp) => {
    const { isKeyStore, userPicStore } = useStore()
    const onModeChange = (name: string) => modeKeyChange(p, name)
    const layout = lightCurrentLayout(p)

    const [popUp, setPopUp] = useState(false)

    const isLayoutRgbExit = p.lightLayout.isRgb && layout.rgb
    const isLayoutDazzleExit = p.lightLayout.isRgb && layout.dazzle

    const color = isLayoutRgbExit ? getLightRgb(p.light) : { r: 0, g: 0, b: 0 }

    const setColor = (rgb: number) => {
        isLayoutRgbExit && 'rgb' in p.light && p.setLight({ ...p.light, rgb: rgb, dazzle: false })
    }

    const setCustomColor = (rgb: number) => {
        userPicStore.userColor = {
            r: numToRgb(rgb).r,
            g: numToRgb(rgb).g,
            b: numToRgb(rgb).b
        }
        userPicStore.setPopUp(false)
        setPopUp(false)
    }

    isKeyStore.setColorPickerKey(userPicStore.popUp || popUp)
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
    screenStore.getScreenArr()
    for (let i = 0; i < screenStore.screenArr.length; i++) {
        screenArr.push(res.text.屏幕() + (i + 1));
    }

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
    useEffect(() => {
        const name = id + '&' + p.light.type
        localStorage.setItem(name, JSON.stringify(p.light))
    }, [p.light])
    return useObserver(() => {
        return (
            <dj.View w={891} h={480} x={0} y={30}>
                {p.light.type !== 'LightUserColor' &&
                    <div>
                        <dj.FlexView
                            flexDirection={'column'}
                            w={871}
                            h={85}
                            justifyContent={'space-between'}>
                            <dj.View relative w={871} h={35}>
                                {/* 灯光模式 */}
                                <dj.View w={280} h={35} x={0}>
                                    <dj.Text w={82} x={0} type={'SubTitle'} classname={'autoWidth'} text={res.string.灯光模式} />
                                    <dj.ComboBox
                                        w={200}
                                        h={28}
                                        x={86}
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
                                </dj.View>

                                {/* speed */}
                                <dj.View w={334} h={35} x={332}>
                                    <dj.Text
                                        w={blockCloud ? 80 : 70}
                                        x={0}
                                        classname={'autoWidth'}
                                        type={'SubTitle'}
                                        text={res.string.速度}
                                        isDisabled={layout.minSpeed === undefined || (!!deviceStore.keyboardOption?.powerSaveMode)}
                                    />
                                    <LightRange
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
                                </dj.View>
                                {/* 当前使用颜色 */}
                                <dj.View w={120} h={35} x={727}>
                                    {isLayoutRgbExit && !deviceStore.keyboardOption?.powerSaveMode && (
                                        <Fragment>
                                            <dj.ColorBlock
                                                w={16}
                                                h={16}
                                                y={0}
                                                bg={`rgb(${color.r},${color.g},${color.b})`}
                                                clickHandle={() => {
                                                    setPopUp(!popUp)
                                                }}
                                            />

                                            <dj.Text
                                                w={127}
                                                h={34}
                                                x={28}
                                                y={-0}
                                                type={'SubTitle'}
                                                text={res.string.当前使用颜色}
                                            />
                                        </Fragment>
                                    )}
                                </dj.View>

                            </dj.View>

                            <dj.View relative w={871} h={35}>
                                {/* Options */}
                                <dj.View w={280} h={35} x={0}>
                                    <dj.Text
                                        w={82}
                                        x={0}
                                        classname={'autoWidth'}
                                        type={'SubTitle'}
                                        text={res.text.播放方式()}
                                        isDisabled={layout.options === undefined && p.light.type !== "LightScreenColor" || (!!deviceStore.keyboardOption?.powerSaveMode)}
                                    />
                                    <dj.ComboBox
                                        w={200}
                                        h={28}
                                        x={86}
                                        onChange={async (index: number) => {
                                            if (p.light.type !== "LightScreenColor") {
                                                const light = p.lightLayout.types.find(v => equals(v.type, p.light.type))

                                                if (light !== undefined) {
                                                    layout.options &&
                                                        p.setLight({ ...p.light, option: layout.options[index] })
                                                }
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
                                                : 'option' in p.light && p.light.option && layout.options
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
                                    />
                                </dj.View>

                                {/* 亮度 */}
                                <dj.View w={334} h={35} x={332}>
                                    <dj.Text
                                        w={80}
                                        classname={'autoWidth'}
                                        type={'SubTitle'}
                                        text={res.string.亮度}
                                        isDisabled={layout.minValue === undefined || (!!deviceStore.keyboardOption?.powerSaveMode)}
                                    />
                                    <LightRange
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
                                </dj.View>
                            </dj.View>

                            <dj.View w={120} h={35} x={727} y={53}>
                                {isLayoutDazzleExit && !deviceStore.keyboardOption?.powerSaveMode && (
                                    <Fragment>
                                        <dj.DazzleColorCheckBox
                                            w={100}
                                            h={20}
                                            y={0}
                                            text={res.string.炫彩}
                                            isBool={true}
                                            checkState={p.light.dazzle === undefined ? false : p.light.dazzle}
                                            type={'SubTitle'}
                                            clickHandle={() => {
                                                isKeyStore.setDazzleKey(!p.light.dazzle)
                                                p.setLight({ ...p.light, dazzle: isKeyStore.dazzleKey })
                                            }}
                                        ></dj.DazzleColorCheckBox>
                                    </Fragment>
                                )}
                            </dj.View>
                        </dj.FlexView>

                        {process.platform !== 'darwin' && !deviceStore.keyboardOption?.powerSaveMode && p.light.type === 'LightMusicFollow2' && <dj.View w={280} h={35} x={0} y={103} zIndex={2}>
                            <dj.Text
                                w={82}
                                classname={'autoWidth'}
                                x={0}
                                type={'SubTitle'}
                                text={res.text.音频驱动()}
                            />
                            <dj.ComboBox
                                w={200}
                                h={28}
                                x={86}
                                onChange={async (index: number) => {
                                    deviceStore.setIsMusicNative(Boolean(index))
                                }}
                                selectedValue={deviceStore.isMusicNative ? 'RY Native' : 'wasapi'}
                                modes={['wasapi', 'RY Native']}
                            />

                            <dj.HelpBox x={286} y={2} title={res.text.如果wasapi线路无法正常输出请更换RYNative线路()} />
                        </dj.View>}
                        {process.platform !== 'darwin' && !deviceStore.keyboardOption?.powerSaveMode && p.light.type === 'LightScreenColor' && <dj.View w={280} h={35} x={0} y={103} zIndex={2}>
                            <dj.Text
                                w={82}
                                classname={'autoWidth'}
                                x={0}
                                type={'SubTitle'}
                                text={res.text.光影驱动()}
                            />
                            <dj.ComboBox
                                w={200}
                                h={28}
                                x={86}
                                onChange={async (index: number) => {
                                    deviceStore.setIsScreenNative(Boolean(index))
                                }}
                                selectedValue={deviceStore.isScreenNative ? 'RY Native' : 'wasapi'}
                                modes={['wasapi', 'RY Native']}
                            />

                            <dj.HelpBox x={286} y={2} title={res.text.如果wasapi线路无法正常输出请更换RYNative线路()} />
                        </dj.View>}

                        {!deviceStore.keyboardOption?.powerSaveMode && deviceStore.currentLightPic !== undefined && !equals(deviceStore.currentConfig.lightPic, deviceStore.currentLightPic) && p.light.type === 'LightUserPicture' && <dj.View w={blockCloud ? 500 : 200} h={35} x={0} y={103} zIndex={2}>
                            <dj.Button
                                w={'auto'}
                                h={28}
                                x={0}
                                mode={'Sparker'}
                                text={res.string.保存当前自定义层到配置设置}
                                clickHandle={async () => {
                                    if (deviceStore.currentLightPic === undefined) return
                                    deviceStore.currentConfig.lightPic = new Array<UserPicItem>()
                                    deviceStore.currentLightPic.map(v => {
                                        deviceStore.currentConfig.lightPic?.push({
                                            hid: v.hid,
                                            index: v.index,
                                            rgb: v.rgb
                                        })
                                    })
                                    await deviceStore.saveCurrentConfig()
                                }}
                            />
                        </dj.View>}

                        {deviceStore.keyboardOption?.powerSaveMode && <dj.View
                            h={20}
                            y={83}>
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
                        {popUp && (
                            <dj2.View2 x={571} y={33}>
                                <PopColorPicker
                                    color={p.light.type === 'LightUserPicture' ? userPicStore.userColor : color}
                                    setColor={p.light.type === 'LightUserPicture' ? setCustomColor : setColor}
                                    clickHandle={setPopUp}
                                    direction={'down'}
                                />
                            </dj2.View2>
                        )}


                        {/* 遮罩层 */}
                        {p.light.type === 'LightUserPicture' && !deviceStore.keyboardOption?.powerSaveMode && <KeyboardUserPic {...p} />}
                        {/* 当前使用颜色 */}

                        {p.light.type === 'LightUserPicture' && !deviceStore.keyboardOption?.powerSaveMode && (
                            <dj.View w={120} h={35} x={727}>

                                <Fragment>
                                    <dj.ColorBlock
                                        w={16}
                                        h={16}
                                        y={0}
                                        bg={`rgb(${userPicStore.userColor.r},${userPicStore.userColor.g},${userPicStore.userColor.b})`}
                                        clickHandle={() => {
                                            if (!p.lightLayout.isRgb) {
                                                if (equals(userPicStore.userColor, {
                                                    r: numToRgb(0).r,
                                                    g: numToRgb(0).g,
                                                    b: numToRgb(0).b
                                                })) {
                                                    userPicStore.userColor = {
                                                        r: 0x8c,
                                                        g: 0x8c,
                                                        b: 0x8c
                                                    }
                                                } else {
                                                    userPicStore.userColor = {
                                                        r: numToRgb(0).r,
                                                        g: numToRgb(0).g,
                                                        b: numToRgb(0).b
                                                    }
                                                }
                                                isKeyStore.setColorPickerKey(false)

                                            } else {
                                                setPopUp(!popUp)
                                                isKeyStore.setColorPickerKey(true)
                                            }
                                        }}
                                    />

                                    <dj.Text
                                        w={127}
                                        h={34}
                                        x={28}
                                        y={-0}
                                        type={'SubTitle'}
                                        text={res.string.当前使用颜色}
                                    />
                                </Fragment>
                            </dj.View>
                        )}
                        {p.light.type === 'LightUserPicture' && !deviceStore.keyboardOption?.powerSaveMode && (
                            <dj.CheckBox
                                x={727}
                                y={55}
                                w={160}
                                h={16}
                                text={res.string.多选}
                                checkState={isKeyStore.isMultiSelect}
                                type={'SubTitle'}
                                clickHandle={() => {
                                    isKeyStore.setIsMultiSelect(!isKeyStore.isMultiSelect)
                                    setPopUp(false)
                                    userPicStore.setPopUp(false)
                                }}
                            />
                        )}
                        {p.light.type === 'LightUserPicture' && isKeyStore.isMultiSelect && !deviceStore.keyboardOption?.powerSaveMode && (
                            <dj.FlexView
                                w={blockCloud ? 370 : 244}
                                h={30}
                                x={509}
                                y={120}
                                justifyContent={'space-between'}>
                                <dj.Button
                                    w={blockCloud ? 140 : ''}
                                    h={20}
                                    relative
                                    text={res.string.全选}
                                    clickHandle={() => {
                                        userPicStore.colorArr = []
                                        p.lightPic.map((v, i) => {
                                            userPicStore.colorArr.push(
                                                {
                                                    x: 0,
                                                    y: 0,
                                                    width: 0,
                                                    height: 0,
                                                    hid: v.hid,
                                                    index: v.index,
                                                    rgb: {
                                                        r: userPicStore.userColor.r,
                                                        g: userPicStore.userColor.g,
                                                        b: userPicStore.userColor.b,
                                                    }
                                                }
                                            )
                                        })
                                    }}
                                />
                                <dj.Button
                                    relative
                                    w={blockCloud ? 90 : ''}
                                    h={20}
                                    text={res.string.取消}
                                    clickHandle={() => {
                                        isKeyStore.setIsMultiSelect(false)
                                        userPicStore.colorArr = []
                                        userPicStore.setPopUp(false)
                                    }}
                                />
                                <dj.Button
                                    x={0}
                                    w={blockCloud ? 90 : ''}
                                    relative
                                    h={20}
                                    text={res.string.确定}
                                    clickHandle={() => {
                                        const copy = p.lightPic.slice()
                                        userPicStore.colorArr.map((uv, ui) => {
                                            let tmpI = copy.findIndex(v => v.hid === uv.hid && v.index === uv.index)
                                            if (tmpI !== -1) {
                                                copy.splice(tmpI, 1, { hid: uv.hid, rgb: rgbToNum(uv.rgb.r, uv.rgb.g, uv.rgb.b), index: uv.index })
                                            }
                                        })
                                        p.setLightPic(copy)
                                        userPicStore.colorArr = []
                                        isKeyStore.setIsMultiSelect(false)
                                        userPicStore.setPopUp(false)
                                    }}
                                />

                            </dj.FlexView>
                        )}
                    </div>
                }
                {p.light.type === 'LightUserColor' && <CustomLight />}
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