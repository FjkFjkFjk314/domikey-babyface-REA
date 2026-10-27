import React, { useState } from 'react'
import { Bottom } from '../../Bottom'
import { Share } from '../../utils/Share'
import { MainLayout_domikey } from './MainLayout_domikey'

import { store } from '../../store'
import { DevSleepLoading, Loading } from '../../utils/Loading'
import { Config } from '../../../sdk/DB'

import { res } from '../../../res'
import { useStore } from '../../../mobxStore/store'
import { Top_domikey } from '../../Top_domikey'
import { User } from '../user/User'
import { Configuration } from '../configuration/Configuration'
import { devlistList } from '../../../sdk/DriverIO/usb/DetectSupportDevice'

export const MainPage_domikey = () => {
  const {
    configurationOpen,
    shareOpen,
    userOpen,
  } = store.useState(
    (v) => v.configurationOpen.shareOpen.userOpen.appUpgrdeOpen
  )
  const { isKeyStore } = useStore()
  isKeyStore.setLightKey(!configurationOpen)
  const [shareConfig, setShareConfig] = useState<Config | undefined>(undefined)
  if (devlistList.some(v => v.dev && v.dev.id != 0 && v.dev.id === Number(localStorage.getItem("devid")))) {

    localStorage.removeItem("devid")
    console.log('删除', localStorage.getItem("devid"));

  }
  return (
    <div
      style={{
        width: 1220,
        height: 730,
        background: '#f7f8f8',
      }}
    >
      <div>
        <Top_domikey />
        <MainLayout_domikey />
        <Bottom />
      </div>
      {configurationOpen && (
        <Configuration
          title={res.text.配置设置()}
          setShareConfig={(config: Config) => setShareConfig(config)}
        />
      )}
      {isKeyStore.isShare && (
        <Share
          type={'Config'}
          config={shareConfig}
          close={() => {
            isKeyStore.setIsShare(false)
            setShareConfig(undefined)
          }}
        />
      )}
      <Loading />
      <DevSleepLoading />
      {userOpen && <User />}
    </div>
  )
}
