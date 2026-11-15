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
