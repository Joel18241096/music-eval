/* ============================================================================
 * 音乐生成主观评测 - 前端主逻辑（中文版）
 *
 *  流程：
 *   1. 欢迎页收集评测者昵称 & 音乐背景
 *   2. 评测页：6 首歌可以自由跳转，每首歌下 7 个匿名系统 A~G 打分
 *      A~G ↔ 真实模型的映射每个评测者独立随机（单盲）
 *   3. 全部完成后进入"总览"页，用户点击"确认并提交"才真正上传
 *      在此之前所有操作都保存在 localStorage，可反复修改
 *   4. 提交时 POST 到 Google Apps Script（SUBMIT_URL）
 * ========================================================================== */

(function () {
  "use strict";

  // ================================================================
  // 常量 & DOM
  // ================================================================
  const MODELS = window.MODELS;
  const DIMENSIONS = window.DIMENSIONS;
  const SONGS = window.SONGS;
  const ANON_LABELS = window.ANON_LABELS;
  const COS_UPLOAD = window.COS_UPLOAD;
  const STORAGE_KEY = "music_eval_state_v1";

  const $ = (sel) => document.querySelector(sel);

  // 前端展示用的匿名歌曲名 (Sample 01 ~ Sample 06)
  // 后台上传的 payload 里仍然记录真实 song.id, 便于分析
  const displayName = (idx) => `Sample ${String(idx + 1).padStart(2, "0")}`;

  const welcomeStep = $("#welcome-step");
  const evalStep    = $("#eval-step");
  const reviewStep  = $("#review-step");
  const doneStep    = $("#done-step");

  // ================================================================
  // 状态
  // ================================================================
  let state = null;

  // ================================================================
  // 工具函数
  // ================================================================
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function clearState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  function flashSave(text) {
    const el = $("#save-status");
    if (!el) return;
    el.textContent = text || "✔ 已保存";
    el.classList.add("saved");
    clearTimeout(flashSave._t);
    flashSave._t = setTimeout(() => {
      el.textContent = "";
      el.classList.remove("saved");
    }, 1500);
  }

  // 生成单盲映射：为【每一首歌】各自独立打乱一次 MODELS，依次对应 A~H。
  // 结构:
  //   {
  //     "DD1_ZH": { A: "muse",  B: "suno", C: "SongSculpt", ... },
  //     "GG3_ZH": { A: "yue",   B: "muse", C: "heartlib",   ... },   // 每首歌独立随机
  //     ...
  //   }
  // 提交时会把整份 mappings 一起上传, 服务端据此把用户对 A/B/C 的评分反查回真实模型。
  function buildMappings() {
    const mappings = {};
    SONGS.forEach((song) => {
      const shuffled = shuffle(MODELS);
      const one = {};
      ANON_LABELS.forEach((label, i) => {
        one[label] = shuffled[i].key;
      });
      mappings[song.id] = one;
    });
    return mappings;
  }

  function audioPathFor(anonLabel, songId) {
    // 每首歌有自己一份独立的匿名映射
    const perSong = state.mappings[songId] || {};
    const modelKey = perSong[anonLabel];
    const model = MODELS.find((m) => m.key === modelKey);
    const base = (window.AUDIO_BASE || "").replace(/\/+$/, "");   // 去掉末尾斜杠
    if (base) {
      // 生产环境: 从 COS 拉取, key = <folder>_<songId>.<ext>
      return `${base}/${model.folder}_${songId}.${model.ext}`;
    }
    // 本地开发回退: 从仓库内的 demo/ 目录读取
    return `demo/${model.folder}/${songId}.${model.ext}`;
  }

  // 某首歌是否已全部打完分
  function isSongComplete(songId) {
    return ANON_LABELS.every((label) => {
      const scores = (state.ratings[songId] || {})[label];
      return scores && DIMENSIONS.every((d) => scores[d.key] != null);
    });
  }

  // 某首歌已完成的评分项数（用于进度显示）
  function songProgress(songId) {
    let done = 0;
    const total = ANON_LABELS.length * DIMENSIONS.length;
    ANON_LABELS.forEach((label) => {
      const scores = (state.ratings[songId] || {})[label] || {};
      DIMENSIONS.forEach((d) => { if (scores[d.key] != null) done++; });
    });
    return { done, total };
  }

  function allSongsComplete() {
    return SONGS.every((s) => isSongComplete(s.id));
  }

  // 总进度 (0~1)
  function overallProgress() {
    let d = 0, t = 0;
    SONGS.forEach((s) => {
      const p = songProgress(s.id);
      d += p.done; t += p.total;
    });
    return t ? d / t : 0;
  }

  // ================================================================
  // 启动 / 恢复
  // ================================================================
  document.addEventListener("DOMContentLoaded", () => {
    $("#n-songs").textContent = SONGS.length;
    $("#song-total").textContent = SONGS.length;

    // 事件监听（必须在任何 return 之前绑定，否则"恢复进度"分支会导致按钮失效）
    $("#start-btn").addEventListener("click", onStart);
    $("#prev-btn").addEventListener("click", onPrev);
    $("#next-btn").addEventListener("click", onNext);
    $("#back-to-eval-btn").addEventListener("click", () => {
      reviewStep.classList.add("hidden");
      evalStep.classList.remove("hidden");
      renderCurrentSong();
    });
    $("#submit-final-btn").addEventListener("click", onSubmitFinal);
    $("#restart-btn").addEventListener("click", () => {
      clearState();
      location.reload();
    });

    const saved = loadState();
    // 兼容旧版本 (仅有单数 mapping、无 mappings) 的存档：直接判定为过期
    const savedIsCompatible = saved && saved.raterId &&
                              saved.mappings &&
                              typeof saved.mappings === "object";

    if (saved && saved.raterId && !savedIsCompatible) {
      // 旧格式无法用于新版本, 静默清理
      clearState();
    } else if (savedIsCompatible) {
      const resume = confirm(
        `检测到未提交的评测记录（评测者：${saved.raterId}）\n\n` +
        `是否恢复上次的填写进度？\n\n` +
        `点击"确定"恢复，点击"取消"重新开始。`
      );
      if (resume) {
        state = saved;
        if (state.submitted == null) state.submitted = false;
        enterEvalStep();
        return;
      }
      clearState();
    }
  });

  function onStart() {
    const raterId = $("#rater-id").value.trim();
    if (!raterId) {
      alert("请先填写您的姓名或昵称。");
      $("#rater-id").focus();
      return;
    }
    state = {
      raterId,
      background: $("#rater-bg").value,
      startedAt: new Date().toISOString(),
      // 每首歌一份独立的匿名→模型映射 (单盲, 服务端可反查)
      mappings: buildMappings(),
      currentSong: 0,
      ratings: {},
      submitted: false,
    };
    SONGS.forEach((s) => { state.ratings[s.id] = {}; });
    saveState();
    enterEvalStep();
  }

  function enterEvalStep() {
    welcomeStep.classList.add("hidden");
    reviewStep.classList.add("hidden");
    doneStep.classList.add("hidden");
    evalStep.classList.remove("hidden");
    $("#rater-tag").textContent = state.raterId;
    renderCurrentSong();
  }

  // ================================================================
  // 渲染当前歌曲
  // ================================================================
  function renderCurrentSong() {
    const song = SONGS[state.currentSong];

    // 顶部进度
    $("#song-index").textContent = state.currentSong + 1;
    $("#progress-fill").style.width = `${overallProgress() * 100}%`;

    // 歌曲跳转按钮组
    renderSongNav();

    // 歌曲信息 (前端标题统一显示为 Sample 0N, 后台记录仍用真实 song.id)
    $("#song-title").textContent = displayName(state.currentSong);
    $("#tag-lang").textContent   = song.language;
    $("#tag-genre").textContent  = song.genre;
    $("#tag-mood").textContent   = song.mood;
    $("#tag-vocal").textContent  = song.vocal_style;
    $("#song-lyric").textContent = song.lyric;
    // 设计概要: 简短的段落级演进 (从 plan_summary 取)
    $("#song-plan-summary").textContent = song.plan_summary || song.structure || "";
    // 完整 Plan: 全局标签 + 每个段落的详细标签
    renderPlanGlobal(song.plan && song.plan.global_tags);
    renderPlanSegments(song.plan && song.plan.segments);

    // 系统卡片
    const container = $("#systems-container");
    container.innerHTML = "";
    ANON_LABELS.forEach((label) => {
      container.appendChild(buildSystemCard(label, song));
    });

    // 导航按钮
    $("#prev-btn").disabled = state.currentSong === 0;

    const isLast = state.currentSong === SONGS.length - 1;
    $("#next-btn").textContent = isLast ? "前往提交总览 →" : "下一首 →";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 渲染完整 Plan - 全局标签区
  function renderPlanGlobal(globalTags) {
    const el = $("#song-plan-global");
    el.innerHTML = "";
    if (!globalTags) return;
    const wrap = document.createElement("div");
    wrap.className = "plan-global";
    const title = document.createElement("div");
    title.className = "plan-block-title";
    title.textContent = "🌐 全局标签";
    wrap.appendChild(title);
    const chips = document.createElement("div");
    chips.className = "plan-chips";
    const KEY_LABEL = {
      global_genre:        "曲风",
      global_sound_style:  "音色风格",
      global_vocal_style:  "演唱风格",
      global_mood:         "情绪",
      global_energy_level: "能量",
      global_theme:        "主题",
    };
    Object.keys(globalTags).forEach((k) => {
      const chip = document.createElement("span");
      chip.className = "plan-chip";
      chip.innerHTML =
        `<span class="chip-k">${KEY_LABEL[k] || k}</span>` +
        `<span class="chip-v">${globalTags[k]}</span>`;
      chips.appendChild(chip);
    });
    wrap.appendChild(chips);
    el.appendChild(wrap);
  }

  // 渲染完整 Plan - 段落时间线
  function renderPlanSegments(segments) {
    const el = $("#song-plan-segments");
    el.innerHTML = "";
    if (!segments || !segments.length) return;
    const wrap = document.createElement("div");
    wrap.className = "plan-segments";
    const title = document.createElement("div");
    title.className = "plan-block-title";
    title.textContent = "🎬 段落细节 (逐段标签)";
    wrap.appendChild(title);

    const TAG_LABEL = {
      energy_level:    "能量",
      relative_energy: "相对能量",
      energy_change:   "变化",
      mood:            "情绪",
      vocal_presence:  "人声",
      function:        "功能",
      density:         "密度",
      sound_style:     "音色",
      instrumentation: "配器",
    };

    segments.forEach((seg, idx) => {
      const box = document.createElement("div");
      box.className = "plan-seg";
      const head = document.createElement("div");
      head.className = "plan-seg-head";
      head.innerHTML =
        `<span class="plan-seg-idx">${idx + 1}</span>` +
        `<span class="plan-seg-type">[${seg.type}]</span>`;
      box.appendChild(head);
      const chips = document.createElement("div");
      chips.className = "plan-chips small";
      const tags = seg.tags || {};
      Object.keys(tags).forEach((k) => {
        const chip = document.createElement("span");
        chip.className = "plan-chip";
        chip.innerHTML =
          `<span class="chip-k">${TAG_LABEL[k] || k}</span>` +
          `<span class="chip-v">${tags[k]}</span>`;
        chips.appendChild(chip);
      });
      box.appendChild(chips);
      wrap.appendChild(box);
    });
    el.appendChild(wrap);
  }

  // 歌曲快捷跳转按钮组
  function renderSongNav() {
    const nav = $("#song-nav");
    nav.innerHTML = "";
    SONGS.forEach((song, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "song-nav-btn";
      const done = isSongComplete(song.id);
      const started = songProgress(song.id).done > 0;
      if (idx === state.currentSong) btn.classList.add("current");
      if (done) btn.classList.add("done");
      else if (started) btn.classList.add("partial");

      btn.innerHTML = `<span class="idx">${idx + 1}</span>` +
                      `<span class="status">${done ? "✓ 完成" : (started ? "进行中" : "未开始")}</span>`;
      btn.title = `跳转到第 ${idx + 1} 首：${displayName(idx)}`;
      btn.addEventListener("click", () => {
        if (idx === state.currentSong) return;
        state.currentSong = idx;
        saveState();
        renderCurrentSong();
      });
      nav.appendChild(btn);
    });
  }

  function buildSystemCard(label, song) {
    const card = document.createElement("div");
    card.className = "sys-card";
    card.dataset.label = label;

    // Header
    const header = document.createElement("div");
    header.className = "sys-header";
    header.innerHTML =
      `<div class="sys-badge">${label}</div>` +
      `<div class="sys-title">系统 ${label}</div>` +
      `<div class="sys-check hidden">✓ 已完成</div>`;
    card.appendChild(header);

    // 音频（允许拖动进度条）
    //   preload="auto"      → 让浏览器尽早读到 duration 与 seekable ranges
    //   controlsList=nodl   → 隐藏下载按钮
    //   onerror             → 播放失败时给出中文提示（多半是文件格式不被支持）
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload  = "auto";
    audio.controlsList = "nodownload";
    audio.src = audioPathFor(label, song.id);
    audio.addEventListener("error", () => {
      const hint = document.createElement("div");
      hint.className = "audio-error";
      hint.textContent = "⚠ 该音频无法在当前浏览器播放/拖动进度条。建议使用 Chrome 或将文件转为 mp3。";
      audio.after(hint);
    });
    card.appendChild(audio);

    // 评分行
    DIMENSIONS.forEach((dim) => {
      const tpl = document.getElementById("rating-row-tpl").content.cloneNode(true);
      const row = tpl.querySelector(".rating-row");
      row.dataset.dim = dim.key;
      row.querySelector(".rating-title").textContent = dim.title;
      row.querySelector(".rating-question").textContent = dim.question;

      const buttons = row.querySelectorAll(".rating-stars button");
      buttons.forEach((btn) => {
        const score = parseInt(btn.dataset.score, 10);
        btn.title = `${score} 分 — ${dim.levels[score]}`;
        btn.addEventListener("click", () => {
          buttons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          recordScore(song.id, label, dim.key, score);
          updateCardCompletionUI(card, song.id, label);
          // 刷新进度条与顶部导航
          $("#progress-fill").style.width = `${overallProgress() * 100}%`;
          renderSongNav();
        });
      });

      // 恢复已保存的分数
      const prev = (state.ratings[song.id][label] || {})[dim.key];
      if (prev != null) {
        const b = row.querySelector(`.rating-stars button[data-score="${prev}"]`);
        if (b) b.classList.add("active");
      }

      card.appendChild(row);
    });

    updateCardCompletionUI(card, song.id, label);
    return card;
  }

  function recordScore(songId, label, dimKey, score) {
    if (!state.ratings[songId][label]) state.ratings[songId][label] = {};
    state.ratings[songId][label][dimKey] = score;
    saveState();
    flashSave("✔ 已保存");
  }

  function updateCardCompletionUI(card, songId, label) {
    const scores = state.ratings[songId][label] || {};
    const done = DIMENSIONS.every((d) => scores[d.key] != null);
    card.classList.toggle("completed", done);
    card.querySelector(".sys-check").classList.toggle("hidden", !done);
  }

  // ================================================================
  // 导航
  // ================================================================
  function onPrev() {
    if (state.currentSong > 0) {
      state.currentSong--;
      saveState();
      renderCurrentSong();
    }
  }

  function onNext() {
    // 最后一首时点击"下一首"进入总览
    if (state.currentSong === SONGS.length - 1) {
      enterReviewStep();
      return;
    }
    state.currentSong++;
    saveState();
    renderCurrentSong();
  }

  // ================================================================
  // 总览 & 提交
  // ================================================================
  function enterReviewStep() {
    evalStep.classList.add("hidden");
    reviewStep.classList.remove("hidden");
    renderReviewList();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderReviewList() {
    const list = $("#review-list");
    list.innerHTML = "";
    SONGS.forEach((song, idx) => {
      const p = songProgress(song.id);
      const done = p.done === p.total;
      const item = document.createElement("div");
      item.className = "review-item" + (done ? " done" : " incomplete");
      item.innerHTML =
        `<div class="review-idx">${idx + 1}</div>` +
        `<div class="review-info">` +
          `<div class="review-title">${displayName(idx)}</div>` +
          `<div class="review-sub">` +
            (done
              ? `<span class="ok">✓ 已完成全部 ${p.total} 项打分</span>`
              : `<span class="warn">⚠ 已打分 ${p.done} / ${p.total}，尚有未完成</span>`) +
          `</div>` +
        `</div>` +
        `<button class="secondary-btn edit-btn">编辑</button>`;
      item.querySelector(".edit-btn").addEventListener("click", () => {
        state.currentSong = idx;
        saveState();
        reviewStep.classList.add("hidden");
        evalStep.classList.remove("hidden");
        renderCurrentSong();
      });
      list.appendChild(item);
    });

    // 提交按钮状态
    const finalBtn = $("#submit-final-btn");
    const status = $("#review-status");
    if (allSongsComplete()) {
      finalBtn.disabled = false;
      status.textContent = "✔ 全部完成，可以提交";
      status.classList.add("saved");
    } else {
      finalBtn.disabled = true;
      status.textContent = "尚有歌曲未完成打分，请先完成所有项";
      status.classList.remove("saved");
    }
  }

  async function onSubmitFinal() {
    if (!allSongsComplete()) {
      alert("还有歌曲未完成全部打分，无法提交。请回到评测页补充。");
      return;
    }
    const confirmed = confirm(
      "确认提交后，您的评分将被上传并记入研究数据，之后无法再修改。\n\n" +
      "是否继续？"
    );
    if (!confirmed) return;

    const btn = $("#submit-final-btn");
    btn.disabled = true;
    btn.textContent = "提交中…";
    await finishEvaluation();
  }

  // ================================================================
  // 上传：直接调用 COS JS SDK 把 JSON 传到指定桶/前缀
  // ================================================================
  async function finishEvaluation() {
    const payload = buildSubmissionPayload();

    reviewStep.classList.add("hidden");
    doneStep.classList.remove("hidden");
    const msg = $("#submit-msg");

    // 兜底：配置缺失时给出错误提示 (正常情况下不会走到这里)
    if (!COS_UPLOAD || !COS_UPLOAD.Bucket || !COS_UPLOAD.Region) {
      msg.className = "submit-msg error";
      msg.textContent =
        "⚠ 提交组件加载失败，请刷新页面重试；若仍失败请联系研究人员。";
      window.__lastPayload = payload;
      state.submitted = true;
      saveState();
      return;
    }

    msg.className = "submit-msg";
    msg.textContent = "正在上传您的评分…";

    // key = <prefix><安全化用户名>_<时间戳>_<6位随机>.json
    const safeId = String(state.raterId || "anonymous")
                     .replace(/[^\w\u4e00-\u9fa5\-]/g, "_")
                     .slice(0, 40) || "anonymous";
    const ts  = new Date().toISOString().replace(/[:.]/g, "-");
    const rnd = Math.random().toString(16).slice(2, 8);
    const key = `${COS_UPLOAD.Prefix || ""}${safeId}_${ts}_${rnd}.json`;

    // 桶已设为公有读写, 使用原生 fetch 匿名 PUT, 完全无需密钥
    const url = `https://${COS_UPLOAD.Bucket}.cos.${COS_UPLOAD.Region}.myqcloud.com/${encodeURI(key)}`;
    const body = JSON.stringify(payload, null, 2);

    try {
      const resp = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body,
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      }
      msg.className = "submit-msg success";
      msg.textContent = "✔ 您的评分已成功提交，感谢参与！";
      state.submitted = true;
      clearState();
    } catch (err) {
      msg.className = "submit-msg error";
      msg.textContent =
        "提交失败：" + (err && err.message ? err.message : JSON.stringify(err)) +
        "。请检查网络后刷新页面重试，或联系研究人员。";
      window.__lastPayload = payload;
    }
  }

  function buildSubmissionPayload() {
    const rows = [];
    const submitTime = new Date().toISOString();
    SONGS.forEach((song) => {
      const perSongMap = state.mappings[song.id] || {};
      ANON_LABELS.forEach((label) => {
        const scores = state.ratings[song.id][label] || {};
        rows.push({
          rater:        state.raterId,
          background:   state.background,
          started_at:   state.startedAt,
          submitted_at: submitTime,
          song_id:      song.id,
          anon_label:   label,
          // 该 (歌曲, 匿名标签) 在本次提交中对应的真实模型
          model:        perSongMap[label],
          overall:      scores.overall      ?? "",
          vocal_acc:    scores.vocal_acc    ?? "",
          harmony:      scores.harmony      ?? "",
          structure:    scores.structure    ?? "",
          lyric:        scores.lyric        ?? "",
          faithfulness: scores.faithfulness ?? "",
        });
      });
    });
    return {
      rater:        state.raterId,
      background:   state.background,
      started_at:   state.startedAt,
      submitted_at: submitTime,
      // 完整的 "每首歌: {A:模型, B:模型, ...}" 映射表 (单盲反查用)
      mappings:     state.mappings,
      rows,
    };
  }
})();
