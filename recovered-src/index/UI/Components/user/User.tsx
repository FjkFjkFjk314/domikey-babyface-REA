import React, { Fragment } from 'react'
import { dj } from '../../../dj'
import { store } from '../../store'
import { Login } from './Login'
import { Verify } from './Verify'
import { ReturnMSG } from '../../../sdk/WebService'
import { _2500ms消失文字 } from '../../utils/_2500ms消失文字'
import { sdk } from '../../../sdk'
import { res } from '../../../res'
import { mobxStore } from '../../../mobxStore/store'

interface WebServerList {
  [key: string]: (p: any) => Promise<ReturnMSG<any>>
}

const WebServerListData: WebServerList = {
  login: (p: { email: string; password: string }) => {
    return sdk.ioFunc.userLogin(p.email, p.password)
  },
  register: (p: {
    userName: string
    gender: 'male' | 'female'
    email: string
    password: string
  }) => {
    return sdk.ioFunc.userRegister(p.userName, p.gender, p.email, p.password)
  },
  forgetPassword: (p: { email: string }) => {
    return sdk.ioFunc.reqFindPassVerifyCode(p.email)
  },
  resetPassword: (p: {
    email: string
    verifyCode: string
    password: string
  }) => {
    return sdk.ioFunc.findPassword(p.email, p.verifyCode, p.password)
  },
}

type UserResult = {
  [P in keyof WebServerList]: {
    text: string
    f: (req: any) => void
  }
}

const UserResultData: UserResult = {
  login: {
    text: '',
    f: (req: any) => store.setState.userOpen(false),
  },
  register: {
    text: res.text.注册成功(),
    f: (req: any) => store.setState.user_UI(<Login />),
  },
  forgetPassword: {
    text: res.text.验证码已发送请注意查收(),
    f: ({ email }) => store.setState.user_UI(<Verify email={email} />),
  },
  resetPassword: {
    text: res.text.修改密码成功请进行登录(),
    f: (req: any) => store.setState.user_UI(<Login />),
  },
}

const parseUserResult = <K extends keyof WebServerList>(
  result: ReturnMSG<any>,
  funcName: K,
  req: any
) => {
  console.log('parseUserResult', result, UserResultData[funcName])
  if (result.errCode === 0) {
    store.setState.user_warningText(
      <_2500ms消失文字 key={Date.now()} text={UserResultData[funcName].text} />
    )
    UserResultData[funcName].f(req)
  } else {
    const a = JSON.stringify(result.errMsg)
    let t
    if (a.length < 4) {
      t = result.errMsg.toString()
    } else {
      const mao = a.indexOf(":")
      const muo = a.lastIndexOf('"')
      t = a.substring(mao + 2, muo)
    }
    if (t.includes("dosn't exist")) {
      store.setState.user_warningText(
        <_2500ms消失文字 key={Date.now()} text={res.text.该邮箱不存在()} />
      )
    } else {
      if (t === 'the mailbox has been registered') {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={res.text.邮箱已被注册()} />
        )
      } else if (t === 'the user name has been registered') {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={res.text.用户名已被注册()} />
        )
      } else if (t === 'the user name or password is incorrect') {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={res.text.用户名或密码错误()} />
        )
      } else if (t === 'verification code error') {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={res.text.验证码错误()} />
        )
      } else if (t === '原密码错误') {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={res.text.原密码错误()} />
        )
      } else if (t === '验证失败') {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={res.text.验证失败()} />
        )
      } else if (t === '服务器session错误') {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={res.text.服务器session错误()} />
        )
      } else if (t === '参数错误') {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={res.text.参数错误()} />
        )
      }
      else if (t === '密码应大于6位小于25位') {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={res.text.密码应大于6位小于25位()} />
        )
      } else if (t === 'account does not exist') {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={res.text.帐户不存在()} />
        )
      }
      else {
        store.setState.user_warningText(
          <_2500ms消失文字 key={Date.now()} text={t} />
        )
      }


    }
  }
}

export const webServerCompose = <K extends keyof WebServerList>(
  funcName: K
) => async (req: any) => {
  console.log(funcName, req)
  mobxStore.toastStore.setState('bussy', 'login')
  const result = await WebServerListData[funcName](req)
  parseUserResult(result, funcName, req)
  mobxStore.toastStore.setState('idle', 'login')
}

export const User = () => {
  const { user_warningText, user_UI } = store.useState(
    (v) => v.user_warningText.user_UI
  )
  return (
    <Fragment>
      <dj.View form={'背景页_white'} drag={true} zIndex={2}>
        {''}
      </dj.View>
      {user_UI}
      <dj.Text h={16} y={640} type={'提示'} text={user_warningText} zIndex={2} />
    </Fragment>
  )
}
