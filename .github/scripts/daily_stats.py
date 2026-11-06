# Ежедневная сводка посещений orien-studio.ru из Яндекс Метрики в Telegram.
# Секреты репозитория: METRIKA_TOKEN, TG_TOKEN. Переменная: TG_CHAT (id чата Льва).
import json, os, sys, urllib.parse, urllib.request

COUNTER = "114110564"
MT = os.environ.get("METRIKA_TOKEN", "")
TG = os.environ.get("TG_TOKEN", "")
CHAT = os.environ.get("TG_CHAT", "")

def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())

def metrika(params):
    q = urllib.parse.urlencode({"ids": COUNTER, "accuracy": "full", **params})
    return get("https://api-metrika.yandex.net/stat/v1/data?" + q, {"Authorization": "OAuth " + MT})

def tg(method, data):
    body = urllib.parse.urlencode(data).encode()
    with urllib.request.urlopen(f"https://api.telegram.org/bot{TG}/{method}", body, timeout=30) as r:
        return json.loads(r.read().decode())

if not TG:
    sys.exit("Нет TG_TOKEN")

if not CHAT:
    # первый запуск: показать id чатов, которые писали боту
    ups = get(f"https://api.telegram.org/bot{TG}/getUpdates").get("result", [])
    ids = {(u.get("message") or {}).get("chat", {}).get("id") for u in ups} - {None}
    print("CHAT_IDS:", ", ".join(map(str, ids)) or "нет - напишите боту /start")
    sys.exit(0)

M = "ym:s:visits,ym:s:users,ym:s:pageviews,ym:s:bounceRate,ym:s:avgVisitDurationSeconds"

def totals(d1, d2):
    t = metrika({"metrics": M, "date1": d1, "date2": d2})["totals"]
    return [round(x) for x in t]

def fmt_dur(s):
    return f"{s // 60} мин {s % 60} с" if s >= 60 else f"{s} с"

try:
    v, u, pv, br, dur = totals("yesterday", "yesterday")
    wv, wu, *_ = totals("7daysAgo", "yesterday")
    src = metrika({"metrics": "ym:s:visits", "dimensions": "ym:s:lastTrafficSource",
                   "date1": "yesterday", "date2": "yesterday", "sort": "-ym:s:visits", "limit": 5})["data"]
    lines = [f"{r['dimensions'][0]['name']} - {round(r['metrics'][0])}" for r in src]
    text = (f"orien-studio.ru за вчера\n\n"
            f"Посетителей: {u}\nВизитов: {v}\nПросмотров страниц: {pv}\n"
            f"Время на сайте: {fmt_dur(dur)}\nОтказы: {br}%\n")
    if lines:
        text += "\nОткуда пришли:\n" + "\n".join(lines) + "\n"
    text += f"\nЗа 7 дней: {wu} посетителей, {wv} визитов"
except Exception as e:
    text = f"Не получилось взять статистику из Метрики: {e}"

tg("sendMessage", {"chat_id": CHAT, "text": text, "disable_web_page_preview": "true"})
print("sent:", text.splitlines()[0], "|", text.splitlines()[2] if len(text.splitlines())>2 else "")
