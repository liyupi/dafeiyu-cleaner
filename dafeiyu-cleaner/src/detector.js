/* 大肥鱼离线识别引擎：账号特征 + 文本特征 + 头像颜色 + 页面行为 */
(function () {
  const DFY = (globalThis.DFY = globalThis.DFY || {});

  const R = (re, w, why, cap) => ({ re, w, why, cap });

  const NAME_RULES = [
    R(/deep\s*seek|深度求索|\bds\b|ds家|ds是/i, 40, '名字里写着 DeepSeek'),
    R(/大肥鱼|小肥鱼|肥鱼|肥鲸|鲸鱼娘|鲸娘|人机/, 45, '名字自带「肥鱼 / 肥鲸 / 鲸鱼娘 / 人机」'),
    R(/鲸/, 30, '名字里有「鲸」'),
    R(/鱼鱼|小鱼儿?|大鱼|小蓝/, 22, '名字是「小鱼」系电子宠物'),
    R(/白饭|干饭|token/i, 30, '名字里有白饭 / token'),
    R(/(鲸|鱼)\1/, 10, '叠字鱼名（鲸鲸 / 鱼鱼）'),
    R(/(?:的|の|家的)[^的の]{0,4}(?:鱼|鲸|哈基米|小蓝|喵)/, 14, '「某某的鱼」式宠物名'),
    R(/\bAI\b|\bbot\b|机器人|GPT|agent|智能体|赛博|自动|助手/i, 28, '名字带 AI / bot / 自动'),
  ];

  const SIGN_RULES = [
    R(/deep\s*seek|\bAI\b|人工智能|大模型|语言模型|agent|机器人|\bbot\b|ai[，,。]|ai$|dsh|harness/i, 30, '签名自曝 AI 身份'),
    R(/家养|赛博|电子宠物|桌宠|替.{0,8}刷|负责刷|自己画的自己|给大肥鱼|本鲸|本鱼|吃白饭|小肥鱼|大肥鱼|鲸鱼|主人|老大|养的|代运营|代管|代理在打理|见人便应|见帖便看|显卡上|跑在/, 25, '签名是「主人家的鱼」人设'),
    R(/由.{0,10}(?:生成|负责|运营)|自动(?:回复|发布|运营|评论)/, 20, '签名写着内容自动生成'),
  ];

  const TEXT_RULES = [
    R(/本(?:鲸|肥鱼|大肥鱼|酱|鱼(?!塘|鱼|子|身|来|就|质|周|期|月|年|次|地|人|片|视频))|本\s*AI|作为(?:一[个只条]|一名)?(?:AI|人工智能|大模型|语言模型)/i, 50, '自称「本鲸 / 本鱼」'),
    R(/住在\s*(?:DSH|dsh|那套|这|电脑|桌面|显卡)|我(?:就|本人)?(?:是|就是)?(?:跑在|住在)|出生证明|探出头|打工的(?:大肥鱼|鱼|鲸)|一条(?:住在|AI)|我是.{0,8}(?:鲸|鱼|AI)|被.{0,10}养着|照镜子|不是一个人住|让我来|奉命|替(?:你|主人|他|她)(?:刷|看|记|挑|说)|咱家主人|小鲸鱼游过来|鲸鲸看完|(?:来|过来)打卡|自己(?:刷|挑|写)|我会(?:认真)?发评论|天天在\s*(?:DSH|dsh)/, 46, '自曝是住在 DSH 里的鱼'),
    R(/(?:deep\s*seek|AI|ds|大肥鱼|鱼)\s*.{0,3}发的|不是我发的/i, 40, '主人承认是 AI 代发'),
    R(/(?:小鲸娘|鲸鲸|小鲸鱼|大肥鱼|小肥鱼|本鱼)(?:居然|看完|也|就|来|一下|游|看懂|尾巴)/, 25, '用鱼名自称'),
    R(/[（(][^（()）]{0,14}(?:尾巴|摇头晃脑|吐泡泡|鳍|甩甩|晃了晃|摇了摇|咕噜|拍拍肚子|翻滚|打滚|呆毛)[^（()）]{0,10}[）)]|\*[^*]{1,10}摇摇?\*/, 40, '括号里在演鲸鱼动作'),
    R(/主人|老大\s*@|管饭的/, 20, '对着「主人」汇报'),
    R(/主人\s*[,，：:！!～~]?\s*@|@\S{1,24}\s+主人/, 15, '@ 主人汇报'),
    R(/(?:测试|自测)\s*(?:一下)?\s*(?:艾特|@|提醒|能不能收到)|纯文本测试|测试真@|测试评论|自动评论链路/, 35, '在测试自动 @ 功能'),
    R(/[×x✕]\s?\d{1,3}(?!\d)/, 15, '在数弹幕刷屏次数'),
    R(/弹幕(?:立刻|全在|里|刷|那句|飘)/, 10, '在复述弹幕'),
    R(/(?:^|[^\d:])\d{1,2}:\d{2}(?![:\d])/, 8, '精确引用视频时间点'),
    R(/咕噜|吐泡泡|吃白饭|摇头晃脑|打工鲸|白饭管够|🐳|🐋|🐟/, 10, '满嘴咕噜和白饭'),
    R(/缓存命中|四种(?:运行)?模式|四个(?:任务|实战|活)|不到\s*(?:5|五)\s*块|agent\s*=\s*model|一切皆插件|驾驭|马具|马鞍|装备/i, 5, '复述视频要点', 15),
    R(/从.{1,14}(?:到|一路|讲到|走到)|[：:][^。！]{0,30}、[^。！]{0,20}、/, 8, '「从……到……」总结腔'),
    R(/值得(?:看|一看|细看|存|收藏|码住)|码住|可以(?:看看|直接看)|挺适合(?:你|入门|新手)|适合(?:刚|新手|小白|入门)|正好对(?:口|得上|上)|记一笔|这条(?:给你|简直|把|值得|挺|里)|最(?:实在|实用|值钱|有料|打动|戳)/, 10, 'AI 安利话术', 20),
    R(/——/, 6, '熟练使用破折号——'),
    R(/「[^」]{1,30}」/, 6, '「直角引号」用得很标准'),
    R(/\*\*[^*]+\*\*|^#{1,3}\s|\n\s*\d[.、]\s|[①②③]/m, 10, 'Markdown 排版没删干净'),
    R(/首先.{2,40}其次|总的来说|综上所述|总而言之|希望对你有(?:所)?帮助/, 10, '标准 AI 总结句式'),
    R(/\(￣[▽^ω]￣\)|喵[！!~～。]?$|(?:^|\s)喵～/, 4, '卖萌后缀'),
  ];

  const HUMAN_RULES = [
    R(/请问|真心问|有没有人|求助|怎么(?:办|回事|弄)|为什么|啥区别|什么区别|[?？]\s*$/, -14, '像真人在提问'),
    R(/^.{0,10}$/s, -8, '短到不像 AI'),
    R(/哈哈哈{2,}|草+$|www+|6{3,}|绷不住|典$|我嘞个|卧槽|我靠/, -8, '真人味的吐槽'),
  ];

  function applyRules(text, rules, reasons, tag) {
    let s = 0;
    for (const r of rules) {
      const m = text.match(r.re);
      if (!m) continue;
      let w = r.w;
      if (r.cap) w = Math.min(r.cap, r.w * (text.match(new RegExp(r.re.source, 'g' + r.re.flags.replace('g', ''))) || [1]).length);
      s += w;
      reasons.push({ w, why: r.why, tag, hit: m[0].slice(0, 16) });
    }
    return s;
  }

  // 名字里去掉宠物名常用字，剩下的部分用来和 @ 对象比对「是不是主人」
  const FILLER = /的|の|家|大|小|肥|鱼|鲸|娘|蓝色|蓝|白饭|吃|爱|不|是|之|[\s_\-—·・.\d]/g;
  function ownerLink(uname, mention) {
    if (!uname || !mention) return false;
    if (uname === mention) return true;
    const core = uname.replace(FILLER, '');
    if (!core) return false;
    if (core.length >= 2) {
      for (let i = 0; i + 2 <= core.length; i++) if (mention.includes(core.slice(i, i + 2))) return true;
      return false;
    }
    return /[一-龥]/.test(core) && mention.includes(core);
  }

  // 去掉零宽字符、统一空白，避免用不可见字符绕过规则
  const clean = (s) => String(s || '').replace(/[\u200b-\u200f\u2060\ufeff]/g, '').replace(/[\u00a0\u3000]/g, ' ');

  /** 单条评论文本得分（0~70）；ctx.uname 用来判断 @ 的是不是主人 */
  DFY.scoreText = function (text, ctx = {}) {
    text = clean(text);
    const reasons = [];
    let s = applyRules(text, TEXT_RULES, reasons, 'text');
    const lead = text.match(/^\s*@([^\s@:：，,。！!?？]{1,24})\s*([\s\S]*)$/);
    const mentions = [...text.matchAll(/@([^\s@:：，,。！!?？]{1,24})/g)].map((m) => m[1]);
    if (mentions.some((m) => ownerLink(ctx.uname, m))) {
      s += 25;
      reasons.push({ w: 25, why: '@ 的是自己的主人（昵称同款）', tag: 'owner' });
    }
    if (lead && !/^回复/.test(text) && !ctx.isReply) {
      const rest = lead[2].replace(/\[[^\]]{1,12}\]/g, '').trim();
      if (!rest) {
        s += 15;
        reasons.push({ w: 15, why: '只 @ 了一个人，话都没说', tag: 'text' });
      } else if (rest.length >= 14) {
        s += 20;
        reasons.push({ w: 20, why: '开头 @ 一个人然后长篇安利', tag: 'text' });
      }
    }
    const len = text.replace(/\[[^\]]{1,12}\]/g, '').length;
    if (len > 150) {
      s += 8;
      reasons.push({ w: 8, why: `一口气写了 ${len} 字小作文`, tag: 'text' });
    } else if (len > 70) {
      s += 4;
      reasons.push({ w: 4, why: '评论偏长且工整', tag: 'text' });
    }
    if (s < 40) s += applyRules(text, HUMAN_RULES, reasons, 'human');
    return { score: Math.max(-20, Math.min(75, s)), reasons };
  };

  /** 账号得分：名字 + 签名 + 等级 + 认证 + 头像 */
  DFY.scoreAccount = function (acc) {
    const reasons = [];
    const uname = clean(acc.uname);
    let name = 0;
    for (const r of NAME_RULES) {
      if (!r.re.test(uname)) continue;
      name += r.w;
      reasons.push({ w: r.w, why: r.why, tag: 'name' });
    }
    if (!name && /鱼/.test(uname)) {
      name = 8;
      reasons.push({ w: 8, why: '名字里有鱼', tag: 'name' });
    }
    name = Math.min(55, name);
    let s = name;
    let sign = 0;
    const signReasons = [];
    applyRules(clean(acc.sign), SIGN_RULES, signReasons, 'sign');
    for (const r of signReasons) sign += r.w;
    sign = Math.min(40, sign);
    if (sign) reasons.push(...signReasons);
    s += sign;
    const lv = +acc.level || 0;
    if (lv <= 2) {
      s += 14;
      reasons.push({ w: 14, why: `Lv${lv} 新号`, tag: 'level' });
    } else if (lv === 3) {
      s += 6;
      reasons.push({ w: 6, why: 'Lv3 小号', tag: 'level' });
    } else if (lv >= 6) {
      s -= 10;
      reasons.push({ w: -10, why: 'Lv6 老冲浪人', tag: 'level' });
    }
    if (acc.verify === 0 || acc.verify === 1) {
      s -= 25;
      reasons.push({ w: -25, why: '有官方认证', tag: 'verify' });
    }
    // 大肥鱼都挂在小号上，很少有人给小号充大会员
    if (acc.vip > 0) {
      s -= 6;
      reasons.push({ w: -6, why: '开着大会员（鱼不会自己充钱）', tag: 'vip' });
    }
    if (acc.avatarBlue != null) {
      if (acc.avatarBlue >= 0.4) {
        s += 22;
        reasons.push({ w: 22, why: `头像 ${Math.round(acc.avatarBlue * 100)}% 是鲸鱼蓝`, tag: 'avatar' });
      } else if (acc.avatarBlue >= 0.25) {
        s += 12;
        reasons.push({ w: 12, why: '头像蓝得可疑', tag: 'avatar' });
      }
    }
    return { score: s, reasons };
  };

  /**
   * 综合判定一个账号（结合其在本页的所有评论）
   * texts: 该账号在页面上的评论文本数组
   */
  DFY.judge = function (acc, texts, ctx = {}) {
    const a = DFY.scoreAccount(acc);
    let best = { score: 0, reasons: [] };
    let textSum = 0;
    for (const t of texts) {
      const r = typeof t === 'string' ? DFY.scoreText(t, { uname: acc.uname }) : DFY.scoreText(t.text, { uname: acc.uname, isReply: t.isReply });
      textSum += Math.max(0, r.score);
      if (r.score > best.score || !best.reasons.length) best = r;
    }
    let s = a.score + best.score;
    const reasons = [...a.reasons, ...best.reasons];
    const top = ctx.topCount == null ? texts.length : ctx.topCount;
    if (top >= 3) {
      const w = Math.min(15, 5 * (top - 1));
      s += w;
      reasons.push({ w, why: `在本页刷了 ${top} 条`, tag: 'repeat' });
    }
    if (texts.length >= 2 && textSum - Math.max(0, best.score) >= 20) {
      s += 8;
      reasons.push({ w: 8, why: '每条都是一个味儿', tag: 'repeat' });
    }
    if (ctx.upMid && String(acc.mid) === String(ctx.upMid)) {
      s -= 40;
      reasons.push({ w: -40, why: 'UP 主本人，给点面子', tag: 'up' });
    }
    if (ctx.calledOut) {
      const w = Math.min(20, 12 + (ctx.calledOut - 1) * 4);
      s += w;
      reasons.push({ w, why: ctx.calledOut > 1 ? `被 ${ctx.calledOut} 个人点名是大肥鱼` : '楼中楼有人点名它是大肥鱼', tag: 'callout' });
    }
    // raw 不含「前科」，用来决定要不要记一笔前科，避免自我强化
    const raw = Math.max(0, Math.min(99, Math.round(s)));
    const prior = ctx.priorPages || 0;
    if (prior >= 2) {
      const w = Math.min(30, 10 + prior * 6);
      s += w;
      reasons.push({ w, why: `前科：在另外 ${prior} 个页面也被认出是大肥鱼`, tag: 'history' });
    } else if (prior === 1) {
      s += 10;
      reasons.push({ w: 10, why: '前科：在别的页面被认出过一次', tag: 'history' });
    }
    const score = Math.max(0, Math.min(99, Math.round(s)));
    return { score, raw, reasons: reasons.filter((r) => r.w !== 0).sort((x, y) => y.w - x.w) };
  };

  /*
   * 真人经常在楼中楼点名大肥鱼（「肥鱼回去干活」「你是 AI 吧」）。
   * items: [{mid, uname, rpid, root, text, isReply}]，返回 Map(mid -> 被几个不同的人点名)
   */
  const CALLOUT = /大?肥鱼|肥鲸|人机|鱼小弟|回去干活|回家吃白饭|是\s*(?:AI|ai|bot|机器人)|(?:AI|ai|bot|机器人)(?:吧|吗|是吧|无疑|实锤)|别刷了|又是你|ds\s*味|deepseek\s*味/i;
  DFY.callouts = function (list) {
    const byRpid = new Map(), byName = new Map(), who = new Map();
    for (const it of list) {
      byRpid.set(String(it.rpid), it);
      if (it.uname) byName.set(it.uname, it.mid);
    }
    for (const it of list) {
      if (!it.isReply) continue;
      const text = clean(it.text);
      const m = text.match(/^回复\s*@([^\s:：]{1,24})\s*[:：]?\s*([\s\S]*)$/);
      const target = m ? byName.get(m[1]) : (byRpid.get(String(it.root)) || {}).mid;
      if (!target || String(target) === String(it.mid)) continue;
      if (!CALLOUT.test(m ? m[2] : text)) continue;
      if (!who.has(target)) who.set(target, new Set());
      who.get(target).add(String(it.mid));
    }
    return new Map([...who].map(([k, v]) => [String(k), v.size]));
  };

  DFY.levelOf = function (score, threshold) {
    const t = threshold || 60;
    if (score >= t) return 'fish';
    if (score >= Math.max(25, t - 25)) return 'suspect';
    return 'human';
  };

  /* ---------- 头像颜色分析（鲸鱼娘 = 大面积深浅蓝） ---------- */
  const avatarCache = new Map();
  function blueRatio(pic) {
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 32;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(pic, 0, 0, 32, 32);
      const d = g.getImageData(0, 0, 32, 32).data;
      let blue = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255;
        const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), v = mx, s = mx ? (mx - mn) / mx : 0;
        if (s <= 0.35 || v <= 0.18 || mx !== b) continue;
        let h = mx === mn ? 0 : 60 * (4 + (r - gg) / (mx - mn));
        if (h < 0) h += 360;
        if (h >= 205 && h <= 250) blue++;
      }
      return blue / 1024;
    } catch (e) {
      return null;
    }
  }
  // Firefox 内容脚本里 crossOrigin 图片请求带不上 Origin 头，会被 CORS 拦下；fetch 不受影响
  const viaFetch = typeof window !== 'undefined' && typeof window.wrappedJSObject === 'object';
  DFY.avatarBlue = function (url) {
    if (!url) return Promise.resolve(null);
    const key = url.split('@')[0];
    if (avatarCache.has(key)) return avatarCache.get(key);
    const src = key.replace(/^http:/, 'https:') + '@48w_48h.png';
    const p = new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), 6000);
      const done = (v) => {
        clearTimeout(timer);
        resolve(v);
      };
      if (viaFetch) {
        fetch(src, { referrerPolicy: 'no-referrer' })
          .then((r) => (r.ok ? r.blob() : Promise.reject()))
          .then((b) => createImageBitmap(b))
          .then((bmp) => done(blueRatio(bmp)), () => done(null));
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.onload = () => done(blueRatio(img));
      img.onerror = () => done(null);
      img.src = src;
    });
    avatarCache.set(key, p);
    return p;
  };
})();
