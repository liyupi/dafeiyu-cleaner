/* 入口：读取设置、挂载鲸鱼娘、按页面类型启动对应模块 */
(async function () {
  const DFY = globalThis.DFY;
  if (DFY.booted) return;
  DFY.booted = true;

  const hasRuntime = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  DFY.canLLM = !!hasRuntime;
  DFY.callBg = function (msg) {
    if (!hasRuntime) return Promise.resolve(null);
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(msg, (res) => {
          void chrome.runtime.lastError;
          resolve(res || null);
        });
      } catch (e) {
        resolve(null);
      }
    });
  };

  const [st] = await Promise.all([DFY.store.get(['settings', 'blocklist', 'whitelist']), DFY.memory.load()]);
  DFY.settings = st.settings;
  DFY.lists = { block: st.blocklist, white: st.whitelist };

  if (window.top !== window) return;
  // 标题字体（得意黑子集，改名为 DFY Display）。@font-face 必须声明在文档里，shadow DOM 内无效
  if (hasRuntime && !document.getElementById('dfy-font')) {
    const f = document.createElement('style');
    f.id = 'dfy-font';
    f.textContent = `@font-face{font-family:"DFY Display";src:url("${chrome.runtime.getURL('assets/dfy-display.woff2')}") format("woff2");font-display:swap}`;
    (document.head || document.documentElement).appendChild(f);
  }
  DFY.ui.mount();
  DFY.store.get('customMascot').then((u) => u && DFY.ui.setCustom(u));
  const showMascot = (s) => s.enabled && s.showMascot && !s.quiet;
  DFY.ui.look(DFY.settings);
  DFY.ui.show(showMascot(DFY.settings));

  DFY.store.onChange((ch) => {
    if (ch.settings) {
      const prev = DFY.settings;
      DFY.settings = Object.assign({}, DFY.DEFAULTS.settings, ch.settings);
      DFY.ui.look(DFY.settings);
      DFY.ui.show(showMascot(DFY.settings));
      if (['threshold', 'mode', 'llmEnabled', 'enabled', 'quiet', 'hideAtFish'].some((k) => prev[k] !== DFY.settings[k])) DFY.comments.rejudgeAll();
    }
    if ('customMascot' in ch) DFY.ui.setCustom(ch.customMascot || '');
    if (ch.blocklist) DFY.lists.block = ch.blocklist || {};
    if (ch.whitelist) DFY.lists.white = ch.whitelist || {};
    if ('seen' in ch) DFY.memory.seen = ch.seen || {};
    if ('llmCache' in ch) DFY.memory.llm = ch.llmCache || {};
    if (ch.blocklist || ch.whitelist) DFY.comments.rejudgeAll();
  });

  // 插件面板查询本页状态 / 快捷键
  if (hasRuntime)
    chrome.runtime.onMessage.addListener((msg, sender, send) => {
      if (!msg || !msg.dfy) return;
      const C = DFY.comments;
      if (msg.dfy === 'status') send({ enabled: DFY.settings.enabled, comments: C.hasComments(), space: isSpace(), ...C.stats() });
      else if (msg.dfy === 'snap') C.snap(), send({ ok: true });
      else if (msg.dfy === 'cannon') DFY.ui.cannon(true), send({ ok: true });
      else if (msg.dfy === 'rescan') C.rescan(), send({ ok: true });
      else if (msg.dfy === 'llm') C.llmPage(), send({ ok: true });
      else if (msg.dfy === 'report') DFY.space.show(), send({ ok: true });
    });

  const isSpace = () => !!DFY.space.midFromUrl();

  const I = (n) => DFY.icon(n, 17, 2.2);
  DFY.menuItems = function () {
    const n = DFY.comments.fishCount || 0;
    const s = DFY.settings;
    const items = [];
    if (n) items.push({ label: `${I('snap')}响指清场 <span class="n">${n}</span>`, primary: true, run: () => DFY.comments.snap() });
    if (isSpace()) items.push({ label: I('report') + '鉴定报告', primary: !n, run: () => DFY.space.show() });
    items.push({ label: I('bubble') + '泡泡大炮', run: () => DFY.ui.cannon(true) });
    if (DFY.comments.hasComments())
      items.push({
        label: I('bolt') + (s.mode === 'auto' ? '自动清场：已开启' : '进页面自动清场'),
        run: async () => {
          const next = s.mode === 'auto' ? 'mark' : 'auto';
          await DFY.store.patch('settings', (st) => {
            st.mode = next;
          });
          DFY.settings.mode = next;
          DFY.ui.say(next === 'auto' ? '好！以后一进页面本鲸就先清场' : '自动清场关掉啦，等你下令', { face: next === 'auto' ? 'smug' : 'happy' });
          if (next === 'auto') DFY.comments.snap({ auto: true });
        },
      });
    if (DFY.comments.hasComments()) items.push({ label: I('search') + '重新巡逻', run: () => DFY.comments.rescan() });
    if (s.llmEnabled && s.llmKey) {
      if (DFY.comments.hasComments()) items.push({ label: I('brain') + 'DeepSeek 精判本页', run: () => DFY.comments.llmPage() });
    } else items.push({ label: I('brain') + '开启 DeepSeek 精判', run: () => DFY.callBg({ type: 'open-options' }) });
    items.push({ label: I('hide') + '先藏起来', run: () => DFY.ui.minimize() });
    items.push({ label: I('gear') + '设置', run: () => DFY.callBg({ type: 'open-options' }) });
    return items;
  };

  if (!DFY.settings.enabled) return;
  // 设置加载前主世界可能已经送来过评论，让它重新送一次
  window.postMessage({ source: 'dfy-iso', type: 'rescan' }, '*');

  // 打招呼
  setTimeout(() => {
    if (!isSpace()) DFY.ui.say(DFY.say('hello'), { face: 'happy', ms: 2600 });
  }, 1200);

  // 空间主页鉴定（B 站空间是单页应用，路由变化时重新鉴定）
  let lastMid = '';
  const checkRoute = () => {
    const mid = DFY.space.midFromUrl();
    if (mid && mid !== lastMid) {
      lastMid = mid;
      // 极简模式不自动弹鉴定报告，需要时从插件面板打开
      if (!DFY.settings.quiet) setTimeout(() => DFY.space.run(), 900);
    }
  };
  checkRoute();
  setInterval(checkRoute, 1000);
})();
