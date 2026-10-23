/* 鲸鱼娘的武器：巴掌 / 白饭加特林 / 扫帚 / 臭袜子 / 白饭投掷（图在 assets/weapons/） */
(function () {
  const DFY = (globalThis.DFY = globalThis.DFY || {});
  const W = (DFY.weapons = {});
  const A = DFY.actors;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const hasRuntime = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

  W.LIST = ['slap', 'gatling', 'broom', 'sock', 'rice'];
  W.NAMES = { slap: '巴掌', gatling: '白饭加特林', broom: '扫帚', sock: '臭袜子', rice: '白饭投掷' };
  const PROPS = ['gatling', 'broom', 'sock', 'rice'];
  W.src = (n) => (hasRuntime ? chrome.runtime.getURL(`assets/weapons/${n}.webp`) : '');
  let preloaded = false;
  W.preload = function () {
    if (preloaded || !hasRuntime) return;
    preloaded = true;
    for (const p of PROPS) new Image().src = W.src(p);
  };

  A.CSS += `
.dfy-weapon{position:fixed;pointer-events:none;z-index:6;object-fit:contain;filter:drop-shadow(2px 3px 0 rgba(21,26,61,.28));-webkit-user-drag:none}
`;

  /** 在视口坐标 (x, y)（中心点）放一件道具；画在鲸鱼娘上层，看起来是拿在手里 */
  function prop(name, x, y, size) {
    const img = document.createElement('img');
    img.className = 'dfy-weapon';
    img.alt = '';
    img.draggable = false;
    img.src = W.src(name);
    Object.assign(img.style, { left: x - size / 2 + 'px', top: y - size / 2 + 'px', width: size + 'px', height: size + 'px' });
    DFY.ui.root.querySelector('.wrap').appendChild(img);
    return img;
  }
  const mrect = () => DFY.ui.mascotEl.getBoundingClientRect();
  const hand = () => {
    const r = mrect();
    return { x: r.left + r.width * 0.28, y: r.top + r.height * 0.5 };
  };
  const center = (d) => {
    const r = d.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.45 };
  };
  const appear = (el) => el.animate([{ transform: 'scale(.2) rotate(-30deg)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.7 }, { transform: 'none' }], { duration: 300, easing: 'ease-out' });
  const vanish = (el, from = 'none') => (el.animate([{ transform: from, opacity: 1 }, { transform: from + ' scale(.6)', opacity: 0 }], { duration: 260, fill: 'forwards' }).onfinish = () => el.remove());
  /** 后撤一步拉开距离（加特林、扔东西要留出弹道） */
  async function backOff(dx) {
    const r = mrect();
    await A.walkTo(r.left + dx, r.top, 260);
    DFY.ui.mascotEl.classList.add('face-left');
  }
  /** 沿抛物线扔出去，返回落地时的 transform */
  async function toss(el, from, to, { dur = 520, spin = 540, lift = 110 } = {}) {
    const mx = (from.x + to.x) / 2, my = Math.min(from.y, to.y) - lift;
    const frames = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const x = (1 - t) ** 2 * from.x + 2 * (1 - t) * t * mx + t * t * to.x;
      const y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * my + t * t * to.y;
      frames.push({ transform: `translate(${x - from.x}px, ${y - from.y}px) rotate(${-spin * t}deg)` });
    }
    await el.animate(frames, { duration: dur, fill: 'forwards' }).finished.catch(() => {});
    return frames[frames.length - 1].transform;
  }

  /** 往 (x, y) 扔一碗白饭，落地撒一地米 */
  W.throwRice = async function (x, y, text) {
    const h = hand();
    DFY.ui.pose('snap', 400);
    DFY.sfx.throw();
    const b = prop('rice', h.x, h.y, 54);
    const end = await toss(b, h, { x, y }, { dur: 560, spin: 360, lift: 90 });
    DFY.sfx.splat();
    DFY.fx.emit('rice', x, y, 18);
    DFY.fx.floatText(x + 34, y - 18, text || DFY.say('riceLand'), '#2f56e0', 20);
    b.animate([{ transform: end, opacity: 1 }, { transform: end + ' translateY(16px)', opacity: 0 }], { duration: 500, delay: 200, fill: 'forwards' }).onfinish = () => b.remove();
  };

  /* ---------------- 各种武器：fish 是被赶走的大肥鱼，o.onHit 在决定性一击时调用（用来收起评论） ---------------- */
  const FN = {};

  /** 巴掌：拍飞，或者抱着白饭碗哭着跑，再往它离场的地方补一碗白饭 */
  FN.slap = async function (fish, o) {
    DFY.ui.say(DFY.say('kick'), { face: 'angry', ms: 2600 });
    await sleep(700);
    DFY.ui.pose('snap', 600);
    DFY.sfx.slap();
    DFY.fx.shake(4);
    o.onHit && o.onHit();
    if (Math.random() < 0.4) return A.knock(fish);
    const y = center(fish).y;
    await A.flee(fish);
    if (Math.random() < 0.5 && DFY.ui.mascotEl.style.display !== 'none') await W.throwRice(36, y - 16, '白饭管够，别回来了');
  };

  /** 白饭加特林：后撤架枪，一梭子米粒子弹，把它打飞 */
  FN.gatling = async function (fish, o) {
    DFY.ui.say(DFY.say('wGatling'), { face: 'angry', ms: 2400 });
    await backOff(80);
    const r = mrect(), size = 124;
    const g = prop('gatling', r.left + 8, r.top + r.height * 0.6, size);
    appear(g);
    A.mood(fish, 'scared');
    A.say(fish, DFY.say('fishHit'), 1700);
    await sleep(380);
    const recoil = g.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(3px,-1px)' }], { duration: 55, iterations: Infinity, direction: 'alternate' });
    const t0 = performance.now();
    for (let k = 0; performance.now() - t0 < 1250; k++) {
      const gr = g.getBoundingClientRect(), c = center(fish);
      const mx = gr.left + gr.width * 0.07, my = gr.top + gr.height * 0.53;
      DFY.fx.emit('shot', mx, my, 1, { tx: c.x, ty: c.y });
      if (k % 2 === 0) {
        DFY.fx.emit('star', mx - 4, my, 1, { c: '#ffd54a' });
        DFY.sfx.gat();
      }
      if (k % 3 === 1) DFY.fx.emit('rice', c.x + 10, c.y, 2);
      await sleep(50);
    }
    recoil.cancel();
    DFY.fx.shake(5);
    o.onHit && o.onHit();
    const gone = A.knock(fish);
    await sleep(450);
    vanish(g);
    return gone;
  };

  /** 扫帚：连扫三下把它推出去，它只好自己跑 */
  FN.broom = async function (fish, o) {
    DFY.ui.say(DFY.say('wBroom'), { face: 'angry', ms: 2400 });
    const r = mrect(), size = 128;
    const b = prop('broom', r.left - size * 0.12, r.top + r.height * 0.5, size);
    b.style.transformOrigin = '80% 10%';
    appear(b);
    await sleep(320);
    A.mood(fish, 'scared');
    fish.style.transition = 'left .28s ease-out';
    let ox = 0;
    for (let i = 0; i < 3; i++) {
      DFY.sfx.whoosh();
      await b.animate([{ transform: `translateX(${ox}px) rotate(-30deg)` }, { transform: `translateX(${ox}px) rotate(34deg)` }], { duration: 260, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
      const fr = fish.getBoundingClientRect();
      DFY.fx.emit('dust', fr.left + fr.width * 0.6, fr.bottom - 10, 16, { colors: ['#c9a24a', '#e7cf8e', '#b8a27a', '#fffaf2'] });
      fish.style.left = parseFloat(fish.style.left) - 48 + 'px';
      if (i === 0) A.say(fish, DFY.say('fishSwept'), 1700);
      ox -= 48;
      await b.animate([{ transform: `translateX(${ox + 48}px) rotate(34deg)` }, { transform: `translateX(${ox}px) rotate(-30deg)` }], { duration: 200, fill: 'forwards' }).finished.catch(() => {});
    }
    o.onHit && o.onHit();
    vanish(b, `translateX(${ox}px) rotate(-30deg)`);
    fish.style.transition = '';
    await A.flee(fish);
  };

  /** 臭袜子：扔到脸上，熏晕，拖着一串臭气逃走 */
  FN.sock = async function (fish, o) {
    DFY.ui.say(DFY.say('wSock'), { face: 'smug', ms: 2400 });
    await backOff(70);
    await sleep(250);
    const h = hand(), c = center(fish);
    DFY.ui.pose('snap', 500);
    DFY.sfx.throw();
    const s = prop('sock', h.x, h.y, 62);
    const end = await toss(s, h, c, { dur: 560, spin: 720, lift: 120 });
    DFY.sfx.splat();
    DFY.fx.shake(3);
    DFY.fx.emit('stink', c.x, c.y - 10, 26, { spreadX: 26, spreadY: 18 });
    DFY.fx.floatText(c.x, c.y - 42, '臭！', '#5d8a1c', 30);
    o.onHit && o.onHit();
    A.mood(fish, 'knocked');
    A.say(fish, DFY.say('fishStink'), 1800);
    s.animate([{ transform: end, opacity: 1 }, { transform: end + ' translateY(60px) rotate(-90deg)', opacity: 0 }], { duration: 700, easing: 'ease-in', fill: 'forwards' }).onfinish = () => s.remove();
    const trail = setInterval(() => {
      if (!fish.isConnected) return clearInterval(trail);
      const cc = center(fish);
      DFY.fx.emit('stink', cc.x, cc.y - 20, 3, { spreadX: 14 });
    }, 120);
    await sleep(1100);
    await (Math.random() < 0.5 ? A.knock(fish) : A.flee(fish));
    clearInterval(trail);
  };

  /** 白饭投掷：让它抱着碗走，一路朝它扔白饭，最后往它离场的地方再扔一碗 */
  FN.rice = async function (fish, o) {
    DFY.ui.say(DFY.say('wRice'), { face: 'happy', ms: 2400 });
    await sleep(600);
    DFY.ui.pose('snap', 500);
    DFY.sfx.slap();
    o.onHit && o.onHit();
    const y0 = center(fish).y;
    const fleeing = A.flee(fish);
    for (const wait of [900, 650, 650]) {
      await sleep(wait);
      const c = fish.isConnected ? center(fish) : { x: 60, y: y0 - 20 };
      W.throwRice(Math.max(30, c.x - 24), c.y + 12);
    }
    await fleeing;
    await W.throwRice(34, y0 - 16, '别回来了！');
  };

  let last = '';
  /** 按设置选武器；随机时不连着用同一种 */
  W.pick = function () {
    const s = (DFY.settings && DFY.settings.weapon) || 'random';
    if (W.LIST.includes(s)) return s;
    let w;
    do w = W.LIST[(Math.random() * W.LIST.length) | 0];
    while (w === last);
    return (last = w);
  };

  /** 用某种武器把一只大肥鱼赶走，返回它彻底离场时完成的 Promise */
  W.run = async function (name, fish, o = {}) {
    W.preload();
    const m = DFY.ui.mascotEl;
    if (!m || m.style.display === 'none' || !hasRuntime) name = 'slap';
    m && m.classList.add('face-left');
    try {
      await (FN[name] || FN.slap)(fish, o);
    } catch (e) {
      fish && fish.remove();
    }
  };

  /** 响指清场的另一种打法：加特林挨个点射视野里的大肥鱼，每打中一只调用 onHit(i) */
  W.sweep = async function (fishes, onHit) {
    W.preload();
    const r = mrect(), size = 124;
    const g = prop('gatling', r.left + 12, r.top + r.height * 0.6, size);
    g.style.transition = 'transform .12s';
    appear(g);
    await sleep(380);
    for (let i = 0; i < fishes.length; i++) {
      const f = fishes[i];
      const gr = g.getBoundingClientRect();
      const gc = { x: gr.left + gr.width / 2, y: gr.top + gr.height / 2 };
      const c = center(f);
      // 图里枪口朝左：旋转 θ 后朝向 (-cosθ, -sinθ)
      const th = Math.atan2(gc.y - c.y, gc.x - c.x);
      g.style.transform = `rotate(${(th * 180) / Math.PI}deg)`;
      A.mood(f, 'scared');
      await sleep(130);
      const ox = -0.43 * size, oy = 0.03 * size;
      const mx = gc.x + ox * Math.cos(th) - oy * Math.sin(th), my = gc.y + ox * Math.sin(th) + oy * Math.cos(th);
      for (let k = 0; k < 7; k++) {
        DFY.fx.emit('shot', mx, my, 1, { tx: c.x, ty: c.y });
        if (k % 2 === 0) {
          DFY.fx.emit('star', mx, my, 1, { c: '#ffd54a' });
          DFY.sfx.gat();
        }
        await sleep(45);
      }
      DFY.fx.emit('rice', c.x, c.y, 6);
      onHit(i);
    }
    await sleep(300);
    vanish(g, g.style.transform);
  };
})();
