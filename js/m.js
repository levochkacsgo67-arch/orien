// заявка на страницах услуг: окно по кнопкам «Оставить заявку» и такая же форма внизу страницы
(function(){
  var LEAD_URL="https://orien-leads.brows-booking.workers.dev";// воркер Cloudflare orien-leads: пересылает заявку в Telegram-бота
  var SV={sajt:"Сайт",ads:"Реклама",app:"Приложение в Telegram",logo:"Логотип"};
  var mo,md,last,api;
  // цели Яндекс Метрики (работают, только если посетитель принял cookie)
  function goal(n,p){try{window.ym&&window.ym(114110564,"reachGoal",n,p||{})}catch(e){}}
  function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h)e.innerHTML=h;return e}
  var PK=(document.body.getAttribute("data-pk")||"").split("|").filter(Boolean);
  function page(){var p=document.body.getAttribute("data-s");return SV[p]?p:""}
  function formHTML(pre){
    var opts=PK.map(function(k){return '<button type="button" role="option" aria-selected="false" data-s="'+k+'">'+k+'</button>'}).join("");
    return '<form autocomplete="off" novalidate>'+
    (PK.length?'<div class="ms" style="margin-bottom:12px"><button class="msb" type="button" aria-haspopup="listbox" aria-expanded="false"><span class="msv">Выберите пакет</span><i aria-hidden="true"></i></button><div class="msm" role="listbox">'+opts+'</div></div>':'')+
    '<div class="mw" role="radiogroup" aria-label="Как с вами связаться" style="margin-bottom:12px"><button type="button" role="radio" aria-checked="false" data-w="Telegram">Telegram</button><button type="button" role="radio" aria-checked="false" data-w="MAX">MAX</button><button type="button" role="radio" aria-checked="false" data-w="WhatsApp">WhatsApp</button></div>'+
    '<div class="mf mtg" hidden style="margin-bottom:12px"><input name="u" maxlength="33" placeholder="@username" aria-label="Юзернейм в Telegram" autocapitalize="none" spellcheck="false"><input name="pt" type="tel" inputmode="tel" maxlength="20" placeholder="+7 (___) ___-__-__" aria-label="Номер телефона"></div>'+
    '<div class="mf mph" hidden style="margin-bottom:12px"><input name="pm" type="tel" inputmode="tel" maxlength="20" placeholder="+7 (___) ___-__-__" aria-label="Номер телефона"><input name="nm" maxlength="60" placeholder="Как к вам обращаться" aria-label="Как к вам обращаться"></div>'+
    '<input name="l" maxlength="500" placeholder="Комментарий (необязательно)" aria-label="Комментарий" style="margin-bottom:12px">'+
    '<label class="ma" style="margin-bottom:12px"><input type="checkbox" name="ok"><span>Согласен на <a href="../legal/consent.html" target="_blank" rel="noopener">обработку персональных данных</a></span></label>'+
    '<button class="pill" type="submit"><b>Отправить заявку</b> <span>→</span></button></form>';
  }
  // оживляет форму внутри root; у каждой формы своё состояние
  function wire(root){
    var f=root.querySelector("form"),svc="",w="";
    var ms=root.querySelector(".ms"),msb=ms&&ms.querySelector(".msb"),mw=root.querySelector(".mw"),tg=root.querySelector(".mtg"),ph=root.querySelector(".mph");
    var digits=function(v){return v.replace(/\D/g,"")};
    var fmt=function(v){var d=digits(v);if(d[0]==="7"||d[0]==="8")d=d.slice(1);d=d.slice(0,10);return"+7 ("+d.slice(0,3)+(d.length>3?") ":"")+d.slice(3,6)+(d.length>6?"-":"")+d.slice(6,8)+(d.length>8?"-":"")+d.slice(8,10)};
    [f.pt,f.pm].forEach(function(i){
      i.addEventListener("focus",function(){if(!i.value)i.value="+7 ("});
      i.addEventListener("input",function(){i.value=fmt(i.value)});
      i.addEventListener("blur",function(){if(!digits(i.value).replace(/^[78]/,""))i.value=""})});
    f.u.addEventListener("focus",function(){if(!f.u.value)f.u.value="@"});
    f.u.addEventListener("input",function(){f.u.value="@"+f.u.value.replace(/[^A-Za-z0-9_]/g,"")});
    f.u.addEventListener("blur",function(){if(f.u.value==="@")f.u.value=""});
    function drop(o){if(!ms)return;ms.classList.toggle("open",o);msb.setAttribute("aria-expanded",o)}
    function pick(k){if(!ms)return;svc=PK.indexOf(k)>=0?k:"";ms.classList.toggle("has",!!svc);msb.querySelector(".msv").textContent=svc||"Выберите пакет";
      ms.querySelectorAll(".msm button").forEach(function(x){x.setAttribute("aria-selected",x.getAttribute("data-s")===svc)})}
    function show(){tg.hidden=w!=="Telegram";ph.hidden=!w||w==="Telegram"}
    if(ms){
    msb.addEventListener("click",function(){drop(!ms.classList.contains("open"))});
    ms.querySelector(".msm").addEventListener("click",function(e){var o=e.target.closest("button[data-s]");if(!o)return;pick(o.getAttribute("data-s"));ms.classList.remove("err");drop(false)});
    root.addEventListener("pointerdown",function(e){if(!ms.contains(e.target))drop(false)},{passive:true});}
    mw.addEventListener("click",function(e){var b=e.target.closest("button[data-w]");if(!b)return;w=b.getAttribute("data-w");mw.classList.remove("err");
      mw.querySelectorAll("button").forEach(function(x){x.setAttribute("aria-checked",x===b)});show()});
    f.addEventListener("input",function(e){e.target.classList.remove("err")});
    f.ok.addEventListener("change",function(){f.ok.closest(".ma").classList.remove("err")});
    f.addEventListener("submit",function(e){e.preventDefault();
      f.querySelectorAll(".err").forEach(function(x){x.classList.remove("err")});
      var ok=true,bad=function(x){x.classList.add("err");ok=false};
      if(ms&&!svc)bad(ms);
      if(!w)bad(mw);
      var lines=["Услуга: "+SV[page()]].concat(PK.length?["Пакет: "+svc]:[]).concat(["Связь: "+w]);
      if(w==="Telegram"){var u=f.u.value.trim().replace(/^@?/,"@"),p=f.pt.value.trim();
        if(!/^@[A-Za-z0-9_]{5,32}$/.test(u))bad(f.u);if(digits(p).length!==11)bad(f.pt);lines.push("Юзернейм: "+u,"Телефон: "+p)}
      else if(w){var p2=f.pm.value.trim(),nm=f.nm.value.trim();
        if(digits(p2).length!==11)bad(f.pm);if(nm.length<2)bad(f.nm);lines.push("Телефон: "+p2,"Имя: "+nm)}
      if(!f.ok.checked)bad(f.ok.closest(".ma"));
      if(!ok)return;
      if(f.l.value.trim())lines.push("Комментарий: "+f.l.value.trim());
      goal("lead_submit",{page:page(),form:root.classList.contains("mi")?"inline":"modal",package:PK.length?svc:"",way:w});
      if(!LEAD_URL)return;
      var btn=f.querySelector("button[type=submit]");btn.disabled=true;
      var ac=new AbortController(),tm=setTimeout(function(){ac.abort()},8000);
      fetch(LEAD_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:lines.join("\n")}),signal:ac.signal})
        .then(function(r){clearTimeout(tm);if(!r.ok)throw 0;thanks()})
        .catch(function(){clearTimeout(tm);btn.disabled=false;location.href="https://t.me/ceoorien?text="+encodeURIComponent("Здравствуйте! Заявка с сайта.\n"+lines.join("\n"))});
    });
    var OKV=function(way){return '<div class="okv"><svg class="okc" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="35"/><path d="M25 41l11 11 20-23"/></svg><h3>Спасибо за заявку</h3><p>Скоро свяжемся с вами в '+way+'.</p></div>'};
    function thanks(){
      root.style.height=root.getBoundingClientRect().height+"px";root.classList.add("leave");
      setTimeout(function(){root.classList.add("sent");var o=root.querySelector(".okv");if(o)o.remove();root.insertAdjacentHTML("beforeend",OKV(w));
        void root.offsetWidth;root.classList.add("show")},380);
    }
    function reset(){f.reset();svc="";w="";pick("");mw.classList.remove("err");mw.querySelectorAll("button").forEach(function(x){x.setAttribute("aria-checked","false")});show();
      f.querySelectorAll(".err").forEach(function(x){x.classList.remove("err")});var b=f.querySelector("button[type=submit]");b.disabled=false;
      var o=root.querySelector(".okv");if(o)o.remove();root.classList.remove("leave","sent","show");root.style.height=""}
    return {reset:reset,pick:pick,drop:drop,isOpen:function(){return !!ms&&ms.classList.contains("open")},hasSvc:function(){return !ms||!!svc}};
  }
  // окно
  function build(){
    mo=el("div","mo");mo.setAttribute("aria-hidden","true");mo.setAttribute("data-lenis-prevent","");
    mo.innerHTML='<div class="md" role="dialog" aria-modal="true" aria-label="Оставить заявку"><button class="mx" type="button" aria-label="Закрыть"></button><h2>Оставить заявку</h2>'+formHTML()+'</div>';
    document.body.appendChild(mo);md=mo.firstChild;api=wire(md);
    md.querySelector(".mx").addEventListener("click",close);
    mo.addEventListener("pointerdown",function(e){if(e.target===mo)close()});
    document.addEventListener("keydown",function(e){
      if(!mo.classList.contains("on"))return;
      if(e.key==="Escape"){if(api.isOpen())api.drop(false);else close();return}
      if(e.key==="Tab"){var fs=[].slice.call(md.querySelectorAll("button,input,a[href]")).filter(function(x){return x.offsetParent&&!x.disabled});
        if(!fs.length)return;var a=fs[0],z=fs[fs.length-1];
        if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
  }
  function open(key){
    if(!mo)build();
    goal("lead_open",{page:page()});
    api.drop(false);
    last=document.activeElement;
    var sb=innerWidth-document.documentElement.clientWidth;
    if(window.__lenis)window.__lenis.stop();document.body.classList.add("mlock");if(sb>0)document.body.style.paddingRight=sb+"px";
    mo.setAttribute("aria-hidden","false");
    requestAnimationFrame(function(){mo.classList.add("on");setTimeout(function(){var t=md.querySelector(api.hasSvc()?".mw button":".msb");if(t)t.focus({preventScroll:true})},350)});
  }
  function close(){
    mo.classList.remove("on");mo.setAttribute("aria-hidden","true");
    setTimeout(function(){document.body.classList.remove("mlock");if(window.__lenis)window.__lenis.start();document.body.style.paddingRight="";if(md.classList.contains("sent"))api.reset()},450);
    if(last&&last.focus)last.focus({preventScroll:true});
  }
  // форма внизу страницы
  var box=document.getElementById("ctf");
  if(box){var inl=el("div","md mi",formHTML());box.appendChild(inl);wire(inl);document.documentElement.classList.add("mjs")}
  (window.requestIdleCallback||function(f){setTimeout(f,1200)})(function(){if(!mo)build()});
  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest('a[href*="#contact"]');
    if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.button)return;
    var m=/[?&]s=(\w+)/.exec(a.getAttribute("href"));
    e.preventDefault();open(m&&m[1]);
  });
})();
