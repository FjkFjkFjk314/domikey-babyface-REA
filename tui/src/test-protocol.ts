import assert from 'node:assert/strict'
import { checksum7, checksum8, applyChecksum } from './hid.js'
import {
  buildSetKeySimpleReport,
  buildSetKeyMatrixReports,
  decodeSlotBytes,
  encodeKeyAssignment,
  findIndexInDefaultMatrix,
  getDefaultSlotBytes,
} from './keyboard.js'
import { DOMIKEY_MODELS } from './keymap-data.js'

console.log('Running Domikey protocol & keymap verification suite...')

// 1. 验证 checksum7 & checksum8 与 iot_driver.exe (0x574712-0x574799) 及 YC200Common.ts 一致
{
  const b = Buffer.alloc(64)
  b[0] = 0x09
  b[1] = 0x00
  b[2] = 0xf8
  b[3] = 0x01
  b[4] = 0x02
  const expectedSum = 0x09 + 0x00 + 0xf8 + 0x01 + 0x02
  const expectedCsum7 = 255 - (expectedSum & 0xff)
  assert.equal(checksum7(b), expectedCsum7, 'checksum7 formula mismatch')

  const applied0 = applyChecksum(b, 0)
  assert.equal(applied0[7], expectedCsum7, 'applyChecksum(0) should write b[7]')

  const light = Buffer.alloc(64)
  light[0] = 0x07
  light[1] = 0x01
  light[2] = 0x02
  light[3] = 0x04
  light[4] = 0x08
  light[5] = 0x00
  light[6] = 0xf5
  light[7] = 0xd4
  const expectedSum8 = 0x07 + 0x01 + 0x02 + 0x04 + 0x08 + 0x00 + 0xf5 + 0xd4
  const expectedCsum8 = 255 - (expectedSum8 & 0xff)
  assert.equal(checksum8(light), expectedCsum8, 'checksum8 formula mismatch')

  const applied1 = applyChecksum(light, 1)
  assert.equal(applied1[8], expectedCsum8, 'applyChecksum(1) should write b[8]')
  assert.equal(applied1[7], 0xd4, 'applyChecksum(1) must preserve b[7] (Blue channel)')
}

// 2. 验证全部 4 款 Domikey 键盘的 layout 键位均可 100% 映射到 defaultMatrix 槽位
for (const [id, spec] of Object.entries(DOMIKEY_MODELS)) {
  for (const k of spec.layout) {
    const slot = findIndexInDefaultMatrix(spec.defaultMatrix, k.value, k.index)
    assert.notEqual(
      slot,
      undefined,
      `Model ${id} key ${k.keyName} (value=${k.value}, index=${k.index}) failed to map to defaultMatrix`,
    )
  }
  console.log(`  [OK] ${spec.displayName} (${spec.name}): all ${spec.layout.length} keys mapped to hardware slots`)
}

// 3. 验证单键改键 (0x13 / 0x15) 与 4 字节编解码对称性
{
  const dmk67 = DOMIKEY_MODELS.dmk67!
  // Esc key (hid = 41) in DMK67
  const escSlot = findIndexInDefaultMatrix(dmk67.defaultMatrix, 41)!
  assert.equal(escSlot, 1, 'DMK67 Esc slot should be #1 (offset 4)')
  const defBytes = getDefaultSlotBytes(dmk67.defaultMatrix, escSlot)
  assert.deepEqual(defBytes, [0, 0, 41, 0])

  // 改为 Ctrl + C (hid=6)
  const comboBytes = encodeKeyAssignment({ type: 'combo', mod1: 'ctrl', mod2: 'none', hid: 6 }, defBytes)
  assert.deepEqual(comboBytes, [0x00, 224, 6, 0x00])
  const decodedCombo = decodeSlotBytes(escSlot, comboBytes, defBytes)
  assert.equal(decodedCombo.isModified, true)
  assert.equal(decodedCombo.label, 'CTRL + C')

  // 构造 0x13 单键改键包
  const rep = buildSetKeySimpleReport(0, escSlot, comboBytes, false)
  assert.equal(rep.length, 64)
  assert.equal(rep[0], 0x13)
  assert.equal(rep[1], 0x00)
  assert.equal(rep[2], escSlot)
  assert.equal(rep[7], 255 - ((0x13 + 0x00 + escSlot) & 0xff))
  assert.deepEqual([...rep.subarray(8, 12)], comboBytes)

  // 构造 0x09 全矩阵批量写入包
  const fullReports = buildSetKeyMatrixReports(0, dmk67.defaultMatrix, dmk67.writePages, false)
  assert.equal(fullReports.length, 9)
  assert.equal(fullReports[0]![0], 0x09)
  assert.equal(fullReports[0]![2], 0xf8)
  assert.equal(fullReports[0]![3], 0x01)
}

console.log('All protocol & keymap tests passed!')
