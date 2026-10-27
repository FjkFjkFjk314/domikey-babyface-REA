import React from 'react'

import { res } from '../res'
import { dj } from '../dj'
import { store } from './store'

import { mobxStore, useStore } from '../mobxStore/store'
import { useObserver } from 'mobx-react-lite'
import { equals } from 'ramda'
import { blockCloud } from '../appConfig'

const DeviceBlock = (p: {
  type: string
  is24: boolean
  isblue?: boolean
  isHightLight: boolean
  clickHandle: () => void
  ishide: boolean
}) => {
  return (
    <dj.View w={p.ishide ? 0 : 40} h={p.ishide ? 0 : 25} relative>
      {!p.ishide && <dj.VerticalLine h={14} y={4} x={21} />}
      {!p.ishide && <dj.Button
        w={22}
        h={22}
        x={26}
        y={0}
        isHightLight={p.isHightLight}
        img={{
          size: { w: 22, h: 22 },
          src: p.type === 'keyboard' && !p.is24 && !p.isblue
            ? res.img.bottom_keyboard
            : p.type === 'keyboard' && p.is24
              ? res.img.bottom_keyboard_24g
              : p.type === 'keyboard' && p.isblue
                ? res.img.bottom_keyboard_blue
                : p.type === 'mouse'
                  ? res.img.bottom_mouse
                  : res.img.bottom_delete,
        }}
        clickHandle={p.clickHandle}
      />}
    </dj.View>
  )
}

export const Bottom = () => {
  const { configurationOpen } = store.useState((v) => v.configurationOpen)
  const { deviceStore, pageStore } = useStore()
  const { isKeyStore } = useStore()
  const { macroStore } = useStore()
  const { toastStore } = useStore()
  return useObserver(() => (
    <dj.View w={1220} h={61} x={0} y={667}>
      <div
        style={{
          width: '100%',
          height: '100%',
          borderTop: '1px solid #c9caca'
        }}
      >
        {/* <dj.Line lineColor={'Normal'} /> */}
        <dj.Text
          w={160}
          h={20}
          x={8}
          y={20}
          type={'鼠标型号'}
          text={deviceStore.currentDev?.deviceType.displayName}
        />

      <dj.FlexView
        w={625}
        h={35}
        x={147}
        y={20}
        justifyContent={'start'}
        horizontalScroll={true}>
        {deviceStore.deviceArr.map((value, index) => {
          return <DeviceBlock
            ishide={false}
            key={index}
            type={value.deviceType.type ? value.deviceType.type : ''}
            is24={value.deviceType.is24}
            isblue={value.deviceType.isblue}
            isHightLight={deviceStore.currentSelectIndex === index}
            clickHandle={async () => {
              if (value.deviceType.is24 || value.deviceType.isblue) {
                const dev = toastStore.sleepDevArr.find(sv => equals(deviceStore.deviceArr[index].deviceType, sv.deviceType))

                if (dev?.status) {
                  toastStore.setInfo(res.text.请先按任意键唤醒键盘())
                  return
                }
              }
              macroStore.stoptHook()
              if (deviceStore.currentSelectIndex !== index) {
                deviceStore.stopLight()
              }
              deviceStore.currentSelectIndex !== index &&
                await deviceStore.setCurrentSelectIndex(index)
            }}
          />
        }
        )}
      </dj.FlexView>

        <dj.Button
          w={130}
          h={22}
          x={771}
          y={20}
          img={{
            size: {
              w: 22,
              h: 22,
            },
            src: res.img.leftbar_recovery,
          }}
          mode={'Lighter'}
          isHightLight={false}
          textW={108}
          text={res.string.恢复默认}
          clickHandle={() => {
            if (macroStore.recodingState === 'stop') {
              deviceStore.setReset()
            } else {
              mobxStore.toastStore.setInfo(res.text.请先停止录制())
            }
          }}
        />
        <dj.ButtonELL
          w={80}
          h={22}
          x={893}
          y={20}
          mode={'文本text'}
          isHightLight={false}
          isDisabled={false}
          text={res.text.配置()}
        />
        <dj.ButtonELL
          w={180}
          h={22}
          x={962}
          y={20}
          reverse
          img={{
            size: { w: 10, h: 6 },
            src: res.img.bottom_configure,
          }}
          mode={'Lighter'}
          isHightLight={configurationOpen}
          textW={165}
          text={deviceStore.currentConfig.name}
          clickHandle={() => {
            if (mobxStore.macroStore.recodingState === "recording") {
              mobxStore.toastStore.setErr(res.text.请先停止录制())
              return
            }
            isKeyStore.setIsOpen(false)
            macroStore.stoptHook()
            store.setState.configurationOpen(!configurationOpen)
          }}
        />
      </div >
    </dj.View >
  ))
}