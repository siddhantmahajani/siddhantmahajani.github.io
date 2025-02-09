document.addEventListener("DOMContentLoaded", function () {
    const mainDarkTheme = "assets/css/dark.css";
    const mainDarkShuffleTheme = "assets/css/dark-shuffle.css";
    const mainLightTheme = "assets/css/light.css";
    const mainLightShuffleTheme = "assets/css/light-shuffle.css";
    // const loaderDarkTheme = "assets/css/dark-loader.css";
    // const loaderLightTheme = "assets/css/light-loader.css";
    const mainTheme = document.getElementById("main-theme");
    const shuffleTheme = document.getElementById("shuffle-theme");
    // const loaderTheme = document.getElementById("loader-theme");
    const iconToggle = document.getElementById("toggle-icon");
  
    // Check if the user's system prefers dark mode
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
    if (prefersDarkScheme) {
      mainTheme.href = mainDarkTheme;
      shuffleTheme.href = mainDarkShuffleTheme;
      // loaderTheme.href = loaderDarkTheme;
      iconToggle.className = "icofont-sun";
    } else {
      mainTheme.href = mainLightTheme;
      shuffleTheme.href = mainLightShuffleTheme;
      // loaderTheme.href = loaderLightTheme;
      iconToggle.className = "icofont-moon";
    }
  });