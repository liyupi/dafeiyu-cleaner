/* 页面 UI：悬浮鲸鱼娘、对话气泡、思考气泡、菜单、通知、连击、提示框、弹窗、泡泡大炮 */
(function () {
  const DFY = (globalThis.DFY = globalThis.DFY || {});
  const ui = (DFY.ui = {});
  const $ = (sel, root) => (root || ui.root).querySelector(sel);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  DFY.esc = esc;

  const CSS = `
:host{all:initial}
*{box-sizing:border-box}
.wrap{--ink:#151a3d;--paper:#f5eadd;--paper2:#fffaf2;--blue:#2546b8;--sea:#2f6fe0;--cyan:#6fe0ff;--gold:#c9a24a;--pink:#ff5d8a;--green:#1fa971;--amber:#e89a1c;--disp:"DFY Display","PingFang SC","HarmonyOS Sans SC","Microsoft YaHei",sans-serif;
  font-family:"PingFang SC","HarmonyOS Sans SC","Microsoft YaHei",system-ui,sans-serif;color:var(--ink);font-size:14px;line-height:1.5}
.dfy-ic{display:inline-block;vertical-align:-.18em;flex:none}
.layer{position:fixed;inset:0;pointer-events:none;z-index:3;overflow:hidden}
.fx-canvas{position:absolute;inset:0;width:100%;height:100%}
.ov{position:fixed;pointer-events:none}
.float-text{font-family:var(--disp);font-weight:900;white-space:nowrap;-webkit-text-stroke:5px var(--paper2);paint-order:stroke fill;letter-spacing:1px}
.flash{inset:0}
.big-bubble{border-radius:50%;border:2.5px solid rgba(21,26,61,.55);background:radial-gradient(circle at 30% 28%,rgba(255,255,255,.95) 0 6%,rgba(255,255,255,0) 7%),radial-gradient(circle at 50% 50%,rgba(170,215,255,.08) 55%,rgba(111,224,255,.35) 78%,rgba(220,245,255,.75) 100%)}

/* —— 鲸鱼娘本体 —— */
.mascot{position:fixed;width:132px;z-index:5;pointer-events:auto;user-select:none;-webkit-user-select:none;touch-action:none}
.mascot .whale-box{width:132px;height:153px;cursor:grab;filter:drop-shadow(3px 4px 0 rgba(21,26,61,.22));transition:transform .2s}
.mascot .whale-box:hover{transform:scale(1.04) rotate(-2deg)}
.mascot.dragging .whale-box{cursor:grabbing;transform:scale(1.08) rotate(4deg)}
.mascot.min .whale-box{transform:translateY(98px) scale(.8)}
.mascot.min .bubble,.mascot.min .think,.mascot.min .menu,.mascot.min .count{display:none}
.whale-box.has-custom .dfy-whale{display:none}
.whale-box img.custom{width:100%;height:100%;object-fit:contain;animation:dfy-bob 2.6s ease-in-out infinite}
.mascot[data-mood="angry"] img.custom{animation:dfy-shake .35s linear infinite}
.mascot[data-mood="happy"] img.custom{animation:dfy-hop .5s ease-in-out 3}
.count{position:absolute;top:-4px;left:-14px;z-index:2;display:none;align-items:center;gap:4px;background:var(--pink);color:#fff;font-family:var(--disp);font-size:14px;letter-spacing:.5px;padding:3px 10px 3px 8px;border:2.5px solid var(--ink);border-radius:8px;box-shadow:3px 3px 0 var(--ink);transform:rotate(-6deg);cursor:pointer;white-space:nowrap;animation:dfy-pulse 1.6s ease-in-out infinite}
.count.show{display:inline-flex}
@keyframes dfy-pulse{0%,100%{transform:rotate(-6deg) scale(1)}50%{transform:rotate(-6deg) scale(1.08)}}

/* 漫画对话框 */
.bubble{position:absolute;bottom:172px;right:0;width:max-content;min-width:120px;max-width:260px;background:var(--paper2);border:2.5px solid var(--ink);border-radius:16px;padding:9px 14px;font-size:13.5px;font-weight:700;color:var(--ink);box-shadow:4px 4px 0 var(--ink);opacity:0;transform:translateY(8px) scale(.9);transform-origin:bottom right;transition:all .22s cubic-bezier(.3,1.5,.5,1);pointer-events:none}
.bubble.show{opacity:1;transform:none}
.bubble:after{content:"";position:absolute;bottom:-10px;right:46px;width:15px;height:15px;background:var(--paper2);border-right:2.5px solid var(--ink);border-bottom:2.5px solid var(--ink);transform:rotate(45deg) skew(8deg,8deg)}
.mascot.left .bubble,.mascot.left .think{right:auto;left:0;transform-origin:bottom left}
.mascot.left .bubble:after{right:auto;left:46px}

/* DeepSeek 风格的思考框（梗本身就是 DeepSeek 界面，保留它的样子） */
.think{position:absolute;bottom:172px;right:0;width:280px;background:#f7f8fb;border:1.5px solid #dfe3ee;border-radius:14px;padding:10px 12px 9px;font-size:12.5px;color:#5b6378;box-shadow:0 10px 26px rgba(21,26,61,.16);display:none;pointer-events:auto}
.think.show{display:block;animation:dfy-in .25s ease-out}
.think .hd{display:flex;align-items:center;gap:6px;font-weight:700;color:#4d6bfe;margin-bottom:6px;font-size:12.5px}
.think .hd .dot{width:7px;height:7px;border-radius:50%;background:#4d6bfe;animation:dfy-blinkdot .8s infinite}
.think .bd{max-height:96px;overflow:hidden;border-left:2px solid #dfe5f3;padding-left:9px;white-space:pre-wrap;word-break:break-all;mask-image:linear-gradient(to bottom,transparent,#000 22%)}
.think.done .hd .dot{display:none}
@keyframes dfy-blinkdot{50%{opacity:.25}}
@keyframes dfy-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

/* 菜单：贴纸按钮 */
.menu{position:absolute;bottom:172px;right:-6px;display:none;flex-direction:column;gap:8px;align-items:flex-end}
.mascot.left .menu{right:auto;left:-6px;align-items:flex-start}
.menu.show{display:flex}
.menu button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:7px;background:var(--paper2);border:2.5px solid var(--ink);border-radius:10px;padding:6px 13px 6px 10px;font-family:var(--disp);font-size:15px;letter-spacing:.5px;color:var(--ink);box-shadow:3px 3px 0 var(--ink);white-space:nowrap;transition:transform .12s,box-shadow .12s;animation:dfy-pop-in .3s cubic-bezier(.3,1.6,.5,1) both}
.menu button:hover{transform:translate(-2px,-2px);box-shadow:5px 5px 0 var(--ink);background:#fff}
.menu button:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--ink)}
.menu button.primary{background:var(--blue);color:#fff}
.menu button .n{display:inline-block;background:var(--pink);color:#fff;border:2px solid var(--ink);border-radius:6px;padding:0 6px;font-size:12px;line-height:16px}
@keyframes dfy-pop-in{from{opacity:0;transform:translateY(10px) scale(.7)}to{opacity:1;transform:none}}

/* 通知 */
.toasts{position:fixed;bottom:24px;left:20px;max-width:330px;display:flex;flex-direction:column;gap:12px;z-index:6;pointer-events:none}
.toast{position:relative;display:flex;align-items:center;gap:11px;background:var(--paper2);border:2.5px solid var(--ink);border-radius:12px;padding:12px 16px 10px 12px;box-shadow:4px 4px 0 var(--ink);min-width:240px;animation:dfy-slide-l .4s cubic-bezier(.3,1.5,.5,1)}
.toast:before{content:"";position:absolute;top:-9px;left:16px;width:74px;height:15px;background:repeating-linear-gradient(-45deg,var(--gold) 0 6px,#e7cf8e 6px 12px);border:1.5px solid var(--ink);transform:rotate(-3deg)}
.toast .ic{width:44px;height:44px;display:grid;place-items:center;background:var(--blue);color:#fff;border:2.5px solid var(--ink);border-radius:10px;transform:rotate(-4deg)}
.toast .t1{font-size:10.5px;color:#7a6c55;font-weight:800;letter-spacing:1.5px}
.toast .t2{font-family:var(--disp);font-size:19px;color:var(--ink);letter-spacing:1px;line-height:1.2}
.toast .t3{font-size:12px;color:#5b6378}
.toast .t2{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.toast .act{all:unset;pointer-events:auto;cursor:pointer;flex:none;align-self:center;display:inline-flex;align-items:center;gap:4px;font-family:var(--disp);font-size:14px;letter-spacing:1px;padding:3px 10px;border:2px solid var(--ink);border-radius:8px;background:var(--paper2);box-shadow:2px 2px 0 var(--ink)}
.toast .act:hover{background:var(--cyan)}
.toast .act:active{transform:translate(1px,1px);box-shadow:none}
@keyframes dfy-slide-l{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:none}}

/* 连击 */
.combo{position:fixed;top:15%;left:50%;transform:translateX(-50%);z-index:6;pointer-events:none;text-align:center;display:none}
.combo.show{display:block}
.combo .x{font-family:var(--disp);font-size:78px;line-height:1;color:var(--cyan);-webkit-text-stroke:3px var(--ink);paint-order:stroke fill;text-shadow:5px 5px 0 var(--ink);letter-spacing:2px}
.combo .l{margin-top:8px;font-family:var(--disp);font-size:18px;color:var(--paper2);background:var(--ink);padding:3px 16px;border-radius:4px;display:inline-block;transform:rotate(-2deg);letter-spacing:1px}

/* 悬停鉴定卡 */
.tip{position:fixed;z-index:7;width:290px;background:var(--paper2);border:2.5px solid var(--ink);border-radius:12px;padding:11px 13px;box-shadow:5px 5px 0 var(--ink);font-size:12.5px;pointer-events:none;display:none}
.tip.show{display:block;animation:dfy-in .15s ease-out}
.tip h4{margin:0 0 2px;font-family:var(--disp);font-size:18px;letter-spacing:1px;font-weight:400;display:flex;align-items:center;gap:6px}
.tip h4.fish{color:var(--pink)}.tip h4.suspect{color:var(--amber)}.tip h4.human{color:var(--green)}
.tip .who{color:#7a829e;margin-bottom:7px}
.tip ul{margin:0;padding:0;list-style:none}
.tip li{display:flex;justify-content:space-between;gap:12px;padding:3px 0;border-bottom:1.5px dashed #e3d6c2}
.tip li b{font-family:var(--disp);font-weight:400;color:var(--pink);white-space:nowrap;font-size:14px}
.tip li b.neg{color:var(--green)}
.tip .llm{margin-top:8px;padding:8px 10px;background:#e9efff;border:2px solid var(--ink);border-radius:9px;color:#26306e}
.tip .llm i{font-style:normal;font-weight:800;color:var(--blue);display:flex;align-items:center;gap:5px}

/* 弹窗 */
.modal-root{position:fixed;inset:0;z-index:8;display:none;place-items:center;background:rgba(21,26,61,.42);backdrop-filter:blur(3px);pointer-events:auto}
.modal-root.show{display:grid;animation:dfy-fade .2s}
@keyframes dfy-fade{from{opacity:0}to{opacity:1}}
.card{position:relative;width:min(440px,92vw);background:var(--paper);border:3px solid var(--ink);border-radius:16px;box-shadow:8px 8px 0 var(--ink);padding:24px 22px 18px;overflow:hidden;animation:dfy-pop-in .35s cubic-bezier(.3,1.5,.5,1)}
.card:before{content:"";position:absolute;right:-40px;top:-40px;width:200px;height:200px;background:radial-gradient(var(--sea) 1.6px,transparent 1.8px) 0 0/10px 10px;opacity:.25;border-radius:50%}
.card .tape{position:absolute;top:12px;left:-30px;transform:rotate(-30deg);background:var(--ink);color:var(--paper2);font:900 10px/1 sans-serif;letter-spacing:2px;padding:5px 34px}
.card .x-close{all:unset;position:absolute;top:10px;right:12px;cursor:pointer;color:var(--ink);width:28px;height:28px;display:grid;place-items:center;border:2px solid var(--ink);border-radius:8px;background:var(--paper2)}
.card h2{margin:0 0 4px;font-family:var(--disp);font-size:30px;font-weight:400;letter-spacing:2px;color:var(--ink)}
.card .sub{color:#5b5446;font-size:13px;margin-bottom:12px}
.card .row{display:flex;gap:10px;margin:14px 0}
.card .stat{flex:1;background:var(--paper2);border:2.5px solid var(--ink);border-radius:10px;padding:10px 6px;text-align:center;box-shadow:3px 3px 0 var(--ink)}
.card .stat b{display:block;font-family:var(--disp);font-weight:400;font-size:30px;color:var(--blue);line-height:1.1}
.card .stat span{font-size:12px;color:#5b5446}
.card .btns{display:flex;gap:10px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}
.btn{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:7px 15px;border-radius:10px;font-family:var(--disp);font-size:16px;letter-spacing:1px;border:2.5px solid var(--ink);box-shadow:3px 3px 0 var(--ink);color:var(--ink);background:var(--paper2);transition:transform .1s,box-shadow .1s}
.btn:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--ink)}
.btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--ink)}
.btn.primary{background:var(--blue);color:#fff}
.btn.danger{background:var(--pink);color:#fff}
.btn.ghost{background:transparent;box-shadow:none;border-style:dashed}
.btn[disabled]{opacity:.5;pointer-events:none}

/* 空间鉴定报告：案件档案 */
.verdict{position:fixed;top:84px;right:22px;width:372px;z-index:6;pointer-events:auto;background:var(--paper);border:3px solid var(--ink);border-radius:14px;box-shadow:8px 8px 0 var(--ink);overflow:hidden;animation:dfy-slide .5s cubic-bezier(.3,1.4,.5,1)}
@keyframes dfy-slide{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:none}}
.verdict .top{position:relative;padding:11px 14px 10px;background:var(--ink);color:var(--paper2);display:flex;align-items:center;justify-content:space-between;gap:8px}
.verdict .top:after{content:"";position:absolute;left:0;right:0;bottom:-8px;height:8px;background:repeating-linear-gradient(-45deg,var(--blue) 0 8px,var(--paper) 8px 16px)}
.verdict.fish .top:after{background:repeating-linear-gradient(-45deg,var(--pink) 0 8px,var(--paper) 8px 16px)}
.verdict.human .top:after{background:repeating-linear-gradient(-45deg,var(--green) 0 8px,var(--paper) 8px 16px)}
.verdict.suspect .top:after{background:repeating-linear-gradient(-45deg,var(--amber) 0 8px,var(--paper) 8px 16px)}
.verdict .top b{font-family:var(--disp);font-weight:400;font-size:20px;letter-spacing:2px;display:flex;align-items:center;gap:7px}
.verdict .top small{display:block;opacity:.7;font-size:10.5px;letter-spacing:1.5px;margin-top:1px}
.verdict .top button{all:unset;cursor:pointer;width:26px;height:26px;display:grid;place-items:center;border:2px solid var(--paper2);border-radius:7px;opacity:.85}
.verdict .top button:hover{opacity:1;background:rgba(255,255,255,.12)}
.verdict .body{padding:14px 16px 16px;position:relative}
.verdict .body:before{content:"";position:absolute;left:-30px;bottom:-30px;width:150px;height:150px;background:radial-gradient(var(--sea) 1.5px,transparent 1.7px) 0 0/9px 9px;opacity:.18;border-radius:50%;pointer-events:none}
.verdict .who{display:flex;gap:16px;align-items:center;margin-top:4px}
.verdict .polaroid{position:relative;flex:none;background:#fff;padding:5px 5px 14px;border:2px solid var(--ink);box-shadow:3px 3px 0 var(--ink);transform:rotate(-4deg)}
.verdict .ava{width:66px;height:66px;display:block;object-fit:cover;background:#e9efff}
.verdict .name{font-family:var(--disp);font-size:21px;letter-spacing:.5px;color:var(--ink);word-break:break-all;line-height:1.2}
.verdict .meta{font-size:12px;color:#6b6352}
.verdict .gauge{margin:16px 0 4px;height:24px;border-radius:7px;background:var(--paper2);overflow:hidden;position:relative;border:2.5px solid var(--ink)}
.verdict .gauge i{position:absolute;inset:0 auto 0 0;width:0;background:repeating-linear-gradient(-45deg,var(--blue) 0 9px,var(--sea) 9px 18px);transition:width 1.4s cubic-bezier(.2,.8,.2,1)}
.verdict.fish .gauge i{background:repeating-linear-gradient(-45deg,var(--pink) 0 9px,#ff86a6 9px 18px)}
.verdict.human .gauge i{background:repeating-linear-gradient(-45deg,var(--green) 0 9px,#4cc994 9px 18px)}
.verdict.suspect .gauge i{background:repeating-linear-gradient(-45deg,var(--amber) 0 9px,#f4bb57 9px 18px)}
.verdict .gauge span{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--disp);font-size:15px;letter-spacing:1px;color:var(--ink);text-shadow:0 0 3px #fff,0 0 3px #fff}
.verdict .ev{list-style:none;padding:0;margin:10px 0 0;font-size:12.5px;max-height:170px;overflow:auto}
.verdict .ev li{display:flex;justify-content:space-between;gap:10px;padding:4px 0;border-bottom:1.5px dashed #dccdb4}
.verdict .ev li b{font-family:var(--disp);font-weight:400;font-size:14px;color:var(--pink);white-space:nowrap}
.verdict .ev li b.neg{color:var(--green)}
.verdict .llm{margin-top:12px;padding:9px 11px;background:#e9efff;border:2px solid var(--ink);border-radius:10px;font-size:12.5px;color:#26306e}
.verdict .llm .t{font-weight:800;color:var(--blue);margin-bottom:2px;display:flex;align-items:center;gap:5px}
.verdict .notice{display:flex;align-items:center;gap:6px;background:#ffe3ea;color:#b81d4b;border:2px solid var(--ink);border-radius:9px;padding:6px 10px;font-size:12.5px;font-weight:800;margin-bottom:12px}
.verdict .btns{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.verdict .btns .btn{font-size:14.5px;padding:6px 11px}
.stamp{display:inline-block;margin-top:6px;white-space:nowrap;background:#fffaf2;padding:1px 12px;border:3.5px double currentColor;border-radius:8px;font-family:var(--disp);font-size:22px;letter-spacing:3px;transform:rotate(-6deg);transform-origin:left center;pointer-events:none}
.stamp.fish{color:#e0264f}.stamp.human{color:#139a63}.stamp.suspect{color:#d98200}
.stamp.slam{animation:dfy-stamp .45s cubic-bezier(.2,1.6,.4,1) both}
@keyframes dfy-stamp{0%{transform:rotate(-6deg) scale(3);opacity:0}60%{opacity:1}100%{transform:rotate(-6deg) scale(1);opacity:1}}
.pill{position:fixed;top:84px;right:22px;z-index:6;pointer-events:auto}

/* 泡泡大炮 */
.cannon{position:fixed;inset:0;z-index:4;display:none;cursor:none;pointer-events:auto}
.cannon.on{display:block}
.reticle{position:fixed;width:48px;height:48px;margin:-24px 0 0 -24px;pointer-events:none;z-index:9}
.reticle svg{width:100%;height:100%;animation:dfy-spin 3s linear infinite}
@keyframes dfy-spin{to{transform:rotate(360deg)}}
.target-box{position:fixed;border:2.5px dashed var(--blue);border-radius:10px;background:rgba(37,70,184,.07);pointer-events:none;transition:all .08s;z-index:4;display:none}
.target-box.fish{border-color:var(--pink);background:rgba(255,93,138,.1)}
.hud{position:fixed;top:14px;left:50%;transform:translateX(-50%) rotate(-1deg);z-index:9;background:var(--ink);color:var(--paper2);font-family:var(--disp);letter-spacing:1px;padding:7px 18px;border-radius:8px;border:2.5px solid var(--paper2);box-shadow:4px 4px 0 rgba(21,26,61,.35);font-size:16px;pointer-events:none;white-space:nowrap;display:flex;align-items:center;gap:8px}
.hud b{color:var(--cyan);font-weight:400;font-size:20px}
.proj{position:fixed;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;border:2px solid var(--ink);background:radial-gradient(circle at 32% 30%,#fff 0 18%,rgba(190,235,255,.7) 30%,rgba(111,224,255,.8) 100%);pointer-events:none;z-index:9}
.mascot.walking .whale-box{animation:dfy-walk .26s ease-in-out infinite}
.mascot.face-left .whale-box > svg,.mascot.face-left .whale-box img.custom{transform:scaleX(-1)}
@keyframes dfy-walk{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-9px) rotate(3deg)}}
${DFY.actors ? DFY.actors.CSS : ''}
${DFY.mascotCSS}
`;

  ui.mount = function () {
    if (ui.host) return;
    const host = document.createElement('dfy-host');
    host.setAttribute('style', 'all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483646;display:block');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style>
<div class="wrap">
  <div class="layer"></div>
  <div class="cannon"><div class="target-box"></div></div>
  <div class="mascot" style="display:none">
    <div class="count" title="本页大肥鱼数量"></div>
    <div class="bubble"></div>
    <div class="think"><div class="hd"><span class="dot"></span><span class="ht">正在思考</span></div><div class="bd"></div></div>
    <div class="menu"></div>
    <div class="whale-box">${DFY.mascotSVG({ face: 'normal' })}</div>
  </div>
  <div class="toasts"></div>
  <div class="combo"><div class="x"></div><div class="l"></div></div>
  <div class="tip"></div>
  <div class="modal-root"></div>
</div>`;
    (document.documentElement || document.body).appendChild(host);
    ui.host = host;
    ui.root = root;
    ui.layer = $('.layer');
    ui.whale = $('.dfy-whale');
    ui.mascotEl = $('.mascot');
    DFY.fx.mount(ui.layer);
    initMascot();
  };

  /* ---------------- 鲸鱼娘本体 ---------------- */
  let sayTimer = 0, faceTimer = 0, lastAct = Date.now(), busy = false;
  ui.face = function (f, ms) {
    ui.whale.setAttribute('data-face', f);
    ui.mascotEl.dataset.mood = f;
    clearTimeout(faceTimer);
    if (ms)
      faceTimer = setTimeout(() => {
        ui.whale.setAttribute('data-face', 'normal');
        ui.mascotEl.dataset.mood = 'normal';
      }, ms);
  };
  /** 用户自定义形象（本地图片，替换矢量鲸鱼娘） */
  ui.setCustom = function (dataUrl) {
    const box = $('.whale-box');
    let img = box.querySelector('img.custom');
    if (!dataUrl) {
      if (img) img.remove();
      box.classList.remove('has-custom');
      return;
    }
    if (!img) {
      img = document.createElement('img');
      img.className = 'custom';
      img.draggable = false;
      box.appendChild(img);
    }
    img.src = dataUrl;
    box.classList.add('has-custom');
  };
  ui.pose = function (p, ms) {
    ui.whale.setAttribute('data-pose', p);
    if (ms) setTimeout(() => ui.whale.setAttribute('data-pose', 'idle'), ms);
  };
  ui.say = function (text, o = {}) {
    if (!ui.root) return;
    const b = $('.bubble');
    b.textContent = text;
    b.classList.add('show');
    if (o.face) ui.face(o.face, o.ms || 2600);
    clearTimeout(sayTimer);
    sayTimer = setTimeout(() => b.classList.remove('show'), o.ms || 2800);
    lastAct = Date.now();
  };
  ui.setCount = function (n) {
    const c = $('.count');
    c.innerHTML = n ? `${DFY.icon('fish', 16, 2.4)}${n} 条大肥鱼` : '';
    c.classList.toggle('show', !!n);
  };

  /** DeepSeek 风格思考气泡；返回 {update(text), done(seconds)} */
  ui.think = function (initial) {
    const t = $('.think');
    $('.bubble').classList.remove('show');
    t.classList.remove('done');
    t.classList.add('show');
    $('.ht', t).textContent = '正在思考';
    const bd = $('.bd', t);
    bd.textContent = '';
    let full = initial || '', shown = 0, closed = false;
    const timer = setInterval(() => {
      if (shown < full.length) {
        shown = Math.min(full.length, shown + 2);
        bd.textContent = full.slice(0, shown);
        bd.scrollTop = bd.scrollHeight;
      }
    }, 28);
    ui.face('smug');
    return {
      update(text) {
        full = text;
      },
      done(sec, keepMs = 2600) {
        if (closed) return;
        closed = true;
        setTimeout(() => {
          clearInterval(timer);
          bd.textContent = full;
          bd.scrollTop = bd.scrollHeight;
          t.classList.add('done');
          $('.ht', t).textContent = `已深度思考（用时 ${sec} 秒）`;
          setTimeout(() => t.classList.remove('show'), keepMs);
        }, Math.min(1500, Math.max(0, (full.length - shown) * 14)));
      },
      close() {
        closed = true;
        clearInterval(timer);
        t.classList.remove('show');
      },
    };
  };

  function initMascot() {
    const m = ui.mascotEl;
    const box = $('.whale-box');
    const place = (x, y) => {
      x = Math.max(4, Math.min(innerWidth - 136, x));
      y = Math.max(160, Math.min(innerHeight - 150, y));
      m.style.left = x + 'px';
      m.style.top = y + 'px';
      m.classList.toggle('left', x < innerWidth / 2);
    };
    ui.place = place;
    const def = () => place(innerWidth - 230, innerHeight - 175); // 避开 B 站右侧的小窗/客服浮动按钮
    DFY.store.get('mascotPos').then((p) => (p && p.x != null ? place(Math.round(p.x * innerWidth), Math.round(p.y * innerHeight)) : def()));
    addEventListener('resize', () => {
      const r = m.getBoundingClientRect();
      place(r.left, r.top);
    });

    let sx, sy, ox, oy, moved = false, down = false, clicks = [];
    box.addEventListener('pointerdown', (e) => {
      down = true;
      moved = false;
      sx = e.clientX;
      sy = e.clientY;
      const r = m.getBoundingClientRect();
      ox = r.left;
      oy = r.top;
      box.setPointerCapture(e.pointerId);
    });
    box.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 6) {
        moved = true;
        m.classList.add('dragging');
        ui.face('shock');
        ui.menu(false);
      }
      if (moved) place(ox + dx, oy + dy);
    });
    box.addEventListener('pointerup', () => {
      down = false;
      if (moved) {
        m.classList.remove('dragging');
        ui.face('happy', 1200);
        const r = m.getBoundingClientRect();
        DFY.store.set({ mascotPos: { x: r.left / innerWidth, y: r.top / innerHeight } });
        return;
      }
      if (m.classList.contains('min')) {
        m.classList.remove('min');
        ui.say(DFY.say('hello'), { face: 'happy' });
        return;
      }
      const now = Date.now();
      clicks = clicks.filter((t) => now - t < 900).concat(now);
      if (clicks.length >= 3) {
        ui.menu(false);
        ui.say(DFY.say('pet'), { face: 'happy', ms: 1800 });
        DFY.fx.emit('star', m.getBoundingClientRect().left + 66, m.getBoundingClientRect().top + 30, 6);
        DFY.sfx.bloop();
        DFY.bump('pets');
        return;
      }
      ui.menu();
    });
    $('.count').addEventListener('click', () => ui.menu(true));

    // 闲聊 & 打瞌睡
    setInterval(() => {
      if (busy || ui.cannonOn || m.classList.contains('min')) return;
      const idle = Date.now() - lastAct;
      if (idle > 180000) {
        ui.face('sleepy');
        if (Math.random() < 0.35) ui.say(DFY.say('sleepy'), { ms: 2400, face: 'sleepy' });
      } else if (idle > 35000 && Math.random() < 0.3) {
        ui.say(DFY.say('idle'), { ms: 2600 });
      }
    }, 15000);
    const wake = () => {
      if (ui.whale.getAttribute('data-face') === 'sleepy') ui.face('normal');
      lastAct = Date.now();
    };
    addEventListener('pointerdown', wake, true);
    addEventListener('keydown', wake, true);
  }

  ui.show = function (on) {
    ui.mascotEl.style.display = on ? '' : 'none';
  };
  ui.setBusy = (b) => (busy = b);

  /** 菜单：items 由 content.js 动态提供 */
  ui.menu = function (force) {
    const menu = $('.menu');
    const open = force != null ? force : !menu.classList.contains('show');
    if (!open) return menu.classList.remove('show');
    const items = (DFY.menuItems && DFY.menuItems()) || [];
    menu.innerHTML = '';
    items.forEach((it, i) => {
      const b = document.createElement('button');
      b.innerHTML = it.label;
      if (it.primary) b.className = 'primary';
      b.style.animationDelay = i * 40 + 'ms';
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.remove('show');
        it.run();
      });
      menu.appendChild(b);
    });
    menu.classList.add('show');
    $('.bubble').classList.remove('show');
    ui.face('happy', 1500);
  };
  ui.minimize = function () {
    ui.mascotEl.classList.add('min');
    ui.menu(false);
  };

  /** 鲸鱼娘嘴巴在屏幕上的位置（泡泡炮发射点） */
  ui.mouth = function () {
    const r = $('.whale-box').getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.55 };
  };

  /* ---------------- 通知、连击 ---------------- */
  ui.toast = function ({ icon = 'whale', t1 = '', t2 = '', t3 = '', ms = 3600, action = null }) {
    const d = document.createElement('div');
    d.className = 'toast';
    d.innerHTML = `<div class="ic">${DFY.icon(icon, 26, 2.2)}</div><div style="min-width:0;flex:1"><div class="t1">${esc(t1)}</div><div class="t2">${esc(t2)}</div><div class="t3">${esc(t3)}</div></div>`;
    if (action) {
      const b = document.createElement('button');
      b.className = 'act';
      b.innerHTML = DFY.icon('undo', 14, 2.6) + esc(action.label);
      b.onclick = () => {
        b.disabled = true;
        d.remove();
        action.run();
      };
      d.appendChild(b);
    }
    // 跟着鲸鱼娘出现，别让用户满屏找
    const box = $('.toasts');
    const mr = ui.mascotEl && ui.mascotEl.style.display !== 'none' ? ui.mascotEl.getBoundingClientRect() : null;
    if (mr) {
      const left = mr.left > 350 ? mr.left - 340 : mr.right + 10;
      Object.assign(box.style, { left: left + 'px', top: Math.max(70, mr.top + 10) + 'px', bottom: 'auto' });
    }
    box.appendChild(d);
    setTimeout(() => d.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateX(-60px)' }], { duration: 300 }).onfinish = () => d.remove(), ms);
  };
  let comboTimer = 0;
  ui.combo = function (n, label) {
    const c = $('.combo');
    $('.x', c).textContent = `COMBO ×${n}`;
    $('.l', c).textContent = label || '已赶走大肥鱼';
    c.classList.add('show');
    c.animate([{ transform: 'translateX(-50%) scale(1.5)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 220, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => c.classList.remove('show'), 1600);
  };

  ui.tip = function (show, x, y, html) {
    const t = $('.tip');
    if (!show) return t.classList.remove('show');
    t.innerHTML = html;
    t.classList.add('show');
    const r = t.getBoundingClientRect();
    t.style.left = Math.min(innerWidth - r.width - 8, Math.max(8, x)) + 'px';
    t.style.top = (y + r.height + 16 > innerHeight ? y - r.height - 12 : y + 16) + 'px';
  };

  /** 通用弹窗 */
  ui.modal = function (html, onClose) {
    const m = $('.modal-root');
    m.innerHTML = `<div class="card"><button class="x-close" title="关闭">${DFY.icon('close', 16, 2.6)}</button>${html}</div>`;
    m.classList.add('show');
    const close = () => {
      m.classList.remove('show');
      m.innerHTML = '';
      onClose && onClose();
    };
    $('.x-close', m).onclick = close;
    m.onclick = (e) => e.target === m && close();
    return { el: $('.card', m), close };
  };

  /* ---------------- 泡泡大炮（destroy any website，鲸鱼娘版） ---------------- */
  ui.cannonOn = false;
  let hits = 0, curTarget = null, hud = null, reticle = null;
  const reticleSVG = `<svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="17" fill="rgba(111,224,255,.15)" stroke="#151a3d" stroke-width="3" stroke-dasharray="6 5"/><circle cx="23" cy="23" r="4.5" fill="#ff5d8a" stroke="#151a3d" stroke-width="1.5"/><path d="M23 0v9M23 37v9M0 23h9M37 23h9" stroke="#151a3d" stroke-width="3" stroke-linecap="round"/></svg>`;

  function up(el) {
    if (!el) return null;
    if (el.parentElement) return el.parentElement;
    const r = el.getRootNode && el.getRootNode();
    return r && r.host ? r.host : null;
  }
  function deepAt(x, y) {
    let list = document.elementsFromPoint(x, y).filter((e) => e !== ui.host && e.tagName !== 'HTML');
    let el = list[0];
    for (let i = 0; el && el.shadowRoot && i < 12; i++) {
      const inner = el.shadowRoot.elementFromPoint(x, y);
      if (!inner || inner === el) break;
      el = inner;
    }
    return el;
  }
  function pickTarget(x, y) {
    let el = deepAt(x, y);
    if (!el || el === document.body) return null;
    // 优先锁定整条评论
    for (let p = el, i = 0; p && i < 40; p = up(p), i++) {
      if (/^BILI-COMMENT-(THREAD|REPLY)-RENDERER$/.test(p.tagName)) return p;
    }
    const vpArea = innerWidth * innerHeight;
    let best = el;
    for (let p = el, i = 0; p && i < 12; p = up(p), i++) {
      if (p === document.body || p === document.documentElement) break;
      const r = p.getBoundingClientRect();
      const a = r.width * r.height;
      if (a > vpArea * 0.45) break;
      best = p;
      if (a >= 5000) break;
    }
    return best;
  }

  ui.cannon = function (on) {
    const layer = $('.cannon');
    ui.cannonOn = on == null ? !ui.cannonOn : on;
    layer.classList.toggle('on', ui.cannonOn);
    const box = $('.target-box');
    if (ui.cannonOn) {
      hits = 0;
      hud = document.createElement('div');
      hud.className = 'hud';
      ui.root.querySelector('.wrap').appendChild(hud);
      reticle = document.createElement('div');
      reticle.className = 'reticle';
      reticle.innerHTML = reticleSVG;
      ui.root.querySelector('.wrap').appendChild(reticle);
      updHud();
      ui.say(DFY.say('cannonOn'), { face: 'smug', ms: 3000 });
      ui.menu(false);
    } else {
      box.style.display = 'none';
      hud && hud.remove();
      reticle && reticle.remove();
      ui.say(DFY.say('cannonOff'), { face: 'happy', ms: 1800 });
    }
  };
  function updHud() {
    if (hud) hud.innerHTML = `${DFY.icon('bubble', 18, 2.2)} 泡泡大炮 · 命中 <b>${hits}</b> · 点哪打哪 · <b>Esc</b> 退出`;
  }

  function bindCannon() {
    const layer = $('.cannon');
    const box = $('.target-box');
    let raf = 0;
    layer.addEventListener('pointermove', (e) => {
      if (reticle) {
        reticle.style.left = e.clientX + 'px';
        reticle.style.top = e.clientY + 'px';
      }
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        layer.style.pointerEvents = 'none';
        curTarget = pickTarget(e.clientX, e.clientY);
        layer.style.pointerEvents = '';
        if (!curTarget) return (box.style.display = 'none');
        const r = curTarget.getBoundingClientRect();
        Object.assign(box.style, { display: 'block', left: r.left - 3 + 'px', top: r.top - 3 + 'px', width: r.width + 6 + 'px', height: r.height + 6 + 'px' });
        box.classList.toggle('fish', !!(DFY.isFishEl && DFY.isFishEl(curTarget)));
      });
    });
    layer.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      layer.style.pointerEvents = 'none';
      const target = pickTarget(e.clientX, e.clientY);
      layer.style.pointerEvents = '';
      fire(e.clientX, e.clientY, target);
    });
    layer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      ui.cannon(false);
    });
    addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && ui.cannonOn) ui.cannon(false);
      },
      true
    );
  }

  async function fire(x, y, target) {
    const o = ui.mouth();
    DFY.sfx.shoot();
    ui.face('angry', 500);
    const p = document.createElement('div');
    p.className = 'proj';
    ui.layer.appendChild(p);
    const mx = (o.x + x) / 2, my = Math.min(o.y, y) - 120;
    const frames = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const bx = (1 - t) * (1 - t) * o.x + 2 * (1 - t) * t * mx + t * t * x;
      const by = (1 - t) * (1 - t) * o.y + 2 * (1 - t) * t * my + t * t * y;
      frames.push({ left: bx + 'px', top: by + 'px', transform: `scale(${0.6 + t * 0.6})` });
    }
    await p.animate(frames, { duration: 360, easing: 'ease-in' }).finished;
    p.remove();
    DFY.sfx.pop();
    DFY.fx.emit('bubble', x, y, 10, { spreadX: 10, spreadY: 10 });
    if (!target || target.dataset.dfyGone) return;
    hits++;
    updHud();
    const isFish = DFY.isFishEl && DFY.isFishEl(target);
    const isComment = /^BILI-COMMENT-(THREAD|REPLY)-RENDERER$/.test(target.tagName);
    DFY.fx.floatText(x, y - 10, isFish ? DFY.say('cannonFish') : DFY.say('cannonHit'), isFish ? '#ff4d7a' : '#2f56e0', isFish ? 26 : 20);
    if (isComment && DFY.onCannonComment) DFY.onCannonComment(target, isFish);
    else DFY.fx.bubblePop(target, { keepSpace: true });
    if (!isFish && isComment && Math.random() < 0.5) ui.say(DFY.say('humanKick'), { face: 'smug' });
    DFY.bump('bubbles');
  }

  const _mount = ui.mount;
  ui.mount = function () {
    _mount();
    bindCannon();
  };
})();
