"""
连通性测试脚本：验证前端"评分结果上传"这条链路是否通畅。

模拟前端 app.js 里 finishEvaluation() 的行为：
  - 匿名 PUT 一份 JSON 到  https://<Bucket>.cos.<Region>.myqcloud.com/<Prefix><file>.json
  - Content-Type: application/json; charset=utf-8
  - 不携带任何签名/密钥（桶必须已配置为公有读写）

配置严格来自 data.js 的 COS_UPLOAD:
  Bucket : yutangfeng-1459725450
  Region : ap-guangzhou
  Prefix : eval_data_ICLR_submissions/

用法:
    python3 scripts/test_submit_connectivity.py

    可选参数:
        --keep       上传成功后不清理，方便你去 COS 控制台肉眼查看
        --verbose    打印完整 payload 和响应头

无需第三方库、无需密钥；如果失败会明确打印是"网络问题 / 权限问题 / CORS 问题"哪一类。
"""

import argparse
import json
import ssl
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone


# ==================== 与 data.js 中 COS_UPLOAD 保持完全一致 ====================
COS_BUCKET = "yutangfeng-1459725450"
COS_REGION = "ap-guangzhou"
COS_PREFIX = "eval_data_ICLR_submissions/"


def build_url(key: str) -> str:
    """与 app.js 里的 URL 拼接方式完全一致。"""
    from urllib.parse import quote
    # app.js 里用的是 encodeURI(key), Python 侧最接近的等价是 quote(key, safe="/-_.~")
    return f"https://{COS_BUCKET}.cos.{COS_REGION}.myqcloud.com/{quote(key, safe='/-_.~')}"


def fake_payload() -> dict:
    """构造一份与真实提交结构完全一致的假 payload（供连通性测试用）。"""
    submit_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    models = ["Heartmula", "Minimax3", "MusicSTAR", "acestep1.5", "levo2", "muse"]
    songs = ["IN_208", "VL_208", "VE_201", "MD_101", "IN_106"]
    labels = ["A", "B", "C", "D", "E", "F"]

    # 单盲映射：每首歌都独立打乱一次
    import random
    mappings = {}
    for sid in songs:
        shuffled = models[:]
        random.shuffle(shuffled)
        mappings[sid] = {lbl: shuffled[i] for i, lbl in enumerate(labels)}

    # 5 首 × 6 系统 = 30 行分数（都填 3, 只是走通链路）
    rows = []
    for sid in songs:
        for lbl in labels:
            rows.append({
                "rater":        "__connectivity_test__",
                "background":   "none",
                "started_at":   submit_time,
                "submitted_at": submit_time,
                "song_id":      sid,
                "anon_label":   lbl,
                "model":        mappings[sid][lbl],
                "overall":      3,
                "vocal_acc":    3,
                "harmony":      3,
                "structure":    3,
                "lyric":        3,
                "faithfulness": 3,
            })

    return {
        "rater":        "__connectivity_test__",
        "background":   "none",
        "started_at":   submit_time,
        "submitted_at": submit_time,
        "note":         "This is a connectivity test payload, please ignore.",
        "mappings":     mappings,
        "rows":         rows,
    }


def http_request(url: str, method: str, body: bytes = None, headers: dict = None, timeout: int = 30):
    """裸 urllib 发起 HTTP 请求，返回 (status, resp_headers_dict, body_bytes)。"""
    req = urllib.request.Request(url=url, method=method, data=body, headers=headers or {})
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.status, dict(resp.headers), resp.read()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers or {}), (e.read() or b"")
    except urllib.error.URLError as e:
        raise RuntimeError(f"URLError: {e.reason}") from e


def diagnose(status: int, body: bytes) -> str:
    """把常见的 COS 错误码翻译成人话。"""
    text = body.decode("utf-8", errors="replace")[:500]
    if status == 200:
        return "✓ OK"
    if status == 403:
        return ("✗ 403 Forbidden —— 桶未开启【匿名写】权限。\n"
                "  请到 COS 控制台 → 桶设置 → 权限管理 → 存储桶访问权限，改为【公有读写】。\n"
                f"  服务端返回体：{text}")
    if status == 404:
        return ("✗ 404 NoSuchBucket —— 桶名或 Region 写错了。\n"
                f"  当前使用: Bucket={COS_BUCKET}, Region={COS_REGION}\n"
                f"  服务端返回体：{text}")
    if status in (301, 302, 307):
        return ("✗ 3xx 重定向 —— 大概率是 Region 不对。\n"
                f"  服务端返回体：{text}")
    return f"✗ HTTP {status}\n  服务端返回体：{text}"


def main():
    parser = argparse.ArgumentParser(description="COS 打标结果上传连通性测试")
    parser.add_argument("--keep", action="store_true",
                        help="测试完不清理上传的 JSON, 方便你去 COS 控制台肉眼查看")
    parser.add_argument("--verbose", action="store_true",
                        help="打印完整 payload 与响应头")
    args = parser.parse_args()

    print("=" * 70)
    print("COS 打标结果上传 · 连通性测试")
    print("=" * 70)
    print(f"Bucket : {COS_BUCKET}")
    print(f"Region : {COS_REGION}")
    print(f"Prefix : {COS_PREFIX}")
    print()

    # ---------- 1. 构造 payload & key ----------
    payload = fake_payload()
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%S-000Z")
    key = f"{COS_PREFIX}__connectivity_test__{ts}.json"
    url = build_url(key)
    body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")

    print(f"目标 URL : {url}")
    print(f"Payload 大小 : {len(body)} bytes ({len(payload['rows'])} rows)")
    if args.verbose:
        print("\n---- payload preview ----")
        print(json.dumps(payload, ensure_ascii=False, indent=2)[:1000])
        print("...(truncated)")
    print()

    # ---------- 2. 匿名 PUT ----------
    print("[1/3] 匿名 PUT 上传 …")
    t0 = time.time()
    try:
        status, headers, resp = http_request(
            url=url,
            method="PUT",
            body=body,
            headers={"Content-Type": "application/json; charset=utf-8"},
            timeout=30,
        )
    except RuntimeError as e:
        print(f"      ✗ 网络异常: {e}")
        print("      请检查本机是否能出网访问 *.myqcloud.com (可能是代理/防火墙问题)。")
        sys.exit(2)
    elapsed = time.time() - t0

    print(f"      HTTP {status}   耗时 {elapsed:.2f}s")
    if args.verbose:
        for k, v in headers.items():
            print(f"        {k}: {v}")
    print(f"      诊断: {diagnose(status, resp)}")
    if status != 200:
        sys.exit(3)

    # ---------- 3. 匿名 GET 回来验证 ----------
    print()
    print("[2/3] 匿名 GET 读回, 验证内容一致性 …")
    time.sleep(0.5)  # 稍等一下让 COS 索引 (通常立刻可读)
    try:
        status2, _, got = http_request(url=url, method="GET", timeout=30)
    except RuntimeError as e:
        print(f"      ✗ 网络异常: {e}")
        sys.exit(2)

    if status2 != 200:
        print(f"      ✗ HTTP {status2}  桶未开启【匿名读】—— 前端可读性可能没问题（因为不需要读），")
        print(f"        但你后续用 view_results.py 之类工具拉全量数据时会需要密钥签名。")
        print(f"      服务端返回体: {got.decode('utf-8', errors='replace')[:300]}")
    else:
        try:
            got_json = json.loads(got.decode("utf-8"))
            same = got_json == payload
            if same:
                print("      ✓ 读回内容与上传内容完全一致")
            else:
                print("      ⚠ 读回内容与上传内容不一致（COS 可能做了 transform, 极少见）")
                if args.verbose:
                    print(f"        got  keys: {sorted(got_json.keys())}")
                    print(f"        sent keys: {sorted(payload.keys())}")
        except json.JSONDecodeError:
            print(f"      ⚠ 读回的不是合法 JSON：{got[:200]}")

    # ---------- 4. 清理 ----------
    print()
    print("[3/3] 清理测试对象 …")
    if args.keep:
        print(f"      ⏭  --keep 指定, 保留对象供人工核查:")
        print(f"      {url}")
    else:
        try:
            status3, _, _ = http_request(url=url, method="DELETE", timeout=30)
            if status3 in (200, 204):
                print(f"      ✓ 已删除 (HTTP {status3})")
            elif status3 == 403:
                print(f"      ⚠ HTTP 403 - 桶未开启匿名 DELETE 权限（正常情况; 前端不需要该权限）")
                print(f"        请你去 COS 控制台手工删除该测试文件:")
                print(f"        {url}")
            else:
                print(f"      ⚠ HTTP {status3} - 删除失败, 请去 COS 控制台手动清理:")
                print(f"        {url}")
        except RuntimeError as e:
            print(f"      ⚠ DELETE 异常: {e}")

    print()
    print("=" * 70)
    print("✓ 连通性测试通过, 前端可以正常匿名上传评分结果。")
    print("=" * 70)


if __name__ == "__main__":
    main()
