const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Mobile menu ---------- */
const menuButton = document.getElementById("menu-button");
const mobileMenu = document.getElementById("mobile-menu");
if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    menuButton.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    mobileMenu.classList.toggle("open", !open);
  });
  mobileMenu.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open menu");
      mobileMenu.classList.remove("open");
    })
  );
}

/* ---------- Reveal on scroll ---------- */
if (reduced || !("IntersectionObserver" in window)) {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ---------- Benchmark toggle ---------- */
const benchmark = {
  codex:   { input: "58.17M", turns: "1.095M", tools: "157.2 min", wi: "100%", wt: "100%", wc: "100%" },
  trebell: { input: "19.60M", turns: "426k",   tools: "49.8 min",  wi: "33.7%", wt: "38.9%", wc: "31.7%" }
};
const buttons = [...document.querySelectorAll("[data-benchmark]")];
function setBenchmark(mode) {
  const data = benchmark[mode];
  if (!data) return;
  document.getElementById("metric-input").textContent = data.input;
  document.getElementById("metric-turns").textContent = data.turns;
  document.getElementById("metric-tools").textContent = data.tools;
  document.getElementById("bar-input").style.setProperty("--w", data.wi);
  document.getElementById("bar-turns").style.setProperty("--w", data.wt);
  document.getElementById("bar-tools").style.setProperty("--w", data.wc);
  buttons.forEach((button) => {
    const active = button.dataset.benchmark === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
}
buttons.forEach((button) =>
  button.addEventListener("click", () => setBenchmark(button.dataset.benchmark))
);
setBenchmark("trebell");

/* ---------- Theme toggle ---------- */
const themeToggle = document.getElementById("theme-toggle");
const rootEl = document.documentElement;

function currentTheme() {
  return rootEl.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function setTheme(theme, persist) {
  rootEl.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f7f5f1" : "#141318");
  if (persist) {
    try { localStorage.setItem("trebell-theme", theme); } catch (e) {}
  }
  if (themeToggle) {
    const light = theme === "light";
    themeToggle.setAttribute("aria-pressed", String(light));
    const label = light ? "Switch to dark mode" : "Switch to light mode";
    themeToggle.setAttribute("aria-label", label);
    themeToggle.setAttribute("title", label);
  }
}

if (themeToggle) {
  themeToggle.addEventListener("click", () =>
    setTheme(currentTheme() === "light" ? "dark" : "light", true)
  );
}
setTheme(currentTheme(), false); // sync button/meta on load without persisting

/* Follow the OS preference until the user makes an explicit choice */
let storedTheme = null;
try { storedTheme = localStorage.getItem("trebell-theme"); } catch (e) {}
if (!storedTheme) {
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  const follow = (e) => setTheme(e.matches ? "light" : "dark", false);
  if (mq.addEventListener) mq.addEventListener("change", follow);
  else if (mq.addListener) mq.addListener(follow);
}
