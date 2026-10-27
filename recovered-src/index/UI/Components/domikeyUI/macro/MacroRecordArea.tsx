import React, { Fragment, useEffect, useState } from 'react'
import { MacroList } from './MacroList'
import { dj } from '../../../../dj'
import { res } from '../../../../res'
import { useStore } from '../../../../mobxStore/store'
import { useObserver } from 'mobx-react-lite'
import { blockCloud } from '../../../../appConfig'
import { MouseKey } from '../../../../../src/sdk/DriverIO/DeviceAPI/DeviceInterface'
import { autorun } from 'mobx'


const getTmpEvent = (
  type: 'mouse_button' | 'mouse_move' | 'keyboard' | 'delay'
) => {
  const mouseEvent: MacroEvent = {
    type: 'mouse_button',
    action: 'down',
    value: MouseKey.Left,
  }
  const moveEvent: MacroEvent = {
    type: 'mouse_move',
    dx: 1,
    dy: 1,
  }
  const keyboardEvent: MacroEvent = {
    type: 'keyboard',
    action: 'down',
    value: 0,
  }
  const delEvent: MacroEvent = {
    type: 'delay',
    value: 1,
  }

  switch (type) {
    case 'mouse_button':
    default:
      return mouseEvent
    case 'keyboard':
      return keyboardEvent
    case 'delay':
      return delEvent
    case 'mouse_move':
      return moveEvent
  }
}

export const MacroRecordArea = () => {
  const { macroStore, isKeyStore } = useStore()
  const [state, setstate] = useState({
    indexRow: -1,
    indexColumn: -1,
  })

  const [add, setAddData] = useState({
    indexRow: -1,
    indexColumn: -1,
    type: 'delay',
  })


  const saveMacro = () => macroStore.uiSaveMacro()

  const changeHeadContextMenu = () => {
    macroStore.recodingState === 'recording'
      ? isKeyStore.setMacroAddClickKey(false)
      : isKeyStore.setMacroAddClickKey(!isKeyStore.macroAddClickKey)
  }



  const setContextMenuDisappear = () => {
    setstate({ ...state, indexRow: -1, indexColumn: -1 })
  }
  const setAddStateDisappear = () => {
    setAddData({ ...add, indexRow: -1, indexColumn: -1 })
  }

  useEffect(() =>
    autorun(() => {
      macroStore.isFull &&
        macroStore.recodingState === 'recording' &&
        macroStore.stoptHook()
    })
  )

  document.onclick = () => {
    if (!isKeyStore.macroAddTouchKey) {
      isKeyStore.setMacroAddClickKey(false)
    }
  }

  return useObserver(() => {
    useEffect(() => {
      if (
        macroStore.currentSingleValue !== 0 &&
        macroStore.recodingState === 'singleRecording'
      ) {
        if (add.indexColumn !== -1 && add.indexColumn !== -1) {
          macroStore.changeEvent(add.indexRow * 10 + add.indexColumn, {
            type:
              macroStore.currentSingleValue <= MouseKey.Key_2
                ? 'mouse_button'
                : 'keyboard',
            value: macroStore.currentSingleValue,
            action: 'down',
          }),
            macroStore.addEvent({
              type: 'delay',
              value: 1
            },
              add.indexRow * 10 + add.indexColumn + 1)
          macroStore.addEvent(
            {
              type:
                macroStore.currentSingleValue <= MouseKey.Key_2
                  ? 'mouse_button'
                  : 'keyboard',
              value: macroStore.currentSingleValue,
              action: 'up',
            },
            add.indexRow * 10 + add.indexColumn + 2
          )
        } else {
          const tmp =
            macroStore.currentRecMacroArr[
            state.indexRow * 10 + state.indexColumn
            ]

          const action =
            tmp.type === 'mouse_button' || tmp.type === 'keyboard'
              ? tmp.action
              : 'down'

          macroStore.changeEvent(state.indexRow * 10 + state.indexColumn, {
            type:
              macroStore.currentSingleValue <= MouseKey.Key_2
                ? 'mouse_button'
                : 'keyboard',
            value: macroStore.currentSingleValue,
            action: action,
          })
        }
        macroStore.stoptHook()
        macroStore.cleanSingleValue()
        setContextMenuDisappear()
        setAddStateDisappear()
      }
    }, [macroStore.currentSingleValue])
    return (
      <Fragment>
        <dj.View w={580} h={32} x={311} y={25}>
          <dj.View>
            <dj.RadioButton
              x={22}
              type={'圆形'}
              name={'宏播放形式'}
              text={res.text.循环次数()}
              isChecked={macroStore.macroType === 'repeat_times'}
              clickHandle={() => {
                macroStore.setMacroType('repeat_times')
                if (macroStore.recodingState === 'stop' && macroStore.currentRecMacroArr.length > 0)
                  saveMacro()
              }}
            />
            <dj.SpinBox
              w={74}
              h={22}
              x={110}
              y={-3}
              min={1}
              max={65535}
              value={macroStore.repeatTimes}
              step={1}
              setValue={(value: number) => {
                macroStore.setRepeatTimes(value)
              }}
              changeFinished={(value: number) => {
                {
                  macroStore.setRepeatTimes(value)
                  if (macroStore.recodingState === 'stop' && macroStore.currentRecMacroArr.length > 0)
                    saveMacro()
                }
              }}
            />
          </dj.View>
          <dj.RadioButton
            w={215}
            x={225}
            type={'圆形'}
            name={'宏播放形式'}
            text={res.text.使用指派按键切换开关播放_domikey()}
            isChecked={macroStore.macroType === 'on_off'}
            clickHandle={() => {
              macroStore.setMacroType('on_off')
              if (macroStore.recodingState === 'stop' && macroStore.currentRecMacroArr.length > 0)
                saveMacro()
            }}
          />
          <dj.RadioButton
            w={blockCloud ? 200 : 135}
            x={blockCloud ? 425 : 465}
            type={'圆形'}
            name={'宏播放形式'}
            text={res.text.按下时播放_domikey()}
            isChecked={macroStore.macroType === 'touch_repeat'}
            clickHandle={() => {
              macroStore.setMacroType('touch_repeat')
              if (macroStore.recodingState === 'stop' && macroStore.currentRecMacroArr.length > 0)
                saveMacro()
            }}
          />
        </dj.View>
        <dj.View w={635} h={380} x={311} y={57} form={'Border_domikey'}>
          <MacroList />
        </dj.View>
        <dj.View w={580} h={34} x={311} y={473} zIndex={0}>
          {/* <dj.FlexView
          w={65}
          x={60}
          style={{
            borderRadius: '30px',
            background: '#fff',
            border: '1px solid #d0d1d1',
            borderRight: 'none'
          }}
        > */}
          <dj.Button
            w={120}
            h={25}
            y={7}
            mode={'宏按键'}
            text={
              macroStore.recodingState === 'recording'
                ? res.string.结束录制
                : res.string.开始录制
            }
            clickHandle={() => {
              macroStore.recodingState === 'stop'
                ? macroStore.starHook()
                : macroStore.stoptHook()
              macroStore.stopMouseEvent()

              if (macroStore.recodingState === 'stop' && macroStore.currentRecMacroArr.length > 0)
                saveMacro()
            }}
            mouseEnter={() => {
              macroStore.recodingState === 'recording' &&
                macroStore.stopMouseEvent()
            }}
            mouseLeave={() => {
              macroStore.recodingState === 'recording' &&
                macroStore.startMouseEvent()
            }}
          />
          {/* </dj.FlexView> */}

          {/* <dj.AddMacroContextMenu
            w={120}
            h={25}
            x={171}
            y={7}
            mode={'Head_domikey'}
            zIndex={99}
            isOpen={isKeyStore.macroAddClickKey && macroStore.recodingState === 'stop'}
            mouseEnter={() => { isKeyStore.setMacroAddTouchKey(true) }}
            mouseLeave={() => { isKeyStore.setMacroAddTouchKey(false) }}
            changeSub={() => {
              // if (e.stopPropagation) {
              //   e.stopPropagation();
              // }
              changeHeadContextMenu()
            }}
            addHandle={(
              type: 'mouse_button' | 'mouse_move' | 'keyboard' | 'delay'
            ) => {
              if (!macroStore.isFull) {
                const tempEvent: MacroEvent = getTmpEvent(type)
                macroStore.addEvent(
                  tempEvent,
                  macroStore.currentRecMacroArr.length
                )

                setAddData({
                  type: type,
                  indexRow: Math.floor(
                    (macroStore.currentRecMacroArr.length - 1) / 10
                  ),
                  indexColumn: (macroStore.currentRecMacroArr.length - 1) % 10,
                })

                changeHeadContextMenu()
              }
            }}
            isDisabled={
              macroStore.recodingState === 'recording' || macroStore.isFull
            }
          /> */}

          <dj.Button
            w={120}
            h={25}
            x={342}
            y={7}
            mode={'宏按键'}
            text={res.string.清空}
            isDisabled={macroStore.recodingState === 'recording'}
            clickHandle={() => {
              macroStore.setCurrentRecMacroArr([])
              if (macroStore.currentSelectMacro != undefined) {
                saveMacro()
              }
            }}
          />
          <dj.Button
            w={120}
            h={25}
            x={510}
            y={7}
            mode={'宏按键'}
            text={res.string.保存}
            clickHandle={saveMacro}
            mouseEnter={() => {
              macroStore.recodingState === 'recording' &&
                macroStore.stopMouseEvent()
            }}
            mouseLeave={() => {
              macroStore.recodingState === 'recording' &&
                macroStore.startMouseEvent()
            }}
          />
        </dj.View>
      </Fragment>
    )
  })
}
