// Баннер cookie. Яндекс Метрика запускается только после кнопки «Принять».
(function () {
  var KEY = "orien-cookie-choice-v1", root = new URL("../", document.currentScript.src).href, mem = null, box, back;
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return mem; } }
  function save(v) { mem = v; try { localStorage.setItem(KEY, v); } catch (e) {} }
  function metrika() {
    if (window.ym) return;
    (function (m, e, t, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date(); k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a); })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    window.ym(114110564, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  }
  function wipe() {
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (n.indexOf("_ym") !== 0 && n !== "mdd") return;
      [location.hostname, "." + location.hostname].forEach(function (d) { document.cookie = n + "=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/;domain=" + d; });
      document.cookie = n + "=;expires=Thu,01 Jan 1970 00:00:00 GMT;path=/";
    });
    try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf("_ym") === 0) localStorage.removeItem(k); }); } catch (e) {}
  }
  function hide() { box.hidden = true; if (back) { back.focus(); back = null; } }
  function build() {
    box = document.createElement("section");
    box.className = "ck"; box.hidden = true; box.setAttribute("aria-label", "Согласие на cookie");
    box.innerHTML = '<p>Яндекс Метрика считает посещения и записывает действия на сайте. Включится, только если вы согласитесь. <a href="' + root + 'legal/cookies.html">Подробнее о cookie</a></p>' +
      '<div class="ck-btns"><button type="button" data-v="denied">Отклонить</button><button type="button" data-v="granted">Принять</button></div>';
    box.addEventListener("click", function (e) {
      var v = e.target.getAttribute && e.target.getAttribute("data-v");
      if (!v) return;
      var was = read(); save(v); hide();
      if (v === "granted") metrika();
      else { wipe(); if (was === "granted") location.reload(); }
    });
    var skip = document.querySelector(".skip");
    document.body.insertBefore(box, skip ? skip.nextSibling : document.body.firstChild);
  }
  build();
  var c = read();
  if (c === "granted") metrika(); else if (c !== "denied") box.hidden = false;
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-cookie-settings]");
    if (!b) return;
    e.preventDefault(); back = b; box.hidden = false; box.querySelector("button").focus();
  });
})();
