/* V3 «Сюжет»: счётчики, нарисованные линии, подсказка раздела. Дизайн сайта не меняется */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), lerp = (a, b, t) => a + (b - a) * t;
  const root = document.documentElement;
  const mint = getComputedStyle(root).getPropertyValue("--mint").trim() || "#c6ead9";
  const ease = t => 1 - Math.pow(1 - t, 4);

  const st = document.createElement("style");
  st.textContent = `
  .v3-pill{position:fixed;left:clamp(14px,2vw,28px);bottom:clamp(14px,2vw,26px);z-index:60;display:flex;align-items:center;gap:12px;padding:8px 18px 8px 8px;border-radius:99px;background:rgba(15,19,21,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#eef3f1;font:500 11px/1 var(--mono,monospace);letter-spacing:.1em;text-transform:uppercase;opacity:0;transform:translateY(16px);transition:opacity .6s cubic-bezier(.22,.8,.2,1),transform .7s cubic-bezier(.22,.8,.2,1);cursor:pointer;border:0}
  .v3-pill.on{opacity:1;transform:none}
  .v3-pill svg{width:34px;height:34px;flex:none;transform:rotate(-90deg)}
  .v3-pill circle{fill:none;stroke-width:2.2}
  .v3-pill .bg{stroke:rgba(238,243,241,.2)}.v3-pill .fg{stroke:${mint};stroke-linecap:round}
  .v3-pill .t{position:relative;display:block;height:1.2em;overflow:hidden;min-width:130px;text-align:left}
  .v3-pill .t span{position:absolute;left:0;top:0;white-space:nowrap;transition:transform .7s cubic-bezier(.22,.8,.2,1),opacity .5s}
  .v3-pill .t span.old{transform:translateY(-110%);opacity:0}
  .v3-pill .arr{position:absolute;left:8px;top:8px;width:34px;height:34px;display:grid;place-items:center;font-size:12px;opacity:0;transition:opacity .3s}
  .v3-pill:hover .arr{opacity:1}
  .v3-pill:hover svg{opacity:.25}
  .rule,.rule-d{transform-origin:0 50%}
  .v3-rule{transform:scaleX(0);transition:transform 1.6s cubic-bezier(.22,.8,.2,1)}
  .v3-rule.in{transform:none}
  .v3-tl{position:absolute;left:0;right:0;top:-26px;height:1px;background:rgba(15,19,21,.16);pointer-events:none}
  .v3-tl i{position:absolute;left:0;top:-1px;height:3px;width:100%;background:#0f1315;transform-origin:0 50%;transform:scaleX(0)}
  .v3-tl b{position:absolute;top:-4px;width:9px;height:9px;margin-left:-4px;border-radius:50%;background:#cdd5d7;box-shadow:inset 0 0 0 1.5px rgba(15,19,21,.3);transition:background .6s,box-shadow .6s,transform .6s cubic-bezier(.34,1.56,.64,1)}
  .v3-tl b.on{background:#0f1315;box-shadow:none;transform:scale(1.5)}
  .steps{position:relative}
  @keyframes v3bump{40%{transform:scale(1.06)}}
  .v3-bump{animation:v3bump .45s cubic-bezier(.22,.8,.2,1);display:inline-block;transform-origin:0 70%}
  .screens .phone{will-change:translate,rotate,scale,opacity}
  .pp-swap li{opacity:0;transform:translateX(-14px);animation:v3li .7s cubic-bezier(.22,.8,.2,1) forwards}
  @keyframes v3li{to{opacity:1;transform:none}}
  @media(max-width:900px){.v3-tl{display:none}}
  @media(max-width:700px){.v3-pill{display:none}}
  `;
  document.head.append(st);

  /* 1. подсказка раздела с кольцом прогресса страницы */
  const labels = $$(".label.mono").map(l => { const m = l.textContent.match(/^(.*?)\s*·\s*\((\d+)\)/); return m ? { el: l, name: m[1].replace(/^Услуги и цены$/, "Цены").replace(/^Частые вопросы$/, "Вопросы").replace(/^Как это происходит$/, "Как это идёт"), n: m[2] } : null; }).filter(Boolean);
  const pill = document.createElement("button"); pill.type = "button"; pill.className = "v3-pill"; pill.setAttribute("aria-label", "Наверх");
  const R = 14, C = 2 * Math.PI * R;
  pill.innerHTML = `<svg viewBox="0 0 34 34" aria-hidden="true"><circle class="bg" cx="17" cy="17" r="${R}"/><circle class="fg" cx="17" cy="17" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><span class="arr">↑</span><span class="t"><span class="cur"></span></span>`;
  document.body.append(pill);
  const fg = pill.querySelector(".fg"), tbox = pill.querySelector(".t");
  let curTxt = "";
  const setTxt = s => {
    if (s === curTxt) return; curTxt = s;
    const old = tbox.querySelector(".cur"); const nw = document.createElement("span"); nw.className = "cur"; nw.textContent = s;
    nw.style.transform = "translateY(110%)"; nw.style.opacity = "0"; tbox.append(nw);
    old.classList.remove("cur"); old.classList.add("old");
    requestAnimationFrame(() => requestAnimationFrame(() => { nw.style.transform = ""; nw.style.opacity = ""; }));
    setTimeout(() => old.remove(), 800);
  };
  pill.addEventListener("click", () => { if (typeof lenis !== "undefined" && lenis) lenis.scrollTo(0, { duration: 1.6 }); else scrollTo({ top: 0, behavior: "smooth" }); });

  /* 2. счётчики: число доезжает от нуля, когда блок появился */
  const counters = [];
  $$(".facts b, .f-facts b").forEach(b => {
    const m = b.textContent.trim().match(/^(\d+)(.*)$/); if (!m) return;
    counters.push({ el: b, to: +m[1], suf: m[2], done: false });
    b.textContent = "0" + m[2];
  });
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const c = counters.find(c => c.el === e.target); if (!c || c.done) return; c.done = true; cio.unobserve(e.target);
    const t0 = performance.now(), D = 1300 + c.to * 12;
    const step = t => { const k = clamp((t - t0) / D, 0, 1); c.el.textContent = Math.round(ease(k) * c.to) + c.suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  counters.forEach(c => cio.observe(c.el));

  /* 3. тонкие линии «рисуются» */
  $$(".rule").forEach(r => { r.classList.add("v3-rule"); });
  const rio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }), { threshold: .5 });
  $$(".v3-rule").forEach(r => rio.observe(r));

  /* 4. цена: число докручивается, пункты выезжают по очереди, сумма подпрыгивает */
  const ppA = $("#ppA"), ppB = $("#ppB"); let prevPrice = 0;
  const fmt = n => n.toLocaleString("ru-RU").replace(/[  ]/g, " ");
  const roll = () => {
    const big = ppA && ppA.querySelector(".pp-big"); if (!big) return;
    const node = [...big.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent)); if (!node) return;
    const to = parseInt(node.textContent.replace(/\D/g, ""), 10), from = prevPrice || 0; prevPrice = to;
    if (!from || from === to) return;
    const t0 = performance.now(), D = 800;
    const step = t => { const k = clamp((t - t0) / D, 0, 1); node.textContent = fmt(Math.round(lerp(from, to, ease(k)))); if (k < 1) requestAnimationFrame(step); };
    node.textContent = fmt(from); requestAnimationFrame(step);
  };
  if (ppA) { new MutationObserver(roll).observe(ppA, { childList: true }); setTimeout(roll, 50); }
  if (ppB) new MutationObserver(() => { ppB.querySelectorAll("li").forEach((li, i) => li.style.animationDelay = (i * 90 + 120) + "ms"); }).observe(ppB, { childList: true });
  const cs = $("#cSum"); if (cs) new MutationObserver(() => { cs.classList.remove("v3-bump"); void cs.offsetWidth; cs.classList.add("v3-bump"); }).observe(cs, { childList: true, characterData: true, subtree: true });

  /* 5. «Как это происходит»: линия рисуется и зажигает шаги по очереди */
  const steps = $(".steps"), cards = steps ? $$(".steps .step") : [];
  let tl = null, tlFill = null, tlNodes = [];
  if (steps && cards.length) {
    tl = document.createElement("div"); tl.className = "v3-tl"; tl.innerHTML = "<i></i>" + cards.map(() => "<b></b>").join(""); steps.prepend(tl);
    tlFill = tl.querySelector("i"); tlNodes = [...tl.querySelectorAll("b")];
  }

  /* 6. работы: телефоны сходятся веером (только transform, без пересчёта вёрстки) */
  const cases = $$(".case").map(c => ({ c, ph: [...c.querySelectorAll(".screens .phone")], dx: [], top: 0, h: 0 }));

  /* положения блоков считаем один раз, а не в каждом кадре */
  let lbTop = [], stTop = 0, stH = 0, nodeX = [], dirty = true;
  const measure = () => {
    const y0 = scrollY;
    lbTop = labels.map(l => l.el.getBoundingClientRect().top + y0);
    if (steps) {
      const sr = steps.getBoundingClientRect(); stTop = sr.top + y0; stH = sr.height;
      cards.forEach((c, i) => { tlNodes[i].style.left = (c.getBoundingClientRect().left - sr.left + 26) + "px"; });
      nodeX = tlNodes.map(n => n.offsetLeft);
    }
    cases.forEach(o => {
      o.ph.forEach(p => { p.style.translate = ""; p.style.rotate = ""; p.style.scale = ""; });
      const r = o.c.getBoundingClientRect(); o.top = r.top + y0; o.h = r.height;
      if (innerWidth <= 900 || !o.ph.length) { o.dx = []; return; }
      const sr = o.c.querySelector(".screens").getBoundingClientRect(), mid = sr.left + sr.width / 2;
      o.dx = o.ph.map(p => { const q = p.getBoundingClientRect(); return mid - (q.left + q.width / 2); });
    });
    dirty = true;
  };
  let mt = 0; const again = () => { clearTimeout(mt); mt = setTimeout(measure, 140); };
  measure(); addEventListener("resize", again); addEventListener("load", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if (window.ResizeObserver) new ResizeObserver(again).observe(document.body);
  setTimeout(measure, 1500); setTimeout(measure, 4000);

  /* 7. контакт: в поле название печатается само, пока вы не начали вводить */
  const inp = $('#lead input[name="n"]'); let typing = false;
  if (inp) {
    const final = inp.placeholder, words = ["Автосервис Кузовной 25", "Салон красоты", "Шиномонтаж", "Стоматология", final];
    const run = async () => {
      if (typing) return; typing = true; const sl = ms => new Promise(r => setTimeout(r, ms));
      for (const w of words) {
        if (document.activeElement === inp || inp.value) break;
        for (let i = 1; i <= w.length; i++) { if (document.activeElement === inp || inp.value) break; inp.placeholder = w.slice(0, i) + "▌"; await sl(55 + Math.random() * 40); }
        if (w === final) break; await sl(1000);
        for (let i = w.length; i >= 0; i--) { if (document.activeElement === inp || inp.value) break; inp.placeholder = w.slice(0, i) + "▌"; await sl(28); }
      }
      inp.placeholder = final;
    };
    inp.addEventListener("focus", () => { inp.placeholder = final; });
    const cio2 = new IntersectionObserver(es => { if (es[0].isIntersecting) { cio2.disconnect(); setTimeout(run, 900); } }, { threshold: .5 });
    cio2.observe(inp);
  }

  /* общий цикл: работает только когда страница реально прокручена */
  let lastY = -1, lastOn = null, lastDash = "";
  const loop = () => {
    const y = scrollY;
    if (y === lastY && !dirty) { requestAnimationFrame(loop); return; }
    lastY = y; dirty = false;
    const vh = innerHeight, h = document.documentElement.scrollHeight - vh;
    /* подсказка */
    let act = null; for (let i = 0; i < labels.length; i++) if (lbTop[i] - y < vh * .6) act = labels[i];
    if (act) setTxt(act.n + " · " + act.name);
    const on = y > vh * .7 && !!act;
    if (on !== lastOn) { lastOn = on; pill.classList.toggle("on", on); }
    const dash = (C * (1 - (h > 0 ? clamp(y / h, 0, 1) : 0))).toFixed(1);
    if (dash !== lastDash) { lastDash = dash; fg.style.strokeDashoffset = dash; }
    /* линия шагов */
    if (tl && innerWidth > 900) {
      const top = stTop - y;
      if (top < vh && top + stH > 0) {
        const k = clamp((vh * .8 - top) / (vh * .5), 0, 1);
        tlFill.style.transform = `scaleX(${k.toFixed(3)})`;
        const first = nodeX[0], last = nodeX[nodeX.length - 1];
        tlNodes.forEach((n, i) => {
          const lit = k * (last - first) + first >= nodeX[i] - 2 || (i === 0 && k > .02);
          if (n._l !== lit) { n._l = lit; n.classList.toggle("on", lit); cards[i].classList.toggle("lit", lit); }
        });
      }
    }
    /* веер телефонов */
    if (innerWidth > 900) cases.forEach(o => {
      if (!o.dx.length) return;
      const top = o.top - y; if (top + o.h < 0 || top > vh) return;
      const k = ease(clamp((vh * .92 - top) / (vh * .55), 0, 1));
      o.ph.forEach((p, i) => {
        p.style.translate = (o.dx[i] * (1 - k)).toFixed(1) + "px 0";
        p.style.rotate = `0 0 1 ${((i - 1) * -9 * (1 - k)).toFixed(2)}deg`;
        p.style.scale = (.84 + .16 * k).toFixed(3);
        p.style.opacity = clamp(k * 1.6, 0, 1).toFixed(3);
      });
    });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
