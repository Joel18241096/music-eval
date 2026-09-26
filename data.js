// ============================================================================
// 评测网站的核心配置。修改这里即可调整全部评测内容。
// ============================================================================

// 音频文件根路径 (audio base URL)
//   ├─ 留空 ""              → 使用本地 samples/ 目录 (需前端仓库内自带音频)
//   └─ 填入 COS 域名 (末尾无斜杠) → 用腾讯云 COS 托管音频
//
// 说明: 前端拼接规则为  <AUDIO_BASE>/<folder>/demo<audio_idx>.<ext>
//       (即 scripts/upload_samples.py 上传时使用的 key 命名规则)
window.AUDIO_BASE = "https://sprproxy-1258344707.cos.ap-shanghai.myqcloud.com/ICLR2027_musicstar/samples";

// 6 个待评测模型。folder 与本地 samples/ 下的子目录同名, ext 是各自音频真实扩展名。
// 单盲展示时会给每位评测者独立随机打乱成 A~F。
window.MODELS = [
  { key: "Heartmula",  folder: "Heartmula",  ext: "wav"  },
  { key: "Minimax3",   folder: "Minimax3",   ext: "wav"  },
  { key: "MusicSTAR",  folder: "MusicSTAR",  ext: "flac" },
  { key: "acestep1.5", folder: "acestep1.5", ext: "wav"  },
  { key: "levo2",      folder: "levo2",      ext: "flac" },
  { key: "muse",       folder: "muse",       ext: "wav"  },
];

// 6 个主观评价维度（中文版，对应 objective_questionnaire.md）
window.DIMENSIONS = [
  {
    key: "overall",
    title: "整体音乐质量（Overall Musical Quality）",
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
    title: "人声与伴奏质量（Vocal & Accompaniment Quality）",
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
    title: "人声—伴奏融合度（Vocal-Accompaniment Harmony）",
    question: "人声与伴奏作为一首完整歌曲的融合程度如何？",
    levels: {
      5: "5 分：全曲人声与伴奏高度融合、平衡、相互衬托",
      4: "4 分：总体融合良好，仅有少量小的不匹配",
      3: "3 分：融合尚可，但在不同段落间不一致",
      2: "2 分：人声与伴奏经常失衡或不匹配",
      1: "1 分：人声与伴奏听起来脱节或彼此矛盾",
    },
  },
  {
    key: "structure",
    title: "歌曲结构清晰度（Song Structure Clarity）",
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
    title: "歌词保真度（Lyric Fidelity）",
    question: "生成歌曲对给定歌词的还原保真程度如何？",
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
    title: "指令遵循度（Instruction Adherence）",
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

// 5 首歌的原始 prompt 与歌词（严格来自 prompt_lyrics.md, 未加任何改写）
// 展示顺序 & audio_idx 与本地 samples/<model>/demo{1..5} 文件名一一对应:
//   demo1 → IN_208, demo2 → VL_208, demo3 → VE_201, demo4 → MD_101, demo5 → IN_106
// 字段说明:
//   id           - 歌曲唯一标识
//   audio_idx    - 音频文件编号 (拼接 demo<audio_idx>.<ext>)
//   test_target  - 该歌曲测试的维度类型 + 段落级演进 (来自 md "测试目标" 行)
//   caption      - 喂给模型的完整英文 prompt (来自 md "caption" 字段)
//   lyric        - 喂给模型的歌词 (来自 md "gt_lyric" 字段, 保留 ; 与 . 原始分隔)
window.SONGS = [
  {
    id: "IN_208",
    audio_idx: 1,
    test_target: {
      dimension: "instrumentation",
      progression: "tin whistle, fiddle → fiddle, accordion, acoustic guitar, hand drum → fiddle, accordion, acoustic guitar, hand drum, tin whistle → electric guitar, bass guitar, drum kit, fiddle, accordion → fiddle, accordion, acoustic guitar, hand drum → fiddle, accordion, acoustic guitar, hand drum, tin whistle → electric guitar, bass guitar, drum kit, fiddle, accordion → acoustic guitar, tin whistle, cello → electric guitar, bass guitar, drum kit, fiddle, tin whistle → tin whistle, fiddle",
    },
    caption: "A ten-section celtic folk song with elements of folk rock ; It opens with a calm and nostalgic intro. Energy is low and holds steady. It is instrumental, with no lead vocal, set over tin whistle and fiddle. The sound is warm, intimate, and acoustic, with a slow and laid-back groove ; Then comes a nostalgic and storytelling verse. Energy is low and holds steady. It is carried by warm and sung male vocals, set over fiddle, accordion, acoustic guitar, and hand drum. The sound is warm, intimate, and acoustic, with a mid-tempo, laid-back, and straight groove ; Next is a hopeful and yearning pre-chorus. Energy is medium and builds throughout. It is carried by warm and sung male vocals, set over fiddle, accordion, acoustic guitar, hand drum, and tin whistle. The sound is warm, intimate, and acoustic, with a mid-tempo, laid-back, and straight groove ; After that comes an uplifting and warm chorus. Energy is medium and holds steady. It is carried by warm and sung male vocals, set over electric guitar, bass guitar, drum kit, fiddle, and accordion. The sound is warm, polished, and organic, with a mid-tempo, driving, and straight groove ; This leads into a nostalgic and storytelling verse. Energy is low and holds steady. It is carried by warm and sung male vocals, set over fiddle, accordion, acoustic guitar, and hand drum. The sound is warm, intimate, and acoustic, with a mid-tempo, laid-back, and straight groove ; Following that is a hopeful and yearning pre-chorus. Energy is medium and builds throughout. It is carried by warm and sung male vocals, set over fiddle, accordion, acoustic guitar, hand drum, and tin whistle. The sound is warm, intimate, and acoustic, with a mid-tempo, laid-back, and straight groove ; Then an uplifting and warm chorus. Energy is medium and holds steady. It is carried by warm and sung male vocals, set over electric guitar, bass guitar, drum kit, fiddle, and accordion. The sound is warm, polished, and organic, with a mid-tempo, driving, and straight groove ; Then comes a reflective and tender bridge. Energy is low and builds throughout. It is carried by warm and sung male vocals, set over acoustic guitar, tin whistle, and cello. The sound is warm, intimate, and acoustic, with a slow and laid-back groove ; Next is an uplifting and warm chorus. Energy is medium and holds steady. It is carried by warm and sung male vocals, set over electric guitar, bass guitar, drum kit, fiddle, and tin whistle. The sound is warm, polished, and organic, with a mid-tempo, driving, and straight groove ; It closes with a serene and nostalgic outro. Energy is low and fades out. It is instrumental, with no lead vocal, set over tin whistle and fiddle. The sound is warm, intimate, and acoustic, with a slow and laid-back groove.",
    lyric: "[intro] ; [verse] The ferry leaves at half past six. For the island in the mist. My grandmother waved from the dock. With a handkerchief in her fist. And the fiddler played a parting reel. That echoed o er the foam ; [pre-chorus] Oh the sea she is a widow maker. But she brings us home. Every wave a rolling meadow. Every star a stone ; [chorus] Raise a glass to the island. To the rock and to the wave. To the ones who work the water. To the bold and to the brave. Sing hey for the morning ferry. Sing ho for the evening tide. The island is my mother. And the ocean is my bride ; [verse] The pub is warm with peat smoke. And the stout is dark as night. Old Seamus tells the stories. Of the selkies and the light. And the band strikes up a jig. That sets the floor alight ; [pre-chorus] Oh the sea she is a widow maker. But she brings us home. Every wave a rolling meadow. Every star a stone ; [chorus] Raise a glass to the island. To the rock and to the wave. To the ones who work the water. To the bold and to the brave. Sing hey for the morning ferry. Sing ho for the evening tide. The island is my mother. And the ocean is my bride ; [bridge] And when the storm comes howling. And the boats are tied up tight. We gather by the fire. And sing away the night ; [chorus] Raise a glass to the island. To the rock and to the wave. To the ones who work the water. To the bold and to the brave. Sing hey for the morning ferry. Sing ho for the evening tide. The island is my mother. And the ocean is my bride ; [outro]",
  },
  {
    id: "VL_208",
    audio_idx: 2,
    test_target: {
      dimension: "vocal_lead",
      progression: "none → raspy, sung, male → smooth, sung, female → raspy, sung, male → smooth, sung, female → raspy, sung, male → smooth, sung, female → none",
    },
    caption: "An eight-section folk song with elements of americana ; It opens with a calm and nostalgic intro. Energy is low and holds steady. It is instrumental, with no lead vocal, set over fingerpicked acoustic guitar. The sound is warm, intimate, and acoustic, with a slow and laid-back groove ; Then comes a nostalgic and storytelling verse. Energy is low and holds steady. It is carried by raspy and sung male vocals, set over fingerpicked acoustic guitar and upright bass. The sound is warm, intimate, and acoustic, with a mid-tempo, laid-back, and straight groove ; Next is an uplifting and warm chorus. Energy is medium and holds steady. It is carried by smooth and sung female vocals, set over acoustic guitar, banjo, upright bass, brushed drums, and fiddle. The sound is warm, polished, and organic, with a mid-tempo, driving, and straight groove ; After that comes a nostalgic and storytelling verse. Energy is low and holds steady. It is carried by raspy and sung male vocals, set over fingerpicked acoustic guitar and upright bass. The sound is warm, intimate, and acoustic, with a mid-tempo, laid-back, and straight groove ; This leads into an uplifting and warm chorus. Energy is medium and holds steady. It is carried by smooth and sung female vocals, set over acoustic guitar, banjo, upright bass, brushed drums, and fiddle. The sound is warm, polished, and organic, with a mid-tempo, driving, and straight groove ; Following that is a nostalgic and storytelling verse. Energy is low and holds steady. It is carried by raspy and sung male vocals, set over fingerpicked acoustic guitar and upright bass. The sound is warm, intimate, and acoustic, with a mid-tempo, laid-back, and straight groove ; Then an uplifting and warm chorus. Energy is medium and holds steady. It is carried by smooth and sung female vocals, set over acoustic guitar, banjo, upright bass, brushed drums, and fiddle. The sound is warm, polished, and organic, with a mid-tempo, driving, and straight groove ; It ends with a serene and nostalgic outro. Energy is low and fades out. It is instrumental, with no lead vocal, set over fingerpicked acoustic guitar. The sound is warm, intimate, and acoustic, with a slow and laid-back groove.",
    lyric: "[intro] ; [verse] Dusty boots on a gravel road. Forty years of heavy loads. My hands are maps of calluses. From everything I owed. But I never owed the sunset. And it never let me down ; [chorus] Rest now. Lay your burdens down. The field is plowed. The day is done. Rest now. Let the evening crown. Everything your heart has won ; [verse] The barn leans to the west a bit. Like me it needs a rest. The fence I built in seventy nine. Has stood up to the test. Some things I fixed with wire and prayer. Some I never fixed ; [chorus] Rest now. Lay your burdens down. The field is plowed. The day is done. Rest now. Let the evening crown. Everything your heart has won ; [verse] My daughter has my father's eyes. And her mother's gentle grace. She says she wants the city lights. I say that is okay. This old dirt will be right here. If she ever needs a place ; [chorus] Rest now. Lay your burdens down. The field is plowed. The day is done. Rest now. Let the evening crown. Everything your heart has won ; [outro]",
  },
  {
    id: "VE_201",
    audio_idx: 3,
    test_target: {
      dimension: "vocal_ensemble",
      progression: "none → none → two-part harmony → none → three-part harmony → three-part harmony, backing vocals → stacked harmonies, backing vocals, ad-libs → none",
    },
    caption: "An eight-section pop ballad song with elements of adult contemporary ; It opens with a tender and dreamy intro. Energy is low and builds throughout. It is instrumental, with no lead vocal, set over piano and ambient pad. The sound is warm, intimate, and acoustic, with a slow and laid-back groove ; Then comes a melancholic and tender verse. Energy is low and holds steady. It is carried by breathy and softly sung female vocals, set over piano and soft synth pad. The sound is warm, intimate, and hybrid, with a slow, laid-back, and backbeat groove ; Next is an euphoric and passionate chorus. Energy is high and holds steady. It is carried by powerful and belted female vocals, backed by two-part harmony, set over piano, strings, drum kit, and electric bass. The sound is lush, polished, and hybrid, with a mid-tempo, driving, and backbeat groove ; After that comes a melancholic and tender verse. Energy is low and holds steady. It is carried by breathy and softly sung female vocals, set over piano and soft synth pad. The sound is warm, intimate, and hybrid, with a slow, laid-back, and backbeat groove ; This leads into an euphoric and passionate chorus. Energy is high and holds steady. It is carried by powerful and belted female vocals, backed by three-part harmony, set over piano, strings, drum kit, and electric bass. The sound is lush, polished, and hybrid, with a mid-tempo, driving, and backbeat groove ; Following that is a dramatic and emotional bridge. Energy is medium and builds throughout. It is carried by powerful and belted female vocals, backed by three-part harmony and backing vocals, set over piano, strings, and drum kit. The sound is lush, cinematic, and hybrid, with a mid-tempo, driving, and backbeat groove ; Then an euphoric and passionate chorus. Energy is very high and holds steady. It is carried by powerful and belted female vocals, backed by stacked harmonies, backing vocals, and ad-libs, set over piano, strings, drum kit, and electric bass. The sound is lush, polished, and hybrid, with a mid-tempo, driving, and backbeat groove ; It ends with a bittersweet and serene outro. Energy is low and fades out. It is instrumental, with no lead vocal, set over piano and ambient pad. The sound is warm, intimate, and acoustic, with a slow and laid-back groove.",
    lyric: "[intro] ; [verse] The attic stairs still creak the same. The boxes hold the years. Your letters tied with faded string. Have dried a thousand tears. I read them when the rain comes down. And time just disappears ; [chorus] We were golden. We were young. Every word a song unsung. We were endless summer skies. With forever in our eyes. And though the seasons turned us grey. Those golden days remain ; [verse] The porch swing sways in evening air. Like it is keeping time. With every ghost of laughter. Every reason. Every rhyme. The years have been both kind and cruel. But they left us this prime ; [chorus] We were golden. We were young. Every word a song unsung. We were endless summer skies. With forever in our eyes. And though the seasons turned us grey. Those golden days remain ; [bridge] Hold the faded photographs. Up to the evening light. We are still inside them somewhere. Golden and bright ; [chorus] We were golden. We were young. Every word a song unsung. We were endless summer skies. With forever in our eyes. And though the seasons turned us grey. Those golden days remain. Golden days remain ; [outro]",
  },
  {
    id: "MD_101",
    audio_idx: 4,
    test_target: {
      dimension: "mood",
      progression: "melancholic, quiet → melancholic, tender → hopeful, gentle → uplifting, warm → calm, hopeful → melancholic, tender → hopeful, gentle → uplifting, warm → serene, hopeful",
    },
    caption: "A nine-section mandopop song with elements of healing ballad ; It opens with a melancholic and quiet intro. Energy is low and builds throughout. It is instrumental, with no lead vocal, set over piano and strings. The sound is warm, intimate, and acoustic, with a slow and laid-back groove ; Then comes a melancholic and tender verse. Energy is low and holds steady. It is carried by breathy and softly sung female vocals, set over piano and acoustic guitar. The sound is warm, intimate, and acoustic, with a slow, laid-back, and backbeat groove ; Next is a hopeful and gentle pre-chorus. Energy is medium and builds throughout. It is carried by breathy and softly sung female vocals, set over piano, strings, and acoustic guitar. The sound is warm, intimate, and acoustic, with a mid-tempo, laid-back, and backbeat groove ; After that comes an uplifting and warm chorus. Energy is high and holds steady. It is carried by powerful and belted female vocals, set over piano, strings, electric guitar, and drum kit. The sound is lush, polished, and hybrid, with a mid-tempo, driving, and backbeat groove ; This leads into a calm and hopeful instrumental section. Energy is medium and builds throughout. It is instrumental, with no lead vocal, set over piano, strings, and acoustic guitar. The sound is warm, intimate, and acoustic, with a mid-tempo and laid-back groove ; Following that is a melancholic and tender verse. Energy is low and holds steady. It is carried by breathy and softly sung female vocals, set over piano and acoustic guitar. The sound is warm, intimate, and acoustic, with a slow, laid-back, and backbeat groove ; Then a hopeful and gentle pre-chorus. Energy is medium and builds throughout. It is carried by breathy and softly sung female vocals, set over piano, strings, and acoustic guitar. The sound is warm, intimate, and acoustic, with a mid-tempo, laid-back, and backbeat groove ; Then comes an uplifting and warm chorus. Energy is high and holds steady. It is carried by powerful and belted female vocals, set over piano, strings, electric guitar, and drum kit. The sound is lush, polished, and hybrid, with a mid-tempo, driving, and backbeat groove ; The song closes with a serene and hopeful outro. Energy is low and fades out. It is instrumental, with no lead vocal, set over piano and strings. The sound is warm, intimate, and acoustic, with a slow and laid-back groove.",
    lyric: "[intro] ; [verse] 今夜雨下得很大. 像天空在替我哭泣. 我抱着膝盖坐在窗前. 数着玻璃上的水滴. 一滴两滴三滴. 都是说不出的委屈 ; [pre-chorus] 可是雨总会停的啊. 乌云总会散去的. 你看天边那一点亮光. 是太阳在等你 ; [chorus] 擦干眼泪抬起头. 彩虹就在风雨后. 生活虽然有点苦. 但你一定要记得微笑. 擦干眼泪向前走. 阳光会照进窗口. 这世界爱你的人. 比你想象的还要多 ; [inst] ; [verse] 今夜风刮得很急. 像命运在考验着我. 我裹紧了单薄的外套. 数着路灯的数量. 一盏两盏三盏. 照亮前行的方向 ; [pre-chorus] 可是风总会停的啊. 黑夜总会过去的. 你看天边那一片鱼肚白. 是黎明在等你 ; [chorus] 擦干眼泪抬起头. 彩虹就在风雨后. 生活虽然有点苦. 但你一定要记得微笑. 擦干眼泪向前走. 阳光会照进窗口. 这世界爱你的人. 比你想象的还要多 ; [outro]",
  },
  {
    id: "IN_106",
    audio_idx: 5,
    test_target: {
      dimension: "instrumentation",
      progression: "synth pad, drum machine → synth pad, drum machine, synth bass → acoustic guitar, upright piano, brushed drums, upright bass → synth pad, drum machine, synth bass → acoustic guitar, upright piano, brushed drums, upright bass → upright piano, cello → acoustic guitar, upright piano, brushed drums, upright bass → acoustic guitar",
    },
    caption: "An eight-section electronic song with elements of acoustic pop ; It opens with a dreamy and suspended intro. Energy is low and builds throughout. It is instrumental, with no lead vocal, set over synth pad and drum machine. The sound is cold, polished, and electronic, with a slow and sparse pulse groove ; Then comes a dreamy and introspective verse. Energy is medium and holds steady. It is carried by breathy and softly sung female vocals, set over synth pad, drum machine, and synth bass. The sound is clean, polished, and electronic, with a mid-tempo, laid-back, and backbeat groove ; Next is an euphoric and uplifting chorus. Energy is high and holds steady. It is carried by bright and sung female vocals, set over acoustic guitar, upright piano, brushed drums, and upright bass. The sound is bright, polished, and organic, with a uptempo, driving, and four-on-the-floor groove ; After that comes a dreamy and introspective verse. Energy is medium and holds steady. It is carried by breathy and softly sung female vocals, set over synth pad, drum machine, and synth bass. The sound is clean, polished, and electronic, with a mid-tempo, laid-back, and backbeat groove ; This leads into an euphoric and uplifting chorus. Energy is high and holds steady. It is carried by bright and sung female vocals, set over acoustic guitar, upright piano, brushed drums, and upright bass. The sound is bright, polished, and organic, with a uptempo, driving, and four-on-the-floor groove ; Following that is a suspended and dreamy bridge. Energy is medium and builds throughout. It is carried by bright and sung female vocals, set over upright piano and cello. The sound is warm, intimate, and acoustic, with a mid-tempo and halftime groove ; Then an euphoric and uplifting chorus. Energy is high and holds steady. It is carried by bright and sung female vocals, set over acoustic guitar, upright piano, brushed drums, and upright bass. The sound is bright, polished, and organic, with a uptempo, driving, and four-on-the-floor groove ; It ends with a dreamy and serene outro. Energy is low and fades out. It is instrumental, with no lead vocal, set over acoustic guitar. The sound is warm, intimate, and acoustic, with a slow and sparse pulse groove.",
    lyric: "[intro] ; [verse] 屏幕亮了一整夜. 代码写了上千行. 咖啡杯空了又满. 窗外天光微微亮. 我在这数字的森林里. 寻找一颗真实的心脏 ; [chorus] 脱下所有的盔甲. 卸下所有的伪装. 我只想简简单单地. 坐在阳光下弹着吉他唱. 没有滤镜没有特效. 只有风穿过指缝的清凉. 这才是我最真的模样 ; [verse] 朋友圈里的完美人生. 滤镜下的精致脸庞. 点赞数涨了又涨. 心里却空了一块地方. 我在这虚拟的花园里. 怀念泥土的芬芳 ; [chorus] 脱下所有的盔甲. 卸下所有的伪装. 我只想简简单单地. 坐在阳光下弹着吉他唱. 没有滤镜没有特效. 只有风穿过指缝的清凉. 这才是我最真的模样 ; [bridge] 真实一点. 简单一点. 慢一点. 再慢一点 ; [chorus] 脱下所有的盔甲. 卸下所有的伪装. 我只想简简单单地. 坐在阳光下弹着吉他唱. 没有滤镜没有特效. 只有风穿过指缝的清凉. 这才是我最真的模样 ; [outro]",
  },
];

// ========== 结果上传配置 ==========
// 桶已设为公有读写, 前端使用原生 fetch PUT 匿名直传, 无需任何密钥
window.COS_UPLOAD = {
  Bucket: "yutangfeng-1459725450",
  Region: "ap-guangzhou",
  Prefix: "eval_data_ICLR_submissions/",
};

// 匿名标签（会按每个评测者独立随机映射到 MODELS）
window.ANON_LABELS = ["A", "B", "C", "D", "E", "F"];
