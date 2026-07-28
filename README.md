# 🎵 Music Generation Subjective Evaluation Website

基于 GitHub Pages + Google Sheets 的**单盲**主观评测网站，用于对比 7 个音乐生成模型在 6 首歌上的表现。

## ✨ 特性

- **单盲评测**：每个评测者看到的是随机打乱的 A–G 匿名标签，看不到真实模型名；网站方通过后台可反查
- **纯前端**：只有 `index.html` / `style.css` / `app.js` / `data.js`，无需构建，静态托管即可
- **进度自动保存**：`localStorage` 保存中间状态，中途关网页也能恢复
- **实时后台**：Google Apps Script + Google Sheets 免费收集数据，`admin.html` 提供实时排名 / 雷达图 / 明细表
- **兼容性优先**：建议音频统一压成 mp3（Safari 不支持 flac）

## 📁 文件结构

```
music-eval/
├── index.html           # 评测者页面（用户看到的）
├── style.css            # 样式
├── app.js               # 前端逻辑
├── data.js              # 歌曲/模型/维度元数据 + SUBMIT_URL 配置
├── admin.html           # 网站方数据看板
├── compress_audio.sh    # 音频批量压缩脚本
├── backend/
│   └── apps_script.gs   # Google Apps Script 后端
├── demo/                # 音频文件夹（7个模型 × 6首歌）
└── README.md
```

---

## 🚀 部署步骤（约 30 分钟）

### 0. 建议先压缩音频（525MB → 约 100MB）

```bash
bash compress_audio.sh --inplace
```

压缩后所有音频统一变成 `.mp3`。**记得把 `data.js` 里 `MODELS` 每一项的 `ext` 都改成 `"mp3"`**。

### 1. 部署 Google Sheets 后端

1. 打开 https://sheets.new 新建表格，如命名 `MusicEval`
2. 把默认 `Sheet1` 重命名为 `responses`；底部 `+` 再新增一个 sheet 命名为 `mappings`
3. 顶栏 `Extensions → Apps Script`
4. 复制 `backend/apps_script.gs` 全部内容 → 粘贴到 Apps Script → 💾 保存
5. `Deploy → New deployment` → 齿轮选 `Web app`：
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy → 授权 → 复制得到的 **Web app URL**
6. 打开 `data.js`，粘贴到 `window.SUBMIT_URL = "..."`
7. 设置管理员密码：Apps Script 左侧齿轮 `Project Settings → Script Properties → Add property`：
   - Key = `ADMIN_TOKEN`
   - Value = 任意长字符串（后台登录密码）

### 2. 部署前端到 GitHub Pages

```bash
git init
git branch -M main
git add .
git commit -m "initial commit"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

> Push 时用 [Personal Access Token](https://github.com/settings/tokens)（勾 `repo` 权限）替代账号密码。

推送成功后：仓库 → `Settings → Pages` → Source 选 `main` + `/(root)` → Save，1-2 分钟后：

```
https://<用户名>.github.io/<仓库名>/           ← 评测者链接
https://<用户名>.github.io/<仓库名>/admin.html ← 后台看板
```

### 3. 分发

- 把评测者链接发给参与者
- 自己打开 `admin.html`，填入 Apps Script URL 和 ADMIN_TOKEN 就能实时看数据

---

## 📊 数据结构

**responses 表**（每 [歌 × 系统] 一行）：

| submitted_at | rater | song_id | anon_label | model | overall | vocal_acc | harmony | structure | lyric | faithfulness |
|--|--|--|--|--|--|--|--|--|--|--|
| 2026-... | Alice | DD1_ZH | A | muse | 4 | 5 | 4 | 4 | 5 | 4 |

**mappings 表**（每个评测者一行，保存单盲映射）：

| submitted_at | rater | mapping_json |
|--|--|--|
| 2026-... | Alice | `{"A":"muse","B":"yue","C":"SongSculpt",...}` |

## admin.html 功能

- KPI 面板（总打分数 / 评测者数 / 模型数 / 歌曲数）
- 总排行榜柱状图
- 雷达图（6 维度）
- 模型 × 维度热力表格
- 歌曲 × 模型对比表
- 一键 CSV 导出

---

## 🎛️ 自定义

- 改评测维度 → 编辑 `data.js` 的 `DIMENSIONS`
- 加/删模型 → 编辑 `data.js` 的 `MODELS`（`folder` 对应 `demo/<folder>/`）
- 加/删歌曲 → 编辑 `data.js` 的 `SONGS`
- 改配色 → 修改 `style.css` 顶部 `:root` 变量
- 改匿名标签（例如 S1-S7 代替 A-G）→ 改 `data.js` 的 `ANON_LABELS`

---

## ⚠️ 注意事项

1. GitHub Pages 单文件 ≤ 100MB；当前最大文件 33.69MB 可传，但**强烈建议压缩到 mp3**
2. 公开仓库音频公开可见 — 有版权/保密问题的话不能用此方案
3. flac 在 Safari 无法播放 — 必须转 mp3
4. Google Sheets 免费额度每天 20000 次写入，几百评测者绰绰有余
5. `__MACOSX/` 是 macOS 打包 zip 时的隐藏元数据，`.gitignore` 已排除

---

## 🧪 本地测试

```bash
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

> `file://` 直接双击 `index.html` 也能跑，但部分浏览器对本地音频有限制，建议起本地服务器。

---

## 📮 兜底方案

如果 Apps Script 提交失败，用户可以在完成页点 **Download my responses (JSON)** 下载 JSON 发给研究者。
