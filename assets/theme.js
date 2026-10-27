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

  /* ---------- CUSTOMER LOGIN: auto-open the "Forgot password" panel Shopify redirects back to (added) ---------- */
  function recoverPassword() {
    var d = document.getElementById('recover');
    if (!d || window.location.hash !== '#recover') return;
    d.setAttribute('open', '');
    d.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
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

  /* ---------- PRODUCT PREVIEWS: click a small thumb to open it in a lightbox (added) ---------- */
  function pdpLightbox() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-preview-trigger]'));
    var box = document.querySelector('[data-lightbox]');
    if (!triggers.length || !box) return;
    var img = box.querySelector('[data-lightbox-img]');
    var prevBtn = box.querySelector('[data-lightbox-prev]');
    var nextBtn = box.querySelector('[data-lightbox-next]');
    var closers = box.querySelectorAll('[data-lightbox-close]');
    var idx = 0;

    function show(i) {
      idx = (i + triggers.length) % triggers.length;
      var t = triggers[idx];
      img.setAttribute('src', t.getAttribute('data-preview-src'));
      img.setAttribute('alt', t.getAttribute('data-preview-alt') || '');
      triggers.forEach(function (x) { x.classList.remove('is-active'); });
      t.classList.add('is-active');
    }
    function open(i) {
      show(i);
      box.removeAttribute('hidden');
      document.documentElement.style.overflow = 'hidden';
    }
    function close() {
      box.setAttribute('hidden', '');
      document.documentElement.style.overflow = '';
    }

    triggers.forEach(function (t, i) {
      t.addEventListener('click', function () { open(i); });
    });
    closers.forEach(function (c) { c.addEventListener('click', close); });
    if (prevBtn) prevBtn.addEventListener('click', function () { show(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { show(idx + 1); });
    document.addEventListener('keydown', function (e) {
      if (box.hasAttribute('hidden')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- CART COUNT: keep every bag indicator on the page in sync (added) ---------- */
  function refreshCartCount() {
    fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = cart.item_count; });
        document.querySelectorAll('[data-cart-badge]').forEach(function (el) {
          el.textContent = cart.item_count;
          el.hidden = cart.item_count === 0;
        });
      })
      .catch(function () {});
  }

  /* ---------- QUICK ADD: pick a size on a product card, add it to the bag without leaving the page (added) ---------- */
  function quickAdd() {
    document.querySelectorAll('[data-quick-add]').forEach(function (card) {
      var btn = card.querySelector('[data-quick-add-btn]');
      var sizeBtns = Array.prototype.slice.call(card.querySelectorAll('[data-qa-size]'));
      if (!btn || !sizeBtns.length) return;
      var selected = null;
      var idleLabel = btn.getAttribute('data-label-add') || '+ Quick add';

      function pick(b) {
        if (!b || b.disabled) return;
        sizeBtns.forEach(function (x) { x.classList.remove('is-selected'); });
        b.classList.add('is-selected');
        selected = b;
      }
      sizeBtns.forEach(function (b) {
        if (!b.disabled && !selected) pick(b);
        b.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          pick(b);
        });
      });

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!selected || selected.disabled || btn.classList.contains('is-loading')) return;
        var variantId = selected.getAttribute('data-variant-id');
        btn.classList.add('is-loading');
        btn.classList.remove('is-done');
        btn.textContent = 'Adding…';
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: 1 })
        })
          .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
          .then(function (res) {
            btn.classList.remove('is-loading');
            if (!res.ok) throw new Error((res.data && res.data.description) || 'Could not add to bag');
            btn.classList.add('is-done');
            btn.textContent = 'Added ✓';
            refreshCartCount();
            setTimeout(function () {
              btn.classList.remove('is-done');
              btn.textContent = idleLabel;
            }, 1800);
          })
          .catch(function () {
            btn.classList.remove('is-loading');
            btn.textContent = 'Sold out';
            setTimeout(function () { btn.textContent = idleLabel; }, 1800);
          });
      });
    });
  }

  /* ---------- CART PAGE: quantity +/- and remove, updated in place (added) ---------- */
  function cartQuantity() {
    var root = document.querySelector('[data-cart]');
    if (!root) return;
    var sectionId = root.getAttribute('data-section-id') || 'main';
    var busy = false;

    function apply(key, quantity) {
      if (busy) return;
      busy = true;
      root.classList.add('is-busy');
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity })
      })
        .then(function () { return fetch('/cart?section_id=' + sectionId); })
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var fresh = doc.querySelector('[data-cart]');
          if (fresh && root.parentNode) {
            root.parentNode.replaceChild(fresh, root);
            refreshCartCount();
            cartQuantity();
          } else {
            root.classList.remove('is-busy');
          }
        })
        .catch(function () { root.classList.remove('is-busy'); })
        .then(function () { busy = false; });
    }

    root.addEventListener('click', function (e) {
      var row = e.target.closest('[data-cart-row]');
      if (!row) return;
      var key = row.getAttribute('data-key');
      if (e.target.closest('[data-cart-remove]')) { e.preventDefault(); apply(key, 0); return; }
      var up = e.target.closest('[data-qty-up]');
      var down = e.target.closest('[data-qty-down]');
      if (!up && !down) return;
      e.preventDefault();
      var valEl = row.querySelector('[data-qty-value]');
      var current = parseInt(valEl.textContent, 10) || 1;
      apply(key, up ? current + 1 : Math.max(0, current - 1));
    });
  }

  /* ---------- PRODUCT: keep price (and low-stock note) in step with the chosen variant ---------- */
  function pdp() {
    var root = document.querySelector('[data-pdp]');
    if (!root) return;
    var out = root.querySelector('[data-pdp-price]');
    var stockOut = root.querySelector('[data-pdp-stock]');
    var cfg = {};
    try { cfg = JSON.parse((document.querySelector('[data-pdp-json]') || {}).textContent || '{}'); } catch (e) {}
    function fmt(cents) {
      var n = (cents / 100).toFixed(2);
      return cfg.style === 'technical' ? n + '_' + (cfg.iso || '') : n;
    }
    function set(el) {
      if (!el) return;
      var c = el.getAttribute('data-price');
      if (out && c !== null && c !== '') out.textContent = fmt(parseInt(c, 10));
      if (!stockOut) return;
      var tracked = el.getAttribute('data-tracked') === '1';
      var qty = parseInt(el.getAttribute('data-stock'), 10);
      if (tracked && !isNaN(qty) && qty > 0 && qty <= 5) {
        stockOut.textContent = qty === 1 ? 'Only 1 left' : 'Only ' + qty + ' left';
        stockOut.hidden = false;
      } else {
        stockOut.textContent = '';
        stockOut.hidden = true;
      }
    }
    var checked = root.querySelector('input[name="id"]:checked, select[name="id"]');
    if (checked) set(checked.tagName === 'SELECT' ? checked.options[checked.selectedIndex] : checked);
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name !== 'id') return;
      set(t.tagName === 'SELECT' ? t.options[t.selectedIndex] : t);
    });
  }

  function init() { loader(); header(); heroSlides(); heroSplit(); productSlides(); campSlides(); rails(); railsAuto(); reveal(); marquee(); burger(); pdp(); pdpLightbox(); recoverPassword(); quickAdd(); cartQuantity(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
