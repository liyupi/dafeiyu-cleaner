/* 本地存储：设置、统计、遣返名单、白名单（全部只存在本机） */
(function () {
  const DFY = (globalThis.DFY = globalThis.DFY || {});

  DFY.DEFAULTS = {
    settings: {
      enabled: true,
      mode: 'mark', // mark 只标记 | fold 折叠进白饭碗 | auto 自动赶走
      weapon: 'random', // 赶走时用的武器：random | slap | gatling | broom | sock | rice
      threshold: 60, // 大于等于此分数判定为大肥鱼
      quiet: false, // 极简模式：不出场、不出声、不播动画，大肥鱼评论直接隐藏
      hideAtFish: false, // 连 @ 大肥鱼的评论一起隐藏
      showMascot: true,
      mascotSize: 100, // 页面上鲸鱼娘的大小（%）
      sound: true,
      llmEnabled: false,
      llmKey: '',
      llmModel: 'deepseek-flash',
      llmAuto: true, // 自动精判可疑账号
      llmVision: true, // 让 DeepSeek 看头像
    },
    stats: { total: 0, today: 0, day: '', chars: 0, snaps: 0, bubbles: 0, pets: 0, verdicts: 0, llmCalls: 0 },
    blocklist: {}, // mid -> {n, a, t, s}
    whitelist: {}, // mid -> {n, t}
    seen: {}, // 前科记忆：mid -> {n, c: 被认出的页面数, k: 最近几个页面, t}
    llmCache: {}, // DeepSeek 精判缓存：mid -> {ai, r, t}
    mascotPos: null,
    customMascot: '', // 用户自己上传的形象（dataURL，只存本机）
  };

  const hasChrome = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  const LS = 'dfy-store-';

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  DFY.store = {
    async get(keys) {
      const list = Array.isArray(keys) ? keys : [keys];
      let raw = {};
      if (hasChrome) raw = await chrome.storage.local.get(list);
      else for (const k of list) {
        try {
          const v = localStorage.getItem(LS + k);
          if (v != null) raw[k] = JSON.parse(v);
        } catch (e) {}
      }
      const out = {};
      for (const k of list) {
        const def = DFY.DEFAULTS[k];
        const v = raw[k];
        out[k] = def && typeof def === 'object' && !Array.isArray(def) && v && typeof v === 'object' ? Object.assign(clone(def), v) : v != null ? v : clone(def);
      }
      return Array.isArray(keys) ? out : out[keys];
    },
    async set(obj) {
      if (hasChrome) return chrome.storage.local.set(obj);
      for (const k in obj) {
        try {
          localStorage.setItem(LS + k, JSON.stringify(obj[k]));
        } catch (e) {}
      }
      DFY.store._emit(obj);
    },
    async patch(key, fn) {
      const v = await DFY.store.get(key);
      const nv = fn(v) || v;
      await DFY.store.set({ [key]: nv });
      return nv;
    },
    _subs: [],
    onChange(fn) {
      DFY.store._subs.push(fn);
    },
    _emit(changes) {
      for (const fn of DFY.store._subs) fn(changes);
    },
  };

  if (hasChrome && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      const obj = {};
      for (const k in changes) obj[k] = changes[k].newValue;
      DFY.store._emit(obj);
    });
  }

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  /** 记一笔赶走的大肥鱼 */
  DFY.recordKick = async function (count, chars) {
    const stats = await DFY.store.patch('stats', (s) => {
      if (s.day !== today()) {
        s.day = today();
        s.today = 0;
      }
      s.total = Math.max(0, s.total + count);
      s.today = Math.max(0, s.today + count);
      s.chars = Math.max(0, s.chars + (chars || 0));
    });
    return stats;
  };

  DFY.bump = async function (field, n = 1) {
    return DFY.store.patch('stats', (s) => {
      s[field] = (s[field] || 0) + n;
    });
  };

  /*
   * 跨页面记忆：同一账号在多个视频下都被认出是大肥鱼 → 下次直接加分；DeepSeek 精判结果缓存 7 天，省 Token。
   * 多个标签页同时写时，只把本页新增的条目合并进去，不整体覆盖。
   */
  const SEEN_MAX = 6000, LLM_MAX = 3000, LLM_TTL = 7 * 86400000;
  const prune = (obj, max) => {
    const ks = Object.keys(obj);
    if (ks.length <= max) return obj;
    ks.sort((a, b) => obj[b].t - obj[a].t);
    for (const k of ks.slice(max)) delete obj[k];
    return obj;
  };
  DFY.memory = {
    seen: {},
    llm: {},
    pending: { seen: {}, llm: {} },
    timer: 0,
    async load() {
      const r = await DFY.store.get(['seen', 'llmCache']);
      this.seen = r.seen || {};
      this.llm = r.llmCache || {};
    },
    page() {
      const m = location.pathname.match(/BV\w{10}|av\d+|ep\d+|ss\d+|\/(\d{3,})/i);
      return m ? m[1] || m[0] : location.pathname;
    },
    /** 在当前页面以外，被认出是大肥鱼的页面数 */
    prior(mid) {
      const s = this.seen[mid];
      if (!s) return 0;
      return Math.max(0, s.c - (s.k.includes(this.page()) ? 1 : 0));
    },
    mark(mid, name) {
      const pg = this.page();
      const s = this.seen[mid] || { n: name, c: 0, k: [], t: 0 };
      if (s.k.includes(pg)) return;
      s.c++;
      s.k = [pg, ...s.k].slice(0, 6);
      s.n = name || s.n;
      s.t = Date.now();
      this.seen[mid] = s;
      this.pending.seen[mid] = s;
      this.save();
    },
    llmGet(mid) {
      const c = this.llm[mid];
      return c && Date.now() - c.t < LLM_TTL ? c : null;
    },
    llmPut(mid, ai, r) {
      const c = { ai, r: String(r || '').slice(0, 60), t: Date.now() };
      this.llm[mid] = c;
      this.pending.llm[mid] = c;
      this.save();
    },
    save() {
      clearTimeout(this.timer);
      this.timer = setTimeout(async () => {
        const { seen: ps, llm: pl } = this.pending;
        this.pending = { seen: {}, llm: {} };
        const cur = await DFY.store.get(['seen', 'llmCache']);
        for (const [mid, s] of Object.entries(ps)) {
          const old = cur.seen[mid];
          if (old) {
            const k = [...new Set([...s.k, ...old.k])].slice(0, 6);
            s.c = Math.max(s.c, old.c, k.length);
            s.k = k;
          }
          cur.seen[mid] = s;
        }
        Object.assign(cur.llmCache, pl);
        for (const [k, v] of Object.entries(cur.llmCache)) if (Date.now() - v.t > LLM_TTL) delete cur.llmCache[k];
        this.seen = prune(cur.seen, SEEN_MAX);
        this.llm = prune(cur.llmCache, LLM_MAX);
        await DFY.store.set({ seen: this.seen, llmCache: this.llm });
      }, 2000);
    },
  };

})();
