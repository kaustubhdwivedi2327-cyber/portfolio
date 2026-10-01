/* Project pages, opened in place over the homepage. All text and media come from js/data.js (PROJECTS). */
(() => {
  const box = document.getElementById("case");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = null, lastFocus = null, io = null, seqTimers = [], homeY = 0;
  const ARW = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  const BACK = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>`;
  // steps without a figure of their own show the project's matching one (or keep the previous figure), so the pinned panel never goes blank
  const STEP_FIG = { "gearbox:2": "assets/gearbox/04_modularity.jpg", "gearbox:3": "assets/gearbox/05_prototype_pictures.jpg", "bird-strike:6": "assets/bird-strike/d24_testing.jpg",
    "lattice:3": "assets/pubs/cover_mtcomm.jpg", "lattice:4": "assets/pubs/cover_crc.jpg" };
  const capFor = (p, src) => { const m = (p.images || []).find(x => x.src === src); if (m) return m.caption || ""; const pub = PUBLICATIONS.find(x => x.cover === src); return pub ? (pub.venue.split(" in ")[1] || pub.venue) : ""; };
  const stepsOf = p => { let prev = null; return (p.steps || []).map((s, i) => {
    const src = s.image || STEP_FIG[p.id + ":" + i] || (prev && prev.image) || "";
    const cap = s.image ? (s.imageCaption || "") : (prev && src === prev.image) ? prev.imageCaption : capFor(p, src);
    return (prev = Object.assign({}, s, { image: src, imageCaption: cap })); }); };
  // intrinsic sizes let every figure reserve its box before it loads, so nothing jumps while images arrive
  const wh = src => { const z = (window.IMG_SIZE || {})[src]; return z ? ` width="${z[0]}" height="${z[1]}"` : ""; };
  const secHead = (label, note = "") => `<header class="cs-head" data-rv><p class="kicker">${esc(label)}</p>${note ? `<p class="cs-note">${esc(note)}</p>` : ""}</header>`;

  function html(p, idx) {
    const next = PROJECTS[(idx + 1) % PROJECTS.length], steps = stepsOf(p);
    const S = [];
    S.push(`<div class="cs-bar"><button type="button" class="cs-back" data-cs-close>${BACK}<span>All projects</span></button>
      <p class="cs-bar-title">${esc(p.title)}</p>
      <div class="cs-bar-r"><span class="cs-count">${String(idx + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}</span>
      <button type="button" class="cs-arrow" data-cs-step="-1" aria-label="Previous project">${BACK}</button><button type="button" class="cs-arrow" data-cs-step="1" aria-label="Next project">${ARW}</button>
      <button type="button" class="theme-btn" aria-label="Switch theme">${SUN}${MOON}</button></div></div>`);
    S.push(`<header class="cs-hero"><div class="cs-hero-media"><img src="${p.hero || p.cover}" alt=""${p.heroPos ? ` style="object-position:${esc(p.heroPos)}"` : ""}></div><div class="cs-hero-shade"></div>
      <div class="wrap cs-hero-in"><p class="kicker">${esc(p.category)} \u00b7 ${esc(p.period)}</p><h1>${esc(p.title)}</h1><p class="cs-sub">${esc(p.subtitle)}</p>
      <dl class="cs-meta"><div><dt>Context</dt><dd>${esc(p.org)}</dd></div><div><dt>Role</dt><dd>${esc(p.role)}</dd></div></dl></div></header>`);
    S.push(`<section class="wrap cs-metrics">${p.metrics.map(m => `<div class="cs-metric" data-rv><b data-num="${esc(m.value)}">${esc(m.value)}</b><span>${esc(m.label)}</span></div>`).join("")}</section>`);
    S.push(`<section class="wrap cs-intro"><p class="cs-summary" data-rv>${esc(p.summary)}</p>
      <div class="cs-side" data-rv><ul class="chips">${p.tags.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      ${(p.links || []).map(l => `<a class="cs-link" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} \u2197</a>`).join("")}</div></section>`);
    if (p.highlights && p.highlights.length) S.push(`<section class="wrap cs-sec">${secHead("Highlights")}<ol class="cs-high">${p.highlights.map(h => `<li data-rv>${esc(h)}</li>`).join("")}</ol></section>`);
    if (steps.length) S.push(`<section class="wrap cs-sec">${secHead("Method")}<ol class="cs-method">${steps.map((s, i) => {
      const own = s.image && !(i && s.image === steps[i - 1].image);
      return `<li class="cs-mrow${own ? "" : " solo"}"><div class="cs-mtext" data-rv><span class="cs-step-n">${String(i + 1).padStart(2, "0")}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div>
        ${own ? `<button type="button" class="cs-mfig" data-shot="${i}" aria-label="Enlarge: ${esc(s.title)}"><span class="cs-frame"><img src="${s.image}" alt=""${wh(s.image)} loading="lazy" decoding="async"></span><span class="cs-cap">${esc(s.imageCaption || "")}</span></button>` : ""}</li>`; }).join("")}</ol></section>`);
    (p.sequences || []).forEach((q, k) => S.push(`<section class="wrap cs-sec">${secHead(q.title, q.caption || "")}
      <div class="cs-seq" data-seq="${k}"><div class="cs-seq-frames">${q.frames.map((f, i) => `<img src="${f}" alt=""${wh(f)} loading="lazy" decoding="async" class="${i ? "" : "on"}">`).join("")}</div>
      <div class="cs-seq-ui"><button type="button" class="cs-play" aria-label="Play sequence">\u25b6</button><input type="range" min="0" max="${q.frames.length - 1}" value="0" step="1" aria-label="Frame"><span class="cs-seq-lab">${esc((q.labels && q.labels[0]) || `1 / ${q.frames.length}`)}</span></div></div></section>`));
    if (p.videos && p.videos.length) S.push(`<section class="wrap cs-sec">${secHead("Videos", p.videosNote || "")}<div class="cs-videos${p.videos.length === 1 ? " one" : ""}">${p.videos.map(v => `
      <figure class="cs-video"><video src="${v.src}" poster="${v.poster || ""}" controls preload="none" playsinline></video><figcaption><b>${esc(v.title || "")}</b>${esc(v.caption || "")}</figcaption></figure>`).join("")}</div></section>`);
    if (p.compare && p.compare.length) S.push(`<section class="wrap cs-sec">${secHead("Before and after")}<div class="cs-compare">${p.compare.map(c => `
      <figure class="cs-cmp"><div class="cs-cmp-box" style="--pos:50%"><img src="${c.after}" alt=""${wh(c.after)} loading="lazy" decoding="async"><div class="cs-cmp-before"><img src="${c.before}" alt=""${wh(c.before)} loading="lazy" decoding="async"></div>
      <span class="cs-cmp-l">${esc(c.beforeLabel || "")}</span><span class="cs-cmp-r">${esc(c.afterLabel || "")}</span><span class="cs-cmp-handle" aria-hidden="true"></span>
      <input type="range" min="0" max="100" value="50" aria-label="${esc(c.title)}: drag to compare"></div><figcaption>${esc(c.title)}</figcaption></figure>`).join("")}</div></section>`);
    if (p.charts && p.charts.length) S.push(`<section class="wrap cs-sec">${secHead("Results")}<div class="cs-charts">${p.charts.map((c, i) => `<div class="cs-chart" data-chart="${i}" data-rv></div>`).join("")}</div></section>`);
    if (p.images && p.images.length) S.push(`<section class="wrap cs-sec">${secHead("Gallery")}<div class="cs-gallery${p.images.length > 9 ? " clamp" : ""}">${p.images.map((m, i) => `
      <button type="button" class="cs-g" data-g="${i}"><span class="cs-frame"><img src="${m.src}" alt=""${wh(m.src)} loading="lazy" decoding="async"></span><span class="cs-cap">${esc(m.caption || "")}</span></button>`).join("")}</div>
      ${p.images.length > 9 ? `<button type="button" class="more cs-gmore" data-gmore>Show all ${p.images.length} figures</button>` : ""}</section>`);
    S.push(`<button type="button" class="cs-next" data-cs-step="1"><img src="${next.cover}" alt=""${wh(next.cover)} loading="lazy" decoding="async"><span class="cs-next-in"><span class="kicker">${esc(next.category)}</span><span class="cs-next-t">${esc(next.title)}</span><span class="cs-next-go">View project ${ARW}</span></span></button>`);
    return S.join("");
  }

  function wire(p) {
    // reveals and lazy charts, observed inside the overlay's own scroll
    io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      if (e.target.dataset.chart != null && !e.target.dataset.done) { e.target.dataset.done = 1; renderChart(e.target, p.charts[+e.target.dataset.chart]); }
      if (e.target.matches(".cs-metric")) countUp(e.target.querySelector("b"));
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -8% 0px" });
    box.querySelectorAll("[data-rv]").forEach(n => reduce ? (n.classList.add("in"), n.dataset.chart != null && renderChart(n, p.charts[+n.dataset.chart])) : io.observe(n));

    // images fade in only once their pixels have arrived (their boxes are already sized)
    box.querySelectorAll("img").forEach(im => {
      if (im.complete) return;
      im.dataset.wait = "";
      const done = () => im.removeAttribute("data-wait");
      im.addEventListener("load", done, { once: true }); im.addEventListener("error", done, { once: true });
    });
    const gm = box.querySelector("[data-gmore]");
    if (gm) gm.addEventListener("click", () => { const g = box.querySelector(".cs-gallery"), open = g.classList.toggle("open"); gm.textContent = open ? "Show fewer" : `Show all ${p.images.length} figures`; });
    // sequences
    box.querySelectorAll("[data-seq]").forEach(el => {
      const q = p.sequences[+el.dataset.seq], imgs = [...el.querySelectorAll(".cs-seq-frames img")], r = el.querySelector("input"), lab = el.querySelector(".cs-seq-lab"), btn = el.querySelector(".cs-play");
      let t = 0;
      const set = k => { imgs.forEach((im, i) => im.classList.toggle("on", i === k)); r.value = k; lab.textContent = (q.labels && q.labels[k]) || `${k + 1} / ${imgs.length}`; };
      r.addEventListener("input", () => { clearInterval(t); btn.textContent = "\u25b6"; set(+r.value); });
      btn.addEventListener("click", () => {
        if (t) { clearInterval(t); t = 0; btn.textContent = "\u25b6"; btn.setAttribute("aria-label", "Play sequence"); return; }
        btn.textContent = "\u275a\u275a"; btn.setAttribute("aria-label", "Pause sequence");
        t = setInterval(() => set((+r.value + 1) % imgs.length), 450); seqTimers.push(t);
      });
    });
    // compare sliders
    box.querySelectorAll(".cs-cmp-box").forEach(b => { const r = b.querySelector("input"); r.addEventListener("input", () => b.style.setProperty("--pos", r.value + "%")); });
    // bar title appears once the hero scrolls away
    const bar = box.querySelector(".cs-bar");
    onScrollBar = () => bar.classList.toggle("solid", scrollY > innerHeight * .45);
  }

  let onScrollBar = () => {};
  addEventListener("scroll", () => { if (current) onScrollBar(); }, { passive: true });

  function countUp(b) {
    const m = (b.dataset.num || "").match(/^([\u2212-]?)(\d+(?:\.\d+)?)(.*)$/); if (!m || reduce) return;
    const end = parseFloat(m[2]), dec = (m[2].split(".")[1] || "").length, t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / 1300), v = end * (1 - Math.pow(1 - k, 4)); b.textContent = m[1] + v.toFixed(dec) + m[3]; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  function render(id) {
    const idx = PROJECTS.findIndex(p => p.id === id); if (idx < 0) return false;
    seqTimers.forEach(clearInterval); seqTimers = []; if (io) io.disconnect();
    box.innerHTML = html(PROJECTS[idx], idx); scrollTo(0, 0); current = id;
    // the first pictures of the page come first: fetched at once and ahead of anything else downloading
    [...box.querySelectorAll("img")].slice(0, 4).forEach(im => { im.loading = "eager"; im.fetchPriority = "high"; });
    wire(PROJECTS[idx]);
    box.setAttribute("aria-label", PROJECTS[idx].title);
    return true;
  }

  window.openCase = (id, from) => {
    if (current === id && box.classList.contains("open")) return;
    const wasOpen = box.classList.contains("open");
    if (!wasOpen) homeY = scrollY;
    if (!render(id)) return;
    try { if (location.hash !== "#project-" + id) history.pushState({ caseOpen: true }, "", "#project-" + id); } catch (e) {}
    if (wasOpen) return;
    lastFocus = document.activeElement;
    box.hidden = false; document.body.classList.add("case-open");
    scrollTo(0, 0);
    if (window.gsap && !reduce) gsap.fromTo(box, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: .7, ease: "power3.out", clearProps: "transform,opacity" });
    box.classList.add("open");
    setTimeout(() => box.querySelector("[data-cs-close]").focus({ preventScroll: true }), 50);
  };
  window.closeCase = () => {
    if (!box.classList.contains("open")) return;
    box.classList.remove("open"); current = null;
    seqTimers.forEach(clearInterval);
    box.hidden = true; box.innerHTML = ""; box.style.opacity = "";
    document.body.classList.remove("case-open");
    scrollTo(0, homeY);
    if (window.pageScroll) requestAnimationFrame(() => { pageScroll.resize(); scrollTo(0, homeY); });
    try { if (location.hash.startsWith("#project-")) history.pushState({}, "", location.pathname + location.search); } catch (e) {}
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };
  box.addEventListener("click", e => {
    if (e.target.closest("[data-cs-close]")) { closeCase(); return; }
    const p = PROJECTS.find(x => x.id === current);
    const g = e.target.closest("[data-g]"); if (g && p) { openLightbox(p.images, +g.dataset.g, p.title); return; }
    const sh = e.target.closest("[data-shot]"); if (sh && p) { openLightbox(stepsOf(p).map(s => ({ src: s.image, caption: s.imageCaption })), +sh.dataset.shot, p.title); return; }
    const st = e.target.closest("[data-cs-step]");
    if (st) { const i = PROJECTS.findIndex(p => p.id === current), n = PROJECTS[(i + +st.dataset.csStep + PROJECTS.length) % PROJECTS.length]; openCase(n.id); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && box.classList.contains("open") && document.getElementById("lb").hidden) closeCase(); });
  addEventListener("popstate", () => { const m = location.hash.match(/^#project-([a-z-]+)$/); if (m) openCase(m[1]); else closeCase(); });
  // a visit that starts on a project page opens it now, before the home page's 3D scene sets itself up (half a second of
  // work): its pictures download meanwhile (the home page measures itself again when the project is closed)
  { const m = location.hash.match(/^#project-([a-z-]+)$/); if (m) openCase(m[1]); }
  // once the page has loaded and gone quiet, each project's first pictures are fetched in the background (about 1.4 MB for
  // all of them, at low priority): a project then opens with its pictures already there
  const warmed = [];
  addEventListener("load", () => setTimeout(() => {
    const go = () => PROJECTS.forEach((p, i) => { const t = document.createElement("template"); t.innerHTML = html(p, i);
      [...t.content.querySelectorAll("img")].slice(0, 4).forEach(im => { const w = new Image(); w.fetchPriority = "low"; w.src = im.getAttribute("src"); warmed.push(w); }); });
    if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 3000 }); else go();
  }, 2000), { once: true });
})();
