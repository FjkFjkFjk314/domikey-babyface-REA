import { useObserver } from 'mobx-react-lite'
import React, { Fragment, useState } from 'react'
import { ShopKey, blockCloud } from '../../../appConfig'
import { dj } from '../../../dj'
import { BaseType } from '../../../dj/BaseType'
import { useStore } from '../../../mobxStore/store'
import { res } from '../../../res'
import { SubNavbarItem } from '../../utils/SubNavbarItem'
import { UserCenter } from './center/UserCenter'
import { KeyboardHome } from './home/Keyboard'
import { MouseHome } from './home/Mouse'
import { LEDRGBLight } from './light/LEDLight'
import { WheelLight, LogoLight, RGBLight } from './light/Light'
import { KeyboardSleep } from './light/SleepUI'
import { MacroFile } from './macro/MacroFile'
import { ConfigScheme, MacroScheme } from './scheme/Scheme'
import { Shop } from '../shop/shop'
import { Support } from './support/Support'


export const MainLayout_domikey = () => {
  const [subPageIndex, setSubPageIndex] = useState(0)
  const { deviceStore, pageStore, macroStore, shareStore, isKeyStore, lightPageStore } = useStore()

  const __________items: {
    title: React.ReactNode
    src: BaseType.ButtonStateImg
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
        src: res.img.leftbar_home,
        changeable: true,
        mouse: [{ title: 'CPI', jsx: <MouseHome /> }],
        keyboard: [{ title: '', jsx: <KeyboardHome /> }],
        common: [],
        lineExist: false,
      },
      {
        title: res.string.灯光设置,
        src: res.img.leftbar_light,
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
        lineExist: false,
      },
      {
        title: res.string.宏编辑,
        src: res.img.leftbar_edit,
        changeable: false,
        mouse: [],
        keyboard: [],
        common: [{ title: '', jsx: <MacroFile /> }],
        lineExist: true,
      },
      {
        title: res.string.方案共享,
        src: res.img.leftbar_programme,
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
        src: res.img.leftbar_personal,
        changeable: false,
        mouse: [],
        keyboard: [],
        common: [{ title: '', jsx: <UserCenter /> }],
        lineExist: false,
      },
      {
        title: res.string.支持,
        src: res.img.leftbar_support,
        changeable: false,
        mouse: [],
        keyboard: [],
        common: [{ title: '', jsx: <Support /> }],
        lineExist: false,
      },
    ]

  if (ShopKey) {
    __________items.push(
      {
        title: "shop",
        src: res.img.leftbar_home,
        changeable: false,
        mouse: [],
        keyboard: [],
        common: [{ title: '', jsx: <Shop /> }],
        lineExist: false,
      },
    )
  }

  if (deviceStore.currentDev?.deviceType.logoLayout) {
    __________items[1].keyboard.push({ title: '灯带', jsx: <LEDRGBLight /> })
  }

  if (deviceStore.currentDev?.deviceType.otherSetting?.sleep_24 || deviceStore.currentDev?.deviceType.otherSetting?.sleep_bt) {

    __________items[1].keyboard.push({ title: res.string.睡眠设置, jsx: <KeyboardSleep /> })
  }
  const num = __________items.findIndex(v => v.title === res.string.灯光设置)
  if (deviceStore.currentDev?.deviceType.layout === null) {
    console.log('没有灯光模块');
    if (num !== -1)
      __________items.splice(num, 1)
  }
  if (blockCloud) {
    console.log('SPLLLICCCCEEE')
    __________items.splice(3, 2)
  }


  if (
    !deviceStore.currentDev?.deviceType.logoLayout
    && !(deviceStore.currentDev?.deviceType.otherSetting?.sleep_24
      || deviceStore.currentDev?.deviceType.otherSetting?.sleep_bt)
  ) {
    lightPageStore.setPageIndex(0)
  }

  document.onkeydown = () => {
    if (isKeyStore.lightKey && !isKeyStore.colorPickerKey && !isKeyStore.loginTipBoxKey && lightPageStore.pageIndex !== num) {
      if (isKeyStore.isShare || isKeyStore.personmm) {
        return true
      }
      // console.error('无法输入');
      return false
    }
    else {
      // console.error('输入ing');
      return true
    }
  }

  return useObserver(() => {
    return (
      <Fragment>

        <dj.View w={975} h={604} x={122} y={61} zIndex={2}>
          <dj.View w={352} h={25} x={420} y={44}>
            <dj.FlexView>
              {__________items[pageStore.pageIndex][
                __________items[pageStore.pageIndex].changeable
                  ? deviceStore.currentDev
                    ? deviceStore.currentDev.type
                    : 'keyboard'
                  : 'common'
              ].map(
                (v, index) =>
                  v.title !== '' && (
                    <SubNavbarItem
                      key={index}
                      num={index}
                      length={__________items[pageStore.pageIndex][
                        __________items[pageStore.pageIndex].changeable
                          ? deviceStore.currentDev
                            ? deviceStore.currentDev.type
                            : 'keyboard'
                          : 'common'
                      ].length}
                      title={v.title}
                      isClick={
                        __________items[pageStore.pageIndex].title === res.string.方案共享
                          ? shareStore.currentShareListNum === index
                          : __________items[pageStore.pageIndex].title === res.string.灯光设置
                            ? lightPageStore.pageIndex === index
                            : subPageIndex === index
                      }
                      clickHandle={() => {
                        if (__________items[pageStore.pageIndex].title === res.string.方案共享) {
                          index === 0 && shareStore.setCurrentShareListNum(0)
                          index === 1 && shareStore.setCurrentShareListNum(index)
                          if (index === 1) {
                            shareStore.setCurrentShareListType('macro')
                            shareStore.setShareListPage('macro', shareStore.macrosPageType)
                          }

                        }
                        if (__________items[pageStore.pageIndex].title === res.string.灯光设置) {
                          index <= 2 && lightPageStore.setPageIndex(index)
                        }

                      }}
                    />
                  )
              )}
            </dj.FlexView>
          </dj.View>

          <dj.View x={44} y={70} w={891} h={506}>
            {''}
            {__________items[pageStore.pageIndex][
              __________items[pageStore.pageIndex].changeable
                ? deviceStore.currentDev
                  ? deviceStore.currentDev.type
                  : 'common'
                : 'common'
            ].length <= subPageIndex
              ? setSubPageIndex(0)
              : __________items[pageStore.pageIndex][
                __________items[pageStore.pageIndex].changeable
                  ? deviceStore.currentDev
                    ? deviceStore.currentDev.type
                    : 'common'
                  : 'common'
              ]
              [
                __________items[pageStore.pageIndex].title === res.string.方案共享
                  ? shareStore.currentShareListNum
                  : __________items[pageStore.pageIndex].title === res.string.灯光设置
                    ? lightPageStore.pageIndex
                    : subPageIndex
              ].jsx}
          </dj.View>
        </dj.View>
      </Fragment>
    )
  })
}
