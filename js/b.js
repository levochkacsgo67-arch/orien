const TG="https://t.me/ceoorien",reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll(".tg").forEach(a=>{a.href=TG;a.target="_blank";a.rel="noopener"});
// кнопки Telegram открывают приложение сразу (tg://), без промежуточной страницы t.me в браузере
const MOB=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
function openTG(url){let t="";try{t=new URL(url,location.href).searchParams.get("text")||""}catch(_){}
const app="tg://resolve?domain=ceoorien"+(t?"&text="+encodeURIComponent(t):"");let left=false;const mark=()=>{left=true};
addEventListener("blur",mark,{once:true});addEventListener("pagehide",mark,{once:true});document.addEventListener("visibilitychange",mark,{once:true});
location.href=app;
if(!MOB)setTimeout(()=>{if(!left&&!document.hidden)window.open(url,"_blank","noopener")},1800)}
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest('a[href^="https://t.me/ceoorien"]');if(!a||e.defaultPrevented||a.getAttribute("aria-disabled")==="true")return;e.preventDefault();openTG(a.href)},true);
// появление при прокрутке
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});
document.querySelectorAll(".rv").forEach(el=>io.observe(el));
// пятна на первом экране чуть следуют за курсором
(()=>{const h=document.querySelector(".hero");if(!h||reduce||!matchMedia("(hover: hover)").matches)return;
const bl=[...h.querySelectorAll(".blob")];let raf=0;
h.addEventListener("pointermove",e=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;bl.forEach((b,i)=>{b.style.transform=`translate(${x*(i+1)*-34}px,${y*(i+1)*-24}px)`;b.style.transition="transform 1.2s cubic-bezier(.22,.8,.2,1)"})})})})();
// меню
(()=>{const n=document.getElementById("nav"),b=document.getElementById("burger");if(!n||!b)return;
const set=o=>{n.classList.toggle("open",o);b.setAttribute("aria-expanded",o);b.textContent=o?"Закрыть":"Меню"};
b.onclick=()=>set(!n.classList.contains("open"));
n.querySelector(".m").addEventListener("click",e=>{if(e.target.closest("a"))set(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")set(false)});
let y0=0;new MutationObserver(()=>{if(n.classList.contains("open"))y0=window.scrollY}).observe(n,{attributes:true,attributeFilter:["class"]});
window.addEventListener("scroll",()=>{if(n.classList.contains("open")&&Math.abs(window.scrollY-y0)>6)set(false)},{passive:true});
document.addEventListener("pointerdown",e=>{if(n.classList.contains("open")&&!n.contains(e.target))set(false)},{passive:true})})();
// цены
const fmt=n=>n.toLocaleString("ru-RU").replace(/ | /g," ");
const W=n=>`img/works/${n}`;
const SPEED=55;
const PRICES=[
{name:"Сайт",slug:"sajt",sub:"Три пакета на выбор",items:["Информационный сайт, сайт с заявками или каталог","Кнопки связи: Telegram, MAX, WhatsApp","Первая версия простого сайта через 2 дня"],price:9990,note:"Первая версия простого сайта через 2 дня, оплата после согласования",short:"Сайт под ваше дело: от простой страницы с кнопками связи до каталога с поиском и онлайн-помощником. Три пакета на выбор."},
{name:"Приложение в Telegram",slug:"prilozhenie-telegram",sub:"Три пакета на выбор",items:["Каталог, заявки и онлайн-запись","Напоминания клиентам в Telegram","Открывается прямо в Telegram"],price:11990,note:"Открывается прямо в Telegram, установка не нужна",short:"Запись, заявки и каталог прямо в Telegram. Клиентам ничего не нужно скачивать."},
{name:"Реклама",slug:"reklama",sub:"ВКонтакте и Яндекс",items:["Картинки и тексты для рекламы","Выбор, кому показывать: город, возраст, интересы","Понятный расчёт: сколько стоит одна заявка"],price:6990,note:"Деньги на показ рекламы оплачиваются отдельно",short:"Картинки, тексты и настройка показа во ВКонтакте и в Яндексе."},
{name:"Логотип",slug:"logotip",sub:"Три варианта на выбор",items:["Три варианта на выбор и доработка","Светлая и тёмная версии","Памятка по стилю"],price:10990,note:"Знак и фирменный стиль",short:"Знак, по которому вас узнают, и памятка, как им пользоваться. Три варианта на выбор."}];
(()=>{const box=document.getElementById("prows");if(!box)return;
box.innerHTML=PRICES.map((p,i)=>`<article class="sc${i===0?" dark":""}"><h3>${p.name}</h3><p class="sub">${p.sub}</p><div class="tp"><small>от</small> ${fmt(p.price)} ₽</div><em class="per">${p.note}</em><ul class="lst">${p.items.map(t=>`<li>${t}</li>`).join("")}</ul><a class="pill ${i===0?"red":"ink"}" href="uslugi/${p.slug}.html">Подробнее <span>→</span></a></article>`).join("")})();
// калькулятор
(()=>{if(!document.getElementById("chips"))return;const C=[{n:"Сайт",p:9990,on:1},{n:"Приложение в Telegram",p:11990},{n:"Запуск рекламных кампаний",p:6990,t:"без бюджета"},{n:"Логотип",p:10990},{n:"Оформление карточек в 2ГИС и Яндекс Картах",p:1990},{n:"Ведение рекламных кампаний",p:4990,m:1,t:"без бюджета"},{n:"Техническая поддержка сайта",p:990,m:1,t:"до 3 правок"}];
const chips=document.getElementById("chips"),sum=document.getElementById("cSum"),mo=document.getElementById("cMo"),btn=document.getElementById("cBtn");let shown=0,raf=0;
C.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="chip"+(c.on?" on":"");b.setAttribute("aria-pressed",!!c.on);
b.innerHTML=`${c.n}<small>${fmt(c.p)} ₽${c.m?" / мес":""}${c.t?" · "+c.t:""}</small>`;b.onclick=()=>{c.on=!c.on;b.classList.toggle("on",c.on);b.setAttribute("aria-pressed",c.on);paint()};chips.append(b)});
function paint(){const sel=C.filter(c=>c.on),once=sel.filter(c=>!c.m).reduce((a,c)=>a+c.p,0),m=sel.filter(c=>c.m).reduce((a,c)=>a+c.p,0);
const nosel=!sel.length,onlyM=sel.length&&!once;document.querySelector(".cn").hidden=nosel;document.querySelector(".cn span:first-child").style.display=onlyM?"none":"";document.querySelector(".cn span:last-child").textContent=onlyM?" ₽ в месяц":" ₽";mo.textContent=nosel?"Отметьте хотя бы одну услугу":(onlyM?"":(m?`+ ${fmt(m)} ₽ в месяц`:""));
btn.setAttribute("aria-disabled",!sel.length);if(!sel.length)btn.tabIndex=-1;else btn.removeAttribute("tabindex");
btn.href=!sel.length?"#price":TG+"?text="+encodeURIComponent(`Здравствуйте! Рассчитал стоимость на сайте ORIEN:\n${sel.map(c=>"- "+c.n).join("\n")}\nИтого от ${fmt(once)} ₽${m?` + ${fmt(m)} ₽/мес`:""}`);
cancelAnimationFrame(raf);const from=shown,t0=performance.now(),d=reduce?1:700;
const tgt=once||m;const tick=t=>{const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);shown=Math.round(from+(tgt-from)*e);sum.textContent=fmt(shown);if(k<1)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)}
paint()})();
// заявка: ничего не уходит на сервер, открывается Telegram с готовым текстом
// заявка: услуга + способ связи (Telegram / MAX / WhatsApp)
const LEAD_URL="https://orien-leads.brows-booking.workers.dev";// воркер Cloudflare orien-leads: пересылает заявку в Telegram-бота; если не ответил - открываем Telegram с готовым текстом
(()=>{const f=document.getElementById("lead");if(!f)return;
const way=f.querySelector("#way"),wtg=f.querySelector("#wf-tg"),wph=f.querySelector("#wf-ph"),sbt=f.querySelector("#sbt");let w="";
const bad=(el,on=true)=>{if(el)el.classList.toggle("err",on)};
const agree=f.querySelector(".agree"),badAgree=on=>agree.classList.toggle("err",on);
const badSvc=on=>f.querySelector("#svc .selb").classList.toggle("err",on);
const digits=v=>v.replace(/\D/g,"");
const phoneOk=v=>digits(v).length===11;
const fmt=v=>{let d=digits(v);if(d[0]==="7"||d[0]==="8")d=d.slice(1);d=d.slice(0,10);
return"+7 ("+d.slice(0,3)+(d.length>3?") ":"")+d.slice(3,6)+(d.length>6?"-":"")+d.slice(6,8)+(d.length>8?"-":"")+d.slice(8,10)};
[f.pt,f.pm].forEach(i=>{
i.addEventListener("focus",()=>{if(!i.value)i.value="+7 ("});
i.addEventListener("input",()=>{i.value=fmt(i.value)});
i.addEventListener("blur",()=>{if(!digits(i.value).replace(/^[78]/,""))i.value=""})});
const show=()=>{wtg.hidden=w!=="Telegram";wph.hidden=!w||w==="Telegram";sbt.textContent="Отправить заявку"};
show();
way.addEventListener("click",e=>{const b=e.target.closest("button[data-w]");if(!b)return;w=b.dataset.w;way.classList.remove("err");
way.querySelectorAll("button").forEach(x=>x.setAttribute("aria-checked",x===b));show()});
f.addEventListener("input",e=>bad(e.target,false));
f.u.addEventListener("focus",()=>{if(!f.u.value)f.u.value="@"});
f.u.addEventListener("input",()=>{f.u.value="@"+f.u.value.replace(/[^A-Za-z0-9_]/g,"")});
f.u.addEventListener("blur",()=>{if(f.u.value==="@")f.u.value=""});
f.addEventListener("submit",async e=>{e.preventDefault();
f.querySelectorAll(".err").forEach(x=>x.classList.remove("err"));
const n=f.n.value.trim(),l=f.l.value.trim();let ok=true;
if(!n){badSvc(true);ok=false}
if(!w){way.classList.add("err");ok=false}
let lines=[`Услуга: ${n}`,`Связь: ${w}`];
if(w==="Telegram"){const u=f.u.value.trim().replace(/^@?/,"@"),p=f.pt.value.trim();
if(!/^@[A-Za-z0-9_]{5,32}$/.test(u)){bad(f.u);ok=false}
if(!phoneOk(p)){bad(f.pt);ok=false}
lines.push(`Юзернейм: ${u}`,`Телефон: ${p}`)}
else if(w){const p=f.pm.value.trim(),nm=f.nm.value.trim();
if(!phoneOk(p)){bad(f.pm);ok=false}
if(nm.length<2){bad(f.nm);ok=false}
lines.push(`Телефон: ${p}`,`Имя: ${nm}`)}
if(!f.ok.checked){badAgree(true);ok=false}
if(!ok)return;
if(l)lines.push(`Комментарий: ${l}`);
const text=lines.join("\n");
if(!LEAD_URL)return;
goal("lead_submit");// пока только визуал: отправка будет позже
const btn=f.querySelector("button[type=submit]");btn.disabled=true;
try{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),8000);const r=await fetch(LEAD_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text}),signal:ac.signal});clearTimeout(tm);if(!r.ok)throw 0;
const sentWay=w;f.reset();badAgree(false);w="";way.querySelectorAll("button").forEach(x=>x.setAttribute("aria-checked","false"));wtg.hidden=wph.hidden=true;
f.querySelector(".selv").textContent="Выберите услугу";f.querySelector("#svc").classList.remove("has");
f.style.height=f.getBoundingClientRect().height+"px";f.classList.add("leave");
setTimeout(()=>{f.classList.add("sent");f.insertAdjacentHTML("beforeend",`<div class="okv"><svg class="okc" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="35"/><path d="M25 41l11 11 20-23"/></svg><h3>Спасибо за заявку</h3><p>Скоро свяжемся с вами в ${sentWay}.</p></div>`);void f.offsetWidth;f.classList.add("show")},380)}
catch(_){btn.disabled=false;openTG(TG+"?text="+encodeURIComponent("Здравствуйте! Заявка с сайта.\n"+text))}});
f.querySelector(".agree input").addEventListener("change",()=>badAgree(false))})();
// выбор услуги в форме
(()=>{const w=document.getElementById("svc");if(!w)return;const b=w.querySelector(".selb"),m=w.querySelector(".selm"),v=w.querySelector(".selv"),h=w.querySelector("input[name=n]");
const set=o=>{b.setAttribute("aria-expanded",o);w.classList.toggle("open",o)};
b.onclick=()=>set(!w.classList.contains("open"));
m.addEventListener("click",e=>{const o=e.target.closest("button[data-v]");if(!o)return;h.value=o.dataset.v;v.textContent=o.dataset.v;w.classList.add("has");b.classList.remove("err");m.querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected",x===o));set(false)});
document.addEventListener("pointerdown",e=>{if(!w.contains(e.target))set(false)},{passive:true});
document.addEventListener("keydown",e=>{if(e.key==="Escape")set(false)})})();
// цели Метрики (работают, только если посетитель принял cookie)
const goal=n=>{try{window.ym&&window.ym(114110564,"reachGoal",n)}catch(e){}};
document.addEventListener("click",e=>{const a=e.target.closest("a,button");if(!a)return;
if(a.matches(".tg,[href*='t.me/']"))goal("tg_click");else if(a.matches("[href^='tel:']"))goal("tel_click");else if(a.closest(".wr"))goal("work_open");else if(a.id==="cBtn")goal("calc_send")});


// отклик на нажатие: волна и лёгкая вибрация
document.addEventListener("pointerdown",e=>{const t=e.target.closest(".pill,.seg button,.burger,.chip");if(!t)return;
const r=t.getBoundingClientRect(),s=Math.max(r.width,r.height)*2.2,i=document.createElement("i");i.className="rip";
i.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;t.append(i);setTimeout(()=>i.remove(),700);
try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}},{passive:true});

// хромированная звезда на телефоне и планшете: размер и место подбираются под свободную зону между шапкой и заголовком (чтобы не заходила на текст на низких экранах)
(()=>{const chr=document.querySelector(".chr"),h1=document.querySelector(".hero h1"),nav=document.getElementById("nav")||document.querySelector(".notch a"),hero=document.querySelector(".hero");if(!chr||!h1||!hero)return;
const fit=()=>{if(innerWidth>900){chr.removeAttribute("style");chr.classList.add("on");return}
const hr=hero.getBoundingClientRect(),pt=parseFloat(getComputedStyle(h1).paddingTop)||0,gap=14,topFree=(nav?nav.offsetHeight:58)+12+gap,botFree=h1.getBoundingClientRect().top-hr.top+pt-gap,free=botFree-topFree,size=Math.max(96,Math.min(innerWidth*.66,free));
chr.style.width=size+"px";chr.style.marginLeft=(-size/2)+"px";chr.style.top=(topFree+Math.max(0,(free-size)/2))+"px";chr.classList.add("on")};
fit();addEventListener("resize",fit);addEventListener("orientationchange",()=>setTimeout(fit,200));addEventListener("load",fit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit)})();

// скорость: анимации стоят, пока блок не на экране; на слабых устройствах включается лёгкий режим (класс lite)
(()=>{const root=document.documentElement;
if("IntersectionObserver"in window){const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle("off",!e.isIntersecting)),{rootMargin:"60px"});
document.querySelectorAll(".hero,.contact").forEach(e=>io.observe(e))}
if(!root.classList.contains("lite")&&!/[?&]nolite/.test(location.search)){setTimeout(()=>{let n=0,t0=0,last=0,bad=0;const f=t=>{if(!t0)t0=t;else{n++;if(t-last>40)bad++}last=t;if(t-t0<1500)requestAnimationFrame(f);else if(n>10&&((t-t0)/n>30||bad/n>.3))root.classList.add("lite")};requestAnimationFrame(f)},2500)}})();
// кнопки «Оставить заявку» в прайсе и переход со страниц услуг: сразу выбирают услугу в форме
(()=>{const NAMES={sajt:"Сайт",app:"Приложение в Telegram",ads:"Реклама",logo:"Логотип"};
const pick=n=>{const b=document.querySelector('#svc .selm button[data-v="'+n+'"]');if(b)b.click()};
document.addEventListener("click",e=>{const a=e.target.closest("a[data-svc]");if(a)pick(a.dataset.svc)});
try{const s=new URLSearchParams(location.search).get("s");if(s&&NAMES[s])pick(NAMES[s])}catch(_){}})();
