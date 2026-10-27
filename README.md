# domikey-babyface-REA

对 Domikey Babyface 键盘官方控制软件(Domikey Driver,Electron)的逆向工程,
目标是实现一个轻量化 TUI 替代品。

## 目录

| 路径 | 内容 |
|---|---|
| `domikey-babyface/` | 官方资源压缩包内容(NSIS 安装包 + PDF 说明书) |
| `extracted-app/` | 7z 解包后的完整 Electron 应用(含 `iot_driver.exe`) |
| `recovered-src/` | 从 source map 还原的全部原始 TypeScript 源码 |
| `proto/driver.proto` | 还原的 gRPC 服务定义(渲染层 ↔ iot_driver) |
| `docs/REVERSE-ENGINEERING.md` | 逆向笔记:架构、HID 协议、命令码表、未决问题 |
| `tui/` | 轻量化 TUI 实现(Node.js + TypeScript + ink + node-hid) |

## TUI 快速开始

```bash
cd tui
npm install
npm run build
npm start
```

## 现状

逆向已完成,官方软件未剥离 source map,几乎拿到完整原始源码。
TUI 骨架已可编译运行(设备列表 + 灯效切换);发送命令前还需还原
`iot_driver.exe` 内的校验和算法,见 docs/REVERSE-ENGINEERING.md §6。
