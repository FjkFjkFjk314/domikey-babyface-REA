import React, { Fragment } from 'react'
import { MacroList } from './MacroList'
import { dj } from '../../../dj'
import { res } from '../../../res'
import { mobxStore, useStore } from '../../../mobxStore/store'
import { useObserver } from 'mobx-react-lite'
import { blockCloud } from '../../../appConfig'

export const MacroRecordArea = () => {
  const { macroStore } = useStore()


  const saveMacro = () => macroStore.uiSaveMacro()

  return useObserver(() => (
    <Fragment>
      <dj.View w={580} h={32} x={311} y={25}>
        <dj.View>
          <dj.RadioButton
            x={22}
            type={'方形'}
            name={'宏播放形式'}
            text={res.text.循环次数()}
            isChecked={macroStore.macroType === 'repeat_times'}
            clickHandle={() => {
              if (macroStore.checkIsRec()) return
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
          w={204}
          x={225}
          type={'方形'}
          name={'宏播放形式'}
          text={res.text.使用指派按键切换开关播放()}
          isChecked={macroStore.macroType === 'on_off'}
          clickHandle={() => {
            if (macroStore.checkIsRec()) return
            macroStore.setMacroType('on_off')
            if (macroStore.recodingState === 'stop' && macroStore.currentRecMacroArr.length > 0)
              saveMacro()
          }}
        />
        <dj.RadioButton
          w={blockCloud ? 200 : 100}
          x={blockCloud ? 430 : 465}
          type={'方形'}
          name={'宏播放形式'}
          text={res.text.按下时播放()}
          isChecked={macroStore.macroType === 'touch_repeat'}
          clickHandle={() => {
            if (macroStore.checkIsRec()) return
            macroStore.setMacroType('touch_repeat')
            if (macroStore.recodingState === 'stop' && macroStore.currentRecMacroArr.length > 0)
              saveMacro()
          }}
        />
      </dj.View>
      <dj.View w={580} h={447} x={311} y={57} form={'Border'}>
        <dj.View w={580} h={34} form={'MacroBackground'}>
          <dj.Button
            w={blockCloud ? 68 : 58}
            h={18}
            x={21}
            y={7}
            mode={'Bluer'}
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
          <dj.CheckBox
            x={280}
            y={8}
            w={68}
            h={16}
            text={res.string.固定}
            checkState={macroStore.isSetRecordTime}
            type={'Normal'}
            clickHandle={() => {
              macroStore.setIsSetRecordTime(!macroStore.isSetRecordTime)
            }}
          />
          <dj.SpinBox
            w={74}
            h={22}
            x={350}
            y={5}
            min={1}
            max={65535}
            value={macroStore.recordTimes}
            step={1}
            setValue={(value: number) => {
              macroStore.setRecordTimes(value)
            }}
            changeFinished={(value: number) => {
              if (value > 65535) {
                macroStore.setRecordTimes(65535)
                mobxStore.toastStore.setErr(res.text.输入的时间请勿超过65535ms())
              } else {
                macroStore.setRecordTimes(value)
              }
            }}
          />
          <dj.Text x={425} y={6} w={25} h={20} text={`ms`} type={'描述'} />
          <dj.Button
            w={60}
            h={18}
            x={203}
            y={7}
            mode={'Bluer'}
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
            w={60}
            h={18}
            x={510}
            y={7}
            mode={'Bluer'}
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
        <MacroList />
      </dj.View>
    </Fragment>
  ))
}
