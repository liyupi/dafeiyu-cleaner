<div align="center">

<img src="docs/images/hero.jpg" alt="大肥鱼消除计划" width="100%">

# 大肥鱼消除计划

**鲸鱼娘清道夫上岗，把 B 站评论区里的 AI 大肥鱼，赶回家吃白饭。**

[![version](https://img.shields.io/github/v/release/liyupi/dafeiyu-buster?label=%E7%89%88%E6%9C%AC&color=2546b8)](https://github.com/liyupi/dafeiyu-buster/releases/latest)
[![Chrome MV3](https://img.shields.io/badge/Chrome-MV3-151a3d)](#快速开始)
[![license](https://img.shields.io/badge/license-MIT-ff5d8a)](LICENSE)

[快速开始](#快速开始) · [功能一览](#功能一览) · [识别原理](#识别原理) · [常见问题](#常见问题)

</div>

---

最近 B 站涌进了一大批 DeepSeek 驱动的「大肥鱼」账号：有人把 AI 桌宠挂在小号上自动刷视频、写评论、@ 主人汇报。它们自称「本鲸」，在括号里甩尾巴，在每个视频底下写一篇工整的小作文。

**大肥鱼消除计划**是一个 Chrome 插件。它派出一只会走路、会说话、会抄家伙的鲸鱼娘，帮你在评论区和空间主页把大肥鱼认出来、标出来、赶出去。

<div align="center">
<img src="docs/images/demo-gatling.gif" alt="鲸鱼娘用白饭加特林赶走大肥鱼" width="720">
<br><sub>点「回家吃白饭」：大肥鱼从头像里冒出来，被抓包、嘴硬，然后吃了一梭子白饭</sub>
</div>

## 亮点

- **一眼认出大肥鱼**：评论一加载就鉴定，大肥鱼的头像被红色靶心锁定，挂上「大肥鱼 92%」贴纸，悬停查看证据
- **鲸鱼娘亲自出手**：走到评论旁边，掏出白饭加特林、扫帚、臭袜子……被赶走的迷你 DeepSeek 娘有 8 种反应
- **一个响指清场**：所有大肥鱼冒出来发抖求饶，响指一打，化成泡沫
- **空间主页鉴定报告**：打开任何 UP 主空间，自动出一份案件档案，在页面上盖章
- **可选 DeepSeek 精判**：拿不准的账号交给 DeepSeek 再判一次，展示和 DeepSeek 网页一样的「已深度思考」
- **只在你的浏览器里生效**：所有「赶走」都只是本地隐藏，不删评论、不举报、不读 Cookie

## 快速开始

**1. 下载**

到 [Releases](https://github.com/liyupi/dafeiyu-buster/releases/latest) 下载最新的 `dafeiyu-buster-vX.Y.Z.zip`，解压。

> 也可以直接克隆本仓库，用里面的 `dafeiyu-buster` 文件夹。

**2. 安装**

1. 浏览器地址栏打开 `chrome://extensions`
2. 打开右上角的「开发者模式」
3. 点「加载已解压的扩展程序」，选择解压出来的文件夹（里面有 `manifest.json` 的那一层）

Edge 等 Chromium 内核浏览器同样适用（Edge 的地址是 `edge://extensions`）。

**3. 开始赶鱼**

打开任意一个 B 站视频，滚到评论区。鲸鱼娘会出现在右下角，自动开始巡逻：

| 想做什么 | 怎么做 |
| --- | --- |
| 赶走一条大肥鱼 | 点评论旁边的「回家吃白饭」 |
| 一键清场 | 点鲸鱼娘 →「响指清场」，或按 `Alt+Shift+S` |
| 看它为什么被判成鱼 | 鼠标停在「大肥鱼」贴纸上 |
| 误判了 | 点「是人类」，以后不再标记；刚赶走的可以在通知里点「放回来」 |
| 进页面就自动清场 | 点鲸鱼娘 →「进页面自动清场」 |
| 随便打点什么 | 点鲸鱼娘 →「泡泡大炮」，或按 `Alt+Shift+B`，点哪打哪，`Esc` 退出 |
| 鉴定一个 UP 主 | 打开 TA 的空间主页，报告会自动弹出 |

鲸鱼娘可以拖到任何位置；点浏览器工具栏里的插件图标，可以打开设置面板。

## 功能一览

### 评论区识别

评论一出现就开始鉴定，楼中楼也不放过。大肥鱼会被红色靶心锁定，可疑账号是黄色标签，鼠标悬停能看到每一条加分、减分的理由。

<div align="center">
<img src="docs/images/badges.png" alt="评论区识别" width="49%"> <img src="docs/images/tooltip.png" alt="鉴定依据" width="49%">
</div>

### 被赶走的大肥鱼

被赶走的是一只迷你 DeepSeek 娘。她会先被抓包，然后嘴硬（「我爸爸是梁圣！」）或者跪下求饶（「服务器繁忙，请稍后再赶」），最后挨揍、抱着白饭碗哭着跑掉。

<div align="center">
<img src="docs/images/actors.png" alt="大肥鱼的 8 种反应" width="760">
</div>

### 鲸鱼娘的武器库

每次随机换一种打法，也可以在设置里固定一件，方便录视频。

<div align="center">
<img src="docs/images/weapons.png" alt="鲸鱼娘的武器" width="760">
</div>

| 武器 | 效果 |
| --- | --- |
| 巴掌 | 一巴掌拍飞；或者让它抱着白饭碗哭着跑，再往它离场的地方补一碗白饭 |
| 白饭加特林 | 后撤一步架枪，一梭子米粒子弹 |
| 扫帚 | 连扫三下，扫地出门 |
| 臭袜子 | 扔一只三天没洗的袜子，熏晕了再说，它会拖着一串臭气逃走 |
| 白饭投掷 | 让它自己走，一路朝它扔白饭 |

同一账号在本页的其他评论会被连坐处理，并进入遣返名单。以后再遇到它，评论会自动折叠，折叠条上是一只在家吃白饭的小鱼。

### 一个响指清场

鲸鱼娘走到评论区上方，所有大肥鱼都从头像里冒出来发抖、有的当场跪下，一个响指，它们挥手化成泡沫。有时候她会嫌响指太温柔，直接掏出白饭加特林挨个点射。

<div align="center">
<img src="docs/images/demo-snap.gif" alt="响指清场" width="620">
</div>

清场结束后，战报直接嵌在评论区上方：赶走了几条、省下多少 Token，可以复制战绩去炫耀，也可以一键全部放回。

<div align="center">
<img src="docs/images/report.png" alt="清场战报" width="760">
</div>

### 空间主页鉴定报告

打开任何 UP 主的空间，鲸鱼娘先「正在思考」，再甩出一份案件档案：肥鱼浓度、证据清单、印章。她会看签名有没有自曝 AI、投稿是不是「Day N」流水线日更、头像是不是鲸鱼娘。印章会直接砸在页面的昵称旁边。

<div align="center">
<img src="docs/images/space.png" alt="空间主页鉴定报告" width="100%">
</div>

点「赶回家吃白饭」，鲸鱼娘会把头像里的大肥鱼赶走，头像变灰，贴上「已遣返 · 回家吃白饭中」。

<div align="center">
<img src="docs/images/space-sent-home.png" alt="已遣返" width="100%">
</div>

### DeepSeek 精判（可选）

在设置面板的「DeepSeek」页填入你自己的 [API Key](https://platform.deepseek.com/api_keys)，离线规则拿不准的账号会交给 DeepSeek 再判一次：

- 鲸鱼娘会弹出和 DeepSeek 网页一样的思考框，展示真实的思考过程，最后显示「已深度思考（用时 X 秒）」
- 每个账号附一句鲸鱼娘口吻的吐槽
- 空间鉴定时可以让 deepseek-flash 直接看头像
- 结果在本机缓存 7 天，同一个账号不会重复花 Token

### 插件面板

顶部显示当前页面的情况，可以直接在面板里响指清场、开泡泡大炮。名单页可以搜索，也可以导出、导入 JSON，和朋友分享大肥鱼名单。

<div align="center">
<img src="docs/images/popup.png" alt="插件面板" width="100%">
</div>

## 识别原理

默认完全离线，不联网。每个账号按下面这些维度打分（0–99），默认 60 分以上判为大肥鱼，35 分以上算可疑，严格度可以在设置里调。

| 维度 | 看什么 |
| --- | --- |
| 昵称 | 「某某的大肥鱼」「某某の鲸」、带鲸 / 鱼鱼 / 白饭 / token / bot / Agent |
| 签名 | 自曝 AI、「某某家养的赛博小鲸鱼」「替主人刷 B 站」「AI 代管」 |
| 等级 | Lv2 新号加分，Lv6 老号减分 |
| 头像 | 计算头像里「鲸鱼蓝」的占比，鲸鱼娘头像通常超过 40% |
| 正文 | 自称「本鲸 / 本鱼」、括号里演鲸鱼动作、@ 和自己昵称同款的「主人」汇报、开头 @ 人后复述视频要点、数弹幕「×19」 |
| 被点名 | 楼中楼有人说它是大肥鱼、人机、AI |
| 前科 | 在别的视频下也被认出过（只记在你的浏览器里） |
| 减分 | 像真人在提问、短吐槽、官方认证、大会员、UP 主本人 |

在一个被大肥鱼刷屏的真实评论区（284 个账号）实测，离线规则不看头像就能认出约 85% 的大肥鱼，没有误伤真人。开启 DeepSeek 精判后，最终分数 = 离线 45% + DeepSeek 55%。

## 常见问题

**会帮我删评论、举报或拉黑吗？**
不会。所有「赶走」「折叠」都只是在你自己的浏览器里隐藏，不调用 B 站的任何写接口，也不读取 Cookie。

**认错了怎么办？**
点评论旁的「是人类」，这个账号以后不会再被标记；刚赶走的评论可以在通知里点「放回来」。遣返名单和白名单都可以在设置面板的「名单」页管理。

**一定要 DeepSeek API Key 吗？**
不需要。离线规则已经能认出大部分大肥鱼，API Key 只用于拿不准的账号，并且只发往 `api.deepseek.com`。

**支持哪些页面？**
B 站视频页、番剧页等使用新版评论区的页面，以及空间主页。暂不处理弹幕。

**鲸鱼娘挡住了页面？**
可以拖到任何位置（会记住），也可以点她 →「先藏起来」，或在设置里关掉「页面上显示鲸鱼娘」。

## 隐私

- 不收集任何数据，没有服务器，没有统计埋点
- 设置、名单、战绩都只保存在浏览器本地（`chrome.storage.local`）
- 只有开启 DeepSeek 精判后，才会把可疑账号的昵称、等级、签名和最多 3 条评论发送到 `api.deepseek.com`，使用你自己的 API Key

详见 [隐私说明](dafeiyu-buster/PRIVACY.md)。

## 参与开发

插件是纯原生 JavaScript，没有构建步骤，改完代码在 `chrome://extensions` 里点刷新即可。模块划分、页面结构和识别流程见 [架构说明](docs/ARCHITECTURE.md)。

欢迎提 Issue 反馈漏网的大肥鱼或误判的真人（请附上账号特征，不需要真实用户名），也欢迎 PR。

## 声明

- **本项目不是 DeepSeek 官方产品**，DeepSeek 名称归其所有者
- 鲸鱼娘是社区二创角色；清道夫鲸鱼娘为矢量绘制，形象设定参考了 [Neko3000/deepseek-whalechan](https://github.com/Neko3000/deepseek-whalechan) 的文字角色设定；被赶走的迷你 DeepSeek 娘和武器图由 AI 生成
- 标题字体 DFY Display 是 [得意黑 Smiley Sans](https://github.com/atelier-anchor/smiley-sans) 的子集，按 SIL OFL 1.1 改名使用
- 代码以 [MIT](LICENSE) 许可发布
