import React, { Fragment, useState } from 'react'
import { mobxStore, useStore } from '../../../mobxStore/store'
import { dj } from '../../../dj'
import { res } from '../../../res'
import { DpiSlider } from '../home/Mouse/CPIBox'
import styled from '@emotion/styled'
import { macChange } from '../../../res/映射'
import { useObserver } from 'mobx-react-lite'
import { MouseKey } from '../../../sdk/DriverIO/DeviceAPI/DeviceInterface'
import { NumberInputStyle } from '../../../dj/NumberInput'
import { blockCloud } from '../../../appConfig'
export const basicFunName: SpecialFuntion[] =
[
  // 'fn',
  // 'dpi_loop',
  // 'dpi+',
  // 'dpi-',
  '播放器',
  '播放/暂停',
  '停止',
  '上一曲',
  '下一曲',
  '音量减',
  '音量大',
  '静音',
  '计算器',
  '邮件',
  '我的电脑',
  '搜索',
  '主页',
  '亮度加',
  '亮度减',
  '刷新',
  '缩小',
  '放大',
  // '变换',
  // '无变换',
  // '|¥-',
  // '-\\ろ',
  // 'Kana',
  // '半角全角'
]

const showItems =
{
  // fn: 'Fn',
  // 'dpi_loop': 'dpi_loop',
  // 'dpi+': 'dpi+',
  // 'dpi-': 'dpi-',
  播放器: res.string.播放器,
  '播放/暂停': res.string.播放暂停,
  停止: res.string.停止,
  上一曲: res.string.上一曲,
  下一曲: res.string.下一曲,
  音量减: res.string.音量减,
  音量大: res.string.音量大,
  静音: res.string.静音,
  计算器: res.string.计算器,
  邮件: res.string.电子邮件,
  我的电脑: res.string.我的电脑,
  搜索: res.string.搜索,
  主页: res.string.主页,
  亮度加: res.string.亮度加,
  亮度减: res.string.亮度减,
  刷新: res.string.刷新,
  锁全键: res.string.锁全键,
  缩小: res.string.缩小,
  放大: res.string.放大,
  // '|¥-': '|¥—(JP)',
  // '-\\ろ': '-\\ろ(JP)',
  // Kana: 'Kana(JP)',
}

// if (process.platform == 'darwin') {
//   //mac
//   ___items.push('呼出siri')
// }

export const BasicFunction = (p: {
  basic: { key: SpecialFuntion, value: number[] | undefined } | undefined
  setBasic: (basic: { key: SpecialFuntion, value: number[] | undefined } | undefined) => void
  oldValue: ConfigFunction | undefined
  forBidden: boolean
}) => {
  const { deviceStore, macroStore } = useStore()
  const [key, setKey] = useState(false)
  let changedText: string | JSX.Element = ''
  if (p.oldValue !== undefined) {
    changedText = showItems[p.oldValue.key as keyof typeof showItems] //p.oldValue.key
  }
  const dpiLayout = deviceStore.currentDev?.deviceType.layout
    ? deviceStore.currentDev.deviceType.layout['dpi']
      ? deviceStore.currentDev.deviceType.layout['dpi']
      : undefined
    : undefined

  document.onkeydown = () => {
    if (p.basic?.key === '火力' && !key) {
      // console.log('true le')
      macroStore.startSingleHook()
      // macroStore.stopMouseEvent()
    }
  }
  document.onkeyup = () => {
    if (p.basic?.key === '火力' && !key) {
      // console.error('键盘抬起');
      if (
        macroStore.currentSingleValue !== MouseKey.Left &&
        macroStore.currentSingleValue !== MouseKey.Middle &&
        macroStore.currentSingleValue !== MouseKey.Right &&
        macroStore.currentSingleValue !== 0
      ) {
        const v = p.basic?.value === undefined ? [0x0b, 0x00, 0x00, 0x00] : p.basic?.value
        p.setBasic({
          key: '火力',
          value: [0x0b, macroStore.currentSingleValue, v[2], v[3]]
        })
      }
      macroStore.cleanSingleValue()
    }
  }
  macroStore.startSingleHook()
  macroStore.cleanSingleValue()

  return useObserver(() => {
    return (
      <Fragment>
        <dj.Text text={changedText} type={'已修改的按键值'} x={57} y={7} h={36} />
        <dj.View w={342} h={145} x={54} y={48}>

          <ItemContainer>

            {/* <dj.View
              relative
              w={342}
              h={32}>
              <dj.CheckBox
                relative
                type={'Normal'}
                text={'火力'}
                checkState={p.basic?.key === '火力' && !p.forBidden}
                clickHandle={() => {
                  p.setBasic({ key: '火力', value: [0x0b, 0x00, 0x00, 0x00] })
                }}
              />

              {p.basic?.key === '火力' && p.basic?.value !== undefined && <dj.View h={32} x={80}>
                <dj.TextSetInput
                  usePlaceholder={res.useString.请输入按键}
                  w={80}
                  h={26}
                  x={0}
                  y={0}
                  type={'组合键按键'}
                  value={p.forBidden ? "" : macChange(res.映射.hidCodeMapKeyName(p.basic?.value[1]) || '')}
                  onChange={() => { }}
                  inputFocus={() => {
                  }}
                  inputFinished={() => {
                  }}
                />
                <BasicNumberInput
                  x={85}
                  y={0}
                  value={p.basic.value[2]}
                  placeholder={'时间'}
                  onFocus={() => setKey(true)}
                  inputFinished={(value) => {
                    const v = p.basic?.value === undefined ? [0x0b, 0x00, 0x00, 0x00] : p.basic?.value
                    setKey(false)
                    p.setBasic({ key: '火力', value: [0x0b, v[1], value, v[3]] })
                  }}
                  unit={'ms'} />

                <BasicNumberInput
                  x={150}
                  y={0}
                  value={p.basic.value[3]}
                  placeholder={'次数'}
                  onFocus={() => setKey(true)}
                  inputFinished={(value) => {
                    const v = p.basic?.value === undefined ? [0x0b, 0x00, 0x00, 0x00] : p.basic?.value
                    setKey(false)
                    p.setBasic({ key: '火力', value: [0x0b, v[1], v[2], value] })
                  }}
                  unit={'次'} />


              </dj.View>}
            </dj.View>

            {dpiLayout !== undefined && <dj.View
              relative
              w={342}
              h={32}>
              <dj.CheckBox
                relative
                type={'Normal'}
                text={'dpi_shift'}
                checkState={p.basic?.key === 'dpi_shift' && !p.forBidden}
                clickHandle={() => {
                  const buf = Buffer.alloc(2)
                  buf.writeUInt16LE(dpiLayout.min)
                  p.setBasic({ key: 'dpi_shift', value: [0x13, buf[0], 0x04, buf[1]] })
                }}
              />

              {p.basic?.key === 'dpi_shift' && <dj.View h={32} x={80} y={-6}>
                <DpiSlider
                  disabled={!(p.basic?.key === 'dpi_shift' && !p.forBidden)}
                  min={dpiLayout.min}
                  max={dpiLayout.max}
                  sliderW={200}
                  value={
                    p.oldValue?.key === 'dpi_shift' && p.oldValue.value !== undefined
                      ? (p.oldValue.value[3] << 8) + p.oldValue.value[1]
                      : 0
                  }
                  inputFinished={(value) => {
                    const buf = Buffer.alloc(2)
                    buf.writeUInt16LE(value)
                    p.setBasic({ key: 'dpi_shift', value: [0x13, buf[0], 0x04, buf[1]] })
                  }} />
              </dj.View>}

            </dj.View>} */}

            {basicFunName.map((v, i) => {
              return <dj.CheckBox2
                relative
                key={i}
                h={32}
                type={'Normal'}
                text={showItems[basicFunName[i] as keyof typeof showItems]}
                checkState={p.basic?.key === basicFunName[i] && !p.forBidden}
                clickHandle={() => {
                  p.basic?.key !== basicFunName[i]
                    ? p.setBasic({ key: basicFunName[i], value: undefined })
                    : p.setBasic(undefined)
                }}
              />
            })}
          </ItemContainer>
        </dj.View>
      </Fragment>
    )
  })

}

const ItemContainer = styled.div({
  width: 342,
  height: 145,
  outline: 'none',
  overflowX: 'hidden',
  '&::-webkit-scrollbar': {
    width: '6px',
  },

  '&::-webkit-scrollbar-thumb': {
    background: 'gray',
    borderRadius: '5px',
  },
})

const BasicNumberInput = (p: {
  x: number,
  y: number,
  value: number,
  placeholder?: string,
  onFocus: () => void
  inputFinished: (value: number) => void,
  unit: string,
}) => {
  const [tmp, setTmp] = useState(p.value)
  console.error(p.value);

  return (
    <NumberInputStyle
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
      value={tmp + p.unit}
      min={1}
      onChange={(e) => {
        const num = Number(e.target.value.replace(/[^\d.]/g, ""))
        if (num > 255) {
          setTmp(255)
          mobxStore.toastStore.setErr("输入的范围在请勿超过1-255")
          return
        }
        setTmp(num)
      }}
      onFocus={p.onFocus}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
      onBlur={(e: { target: { value: string } }) => {
        p.inputFinished(tmp < 1 ? 1 : tmp)
      }}
      onMouseUp={(event) => event.stopPropagation()}
    />
  )
}