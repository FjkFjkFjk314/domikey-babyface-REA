import React, { Fragment } from 'react'

import { TreeView } from './TreeView'
import { MacroRecordArea } from './MacroRecordArea'
import { dj } from '../../../../../src/dj'
import { res } from '../../../../../src/res'

export const MacroFile = () => {
  return (
    <Fragment>
      <dj.Text h={30} x={315} y={-20} text={res.string.编辑宏文件_domikey} type={'树形文字_domikey'} />
      <MacroRecordArea />
      <dj.Text h={30} y={-20} text={res.string.宏文件目录_domikey} type={'树形文字_domikey'} />
      <TreeView />
    </Fragment>
  )
}
