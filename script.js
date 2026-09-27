const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const progress = document.getElementById("scroll-progress-bar");
function updateProgress() {
  const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = max > 0 ? (document.documentElement.scrollTop / max) * 100 : 0;
  progress.style.width = Math.min(100, pct) + "%";
}
updateProgress();
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

const menuButton = document.getElementById("menu-button");
const mobileMenu = document.getElementById("mobile-menu");
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  mobileMenu.classList.toggle("open", !open);
});
mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("open");
}));

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

const benchmark = {
  baseline: { input: "31,920", turns: "10", tools: "17", wi: "100%", wt: "100%", wc: "100%" },
  trebell: { input: "9,191", turns: "4", tools: "6", wi: "28.8%", wt: "40%", wc: "35.3%" }
};
const buttons = [...document.querySelectorAll("[data-benchmark]")];
function setBenchmark(mode) {
  const data = benchmark[mode];
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
buttons.forEach((button) => button.addEventListener("click", () => setBenchmark(button.dataset.benchmark)));
setBenchmark("trebell");
