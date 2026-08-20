/* ==========================================================
   HavenX — Shared Navigation Menu
   On pages with a real #navLinks menu (index.html), this
   toggles that existing menu open/closed on mobile/tablet.
   On pages without one (the event creation flow), it builds
   a small fallback panel instead. Either way, this is the
   only script needed for the hamburger icon to work.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll(".bar");
  if (!toggles.length) return;

  const existingLinks = document.getElementById("navLinks");

  if (existingLinks) {
    initExistingMenu(existingLinks, toggles);
  } else {
    initFallbackMenu(toggles);
  }
});

/* Wires up the real nav menu already built into the page (index.html). */
function initExistingMenu(navLinks, toggles) {
  const overlay = document.createElement("div");
  overlay.className = "nav-overlay";
  overlay.id = "navOverlay";
  document.body.appendChild(overlay);

  function openNav() {
    navLinks.classList.remove("hide4");
    navLinks.classList.add("mobile-open");
    document.body.classList.add("nav-open");
  }

  function closeNav() {
    navLinks.classList.remove("mobile-open");
    navLinks.classList.add("hide4");
    document.body.classList.remove("nav-open");
  }

  toggles.forEach(function (toggle) {
    toggle.style.cursor = "pointer";
    toggle.addEventListener("click", function () {
      if (navLinks.classList.contains("mobile-open")) {
        closeNav();
      } else {
        openNav();
      }
    });
  });

  overlay.addEventListener("click", closeNav);

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  // If the window is resized past desktop width while the menu is
  // open, the desktop layout takes over — make sure mobile state
  // doesn't linger underneath it.
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024) closeNav();
  });
}

/* Builds a small self-contained panel for pages that don't include
   the real #navLinks menu (currently: the event creation flow). */
function initFallbackMenu(toggles) {
  if (document.getElementById("navPanel")) return;

  const overlay = document.createElement("div");
  overlay.className = "nav-overlay";
  overlay.id = "navOverlay";

  const panel = document.createElement("nav");
  panel.className = "nav-panel";
  panel.id = "navPanel";
  panel.setAttribute("aria-label", "Main menu");
  panel.innerHTML =
    '<button type="button" class="nav-close" id="navClose" aria-label="Close menu">\u2715</button>' +
    '<ul class="nav-links-fallback">' +
    '<li><a href="index.html">Home</a></li>' +
    '<li><a href="index.html#core-features">Core Features</a></li>' +
    '<li><a href="index.html#how-it-works">How It Works</a></li>' +
    '<li><a href="event-details.html" class="nav-cta">Create Event</a></li>' +
    "</ul>";

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  function openNav() {
    document.body.classList.add("nav-open");
  }

  function closeNav() {
    document.body.classList.remove("nav-open");
  }

  toggles.forEach(function (toggle) {
    toggle.style.cursor = "pointer";
    toggle.addEventListener("click", function () {
      if (document.body.classList.contains("nav-open")) {
        closeNav();
      } else {
        openNav();
      }
    });
  });

  overlay.addEventListener("click", closeNav);
  document.getElementById("navClose").addEventListener("click", closeNav);

  panel.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });
}
