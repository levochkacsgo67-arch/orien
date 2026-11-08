# Каждое утро: кому написать сегодня и кому напомнить. Отправляет только Льву, в журнал контакты не выводит.
import datetime as dt, os
from ops_common import data, send

NEW, FOLLOW = 5, 2
test = os.environ.get("TEST") == "true"
if not os.environ.get("OPS_DATA"):
    print("нет данных, пропускаю"); raise SystemExit
d = data()
today = (dt.datetime.utcnow() + dt.timedelta(hours=11)).date()
day = max(0, (today - dt.date.fromisoformat(d["synced"])).days)
if today.weekday() == 6 and not test:
    print("ok выходной"); raise SystemExit
new = d["new"][day * NEW:(day + 1) * NEW]
follow = d["follow"][day * FOLLOW % max(1, len(d["follow"])):][:FOLLOW]
if test:
    new, follow = new[:1], follow[:1]
if not new and not follow:
    send("Список «кому написать» закончился. Напиши мне: «обнови список кому написать» или «новая партия».")
    print("ok empty"); raise SystemExit
send(("Проверка автоматизации, пример одного контакта.\n" if test else "") + f"Сегодня написать: {len(new)}, напомнить: {len(follow)}. Отправляешь сам. После этого поставь статус в таблице.")
for c in new:
    send(f"{c['name']}\n{c['tg']}\n\n{c['text']}")
for c in follow:
    send(f"Напомнить: {c['name']}\n{c['tg']}\n\nЗдравствуйте! Писал вам про черновик сайта: {c['site']}\nУспели посмотреть? Если неинтересно, так и напишите, больше не побеспокою.")
print("ok", len(new), len(follow))
