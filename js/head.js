/* Оцифровка головы: по портрету на первом экране периодически проходит
   сканирующая полоса, и силуэт в ней рассыпается на точки - в одном стиле
   с «живыми точками» остальных блоков. Точки берутся из вырезанного портрета
   (hero-cut.webp), поэтому ложатся ровно по голове и плечам. */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const hero = document.querySelector(".hero"), cut = document.querySelector(".photo-cut");
  const cv = document.getElementById("headScan");
  if (!hero || !cut || !cv) return;
  const x = cv.getContext("2d");

  let W = 0, H = 0, dots = [], xMin = 0, xMax = 0, yMin = 0, yMax = 0;
  let ready = false, vis = true, raf = 0, t0 = 0, last = 0;

  /* сетка точек: портрет рисуется в маленький канвас по той же схеме,
     что object-fit:cover у картинки, и читается попиксельно */
  const build = () => {
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    const iw = cut.naturalWidth, ih = cut.naturalHeight; if (!iw || !ih) return;
    const s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
    const pos = getComputedStyle(cut).objectPosition.split(" ");
    const off = (v, box, img) => v.endsWith("%") ? (box - img) * parseFloat(v) / 100 : (parseFloat(v) || 0);
    const ox = off(pos[0] || "50%", W, dw), oy = off(pos[1] || "50%", H, dh);
    const step = W < 900 ? 9 : 8;
    const gw = Math.max(1, Math.round(W / step)), gh = Math.max(1, Math.round(H / step));
    const oc = document.createElement("canvas"); oc.width = gw; oc.height = gh;
    const og = oc.getContext("2d", { willReadFrequently: true });
    og.drawImage(cut, ox / W * gw, oy / H * gh, dw / W * gw, dh / H * gh);
    let d; try { d = og.getImageData(0, 0, gw, gh).data; } catch (e) { return; }
    dots = []; xMin = W; xMax = 0; yMin = H; yMax = 0;
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
      const i = (gy * gw + gx) * 4; if (d[i + 3] < 140) continue;
      const lum = (d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114) / 255;
      const av = Math.pow(d[i + 3] / 255, 1.6); // полупрозрачные пряди - тусклее
      const px = (gx + .5) * step, py = (gy + .5) * step;
      dots.push({ x: px, y: py, l: lum, a: av, j: Math.random() * 6.283 });
      if (px < xMin) xMin = px; if (px > xMax) xMax = px;
      if (py < yMin) yMin = py; if (py > yMax) yMax = py;
    }
    ready = dots.length > 50;
  };

  const P = 9000, D = 2800;                       // период и длительность прохода
  const draw = now => {
    const ph = now - t0 < 0 ? P : (now - t0) % P; // до первого прохода - тишина
    if (ph > D) { if (last !== -1) { last = -1; x.clearRect(0, 0, W, H); } return; }
    if (now - last < 33 && last !== -1) return; last = now;
    x.clearRect(0, 0, W, H);
    const band = Math.max(90, (yMax - yMin) * .3);
    const k = ph / D;
    const scanY = yMin - band / 2 + k * (yMax - yMin + band);
    const tt = now / 1000;
    for (const p of dots) {
      const dy = Math.abs(p.y - scanY); if (dy > band) continue;
      const w = 1 - dy / band;                     // ближе к линии - ярче и крупнее
      const a = Math.pow(w, 1.4) * p.a * (.72 + .28 * Math.sin(tt * 7 + p.j));
      const g = Math.round(118 + p.l * 137);
      x.fillStyle = `rgba(${Math.round(g * .9)},${g},${Math.round(g * .96)},${(a * .92).toFixed(3)})`;
      x.beginPath(); x.arc(p.x, p.y, 1 + w * 2.1 + p.l * .8, 0, 6.283); x.fill();
    }
    /* сама линия сканирования - только над силуэтом, с мягкими краями */
    const lx = Math.max(0, xMin - 28), lw = Math.min(W, xMax + 60) - lx;
    const gv = x.createLinearGradient(0, scanY - 26, 0, scanY + 26);
    gv.addColorStop(0, "rgba(198,234,217,0)");
    gv.addColorStop(.5, "rgba(198,234,217,.2)");
    gv.addColorStop(1, "rgba(198,234,217,0)");
    x.fillStyle = gv; x.fillRect(lx, scanY - 26, lw, 52);
    const gh2 = x.createLinearGradient(lx, 0, lx + lw, 0);
    gh2.addColorStop(0, "rgba(198,234,217,0)");
    gh2.addColorStop(.12, "rgba(198,234,217,.5)");
    gh2.addColorStop(.8, "rgba(198,234,217,.45)");
    gh2.addColorStop(1, "rgba(198,234,217,0)");
    x.fillStyle = gh2; x.fillRect(lx, scanY - .5, lw, 1);
  };

  const loop = now => { if (vis) draw(now); raf = requestAnimationFrame(loop); };

  let mt = 0;
  const again = () => { clearTimeout(mt); mt = setTimeout(build, 160); };
  addEventListener("resize", again);

  const start = () => {
    build();
    if (!ready) return;
    t0 = performance.now() + 3400;               // первый проход после заставки
    new IntersectionObserver(es => {
      vis = es[0].isIntersecting;
      cancelAnimationFrame(raf);
      if (vis) raf = requestAnimationFrame(loop);
    }).observe(hero);
  };
  const boot = () => (cut.decode ? cut.decode() : Promise.resolve()).then(start).catch(() => {});
  document.readyState === "complete" ? boot() : addEventListener("load", boot);
})();
