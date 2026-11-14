const TG="https://t.me/ceoorien",reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelectorAll(".tg").forEach(a=>{a.href=TG;a.target="_blank";a.rel="noopener"});
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
document.addEventListener("keydown",e=>{if(e.key==="Escape")set(false)})})();
// подсветка строки работ под курсором
document.querySelectorAll(".wr").forEach(r=>r.addEventListener("pointermove",e=>{const b=r.getBoundingClientRect();r.style.setProperty("--mx",(e.clientX-b.left)+"px")}));
// цены
const fmt=n=>n.toLocaleString("ru-RU").replace(/ | /g," ");
const PRICES=[
{acc:"сайт",name:"Сайт",price:6500,note:"Первая версия за 2 дня, до оплаты",inc:["Работы, цены, отзывы, кнопки связи","Удобно с телефона и компьютера","Неделя правок бесплатно","Свой адрес .ru на первый год, дальше 1 500 ₽ в год"]},
{acc:"приложение",name:"Приложение",price:12000,note:"Внутри Telegram",inc:["Запись, заявки или каталог","Открывается по ссылке из Telegram","Уведомления о каждой заявке","Кабинет со статистикой"]},
{acc:"рекламу",name:"Реклама",price:7000,note:"ВКонтакте и Яндекс",inc:["Картинки и тексты объявлений","Настройка и запуск","Отчёт: сколько стоила заявка","Дальше ведение - 5 000 ₽ в месяц, бюджет на рекламу отдельно"]},
{acc:"логотип",name:"Логотип",price:10000,note:"Знак и название, три варианта на выбор",inc:["Три разных идеи, из них доводим одну","Файлы для сайта, печати и соцсетей","Светлая и тёмная версии, аватарка","Два круга правок бесплатно"]}];
(()=>{if(!document.getElementById("seg"))return;const seg=document.getElementById("seg"),big=document.getElementById("pbig"),list=document.getElementById("plist");big.className=list.className="swap";let cur=-1;
const btns=PRICES.map((p,i)=>{const b=document.createElement("button");b.type="button";b.textContent=p.name;b.onclick=()=>show(i);seg.append(b);return b});
const paint=i=>{const p=PRICES[i];big.innerHTML=`<div class="n"><small>от</small>${fmt(p.price)}<span> ₽</span></div><p>${p.note}</p>`;
list.innerHTML=`<ul>${p.inc.map(x=>`<li>${x}</li>`).join("")}</ul><a class="pill dark" href="${TG}" target="_blank" rel="noopener">Обсудить ${p.acc} <span>→</span></a>`};
async function show(i){if(i===cur)return;const first=cur<0;cur=i;btns.forEach((b,k)=>{b.classList.toggle("on",k===i);b.setAttribute("aria-pressed",k===i)});
if(first||reduce)return paint(i);big.classList.add("hide");list.classList.add("hide");await new Promise(r=>setTimeout(r,160));paint(i);big.classList.remove("hide");list.classList.remove("hide")}
show(0)})();
// калькулятор
(()=>{if(!document.getElementById("chips"))return;const C=[{n:"Сайт",p:6500,on:1},{n:"Приложение в Telegram",p:12000},{n:"Запуск рекламы",p:7000,t:"без бюджета"},{n:"Логотип",p:10000},{n:"Карточки 2ГИС и Яндекс Карт",p:2000},{n:"Ведение рекламы",p:5000,m:1,t:"без бюджета"},{n:"Поддержка сайта",p:700,m:1,t:"до 3 правок"}];
const chips=document.getElementById("chips"),sum=document.getElementById("cSum"),mo=document.getElementById("cMo"),btn=document.getElementById("cBtn");let shown=0,raf=0;
C.forEach(c=>{const b=document.createElement("button");b.type="button";b.className="chip"+(c.on?" on":"");b.setAttribute("aria-pressed",!!c.on);
b.innerHTML=`${c.n}<small>${fmt(c.p)} ₽${c.m?" / мес":""}${c.t?" · "+c.t:""}</small>`;b.onclick=()=>{c.on=!c.on;b.classList.toggle("on",c.on);b.setAttribute("aria-pressed",c.on);paint()};chips.append(b)});
function paint(){const sel=C.filter(c=>c.on),once=sel.filter(c=>!c.m).reduce((a,c)=>a+c.p,0),m=sel.filter(c=>c.m).reduce((a,c)=>a+c.p,0);
const nosel=!sel.length,onlyM=sel.length&&!once;document.querySelector(".cn").hidden=nosel;document.querySelector(".cn span:first-child").style.display=onlyM?"none":"";document.querySelector(".cn span:last-child").textContent=onlyM?" ₽ в месяц":" ₽";mo.textContent=nosel?"Отметьте хотя бы одну услугу":(onlyM?"":(m?`+ ${fmt(m)} ₽ в месяц`:""));
btn.setAttribute("aria-disabled",!sel.length);if(!sel.length)btn.tabIndex=-1;else btn.removeAttribute("tabindex");
btn.href=!sel.length?"#price":TG+"?text="+encodeURIComponent(`Здравствуйте! Посчитал на сайте ORIEN:\n${sel.map(c=>"- "+c.n).join("\n")}\nИтого от ${fmt(once)} ₽${m?` + ${fmt(m)} ₽/мес`:""}`);
cancelAnimationFrame(raf);const from=shown,t0=performance.now(),d=reduce?1:700;
const tgt=once||m;const tick=t=>{const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);shown=Math.round(from+(tgt-from)*e);sum.textContent=fmt(shown);if(k<1)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)}
paint()})();
// заявка: ничего не уходит на сервер, открывается Telegram с готовым текстом
document.getElementById("lead")&&document.getElementById("lead").addEventListener("submit",e=>{e.preventDefault();const f=e.target,n=f.n.value.trim(),l=f.l.value.trim();
if(!n){f.n.value="";f.n.focus();return}
window.open(TG+"?text="+encodeURIComponent(`Здравствуйте! Хочу сайт.\nНазвание: ${n}${l?"\nКарточка: "+l:""}`),"_blank","noopener")});
// цели Метрики (работают, только если посетитель принял cookie)
const goal=n=>{try{window.ym&&window.ym(114110564,"reachGoal",n)}catch(e){}};
document.addEventListener("click",e=>{const a=e.target.closest("a,button");if(!a)return;
if(a.matches(".tg,[href*='t.me/']"))goal("tg_click");else if(a.matches("[href^='tel:']"))goal("tel_click");else if(a.closest(".wr"))goal("work_open");else if(a.id==="cBtn")goal("calc_send")});
document.getElementById("lead")&&document.getElementById("lead").addEventListener("submit",()=>goal("lead_submit"));
