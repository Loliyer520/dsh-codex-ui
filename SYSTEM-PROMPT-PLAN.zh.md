# DSH 系统提示词改写方案（0.2.0-rc.2）

## 已实施：DeepSeek / Codex 两套模式（插件 0.3.28）

- **DeepSeek**：直接使用 DSH 当前版本和当前配置装配的原版提示词，本插件不添加任何提示词文字，也不保存易过期的副本。
- **Codex**：在原版工具说明与运行上下文基础上追加 `prompts/codex.txt`。要求依据充分、区分事实与推测、指出错误前提、语气克制、结论优先、少客套和重复；不得虚报完成或验证。用户要求详细解释时可以展开。

左上角 DeepSeek / Codex 菜单现在选择真实的后端回复模式。模式写入原生 JSON 后端的独立 `chatgpt_ui_modes` 存储单元，按会话 ID 保存；刷新和重新打开保留选择，分叉复制父会话的已保存选择。新会话默认 DeepSeek。已有对话可以在空闲时切换，从下一次请求生效；生成中暂不允许切换。保存失败会显示错误。此前只用于外观的本地 `dsh-ui-brand` 值不再作为模式依据。

0.3.25 的自定义日志事件未带兼容标记，会导致重启后历史加载失败。0.3.27 不再追加此类事件；旧投影仅用于读取兼容记录。已备份并修复当前会话的三条旧记录，保留全部会话内容。其他同类旧日志可在关闭 DSH 后用 `scripts/repair-mode-log.mjs <完整日志路径>` 修复；脚本保留原字节备份，仅给旧模式记录添加兼容标记。

Codex 是本插件的回复风格名称；底层模型仍由输入框的模型菜单独立选择。顶部“聊天 / 工作”不承担提示词切换。

实现：`src/prompt-modes.js` 注册 `chatgpt-ui:codex-style` 系统段、`cgPromptMode` 会话投影及经过原生认证通道的选择接口。DeepSeek 返回空文字；Codex 读取 `prompts/codex.txt`。仅支持常规原版提示词装配；自定义预设如采用 `complete: true` 完整提示词，应先移除该独占配置。

验证：`npm test` 使用本机 DSH 的真实系统提示词装配器、会话日志与投影，检查 DeepSeek 渲染文字与基线完全一致、Codex 追加风格段、会话隔离、重新打开、无效模式、生成中拒绝以及持久化失败重试，并确认新模式选择不向会话日志追加未知事件。未据此声称模型输出风格已经实测。

以下保留此前核对的原生接口，供后续修改参考。

已核对本机 `@deepseek-ai/dsh-system-prompt/lib/types/index.d.ts` 和 `lib/index.js`。
包位置：`C:/Users/loliyc/.dsh-win/versions/0.2.0-rc.2/node_modules/.pnpm/@deepseek-ai+dsh-system-pro_af0aba1f40fabd5fd7c0d5c00aaf1202/node_modules/@deepseek-ai/dsh-system-prompt/`。

## 方案一：部署级角色改写

system-prompt 插件配置支持 `personaPrefix`（工具说明之前）与 `personaSuffix`（工具说明之后）。适合统一回复风格、语言、工作方式。保留默认工具说明、动态上下文及能力声明。

已核对 `dsh-base/cordis.patch.yml`，节点 ID 为 `system-prompt`。在当前 profile 的 `work/install-home/profiles/install-check/cordis.patch.yml` 数组中可加入以下配置条目（示例，尚未应用）：

```yaml
- id: system-prompt
  name: '@deepseek-ai/dsh-system-prompt'
  config:
    personaPrefix: |
      你是 DeepSeek Harness 中的开发协作助手。
      默认使用中文，先说明结果，再给出必要证据。
    personaSuffix: |
      优先完成用户已明确授权的工作。
      未经验证不要声称测试通过或界面已完全还原。
```

`{{variable}}` 是严格插值；未知变量会导致装配失败。当前 UI 插件是前端插件，不能仅修改聊天输入框来改变后端系统提示词。

## 方案二：按代理覆盖

在对应代理的 `agent.ctx` 作用域注册同名 `deployment:persona-prefix` / `deployment:persona-suffix` 段，可覆盖全局角色；通过 `systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX')` 等获取顺序。全局同名重复注册会报错，不能在全局重复注册来覆盖。

```js
agent.ctx.systemPrompt.section({
  name: 'deployment:persona-prefix',
  order: agent.ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX'),
  text: '你是一个使用中文的开发协作助手。',
  interpolate: false,
});
```

具体挂载生命周期需在后端插件里实现，不能把这段直接放入本项目的前端 apply。

## 方案三：全量替换

`systemPrompt.section({ name, order, text, complete: true, interpolate: false })` 支持完整系统提示词。只能有一个有效 complete 段，否则装配失败。装配瀑布流仍处理 tools、contexts、variables，之后恢复该完整段为唯一系统段。全量替换会移除其他文字指导，需自行维护工具使用说明。

## 验证与实施范围

目前已采用上文的会话级风格段实现。全局 `personaPrefix` / `personaSuffix` 配置示例仅供参考，未写入用户 profile，也不改变模型选择或凭据。
