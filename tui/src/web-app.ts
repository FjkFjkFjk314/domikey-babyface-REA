import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOMIKEY_MODELS, HID_KEY_TABLE, SPECIAL_FUNCTION_MAP, SPECIAL_MOD_HID } from './keymap-data.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const EMBEDDED_DATA = JSON.stringify({
  models: DOMIKEY_MODELS,
  hidKeys: HID_KEY_TABLE,
  specialFunctions: SPECIAL_FUNCTION_MAP,
  specialMods: SPECIAL_MOD_HID,
})

export function renderWebAppHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Domikey Babyface 网页自定义按键管理台 (Reverse-Engineered Demo)</title>
  <style>
    :root {
      --bg-base: #0b0e14;
      --bg-panel: #131822;
      --bg-card: #1a2130;
      --bg-key: #222b3d;
      --bg-key-hover: #2d3952;
      --border: #2a344a;
      --text: #e6edf3;
      --text-muted: #8b9bb4;
      --accent: #00f5d4;
      --accent-dim: rgba(0, 245, 212, 0.14);
      --warn: #ffbe0b;
      --danger: #ff5c77;
      --purple: #9b5de5;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: var(--bg-base);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: var(--bg-panel);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-badge {
      background: linear-gradient(135deg, var(--accent), var(--purple));
      color: #05080c;
      font-weight: 800;
      font-size: 13px;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .brand h1 {
      font-size: 17px;
      font-weight: 700;
    }
    .brand-sub {
      font-size: 12px;
      color: var(--text-muted);
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    select, button, input {
      background: var(--bg-card);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 7px 12px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    button:hover, select:hover {
      border-color: var(--accent);
    }
    button.primary {
      background: var(--accent);
      color: #061014;
      border-color: var(--accent);
      font-weight: 600;
    }
    button.primary:hover {
      filter: brightness(1.1);
    }
    button.danger {
      border-color: rgba(255, 92, 119, 0.5);
      color: var(--danger);
    }
    button.danger:hover {
      background: rgba(255, 92, 119, 0.15);
    }
    .status-pill {
      font-size: 12px;
      padding: 5px 10px;
      border-radius: 999px;
      background: var(--accent-dim);
      color: var(--accent);
      border: 1px solid rgba(0, 245, 212, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
      box-shadow: 0 0 8px var(--accent);
    }
    main {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 390px;
      gap: 16px;
      padding: 16px 24px;
      max-width: 1680px;
      width: 100%;
      margin: 0 auto;
    }
    @media (max-width: 1180px) {
      main { grid-template-columns: 1fr; }
    }
    .left-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 0;
    }
    .panel {
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .layer-tabs {
      display: flex;
      gap: 6px;
    }
    .layer-tab {
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 12px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-muted);
    }
    .layer-tab.active {
      background: var(--accent-dim);
      color: var(--accent);
      border-color: var(--accent);
      font-weight: 600;
    }
    .kb-stage-wrap {
      width: 100%;
      overflow-x: auto;
      padding: 12px 4px;
      background: radial-gradient(circle at center, #182030 0%, #0e131d 100%);
      border-radius: 10px;
      border: 1px solid #20293c;
      display: flex;
      justify-content: center;
    }
    .kb-case {
      position: relative;
      background: #121722;
      border: 2px solid #2c3750;
      border-radius: 14px;
      box-shadow: 0 14px 36px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
      flex-shrink: 0;
      transition: width 0.15s ease, height 0.15s ease;
    }
    .kb-case.photo-mode {
      background-repeat: no-repeat;
      background-position: 0 0;
      background-size: 100% 100%;
      background-color: transparent;
      border-color: rgba(44, 55, 80, 0.5);
    }
    .keycap {
      position: absolute;
      background: linear-gradient(180deg, #2b3750 0%, #1d2538 100%);
      border: 1px solid #3d4e73;
      border-bottom: 3px solid #0f1521;
      border-radius: 5px;
      padding: 2px 2px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      user-select: none;
      transition: transform 0.08s ease, border-color 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
      overflow: hidden;
      gap: 1px;
    }
    .keycap:hover {
      background: var(--bg-key-hover);
      border-color: #6d89c4;
      z-index: 4;
    }
    .keycap.selected {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 2px rgba(0, 245, 212, 0.45), 0 0 14px rgba(0, 245, 212, 0.35);
      transform: translateY(1px);
      z-index: 6;
    }
    .keycap.modified {
      border-color: var(--warn);
      background: linear-gradient(180deg, #3b3322 0%, #282217 100%);
    }
    .keycap.forbidden {
      border-color: var(--danger);
      background: linear-gradient(180deg, #42202b 0%, #2a141b 100%);
    }
    /* 原厂底图模式下, 未改键默认透明以完整露出原厂键帽图标 */
    .kb-case.photo-mode .keycap {
      background: rgba(0, 0, 0, 0.02);
      border: 1px solid transparent;
      border-bottom: 1px solid transparent;
      border-radius: 5px;
      padding: 1px;
    }
    .kb-case.photo-mode .keycap:hover {
      border-color: #23f9e2;
      background: rgba(35, 249, 226, 0.16);
    }
    .kb-case.photo-mode .keycap.selected {
      border: 2px solid #00f5d4 !important;
      background: rgba(0, 245, 212, 0.24);
      box-shadow: 0 0 0 2px rgba(0, 245, 212, 0.35), 0 0 12px rgba(0, 245, 212, 0.4);
    }
    .kb-case.photo-mode .keycap.modified {
      border: 1.5px solid #ffbe0b;
      background: rgba(25, 20, 10, 0.78);
    }
    .kb-case.photo-mode .keycap.forbidden {
      border: 1.5px solid var(--danger);
      background: rgba(45, 12, 20, 0.82);
    }
    .keycap-orig {
      font-size: 8.5px;
      color: var(--text-muted);
      line-height: 1;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .keycap-cur {
      font-size: 11px;
      font-weight: 700;
      color: var(--text);
      text-align: center;
      line-height: 1.05;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre-line;
    }
    .keycap.modified .keycap-cur {
      color: var(--warn);
    }
    .keycap.forbidden .keycap-cur {
      color: var(--danger);
    }
    .keycap-slot {
      position: absolute;
      right: 2px;
      bottom: 1px;
      font-size: 7.5px;
      color: rgba(139, 155, 180, 0.45);
      line-height: 1;
      pointer-events: none;
    }
    .picker-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .picker-tab {
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 6px;
      background: var(--bg-card);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }
    .picker-tab.active {
      background: var(--accent-dim);
      color: var(--accent);
      border-color: var(--accent);
      font-weight: 600;
    }
    .key-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
      gap: 6px;
      max-height: 230px;
      overflow-y: auto;
      padding: 4px;
    }
    .key-pill {
      padding: 7px 6px;
      font-size: 12px;
      text-align: center;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 6px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .key-pill:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: var(--accent-dim);
    }
    .combo-builder {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 4px;
    }
    .combo-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .combo-row label {
      font-size: 12px;
      color: var(--text-muted);
      min-width: 72px;
    }
    .inspector-box {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .slot-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .slot-kv {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }
    .slot-kv span:first-child { color: var(--text-muted); }
    .slot-kv code {
      font-family: "JetBrains Mono", "Fira Code", monospace;
      color: var(--accent);
    }
    .hex-dump {
      font-family: "JetBrains Mono", "Fira Code", monospace;
      font-size: 11.5px;
      line-height: 1.55;
      background: #090c12;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .hex-byte {
      display: inline-block;
      padding: 1px 3px;
      border-radius: 3px;
      margin: 1px;
    }
    .hex-cmd { background: rgba(155, 93, 229, 0.28); color: #d6b4fc; font-weight: 700; }
    .hex-idx { background: rgba(0, 245, 212, 0.22); color: var(--accent); font-weight: 700; }
    .hex-csum { background: rgba(255, 190, 11, 0.25); color: var(--warn); font-weight: 700; }
    .hex-val { background: rgba(255, 92, 119, 0.25); color: #ff8fa3; font-weight: 700; }
    .log-list {
      max-height: 220px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
    }
    .log-item {
      background: #0d111a;
      border-left: 3px solid var(--accent);
      padding: 6px 8px;
      border-radius: 4px;
    }
    .log-item .log-meta {
      color: var(--text-muted);
      margin-bottom: 3px;
      display: flex;
      justify-content: space-between;
    }
    .legend {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: var(--text-muted);
      flex-wrap: wrap;
    }
    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .dot-swatch {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span class="brand-badge">DOMIKEY · REA</span>
      <div>
        <h1>Domikey Babyface 网页端自定义按键管理台</h1>
        <div class="brand-sub">逆向自 Domikey Driver (Electron + iot_driver.exe) · 支持 WebHID 直连 / Node-HID 桥接 / 离线硬件沙盒</div>
      </div>
    </div>
    <div class="toolbar">
      <label style="font-size:12px;color:var(--text-muted);">键盘型号:</label>
      <select id="modelSelect"></select>

      <label style="font-size:12px;color:var(--text-muted);">通信模式:</label>
      <select id="transportSelect">
        <option value="mock">虚拟键盘模拟器 (Mock 沙盒)</option>
        <option value="webhid">浏览器 WebHID 直连 (0x3151)</option>
        <option value="bridge">本地 Node-HID 服务 (/api)</option>
      </select>

      <button id="connectBtn" class="primary">连接 / 同步键盘</button>
      <button id="exportBtn">导出 JSON</button>
      <button id="importBtn">导入 JSON</button>
      <input type="file" id="importFile" accept=".json" style="display:none" />
      <span class="status-pill" id="statusPill">
        <span class="status-dot"></span>
        <span id="statusText">就绪 (Mock 沙盒已激活)</span>
      </span>
    </div>
  </header>

  <main>
    <div class="left-col">
      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>1:1 交互式键盘配列画布</span>
            <span id="modelMetaBadge" style="font-size:12px;color:var(--text-muted);font-weight:400;"></span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <div class="layer-tabs" id="viewModeTabs" title="切换原厂拟真底图或纯矢量键帽视图">
              <button class="layer-tab active" data-view="photo">原厂高清底图</button>
              <button class="layer-tab" data-view="vector">矢量键帽视图</button>
            </div>
            <div class="layer-tabs" id="layerTabs"></div>
            <button id="resetKeyBtn" title="将当前选中按键恢复为出厂默认">恢复单键默认</button>
            <button id="resetLayerBtn" class="danger" title="发送 0x02 / 重置当前层所有按键为出厂映射">重置当前层</button>
          </div>
        </div>

        <div class="kb-stage-wrap">
          <div class="kb-case" id="kbCase"></div>
        </div>

        <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div class="legend">
            <span><i class="dot-swatch" style="background:#263147;border:1px solid #364463"></i> 默认键位</span>
            <span><i class="dot-swatch" style="background:#332d22;border:1px solid var(--warn)"></i> 已自定义改键</span>
            <span><i class="dot-swatch" style="background:#381f28;border:1px solid var(--danger)"></i> 已禁用 (00 00 00 00)</span>
            <span><i class="dot-swatch" style="background:var(--accent)"></i> 当前选中</span>
          </div>
          <div style="font-size:12px;color:var(--text-muted);">
            提示: 点击上方任意按键后, 可直接在下方点选新功能, 或开启「物理按键捕获」直接按键盘赋值
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">
            <span>按键功能指派面板</span>
            <span id="selectedKeyBanner" style="color:var(--accent);font-size:12px;"></span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button id="captureKeyBtn">开启物理按键捕获</button>
            <button id="disableKeyBtn" class="danger">禁用该键 (0x00)</button>
          </div>
        </div>

        <div class="picker-tabs" id="pickerTabs">
          <button class="picker-tab active" data-tab="basic">标准键位 (字母 / 数字 / F区 / 控制键)</button>
          <button class="picker-tab" data-tab="combo">组合键构建器 (Ctrl / Shift / Alt / Win)</button>
          <button class="picker-tab" data-tab="special">多媒体 / 系统 / 层切换 / 灯光 / 鼠标</button>
          <button class="picker-tab" data-tab="light">全键 RGB 灯效控制 (0x07)</button>
        </div>

        <div id="tab-basic" class="tab-pane">
          <div class="key-grid" id="basicKeyGrid"></div>
        </div>

        <div id="tab-combo" class="tab-pane" style="display:none;">
          <div class="combo-builder">
            <div class="combo-row">
              <label>修饰键 1:</label>
              <select id="comboMod1">
                <option value="ctrl">Ctrl (0xE0)</option>
                <option value="shift">Shift (0xE1)</option>
                <option value="alt">Alt (0xE2)</option>
                <option value="win">Win / Command (0xE3)</option>
                <option value="none">无 (None)</option>
              </select>
              <label>修饰键 2:</label>
              <select id="comboMod2">
                <option value="none">无 (None)</option>
                <option value="shift">Shift (0xE1)</option>
                <option value="alt">Alt (0xE2)</option>
                <option value="ctrl">Ctrl (0xE0)</option>
                <option value="win">Win / Command (0xE3)</option>
              </select>
              <label>目标主键:</label>
              <select id="comboTargetHid"></select>
              <button id="applyComboBtn" class="primary">应用组合键</button>
            </div>
            <div style="font-size:12px;color:var(--text-muted);">
              编码规则 (dk2017.ts / yc500Common.ts): 单修饰键编码为 <code>[0x00, mod1_hid, target_hid, 0x00]</code>; 双修饰键编码为 <code>[0x00, mod1_hid, mod2_hid, target_hid]</code>。
            </div>
          </div>
        </div>

        <div id="tab-special" class="tab-pane" style="display:none;">
          <div class="key-grid" id="specialKeyGrid" style="grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));"></div>
        </div>

        <div id="tab-light" class="tab-pane" style="display:none;">
          <div class="combo-builder">
            <div class="combo-row">
              <label>灯效模式:</label>
              <select id="lightEffectSelect">
                <option value="LightAlwaysOn">常亮 (0x01)</option>
                <option value="LightBreath">呼吸 (0x02)</option>
                <option value="LightNeon">霓虹 (0x03)</option>
                <option value="LightWave">波浪 (0x04)</option>
                <option value="LightRipple">涟漪 (0x05)</option>
                <option value="LightRaindrop">雨滴 (0x06)</option>
                <option value="LightSnake">蛇形 (0x07)</option>
                <option value="LightPressAction">按键触发 (0x08)</option>
                <option value="LightConverage">汇聚 (0x09)</option>
                <option value="LightSineWave">正弦波 (0x0A)</option>
                <option value="LightKaleidoscope">万花筒 (0x0B)</option>
                <option value="LightLineWave">线性波 (0x0C)</option>
                <option value="LightOff">关闭灯光 (0x00)</option>
              </select>
              <label>亮度 (0-6):</label>
              <input type="number" id="lightBrightInput" min="0" max="6" value="4" style="width:68px;" />
              <label>速度 (0-4):</label>
              <input type="number" id="lightSpeedInput" min="0" max="4" value="2" style="width:68px;" />
              <label>颜色:</label>
              <input type="color" id="lightColorInput" value="#00f5d4" style="height:34px;padding:2px 4px;" />
              <button id="applyLightBtn" class="primary">发送灯效报文 (0x07, CheckSum8)</button>
            </div>
            <div style="font-size:12px;color:var(--text-muted);">
              说明: 灯效命令 <code>0x07</code> 的前 8 字节包含 RGB (<code>b[5..7]</code>), 因此使用 <code>checkSumType = 1</code>, 校验和写入 <code>b[8] = 255 - (sum(b[0..7]) &amp; 0xFF)</code>。
            </div>
          </div>
        </div>
      </section>
    </div>

    <aside class="inspector-box">
      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">当前选中键位 &amp; 矩阵槽位详情</div>
          <span id="protocolTag" style="font-size:11px;color:var(--accent);"></span>
        </div>
        <div class="slot-card">
          <div class="slot-kv"><span>物理键名 (Layout Key):</span><code id="infoKeyName">-</code></div>
          <div class="slot-kv"><span>默认 HID 码:</span><code id="infoDefaultHid">-</code></div>
          <div class="slot-kv"><span>硬件矩阵槽位 (keyIndex):</span><code id="infoSlotIdx">-</code></div>
          <div class="slot-kv"><span>矩阵字节偏移 (Offset):</span><code id="infoByteOffset">-</code></div>
          <div class="slot-kv"><span>出厂 4 字节编码:</span><code id="infoDefaultBytes">-</code></div>
          <div class="slot-kv"><span>当前 4 字节编码:</span><code id="infoCurrentBytes">-</code></div>
          <div class="slot-kv"><span>当前映射功能:</span><code id="infoCurrentLabel">-</code></div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">64 字节 HID Feature Report 实时解剖</div>
          <span style="font-size:11px;color:var(--text-muted);">65B 含 Report ID 0x00</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">
          <span class="hex-byte hex-cmd">b[0] 命令码</span>
          <span class="hex-byte hex-idx">b[1..4] 层/槽位/页</span>
          <span class="hex-byte hex-csum">b[7]/b[8] 校验和</span>
          <span class="hex-byte hex-val">b[8..11] 4B键位值</span>
        </div>
        <div class="hex-dump" id="hexInspector">点击任意按键并修改映射以查看生成的 64 字节 HID Feature Report...</div>
      </section>

      <section class="panel" style="flex:1;display:flex;flex-direction:column;">
        <div class="panel-header">
          <div class="panel-title">HID 通信事务日志 (TX / RX)</div>
          <button id="clearLogBtn" style="padding:3px 8px;font-size:11px;">清空</button>
        </div>
        <div class="log-list" id="txLogList"></div>
      </section>
    </aside>
  </main>

  <script>
    const DATA = ${EMBEDDED_DATA};

    // ============ 逆向还原的校验和与矩阵编解码核心 ============
    function checksum7(buf) {
      let sum = 0;
      for (let i = 0; i < 7; i++) sum += buf[i] || 0;
      return 255 - (sum & 0xff);
    }

    function checksum8(buf) {
      let sum = 0;
      for (let i = 0; i < 8; i++) sum += buf[i] || 0;
      return 255 - (sum & 0xff);
    }

    function applyChecksum(buf, type) {
      const out = new Uint8Array(64);
      out.set(buf.subarray(0, 64));
      if (type === 0) out[7] = checksum7(out);
      else if (type === 1) out[8] = checksum8(out);
      return out;
    }

    function numToByte4(num) {
      return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff];
    }

    function byte4Equals(a, b) {
      return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }

    function findIndexInDefaultMatrix(defaultMatrix, hid, findIndex) {
      let currentFindIndex = 0;
      const target = hid > 0xff ? numToByte4(hid) : [0, 0, hid & 0xff, 0];
      let slot = 0;
      for (let i = 0; i < defaultMatrix.length; i += 4) {
        if (
          defaultMatrix[i] === target[0] &&
          defaultMatrix[i + 1] === target[1] &&
          defaultMatrix[i + 2] === target[2] &&
          defaultMatrix[i + 3] === target[3]
        ) {
          if (findIndex === undefined || findIndex === currentFindIndex) return slot;
          currentFindIndex++;
        }
        slot++;
      }
      return undefined;
    }

    function hidToLabel(hid) {
      if (hid === 0x0a010000) return "Fn";
      const found = DATA.hidKeys.find(k => k.hid === hid);
      if (found) return found.label;
      for (const [k, v] of Object.entries(DATA.specialMods)) {
        if (v === hid && v !== 0) return k.toUpperCase();
      }
      return "0x" + hid.toString(16).toUpperCase();
    }

    function decodeSlot4Bytes(bytes) {
      const [b0, b1, b2, b3] = bytes;
      if (b0 === 0 && b1 === 0 && b2 === 0 && b3 === 0) {
        return { kind: "forbidden", label: "禁用" };
      }
      for (const [fnName, fnArr] of Object.entries(DATA.specialFunctions)) {
        if (byte4Equals(bytes, fnArr)) {
          return { kind: "function", label: fnName };
        }
      }
      if (b0 === 0) {
        const mod1 = Object.entries(DATA.specialMods).find(([, v]) => v === b1)?.[0] || "none";
        if (mod1 === "none" && b3 === 0) {
          return { kind: "single", label: hidToLabel(b2) };
        }
        const mod2 = b3 !== 0 ? (Object.entries(DATA.specialMods).find(([, v]) => v === b2)?.[0] || "none") : "none";
        const mainHid = b3 !== 0 ? b3 : b2;
        const parts = [];
        if (mod1 !== "none") parts.push(mod1.toUpperCase());
        if (mod2 !== "none") parts.push(mod2.toUpperCase());
        if (mainHid !== 0) parts.push(hidToLabel(mainHid));
        return { kind: "combo", label: parts.join("+") };
      }
      if (b0 === 9) {
        return { kind: "macro", label: "Macro#" + b2 };
      }
      return {
        kind: "raw",
        label: bytes.map(x => x.toString(16).padStart(2, "0")).join(" ")
      };
    }

    // ============ 状态管理 ============
    let currentModelId = "dmk103";
    let currentLayer = { isFn: false, index: 0 }; // Profile 0, 1, 2 or Fn 0
    let selectedLayoutIdx = 0;
    let captureMode = false;
    let canvasViewMode = "photo"; // "photo" | "vector"
    let webHidDevice = null;

    const SHORT_KEY_NAMES = {
      "Print\\nScreen": "PrtSc",
      "Print Screen": "PrtSc",
      "Scroll\\nLock": "ScrLk",
      "Scroll Lock": "ScrLk",
      "Caps\\nLock": "Caps",
      "CapsLock": "Caps",
      "Caps Lock": "Caps",
      "BackSpace": "⌫ Back",
      "Page\\nUp": "PgUp",
      "Page Up": "PgUp",
      "PageUp": "PgUp",
      "Page\\nDown": "PgDn",
      "Page Down": "PgDn",
      "PageDown": "PgDn",
      "Insert": "Ins",
      "Delete": "Del",
      "Num\\nLock": "NumLk",
      "Num Lock": "NumLk",
      "Left\\nShift": "⇧ Shift",
      "Right\\nShift": "⇧ Shift",
      "Shift_L": "⇧ Shift",
      "Shift_R": "⇧ Shift",
      "Ctrl_L": "Ctrl",
      "Ctrl_R": "Ctrl",
      "Alt_L": "Alt",
      "Alt_R": "Alt",
      "Win_L": "Win",
      "Win_R": "Win",
      "(Application)": "Menu",
      "Application": "Menu",
      "num_0": "Num 0",
      "num_1": "Num 1",
      "num_2": "Num 2",
      "num_3": "Num 3",
      "num_4": "Num 4",
      "num_5": "Num 5",
      "num_6": "Num 6",
      "num_7": "Num 7",
      "num_8": "Num 8",
      "num_9": "Num 9",
      "num_+": "Num +",
      "num_-": "Num -",
      "num_*": "Num *",
      "num_/": "Num /",
      "num_.": "Num ."
    };

    function shortKeyLabel(raw) {
      if (!raw) return "";
      if (SHORT_KEY_NAMES[raw]) return SHORT_KEY_NAMES[raw];
      const oneLine = raw.replace(/\\n/g, " ").trim();
      if (SHORT_KEY_NAMES[oneLine]) return SHORT_KEY_NAMES[oneLine];
      return oneLine;
    }

    // 每个型号维护多层的矩阵状态: layerMatrices[modelId][layerKey] = number[]
    const layerMatrices = {};

    function getLayerKey(layer) {
      return layer.isFn ? "fn_" + layer.index : "p_" + layer.index;
    }

    function ensureMatrixState(modelId) {
      const spec = DATA.models[modelId];
      if (!layerMatrices[modelId]) {
        layerMatrices[modelId] = {};
        for (let p = 0; p < spec.layers; p++) {
          layerMatrices[modelId]["p_" + p] = [...spec.defaultMatrix];
        }
        for (let f = 0; f < spec.fnLayers; f++) {
          layerMatrices[modelId]["fn_" + f] = [...spec.defaultMatrix];
        }
      }
      return layerMatrices[modelId][getLayerKey(currentLayer)];
    }

    // ============ UI 渲染 ============
    const modelSelect = document.getElementById("modelSelect");
    const transportSelect = document.getElementById("transportSelect");
    const statusText = document.getElementById("statusText");
    const kbCase = document.getElementById("kbCase");
    const layerTabs = document.getElementById("layerTabs");
    const hexInspector = document.getElementById("hexInspector");
    const txLogList = document.getElementById("txLogList");

    function initSelectors() {
      modelSelect.innerHTML = "";
      for (const m of Object.values(DATA.models)) {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = m.displayName + " [" + m.name + "]";
        modelSelect.appendChild(opt);
      }
      modelSelect.value = currentModelId;

      const comboTarget = document.getElementById("comboTargetHid");
      comboTarget.innerHTML = "";
      for (const k of DATA.hidKeys) {
        const opt = document.createElement("option");
        opt.value = k.hid;
        opt.textContent = k.label + " (HID " + k.hid + ")";
        comboTarget.appendChild(opt);
      }

      const basicGrid = document.getElementById("basicKeyGrid");
      basicGrid.innerHTML = "";
      for (const k of DATA.hidKeys) {
        const btn = document.createElement("div");
        btn.className = "key-pill";
        btn.textContent = k.label;
        btn.title = "HID Code: " + k.hid + " (0x" + k.hid.toString(16) + ")";
        btn.onclick = () => assignSelectedKey([0x00, 0x00, k.hid & 0xff, 0x00], "单键 -> " + k.label);
        basicGrid.appendChild(btn);
      }

      const specialGrid = document.getElementById("specialKeyGrid");
      specialGrid.innerHTML = "";
      for (const [name, bytes] of Object.entries(DATA.specialFunctions)) {
        const btn = document.createElement("div");
        btn.className = "key-pill";
        btn.textContent = name;
        btn.title = "Bytes: [" + bytes.map(b => "0x" + b.toString(16)).join(", ") + "]";
        btn.onclick = () => assignSelectedKey([...bytes], "特殊功能 -> " + name);
        specialGrid.appendChild(btn);
      }
    }

    function renderLayerTabs() {
      const spec = DATA.models[currentModelId];
      layerTabs.innerHTML = "";
      for (let p = 0; p < spec.layers; p++) {
        const btn = document.createElement("button");
        btn.className = "layer-tab" + (!currentLayer.isFn && currentLayer.index === p ? " active" : "");
        btn.textContent = "配置层 Profile " + p;
        btn.onclick = () => {
          currentLayer = { isFn: false, index: p };
          renderAll();
        };
        layerTabs.appendChild(btn);
      }
      for (let f = 0; f < spec.fnLayers; f++) {
        const btn = document.createElement("button");
        btn.className = "layer-tab" + (currentLayer.isFn && currentLayer.index === f ? " active" : "");
        btn.textContent = "Fn 层 " + f;
        btn.onclick = () => {
          currentLayer = { isFn: true, index: f };
          renderAll();
        };
        layerTabs.appendChild(btn);
      }
    }

    function renderKeyboardCanvas() {
      const spec = DATA.models[currentModelId];
      const matrix = ensureMatrixState(currentModelId);
      document.getElementById("modelMetaBadge").textContent =
        "VID:PID " + spec.vidsPids.map(vp => vp[0].toString(16).padStart(4,"0") + ":" + vp[1].toString(16).padStart(4,"0")).join(" / ") +
        " · 协议: " + spec.protocol.toUpperCase() +
        " · 键数: " + spec.layout.length;
      document.getElementById("protocolTag").textContent =
        spec.protocol === "yc500" ? "单键改键 0x13 / 0x15" : "全矩阵分页写入 0x09 / 0x10";

      const isPhoto = canvasViewMode === "photo";
      kbCase.classList.toggle("photo-mode", isPhoto);
      kbCase.innerHTML = "";

      if (isPhoto) {
        // 官方驱动 871x288 底图精确坐标系 (1.18x 高清等比放大)
        const photoScale = 1.18;
        const stageW = Math.round(871 * photoScale);
        const stageH = Math.round(288 * photoScale);
        kbCase.style.width = stageW + "px";
        kbCase.style.height = stageH + "px";
        kbCase.style.backgroundImage = "url('/assets/" + spec.name + ".png')";

        const dx = spec.deltX || 0;
        const dy = spec.deltY || 0;

        spec.layout.forEach((k, idx) => {
          const slotIdx = findIndexInDefaultMatrix(spec.defaultMatrix, k.value, k.index);
          const off = slotIdx !== undefined ? slotIdx * 4 : 0;
          const defBytes = slotIdx !== undefined ? spec.defaultMatrix.slice(off, off + 4) : [0,0,0,0];
          const curBytes = slotIdx !== undefined ? matrix.slice(off, off + 4) : [0,0,0,0];
          const isModified = !byte4Equals(curBytes, defBytes);
          const decoded = decodeSlot4Bytes(curBytes);

          const cap = document.createElement("div");
          let cls = "keycap";
          if (idx === selectedLayoutIdx) cls += " selected";
          if (decoded.kind === "forbidden") cls += " forbidden";
          else if (isModified) cls += " modified";
          cap.className = cls;

          const left = Math.round((k.x + dx) * photoScale);
          const top = Math.round((-k.y + dy) * photoScale);
          const width = Math.round(k.w * photoScale);
          const height = Math.round(k.h * photoScale);
          cap.style.left = left + "px";
          cap.style.top = top + "px";
          cap.style.width = width + "px";
          cap.style.height = height + "px";

          const origShort = shortKeyLabel(k.keyName);
          const curShort = shortKeyLabel(decoded.label);
          cap.title = origShort + " (槽位 #" + (slotIdx ?? "?") + ") -> 当前: " + curShort;

          if (isModified || decoded.kind === "forbidden") {
            cap.innerHTML = '<span class="keycap-cur" style="font-size:9.5px;">' + curShort + '</span>';
          }

          cap.onclick = () => {
            selectedLayoutIdx = idx;
            renderAll();
          };
          kbCase.appendChild(cap);
        });
        return;
      }

      // 矢量键帽视图: 使用 2.05x 宽松比例, 不设高于缩放宽度的 min-width 防止相邻键帽重叠
      kbCase.style.backgroundImage = "none";
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const k of spec.layout) {
        const x = k.x;
        const y = -k.y;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + k.w);
        maxY = Math.max(maxY, y + k.h);
      }

      const scale = 2.05;
      const pad = 20;
      const stageW = Math.ceil((maxX - minX) * scale + pad * 2);
      const stageH = Math.ceil((maxY - minY) * scale + pad * 2);
      kbCase.style.width = stageW + "px";
      kbCase.style.height = stageH + "px";

      spec.layout.forEach((k, idx) => {
        const slotIdx = findIndexInDefaultMatrix(spec.defaultMatrix, k.value, k.index);
        const off = slotIdx !== undefined ? slotIdx * 4 : 0;
        const defBytes = slotIdx !== undefined ? spec.defaultMatrix.slice(off, off + 4) : [0,0,0,0];
        const curBytes = slotIdx !== undefined ? matrix.slice(off, off + 4) : [0,0,0,0];
        const isModified = !byte4Equals(curBytes, defBytes);
        const decoded = decodeSlot4Bytes(curBytes);

        const cap = document.createElement("div");
        let cls = "keycap";
        if (idx === selectedLayoutIdx) cls += " selected";
        if (decoded.kind === "forbidden") cls += " forbidden";
        else if (isModified) cls += " modified";
        cap.className = cls;

        const left = Math.round((k.x - minX) * scale + pad);
        const top = Math.round((-k.y - minY) * scale + pad);
        const width = Math.max(20, Math.round(k.w * scale) - 2);
        const height = Math.max(20, Math.round(k.h * scale) - 2);
        cap.style.left = left + "px";
        cap.style.top = top + "px";
        cap.style.width = width + "px";
        cap.style.height = height + "px";

        const origShort = shortKeyLabel(k.keyName);
        const curShort = shortKeyLabel(decoded.label);
        const fontSize = curShort.length >= 5 ? "9.5px" : "11px";
        cap.title = origShort + " (槽位 #" + (slotIdx ?? "?") + ") -> 当前: " + curShort;

        if (isModified || decoded.kind === "forbidden") {
          cap.innerHTML =
            '<span class="keycap-orig">' + origShort + '</span>' +
            '<span class="keycap-cur" style="font-size:' + fontSize + '">' + curShort + '</span>';
        } else {
          cap.innerHTML =
            '<span class="keycap-cur" style="font-size:' + fontSize + '">' + origShort + '</span>';
        }

        cap.onclick = () => {
          selectedLayoutIdx = idx;
          renderAll();
        };
        kbCase.appendChild(cap);
      });
    }

    function renderInspector() {
      const spec = DATA.models[currentModelId];
      const matrix = ensureMatrixState(currentModelId);
      const k = spec.layout[selectedLayoutIdx] || spec.layout[0];
      if (!k) return;

      const slotIdx = findIndexInDefaultMatrix(spec.defaultMatrix, k.value, k.index);
      const off = slotIdx !== undefined ? slotIdx * 4 : 0;
      const defBytes = slotIdx !== undefined ? spec.defaultMatrix.slice(off, off + 4) : [0,0,0,0];
      const curBytes = slotIdx !== undefined ? matrix.slice(off, off + 4) : [0,0,0,0];
      const decoded = decodeSlot4Bytes(curBytes);

      const cleanName = k.keyName.replace(/\\n/g, " ");
      document.getElementById("selectedKeyBanner").textContent =
        "当前选中: [" + cleanName + "] (槽位 #" + slotIdx + ")";
      document.getElementById("infoKeyName").textContent = cleanName + (k.index !== undefined ? " (dup #" + k.index + ")" : "");
      document.getElementById("infoDefaultHid").textContent = k.value + " (0x" + k.value.toString(16).toUpperCase() + ")";
      document.getElementById("infoSlotIdx").textContent = slotIdx !== undefined ? "#" + slotIdx : "N/A";
      document.getElementById("infoByteOffset").textContent = slotIdx !== undefined ? "matrix[" + off + ".." + (off + 3) + "]" : "N/A";
      document.getElementById("infoDefaultBytes").textContent = "[" + defBytes.map(x => "0x" + x.toString(16).padStart(2, "0")).join(", ") + "]";
      document.getElementById("infoCurrentBytes").textContent = "[" + curBytes.map(x => "0x" + x.toString(16).padStart(2, "0")).join(", ") + "]";
      document.getElementById("infoCurrentLabel").textContent = decoded.label;

      // 预览当前键位的 0x13/0x15 单键改键 64B Report
      if (slotIdx !== undefined) {
        const rep = buildSingleKeyReport(currentLayer, slotIdx, curBytes);
        renderHexPacket(rep, { csumIdx: 7, valStart: 8, valEnd: 11 });
      }
    }

    function buildSingleKeyReport(layer, slotIdx, bytes4) {
      const b = new Uint8Array(64);
      b[0] = layer.isFn ? 0x15 : 0x13;
      b[1] = layer.index & 0xff;
      b[2] = slotIdx & 0xff;
      b[8] = bytes4[0];
      b[9] = bytes4[1];
      b[10] = bytes4[2];
      b[11] = bytes4[3];
      return applyChecksum(b, 0);
    }

    function renderHexPacket(buf64, highlights = { csumIdx: 7, valStart: 8, valEnd: 11 }) {
      let html = "";
      for (let i = 0; i < 64; i++) {
        const hex = buf64[i].toString(16).padStart(2, "0").toUpperCase();
        let cls = "hex-byte";
        if (i === 0) cls += " hex-cmd";
        else if (i >= 1 && i <= 4) cls += " hex-idx";
        else if (i === highlights.csumIdx) cls += " hex-csum";
        else if (i >= highlights.valStart && i <= highlights.valEnd) cls += " hex-val";
        html += '<span class="' + cls + '" title="b[' + i + '] = 0x' + hex + '">' + hex + '</span>';
        if ((i + 1) % 16 === 0 && i < 63) html += "<br/>";
      }
      hexInspector.innerHTML = html;
    }

    function appendLog(title, report64, note = "") {
      const item = document.createElement("div");
      item.className = "log-item";
      const time = new Date().toLocaleTimeString();
      const headHex = Array.from(report64.subarray(0, 12))
        .map(b => b.toString(16).padStart(2, "0").toUpperCase())
        .join(" ");
      item.innerHTML =
        '<div class="log-meta"><span>' + title + '</span><span>' + time + '</span></div>' +
        '<div style="color:var(--accent);">TX [00] ' + headHex + ' ...</div>' +
        (note ? '<div style="color:var(--text-muted);margin-top:2px;">' + note + '</div>' : '');
      txLogList.prepend(item);
    }

    // ============ 通信派发 (Mock / WebHID / Local Bridge) ============
    async function dispatchHidReport(report64, description) {
      const mode = transportSelect.value;
      if (mode === "webhid") {
        if (!webHidDevice || !webHidDevice.opened) {
          setStatus("WebHID 未连接, 已回退至沙盒模拟", true);
        } else {
          await webHidDevice.sendFeatureReport(0x00, report64);
          setStatus("已通过 WebHID 写入键盘: " + description);
          appendLog("WebHID TX · " + description, report64, "sendFeatureReport(0x00, 64B)");
          return;
        }
      } else if (mode === "bridge") {
        try {
          const res = await fetch("/api/hid/write", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              modelId: currentModelId,
              report: Array.from(report64),
              description
            })
          });
          const data = await res.json();
          if (data.ok) {
            setStatus("Node-HID 已写入(" + data.mode + "): " + description);
            appendLog("Bridge TX (" + data.mode + ") · " + description, report64, data.message || "");
            return;
          }
        } catch (err) {
          // fallback to mock
        }
      }
      setStatus("已应用修改 (沙盒内存矩阵): " + description);
      appendLog("Mock TX · " + description, report64, "CheckSum = 0x" + report64[7].toString(16).padStart(2,"0").toUpperCase());
    }

    async function assignSelectedKey(bytes4, desc) {
      const spec = DATA.models[currentModelId];
      const matrix = ensureMatrixState(currentModelId);
      const k = spec.layout[selectedLayoutIdx];
      if (!k) return;

      const slotIdx = findIndexInDefaultMatrix(spec.defaultMatrix, k.value, k.index);
      if (slotIdx === undefined) return;

      const off = slotIdx * 4;
      matrix[off] = bytes4[0];
      matrix[off + 1] = bytes4[1];
      matrix[off + 2] = bytes4[2];
      matrix[off + 3] = bytes4[3];

      const rep = buildSingleKeyReport(currentLayer, slotIdx, bytes4);
      renderAll();
      renderHexPacket(rep, { csumIdx: 7, valStart: 8, valEnd: 11 });
      await dispatchHidReport(rep, "[" + k.keyName.replace(/\\n/g, " ") + " #" + slotIdx + "] " + desc);
    }

    function setStatus(text, isWarn = false) {
      statusText.textContent = text;
      const pill = document.getElementById("statusPill");
      pill.style.borderColor = isWarn ? "var(--warn)" : "rgba(0, 245, 212, 0.35)";
      pill.style.color = isWarn ? "var(--warn)" : "var(--accent)";
    }

    function renderAll() {
      renderLayerTabs();
      renderKeyboardCanvas();
      renderInspector();
    }

    // ============ 事件绑定 ============
    document.querySelectorAll("#viewModeTabs .layer-tab").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll("#viewModeTabs .layer-tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        canvasViewMode = btn.getAttribute("data-view") || "photo";
        renderKeyboardCanvas();
      };
    });

    modelSelect.onchange = () => {
      currentModelId = modelSelect.value;
      currentLayer = { isFn: false, index: 0 };
      selectedLayoutIdx = 0;
      renderAll();
    };

    document.querySelectorAll("#pickerTabs .picker-tab").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll("#pickerTabs .picker-tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.getAttribute("data-tab");
        ["basic", "combo", "special", "light"].forEach(t => {
          document.getElementById("tab-" + t).style.display = t === tab ? "block" : "none";
        });
      };
    });

    document.getElementById("applyComboBtn").onclick = () => {
      const m1 = document.getElementById("comboMod1").value;
      const m2 = document.getElementById("comboMod2").value;
      const targetHid = Number(document.getElementById("comboTargetHid").value);
      const bothMods = m1 !== "none" && m2 !== "none";
      const sKey = m1 === "none" ? m2 : m1;
      const key1 = bothMods ? DATA.specialMods[m2] : (targetHid & 0xff);
      const key2 = bothMods ? (targetHid & 0xff) : 0x00;
      const bytes4 = [0x00, DATA.specialMods[sKey], key1, key2];
      const decoded = decodeSlot4Bytes(bytes4);
      assignSelectedKey(bytes4, "组合键 -> " + decoded.label);
    };

    document.getElementById("disableKeyBtn").onclick = () => {
      assignSelectedKey([0, 0, 0, 0], "禁用按键");
    };

    document.getElementById("resetKeyBtn").onclick = () => {
      const spec = DATA.models[currentModelId];
      const k = spec.layout[selectedLayoutIdx];
      if (!k) return;
      const slotIdx = findIndexInDefaultMatrix(spec.defaultMatrix, k.value, k.index);
      if (slotIdx === undefined) return;
      const defBytes = spec.defaultMatrix.slice(slotIdx * 4, slotIdx * 4 + 4);
      assignSelectedKey(defBytes, "恢复默认");
    };

    document.getElementById("resetLayerBtn").onclick = async () => {
      const spec = DATA.models[currentModelId];
      layerMatrices[currentModelId][getLayerKey(currentLayer)] = [...spec.defaultMatrix];
      const b = new Uint8Array(64);
      b[0] = 0x02; // FEA_CMD_SET_RESERT
      const rep = applyChecksum(b, 0);
      renderAll();
      renderHexPacket(rep, { csumIdx: 7, valStart: 8, valEnd: 8 });
      await dispatchHidReport(rep, "重置当前层为出厂默认 (0x02)");
    };

    document.getElementById("applyLightBtn").onclick = async () => {
      const effMap = {
        LightOff: 0x00, LightAlwaysOn: 0x01, LightBreath: 0x02, LightNeon: 0x03,
        LightWave: 0x04, LightRipple: 0x05, LightRaindrop: 0x06, LightSnake: 0x07,
        LightPressAction: 0x08, LightConverage: 0x09, LightSineWave: 0x0a,
        LightKaleidoscope: 0x0b, LightLineWave: 0x0c
      };
      const effName = document.getElementById("lightEffectSelect").value;
      const bright = Number(document.getElementById("lightBrightInput").value) || 0;
      const speed = Number(document.getElementById("lightSpeedInput").value) || 0;
      const hexColor = document.getElementById("lightColorInput").value.replace("#", "");
      const rgb = parseInt(hexColor, 16) || 0x00f5d4;

      const b = new Uint8Array(64);
      b[0] = 0x07;
      b[1] = effMap[effName] ?? 1;
      b[2] = Math.max(0, Math.min(4, 4 - speed));
      b[3] = Math.max(0, Math.min(6, bright));
      b[4] = 8; // NORMAL
      b[5] = (rgb >>> 16) & 0xff;
      b[6] = (rgb >>> 8) & 0xff;
      b[7] = rgb & 0xff;
      const rep = applyChecksum(b, 1); // CheckSum8 at b[8]!
      renderHexPacket(rep, { csumIdx: 8, valStart: 5, valEnd: 7 });
      await dispatchHidReport(rep, "设置灯效 " + effName + " (0x07, CheckSum8=0x" + rep[8].toString(16).toUpperCase() + ")");
    };

    const captureBtn = document.getElementById("captureKeyBtn");
    captureBtn.onclick = () => {
      captureMode = !captureMode;
      captureBtn.classList.toggle("primary", captureMode);
      captureBtn.textContent = captureMode ? "正在监听按键 (按任意键赋值)..." : "开启物理按键捕获";
    };

    window.addEventListener("keydown", (e) => {
      if (!captureMode) return;
      e.preventDefault();
      const found = DATA.hidKeys.find(k => k.keyCode === e.keyCode);
      if (found) {
        captureMode = false;
        captureBtn.classList.remove("primary");
        captureBtn.textContent = "开启物理按键捕获";
        assignSelectedKey([0x00, 0x00, found.hid & 0xff, 0x00], "物理按键捕获 -> " + found.label);
      }
    });

    document.getElementById("connectBtn").onclick = async () => {
      const mode = transportSelect.value;
      if (mode === "webhid") {
        if (!("hid" in navigator)) {
          setStatus("当前浏览器不支持 WebHID, 请使用 Chrome/Edge 或切换至 Bridge/Mock", true);
          return;
        }
        try {
          const devices = await navigator.hid.requestDevice({
            filters: [
              { vendorId: 0x3151 },
              { vendorId: 0x25a7, productId: 0x2300 },
              { vendorId: 0x25a7, productId: 0x2420 },
              { vendorId: 0x0461, productId: 0x4001 },
              { vendorId: 0x0461, productId: 0x4003 }
            ]
          });
          if (!devices || devices.length === 0) {
            setStatus("未选择 WebHID 设备", true);
            return;
          }
          webHidDevice = devices[0];
          if (!webHidDevice.opened) await webHidDevice.open();
          setStatus("已连接 WebHID: " + (webHidDevice.productName || "Domikey Keyboard"));
        } catch (err) {
          setStatus("WebHID 连接失败: " + err.message, true);
        }
      } else if (mode === "bridge") {
        try {
          const res = await fetch("/api/devices");
          const data = await res.json();
          if (data.devices && data.devices.length > 0) {
            setStatus("Bridge 已发现物理设备: " + data.devices.map(d => d.product).join(", "));
          } else {
            setStatus("Bridge 在线 (当前未检测到插入的 0x3151 物理键盘, 自动使用沙盒响应)");
          }
        } catch (err) {
          setStatus("Bridge 请求失败: " + err.message, true);
        }
      } else {
        setStatus("虚拟键盘沙盒已同步 (" + DATA.models[currentModelId].displayName + ")");
      }
    };

    document.getElementById("exportBtn").onclick = () => {
      ensureMatrixState(currentModelId);
      const payload = {
        modelId: currentModelId,
        exportedAt: new Date().toISOString(),
        layers: layerMatrices[currentModelId]
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "domikey-" + currentModelId + "-keymap.json";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("已导出键位配置 JSON");
    };

    const importFile = document.getElementById("importFile");
    document.getElementById("importBtn").onclick = () => importFile.click();
    importFile.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (parsed.modelId && DATA.models[parsed.modelId] && parsed.layers) {
            currentModelId = parsed.modelId;
            modelSelect.value = currentModelId;
            layerMatrices[currentModelId] = parsed.layers;
            renderAll();
            setStatus("已成功导入配置: " + file.name);
          }
        } catch (err) {
          setStatus("JSON 导入失败: " + err.message, true);
        }
      };
      reader.readAsText(file);
    };

    document.getElementById("clearLogBtn").onclick = () => {
      txLogList.innerHTML = "";
    };

    initSelectors();
    renderAll();
  </script>
</body>
</html>`
}
