/* Vinárna Janská — interakce
   1) burger menu
   2) postupný náběh stolů v půdorysu (signature prvek v heru)
   3) jemné odhalení sekcí při scrollu
   4) lightbox — fotky na celou obrazovku (klik, šipky, ESC)
*/
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1) burger ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        close();
        burger.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || burger.contains(e.target)) return;
      close();
    });
  }

  function close() {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Otevřít menu');
  }

  /* ---------- 2) půdorys sálu ---------- */
  // Stoly a židle nabíhají postupně, ne najednou.
  var layout = document.querySelector('#plan .plan-layout');
  if (layout) {
    for (var i = 0; i < layout.children.length; i++) {
      layout.children[i].style.transitionDelay = reduce ? '0ms' : (i * 11) + 'ms';
    }
  }

  /* ---------- 3) odhalení sekcí ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    // Skrýváme jen to, co je při načtení pod okrajem okna. Kdo přijde rovnou
    // na kotvu (#vina, #cenik...), vidí cílovou sekci hned.
    var fold = window.innerHeight * 0.92;
    document
      .querySelectorAll('.sec-head, .gal, .specs, .occ, .price, .incl, .steps, .card-grid, .faq')
      .forEach(function (el) {
        if (el.getBoundingClientRect().top < fold) return;
        el.classList.add('reveal');
        io.observe(el);
      });
  }

  /* ---------- 4) lightbox ---------- */
  var lb = document.getElementById('lb');
  var shots = [].slice.call(document.querySelectorAll('.shot'));

  if (lb && shots.length) {
    var lbImg = document.getElementById('lb-img');
    var lbCap = document.getElementById('lb-cap');
    var lbCount = document.getElementById('lb-count');
    var index = 0;
    var opener = null;

    // Popisek bereme z <figcaption>, jinak z alt textu fotky.
    function captionOf(shot) {
      var fig = shot.closest('figure');
      var cap = fig && fig.querySelector('figcaption');
      return cap ? cap.textContent.trim() : shot.querySelector('img').alt;
    }

    function show(i) {
      index = (i + shots.length) % shots.length;
      var img = shots[index].querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = captionOf(shots[index]);
      lbCount.textContent = (index + 1) + ' / ' + shots.length;
    }

    function open(i, trigger) {
      opener = trigger;
      show(i);
      lb.hidden = false;
      document.body.classList.add('lb-locked');
      // Vynutíme přepočet, aby se přechod na .is-open opravdu odehrál.
      void lb.offsetWidth;
      lb.classList.add('is-open');
      lb.querySelector('.lb-close').focus();
    }

    function hide() {
      lb.classList.remove('is-open');
      document.body.classList.remove('lb-locked');
      var done = function () {
        lb.hidden = true;
        lbImg.removeAttribute('src');
      };
      if (reduce) done(); else setTimeout(done, 250);
      if (opener) opener.focus();
      opener = null;
    }

    shots.forEach(function (shot, i) {
      shot.addEventListener('click', function () { open(i, shot); });
    });

    lb.addEventListener('click', function (e) {
      var act = e.target.closest('[data-lb]');
      if (act) {
        var what = act.dataset.lb;
        if (what === 'close') hide();
        if (what === 'prev') show(index - 1);
        if (what === 'next') show(index + 1);
        return;
      }
      // klik mimo fotku zavírá
      if (!e.target.closest('.lb-fig') || e.target === lbImg.parentElement) hide();
    });

    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') hide();
      else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
      else if (e.key === 'Tab') {
        // fokus drží uvnitř dialogu, dokud je otevřený
        var f = lb.querySelectorAll('button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- rok v patičce ---------- */
  var rok = document.getElementById('rok');
  if (rok) rok.textContent = new Date().getFullYear();
})();
