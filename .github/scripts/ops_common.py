import base64, gzip, json, os, time, urllib.parse, urllib.request

TG = os.environ["TG_TOKEN"]
CHAT = os.environ["TG_CHAT"]


def send(text):
    body = urllib.parse.urlencode({"chat_id": CHAT, "text": text[:4000], "disable_web_page_preview": "true"}).encode()
    with urllib.request.urlopen(f"https://api.telegram.org/bot{TG}/sendMessage", body, timeout=30) as r:
        if not json.loads(r.read().decode()).get("ok"):
            raise SystemExit("Telegram не принял сообщение")
    time.sleep(1)


def data():
    return json.loads(gzip.decompress(base64.b64decode(os.environ["OPS_DATA"])).decode())
