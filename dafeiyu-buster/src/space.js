/* 空间主页鉴定：资料 + 投稿节奏 + 头像 +（可选）DeepSeek 精判，出一份带印章的鉴定报告 */
(function () {
  const DFY = (globalThis.DFY = globalThis.DFY || {});
  const S = (DFY.space = {});
  const esc = (s) => DFY.esc(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  S.midFromUrl = function (u) {
    try {
      const url = new URL(u || location.href);
      if (url.hostname !== 'space.bilibili.com') return '';
      const m = url.pathname.match(/\/(\d{2,})(?:\/|$)/);
      return m ? m[1] : '';
    } catch (e) {
      return '';
    }
  };

  async function getJSON(url) {
    try {
      const r = await fetch(url, { credentials: 'include' });
      return await r.json();
    } catch (e) {
      return null;
    }
  }

  function daysAgo(t) {
    const d = Math.floor((Date.now() - t) / 86400000);
    return d <= 0 ? '今天' : d === 1 ? '昨天' : `${d} 天前`;
  }

  function fmtNum(n) {
    n = +n || 0;
    return n >= 10000 ? (n / 10000).toFixed(1) + '万' : String(n);
  }

  /** 拉取资料并做离线鉴定 */
  S.inspect = async function (mid) {
    const [card, arc] = await Promise.all([
      getJSON(`https://api.bilibili.com/x/web-interface/card?mid=${mid}&photo=false`),
      getJSON(`https://api.bilibili.com/x/series/recArchivesByKeywords?mid=${mid}&keywords=&ps=30&pn=1&orderby=pubdate`),
    ]);
    const c = card && card.code === 0 && card.data ? card.data.card : null;
    if (!c) return null;
    const prof = {
      mid,
      uname: c.name,
      avatar: c.face,
      sign: c.sign || '',
      level: (c.level_info && c.level_info.current_level) || 0,
      verify: c.official_verify ? c.official_verify.type : -1,
      verifyDesc: (c.official_verify && c.official_verify.desc) || '',
      fans: card.data.follower || c.fans || 0,
      archives: card.data.archive_count || 0,
      videos: ((arc && arc.code === 0 && arc.data && arc.data.archives) || []).map((v) => ({ title: v.title, t: v.pubdate || v.ctime })),
    };
    prof.avatarBlue = await DFY.avatarBlue(prof.avatar);
    const base = DFY.scoreAccount(prof);
    let s = base.score;
    const reasons = base.reasons.slice();
    const now = Date.now() / 1000;
    const recent = prof.videos.filter((v) => now - v.t < 14 * 86400);
    if (recent.length) {
      const first = Math.min(...recent.map((v) => v.t));
      const days = Math.max(1, (now - first) / 86400);
      const perDay = recent.length / days;
      if (perDay >= 3) {
        s += 25;
        reasons.push({ w: 25, why: `日更 ${perDay.toFixed(1)} 条，比本鲸吃饭还勤` });
      } else if (perDay >= 0.9 && recent.length >= 4) {
        s += 12;
        reasons.push({ w: 12, why: `近两周 ${recent.length} 条，几乎天天更` });
      }
    }
    if (prof.videos.length >= 3) {
      const aiTitles = prof.videos.filter((v) => /deep\s*seek|鲸鱼娘|大肥鱼|白饭|\bAI\b|AIGC|大模型|本鲸/i.test(v.title)).length;
      const ratio = aiTitles / prof.videos.length;
      if (ratio >= 0.4) {
        s += 12;
        reasons.push({ w: 12, why: `${Math.round(ratio * 100)}% 的投稿都在聊鲸鱼和 AI` });
      }
      const series = prof.videos.filter((v) => /【?Day\s*\d+|第\s*\d+\s*天|\bD\d+\b/i.test(v.title)).length;
      if (series >= 3) {
        s += 8;
        reasons.push({ w: 8, why: '「Day N」流水线日更' });
      }
    }
    if (prof.level <= 2 && prof.fans >= 10000) {
      s += 6;
      reasons.push({ w: 6, why: `Lv${prof.level} 却有 ${fmtNum(prof.fans)} 粉，涨粉像开了挂` });
    }
    if (prof.verify === 0 || prof.verify === 1) reasons.push({ w: 0, why: `认证：${prof.verifyDesc}` });
    const score = Math.max(0, Math.min(99, Math.round(s)));
    return { prof, score, offline: score, reasons: reasons.filter((r) => r.w !== 0 || r.why.startsWith('认证')).sort((a, b) => b.w - a.w) };
  };

  /* ---------------- 页面上的效果：印章盖在名字旁、大肥鱼趴在头像上 ---------------- */
  const page = {
    layer: null,
    fish: null,
    els: [],
    ensure() {
      if (!document.getElementById('dfy-page-style')) {
        const st = document.createElement('style');
        st.id = 'dfy-page-style';
        st.textContent = `${DFY.actors.CSS}
${DFY.mascotCSS}
.dfy-p-zoom{transition:transform .45s cubic-bezier(.3,1.5,.5,1)!important;transform:scale(1.7)!important;z-index:20!important;position:relative}
.dfy-p-bubble{position:absolute;white-space:nowrap;background:#fffaf2;border:2.5px solid #151a3d;border-radius:14px;padding:6px 14px;font:700 15px "PingFang SC","Microsoft YaHei",sans-serif;color:#151a3d;box-shadow:3px 3px 0 rgba(21,26,61,.3);pointer-events:none;z-index:21}
.dfy-p-bubble:after{content:"";position:absolute;left:-9px;bottom:10px;width:14px;height:14px;background:#fffaf2;border-left:2.5px solid #151a3d;border-bottom:2.5px solid #151a3d;transform:rotate(45deg)}
@font-face{font-family:"DFY Display";src:url("${typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id ? chrome.runtime.getURL('assets/dfy-display.woff2') : ''}") format("woff2")}
#dfy-page-layer{position:absolute;left:0;top:0;width:0;height:0;z-index:1000;pointer-events:none}
#dfy-page-layer .dfy-actor{position:absolute}
.dfy-p-stamp{position:absolute;white-space:nowrap;padding:2px 12px;border:4px double currentColor;border-radius:9px;font:400 26px "DFY Display","PingFang SC",sans-serif;letter-spacing:4px;transform:rotate(-10deg);background:rgba(255,255,255,.7);pointer-events:none}
.dfy-p-stamp.fish{color:#e0264f}.dfy-p-stamp.human{color:#139a63}.dfy-p-stamp.suspect{color:#d98200}
.dfy-p-tape{position:absolute;white-space:nowrap;background:repeating-linear-gradient(-45deg,#151a3d 0 10px,#2546b8 10px 20px);color:#fffaf2;font:400 15px "DFY Display","PingFang SC",sans-serif;letter-spacing:3px;padding:4px 18px;border:2px solid #fffaf2;box-shadow:3px 3px 0 rgba(21,26,61,.35);transform:rotate(-4deg);pointer-events:none}
.dfy-p-gray{filter:grayscale(1) brightness(.85);transition:filter .6s}`;
        document.head.appendChild(st);
      }
      if (!this.layer || !this.layer.isConnected) {
        this.layer = document.createElement('div');
        this.layer.id = 'dfy-page-layer';
        document.body.appendChild(this.layer);
      }
    },
    avatar: () => document.querySelector('.upinfo-avatar .b-avatar, .upinfo-avatar img, .upinfo-avatar'),
    nick: () => document.querySelector('.upinfo .nickname, .nickname'),
    abs(el) {
      const r = el.getBoundingClientRect();
      return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height, r };
    },
    clear() {
      for (const e of this.els) e.remove();
      this.els = [];
      if (this.fish) this.fish.remove();
      this.fish = null;
      const av = this.avatar();
      av && av.classList.remove('dfy-p-gray');
      document.querySelectorAll('.dfy-p-zoom').forEach((e) => e.classList.remove('dfy-p-zoom'));
    },
    put(cls, html, x, y) {
      const d = document.createElement('div');
      d.className = cls;
      d.innerHTML = html;
      Object.assign(d.style, { left: x + 'px', top: y + 'px' });
      this.layer.appendChild(d);
      this.els.push(d);
      return d;
    },
    async apply(r, opt = {}) {
      const av = this.avatar(), nk = this.nick();
      if (!av || !nk) return;
      this.ensure();
      this.clear();
      const lv = levelInfo(r.score).lv;
      const blocked = DFY.lists.block[r.prof.mid];
      const a = this.abs(av), n = this.abs(nk);
      const stamp = this.put(`dfy-p-stamp ${blocked ? 'fish' : lv}`, blocked ? '已遣返' : levelInfo(r.score).stamp, n.x + Math.min(n.w, 300) + 18, n.y - 8);
      if (blocked) return this.sentHome(r, false);
      if (opt.slam !== false) {
        stamp.animate([{ transform: 'rotate(-10deg) scale(3.4)', opacity: 0 }, { opacity: 1, offset: 0.6 }, { transform: 'rotate(-10deg) scale(1)', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.2,1.6,.4,1)' });
        await sleep(400);
        const hd = document.querySelector('.header-upinfo, .upinfo');
        hd && hd.animate([0, 1, 2, 3, 4, 5].map((i) => ({ transform: i === 5 ? 'none' : `translate(${(Math.random() - 0.5) * 10}px,${(Math.random() - 0.5) * 6}px)` })), { duration: 320 });
        // 投稿卡片被震得跳一下
        [...document.querySelectorAll('.bili-video-card, .items__item')].slice(0, 12).forEach((c, i) =>
          c.animate([{ transform: 'none' }, { transform: `translateY(-10px) rotate(${i % 2 ? 2 : -2}deg)` }, { transform: 'none' }], { duration: 380, delay: i * 45, easing: 'ease-out' })
        );
        if (lv !== 'human') this.speak(lv === 'fish' ? (Math.random() < 0.5 ? '被、被发现了……' : '我爸爸是梁圣！你敢动我？') : '我…我是人类哦？', 4200);
        if (lv === 'human') DFY.fx.emit('confetti', n.r.right + 80, n.r.top, 40);
      }
    },
    /** 头像临时放大，旁边冒一个对话气泡；说完过几秒再恢复 */
    speak(text, ms = 4200) {
      const av = document.querySelector('.upinfo-avatar') || this.avatar();
      if (!av) return;
      av.classList.add('dfy-p-zoom');
      const r = this.abs(av);
      const b = this.put('dfy-p-bubble', DFY.esc(text), r.x + r.w * 1.45 + 10, r.y - r.h * 0.55);
      b.animate([{ transform: 'scale(.3)', transformOrigin: 'left bottom', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: 360, easing: 'ease-out' });
      clearTimeout(this._speakT);
      this._speakT = setTimeout(() => {
        b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => b.remove();
        setTimeout(() => av.classList.remove('dfy-p-zoom'), 1500);
      }, ms);
    },
    /** 头像变灰 + 贴上「已遣返」胶带，旁边坐着一只在家吃白饭的大肥鱼 */
    sentHome(r, animate = true) {
      const av = this.avatar(), nk = this.nick();
      if (!av || !nk) return;
      av.classList.add('dfy-p-gray');
      const a = this.abs(av);
      const t = this.put('dfy-p-tape', '已遣返 · 回家吃白饭中', a.x - 20, a.y + a.h - 10);
      if (animate) t.animate([{ transform: 'rotate(-4deg) scaleX(0)', transformOrigin: 'left' }, { transform: 'rotate(-4deg) scaleX(1)', transformOrigin: 'left' }], { duration: 380, easing: 'ease-out' });
      if (DFY.actors.src('home')) {
        const size = Math.max(64, Math.min(96, a.h * 1.1));
        const home = DFY.actors.spawnFish(a.x - size * 0.4, a.y + a.h * 0.35, { mood: 'home', size, parent: this.layer, position: 'absolute' });
        home.title = '在家吃白饭中';
        this.els.push(home);
        if (!animate) home.getAnimations().forEach((x) => x.finish());
      }
    },
    /** 鲸鱼娘走到头像右边，把躲在头像里的大肥鱼赶回家 */
    async kick(r) {
      const av = this.avatar();
      const A = DFY.actors;
      if (!av) return;
      this.ensure();
      clearTimeout(this._speakT);
      document.querySelectorAll('.dfy-p-bubble').forEach((e) => e.remove());
      document.querySelectorAll('.dfy-p-zoom').forEach((e) => e.classList.remove('dfy-p-zoom'));
      av.scrollIntoView({ block: 'center', behavior: 'smooth' });
      await sleep(350);
      DFY.ui.face('angry');
      const ar0 = av.getBoundingClientRect();
      await A.approachPoint(ar0.right, ar0.top + ar0.height / 2);
      const ar = av.getBoundingClientRect();
      const fx = A.spawnFish(ar.left + ar.width / 2, ar.top + ar.height / 2 + 6, { mood: 'caught', size: 92 });
      A.alert(fx, '!?');
      A.say(fx, DFY.say('fishCaught'), 1400);
      DFY.sfx.bloop();
      await sleep(1150);
      A.react(fx);
      await sleep(1300);
      await DFY.weapons.run(DFY.weapons.pick(), fx, {
        onHit: () => {
          for (const e of this.els) if (e.classList.contains('dfy-p-stamp')) e.textContent = '已遣返';
          this.sentHome(r, true);
        },
      });
      DFY.ui.face('happy', 1600);
      await A.goHome();
    },
  };
  S.page = page;

  /* ---------------- 报告卡片 ---------------- */
  let card = null, pill = null, current = null, running = false;

  function levelInfo(score) {
    const lv = DFY.levelOf(score, DFY.settings.threshold);
    return {
      lv,
      title: lv === 'fish' ? '通缉 · 野生大肥鱼' : lv === 'suspect' ? '观察 · 可疑鱼类' : '认证 · 纯种人类',
      stamp: lv === 'fish' ? '确诊大肥鱼' : lv === 'suspect' ? '可疑鱼类' : '纯种人类',
    };
  }

  function render(r, state = {}) {
    const p = r.prof;
    const info = levelInfo(r.score);
    const blocked = DFY.lists.block[p.mid];
    const white = DFY.lists.white[p.mid];
    const ev = r.reasons
      .slice(0, 8)
      .map((x) => `<li><span>${esc(x.why)}</span><b class="${x.w < 0 ? 'neg' : ''}">${x.w ? (x.w > 0 ? '+' : '') + x.w : ''}</b></li>`)
      .join('');
    const canLLM = DFY.settings.llmEnabled && DFY.settings.llmKey && DFY.canLLM;
    const llm = r.llm
      ? `<div class="llm"><div class="t">${DFY.icon('brain', 14)}DeepSeek 判词 · AI 概率 ${r.llm.ai}%</div>${esc(r.llm.roast || r.llm.reason)}</div>`
      : state.llmLoading
        ? `<div class="llm"><div class="t">${DFY.icon('brain', 14)}DeepSeek 正在深度思考……</div>咕噜咕噜，本鲸在翻 TA 的老底</div>`
        : '';
    const btns = [];
    if (blocked) btns.push('<button class="btn ghost" data-a="unblock">' + DFY.icon('undo') + '放它回来</button>');
    else if (info.lv !== 'human' || state.forceKick) btns.push('<button class="btn danger" data-a="block">' + DFY.icon('bowl') + '赶回家吃白饭</button>');
    if (canLLM && !r.llm && !state.llmLoading) btns.push('<button class="btn primary" data-a="llm">' + DFY.icon('brain') + 'DeepSeek 精判</button>');
    if (!canLLM) btns.push('<button class="btn ghost" data-a="cfg">' + DFY.icon('brain') + '配置精判</button>');
    if (!white && info.lv !== 'human') btns.push('<button class="btn ghost" data-a="white">' + DFY.icon('check') + '是人类</button>');
    if (info.lv === 'human' && !blocked) btns.push('<button class="btn ghost" data-a="block">' + DFY.icon('fish') + '其实是鱼</button>');
    return `
<div class="top"><div><b>${DFY.icon('search', 18, 2.4)}大肥鱼鉴定报告</b><small>CASE FILE No.${esc(p.mid)} · ${info.title}</small></div><div style="display:flex;gap:6px"><button data-a="min" title="收起">${DFY.icon('minus', 14, 2.6)}</button><button data-a="close" title="关闭">${DFY.icon('close', 14, 2.6)}</button></div></div>
<div class="body">
  ${blocked ? `<div class="notice">${DFY.icon('bowl', 16)}${daysAgo(blocked.t)}被你赶回家吃白饭了，TA 的评论会自动折叠</div>` : ''}
  <div class="who"><div class="polaroid"><img class="ava" src="${esc((p.avatar || '').replace(/^http:/, 'https:'))}@132w_132h.webp" referrerpolicy="no-referrer"></div><div><div class="name">${esc(p.uname)}</div><div class="meta">Lv${p.level} · ${fmtNum(p.fans)} 粉丝 · 投稿 ${p.archives}</div><div class="meta" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.sign || '这个人很懒，什么都没写')}</div><div class="stamp ${blocked ? 'fish' : info.lv} ${state.slam ? 'slam' : ''}">${blocked ? '已遣返' : info.stamp}</div></div></div>
  <div class="gauge"><i style="width:${state.slam ? 0 : r.score}%"></i><span>肥鱼浓度 ${r.score}%</span></div>
  <ul class="ev">${ev || '<li><span>没有发现 AI 特征</span></li>'}</ul>
  ${llm}
  <div class="btns">${btns.join('')}</div>
</div>`;
  }

  function mountCard(r, state) {
    if (!card) {
      card = document.createElement('div');
      card.className = 'verdict';
      DFY.ui.root.querySelector('.wrap').appendChild(card);
      card.addEventListener('click', onClick);
    }
    card.className = 'verdict ' + levelInfo(r.score).lv;
    card.innerHTML = render(r, state);
    if (state && state.slam) {
      requestAnimationFrame(() => requestAnimationFrame(() => (card.querySelector('.gauge i').style.width = r.score + '%')));
    }
  }

  function showPill(r) {
    if (!pill) {
      pill = document.createElement('button');
      pill.className = 'btn primary pill';
      DFY.ui.root.querySelector('.wrap').appendChild(pill);
      pill.onclick = () => {
        pill.style.display = 'none';
        card.style.display = '';
      };
    }
    const info = levelInfo(r.score);
    pill.innerHTML = `${DFY.icon('search', 16, 2.4)}${info.stamp} · ${r.score}%`;
    pill.style.display = '';
  }

  async function onClick(e) {
    const a = e.target.closest('[data-a]');
    if (!a || !current) return;
    const act = a.dataset.a;
    const p = current.prof;
    if (act === 'close') {
      card.style.display = 'none';
      showPill(current);
    } else if (act === 'min') {
      card.style.display = 'none';
      showPill(current);
    } else if (act === 'block') {
      await DFY.store.patch('blocklist', (b) => {
        b[p.mid] = { n: p.uname, a: p.avatar, t: Date.now(), s: current.score };
      });
      await DFY.store.patch('whitelist', (w) => {
        delete w[p.mid];
      });
      DFY.lists.block[p.mid] = { t: Date.now() };
      delete DFY.lists.white[p.mid];
      await DFY.recordKick(1, 0);
      current.score = Math.max(current.score, 99);
      mountCard(current, {});
      await page.kick(current);
      DFY.ui.toast({ icon: 'bowl', t1: 'BLOCKLIST · 已加入遣返名单', t2: `@${p.uname}`, t3: 'TA 的评论以后会被自动装进白饭碗' });
    } else if (act === 'unblock') {
      await DFY.store.patch('blocklist', (b) => {
        delete b[p.mid];
      });
      delete DFY.lists.block[p.mid];
      DFY.ui.say('好吧，放你回来，下次别再刷屏了', { face: 'smug' });
      mountCard(current, {});
      page.apply(current, { slam: false });
    } else if (act === 'white') {
      await DFY.store.patch('whitelist', (w) => {
        w[p.mid] = { n: p.uname, t: Date.now() };
      });
      DFY.lists.white[p.mid] = { n: p.uname };
      current.score = 0;
      current.reasons.unshift({ w: -99, why: '你说这位是人类' });
      DFY.ui.say(DFY.say('whitelist'), { face: 'cry' });
      mountCard(current, { slam: true });
      page.apply(current);
    } else if (act === 'llm') {
      S.llm(current);
    } else if (act === 'cfg') {
      DFY.callBg({ type: 'open-options' });
    }
  }

  S.llm = async function (r) {
    mountCard(r, { llmLoading: true });
    const th = DFY.ui.think(`嗯，用户想知道「${r.prof.uname}」是不是大肥鱼，我先看看 TA 的签名和投稿……`);
    const res = await DFY.callBg({
      type: 'llm-space',
      model: DFY.settings.llmModel,
      vision: DFY.settings.llmVision,
      profile: {
        name: r.prof.uname,
        level: r.prof.level,
        sign: r.prof.sign,
        fans: r.prof.fans,
        archives: r.prof.archives,
        verify: r.prof.verifyDesc,
        recentTitles: r.prof.videos.slice(0, 12).map((v) => v.title),
        avatar: r.prof.avatar,
      },
    });
    if (!res || !res.ok) {
      th.close();
      DFY.ui.say(DFY.say('llmBusy'), { face: 'cry', ms: 3500 });
      mountCard(r, {});
      return;
    }
    th.update(res.reasoning || '嗯……');
    th.done((res.ms / 1000).toFixed(1), 3200);
    const j = res.result || {};
    r.llm = { ai: Math.max(0, Math.min(100, +j.ai || 0)), reason: j.reason || '', roast: j.roast || '' };
    if (j.avatar != null) r.reasons.push({ w: 0, why: `DeepSeek 看了头像：${j.avatar}` });
    const old = levelInfo(r.score).lv;
    r.score = DFY.lists.white[r.prof.mid] ? 0 : Math.round(r.offline * 0.3 + r.llm.ai * 0.7);
    DFY.bump('llmCalls');
    await sleep(600);
    mountCard(r, { slam: old !== levelInfo(r.score).lv });
    if (old !== levelInfo(r.score).lv) {
      slamFx(r);
      page.apply(r);
    }
  };

  function slamFx(r) {
    const lv = levelInfo(r.score).lv;
    setTimeout(() => {
      DFY.sfx.boom();
      DFY.fx.shake(10);
      const st = card && card.querySelector('.stamp');
      if (st) {
        const b = st.getBoundingClientRect();
        DFY.fx.emit(lv === 'human' ? 'confetti' : 'star', b.left + b.width / 2, b.top + b.height / 2, lv === 'human' ? 40 : 18);
      }
      DFY.ui.say(DFY.say(lv === 'fish' ? 'spaceFish' : lv === 'suspect' ? 'spaceSuspect' : 'spaceHuman'), { face: lv === 'fish' ? 'angry' : lv === 'suspect' ? 'shock' : 'happy', ms: 3200 });
    }, 120);
  }

  S.run = async function (force) {
    const mid = S.midFromUrl();
    if (!mid || running) return;
    if (!force && current && current.prof.mid === mid) return;
    running = true;
    try {
      if (card) {
        card.remove();
        card = null;
      }
      page.clear();
      if (pill) pill.style.display = 'none';
      const th = DFY.ui.think('嗯，用户打开了一个空间主页，我需要鉴定一下这位是不是大肥鱼……');
      const t0 = performance.now();
      const r = await S.inspect(mid);
      if (!r) {
        th.close();
        running = false;
        return;
      }
      if (DFY.lists.white[mid]) {
        r.score = 0;
        r.reasons.unshift({ w: -99, why: '你说过这位是人类' });
      }
      th.update(`嗯，用户打开了「${r.prof.uname}」的空间。签名、等级、头像、投稿节奏我都看了一遍……${r.reasons.slice(0, 3).map((x) => x.why).join('，')}。`);
      th.done(((performance.now() - t0) / 1000 + 0.6).toFixed(1), 2200);
      await sleep(900);
      current = r;
      mountCard(r, { slam: true });
      slamFx(r);
      page.apply(r);
      DFY.bump('verdicts');
      if (DFY.lists.block[mid]) setTimeout(() => DFY.ui.say(DFY.say('spaceBlocked'), { face: 'smug' }), 3400);
      const s = DFY.settings;
      if (s.llmEnabled && s.llmKey && s.llmAuto && DFY.canLLM && r.score >= 20 && r.score < 85 && !DFY.lists.white[mid]) setTimeout(() => S.llm(r), 2600);
    } finally {
      running = false;
    }
  };

  S.show = function () {
    if (card) {
      card.style.display = '';
      if (pill) pill.style.display = 'none';
    } else S.run(true);
  };
})();
