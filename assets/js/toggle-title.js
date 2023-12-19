/*--------------------------------------------------------------
# JavaScript for website title
--------------------------------------------------------------*/

const header = document.querySelector(".header-title");
const about = document.querySelector(".about-title");
const contact = document.querySelector(".contact-title");
const resume = document.querySelector(".resume-title");
header.addEventListener("click", function() {
    if (header.getAttribute("href") == "#header") {
        document.title = "home | siddhant mahajani";
    }
});
about.addEventListener("click", function() {
    if (about.getAttribute("href") == "#about") {
        document.title = "about | siddhant mahajani";
    }
});
resume.addEventListener("click", function() {
    if (resume.getAttribute("href") == "#resume") {
        document.title = "resume | siddhant mahajani";
    }
});
contact.addEventListener("click", function() {
    if (contact.getAttribute("href") == "#contact") {
        document.title = "contact | siddhant mahajani";
    }
});