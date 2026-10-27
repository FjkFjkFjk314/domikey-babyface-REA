import React, { Fragment, useEffect } from 'react'
import { blockCloud, ClickKey, kCompanyDisplayName, kLanguage, kSingleLanguage } from '../../../../appConfig'
import { dj } from '../../../../dj'
import { res } from '../../../../res'
import { store } from '../../../store'
import { toToast } from '../../../utils/Toast'
import { SupportData, SupportProp, withProps } from '../../../utils/WithProps'
import { changeLanguage, findId } from '../../../utils/changeLanguage'
import { remote } from 'electron'
import { mobxStore, useStore } from '../../../../mobxStore/store'
import { useObserver } from 'mobx-react-lite'
import { langueLocaleKArr, langueLocaleVArr } from '../../../../res/string/languageC'
import { equals } from 'ramda'
import { OutsideAlerter } from '../../../../../src/UI/utils/OutsideAlerter'

let isCheckVersion: boolean = false
const SupportUI = (p: SupportProp) => {
  const { deviceStore,isKeyStore } = useStore()
  const dev = deviceStore.currentDev?.deviceType;
  const devId = findId(dev) != 0 ? findId(dev) : 0
  let led = deviceStore.currentDev?.deviceType.otherSetting?.LED != undefined ? true : false
  const getVersion = () => {
      let str = 'ID'+devId
      if (deviceStore.currentDevVersion === undefined) return 'reading'
      str += '_V' + Number(deviceStore.currentDevVersion).toString(16)

      if (!led ||Number(deviceStore.currentOledVersion) === 0) return str
      str += ('_OLEDV' + Number(deviceStore.currentOledVersion).toString(16))
      return str
  }

  const languageStr = blockCloud.toString() === 'false'
    ? langueLocaleKArr[0] // 中文简体
    : blockCloud.toString() === 'true'
      ? langueLocaleKArr[1] // 英语
      : blockCloud.toString()

  const getLanguageNameArr = () => {
    const nameArr = new Array<string>()

    nameArr.push(res.text.自动识别())

    for (let i = 0; i < kLanguage.length; i++) {
      const tmp = kLanguage[i]

      const index = langueLocaleKArr.findIndex(v => v === tmp)
      if (index === -1) nameArr.push(tmp)
      else nameArr.push(langueLocaleVArr[index].name)
    }

    return nameArr
  }

  const langueNameArr = getLanguageNameArr()

  useEffect(() => {
    const fn = async () => {
      await p.checkAppVersion(false)
      await p.checkIotVersion(false)
      if (!deviceStore.currentDev?.deviceType.is24
        && !deviceStore.deviceArr.some(v => v.deviceType.isblue === true)
        && !deviceStore.deviceArr.some(v => v.deviceType.is24 === true)) {
        await p.checkFwVersion(false)
      }
      isCheckVersion = true
    }
    if (!isCheckVersion) {
      fn()
    }
  }, [isCheckVersion])
  return useObserver(() => {
    return (
      <Fragment>
        <dj.View w={230} h={131} x={0} y={115}>
          <dj.Text h={25} y={0} type={'个人中心标题_domikey'} text={res.string.驱动版本} />
          {/* <dj.Line w={400} y={41} lineColor={'UserCenter'} /> */}
          <dj.Text h={20} y={60} text={p.appVersion} type={'描述_center'} />
          <dj.Button
            w={156}
            h={32}
            x={37}
            y={99}
            text={res.string.检查更新}
            mode={'宏按键'}
            clickHandle={async () => {
              await p.checkAppVersion(true)
              await p.checkIotVersion(true)
              if (p.upgradeStore.appNeedUpgrade_ || p.upgradeStore.iotNeedUpgrade) {
                p.upgradeStore.setUpgradeProgressApp(0)
                store.setState.appUpgrdeOpen(true)
              } else {
                // toToast('info', res.text.驱动已经是最新版本无需更新())
              }
            }}
          />
          {(p.upgradeStore.appNeedUpgrade_ || p.upgradeStore.iotNeedUpgrade) && (
            <dj.RedDot w={5} h={5} x={150} y={105} />
          )}
        </dj.View>

        <dj.View w={230} h={131} x={300} y={115}>
          <dj.Text h={25} y={0} type={'个人中心标题_domikey'} text={res.string.固件版本} />
          {/* <dj.Line w={400} y={41} lineColor={'UserCenter'} /> */}
          <dj.Text h={20} y={60} text={getVersion()} type={'描述_center'} />
          <dj.Button
            w={156}
            h={32}
            x={37}
            y={99}
            text={res.string.升级固件}
            mode={'宏按键'}
            clickHandle={async () => {
              if (deviceStore.currentDev?.deviceType.is24) {
                toToast('info', res.text.固件升级功能只支持在有线模式下进行())
              } else if (deviceStore.deviceArr.some(v => v.deviceType.isblue === true)) {
                toToast('info', res.text.固件升级功能只支持在有线模式下进行())
              } else if (deviceStore.deviceArr.some(v => v.deviceType.is24 === true)) {
                toToast('info', res.text.存在24G设备请先拔出后再进行升级())
              }
              else {
                await p.checkFwVersion(true)
                if (p.upgradeStore.devNeedUpgrade_ || p.upgradeStore.oledNeedUpgrade) {
                  p.upgradeStore.setUpgradeProgressDev(0)
                  store.setState.devUpgradeOpen(true)
                  mobxStore.upgradeStore.startCountDwon()
                } else if (deviceStore.currentDev != undefined && Number(deviceStore.currentDevVersion) === Number(deviceStore.currentDev.deviceType.severVersion)) {
                  toToast('info', res.text.固件已经是最新版本无需更新())
                  if (!p.upgradeStore.oledNeedUpgrade && deviceStore.currentDev?.deviceType.otherSetting?.LED != undefined) {
                    toToast('info', res.text.屏幕已经是最新版本无需更新())
                  }
                } else {

                }
                isCheckVersion = false
              }
            }}
          />
          {p.upgradeStore.devNeedUpgrade_ && !isCheckVersion && (
            <dj.RedDot w={5} h={5} x={135} y={100} />
          )}
        </dj.View>
        {!kSingleLanguage && <dj.View w={230} h={131} x={600} y={115}>
          <dj.Text h={25} y={0} type={'个人中心标题_domikey'} text={res.string.中英切换} />
          {/* <dj.Line w={400} y={41} lineColor={'UserCenter'} /> */}
          <dj.MyComboBoxMui
            w={156}
            h={32}
            x={37}
            y={99}
            className='notoutside'
            leftBorderRadius={true}
            selectedValue={
              !ClickKey
                ? langueNameArr[0]
                : kLanguage.findIndex(v => v === languageStr) !== -1
                  ? langueNameArr[kLanguage.findIndex(v => v === languageStr) + 1]
                  : '中文简体'
            }
            clickHandle={() => {
              isKeyStore.setIsShowLanguageSelect(!isKeyStore.isShowLanguageSelect);
            }}
          />
          {/* <dj.ComboBox
              w={156}
              selectedValue={
                !ClickKey
                  ? langueNameArr[0]
                  : kLanguage.findIndex(v => v === languageStr) !== -1
                    ? langueNameArr[kLanguage.findIndex(v => v === languageStr) + 1]
                    : '中文简体'
              }
              onChange={(index) => {
                if (!ClickKey && index === 0) return

                const k = index - 1
                if (equals(languageStr, kLanguage[k]) && ClickKey) return

                if (index === 0) {
                  changeLanguage(false, undefined)
                  remote.getCurrentWindow().reload()
                  return
                }

                const langueLocaleKI = langueLocaleKArr.findIndex(v => v === kLanguage[k]) !== -1
                const tmp = kLanguage[k] === langueLocaleKArr[0] // 中
                  ? false
                  : kLanguage[k] === langueLocaleKArr[1] // 英
                    ? true
                    : langueLocaleKI
                      ? kLanguage[k]
                      : false
                changeLanguage(tmp, langueLocaleKI ? langueLocaleKI : undefined)
                remote.getCurrentWindow().reload()
              }}
              modes={langueNameArr}
            /> */}
        </dj.View>}
        {
          isKeyStore.isShowLanguageSelect &&
          <OutsideAlerter
            clickOutsideHandle={() => {
              isKeyStore.setIsShowLanguageSelect(false)
            }}
          >
            <dj.ComboBoxSelect
              w={156}
              h={90}
              x={637}
              y={246}
              zIndex={999}
              overflow={'hidden scroll'}
              modes={langueNameArr}
              onChange={async (index: number) => {
                if (!ClickKey && index === 0) return

                const k = index - 1
                if (equals(languageStr, kLanguage[k]) && ClickKey) return

                if (index === 0) {
                  changeLanguage(false, undefined)
                  remote.getCurrentWindow().reload()
                  return
                }

                const langueLocaleKI = langueLocaleKArr.findIndex(v => v === kLanguage[k]) !== -1
                const tmp = kLanguage[k] === langueLocaleKArr[0] // 中
                  ? false
                  : kLanguage[k] === langueLocaleKArr[1] // 英
                    ? true
                    : langueLocaleKI
                      ? kLanguage[k]
                      : false
                changeLanguage(tmp, langueLocaleKI ? langueLocaleKI : undefined)
                remote.getCurrentWindow().reload()
              }}
            />
          </OutsideAlerter>
        }
      </Fragment>
    )
  })

}

export const Support = withProps(SupportUI, SupportData)
