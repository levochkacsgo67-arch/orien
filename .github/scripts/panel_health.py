# Проверка сайта как живой посетитель: страницы, ссылки, кнопки, окно заявки, формы. Результат уходит в личную панель.
# Формы отправляются с ловушкой "healthcheck": воркер отвечает «ок» и ничего не шлёт в Telegram.
import json, os, socket, ssl, sys, time, urllib.request, urllib.error, datetime as dt
from playwright.sync_api import sync_playwright

SITE = "https://orien-studio.ru"
LEADS = "https://orien-leads.brows-booking.workers.dev"
PAGES = [("Главная", "/"), ("Сайт", "/uslugi/sajt.html"), ("Приложение в Telegram", "/uslugi/prilozhenie-telegram.html"),
         ("Реклама", "/uslugi/reklama.html"), ("Логотип", "/uslugi/logotip.html")]
groups = {}
order = []


def add(g, n, ok, d=""):
    if g not in groups:
        groups[g] = []
        order.append(g)
    groups[g].append({"n": n, "ok": bool(ok), "d": d})


def check(g, n, fn):
    try:
        d = fn()
        add(g, n, True, d if isinstance(d, str) else "")
    except Exception as e:
        add(g, n, False, str(e).strip().split("\n")[0][:150])


def http(url, method="GET", headers=None):
    rq = urllib.request.Request(url, method=method, headers={"User-Agent": "ORIEN-panel-check", **(headers or {})})
    with urllib.request.urlopen(rq, timeout=25) as r:
        return r.status


# ---------- сервисы ----------
G = "Сервисы"
for name, path in PAGES:
    def f(path=path):
        s = http(SITE + path)
        assert s == 200, f"код {s}"
    check(G, f"Страница «{name}» открывается", f)


def cert():
    ctx = ssl.create_default_context()
    with socket.create_connection(("orien-studio.ru", 443), timeout=20) as s, ctx.wrap_socket(s, server_hostname="orien-studio.ru") as c:
        end = dt.datetime.strptime(c.getpeercert()["notAfter"], "%b %d %H:%M:%S %Y %Z")
    left = (end - dt.datetime.utcnow()).days
    assert left > 14, f"сертификат кончается через {left} дн."
    return f"сертификат действует ещё {left} дн."
check(G, "HTTPS (замочек)", cert)


def worker():
    s = http(LEADS, "OPTIONS", {"Origin": SITE, "Access-Control-Request-Method": "POST"})
    assert s in (200, 204), f"код {s}"
check(G, "Приём заявок отвечает", worker)


def bot():
    r = json.loads(urllib.request.urlopen(urllib.request.Request(LEADS + "/health", headers={"User-Agent": "ORIEN-panel-check"}), timeout=25).read())
    assert r.get("ok"), "бот Telegram не отвечает"
check(G, "Бот Telegram на связи (приходят коды входа)", bot)

# ---------- браузер ----------
INIT = "try{sessionStorage.setItem('orien-seen','1')}catch(e){}"


def run_page(browser, name, path):
    g = f"Страница «{name}»"
    ctx = browser.new_context(viewport={"width": 1280, "height": 800}, locale="ru-RU")
    ctx.add_init_script(INIT)
    page = ctx.new_page()
    errors, bad = [], []
    page.on("pageerror", lambda e: errors.append(str(e)[:100]))
    page.on("console", lambda m: errors.append(m.text[:100]) if m.type == "error" and "orien-studio" not in m.text and "Failed to load resource" not in m.text else None)
    page.on("response", lambda r: bad.append(f"{r.status} {r.url.replace(SITE, '')[:60]}") if r.status >= 400 and r.url.startswith(SITE) else None)
    page.goto(SITE + path, wait_until="load", timeout=45000)
    page.wait_for_timeout(1200)
    check(g, "Открывается без ошибок", lambda: (_ for _ in ()).throw(AssertionError("; ".join((errors + bad)[:2]))) if (errors or bad) else "")
    # баннер cookie мешает кликам: отклоняем (Метрика при этом не грузится)
    try:
        page.get_by_role("button", name="Отклонить").click(timeout=2500)
    except Exception:
        pass
    # ссылки
    hrefs = page.eval_on_selector_all("a[href]", "els=>[...new Set(els.map(e=>e.href))]")
    internal = [h for h in hrefs if h.startswith(SITE) and "#" not in h.split(SITE)[-1][:1]]
    def links():
        badl = []
        for h in internal:
            u = h.split("#")[0]
            try:
                if http(u) != 200:
                    badl.append(u)
            except Exception:
                badl.append(u)
        assert not badl, "не открываются: " + ", ".join(x.replace(SITE, "") for x in badl[:3])
        return f"проверено ссылок: {len(set(h.split('#')[0] for h in internal))}"
    check(g, "Все ссылки внутри сайта открываются", links)
    check(g, "Остров с логотипом ведёт на главную", lambda: (page.locator(".notch a").first.get_attribute("href") or "").__contains__("index.html") or (_ for _ in ()).throw(AssertionError("нет ссылки")) if path != "/" else page.locator(".notch a").count() > 0 or (_ for _ in ()).throw(AssertionError("острова нет")))

    if path == "/":
        def cards():
            n = page.locator("#prows .sc").count()
            assert n == 4, f"карточек {n}, а должно быть 4"
            return "4 услуги с кнопкой «Подробнее»"
        check(g, "Прайс: четыре карточки", cards)
        def more():
            href = page.locator("#prows .sc a.pill").first.get_attribute("href")
            page.locator("#prows .sc a.pill").first.click()
            page.wait_for_url("**/uslugi/**", timeout=9000)
            ok = "uslugi" in page.url
            page.go_back(); page.wait_for_timeout(800)
            assert ok, "переход не произошёл"
            return "«Подробнее» ведёт на " + href
        check(g, "Кнопка «Подробнее» открывает страницу (со звездой)", more)
        check(g, "Блок «Примеры работ»: три кадра", lambda: page.locator(".wks .wk").count() == 3 or (_ for _ in ()).throw(AssertionError("кадров не три")))
        def form():
            f = page.locator("#lead")
            f.scroll_into_view_if_needed()
            f.locator("#svc .selb").click(); f.locator("#svc .selm button[data-v='Сайт']").click()
            f.locator("#way button[data-w='WhatsApp']").click()
            f.locator("input[name=pm]").fill("9990000000"); f.locator("input[name=nm]").fill("Проверка")
            f.locator("input[name=ok]").check(force=True)
            f.evaluate("el=>{el.site.value='healthcheck'}")
            f.locator("button[type=submit]").click()
            page.wait_for_selector("#lead.sent", timeout=9000)
            return "показывает «Спасибо за заявку»"
        check(g, "Форма заявки отправляется", form)
    else:
        def hero():
            page.locator(".hbtn a").first.click()
            page.wait_for_selector(".mo.on", timeout=5000)
            page.locator(".mo .mx").click()
            page.wait_for_function("!document.querySelector('.mo.on')", timeout=5000)
            return "окно открывается и закрывается"
        check(g, "Кнопка на первом экране открывает окно заявки", hero)
        def modal():
            page.locator(".hbtn a").first.click()
            page.wait_for_selector(".mo.on", timeout=5000)
            m = page.locator(".mo")
            if m.locator(".ms").count():
                m.locator(".msb").click(); m.locator(".msm button").first.click()
            m.locator("button[data-w='MAX']").click()
            m.locator("input[name=pm]").fill("9990000000"); m.locator("input[name=nm]").fill("Проверка")
            m.locator("input[name=ok]").check(force=True)
            m.locator("form").evaluate("el=>{el.site.value='healthcheck'}")
            m.locator("button[type=submit]").click()
            page.wait_for_selector(".mo .md.sent", timeout=9000)
            page.locator(".mo .mx").click(); page.wait_for_timeout(1000)
            return "окно отправляет и показывает «Спасибо»"
        check(g, "Форма в окне отправляется", modal)
        def inline():
            box = page.locator("#ctf")
            box.scroll_into_view_if_needed()
            if box.locator(".ms").count():
                box.locator(".msb").click(); box.locator(".msm button").first.click()
            box.locator("button[data-w='Telegram']").click()
            box.locator("input[name=u]").fill("@healthcheck_user"); box.locator("input[name=pt]").fill("9990000000")
            box.locator("input[name=ok]").check(force=True)
            box.locator("form").evaluate("el=>{el.site.value='healthcheck'}")
            box.locator("button[type=submit]").click()
            page.wait_for_selector("#ctf .md.sent", timeout=9000)
            return "форма внизу отправляет и показывает «Спасибо»"
        check(g, "Форма внизу страницы отправляется", inline)
        if page.locator(".tbtn a").count():
            def tb():
                page.locator(".tbtn a").first.click()
                page.wait_for_selector(".mo.on", timeout=5000)
                page.locator(".mo .mx").click(); page.wait_for_timeout(700)
            check(g, "Кнопка под пакетами открывает окно", tb)
    ctx.close()


with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome" if os.environ.get("PW_CHROME") else None, headless=True)
    for name, path in PAGES:
        try:
            run_page(browser, name, path)
        except Exception as e:
            add(f"Страница «{name}»", "Проверка страницы", False, str(e).strip().split("\n")[0][:150])
    browser.close()

res = {"groups": [{"name": g, "checks": groups[g]} for g in order]}
total = sum(len(x["checks"]) for x in res["groups"])
ok = sum(1 for x in res["groups"] for c in x["checks"] if c["ok"])
res["summary"] = {"ok": ok, "total": total}
if os.environ.get("DRY"):
    print(json.dumps(res, ensure_ascii=False, indent=1))
    sys.exit(0)
url, key = os.environ["PANEL_URL"], os.environ["PANEL_INGEST_KEY"]
rq = urllib.request.Request(url + "/api/ingest", data=json.dumps({"kind": "health", "data": res}).encode(), method="POST",
                            headers={"Content-Type": "application/json", "X-Ingest-Key": key, "User-Agent": "ORIEN-panel-check"})
print(urllib.request.urlopen(rq, timeout=30).read().decode(), f"{ok}/{total}")
