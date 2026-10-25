/* 运行在页面主世界：读取 B 站评论 Web Component 上的 .data，转交给插件（隔离世界） */
(function () {
  if (window.__dfyMainWorld) return;
  window.__dfyMainWorld = true;

  const ATTR = 'data-dfy-rpid';

  function pick(d, isReply) {
    const m = d.member || {};
    return {
      rpid: String(d.rpid_str || d.rpid),
      root: String(d.root_str || d.root || 0),
      mid: String(m.mid || d.mid_str || d.mid),
      uname: m.uname || '',
      avatar: m.avatar || '',
      sign: m.sign || '',
      level: (m.level_info && m.level_info.current_level) || 0,
      verify: m.official_verify ? m.official_verify.type : -1,
      vip: (m.vip && m.vip.vipStatus) || 0,
      text: (d.content && d.content.message) || '',
      ats: atsOf(d.content),
      ctime: d.ctime || 0,
      like: d.like || 0,
      isReply: !!isReply,
    };
  }

  // 评论里 @ 到的人：[{n: 昵称, m: mid}]
  function atsOf(c) {
    const out = [];
    if (!c) return out;
    const map = c.at_name_to_mid || {};
    for (const n in map) out.push({ n, m: String(map[n]) });
    for (const m of c.members || []) if (m && m.uname && !(m.uname in map)) out.push({ n: m.uname, m: String(m.mid) });
    return out;
  }

  function upMid() {
    try {
      const s = window.__INITIAL_STATE__;
      return String(
        (s && ((s.videoData && s.videoData.owner && s.videoData.owner.mid) || (s.upInfo && s.upInfo.mid) || (s.mediaInfo && s.mediaInfo.up_info && s.mediaInfo.up_info.mid))) || ''
      );
    } catch (e) {
      return '';
    }
  }

  function scan() {
    const out = [];
    const hosts = document.querySelectorAll('bili-comments');
    for (const bc of hosts) {
      const root = bc.shadowRoot;
      if (!root) continue;
      for (const th of root.querySelectorAll('bili-comment-thread-renderer')) {
        visit(th, false, out);
        const rep = th.shadowRoot && th.shadowRoot.querySelector('bili-comment-replies-renderer');
        if (rep && rep.shadowRoot) {
          for (const r of rep.shadowRoot.querySelectorAll('bili-comment-reply-renderer')) visit(r, true, out);
        }
      }
    }
    if (out.length) window.postMessage({ source: 'dfy-main', type: 'comments', items: out, upMid: upMid() }, '*');
  }

  function visit(el, isReply, out) {
    const d = el.data;
    if (!d || !d.member) return;
    const id = String(d.rpid_str || d.rpid);
    if (el.getAttribute(ATTR) === id) return;
    el.setAttribute(ATTR, id);
    out.push(pick(d, isReply));
  }

  let timer = 0;
  function schedule(delay = 250) {
    if (timer) return;
    timer = setTimeout(() => {
      timer = 0;
      try {
        scan();
      } catch (e) {}
    }, delay);
  }
  setInterval(schedule, 1500);

  // 评论组件一挂载 / 一更新就立刻扫描，不用等轮询
  const fast = () => schedule(40);
  for (const tag of ['bili-comment-thread-renderer', 'bili-comment-reply-renderer', 'bili-comment-renderer']) {
    customElements.whenDefined(tag).then(() => {
      const proto = customElements.get(tag).prototype;
      for (const fn of ['connectedCallback', 'updated']) {
        const orig = proto[fn];
        if (typeof orig !== 'function' || orig.__dfy) continue;
        const wrapped = function () {
          const r = orig.apply(this, arguments);
          fast();
          return r;
        };
        wrapped.__dfy = true;
        proto[fn] = wrapped;
      }
    });
  }
  document.addEventListener('scroll', schedule, { passive: true, capture: true });
  window.addEventListener('message', (e) => {
    if (e.source === window && e.data && e.data.source === 'dfy-iso' && e.data.type === 'rescan') {
      for (const bc of document.querySelectorAll('bili-comments')) {
        if (!bc.shadowRoot) continue;
        for (const el of bc.shadowRoot.querySelectorAll('bili-comment-thread-renderer')) {
          el.removeAttribute(ATTR);
          const rep = el.shadowRoot && el.shadowRoot.querySelector('bili-comment-replies-renderer');
          if (rep && rep.shadowRoot) for (const r of rep.shadowRoot.querySelectorAll('bili-comment-reply-renderer')) r.removeAttribute(ATTR);
        }
      }
      schedule();
    }
  });
})();
