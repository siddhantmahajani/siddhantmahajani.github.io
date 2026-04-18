/*--------------------------------------------------------------
# JavaScript for website title
--------------------------------------------------------------*/

document.addEventListener('click', function(e) {
  var link = e.target.closest('a');
  if (!link) return;
  var href = link.getAttribute('href');
  if (href === '#header') {
    document.title = "Home | Siddhant Mahajani";
  } else if (href === '#about') {
    document.title = "About | Siddhant Mahajani";
  } else if (href === '#resume') {
    document.title = "Resume | Siddhant Mahajani";
  }
});
