import React, { useRef, useState } from 'react'
import styled from '@emotion/styled'
import { Text } from './Text'
import { res } from '../res'
import { useStore } from '../mobxStore/store'

const SliderStyle = styled('div')`
  position: relative;
  height: 100%;
  width: 100%;
  // margin: 4px 0;
  & input {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 12px;
    overflow: hidden;
    position: absolute;
    top: 50%;
    transform: translate(0,-50%);
  }

  & input:focus {
    outline: none;
  }

  & input::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    background: red;
    background-color: #b5b6b6;
  }

  & input::-webkit-slider-thumb {
    position: relative;
    -webkit-appearance: none;
    height: 4px;
    width: 4px;
    background: #595857;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: -190px 0 0 188px #595857;
  }

  & input:active::-webkit-slider-thumb {
    background: #23f9e2;
    box-shadow: -190px 0 0 188px #21b6a6;
  }

  & input:disabled {
    opacity: 0.4;
  }

  & input:disabled::-webkit-slider-thumb {
    opacity: 0.4;
  }
`

const Balloon = styled.span(
  {
    width: 19,
    height: 24,
    background: `url(${res.img.light_frame.normal})`,
    backgroundSize: 'contain',
    position: 'absolute',

    top: -32,
    '& > span': {
      position: 'absolute',
      color: 'black',
      top: 4,
    },
  },
  (props: { dataleft: number }) => ({
    left: props.dataleft - 10,
  })
)

export const Slider = (p: {
  sliderW: number
  min: number
  max: number
  step: number
  type: 'Normal' | 'Balloon'
  value: number
  isDisabled: boolean
  setValue: (value: number) => void
  changeComplete: () => void
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [movable, setMovable] = useState(false)
  const [ballonShow, setBallonShow] = useState(false)

  const [outKey, setOutKey] = useState(false)

  const setChangeValue = (event: { clientX: number }) => {
    ref.current &&
      p.setValue(
        Math.floor(
          ((event.clientX - ref.current.getBoundingClientRect().left) /
            ref.current?.getBoundingClientRect().width) *
          p.max +
          0.5
        )
      )
  }
  return (
    <SliderStyle
      id='fatherBtn'
      ref={ref}
      onMouseDown={(event) => {
        if (p.isDisabled) return
        setChangeValue(event)
        setMovable(true)
        setBallonShow(true)
        setOutKey(true)
      }}
      onMouseMove={(event) => {
        if (p.isDisabled) return

        if (movable) {
          ref.current && setChangeValue(event)
        }
      }}

      onMouseOut={(event) => {
        // console.log('out', outKey)
        if (outKey === true) {
          if (p.isDisabled) return

          p.changeComplete()
          setMovable(false)
          setBallonShow(false)
          setOutKey(false)
        }
      }}
      onMouseUp={() => {
        if (outKey === true) {
          if (p.isDisabled) return

          p.changeComplete()
          setMovable(false)
          setBallonShow(false)
          setOutKey(false)
        }
      }}
    >
      <input
        disabled={p.isDisabled}
        type='range'
        value={p.value}
        min={p.min}
        max={p.max}
        step={p.step}
        style={{ zIndex: -1 }}
        onChange={(e) => {
          p.setValue(parseInt(e.target.value))
        }}
        onMouseDown={(event) => {
          event.stopPropagation()
          setBallonShow(true)
        }}
        onMouseUp={(event) => {
          event.stopPropagation()
          p.changeComplete()
          setMovable(false)
          setBallonShow(false)
        }}
      />
      {p.type === 'Balloon' && ballonShow && (
        <Balloon className='balloon' dataleft={(p.value / p.max) * p.sliderW}>
          <Text type={'灯光页数值'} text={p.value} />
        </Balloon>
      )}
    </SliderStyle>
  )
}

//自定义动画
const SliderStyle2 = styled.div(() => (
  `
  position: relative;
  height: 100%;
  width: 100%;
  margin: 4px 0;
  & input {
    -webkit-appearance: none;
    width: 400px;
    height:10px;
    background: gray;
    border-radius: 12px;
    overflow: hidden;
  }
  & input:focus {
    outline: none;
  }
  & input::-webkit-slider-thumb {
    position: relative;
    -webkit-appearance: none;
    height: 4px;
    width: 4px;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: -200px 0 0 200px #23f9e2;
  }
`
))
const Point = styled.div(
  {
    width: 12,
    height: 12,
    position: 'absolute',
    top: 6,
  },
  (props: { dataleft: number, isInit: boolean }) => ({
    left: props.dataleft + '%',
    background: 'gray',
    borderRadius: 5,
    border: '1px solid #23f9e2'
  })
)
export const UserSlide = (p: {
  sliderW: number
  min: number
  max: number
  step: number
  value: number
  setValue: (value: number) => void
  isDisabled: boolean
}) => {
  // const ref = useRef<HTMLDivElement>(null)
  // const [movable, setMovable] = useState(false)
  // const [ballonShow, setBallonShow] = useState(false)

  // const [outKey, setOutKey] = useState(false)

  // const setChangeValue = (event: { clientX: number }) => {

  //   ref.current &&
  //     p.setValue(
  //       Math.floor(
  //         ((event.clientX - ref.current.getBoundingClientRect().left) /
  //           ref.current?.getBoundingClientRect().width) *
  //         p.max + 0.5
  //       )
  //     )
  // }
  return (<SliderStyle2 >
    <input
      disabled={p.isDisabled}
      type='range'
      value={p.value}
      min={p.min}
      max={p.max}
      step={p.step}
      style={{ zIndex: -1 }}
      onChange={(e) => {
        p.setValue(parseInt(e.target.value))
      }}
    />
    <Point className='point' dataleft={p.value === p.max ? 99 : (p.value - p.min) / (p.max - p.min) * 100 - 2} isInit={p.value > p.min} />
  </SliderStyle2>)
}
