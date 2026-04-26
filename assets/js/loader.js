;(function () {
  /* ──────────────────────────────────────────────────────────
   * Loader — Hollow Purple
   * Gojo's Ao (Blue) and Aka (Red) form, converge, merge into
   * Murasaki (Purple) which fires as an expanding ring.
   * ────────────────────────────────────────────────────────── */
  var overlay  = document.getElementById('overlay');
  var canvasEl = document.getElementById('ds-canvas');
  var progEl   = document.getElementById('ds-progress');
  if (!overlay || !canvasEl) return;

  var ctx    = canvasEl.getContext('2d');
  var W, H, CX, CY, small;
  var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function resize() {
    W  = canvasEl.width  = window.innerWidth;
    H  = canvasEl.height = window.innerHeight;
    CX = W * 0.5;
    CY = H * 0.47;
    small = Math.min(W, H) < 620;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Phase durations (ms) ──────────────────────────────────
   *  D1  orbs awaken and stabilise
   *  D2  orbs converge toward each other
   *  D3  collision white flash
   *  D4  purple orb charges (rapid pulse)
   *  D5  hollow purple fires — ring expands to fill screen    */
  var D1 = 1000, D2 = 1500, D3 = 350, D4 = 600, D5 = 1300;
  var T1 = D1, T2 = T1+D2, T3 = T2+D3, T4 = T3+D4, T5 = T4+D5;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function easeOut3(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn3(t)  { return t * t * t; }

  /* ── Blue particle — attracted toward orb center ───────────
   * Represents Cursed Technique Lapse: Blue draws everything in. */
  function BlueP(ox, oy) {
    var dist  = (small ? 70 : 130) + Math.random() * (small ? 90 : 160);
    var angle = Math.random() * 6.2832;
    this.x    = ox + Math.cos(angle) * dist;
    this.y    = oy + Math.sin(angle) * dist;
    this.hue  = 195 + Math.random() * 15;   /* 195–210 electric cyan → deep azure */
    this.size = 1.5 + Math.random() * (small ? 2.0 : 3.5);
    this.life = 0.75 + Math.random() * 0.25;
    this.dec  = 0.012 + Math.random() * 0.008;
    this.spd  = 0.045 + Math.random() * 0.045;
  }
  BlueP.prototype.update = function (ox, oy) {
    this.x += (ox - this.x) * this.spd;
    this.y += (oy - this.y) * this.spd;
    this.life -= this.dec;
    var dx = ox - this.x, dy = oy - this.y;
    if (dx * dx + dy * dy < 64) this.life = 0;
  };
  BlueP.prototype.draw = function () {
    ctx.save();
    ctx.globalAlpha = this.life * 0.9;
    ctx.shadowBlur  = small ? 7 : 15;
    ctx.shadowColor = 'hsl(' + this.hue + ',100%,72%)';
    ctx.fillStyle   = 'hsl(' + this.hue + ',100%,72%)';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, 6.2832); ctx.fill();
    ctx.restore();
  };
  BlueP.prototype.dead = function () { return this.life <= 0; };

  /* ── Red particle — bursts outward from orb ────────────────
   * Represents Cursed Technique Reversal: Red repels everything. */
  function RedP(ox, oy) {
    var angle = Math.random() * 6.2832;
    var spd   = (small ? 2 : 3) + Math.random() * (small ? 3 : 5.5);
    this.x    = ox; this.y = oy;
    this.vx   = Math.cos(angle) * spd;
    this.vy   = Math.sin(angle) * spd;
    this.hue  = 348 + Math.random() * 12;   /* 348–360 neon crimson → deep ruby */
    this.size = 1.5 + Math.random() * (small ? 2.0 : 3.5);
    this.life = 0.7 + Math.random() * 0.3;
    this.dec  = 0.013 + Math.random() * 0.01;
  }
  RedP.prototype.update = function () {
    this.x += this.vx; this.y += this.vy;
    this.vx *= 0.964; this.vy *= 0.964;
    this.size *= 0.985; this.life -= this.dec;
  };
  RedP.prototype.draw = function () {
    ctx.save();
    ctx.globalAlpha = this.life * 0.9;
    ctx.shadowBlur  = small ? 7 : 15;
    ctx.shadowColor = 'hsl(' + this.hue + ',100%,65%)';
    ctx.fillStyle   = 'hsl(' + this.hue + ',100%,65%)';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, 6.2832); ctx.fill();
    ctx.restore();
  };
  RedP.prototype.dead = function () { return this.life <= 0; };

  /* ── Purple particle — radiates from collision / fire ───────
   * Born at center and burst outward in all directions.         */
  function PurpP() {
    var angle = Math.random() * 6.2832;
    var spd   = (small ? 3 : 5) + Math.random() * (small ? 6 : 11);
    this.x    = CX; this.y = CY;
    this.vx   = Math.cos(angle) * spd;
    this.vy   = Math.sin(angle) * spd;
    this.hue  = 258 + Math.random() * 15;  /* 258–273 electric violet → deep indigo */
    this.size = 2 + Math.random() * (small ? 3.5 : 6);
    this.life = 0.8 + Math.random() * 0.2;
    this.dec  = 0.009 + Math.random() * 0.008;
  }
  PurpP.prototype.update = function () {
    this.x += this.vx; this.y += this.vy;
    this.vx *= 0.975; this.vy *= 0.975;
    this.size *= 0.985; this.life -= this.dec;
  };
  PurpP.prototype.draw = function () {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.shadowBlur  = small ? 12 : 24;
    ctx.shadowColor = 'hsl(' + this.hue + ',100%,72%)';
    ctx.fillStyle   = 'hsl(' + this.hue + ',100%,72%)';
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, 6.2832); ctx.fill();
    ctx.restore();
  };
  PurpP.prototype.dead = function () { return this.life <= 0; };

  /* ── Draw an orb (radial gradient + outer glow) ─────────────
   *  h1  inner hue (brighter)
   *  h2  outer hue (deeper)                                      */
  function drawOrb(x, y, r, h1, h2, alpha) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0,    'hsla(0,0%,100%,' + alpha + ')');
    g.addColorStop(0.18, 'hsla(' + h1 + ',100%,88%,' + (alpha * 0.92) + ')');
    g.addColorStop(0.52, 'hsla(' + h2 + ',100%,60%,' + (alpha * 0.65) + ')');
    g.addColorStop(1,    'hsla(' + h2 + ',100%,38%,0)');
    ctx.save();
    ctx.shadowBlur  = r * 2.4;
    ctx.shadowColor = 'hsla(' + h1 + ',100%,65%,' + (alpha * 0.7) + ')';
    ctx.fillStyle   = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  /* ── Draw the tension arc between converging orbs ──────────── */
  function drawArc(x1, y1, x2, y2, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur  = 20;
    ctx.shadowColor = 'rgba(124,58,237,0.9)';
    ctx.strokeStyle = 'rgba(170,130,255,0.75)';
    ctx.lineWidth   = small ? 1.5 : 2.5;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.restore();
  }

  /* ── Jagged lightning path from (x1,y1) to (x2,y2) ────────────
   * Re-randomised each frame — the flicker IS the electric effect. */
  function jaggLine(x1, y1, x2, y2, segs, jag) {
    var dx = x2-x1, dy = y2-y1;
    var len = Math.sqrt(dx*dx + dy*dy) || 1;
    var nx = -dy/len, ny = dx/len;   /* perpendicular normal */
    var pts = [{x:x1, y:y1}];
    for (var i = 1; i < segs; i++) {
      var t   = i / segs;
      var off = (Math.random() - 0.5) * jag;
      pts.push({ x: x1 + dx*t + nx*off, y: y1 + dy*t + ny*off });
    }
    pts.push({x:x2, y:y2});
    return pts;
  }

  /* ── State ──────────────────────────────────────────────────── */
  var t0, frameId;
  var blues = [], reds = [], purps = [];
  var animDone = false, loadDone = false, exiting = false;
  var orbBX, orbBY, orbRX, orbRY;

  function setProgress(p) {
    if (progEl) progEl.style.width = (clamp(p, 0, 1) * 100) + '%';
  }

  function tryFinish() {
    if (!animDone || !loadDone || exiting) return;
    exiting = true;
    setTimeout(dismiss, 300);
  }

  function dismiss() {
    overlay.classList.add('loader-exit');
    setTimeout(function () { document.documentElement.classList.add('page-ready'); }, 200);
    setTimeout(function () { overlay.style.display = 'none'; cancelAnimationFrame(frameId); }, 1000);
  }

  /* ── Main loop ──────────────────────────────────────────────── */
  function loop(ts) {
    frameId = requestAnimationFrame(loop);
    if (!t0) t0 = ts;
    var t = ts - t0;

    /* Motion-trail clear — fades toward the stage background colour */
    ctx.fillStyle = isDark ? 'rgba(6,6,14,0.3)' : 'rgba(255,255,255,0.28)';
    ctx.fillRect(0, 0, W, H);

    /* Orb starting positions: Blue top-left, Red bottom-right     */
    var bSX = W * 0.14, bSY = H * 0.28;
    var rSX = W * 0.86, rSY = H * 0.72;

    /* Default positions — overridden by each phase                */
    orbBX = bSX; orbBY = bSY;
    orbRX = rSX; orbRY = rSY;

    /* ── Phase 1 — Awaken ─────────────────────────────────────── */
    if (t < T1) {
      var p  = t / D1;
      var ep = easeOut3(p);
      var r  = ep * (small ? 42 : 68);
      drawOrb(orbBX, orbBY, r, 199, 207, ep);
      drawOrb(orbRX, orbRY, r, 348,   0, ep);
      var sc = p * (small ? 0.55 : 0.75);
      if (Math.random() < sc) blues.push(new BlueP(orbBX, orbBY));
      if (Math.random() < sc) reds.push(new RedP(orbRX, orbRY));
      setProgress(p * 0.17);

    /* ── Phase 2 — Converge ───────────────────────────────────── */
    } else if (t < T2) {
      var p  = (t - T1) / D2;
      var ep = easeIn3(p);
      orbBX = lerp(bSX, CX, ep); orbBY = lerp(bSY, CY, ep);
      orbRX = lerp(rSX, CX, ep); orbRY = lerp(rSY, CY, ep);
      var r  = (small ? 42 : 68) * (1 + p * 0.45);
      drawOrb(orbBX, orbBY, r, 199, 207, 1);
      drawOrb(orbRX, orbRY, r, 348,   0, 1);
      /* Tension arc appears as orbs close in                       */
      var dist = Math.sqrt(Math.pow(orbRX - orbBX, 2) + Math.pow(orbRY - orbBY, 2));
      if (dist < W * 0.65 && p > 0.3) {
        var arcA = clamp((W * 0.65 - dist) / (W * 0.35), 0, 1) * 0.75;
        drawArc(orbBX, orbBY, orbRX, orbRY, arcA);
      }
      var sc = 0.45 + p * 0.3;
      if (Math.random() < sc) blues.push(new BlueP(orbBX, orbBY));
      if (Math.random() < sc) reds.push(new RedP(orbRX, orbRY));
      setProgress(0.17 + p * 0.43);

    /* ── Phase 3 — Merge flash ────────────────────────────────── */
    } else if (t < T3) {
      orbBX = orbRX = CX; orbBY = orbRY = CY;
      var p  = (t - T2) / D3;
      var fa = p < 0.45 ? p / 0.45 : (1 - p) / 0.55;
      var d  = Math.sqrt(W * W + H * H) * 0.6;
      var gf = ctx.createRadialGradient(CX, CY, 0, CX, CY, d);
      gf.addColorStop(0,   isDark ? 'rgba(255,255,255,' + fa + ')' : 'rgba(124,58,237,' + fa + ')');
      gf.addColorStop(0.3, 'rgba(170,130,255,' + (fa * 0.9) + ')');
      gf.addColorStop(0.7, isDark ? 'rgba(56,43,88,' + (fa * 0.5) + ')' : 'rgba(200,180,255,' + (fa * 0.5) + ')');
      gf.addColorStop(1,   'rgba(124,58,237,0)');
      ctx.save(); ctx.fillStyle = gf; ctx.fillRect(0, 0, W, H); ctx.restore();
      if (p > 0.3 && p < 0.72) {
        var n = small ? 4 : 9;
        for (var s = 0; s < n; s++) purps.push(new PurpP());
      }
      setProgress(0.60 + p * 0.08);

    /* ── Phase 4 — Purple charges ─────────────────────────────── */
    } else if (t < T4) {
      orbBX = orbRX = CX; orbBY = orbRY = CY;
      var p     = (t - T3) / D4;
      var pulse = 0.70 + Math.sin(p * Math.PI * 14) * 0.30;
      var r     = (small ? 30 : 52) * (1 + p) * pulse;
      drawOrb(CX, CY, r, 262, 257, 0.95);
      var n = small ? 3 : 6;
      for (var s = 0; s < n; s++) purps.push(new PurpP());
      setProgress(0.68 + p * 0.12);

    /* ── Phase 5 — Hollow Purple fires (electric blast) ─────── */
    } else if (t < T5) {
      orbBX = orbRX = CX; orbBY = orbRY = CY;
      var p    = (t - T4) / D5;
      var maxR = Math.sqrt(W * W + H * H);

      /* Bolts expand from center outward */
      var boltR = easeOut3(p) * maxR * 1.28;
      var boltA = clamp(1 - p * 1.25, 0, 1);

      /* Initial shockwave fill — dark stage: deep violet; light stage: vivid violet */
      if (p < 0.15) {
        ctx.save(); ctx.globalAlpha = (1 - p / 0.15) * (isDark ? 0.65 : 0.45);
        ctx.fillStyle = isDark ? 'rgb(44,24,88)' : 'rgb(124,58,237)';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      /* Central electric glow — collapses as bolts expand       */
      var coreR = (small ? 70 : 120) * Math.max(0, 1 - p * 2.2);
      if (coreR > 1) {
        var cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreR);
        cg.addColorStop(0,    isDark ? 'rgba(255,255,255,' + boltA + ')' : 'rgba(124,58,237,' + boltA + ')');
        cg.addColorStop(0.25, 'rgba(170,130,255,' + (boltA * 0.85) + ')');
        cg.addColorStop(1,    'rgba(124,58,237,0)');
        ctx.save(); ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(CX, CY, coreR, 0, 6.2832); ctx.fill();
        ctx.restore();
      }

      /* Radiating lightning bolts — re-jagged every frame       */
      var NUM = small ? 10 : 18;
      for (var i = 0; i < NUM; i++) {
        var ang = (i / NUM) * 6.2832;
        var ex  = CX + Math.cos(ang) * boltR;
        var ey  = CY + Math.sin(ang) * boltR;
        var pts = jaggLine(CX, CY, ex, ey, small ? 6 : 9, boltR * 0.14);

        /* Main bolt */
        ctx.save();
        ctx.globalAlpha = boltA * 0.92;
        ctx.shadowBlur  = small ? 18 : 34;
        ctx.shadowColor = 'rgba(124,58,237,0.9)';
        ctx.strokeStyle = 'rgba(170,130,255,1)';
        ctx.lineWidth   = (small ? 1.5 : 2.5) * (1 - p * 0.65);
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
        ctx.stroke();
        ctx.restore();

        /* Branch bolt — appears once bolts are long enough       */
        if (boltR > maxR * 0.22) {
          var bi   = Math.floor(pts.length * 0.4);
          var bp   = pts[bi];
          var bAng = ang + (Math.random() < 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4);
          var bLen = boltR * (0.28 + Math.random() * 0.22);
          var bPts = jaggLine(bp.x, bp.y,
                              bp.x + Math.cos(bAng) * bLen,
                              bp.y + Math.sin(bAng) * bLen,
                              small ? 4 : 6, bLen * 0.22);
          ctx.save();
          ctx.globalAlpha = boltA * 0.5;
          ctx.shadowBlur  = small ? 10 : 18;
          ctx.shadowColor = 'rgba(56,43,88,0.8)';
          ctx.strokeStyle = 'rgba(170,130,255,1)';
          ctx.lineWidth   = small ? 1 : 1.5;
          ctx.beginPath(); ctx.moveTo(bPts[0].x, bPts[0].y);
          for (var k = 1; k < bPts.length; k++) ctx.lineTo(bPts[k].x, bPts[k].y);
          ctx.stroke();
          ctx.restore();
        }
      }

      var n = p < 0.35 ? (small ? 3 : 6) : 0;
      for (var s = 0; s < n; s++) purps.push(new PurpP());
      setProgress(0.80 + p * 0.20);

      if (p >= 0.95 && !animDone) { animDone = true; tryFinish(); }
    }

    /* Update + draw all particle arrays                           */
    for (var i = blues.length - 1; i >= 0; i--) {
      blues[i].update(orbBX, orbBY); blues[i].draw();
      if (blues[i].dead()) blues.splice(i, 1);
    }
    for (var j = reds.length - 1; j >= 0; j--) {
      reds[j].update(); reds[j].draw();
      if (reds[j].dead()) reds.splice(j, 1);
    }
    for (var k = purps.length - 1; k >= 0; k--) {
      purps[k].update(); purps[k].draw();
      if (purps[k].dead()) purps.splice(k, 1);
    }
  }

  /* ── Boot ──────────────────────────────────────────────────── */
  frameId = requestAnimationFrame(loop);

  /* Image loading gate — dismiss only when both animation and
   * images are ready.                                            */
  var imgs = Array.from(document.images).filter(function (img) {
    return !img.complete;
  });
  if (!imgs.length) {
    loadDone = true;
  } else {
    var pending = imgs.length;
    function onLoad() {
      if (!--pending) { loadDone = true; tryFinish(); }
    }
    imgs.forEach(function (img) {
      img.addEventListener('load',  onLoad);
      img.addEventListener('error', onLoad);
    });
  }
})();
