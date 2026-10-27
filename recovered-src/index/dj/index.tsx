import * as React from 'react'
import { View, View2 } from './View'
import { FlexView,FlexColorView, FlexView2, FlexViewOver } from './FlexView'
import { Text, TextWarn, TextEll } from './Text'
import { List } from './List'
import { CheckBox, CheckBox2, DazzleColorCheckBox } from './CheckBox'
import { Slider, UserSlide } from './Slider'
import { SpinBox } from './SpinBox'
import { RouterLink } from './RouterLink'
import { Line } from './Line'
import { Ul } from './Ul'
import { Img } from './Img'
import { Button, ButtonELL, Button_domikey } from './Button'
import { VerticalLine } from './VerticalLine'
import { ColorBlock } from './ColorBlock'
import { ComboBox } from './ComboBox'
import { TextArea } from './TextArea'
import { TreeView } from './TreeView'
import { MacroButton } from './MacroButton'
import { MacroContextMenu } from './MacroContextMenu'
import { AddMacroContextMenu } from './MacroContextMenu'
import { SearchBar } from './SearchBar'
import { SchemeItem, PicSchemeItem } from './SchemeItem'
import { TextInput, TextSetInput } from './TextInput'
import { UserView } from './UserView'
import { ColorWheel } from './ColorWheel'
import { Triangles } from './Triangles'
import { RadioButton } from './RadioButton'
import { ContextMenuView } from './ContextMenuView'
import { Rotate } from './Rotate'
import { NormalList } from './NormalList'
import { PageList } from './PageList'
import { KeyboardBlock } from './KeyboardBlock'
import { Progress } from './Progress'
import { RedDot } from './RedDot'
import { mapObjIndexed } from 'ramda'
import { TimeInput } from './NumberInput'
import { LightRange } from '../UI/utils/LightRange'
import { SwitchButton } from './switch'
import { HelpBox } from '../UI/Components/helpPoint/helpBox'
import { ImageItem } from './ImageItem'
import { LightSchemeItem } from './LightSchemeItem'
import { MyComboBoxMui } from './MyComboBoxMui'
import { ComboBoxSelect } from './ComboBoxSelect'

type ExtProps = {
  x?: number
  y?: number
  w?: number | string
  h?: number | string
  relative?: any
  display?: string
  form?: keyof typeof TypeTable
  boxShadow?: 'Default' | 'Dark'
  opacity?: number
  marginRight?: number
  radius?: number
  zIndex?: number
}

const TypeTable = {
  DefaultBackground: {
    background: '#121212',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
  弹出框: {
    background: '#1c1c1c',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
  弹出框1: {
    background: '#1c1c1c',
    border: '2px solid gray',
    boxShadow: 'none',
    opacity: 1,
  },
  EmptyBackground: {
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
  MacroBackground: {
    background: '#201f1f',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
  Border: {
    background: 'transparent',
    border: 'solid 1px #201f1f',
    boxShadow: 'none',
    opacity: 1,
  },
  配置页: {
    background: '#121212',
    border: 'none',
    boxShadow: '2px 0px 2px 0px #1f1f1f,-2px 0px 2px 0px #1f1f1f',
    opacity: 1,
  },
  背景页: {
    background: '#121212',
    border: 'none',
    boxShadow: 'none',
    opacity: 0.85,
  },
  颜色选择框背景: {
    background: '#252525',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
  测试: {
    background: 'green',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
  可调整: {
    background: '#121212',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
  loading: {
    background: '#121212',
    border: 'none',
    boxShadow: 'none',
    opacity: 0.7,
  },
  被选中: {
    background: 'linear-gradient(90deg,#1f1e1e 0%, #121212 100%)',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
  用户协议: {
    background: 'transparent',
    border: '1px solid #393939',
    boxShadow: 'none',
    opacity: 1,
  },
  picPreview: {
    background: 'rgba(18,18,18,.7)',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
  背景页透: {
    background: '#121212',
    border: 'none',
    boxShadow: 'none',
    opacity: 0.35,
  },
  // Domikey new
  MacroBackground_domikey: {
    background: '#f7f8f8',
    border: '1px solid #e4e4e4',
    boxShadow: 'none',
    opacity: 1,
  },
  Border_domikey: {
    background: 'transparent',
    border: 'solid 1px #cecfcf',
    boxShadow: 'none',
    opacity: 1,
  },
  背景页_white: {
    background: '#f7f8f8',
    border: 'none',
    boxShadow: 'none',
    opacity: 0.95,
  },
  弹出框_domikey: {
    background: '#f7f8f8',
    border: 'none',
    boxShadow: 'rgb(31, 31, 31) 1px 0px 20px -6px',
    opacity: 1,
  },
  配置页_domikey: {
    background: '#fff',
    border: '#c9caca solid 1px',
    boxShadow: 'none',
    opacity: 1,
  },
  DefaultBackground_domikey: {
    background: '#fff',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
  被选中_domikey: {
    background: '#f7f8f8',
    border: 'none',
    boxShadow: 'none',
    opacity: 1,
  },
}

type PropsType<T extends any> = T extends React.ComponentType<infer R> ? R : any

const 添加ExtProps = <T extends any>(C: React.ComponentType<T>) => (
  p: T & ExtProps
) => (
  <div
    style={{
      position: p.relative === undefined ? 'absolute' : 'relative',
      left: p.x === undefined ? 0 : p.x,
      top: p.y === undefined ? 0 : p.y,
      width: p.w === undefined ? '100%' : p.w,
      height: p.h === undefined ? '100%' : p.h,
      display: p.display ? p.display : 'block',
      background: TypeTable[p.form ? p.form : 'EmptyBackground'].background,
      border: TypeTable[p.form ? p.form : 'EmptyBackground'].border,
      opacity: TypeTable[p.form ? p.form : 'EmptyBackground'].opacity,
      boxShadow: TypeTable[p.form ? p.form : 'EmptyBackground'].boxShadow,
      marginRight: p.marginRight ? p.marginRight : '',
      borderRadius: p.radius === undefined ? 0 : p.radius,
      zIndex: p.zIndex === undefined ? 1 : p.zIndex
    }}>
    <C {...p} />
  </div>
)

const _____ = <T extends { [key: string]: React.ComponentType<any> }>(dic: T) =>
  mapObjIndexed(添加ExtProps, dic) as {
    [P in keyof T]: React.ComponentType<PropsType<T[P]> & ExtProps>
  }

export const dj = _____({
  View,
  TextWarn,
  Text,
  TextEll,
  List,
  FlexView,
  FlexColorView,
  FlexView2,
  FlexViewOver,
  CheckBox,
  CheckBox2,
  DazzleColorCheckBox,
  Slider,
  SpinBox,
  RouterLink,
  Line,
  Ul,
  Img,
  Button,
  ButtonELL,
  VerticalLine,
  ColorBlock,
  ComboBox,
  TextArea,
  TreeView,
  MacroButton,
  MacroContextMenu,
  AddMacroContextMenu,
  SearchBar,
  SchemeItem,
  PicSchemeItem,
  TextInput,
  TextSetInput,
  UserView,
  ColorWheel,
  Triangles,
  RadioButton,
  ContextMenuView,
  Rotate,
  NormalList,
  PageList,
  KeyboardBlock,
  Progress,
  RedDot,
  TimeInput,
  LightRange,
  SwitchButton,
  HelpBox,
  ImageItem,
  UserSlide,
  LightSchemeItem,
  // Domikey new
  MyComboBoxMui,
  ComboBoxSelect,
  Button_domikey,
})



const ccc = <T extends any>(C: React.ComponentType<T>) => (
  p: T & ExtProps
) => (
  <div
    style={{
      position: p.relative === undefined ? 'absolute' : 'relative',
      left: p.x === undefined ? 0 : p.x,
      top: p.y === undefined ? 0 : p.y,
      width: p.w === undefined ? '100%' : p.w,
      height: p.h === undefined ? '100%' : p.h,
      display: p.display ? p.display : 'block',
      background: TypeTable[p.form ? p.form : 'EmptyBackground'].background,
      border: TypeTable[p.form ? p.form : 'EmptyBackground'].border,
      opacity: TypeTable[p.form ? p.form : 'EmptyBackground'].opacity,
      boxShadow: TypeTable[p.form ? p.form : 'EmptyBackground'].boxShadow,
      zIndex: 999,
    }}>
    <C {...p} />
  </div>
)
const asd = <T extends { [key: string]: React.ComponentType<any> }>(dic: T) =>
  mapObjIndexed(ccc, dic) as {
    [P in keyof T]: React.ComponentType<PropsType<T[P]> & ExtProps>
  }

export const dj2 = asd({
  View2,
})