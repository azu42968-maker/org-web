let clickAudioCtx;

const playClickSound = () => {
  clickAudioCtx = clickAudioCtx || new (window.AudioContext || window.webkitAudioContext);
  if (clickAudioCtx.state === "suspended") clickAudioCtx.resume();
  const now = clickAudioCtx.currentTime;
  const osc = clickAudioCtx.createOscillator();
  const gain = clickAudioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + .08);
  gain.gain.setValueAtTime(.08, now);
  gain.gain.exponentialRampToValueAtTime(1e-4, now + .09);
  osc.connect(gain).connect(clickAudioCtx.destination);
  osc.start(now);
  osc.stop(now + .1);
};

document.addEventListener("click", event => {
  if (event.target.closest(".button, .filters button, .menu-toggle, .chat-launch, .chat-close, .dialog-close")) playClickSound();
});

const header = document.querySelector(".site-header");

const menuButton = document.querySelector(".menu-toggle");

const nav = document.querySelector("#site-nav");

const tabNames = new Set([ "home", "roster", "services", "social", "staff", "partners", "faq", "about" ]);

const tabTriggers = document.querySelectorAll("[data-tab], [data-tab-link]");

const tabPanels = document.querySelectorAll("[data-tab-panel]");

const openTab = (requestedTab, updateHistory = true) => {
  const tab = tabNames.has(requestedTab) ? requestedTab : "home";
  document.body.classList.toggle("partners-view", tab === "partners");
  document.body.classList.toggle("home-view", tab === "home");
  tabPanels.forEach(panel => {
    const active = panel.dataset.tabPanel === tab;
    panel.hidden = !active;
    panel.setAttribute("aria-hidden", String(!active));
  });
  document.querySelectorAll("[data-tab]").forEach(trigger => {
    const active = trigger.dataset.tab === tab;
    trigger.classList.toggle("active", active);
    trigger.setAttribute("aria-selected", String(active));
    if (active) trigger.setAttribute("aria-current", "page"); else trigger.removeAttribute("aria-current");
  });
  if (updateHistory) history.pushState({
    tab: tab
  }, "", `#${tab}`);
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
  document.title = tab === "home" ? "Acid | Org" : tab === "faq" ? "FAQs | Acid" : `${tab.charAt(0).toUpperCase() + tab.slice(1)} | Acid`;
};

tabTriggers.forEach(trigger => trigger.addEventListener("click", event => {
  const tab = trigger.dataset.tab || trigger.dataset.tabLink;
  if (!tab) return;
  event.preventDefault();
  openTab(tab);
}));

window.addEventListener("popstate", () => openTab(location.hash.slice(1), false));

openTab(location.hash.slice(1), false);

window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 48), {
  passive: true
});

menuButton.addEventListener("click", () => {
  const open = !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("modal-open", open);
});

nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("modal-open");
}));

document.querySelectorAll(".filters button").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".filters button").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  const filter = button.dataset.filter;
  document.querySelectorAll(".player-card").forEach(card => card.classList.toggle("hidden", filter !== "all" && card.dataset.category !== filter));
}));