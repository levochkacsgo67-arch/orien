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
(()=>{const n=document.getElementById("nav"),b=document.getElementById("burger");
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
{acc:"сайт",xt:[{t:"Поддержка сайта",d:"Мелкие правки на сайте, до 3 обращений в месяц",p:"700&nbsp;₽",m:"в месяц"},{t:"Оформление карточек в 2ГИС и Яндекс Картах",d:"Фото, описание, часы работы: вас проще найти и выбрать",p:"2&nbsp;000&nbsp;₽"}],name:"Сайт",price:6500,note:"Первая версия через 2 дня, оплата после согласования",
 inc:["Сайт с вашими услугами, примерами работ, отзывами и кнопками связи","Удобно открывается и на телефоне, и на компьютере","Правки до тех пор, пока вы не утвердите результат","Адрес сайта в интернете (.ru): первый год включён, далее 1&nbsp;500&nbsp;₽ в год"],
 get:[],
 ex:{label:"Кузовной 25",kind:"ph",img:["kuzov-1.jpg","kuzov-2.jpg","kuzov-3.jpg"]}},
{acc:"приложение в Telegram",xt:[{t:"Оформление карточек в 2ГИС и Яндекс Картах",d:"Фото, описание, часы работы: вас проще найти и выбрать",p:"2&nbsp;000&nbsp;₽"}],name:"Приложение в Telegram",price:12000,note:"Открывается прямо в Telegram, установка не нужна",
 inc:["Онлайн-запись, приём заявок и каталог товаров","Уведомления в Telegram: клиенту о записи, вам о каждой новой заявке"],
 get:["Личный кабинет: сколько заявок и записей пришло"],
 ex:{label:"Запись к мастеру · FITMENT",kind:"ph",img:["nastya-1.jpg","nastya-2.jpg","nastya-3.jpg","fit-1.jpg","fit-2.jpg","fit-3.jpg"]}},
{acc:"рекламу",xt:[{t:"Присмотр за рекламой после запуска",d:"Каждый месяц проверка: какая реклама приносит заявки, а какая тратит деньги впустую. Слабую правим",p:"5&nbsp;000&nbsp;₽",m:"в месяц"},{t:"Оформление карточек в 2ГИС и Яндекс Картах",d:"Фото, описание, часы работы: вас проще найти и выбрать",p:"2&nbsp;000&nbsp;₽"}],name:"Реклама",price:7000,note:"Деньги на показ рекламы оплачиваются отдельно",
 inc:["Картинки и короткие тексты для рекламы","Выбор, кому показывать рекламу: город, возраст, интересы","Запуск рекламы во ВКонтакте и в Яндексе"],
 get:["В рекламе можно сразу написать вам или позвонить","Понятный расчёт: сколько стоит одна заявка"],
 ex:{label:"Реклама для Кузовного 25",kind:"ad",img:["ad-1.jpg","ad-2.jpg","ad-3.jpg","ad-4.jpg"]}},
{acc:"логотип",xt:[],name:"Логотип",price:10000,note:"Знак и фирменный стиль",
 inc:["Три варианта логотипа на выбор и доработка выбранного","Правки до утверждения результата"],
 get:["Логотип в светлой и тёмной версиях","Памятка по стилю: фирменные цвета, шрифты и правила, как использовать логотип"],
 ex:{label:"Smart PDR и ORIEN",kind:"ph",img:["spdr-1.jpg","spdr-2.jpg","spdr-3.jpg","orien-1.jpg","orien-2.jpg","orien-3.jpg"]}}];
(()=>{const seg=document.getElementById("seg");if(!seg)return;const big=document.getElementById("pbig"),list=document.getElementById("plist"),ex=document.getElementById("pex");
[big,list,ex].forEach(e=>e.classList.add("swap"));let cur=-1;
const btns=PRICES.map((p,i)=>{const b=document.createElement("button");b.type="button";b.textContent=p.name;b.onclick=()=>show(i);seg.append(b);return b});
const xt=document.getElementById("pxtra");if(xt)xt.classList.add("swap");
const paint=i=>{const p=PRICES[i];
if(xt)xt.hidden=!p.xt.length;
if(xt)xt.innerHTML=`<em class="pt">Дополнительно к услуге «${p.name}»</em><div class="xg">${p.xt.map(x=>`<a class="xc" href="${TG}?text=${encodeURIComponent("Здравствуйте! Интересует «"+p.name+"» и дополнительно: "+x.t)}" target="_blank" rel="noopener"><b>${x.t}</b><span>${x.d}</span><i><u>${x.p}</u>${x.m?`<s>${x.m}</s>`:""}<em>+</em></i></a>`).join("")}</div>`;
big.innerHTML=`<em class="pt">Стоимость</em><div class="n"><small>от</small>${fmt(p.price)}<span> ₽</span></div><p>${p.note}</p><a class="pill dark" href="${TG}?text=${encodeURIComponent("Здравствуйте! Хочу обсудить "+({"сайт":"создание сайта","приложение в Telegram":"приложение в Telegram","рекламу":"рекламу","логотип":"разработку логотипа"}[p.acc]||p.acc)+".")}" target="_blank" rel="noopener">${({"сайт":"Обсудить сайт","приложение в Telegram":"Обсудить приложение","рекламу":"Обсудить рекламу","логотип":"Обсудить логотип"}[p.acc]||"Обсудить "+p.acc)} <span>→</span></a>`;
list.innerHTML=`<em class="pt">Входит</em><ul>${p.inc.map(x=>`<li>${x}</li>`).join("")}</ul>${p.get.length?`<em class="pt">Вы получаете</em><ul>${p.get.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}`;
const base=p.ex.img,rep=Math.ceil(10/base.length),half=Array.from({length:rep},()=>base).flat();
const it=half.map(n=>`<img class="${p.ex.kind}" src="${W(n)}?v=5" alt="" decoding="async" draggable="false">`).join("");
ex.innerHTML=`<em class="pt">Примеры работ</em><div class="exw"><div class="track" >${it}${it}</div></div>${p.ex.label?`<span class="exl"><i></i>${p.ex.label}</span>`:""}`;const tr=ex.querySelector(".track");if(tr)tr.style.setProperty("--dur",(tr.scrollWidth/2/SPEED)+"s")};
async function show(i){if(i===cur)return;const first=cur<0;cur=i;btns.forEach((b,k)=>{b.classList.toggle("on",k===i);b.setAttribute("aria-pressed",k===i)});
if(first||reduce)return paint(i);[big,list,ex,xt].forEach(e=>e&&e.classList.add("hide"));await new Promise(r=>setTimeout(r,180));paint(i);[big,list,ex,xt].forEach(e=>e&&e.classList.remove("hide"))}
show(0);const pre=()=>PRICES.forEach(p=>p.ex.img.forEach(n=>{const i=new Image();i.src=W(n)+"?v=5"}));"requestIdleCallback"in window?requestIdleCallback(pre):setTimeout(pre,300)})();
// калькулятор
(()=>{if(!document.getElementById("chips"))return;const C=[{n:"Сайт",p:6500,on:1},{n:"Приложение в Telegram",p:12000},{n:"Запуск рекламных кампаний",p:7000,t:"без бюджета"},{n:"Логотип",p:10000},{n:"Оформление карточек в 2ГИС и Яндекс Картах",p:2000},{n:"Ведение рекламных кампаний",p:5000,m:1,t:"без бюджета"},{n:"Техническая поддержка сайта",p:700,m:1,t:"до 3 правок"}];
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
document.getElementById("lead")&&document.getElementById("lead").addEventListener("submit",e=>{e.preventDefault();const f=e.target,n=f.n.value.trim(),l=f.l.value.trim();
if(!n){const sb=document.querySelector("#svc .selb");sb.classList.add("err");sb.click();return}
openTG(TG+"?text="+encodeURIComponent(`Здравствуйте! Интересует: ${n}.${l?"\nКомментарий: "+l:""}`))});
// выбор услуги в форме
(()=>{const w=document.getElementById("svc");if(!w)return;const b=w.querySelector(".selb"),m=w.querySelector(".selm"),v=w.querySelector(".selv"),h=w.querySelector("input[name=n]");
const set=o=>{m.hidden=!o;b.setAttribute("aria-expanded",o);w.classList.toggle("open",o);};
b.onclick=()=>set(m.hidden);
m.addEventListener("click",e=>{const o=e.target.closest("button[data-v]");if(!o)return;h.value=o.dataset.v;v.textContent=o.dataset.v;w.classList.add("has");b.classList.remove("err");m.querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected",x===o));set(false)});
document.addEventListener("pointerdown",e=>{if(!w.contains(e.target))set(false)},{passive:true});
document.addEventListener("keydown",e=>{if(e.key==="Escape")set(false)})})();
// цели Метрики (работают, только если посетитель принял cookie)
const goal=n=>{try{window.ym&&window.ym(114110564,"reachGoal",n)}catch(e){}};
document.addEventListener("click",e=>{const a=e.target.closest("a,button");if(!a)return;
if(a.matches(".tg,[href*='t.me/']"))goal("tg_click");else if(a.matches("[href^='tel:']"))goal("tel_click");else if(a.closest(".wr"))goal("work_open");else if(a.id==="cBtn")goal("calc_send")});
document.getElementById("lead")&&document.getElementById("lead").addEventListener("submit",()=>goal("lead_submit"));

// отклик на нажатие: волна и лёгкая вибрация
document.addEventListener("pointerdown",e=>{const t=e.target.closest(".pill,.seg button,.xc,.burger,.chip");if(!t)return;
const r=t.getBoundingClientRect(),s=Math.max(r.width,r.height)*2.2,i=document.createElement("i");i.className="rip";
i.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;t.append(i);setTimeout(()=>i.remove(),700);
try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}},{passive:true});
