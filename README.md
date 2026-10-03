<img src="assets/codex.png" width="72" alt="Codex icon">

# dsh-codex-ui

DeepSeek Harness 的 Codex 风格 UI 插件，适配 **0.2.0-rc.2 Web**。

- 紧凑会话侧栏、项目分组、置顶与最近会话、悬浮详情。
- 原生模型与推理强度选择、权限管理、附件、文件和插件入口。
- DeepSeek 模式保留原版系统提示词；Codex 模式追加严谨、理性、严肃、简短的回复规则。
- 浅色、深色和窄窗口适配；字体资源随插件打包。
- 左下角设置菜单显示已配置的官方 DeepSeek API 余额，提供刷新、控制台、设置、插件和帮助入口。余额由后端读取，API 密钥不会返回前端；查询缓存 30 秒。

## 安装

下载或克隆仓库，在 PowerShell 中运行：

```powershell
git clone https://github.com/Loliyer520/dsh-codex-ui.git
cd dsh-codex-ui
.\start-ui.ps1
```

启动脚本默认使用本机 `.dsh-win/versions/0.2.0-rc.2/dsh.cmd`，创建独立的 `codex-ui` Web profile，并打开端口 3088。也可指定位置和端口：

```powershell
.\start-ui.ps1 -Dsh 'C:/路径/dsh.cmd' -Profile codex-ui -Port 3089
```

安装到已有的自定义 Web profile：

```powershell
dsh plugin --profile <profile名称> add 'file:C:/路径/dsh-codex-ui'
```

从 `dsh-chatgpt-ui` 迁移时，先移除旧插件，再安装本包；启动脚本会自动完成此步骤。重启 Harness 后加载新版。

```powershell
dsh plugin --profile <profile名称> remove dsh-chatgpt-ui
```

## 开发

仓库包含已构建的 `lib/client.js`，安装插件无需重新构建。修改源码后执行：

```powershell
npm install
npm run build
npm run check
npm test
```

测试需要本机安装参考版本的 DSH；可通过 `DSH_RUNTIME_PACKAGES` 指定其 `node_modules/.pnpm` 目录。

## 卸载

```powershell
dsh plugin --profile codex-ui remove dsh-codex-ui
```

重启后恢复原生侧栏。仅验证过 Web；CSS 部分依赖参考版本的类名，升级 DSH 时需要重新校验。定时任务页面目前只保存本地草稿。Codex 模式仅改变提示词风格，不会将 DeepSeek 模型变为 OpenAI 模型。

提示词说明见 [SYSTEM-PROMPT-PLAN.zh.md](SYSTEM-PROMPT-PLAN.zh.md)，本机资源定位方法见 [RESOURCE-REFERENCE.zh.md](RESOURCE-REFERENCE.zh.md)。第三方图标和字体的来源见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)。本项目为个人界面插件，与 OpenAI 无隶属关系。
