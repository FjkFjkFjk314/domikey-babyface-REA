import * as React from 'react'

import { dj } from '../dj'
import { res } from '../res'

import { remote } from 'electron'
import { SupportData, SupportProp, withProps } from './utils/WithProps'
import { store } from './store'
import { default_logo_p, kAppVersion, kCompanyDisplayName, urlStr } from '../appConfig'
import { baseW } from '../screenConfig'
import { GA } from '../sdk/GA/ga'
import { currentDev, devlistList } from '../sdk/DriverIO/usb/DetectSupportDevice'
import { sleep } from '../unitys/timeFunc'
import { useState } from 'react'
import { changeWirelessLoopStatus } from '../sdk/DriverIO/usb/client'
import { mobxStore } from '../mobxStore/store'
const WelcomeUI = (p: SupportProp) => {
  const [devid, setDevid] = useState(0)
  const getDevId = async () => {
    await sleep(50)
    devlistList.forEach((v, i) => {
      if (v.dev && v.dev.id != 0) {
        if (i === devlistList.length - 1) {
          setDevid(v.dev.id)
          console.log(currentDev.length, '222222222', v.dev.id)
        }
        return

      }
    })
  }
  React.useEffect(() => {
    GA.trackPage('welcome')
    getDevId()
  }, [])
  return (
    <dj.View drag={true}>
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#f7f8f8'
        }}
      >
        <dj.Button
          w={13}
          h={13}
          x={1149}
          y={28}
          img={{
            size: {
              w: 13,
              h: 13,
            },
            src: res.img.minimize,
          }}
          clickHandle={() => remote.getCurrentWindow().hide()}
        />
        <dj.Button
          w={13}
          h={13}
          x={1185}
          y={23}
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
        <dj.Img w={100} h={88} x={550} y={269} imgBg={urlStr(default_logo_p)} />
        <dj.Text
          w={baseW}
          h={40}
          x={0}
          y={382}
          text={res.text.欢迎使用() + kCompanyDisplayName + res.text.驱动()}
          type={'启动页主标题_black'}>

        </dj.Text>
        <dj.Text
          key={devid}
          w={baseW}
          x={0}
          h={20}
          y={519}
          text={devid != 0 ? 'id: ' + devid + res.text.搜寻设备中() : res.text.搜寻设备中()}
          type={'启动页搜索'}></dj.Text>
        <dj.Text
          w={baseW}
          h={13}
          x={0}
          y={533}
          text={'...'}
          type={'启动页搜索'}></dj.Text>
        <dj.Text
          w={386}
          h={20}
          x={780}
          y={688}
          text={'v:' + kAppVersion}
          type={'启动页搜索'}></dj.Text>
        <dj.Button
          w={146}
          h={32}
          x={1030}
          y={680}
          text={res.string.软件更新}
          mode={'BorderBackground'}
          clickHandle={async () => {
            mobxStore.macroStore.recodingState = 'stop'
            mobxStore.macroStore.stoptHook()
            await p.checkAppVersion(true)
            await p.checkIotVersion(true)
            if (p.upgradeStore.appNeedUpgrade_ || p.upgradeStore.iotNeedUpgrade) {
              p.upgradeStore.setUpgradeProgressApp(0)
              store.setState.appUpgrdeOpen(true)
            }
          }}
        />

      </div>


    </dj.View>
  )
}
export const Welcome = withProps(WelcomeUI, SupportData) 