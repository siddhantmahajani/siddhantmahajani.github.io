const toggle = document.querySelector(".toggle-theme");
const mainTheme = document.querySelector("#main-theme");
const shuffleTheme = document.querySelector("#shuffle-theme");
const toggleIcon = document.querySelector("#toggle-icon");
toggle.addEventListener("click", function() {
    if (mainTheme.getAttribute("href") == "assets/css/dark.css" && shuffleTheme.getAttribute("href") == "assets/css/dark-shuffle.css") {
        mainTheme.href = "assets/css/light.css";
        shuffleTheme.href = "assets/css/light-shuffle.css";
        toggleIcon.className = "icofont-moon";
    } else if (mainTheme.getAttribute("href") == "assets/css/light.css" && shuffleTheme.getAttribute("href") == "assets/css/light-shuffle.css") {
        mainTheme.href = "assets/css/dark.css";
        shuffleTheme.href = "assets/css/dark-shuffle.css";
        toggleIcon.className = "icofont-sun-alt";
    }
});