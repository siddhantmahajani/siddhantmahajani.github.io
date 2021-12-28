const toggle = document.querySelector(".toggle-theme");
const mainTheme = document.querySelector("#main-theme");
const shuffleTheme = document.querySelector("#shuffle-theme");
const toggleIcon = document.querySelector("#toggle-icon");
toggle.addEventListener("click", function() {
    if ((window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) || 
        (mainTheme.getAttribute("href") == "assets/css/dark.css" && shuffleTheme.getAttribute("href") == "assets/css/dark-shuffle.css")) {
        mainTheme.href = "assets/css/light.css";
        shuffleTheme.href = "assets/css/light-shuffle.css";
        toggleIcon.className = "icofont-moon";
    } else if ((window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) || 
        (mainTheme.getAttribute("href") == "assets/css/dark.css" && shuffleTheme.getAttribute("href") == "assets/css/dark-shuffle.css")) {
        mainTheme.href = "assets/css/dark.css";
        shuffleTheme.href = "assets/css/dark-shuffle.css";
        toggleIcon.className = "icofont-sun-alt";
    }
});