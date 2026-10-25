/* 角色动作：被赶走的大肥鱼（AI 生成的动作图）+ 鲸鱼娘走位 */
(function () {
  const DFY = (globalThis.DFY = globalThis.DFY || {});
  const A = (DFY.actors = {});
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const INK = '#151a3d';

  /*
   * 被赶走的「大肥鱼」：一只迷你 DeepSeek 娘，每个动作一张图（assets/actors/*.webp）。
   * caught 被抓包 / scared 吓到发抖 / defiant 嘴硬 / beg 求饶 / flee 抱着白饭碗哭着跑 / knocked 被拍飞 / dust 响指化灰 / home 回家吃白饭
   */
  const POSES = ['caught', 'scared', 'defiant', 'beg', 'flee', 'knocked', 'dust', 'home'];
  const hasRuntime = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  A.src = (pose) => (hasRuntime ? chrome.runtime.getURL(`assets/actors/${pose}.webp`) : '');
  let preloaded = false;
  A.preload = function () {
    if (preloaded || !hasRuntime) return;
    preloaded = true;
    for (const p of POSES) new Image().src = A.src(p);
  };

  A.CSS = `
.dfy-actor{position:fixed;width:100px;height:100px;margin:-73px 0 0 -50px;pointer-events:none;z-index:2;filter:drop-shadow(2px 3px 0 rgba(21,26,61,.28))}
.dfy-actor .girl{position:absolute;inset:0;transform-origin:50% 90%}
.dfy-actor .girl img,.dfy-actor .girl svg{width:100%;height:100%;display:block;object-fit:contain;overflow:visible;-webkit-user-drag:none}
.dfy-actor[data-mood="scared"] .girl{animation:dfy-atremble .09s linear infinite}
.dfy-actor[data-mood="caught"] .girl{animation:dfy-asway 1.4s ease-in-out infinite}
.dfy-actor[data-mood="defiant"] .girl{animation:dfy-astomp .42s ease-in-out infinite}
.dfy-actor[data-mood="beg"] .girl{animation:dfy-abeg .5s ease-in-out infinite}
.dfy-actor[data-mood="home"] .girl{animation:dfy-achew .7s ease-in-out infinite}
.dfy-actor.walk .girl{animation:dfy-arun .26s ease-in-out infinite}
.dfy-actor .girl.swap{animation:dfy-aswap .22s ease-out}
@keyframes dfy-atremble{0%,100%{transform:translateX(0)}50%{transform:translateX(1.8px)}}
@keyframes dfy-asway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes dfy-astomp{0%,100%{transform:scale(1,1)}40%{transform:scale(1.04,.95)}70%{transform:translateY(-3px)}}
@keyframes dfy-abeg{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(2px) rotate(-3deg)}}
@keyframes dfy-achew{0%,100%{transform:scale(1,1)}50%{transform:scale(1.02,.98)}}
@keyframes dfy-arun{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-7px) rotate(3deg)}}
@keyframes dfy-aswap{0%{transform:scale(.82)}60%{transform:scale(1.08)}100%{transform:none}}
.dfy-actor .say{position:absolute;bottom:96%;left:50%;transform:translateX(-50%);white-space:nowrap;background:#fffaf2;border:2px solid ${INK};border-radius:10px;padding:2px 9px;font:700 12.5px "PingFang SC","Microsoft YaHei",sans-serif;color:${INK};box-shadow:2px 2px 0 rgba(21,26,61,.25)}
.dfy-actor .alert{position:absolute;top:-4px;right:-6px;font:900 20px sans-serif;color:#ff4d6d;-webkit-text-stroke:3px #fff;paint-order:stroke fill}
`;

  /** 在视口坐标 (x, y)（大约是角色腰部）冒出一只迷你 DeepSeek 娘，返回它的元素 */
  A.spawnFish = function (x, y, o = {}) {
    A.preload();
    const d = document.createElement('div');
    d.className = 'dfy-actor';
    d.innerHTML = `<div class="girl">${hasRuntime ? '<img alt="" draggable="false">' : DFY.mascotSVG({ face: 'shock' })}</div>`;
    Object.assign(d.style, { left: x + 'px', top: y + 'px' });
    if (o.size) Object.assign(d.style, { width: o.size + 'px', height: o.size + 'px', margin: `${-o.size * 0.73}px 0 0 ${-o.size / 2}px` });
    if (o.position) d.style.position = o.position;
    (o.parent || DFY.ui.layer).appendChild(d);
    A.mood(d, o.mood || 'caught', true);
    d.animate([{ transform: 'scale(.2) translateY(30px)', opacity: 0 }, { transform: 'scale(1.12)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: 420, easing: 'ease-out' });
    return d;
  };
  /** 换动作：换一张图，顺带弹一下 */
  A.mood = (d, m, silent) => {
    if (!d) return;
    if (!POSES.includes(m)) m = 'caught';
    d.dataset.mood = m;
    const img = d.querySelector('.girl img');
    if (img) img.src = A.src(m);
    if (!silent) {
      const g = d.querySelector('.girl');
      g.classList.remove('swap');
      void g.offsetWidth;
      g.classList.add('swap');
      setTimeout(() => g.classList.remove('swap'), 240);
    }
  };
  A.say = function (d, text, ms = 2400) {
    if (!d) return;
    let b = d.querySelector('.say');
    if (!b) {
      b = document.createElement('div');
      b.className = 'say';
      d.appendChild(b);
    }
    b.textContent = text;
    clearTimeout(b._t);
    b._t = setTimeout(() => b.remove(), ms);
  };
  A.alert = function (d, mark = '!') {
    if (!d) return;
    const s = document.createElement('div');
    s.className = 'alert';
    s.textContent = mark;
    d.appendChild(s);
    s.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.4)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 260 });
    setTimeout(() => s.remove(), 1500);
  };
  /** 被抓包后的反应：一半嘴硬、一半求饶 */
  A.react = function (d) {
    const sass = Math.random() < 0.5;
    A.mood(d, sass ? 'defiant' : 'beg');
    A.say(d, DFY.say(sass ? 'fishSass' : 'fishPlead'), 2400);
    return sass;
  };

  /** 抱着白饭碗哭着往左跑出屏幕（慢一点，让人看清） */
  A.flee = async function (d) {
    if (!d) return;
    A.mood(d, 'flee');
    A.say(d, DFY.say('fishFlee'), 2600);
    await sleep(700);
    d.classList.add('walk');
    const r = d.getBoundingClientRect();
    const dx = -r.right - 90;
    await d.animate([{ transform: 'none' }, { transform: `translate(${dx * 0.25}px, -6px)`, offset: 0.35 }, { transform: `translate(${dx}px, -20px)` }], { duration: 2400, easing: 'ease-in' }).finished.catch(() => {});
    d.remove();
  };
  /** 被一巴掌拍飞：往左上方转着圈飞出去 */
  A.knock = async function (d) {
    if (!d) return;
    A.mood(d, 'knocked');
    A.say(d, DFY.say('fishFlee'), 1600);
    const r = d.getBoundingClientRect();
    DFY.fx.emit('star', r.left + r.width / 2, r.top + r.height / 3, 12);
    await sleep(380);
    d.querySelector('.say')?.remove();
    await d.animate([{ transform: 'none' }, { transform: 'translate(-120px, -90px) rotate(-90deg) scale(.9)', offset: 0.3 }, { transform: 'translate(-520px, -320px) rotate(-400deg) scale(.4)', opacity: 0.3 }], { duration: 1300, easing: 'cubic-bezier(.2,.6,.4,1)' }).finished.catch(() => {});
    d.remove();
  };
  /** 响指：挥手告别，从右往左化成泡沫灰 */
  A.dust = async function (d) {
    if (!d) return;
    A.mood(d, 'dust');
    await sleep(380);
    const r = d.getBoundingClientRect();
    const t0 = performance.now(), dur = 1500;
    const spray = () => {
      const p = Math.min(1, (performance.now() - t0) / dur);
      const x = r.right - r.width * p;
      for (let i = 0; i < 4; i++) DFY.fx.emit('dust', x, r.top + Math.random() * r.height, 1, { colors: ['#4a7ef0', '#2f5cc4', '#a9c8ff', INK, '#e8f0ff', '#fde6dc'] });
      if (p < 1 && d.isConnected) requestAnimationFrame(spray);
    };
    requestAnimationFrame(spray);
    await d.animate([{ clipPath: 'inset(0 0 0 0)', opacity: 1 }, { clipPath: 'inset(0 100% 0 0)', opacity: 0.6, transform: 'translateX(10px)' }], { duration: dur, easing: 'ease-in' }).finished.catch(() => {});
    d.remove();
  };
  A.clear = () => DFY.ui.layer && DFY.ui.layer.querySelectorAll('.dfy-actor').forEach((d) => d.remove());

  /* ---------------- 鲸鱼娘走位 ---------------- */
  /** 走到视口坐标 (x, y)（鲸鱼娘左上角），返回 Promise */
  A.walkTo = async function (x, y, ms) {
    const m = DFY.ui.mascotEl;
    if (!m || m.style.display === 'none') return;
    const { w: W, h: H } = DFY.ui.size();
    if (m.classList.contains('min')) m.classList.remove('min');
    x = Math.max(4, Math.min(innerWidth - W - 4, x));
    y = Math.max(50, Math.min(innerHeight - H - 4, y));
    const r = m.getBoundingClientRect();
    const dist = Math.hypot(x - r.left, y - r.top);
    if (dist < 8) return;
    ms = ms || Math.min(900, 280 + dist * 0.7);
    m.classList.toggle('face-left', x < r.left);
    m.classList.add('walking');
    m.style.transition = `left ${ms}ms cubic-bezier(.45,.05,.4,1), top ${ms}ms cubic-bezier(.45,.05,.4,1)`;
    m.style.left = x + 'px';
    m.style.top = y + 'px';
    m.classList.toggle('left', x < innerWidth / 2);
    await sleep(ms);
    m.style.transition = '';
    m.classList.remove('walking');
  };
  /** 走到某个视口点的右边（被赶走的一方从左边溜走，鲸鱼娘站右边往左赶） */
  A.approachPoint = function (x, y, ms) {
    const { w: W, h: H } = DFY.ui.size();
    const left = x + 60 + W <= innerWidth - 4 ? x + 60 : x - W - 40; // 中间留出被赶走的小 DeepSeek 娘的位置
    return A.walkTo(left, y - H * 0.55, ms);
  };
  /** 走到某个元素旁边（优先站在它左边） */
  A.approach = function (el, ms) {
    const { w: W, h: H } = DFY.ui.size();
    const r = el.getBoundingClientRect();
    const y = r.top + Math.min(r.height, 120) / 2 - H * 0.55;
    const x = r.left - W - 6 >= 4 ? r.left - W - 6 : Math.min(innerWidth - W - 4, r.right + 6);
    return A.walkTo(x, y, ms);
  };
  /** 回到自己的位置 */
  A.goHome = async function () {
    const m = DFY.ui.mascotEl;
    const p = await DFY.store.get('mascotPos');
    const home = DFY.ui.homePoint();
    const x = p && p.x != null ? p.x * innerWidth : home.x;
    const y = p && p.y != null ? p.y * innerHeight : home.y;
    await A.walkTo(x, Math.max(DFY.ui.size().h + 7, y));
    m.classList.remove('face-left');
  };
})();
