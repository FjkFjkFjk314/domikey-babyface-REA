import React, { Fragment } from 'react'

import { dj } from '../../../dj'
import { res } from '../../../res'
import { store } from '../../store'
import { Login } from './Login'
import { Verify } from './Verify'

export const VerifyFailed = (p: { email: string }) => (
  <Fragment>
    <dj.View w={370} h={330} x={416} y={170} form={'弹出框_domikey'} zIndex={2}>
      <dj.Button
        w={12}
        h={12}
        x={36}
        y={26}
        img={{
          size: {
            w: 12,
            h: 12,
          },
          src: res.img.return,
        }}
        clickHandle={() => store.setState.user_UI(<Verify email={p.email} seconds={0} />)}
      />
      <dj.TextArea
        w={268}
        h={112}
        x={40}
        y={60}
        editble={false}
        placeholder={res.text.未收到验证码提示()}
      />
      <dj.TextArea
        w={293}
        h={36}
        x={40}
        y={190}
        editble={false}
        placeholder={res.text.以上方法还未解决您的问题请在验证界面点击重新发送或重新注册()}
      />
      <dj.Button
        w={300}
        h={36}
        x={35}
        y={254}
        mode={'宏按键'}
        text={res.string.上一步}
        clickHandle={() => store.setState.user_UI(<Verify email={p.email} seconds={0} />)}
      />
      <dj.Button
        w={12}
        h={12}
        x={321}
        y={26}
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
  </Fragment>
)
