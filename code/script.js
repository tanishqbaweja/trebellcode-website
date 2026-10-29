// The header (theme toggle and menu) is the shared site chrome: /assets/trebell-chrome.js.

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
