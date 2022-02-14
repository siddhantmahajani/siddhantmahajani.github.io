const mainTheme = document.querySelector("#main-theme");
const shuffleTheme = document.querySelector("#shuffle-theme");
const toggleIcon = document.querySelector("#toggle-icon");
var defaultColourScheme = matchMedia('(prefers-color-scheme: light)').matches;
if (defaultColourScheme) {
    mainTheme.href = "assets/css/light.css";
    shuffleTheme.href = "assets/css/light-shuffle.css";
    toggleIcon.className = "icofont-moon";
} else {
    mainTheme.href = "assets/css/dark.css";
    shuffleTheme.href = "assets/css/dark-shuffle.css";
    toggleIcon.className = "icofont-sun-alt";
}