/* Barra de progreso de scroll: respaldo para navegadores sin animation-timeline (Firefox).
   Si el navegador ya lo soporta en CSS, este script no hace nada. */
(function () {
  if (window.CSS && CSS.supports('animation-timeline', 'scroll()')) return;

  var root = document.documentElement;
  var ticking = false;

  function update() {
    var max = root.scrollHeight - root.clientHeight;
    var progress = max > 0 ? root.scrollTop / max : 0;
    root.style.setProperty('--scroll', Math.min(1, Math.max(0, progress)).toFixed(4));
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
