#!/usr/bin/env python3
"""Bina alerts.json daripada Google Sheet dashboard SKIPPF (tab cache)."""
import json, urllib.request, datetime, pathlib

SHEET_ID = "1AdB2xXm6c2MaamHYvLzNtv_sWy4zo1wFn1-slfLNQPo"
DATA_GID = "1394180751"
THRESHOLD = 58
OUT = pathlib.Path(__file__).resolve().parents[1] / "alerts.json"

def rows():
    url = (
        f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq"
        f"?tqx=out:json&headers=1&gid={DATA_GID}"
    )
    raw = urllib.request.urlopen(url, timeout=30).read().decode("utf-8", "replace")
    data = json.loads(raw[raw.find("{") : raw.rfind("}") + 1])
    cols = [c.get("label") or c.get("id") for c in data["table"]["cols"]]
    out = []
    for r in data["table"].get("rows") or []:
        vals = []
        for c in r.get("c") or []:
            vals.append(None if c is None else c.get("v"))
        while len(vals) < len(cols):
            vals.append(None)
        out.append(dict(zip(cols, vals)))
    return out

def pct_of(r):
    sasaran, pencapaian, num, den, jumlah = (
        r.get("sasaran"), r.get("pencapaian"), r.get("num"), r.get("den"), r.get("jumlah")
    )
    if num is not None and den not in (None, 0):
        return 100.0 * float(num) / float(den)
    if sasaran not in (None, 0) and jumlah is not None:
        return 100.0 * float(jumlah) / float(sasaran)
    if pencapaian is not None and float(pencapaian) > 5:
        return float(pencapaian)
    return None

def main():
    items = []
    for r in rows():
        pct = pct_of(r)
        if pct is None or pct >= THRESHOLD:
            continue
        items.append({
            "id": str(r.get("id") or ""),
            "nama": str(r.get("nama") or ""),
            "pic": str(r.get("pic") or ""),
            "pct": round(pct, 1),
            "bahagian": str(r.get("bahagian") or ""),
        })
    fp = "|".join(f"{i['id']}:{i['pct']}" for i in items)
    payload = {
        "updated": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "threshold": THRESHOLD,
        "count": len(items),
        "fingerprint": fp,
        "title": "SKIPPF" if not items else f"SKIPPF: {len(items)} indikator PERHATIAN",
        "body": "Tiada indikator PERHATIAN." if not items else " · ".join(
            f"{i['id']} {i['pct']:.0f}%" for i in items[:6]
        ),
        "url": "https://cpfpahang.github.io/skippf/dashboard/",
        "items": items,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("wrote", OUT, "count=", payload["count"])

if __name__ == "__main__":
    main()
