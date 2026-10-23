# 架构说明

插件是 Chrome MV3 扩展，纯原生 JavaScript，没有构建步骤。插件本体在 `dafeiyu-cleaner/`，加载这个文件夹即可调试。Firefox 版共用全部代码，只换一份 manifest，见文末「Firefox 适配」。

## 目录

```
dafeiyu-cleaner/
├── manifest.json
├── src/
│   ├── main-world.js   页面主世界：读取评论组件上的数据，postMessage 给插件
│   ├── icons.js        线性 SVG 图标 DFY.icon(name)
│   ├── mascot.js       清道夫鲸鱼娘矢量形象 DFY.mascotSVG({face, pose}) 及其动画 CSS
│   ├── memes.js        台词库 DFY.say(key)
│   ├── storage.js      chrome.storage.local 封装、默认设置、战绩、跨页面记忆 DFY.memory
│   ├── detector.js     离线识别引擎
│   ├── fx.js           粒子画布、WebAudio 合成音效、评论退场动画
│   ├── actors.js       被赶走的迷你 DeepSeek 娘（动作图）、鲸鱼娘走位
│   ├── weapons.js      鲸鱼娘的武器
│   ├── ui.js           悬浮鲸鱼娘、对话框、思考框、菜单、通知、提示框、泡泡大炮
│   ├── comments.js     评论区：标记、靶心、赶走、折叠、响指清场、战报、DeepSeek 精判
│   ├── space.js        空间主页鉴定报告与页面效果
│   ├── content.js      入口：读设置、挂载 UI、菜单、消息与路由监听
│   └── background.js   后台（Chrome 是 Service Worker，Firefox 是事件页）：DeepSeek 请求、快捷键
├── popup/              工具栏面板，同时作为设置页
├── assets/
│   ├── dfy-display.woff2   标题字体（得意黑子集）
│   ├── actors/*.webp       被赶走的大肥鱼的 8 个动作
│   └── weapons/*.webp      武器图
└── icons/
```

## 脚本加载

`content_scripts` 有两组：

1. `main-world.js` 以 `world: "MAIN"`、`document_start` 注入，因为评论数据挂在 B 站自定义元素的 `.data` 属性上，隔离世界读不到。
2. 其余脚本按 manifest 中的顺序注入隔离世界，共用全局命名空间 `DFY`。**顺序就是依赖顺序**：`ui.js` 在加载时把 `actors.js`、`weapons.js`、`mascot.js` 的 CSS 拼进自己的 shadow DOM，所以它们必须排在 `ui.js` 前面。

页面上所有插件 UI 都在一个 `<dfy-host>` 元素的 shadow DOM 里，不受 B 站样式影响。标题字体的 `@font-face` 必须声明在主文档中（shadow DOM 里声明无效），由 `content.js` 注入。

## 评论区数据流

```
B 站评论组件挂载 / 更新
  → main-world.js 读取 .data，给元素打上 data-dfy-rpid
  → postMessage({source: 'dfy-main', type: 'comments', items})
  → comments.js 按账号（mid）归并评论
  → detector.js 打分 → verdict {score, level, reasons}
  → 在评论的 shadow DOM 里插入标签、靶心、按钮
```

`main-world.js` 包装了评论组件原型上的 `connectedCallback` / `updated`，组件一挂载就扫描，另有 1.5 秒轮询兜底。

### B 站评论 DOM

全部是 open shadow root：

```
bili-comments
  └─ #shadow-root
       └─ bili-comment-thread-renderer          （.data 是完整的评论 JSON）
            └─ #shadow-root
                 ├─ bili-comment-renderer
                 │    └─ #shadow-root → #body / bili-comment-user-info / #user-avatar
                 └─ bili-comment-replies-renderer
                      └─ #shadow-root → bili-comment-reply-renderer（楼中楼）
```

B 站改版时最先坏的就是这里，相关查询集中在 `comments.js` 的 `eachRenderer` / `partsOf` / `avatarOf` 和 `main-world.js` 的 `scan`。

### 空间主页

`space.js` 调用两个无需签名的公开接口：

- `api.bilibili.com/x/web-interface/card?mid=` 资料卡
- `api.bilibili.com/x/series/recArchivesByKeywords?mid=` 近期投稿（偶尔被风控时降级为只用资料卡）

页面效果依赖的选择器：`.upinfo-avatar`、`.upinfo .nickname`、`.bili-video-card` / `.items__item`。空间页是单页应用，`content.js` 每秒检查一次路由变化。

## 识别

### 离线规则（detector.js）

`DFY.judge(acc, texts, ctx)` 返回 `{score, raw, reasons}`：

- 账号分 `scoreAccount`：昵称、签名、等级、官方认证、大会员、头像鲸鱼蓝占比（`DFY.avatarBlue` 把头像缩到 32×32 统计色相）
- 评论分 `scoreText`：取该账号在本页最像 AI 的一条；包括自称、括号动作、@ 主人（`ownerLink` 比较 @ 对象和自己昵称的共同部分）、复述视频要点、Markdown 残留等；`isReply` 的评论不触发「开头 @ 人」规则
- 行为分：本页刷多条、每条一个味儿
- 上下文 `ctx`：`upMid`（UP 主本人减分）、`calledOut`（`DFY.callouts` 统计楼中楼里被几个人点名是鱼）、`priorPages`（前科）
- `raw` 不含前科加分；只有 `raw` 达到阈值时才记一笔前科，避免自我强化

`DFY.levelOf(score, threshold)`：`≥ threshold` 为 `fish`，`≥ max(25, threshold − 25)` 为 `suspect`，其余为 `human`。

### DeepSeek 精判（background.js）

- 评论区：离线分 20–85 的不确定账号，每批最多 8 个，附离线分和命中原因；最终分 = 离线 45% + DeepSeek 55%
- 空间页：最终分 = 离线 30% + DeepSeek 70%；deepseek-flash 可附带头像图片
- 请求只发往 `api.deepseek.com`，提示词要求中文思考，思维链（`reasoning_content`）展示在思考框里
- 结果写入 `DFY.memory.llmPut`，缓存 7 天

## 赶走流程

单条赶走（`comments.js` 的 `C.kick`）：

1. 鲸鱼娘走到头像右侧（`actors.approachPoint`）
2. `actors.spawnFish` 在头像位置生成迷你 DeepSeek 娘，`mood` 切换动作图：`caught` → `defiant` / `beg`
3. `weapons.run(weapons.pick(), fish, {onHit})`：武器在决定性一击时调用 `onHit`，评论在这时化灰收起
4. 加入遣返名单、记战绩，通知里提供「放回来」

响指清场（`C.snap`）对视野内最多 10 条播放完整动画，其余直接收起；`settings.weapon` 为 `gatling`（或随机命中）时改为 `weapons.sweep` 点射。

被赶走的一方一律往左边离场，所以鲸鱼娘总是站在目标右边。

### 动作图与武器图

| 名字 | 用途 |
| --- | --- |
| `caught` | 刚冒出来被抓包 |
| `scared` | 响指清场时发抖 |
| `defiant` / `beg` | 嘴硬 / 求饶 |
| `flee` | 抱着白饭碗往左跑 |
| `knocked` | 被打飞 |
| `dust` | 响指化成泡沫 |
| `home` | 折叠条、空间页「已遣返」 |

武器：`gatling`、`broom`、`sock`、`rice`。图片都是 240×240 透明 WebP，通过 `chrome.runtime.getURL` 加载，需要在 `web_accessible_resources` 中声明。新增动作时保持同样的尺寸和角色占比，页面上的大小才一致。

## 存储（chrome.storage.local）

| 键 | 内容 |
| --- | --- |
| `settings` | 开关、处理方式 `mode`（mark / fold / auto）、阈值、武器、DeepSeek 配置 |
| `stats` | 战绩 |
| `blocklist` | 遣返名单 `mid → {n, a, t, s}` |
| `whitelist` | 人类白名单 `mid → {n, t}` |
| `seen` | 前科记忆 `mid → {n, c, k, t}` |
| `llmCache` | 精判缓存 `mid → {ai, r, t}` |
| `mascotPos` | 鲸鱼娘位置（相对视口比例） |
| `customMascot` | 用户上传的形象（dataURL） |

`DFY.memory` 写入时只合并本页新增的条目，多个标签页同时写不会互相覆盖。

## 消息

| 方向 | 消息 | 说明 |
| --- | --- | --- |
| 主世界 → 内容脚本 | `{source: 'dfy-main', type: 'comments'}` | 评论数据 |
| 内容脚本 → 主世界 | `{source: 'dfy-iso', type: 'rescan'}` | 要求重新扫描 |
| 内容脚本 → 后台 | `llm-judge` / `llm-space` / `llm-test` / `open-options` | DeepSeek 请求、打开设置 |
| 面板 / 后台 → 内容脚本 | `{dfy: 'status' \| 'snap' \| 'cannon' \| 'rescan' \| 'llm' \| 'report'}` | 面板「本页」操作与快捷键 |

## Firefox 适配

代码里统一使用 `chrome.*` 回调写法，Firefox 原生支持，不需要 polyfill。Firefox 版只是把 `manifest.json` 换成下面的写法（其余字段相同），打包成 zip：

```json
{
  "background": { "scripts": ["src/background.js"] },
  "browser_specific_settings": {
    "gecko": {
      "id": "dafeiyu-cleaner@liyupi.github.io",
      "strict_min_version": "140.0",
      "data_collection_permissions": { "required": ["none"], "optional": ["websiteContent"] }
    },
    "gecko_android": { "strict_min_version": "142.0" }
  }
}
```

- Firefox MV3 不支持 `background.service_worker`，改用 `background.scripts`（事件页）
- 内容脚本的 `world: "MAIN"` 需要 Firefox 128+，`data_collection_permissions` 需要 140+
- 扩展 ID 发布后不能再改
- 不直接改 Chrome 版的 manifest，避免 Chrome 报「无法识别的键」警告

代码里只有两处 Firefox 专属分支，Chrome 下都不会进入：

| 位置 | 原因 |
| --- | --- |
| `detector.js` 的 `DFY.avatarBlue` | Firefox 内容脚本里带 `crossOrigin` 的图片请求加不上 `Origin` 头，会被 CORS 拦下；改用 `fetch` 取图再 `createImageBitmap`。用 `window.wrappedJSObject` 是否存在判断 |
| `popup.js` 的精判开关、`background.js` 的 `consented()` | 把评论发给 DeepSeek 属于向第三方发送网页内容，Firefox 要求运行时取得 `websiteContent` 授权。打开开关时 `permissions.request`，发请求前 `permissions.contains` 检查。用扩展地址是否以 `moz-extension:` 开头判断 |

## 约定

- 「赶走」只能是本地隐藏，不调用 B 站任何写接口（删除、举报、拉黑），不读 Cookie
- 不把任何 API Key 写进仓库
- 界面不用 Emoji，图标用 `DFY.icon(name)`
- 视觉风格是二次元设定集：粗描边 + 硬投影。配色 token 在 `ui.js` 的 `.wrap` 和 `popup.css` 的 `:root`：ink `#151a3d`、paper `#f5eadd`、blue `#2546b8`、cyan `#6fe0ff`、gold `#c9a24a`、pink `#ff5d8a`
- 标题字体是子集，只包含界面现有的汉字；新增的字会回退到系统字体
