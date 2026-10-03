import React from 'react';
const h = React.createElement;
const paths = {
  home: 'M2.7 10.3 11 3.4a1.6 1.6 0 0 1 2 0l8.3 6.9a1 1 0 0 1-.6 1.8H19v7.1a1.8 1.8 0 0 1-1.8 1.8H14v-6H10v6H6.8A1.8 1.8 0 0 1 5 19.2v-7.1H3.3a1 1 0 0 1-.6-1.8Z',
  files: 'm10 4 6-1a3 3 0 0 1 3.4 2.4l1 6a3 3 0 0 1-2.4 3.4l-1.2.2M5.7 6.4l6.8-.8a2.8 2.8 0 0 1 3.1 2.4l.9 9a2.8 2.8 0 0 1-2.4 3.1l-6.8.8a2.8 2.8 0 0 1-3.1-2.4l-.9-9a2.8 2.8 0 0 1 2.4-3.1ZM10 6l.4 3a1.8 1.8 0 0 0 2 1.6l3-.4',
  clock: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  search: 'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
  edit: 'M11 4H6a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-5M13.5 5.5l5 5M8 16l1-4L18 3a1.4 1.4 0 0 1 2 0l1 1a1.4 1.4 0 0 1 0 2l-9 9-4 1Z',
  bell: 'M6 10a6 6 0 0 1 12 0v3.5l1.7 3a1 1 0 0 1-.9 1.5H5.2a1 1 0 0 1-.9-1.5l1.7-3V10ZM10 21a2.5 2.5 0 0 0 4 0',
  chevron: 'm9 5 7 7-7 7',
  down: 'm7 10 5 5 5-5',
  folder: 'M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM3 9V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2',
  more: 'M4 12h.01M12 12h.01M20 12h.01',
  check: 'm5 12 4 4L19 5',
  settings: 'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  refresh: 'M20 7V3l-4 4M20 7a8 8 0 1 0 0 10M20 7h-5',
  help: 'M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  external: 'M14 3h7v7M21 3l-11 11M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5',
  chat: 'M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM7 9h10M7 13h7',
  trace: 'M9 5h12M9 12h12M9 19h12M3 3h3v4H3ZM3 10h3v4H3ZM3 17h3v4H3Z',
  target: 'M20 10a9 9 0 1 1-6-6M17 11a5 5 0 1 1-4-4M12 12l7-7M17 3v4h4',
  plus: 'M12 5v14M5 12h14',
  at: 'M16 8v7a2 2 0 0 0 4 0v-3a8 8 0 1 0-3 6M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'
};
function Icon({ name, size = 16, active = false }) {
  const attrs = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: name === 'more' ? 3.6 : 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, 'data-icon': name };
  if (active && name === 'clock') return h('svg', attrs, h('circle', { cx: 12, cy: 12, r: 10, fill: 'currentColor', stroke: 'none' }), h('path', { d: 'M12 7v6l-3 2', stroke: 'var(--cg-rail-hand, white)', strokeWidth: 1.5 }));
  // Official static sidebar-tasks fallback NGr; retain selected treatment.
  if (name === 'clock') return h('svg', { ...attrs, viewBox: '0 0 20 20', strokeWidth: 1.33 }, h('circle', { cx: 10, cy: 10, r: 7.5 }), h('path', { d: 'M9.99996 5.8335V9.82757C9.99996 9.93808 9.95606 10.0441 9.87792 10.1222L7.91663 12.0835' }));
  if (name === 'home') return h('svg', { ...attrs, fill: active ? 'currentColor' : 'none' }, h('path', { d: paths.home }));
  // Official Space railIcons: WLa (default), VLa (selected).
  if (name === 'files') return h('svg', { ...attrs, viewBox: '0 0 20 20', stroke: 'none', fill: 'currentColor' },
    ...(active ? ["M8.28093 8.3185C8.37244 9.60284 9.48784 10.5709 10.7721 10.4796L14.1764 10.2365L14.6384 15.5177C14.7804 17.1432 13.5772 18.5763 11.9518 18.7189L5.10808 19.3175C3.48236 19.4596 2.04914 18.2567 1.90691 16.631L1.17546 8.26674C1.0334 6.64118 2.2355 5.20802 3.86101 5.06557L8.02214 4.70034L8.28093 8.3185Z","M7.01921 3.38784C7.47188 1.69984 9.20799 0.697271 10.8962 1.14955L16.9489 2.77162C18.6367 3.22417 19.6389 4.95967 19.1872 6.6476L17.2116 14.0216C17.0049 14.7926 16.5286 15.4178 15.9137 15.8292C15.9154 15.69 15.9115 15.549 15.8991 15.4074L15.3161 8.74819C15.2185 7.63342 14.682 6.60233 13.8249 5.88295L11.9704 4.32631C11.1133 3.60731 10.0048 3.25929 8.89031 3.35659L6.9821 3.5226L7.01921 3.38784Z","M9.34929 4.60756C10.0085 4.62836 10.6466 4.86781 11.1569 5.29604L13.0124 6.8517C13.6124 7.3554 13.988 8.07809 14.0563 8.85854L14.0602 8.9103L10.6774 9.15248C10.1259 9.19147 9.64655 8.77623 9.6071 8.22475L9.34929 4.60756Z"] : ["M7.01826 3.38781C7.47069 1.69958 9.20694 0.697366 10.8952 1.14953L16.9479 2.7716C18.6362 3.22397 19.6383 4.9593 19.1862 6.64757L17.2106 14.0216C16.8715 15.2866 15.8124 16.1623 14.5935 16.3341C14.3503 17.5978 13.2984 18.601 11.9528 18.7189L5.1081 19.3175C3.48242 19.4595 2.04916 18.2567 1.90693 16.631L1.17549 8.26672C1.03327 6.64107 2.23548 5.20804 3.86103 5.06554L6.63349 4.82238L7.01826 3.38781ZM3.97724 6.39074C3.08335 6.46908 2.42258 7.25658 2.50068 8.1505L3.23213 16.5148C3.31035 17.4088 4.0988 18.0705 4.99287 17.9923L11.8366 17.3937C12.7306 17.3154 13.3914 16.527 13.3132 15.6329L12.8444 10.2706L10.78 10.4523C9.49733 10.5643 8.3659 9.6148 8.25361 8.33214L8.05244 6.03332L3.97724 6.39074ZM10.5505 2.43468C9.57185 2.17269 8.56586 2.75305 8.30342 3.73156L8.04365 4.69836L8.9997 4.61535C9.78022 4.54706 10.5566 4.79156 11.1569 5.29504L13.0124 6.85168C13.6126 7.35543 13.988 8.07788 14.0563 8.85851L14.5915 14.9825C15.2198 14.8273 15.7464 14.3452 15.9255 13.6769L17.9011 6.30382C18.1633 5.32505 17.5829 4.31818 16.6042 4.05578L10.5505 2.43468ZM9.57881 8.21593C9.62702 8.76703 10.1136 9.17528 10.6647 9.12707L12.7272 8.9464C12.6834 8.52775 12.4799 8.14127 12.1569 7.87023L10.3024 6.31457C10.0402 6.09451 9.71672 5.96583 9.37959 5.94054L9.57881 8.21593Z"]).map((d, index) => h('path', { key: index, d, fillRule: 'evenodd', clipRule: 'evenodd' })));
  if (name === 'at') return h('svg', { ...attrs, viewBox: '0 0 20 20', strokeWidth: 1.33, strokeLinecap: 'round', strokeLinejoin: 'round' },
    h('path', { d: 'M4.38 6.236 C3.182 7.085 1.569 7.454 -0.001 7.454 C-4.651 7.454 -7.718 3.781 -7.418 -0.519 C-7.145 -4.416 -3.667 -7.454 0.313 -7.454 C4.865 -7.454 7.703 -3.928 7.418 0.159 C7.217 3.039 4.328 4.163 2.524 2.218', transform: 'translate(9.999 9.975)' }),
    h('path', { d: 'M-3.218 0.786 C-3.218 0.786 0.924 -3.201 0.924 -3.201 C1.008 -3.281 1.14 -3.278 1.22 -3.195 L2.523 -1.826 C3.749 -0.568 3.393 1.023 2.143 2.226 C0.894 3.429 -0.736 3.681 -1.92 2.45 L-3.224 1.08 C-3.303 0.997 -3.301 0.866 -3.218 0.786 Z', transform: 'translate(10.104 10.092)' }),
    h('path', { d: 'M0 .792 C0 .792 0 -.792 0 -.792', transform: 'translate(10.104 10.092) translate(-.43 -3.208) rotate(-43.907)' }),
    h('path', { d: 'M0 .792 C0 .792 0 -.792 0 -.792', transform: 'translate(10.104 10.092) translate(-3.181 -.561) rotate(-43.907)' }));
  return h('svg', attrs, h('path', { d: paths[name] || paths.more }));
}
function Button({ icon, label, onClick, className = '', children, ...rest }) {
  return h('button', { type: 'button', className: `cg-button ${className}`, title: label, 'aria-label': label, onClick, ...rest }, icon && h(Icon, { name: icon }), children);
}
function TurnProcessStatus({ node, turnProcess }) {
  const turn = ['turn', 'step'].includes(node.location.kind) ? node.location.turn : null;
  if (!turnProcess || turn?.status !== 'closed') return null;
  const reason = turn.end?.data.reason.kind;
  const interrupted = reason === 'aborted' || reason === 'error';
  const canCollapse = turnProcess.foldable && turnProcess.hasContent && !interrupted;
  const open = !turnProcess.foldable || turnProcess.open || interrupted;
  const seconds = turn.start && turn.end ? Math.max(1, Math.floor((turn.end.time - turn.start.time) / 1000)) : null;
  const duration = seconds === null ? '' : `${seconds >= 3600 ? `${Math.floor(seconds / 3600)}小时` : ''}${seconds >= 60 ? `${Math.floor(seconds / 60) % 60}分` : ''}${seconds % 60}秒`;
  const label = reason === 'aborted' ? '已停止' : reason === 'error' ? '执行失败' : duration ? `用时 ${duration}` : '已完成';
  return h('button', {
    type: 'button', className: 'cg-turn-process',
    'data-turn-process': node.data.turn,
    'data-open': open || undefined,
    'aria-label': label,
    'aria-expanded': canCollapse ? open : undefined,
    disabled: !canCollapse,
    onClick: () => turnProcess.setOpen(!open)
  }, h('span', { role: 'status' }, label),
  h('span', { className: 'cg-turn-process-arrow' }, h(Icon, { name: 'chevron', size: 14 })));
}
export const inject = ['slots', 'layout', 'uiWorkspace', 'theme', 'connection', 'sessions'];
export function apply(ctx) {
  registerModelUI(ctx);
  ctx.slots.inject('conversation.session.header.utilities', () => {
    const native = ctx.slots.entries('conversation.session.header.utilities').find(entry => entry.options.id === 'session-log-download');
    const header = ctx.slots.entriesOfSlot('conversation.session.header')[0];
    if (!native || !header) return;
    function ConversationMoreMenu(props) {
      const views = props.useConversationViews(value => value);
      const preferred = props.useStore(state => state.view);
      const active = views.find(view => view.id === preferred)?.id ?? views[0]?.id;
      const original = native.component(props);
      return React.cloneElement(original, {}, React.Children.map(original.props.children, child => {
        if (!React.isValidElement(child) || !Array.isArray(child.props.items)) return child;
        return React.cloneElement(child, {
          items: [...views.map(view => ({ id: `cg-view:${view.id}`, label: view.label, icon: h(Icon, { name: active === view.id ? 'check' : view.id === 'chat' ? 'chat' : 'trace' }) })), ...child.props.items],
          onSelect: id => {
            if (!id.startsWith('cg-view:')) return child.props.onSelect(id);
            child.props.onClose();
            props.selectView(id.slice('cg-view:'.length));
          }
        });
      }));
    }
    return ctx.slots.register({
      name: 'conversation.session.header.utilities', ...native.options, priority: -10,
      locale: native.locale, store: header.store,
      inject: (sessionId, actions) => {
        const original = native.inject?.(sessionId, actions) || {};
        const navigation = header.inject(sessionId, actions);
        return { ...original, selectView: navigation.selectView, hooks: { ...original.hooks, ...navigation.hooks } };
      }
    }, ConversationMoreMenu);
  });
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node', key: 'turn-process', priority: -10
  }, TurnProcessStatus));
  ctx.effect(() => {
    const style = document.createElement('style');
    style.dataset.pluginCss = 'dsh-codex-ui';
    style.textContent = STYLE;
    document.head.append(style);
    document.documentElement.setAttribute('data-chatgpt-ui', '');
    return () => { style.remove(); document.documentElement.removeAttribute('data-chatgpt-ui'); };
  });
  ctx.effect(() => {
    const root = document.documentElement;
    const update = () => {
      const text = document.querySelector('[data-composer-input]')?.textContent || '';
      root.toggleAttribute('data-cg-setting-goal', /(?:^|\s)\/goal(?:\s|$)/.test(text));
    };
    const observer = new MutationObserver(update);
    observer.observe(document.getElementById('root'), { childList: true, subtree: true, characterData: true });
    update();
    return () => { observer.disconnect(); root.removeAttribute('data-cg-setting-goal'); };
  });
  // Both schemes are provided so Settings → Appearance keeps working.
  const pairs = {
    '--dsw-alias-bg-base': ['#ffffff', '#212121'],
    '--dsw-specific-sidebar-fill': ['#fbfbfb', '#171717'],
    '--dsw-specific-input-major': ['#ffffff', '#303030'],
    '--dsw-alias-label-primary': ['#202123', '#ececec'],
    '--dsw-alias-label-secondary': ['#424242', '#d1d1d1'],
    '--dsw-alias-label-caption': ['#999999', '#929292'],
    '--dsw-alias-state-business-primary': ['#3982fa', '#6b9fff'],
    '--dsw-alias-button-info-fill': ['#3982fa', '#3982fa']
  };
  ctx.effect(() => ctx.theme.overrideTokens('dsh-codex-ui', Object.fromEntries(Object.entries(pairs).map(([k, v]) => [k, { light: v[0], dark: v[1] }]))));

  const search = () => document.querySelector('.cg-workspaces [class*="searchButton"]')?.click();
  const go = id => ctx.layout.selectPanel(id);
  function Sidebar({ collapsed, renderSlot, useSessionStatus, useSessions, useWorkspaces, usePanelInfo }) {
    const panel = usePanelInfo(s => s.activePanelId);
    const sessions = useSessions(s => s.byId);
    const currentSession = Object.values(sessions).find(session => (session.retainedBy?.mainView ?? 0) > 0);
    const [storedMode, setStoredMode] = React.useState(null);
    const currentMode = storedMode && storedMode.sessionId === currentSession?.id ? storedMode.mode : currentSession?.projectionValues?.cgPromptMode;
    const brand = currentMode === 'Codex' ? 'Codex' : 'DeepSeek';
    const [modePending, setModePending] = React.useState(false);
    const [modeError, setModeError] = React.useState('');
    const modeRequest = React.useRef(false);
    const modeSession = React.useRef(currentSession?.id);
    modeSession.current = currentSession?.id;
    React.useEffect(() => {
      setModeError('');
      setBrandMenu(false);
      if (currentSession?.id) ctx.connection.rpc.call('/api', 'chatgpt-ui/prompt-mode', { sessionId: currentSession.id, action: 'read' }).then(result => {
        if (!result.ok) throw new Error(result.error.message);
        if (modeSession.current === currentSession.id) setStoredMode(result.value);
      }).catch(error => {
        if (modeSession.current === currentSession.id) setModeError(error.message || '模式读取失败，请重试。');
      });
    }, [currentSession?.id]);
    const chooseMode = async mode => {
      if (!currentSession || modeRequest.current || currentSession.running) return;
      const sessionId = currentSession.id;
      modeRequest.current = true;
      setModePending(true);
      setModeError('');
      try {
        const result = await ctx.connection.rpc.call('/api', 'chatgpt-ui/prompt-mode', { sessionId, mode });
        if (!result.ok) throw new Error(result.error.message);
        if (modeSession.current === sessionId) { setStoredMode(result.value); setBrandMenu(false); }
      } catch (error) {
        if (modeSession.current === sessionId) setModeError(error.message || '模式切换失败，请重试。');
      } finally {
        modeRequest.current = false;
        setModePending(false);
      }
    };
    const scheduled = panel === 'cg-schedules';
    const [localSection, setLocalSection] = React.useState('home');
    const section = scheduled ? 'clock' : panel === 'cg-dshrinth' ? 'files' : panel === 'plugins' ? 'at' : panel === null ? localSection : '';
    const rail = (icon, label, onClick) => h('button', { type: 'button', className: 'cg-button cg-rail-item' + (section === icon ? ' cg-rail-selected' : ''), 'aria-label': label, 'aria-current': section === icon ? 'page' : undefined, onClick }, h(Icon, { name: icon, active: section === icon }), h('span', { className: 'cg-rail-tooltip', role: 'tooltip' }, label));
    const [menu, setMenu] = React.useState(false);
    const [settingsMenu, setSettingsMenu] = React.useState(false);
    const [balance, setBalance] = React.useState(null);
    const [balanceLoading, setBalanceLoading] = React.useState(false);
    const balancePending = React.useRef(false);
    const settingsAnchor = React.useRef(null);
    const refreshBalance = async () => {
      if (balancePending.current) return;
      balancePending.current = true;
      setBalanceLoading(true);
      try { setBalance(await ctx.connection.rpc.call('/api', 'dsh-codex-ui/balance', {})); }
      catch { setBalance({ ok: false, error: { message: '连接失败，请稍后重试' } }); }
      finally { balancePending.current = false; setBalanceLoading(false); }
    };
    React.useEffect(() => {
      if (!settingsMenu) return;
      refreshBalance();
      const dismiss = event => { if (!settingsAnchor.current?.contains(event.target)) setSettingsMenu(false); };
      const escape = event => { if (event.key === 'Escape') { setSettingsMenu(false); settingsAnchor.current?.querySelector('.cg-settings-trigger')?.focus(); } };
      document.addEventListener('pointerdown', dismiss);
      document.addEventListener('keydown', escape);
      return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
    }, [settingsMenu]);
    const [brandMenu, setBrandMenu] = React.useState(false);
    const [notice, setNotice] = React.useState(false);
    const [projectsOpen, setProjectsOpen] = React.useState(false);
    const [pinsOpen, setPinsOpen] = React.useState(false);
    const [selectedTask, setSelectedTask] = React.useState(null);
    const [taskMenu, setTaskMenu] = React.useState(null);
    const [taskHover, setTaskHover] = React.useState(null);
    React.useEffect(() => {
      if (!taskHover) return;
      const popup = document.createElement('div');
      popup.className = 'cg-task-preview cg-task-preview-floating';
      popup.setAttribute('role', 'tooltip');
      const title = document.createElement('strong'); title.textContent = taskHover.title;
      const mode = document.createElement('div'); mode.textContent = '✓  工作';
      const location = document.createElement('div'); location.textContent = '▱  在你的电脑上运行';
      popup.append(title, mode, location); document.body.append(popup);
      const left = taskHover.right + 4;
      popup.style.left = Math.max(8, Math.min(left, window.innerWidth - popup.offsetWidth - 8)) + 'px';
      popup.style.top = Math.max(8, Math.min(taskHover.top, window.innerHeight - popup.offsetHeight - 8)) + 'px';
      const dismiss = () => setTaskHover(null);
      document.addEventListener('scroll', dismiss, true); window.addEventListener('resize', dismiss);
      return () => { popup.remove(); document.removeEventListener('scroll', dismiss, true); window.removeEventListener('resize', dismiss); };
    }, [taskHover]);
    const [recentOpen, setRecentOpen] = React.useState(false);
    const [navigationError, setNavigationError] = React.useState('');
    const workspaces = useWorkspaces(s => s);
    const pins = workspaces.pinnedSessionIds || [];
    const searchSessions = () => { setRecentOpen(true); requestAnimationFrame(search); };
    const status = useSessionStatus(s => s);
    const waiting = Array.from(status.values()).filter(s => s.pendingInteraction || s.completionUnread).length;
    const settings = () => { setSettingsMenu(false); document.querySelector('.cg-native-settings button')?.click(); };
    const renderTask = id => {
      const title = sessions[id].title || '新会话';
      return h('div', { key: id, className: 'cg-task-row' + ((currentSession?.id ?? selectedTask) === id ? ' cg-task-current' : ''), onMouseEnter: event => { const rect = event.currentTarget.getBoundingClientRect(); setTaskHover({ title, right: rect.right, top: rect.top }); }, onMouseLeave: () => setTaskHover(null) },
        h(Button, { label: title, className: 'cg-pinned-row', onClick: () => { setSelectedTask(id); ctx.uiWorkspace.openSession(id); }, children: title }),
        h('div', { className: 'cg-task-actions' }, h(Button, { icon: 'more', label: title + ' 的操作', onClick: () => setTaskMenu(taskMenu === id ? null : id) })),
        taskMenu === id && h('div', { className: 'cg-task-menu' }, h(Button, { label: '打开任务', children: '打开任务', onClick: () => { setTaskMenu(null); setSelectedTask(id); ctx.uiWorkspace.openSession(id); } })));
    };
    const recentIds = Object.keys(sessions).filter(id => !pins.includes(id)).sort((a, b) => { const stamp = item => { const value = item.updatedAt ?? item.createdAt; return typeof value === "number" ? value : Date.parse(value || "") || 0; }; return stamp(sessions[b]) - stamp(sessions[a]); });
    return h('div', { className: `cg-sidebar${collapsed ? ' cg-collapsed' : ''}` },
      h('nav', { className: 'cg-rail', 'aria-label': '应用导航' },
        rail('home', '主页', () => { setLocalSection('home'); go(null); if (collapsed) ctx.layout.toggleSidebar(); }),
        rail('files', '空间', () => go('cg-dshrinth')),
        rail('clock', '定时任务', () => go('cg-schedules')),
        rail('at', '插件', () => go('plugins')),
        h(Button, { icon: 'more', label: '更多', onClick: () => setMenu(!menu) }),
        h('div', { className: 'cg-rail-bottom' },
          h('div', { className: 'cg-settings', ref: settingsAnchor },
            h(Button, { icon: 'settings', label: '设置菜单', className: 'cg-settings-trigger', 'aria-haspopup': 'menu', 'aria-expanded': settingsMenu, onClick: () => setSettingsMenu(!settingsMenu) }),
            h('div', { className: 'cg-native-settings', hidden: true }, renderSlot('sidebar.settings', { wide: false })),
            settingsMenu && h('div', { className: 'cg-account-menu', role: 'menu', 'aria-label': '设置菜单' },
              h('div', { className: 'cg-account-summary', role: 'status', 'aria-live': 'polite' }, h('span', { className: 'cg-account-avatar', 'aria-hidden': true }, 'D'), h('div', null, h('div', { className: 'cg-account-title' }, 'DeepSeek API'), h('div', { className: 'cg-account-balance' }, balanceLoading ? '正在读取余额…' : balance?.ok ? balance.value.balances.map(row => `${row.currency === 'CNY' ? '¥' : '$'}${row.total}`).join(' / ') : balance?.error.message || '余额待查询'), h('div', { className: 'cg-account-caption' }, balance?.ok ? balance.value.available ? '可用余额' : '余额不足' : 'API 余额'))),
              h('div', { className: 'cg-account-separator' }),
              h(Button, { icon: 'refresh', label: '刷新余额', role: 'menuitem', disabled: balanceLoading, onClick: refreshBalance, children: ['刷新余额', h('span', { key: 'hint', className: 'cg-account-hint' }, balanceLoading ? '读取中' : '')] }),
              h(Button, { icon: 'external', label: 'API 控制台', role: 'menuitem', onClick: () => { setSettingsMenu(false); window.open('https://platform.deepseek.com/usage', '_blank', 'noopener,noreferrer'); }, children: 'API 控制台' }),
              h(Button, { icon: 'settings', label: '设置', role: 'menuitem', onClick: settings, children: '设置' }),
              h('div', { className: 'cg-account-separator' }),
              h(Button, { icon: 'at', label: '插件', role: 'menuitem', onClick: () => { setSettingsMenu(false); go('plugins'); }, children: '插件' }),
              h(Button, { icon: 'help', label: '帮助', role: 'menuitem', onClick: () => { setSettingsMenu(false); window.open('https://github.com/Loliyer520/dsh-codex-ui#readme', '_blank', 'noopener,noreferrer'); }, children: ['帮助', h('span', { key: 'arrow', className: 'cg-account-hint' }, h(Icon, { name: 'chevron', size: 12 }))] })))),
        menu && h('div', { className: 'cg-menu', role: 'menu' }, h(Button, { icon: 'at', label: '插件', onClick: () => { setMenu(false); go('plugins'); }, children: '插件' }), h(Button, { label: '展开或收起侧栏', onClick: () => { setMenu(false); ctx.layout.toggleSidebar(); }, children: '展开或收起侧栏' }), h(Button, { label: '设置', onClick: settings, children: '设置' }))),
      scheduled ? h('div', { className: 'cg-navigation cg-schedule-nav' }, h('div', { className: 'cg-brand-row' }, h('strong', null, '定时任务'), h(Button, { icon: 'search', label: '搜索任务', onClick: () => document.querySelector('.cg-task-search')?.focus() })), h(Button, { icon: 'plus', label: '新建任务', onClick: () => window.dispatchEvent(new CustomEvent('cg-new-task')), children: '新建任务' }), h('div', { className: 'cg-task-upcoming' }, '即将执行'), h('p', { className: 'cg-task-empty' }, '暂无已安排的任务'), h('p', { className: 'cg-task-empty' }, '草稿可在右侧查看')) : h('div', { className: 'cg-navigation' },
        h('div', { className: 'cg-brand-row' },
          h('div', { className: 'cg-brand-anchor' }, h(Button, { label: '切换模式', className: 'cg-brand', 'aria-haspopup': 'menu', 'aria-expanded': brandMenu, onClick: () => setBrandMenu(!brandMenu), children: [brand, h(Icon, { key: 'down', name: 'down', size: 12 })] }), brandMenu && h('div', { className: 'cg-brand-menu', role: 'menu', 'aria-label': '回复模式', 'aria-busy': modePending }, ...['DeepSeek', 'Codex'].map(name => h(Button, { key: name, label: name + ' 模式', role: 'menuitemradio', 'aria-checked': currentMode === name, disabled: modePending || !currentSession || currentSession.running, onClick: () => chooseMode(name), className: 'cg-brand-option', children: [h('span', { key: 'copy', className: 'cg-brand-copy' }, h('span', { className: 'cg-brand-name' }, name), h('span', { className: 'cg-brand-description' }, name === 'DeepSeek' ? '原版提示词' : '严谨、理性、严肃、简短')), currentMode === name && h(Icon, { key: 'check', name: 'check', size: 16 })] })), (modePending || currentSession?.running || !currentSession) && h('p', { className: 'cg-mode-status', role: 'status' }, modePending ? '正在保存…' : currentSession?.running ? '回复完成后可切换模式' : '新建或打开会话后可切换'))),
          h('div', { className: 'cg-brand-actions' }, h(Button, { icon: 'bell', label: '会话通知', onClick: () => setNotice(!notice) }), h(Button, { icon: 'search', label: '搜索会话', onClick: searchSessions }))),
        notice && h('div', { className: 'cg-notice', role: 'status' }, waiting ? `${waiting} 个会话有待确认请求或新的完成消息。` : '暂无待确认请求或新的完成消息。'),
        modeError && h('div', { className: 'cg-notice', role: 'alert' }, modeError),
        h(Button, { icon: 'edit', label: '新聊天', className: 'cg-new', onClick: () => ctx.uiWorkspace.startSession(), children: '新聊天' }),
        h('div', { className: 'cg-browse' },
          pins.some(id => sessions[id]) && h(Button, { label: '置顶', className: 'cg-section-toggle cg-pins-toggle', 'aria-expanded': pinsOpen, onClick: () => setPinsOpen(!pinsOpen), children: ['置顶', h('span', { key: 'arrow', className: 'cg-disclosure-arrow', 'aria-hidden': true }, h(Icon, { name: 'chevron', size: 13 }))] }),
          ...(pinsOpen ? pins.filter(id => sessions[id]).map(renderTask) : []),
          h(Button, { label: '项目', className: 'cg-section-toggle', 'aria-expanded': projectsOpen, onClick: () => setProjectsOpen(!projectsOpen), children: ['项目', h('span', { key: 'arrow', className: 'cg-disclosure-arrow', 'aria-hidden': true }, h(Icon, { name: 'chevron', size: 13 }))] }),
          projectsOpen && h('div', { className: 'cg-projects' }, ...workspaces.items.map(project => { const title = !project.title || project.title === 'default-workspace' ? '默认工作区' : project.title; return h(Button, { key: project.workspaceId, icon: 'folder', label: title, onClick: () => ctx.uiWorkspace.openWorkspace(project.workspaceId).catch(error => setNavigationError(error.message || String(error))), children: title }); }), h(Button, { icon: 'plus', label: '添加项目', onClick: () => document.querySelector('.cg-workspaces [class*="headerActions"] button[class*="iconButton"]')?.click(), children: '添加项目' })),
          h(Button, { label: '最近', className: 'cg-section-toggle', 'aria-expanded': recentOpen, onClick: () => setRecentOpen(!recentOpen), children: ['最近', h('span', { key: 'arrow', className: 'cg-disclosure-arrow', 'aria-hidden': true }, h(Icon, { name: 'chevron', size: 13 }))] }),
          ...(recentOpen ? recentIds.map(renderTask) : []),
          navigationError && h('div', { className: 'cg-notice', role: 'status' }, navigationError)),
        h('div', { className: 'cg-workspaces', hidden: true }, renderSlot('sidebar.workspaces', { wide: !collapsed, expandSidebar: () => ctx.layout.toggleSidebar() })),
        h('div', { className: 'cg-footer' }, renderSlot('sidebar.footer.action', { wide: !collapsed }))));
  }
  // This bundle disables the shipped sidebar before declaring its replacement.
  // Native workspace, settings and session-action occupants remain unchanged.
  ctx.slots.inject('sidebar', () => ctx.slots.register({ name: 'sidebar', children: {
    'sidebar.brand.mark': { kind: 'single', scope: 'root' },
    'sidebar.brand.name': { kind: 'single', scope: 'root' },
    'sidebar.toggle.badge': { kind: 'single', scope: 'root' },
    'sidebar.panellist': { kind: 'list', scope: 'root' },
    'sidebar.workspaces': { kind: 'single', scope: 'root' },
    'sidebar.settings': { kind: 'single', scope: 'root' },
    'sidebar.footer.action': { kind: 'list', scope: 'root' }
  } }, Sidebar));

  const taskTemplates = [
    ['☀️', '新闻更新', '每天给我发送一份新闻汇总，涵盖我关注的话题。', '每天'],
    ['✉️', '邮件监控', '扫描我的电子邮件，并告诉我哪些内容需要关注。', '每天'],
    ['🤖', 'LLM 蒸馏提示词迭代', '每周给我一个可执行的蒸馏提示词改进方案，并产出可直接测试的新版本。', '每周'],
    ['✈️', '为出行查找航班', '为即将到来的旅行寻找最划算的机票。', '每天'],
    ['🌞', '每日简报', '个性化每日简报，聚焦你最关心的话题。', '每天'],
    ['💰', '每周更新财务状况', '回顾我最近的支出，看看有哪些需要注意的事项。', '每周']
  ];
  function ScheduledTasks() {
    const [tasks, setTasks] = React.useState(() => { try { return JSON.parse(localStorage.getItem('cg-task-drafts') || '[]'); } catch { return []; } });
    const [draft, setDraft] = React.useState(null);
    const [query, setQuery] = React.useState('');
    React.useEffect(() => { const open = () => setDraft({ title: '', prompt: '', frequency: '每天', time: '09:00' }); window.addEventListener('cg-new-task', open); return () => window.removeEventListener('cg-new-task', open); }, []);
    const save = e => { e.preventDefault(); const next = [...tasks, { ...draft, id: Date.now() }]; localStorage.setItem('cg-task-drafts', JSON.stringify(next)); setTasks(next); setDraft(null); };
    const field = (name, value) => setDraft({ ...draft, [name]: value });
    return h('section', { className: 'cg-schedules' },
      h('div', { className: 'cg-schedule-content' }, h('div', { className: 'cg-task-clock', 'aria-hidden': true }, '🕒'), h('h1', null, '安排任务'), h('p', { className: 'cg-task-subtitle' }, 'DeepSeek 可以帮你规划持续性任务，让你无需亲力亲为。'),
      h('div', { className: 'cg-task-templates' }, ...taskTemplates.map(([icon, title, prompt, frequency]) => h('button', { key: title, type: 'button', className: 'cg-task-template', onClick: () => setDraft({ title, prompt, frequency, time: '09:00' }) }, h('span', { className: 'cg-task-emoji' }, icon), h('span', null, h('strong', null, title), h('span', { className: 'cg-task-description' }, prompt))))),
      h('p', { className: 'cg-task-note' }, '当前支持保存任务草稿；尚未接入自动执行服务。'),
      tasks.length > 0 && h('div', { className: 'cg-task-drafts' }, h('h2', null, '任务草稿'), h('input', { className: 'cg-task-search', placeholder: '搜索任务', value: query, onChange: e => setQuery(e.target.value) }), ...tasks.filter(t => (t.title + t.prompt).includes(query)).map(t => h('article', { key: t.id }, h('strong', null, t.title), h('span', null, `${t.frequency} ${t.time} · 草稿`), h('p', null, t.prompt), h(Button, { label: '删除草稿 ' + t.title, onClick: () => { const next = tasks.filter(x => x.id !== t.id); localStorage.setItem('cg-task-drafts', JSON.stringify(next)); setTasks(next); }, children: '删除草稿' })))),
      draft && h('div', { className: 'cg-task-modal-backdrop' }, h('form', { className: 'cg-task-modal', onSubmit: save }, h('h2', null, '新建任务'), h('label', null, '任务名称', h('input', { required: true, value: draft.title, onChange: e => field('title', e.target.value) })), h('label', null, '任务内容', h('textarea', { required: true, rows: 4, value: draft.prompt, onChange: e => field('prompt', e.target.value) })), h('label', null, '重复', h('select', { value: draft.frequency, onChange: e => field('frequency', e.target.value) }, ...['每天', '每周', '一次'].map(x => h('option', { key: x }, x)))), h('label', null, '时间', h('input', { type: 'time', required: true, value: draft.time, onChange: e => field('time', e.target.value) })), h('p', { className: 'cg-task-note' }, '保存为本地草稿，不会自动执行。'), h('div', { className: 'cg-task-form-actions' }, h(Button, { label: '取消', onClick: () => setDraft(null), children: '取消' }), h('button', { type: 'submit' }, '保存草稿'))))));
  }
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'cg-schedules' }, ScheduledTasks));
  function DshrinthPage() {
    return h('iframe', { className: 'cg-dshrinth-page', title: 'DSHrinth 插件社区', src: 'https://dshrinth.com/', referrerPolicy: 'no-referrer' });
  }
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'cg-dshrinth' }, DshrinthPage));

  function Chrome({ usePanelInfo, useSessions }) {
    const [mode, setMode] = React.useState('work');
    const active = usePanelInfo(s => s.activePanelId);
    const sessions = useSessions(s => s.byId);
    const currentSession = Object.values(sessions).find(session => (session.retainedBy?.mainView ?? 0) > 0);
    const isNewConversation = currentSession?.blank === true;
    const [tabPosition, setTabPosition] = React.useState(null);
    React.useLayoutEffect(() => {
      const center = document.querySelector('.pI_x6G_centerCol');
      const frame = document.querySelector('.pI_x6G_frame');
      if (!center || !frame) return;
      let tick;
      const measure = () => { const rect = center.getBoundingClientRect(); const bounds = frame.getBoundingClientRect(); setTabPosition({ '--cg-tabs-center': (rect.left + rect.width / 2) + 'px', top: (bounds.top + 12) + 'px' }); };
      const update = () => { cancelAnimationFrame(tick); tick = requestAnimationFrame(measure); };
      const resize = new ResizeObserver(update); resize.observe(center); resize.observe(frame);
      const mutation = new MutationObserver(update); mutation.observe(frame, { attributes: true });
      window.addEventListener('resize', update); measure();
      return () => { resize.disconnect(); mutation.disconnect(); cancelAnimationFrame(tick); window.removeEventListener('resize', update); };
    }, [active]);
    return active === null && isNewConversation && h('div', { className: 'cg-tabs', 'data-positioned': !!tabPosition, style: tabPosition || undefined, role: 'tablist', 'aria-label': '聊天模式' },
      ...[['chat', '聊天'], ['work', '工作']].map(([id, text]) => h('button', { key: id, type: 'button', role: 'tab', 'aria-selected': mode === id, className: mode === id ? 'cg-tab-active' : '', onClick: () => { setMode(id); go(null); } }, text)));
  }
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({ name: 'shell.overlay', id: 'chatgpt.chrome', order: 20 }, Chrome));
  ctx.slots.inject('shell.leading', () => ctx.slots.register({ name: 'shell.leading' }, () => h(Button, { icon: 'home', label: '展开侧栏', onClick: () => ctx.layout.toggleSidebar() })));
  function QuickGoal() {
    return h('span', { className: 'cg-goal', role: 'status', 'aria-label': '目标模式' }, h(Icon, { name: 'target' }), '目标');
  }
  function ComposerDock({ useSession }) {
    const session = useSession(s => s);
    if (!session?.blank) return null;
    return h('div', { className: 'cg-dock' },
      h(Button, { icon: 'files', label: '添加文件', onClick: () => document.querySelector('[data-composer-card] input[type="file"]')?.click(), children: '文件' }),
      h(Button, { icon: 'at', label: '管理插件', onClick: () => go('plugins'), children: '插件' }));
  }
  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({ name: 'conversation.input.left', id: 'chatgpt.goal', order: 50 }, QuickGoal));
  ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register({ name: 'conversation.input.overlay', id: 'chatgpt.shortcuts', order: 50 }, ComposerDock));
}
