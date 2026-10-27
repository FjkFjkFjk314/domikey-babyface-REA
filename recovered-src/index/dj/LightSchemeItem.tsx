import React from 'react'
import { res } from '../res'
import { dj } from '.'
import styled from '@emotion/styled'



const Ellp = styled.p({
  wordBreak: 'break-all',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}, (p: { maxW: number }) => ({
  maxWidth: p.maxW
}))

const LikeBtn = styled.div({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
})

export const LightSchemeItem = (p: {
  mode: 'head' | 'body'
  data?: string
  type: boolean | string,
  name: React.ReactNode
  describe: React.ReactNode
  // size: React.ReactNode
  username: React.ReactNode
  time: React.ReactNode
  downloadTimes: React.ReactNode
  my_score: -1 | 0 | 1 | null
  like: number,
  dislike: number
  arts: boolean
  clickHandle: () => void
  download: () => void
  report: () => void
  clickLike: () => void
  clickDislike: () => void
  delete: () => void
  upload?: () => void
}) => {
  const els: { name: React.ReactNode; w: number; style?: 'img' | 'btn' | 'like' | 'delete' }[] = p.arts
    ? [
      { name: '', w: 100, style: 'img' },
      { name: p.name, w: 160 },
      // { name: p.size, w: 80 },
      { name: p.username, w: 135 },
      { name: p.time, w: 85 },
      { name: p.downloadTimes, w: 70 },
      { name: res.string.下载, w: 70, style: 'btn' },
      { name: res.string.写入, w: 80, style: 'btn' },
      { name: res.string.删除, w: 80, style: 'delete' },
    ]
    : [
      { name: '', w: 100, style: 'img' },
      { name: p.name, w: 160 },
      // { name: p.size, w: 80 },
      { name: p.username, w: 135 },
      { name: p.time, w: 85 },
      { name: p.downloadTimes, w: 70 },
      { name: res.string.下载, w: 70, style: 'btn' },
      { name: res.string.赞, w: 80, style: 'like' },
      { name: res.string.踩, w: 80, style: 'like' },
      { name: res.string.写入, w: 80, style: 'btn' },
      // { name: res.string.举报, w: 60, style: 'btn' },
    ]

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
        {p.mode === 'head' && <Ellp maxW={v.w}>{i === 0 ? res.string.图片 : v.name}</Ellp>}
        {p.mode === 'body' && v.style === 'img' && <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: v.w - 10,
            height: Math.floor(370 / 6),
            backgroundColor: '#000000',
            cursor: 'pointer',
          }}
          onClick={p.clickHandle}>
          {p.data !== undefined && <img
            style={{ display: 'block', maxWidth: v.w - 10, maxHeight: Math.floor(370 / 6), cursor: 'pointer' }}
            src={p.data}
          />}
        </div>}
        {p.mode === 'body' && v.style === undefined && <Ellp maxW={v.w - 10}>{v.name}</Ellp>}
        {p.mode === 'body' && v.style === 'btn' && v.name === res.string.下载 && <dj.Button
          relative
          w={25}
          h={25}
          img={{
            size: {
              w: 25,
              h: 25,
            },
            src: res.img.cloud_download,
          }}
          clickHandle={p.download} />}
        {p.mode === 'body' && v.style === 'btn' && v.name === res.string.写入 && <dj.Button
          relative
          w={25}
          h={25}
          img={{
            size: {
              w: 25,
              h: 25,
            },
            src: res.img.cloud_download,
          }}
          clickHandle={p.upload} />}
        {/* {p.mode === 'body' && v.style === 'btn' && v.name === res.string.举报 && <dj.Button
          relative
          w={25}
          h={25}
          img={{
            size: {
              w: 25,
              h: 25,
            },
            src: res.img.report,
          }}
          clickHandle={p.report} />} */}
        {p.mode === 'body' && v.style === 'like' && v.name === res.string.赞 &&
          <LikeBtn>
            <dj.Button
              relative
              w={25}
              h={25}
              img={{
                size: {
                  w: 25,
                  h: 25,
                },
                src: res.img.like,
              }}
              isHightLight={p.my_score === 1}
              clickHandle={p.clickLike}
            />
            <Ellp maxW={60}>{p.like}</Ellp>
          </LikeBtn>}
        {p.mode === 'body' && v.style === 'like' && v.name === res.string.踩 &&
          <LikeBtn>
            <dj.Button
              relative
              w={25}
              h={25}
              img={{
                size: {
                  w: 25,
                  h: 25,
                },
                src: res.img.dislike,
              }}
              isHightLight={p.my_score === -1}
              clickHandle={p.clickDislike}
            />
            <Ellp maxW={60}>{p.dislike}</Ellp>
          </LikeBtn>}
        {p.mode === 'body' && v.style === 'delete' &&
          <dj.Button
            relative
            w={20}
            h={20}
            img={{
              size: {
                w: 20,
                h: 20,
              },
              src: res.img.bottom_delete,
            }}
            isHightLight={false}
            clickHandle={p.delete}
          />}
      </div>
    })}
  </div>
}