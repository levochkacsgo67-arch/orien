import base64, gzip, json, os, time, urllib.parse, urllib.request

PANEL = os.environ.get("PANEL_URL", "")
KEY = os.environ.get("PANEL_INGEST_KEY", "")


def send(text):
    """Уведомление приходит в личную панель (приложение на экране «Домой»), а не в Telegram."""
    title, _, rest = text.partition("\n")
    body = json.dumps({"title": title[:80], "body": (rest.strip() or title)[:160]}).encode()
    rq = urllib.request.Request(PANEL + "/api/notify", data=body, method="POST",
                                headers={"Content-Type": "application/json", "X-Ingest-Key": KEY, "User-Agent": "ORIEN-ops"})
    with urllib.request.urlopen(rq, timeout=30) as r:
        if not json.loads(r.read().decode()).get("ok"):
            print("Панель не смогла показать уведомление (нет подписанных устройств?)")
    time.sleep(1)


def data():
    return json.loads(gzip.decompress(base64.b64decode(os.environ["OPS_DATA"])).decode())
