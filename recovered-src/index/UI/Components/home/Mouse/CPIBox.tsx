import React, { useState, useEffect } from 'react'
import { NumberInputStyle } from '../../../../dj/NumberInput'
import { dj } from '../../../../dj'
import { mobxStore } from '../../../../mobxStore/store'
import styled from '@emotion/styled'
import { num2Rgb } from '../../../../unitys/rgbNum'
import { PopColorPicker } from '../../light/Light'
import { res } from '../../../../res'


export const CPIBox = (p: {
  index: number
  min: number
  max: number
  value: number
  setValue: (value: number) => void
  color: number
  setColor: (rgb: number) => void
  clickHandle: () => void
}) => {
  const [value, setValue] = useState(p.value)
  const [popUp, setPopUp] = useState(false)
  useEffect(() => {
    setValue(p.value)
  }, [p.value])
  return (
    <dj.View h={32} relative zIndex={popUp ? 11 : 1}>
      <dj.CheckBox
        w={16}
        h={16}
        x={0}
        y={8}
        type={'Normal'}
        checkState={value !== 0}
        clickHandle={() => {
          if (value !== 0) p.setValue(0)
          else p.setValue(p.min + (p.max - p.min) / 2)
        }}
      />

      <dj.Text
        type={'CPI序号'}
        text={p.index + 1}
        x={30}
        y={5.5}
        h={17}
      />

      <dj.View w={'auto'} h={32} x={50}>
        <DpiSlider
          value={p.value}
          min={p.min}
          max={p.max}
          sliderW={251}
          inputFinished={(v) => p.setValue(v)}
        />
      </dj.View>

      <dj.ColorBlock
        w={16}
        h={16}
        y={7}
        x={420}
        bg={`rgb(${num2Rgb(p.color).r}, ${num2Rgb(p.color).g}, ${num2Rgb(p.color).b})`}
        clickHandle={() => setPopUp(true)}
      />

      {popUp && <dj.View x={264} y={p.index > 3 ? -353 : 42} w={327} h={335}>
        <PopColorPicker
          color={num2Rgb(p.color)}
          setColor={(rgb) => p.setColor(rgb)}
          clickHandle={setPopUp}
          direction={p.index > 3 ? 'up' : 'down'}
        />
      </dj.View>}

      <dj.Button
        w={16} h={16} y={7} x={450} img={{
          size: { w: 16, h: 16 },
          src: res.img.set_top
        }}
        clickHandle={p.clickHandle} />

    </dj.View>
  )
}

export const DpiSlider = (p: {
  min: number
  max: number
  value: number,
  sliderW: number
  disabled?: boolean,
  inputFinished: (value: number) => void
}) => {
  const [tmp, setTmp] = useState<number>(p.value)
  useEffect(() => {
    setTmp(p.value)
  }, [p.value])
  return <dj.FlexViewOver w={'auto'} justifyContent={'flex-start'} alignItems={'center'} zIndex={1}>

    <dj.Text
      relative
      type={'CPI小标题'}
      text={'-'}
      w={'auto'}
      h={'auto'}
    />
    <div style={{ width: 10 }} />

    <Slider
      disabled={p.disabled}
      sMax={300}
      dpiMin={p.min}
      dpiMax={p.max}
      sliderW={p.sliderW}
      value={(tmp - p.min) >= 0 ? ((tmp - p.min) / (p.max - p.min)) : 0}
      onChange={(n) => setTmp(Math.round((p.max - p.min) * n + p.min))}
      inputFinished={(v) => p.inputFinished(Math.round((p.max - p.min) * v + p.min))}
    />
    <div style={{ width: 10 }} />

    <dj.Text
      relative
      type={'CPI小标题'}
      text={'+'}
      w={'auto'}
      h={'auto'}
    />
    <div style={{ width: 10 }} />
  </dj.FlexViewOver>
}

const Slider = (p: {
  value: number,
  sMax: number,
  sliderW: number,
  dpiMin: number,
  dpiMax: number,
  disabled?: boolean
  onChange: (value: number) => void
  inputFinished: (value: number) => void
}) => {
  const [tmp, setTmp] = useState<number>(p.value / p.sMax)
  const [show, setShow] = useState(false)
  useEffect(() => {
    setTmp(p.value)
  }, [p.value])
  return <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: p.sliderW, height: 21 }}>
    {show && <div style={{
      position: 'absolute',
      // min -19.5   max sliderW - 34.5
      left: -19.5 + p.value * (p.sliderW - 15),
      top: -36,
      height: 28
    }}>
      <div style={{
        width: 54,
        height: 28,
        backgroundColor: 'Red',
        color: '#ffffff',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: '28px',
        borderRadius: 5
      }}>
        {Math.round(p.dpiMin + (p.dpiMax - p.dpiMin) * p.value)}
      </div>

      <div style={{
        position: 'absolute',
        top: 28,
        left: 21,
        borderRight: '6px solid transparent',
        borderLeft: '6px solid transparent',
        borderTop: '6px solid #f53b57',
      }} />
    </div>}
    <div style={{ position: 'absolute', top: 7.5, width: p.sliderW, height: 6, borderRadius: 3, backgroundColor: '#444', zIndex: -2 }} />
    <div style={{ position: 'absolute', top: 7.5, width: tmp > 1 ? p.sliderW : p.sliderW * tmp, height: 6, borderRadius: 3, backgroundColor: '#23f9e2', zIndex: -1 }} />
    <Sliders type='range'
      disabled={p.disabled}
      w={p.sMax}
      min={0}
      max={p.sMax}
      step={1}
      value={tmp * p.sMax}
      onMouseDown={() => setShow(true)}
      onChange={(e) => {
        p.onChange(Number(e.target.value) / p.sMax)
      }}
      onMouseUp={(e) => {
        p.inputFinished(Number((e.target as HTMLInputElement).value) / p.sMax)
        setShow(false)
      }}
    />
  </div>
}

const DpiTips = (p: {
  min: number
  max: number
  value: number,
  inputFinished: (value: number) => void
}) => {
  const [revalue, setRevalue] = useState({ state: false, value: p.value })
  useEffect(() => {
    setRevalue({ state: revalue.state, value: p.value })
  }, [p.value])
  return <div
    style={{
      position: 'relative',
      width: 60,
      cursor: 'pointer'
    }}
    onClick={() => !revalue.state && setRevalue({ state: !revalue.state, value: revalue.value })}
  >
    <div style={{
      width: 54,
      height: 28,
      lineHeight: '28px',
      backgroundColor: '#f53b57',
      color: '#ffffff',
      fontSize: 14,
      borderRadius: 4,
      textAlign: 'center',
    }}>
      {!revalue.state && revalue.value.toString()}
      {revalue.state && <DpiInput
        value={revalue.value}
        min={p.min}
        max={p.max}
        inputFinished={(num) => {
          setRevalue({ state: false, value: num })
          p.inputFinished(num)
        }} />}
    </div>
    <div style={{
      position: 'absolute',
      top: 8,
      left: 54,
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderLeft: '6px solid #f53b57',
    }} />
  </div>
}


const Sliders = styled.input({
  ['-webkit-appearance']: 'none',
  height: 6,
  borderRadius: 3,
  backgroundColor: 'transparent',
  // backgroundColor: 'Red',
  outline: 'none',
  ['&[type="range"]::-webkit-slider-thumb']: {
    ['-webkit-appearance']: 'none',
    width: 15,
    height: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 15,
  },
  ['&[type="range"]:active::-webkit-slider-thumb']: {
    boxShadow: '0 0 0 6px rgba(155,73,145,.4)',
  },
}, ((p: { w: number }) => ({
  width: p.w
})))

const DpiInput = (p: {
  min: number,
  max: number,
  value: number,
  inputFinished: (value: number) => void
}) => {
  const [tmp, setTmp] = useState<number | undefined>(p.value)
  const inputFnc = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    const ele = (e.target as HTMLInputElement)
    if (Number(ele.value) > p.max) {
      ele.value = p.max.toString()
      mobxStore.toastStore.setErr("最大为" + p.max)
    }

    if (Number(ele.value) < p.min && Number(ele.value) !== 0) {
      ele.value = p.min.toString()
      mobxStore.toastStore.setErr("最小为" + p.min)
    }
    setTmp(Number(ele.value))
    p.inputFinished(ele.value === '' ? 0 : parseInt(ele.value))
    ele.blur()
  }
  return <NumberInputStyle
    style={{
      borderBottom: '1px solid rgb(53, 53, 53)'
    }}
    autoFocus
    type={'number'}
    value={tmp === undefined ? '' : tmp}
    min={p.min}
    onChange={(e) => {
      if (e.target.value === '')
        setTmp(undefined)
      else
        setTmp(Number(e.target.value))
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
    }}
    onBlur={(e) => inputFnc(e)}
    onMouseUp={(event) => event.stopPropagation()}
  />
}