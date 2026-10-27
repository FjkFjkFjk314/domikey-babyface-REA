import React, { useState } from 'react'
import { res } from '../res'
import { dj } from '.'
import styled from '@emotion/styled'
import { blockCloud } from '../appConfig'



const Ellp = styled.p({
  wordBreak: 'break-all',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}, (p: { maxW: number }) => ({
  maxWidth: p.maxW
}))


export const ImageItem = (p: {
  mode: 'head' | 'body'
  title?: string,
  data?: string,
  clickHandle?: () => void
  inputFinished?: (title: string) => void
  onShare?: () => void
  onload?: () => void
  onDelete?: () => void
}) => {
  const els: { name: React.ReactNode; w: number; style?: 'img' | 'btn' | 'rename' | 'delete' | 'name' }[] = blockCloud ? [
    { name: '', w: 260, style: 'img' },
    { name: res.string.名称, w: 270, style: 'name' },
    { name: res.string.重命名, w: 120, style: 'rename' },
    { name: res.string.分享, w: 130, style: 'btn' },
    { name: res.string.写入, w: 130, style: 'btn' },
    { name: res.string.删除, w: 100, style: 'delete' },
  ] : [
    { name: '', w: 260, style: 'img' },
    { name: res.string.名称, w: 270, style: 'name' },
    { name: res.string.重命名, w: 120, style: 'rename' },
    { name: res.string.分享, w: 130, style: 'btn' },
    { name: res.string.写入, w: 130, style: 'btn' },
    { name: res.string.删除, w: 100, style: 'delete' },
  ]
  const [rename, setRename] = useState({ state: false, name: p.title === undefined ? '' : p.title })
  return <div style={{
    display: 'flex',
    width: '100 %',
    height: p.mode === 'head' ? 36 : Math.floor(370 / 6),
    padding: '0px 16px',
    color: p.mode === 'head' ? '#7a7a7a' : '#959595',
    background: p.mode === 'head' ? '#201f1f' : 'transparent',
    fontSize: 12
  }}>
    {els.map((v, i) => {
      return <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: v.w, height: '100%' }}>
        {p.mode === 'head' && <Ellp maxW={v.w}>{i === 0 ? res.string.作品 : v.name}</Ellp>}
        {p.mode === 'body' && v.style === 'img' && <div style={{
          width: 120,
          height: Math.floor(370 / 6),
        }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 120,
              height: Math.floor(344 / 6),
              backgroundColor: '#000000',
              cursor: 'pointer',
            }}
            onClick={p.clickHandle}>
            {p.data !== undefined && <img
              style={{ display: 'block', maxWidth: 120, maxHeight: Math.floor(344 / 6), cursor: 'pointer' }}
              src={p.data}
            />}
          </div>
        </div>}
        {rename.state ? p.mode === 'body' && v.style === 'name' &&
          <dj.TextInput
            relative
            w={120}
            h={15}
            autoFocus={rename.state}
            usePlaceholder={res.useString.请输入新的配置名称}
            type={'重命名'}
            value={rename.name}
            onChange={(event) => {
              let str = event.target.value

              if (str.length > 10)
                str = str.slice(0, 10)
              setRename({ ...rename, name: str })

            }}
            inputFinished={() => {
              if (rename.name.replace(/[ ]/g, '') == '') {
                setRename({ state: false, name: p.title ?? '' })
                return
              }
              setRename({ state: false, name: rename.name })
              if (p.inputFinished !== undefined) {
                p.inputFinished(rename.name)
              }
            }}
          /> : p.mode === 'body' && v.style === 'name' &&
        <div style={{ fontSize: 12, color: '#ffffff', textAlign: 'left', position: 'relative' }}>
          {rename.name === '' ? res.string.未命名 : rename.name}
        </div>
        }
        {p.mode === 'body' && v.style === 'rename' && v.name === res.string.重命名 && <dj.Button
          relative
          w={18}
          h={18}
          img={{
            size: {
              w: 18,
              h: 18,
            },
            src: res.img.bottom_rename,
          }}
          clickHandle={() => {
            setRename({ ...rename, state: !rename.state })
          }} />}
        {p.mode === 'body' && v.style === 'btn' && v.name === res.string.分享 && <dj.Button
          relative
          w={18}
          h={18}
          img={{
            size: {
              w: 18,
              h: 18,
            },
            src: res.img.bottom_share,
          }}
          clickHandle={p.onShare} />}
        {p.mode === 'body' && v.style === 'btn' && v.name === res.string.写入 && <dj.Button
          relative
          w={18}
          h={18}
          img={{
            size: {
              w: 18,
              h: 18,
            },
            src: res.img.mywork_load,
          }}
          clickHandle={p.onload} />}
        {p.mode === 'body' && v.style === 'delete' &&
          <dj.Button
            relative
            w={18}
            h={18}
            img={{
              size: {
                w: 18,
                h: 18,
              },
              src: res.img.bottom_delete,
            }}
            isHightLight={false}
            clickHandle={p.onDelete}
          />}
      </div>
    })}
  </div>
}