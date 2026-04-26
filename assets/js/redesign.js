;(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
   * 1. CONTINUOUS SCROLL
   * Override main.js SPA behaviour: make all sections always visible,
   * intercept nav clicks in capture phase so smooth-scroll wins.
   * ───────────────────────────────────────────────────────────── */
  function initContinuousScroll() {
    // Force all sections visible immediately (override main.js SPA tab switching)
    document.querySelectorAll('section').forEach(function (s) {
      s.classList.add('section-show');
    });

    // Remove any stale spacer/sentinel from a previous session
    ['header-flow-spacer', 'header-scroll-sentinel'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });

    // The new sticky nav (#site-nav) lives OUTSIDE #container at the top of the
    // page. It is always 60px, position:sticky — no height changes, no layout
    // shifts. We only add a .scrolled class (frosted glass) when the hero scrolls
    // out of view, and remove it when the hero re-enters.
    var siteNav = document.getElementById('site-nav');
    var header  = document.getElementById('header');

    if (siteNav && header && window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        siteNav.classList.toggle('scrolled', !entries[0].isIntersecting);
      }, { threshold: 0.05 }).observe(header);
    }

    // Active nav state — targets both #site-nav and the legacy .nav-menu.
    var navSections = ['header', 'about', 'now', 'resume', 'projects'].map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);
    var navOrder = navSections.map(function (s) { return s.id; });

    // scrollIntent: set on a nav-link click; prevents the active indicator from
    // jumping backward while the smooth-scroll animation plays out.
    var scrollIntent    = null;
    var scrollEndTimer  = null;

    function setActiveNav(id) {
      document.querySelectorAll('#site-nav .site-nav-links li, .nav-menu li, .mobile-nav li').forEach(function (li) {
        var a = li.querySelector('a[href^="#"]');
        if (!a) return;
        li.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    }

    function updateActiveNav() {
      var threshold = 120;
      var activeId = navSections[0] && navSections[0].id;
      navSections.forEach(function (s) {
        if (s.getBoundingClientRect().top <= threshold) activeId = s.id;
      });
      var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (atBottom && navSections.length) activeId = navSections[navSections.length - 1].id;

      // While navigating toward a click target, don't let the indicator slip back
      // to an earlier section mid-scroll.
      if (scrollIntent) {
        var intentIdx = navOrder.indexOf(scrollIntent);
        if (navOrder.indexOf(activeId) < intentIdx) activeId = scrollIntent;
        if (activeId === scrollIntent) scrollIntent = null;
      }

      setActiveNav(activeId);
    }

    // After any scroll settles (~150 ms idle), clear the intent lock so that
    // manual scrolling against the direction always wins.
    window.addEventListener('scroll', function () {
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(function () {
        scrollIntent = null;
        updateActiveNav();
      }, 150);
    }, { passive: true });

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // Close the mobile-nav drawer injected by main.js (replaces its jQuery handler
    // which never fires because we stopPropagation in capture phase below).
    function closeMobileNav() {
      if (!document.body.classList.contains('mobile-nav-active')) return;
      document.body.classList.remove('mobile-nav-active');
      var icon = document.querySelector('.mobile-nav-toggle i');
      if (icon) {
        icon.classList.remove('icofont-close');
        icon.classList.add('icofont-navigation-menu');
      }
      var overly = document.querySelector('.mobile-nav-overly');
      if (overly) overly.style.display = 'none';
    }

    // Intercept ALL anchor clicks in CAPTURE phase (fires before jQuery).
    // Offset = 64px to clear the sticky #site-nav (60px) + 4px breathing room.
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href === '#') return;

      if (href === '#header') {
        e.preventDefault();
        e.stopPropagation();
        closeMobileNav();
        scrollIntent = 'header';
        setActiveNav('header');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      e.stopPropagation();
      closeMobileNav();

      scrollIntent = target.id;
      setActiveNav(target.id);

      var offset = 64;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, true); // ← capture phase
  }

  /* ─────────────────────────────────────────────────────────────
   * 2. SCROLL-REVEAL
   * Add .reveal-ready so CSS can start at opacity:0, then
   * IntersectionObserver adds .revealed when in view.
   * ───────────────────────────────────────────────────────────── */
  function initScrollReveal() {
    if (!window.IntersectionObserver) return;
    var els = document.querySelectorAll('.reveal');
    els.forEach(function (el) { el.classList.add('reveal-ready'); });

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ─────────────────────────────────────────────────────────────
   * 3. SECTION PROGRESS DOTS
   * ───────────────────────────────────────────────────────────── */
  function initSectionDots() {
    var container = document.getElementById('section-dots');
    if (!container) return;

    var defs = [
      { id: 'header',   label: 'Home' },
      { id: 'about',    label: 'About' },
      { id: 'now',      label: 'Now' },
      { id: 'resume',   label: 'Resume' },
      { id: 'projects', label: 'Projects' },
    ];

    var dots = defs.map(function (d) {
      var el = document.getElementById(d.id);
      if (!el) return null;
      var btn = document.createElement('button');
      btn.className = 'section-dot';
      btn.setAttribute('data-label', d.label);
      btn.setAttribute('aria-label', 'Go to ' + d.label);
      btn.addEventListener('click', function () {
        dots.forEach(function (dot) { dot.btn.classList.toggle('active', dot.el === el); });
        if (d.id === 'header') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
        var top = el.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
      container.appendChild(btn);
      return { btn: btn, el: el };
    }).filter(Boolean);

    function update() {
      var active = dots[0];
      dots.forEach(function (d) {
        if (d.el.getBoundingClientRect().top <= 120) active = d;
      });
      var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (atBottom && dots.length) active = dots[dots.length - 1];
      dots.forEach(function (d) { d.btn.classList.toggle('active', d === active); });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ─────────────────────────────────────────────────────────────
   * 4. STAT COUNTER ANIMATION
   * Counts up when the tile scrolls into view.
   * ───────────────────────────────────────────────────────────── */
  function initStatCounters() {
    var tiles = document.querySelectorAll('.stat-tile[data-count]');
    if (!tiles.length || !window.IntersectionObserver) return;

    function animate(numEl, target, suffix) {
      var duration = 1400;
      var t0 = performance.now();
      (function step(now) {
        var p = Math.min((now - t0) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        numEl.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var tile = entry.target;
        var numEl = tile.querySelector('.stat-num');
        if (numEl) animate(numEl, parseInt(tile.dataset.count, 10), tile.dataset.suffix || '');
        obs.unobserve(tile);
      });
    }, { threshold: 0.6 });

    tiles.forEach(function (t) { io.observe(t); });
  }

  /* ─────────────────────────────────────────────────────────────
   * 5. SKILL TAG FILTER
   * ───────────────────────────────────────────────────────────── */
  function initSkillFilter() {
    var btns = document.querySelectorAll('.skill-filter-btn');
    var tags = document.querySelectorAll('.skill-tag[data-cat]');
    if (!btns.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.dataset.cat;
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        tags.forEach(function (tag) {
          tag.hidden = cat !== 'all' && tag.dataset.cat !== cat;
        });
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * 6. COPY EMAIL
   * ───────────────────────────────────────────────────────────── */
  var EMAIL = 'siddhantjm@pm.me';

  function showToast(msg) {
    var toast = document.getElementById('copy-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2400);
  }

  function copyEmail() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(
        function () { showToast('✓ Copied: ' + EMAIL); },
        function () { showToast(EMAIL); }
      );
    } else {
      showToast(EMAIL);
    }
  }

  function initCopyEmail() {
    document.querySelectorAll('.copy-email').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        copyEmail();
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * 7. COMMAND PALETTE  (⌘K / Ctrl+K)
   * ───────────────────────────────────────────────────────────── */
  function initCommandPalette() {
    var overlay = document.getElementById('cmd-overlay');
    var input   = document.getElementById('cmd-input');
    var list    = document.getElementById('cmd-list');
    var empty   = document.getElementById('cmd-empty');
    if (!overlay || !input) return;

    function goTo(hash) {
      close();
      if (hash === '#header') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      var el = document.querySelector(hash);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
    }

    var ALL_CMDS = [
      { label: 'Go to Home',       icon: 'ri-home-4-line',    fn: function () { goTo('#header'); } },
      { label: 'Go to About',      icon: 'ri-user-3-line',    fn: function () { goTo('#about'); } },
      { label: 'Go to Now',        icon: 'ri-time-line',      fn: function () { goTo('#now'); } },
      { label: 'Go to Resume',     icon: 'ri-file-list-3-line', fn: function () { goTo('#resume'); } },
      { label: 'Go to Projects',   icon: 'ri-code-box-line',  fn: function () { goTo('#projects'); } },
      { label: 'Copy email',       icon: 'ri-mail-line',      fn: function () { copyEmail(); close(); } },
      { label: 'Open GitHub',      icon: 'ri-github-line',    fn: function () { window.open('https://tinyurl.com/42feccjf', '_blank'); close(); }, arrow: true },
      { label: 'Open LinkedIn',    icon: 'ri-linkedin-line',  fn: function () { window.open('https://tinyurl.com/4s523ddc', '_blank'); close(); }, arrow: true },
      { label: 'Open X / Twitter', icon: 'ri-twitter-x-line', fn: function () { window.open('https://tinyurl.com/5ff2u4f6', '_blank'); close(); }, arrow: true },
      { label: 'Toggle theme',     icon: 'ri-contrast-2-line',fn: function () { var t = document.querySelector('.toggle-theme'); if (t) t.click(); close(); } },
    ];

    var filtered = ALL_CMDS.slice();
    var focused  = -1;

    function render() {
      list.innerHTML = '';
      empty.style.display = filtered.length ? 'none' : 'block';
      filtered.forEach(function (cmd, i) {
        var li = document.createElement('li');
        li.className = 'cmd-item';
        li.innerHTML =
          '<i class="' + cmd.icon + '"></i>' +
          '<span>' + cmd.label + '</span>' +
          (cmd.arrow ? '<span class="cmd-arrow ri-arrow-right-up-line"></span>' : '');
        li.addEventListener('mouseenter', function () { setFocus(i); });
        li.addEventListener('click', function () { cmd.fn(); });
        list.appendChild(li);
      });
      setFocus(-1);
    }

    function setFocus(i) {
      focused = i;
      list.querySelectorAll('.cmd-item').forEach(function (li, idx) {
        li.classList.toggle('cmd-focused', idx === i);
        if (idx === i) li.scrollIntoView({ block: 'nearest' });
      });
    }

    function open() {
      overlay.classList.add('open');
      input.value = '';
      filtered = ALL_CMDS.slice();
      render();
      setTimeout(function () { input.focus(); }, 30);
    }

    function close() { overlay.classList.remove('open'); }

    // Keyboard shortcut
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        overlay.classList.contains('open') ? close() : open();
        return;
      }
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape')     { close(); return; }
      if (e.key === 'ArrowDown')  { e.preventDefault(); setFocus(Math.min(focused + 1, filtered.length - 1)); return; }
      if (e.key === 'ArrowUp')    { e.preventDefault(); setFocus(Math.max(focused - 1, 0)); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        var idx = focused >= 0 ? focused : 0;
        if (filtered[idx]) filtered[idx].fn();
        return;
      }
    });

    // Filter on type
    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim();
      filtered = q
        ? ALL_CMDS.filter(function (c) { return c.label.toLowerCase().includes(q); })
        : ALL_CMDS.slice();
      render();
    });

    // Backdrop close
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

    // Trigger buttons
    document.querySelectorAll('.cmd-trigger').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });

    render();
  }

  /* ─────────────────────────────────────────────────────────────
   * 8. SCROLL-BASED DOCUMENT TITLE
   * ───────────────────────────────────────────────────────────── */
  function initScrollTitle() {
    var map = [
      { id: 'projects', title: 'Projects' },
      { id: 'resume',   title: 'Resume' },
      { id: 'now',      title: 'Now' },
      { id: 'about',    title: 'About' },
    ];
    window.addEventListener('scroll', function () {
      var title = 'Home';
      map.forEach(function (m) {
        var el = document.getElementById(m.id);
        if (el && el.getBoundingClientRect().top <= 120) title = m.title;
      });
      var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
      if (atBottom) title = 'Projects';
      document.title = title + ' | Siddhant Mahajani';
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
   * 9. HERO CANVAS — floating ember + water-drop particles
   * ───────────────────────────────────────────────────────────── */
  function initHeroCanvas() {
    var header = document.getElementById('header');
    if (!header) return;

    var cv = document.createElement('canvas');
    cv.id = 'hero-canvas';
    header.insertBefore(cv, header.firstChild);

    var ctx = cv.getContext('2d');
    var W, H;

    function resize() {
      W = cv.width  = header.offsetWidth;
      H = cv.height = header.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function Spark() { this.reset(); }
    Spark.prototype.reset = function () {
      this.x  = Math.random() * W;
      this.y  = H + 4;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -(0.5 + Math.random() * 1.6);
      var flame = Math.random() > 0.28;
      this.hue  = flame ? (12 + Math.random() * 28) : (200 + Math.random() * 28);
      this.size = 1.2 + Math.random() * 2.8;
      this.life = 0.7 + Math.random() * 0.3;
      this.dec  = 0.004 + Math.random() * 0.006;
    };

    var sparks = [];
    (function loop() {
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, W, H);
      var maxSparks = W < 620 ? 35 : 70;
      if (sparks.length < maxSparks && Math.random() < 0.55) sparks.push(new Spark());
      for (var i = sparks.length - 1; i >= 0; i--) {
        var s = sparks[i];
        s.x  += s.vx + Math.sin(s.y * 0.04) * 0.25;
        s.y  += s.vy;
        s.life -= s.dec;
        if (s.life <= 0 || s.y < -8) { s.reset(); continue; }
        ctx.save();
        ctx.globalAlpha = s.life * 0.45;
        var c = 'hsl(' + s.hue + ',88%,60%)';
        ctx.fillStyle = ctx.shadowColor = c;
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, 6.28); ctx.fill();
        ctx.restore();
      }
    })();
  }

  /* ─────────────────────────────────────────────────────────────
   * 10. WATER RIPPLE — click anywhere on hero
   * ───────────────────────────────────────────────────────────── */
  function initRippleEffect() {
    var header = document.getElementById('header');
    if (!header) return;
    header.addEventListener('click', function (e) {
      if (e.target.closest('a, button, .toggle-theme')) return;
      var rect   = header.getBoundingClientRect();
      var ripple = document.createElement('div');
      ripple.className = 'hero-ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top  = (e.clientY - rect.top)  + 'px';
      header.appendChild(ripple);
      setTimeout(function () { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 1300);
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * 11. 3-D CARD TILT — mouse-move perspective on project cards
   * ───────────────────────────────────────────────────────────── */
  function initCardTilt() {
    if ('ontouchstart' in window) return; // skip touch devices
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width  - 0.5;
        var y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transition = 'transform 0.08s ease, border-color 0.15s ease, box-shadow 0.15s ease';
        card.style.transform  = 'perspective(560px) rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 14) + 'deg) translateZ(6px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1), border-color 0.15s ease, box-shadow 0.15s ease';
        card.style.transform  = '';
        setTimeout(function () { card.style.transition = ''; }, 460);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * 12. KANJI SECTION DECORATIONS
   * ───────────────────────────────────────────────────────────── */
  function initKanjiDecorations() {
    var map = [
      { id: 'about',    k: '水' },
      { id: 'now',      k: '今' },
      { id: 'resume',   k: '炎' },
      { id: 'projects', k: '技' },
    ];
    map.forEach(function (d) {
      var sec = document.getElementById(d.id);
      if (!sec) return;
      var el = document.createElement('span');
      el.className = 'section-kanji';
      el.setAttribute('aria-hidden', 'true');
      el.textContent = d.k;
      sec.appendChild(el);
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * 13. CURSOR TRAIL — tiny ember particles (desktop only)
   * ───────────────────────────────────────────────────────────── */
  function initCursorTrail() {
    if ('ontouchstart' in window) return;
    var last = 0;
    var pool = [];
    document.addEventListener('mousemove', function (e) {
      var now = Date.now();
      if (now - last < 28) return;
      last = now;
      var el = document.createElement('div');
      el.className  = 'cursor-trail';
      el.style.left = e.clientX + 'px';
      el.style.top  = e.clientY + 'px';
      document.body.appendChild(el);
      pool.push(el);
      if (pool.length > 22) {
        var old = pool.shift();
        if (old.parentNode) old.parentNode.removeChild(old);
      }
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        var i = pool.indexOf(el);
        if (i > -1) pool.splice(i, 1);
      }, 680);
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
   * 14. SECTION GLOW SWEEP — border flash when a section enters view
   * ───────────────────────────────────────────────────────────── */
  function initSectionGlow() {
    if (!window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var sec = entry.target;
        sec.classList.add('section-glow');
        setTimeout(function () { sec.classList.remove('section-glow'); }, 900);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('section').forEach(function (s) { io.observe(s); });
  }

  /* ─────────────────────────────────────────────────────────────
   * 15. TIMELINE STAGGER — animate resume entries in sequence
   * ───────────────────────────────────────────────────────────── */
  function initTimelineStagger() {
    if (!window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var items = entry.target.querySelectorAll('.tl-item');
        items.forEach(function (item, i) {
          setTimeout(function () { item.classList.add('tl-visible'); }, i * 80);
        });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.timeline').forEach(function (g) { io.observe(g); });
  }

  /* ─────────────────────────────────────────────────────────────
   * BOOT
   * ───────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initContinuousScroll();
    initScrollReveal();
    initSectionDots();
    initStatCounters();
    initSkillFilter();
    initCopyEmail();
    initCommandPalette();
    initScrollTitle();
    // Visual features
    initHeroCanvas();
    initRippleEffect();
    initCardTilt();
    initCursorTrail();
    initSectionGlow();
    initTimelineStagger();
  });

})();
