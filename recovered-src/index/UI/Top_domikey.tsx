import React, { useState } from 'react'

import { remote } from 'electron'

import { res } from '../res'
import { dj } from '../dj'
import { store } from './store'
import { mobxStore, useStore } from '../mobxStore/store'
import { useObserver } from 'mobx-react-lite'
import { blockCloud, topnav_logo_p, urlStr } from '../appConfig'
import styled from '@emotion/styled'
import { BaseType } from 'src/dj/BaseType'
import { UserCenter } from './Components/center/UserCenter'
import { KeyboardHome } from './Components/home/Keyboard'
import { MouseHome } from './Components/home/Mouse'
import { WheelLight, LogoLight, RGBLight } from './Components/light/Light'
import { MacroFile } from './Components/macro/MacroFile'
import { ConfigScheme, MacroScheme } from './Components/scheme/Scheme'
import { Support } from './Components/support/Support'
import { changeWirelessLoopStatus } from '../sdk/DriverIO/usb/client'

export const Top_domikey = () => {
  const { userStore, isKeyStore, deviceStore, batteryStore, pageStore, macroStore } = useStore()
  const [subPageIndex, setSubPageIndex] = useState(0)
  isKeyStore.setLoginTipBoxKey(store.state.userOpen)

  const NavItem = (p: {
    w: number
    h: number
    num: number
    title: React.ReactNode
    img?: BaseType.ButtonStateImg
    isHightLight: boolean
    clickHandle: () => void

    __________items: {
      title: React.ReactNode
      changeable: boolean
      mouse: {
        title: React.ReactNode
        jsx: React.ReactNode
      }[]
      keyboard: {
        title: React.ReactNode
        jsx: React.ReactNode
      }[]
      common: {
        title: React.ReactNode
        jsx: React.ReactNode
      }[]
      lineExist: boolean
    }[]
    subPageIndex: number
    // showLitItem: boolean
  }) => {
    const Item = styled.div({
      position: 'relative',
      width: 108,
      height: 82,
      borderLeft: p.num == 0 ? '1px solid #c9caca' : '',
      borderRight: '1px solid #c9caca',
      // backgroundColor: `${p.isHightLight ? '#09dcd0' : ''}`,
      // borderRadius: '12px',
      '.image': {
        backgroundImage: p.img
          ? p.isHightLight
            ? `url(${p.img.active})`
            : `url(${p.img.normal})`
          : '',
      },
      '&:hover .image': {
        backgroundImage: p.img
          ? p.isHightLight
            ? `url(${p.img.active})`
            : `url(${p.img.hover})`
          : '',
      },
      '.text': {
        fontFamily: 'PingFang_Regular',
        //  fontSize: blockCloud ? 17 : 18,
        color: p.isHightLight
          ? '#6b6a69'
          : '#dadbdb'
      },
      '&:hover .text': {
        color: '#6b6a69'
      },
      // '&:hover': {
      //   backgroundColor: '#09dcd0',
      //   cursor: 'pointer'
      // },

    }, (p: {
      w: number,
      h: number,
    }) => ({
      width: p.w,
      height: p.h,
    }))
    // const { pageStore, shareStore, lightPageStore, macroStore } = useStore()

    return useObserver(() => (
      <Item
        w={p.w}
        h={p.h}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => {
            (p.clickHandle(), e.stopPropagation())
          }}>
          {/* {p.img && <div className={"image"} style={{ width: 32, height: 32, backgroundRepeat: 'no-repeat', backgroundSize: ' 100% 100%' }} />} */}

          <p className={"text"} style={{ lineHeight: '31px' }}>{p.title}</p>
        </div>
      </Item>

    ))



  }

  const __________items: {
    title: React.ReactNode
    changeable: boolean
    mouse: {
      title: React.ReactNode
      jsx: React.ReactNode
    }[]
    keyboard: {
      title: React.ReactNode
      jsx: React.ReactNode
    }[]
    common: {
      title: React.ReactNode
      jsx: React.ReactNode
    }[]
    lineExist: boolean
  }[] = [
      {
        title: res.string.主要设置,
        changeable: true,
        mouse: [{ title: 'CPI', jsx: <MouseHome /> }],
        keyboard: [{ title: '', jsx: <KeyboardHome /> }],
        common: [],
        lineExist: true,
      },
      {
        title: res.string.灯光设置,
        changeable: true,
        mouse: [
          {
            title: 'Wheel灯光',
            jsx: <WheelLight />,
          },
          {
            title: 'LOGO灯光',
            jsx: <LogoLight />,
          },
        ],
        keyboard: [
          { title: res.string.灯光, jsx: <RGBLight /> },
        ],
        common: [],
        lineExist: true,
      },
      {
        title: res.string.宏编辑,
        changeable: false,
        mouse: [],
        keyboard: [],
        common: [{ title: res.string.宏文件, jsx: <MacroFile /> }],
        lineExist: true,
      },
      {
        title: res.string.方案共享,
        changeable: false,
        mouse: [],
        keyboard: [],
        common: [
          {
            title: '配置文件',
            jsx: <ConfigScheme />,
          },
          {
            title: res.string.宏文件,
            jsx: <MacroScheme />,
          },
        ],
        lineExist: true,
      },
      {
        title: res.string.个人中心,
        changeable: false,
        mouse: [],
        keyboard: [],
        common: [{ title: '', jsx: <UserCenter /> }],
        lineExist: false,
      },
      {
        title: res.string.支持,
        changeable: false,
        mouse: [],
        keyboard: [],
        common: [{ title: '', jsx: <Support /> }],
        lineExist: false,
      },
    ]

  if (blockCloud) {
    console.log('SPLLLICCCCEEE')
    __________items.splice(3, 2)
  }


  return useObserver(() => (
    <dj.View w={1220} h={61} drag={true}>
      <div
        style={{
          width: '100%',
          height: '100%',
          borderBottom: '1px solid #c9caca'
        }}
      >

        <dj.Img w={35} h={29} x={22} y={16} imgBg={urlStr(topnav_logo_p)}></dj.Img>

        <dj.View w={650} h={61} x={80} drag={false}>
          <dj.FlexView flexDirection={'row'}>
            {__________items.map((v, i) => {
              return <NavItem
                key={i}
                num={i}
                w={108}
                h={61}
                title={v.title}
                __________items={__________items}
                subPageIndex={subPageIndex}
                isHightLight={i === pageStore.pageIndex && !store.state.userOpen}
                clickHandle={() => {

                  if (macroStore.recodingState === 'stop') {
                    isKeyStore.setTextKey(false)
                    pageStore.setPageIndex(i)
                    // isKeyStore.setIsSetFile(false)
                    setSubPageIndex(0)
                    if (__________items[pageStore.pageIndex].title === res.text.灯光()) isKeyStore.setLightKey(true)
                    else isKeyStore.setLightKey(false)
                    // isKeyStore.setIsSetFile(false)
                  } else {
                    mobxStore.toastStore.setInfo(res.text.请先停止录制())
                  }
                }} />
            })}
          </dj.FlexView>
        </dj.View>


        {(deviceStore.currentDev?.deviceType.is24 || deviceStore.currentDev?.deviceType.isblue)
          && batteryStore.battery !== undefined && <dj.FlexView
            w={200}
            h={20}
            x={900}
            y={25}
            justifyContent={'flex-start'}>
            {/* <dj.Text relative w={35} h={18} type={'键盘提示'} text={batteryStore.battery.battery + "%"} /> */}
            <div style={{ position: 'absolute', left: 34, top: 2 }}>
              <img style={{ display: 'block', width: 42, height: 'auto' }} src={res.img.battery.battery_0} />
              <div style={{
                position: 'absolute',
                left: 11,
                top: 3,
                width: batteryStore.battery.battery > 100 ? 18 : Math.ceil(batteryStore.battery.battery / 100 * 18),
                height: 8,
                backgroundColor: batteryStore.battery.battery > 20
                  ? `rgba(25,249,226,${batteryStore.battery?.state === 1 ? 0.5 : 1})`
                  : `rgba(255,204,0,${batteryStore.battery?.state === 1 ? 0.5 : 1})`
              }} />
              {batteryStore.battery?.state === 1 && <img style={{
                display: 'block',
                position: 'absolute',
                top: -1,
                left: 12,
                width: 16,
                transform: batteryStore.battery?.state === 1 ? 'rotate(90deg)' : 'rotate(0deg)'
              }} src={res.img.top_charge} />}
            </div>
          </dj.FlexView>}

        {userStore.user === undefined ? (
          !blockCloud && (
            <dj.Button
              x={980}
              y={19}
              w={100}
              h={26}
              isHightLight={false}
              mode={'Lighter'}
              text={'登录/注册'}
              clickHandle={() => {
                if (macroStore.checkIsRec()) return
                isKeyStore.setTextKey(false)
                store.setState.userOpen(true)
              }}
            />
          )
        ) : (
          <dj.TextEll
            w={100}
            h={26}
            x={980}
            y={19}
            type={'Domikey_text'}
            text={!blockCloud ? userStore.user.name : ''}></dj.TextEll>
        )}
        {/* 最小化功能 */}
        <dj.FlexView
          w={61}
          h={61}
          x={1098}
          style={{
            borderLeft: '1px solid #c9caca',
            borderRight: '1px solid #c9caca'
          }}
        >
          <dj.Button
            x={23}
            y={28}
            w={13}
            h={13}
            img={{
              size: {
                w: 13,
                h: 13,
              },
              src: res.img.minimize,
            }}
            clickHandle={() => remote.getCurrentWindow().hide()}
          />
        </dj.FlexView>
        <dj.FlexView
          w={61}
          h={61}
          x={1159}
          style={{
            borderRight: '1px solid #c9caca'
          }}
        >
          <dj.Button
            x={23}
            y={23}
            w={13}
            h={13}
            img={{
              size: {
                w: 13,
                h: 13,
              },
              src: res.img.close,
            }}
            clickHandle={() => {
              changeWirelessLoopStatus('stop')
              remote.getCurrentWindow().close()
            }
            }
          />
        </dj.FlexView>
      </div>

    </dj.View>
  ))
}
