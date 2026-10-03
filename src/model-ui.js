// The directory is shared with the native /model command and session projection.
function registerModelUI(ctx) {
  const effortNames = { low: '轻度', medium: '中', high: '高', xhigh: '极高', ultra: 'Ultra' };
  const effortLabel = level => effortNames[level?.id] || level?.name || level?.id || '默认';
  const glyph = (kind, className) => h('svg', { className, width: 16, height: 16, viewBox: '0 0 24 24', fill: kind === 'zap' ? 'currentColor' : 'none', stroke: kind === 'zap' ? 'none' : 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: kind === 'zap' ? 'm13.8 2-10 12H11l-1 8 10.2-13H13l.8-7Z' : 'M3 10a9 9 0 1 1 2.7 8.4M3 4v6h6' }));
  function ModelControl({ locked, available, directory, load, select }) {
    const subscribe = React.useCallback(listener => directory.subscribe(listener), [directory]);
    const snapshot = React.useCallback(() => directory.getSnapshot(), [directory]);
    const state = React.useSyncExternalStore(subscribe, snapshot);
    const [open, setOpen] = React.useState(false);
    const [pane, setPane] = React.useState('effort');
    const [query, setQuery] = React.useState('');
    const [draftIndex, setDraftIndex] = React.useState(null);
    const [actionError, setActionError] = React.useState(null);
    const rootRef = React.useRef(null);
    const triggerRef = React.useRef(null);
    const popupRef = React.useRef(null);
    const focusPending = React.useRef(false);
    const effortQueue = React.useRef(null);
    const effortSaving = React.useRef(false);
    const effortTarget = React.useRef(null);
    const choices = state.groups.flatMap(group => group.models.map(model => ({ group, model })));
    const chosen = choices.find(choice => choice.group.id === state.current?.provider && choice.model.id === state.current?.model);
    const reasoning = chosen?.model.reasoning;
    const levels = reasoning?.efforts || [];
    const effectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
    const effectiveIndex = levels.findIndex(level => level.id === effectiveEffort);
    const sliderIndex = draftIndex ?? Math.max(0, effectiveIndex);
    const displayLevel = draftIndex === null ? levels[effectiveIndex] : levels[draftIndex];
    const label = displayLevel ? effortLabel(displayLevel) : state.retainedEffort || '默认';
    const ultra = displayLevel?.id === 'ultra' || levels.length > 1 && (draftIndex ?? effectiveIndex) === levels.length - 1;
    const modelName = chosen?.model.name || state.current?.model || '选择模型';
    const busy = locked || state.pending !== null;
    const close = React.useCallback(() => { setOpen(false); setDraftIndex(null); triggerRef.current?.focus(); }, []);
    React.useEffect(() => { if (effortTarget.current === null || effortTarget.current === effectiveEffort) setDraftIndex(null); }, [effectiveEffort]);
    React.useEffect(() => { effortQueue.current = null; effortTarget.current = null; setDraftIndex(null); }, [state.current?.provider, state.current?.model]);
    React.useEffect(() => { if (locked || !available) setOpen(false); }, [locked, available]);
    React.useEffect(() => {
      if (!open) return;
      const outside = event => { if (!rootRef.current?.contains(event.target)) { setOpen(false); setDraftIndex(null); } };
      const escape = event => {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        if (pane === 'model' && state.current !== null) { setPane('effort'); focusPending.current = true; }
        else close();
      };
      document.addEventListener('pointerdown', outside);
      document.addEventListener('keydown', escape, true);
      return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape, true); };
    }, [open, pane, state.current, close]);
    React.useEffect(() => {
      if (!open || !focusPending.current) return;
      focusPending.current = false;
      const handle = requestAnimationFrame(() => (popupRef.current?.querySelector(pane === 'model' ? 'input[type="search"]' : 'input[type="range"]:not(:disabled)') || popupRef.current?.querySelector('button:not(:disabled)'))?.focus());
      return () => cancelAnimationFrame(handle);
    }, [open, pane]);
    async function choose(selection) {
      if (locked || !available || directory.getSnapshot().pending !== null) return false;
      setActionError(null);
      try {
        const result = await select(selection);
        if (!result?.ok) {
          if (result) setActionError(result.error.code === 'session/writer-held' ? '当前会话已被占用，请退出其他正在运行的 DSH 后重试。' : `${result.error.code}: ${result.error.message}`);
          setDraftIndex(null);
          return false;
        }
        return true;
      } catch (error) {
        setActionError(error.message || String(error));
        setDraftIndex(null);
        return false;
      }
    }
    const chooseLevel = async value => {
      const index = Number(value), level = levels[index];
      if (!state.current || !level || locked || !available) return;
      setDraftIndex(index);
      effortTarget.current = level.id;
      effortQueue.current = { provider: state.current.provider, model: state.current.model, reasoningEffort: level.id };
      if (effortSaving.current) return;
      effortSaving.current = true;
      setActionError(null);
      try {
        while (effortQueue.current) {
          const selection = effortQueue.current;
          effortQueue.current = null;
          const current = directory.getSnapshot().current;
          if (current?.reasoningEffort === selection.reasoningEffort) continue;
          const result = await select(selection);
          if (!result?.ok) throw new Error(result?.error?.message || '强度更新失败，请重试。');
        }
        const current = directory.getSnapshot().current;
        if (current?.reasoningEffort === effortTarget.current) setDraftIndex(null);
      } catch (error) {
        effortQueue.current = null;
        effortTarget.current = null;
        setDraftIndex(null);
        setActionError(error.message || String(error));
      } finally { effortSaving.current = false; }
    };
    const show = () => {
      if (busy) return;
      setActionError(null);
      setQuery('');
      setPane(state.current === null ? 'model' : 'effort');
      setOpen(true);
      focusPending.current = true;
      load();
    };
    const reset = () => {
      if (!state.current) return;
      setDraftIndex(null);
      choose({ provider: state.current.provider, model: state.current.model, ...(reasoning?.defaultEffort === undefined ? {} : { reasoningEffort: reasoning.defaultEffort }) });
    };
    if (!available) return null;
    const error = actionError || state.error;
    const filteredGroups = state.groups.map(group => ({ ...group, models: group.models.filter(model => model.name.toLowerCase().includes(query.trim().toLowerCase())) })).filter(group => group.models.length);
    const catalogGroups = filteredGroups.map(group => h('div', { key: group.id },
      h('div', { className: 'cg-model-provider' }, filteredGroups.length === 1 ? '推荐模型集' : group.id === 'deepseek-account' ? 'DeepSeek 账号' : group.name),
      ...group.models.map(model => h('button', {
        key: model.id, type: 'button', role: 'menuitemradio',
        'aria-checked': state.current?.provider === group.id && state.current?.model === model.id,
        className: 'cg-model-option', disabled: busy,
        onClick: async () => {
          const same = state.current?.provider === group.id && state.current?.model === model.id;
          const effort = same ? state.current.reasoningEffort ?? model.reasoning?.defaultEffort : model.reasoning?.defaultEffort;
          if (await choose({ provider: group.id, model: model.id, ...(effort === undefined ? {} : { reasoningEffort: effort }) })) {
            setDraftIndex(null); setPane('effort'); focusPending.current = true;
          }
        }
      }, h('span', null, model.name), state.current?.provider === group.id && state.current?.model === model.id && h(Icon, { name: 'check', size: 14 })))));
    return h('div', { className: 'cg-model-root', ref: rootRef },
      h('button', { className: 'cg-model-trigger', type: 'button', ref: triggerRef, disabled: busy, 'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-label': `选择模型，当前 ${modelName}${levels.length || state.retainedEffort ? `，推理强度 ${label}` : ''}`, onClick: () => open ? close() : show() },
        glyph('zap', 'cg-model-trigger-zap'),
        h('span', { className: 'cg-model-trigger-name' }, modelName),
        (levels.length > 0 || state.retainedEffort) && h('span', { className: 'cg-model-trigger-effort', 'data-ultra': effectiveEffort === 'ultra' || levels.length > 1 && effectiveIndex === levels.length - 1 }, effectiveIndex >= 0 ? effortLabel(levels[effectiveIndex]) : state.retainedEffort || '默认'),
        h(Icon, { name: 'down', size: 12 })),
      open && h('div', { className: 'cg-model-popover', ref: popupRef, role: 'dialog', 'aria-label': '模型与推理强度', 'data-ultra': ultra, 'data-pane': pane },
        pane === 'effort' ? h(React.Fragment, null,
          h('div', { className: 'cg-model-top' }, glyph('zap', 'cg-model-zap'),
            h('button', { className: 'cg-model-summary', type: 'button', disabled: busy, 'aria-label': '更换模型', onClick: () => { setPane('model'); focusPending.current = true; } }, h('strong', { 'aria-live': 'polite' }, levels.length ? label : '选择模型'), h('span', { className: 'cg-model-summary-name' }, modelName, h(Icon, { name: 'chevron', size: 11 }))),
            h('button', { className: 'cg-model-reset', type: 'button', 'aria-label': '恢复默认强度', disabled: busy || !reasoning || !state.current, onClick: reset }, glyph('reset'), h('span', { className: 'cg-model-tooltip', role: 'tooltip' }, '重置为默认'))),
          levels.length > 0 ? h('div', { className: 'cg-model-slider-shell', 'data-max': levels.length > 1 && sliderIndex === levels.length - 1 },
            h('div', { className: 'cg-model-slider-fill', style: { width: `calc(${levels.length > 1 ? sliderIndex / (levels.length - 1) * 100 : 0}% + ${12 - (levels.length > 1 ? sliderIndex / (levels.length - 1) : 0) * 24}px)` } }),
            h('div', { className: 'cg-model-slider-dots', 'aria-hidden': true }, ...levels.map(level => h('span', { key: level.id }))),
            h('span', { className: 'cg-model-thumb', 'aria-hidden': true, style: { left: `calc(${levels.length > 1 ? sliderIndex / (levels.length - 1) * 100 : 0}% + ${12 - (levels.length > 1 ? sliderIndex / (levels.length - 1) : 0) * 24}px)` } }),
            h('input', { className: 'cg-model-slider', type: 'range', min: 0, max: Math.max(0, levels.length - 1), step: 1, value: sliderIndex, disabled: locked || levels.length < 2, 'aria-label': '推理强度', 'aria-valuetext': label, onChange: event => setDraftIndex(Number(event.target.value)), onPointerUp: event => chooseLevel(event.currentTarget.value), onKeyUp: event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) chooseLevel(event.currentTarget.value); }, onBlur: event => { if (draftIndex !== null) chooseLevel(event.currentTarget.value); } }))
            : h('p', { className: 'cg-model-message' }, '当前模型未提供推理强度设置。'))
        : h(React.Fragment, null,
          h('div', { className: 'cg-model-catalog-title' }, '选择模型'),
          h('div', { className: 'cg-model-catalog-default' }, '默认'),
          choices.length > 4 && h('input', { type: 'search', className: 'cg-model-search', 'aria-label': '搜索模型', placeholder: '搜索模型…', value: query, onChange: event => setQuery(event.target.value), disabled: busy }),
          h('div', { className: 'cg-model-catalog', role: 'menu', 'aria-label': '可用模型' }, ...catalogGroups,
          state.status === 'loading' && h('p', { className: 'cg-model-message', role: 'status' }, '正在加载模型…'),
          state.status !== 'loading' && !filteredGroups.length && h('p', { className: 'cg-model-message' }, query ? '没有匹配的模型。' : '暂无可用模型。'))),
        state.routable === false && h('p', { className: 'cg-model-error' }, '当前模型暂不可用，请选择可用模型。'),
        ...state.failures.map(failure => h('p', { className: 'cg-model-error', key: failure.id }, `${failure.name}: ${failure.message}`)),
        error && h('p', { className: 'cg-model-error', role: 'alert' }, error),
        state.status === 'error' && h('button', { className: 'cg-model-choice', type: 'button', onClick: () => { setActionError(null); load(); }, disabled: busy }, '重新加载')));
  }
  ctx.inject(['slots', 'modelDirectories', 'sessions', 'remote', 'remote.session'], scope => {
    const models = scope.modelDirectories;
    const sessions = scope.sessions;
    scope.slots.inject('conversation.input.model', () => scope.slots.register({
      name: 'conversation.input.model',
      priority: -10,
      inject: sessionId => {
        const directory = models.directoryFor(sessionId);
        const available = sessions.subagentAddress(sessionId) === undefined;
        return { available, directory: directory.store, load: () => { if (available) directory.load().catch(() => {}); }, select: selection => available ? directory.select(selection) : Promise.resolve(undefined) };
      }
    }, ModelControl));
  });
}
