/* VERANDE — interactions */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- LOADER: 00 -> 100 ---------- */
  function loader() {
    var el = document.querySelector('[data-loader]');
    if (!el) return;
    var out = el.querySelector('[data-loader-count]');
    var bar = el.querySelector('[data-loader-bar]');
    var seen = false;
    try { seen = sessionStorage.getItem('vr_seen') === '1'; } catch (e) {}

    function finish() {
      el.classList.add('is-done');
      document.documentElement.style.overflow = '';
      setTimeout(function () { el.remove(); }, 1300);
      try { sessionStorage.setItem('vr_seen', '1'); } catch (e) {}
    }
    if (seen || reduce) { el.remove(); return; }

    document.documentElement.style.overflow = 'hidden';
    var n = 0, t0 = performance.now(), dur = 1500;
    (function tick(now) {
      var p = Math.min((now - t0) / dur, 1);
      n = Math.round((1 - Math.pow(1 - p, 3)) * 100);
      if (out) out.textContent = (n < 10 ? '0' : '') + n + '%';
      if (bar) bar.style.width = n + '%';
      if (p < 1) requestAnimationFrame(tick); else setTimeout(finish, 260);
    })(t0);
  }

  /* ---------- HEADER ---------- */
  function header() {
    var h = document.querySelector('[data-header]');
    if (!h) return;
    var hero = document.querySelector('[data-hero]');
    function upd() {
      var limit = hero ? hero.offsetHeight - 90 : 40;
      h.classList.toggle('is-solid', window.scrollY > limit);
    }
    upd();
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
  }

  /* ---------- HERO: rotate between background images slowly (mobile / <3-image fallback) ---------- */
  function heroSlides() {
    var wrap = document.querySelector('[data-hero-slides]');
    if (!wrap) return;
    var slides = wrap.querySelectorAll('.hero__slide');
    if (slides.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, 4600);
  }

  /* ---------- HERO SPLIT: desktop 3-up grid, all images visible, swapped together slowly ---------- */
  function heroSplit() {
    var split = document.querySelector('[data-hero-split]');
    if (!split || reduce) return;
    var slots = Array.prototype.slice.call(split.querySelectorAll('[data-slot]'));
    if (!slots.length) return;
    var states = slots.map(function (slot) {
      var imgs = Array.prototype.slice.call(slot.querySelectorAll('.hero__slot-img'));
      var current = 0;
      imgs.forEach(function (im, idx) { if (im.classList.contains('is-active')) current = idx; });
      return { imgs: imgs, current: current };
    });
    setInterval(function () {
      states.forEach(function (state) {
        var n = state.imgs.length;
        if (n < 2) return;
        state.imgs[state.current].classList.remove('is-active');
        state.current = (state.current + 1) % n;
        state.imgs[state.current].classList.add('is-active');
      });
    }, 4600);
  }

  /* ---------- PRODUCT CARDS: each card quietly cycles through its own model shots ---------- */
  function productSlides() {
    if (reduce) return;
    document.querySelectorAll('[data-card-slides]').forEach(function (group, gi) {
      var slides = group.querySelectorAll('.card__slide');
      if (slides.length < 2) return;
      var i = 0;
      setInterval(function () {
        slides[i].classList.remove('is-active');
        i = (i + 1) % slides.length;
        slides[i].classList.add('is-active');
      }, 2800 + (gi % 4) * 350);
    });
  }

  /* ---------- CAMPAIGN: slow background crossfade when more than one image is set ---------- */
  function campSlides() {
    var wrap = document.querySelector('[data-camp-slides]');
    if (!wrap) return;
    var slides = wrap.querySelectorAll('.camp__slide');
    if (slides.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove('is-active');
      i = (i + 1) % slides.length;
      slides[i].classList.add('is-active');
    }, 4200);
  }

  /* ---------- DRAG-SCROLL RAILS ---------- */
  function rails() {
    document.querySelectorAll('[data-rail]').forEach(function (r) {
      var down = false, sx = 0, sl = 0, moved = 0;
      r.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch') return;
        down = true; moved = 0; sx = e.clientX; sl = r.scrollLeft;
        r.setPointerCapture(e.pointerId);
      });
      r.addEventListener('pointermove', function (e) {
        if (!down) return;
        var d = e.clientX - sx;
        moved = Math.max(moved, Math.abs(d));
        if (moved > 6) r.classList.add('is-drag');
        r.scrollLeft = sl - d;
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
        r.addEventListener(ev, function () { down = false; r.classList.remove('is-drag'); });
      });
      r.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    });
  }

  /* ---------- AUTO-SCROLLING RAILS: continuous right-to-left slide ---------- */
  function railsAuto() {
    if (reduce) return;
    document.querySelectorAll('[data-rail-auto]').forEach(function (r) {
      var original = Array.prototype.slice.call(r.children);
      if (original.length < 2) return;
      original.forEach(function (n) { r.appendChild(n.cloneNode(true)); });

      var paused = false, resumeTimer = null, half = 0;
      function measure() { half = r.scrollWidth / 2; }
      measure();
      window.addEventListener('resize', measure);

      function pause() { paused = true; if (resumeTimer) clearTimeout(resumeTimer); }
      function resumeSoon() { if (resumeTimer) clearTimeout(resumeTimer); resumeTimer = setTimeout(function () { paused = false; }, 1400); }
      r.addEventListener('pointerenter', pause);
      r.addEventListener('pointerleave', resumeSoon);
      r.addEventListener('pointerdown', pause);
      r.addEventListener('pointerup', resumeSoon);

      function tick() {
        if (!paused && half > 0) {
          r.scrollLeft += 0.55;
          if (r.scrollLeft >= half) r.scrollLeft -= half;
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- REVEAL ---------- */
  function reveal() {
    var els = document.querySelectorAll('[data-rv]');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('is-in'); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var d = parseInt(en.target.getAttribute('data-rv'), 10) || 0;
        setTimeout(function () { en.target.classList.add('is-in'); }, d);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- MARQUEE: duplicate track for a seamless loop ---------- */
  function marquee() {
    document.querySelectorAll('[data-marquee]').forEach(function (t) {
      var item = t.firstElementChild;
      if (!item) return;
      var need = Math.ceil(window.innerWidth / Math.max(item.offsetWidth, 1)) + 1;
      for (var i = 0; i < need; i++) t.appendChild(item.cloneNode(true));
      var half = t.children.length;
      for (var j = 0; j < half; j++) t.appendChild(t.children[j].cloneNode(true));
    });
  }

  /* ---------- MOBILE NAV ---------- */
  function burger() {
    var b = document.querySelector('[data-burger]');
    var m = document.querySelector('[data-menu]');
    if (!b || !m) return;
    b.addEventListener('click', function () {
      var open = m.hasAttribute('hidden');
      if (open) { m.removeAttribute('hidden'); b.textContent = 'Close'; }
      else { m.setAttribute('hidden', ''); b.textContent = 'Menu'; }
      document.documentElement.style.overflow = open ? 'hidden' : '';
    });
  }


  /* ---------- PRODUCT: keep price in step with the chosen variant ---------- */
  function pdp() {
    var root = document.querySelector('[data-pdp]');
    if (!root) return;
    var out = root.querySelector('[data-pdp-price]');
    var cfg = {};
    try { cfg = JSON.parse((document.querySelector('[data-pdp-json]') || {}).textContent || '{}'); } catch (e) {}
    function fmt(cents) {
      var n = (cents / 100).toFixed(2);
      return cfg.style === 'technical' ? n + '_' + (cfg.iso || '') : n;
    }
    function set(el) {
      if (!el || !out) return;
      var c = el.getAttribute('data-price');
      if (c !== null && c !== '') out.textContent = fmt(parseInt(c, 10));
    }
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name !== 'id') return;
      set(t.tagName === 'SELECT' ? t.options[t.selectedIndex] : t);
    });
  }

  function init() { loader(); header(); heroSlides(); heroSplit(); productSlides(); campSlides(); rails(); railsAuto(); reveal(); marquee(); burger(); pdp(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
