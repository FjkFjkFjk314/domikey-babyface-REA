import React, { useEffect, useState } from "react"
import { Fragment } from "react"
import { NumberInputStyle } from "../../../dj/NumberInput"
import { mobxStore } from "../../../mobxStore/store"
import { dj } from "../../../dj"
import { DpiSlider } from "../home/Mouse/CPIBox"
import { res } from "../../../res"

export const AdjustShotPage = (p: {
    basic: { key: SpecialFuntion, value: number[] | undefined } | undefined
    setBasic: (basic: { key: SpecialFuntion, value: number[] | undefined } | undefined) => void
    oldValue: ConfigFunction | undefined
    forBidden: boolean
}) => {

    const XY2Count = (num: number) => {

        if (num > 0x7f) {
            const tmp = ((0xff - num) / (0xff - 0x80)) * 100
            return Math.round(tmp)
        }

        if (num < 0x7f) {
            const tmp = (num / 0x7f) * 100
            return -Math.round(tmp)
        }
        return 0
    }

    const count2XY = (value: number) => {
        const count = (0xff - 0x80)
        let num = 0x7f
        if (value === 0) num = 0x7f

        if (value > 0) {
            num = 0xff - value / 100 * count
        }

        if (value < 0) {
            num = Math.abs(value / 100) * 0x7f
        }

        return Math.round(num)
    }

    const [adjX, setAdjX] = useState(p.basic?.key === 'adjust_shot' && p.basic.value !== undefined ? XY2Count(p.basic.value[2]) : 0)
    const [adjY, setAdjY] = useState(p.basic?.key === 'adjust_shot' && p.basic.value !== undefined ? XY2Count(p.basic.value[3]) : 0)
    const [timer, setTimer] = useState(p.basic?.key === 'adjust_shot' && p.basic.value !== undefined ? p.basic.value[1] : 0)

    useEffect(() => {
        p.setBasic({ key: 'adjust_shot', value: [0x14, timer, count2XY(adjX), count2XY(adjY)] })
    }, [])

    return (
        <Fragment>
            <dj.View w={342} h={145} x={54} y={48}>

                <dj.View
                    relative
                    w={342}
                    h={32}>
                    <dj.Text
                        relative
                        type={'CPI序号'}
                        text={'X ADJ'}
                    />
                    <dj.View h={32} x={80} y={-6}>
                        <DpiSlider
                            min={-100}
                            max={100}
                            sliderW={200}
                            value={adjX}
                            inputFinished={(value) => {
                                const num = count2XY(value)
                                setAdjX(XY2Count(num))
                                p.setBasic({ key: 'adjust_shot', value: [0x14, timer, num, count2XY(adjY)] })
                            }} />
                    </dj.View>
                </dj.View>

                <dj.View
                    relative
                    w={342}
                    h={32}>
                    <dj.Text
                        relative
                        type={'CPI序号'}
                        text={'Y ADJ'}
                    />

                    <dj.View h={32} x={80} y={-6}>
                        <DpiSlider
                            min={-100}
                            max={100}
                            sliderW={200}
                            value={adjY}
                            inputFinished={(value) => {
                                const num = count2XY(value)
                                setAdjY(XY2Count(num))
                                p.setBasic({ key: 'adjust_shot', value: [0x14, timer, count2XY(adjX), num] })

                            }} />
                    </dj.View>
                </dj.View>

                <dj.View
                    relative
                    w={342}
                    h={32}
                    drag={false}
                    clickHandle={() => {
                        const t = document.getElementById('BasicNumberInputTime')
                        if (t === null) return
                        t.focus()
                    }}>
                    <dj.Text
                        relative
                        type={'CPI序号'}
                        text={res.string.延时}
                    />

                    <BasicNumberInput
                        id={'BasicNumberInputTime'}
                        x={80}
                        y={0}
                        value={timer.toString()}
                        placeholder={res.text.时间()}
                        inputFinished={(value) => {
                            setTimer(value)
                            p.setBasic({ key: 'adjust_shot', value: [0x14, value, count2XY(adjX), count2XY(adjY)] })
                        }} />
                </dj.View>
            </dj.View>
        </Fragment>
    )
}

const BasicNumberInput = (p: {
    id?: string
    x: number,
    y: number,
    value: string,
    placeholder?: string,
    inputFinished: (value: number) => void
}) => {
    const [tmp, setTmp] = useState(p.value)
    return (
        <NumberInputStyle
            id={p.id}
            style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                width: 60,
                height: 26,
                backgroundColor: '#252525',
                border: '1px solid #23f9e2',
                fontSize: 14,
            }}
            placeholder={p.placeholder}
            type={'number'}
            value={tmp}
            min={1}
            onChange={(e) => {

                if (Number(e.target.value) > 255) {
                    e.target.value = '255'
                    mobxStore.toastStore.setErr("输入的范围在请勿超过1-255")
                }
                setTmp(e.target.value)
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
            onBlur={(e: { target: { value: string } }) => {
                p.inputFinished(tmp === '' || Number(tmp) < 1 ? 1 : parseInt(tmp))
            }}
            onMouseUp={(event) => event.stopPropagation()}
        />
    )
}