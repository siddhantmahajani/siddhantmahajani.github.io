;(function () {
  /* ──────────────────────────────────────────────────────────
   * Loader — Inferno × Whirlpool
   * Full-screen rising fire + clockwise water vortex.
   * They collide at the vortex eye with steam sparks.
   * No text — pure canvas visual + thin progress bar.
   * ────────────────────────────────────────────────────────── */
  var overlay  = document.getElementById('overlay');
  var canvasEl = document.getElementById('ds-canvas');
  var progEl   = document.getElementById('ds-progress');

  if (!overlay || !canvasEl) return;

  var ctx = canvasEl.getContext('2d');
  var W = 0, H = 0, CX = 0, CY = 0, small = false;

  function resize() {
    W     = canvasEl.width  = window.innerWidth;
    H     = canvasEl.height = window.innerHeight;
    CX    = W * 0.50;
    CY    = H * 0.44;
    small = Math.min(W, H) < 620; // phone portrait or small tablet
  }

  /* ── Fire (Inferno) ────────────────────────────────────────
   * Particles rise from the full bottom edge.  When they
   * enter the vortex field their hue drifts toward cyan.      */
  function FireP() {
    this.x    = Math.random() * W;
    this.y    = H + 10;
    this.vx   = (Math.random() - 0.5) * 2.8;
    this.vy   = -(2.2 + Math.random() * 5.5);
    this.size = 5 + Math.random() * 14;
    this.hue  = 8 + Math.random() * 32;
    this.sat  = 95;
    this.lit  = 50 + Math.random() * 24;
    this.life = 0.7 + Math.random() * 0.3;
    this.dec  = 0.005 + Math.random() * 0.01;
  }
  FireP.prototype.update = function () {
    this.vx  += (Math.random() - 0.5) * 0.38;
    this.size *= 0.983;
    this.x   += this.vx;
    this.y   += this.vy;
    this.life -= this.dec;
    var dx = CX - this.x, dy = CY - this.y;
    var d2 = dx * dx + dy * dy, R = H * 0.55;
    if (d2 < R * R) {
      var d = Math.sqrt(d2), pull = 0.12 * (1 - d / R);
      this.vx += (dx / d) * pull;
      this.vy += (dy / d) * pull;
    }
  };
  FireP.prototype.draw = function () {
    if (this.life <= 0 || this.size < 0.4) return;
    var dx = CX - this.x, dy = CY - this.y;
    var blend = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / (H * 0.38));
    var hue = this.hue + blend * (200 - this.hue);
    var lit = this.lit + Math.sin(this.life * Math.PI) * 16;
    ctx.save();
    ctx.globalAlpha = this.life * 0.82;
    var c = 'hsl(' + hue + ',' + this.sat + '%,' + lit + '%)';
    ctx.fillStyle = ctx.shadowColor = c;
    ctx.shadowBlur = small ? 8 : 18;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, 6.2832); ctx.fill();
    ctx.restore();
  };
  FireP.prototype.dead = function () {
    return this.life <= 0 || this.y < -this.size * 2;
  };

  /* ── Vortex (Whirlpool) ────────────────────────────────────
   * Particles spawn at distance from the eye and spiral
   * clockwise inward, drawn as short line segments so they
   * look like water streams.                                   */
  function VortexP() {
    var r = H * 0.25 + Math.random() * Math.max(W, H) * 0.22;
    var a = Math.random() * 6.2832;
    this.radius = r;
    this.angle  = a;
    this.x      = CX + r * Math.cos(a);
    this.y      = CY + r * Math.sin(a);
    this.prevX  = this.x;
    this.prevY  = this.y;
    this.rotSpd = 0.028 + Math.random() * 0.038;
    this.shrink = 0.55 + Math.random() * 0.9;
    this.hue    = 188 + Math.random() * 30;
    this.sat    = 92;
    this.lit    = 60 + Math.random() * 28;
    this.width  = 1.2 + Math.random() * 3.5;
    this.life   = 1;
  }
  VortexP.prototype.update = function () {
    this.prevX  = this.x; this.prevY = this.y;
    this.angle += this.rotSpd;
    this.radius = Math.max(0, this.radius - this.shrink);
    this.x      = CX + this.radius * Math.cos(this.angle);
    this.y      = CY + this.radius * Math.sin(this.angle);
    this.life   = Math.min(1, this.radius / (H * 0.18));
  };
  VortexP.prototype.draw = function () {
    if (this.life <= 0 || this.width < 0.2) return;
    ctx.save();
    ctx.globalAlpha = this.life * 0.88;
    var c = 'hsl(' + this.hue + ',' + this.sat + '%,' + this.lit + '%)';
    ctx.strokeStyle = ctx.shadowColor = c;
    ctx.shadowBlur  = small ? 4 : 8;
    ctx.lineWidth   = this.width;
    ctx.lineCap     = 'round';
    ctx.beginPath(); ctx.moveTo(this.prevX, this.prevY); ctx.lineTo(this.x, this.y); ctx.stroke();
    ctx.restore();
  };
  VortexP.prototype.dead = function () { return this.radius <= 0; };

  /* ── Steam sparks (collision at eye) ─────────────────────── */
  function SteamP(x, y) {
    this.x = x; this.y = y;
    this.vx   = (Math.random() - 0.5) * 5.5;
    this.vy   = -(Math.random() * 4.5 + 0.5);
    this.size = 1.8 + Math.random() * 5.5;
    this.hue  = 30 + Math.random() * 165;
    this.sat  = 88; this.lit = 82 + Math.random() * 15;
    this.life = 0.65 + Math.random() * 0.35;
    this.dec  = 0.03 + Math.random() * 0.025;
  }
  SteamP.prototype.update = function () {
    this.x   += this.vx; this.y += this.vy;
    this.vy  -= 0.06;
    this.size *= 0.973;
    this.life -= this.dec;
  };
  SteamP.prototype.draw = function () {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life * 0.68;
    var c = 'hsl(' + this.hue + ',' + this.sat + '%,' + this.lit + '%)';
    ctx.fillStyle = ctx.shadowColor = c;
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, 6.2832); ctx.fill();
    ctx.restore();
  };
  SteamP.prototype.dead = function () { return this.life <= 0; };

  /* ── Vortex eye glow ─────────────────────────────────────── */
  function drawEye(elapsed) {
    var pulse = 0.72 + Math.sin(elapsed * 0.0022) * 0.28;
    var r     = (16 + Math.sin(elapsed * 0.0031) * 6) * pulse;
    var g     = ctx.createRadialGradient(CX, CY, 0, CX, CY, r * 5);
    g.addColorStop(0,    'rgba(255,255,255,' + (0.9  * pulse) + ')');
    g.addColorStop(0.18, 'rgba(180,230,255,' + (0.55 * pulse) + ')');
    g.addColorStop(0.5,  'rgba(40,160,255,'  + (0.22 * pulse) + ')');
    g.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(CX, CY, r * 5, 0, 6.2832); ctx.fill();
  }

  /* ── Main loop ───────────────────────────────────────────── */
  var fire = [], vortex = [], steam = [];
  var frameId, t0;

  function loop(ts) {
    frameId = requestAnimationFrame(loop);
    if (!t0) t0 = ts;
    var elapsed = ts - t0;

    ctx.fillStyle = 'rgba(6,6,16,0.22)';
    ctx.fillRect(0, 0, W, H);

    var fireMax = small ? 130 : 300, vortexMax = small ? 80 : 200;
    if (fire.length < fireMax) {
      if (Math.random() < (small ? 0.72 : 0.88)) fire.push(new FireP());
      if (!small && Math.random() < 0.62) fire.push(new FireP());
    }
    if (vortex.length < vortexMax) {
      if (Math.random() < (small ? 0.58 : 0.75)) vortex.push(new VortexP());
    }

    for (var i = fire.length - 1; i >= 0; i--) {
      fire[i].update(); fire[i].draw();
      if (fire[i].dead()) fire.splice(i, 1);
    }
    for (var j = vortex.length - 1; j >= 0; j--) {
      vortex[j].update(); vortex[j].draw();
      if (vortex[j].radius < 28 && Math.random() < 0.45)
        steam.push(new SteamP(vortex[j].x, vortex[j].y));
      if (vortex[j].dead()) vortex.splice(j, 1);
    }
    for (var k = steam.length - 1; k >= 0; k--) {
      steam[k].update(); steam[k].draw();
      if (steam[k].dead()) steam.splice(k, 1);
    }

    drawEye(elapsed);
  }

  /* ── State machine ───────────────────────────────────────── */
  var animDone = false, loadDone = false, exiting = false;
  var bladeProgress = 0;

  function tryFinish() {
    if (!animDone || !loadDone || exiting) return;
    exiting = true;
    setTimeout(dismiss, 300);
  }
  function dismiss() {
    // Step 1: overlay expands outward (CSS keyframe on .loader-exit)
    overlay.classList.add('loader-exit');

    // Step 2: reveal main content shortly after (slides up from behind)
    setTimeout(function () {
      document.documentElement.classList.add('page-ready');
    }, 200);

    // Step 3: remove overlay from layout once fully gone
    setTimeout(function () {
      overlay.style.display = 'none';
      cancelAnimationFrame(frameId);
    }, 1000);
  }
  function setProgress(val) {
    bladeProgress = Math.max(bladeProgress, val);
    if (progEl) progEl.style.width = Math.round(bladeProgress * 100) + '%';
  }

  /* ── Image tracking ──────────────────────────────────────── */
  function trackImages() {
    var imgs = document.images, tot = imgs.length, c = 0;
    if (tot === 0) { setProgress(1); loadDone = true; tryFinish(); return; }
    function done() {
      c++; setProgress(c / tot);
      if (c >= tot) { loadDone = true; tryFinish(); }
    }
    for (var i = 0; i < tot; i++) {
      var img = new Image(); img.onload = img.onerror = done; img.src = imgs[i].src;
    }
  }

  /* ── Boot ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    resize();
    window.addEventListener('resize', resize, { passive: true });
    requestAnimationFrame(loop);
    trackImages();
    setTimeout(function () { animDone = true; tryFinish(); }, 2600);
  });
}());
