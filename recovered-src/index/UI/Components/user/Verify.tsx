import React, { Fragment, useState, useEffect } from 'react'

import { dj } from '../../../dj'
import { res } from '../../../res'
import { store } from '../../store'
import { Login } from './Login'
import { VerifyPassword } from './VerifyPassword'
import { _2500ms消失文字 } from '../../utils/_2500ms消失文字'
import { VerifyFailed } from './VerifyFailed'
import { blockCloud } from '../../../appConfig'

export const Verify = (p: { email: string, seconds?: number }) => {
  const [verifyCode, setVerifyCode] = useState('')
  const [seconds, setSeconds] = useState(p.seconds == undefined ? 60 : p.seconds)

  useEffect(() => {
    const countDownId = setTimeout(() => {
      if (seconds >= 1) {
        setSeconds(seconds - 1)
      } else clearTimeout(countDownId)
    }, 1000)


    return () => {
      clearTimeout(countDownId)
    }
  }, [seconds])
  return (
    <Fragment>
      <dj.View w={370} h={330} x={416} y={170} form={'弹出框_domikey'} zIndex={2}>
        <dj.Text h={25} y={23} text={res.string.验证} type={'个人中心标题_domikey'} />
        {/* <dj.Line y={53} lineColor={'UserVerify'}></dj.Line> */}
        {seconds <= 0 ? (
          <dj.Button
            mode={'同意用户协议'}
            w={blockCloud ? 180 : 110}
            h={18}
            x={blockCloud ? 93 : 135}
            y={124}
            text={res.string.没有收到验证码}
            clickHandle={() => store.setState.user_UI(<VerifyFailed email={p.email} />)}
          />
        ) : (
          <dj.Text h={18} y={124} text={seconds + ' s'} type={'启动页搜索'} />
        )}

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
          clickHandle={() => store.setState.user_UI(<Login />)}
        />
        <dj.TextInput
          w={300}
          h={34}
          x={35}
          y={76}
          usePlaceholder={res.useString.请输入邮箱验证码}
          value={verifyCode}
          onChange={(event) => setVerifyCode(event.target.value)}
        />
        <dj.Button
          w={300}
          h={36}
          x={35}
          y={193}
          mode={'宏按键'}
          text={'确定'}
          clickHandle={() => {
            verifyCode.length < 6 ? (
              store.setState.user_warningText(
                <_2500ms消失文字 key={Date.now()} text={res.string.验证码不得少于6位} />)
            ) : (
              store.setState.user_UI(
                <VerifyPassword email={p.email} verifyCode={verifyCode} seconds={seconds} />
              )
            )
          }}
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
}
