// Elite Contracting Service — full-screen menu
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  function setMenu(open) {
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.innerHTML = open ? '&#10005;' : '&#9776;';
  }
  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false);
  });
})();

// Elite — scroll reveal (progressive: content is visible if this never runs)
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var els = document.querySelectorAll('main section');
  if (!els.length) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  els.forEach(function (el) { el.classList.add('rv'); io.observe(el); });
})();

// Elite — before / during / after sequence viewer
(function () {
  document.querySelectorAll('.seqv').forEach(function (root) {
    var img = root.querySelector('.seqv-stage img');
    var cap = root.querySelector('.seqv-cap');
    var tabs = root.querySelectorAll('.seqv-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
        tab.setAttribute('aria-pressed', 'true');
        img.src = tab.getAttribute('data-src');
        img.alt = tab.getAttribute('data-cap');
        cap.textContent = tab.getAttribute('data-cap');
      });
    });
  });
})();
