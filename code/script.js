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
// Tasks resolved on each fresh benchmark pool (independent verifier): Trebell Native vs Codex using the OpenAI API,
// same model and settings. Bar widths are the share of the pool resolved.
const benchmark = {
  codex:   { swe: "124 / 156", tb2: "62 / 78", tbpro: "21 / 40", ws: "79.5%", wt: "79.5%", wp: "52.5%" },
  trebell: { swe: "125 / 156", tb2: "62 / 78", tbpro: "22 / 40", ws: "80.1%", wt: "79.5%", wp: "55%" }
};
const buttons = [...document.querySelectorAll("[data-benchmark]")];
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
function setWidth(id, value) {
  const el = document.getElementById(id);
  if (el) el.style.setProperty("--w", value);
}
function setBenchmark(mode) {
  const data = benchmark[mode];
  if (!data) return;
  setText("metric-swe", data.swe);
  setText("metric-tb2", data.tb2);
  setText("metric-tbpro", data.tbpro);
  setWidth("bar-swe", data.ws);
  setWidth("bar-tb2", data.wt);
  setWidth("bar-tbpro", data.wp);
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

/* ---------- Screenshot tabs ---------- */
// One tab per screen; its panel and its caption line show, the others hide. Arrow keys, Home and End move between tabs.
const shotTabs = [...document.querySelectorAll(".shot-tabs [role='tab']")];
function selectShot(tab, focus) {
  const panelId = tab.getAttribute("aria-controls");
  shotTabs.forEach((other) => {
    const active = other === tab;
    other.setAttribute("aria-selected", String(active));
    other.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(other.getAttribute("aria-controls"));
    if (panel) panel.hidden = !active;
  });
  document.querySelectorAll(".shot-desc[data-shot]").forEach((line) => {
    line.hidden = line.dataset.shot !== panelId;
  });
  if (focus) tab.focus();
}
shotTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectShot(tab, false));
  tab.addEventListener("keydown", (event) => {
    const last = shotTabs.length - 1;
    const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectShot(shotTabs[next], true);
  });
});

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
