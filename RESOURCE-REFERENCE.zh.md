# 本机 ChatGPT / Codex 前端资源索引

## 插件软件图标

`dsh-codex-ui` 使用 Codex 蓝紫色软件图标。已核对像素并提取到 `assets/codex.png`；来源为 Codex `26.930.3930.0` 的 `app.asar` 内 `webview/assets/codex-app-ga-logo-3e5209898ca3.png`。安装包的 Windows `assets/icon.png` 和 `desktop-app-icon` 仍为 ChatGPT 标志，不是此图标。

记录日期：2026-10-03。用于这个 DeepSeek Harness 界面的后续还原。

## 原始位置

- 应用包：`C:\Program Files\WindowsApps\OpenAI.Codex_26.928.4866.0_x64__2p2nqsd0c76g0\app\resources\app.asar`
- 包内前端：`webview/assets/`
- 已提取参考：本工作区 `outputs/chatgpt-reference-icons/reusable/`，清单为 `index.json`，包含原包路径、大小、SHA256。
- 更新应用后，安装目录的版本号、前端文件名中的哈希可能改变。先查运行中的 `ChatGPT.exe` 所在目录，再按组件名前缀查找，避免依赖旧哈希。

## 已发现的可复用资源

| 界面区域 | 文件名前缀 | 复用方式 |
| --- | --- | --- |
| 侧栏项目、插件、任务图标 | `sidebar-projects-icon`、`sidebar-plugins-icon`、`sidebar-tasks-icon` | Lottie 矢量数据，可提取路径、变换、关键帧与描边；不是独立 SVG |
| 侧栏其他图标 | `sidebar-library-icon`、`sidebar-images-icon`、`sidebar-finances-icon`、`sidebar-more-icon`、`sidebar-new-chat-icon`、`sidebar-search-icon` | 同类动画数据；可统一轮廓和悬浮动画 |
| 输入框工具栏 | `composer-controls`（JS、CSS）、`inline-composer`（JS、CSS） | 参考间距、圆角、工具排列、交互状态；业务接口继续使用 Harness |
| 输入框工作区和插件控件 | `composer-project-picker-content`、`composer-work-home-plugins-control` | 参考菜单层级、选中状态及布局 |
| 定时任务 | `automations-page`、`automation-dialog`、`schedule-fields` | 参考页面、创建表单、频率字段；当前本项目只有任务草稿，不代表接入调度后端 |
| 悬浮提示 | `tooltip`（JS、CSS） | 参考提示样式、定位和状态 |
| 聊天 / 工作切换 | `animated-segmented-toggle` | 参考分段切换动画 |
| 模型强度文案 | `model-and-reasoning-effort-translations` | 只有文案，不能据此认定已定位模型选择面板 |

## 重新提取

在工作区根目录运行：

```powershell
node outputs/deepseek-harness-chatgpt-ui/scripts/inspect-chatgpt-assets.mjs
```

也可传入新版本归档和输出目录：

```powershell
node outputs/deepseek-harness-chatgpt-ui/scripts/inspect-chatgpt-assets.mjs "C:/Program Files/WindowsApps/新版本目录/app/resources/app.asar" "outputs/chatgpt-reference-icons/reusable"
```

读取 ASAR 时，数据区基址为 `8 + prefix.readUInt32LE(4)`；文件位置为数据区基址加条目的 `offset`。不要用 `16 + headerSize`，这会把导出内容错移 8 字节。

## 后续使用注意

- `files`、`file_stack`、`at_sign`、`plugin_puzzle` 等通用 SVG 不是侧栏对应图标的确认来源；此前仅按名字选择曾造成误替换。
- 专用侧栏动画组件比通用图标目录更直接。仍须将组件、实际入口的引用关系和用户截图一起核对。
- 这些 JS 是编译后的组件，带有原应用的依赖和状态接口。优先复用矢量数据、CSS 数值和交互结构，不直接把整段应用业务组件挂入 Harness。
- 当前图标为静止帧 SVG 实现；尚未复用完整的 Lottie 悬浮动画。

## 已确认的空间入口静态图标

`app-initial-9e0f03d3c485.js` 中 `QLa` 的空间入口明确引用 `railIcons: { default: WLa, selected: VLa }`。两套叠页路径已保存到 `outputs/chatgpt-reference-icons/space-rail-confirmed.json`；不是 `sidebar-projects-icon` 文件夹动画。定时任务默认静态图标为同包 `NGr`，20×20，圆半径 7.5、描边 1.33。

## Codex 前端字体

当前安装包（Codex `26.930.3930.0`）在 `webview/assets/app-shared-6fb15e58cd7f.css` 中用 `@font-face` 注册 `OpenAI Sans`，并提供 400、500、600 字重。三个 WOFF2 已提取到 `outputs/chatgpt-reference-fonts/`，`index.json` 记录原包路径、字重、大小和 SHA256。界面基础字体变量为 `--font-openai-sans: "OpenAI Sans", var(--font-sans-default)`。KaTeX 字体也在包里，但仅用于数学排版，不属于界面常规字体。
