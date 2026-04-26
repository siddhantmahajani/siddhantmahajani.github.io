;(function () {
  var LINES = [
    { text: "$ ssh siddhant@portfolio", pause: 450 },
    { text: "  Authenticating... done.", pause: 320 },
    { text: "$ init --load", pause: 380 },
    { text: "  [OK] experience", pause: 160 },
    { text: "  [OK] projects", pause: 160 },
    { text: "  [OK] skills", pause: 260 },
    { text: "$ All systems go. Welcome.", pause: 0, accent: true },
  ];
  var CHAR_MS = 7;

  var overlay   = document.getElementById("overlay");
  var progress  = document.getElementById("progress");
  var linesEl   = document.getElementById("loader-lines");
  var cursorEl  = document.getElementById("loader-cursor");
  var loaderBody = document.getElementById("loader-body");

  var animDone = false;
  var loadDone = false;

  function tryFinish() {
    if (!animDone || !loadDone) return;
    if (cursorEl) cursorEl.style.display = "none";
    overlay.style.opacity = 0;
    setTimeout(function () { overlay.style.display = "none"; }, 1200);
  }

  function typeLine(text, el, cb) {
    var i = 0;
    (function tick() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i++);
        setTimeout(tick, CHAR_MS);
      } else {
        cb();
      }
    })();
  }

  function runLines() {
    var idx = 0;
    function next() {
      if (idx >= LINES.length) {
        animDone = true;
        tryFinish();
        return;
      }
      var cfg  = LINES[idx++];
      var el   = document.createElement("div");
      el.className = "ll" + (cfg.accent ? " ll-a" : "");
      linesEl.appendChild(el);
      if (cursorEl && loaderBody) loaderBody.appendChild(cursorEl);
      el.scrollIntoView({ block: "nearest" });
      typeLine(cfg.text, el, function () { setTimeout(next, cfg.pause); });
    }
    next();
  }

  function trackImages() {
    var imgs = document.images;
    var tot  = imgs.length;
    var c    = 0;
    if (tot === 0) { loadDone = true; tryFinish(); return; }
    function imgLoaded() {
      c++;
      progress.style.width = Math.round(100 / tot * c) + "%";
      if (c === tot) { loadDone = true; tryFinish(); }
    }
    for (var i = 0; i < tot; i++) {
      var img = new Image();
      img.onload = img.onerror = imgLoaded;
      img.src = imgs[i].src;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    runLines();
    trackImages();
  });
}());
