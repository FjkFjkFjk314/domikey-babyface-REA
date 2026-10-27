import React, { Fragment, useState } from 'react'

import { CPIBox } from './CPIBox'
import { dj } from '../../../../dj'
import { res } from '../../../../res'

import { KeySetting } from '../../keysetting/KeySetting'
import { HomeProp, withProps, homeData } from '../../../utils/WithProps'
import { useObserver } from 'mobx-react-lite'
import { useStore } from '../../../../mobxStore/store'
import { getKeyPath } from '../../keyPath'

const ___reportValue: (125 | 250 | 500 | 1000)[] = [125, 250, 500, 1000]

const CPIPage = (p: HomeProp) => {
  if (p.dpiLayout === undefined) return null
  const dpiLayout = p.dpiLayout

  const [state, setState] = useState<{
    open: boolean,
    keyHidCode: number,
    text: string,
    index: number | undefined
  }>({ open: false, keyHidCode: 0, text: '', index: undefined })

  const { deviceStore, otherStore, isKeyStore } = useStore()

  // const getCPIBoxs = (
  //   count: number | undefined,
  //   min: number | undefined,
  //   max: number | undefined
  // ) => {
  //   if (count === undefined) count = 1
  //   if (min === undefined) min = 1
  //   if (max === undefined) max = 1

  //   const boxs: React.ReactNode[] = []
  //   const dpi = deviceStore.currentConfig.dpi
  //   if (dpi === undefined) return <dj.FlexView h={256} />
  //   for (let index = 0; index < count; index++) {
  //     const rgbArr = deviceStore.dpiColorArr
  //     boxs.push(
  //       <CPIBox
  //         index={index}
  //         key={index}
  //         min={min}
  //         max={max}
  //         color={rgbArr[index]}
  //         value={dpi[index]}
  //         setValue={(v) => {
  //           if (dpi[index] !== v) {
  //             dpi[index] = v
  //             p.setDpi(p.dpi)
  //           }
  //         }}
  //         setColor={(rgb) => {
  //           rgbArr[index] = rgb
  //           p.setColor(rgbArr)
  //         }}
  //         clickHandle={() => {
  //           p.setDpi([dpi[index], ...dpi.slice(0, index), ...dpi.slice(index + 1, dpi.length)])
  //           p.setColor([rgbArr[index], ...rgbArr.slice(0, index), ...rgbArr.slice(index + 1, dpi.length)])
  //         }}
  //       />
  //     )
  //   }
  //   return <dj.View w={580} h={256} zIndex={11}>
  //     {boxs}
  //   </dj.View>
  // }
  return useObserver(() => {
    return (
      <Fragment>
        <dj.View w={580} h={300} y={37} zIndex={11}>
          <dj.View w={580} h={256} zIndex={11}>
            {p.dpi.map((v, i) => {
              return <CPIBox
                key={i}
                index={i}
                min={dpiLayout.min}
                max={dpiLayout.max}
                color={p.rgbArr[i]}
                value={v}
                setValue={(value) => {
                  if (v !== value) {
                    p.dpi[i] = value
                    p.setDpi(p.dpi)
                  }
                }}
                setColor={(rgb) => {
                  p.rgbArr[i] = rgb
                  p.setColor(p.rgbArr)
                }}
                clickHandle={() => {
                  p.setDpi([v, ...p.dpi.slice(0, i), ...p.dpi.slice(i + 1, p.dpi.length)])
                  p.setColor([p.rgbArr[i], ...p.rgbArr.slice(0, i), ...p.rgbArr.slice(i + 1, p.rgbArr.length)])
                }}
              />
            })}
          </dj.View>
          {/* {getCPIBoxs(dpiLayout.count, dpiLayout.min, dpiLayout.max)} */}

          <dj.View w={437} h={30} y={260}>
            <dj.Button
              w={70}
              h={30}
              x={207}
              y={0}
              mode={'Sparker'}
              text={'重置'}
              clickHandle={() => {
                const tmp = dpiLayout.min + (dpiLayout.max - dpiLayout.min) / 2
                const arr = new Array(8).fill(tmp)
                p.setDpi(arr)
              }}
            />
            <dj.Button
              w={70}
              h={30}
              x={287}
              y={0}
              mode={'Border'}
              text={'正序↓'}
              clickHandle={() => {
                const arr = deviceStore.currentConfig.dpi
                if (arr === undefined) return
                p.setDpi(arr.sort((a, b) => a - b))
              }}
            />
            <dj.Button
              w={70}
              h={30}
              x={367}
              y={0}
              mode={'Border'}
              text={'倒序↑'}
              clickHandle={() => {
                const arr = deviceStore.currentConfig.dpi
                if (arr === undefined) return
                p.setDpi(arr.sort((a, b) => b - a))
              }}
            />
          </dj.View>

        </dj.View>

        <dj.View y={348} h={48}>
          <dj.Text type={'SubTitle'} text={'报告率'} />
          <dj.FlexView
            w={350}
            h={20}
            y={34}
            flexDirection={'row'}
            justifyContent={'space-between'}>
            {___reportValue.map((value, index) => (
              <div
                style={{
                  width: 70,
                  height: 20,
                  position: 'relative',
                }}
                key={index}>
                <dj.CheckBox
                  checkState={p.reportRate === value}
                  clickHandle={() => {
                    p.setReportRate(value)
                  }}
                  type={'Normal'}
                  w={80}
                  h={16}
                  text={value + 'Hz'}></dj.CheckBox>
              </div>
            ))}
          </dj.FlexView>
        </dj.View>
        <dj.Img
          w={186}
          h={366}
          x={612}
          y={52}
          imgBg={getKeyPath()}
        />
        {res.键鼠坐标.MG912.layout.map((value) => (
          <dj.Button
            key={value.value}
            w={value.w}
            h={value.h}
            x={value.x}
            y={value.y}
            isHightLight={p.keyValue.some((v) => v.original === value.value)}
            mode={'鼠标按键'}
            text={value.mark}
            clickHandle={() => {
              isKeyStore.setIsOpen(true)
              setState({
                open: true,
                keyHidCode: value.value ? value.value : 0,
                text: value.keyName,
                index: value.index
              })
              // console.error(p.keyValue.find((v) => v.original === value.value && v.index === value.index));
              // console.error(p.keyValue);
            }}
          />
        ))}

        {state.open && (
          <dj.View w={1220} h={730} x={-268} y={-146} zIndex={12}>
            <KeySetting
              keyHidCode={state.keyHidCode}
              title={state.text}
              oldValue={p.keyValue.find((v) => v.original === state.keyHidCode && v.index === state.index)}
              closeHandle={() => {
                setState({ open: false, keyHidCode: 0, text: '', index: undefined })
              }}
              index={state.index}
            />
          </dj.View>
        )}

        {deviceStore.currentDev?.deviceType.otherSetting?.deBounce && <dj.View w={334} h={28} x={0} y={452}>
          <dj.Text
            w={'auto'}
            type={'SubTitle'}
            text={res.string.按键灵敏度}
            isDisabled={false}
          />
          <dj.LightRange
            x={86}
            min={1}
            max={deviceStore.currentDev?.deviceType.otherSetting.deBounce}
            leftDescription={res.text.快()}
            rightDescription={res.text.慢()}
            value={
              otherStore.currentOther.deBounce === undefined
                ? 0
                : otherStore.currentOther.deBounce > deviceStore.currentDev?.deviceType.otherSetting.deBounce
                  ? deviceStore.currentDev?.deviceType.otherSetting.deBounce
                  : otherStore.currentOther.deBounce
            }
            setValue={(value) => {
              if (value === 0) {
                deviceStore.setDeBounce(1)
                return
              }
              deviceStore.setDeBounce(value)
            }}
            isDisabled={false}
          />
        </dj.View>}
      </Fragment>
    )
  })

}

export const MouseHome = withProps(CPIPage, homeData)
