const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// The header (theme toggle and menu) is the shared site chrome: /assets/trebell-chrome.js.

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
