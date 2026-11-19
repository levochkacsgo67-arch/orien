# Данные Яндекс Метрики для личной панели: посетители, просмотры, источники, устройства, цели. Уходят в панель по ключу.
import json, os, sys, urllib.parse, urllib.request

COUNTER = "114110564"
MT = os.environ["METRIKA_TOKEN"]
GOALS = [("Переход в мессенджер", "680362933"), ("Клик по номеру телефона", "681070202"), ("Отправка формы (авто)", "682070607"), ("Заявка отправлена (lead_submit)", "684459308")]


def metrika(params):
    q = urllib.parse.urlencode({"ids": COUNTER, "accuracy": "full", "lang": "ru", **params})
    rq = urllib.request.Request("https://api-metrika.yandex.net/stat/v1/data?" + q, headers={"Authorization": "OAuth " + MT})
    with urllib.request.urlopen(rq, timeout=40) as r:
        return json.loads(r.read().decode())


M = "ym:s:visits,ym:s:users,ym:s:pageviews,ym:s:bounceRate,ym:s:avgVisitDurationSeconds"


def totals(d1, d2):
    t = metrika({"metrics": M, "date1": d1, "date2": d2})["totals"]
    return {"visits": t[0], "users": t[1], "views": t[2], "bounce": t[3], "dur": t[4]}


def top(dim, metric, n=6, date1="29daysAgo"):
    d = metrika({"dimensions": dim, "metrics": metric, "date1": date1, "date2": "today", "sort": "-" + metric, "limit": n})
    return [{"n": (row["dimensions"][0].get("name") or "не определено"), "v": row["metrics"][0]} for row in d["data"] if row["metrics"][0]]


out, fails = {}, []


def part(name, fn):
    try:
        out[name] = fn()
    except Exception as e:
        fails.append(f"{name}: {str(e)[:80]}")


part("totals", lambda: {"today": totals("today", "today"), "yesterday": totals("yesterday", "yesterday"), "week": totals("6daysAgo", "today"),
                        "prevWeek": totals("13daysAgo", "7daysAgo"), "month": totals("29daysAgo", "today")})


def daily():
    d = metrika({"dimensions": "ym:s:date", "metrics": "ym:s:visits,ym:s:users,ym:s:pageviews", "date1": "29daysAgo", "date2": "today", "sort": "ym:s:date", "limit": 40})
    return [{"d": r["dimensions"][0]["name"], "visits": r["metrics"][0], "users": r["metrics"][1], "views": r["metrics"][2]} for r in d["data"]]


part("daily", daily)
part("sources", lambda: top("ym:s:lastTrafficSource", "ym:s:visits"))
part("devices", lambda: top("ym:s:deviceCategory", "ym:s:visits", 4))
part("pages", lambda: top("ym:pv:URLPath", "ym:pv:pageviews", 8))
part("cities", lambda: top("ym:s:regionCity", "ym:s:visits"))


def goals():
    d = metrika({"metrics": ",".join(f"ym:s:goal{g}reaches" for _, g in GOALS), "date1": "29daysAgo", "date2": "today"})["totals"]
    return [{"n": GOALS[i][0], "v": d[i]} for i in range(len(GOALS))]


part("goals", goals)
if not out.get("totals"):
    sys.exit("Метрика не ответила: " + "; ".join(fails))
if os.environ.get("DRY"):
    print(json.dumps(out, ensure_ascii=False)[:1500], fails)
    sys.exit(0)
url, key = os.environ["PANEL_URL"], os.environ["PANEL_INGEST_KEY"]
rq = urllib.request.Request(url + "/api/ingest", data=json.dumps({"kind": "stats", "data": out}).encode(), method="POST",
                            headers={"Content-Type": "application/json", "X-Ingest-Key": key, "User-Agent": "ORIEN-panel-sync"})
print(urllib.request.urlopen(rq, timeout=30).read().decode(), "частей с ошибкой:", len(fails), fails)
