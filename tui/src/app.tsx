import React, { useEffect, useState } from 'react'
import { Box, Text, useApp, useInput } from 'ink'
import { devices } from 'node-hid'
import { isKnownDevice, isBlueDevice } from './detect.js'
import { HidChannel } from './hid.js'
import { Keyboard, LightType } from './keyboard.js'

const LIGHT_ORDER: LightType[] = [
  'LightOff',
  'LightAlwaysOn',
  'LightBreath',
  'LightNeon',
  'LightWave',
  'LightRipple',
  'LightRaindrop',
  'LightSnake',
  'LightPressAction',
  'LightConverage',
  'LightSineWave',
  'LightKaleidoscope',
  'LightLineWave',
]

interface Dev {
  path: string
  vid: number
  pid: number
  product: string
  isBlue: boolean
}

export default function App() {
  const { exit } = useApp()
  const [devs, setDevs] = useState<Dev[]>([])
  const [sel, setSel] = useState(0)
  const [lightIdx, setLightIdx] = useState(1)
  const [battery, setBattery] = useState<number | undefined>()
  const [status, setStatus] = useState('')

  useEffect(() => {
    const found = devices()
      .filter((d) => d.path && isKnownDevice(d.vendorId, d.productId))
      .map((d) => ({
        path: d.path!,
        vid: d.vendorId,
        pid: d.productId,
        product: d.product ?? 'unknown',
        isBlue: isBlueDevice(d.vendorId, d.productId),
      }))
    setDevs(found)
  }, [])

  const applyLight = async (idx: number) => {
    const d = devs[sel]
    if (!d) return
    setStatus('sending...')
    try {
      const ch = new HidChannel(d.path)
      const kb = new Keyboard(ch, d.isBlue)
      // 蓝牙设备写命令前需 +60ms 延时 — USBDevice.ts:99
      await kb.setLight({ type: LIGHT_ORDER[idx], value: 4, speed: 3 })
      const bat = await kb.getBattery()
      setBattery(bat)
      ch.close()
      setStatus(`applied ${LIGHT_ORDER[idx]}`)
    } catch (e) {
      setStatus(`error: ${(e as Error).message}`)
    }
  }

  useInput((input, key) => {
    if (input === 'q' || (key.ctrl && input === 'c')) exit()
    if (key.upArrow) setSel((s) => Math.max(0, s - 1))
    if (key.downArrow) setSel((s) => Math.min(devs.length - 1, s + 1))
    if (key.leftArrow) {
      const n = (lightIdx - 1 + LIGHT_ORDER.length) % LIGHT_ORDER.length
      setLightIdx(n)
      void applyLight(n)
    }
    if (key.rightArrow) {
      const n = (lightIdx + 1) % LIGHT_ORDER.length
      setLightIdx(n)
      void applyLight(n)
    }
  })

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        domikey-tui — lightweight Domikey controller (reverse-engineered)
      </Text>
      <Text dimColor>↑↓ select device · ←→ switch light effect · q quit</Text>
      <Box marginTop={1} flexDirection="column">
        {devs.length === 0 && <Text color="yellow">No Domikey devices found.</Text>}
        {devs.map((d, i) => (
          <Text key={d.path} color={i === sel ? 'green' : undefined}>
            {i === sel ? '▶ ' : '  '}
            {d.product} [{d.vid.toString(16)}:{d.pid.toString(16)}]
            {d.isBlue ? ' (bluetooth)' : ''}
          </Text>
        ))}
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text>
          Light effect: <Text bold>{LIGHT_ORDER[lightIdx]}</Text>
        </Text>
        <Text dimColor>{LIGHT_ORDER.join(' · ')}</Text>
        {battery !== undefined && <Text>Battery: {battery}%</Text>}
        {status !== '' && <Text dimColor>{status}</Text>}
      </Box>
    </Box>
  )
}
