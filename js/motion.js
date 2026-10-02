/* Behaviour: theme, smooth scroll, nav, filters, previews, routing to project pages and viewers, scroll motion.
   The page is complete without this file. */
(() => {
  const root = document.documentElement, app = document.getElementById("app");
  const nav = document.getElementById("nav"), prog = document.getElementById("progress");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap, ST = window.ScrollTrigger, motion = !reduce && G && ST;

  /* ---------- Day / night ---------- */
  const mqDark = matchMedia("(prefers-color-scheme: dark)");
  const theme = () => root.dataset.theme || (mqDark.matches ? "dark" : "light");
  try { const s = localStorage.getItem("kd-theme"); if (s === "dark" || s === "light") root.dataset.theme = s; } catch (e) {}
  const syncLabels = () => document.querySelectorAll(".theme-btn").forEach(b => b.setAttribute("aria-label", theme() === "dark" ? "Switch to day mode" : "Switch to night mode"));
  syncLabels();
  document.addEventListener("click", e => {
    const tb = e.target.closest(".theme-btn"); if (!tb) return;
    const next = theme() === "dark" ? "light" : "dark";
    const apply = () => { root.dataset.theme = next; syncLabels(); try { localStorage.setItem("kd-theme", next); } catch (err) {} };
    if (document.startViewTransition && !reduce) {
      const r = tb.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const vt = document.startViewTransition(apply);
      vt.ready.then(() => root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] }, { duration: 750, easing: "cubic-bezier(.22,.61,.36,1)", pseudoElement: "::view-transition-new(root)" })).catch(() => {});
    } else apply();
  });

  /* ---------- Native scrolling (no smooth-scroll library: it blocked the wheel inside overlays) ---------- */
  if (motion) G.registerPlugin(ST);
  // the arrival (js/home.js) starts every visit on the hero: ScrollTrigger is told too, or each of its refreshes sets the
  // browser back to restoring the old scroll position on a reload
  if (motion && root.classList.contains("ls-lock") && !/^#project-/.test(location.hash) && ST.clearScrollMemory) ST.clearScrollMemory("manual");
  window.pageScroll = { stop: () => {}, start: () => {}, resize: () => { if (motion) ST.refresh(); } };

  /* ---------- Clicks: in-page nav, open project, open deck, open image ---------- */
  app.addEventListener("click", e => {
    const go = e.target.closest("[data-goto]");
    if (go) {
      e.preventDefault(); e.stopPropagation();
      const t = document.getElementById(go.dataset.goto); if (!t) return;
      if (window.closeCase && document.getElementById("case").classList.contains("open")) window.closeCase();
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      return;
    }
    const op = e.target.closest("[data-open]");
    if (op) { e.preventDefault(); if (window.openCase) window.openCase(op.dataset.open, op.closest(".work") || op); return; }
    const dk = e.target.closest("[data-deck]");
    if (dk && window.openDeck) { window.openDeck(+dk.dataset.deck); return; }
    const one = e.target.closest("[data-lb-src]");
    if (one && window.openLightbox) { window.openLightbox([{ src: one.dataset.lbSrc, caption: one.dataset.lbCap || "" }], 0); return; }
    const grp = e.target.closest("[data-lb-group]");
    if (grp && window.openLightbox) {
      const i = +grp.dataset.lbGroup.replace("pub", "");
      window.openLightbox((PUBLICATIONS[i].figures || []).map((f, k) => ({ src: f.src, caption: D.pubs[i].figs[k] || f.caption })), +grp.dataset.lbIndex);
    }
    const more = e.target.closest("[data-more]");
    if (more) {
      const ul = more.previousElementSibling, open = ul.classList.toggle("open");
      more.textContent = open ? more.dataset.less : more.dataset.all;
      window.pageScroll.resize();
    }
  }, true);

  /* ---------- Nav (fixed and always shown; it only changes colour over the night hero), progress, scrollspy ---------- */
  const onScroll = () => {
    const y = scrollY;
    const fl = document.getElementById("top"); nav.classList.toggle("over-hero", !!fl && fl.offsetParent !== null && y < fl.offsetTop + fl.offsetHeight - innerHeight * .35);
    const h = root.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const links = app.querySelectorAll("[data-spy]");
  const spy = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(l => l.classList.toggle("on", l.dataset.spy === en.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach(l => { const s = document.getElementById(l.dataset.spy); if (s) spy.observe(s); });

  /* ---------- Segmented filters ---------- */
  const place = seg => {
    const ind = seg.querySelector(".seg-ind"), b = seg.querySelector('[aria-pressed="true"]'), btns = [...seg.querySelectorAll("button")];
    seg.classList.toggle("wrapped", btns.some(x => x.offsetTop !== btns[0].offsetTop));
    if (ind && b) { ind.style.width = b.offsetWidth + "px"; ind.style.transform = `translateX(${b.offsetLeft - 4}px)`; }
  };
  const segs = app.querySelectorAll(".seg");
  segs.forEach(seg => { place(seg); seg.addEventListener("click", e => { if (!e.target.closest("button")) return; place(seg); requestAnimationFrame(window.pageScroll.resize); }); });
  addEventListener("resize", () => segs.forEach(place));
  if (document.fonts) document.fonts.ready.then(() => segs.forEach(place));
  app.querySelectorAll("details").forEach(d => d.addEventListener("toggle", window.pageScroll.resize));

  /* ---------- Project card previews: a video or a photo sequence on hover (in view on touch screens) ---------- */
  const touch = matchMedia("(hover: none)").matches;
  app.querySelectorAll(".work").forEach(card => {
    const v = card.querySelector(".work-prev"), frames = [...card.querySelectorAll(".work-frames img")];
    let timer = 0, fi = 0;
    const start = () => {
      if (reduce) return;
      if (v) { v.preload = "auto"; v.play().then(() => card.classList.add("playing")).catch(() => {}); }
      if (frames.length) { clearInterval(timer); frames[fi].classList.add("on"); timer = setInterval(() => { frames[fi].classList.remove("on"); fi = (fi + 1) % frames.length; frames[fi].classList.add("on"); }, 420); }
    };
    const stop = () => { if (v) { v.pause(); card.classList.remove("playing"); } clearInterval(timer); frames.forEach(f => f.classList.remove("on")); };
    if (touch) new IntersectionObserver(([e]) => e.isIntersecting ? start() : stop(), { threshold: .6 }).observe(card);
    else { card.addEventListener("pointerenter", start); card.addEventListener("pointerleave", stop); }
  });

  /* ---------- Hash routing for project pages ---------- */
  const route = () => {
    const m = location.hash.match(/^#project-([a-z-]+)$/);
    if (m && window.openCase) window.openCase(m[1]);
  };
  addEventListener("hashchange", route);
  setTimeout(route, 0);

  const meters = app.querySelectorAll(".meter");
  if (!motion) { meters.forEach(m => m.classList.add("on")); return; }

  /* ---------- Hero intro ---------- */
  if (!document.querySelector("#flight-stage.ls")) {      // (with the arrival scene, css/intro.css plays this on the compositor)
    G.from(".hero-name .ln > span", { yPercent: 110, duration: 1.3, ease: "power4.out", stagger: 0.12, delay: 0.15 });
    G.from([".c0 .eyebrow", ".hero-tag", ".c0 .actions"], { y: 26, opacity: 0, duration: 1.1, ease: "power3.out", stagger: 0.08, delay: 0.4 });
    G.from("#wing", { opacity: 0, duration: 2, ease: "power2.out" });
  }

  /* ---------- Statement: words light up as you read ---------- */
  const q = document.getElementById("quote");
  q.innerHTML = q.textContent.split(" ").map(w => `<span class="w">${esc(w)}</span>`).join(" ");
  G.fromTo("#quote .w", { opacity: 0.15 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".statement", start: "top 70%", end: "center 42%", scrub: true } });

  /* ---------- Reveals, timeline, meters, parallax ---------- */
  G.set("[data-reveal]", { opacity: 0, y: 40 });
  ST.batch("[data-reveal]", { start: "top 92%", once: true, onEnter: b => G.to(b, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08, overwrite: true, clearProps: "transform" }) });
  G.fromTo("#tl-fill", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#timeline", start: "top 72%", end: "bottom 62%", scrub: true } });
  app.querySelectorAll(".tl-item").forEach(li => ST.create({ trigger: li, start: "top 64%", toggleClass: { targets: li, className: "lit" } }));
  meters.forEach(m => ST.create({ trigger: m, start: "top 92%", once: true, onEnter: () => m.classList.add("on") }));
  G.utils.toArray("[data-parallax]").forEach(el => G.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }));

  /* ---------- Keep measurements right as images and fonts arrive ---------- */
  let rt = 0;
  const remeasure = () => { clearTimeout(rt); rt = setTimeout(() => ST.refresh(), 150); };
  // only when the page content actually changes height (an image arriving without a reserved box), not on every image
  // load: a refresh re-measures every trigger by scrolling the whole page, which stalls a scroll in progress
  let appH = -1;
  new ResizeObserver(([e]) => {
    if (document.body.classList.contains("case-open")) return;      // a project page is showing; closing it refreshes
    const h = Math.round(e.contentRect.height); if (appH >= 0 && h !== appH) remeasure(); appH = h;
  }).observe(app);
  addEventListener("load", remeasure);
  if (document.fonts) document.fonts.ready.then(remeasure);
  ST.addEventListener("refresh", () => G.utils.toArray("[data-reveal]").forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight && +getComputedStyle(el).opacity < 0.05) G.to(el, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
  }));
})();
