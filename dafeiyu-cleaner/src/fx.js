/* 特效：粒子画布、合成音效、评论退场动画（化灰 / 泡泡） */
(function () {
  const DFY = (globalThis.DFY = globalThis.DFY || {});
  const fx = (DFY.fx = {});
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  fx.sleep = sleep;

  /* ---------------- 音效（WebAudio 现场合成，无需音频文件） ---------------- */
  let ac = null;
  function ctx() {
    if (!DFY.settings || !DFY.settings.sound || DFY.settings.quiet) return null;
    // 浏览器要求用户先和页面交互过才能出声，否则静默跳过
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (e) {
      return null;
    }
  }
  function tone(type, f0, f1, dur, vol = 0.18, delay = 0) {
    const a = ctx();
    if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  function noise(dur, vol = 0.25, freq = 2000, delay = 0, q = 1) {
    const a = ctx();
    if (!a) return;
    const t = a.currentTime + delay;
    const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const s = a.createBufferSource();
    s.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = a.createGain();
    g.gain.value = vol;
    s.connect(f).connect(g).connect(a.destination);
    s.start(t);
  }
  DFY.sfx = {
    pop() {
      tone('sine', 380, 1100, 0.12, 0.22);
    },
    bloop() {
      tone('sine', 900, 260, 0.18, 0.18);
    },
    gulp() {
      tone('sine', 300, 120, 0.16, 0.25);
      tone('sine', 260, 90, 0.18, 0.22, 0.17);
    },
    snap() {
      noise(0.06, 0.9, 3200, 0, 0.8);
      tone('square', 1800, 600, 0.05, 0.05);
    },
    whoosh() {
      noise(0.35, 0.35, 900, 0, 0.6);
    },
    slap() {
      noise(0.09, 0.8, 1400, 0, 0.7);
      tone('triangle', 220, 80, 0.12, 0.25);
    },
    ding() {
      tone('sine', 880, 880, 0.18, 0.15);
      tone('sine', 1320, 1320, 0.3, 0.15, 0.1);
    },
    boom() {
      noise(0.6, 0.5, 300, 0, 0.5);
      tone('sine', 120, 40, 0.5, 0.35);
    },
    lock() {
      tone('square', 1320, 1320, 0.05, 0.06);
      tone('square', 1760, 1760, 0.07, 0.06, 0.08);
    },
    shoot() {
      tone('sine', 600, 1500, 0.08, 0.12);
    },
    gat() {
      noise(0.04, 0.55, 2600, 0, 0.9);
      tone('square', 220, 90, 0.04, 0.05);
    },
    throw() {
      noise(0.18, 0.25, 1400, 0, 0.8);
    },
    splat() {
      noise(0.12, 0.5, 700, 0, 0.6);
      tone('sine', 300, 140, 0.12, 0.18);
    },
  };

  /* ---------------- 粒子画布 ---------------- */
  let canvas, g, parts = [], raf = 0;
  fx.mount = function (layer) {
    canvas = document.createElement('canvas');
    canvas.className = 'fx-canvas';
    layer.appendChild(canvas);
    g = canvas.getContext('2d');
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener('resize', resize);
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const quiet = () => !!(DFY.settings && DFY.settings.quiet);
  fx.quiet = quiet;
  fx.emit = function (type, x, y, n, o = {}) {
    if (quiet()) return;
    for (let i = 0; i < n; i++) {
      const p = { type, x: x + rand(-(o.spreadX || 0), o.spreadX || 0), y: y + rand(-(o.spreadY || 0), o.spreadY || 0), life: 0 };
      if (type === 'dust') {
        Object.assign(p, { vx: rand(0.6, 3.2), vy: rand(-2.2, 0.4), s: rand(1.5, 3.6), max: rand(50, 95), c: o.colors ? o.colors[(Math.random() * o.colors.length) | 0] : '#8b97b5', ay: -0.02 });
      } else if (type === 'bubble') {
        Object.assign(p, { vx: rand(-1.2, 1.2), vy: rand(-3.4, -1), s: rand(3, o.big ? 16 : 9), max: rand(50, 90), ph: rand(0, 6) });
      } else if (type === 'rice') {
        Object.assign(p, { vx: rand(-3.5, 3.5), vy: rand(-6, -2), s: rand(2, 3.4), max: rand(45, 70), ay: 0.28, rot: rand(0, 3) });
      } else if (type === 'star') {
        Object.assign(p, { vx: rand(-4, 4), vy: rand(-4, 4), s: rand(4, 9), max: rand(25, 45), c: o.c || (Math.random() < 0.5 ? '#ffd54a' : '#7fb0ff') });
      } else if (type === 'confetti') {
        Object.assign(p, { vx: rand(-6, 6), vy: rand(-11, -4), s: rand(4, 8), max: rand(70, 110), ay: 0.3, rot: rand(0, 6), c: ['#4d6bfe', '#7fb0ff', '#ffd54a', '#ff8fb1', '#fff'][(Math.random() * 5) | 0] });
      } else if (type === 'shot') {
        // 加特林打出去的米粒子弹：直线飞向 (tx, ty)
        const dx = o.tx - p.x + rand(-10, 10), dy = o.ty - p.y + rand(-12, 12);
        const d = Math.max(1, Math.hypot(dx, dy)), sp = 17;
        Object.assign(p, { vx: (dx / d) * sp, vy: (dy / d) * sp, s: 3.2, max: Math.max(2, d / sp), rot: Math.atan2(dy, dx) });
      } else if (type === 'stink') {
        Object.assign(p, { vx: rand(-0.9, 0.9), vy: rand(-1.6, -0.4), s: rand(5, 11), max: rand(55, 90), ph: rand(0, 6), c: Math.random() < 0.5 ? 'rgba(150,200,60,' : 'rgba(110,160,40,' });
      }
      parts.push(p);
    }
    if (!raf) raf = requestAnimationFrame(tick);
  };

  function tick() {
    g.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => ++p.life < p.max);
    for (const p of parts) {
      const k = 1 - p.life / p.max;
      p.vy += p.ay || 0;
      p.x += p.vx;
      p.y += p.vy;
      g.globalAlpha = Math.max(0, Math.min(1, k * 1.4));
      if (p.type === 'dust') {
        g.fillStyle = p.c;
        g.fillRect(p.x, p.y, p.s * k + 0.5, p.s * k + 0.5);
      } else if (p.type === 'bubble') {
        const x = p.x + Math.sin(p.life / 6 + p.ph) * 1.5;
        g.strokeStyle = 'rgba(90,150,255,.85)';
        g.fillStyle = 'rgba(190,225,255,.28)';
        g.lineWidth = 1.4;
        g.beginPath();
        g.arc(x, p.y, p.s, 0, 7);
        g.fill();
        g.stroke();
        g.fillStyle = 'rgba(255,255,255,.9)';
        g.beginPath();
        g.arc(x - p.s * 0.35, p.y - p.s * 0.35, p.s * 0.22, 0, 7);
        g.fill();
      } else if (p.type === 'rice') {
        g.save();
        g.translate(p.x, p.y);
        g.rotate((p.rot += 0.2));
        g.fillStyle = '#fffdf3';
        g.strokeStyle = '#d9cfae';
        g.lineWidth = 0.8;
        g.beginPath();
        g.ellipse(0, 0, p.s * 1.6, p.s, 0, 0, 7);
        g.fill();
        g.stroke();
        g.restore();
      } else if (p.type === 'star') {
        g.fillStyle = p.c;
        star(p.x, p.y, p.s * (0.5 + k * 0.5));
      } else if (p.type === 'confetti') {
        g.save();
        g.translate(p.x, p.y);
        g.rotate((p.rot += 0.15));
        g.fillStyle = p.c;
        g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        g.restore();
      } else if (p.type === 'shot') {
        g.globalAlpha = 1;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.fillStyle = '#fffdf3';
        g.strokeStyle = '#151a3d';
        g.lineWidth = 1.2;
        g.beginPath();
        g.ellipse(0, 0, p.s * 1.9, p.s, 0, 0, 7);
        g.fill();
        g.stroke();
        g.restore();
      } else if (p.type === 'stink') {
        const r = p.s * (1 + (1 - k) * 1.2);
        g.globalAlpha = 1;
        g.fillStyle = p.c + (0.55 * k).toFixed(2) + ')';
        g.beginPath();
        g.arc(p.x + Math.sin(p.life / 7 + p.ph) * 3, p.y, r, 0, 7);
        g.fill();
      }
    }
    g.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!raf) g.clearRect(0, 0, innerWidth, innerHeight);
  }
  function star(x, y, r) {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const rr = i % 2 ? r * 0.38 : r;
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath();
    g.fill();
  }

  /* ---------------- 叠加层小工具 ---------------- */
  function overlay(html, cls) {
    const d = document.createElement('div');
    d.className = 'ov ' + (cls || '');
    d.innerHTML = html;
    DFY.ui.layer.appendChild(d);
    return d;
  }
  fx.overlay = overlay;

  fx.floatText = function (x, y, text, color = '#2f56e0', size = 22) {
    const d = overlay(text, 'float-text');
    Object.assign(d.style, { left: x + 'px', top: y + 'px', color, fontSize: size + 'px' });
    d.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 },
        { transform: 'translate(-50%,-90%) scale(1.15)', opacity: 1, offset: 0.25 },
        { transform: 'translate(-50%,-220%) scale(1)', opacity: 0 },
      ],
      { duration: 1300, easing: 'ease-out' }
    ).onfinish = () => d.remove();
  };

  fx.flash = function (color = 'rgba(160,200,255,.75)', dur = 380) {
    if (quiet()) return;
    const d = overlay('', 'flash');
    d.style.background = color;
    d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, easing: 'ease-out' }).onfinish = () => d.remove();
  };

  fx.shake = function (power = 6) {
    const el = document.body;
    if (!el || quiet()) return;
    el.animate(
      [0, 1, 2, 3, 4, 5].map((i) => ({ transform: i === 5 ? 'none' : `translate(${(Math.random() - 0.5) * power}px,${(Math.random() - 0.5) * power}px)` })),
      { duration: 280 }
    );
  };

  function inView(r) {
    return r.bottom > 0 && r.top < innerHeight && r.width > 0 && r.height > 0;
  }
  fx.inView = (el) => inView(el.getBoundingClientRect());

  /** 收起元素：高度动画到 0 然后隐藏 */
  fx.collapse = async function (el, dur = 320) {
    const h = el.getBoundingClientRect().height;
    if (h > 0 && dur) {
      el.style.overflow = 'hidden';
      await el.animate([{ height: h + 'px', opacity: el.style.opacity || 1 }, { height: '0px', opacity: 0, marginTop: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px' }], { duration: dur, easing: 'ease-in' }).finished.catch(() => {});
    }
    el.style.display = 'none';
    el.style.overflow = '';
    el.dataset.dfyGone = '1';
  };

  /** 响指灰飞：从左到右化成蓝色粉尘飘走（灭霸同款） */
  fx.snapDust = async function (el, opts = {}) {
    const r = el.getBoundingClientRect();
    if (!inView(r)) return fx.collapse(el, 0);
    const dur = opts.dur || 1100;
    const colors = ['#8c96ad', '#b8c2d8', '#4d6bfe', '#6f8cff', '#3a4255', '#cfd8ea'];
    const anim = el.animate(
      [
        { clipPath: 'inset(0 0 0 0)', filter: 'none', transform: 'none' },
        { clipPath: 'inset(0 0 0 100%)', filter: 'blur(1px)', transform: 'translateX(10px)' },
      ],
      { duration: dur, easing: 'cubic-bezier(.4,.1,.6,1)', fill: 'forwards' }
    );
    const t0 = performance.now();
    await new Promise((res) => {
      const step = () => {
        const p = Math.min(1, (performance.now() - t0) / dur);
        const edge = r.left + r.width * p;
        const rows = Math.max(4, Math.min(26, r.height / 6));
        for (let i = 0; i < rows; i++) fx.emit('dust', edge, r.top + Math.random() * r.height, 1, { colors });
        if (Math.random() < 0.15) fx.emit('bubble', edge, r.top + Math.random() * r.height, 1);
        if (p < 1) requestAnimationFrame(step);
        else res();
      };
      requestAnimationFrame(step);
    });
    await fx.collapse(el, 260);
    anim.cancel();
  };

  /** 泡泡带走：被大泡泡包住，飘上天，啵一声破掉 */
  fx.bubblePop = async function (el, opts = {}) {
    const r = el.getBoundingClientRect();
    if (!inView(r)) return fx.collapse(el, 0);
    const size = Math.max(60, Math.min(420, Math.max(r.width, r.height) * 1.1));
    const b = overlay('', 'big-bubble');
    Object.assign(b.style, { width: size + 'px', height: size + 'px', left: r.left + r.width / 2 - size / 2 + 'px', top: r.top + r.height / 2 - size / 2 + 'px' });
    b.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    const lift = el.animate(
      [{ transform: 'none' }, { transform: 'scale(.92) rotate(-2deg)', offset: 0.3 }, { transform: 'translateY(-90px) scale(.55) rotate(4deg)', opacity: 0.5 }],
      { duration: 700, easing: 'ease-in', fill: 'forwards' }
    );
    b.animate([{ transform: 'none' }, { transform: 'translateY(-90px) scale(.9)' }], { duration: 700, delay: 0, easing: 'ease-in', fill: 'forwards' });
    await lift.finished.catch(() => {});
    DFY.sfx.pop();
    fx.emit('bubble', r.left + r.width / 2, r.top + r.height / 2 - 90, 22, { spreadX: size / 3, spreadY: size / 3 });
    b.remove();
    el.style.opacity = '0';
    if (opts.keepSpace) {
      el.style.visibility = 'hidden';
      lift.cancel();
      el.style.opacity = '';
      return;
    }
    await fx.collapse(el, 240);
    lift.cancel();
    el.style.opacity = '';
  };

})();
