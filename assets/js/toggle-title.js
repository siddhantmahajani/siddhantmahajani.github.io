const header = document.querySelector(".header-title");
const about = document.querySelector(".about-title");
const contact = document.querySelector(".contact-title");
const resume = document.querySelector(".resume-title");
header.addEventListener("click", function() {
    if (header.getAttribute("href") == "#header") {
        document.title = "Home | Siddhant Mahajani";
    }
});
about.addEventListener("click", function() {
    if (about.getAttribute("href") == "#about") {
        document.title = "About | Siddhant Mahajani";
    }
});
resume.addEventListener("click", function() {
    if (resume.getAttribute("href") == "#resume") {
        document.title = "Resume | Siddhant Mahajani";
    }
});
contact.addEventListener("click", function() {
    if (contact.getAttribute("href") == "#contact") {
        document.title = "Contact | Siddhant Mahajani";
    }
});