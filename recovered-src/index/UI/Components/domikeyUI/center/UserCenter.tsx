import { useObserver } from 'mobx-react-lite'
import { equals } from 'ramda'
import React, { Fragment, useState } from 'react'
import { dj } from '../../../../../src/dj'
import { useStore } from '../../../../../src/mobxStore/store'
import { res } from '../../../../../src/res'
import { sdk } from '../../../../../src/sdk'
import { store } from '../../../../../src/UI/store'
import { _2500ms消失文字 } from '../../../../../src/UI/utils/_2500ms消失文字'
import { sleep } from '../../../../../src/unitys/timeFunc'

export const UserCenter = () => {
  const { user_warningText } = store.useState((v) => v.user_warningText)

  const [password, setPassword] = useState({
    old: '',
    new: '',
    new2: '',
  })
  const { isKeyStore } = useStore()
  const changePassword = async () => {

    if (password.old === '' || password.new === '' || password.new2 === '')
      store.setState.user_warningText(
        <_2500ms消失文字
          key={Date.now()}
          text={res.string.请将所有的内容填满噢}
        />
      )
    else if (password.new.length < 6 || password.new.length > 25)
      store.setState.user_warningText(
        <_2500ms消失文字
          key={Date.now()}
          text={res.string.密码长度应在625个字符之间}
        />
      )
    else if (password.new !== password.new2)
      store.setState.user_warningText(
        <_2500ms消失文字
          key={Date.now()}
          text={res.string.您两次输入的密码不一致}
        />
      )
    else if (password.new === password.old)
      store.setState.user_warningText(
        <_2500ms消失文字
          key={Date.now()}
          text={res.string.新旧密码一致无法进行修改}
        />
      )
    else
      await sdk.ioFunc
        .userChangePassword(password.old, password.new)
        .then((result) =>
          store.setState.user_warningText(
            <_2500ms消失文字
              key={Date.now()}
              text={
                result.errCode === 0
                  ? res.string.密码修改成功
                  : res.string.密码修改失败
              }
            />
          )
        )
    isKeyStore.setTextKey(true)
    setPassword({
      old: '',
      new: '',
      new2: '',
    })
  }


  const { configStore, deviceStore, userStore, macroStore, shareImageStore } = useStore()

  const logout = async () => {
    if (macroStore.currentSelectMacro?.user?.id == userStore.user?.id) macroStore.setCurrentRecMacroArr([]);
    await sdk.ioFunc
      .userLogout()
      .then((data) => {
        if (data.errCode === 0) {
          store.setState.user_Name('')
          store.setState.user_warningText('')
          // macroStore.setCurrentRecMacroArr([])
        }
        // data.errCode === 0 && store.setState.user_Name('')
      })

    await sleep(500)
    if (shareImageStore.imagePageType === 'arts' || shareImageStore.imagePageType === 'like') {
      shareImageStore.imagePageType = 'hot'
      shareImageStore.imagePageIndex = 1
    }
    if (configStore.configList.length === 0) {
      if (deviceStore.currentDev?.deviceType.displayName === undefined) return
      deviceStore.creatNewConfigToCurrentAndSave(
        deviceStore.currentDev?.deviceType.displayName,
        ''
      )
    }
    if (deviceStore.currentConfig.localId === configStore.configList[0].localId) return
    //退出登录若第一个键位不一致需要重新新加一个
    if (configStore.configList[0].deviceType?.displayName) {
      const deviceName = deviceStore.currentDev
        ? deviceStore.currentDev.deviceType.name
          ? deviceStore.currentDev.deviceType.name
          : 'default'
        : 'default'
      const isLayoutExit = deviceName in res.键鼠坐标
      const isConfigLayoutExit = configStore.configList[0].deviceType.displayName in res.键鼠坐标
      const deviceLayout = res.键鼠坐标[isLayoutExit ? deviceName : 'default'].layout //当前layout
      const configLayout = res.键鼠坐标[isConfigLayoutExit ? configStore.configList[0].deviceType.displayName : 'default'].layout
      for (let i = 0; i < deviceLayout.length; i++) {
        const item = deviceLayout[i]

        if (!configLayout.some(v => equals(v.value, item.value) && equals(v.index, item.index))) {
          if (deviceStore.currentDev?.deviceType.displayName === undefined) return
          await deviceStore.creatNewConfigToCurrentAndSave(
            deviceStore.currentDev?.deviceType.displayName,
            ''
          )
           return
        }

    }
    }
    deviceStore.setCurrentConfig(configStore.configList[0])
    store.setState.configurationOpen(false)
    // console.error(configStore.configList.length);
  }

  const uploadConfigs = () => configStore.uploadConfigs()

  const downConfigs = () => configStore.downloadConfigs()

  return useObserver(() =>
    userStore.user === undefined ? (
      <dj.Text
        type={'启动页主标题_black'}
        text={res.string.请您登录后再进入个人中心}
      />
    ) : (
      <Fragment>
        <dj.View w={250} h={260} x={0} y={85}>
          <dj.Text h={25} y={0} type={'个人中心标题_domikey'} text={res.string.云同步} />
          {/* <dj.Line w={400} y={41} lineColor={'UserCenter'} /> */}
          <dj.Text
            h={20}
            y={60}
            text={res.string.上传该设置将保存到我的云共享}
            type={'描述_center'}
          />
          <dj.Button
            w={130}
            h={32}
            x={60}
            y={99}
            text={res.string.上传当前设置}
            mode={'宏按键'}
            clickHandle={uploadConfigs}
          />

          <dj.Text
            h={20}
            y={151}
            text={'下载云端设置，将覆盖当前设置'}
            type={'描述_center'}
          />
          <dj.Button
            w={130}
            h={32}
            x={60}
            y={190}
            text={'下载云端设置'}
            mode={'宏按键'}
            clickHandle={downConfigs}
          />

        </dj.View>
        {/* <dj.View w={400} h={131} x={491} y={0}>
          <dj.Text h={25} y={0} type={'个人中心标题_domikey'} text={'云同步'} />
          <dj.Line w={400} y={41} lineColor={'UserCenter'} />
          <dj.Text
            h={20}
            y={60}
            text={'下载云端设置，将覆盖当前设置'}
            type={'描述'}
          />
          <dj.Button
            w={130}
            h={32}
            y={99}
            text={'下载云端设置'}
            mode={'BorderBackground'}
            clickHandle={downConfigs}
          />
        </dj.View> */}
        <dj.View w={320} h={201} x={330} y={85}>
          <dj.Text h={25} y={0} text={res.string.修改密码} type={'个人中心标题_domikey'} />{' '}
          {/* <dj.Line w={400} y={41} lineColor={'UserCenter'} /> */}
          <dj.TextInput
            h={35}
            y={39}
            type={'密码_domikey'}
            usePlaceholder={res.useString.请输入旧密码}
            value={password.old}
            onChange={(event) => {
              if (event.target.value.length <= 25) {
                isKeyStore.setTextKey(false)
                setPassword({ ...password, old: event.target.value })
              } else {
                isKeyStore.setTextKey(true)
                store.setState.user_warningText(
                  <_2500ms消失文字
                    key={Date.now()}
                    text={res.string.密码长度应在625个字符之间}
                  />
                )
              }
            }
            }
          />
          {/* <dj.Line w={400} y={98} lineColor={'UserCenter'} /> */}
          <dj.TextInput
            h={35}
            y={91}
            type={'密码_domikey'}
            usePlaceholder={res.useString.请输入新密码}
            value={password.new}
            onChange={(event) => {
              if (event.target.value.length <= 25) {
                isKeyStore.setTextKey(false)
                setPassword({ ...password, new: event.target.value })
              } else {
                isKeyStore.setTextKey(true)
                store.setState.user_warningText(
                  <_2500ms消失文字
                    key={Date.now()}
                    text={res.string.密码长度应在625个字符之间}
                  />
                )
              }
            }
            }

          />
          {/* <dj.Line w={400} y={155} lineColor={'UserCenter'} /> */}
          <dj.TextInput
            h={35}
            y={144}
            type={'密码_domikey'}
            usePlaceholder={res.useString.再次输入新密码}
            value={password.new2}
            onChange={(event) => {
              if (event.target.value.length <= 25) {
                isKeyStore.setTextKey(false)
                setPassword({ ...password, new2: event.target.value })
              } else {
                isKeyStore.setTextKey(true)
                store.setState.user_warningText(
                  <_2500ms消失文字
                    key={Date.now()}
                    text={res.string.密码长度应在625个字符之间}
                  />
                )
              }
            }
            }
          />
          {/* <dj.Line w={400} y={210} lineColor={'UserCenter'} /> */}
        </dj.View>



        <dj.View w={250} h={201} x={695} y={85}>
          <dj.Text h={25} y={0} text={res.string.我的设备} type={'个人中心标题_domikey'} />

          {/* <dj.Line w={400} y={41} lineColor={'UserCenter'} /> */}
          <dj.Text
            w={250}
            h={35}
            y={67}
            type={'Domikey_text'}
            text={deviceStore.currentDev?.deviceType.displayName}
          />
          {/* <dj.Line w={400} y={98} lineColor={'UserCenter'} /> */}
        </dj.View>
        <dj.Button
          w={130}
          h={32}
          x={425}
          y={275}
          text={res.string.修改密码}
          mode={'宏按键'}
          clickHandle={changePassword}
        />
        <dj.Button
          w={92}
          h={32}
          x={775}
          y={275}
          text={res.string.退出登录}
          mode={'宏按键'}
          clickHandle={logout}
        />
        {isKeyStore.textKey && <dj.Text
          text={user_warningText}
          type={'提示'}
          w={490}
          h={20}
          x={310}
          y={400}
        />}
      </Fragment>
    )
  )
}
