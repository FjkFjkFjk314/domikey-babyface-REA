import { useObserver } from 'mobx-react-lite'
import React, { Fragment, useState } from 'react'
import { dj, dj2 } from '../../../../../src/dj'
import { DeviceStore } from '../../../../../src/mobxStore/deviceStore'
import { useStore, mobxStore } from '../../../../../src/mobxStore/store'
import { res } from '../../../../../src/res'
import { LightRange } from '../../../../../src/UI/utils/LightRange'
import { LightProp, withProps, wheelLightLEDData } from '../../../../../src/UI/utils/WithProps'
import { sleep } from '../../../../../src/unitys/timeFunc'
import { getKeyPath } from '../../keyPath'
import { modeKeyChange, lightCurrentLayout, getLightRgb, PopColorPicker } from './Light'


const LEDLight = (p: LightProp) => {
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
    for (let i = 0; i < screenStore.screenArr.length; i++) {
        screenArr.push(res.text.屏幕() + (i + 1));
    }
    return useObserver(() => {
        return (
            <dj.View w={891} h={480} x={0} y={30}>
                <dj.FlexView
                    flexDirection={'column'}
                    w={871}
                    h={80}
                    justifyContent={'space-between'}>
                    <dj.View relative w={871} h={28}>
                        {/* 灯光模式 */}
                        <dj.View w={280} h={28} x={0}>
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
                                onChange={(index) => {
                                    const type = id + 'led&' + p.lightLayout.types[index].type
                                    onModeChange(type)
                                }}
                                modes={p.lightLayout.types.map((v: { type: any }) =>
                                    DeviceStore.lightNameMap[v.type]
                                        ? DeviceStore.lightNameMap[v.type]
                                        : v.type
                                )}
                            />
                        </dj.View>

                        {/* speed */}
                        <dj.View w={334} h={28} x={332}>
                            <dj.Text
                                w={50}
                                x={0}
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
                        {/* 当前使用颜色 */}
                        <dj.View w={120} h={28} x={727}>
                            {isLayoutRgbExit && (
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
                                        w={100}
                                        h={26}
                                        x={28}
                                        y={-0}
                                        type={'SubTitle'}
                                        text={res.string.当前使用颜色}
                                    />
                                </Fragment>
                            )}
                        </dj.View>

                        {p.light.type === 'LightScreenColor'
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
                            </dj.View>}

                    </dj.View>

                    <dj.View relative w={871} h={28}>
                        {/* Options */}
                        <dj.View w={280} h={28} x={0}>
                            <dj.Text
                                w={60}
                                x={0}
                                type={'SubTitle'}
                                text={'Options'}
                                isDisabled={layout.options === undefined && p.light.type !== "LightScreenColor"}
                            />
                            <dj.ComboBox
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
                                    // 'option' in p.light ? p.light.option : undefined
                                    p.light.type === "LightScreenColor"
                                        ? screenArr[screenStore.screenIndex]
                                        : 'option' in p.light
                                            ? p.light.option
                                            : undefined
                                }
                                // modes={layout.options === undefined ? [] : layout.options}
                                modes={
                                    p.light.type === "LightScreenColor"
                                        ? screenArr
                                        : layout.options === undefined
                                            ? []
                                            : layout.options
                                }
                                isDisabled={layout.options === undefined && p.light.type !== "LightScreenColor"}
                            />
                        </dj.View>

                        {/* 亮度 */}
                        <dj.View w={334} h={28} x={332}>
                            <dj.Text
                                w={80}
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

                                    // remberLight(p.light.type, p.light, 'value', value)
                                }}
                                isDisabled={layout.minValue === undefined}
                            />
                        </dj.View>
                    </dj.View>

                    <dj.View w={120} h={28} x={727} y={53}>
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
                </dj.FlexView>

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
                    <dj2.View2 x={571} y={33}>
                        <PopColorPicker
                            color={color}
                            setColor={setColor}
                            clickHandle={setPopUp}
                            direction={'down'}
                        />
                    </dj2.View2>
                )}
            </dj.View>
        )
    })

}

export const LEDRGBLight = withProps(LEDLight, wheelLightLEDData)
