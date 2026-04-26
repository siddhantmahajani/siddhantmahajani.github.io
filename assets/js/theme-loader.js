document.addEventListener("DOMContentLoaded", function () {
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var mainTheme    = document.getElementById("main-theme");
  var shuffleTheme = document.getElementById("shuffle-theme");
  var loaderTheme  = document.getElementById("loader-theme");
  var iconToggle   = document.getElementById("toggle-icon");

  if (prefersDark) {
    mainTheme.href    = "assets/css/dark.css";
    shuffleTheme.href = "assets/css/dark-shuffle.css";
    loaderTheme.href  = "assets/css/dark-loader.css";
    if (iconToggle) iconToggle.className = "ri-sun-line";
  } else {
    mainTheme.href    = "assets/css/light.css";
    shuffleTheme.href = "assets/css/light-shuffle.css";
    loaderTheme.href  = "assets/css/light-loader.css";
    if (iconToggle) iconToggle.className = "ri-moon-line";
  }
});
