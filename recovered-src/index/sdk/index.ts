
import { openSDK } from '../sdkAPI'
import {
  initUSBDetect,
  detectSubject,
} from '../sdk/DriverIO/usb/DetectSupportDevice'
import { connectDB } from './DB'
import { webService } from './WebService'
import { DBService } from './WebService'
import { getCurrentUser } from './WebService'
import { ipcRenderer, app, remote } from 'electron'
import { res } from '../res'
import { changeWirelessLoopStatus } from './DriverIO/usb/client'

/** @deprecated */
export const sdk = {
  init: async () => {
    changeWirelessLoopStatus('start')
    ipcRenderer.send('international', [res.text.显示(), res.text.隐藏(), res.text.退出()])
    ipcRenderer.on('hide', (_, status: boolean) => {
      changeWirelessLoopStatus('stop')
      console.log("electron hide");
    })
    ipcRenderer.on('show', (_, status: boolean) => {
      changeWirelessLoopStatus('start')
      console.log("electron show");
    })
    ipcRenderer.on('shows', (_, status: boolean) => {
      changeWirelessLoopStatus('start')
      console.log("electron shows");
    })
    ipcRenderer.on('exit', async (_, status: boolean) => {
      await changeWirelessLoopStatus('stop')
      remote.getCurrentWindow().close()
      // app.exit() 
    })
    openSDK()
    await connectDB()
    detectSubject.subscribe((v) => console.log(v))
    await initUSBDetect()
    // await WebTest()
    //await dk2017Test()
  },

  ioFunc: {
    ...DBService,
    ...webService, //这个根本就不是webService
    getCurrentUser,
  },
} //as any as '___废弃___ 别用了 ！！！'
