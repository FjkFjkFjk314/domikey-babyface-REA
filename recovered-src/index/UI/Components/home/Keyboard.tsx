import React, { Fragment, useState } from 'react'

import { res } from '../../../res'
import { dj, dj2 } from '../../../dj'
import { KeySetting } from '../keysetting/KeySetting'
import { HomeProp, withProps, homeData } from '../../utils/WithProps'
import { 键鼠布局 } from '../../../res/layout'
import { mobxStore, useStore } from '../../../mobxStore/store'
import { getKeyPath } from '../keyPath'
import { getDevFnLayer, getDevLayer } from '../../../unitys/getDevLyaer'
import { useObserver } from 'mobx-react-lite'
import { blockCloud } from '../../../appConfig'
import { basicFunName } from '../keysetting/BasicFunction'
import { OutsideAlerter } from '../../../../src/UI/utils/OutsideAlerter'


export const KeyboardBlocks = (p: {
  deviceLayout: { layout: 键鼠布局[]; delt: { deltX: number; deltY: number } }
  changedValue: {
    hid: number
    mode: { color: string; type: 'Default' | 'CustomLight' | 'CustomWeight' | 'Forbidden' }
    index?: number
  }[]
  mode: 'Home' | 'Monochrome' | 'Multicolor'
  clickHandle?: (
    keyHidCode: number,
    text: string,
    positionX: number,
    positionY: number,
    width: number,
    high: number,
    index?: number
  ) => void
  mouseDown?: (
    keyHidCode: number,
    text: string,
    positionX: number,
    positionY: number,
    width: number,
    high: number,
    index?: number
  ) => void
  mouseUp?: (
    keyHidCode: number,
    text: string,
    positionX: number,
    positionY: number,
    width: number,
    high: number,
    index?: number
  ) => void
}) => {
  const defaultMode: (
    mode: 'Home' | 'Monochrome' | 'Multicolor'
  ) => {
    color: string
    type: 'Default' | 'CustomLight' | 'CustomWeight' | 'Forbidden'
  } = (mode: 'Home' | 'Monochrome' | 'Multicolor') => {
    switch (mode) {
      case 'Home':
      default:
        return {
          color: '',
          type: 'Default',
        }
      case 'Monochrome':
        return {
          color: '#4cd7c7',
          type: 'CustomLight',
        }
    }
  }

  const getKeyNormalColor = (values: number, tmp: 键鼠布局) => {
    let mode: {
      color: string;
      type: "Default" | "CustomLight" | "CustomWeight" | "Forbidden" | "Test"
    } | undefined = {
      color: '',
      type: 'Default',
    }

    if (p.changedValue.find((v) => v.hid === tmp.value && v.index === tmp.index)?.mode) {
      mode = p.changedValue.find((v) => v.hid === tmp.value && v.index === tmp.index)?.mode
    } else {
      mode = defaultMode(p.mode)
    }

    if (
      mobxStore.pageStore.pageIndex === 0 &&
      (values === 167837696 // fn
        || values === 167837952 //r_fn
        || tmp.ban ? values === tmp.value : ''
      )

    ) {
      mode = {
        color: '#ff0000',
        type: 'Forbidden',
      }
    }

    return mode
  }

  const { isKeyStore } = useStore()

  const checkUSPIC = (value: 键鼠布局) => {
    if (value.value !== undefined) {
      if (mobxStore.pageStore.pageIndex === 0) {
        return true
      }

      if ((mobxStore.pageStore.pageIndex === 1 && !value.knob) || (mobxStore.pageStore.pageIndex === 1 && value.userColor)) {
        return true
      }
    }
    return false
  }
  {
    return useObserver(() => {
      return (
        <Fragment>
          {p.deviceLayout.layout.map(
            (value, i) =>
              checkUSPIC(value) && (
                <dj.KeyboardBlock
                  key={i}
                  w={value.w}
                  h={value.h}
                  x={value.x + p.deviceLayout.delt.deltX}
                  y={-value.y + p.deviceLayout.delt.deltY}
                  mode={getKeyNormalColor(value.value, value)}
                  clickHandle={() => {
                    isKeyStore.setIsKnobKey(value.knob ? value.btn ? false : value.knob : false)
                    p.clickHandle ? p.clickHandle(
                      value.value,
                      value.keyName,
                      value.x + p.deviceLayout.delt.deltX,
                      -value.y + p.deviceLayout.delt.deltY,
                      value.w,
                      value.h,
                      value.index
                    ) : ''
                    // console.log(index);
                  }}
                  mouseDown={() => {
                    p.mouseDown ? p.mouseDown(
                      value.value,
                      value.keyName,
                      value.x + p.deviceLayout.delt.deltX,
                      -value.y + p.deviceLayout.delt.deltY,
                      value.w,
                      value.h,
                      value.index
                    ) : ''
                  }}
                  mouseUp={() => {
                    p.mouseUp ? p.mouseUp(
                      value.value,
                      value.keyName,
                      value.x + p.deviceLayout.delt.deltX,
                      -value.y + p.deviceLayout.delt.deltY,
                      value.w,
                      value.h,
                      value.index
                    ) : ''
                  }}
                />
              )
          )}
        </Fragment>
      )
    })
  }
}
const KeyboardBase = (p: HomeProp) => {
  const [state, setState] = useState<{
    open: boolean,
    keyHidCode: number,
    text: string,
    index: number | undefined
  }>({ open: false, keyHidCode: 0, text: '', index: undefined })
  const { deviceStore } = useStore()
  const { otherStore } = useStore()
  //console.log('device name', p.deviceName)
  const len = getDevLayer(deviceStore.currentDev?.deviceType.id!)
  const changeList = new Array()
  for (var i = 0; i < len; i++) {
    changeList.push(res.text.标准层() + '_' + (i + 1))
  }

  const fnLen = getDevFnLayer(deviceStore.currentDev?.deviceType.id!)
  const fnChangeList = new Array()
  for (var i = 0; i < fnLen; i++) {
    fnChangeList.push(res.text.Fn层() + '_' + (i + 1))
  }
  // console.error('device name', p.deviceName)
  // console.error('__dirname', __dirname)

  const keyPath = getKeyPath()


  const { isKeyStore } = useStore()

  const getKeyColor = (keyHidCode: number, type: string, key: any) => {
    for (let i = 0; i < p.deviceLayout.layout.length; i++) {
      const v = p.deviceLayout.layout[i]
      if (v.value === keyHidCode && v.knob && deviceStore.isFnMode) {
        return '#ff0000'
      }
    }

    if (
      keyHidCode === 167837696 // fn
      || keyHidCode === 167837952//r_fn
    ) {
      return '#ff0000'
    }

    if (type == "ConfigUnknown" && deviceStore.isFnMode) {
      return '#ff0000'
    }

    if (type === 'forbidden') {
      return '#ffff00'
    }

    if (type === 'ConfigFunction' && (basicFunName.findIndex(v => v === key) === -1)) {
      return '#ff0000'
    }

    return '#4cd7c7'
  }

  return useObserver(() => {
    return (
      <Fragment>
        <dj.Text h={18} x={144} y={435} type={'键盘提示'} text={res.string.带} />
        <dj.Button w={14} h={14} x={160} y={437} mode={'KeyboardExample'} />
        <dj.Text
          h={18}
          x={180}
          y={435}
          type={'键盘提示'}
          text={res.string.背景的按键表示该按键的默认功能已被更改}
        />

        {fnLen !== 0 && <dj.View
          h={28}
          x={720}>
          <dj.FlexView
            w={60}
            style={{
              borderRadius: '30px 0 0 30px',
              background: '#fff',
              border: '1px solid #d0d1d1',
              borderRight: 'none'
            }}
          >
            <dj.Text
              w={60}
              y={5}
              type={'Domikey_text'}
              text={res.text.Fn层()}
            />
          </dj.FlexView>
          <dj.FlexView
            w={65}
            x={blockCloud ? 60 : 60}
            style={{
              borderRadius: '0 30px 30px 0',
              background: '#fff',
              border: '1px solid #d0d1d1',
              borderRight: 'none'
            }}
          >
            <dj.SwitchButton
              x={22}
              y={4}
              skey={deviceStore.isFnMode}
              clickHandle={() => {
                deviceStore.setIsFnMode(!deviceStore.isFnMode)
              }} />
          </dj.FlexView>
        </dj.View>}

        {len > 1 && !deviceStore.isFnMode && deviceStore.currentProfile != undefined && <dj.View w={125} h={28} x={45}>
          <dj.FlexView
            w={85}
            style={{
              borderRadius: '30px 0 0 30px',
              background: '#fff',
              border: '1px solid #d0d1d1',
              borderRight: 'none'
            }}
          >
            <dj.Text x={3} y={6} type={'Domikey_text'} text={'配置文件'} />
          </dj.FlexView>
          <dj.MyComboBoxMui
            className='notoutside'
            w={125}
            x={85}
            selectedValue={changeList[deviceStore.currentProfile]}
            // onChange={(index) => {
            //   if (index !== deviceStore.currentProfile) {
            //     deviceStore.setCurrentProfile(index)
            //   }
            // }}
            // modes={changeList}
            clickHandle={() => { isKeyStore.setIsShowProfileSelect(!isKeyStore.isShowProfileSelect); }}
          />
        </dj.View>}

        {
          isKeyStore.isShowProfileSelect &&
          <OutsideAlerter
            clickOutsideHandle={() => {
              isKeyStore.setIsShowProfileSelect(false)
            }}
          >
            <dj.ComboBoxSelect
              w={125}
              h={120}
              x={130}
              y={28}
              zIndex={999}
              modes={changeList}
              onChange={(index) => {
                isKeyStore.setIsOpen(false);
                if (index !== deviceStore.currentProfile) {
                  deviceStore.setCurrentProfile(index)
                }
                isKeyStore.setIsShowProfileSelect(false)
              }}
            />
          </OutsideAlerter>
        }

        {fnLen > 1 && deviceStore.isFnMode && <dj.View w={132} h={28} x={744} y={9}>
          <dj.ComboBox
            w={132}
            selectedValue={fnChangeList[deviceStore.fnIndex]}
            onChange={(index) => {
              if (index !== deviceStore.fnIndex) deviceStore.setCurrentFnIndex(index)
            }}
            modes={fnChangeList}
            clickHandle={() => { }}
          />
        </dj.View>}
        {deviceStore.currentDev?.deviceType.otherSetting?.deBounce && <dj.View w={334} h={28} x={290}>
          <dj.FlexView
            w={85}
            style={{
              borderRadius: '30px 0 0 30px',
              background: '#fff',
              border: '1px solid #d0d1d1',
              borderRight: 'none'
            }}
          >
            <dj.Text
              w={'auto'}
              x={15}
              y={6}
              type={'Domikey_text'}
              text={res.string.按键灵敏度}
              isDisabled={false}
            />
          </dj.FlexView>
          <dj.FlexView
            w={305}
            x={86}
            style={{
              borderRadius: '0 30px 30px 0',
              background: '#fff',
              border: '1px solid #d0d1d1',
              borderRight: 'none'
            }}
          >
            <dj.LightRange
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
          </dj.FlexView>
        </dj.View>}
        {deviceStore.currentDev?.deviceType.otherSetting?.auto && <dj.FlexView
          h={20}
          y={40}
          x={fnLen === 0 ? 0 : blockCloud === "中文繁体" ? 100 : blockCloud ? 166 : 100}
          w={'auto'}>
          <dj.Text
            relative
            w={'auto'}
            type={'SubTitle'}
            text={res.text.自动识别系统()}
          />
          <dj.SwitchButton
            relative
            w={50}
            // x={blockCloud === "中文繁体" ? 105 : blockCloud ? 250 : 105}
            skey={deviceStore.isAuto}
            clickHandle={() => {
              deviceStore.setAutoOsen(deviceStore.isAuto)
            }} />
        </dj.FlexView>}
        {/* {deviceStore.currentDev?.deviceType.otherSetting?.deBounce && deviceStore.currentConfig.other?.deBounce && <dj.View w={334} h={28} x={27} y={388}>
          <dj.Text
            w={100}
            type={'SubTitle'}
            text={res.string.按键灵敏度}
            isDisabled={false}
          />
          <dj.LightRange
            x={28}
            min={1}
            max={deviceStore.currentDev?.deviceType.otherSetting.deBounce}
            leftDescription={res.text.快()}
            rightDescription={res.text.慢()}
            value={
              deviceStore.currentConfig.other.deBounce > deviceStore.currentDev?.deviceType.otherSetting.deBounce
                ? deviceStore.currentDev?.deviceType.otherSetting.deBounce
                : deviceStore.currentConfig.other.deBounce
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
        </dj.View>} */}
        <dj.View w={871} h={288} x={0} y={74}>
          <dj.Img
            w={871}
            h={288}
            imgBg={
              p.deviceName ? keyPath : res.img.MG912
            }
            type={'完全覆盖背景区'}
          />
          <KeyboardBlocks
            deviceLayout={p.deviceLayout}
            changedValue={p.keyValue.map((v) => {
              return {
                index: v.index,
                hid: v.original,
                mode: {
                  color: getKeyColor(v.original, v.type, v.key),
                  type: 'CustomLight',
                },
              }
            })}
            clickHandle={(keyHidCode: number, text: string, positionX: number, positionY: number, width: number, high: number, index?: number | undefined) => {
              const tmp = p.keyValue.find(v => v.original === keyHidCode && v.index === index);
              console.error(keyHidCode, index, tmp);
              // fn旋钮
              for (let i = 0; i < p.deviceLayout.layout.length; i++) {
                const v = p.deviceLayout.layout[i]
                if (v.value === keyHidCode && v.knob && deviceStore.isFnMode) {
                  mobxStore.toastStore.setErr(res.text.系统按键无法修改())
                  return
                }
                if (v.value === keyHidCode && v.ban) {
                  mobxStore.toastStore.setErr(res.text.系统按键无法修改())
                  return
                }
              }

              if (tmp?.type === 'ConfigUnknown' && deviceStore.isFnMode) {
                mobxStore.toastStore.setErr(res.text.系统按键无法修改())
                return
              }

              if (keyHidCode === 167837696 || keyHidCode === 167837952) {//fn键
                mobxStore.toastStore.setErr(res.text.系统按键无法修改())
                return
              }

              if (tmp?.type === 'ConfigFunction' && (basicFunName.findIndex(v => v === tmp?.key) === -1)) {//fn键
                mobxStore.toastStore.setErr(res.text.系统按键无法修改())
                return
              }

              setState({ open: true, keyHidCode: keyHidCode, text: text, index: index })
              isKeyStore.setIsOpen(true)

            }
            }
            mode={'Home'}
          />
        </dj.View>
        {isKeyStore.keyIsOpen && (
          <dj2.View2 w={1220} h={730} x={-268} y={-146}>
            <KeySetting
              keyHidCode={state.keyHidCode}
              title={state.text}
              oldValue={p.keyValue.find((v) => v.original === state.keyHidCode && v.index === state.index)}
              closeHandle={() => {
                setState({ open: false, keyHidCode: 0, text: '', index: undefined })
                isKeyStore.setIsOpen(false)
              }}
              index={state.index}
            />
          </dj2.View2>
        )}
      </Fragment >
    )
  })
  // })
}

export const KeyboardHome = withProps(KeyboardBase, homeData)
