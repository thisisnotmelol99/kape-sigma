/* Kape Sigma — behaviour layer (proven chassis; CONFIG per store-profile.json).
   Motion: one focal hero sequence on load; photos wipe in once on scroll.
   Without JS nothing is hidden (all reveal states are gated on html.js). */
(function () {
  "use strict";

  // ---- per-store config: fill from _research/store-profile.json ----
  var CONFIG = {
    openHour: 11,   // 24h clock
    closeHour: 24,
    todayHours: "11:00 AM\u201312:00 MN",
  };

  var docEl = document.documentElement;
  docEl.classList.add("js");

  var NOW = new Date();
  var HOUR = NOW.getHours() + NOW.getMinutes() / 60;
  var is_open = HOUR >= CONFIG.openHour && HOUR < CONFIG.closeHour;

  // open-now line in the visit panel
  var openEl = document.querySelector("[data-open-now]");
  if (openEl && is_open) {
    openEl.textContent = "Open now \u00B7 closes " + CONFIG.todayHours.split("\u2013").pop();
    openEl.classList.add("is-open");
  } else if (openEl) {
    openEl.textContent = "Closed \u00B7 opens " + CONFIG.todayHours.split("\u2013")[0];
    openEl.classList.add("is-closed");
  }

  // mark today's row in the week's hours
  var dayIndex = (NOW.getDay() + 6) % 7; // Monday = 0
  var rows = document.querySelectorAll(".visit__hours div");
  if (rows[dayIndex]) rows[dayIndex].classList.add("is-today");

  // today's hours in the close line
  var todayEl = document.querySelector("[data-today-hours]");
  if (todayEl) todayEl.textContent = CONFIG.todayHours;

  // focal hero sequence: photo unveil + words, once on load
  var hero = document.querySelector("[data-enter]");
  if (hero) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("is-in");
        hero.classList.add("is-hero-in");
      });
    });
  }

  // quiet reveals: observe the unclipped sections, reveal the clipped children.
  // (An element hidden by its own clip-path reports zero intersection area,
  // so observing the clipped element itself would never fire.)
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.querySelectorAll("[data-reveal]").forEach(function (el) {
            el.classList.add("is-in");
          });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll("main > section, .close--brand").forEach(function (s) {
      if (s.querySelector("[data-reveal]")) io.observe(s);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  // phone action bar: appears once the hero's buttons have scrolled away
  var bar = document.querySelector(".actionbar");
  var heroBtn = document.querySelector(".hero--place .btn-row");
  if (bar && heroBtn && "IntersectionObserver" in window) {
    bar.classList.remove("is-visible");
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        bar.classList.toggle("is-visible", !e.isIntersecting);
      });
    }, { rootMargin: "-72px 0px 0px 0px" }).observe(heroBtn);
  }

  // aria-current on the nav word pointing at the group in view
  var links = document.querySelectorAll('.nav__words a[href^="#"]');
  var ids = Array.prototype.map.call(links, function (a) { return a.getAttribute("href").slice(1); });
  if ("IntersectionObserver" in window) {
    var ioNav = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        var i = ids.indexOf(e.target.id);
        if (i > -1) links[i].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    ids.forEach(function (id) { var s = document.getElementById(id); if (s) ioNav.observe(s); });
  }
})();
