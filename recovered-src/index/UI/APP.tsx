import * as React from 'react'
import { MainPage } from './MainPage'
import { Welcome } from './Welcome'
import { useStore } from '../mobxStore/store'
import { useObserver } from 'mobx-react-lite'
import { ToastContainer } from 'react-toastify'
import { store } from './store'
import { DevUpgrade } from './Components/support/DevUpgrade'
import { MobxErrorWarning } from './utils/MobxErrorWarning'
import { AppUpgrade } from './Components/support/AppUpgrade'
import { Help } from './Help'
import { Music } from '../musictest'
import { MainPage_domikey } from './Components/domikeyUI/MainPage_domikey'

export const APP = () => {
  const { deviceStore, lightPageStore, macroStore } = useStore()
  const { toastStore } = useStore()
  const { devUpgradeOpen, appUpgrdeOpen } = store.useState(
    (v) => v.devUpgradeOpen.appUpgrdeOpen
  )
  lightPageStore.setPageIndex(0)
  React.useEffect(() => {
    if (deviceStore.currentDev === undefined)
      macroStore.stoptHook()

  }, [deviceStore.currentDev])

  return useObserver(() => (
    <div>
      <ToastContainer
        position='top-center'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div>
        {deviceStore.currentDev?.deviceType.displayName === 'help' ? <Help /> : deviceStore.deviceArr.length < 1 ? <Welcome /> : <MainPage_domikey />}
        {devUpgradeOpen && <DevUpgrade />}
        {appUpgrdeOpen && <AppUpgrade />}
        <MobxErrorWarning />
      </div>
    </div>
  ))
}
