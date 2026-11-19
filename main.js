// Fade sections in as they scroll into view, and open screenshots full size.
(function () {
  document.documentElement.classList.remove("no-js");
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  var box = document.querySelector(".lightbox");
  if (!box || typeof box.showModal !== "function") return;
  var big = box.querySelector("img");
  document.querySelectorAll(".zoomable").forEach(function (img) {
    img.addEventListener("click", function () {
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      box.showModal();
    });
  });
  box.addEventListener("click", function () { box.close(); });
})();
