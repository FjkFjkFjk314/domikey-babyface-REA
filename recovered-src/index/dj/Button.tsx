import React from 'react'
import styled from '@emotion/styled'

import { Text, TextEll } from './Text'
import { FlexView } from './FlexView'
import { BaseType } from './BaseType'

const Container = styled.div(
  (p: {
    datasrc?: BaseType.ButtonStateImg
    isHightLight: boolean
    opacity: number
    textColor: BaseType.ButtonStateImg
    border: BaseType.ButtonStateImg
    background: BaseType.ButtonStateImg
    borderRadius: number
    borderBottom: BaseType.ButtonStateImg
  }) => ({
    opacity: p.opacity,
    color: p.isHightLight ? p.textColor.active : p.textColor.normal,
    border: p.isHightLight ? p.border.active : p.border.normal,
    background: p.background.normal,
    borderRadius: p.borderRadius,
    // borderBottom: p.isHightLight
    //   ? p.borderBottom.active
    //   : p.borderBottom.normal,

    '&:hover': {
      border: p.border.hover,
      background: p.background.hover,
      // borderBottom: p.isHightLight
      //   ? p.borderBottom.active
      //   : p.borderBottom.hover,
    },
    '&:active': {
      border: p.border.active,
      background: p.background.active,
      // borderBottom: p.borderBottom.active,
    },

    '&:hover .text': {
      color: p.textColor.hover,
    },

    '&:active .text': {
      color: p.textColor.active,
    },

    '.image': {
      background: p.datasrc
        ? p.isHightLight
          ? `url(${p.datasrc.active})`
          : `url(${p.datasrc.normal})`
        : '',
    },
    '&:hover .image': {
      background: p.datasrc
        ? p.isHightLight
          ? `url(${p.datasrc.active})`
          : `url(${p.datasrc.hover})`
        : '',
    },
    '&:active .image': {
      background: p.datasrc ? `url(${p.datasrc.active})` : '',
    },
  }),
  {
    width: '100%',
    height: '100%',
  }
)
const Container_domikey = styled.div(
  (p: {
    datasrc?: BaseType.ButtonStateImg
    isHightLight: boolean
    opacity: number
    textColor: BaseType.ButtonStateImg
    border: BaseType.ButtonStateImg
    background: BaseType.ButtonStateImg
    borderRadius: number
    borderBottom: BaseType.ButtonStateImg
  }) => ({
    opacity: p.opacity,
    color: p.isHightLight ? p.textColor.active : p.textColor.normal,
    borderRight: p.border.normal,
    background: p.background.normal,
    borderRadius: p.borderRadius,
    // borderBottom: p.isHightLight
    //   ? p.borderBottom.active
    //   : p.borderBottom.normal,

    '&:hover': {
      borderRight: p.border.hover,
      background: p.background.hover,
      // borderBottom: p.isHightLight
      //   ? p.borderBottom.active
      //   : p.borderBottom.hover,
    },
    '&:active': {
      borderRight: p.border.active,
      background: p.background.active,
      // borderBottom: p.borderBottom.active,
    },

    '&:hover .text': {
      color: p.textColor.hover,
    },

    '&:active .text': {
      color: p.textColor.active,
    },

    '.image': {
      background: p.datasrc
        ? p.isHightLight
          ? `url(${p.datasrc.active})`
          : `url(${p.datasrc.normal})`
        : '',
    },
    '&:hover .image': {
      background: p.datasrc
        ? p.isHightLight
          ? `url(${p.datasrc.active})`
          : `url(${p.datasrc.hover})`
        : '',
    },
    '&:active .image': {
      background: p.datasrc ? `url(${p.datasrc.active})` : '',
    },
  }),
  {
    width: '100%',
    height: '100%',
  }
)

const AllTextWhite = {
  normal: '#ffffff',
  hover: '#ffffff',
  active: '#ffffff',
}

const NoneStyle = {
  normal: 'none',
  hover: 'none',
  active: 'none',
}

const BasicStyleTable = {
  不可用: {
    opacity: 1,
    textColor: {
      normal: '#959595',
      hover: '#959595',
      active: '#959595',
    },
    border: NoneStyle,
    background: NoneStyle,
    borderRadius: 0,
    textType: '侧边栏',
    borderBottom: NoneStyle,
  },
  侧边栏: {
    opacity: 1,
    textColor: {
      normal: '#5a5a5a',
      hover: '#959595',
      active: '#ffffff',
    },
    border: NoneStyle,
    background: NoneStyle,
    borderRadius: 0,
    textType: '侧边栏',
    borderBottom: NoneStyle,
  },
  子侧边栏: {
    opacity: 1,
    textColor: {
      normal: '#5a5a5a',
      hover: '#959595',
      active: '#ffffff',
    },
    border: {
      normal: '#5a5a5a',
      hover: '#959595',
      active: '#ffffff',
    },
    background: NoneStyle,
    borderRadius: 0,
    textType: '子侧边栏',
    borderBottom: {
      normal: 'none',
      hover: 'none',
      active: '2px solid #23f9e2',
    },
  },
  Lighter: {
    opacity: 1,
    textColor: {
      normal: '#5a5a5a',
      hover: '#959595',
      active: '#000',
    },
    border: NoneStyle,
    background: NoneStyle,
    borderRadius: 0,
    textType: '按钮_常规',
    borderBottom: NoneStyle,
  },
  Bluer: {
    opacity: 1,
    textColor: {
      normal: '#959595',
      hover: '#c4c4c4',
      active: '#23f9e2',
    },
    border: NoneStyle,
    background: NoneStyle,
    borderRadius: 0,
    //TODO:后续确定粗细
    textType: '按钮_子页面',
    borderBottom: NoneStyle,
  },
  Border: {
    opacity: 1,
    textColor: AllTextWhite,
    border: {
      normal: 'solid 1px #5a5a5a',
      hover: 'solid 1px #959595 ',
      active: 'solid 1px #23f9e2',
    },
    background: NoneStyle,
    borderRadius: 0,
    textType: '按钮_子页面',
    borderBottom: {
      normal: 'solid 1px #5a5a5a',
      hover: 'solid 1px #959595 ',
      active: 'solid 1px #23f9e2',
    },
  },
  BorderBackground: {
    opacity: 1,
    textColor: AllTextWhite,
    border: {
      normal: 'solid 1px #252525',
      hover: 'solid 1px #323131',
      active: 'solid 1px #23f9e2',
    },
    background: {
      normal: '#252525',
      hover: ' #323131 ',
      active: '#252525',
    },
    borderRadius: 2,
    textType: '按钮_子页面',
    borderBottom: {
      normal: 'solid 1px #252525',
      hover: 'solid 1px #323131',
      active: 'solid 1px #23f9e2',
    },
  },
  Sparker: {
    opacity: 1,
    textColor: AllTextWhite,
    border: {
      normal: 'solid 1px #21ae9f',
      hover: 'solid 1px #21ae9f',
      active: 'solid 1px #21ae9f',
    },
    background: {
      normal: '#21ae9f',
      hover: '#21ae9f',
      active: '#21ae9f',
    },
    borderRadius: 2,
    textType: '按钮_常规',
    borderBottom: NoneStyle,
  },
  MacroAdd: {
    opacity: 1,
    textColor: AllTextWhite,
    border: NoneStyle,
    background: { normal: '#e18f02', hover: '#e18f02', active: '#e18f02' },
    borderRadius: 2,
    textType: '按钮_宏菜单',
    borderBottom: NoneStyle,
  },
  MacroAdd_Head: {
    opacity: 1,
    textColor: { normal: '#959595', hover: '#c4c4c4', active: '#23f9e2' },
    border: NoneStyle,
    background: NoneStyle,
    borderRadius: 0,
    textType: '按钮_宏菜单_Head',
    borderBottom: NoneStyle,
  },
  MacroEdit: {
    opacity: 1,
    textColor: AllTextWhite,
    border: NoneStyle,
    background: { normal: '#028ea8', hover: '#028ea8', active: '#028ea8' },
    borderRadius: 2,
    textType: '按钮_宏菜单',
    borderBottom: NoneStyle,
  },
  MacroDelete: {
    opacity: 1,
    textColor: AllTextWhite,
    border: NoneStyle,
    background: { normal: '#bc373b', hover: '#bc373b', active: '#bc373b' },
    borderRadius: 2,
    textType: '按钮_宏菜单',
    borderBottom: NoneStyle,
  },
  MacroSub: {
    opacity: 1,
    textColor: AllTextWhite,
    border: NoneStyle,
    background: { normal: '#007ddb', hover: '#007ddb', active: '#007ddb' },
    borderRadius: 2,
    textType: '按钮_宏菜单',
    borderBottom: NoneStyle,
  },
  MacroSub_Head: {
    opacity: 1,
    textColor: { normal: '#bababa', hover: '#ffff', active: '#bababa' },
    border: NoneStyle,
    background: { normal: '#252525', hover: '#1d1d1d', active: '#252525' },
    borderRadius: 0,
    textType: '按钮_宏菜单',
    borderBottom: NoneStyle,
  },
  Scheme: {
    opacity: 1,
    textColor: {
      normal: '#959595',
      hover: '#c4c4c4',
      active: '#23f9e2',
    },
    border: {
      normal: 'solid 1px #5a5a5a',
      hover: 'solid 1px #959595 ',
      active: 'solid 1px #23f9e2',
    },
    background: NoneStyle,
    borderRadius: 0,
    textType: '按钮_常规',
    borderBottom: {
      normal: 'solid 1px #5a5a5a',
      hover: 'solid 1px #959595 ',
      active: 'solid 1px #23f9e2',
    },
  },
  Keyboard: {
    opacity: 1,
    textColor: {
      normal: 'transparent',
      hover: 'transparent',
      active: 'transparent',
    },
    border: {
      normal: 'none',
      hover: 'solid 1px #23f9e2',
      active: 'solid 1px #23f9e2',
    },
    background: {
      normal: 'transparent',
      hover: 'transparent',
      active: '#4cd7c7',
    },
    borderRadius: 6,
    textType: '按钮_常规',
    borderBottom: {
      normal: 'none',
      hover: 'solid 1px #23f9e2',
      active: 'solid 1px #23f9e2',
    },
  },
  KeyboardHighLight: {
    opacity: 0.33,
    textColor: {
      normal: 'transparent',
      hover: 'transparent',
      active: 'transparent',
    },
    border: {
      normal: 'solid 1px #23f9e2',
      hover: 'solid 1px #23f9e2',
      active: 'solid 1px #23f9e2',
    },
    background: {
      normal: '#4cd7c7',
      hover: '#4cd7c7',
      active: '#4cd7c7',
    },
    borderRadius: 6,
    textType: '按钮_常规',
    borderBottom: {
      normal: 'solid 1px #23f9e2',
      hover: 'solid 1px #23f9e2',
      active: 'solid 1px #23f9e2',
    },
  },
  KeyboardPic: {
    opacity: 0.5,
    textColor: {
      normal: 'transparent',
      hover: 'transparent',
      active: 'transparent',
    },
    border: {
      normal: 'solid 1px #ffffff',
      hover: 'solid 1px #ffffff',
      active: 'solid 1px #ffffff',
    },
    background: {
      normal: '#ffffff',
      hover: '#ffffff',
      active: '#ffffff',
    },
    borderRadius: 6,
    textType: '按钮_常规',
    borderBottom: {
      normal: 'solid 1px #ffffff',
      hover: 'solid 1px #ffffff',
      active: 'solid 1px #ffffff',
    },
  },
  KeyboardExample: {
    opacity: 1,
    textColor: {
      normal: 'transparent',
      hover: 'transparent',
      active: 'transparent',
    },
    border: {
      normal: 'solid 1px #23f9e2',
      hover: 'solid 1px #23f9e2',
      active: 'solid 1px #23f9e2',
    },
    background: {
      normal: '#4cd7c7',
      hover: '#4cd7c7',
      active: '#4cd7c7',
    },
    borderRadius: 6,
    textType: '按钮_常规',
    borderBottom: {
      normal: 'solid 1px #23f9e2',
      hover: 'solid 1px #23f9e2',
      active: 'solid 1px #23f9e2',
    },
  },
  按键设置: {
    opacity: 1,
    textColor: {
      normal: '#959595',
      hover: '#c4c4c4',
      active: '#23f9e2',
    },
    border: NoneStyle,
    background: NoneStyle,
    borderRadius: 0,
    textType: '按钮_常规',
    borderBottom: {
      normal: 'none',
      hover: 'none',
      active: 'solid 2px #23f9e2',
    },
  },
  鼠标按键: {
    opacity: 1,
    textColor: {
      normal: '#ffffff',
      hover: '#23f9e2',
      active: '#23f9e2',
    },
    border: {
      normal: 'solid 1px #ffffff',
      hover: 'solid 2px #23f9e2',
      active: 'solid 2px #23f9e2',
    },
    background: NoneStyle,
    borderRadius: 11,
    textType: '鼠标按键',
    borderBottom: {
      normal: 'solid 1px #ffffff',
      hover: 'solid 2px #23f9e2',
      active: 'solid 2px #23f9e2',
    },
  },
  同意用户协议: {
    opacity: 1,
    textColor: {
      normal: '#5a5a5a',
      hover: '#23f9e2',
      active: '#23f9e2',
    },
    border: NoneStyle,
    background: NoneStyle,
    borderRadius: 0,
    textType: '按钮_恢复默认设置',
    borderBottom: {
      normal: 'solid 1px #5a5a5a',
      hover: 'solid 1px #23f9e2',
      active: 'solid 1px #23f9e2',
    },
  },
  文本text: {
    opacity: 1,
    textColor: {
      normal: '#5a5a5a',
      hover: '#5a5a5a',
      active: '#5a5a5a',
    },
    border: NoneStyle,
    background: NoneStyle,
    borderRadius: 0,
    textType: '按钮_常规',
    borderBottom: NoneStyle,
  },
  下载: {
    opacity: 1,
    textColor: {
      normal: '#959595',
      hover: '#c4c4c4',
      active: '#23f9e2',
    },
    border: {
      normal: 'solid 1px #5a5a5a',
      hover: 'solid 1px #959595 ',
      active: 'solid 1px #23f9e2',
    },
    background: NoneStyle,
    borderRadius: 0,
    textType: '按钮_子页面',
    borderBottom: {
      normal: 'solid 1px #5a5a5a',
      hover: 'solid 1px #959595 ',
      active: 'solid 1px #23f9e2',
    },
  },
  filletBorder: {
    opacity: 1,
    textColor: AllTextWhite,
    border: {
      normal: 'solid 1px #252525',
      hover: 'solid 1px #23f9e2',
      active: 'solid 1px #23f9e2',
    },
    background: {
      normal: '#252525',
      hover: ' #23f9e2 ',
      active: '#23f9e2',
    },
    borderRadius: 6,
    textType: '按钮_子页面',
    borderBottom: {
      normal: 'solid 1px #252525',
      hover: 'solid 1px #23f9e2',
      active: 'solid 1px #23f9e2',
    },
  },
  // Domikey new 
  子侧边栏_domikey: {
    opacity: 1,
    textColor: {
      normal: '#dadbdb',
      hover: '#6b6a69',
      active: '#6b6a69',
    },
    border: {
      normal: '1px solid #000',
      hover: '1px solid #000',
      active: '1px solid #000',
    },
    background: NoneStyle,
    borderRadius: 0,
    textType: '子侧边栏_center',
    borderBottom: {
      normal: 'none',
      hover: 'none',
      active: '2px solid #23f9e2',
    },
  },
  子侧边栏_domikey_noborder: {
    opacity: 1,
    textColor: {
      normal: '#dadbdb',
      hover: '#6b6a69',
      active: '#6b6a69',
    },
    border: {
      normal: 'none',
      hover: 'none',
      active: 'none',
    },
    background: NoneStyle,
    borderRadius: 0,
    textType: '子侧边栏_center',
    borderBottom: {
      normal: 'none',
      hover: 'none',
      active: '2px solid #23f9e2',
    },
  },
  宏按键: {
    opacity: 1,
    textColor: {
      normal: '#6b6a69',
      hover: '#000',
      active: '#000',
    },
    border: {
      normal: '1px solid #d7d8d8',
      hover: '1px solid #000',
      active: '1px solid #000',
    },
    background: NoneStyle,
    borderRadius: 30,
    textType: '按钮_子页面',
    borderBottom: {
      normal: 'none',
      hover: 'none',
      active: '2px solid #23f9e2',
    },
  }
} as const

export const Button = (p: {
  isHightLight?: boolean
  mode?: keyof typeof BasicStyleTable
  textAlign?: BaseType.TextAlign
  text?: React.ReactNode
  textW?: number
  reverse?: any
  classname?: string
  img?: {
    size?: { w: number; h: number }
    src?: BaseType.ButtonStateImg
  }
  clickHandle?: () => void
  mouseEnter?: () => void
  mouseLeave?: () => void
  mouseDown?: () => void
  mouseUp?: () => void
  isDisabled?: boolean
}) => (
  <Container
    datasrc={p.img?.src}
    isHightLight={Boolean(p.isHightLight)}
    opacity={BasicStyleTable[p.mode || 'Lighter']['opacity']}
    textColor={
      BasicStyleTable[(!p.isDisabled ? p.mode : '不可用') || 'Lighter'][
      'textColor'
      ]
    }
    border={BasicStyleTable[p.mode || 'Lighter']['border']}
    background={BasicStyleTable[p.mode || 'Lighter']['background']}
    borderRadius={BasicStyleTable[p.mode || 'Lighter']['borderRadius']}
    borderBottom={BasicStyleTable[p.mode || 'Lighter']['borderBottom']}
    onClick={(event) => {
      !p.isDisabled &&
        (p.clickHandle && p.clickHandle(), event.stopPropagation())
    }}
    onMouseEnter={p.mouseEnter}
    onMouseLeave={p.mouseLeave}
    onMouseDown={p.mouseDown}
    onMouseUp={p.mouseUp}
  >
    <FlexView
      justifyContent={'space-between'}
      alignItems={'center'}
      flexDirection={p.reverse ? 'row-reverse' : 'row'}>
      {p.img && (
        <div
          style={{
            width: p?.img?.src ? p.img.size?.w || '100%' : 0,
            height: p?.img?.src ? p.img.size?.h || '100%' : 0,
          }}>
          <div
            className='image'
            style={{
              width: '100%',
              height: '100%',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      )}
      {p.text && (
        <div
          className='text'
          style={{
            width: p.textW || '100%',
          }}>
          <Text
            type={BasicStyleTable[p.mode || '侧边栏'].textType}
            text={p.text}
            classname={p.classname}
            isDisabled={p.isDisabled}
          />
        </div>
      )}
    </FlexView>
  </Container>
)
export const Button_domikey = (p: {
  isHightLight?: boolean
  mode?: keyof typeof BasicStyleTable
  textAlign?: BaseType.TextAlign
  text?: React.ReactNode
  textW?: number
  reverse?: any
  classname?: string
  img?: {
    size?: { w: number; h: number }
    src?: BaseType.ButtonStateImg
  }
  clickHandle?: () => void
  mouseEnter?: () => void
  mouseLeave?: () => void
  mouseDown?: () => void
  mouseUp?: () => void
  isDisabled?: boolean
}) => (
  <Container_domikey
    datasrc={p.img?.src}
    isHightLight={Boolean(p.isHightLight)}
    opacity={BasicStyleTable[p.mode || 'Lighter']['opacity']}
    textColor={
      BasicStyleTable[(!p.isDisabled ? p.mode : '不可用') || 'Lighter'][
      'textColor'
      ]
    }
    border={BasicStyleTable[p.mode || 'Lighter']['border']}
    background={BasicStyleTable[p.mode || 'Lighter']['background']}
    borderRadius={BasicStyleTable[p.mode || 'Lighter']['borderRadius']}
    borderBottom={BasicStyleTable[p.mode || 'Lighter']['borderBottom']}
    onClick={(event) => {
      !p.isDisabled &&
        (p.clickHandle && p.clickHandle(), event.stopPropagation())
    }}
    onMouseEnter={p.mouseEnter}
    onMouseLeave={p.mouseLeave}
    onMouseDown={p.mouseDown}
    onMouseUp={p.mouseUp}
  >
    <FlexView
      justifyContent={'space-between'}
      alignItems={'center'}
      flexDirection={p.reverse ? 'row-reverse' : 'row'}>
      {p.img && (
        <div
          style={{
            width: p?.img?.src ? p.img.size?.w || '100%' : 0,
            height: p?.img?.src ? p.img.size?.h || '100%' : 0,
          }}>
          <div
            className='image'
            style={{
              width: '100%',
              height: '100%',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      )}
      {p.text && (
        <div
          className='text'
          style={{
            width: p.textW || '100%',
          }}>
          <Text
            type={BasicStyleTable[p.mode || '侧边栏'].textType}
            text={p.text}
            classname={p.classname}
            isDisabled={p.isDisabled}
          />
        </div>
      )}
    </FlexView>
  </Container>
)

export const ButtonELL = (p: {
  isHightLight?: boolean
  mode?: keyof typeof BasicStyleTable
  textAlign?: BaseType.TextAlign
  text?: React.ReactNode
  textW?: number
  reverse?: any
  classname?: string
  img?: {
    size?: { w: number; h: number }
    src?: BaseType.ButtonStateImg
  }
  clickHandle?: () => void
  mouseEnter?: () => void
  mouseLeave?: () => void
  mouseDown?: () => void
  mouseUp?: () => void
  isDisabled?: boolean
}) => (
  <Container
    datasrc={p.img?.src}
    isHightLight={Boolean(p.isHightLight)}
    opacity={BasicStyleTable[p.mode || 'Lighter']['opacity']}
    textColor={
      BasicStyleTable[(!p.isDisabled ? p.mode : '不可用') || 'Lighter'][
      'textColor'
      ]
    }
    border={BasicStyleTable[p.mode || 'Lighter']['border']}
    background={BasicStyleTable[p.mode || 'Lighter']['background']}
    borderRadius={BasicStyleTable[p.mode || 'Lighter']['borderRadius']}
    borderBottom={BasicStyleTable[p.mode || 'Lighter']['borderBottom']}
    onClick={(event) => {
      !p.isDisabled &&
        (p.clickHandle && p.clickHandle(), event.stopPropagation())

    }}
    onMouseEnter={p.mouseEnter}
    onMouseLeave={p.mouseLeave}
    onMouseDown={p.mouseDown}
    onMouseUp={p.mouseUp}
  >
    <FlexView
      justifyContent={'space-between'}
      alignItems={'center'}
      flexDirection={p.reverse ? 'row-reverse' : 'row'}>
      {p.img && (
        <div
          style={{
            width: p?.img?.src ? p.img.size?.w || '100%' : 0,
            height: p?.img?.src ? p.img.size?.h || '100%' : 0,
          }}>
          <div
            className='image'
            style={{
              width: '100%',
              height: '100%',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      )}
      {p.text && (
        <div
          className='text'
          style={{
            width: p.textW || '100%',
          }}>
          <TextEll
            type={BasicStyleTable[p.mode || '侧边栏'].textType}
            text={p.text}
            classname={p.classname}
            isDisabled={p.isDisabled}
          />
        </div>
      )}
    </FlexView>
  </Container>
)