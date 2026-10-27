import React, { Fragment } from 'react'
import { dj } from '../../dj'

export const SubNavbarItem = (props: {
  title: React.ReactNode
  isClick: boolean
  clickHandle: () => void
  num: number
  length: number
}) => {
  const { title, isClick, clickHandle } = props

  return (
    <Fragment>
      <dj.Button_domikey
        relative
        w={100}
        mode={props.length >= 2 ? props.num == 0 ? '子侧边栏_domikey' : '子侧边栏_domikey_noborder' : '子侧边栏_domikey_noborder'}
        isHightLight={isClick}
        text={title}
        clickHandle={() => clickHandle()}
      />
      {/* <dj.View relative w={40}>
        {''}
      </dj.View> */}
    </Fragment>
  )
}

//      pure={{
//   borderRaidus: isClick ? '2px' : '0',
//   boderBottomColor: isClick ? '#23f9e2' : 'transparent',
// }}
