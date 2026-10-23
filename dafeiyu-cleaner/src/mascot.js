/*
 * 鲸鱼娘清道夫 · 矢量形象
 * 蓬松的长卷发（深海蓝 → 亮蓝发尾）、圆圈呆毛、
 * 平伸的鲸鳍耳（藏青上缘 + 白色绒毛下缘）、白色蕾丝头饰、侧边蓝色蝴蝶结、
 * 藏青女仆装（白领、蓝宝石领结、小鲸鱼围裙、金色刺绣裙摆、白色衬裙）、鲸鱼尾巴。
 * 细藏青线稿 + 柔和赛璐璐阴影。
 */
(function () {
  const DFY = (globalThis.DFY = globalThis.DFY || {});
  let uid = 0;
  const LINE = '#1a1f4d';

  // 沿圆弧的蕾丝褶边（头饰）
  function lace(cx, cy, r, a0, a1, n, bump) {
    const pt = (a, rr) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    let [x, y] = pt(a0, r);
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    for (let i = 1; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      const am = a0 + ((a1 - a0) * (i - 0.5)) / n;
      const [qx, qy] = pt(am, r + bump);
      [x, y] = pt(a, r);
      d += ` Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    const [ix, iy] = pt(a1, r - 8);
    const [jx, jy] = pt(a0, r - 8);
    d += ` L${ix.toFixed(1)} ${iy.toFixed(1)} A${r - 8} ${r - 8} 0 0 0 ${jx.toFixed(1)} ${jy.toFixed(1)} Z`;
    let holes = '';
    for (let i = 0; i < n; i++) {
      const [hx, hy] = pt(a0 + ((a1 - a0) * (i + 0.5)) / n, r + 1.5);
      holes += `<circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="1.3"/>`;
    }
    return { d, holes };
  }

  // 一排向下的半圆褶边
  function scallop(x0, x1, y, n, depth) {
    const w = (x1 - x0) / n;
    let d = `M${x0} ${y - 4}`;
    for (let i = 0; i < n; i++) d += ` q${w / 2} ${depth} ${w} 0`;
    d += ` L${x1} ${y - 6} L${x0} ${y - 6} Z`;
    return d;
  }

  function eye(cx, flip) {
    const s = flip ? -1 : 1;
    const x = (v) => (cx + v * s).toFixed(1);
    return `<g>
      <path d="M${x(-11)} 106 C${x(-11)} 96 ${x(-6)} 92 ${cx} 92 C${x(6)} 92 ${x(11)} 96 ${x(11)} 106 C${x(11)} 117 ${x(6)} 122 ${cx} 122 C${x(-6)} 122 ${x(-11)} 117 ${x(-11)} 106 Z" fill="url(#IRIS)" stroke="${LINE}" stroke-width="1"/>
      <path d="M${x(-10)} 101 C${x(-6)} 96 ${x(6)} 96 ${x(10)} 101 L${x(10)} 97 C${x(6)} 93 ${x(-6)} 93 ${x(-10)} 97 Z" fill="#0b1240" opacity=".55"/>
      <ellipse cx="${cx}" cy="107" rx="5" ry="7" fill="#0a1150" opacity=".75"/>
      <path d="M${x(-8)} 114 C${x(-4)} 120 ${x(4)} 120 ${x(8)} 114 C${x(4)} 117 ${x(-4)} 117 ${x(-8)} 114 Z" fill="#9fdcff" opacity=".9"/>
      <ellipse cx="${x(-4.2)}" cy="101" rx="3.8" ry="4.8" fill="#fff"/>
      <circle cx="${x(4.6)}" cy="114" r="1.9" fill="#fff"/>
      <circle cx="${x(5.2)}" cy="99.5" r="1.1" fill="#fff" opacity=".9"/>
      <path d="M${x(-13.5)} 101 Q${x(-11)} 90.5 ${cx} 90 Q${x(10)} 90.5 ${x(13)} 98" stroke="#141634" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M${x(12)} 96.5 l${(3.6 * s).toFixed(1)} 1.6 M${x(-13)} 100 l${(-2 * s).toFixed(1)} 2" stroke="#141634" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M${x(-5)} 123.4 q${(5 * s).toFixed(1)} 1.3 ${(10 * s).toFixed(1)} 0" stroke="${LINE}" stroke-width=".9" fill="none" opacity=".5"/>
    </g>`;
  }

  /**
   * 生成鲸鱼娘 SVG。
   * 表情 data-face：normal | happy | angry | shock | smug | sleepy | cry
   * 姿势 data-pose：idle | snap | cheer
   */
  DFY.mascotSVG = function (opts = {}) {
    const id = 'w' + ++uid;
    const face = opts.face || 'normal';
    const pose = opts.pose || 'idle';
    const P = (s) => s.replace(/url\(#(\w+)\)/g, (_, k) => `url(#${id}${k})`);
    const band = lace(100, 96, 56, Math.PI * 1.07, Math.PI * 1.93, 14, 9);
    const band2 = lace(100, 96, 51, Math.PI * 1.11, Math.PI * 1.89, 12, 5);
    const finL = `<path d="M61 95 C49 88 27 89 11 103 C21 103 29 105 33 111 C42 111 52 108 61 104 Z" fill="url(#FIN)" stroke="${LINE}" stroke-width="1.5"/>
      <path d="M11 103 C21 103 29 105 33 111 C42 111 52 108 61 104 L59 110 C51 116 41 119 33 117 C29 121 23 119 22 115 C16 115 12 111 11 103 Z" fill="#f1f3ff" stroke="${LINE}" stroke-width="1.3"/>
      <path d="M20 109 q2 3 5 2 M29 113 q2 3 5 2 M40 114 q2 2.5 5 1.5 M50 111 q2 2 4 1" stroke="#b8c4ec" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path d="M22 97 Q36 93 52 97" stroke="#4a64d6" stroke-width="1.2" fill="none" opacity=".8"/>`;
    return P(`
<svg class="dfy-whale" data-face="${face}" data-pose="${pose}" viewBox="0 0 200 232" xmlns="http://www.w3.org/2000/svg" aria-label="鲸鱼娘">
  <defs>
    <linearGradient id="${id}HAIR" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#26307f"/><stop offset=".4" stop-color="#3546a8"/><stop offset=".7" stop-color="#3f5cc2"/><stop offset=".88" stop-color="#4682e0"/><stop offset="1" stop-color="#62aef5"/>
    </linearGradient>
    <linearGradient id="${id}LOCK" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2c3a96"/><stop offset=".55" stop-color="#3e58c0"/><stop offset=".85" stop-color="#4a88e6"/><stop offset="1" stop-color="#6db8f8"/>
    </linearGradient>
    <linearGradient id="${id}FRONT" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2d3990"/><stop offset=".55" stop-color="#3a4eb2"/><stop offset="1" stop-color="#4a66cc"/>
    </linearGradient>
    <linearGradient id="${id}IRIS" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#14206a"/><stop offset=".42" stop-color="#2a54d0"/><stop offset=".78" stop-color="#4a8eef"/><stop offset="1" stop-color="#9ad6ff"/>
    </linearGradient>
    <linearGradient id="${id}DRESS" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a2160"/><stop offset="1" stop-color="#242f86"/>
    </linearGradient>
    <linearGradient id="${id}FIN" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a3592"/><stop offset="1" stop-color="#18205e"/>
    </linearGradient>
    <linearGradient id="${id}TAIL" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b2266"/><stop offset=".6" stop-color="#2a45b8"/><stop offset="1" stop-color="#4a9af0"/>
    </linearGradient>
    <radialGradient id="${id}SKIN" cx=".5" cy=".42" r=".62">
      <stop offset="0" stop-color="#fff8f2"/><stop offset="1" stop-color="#ffe9dc"/>
    </radialGradient>
    <radialGradient id="${id}BLUSH" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#ff9fb4" stop-opacity=".75"/><stop offset="1" stop-color="#ff9fb4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse class="shadow" cx="100" cy="227" rx="50" ry="4.5" fill="${LINE}" opacity=".13"/>
  <g class="bob" stroke-linejoin="round">
    <!-- 鲸鱼尾巴 -->
    <g class="tail">
      <path d="M126 200 C146 204 160 196 168 180 C161 172 159 160 163 150 C171 156 176 165 177 173 C181 164 188 158 195 158 C194 171 187 183 176 188 C166 206 146 216 126 213 Z" fill="url(#TAIL)" stroke="${LINE}" stroke-width="1.5"/>
      <path d="M131 209 C150 208 164 198 172 186" stroke="#9cc6ff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/>
      <path d="M166 160 q4 7 10 8 M181 167 q5 2 9 0" stroke="#6ea6ff" stroke-width="1" fill="none" opacity=".8"/>
    </g>
    <!-- 后发：蓬松长卷发 -->
    <path class="hair-back" d="M100 42 C60 42 32 62 31 98 C30 114 20 124 22 142 C24 156 12 166 16 182 C19 194 10 204 18 212 C24 218 32 214 34 208 C38 216 48 218 54 212 C58 218 66 218 70 212 L70 198 L130 198 L130 212 C134 218 142 218 146 212 C152 218 162 216 166 208 C168 214 176 218 182 212 C190 204 181 194 184 182 C188 166 176 156 178 142 C180 124 170 114 169 98 C168 62 140 42 100 42 Z" fill="url(#HAIR)" stroke="${LINE}" stroke-width="1.5"/>
    <path d="M36 112 C26 132 34 148 26 166 C20 182 28 194 22 208 C31 202 37 188 35 174 C33 158 43 142 41 122 Z" fill="#2c3b98" opacity=".75"/>
    <path d="M164 112 C174 132 166 148 174 166 C180 182 172 194 178 208 C169 202 163 188 165 174 C167 158 157 142 159 122 Z" fill="#2c3b98" opacity=".75"/>
    <path d="M46 128 C41 148 51 162 45 180 C41 194 49 204 45 213 C53 205 55 191 53 177 C51 161 57 145 53 129 Z" fill="#5277dc" opacity=".55"/>
    <path d="M154 128 C159 148 149 162 155 180 C159 194 151 204 155 213 C147 205 145 191 147 177 C149 161 143 145 147 129 Z" fill="#5277dc" opacity=".55"/>
    <g fill="none" stroke-linecap="round">
      <path d="M30 118 C24 138 30 152 23 170 M170 118 C176 138 170 152 177 170" stroke="#1d2670" stroke-width="1" opacity=".7"/>
      <path d="M58 132 C56 150 62 164 58 182 M142 132 C144 150 138 164 142 182" stroke="#1d2670" stroke-width="1" opacity=".55"/>
      <path d="M38 136 C35 152 41 164 36 178 M162 136 C165 152 159 164 164 178" stroke="#8fa8f0" stroke-width="1.2" opacity=".7"/>
      <path d="M20 210 c2 -6 9 -6 9 0 c0 4 -5 4 -4 0 M41 213 c2 -5 8 -5 8 0 c0 3 -4 3 -3 0 M58 213 c2 -5 7 -5 7 0 c0 3 -3 3 -3 0" stroke="#a9d6ff" stroke-width="1.2"/>
      <path d="M180 210 c-2 -6 -9 -6 -9 0 c0 4 5 4 4 0 M159 213 c-2 -5 -8 -5 -8 0 c0 3 4 3 3 0 M142 213 c-2 -5 -7 -5 -7 0 c0 3 3 3 3 0" stroke="#a9d6ff" stroke-width="1.2"/>
    </g>
    <!-- 鲸鳍耳 -->
    <g class="fin fin-l"><g transform="translate(61 100) scale(.86) translate(-61 -100)">${finL}</g></g>
    <g class="fin fin-r"><g transform="translate(200 0) scale(-1 1) translate(61 100) scale(.86) translate(-61 -100)">${finL}</g></g>
    <!-- 白袜 + 藏蓝鞋 -->
    <g stroke="${LINE}" stroke-width="1.3">
      <path d="M84 206 L84 218 L95 218 L95 206 Z" fill="#fff"/><path d="M105 206 L105 218 L116 218 L116 206 Z" fill="#fff"/>
      <path d="M81 219 C81 215 98 215 98 219 C98 224 94 226 89.5 226 C85 226 81 224 81 219 Z" fill="#1d2668"/>
      <path d="M102 219 C102 215 119 215 119 219 C119 224 115 226 110.5 226 C106 226 102 224 102 219 Z" fill="#1d2668"/>
    </g>
    <path d="M84 216.5 L95 216.5 M105 216.5 L116 216.5" stroke="#d1ab55" stroke-width="1.2"/>
    <!-- 白色衬裙 + 藏青裙 -->
    <path d="${scallop(56, 144, 209, 11, 6)}" fill="#fff" stroke="${LINE}" stroke-width="1.2"/>
    <path d="M77 150 C71 170 60 186 56 203 Q100 213 144 203 C140 186 129 170 123 150 Z" fill="url(#DRESS)" stroke="${LINE}" stroke-width="1.6"/>
    <path d="M60 195 Q100 205 140 195" stroke="#d1ab55" stroke-width="1.4" fill="none"/>
    <path d="M62 199.5 q3 -3 6 0 q3 -3 6 0 q3 -3 6 0 M120 199.5 q3 -3 6 0 q3 -3 6 0 q3 -3 6 0" stroke="#d1ab55" stroke-width="1" fill="none"/>
    <path d="M70 180 q4 8 2 16 M130 180 q-4 8 -2 16" stroke="#11174a" stroke-width="1" fill="none" opacity=".6"/>
    <!-- 围裙 -->
    <path d="M87 154 L113 154 C119 170 123 185 122 200 Q100 206 78 200 C77 185 81 170 87 154 Z" fill="#fff" stroke="${LINE}" stroke-width="1.3"/>
    <path d="${scallop(78, 122, 203, 7, 4.5)}" fill="#fff" stroke="${LINE}" stroke-width="1.1"/>
    <path d="M84 168 Q100 172 116 168" stroke="#e3e8f8" stroke-width="2.4" fill="none"/>
    <g class="emblem" transform="translate(100 184)">
      <path d="M-10 0 C-10 -6 -3 -8 3 -6 C7 -5 9 -2 9 1 C12 -2 15 -3 16 -6 C17 -1 15 3 11 4 C7 7 -6 7 -10 0 Z" fill="#3a6df0" stroke="${LINE}" stroke-width=".8"/>
      <circle cx="-4" cy="-2" r="1" fill="#fff"/>
      <path d="M-2 -9 q1 -3 0 -5 M1 -9 q2 -2 3 -4" stroke="#5aa8ff" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    </g>
    <!-- 衣领 + 领结 + 金扣 -->
    <path d="M77 150 C84 143 92 140 100 140 C108 140 116 143 123 150 L114 158 L100 152 L86 158 Z" fill="url(#DRESS)" stroke="${LINE}" stroke-width="1.3"/>
    <path d="M85 141 Q91 154 100 150 Q109 154 115 141 Q108 145 100 145 Q92 145 85 141 Z" fill="#fff" stroke="${LINE}" stroke-width="1.2"/>
    <path d="M86 143 q2 3 4 1 M91 146 q2 3 4 1 M105 147 q2 2 4 -1 M110 144 q2 2 4 -1" stroke="#c7cfec" stroke-width=".9" fill="none"/>
    <g class="neckbow">
      <path d="M100 149 L88 143 Q86 149 89 155 Z M100 149 L112 143 Q114 149 111 155 Z" fill="#141a48" stroke="${LINE}" stroke-width="1.1"/>
      <path d="M97.5 151 L95 160 L98.5 157.5 Z M102.5 151 L105 160 L101.5 157.5 Z" fill="#141a48" stroke="${LINE}" stroke-width=".9"/>
      <circle cx="100" cy="149" r="3.2" fill="#43a4ff" stroke="#d1ab55" stroke-width="1.2"/>
      <circle cx="99" cy="148" r="1" fill="#fff"/>
    </g>
    <circle cx="100" cy="163" r="1.5" fill="#d8b45a" stroke="${LINE}" stroke-width=".6"/>
    <!-- 手臂（泡泡袖 + 蕾丝袖口） -->
    <g class="arm arm-l">
      <path d="M78 148 C64 150 56 164 58 176 C65 180 73 175 77 167 Z" fill="url(#DRESS)" stroke="${LINE}" stroke-width="1.5"/>
      <path d="${scallop(55, 71, 179, 3, 4)}" fill="#fff" stroke="${LINE}" stroke-width="1" transform="rotate(14 63 177)"/>
      <circle cx="62.5" cy="184" r="5.2" fill="#ffefe6" stroke="${LINE}" stroke-width="1.2"/>
    </g>
    <g class="arm arm-r">
      <path d="M122 148 C136 150 144 164 142 176 C135 180 127 175 123 167 Z" fill="url(#DRESS)" stroke="${LINE}" stroke-width="1.5"/>
      <path d="${scallop(129, 145, 179, 3, 4)}" fill="#fff" stroke="${LINE}" stroke-width="1" transform="rotate(-14 137 177)"/>
      <circle cx="137.5" cy="184" r="5.2" fill="#ffefe6" stroke="${LINE}" stroke-width="1.2"/>
    </g>
    <!-- 脸 -->
    <path d="M54 94 C54 66 74 54 100 54 C126 54 146 66 146 94 C146 120 128 138 100 138 C72 138 54 120 54 94 Z" fill="url(#SKIN)" stroke="${LINE}" stroke-width="1.5"/>
    <path d="M56 98 Q100 112 144 98 L144 104 Q100 119 56 104 Z" fill="#f6d6c8" opacity=".5"/>
    <!-- 五官 -->
    <g class="eyes">
      <g class="e e-normal">${eye(80, false)}${eye(120, true)}</g>
      <g class="e e-happy" stroke="#141634" stroke-width="3.2" fill="none" stroke-linecap="round"><path d="M70 110 Q80 97 90 110"/><path d="M110 110 Q120 97 130 110"/></g>
      <g class="e e-angry" stroke="#141634" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M70 99 L88 106.5 L70 114"/><path d="M130 99 L112 106.5 L130 114"/></g>
      <g class="e e-shock"><circle cx="80" cy="106" r="10.5" fill="#fff" stroke="${LINE}" stroke-width="2"/><circle cx="80" cy="106" r="3.2" fill="#1b2a8a"/><circle cx="120" cy="106" r="10.5" fill="#fff" stroke="${LINE}" stroke-width="2"/><circle cx="120" cy="106" r="3.2" fill="#1b2a8a"/></g>
      <g class="e e-smug">
        <path d="M69 106 Q80 103 91 106 Q90 119 80 119 Q70 119 69 106 Z" fill="url(#IRIS)" stroke="${LINE}" stroke-width="1"/>
        <path d="M109 106 Q120 103 131 106 Q130 119 120 119 Q110 119 109 106 Z" fill="url(#IRIS)" stroke="${LINE}" stroke-width="1"/>
        <path d="M66 105 L94 104 M106 104 L134 105" stroke="#141634" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="76" cy="110" r="2.1" fill="#fff"/><circle cx="116" cy="110" r="2.1" fill="#fff"/>
      </g>
      <g class="e e-sleepy" stroke="#141634" stroke-width="3" fill="none" stroke-linecap="round"><path d="M70 108 Q80 115 90 108"/><path d="M110 108 Q120 115 130 108"/></g>
      <g class="e e-cry"><path d="M70 103 Q80 111 90 103" stroke="#141634" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M110 103 Q120 111 130 103" stroke="#141634" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M74 109 q-2 10 2 17 q4 -7 2 -17 Z M126 109 q-2 10 2 17 q4 -7 2 -17 Z" fill="#9fdcff" stroke="#4aa6ef" stroke-width=".8"/></g>
    </g>
    <ellipse cx="67" cy="121" rx="10" ry="5.5" fill="url(#BLUSH)"/><ellipse cx="133" cy="121" rx="10" ry="5.5" fill="url(#BLUSH)"/>
    <path d="M63 122.5 l2.4 -3.2 M67 122.5 l2.4 -3.2 M129 122.5 l2.4 -3.2 M133 122.5 l2.4 -3.2" stroke="#ff8aa6" stroke-width=".9" stroke-linecap="round" opacity=".8"/>
    <g class="mouths" stroke="#5a2a33" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="m m-cat" d="M94 126 q3 3.4 6 0 q3 3.4 6 0"/>
      <path class="m m-open" d="M94 125 q6 1 12 0 q-1 9 -6 9 q-5 0 -6 -9 Z" fill="#c8405a"/>
      <path class="m m-frown" d="M95 129.5 q5 -5 10 0"/>
      <ellipse class="m m-o" cx="100" cy="128.5" rx="3.4" ry="4.4" fill="#c8405a"/>
      <g class="m m-bubble"><path d="M95 127 q5 3 10 0"/><circle cx="109" cy="132" r="6.5" fill="#d8f2ff" stroke="#6fb8ff" stroke-width="1.1" opacity=".9"/><circle cx="107" cy="130" r="1.6" fill="#fff" stroke="none"/></g>
    </g>
    <!-- 鬓发：贴着脸颊垂下的卷发 -->
    <path d="M57 86 C47 104 52 122 44 140 C36 158 48 168 40 184 C36 194 42 203 50 197 C46 189 54 179 56 167 C60 148 58 128 66 110 Z" fill="url(#LOCK)" stroke="${LINE}" stroke-width="1.3"/>
    <path d="M143 86 C153 104 148 122 156 140 C164 158 152 168 160 184 C164 194 158 203 150 197 C154 189 146 179 144 167 C140 148 142 128 134 110 Z" fill="url(#LOCK)" stroke="${LINE}" stroke-width="1.3"/>
    <path d="M53 118 C50 134 53 148 47 164 M147 118 C150 134 147 148 153 164" stroke="#8fb0ff" stroke-width="1.1" fill="none" opacity=".75"/>
    <!-- 刘海：柔软的发束，中间一缕垂到两眼之间 -->
    <path d="M54 96 C52 62 72 42 100 40 C128 42 148 62 146 96 Q141 92 138 99 Q137 88 131 80 Q129 88 124 93 Q121 82 115 74 Q110 92 101 110 Q101 90 96 76 Q92 86 84 91 Q82 84 76 78 Q72 90 66 99 Q64 90 60 84 Q57 90 54 96 Z" fill="url(#FRONT)" stroke="${LINE}" stroke-width="1.6"/>
    <g fill="none" stroke-linecap="round">
      <path d="M131 80 Q133 66 126 54 M115 74 Q114 60 108 50 M96 76 Q92 62 86 54 M76 78 Q76 66 72 58" stroke="#13195a" stroke-width="1" opacity=".75"/>
      <path d="M126 86 Q128 74 122 64 M104 92 Q106 78 102 66 M88 86 Q86 74 82 66 M70 90 Q70 80 68 72 M136 92 Q137 82 134 74" stroke="#7d98f0" stroke-width="1.2" opacity=".75"/>
      <path d="M68 62 Q74 56 82 54 M92 50 Q100 47 110 49 M118 52 Q126 54 132 60" stroke="#b9c9ff" stroke-width="2.4" opacity=".8"/>
    </g>
    <!-- 白色蕾丝头饰 -->
    <g class="headband">
      <path d="${band.d}" fill="#fff" stroke="${LINE}" stroke-width="1.2"/>
      <g fill="#d6dcf2">${band.holes}</g>
      <path d="${band2.d}" fill="#f6f7ff" stroke="#9aa6d6" stroke-width=".9"/>
      <path d="M50 76 Q100 34 150 76" stroke="#1a2266" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </g>
    <!-- 圆圈呆毛 -->
    <g class="ahoge" fill="none" stroke-linecap="round">
      <path d="M100 45 C98 36 101 27 109 26 C117 25 119 34 113 37 C108 39 105 33 109 31" stroke="${LINE}" stroke-width="4.2"/>
      <path d="M100 45 C98 36 101 27 109 26 C117 25 119 34 113 37 C108 39 105 33 109 31" stroke="#3546a8" stroke-width="2.2"/>
    </g>
    <!-- 侧边蓝色蝴蝶结 -->
    <g class="bow" transform="translate(150 70) rotate(16)">
      <path d="M0 0 C-4 -9 -14 -11 -15 -4 C-16 3 -7 6 0 0 Z M0 0 C4 -9 14 -11 15 -4 C16 3 7 6 0 0 Z" fill="#3d8cf3" stroke="${LINE}" stroke-width="1.1"/>
      <path d="M-1 1 L-6 11 L-2 9 Z M1 1 L6 11 L2 9 Z" fill="#3d8cf3" stroke="${LINE}" stroke-width=".9"/>
      <path d="M-11 -5 q3 -2 6 0 M11 -5 q-3 -2 -6 0" stroke="#a9d2ff" stroke-width="1" fill="none"/>
      <circle r="2.8" fill="#2a6ad8" stroke="${LINE}" stroke-width=".9"/>
    </g>
    <!-- 抬起的手臂（响指 / 欢呼） -->
    <g class="arm-up arm-up-r">
      <path d="M121 150 C138 146 150 132 155 117 C161 118 166 123 165 130 C158 146 141 160 128 164 Z" fill="url(#DRESS)" stroke="${LINE}" stroke-width="1.5"/>
      <path d="M153 121 q6 -2 11 4" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <circle cx="160" cy="113" r="5.6" fill="#ffefe6" stroke="${LINE}" stroke-width="1.2"/>
    </g>
    <g class="arm-up arm-up-l">
      <path d="M79 150 C62 146 50 132 45 117 C39 118 34 123 35 130 C42 146 59 160 72 164 Z" fill="url(#DRESS)" stroke="${LINE}" stroke-width="1.5"/>
      <path d="M47 121 q-6 -2 -11 4" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="113" r="5.6" fill="#ffefe6" stroke="${LINE}" stroke-width="1.2"/>
    </g>
    <g class="snap-fx"><path d="M172 92 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" fill="#ffd54a" stroke="${LINE}" stroke-width=".8"/><path d="M164 100 l-8 -6 M168 88 l-2 -9 M178 96 l8 -5" stroke="#ffb02e" stroke-width="2.2" stroke-linecap="round"/><text x="164" y="80" font-size="15" font-weight="900" fill="#ff4d7a" font-family="sans-serif" stroke="#fff" stroke-width="3" paint-order="stroke">啪!</text></g>
    <!-- 特效 -->
    <path class="fx fx-sweat" d="M146 90 q-6 9 0 13 q6 -4 0 -13 Z" fill="#a8dcff" stroke="#3f90e0" stroke-width="1"/>
    <g class="fx fx-anger" transform="translate(62 62)" stroke="#ff4d6d" stroke-width="2.6" fill="none" stroke-linecap="round"><path d="M-6 -2 q4 0 4 -4 M2 -6 q0 4 4 4 M6 2 q-4 0 -4 4 M-2 6 q0 -4 -4 -4"/></g>
    <g class="fx fx-spark" fill="#ffd54a" stroke="${LINE}" stroke-width=".7"><path d="M28 40 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 Z"/><path d="M172 32 l1.5 4.5 l4.5 1.5 l-4.5 1.5 l-1.5 4.5 l-1.5 -4.5 l-4.5 -1.5 l4.5 -1.5 Z"/></g>
  </g>
</svg>`);
  };

  /** 鲸鱼娘 SVG 的样式（需注入到使用它的 shadowRoot / 页面） */
  DFY.mascotCSS = `
.dfy-whale{overflow:visible;display:block}
.dfy-whale .e,.dfy-whale .m,.dfy-whale .fx,.dfy-whale .snap-fx,.dfy-whale .arm-up{display:none}
.dfy-whale[data-face="normal"] .e-normal,.dfy-whale[data-face="normal"] .m-cat{display:inline}
.dfy-whale[data-face="happy"] .e-happy,.dfy-whale[data-face="happy"] .m-open,.dfy-whale[data-face="happy"] .fx-spark{display:inline}
.dfy-whale[data-face="angry"] .e-angry,.dfy-whale[data-face="angry"] .m-frown,.dfy-whale[data-face="angry"] .fx-anger{display:inline}
.dfy-whale[data-face="shock"] .e-shock,.dfy-whale[data-face="shock"] .m-o,.dfy-whale[data-face="shock"] .fx-sweat{display:inline}
.dfy-whale[data-face="smug"] .e-smug,.dfy-whale[data-face="smug"] .m-cat{display:inline}
.dfy-whale[data-face="sleepy"] .e-sleepy,.dfy-whale[data-face="sleepy"] .m-bubble{display:inline}
.dfy-whale[data-face="cry"] .e-cry,.dfy-whale[data-face="cry"] .m-frown,.dfy-whale[data-face="cry"] .fx-sweat{display:inline}
.dfy-whale[data-pose="snap"] .arm-r,.dfy-whale[data-pose="cheer"] .arm-r,.dfy-whale[data-pose="cheer"] .arm-l{display:none}
.dfy-whale[data-pose="snap"] .arm-up-r,.dfy-whale[data-pose="cheer"] .arm-up-r,.dfy-whale[data-pose="cheer"] .arm-up-l{display:inline}
.dfy-whale[data-pose="snap"] .snap-fx{display:inline;transform-origin:172px 100px;animation:dfy-pop .4s ease-out}
.dfy-whale .bob{animation:dfy-bob 2.6s ease-in-out infinite;transform-origin:100px 222px}
.dfy-whale .tail{transform-origin:128px 206px;animation:dfy-wag 1.6s ease-in-out infinite}
.dfy-whale .fin-l{transform-origin:60px 100px;animation:dfy-finl 2.2s ease-in-out infinite}
.dfy-whale .fin-r{transform-origin:140px 100px;animation:dfy-finr 2.2s ease-in-out infinite}
.dfy-whale .ahoge{transform-origin:100px 45px;animation:dfy-ahoge 1.8s ease-in-out infinite}
.dfy-whale .e-normal{transform-origin:100px 106px;animation:dfy-blink 4.2s infinite}
.dfy-whale[data-pose="cheer"] .bob{animation:dfy-hop .5s ease-in-out infinite}
.dfy-whale[data-face="angry"] .bob{animation:dfy-shake .35s linear infinite}
@keyframes dfy-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes dfy-hop{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes dfy-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}
@keyframes dfy-wag{0%,100%{transform:rotate(0)}50%{transform:rotate(-9deg)}}
@keyframes dfy-finl{0%,100%{transform:rotate(0)}50%{transform:rotate(7deg)}}
@keyframes dfy-finr{0%,100%{transform:rotate(0)}50%{transform:rotate(-7deg)}}
@keyframes dfy-ahoge{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(8deg)}}
@keyframes dfy-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes dfy-pop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
`;

})();
