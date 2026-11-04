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

const tabNames = new Set([ "home", "roster", "services", "mods", "payouts", "social", "staff", "partners", "faq", "about", "ix", "ix-socials", "ix-about" ]);

const tabTriggers = document.querySelectorAll("[data-tab], [data-tab-link]");

const tabPanels = document.querySelectorAll("[data-tab-panel]");

const tabAliases = { "ix-discord": "ix-socials", "ix-challengermode": "ix-socials" };

const openTab = (requestedTab, updateHistory = true) => {
  requestedTab = tabAliases[requestedTab] || requestedTab;
  const tab = tabNames.has(requestedTab) ? requestedTab : "home";
  const isIx = tab === "ix" || tab.startsWith("ix-");
  const ixView = isIx ? (tab === "ix" ? "home" : tab.slice(3)) : null;
  document.body.classList.toggle("ix-view", isIx);
  document.body.classList.toggle("partners-view", tab === "partners");
  document.body.classList.toggle("home-view", tab === "home");
  tabPanels.forEach(panel => {
    const active = panel.dataset.tabPanel === tab || (isIx && panel.dataset.tabPanel === "ix");
    panel.hidden = !active;
    panel.setAttribute("aria-hidden", String(!active));
  });
  document.querySelectorAll("[data-tab]").forEach(trigger => {
    const active = trigger.dataset.tab === tab || (isIx && trigger.dataset.tab === "ix");
    trigger.classList.toggle("active", active);
    trigger.setAttribute("aria-selected", String(active));
    if (active) trigger.setAttribute("aria-current", "page"); else trigger.removeAttribute("aria-current");
  });
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) favicon.setAttribute("href", isIx ? "files/assets/ix-mark.webp" : "files/acid-mark-transparent.webp");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isIx ? "#031a18" : "#090909");
  const ixRoot = document.getElementById("ix");
  if (ixRoot) {
    ixRoot.dataset.view = ixView || "home";
    ixRoot.querySelectorAll("[data-ix-panel]").forEach(p => { p.hidden = !(isIx && p.dataset.ixPanel === ixView); });
    ixRoot.querySelectorAll("[data-ix-link]").forEach(l => {
      const on = isIx && l.dataset.ixLink === ixView;
      l.classList.toggle("ix-active", on);
      l.setAttribute("aria-selected", String(on));
      if (on) l.setAttribute("aria-current", "page"); else l.removeAttribute("aria-current");
    });
    document.getElementById("ix-nav")?.classList.remove("ix-open");
    ixRoot.querySelector(".ix-menu-toggle")?.setAttribute("aria-expanded", "false");
  }
  if (updateHistory) history.pushState({
    tab: tab
  }, "", `#${tab}`);
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
  document.title = isIx ? ({ home: "The IX Realms | Competitive Brawlhalla League", socials: "Socials | The IX Realms", about: "About | The IX Realms" })[ixView] : tab === "home" ? "Acid | Org" : tab === "faq" ? "FAQs | Acid" : `${tab.charAt(0).toUpperCase() + tab.slice(1)} | Acid`;
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

// Scroll-progress bar fallback for browsers without animation-timeline (Firefox)
const setScrollProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty("--scroll", max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0);
};

window.addEventListener("scroll", setScrollProgress, {
  passive: true
});

window.addEventListener("resize", setScrollProgress);

if (window.ResizeObserver) new ResizeObserver(setScrollProgress).observe(document.body);

setScrollProgress();

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

// ===== The IX Realms: menu movil =====
(() => {
  const t = document.querySelector("#ix .ix-menu-toggle"), n = document.getElementById("ix-nav");
  if (!t || !n) return;
  t.addEventListener("click", () => {
    const o = n.classList.toggle("ix-open");
    t.setAttribute("aria-expanded", o ? "true" : "false");
  });
})();

// ===== The IX Realms: pie de pagina siempre al fondo (compensa html{zoom}) =====
(() => {
  const root = document.getElementById("ix");
  if (!root) return;
  const fit = () => {
    const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    root.style.minHeight = (window.innerHeight / z) + "px";
  };
  fit();
  window.addEventListener("resize", fit);
})();

// ===== The IX Realms: recolorea en vivo los verdes de la mascota al acento turquesa de IX =====
// Funciona con TODAS las imagenes marcadas con [data-ix-recolor] dentro de #ix
// (mascota de Discord + las mascotas de YouTube, Twitch, X y TikTok en IX Socials)
(() => {
  const root = document.getElementById("ix");
  const imgs = root ? root.querySelectorAll("img[data-ix-recolor]") : [];
  if (!imgs.length) return;
  const hexHue = hex => {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
    if (!m) return 170;
    const [r, g, b] = [1, 2, 3].map(i => parseInt(m[i], 16) / 255);
    const mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
    if (!d) return 170;
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  };
  const shift = hexHue(getComputedStyle(root).getPropertyValue("--accent") || "#1de9c4") - 102;
  const recolor = img => {
    const original = img.getAttribute("src");
    const src = new Image();
    src.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = src.naturalWidth; c.height = src.naturalHeight;
        const ctx = c.getContext("2d");
        ctx.drawImage(src, 0, 0);
        const data = ctx.getImageData(0, 0, c.width, c.height), p = data.data;
        for (let i = 0; i < p.length; i += 4) {
          if (p[i + 3] < 13) continue;
          const r = p[i] / 255, g = p[i + 1] / 255, b = p[i + 2] / 255;
          const mx = Math.max(r, g, b), d = mx - Math.min(r, g, b);
          if (!d || d / mx <= 0.25) continue;
          let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
          h = (h * 60 + 360) % 360;
          if (h <= 70 || h >= 165) continue;           // solo los verdes
          const nh = ((h + shift) % 360 + 360) % 360 / 60, s = d / mx;
          const k = Math.floor(nh) % 6, f = nh - Math.floor(nh);
          const q = mx * (1 - s), u = mx * (1 - s * f), t = mx * (1 - s * (1 - f));
          const rgb = [[mx, t, q], [u, mx, q], [q, mx, t], [q, u, mx], [t, q, mx], [mx, q, u]][k];
          p[i] = rgb[0] * 255; p[i + 1] = rgb[1] * 255; p[i + 2] = rgb[2] * 255;
        }
        ctx.putImageData(data, 0, 0);
        img.src = c.toDataURL("image/png");
      } catch (e) { /* abierto como file://: se deja la imagen original */ }
    };
    src.src = original;
  };
  imgs.forEach(recolor);
})();
