/* 设置面板 & 战绩 */
(async function () {
  const DFY = globalThis.DFY;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  if (location.search.includes('page') || window.innerWidth > 500) document.body.classList.add('page');

  const style = document.createElement('style');
  style.textContent = DFY.mascotCSS;
  document.head.appendChild(style);
  for (const el of document.querySelectorAll('[data-ic]')) el.insertAdjacentHTML('afterbegin', DFY.icon(el.dataset.ic, 17, 2.2));
  document.querySelector('.hint.lock').insertAdjacentHTML('afterbegin', DFY.icon('lock', 14, 2.2));
  $('eye').innerHTML = DFY.icon('eye', 17, 2.2);
  $('test').insertAdjacentHTML('afterbegin', DFY.icon('bolt', 15, 2.4));
  $('cm-upload').insertAdjacentHTML('afterbegin', DFY.icon('image', 15, 2.4));
  $('cm-reset').insertAdjacentHTML('afterbegin', DFY.icon('undo', 15, 2.4));

  let S = await DFY.store.get(['settings', 'stats', 'blocklist', 'whitelist', 'customMascot', 'seen']);
  const save = () => DFY.store.set({ settings: S.settings });
  const whale = () => $('whale').querySelector('.dfy-whale');

  /* ---------- 分页（记住上次停留的页） ---------- */
  function showTab(name) {
    for (const b of $('tabs').children) b.classList.toggle('on', b.dataset.tab === name);
    for (const p of document.querySelectorAll('.panel')) p.classList.toggle('on', p.dataset.panel === name);
    try {
      localStorage.setItem('dfy-tab', name);
    } catch (e) {}
  }
  $('tabs').onclick = (e) => e.target.dataset.tab && showTab(e.target.dataset.tab);
  let lastTab = 'detect';
  try {
    lastTab = localStorage.getItem('dfy-tab') || 'detect';
  } catch (e) {}
  showTab(lastTab);

  function say(t, face) {
    $('say').textContent = t;
    const w = whale();
    if (face && w) {
      w.setAttribute('data-face', face);
      setTimeout(() => w.setAttribute('data-face', 'normal'), 1800);
    }
  }
  $('whale').onclick = () => say(DFY.say('pet'), 'happy');

  const MODE_HINT = {
    mark: '只挂「大肥鱼」标签，赶不赶由你决定。点页面上的鲸鱼娘可以一键响指清场。',
    fold: '自动把大肥鱼装进白饭碗折叠起来，想看可以「偷看一眼」。',
    auto: '每次进入页面，评论区一出现，鲸鱼娘就自动走过去打响指清场；之后翻页加载出来的新大肥鱼也会被直接赶走。随时可以在战报里「全部放回」。',
  };

  const WPN_HINT = {
    random: '每次随机换一种武器；响指清场时偶尔会换成加特林挨个点射。',
    slap: '一巴掌拍飞，或者让它抱着白饭碗哭着跑，再往它离场的地方补一碗。',
    gatling: '后撤一步架起白饭加特林，一梭子米粒子弹。响指清场也会改成加特林扫射。',
    broom: '扫帚连扫三下，把它扫地出门。',
    sock: '扔一只三天没洗的臭袜子，熏晕了再说。',
    rice: '让它自己走，一路朝它扔白饭，最后往它离场的地方再扔一碗。',
  };

  function renderSettings() {
    const s = S.settings;
    for (const id of ['enabled', 'showMascot', 'sound', 'llmEnabled', 'llmAuto', 'llmVision']) $(id).checked = !!s[id];
    $('threshold').value = s.threshold;
    $('th-val').textContent = s.threshold + '%';
    $('th-hint').textContent = `肥鱼浓度 ≥ ${s.threshold}% 判为大肥鱼，${Math.max(25, s.threshold - 25)}% 起算可疑。`;
    $('llmKey').value = s.llmKey || '';
    $('llmModel').value = s.llmModel;
    for (const b of $('mode').children) b.classList.toggle('on', b.dataset.v === s.mode);
    $('mode-hint').textContent = MODE_HINT[s.mode];
    for (const b of $('weapon').children) b.classList.toggle('on', b.dataset.v === (s.weapon || 'random'));
    $('wpn-hint').textContent = WPN_HINT[s.weapon || 'random'];
    document.querySelector('.ds').classList.toggle('off', !s.llmEnabled);
  }

  function renderStats() {
    const st = S.stats;
    const d = new Date();
    const today = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    $('s-today').textContent = st.day === today ? st.today : 0;
    $('s-total').textContent = st.total;
    $('s-chars').textContent = st.chars >= 10000 ? (st.chars / 10000).toFixed(1) + '万' : st.chars;
  }

  function renderLists() {
    const all = Object.entries(S.blocklist).sort((a, b) => (b[1].t || 0) - (a[1].t || 0));
    const q = $('bl-q').value.trim().toLowerCase();
    const bl = q ? all.filter(([mid, v]) => mid.includes(q) || String(v.n || '').toLowerCase().includes(q)) : all;
    $('bl-n').textContent = all.length;
    $('bl').innerHTML = bl.length
      ? bl
          .slice(0, 300)
          .map(
            ([mid, v]) =>
              `<li>${v.a ? `<img src="${esc(v.a.replace(/^http:/, 'https:'))}@52w_52h.webp" referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">` : '<img alt="">'}<a class="n" href="https://space.bilibili.com/${esc(mid)}" target="_blank">${esc(v.n || mid)}</a><span class="d">${v.t ? new Date(v.t).toLocaleDateString() : '导入'}</span><button data-un="${esc(mid)}">放回来</button></li>`
          )
          .join('')
      : `<li class="empty">${q ? '没有找到这条鱼' : '还没有赶走任何大肥鱼'}</li>`;
    const wl = Object.entries(S.whitelist).sort((a, b) => b[1].t - a[1].t);
    $('wl-n').textContent = wl.length;
    $('wl').innerHTML = wl.length
      ? wl.map(([mid, v]) => `<li><a class="n" href="https://space.bilibili.com/${esc(mid)}" target="_blank">${esc(v.n || mid)}</a><button data-unw="${esc(mid)}">移除</button></li>`).join('')
      : '<li class="empty">被误判的人类，可以在评论旁点「是人类」</li>';
  }

  function renderCustom() {
    $('cm-preview').innerHTML = S.customMascot ? `<img src="${S.customMascot}" alt="">` : DFY.mascotSVG({ face: 'normal' });
    $('whale').innerHTML = S.customMascot ? `<img class="custom" src="${S.customMascot}" alt="">` : DFY.mascotSVG({ face: 'happy' });
  }

  function greet() {
    const t = S.stats.total;
    if (!S.settings.enabled) return say('本鲸下班了，打开开关就回来', 'sleepy');
    if (t === 0) return say('还没赶走过大肥鱼，去 B 站逛逛吧', 'normal');
    if (t < 100) return say(`已经赶走 ${t} 条大肥鱼啦`, 'happy');
    return say(`${t} 条！你就是鱼塘管理员`, 'smug');
  }

  function renderSeen() {
    $('seen-n').textContent = Object.keys(S.seen || {}).length;
  }

  /* ---------- 本页状态：直接在面板里指挥鲸鱼娘 ---------- */
  const isPage = document.body.classList.contains('page');
  async function activeTab() {
    try {
      const [t] = await chrome.tabs.query({ active: true, currentWindow: true });
      return t;
    } catch (e) {
      return null;
    }
  }
  const ask = (tabId, msg) =>
    new Promise((ok) => {
      try {
        chrome.tabs.sendMessage(tabId, msg, (r) => {
          void chrome.runtime.lastError;
          ok(r || null);
        });
      } catch (e) {
        ok(null);
      }
    });
  let hereTab = null, hereSig = '';
  async function renderHere() {
    const tab = isPage ? null : await activeTab();
    const st = tab && tab.id != null ? await ask(tab.id, { dfy: 'status' }) : null;
    hereTab = tab;
    let t, s, cls = '', btns = [];
    if (!st) {
      t = isPage ? '设置页' : '这里不是 B 站';
      s = isPage ? '在 B 站页面点插件图标，可以直接指挥本鲸' : '去 B 站视频页或空间主页，本鲸就开始巡逻';
      if (!isPage) btns = [['open', '去 B 站', 'ghost']];
    } else if (!st.enabled) {
      t = '本鲸下班了';
      s = '打开右上角的开关，本鲸马上回来';
    } else if (st.fish) {
      cls = 'fish';
      t = `本页 ${st.fish} 条大肥鱼`;
      s = `巡逻 ${st.accounts} 个账号 · 可疑 ${st.suspect} · 已赶走 ${st.kicked}`;
      btns = [['snap', '响指清场', ''], ['cannon', '泡泡炮', 'ghost']];
    } else if (st.comments && st.accounts) {
      t = '本页很干净';
      s = `巡逻 ${st.accounts} 个账号 · 可疑 ${st.suspect} · 已赶走 ${st.kicked}`;
      btns = [['rescan', '重新巡逻', 'ghost'], ['cannon', '泡泡炮', 'ghost']];
    } else if (st.space) {
      t = '空间主页';
      s = '鉴定报告在页面右上角';
      btns = [['report', '鉴定报告', ''], ['cannon', '泡泡炮', 'ghost']];
    } else {
      t = '还没看到评论区';
      s = '滚到评论区，本鲸就开始巡逻';
      btns = [['cannon', '泡泡炮', 'ghost']];
    }
    const sig = JSON.stringify([t, s, cls, btns]);
    if (sig === hereSig) return;
    hereSig = sig;
    $('here').className = 'here ' + cls;
    $('here-t').textContent = t;
    $('here-s').textContent = s;
    $('here-btns').innerHTML = btns.map(([a, l, c]) => `<button class="btn ${c}" data-here="${a}">${l}</button>`).join('');
  }
  $('here-btns').onclick = async (e) => {
    const a = e.target.closest('[data-here]')?.dataset.here;
    if (!a) return;
    if (a === 'open') return chrome.tabs.create({ url: 'https://www.bilibili.com/' });
    if (!hereTab) return;
    await ask(hereTab.id, { dfy: a });
    window.close();
  };

  /* ---------- 大肥鱼图鉴 ---------- */
  const DEX = [
    ['caught', '被抓包', 'fishCaught'],
    ['scared', '吓到发抖', 'fishPlead'],
    ['defiant', '嘴硬', 'fishSass'],
    ['beg', '求饶', 'fishPlead'],
    ['flee', '抱碗逃跑', 'fishFlee'],
    ['knocked', '被拍飞', 'fishFlee'],
    ['dust', '化成泡沫', 'fishFlee'],
    ['home', '回家吃白饭', 'fishFlee'],
  ];
  $('dex').innerHTML = DEX.map(([p, n]) => `<button data-p="${p}" title="${n}"><img src="../assets/actors/${p}.webp" alt="${n}"><span>${n}</span></button>`).join('');
  $('dex').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const [, n, line] = DEX.find((d) => d[0] === b.dataset.p);
    b.classList.remove('pop');
    void b.offsetWidth;
    b.classList.add('pop');
    say(`${n}：「${DFY.say(line)}」`);
  };

  const ARMORY = [
    ['gatling', '白饭加特林', 'wGatling'],
    ['broom', '扫帚', 'wBroom'],
    ['sock', '臭袜子', 'wSock'],
    ['rice', '白饭', 'wRice'],
  ];
  $('armory').innerHTML = ARMORY.map(([p, n]) => `<button data-p="${p}" title="${n}"><img src="../assets/weapons/${p}.webp" alt="${n}"><span>${n}</span></button>`).join('');
  $('armory').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const [, , line] = ARMORY.find((d) => d[0] === b.dataset.p);
    b.classList.remove('pop');
    void b.offsetWidth;
    b.classList.add('pop');
    say(DFY.say(line), 'angry');
  };

  renderCustom();
  renderSettings();
  renderStats();
  renderLists();
  renderSeen();
  greet();
  renderHere();
  setInterval(renderHere, 1500);

  /* ---------- 设置 ---------- */
  for (const id of ['enabled', 'showMascot', 'sound', 'llmEnabled', 'llmAuto', 'llmVision']) {
    $(id).onchange = () => {
      S.settings[id] = $(id).checked;
      save();
      renderSettings();
      if (id === 'enabled') greet();
      if (id === 'llmEnabled' && S.settings.llmEnabled && !S.settings.llmKey) say('填一下 DeepSeek 密钥吧', 'normal');
    };
  }
  $('threshold').oninput = () => {
    S.settings.threshold = +$('threshold').value;
    renderSettings();
  };
  $('threshold').onchange = save;
  $('mode').onclick = (e) => {
    const v = e.target.dataset.v;
    if (!v) return;
    S.settings.mode = v;
    save();
    renderSettings();
    say(v === 'auto' ? '以后进门先清场！' : v === 'fold' ? '白饭碗准备好了' : '本鲸只负责贴标签', 'smug');
  };
  $('weapon').onclick = (e) => {
    const v = e.target.dataset.v;
    if (!v) return;
    S.settings.weapon = v;
    save();
    renderSettings();
    say({ random: '武器库全开，随机抽一件！', slap: '还是巴掌最顺手', gatling: '白饭加特林已上膛', broom: '扫帚已就位', sock: '袜子……本鲸捏着鼻子拿', rice: '白饭管够！' }[v], 'smug');
  };
  $('llmKey').onchange = () => {
    S.settings.llmKey = $('llmKey').value.trim();
    save();
  };
  $('llmModel').onchange = () => {
    S.settings.llmModel = $('llmModel').value;
    save();
  };
  $('eye').onclick = () => ($('llmKey').type = $('llmKey').type === 'password' ? 'text' : 'password');
  $('test').onclick = async () => {
    const key = $('llmKey').value.trim();
    const r = $('test-res');
    if (!key) {
      r.className = 'err';
      r.textContent = '先填密钥哦';
      return;
    }
    S.settings.llmKey = key;
    save();
    $('test').disabled = true;
    r.className = '';
    r.textContent = '咕噜咕噜，正在连接……';
    whale() && whale().setAttribute('data-face', 'smug');
    const res = await new Promise((ok) => chrome.runtime.sendMessage({ type: 'llm-test', key, model: S.settings.llmModel }, ok));
    $('test').disabled = false;
    if (res && res.ok) {
      r.className = 'ok';
      r.innerHTML = `${DFY.icon('check', 15, 2.8)}${esc(res.hi)}（${(res.ms / 1000).toFixed(1)}s）`;
      say(res.hi, 'happy');
    } else {
      r.className = 'err';
      r.innerHTML = DFY.icon('close', 15, 2.8) + esc((res && res.error) || '服务器繁忙，请稍后再试');
      say('服务器繁忙……（不是本鲸的错）', 'cry');
    }
  };

  /* ---------- 名单 ---------- */
  document.addEventListener('click', async (e) => {
    const un = e.target.dataset && e.target.dataset.un;
    const unw = e.target.dataset && e.target.dataset.unw;
    if (un) {
      delete S.blocklist[un];
      await DFY.store.set({ blocklist: S.blocklist });
      renderLists();
      say('放回去了，希望它学乖点', 'smug');
    }
    if (unw) {
      delete S.whitelist[unw];
      await DFY.store.set({ whitelist: S.whitelist });
      renderLists();
    }
  });
  /** 危险操作点两下才生效 */
  function confirm2(btn, fn) {
    const label = btn.textContent;
    btn.onclick = async () => {
      if (!btn.classList.contains('armed')) {
        btn.classList.add('armed');
        btn.textContent = '再点一下确认';
        clearTimeout(btn._t);
        btn._t = setTimeout(() => {
          btn.classList.remove('armed');
          btn.textContent = label;
        }, 2600);
        return;
      }
      clearTimeout(btn._t);
      btn.classList.remove('armed');
      btn.textContent = label;
      await fn();
    };
  }
  confirm2($('bl-clear'), async () => {
    S.blocklist = {};
    await DFY.store.set({ blocklist: {} });
    renderLists();
    say('全部放回鱼塘了', 'cry');
  });
  confirm2($('wl-clear'), async () => {
    S.whitelist = {};
    await DFY.store.set({ whitelist: {} });
    renderLists();
  });
  confirm2($('seen-clear'), async () => {
    S.seen = {};
    await DFY.store.set({ seen: {}, llmCache: {} });
    renderSeen();
    say('前科和精判缓存都忘光了', 'sleepy');
  });
  $('bl-q').oninput = renderLists;

  /* ---------- 名单导入 / 导出（可以和朋友分享大肥鱼名单） ---------- */
  $('io-export').onclick = () => {
    const data = { app: 'dafeiyu-cleaner', v: 1, exported: new Date().toISOString(), blocklist: S.blocklist, whitelist: S.whitelist };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `大肥鱼名单-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    say(`导出了 ${Object.keys(S.blocklist).length} 条大肥鱼`, 'smug');
  };
  /** 支持本插件导出的格式，也支持 {mid: 名字} 或 [mid, ...] 这种简单名单 */
  function normalizeList(x) {
    const out = {};
    const put = (mid, v) => {
      mid = String(mid || '').trim();
      if (!/^\d{1,20}$/.test(mid)) return;
      out[mid] = typeof v === 'object' && v ? { n: String(v.n || v.name || v.uname || ''), a: String(v.a || v.avatar || ''), t: +v.t || Date.now() } : { n: typeof v === 'string' ? v : '', t: Date.now() };
    };
    if (Array.isArray(x)) for (const it of x) typeof it === 'object' && it ? put(it.mid || it.id, it) : put(it, '');
    else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) put(k, v);
    return out;
  }
  $('io-import').onchange = async () => {
    const f = $('io-import').files[0];
    $('io-import').value = '';
    if (!f) return;
    let j;
    try {
      j = JSON.parse(await f.text());
    } catch (e) {
      return say('这个文件本鲸看不懂（不是 JSON）', 'cry');
    }
    const bl = normalizeList(j && (j.blocklist || (j.whitelist ? null : j)));
    const wl = normalizeList(j && j.whitelist);
    let nb = 0, nw = 0;
    for (const [mid, v] of Object.entries(wl)) if (!S.whitelist[mid]) (S.whitelist[mid] = v), nw++;
    for (const [mid, v] of Object.entries(bl)) if (!S.blocklist[mid] && !S.whitelist[mid]) (S.blocklist[mid] = v), nb++;
    await DFY.store.set({ blocklist: S.blocklist, whitelist: S.whitelist });
    renderLists();
    say(nb || nw ? `导入了 ${nb} 条大肥鱼${nw ? `、${nw} 位人类` : ''}` : '都是老面孔，没有新鱼', nb ? 'smug' : 'normal');
  };

  /* ---------- 自定义形象 ---------- */
  $('cm-file').onchange = () => {
    const f = $('cm-file').files[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) return say('图片太大啦，3MB 以内哦', 'shock');
    const rd = new FileReader();
    rd.onload = async () => {
      S.customMascot = rd.result;
      await DFY.store.set({ customMascot: rd.result });
      renderCustom();
      say('新形象已换上，去 B 站看看', 'happy');
    };
    rd.readAsDataURL(f);
  };
  $('cm-reset').onclick = async () => {
    S.customMascot = '';
    await DFY.store.set({ customMascot: '' });
    renderCustom();
    say('欢迎回来，原装本鲸', 'happy');
  };

  DFY.store.onChange((ch) => {
    for (const k of ['stats', 'blocklist', 'whitelist']) if (ch[k]) S[k] = Object.assign({}, DFY.DEFAULTS[k], ch[k]);
    if ('seen' in ch) S.seen = ch.seen || {};
    if (ch.stats) renderStats();
    if (ch.blocklist || ch.whitelist) renderLists();
    if ('seen' in ch) renderSeen();
  });
})();
