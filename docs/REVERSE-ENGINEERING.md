# Domikey Driver 逆向工程笔记

目标:用 REA (<https://github.com/morluto/rea>) 对 Domikey Babyface 键盘控制软件做逆向,
并以此为基础实现一个轻量化的 TUI 控制软件。

## 1. 样本信息

| 项目 | 值 |
|---|---|
| 原始安装包 | `domikey-babyface/Domikey..80.exe` (92 MB, NSIS-3 安装包) |
| 应用 | Electron (32-bit Windows),`Domikey Driver.exe` v1.0.0 |
| 通信驱动 | `resources/app/iot_driver.exe` (5 MB, 随软件启动) |
| 构建时间 | 2023-11-17 |
| 源码泄露程度 | **带完整 source map**,已还原全部原始 TypeScript |

## 2. 逆向过程

1. `7z x Domikey..80.exe` 解出 NSIS 载荷 `$PLUGINSDIR/app-32.7z`。
2. 再次 7z 解压得到完整 Electron 应用目录(312 MB)。
3. `dist/main.js.map` 与 `dist/index.js.map` 含 `sourcesContent`,
   用脚本还原出 **2204 个原始 TS/TSX 文件**(主进程 72 + 渲染层 2132),
   见 `recovered-src/`。
4. REA `analyze-javascript-application` 用于交叉验证模块/依赖关系。

> 意外收获:该软件发布时未剥离 source map,因此"逆向"得到了几乎完整的原始源码,
> 包括所有键盘型号的 HID 协议实现。

## 3. 总体架构

```
React 渲染层 (dist/index.js, nodeIntegration=true)
    │  gRPC (明文, 127.0.0.1:3814)
    ▼
iot_driver.exe  ──►  USB HID feature report  ──►  键盘 / 2.4G 接收器
 (Windows 原生)                                    (VID 0x3151 等)
```

- 渲染层不直接碰 USB,所有设备 IO 通过本地 gRPC 服务 `driver.DriverGrpc`。
- 支持三类连接:USB 直连、2.4G 接收器(键盘/鼠标)、蓝牙(VID 0x3151 的 PID 白名单)。
- gRPC 的 `.proto` 已按生成代码还原,见 `proto/driver.proto`(18 个 RPC)。

## 4. 设备检测 (`sdk/DriverIO/usb/DetectSupportDevice.ts`)

- 支持设备表来自本地 SQLite(typeorm,`device_type` 表,按公司过滤)。
- 已知 VID/PID:
  - 蓝牙 Dongle: VID `0x3151`,PID `0x4012/0x4013/0x401C/0x401D/0x401F/0x4020/0x4023/0x4024`
  - 2.4G: VID `0x25a7` PID `0x2300`,VID `0x0461` PID `0x4001`,VID `0x0c45` PID `0x7040`

## 5. HID 协议 (`sdk/DriverIO/DeviceAPI/`)

所有命令为 **64 字节 HID feature report**,首字节为命令码:

| 命令码 | 含义 | 命令码 | 含义 |
|---|---|---|---|
| 0x00 / 0x80 | 设置/读取版本 | 0x08 / 0x88 | 设置/读取单键灯参数 |
| 0x02 | 重置 | 0x09 / 0x89 | 设置/读取键值映射 |
| 0x04 / 0x84 | 设置/读取上报率 | 0x0A / 0x8A | 设置/读取按键使能 |
| 0x05 / 0x85 | 设置/读取配置档 | 0x0B / 0x8B | 设置/读取宏 |
| 0x06 / 0x86 | 设置/读取键盘选项 | 0x0C / 0x8C | 设置/读取用户图片 |
| 0x07 / 0x87 | 设置/读取灯光参数 | 0x0D | 设置音频律动 |
| 0x8F | 读取设备信息 | 0x83 | 读取电量 |
| 0xFE | 设置下包长度 | | |

灯效 (`setLightSetting`,`Common.ts:49`):特效 0x00–0x0d
(关闭/常亮/呼吸/霓虹/波浪/涟漪/雨滴/蛇形/按键触发/汇聚/正弦/万花筒/线性波/用户图),
speed / brightness / option 按灯效编码进 report 字节 1–3。

每种键盘型号一个类(yc200/yc400/yc500/yzw/bk100/sonix k68 系列…),
继承 `Common`/`K68`,差异在矩阵布局与命令细节。
命令构造与 sleep 时序(蓝牙 +60ms 等)全部可在 `recovered-src/` 中读到。

## 6. 已知未知项(TUI 实现前需解决)

1. **校验和算法**:渲染层只把 `checkSumType`(0=7字节 / 1=8字节 / 2=init)发给驱动,
   实际校验和在 `iot_driver.exe` 内计算。
   **无需 Windows 即可继续** — `iot_driver.exe` 是 Rust 程序(工程名 `dj_hid_sdk_rs`),
   模块结构已从 panic 字符串还原:

   ```
   src\main.rs
   src\dj_dev_api\cmd_list.rs        (struct CMDList)
   src\dj_dev_api\dangle_common.rs   (2.4G 接收器)
   src\dj_dev_api\ble_hid.rs / yzw_boot.rs / yzw_vender.rs
   src\dj_hid_device\mod.rs
   src\dj_hid_device\dj_hid\mod.rs
   src\dj_hid_device\dj_hid\hid_normal.rs   (USB HID: hid_send_feature_report / hid_get_feature_report)
   src\dj_hid_device\dj_hid\hid_ble.rs      (BLE, 用 btleplug crate)
   src\dj_hid_device\vender_dev.rs
   ```

   已验证的纯 Linux 手段:
   - REA 内置 `inspect-pe-imports` 无需任何引擎即可分析 PE(结果:ntdll/ws2_32/kernel32…,
     HID 走 `NtDeviceIoControlFile` / `NtWriteFile`,IOCTL_HID_GET_FEATURE=0xB0192 已定位到 0x3c4700);
   - 无 sudo 环境可用 `python3 -m venv --without-pip` + get-pip.py 装 capstone/pefile
     自写反汇编脚本(工具链在 /tmp/revenv)。
   待办:定位发送路径(WriteFile/NtWriteFile)前的 7/8 字节校验和循环;
   或键盘插到 Linux 后用 node-hid 对常见算法(累加/XOR/CRC8)做在线验证。
2. 设备数据库(`device_type` 表)的初始数据:首次运行由服务器下发或内置,需确认
   Babyface 对应的型号条目(用于按键矩阵布局)。
3. `iot_driver.exe` 还承担厂商事件流(电量/睡眠/重置/麦克风),TUI 需自行轮询
   `0x83` 电量等命令替代。

## 7. TUI 实现方案

- 语言:**Node.js + TypeScript**(与还原源码同语言,协议类可几乎 1:1 移植)。
- HID: `node-hid`(feature report)或 Linux `/dev/hidraw`。
- TUI: `ink`(React,与原厂代码思维一致)或 `blessed`。
- 目录:`tui/`。首版功能:设备枚举、电量显示、灯效切换、亮度/速度调节。
- 去掉:Electron、Chromium、sqlite/typeorm(改用 JSON 配置)、grpc(直连 HID)。

对照:官方软件 92 MB 安装包 / 312 MB 解压;TUI 目标 < 5 MB、纯终端运行。
