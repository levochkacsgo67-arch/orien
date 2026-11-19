// страницы услуг: тихое появление блоков при прокрутке (без скрипта всё видно сразу)
(function(){
  var d=document.documentElement;
  if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  d.classList.add("js");
  document.addEventListener("DOMContentLoaded",function(){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px"});
    document.querySelectorAll(".rv").forEach(function(el){io.observe(el)});
  });
})();
