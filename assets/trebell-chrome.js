// Trebell site chrome: the header's theme toggle and menu, the same on every page of trebell.dev and code.trebell.dev.
// The theme is the data-theme attribute on <html> that each page's head script sets before first paint ("dark" or
// "light", kept in localStorage as trebell-theme); the page's own stylesheet and /assets/trebell-chrome.css both follow it.
(function () {
  var root = document.documentElement;
  var header = document.querySelector(".tc-header");
  if (!header) return;
  var KEY = "trebell-theme";
  var themeButton = header.querySelector(".tc-theme");
  var menuButton = header.querySelector(".tc-menu");
  var nav = header.querySelector(".tc-nav");

  /* ---------- Theme ---------- */
  function currentTheme() { return root.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function storedTheme() {
    try { var value = localStorage.getItem(KEY); return value === "light" || value === "dark" ? value : null; } catch (e) { return null; }
  }
  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f7f5f1" : "#141318");
    if (persist) { try { localStorage.setItem(KEY, theme); } catch (e) {} }
    if (themeButton) {
      var label = theme === "light" ? "Switch to dark mode" : "Switch to light mode";
      themeButton.setAttribute("aria-label", label);
      themeButton.setAttribute("title", label);
    }
  }
  if (themeButton) {
    themeButton.addEventListener("click", function () { applyTheme(currentTheme() === "light" ? "dark" : "light", true); });
  }
  applyTheme(currentTheme(), false);
  // Until the visitor picks a theme with the toggle, follow the system's light or dark setting.
  if (window.matchMedia) {
    var scheme = window.matchMedia("(prefers-color-scheme: light)");
    var follow = function (event) { if (!storedTheme()) applyTheme(event.matches ? "light" : "dark", false); };
    if (scheme.addEventListener) scheme.addEventListener("change", follow);
    else if (scheme.addListener) scheme.addListener(follow);
  }

  /* ---------- Menu (below 901px wide the links move into a drawer under the bar) ---------- */
  if (!menuButton || !nav) return;
  var compact = window.matchMedia ? window.matchMedia("(max-width: 900px)") : null;
  function isOpen() { return header.classList.contains("tc-open"); }
  function setOpen(open, focusTarget) {
    header.classList.toggle("tc-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (focusTarget) focusTarget.focus();
  }
  // Opening moves focus to the first link; Escape closes and returns focus to the button.
  menuButton.addEventListener("click", function () {
    if (isOpen()) setOpen(false, null);
    else setOpen(true, nav.querySelector("a"));
  });
  document.addEventListener("keydown", function (event) {
    if ((event.key === "Escape" || event.key === "Esc") && isOpen()) {
      event.preventDefault();
      setOpen(false, menuButton);
    }
  });
  // A click anywhere outside the drawer and its button closes it, as does a click on one of its links.
  document.addEventListener("click", function (event) {
    if (isOpen() && !nav.contains(event.target) && !menuButton.contains(event.target)) setOpen(false, null);
  });
  nav.addEventListener("click", function (event) {
    if (isOpen() && event.target.closest && event.target.closest("a")) setOpen(false, null);
  });
  // Tabbing out of the header closes it too.
  header.addEventListener("focusout", function (event) {
    if (isOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false, null);
  });
  // Widening the window past the breakpoint shows the links in the bar again: reset the drawer.
  if (compact) {
    var onLayout = function () { if (!compact.matches && isOpen()) setOpen(false, null); };
    if (compact.addEventListener) compact.addEventListener("change", onLayout);
    else if (compact.addListener) compact.addListener(onLayout);
  }
})();
