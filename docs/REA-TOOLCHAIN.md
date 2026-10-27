# REA 工具链安装记录

本机的 REA (morluto/rea) 逆向工具链,全部免 root 安装。**重启 Kimi Code 后 REA MCP 即可用。**

## 一键加载环境

```bash
source ~/.local/opt/rea-env.sh
```

已挂钩 `~/.bashrc`,新 shell 自动加载。

## 组件清单

| 组件 | 版本 | 位置 | 用途 |
|---|---|---|---|
| rea-agents CLI | 6.8.0 | `~/.local/node/bin/rea` | REA 主命令(`rea doctor` 自检) |
| REA MCP | (随 CLI) | 已注册 `~/.kimi-code/mcp.json` | agent 内原生调用 REA |
| REA skill | reverse-engineer-anything | `~/.agents/skills/` | 逆向工作流指引 |
| Temurin JDK | 21.0.13+9 | `~/.local/opt/jdk` | Ghidra/JADX 运行时(`JAVA_HOME`) |
| Ghidra | 12.1.4 | `~/.local/opt/ghidra_12.1.4_PUBLIC` | 原生反编译(`GHIDRA_INSTALL_DIR`) |
| jadx-headless-mcp | 0.7.1 | `~/.local/share/rea/android/` | REA Android provider(`REA_JADX_MCP_JAR`,sha256 已校验) |
| jadx | 1.5.0 | `~/.local/opt/bin/jadx` | APK 反编译 CLI |
| rizin | 0.9.1 | `~/.local/opt/bin/` | REA 支持的离线引擎(rz-bin/rz-asm/rizin) |
| WABT | 1.0.36 | `~/.local/opt/wabt-1.0.36/` | WASM 分析(REA_WABT_BIN_DIRECTORY) |
| adb | 1.0.41 | `~/.local/opt/platform-tools/` | Android 设备 |
| Python venv | 3.13 | `~/.venvs/rea/` | capstone 5.0.7 / pefile / binwalk(3.13 补丁)/ pwntools |
| gh | 2.96.0 | `~/.local/bin/gh` | 经 Lody 认证垫片使用 |

## rea doctor 结果

- node 22.23.4 ✅ · host debian 13 ✅
- ghidra ✅(platform/architecture/installation/version/headless/native_decompiler/java 全过)
- jadx ✅
- 未装(可选,商业/稀有):Hopper(`HOPPER_LAUNCHER_PATH`)、IDA(`REA_IDA_MCP_CONFIG`)、Kuna(`REA_KUNA_COMMAND`)

## 常用入口

```bash
rea doctor                 # 自检
rea providers              # provider 能力列表
rea --mcp                  # MCP stdio 模式(已由 agent 配置托管)
rea analyze-javascript-application <dir> --json   # JS/Electron 静态分析
```

原生目标分析(REA open-binary / decompile 等)经 MCP 调用,provider 自动选 Ghidra。
