import React, { Fragment, useState } from 'react'
import { dj } from '../../../dj'
import { res } from '../../../res'

import { store } from '../../store'
import { Login } from './Login'
import { UserArgee } from './UserArgee'
import { _2500ms消失文字 } from '../../utils/_2500ms消失文字'
import { webServerCompose } from './User'
import { blockCloud, login_logo_p, urlStr } from '../../../appConfig'
import { useStore } from '../../../mobxStore/store'


export const Register = () => {
  const [state, setstate] = useState({
    userName: '',
    email: '',
    password: '',
    password2: '',
    gender: 'male' as 'male' | 'female',
    isAgree: false,
  })

  const [agreeOpen, setAgreeOpen] = useState(false)

  const isEmpty = (value: string) => {
    return value === ''
  }

  const onSubmit = () => {
    if (!state.isAgree)
      store.setState.user_warningText(
        <_2500ms消失文字 key={Date.now()} text={res.string.请您同意用户协议后再进行注册} />
      )
    else if (
      isEmpty(state.email) ||
      isEmpty(state.userName) ||
      isEmpty(state.password) ||
      isEmpty(state.password2)
    )
      store.setState.user_warningText(
        <_2500ms消失文字
          key={Date.now()}
          text={res.string.请将所有的内容填满噢}
        />
      )
    else if (state.password !== state.password2)
      store.setState.user_warningText(
        <_2500ms消失文字 key={Date.now()} text={res.string.您两次输入的密码不一致} />
      )
    else if (res.regexp.register_email.test(state.email) === false)
      store.setState.user_warningText(
        <_2500ms消失文字 key={Date.now()} text={res.string.请输入正确的邮箱} />
      )
    else if (state.password.length < 6 || state.password.length > 25)
      store.setState.user_warningText(
        <_2500ms消失文字 key={Date.now()} text={res.string.密码长度应在625个字符之间} />
      )
    else if (state.userName.length < 4) {
      store.setState.user_warningText(
        <_2500ms消失文字 key={Date.now()} text={res.string.用户名至少需要4个字符} />
      )
    } else {
      webServerCompose('register')(state)
    }
  }
  const { isKeyStore } = useStore()

  return (
    <Fragment>
      <dj.View w={370} h={490} x={416} y={120} form={'弹出框_domikey'} zIndex={2}>
        <dj.Img w={200} h={200} x={85} y={-105} imgBg={res.img.ajazzImg.loginLogo} />
        <dj.Text
          h={25}
          y={88}
          type={'个人中心标题_domikey'}
          text={res.string.欢迎注册_domikey}></dj.Text>
        <dj.Button
          w={12}
          h={12}
          x={5}
          y={10}
          img={{
            size: {
              w: 12,
              h: 12,
            },
            src: res.img.return,
          }}
          clickHandle={() => store.setState.user_UI(<Login />)}
        />
        <dj.TextInput
          w={250}
          h={34}
          x={51}
          y={141}
          value={state.email}
          onChange={(event) => {
            if (event.target.value.length <= 50) {
              setstate({ ...state, email: event.target.value })
            } else {
              isKeyStore.setTextKey(true)
              store.setState.user_warningText(
                <_2500ms消失文字
                  key={Date.now()}
                  text={res.string.邮箱过长}
                />
              )
            }
          }
          }
          usePlaceholder={res.useString.邮箱}
        />
        {/* <dj.Line w={300} x={35} y={155} lineColor={'User'}></dj.Line> */}
        <dj.TextInput
          w={250}
          h={34}
          x={51}
          y={193}
          value={state.userName}
          onChange={(event) => {
            if (event.target.value.length <= 20) {
              setstate({ ...state, userName: event.target.value })
            } else {
              isKeyStore.setTextKey(true)
              store.setState.user_warningText(
                <_2500ms消失文字
                  key={Date.now()}
                  text={res.string.用户名过长在20个字符以内}
                />
              )
            }
          }
          }
          usePlaceholder={res.useString.用户名}
        />
        {/* <dj.Line w={300} x={35} y={207} lineColor={'User'}></dj.Line> */}
        <dj.TextInput
          w={250}
          h={34}
          x={51}
          y={244}
          type={'密码_domikey'}
          value={state.password}
          onChange={(event) => {
            if (event.target.value.length <= 25) {
              setstate({ ...state, password: event.target.value })
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
          usePlaceholder={res.useString.密码长度}
        />
        {/* <dj.Line w={300} x={35} y={258} lineColor={'User'}></dj.Line> */}
        <dj.TextInput
          w={250}
          h={34}
          x={51}
          y={294}
          type={'密码_domikey'}
          value={state.password2}
          onChange={(event) => {
            if (event.target.value.length <= 25) {
              setstate({ ...state, password2: event.target.value })
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
          usePlaceholder={res.useString.再次输入密码}
        />
        {/* <dj.Line w={300} x={35} y={308} lineColor={'User'}></dj.Line> */}
        {/* <dj.Text
          w={100}
          h={26}
          x={50}
          y={330}
          type={'Domikey_text'}
          text={res.string.性别}
        /> */}
        <dj.RadioButton
          w={30}
          h={14}
          x={130}
          y={354}
          type={'圆形'}
          name={'性别'}
          text={res.text.男()}
          isChecked={state.gender === 'male'}
          clickHandle={() => setstate({ ...state, gender: 'male' })}
        />
        <dj.RadioButton
          w={30}
          h={14}
          x={190}
          y={354}
          type={'圆形'}
          name={'性别'}
          text={res.text.女()}
          isChecked={state.gender === 'female'}
          clickHandle={() => setstate({ ...state, gender: 'female' })}
        />
        {/* <dj.Line w={300} x={35} y={357} lineColor={'User'}></dj.Line> */}
        <dj.Button
          w={160}
          h={36}
          x={95}
          y={390}
          mode={'宏按键'}
          text={res.string.注册}
          clickHandle={onSubmit}
        />
        <dj.CheckBox
          w={20}
          h={14}
          x={blockCloud ? 33 : 136}
          y={445}
          type={'用户须知'}
          text={''}
          checkState={state.isAgree}
          clickHandle={(event) => {
            setstate({ ...state, isAgree: event.target.checked })
          }}
        />
        <dj.Button
          mode={'同意用户协议'}
          w={'auto'}
          h={25}
          x={blockCloud ? 60 : 156}
          y={440}
          text={res.string.同意用户协议}
          clickHandle={() => setAgreeOpen(true)}
        />
        <dj.Button
          w={12}
          h={12}
          x={350}
          y={10}
          img={{
            size: {
              w: 12,
              h: 12,
            },
            src: res.img.close,
          }}
          clickHandle={() => {
            store.setState.userOpen(false)
            store.setState.user_UI(<Login />)
            store.setState.user_warningText('')
          }}
        />
      </dj.View>
      {agreeOpen && (
        <UserArgee
          setAgree={(pro: boolean) => {
            setAgreeOpen(false)
            setstate({ ...state, isAgree: pro })
          }}
        />
      )}
    </Fragment>
  )
}
