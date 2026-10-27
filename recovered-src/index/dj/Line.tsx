import React from 'react'
const ColorTable = {
  Normal: '1px solid #201f1f',
  UserCenter: '1px solid #282727',
  User: '1px solid #353535',
  UserVerify: '1px solid #202020',
  按键设置: '1px solid #252525',
  UserCenter_domikey: '1px solid #dadbdb'
} as const

export const Line = (p: { lineColor: keyof typeof ColorTable }) => {
  return (
    <hr
      style={{
        width: '100%',
        border: ColorTable[p.lineColor],
      }}
    />
  )
}
