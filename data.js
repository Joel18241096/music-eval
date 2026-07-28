// ============================================================================
// 评测网站的核心配置。修改这里即可调整全部评测内容。
// ============================================================================

// 音频文件根路径 (audio base URL)
//   ├─ 留空 ""              → 使用本地 demo/ 目录 (需前端仓库内自带音频)
//   └─ 填入 COS 域名 (末尾无斜杠) → 用腾讯云 COS 托管音频
//
// 说明: 前端拼接规则为  <AUDIO_BASE>/<folder>_<songId>.<ext>
//       (即 batch_upload_demo.py 上传时使用的 key 命名规则)
window.AUDIO_BASE = "https://sprproxy-1258344707.cos.ap-shanghai.myqcloud.com";

// 8 个待评测模型。ext 是各自在 COS 上的真实扩展名, 请勿修改。
// 单盲展示时会给每位评测者随机打乱成 A~H。
window.MODELS = [
  { key: "SongSculpt",  folder: "SongSculpt",  ext: "flac" },
  { key: "acestep1.5",  folder: "acestep1.5",  ext: "wav"  },
  { key: "diffrhythm2", folder: "diffrhythm2", ext: "mp3"  },
  { key: "heartlib",    folder: "heartlib",    ext: "mp3"  },
  { key: "levo2",       folder: "levo2",       ext: "flac" },
  { key: "muse",        folder: "muse",        ext: "wav"  },
  { key: "suno",        folder: "suno",        ext: "mp3"  },
  { key: "yue",         folder: "yue",         ext: "mp3"  },
];

// 6 个主观评价维度（中文版，对应 objective_questionnaire.md）
window.DIMENSIONS = [
  {
    key: "overall",
    title: "整体音乐质量 (Overall Musical Quality)",
    question: "您如何评价这首生成歌曲的整体音乐质量？",
    levels: {
      5: "5 分（极佳）：接近专业制作的完整歌曲，音乐性和整体听感优秀",
      4: "4 分（好）：整体自然、悦耳，仅有少量瑕疵",
      3: "3 分（一般）：整体可接受，但部分方面明显降低了听感",
      2: "2 分（差）：存在明显质量问题，经常打断音乐连贯性",
      1: "1 分（非常差）：整体音乐质量很差，难以聆听",
    },
  },
  {
    key: "vocal_acc",
    title: "人声与伴奏质量 (Vocal & Accompaniment Quality)",
    question: "您如何评价人声演唱和器乐伴奏的质量？",
    levels: {
      5: "5 分：人声自然富有表现力，伴奏丰富真实，整体音质高",
      4: "4 分：大体自然，偶尔有一些人工痕迹或不自然的声音",
      3: "3 分：质量一般，有明显瑕疵但仍可接受",
      2: "2 分：频繁出现人工痕迹或不自然演唱/伴奏，降低听感",
      1: "1 分：严重的失真伪影，音质严重下降",
    },
  },
  {
    key: "harmony",
    title: "人声与伴奏协同 (Vocal–Accompaniment Harmony)",
    question: "人声与伴奏作为一首完整歌曲的配合程度如何？",
    levels: {
      5: "5 分：全曲人声与伴奏高度同步、平衡、相互衬托",
      4: "4 分：总体协调良好，仅有少量小的不匹配",
      3: "3 分：协调尚可，但在不同段落间不一致",
      2: "2 分：人声与伴奏经常失衡或不匹配",
      1: "1 分：人声与伴奏听起来脱节或彼此矛盾",
    },
  },
  {
    key: "structure",
    title: "歌曲结构清晰度 (Song Structure Clarity)",
    question: "整首歌曲结构的清晰度、连贯性与组织性如何？",
    levels: {
      5: "5 分：结构非常清晰，段落组织良好，音乐推进连贯",
      4: "4 分：整体结构清晰，仅有细微的组织不一致",
      3: "3 分：结构大体可辨认，但部分段落缺乏一致性",
      2: "2 分：结构组织弱或不一致，较难跟随",
      1: "1 分：没有可辨认的清晰或连贯的歌曲结构",
    },
  },
  {
    key: "lyric",
    title: "歌词演唱准确度 (Lyric Accuracy)",
    question: "生成歌曲对给定歌词的演唱准确程度如何？",
    levels: {
      5: "5 分：歌词准确、清晰演唱，几乎没有遗漏、替换或发音错误",
      4: "4 分：有少量歌词错误，但不影响整体理解",
      3: "3 分：有若干明显错误，但大部分歌词仍可辨认",
      2: "2 分：频繁出现错误，明显影响歌词可懂性",
      1: "1 分：歌词基本错误、无法辨认或缺失",
    },
  },
  {
    key: "faithfulness",
    title: "指令遵循度 (Instruction Faithfulness)",
    question: "生成的歌曲对给定文字提示的遵循程度如何？",
    levels: {
      5: "5 分：完全体现所要求的风格、情绪、结构、配器等条件",
      4: "4 分：满足大部分要求，仅有细微偏差",
      3: "3 分：大致遵循，但遗漏了若干重要条件",
      2: "2 分：仅体现了指令中的一小部分要求",
      1: "1 分：生成歌曲与给定指令基本无关",
    },
  },
];

// 6 首歌的完整信息（歌词 + prompt 概述 + 全局标签）
// 展示顺序: EE4_EN → DD4_EN → BB2_EN → DD3_EN → DD1_ZH → GG3_ZH
window.SONGS = [
  {
    id: "EE4_EN",
    title: "EE4 · 独立流行（英文）",
    language: "英文",
    genre: "独立流行",
    mood: "颂歌感、情绪充沛、鼓舞人心",
    theme: "希望与共鸣",
    vocal_style: "女主唱+和声、合唱团",
    structure: "[intro] → [verse] 深情女主唱 → [chorus] 有力女主唱+和声 → [inst] → [verse] 深情女主唱 → [chorus] 有力女主唱+和声 → [bridge] 混合合唱团 → [chorus] 有力女主唱+和声 → [outro]",
    plan_summary: "[intro] vocal_none → [verse] emotive female lead vocal → [chorus] powerful female lead vocal, layered harmonies → [inst] vocal_none → [verse] emotive female lead vocal → [chorus] powerful female lead vocal, layered harmonies → [bridge] mixed choir, unison → [chorus] powerful female lead vocal, layered harmonies → [outro] vocal_none",
    plan: {
      global_tags: {
        global_genre: "indie pop",
        global_sound_style: "hybrid, polished, warm",
        global_vocal_style: "female vocal with harmonies, choir",
        global_mood: "anthemic, emotional, uplifting",
        global_energy_level: "medium-high",
        global_theme: "hope, community",
      },
      segments: [
        { type: "intro",  tags: { energy_level: "low",         relative_energy: "lower",   energy_change: "stable",           mood: "serene, contemplative, peaceful",      vocal_presence: "none",                                              function: "introduction", density: "sparse",     sound_style: "acoustic, warm, organic, clean", instrumentation: "piano, acoustic guitar" } },
        { type: "verse",  tags: { energy_level: "medium-low",  relative_energy: "similar", energy_change: "stable",           mood: "nostalgic, melancholic, sentimental",  vocal_presence: "emotive female lead vocal",                         function: "sustain",      density: "sparse",     sound_style: "hybrid, polished, warm",         instrumentation: "piano, acoustic guitar, bass, drums" } },
        { type: "chorus", tags: { energy_level: "medium-high", relative_energy: "higher",  energy_change: "building to peak", mood: "anthemic, emotional, uplifting",       vocal_presence: "powerful female lead vocal, layered harmonies",     function: "climax",       density: "dense",      sound_style: "hybrid, polished, warm",         instrumentation: "piano, acoustic guitar, bass, drums" } },
        { type: "inst",   tags: { energy_level: "medium",      relative_energy: "lower",   energy_change: "decreasing",       mood: "dreamy, melancholic, introspective",   vocal_presence: "none",                                              function: "contrast",     density: "moderate",   sound_style: "hybrid, polished, warm",         instrumentation: "piano, acoustic guitar, bass, drums" } },
        { type: "verse",  tags: { energy_level: "medium",      relative_energy: "similar", energy_change: "increasing",       mood: "nostalgic, melancholic, sentimental",  vocal_presence: "emotive female lead vocal",                         function: "sustain",      density: "moderate",   sound_style: "hybrid, polished, warm",         instrumentation: "piano, acoustic guitar, bass, drums" } },
        { type: "chorus", tags: { energy_level: "high",        relative_energy: "higher",  energy_change: "building to peak", mood: "anthemic, emotional, uplifting",       vocal_presence: "powerful female lead vocal, layered harmonies",     function: "climax",       density: "dense",      sound_style: "hybrid, polished, warm",         instrumentation: "piano, acoustic guitar, bass, drums" } },
        { type: "bridge", tags: { energy_level: "high",        relative_energy: "lower",   energy_change: "stable",           mood: "anthemic, emotional, uplifting",       vocal_presence: "mixed choir, unison",                               function: "contrast",     density: "dense",      sound_style: "hybrid, cinematic, lush",        instrumentation: "piano, acoustic guitar, bass, drums" } },
        { type: "chorus", tags: { energy_level: "very high",   relative_energy: "higher",  energy_change: "building to peak", mood: "anthemic, emotional, powerful",        vocal_presence: "powerful female lead vocal, layered harmonies",     function: "climax",       density: "very dense", sound_style: "hybrid, polished, warm",         instrumentation: "piano, acoustic guitar, bass, drums" } },
        { type: "outro",  tags: { energy_level: "low",         relative_energy: "much lower",energy_change: "decreasing",     mood: "serene, contemplative, peaceful",      vocal_presence: "none",                                              function: "conclusion",   density: "sparse",     sound_style: "acoustic, clean, airy",          instrumentation: "piano" } },
      ],
    },
    lyric: `[intro] [Music starts] [Melody continues]
[verse] Little lights begin to shine. Painting colors through the night. Every dream can learn to fly. When we never say goodbye.
[chorus] Come together voices bright. Fill the stars with endless light. Every heartbeat joins the song. We have all belonged along.
[inst] [Instrumental Section]
[verse] Tiny hopes become the dawn. After every shadow's gone. Every smile begins to bloom. Like the spring inside the room.
[chorus] Come together voices bright. Fill the stars with endless light. Every heartbeat joins the song. We have all belonged along.
[bridge] Children's voices fill the air. Hope is growing everywhere.
[chorus] Come together voices bright. Fill the stars with endless light. Every heartbeat joins the song. We have all belonged along.
[outro] [Music fades out]`,
  },
  {
    id: "DD4_EN",
    title: "DD4 · 另类摇滚（英文）",
    language: "英文",
    genre: "另类摇滚",
    mood: "激烈、对抗、张力强",
    theme: "冲突与对抗",
    vocal_style: "男女对唱",
    structure: "[intro] → [verse] 粗糙男主唱 → [chorus] 有力女主唱 → [inst] → [verse] 有力女主唱 → [chorus] 男女对唱 → [bridge] 粗糙男主唱 → [chorus] 男女对唱 → [outro]",
    plan_summary: "[intro] vocal_none → [verse] raw male lead vocal → [chorus] powerful female lead vocal → [inst] vocal_none → [verse] powerful female lead vocal → [chorus] male lead vocal + female lead vocal → [bridge] raw male lead vocal → [chorus] male lead vocal + female lead vocal → [outro] vocal_none",
    plan: {
      global_tags: {
        global_genre: "alternative rock",
        global_sound_style: "hybrid, raw, distorted, gritty",
        global_vocal_style: "male vocal, female vocal, duet",
        global_mood: "aggressive, confrontational, intense",
        global_energy_level: "very high",
        global_theme: "tension, confrontation",
      },
      segments: [
        { type: "intro",  tags: { energy_level: "medium",      relative_energy: "lower",   energy_change: "stable",           mood: "aggressive, intense, raw",             vocal_presence: "none",                                                function: "introduction", density: "moderate",   sound_style: "hybrid, raw, distorted, gritty", instrumentation: "distorted electric guitar, acoustic drum kit" } },
        { type: "verse",  tags: { energy_level: "high",        relative_energy: "similar", energy_change: "increasing",       mood: "aggressive, confrontational, intense", vocal_presence: "raw male lead vocal",                                 function: "sustain",      density: "dense",      sound_style: "hybrid, raw, distorted, gritty", instrumentation: "distorted electric guitar, acoustic drum kit" } },
        { type: "chorus", tags: { energy_level: "very high",   relative_energy: "higher",  energy_change: "building to peak", mood: "aggressive, confrontational, intense", vocal_presence: "powerful female lead vocal",                          function: "climax",       density: "very dense", sound_style: "hybrid, raw, distorted, gritty", instrumentation: "distorted electric guitar, acoustic drum kit" } },
        { type: "inst",   tags: { energy_level: "high",        relative_energy: "lower",   energy_change: "stable",           mood: "aggressive, intense, raw",             vocal_presence: "none",                                                function: "contrast",     density: "dense",      sound_style: "hybrid, raw, distorted, gritty", instrumentation: "distorted electric guitar, acoustic drum kit" } },
        { type: "verse",  tags: { energy_level: "high",        relative_energy: "similar", energy_change: "increasing",       mood: "aggressive, defiant, intense",         vocal_presence: "powerful female lead vocal",                          function: "sustain",      density: "dense",      sound_style: "hybrid, raw, distorted, gritty", instrumentation: "distorted electric guitar, acoustic drum kit" } },
        { type: "chorus", tags: { energy_level: "very high",   relative_energy: "higher",  energy_change: "building to peak", mood: "aggressive, confrontational, intense", vocal_presence: "male lead vocal, female lead vocal, vocal harmonies", function: "climax",       density: "very dense", sound_style: "raw, distorted, gritty",         instrumentation: "distorted electric guitar, acoustic drum kit" } },
        { type: "bridge", tags: { energy_level: "medium-high", relative_energy: "lower",   energy_change: "decreasing",       mood: "aggressive, tense, confrontational",   vocal_presence: "raw male lead vocal",                                 function: "contrast",     density: "dense",      sound_style: "hybrid, raw, gritty",            instrumentation: "distorted electric guitar, acoustic drum kit" } },
        { type: "chorus", tags: { energy_level: "very high",   relative_energy: "higher",  energy_change: "building to peak", mood: "aggressive, anthemic, powerful",       vocal_presence: "male lead vocal, female lead vocal, vocal harmonies", function: "climax",       density: "very dense", sound_style: "raw, distorted, gritty",         instrumentation: "distorted electric guitar, acoustic drum kit" } },
        { type: "outro",  tags: { energy_level: "medium",      relative_energy: "lower",   energy_change: "decreasing",       mood: "melancholic, introspective, raw",      vocal_presence: "none",                                                function: "conclusion",   density: "moderate",   sound_style: "hybrid, raw, gritty",            instrumentation: "distorted electric guitar, acoustic drum kit" } },
      ],
    },
    lyric: `[intro] [Music starts] [Melody continues]
[verse] You said run. I said stay. You built walls. I found ways.
[chorus] We don't break. We ignite. Every clash becomes our light. Louder now than yesterday. We were born this way.
[inst] [Instrumental Section]
[verse] You drew lines. I crossed through. Every doubt only grew. Stronger than before.
[chorus] We don't break. We ignite. Every clash becomes our light. Louder now than yesterday. We were born this way.
[bridge] Maybe winning means we both survive. Not goodbye.
[chorus] We don't break. We ignite. Every clash becomes our light. Louder now than yesterday. We were born this way.
[outro] [Music fades out]`,
  },
  {
    id: "BB2_EN",
    title: "BB2 · Trap / Hip-Hop（英文）",
    language: "英文",
    genre: "Trap / 嘻哈",
    mood: "自信、坚定、律动感强",
    theme: "奋斗与野心",
    vocal_style: "男声说唱",
    structure: "[intro] 原声吉他 → [verse] 鼓机+合成贝斯 → [chorus] 808+trap hi-hats → [inst] 钢琴 → [verse] 干净电吉他 → [chorus] 失真808 → [bridge] 钢琴+合成器 → [chorus] 808 → [outro] 低频铺垫",
    plan_summary: "[intro] acoustic guitar → [verse] drum machine, synth bass → [chorus] 808 bassline, trap hi-hats, atmospheric synth pad → [inst] piano, drum machine → [verse] clean electric guitar, drum machine, bassline → [chorus] distorted 808 bass, trap hi-hats → [bridge] piano, atmospheric synth pad → [chorus] 808 bassline, trap hi-hats, atmospheric synth pad → [outro] low-frequency synth pad",
    plan: {
      global_tags: {
        global_genre: "trap, hip-hop",
        global_sound_style: "electronic, polished, bright",
        global_vocal_style: "male rap",
        global_mood: "confident, assertive, rhythmic",
        global_energy_level: "medium-high",
        global_theme: "hustle, ambition",
      },
      segments: [
        { type: "intro",  tags: { energy_level: "low",         relative_energy: "lower",  energy_change: "stable",           mood: "melancholic, introspective, dreamy",   vocal_presence: "none",                          function: "introduction", density: "sparse",     sound_style: "acoustic, warm, organic, clean",   instrumentation: "acoustic guitar" } },
        { type: "verse",  tags: { energy_level: "medium-low",  relative_energy: "similar",energy_change: "increasing",       mood: "confident, assertive, rhythmic",       vocal_presence: "male rap, confident flow",      function: "sustain",      density: "moderate",   sound_style: "electronic, polished, bright",     instrumentation: "drum machine, synth bass" } },
        { type: "chorus", tags: { energy_level: "medium-high", relative_energy: "higher", energy_change: "building to peak", mood: "confident, assertive, energetic",      vocal_presence: "male rap, ad-libs",             function: "climax",       density: "dense",      sound_style: "electronic, polished, bright",     instrumentation: "808 bassline, trap hi-hats, atmospheric synth pad" } },
        { type: "inst",   tags: { energy_level: "medium",      relative_energy: "lower",  energy_change: "decreasing",       mood: "melancholic, introspective, dreamy",   vocal_presence: "none",                          function: "contrast",     density: "moderate",   sound_style: "hybrid, polished, warm",           instrumentation: "piano, drum machine" } },
        { type: "verse",  tags: { energy_level: "medium",      relative_energy: "similar",energy_change: "increasing",       mood: "confident, assertive, rhythmic",       vocal_presence: "male rap, assertive flow",      function: "sustain",      density: "moderate",   sound_style: "electronic, polished, bright",     instrumentation: "clean electric guitar, drum machine, bassline" } },
        { type: "chorus", tags: { energy_level: "high",        relative_energy: "higher", energy_change: "building to peak", mood: "aggressive, confident, confrontational",vocal_presence: "male rap, ad-libs",             function: "climax",       density: "dense",      sound_style: "electronic, raw, distorted, gritty",instrumentation: "distorted 808 bass, trap hi-hats" } },
        { type: "bridge", tags: { energy_level: "medium-low",  relative_energy: "lower",  energy_change: "decreasing",       mood: "melancholic, introspective, dreamy",   vocal_presence: "male rap, conversational",      function: "contrast",     density: "sparse",     sound_style: "hybrid, polished, warm",           instrumentation: "piano, atmospheric synth pad" } },
        { type: "chorus", tags: { energy_level: "high",        relative_energy: "similar",energy_change: "stable",           mood: "confident, assertive, energetic",      vocal_presence: "male rap, ad-libs",             function: "climax",       density: "dense",      sound_style: "electronic, polished, bright",     instrumentation: "808 bassline, trap hi-hats, atmospheric synth pad" } },
        { type: "outro",  tags: { energy_level: "very low",    relative_energy: "much lower",energy_change: "decreasing",     mood: "melancholic, introspective, atmospheric",vocal_presence: "none",                        function: "conclusion",   density: "very sparse",sound_style: "electronic, polished, bright",     instrumentation: "low-frequency synth pad" } },
      ],
    },
    lyric: `[intro] [Guitar Intro] [Melody continues]
[verse] Started low but kept the flame. No shortcuts on this road I made. Every loss became my fuel. Now the future knows my name.
[chorus] Hands up high we never fold. Rising louder never slow. Built from dust into the gold. Watch the whole skyline glow.
[inst] [Instrumental Section]
[verse] City echoes feel the beat. Every lesson made me sharp. Moving steady never sleep. Fire still lives inside my heart.
[chorus] Hands up high we never fold. Rising louder never slow. Built from dust into the gold. Watch the whole skyline glow.
[bridge] Every closed door made me climb. Every setback changed my pace. Now I'm standing in the light. Looking failure in the face.
[chorus] Hands up high we never fold. Rising louder never slow. Built from dust into the gold. Watch the whole skyline glow.
[outro] [Music fades out]`,
  },
  {
    id: "DD3_EN",
    title: "DD3 · 电影感管弦乐（英文）",
    language: "英文",
    genre: "电影配乐 / 管弦",
    mood: "戏剧化、热烈、激烈",
    theme: "史诗冲突与命运",
    vocal_style: "男女对唱",
    structure: "[intro] → [verse] 气声女主唱 → [chorus] 男女合唱+和声 → [inst] → [verse] 气声男主唱 → [chorus] 男女合唱+和声 → [bridge] 深情女主唱 → [chorus] 男女合唱+和声 → [outro]",
    plan_summary: "[intro] vocal_none → [verse] breathy female lead vocal → [chorus] male lead vocal, female lead vocal, vocal harmonies → [inst] vocal_none → [verse] breathy male lead vocal → [chorus] male lead vocal, female lead vocal, vocal harmonies → [bridge] emotive female lead vocal → [chorus] male lead vocal, female lead vocal, vocal harmonies → [outro] vocal_none",
    plan: {
      global_tags: {
        global_genre: "cinematic, orchestral",
        global_sound_style: "orchestral, cinematic, lush, warm",
        global_vocal_style: "male vocal, female vocal, duet",
        global_mood: "dramatic, passionate, intense",
        global_energy_level: "very high",
        global_theme: "epic conflict, destiny",
      },
      segments: [
        { type: "intro",  tags: { energy_level: "medium",      relative_energy: "lower",   energy_change: "stable",           mood: "dramatic, passionate, intense",         vocal_presence: "none",                                                function: "introduction", density: "moderate",   sound_style: "orchestral, cinematic, lush, warm",     instrumentation: "grand piano, cinematic strings" } },
        { type: "verse",  tags: { energy_level: "medium-high", relative_energy: "similar", energy_change: "increasing",       mood: "dramatic, passionate, intense",         vocal_presence: "breathy female lead vocal",                            function: "sustain",      density: "dense",      sound_style: "orchestral, cinematic, lush, warm",     instrumentation: "grand piano, cinematic strings" } },
        { type: "chorus", tags: { energy_level: "very high",   relative_energy: "higher",  energy_change: "building to peak", mood: "anthemic, emotional, powerful",         vocal_presence: "male lead vocal, female lead vocal, vocal harmonies",  function: "climax",       density: "very dense", sound_style: "orchestral, cinematic, lush",           instrumentation: "grand piano, cinematic strings" } },
        { type: "inst",   tags: { energy_level: "high",        relative_energy: "lower",   energy_change: "decreasing",       mood: "dramatic, passionate, intense",         vocal_presence: "none",                                                function: "contrast",     density: "dense",      sound_style: "orchestral, cinematic, lush, warm",     instrumentation: "grand piano, cinematic strings" } },
        { type: "verse",  tags: { energy_level: "high",        relative_energy: "similar", energy_change: "increasing",       mood: "dramatic, passionate, intense",         vocal_presence: "breathy male lead vocal",                              function: "sustain",      density: "dense",      sound_style: "orchestral, cinematic, polished, lush", instrumentation: "grand piano, cinematic strings" } },
        { type: "chorus", tags: { energy_level: "very high",   relative_energy: "higher",  energy_change: "building to peak", mood: "anthemic, emotional, powerful",         vocal_presence: "male lead vocal, female lead vocal, vocal harmonies",  function: "climax",       density: "very dense", sound_style: "orchestral, cinematic, lush",           instrumentation: "grand piano, cinematic strings" } },
        { type: "bridge", tags: { energy_level: "medium",      relative_energy: "lower",   energy_change: "decreasing",       mood: "melancholic, introspective, sentimental",vocal_presence: "emotive female lead vocal",                            function: "contrast",     density: "moderate",   sound_style: "acoustic, cinematic, warm, airy",       instrumentation: "grand piano, cinematic strings" } },
        { type: "chorus", tags: { energy_level: "very high",   relative_energy: "higher",  energy_change: "building to peak", mood: "anthemic, emotional, powerful",         vocal_presence: "male lead vocal, female lead vocal, vocal harmonies",  function: "climax",       density: "very dense", sound_style: "orchestral, cinematic, lush, warm",     instrumentation: "grand piano, cinematic strings" } },
        { type: "outro",  tags: { energy_level: "low",         relative_energy: "much lower",energy_change: "decreasing",     mood: "serene, contemplative, peaceful",       vocal_presence: "none",                                                function: "conclusion",   density: "sparse",     sound_style: "acoustic, clean, airy",                 instrumentation: "grand piano, cinematic strings" } },
      ],
    },
    lyric: `[intro] [Music starts] [Melody continues]
[verse] She said hope can heal the night. He said scars still hold the rain. She reached for tomorrow's light. He remembered every pain.
[chorus] Two hearts standing face to face. One believes and one lets go. Time decides whose truth remains. Where the silent rivers flow.
[inst] [Instrumental Section]
[verse] She became the rising dawn. He became the fading star. Yet they found one final song. Carrying them both afar.
[chorus] Two hearts standing face to face. One believes and one lets go. Time decides whose truth remains. Where the silent rivers flow.
[bridge] Love is never black or white. Both were right beneath the sky.
[chorus] Two hearts standing face to face. One believes and one lets go. Time decides whose truth remains. Where the silent rivers flow.
[outro] [Music fades out]`,
  },
  {
    id: "DD1_ZH",
    title: "DD1 · 华语流行抒情曲（中文）",
    language: "中文",
    genre: "华语流行 / 抒情",
    mood: "感性、深情、怀旧",
    theme: "爱与成长",
    vocal_style: "男声",
    structure: "[intro] 无人声 → [verse] 气声男主唱 → [chorus] 深情男主唱 → [inst] → [verse] 气声男主唱 → [chorus] 有力男主唱 → [bridge] 深情男主唱 → [chorus] 有力男主唱+和声 → [outro]",
    plan_summary: "[intro] vocal_none → [verse] breathy male lead vocal → [chorus] passionate male lead vocal → [inst] vocal_none → [verse] breathy male lead vocal → [chorus] powerful male lead vocal → [bridge] heartfelt male lead vocal → [chorus] powerful male lead vocal, layered harmonies → [outro] vocal_none",
    plan: {
      global_tags: {
        global_genre: "mandopop, ballad",
        global_sound_style: "acoustic, hybrid",
        global_vocal_style: "male vocal",
        global_mood: "sentimental, emotional, nostalgic",
        global_energy_level: "medium-high",
        global_theme: "love, growth",
      },
      segments: [
        { type: "intro",   tags: { energy_level: "very low",    relative_energy: "lower",  energy_change: "stable",           mood: "serene, contemplative, peaceful",     vocal_presence: "none",                                       function: "introduction", density: "very sparse", sound_style: "acoustic, warm, organic, clean", instrumentation: "piano" } },
        { type: "verse",   tags: { energy_level: "low",         relative_energy: "lower",  energy_change: "increasing",       mood: "nostalgic, melancholic, sentimental", vocal_presence: "breathy male lead vocal",                    function: "sustain",      density: "sparse",      sound_style: "acoustic, warm, organic, clean", instrumentation: "piano, strings" } },
        { type: "chorus",  tags: { energy_level: "medium-high", relative_energy: "higher", energy_change: "building to peak", mood: "sentimental, emotional, heartfelt",   vocal_presence: "passionate male lead vocal",                 function: "climax",       density: "dense",       sound_style: "hybrid, polished, warm",         instrumentation: "piano, strings, bass, drums" } },
        { type: "inst",    tags: { energy_level: "medium",      relative_energy: "lower",  energy_change: "decreasing",       mood: "dramatic, passionate, intense",       vocal_presence: "none",                                       function: "contrast",     density: "moderate",    sound_style: "hybrid, polished, warm",         instrumentation: "piano, strings" } },
        { type: "verse",   tags: { energy_level: "medium",      relative_energy: "similar",energy_change: "increasing",       mood: "dramatic, passionate, intense",       vocal_presence: "breathy male lead vocal, strained intensity",function: "sustain",      density: "moderate",    sound_style: "hybrid, polished, warm",         instrumentation: "piano, strings, bass, drums" } },
        { type: "chorus",  tags: { energy_level: "high",        relative_energy: "higher", energy_change: "building to peak", mood: "anthemic, emotional, powerful",       vocal_presence: "powerful male lead vocal, layered harmonies",function: "climax",       density: "dense",       sound_style: "hybrid, polished, warm",         instrumentation: "piano, strings, bass, drums" } },
        { type: "bridge",  tags: { energy_level: "medium-low",  relative_energy: "lower",  energy_change: "decreasing",       mood: "melancholic, introspective, heartfelt",vocal_presence: "heartfelt male lead vocal",                 function: "contrast",     density: "sparse",      sound_style: "acoustic, warm, intimate, clean",instrumentation: "piano" } },
        { type: "chorus",  tags: { energy_level: "very high",   relative_energy: "higher", energy_change: "building to peak", mood: "anthemic, emotional, powerful",       vocal_presence: "powerful male lead vocal, layered harmonies",function: "climax",       density: "very dense",  sound_style: "hybrid, polished, warm",         instrumentation: "piano, strings, bass, drums" } },
        { type: "outro",   tags: { energy_level: "very low",    relative_energy: "much lower",energy_change: "decreasing",    mood: "serene, contemplative, peaceful",     vocal_presence: "none",                                       function: "conclusion",   density: "very sparse", sound_style: "acoustic, warm, organic, clean", instrumentation: "piano" } },
      ],
    },
    lyric: `[intro] [Music starts] [Melody continues]
[verse] 风吹漫长长夜.心藏微弱火焰.一路跌跌撞撞.依旧奔赴明天.
[chorus] 此刻放声歌唱.终于迎来晴朗.每次勇敢成长.都能照亮远方.
[inst] [Instrumental Section]
[verse] 每道深深伤痕.都成新的旅程.眼里依然有梦.心中依然有风.
[chorus] 此刻放声歌唱.终于迎来晴朗.每次勇敢成长.都能照亮远方.
[bridge] 愿我始终相信.光会落进生命.
[chorus] 此刻放声歌唱.终于迎来晴朗.每次勇敢成长.都能照亮远方.
[outro] [Music fades out]`,
  },
  {
    id: "GG3_ZH",
    title: "GG3 · 华语流行抒情曲（中文）",
    language: "中文",
    genre: "华语流行 / 抒情",
    mood: "感性、忧郁、真挚",
    theme: "温柔的回忆与思念",
    vocal_style: "富有情感的女声",
    structure: "[intro] 极弱 → [verse] 弱 → [chorus] 中 → [inst] 弱 → [verse] 中 → [chorus] 中偏弱 → [bridge] 弱 → [chorus] 中 → [outro] 极弱",
    plan_summary: "[intro] very low → [verse] low → [chorus] medium → [inst] low → [verse] medium → [chorus] medium-low → [bridge] low → [chorus] medium → [outro] very low",
    plan: {
      global_tags: {
        global_genre: "mandopop, ballad",
        global_sound_style: "acoustic, hybrid",
        global_vocal_style: "emotive female vocal",
        global_mood: "sentimental, melancholic, heartfelt",
        global_energy_level: "medium",
        global_theme: "gentle memory, longing",
      },
      segments: [
        { type: "intro",  tags: { energy_level: "very low",   relative_energy: "lower",   energy_change: "stable",           mood: "serene, contemplative, peaceful",     vocal_presence: "none",                    function: "introduction", density: "very sparse", sound_style: "acoustic, warm, organic, clean", instrumentation: "piano" } },
        { type: "verse",  tags: { energy_level: "low",        relative_energy: "similar", energy_change: "increasing",       mood: "nostalgic, melancholic, sentimental",vocal_presence: "emotive female lead vocal",function: "sustain",      density: "sparse",      sound_style: "acoustic, warm, organic, clean", instrumentation: "piano, strings" } },
        { type: "chorus", tags: { energy_level: "medium",     relative_energy: "higher",  energy_change: "building to peak", mood: "sentimental, emotional, heartfelt",  vocal_presence: "emotive female lead vocal",function: "climax",       density: "moderate",    sound_style: "hybrid, polished, warm",         instrumentation: "piano, strings, bass, drums" } },
        { type: "inst",   tags: { energy_level: "low",        relative_energy: "lower",   energy_change: "decreasing",       mood: "calm, introspective, melancholic",   vocal_presence: "none",                    function: "contrast",     density: "sparse",      sound_style: "acoustic, warm, organic, clean", instrumentation: "piano" } },
        { type: "verse",  tags: { energy_level: "medium",     relative_energy: "similar", energy_change: "increasing",       mood: "nostalgic, melancholic, sentimental",vocal_presence: "emotive female lead vocal",function: "sustain",      density: "moderate",    sound_style: "acoustic, warm, organic, clean", instrumentation: "piano, strings" } },
        { type: "chorus", tags: { energy_level: "medium-low", relative_energy: "lower",   energy_change: "decreasing",       mood: "melancholic, introspective, sentimental",vocal_presence: "emotive female lead vocal",function: "climax",     density: "sparse",      sound_style: "acoustic, warm, organic, clean", instrumentation: "piano, strings" } },
        { type: "bridge", tags: { energy_level: "low",        relative_energy: "lower",   energy_change: "decreasing",       mood: "melancholic, introspective, wistful",vocal_presence: "emotive female lead vocal",function: "contrast",     density: "sparse",      sound_style: "acoustic, warm, intimate, clean",instrumentation: "piano" } },
        { type: "chorus", tags: { energy_level: "medium",     relative_energy: "similar", energy_change: "stable",           mood: "sentimental, nostalgic, heartfelt",  vocal_presence: "emotive female lead vocal",function: "climax",       density: "moderate",    sound_style: "hybrid, polished, warm",         instrumentation: "piano, strings, bass, drums" } },
        { type: "outro",  tags: { energy_level: "very low",   relative_energy: "lower",   energy_change: "decreasing",       mood: "serene, contemplative, peaceful",    vocal_presence: "none",                    function: "conclusion",   density: "very sparse", sound_style: "acoustic, warm, organic, clean", instrumentation: "piano" } },
      ],
    },
    lyric: `[intro] [Piano Intro] [Melody continues]
[verse] 云慢慢地飘远.风静静绕耳边.故事轻轻沉淀.心事悄然舒展.
[chorus] 顺着时间流淌.所有悲伤退场.明天依旧晴朗.
[inst] [Instrumental Section]
[verse] 河流缓缓歌唱.晚霞映红山岗.世界温柔生长.
[chorus] 顺着时间流淌.所有悲伤退场.明天依旧晴朗.
[bridge] 一切都会安然.
[chorus] 顺着时间流淌.所有悲伤退场.明天依旧晴朗.
[outro] [Music fades out]`,
  },
];

// ========== 结果上传配置 ==========
// 桶已设为公有读写, 前端使用原生 fetch PUT 匿名直传, 无需任何密钥
window.COS_UPLOAD = {
  Bucket: "yutangfeng-1459725450",
  Region: "ap-guangzhou",
  Prefix: "eval_data_AAAI_submissions/",
};

// 匿名标签（会按每个评测者独立随机映射到 MODELS）
window.ANON_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];
