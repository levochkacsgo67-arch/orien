/* без приближения щипком и без сдвига вбок (как в приложении Насти) */
["gesturestart","gesturechange","gestureend"].forEach(function(n){document.addEventListener(n,function(e){e.preventDefault()})});
document.addEventListener("touchmove",function(e){if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});
/* при обновлении страницы всегда начинаем с главного экрана (без прыжка к прайсу или контактам) */
(function(){var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];
var reload=n?n.type==="reload":(performance.navigation&&performance.navigation.type===1);
if(!reload)return;
try{history.scrollRestoration="manual"}catch(e){}
if(location.hash){try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}}
function top(){try{scrollTo({top:0,left:0,behavior:"instant"})}catch(e){scrollTo(0,0)}}
top();addEventListener("DOMContentLoaded",top);
addEventListener("load",function(){top();setTimeout(top,60);setTimeout(top,300)});
addEventListener("pageshow",function(e){if(e.persisted)top()})})();

/* шрифты: пока свои шрифты не загрузились, страницу не показываем (иначе на секунду мелькает тонкий запасной шрифт). Страховка 3с, чтобы страница не осталась пустой */
(function(){var d=document.documentElement,done=false;d.classList.add("fl");
function go(){if(done)return;done=true;d.classList.remove("fl")}
setTimeout(go,3000);
addEventListener("DOMContentLoaded",function(){
if(!document.fonts||!document.fonts.load){go();return}
Promise.all([document.fonts.load("800 40px UB","Сайт Aa"),document.fonts.load("400 18px GL","Аа Aa"),document.fonts.load("600 18px GL","Аа Aa")]).then(go,go)})})();

/* лёгкий режим для слабых устройств (мало ядер или памяти, экономия трафика, «уменьшить движение», ?lite): без размытий, смешивания слоёв и вечных анимаций */
(function(){var d=document.documentElement,n=navigator,c=n.connection||{};
var low=(n.deviceMemory&&n.deviceMemory<=4)||(n.hardwareConcurrency&&n.hardwareConcurrency<=4)||c.saveData||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)||/[?&]lite/.test(location.search);
if(low&&!/[?&]nolite/.test(location.search))d.classList.add("lite")})();
