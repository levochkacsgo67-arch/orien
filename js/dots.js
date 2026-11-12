/* Живые точки (как в Fitment): по сетке точек бегут переливы. Рисуется только пока блок виден. */
(() => {
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = [];
  const io = new IntersectionObserver(es => es.forEach(e => { const it = e.target._d; if (it) it.seen = e.isIntersecting; }), { rootMargin: "80px" });
  function make(host, mode, step) {
    const cv = document.createElement("canvas"); cv.className = "dots-cv"; cv.setAttribute("aria-hidden", "true");
    host.prepend(cv);
    const it = { cv, ctx: cv.getContext("2d"), mode, step, w: 0, h: 0, seen: false, seed: Math.random() * 100 };
    cv._d = it; items.push(it); io.observe(cv);
    const size = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(1.5, devicePixelRatio || 1);
      it.w = r.width; it.h = r.height; cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      it.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(it, 3000);
    };
    new ResizeObserver(size).observe(cv); size();
  }
  function draw(it, now) {
    const { ctx, w, h, step, mode } = it; if (!w || !h) return;
    const t = now / 1000 + it.seed;
    ctx.clearRect(0, 0, w, h);
    const r0 = Math.max(1, step * .17);
    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        const a = Math.sin(x * .0042 - t * .55 + Math.sin(y * .006 + t * .22) * 1.8);
        const b = Math.sin((x + y) * .0026 + t * .38);
        let v = (a * .6 + b * .4 + 1) / 2; v = Math.pow(v, 2.1);
        if (mode === "light") {            // светлый фон: точки от еле заметных до чёрных
          const g = Math.round(200 - v * 78);
          ctx.fillStyle = `rgb(${g},${g + 3},${g + 6})`;
        } else {                           // тёмный фон: от тёмно-серых до серебра
          const g = Math.round(34 + v * 110);
          ctx.fillStyle = `rgb(${g},${g},${g})`;
        }
        ctx.beginPath(); ctx.arc(x, y, r0 * (.8 + v * .55), 0, 6.283); ctx.fill();
      }
    }
  }
  const doing = document.querySelector(".doing"), pp = document.querySelector(".pp");
  if (doing) make(doing, "light", 11);
  if (pp) make(pp, "dark", 10);
  let last = 0;
  const loop = now => {
    if (now - last > 40) { last = now; if (!document.hidden) for (const it of items) if (it.seen) draw(it, now); }
    requestAnimationFrame(loop);
  };
  if (!calm) requestAnimationFrame(loop);
})();
