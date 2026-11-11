const TG = "https://t.me/ceoorien";
document.querySelectorAll(".tg").forEach(a => { a.href = TG; a.target = "_blank"; a.rel = "noopener"; });

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// загрузочный экран «Капля»: ждёт фото первого экрана (не дольше 4,5 с)
const afterLoad = new Promise(async done => {
  const L = document.getElementById("loader");
  if (!L) return done();
  if (document.documentElement.classList.contains("seen")) { L.remove(); return done(); }
  try { localStorage.setItem("orien-intro", "1"); } catch (e) {}
  const $ = id => document.getElementById(id);
  const drop = $("ldDrop"), logo = $("ldLogo"), num = $("ldN"), rings = [...L.querySelectorAll(".ld-ring")], img = document.querySelector(".hero .photo");
  const disp = document.querySelector("#ldLiquid feDisplacementMap");
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const anim = (dur, fn, ease = t => 1 - Math.pow(1 - t, 3)) => new Promise(res => {
    const t0 = performance.now();
    const st = t => { const k = Math.min(1, (t - t0) / dur); fn(ease(k), k); k < 1 ? requestAnimationFrame(st) : res(); };
    requestAnimationFrame(st);
  });
  let ready = !img || img.complete;
  const ok = () => ready = true;
  if (!ready) { img.addEventListener("load", ok); img.addEventListener("error", ok); }
  setTimeout(ok, 4500);
  const finish = () => { document.documentElement.classList.remove("ld"); done(); setTimeout(() => L.remove(), 1300); };
  if (reduce) { await wait(300); L.style.transition = "opacity .4s"; L.style.opacity = 0; return finish(); }
  // счётчик: 2,6 с, но 100 - только когда фото готово
  const count = new Promise(res => {
    const t0 = performance.now();
    const st = t => { const k = Math.min(1, (t - t0) / 2600), p = ready ? k : Math.min(k, .96);
      num.textContent = String(Math.round(p * 100)).padStart(3, "0"); p < 1 ? requestAnimationFrame(st) : res(); };
    requestAnimationFrame(st);
  });
  await wait(250);
  const H = innerHeight;
  await anim(650, e => { drop.style.transform = `translateY(${-40 + e * (H / 2 + 32)}px) scale(${1 - e * .25},${1 + e * .6})`; }, t => t * t);
  drop.style.opacity = 0;
  rings[0].animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(16)", opacity: 0 }], { duration: 900, easing: "cubic-bezier(.22,.8,.2,1)", fill: "forwards" });
  rings[1].animate([{ transform: "scale(1)", opacity: .6 }, { transform: "scale(28)", opacity: 0 }], { duration: 1300, delay: 120, easing: "cubic-bezier(.22,.8,.2,1)", fill: "forwards" });
  logo.style.opacity = 1;
  await anim(1500, e => { disp && disp.setAttribute("scale", (160 * (1 - e)).toFixed(1)); logo.style.transform = `translate(-50%,-50%) scale(${.6 + .4 * e})`; });
  logo.style.filter = "none";
  await count; await wait(300);
  logo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: "forwards" });
  num.style.opacity = 0; L.querySelector(".ld-cap").style.opacity = 0;
  done(); document.documentElement.classList.remove("ld");
  const R = Math.hypot(innerWidth, innerHeight);
  await anim(1100, e => L.style.setProperty("--r", (e * R / 2 + 1) + "px"), t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  L.remove();
});

// слова «Подхода» загораются при прокрутке; «лишнее» - красным
const words = [];
document.querySelectorAll("[data-words]").forEach(p => {
  p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="wd${/лишнее/.test(w) ? " red" : ""}">${w}</span>`).join(" ");
  words.push(...p.querySelectorAll(".wd"));
});

// плавная прокрутка
let lenis = null;
if (window.Lenis && !reduce) {
  lenis = new Lenis({ duration: 1.25, easing: t => 1 - Math.pow(1 - t, 4) });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const id = a.getAttribute("href"); if (id.length < 2 || id[0] !== "#") return;
    e.preventDefault(); lenis.scrollTo(id === "#top" ? 0 : id, { offset: 0 });
    const t = document.querySelector(id); if (t) { if (!t.hasAttribute("tabindex")) t.tabIndex = -1; t.focus({ preventScroll: true }); }
  }));
}

// появление блоков
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in"); io.unobserve(e.target);
}), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
document.querySelectorAll(".rv").forEach(el => {
  const sib = [...el.parentElement.children].filter(c => c.classList.contains("rv"));
  el.style.transitionDelay = (sib.indexOf(el) * 0.08) + "s";
  io.observe(el);
});

// переписка в блоке «Подход»: сообщения приходят по очереди
(() => {
  const chat = document.getElementById("chat"); if (!chat) return;
  const items = [...chat.querySelectorAll(".msg:not(.typing),.chat-day")], typing = chat.querySelector(".typing");
  if (reduce) { items.forEach(m => m.classList.add("show")); typing.remove(); return; }
  const run = () => {
    let t = 300;
    items.forEach(m => {
      const out = m.classList.contains("out");
      if (out) { setTimeout(() => { typing.style.top = (m.offsetTop + m.offsetHeight - typing.offsetHeight) + "px"; typing.classList.add("show"); }, t); t += 900; }
      setTimeout(() => { if (out) typing.classList.remove("show"); m.classList.add("show"); }, t);
      t += m.classList.contains("chat-day") ? 700 : 650;
    });
    setTimeout(() => typing.remove(), t);
  };
  const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { o.disconnect(); run(); } }, { threshold: 0.35 });
  o.observe(chat);
})();

// заголовок первого экрана выезжает после заставки
afterLoad.then(() => setTimeout(() => document.querySelector(".h-title").classList.add("in"), 250));

// первый экран: тонкие линии медленно текут за человеком
(() => {
  const cv = document.getElementById("heroFlow");
  const x = cv.getContext("2d"), hero = cv.parentElement;
  const cut = document.querySelector(".photo-cut");
  afterLoad.then(() => cut.decode()).then(() => setTimeout(() => cv.classList.add("on"), reduce ? 0 : 2300)).catch(() => {});
  let W = 0, H = 0, vis = true, raf = 0;
  const size = () => { const r = Math.min(devicePixelRatio || 1, 2); W = hero.clientWidth; H = hero.clientHeight; cv.width = W * r; cv.height = H * r; x.setTransform(r, 0, 0, r, 0, 0); };
  const draw = t => {
    x.clearRect(0, 0, W, H);
    const n = W < 900 ? 11 : 17, s = t / 1000;
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1), base = H * (.12 + k * .78);
      x.beginPath();
      for (let px = 0; px <= W + 12; px += 12) {
        const u = px / W, y = base + Math.sin(u * 5.2 + s * .22 + k * 2.4) * H * .05 + Math.sin(u * 11 - s * .16 + k * 5) * H * .016 * (1 + Math.sin(s * .12 + k * 6));
        px === 0 ? x.moveTo(px, y) : x.lineTo(px, y);
      }
      x.strokeStyle = `rgba(198,234,217,${(.16 + .2 * Math.sin(k * Math.PI)).toFixed(3)})`;
      x.lineWidth = 1; x.stroke();
    }
  };
  let lastT = 0;
  const loop = t => { if (t - lastT > 32) { lastT = t; draw(t); } raf = requestAnimationFrame(loop); };
  size(); addEventListener("resize", () => { size(); if (reduce) draw(4000); });
  if (reduce) return draw(4000);
  new IntersectionObserver(es => { vis = es[0].isIntersecting; cancelAnimationFrame(raf); if (vis) raf = requestAnimationFrame(loop); }).observe(hero);
})();

// «Что мы делаем»: заливается строка, ближайшая к середине экрана; на компьютере - и под курсором
const svc = [...document.querySelectorAll(".svc-row")], dNum = document.getElementById("dNum");
let sI = -1;
function svcSet(i) {
  if (i === sI) return; sI = i;
  svc.forEach((r, k) => r.classList.toggle("on", k === i));
  dNum.textContent = String(i + 1).padStart(2, "0");
}
function svcScroll(vh) {
  const box = svc[0].parentElement.getBoundingClientRect();
  if (box.bottom < 0 || box.top > vh) return;
  let best = 0, d = Infinity;
  svc.forEach((r, k) => { const b = r.getBoundingClientRect(), m = Math.abs(b.top + b.height / 2 - vh * 0.52); if (m < d) { d = m; best = k; } });
  svcSet(best);
}
svcSet(0);
if (matchMedia("(hover: hover)").matches) svc.forEach((r, i) => r.addEventListener("pointerenter", () => svcSet(i)));

// цены: переключатель услуг, панель меняется плавно
const PRICES = [
  { name: "Сайт", price: 6500, note: "Первая версия за 2 дня, до оплаты",
    inc: ["Работы, цены, отзывы, кнопки связи", "Удобно с телефона и компьютера", "Неделя правок бесплатно", "Свой адрес .ru на первый год, дальше 1 500 ₽ в год"] },
  { name: "Приложение", price: 12000, note: "Внутри Telegram, ничего не нужно скачивать",
    inc: ["Запись, заявки или каталог", "Клиенту ничего не нужно скачивать", "Уведомления о каждой заявке", "Кабинет со статистикой"] },
  { name: "Реклама", price: 7000, note: "ВКонтакте и Яндекс",
    inc: ["Картинки и тексты объявлений", "Настройка и запуск", "Отчёт: сколько стоила заявка", "Дальше ведение - 5 000 ₽ в месяц, бюджет на рекламу отдельно"] },
  { name: "Логотип", price: 10000, note: "Знак и название, три варианта на выбор",
    inc: ["Три разных идеи, из них доводим одну", "Файлы для сайта, печати и соцсетей", "Светлая и тёмная версии, аватарка", "Два круга правок бесплатно"] }
];
const seg = document.getElementById("seg"), pill = seg.querySelector(".pill"), ppA = document.getElementById("ppA"), ppB = document.getElementById("ppB");
const fmtR = n => n.toLocaleString("ru-RU").replace(/\u00a0|\u202f/g, " ");
PRICES.forEach((p, i) => { const b = document.createElement("button"); b.type = "button"; b.textContent = p.name; b.onclick = () => ppShow(i); seg.append(b); });
const segBtns = [...seg.querySelectorAll("button")];
let ppI = -1;
function ppPaint(i) {
  const p = PRICES[i];
  ppA.innerHTML = `<div class="pp-big"><small>от</small>${fmtR(p.price)}<span class="cur">₽</span></div><div class="pp-meta mono"><span class="muted">${p.note}</span></div>`;
  ppB.innerHTML = `<ul>${p.inc.map(x => `<li>${x}</li>`).join("")}</ul><a class="pp-btn" href="${TG}" target="_blank" rel="noopener">Обсудить: ${p.name.toLowerCase()} <span>→</span></a>`;
}
function ppPill() { const b = segBtns[ppI]; pill.style.width = b.offsetWidth + "px"; pill.style.transform = `translateX(${b.offsetLeft}px)`; }
async function ppShow(i) {
  if (i === ppI) return;
  const first = ppI < 0; ppI = i;
  segBtns.forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-pressed", k === i); });
  ppPill();
  if (first || reduce) return ppPaint(i);
  ppA.classList.add("hide"); ppB.classList.add("hide");
  await new Promise(r => setTimeout(r, 330));
  ppPaint(i);
  ppA.classList.remove("hide"); setTimeout(() => ppB.classList.remove("hide"), 80);
}
ppShow(0);
addEventListener("resize", ppPill);
document.fonts && document.fonts.ready.then(ppPill);

// калькулятор: отмеченные услуги складываются, сумма плавно докручивается
const CALC = [
  { n: "Сайт", p: 6500, on: true },
  { n: "Приложение в Telegram", p: 12000 }, { n: "Запуск рекламы", p: 7000, t: "без бюджета" },
  { n: "Логотип", p: 10000 }, { n: "Карточки 2ГИС и Яндекс Карт", p: 2000 }, { n: "Ведение рекламы", p: 5000, m: 1, t: "без бюджета" }, { n: "Поддержка сайта", p: 700, m: 1, t: "до 3 правок" }
];
const chips = document.getElementById("chips"), cSum = document.getElementById("cSum"), cMo = document.getElementById("cMo"), cBtn = document.getElementById("cBtn");
let cShown = 0, cRaf = 0;
CALC.forEach(c => {
  const b = document.createElement("button"); b.type = "button"; b.className = "chip" + (c.on ? " on" : "");
  b.setAttribute("aria-pressed", !!c.on);
  b.innerHTML = `${c.n}<small>${fmtR(c.p)} ₽${c.m ? " / мес" : c.s ? " / год" : ""}${c.t ? " · " + c.t : ""}</small>`;
  b.onclick = () => { c.on = !c.on; b.classList.toggle("on", c.on); b.setAttribute("aria-pressed", c.on); calcPaint(); };
  chips.append(b);
});
function calcPaint() {
  const sel = CALC.filter(c => c.on), once = sel.filter(c => !c.m).reduce((a, c) => a + c.p, 0), mo = sel.filter(c => c.m).reduce((a, c) => a + c.p, 0);
  cMo.textContent = mo ? `+ ${fmtR(mo)} ₽ в месяц` : "";
  cBtn.classList.toggle("off", !sel.length);
  if (sel.length) { cBtn.removeAttribute("tabindex"); cBtn.removeAttribute("aria-disabled"); } else { cBtn.tabIndex = -1; cBtn.setAttribute("aria-disabled", "true"); }
  const msg = `Здравствуйте! Посчитал на сайте ORIEN:\n${sel.map(c => "- " + c.n).join("\n")}\nИтого от ${fmtR(once)} ₽${mo ? ` + ${fmtR(mo)} ₽/мес` : ""}`;
  cBtn.href = TG + "?text=" + encodeURIComponent(msg);
  cancelAnimationFrame(cRaf);
  const from = cShown, t0 = performance.now(), d = reduce ? 1 : 700;
  const tick = t => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); cShown = Math.round(from + (once - from) * e); cSum.textContent = fmtR(cShown); if (k < 1) cRaf = requestAnimationFrame(tick); };
  cRaf = requestAnimationFrame(tick);
}
calcPaint();

// заявка: ничего не уходит на сервер - открывается Telegram с готовым сообщением
document.getElementById("lead").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, n = f.n.value.trim(), l = f.l.value.trim();
  const msg = `Здравствуйте! Хочу сайт.\nНазвание: ${n}${l ? "\nКарточка: " + l : ""}`;
  window.open(TG + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
});

// вопросы: ответ раскрывается плавно, открыт только один
const faqD = [...document.querySelectorAll(".faq details")];
faqD.forEach(d => d.querySelector("summary").addEventListener("click", e => {
  e.preventDefault();
  const open = !d.open;
  faqD.forEach(x => { if (x !== d && x.open) { x.classList.remove("op"); setTimeout(() => { if (!x.classList.contains("op")) x.open = false; }, 600); } });
  if (open) { d.open = true; requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("op"))); }
  else { d.classList.remove("op"); setTimeout(() => { if (!d.classList.contains("op")) d.open = false; }, 600); }
}));

// карточки: свет под курсором, на телефоне - подсветка, когда карточка в центре экрана
document.querySelectorAll(".card").forEach((c, i) => {
  c.style.setProperty("--d", (-i * 3.3) + "s");
  c.addEventListener("pointermove", e => { const r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
});
if (matchMedia("(hover: none)").matches) {
  const ioC = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("lit", e.isIntersecting)), { rootMargin: "-40% 0px -40% 0px" });
  document.querySelectorAll(".card").forEach(c => ioC.observe(c));
}

// работы: цвет появляется, когда проект в центре экрана
const ioW = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("lit", e.isIntersecting)), { rootMargin: "-35% 0px -35% 0px" });
document.querySelectorAll(".case").forEach(w => ioW.observe(w));

// прокрутка: шапка, логотип, слова, параллакс, кнопка на телефоне
const nav = document.querySelector(".nav"), contact = document.getElementById("contact");
const par = [...document.querySelectorAll(".parallax img")];
const phones = [...document.querySelectorAll("[data-py]")];
function onScroll() {
  const vh = innerHeight, y = scrollY;
  // сначала читаем размеры, потом пишем, чтобы страница не пересчитывалась по нескольку раз за кадр
  const cTop = contact.getBoundingClientRect().top;
  const wr = words.length ? words[0].parentElement.getBoundingClientRect() : null;
  const pr = reduce ? [] : par.map(img => img.parentElement.getBoundingClientRect());
  if (svc.length) svcScroll(vh);
  nav.classList.toggle("solid", y > vh * 0.6);
  nav.classList.toggle("at-contact", cTop < vh * 0.7);
  if (wr) {
    const k = Math.min(1, Math.max(0, (vh * 0.85 - wr.top) / (wr.height + vh * 0.35)));
    const n = Math.round(k * words.length);
    words.forEach((w, i) => { const on = i < n; if (w._on !== on) { w._on = on; w.classList.toggle("on", on); } });
  }
  if (reduce) return;
  par.forEach((img, i) => {
    const r = pr[i];
    if (r.bottom < 0 || r.top > vh) return;
    img.style.setProperty("--py", (((r.top + r.height / 2 - vh / 2) / vh) * -5).toFixed(2) + "%");
  });
}
let sTick = 0;
const sched = () => { if (!sTick) sTick = requestAnimationFrame(() => { sTick = 0; onScroll(); }); };
if (lenis) lenis.on("scroll", sched); else addEventListener("scroll", sched, { passive: true });
onScroll();

// меню на телефоне
(() => {
  const btn = document.getElementById("mMenu");
  const set = o => { nav.classList.toggle("open", o); btn.setAttribute("aria-expanded", o); btn.textContent = o ? "Закрыть" : "Меню"; };
  btn.addEventListener("click", () => set(!nav.classList.contains("open")));
  document.getElementById("navList").addEventListener("click", e => { if (e.target.closest("a")) set(false); });
  document.addEventListener("click", e => { if (nav.classList.contains("open") && !nav.contains(e.target)) set(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("open")) { set(false); btn.focus(); } });
})();

// если картинка не догрузилась - пробуем ещё раз
document.querySelectorAll("img").forEach(im => im.addEventListener("error", () => { if (im.dataset.retry) return; im.dataset.retry = 1; setTimeout(() => { im.src = im.src.split("?")[0] + "?r=" + Date.now(); }, 800); }));

// время на Сахалине
const clock = document.getElementById("clock");
const tick = () => clock.textContent = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Sakhalin" }).format(new Date());
tick(); setInterval(tick, 15000);
