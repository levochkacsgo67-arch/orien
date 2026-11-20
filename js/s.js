// плавная прокрутка всех страниц и плавный переход между страницами (шторка), без сторонних сервисов
(function(){
  var d=document.documentElement,reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,KEY="orien-t";
  // слабое устройство: мало ядер или памяти, экономия трафика или прошлый замер в этой сессии
  var nv=navigator,cores=nv.hardwareConcurrency||8,mem=nv.deviceMemory||8,save=!!(nv.connection&&nv.connection.saveData),stored=null;
  try{stored=sessionStorage.getItem("orien-lite")}catch(e){}
  var weak=cores<=4||mem<=2||save;
  if(stored==="1"||(stored===null&&(cores<=2||mem<=1||save)))d.classList.add("lite");
  var base=document.currentScript?document.currentScript.src:"",STAR=base?new URL("../img/chrome-star.webp",base).href:"";
  new Image().src=STAR; // звезда прогружается заранее
  var st=document.createElement("style");
  st.textContent='#tc{position:fixed;inset:0;z-index:2147483000;background:#0c0c0c;opacity:0;pointer-events:none;transition:opacity .7s cubic-bezier(.4,0,.2,1)}'+
    'html.tout #tc{opacity:1;pointer-events:all;transition:opacity .45s cubic-bezier(.4,0,.2,1)}'+
    'html.tlift #tc{transition:opacity .7s cubic-bezier(.4,0,.2,1)}'+
    'html.tlift #tc .tcs{opacity:0;transform:translate(-50%,-50%) scale(1.08);transition:opacity .5s ease,transform .8s cubic-bezier(.22,1,.36,1)}'+
    'html.tout #tc .tcs{transition:transform .9s cubic-bezier(.22,1,.36,1),opacity .55s ease .05s}'+
    'html.tout #tc{opacity:1;pointer-events:all}html.tin #tc{opacity:1;transition:none;pointer-events:all}'+
    '#tc .tcs{position:absolute;left:50%;top:50%;width:clamp(150px,20vw,260px);aspect-ratio:1;transform:translate(-50%,-50%) scale(.9);opacity:0}'+
    'html.tout #tc .tcs,html.tin #tc .tcs{transform:translate(-50%,-50%) scale(1);opacity:1}html.tin #tc .tcs{transition:none}'+
    '#tc .tcs::before{content:"";position:absolute;inset:-60%;background:radial-gradient(closest-side,rgba(229,52,43,.3),transparent);pointer-events:none}'+
    '#tc img{position:relative;display:block;width:100%;height:100%;object-fit:contain;filter:brightness(.5)}'+
    '#tc i{position:absolute;inset:0;opacity:0;mix-blend-mode:screen;-webkit-mask:url('+STAR+') center/contain no-repeat;mask:url('+STAR+') center/contain no-repeat;background:linear-gradient(110deg,transparent 34%,rgba(255,255,255,1) 50%,transparent 66%) 100% 0/300% 100% no-repeat}'+
    'html.tout #tc i{opacity:1;animation:tcsw .55s cubic-bezier(.45,0,.25,1) .3s both}@keyframes tcsw{to{background-position:0 0}}'+
    '#tc .tcb{position:absolute;left:50%;top:calc(50% + clamp(75px,10vw,130px) + 38px);width:clamp(120px,14vw,180px);height:2px;margin-left:calc(clamp(120px,14vw,180px) / -2);background:rgba(244,241,236,.14);border-radius:2px;overflow:hidden;opacity:0;transition:opacity .4s}'+
    'html.tload #tc .tcs{animation:tcin 1.2s cubic-bezier(.22,1,.36,1) both}@keyframes tcin{from{opacity:0;transform:translate(-50%,-50%) scale(.88)}}'+
    'html.tload #tc .tcb{opacity:1}#tc .tcb u{display:block;height:100%;background:linear-gradient(90deg,#e5342b,#fff);transform:scaleX(0);transform-origin:left;transition:transform .25s linear}'+
    'html.tload #tc i{opacity:1;animation:tcsl 1.7s cubic-bezier(.45,0,.25,1) .3s infinite}@keyframes tcsl{0%{background-position:100% 0}65%,100%{background-position:0 0}}'+
    'html.lite #tc i,html.lite #tc .tcs::before{display:none}html.lite #tc,html.lite.tout #tc,html.lite.tlift #tc{transition-duration:.25s}'+
    'html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}.lenis.lenis-smooth [data-lenis-prevent]{overscroll-behavior:contain}.lenis.lenis-stopped{overflow:hidden}.lenis.lenis-scrolling iframe{pointer-events:none}';
  document.head.appendChild(st);
  var tc=document.createElement("div");tc.id="tc";tc.setAttribute("aria-hidden","true");
  tc.innerHTML='<div class="tcs"><img src="'+STAR+'" alt="" width="200" height="200" decoding="async"><i></i></div><b class="tcb"><u></u></b>';
  d.appendChild(tc);
  // пришли с другой страницы нашего сайта: шторка уже закрыта, плавно открываем
  var loader=false,isMain=/(^|\/)(index\.html)?$/.test(location.pathname);
  try{if(sessionStorage.getItem(KEY)){sessionStorage.removeItem(KEY);d.classList.add("tin")}
    else if(isMain&&!reduce&&!weak&&stored!=="1"&&!sessionStorage.getItem("orien-seen")){sessionStorage.setItem("orien-seen","1");d.classList.add("tin","tload");loader=true}}catch(e){}
  function lift(){if(!d.classList.contains("tin"))return;d.classList.add("tlift");d.classList.remove("tin","tload");setTimeout(function(){d.classList.remove("tlift")},1200)}
  if(loader){
    // как будто страница загружается: звезда, бегущий свет и полоса прогресса; только при первом заходе за сессию, не короче 1,5 с
    var t0=performance.now(),MIN=1500,done=false,bar=tc.querySelector(".tcb u");
    (function tick(){var t=performance.now()-t0,p=done?1:Math.min(.92,1-Math.exp(-t/1100));bar.style.transform="scaleX("+p+")";if(p<1||!done)requestAnimationFrame(tick)})();
    addEventListener("load",function(){setTimeout(function(){done=true;setTimeout(lift,450)},Math.max(0,MIN-(performance.now()-t0)))});
    setTimeout(function(){done=true;lift()},7000);
  }else{
    addEventListener("load",function(){requestAnimationFrame(function(){requestAnimationFrame(lift)})});
    setTimeout(lift,1800);
  }
  addEventListener("pageshow",function(e){going=false;if(window.__lenis&&!document.querySelector(".mo.on"))window.__lenis.start();if(e.persisted||d.classList.contains("tout")){d.classList.add("tlift");d.classList.remove("tout","tin");setTimeout(function(){d.classList.remove("tlift")},1200)}});
  // плавная прокрутка
  // запрет приближения щипком и двойным касанием (iOS игнорирует user-scalable)
  ["gesturestart","gesturechange","gestureend"].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()},{passive:false})});
  document.addEventListener("touchmove",function(e){if(e.touches&&e.touches.length>1&&e.cancelable)e.preventDefault()},{passive:false});
  var lastT=0;document.addEventListener("touchend",function(e){var t=Date.now();if(t-lastT<300&&e.cancelable&&!(e.target.closest&&e.target.closest("input,textarea,a,button,label")))e.preventDefault();lastT=t},{passive:false});
  var going=false,lenis=null;
  if(window.Lenis&&!reduce&&!d.classList.contains("lite")&&matchMedia("(hover:hover) and (pointer:fine)").matches){
    lenis=new Lenis({duration:1.1,easing:function(t){return 1-Math.pow(1-t,4)}});
    (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
    window.__lenis=lenis;
  }
  // замер плавности: если кадры долго рисуются, включаем лёгкий режим (без размытия и бегущих эффектов) и помним это в сессии
  if(stored===null&&!d.classList.contains("lite")){
    addEventListener("load",function(){setTimeout(function(){
      var n=0,t0=0,last=0,bad=0;
      (function f(t){if(!t0)t0=t;else{n++;if(t-last>40)bad++}last=t;
        if(t-t0<1500)requestAnimationFrame(f);
        else{var slow=n>10&&((t-t0)/n>30||bad/n>.3);try{sessionStorage.setItem("orien-lite",slow?"1":"0")}catch(e){}if(slow)d.classList.add("lite")}})(performance.now());
    },1200)});
  }
  function go(href){
    if(going)return;going=true;
    if(reduce){location.href=href;return}
    try{sessionStorage.setItem(KEY,"1")}catch(e){}
    d.classList.add("tout");
    setTimeout(function(){location.href=href},d.classList.contains("lite")?450:1000);
    setTimeout(function(){going=false;d.classList.remove("tout")},4500); // если переход не случился, ничего не зависает
  }
  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest("a[href]");
    if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;
    if((a.target&&a.target!=="_self")||a.hasAttribute("download"))return;
    var u;try{u=new URL(a.href,location.href)}catch(_){return}
    if(u.origin!==location.origin)return;
    var href=a.getAttribute("href");
    if(document.body.hasAttribute("data-s")&&/#contact/.test(href))return; // эти кнопки открывают окно заявки
    var same=u.pathname===location.pathname;
    if(same){
      if(!u.hash)return;
      var t=u.hash==="#top"?document.body:document.querySelector(u.hash);
      if(!t)return;
      e.preventDefault();
      if(lenis)lenis.scrollTo(u.hash==="#top"?0:t,{duration:1.3});else scrollTo({top:u.hash==="#top"?0:t.getBoundingClientRect().top+scrollY,behavior:"smooth"});
      return;
    }
    if(!/\.html$|\/$/.test(u.pathname))return;
    e.preventDefault();go(u.href);
  });
})();
