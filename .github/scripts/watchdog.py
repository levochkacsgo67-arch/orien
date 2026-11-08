# Раз в день: открываются ли сайты, не кончается ли HTTPS, нет ли близких сроков.
# Пишет только при проблеме и по понедельникам коротко, что всё в порядке. В журнал ничего личного не выводит.
import datetime as dt, os, socket, ssl, subprocess, time, urllib.request
from ops_common import send

DEADLINES = [
    ("2026-11-11", "Проверь Beget: когда панель восстановится, включи защиту входа. Напиши мне «проверь Beget»."),
    ("2026-11-24", "Заканчивается пробный тариф Beget. Хостинг там не используется, но проверь, что адреса сайтов открываются."),
    ("2027-09-02", "Продление orien-studio.ru: на балансе Beget должно быть 420 ₽."),
    ("2027-10-25", "Продление kuzovnoy25.ru (дата примерная): проверь в Beget."),
    ("2027-11-01", "Токен Метрики скоро истечёт (около года). Напиши мне, обновим."),
]

SITES = [("https://orien-studio.ru/", "orien"), ("https://orien-studio.ru/legal/privacy.html", "Политика"), ("https://kuzovnoy25.ru/", "Кузовн")]
DAYS = {30, 14, 7, 3, 1, 0}
today = (dt.datetime.utcnow() + dt.timedelta(hours=11)).date()
problems, soon = [], []


def check(url, marker):
    last = ""
    for _ in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "ORIEN-watchdog"})
            with urllib.request.urlopen(req, timeout=25) as r:
                body = r.read().decode("utf-8", "ignore")
                if r.status == 200 and marker.lower() in body.lower():
                    return None
                last = f"код {r.status}, нет ожидаемого текста"
        except Exception as e:
            last = str(e)[:120]
        time.sleep(20)
    return last


def cert_days(host):
    ctx = ssl.create_default_context()
    with socket.create_connection((host, 443), timeout=20) as s, ctx.wrap_socket(s, server_hostname=host) as c:
        end = dt.datetime.strptime(c.getpeercert()["notAfter"], "%b %d %H:%M:%S %Y %Z")
    return (end - dt.datetime.utcnow()).days


for url, marker in SITES:
    err = check(url, marker)
    if err:
        problems.append(f"Не открывается {url}: {err}")
for host in ("orien-studio.ru", "kuzovnoy25.ru"):
    try:
        left = cert_days(host)
        if left < 15:
            problems.append(f"HTTPS у {host} кончается через {left} дн.")
    except Exception as e:
        problems.append(f"Не удалось проверить HTTPS у {host}: {str(e)[:100]}")
for day, text in DEADLINES:
    left = (dt.date.fromisoformat(day) - today).days
    if left in DAYS:
        soon.append(f"{'Сегодня' if left == 0 else 'Через ' + str(left) + ' дн.'}: {text}")
idle = (time.time() - int(subprocess.check_output(["git", "log", "-1", "--format=%ct"]).decode())) / 86400
if idle >= 50:
    soon.append("На GitHub давно не было изменений, скоро расписание отчётов выключится. Напиши мне, обновлю.")

report = os.environ.get("REPORT") == "true"
if problems or soon:
    send("\n\n".join((["Проблема с сайтами"] + problems if problems else []) + (["Сроки"] + soon if soon else [])))
elif report or today.weekday() == 0:
    send("Сторож: сайты открываются, HTTPS в порядке, близких сроков нет.")
print("ok", len(problems), len(soon))
