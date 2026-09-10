/* App: router, views, transitions. Depends on data.js, curves.js, charts.js, fx.js, hero3d.js, gsap, Lenis. */

(function () {
  gsap.registerPlugin(ScrollTrigger);

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const app = $("#app");

  // ---------- smooth scroll ----------
  let lenis = null;
  // Smooth (inertial) scrolling adds input latency on modest GPUs; native scrolling feels more responsive.
  const USE_SMOOTH_SCROLL = false;
  if (USE_SMOOTH_SCROLL && window.Lenis && !FX.reduced) {
    lenis = new Lenis({ lerp: 0.18, smoothWheel: true, wheelMultiplier: 1.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  function scrollTo(target, opts = {}) {
    const offset = -72;
    if (lenis) { lenis.scrollTo(target, { offset, duration: 1.1, ...opts }); return; }
    const y = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: opts.immediate ? "auto" : "smooth" });
  }

  // ---------- theme ----------
  const root = document.documentElement;
  $("#theme-toggle").addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    window.dispatchEvent(new Event("themechange"));
  });

  // ---------- motion switch (persisted; reload applies it everywhere) ----------
  const motionBtn = $("#motion-toggle");
  if (motionBtn) {
    const off = document.documentElement.classList.contains("reduce");
    motionBtn.classList.toggle("off", off);
    motionBtn.title = off ? "Animations are off. Click to turn on." : "Animations are on. Click to turn off.";
    motionBtn.addEventListener("click", () => {
      try { localStorage.setItem("kd-motion", off ? "on" : "off"); } catch (e) {}
      location.reload();
    });
  }
  const metaDesc = document.querySelector('meta[name="description"]');
  const defaultDesc = metaDesc ? metaDesc.content : "";
  function setDescription(text) { if (metaDesc) metaDesc.content = text || defaultDesc; }

  // ---------- chrome ----------
  $("#nav-cv").href = SITE.cv;
  $("#footer-name").textContent = SITE.name;
  $("#footer-role").textContent = `${SITE.role} · ${SITE.location}`;
  $("#footer-links").innerHTML = `
    <a href="mailto:${esc(SITE.email)}">Email</a>
    <a href="${esc(SITE.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
    ${SITE.researchgate ? `<a href="${esc(SITE.researchgate)}" target="_blank" rel="noopener">ResearchGate</a>` : ""}
    <a href="${esc(SITE.cv)}" target="_blank" rel="noopener">CV</a>`;
  $("#footer-year").textContent = `© ${new Date().getFullYear()}`;

  const topbar = $("#topbar"), progress = $("#progress");
  window.addEventListener("scroll", () => {
    topbar.classList.toggle("scrolled", window.scrollY > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  }, { passive: true });

  // ---------- media helpers ----------
  function isUrl(s) { return /^https?:\/\//i.test(s || ""); }
  function embedHtml(src, title) {
    let m;
    if ((m = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/))) {
      return `<iframe src="https://www.youtube-nocookie.com/embed/${m[1]}?rel=0" title="${esc(title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    if ((m = src.match(/vimeo\.com\/(?:video\/)?(\d+)/))) {
      return `<iframe src="https://player.vimeo.com/video/${m[1]}" title="${esc(title)}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    }
    return null;
  }
  function genCover(p, i) {
    return `<div class="cover-gen" style="--seed:${i}">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><pattern id="g${i}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="currentColor" stroke-width=".5" opacity=".35"/></pattern></defs>
        <rect width="400" height="300" fill="url(#g${i})"/>
        <g fill="none" stroke="currentColor" stroke-width="1" opacity=".55" transform="translate(${260 + i * 10} ${150 - i * 12})">
          <circle r="60"/><circle r="92"/><circle r="124"/>
          <path d="M-140 0H140M0 -140V140"/>
          <path d="M-100 -100L100 100M-100 100L100 -100" opacity=".5"/>
        </g>
      </svg>
      <span class="cover-idx">${pad(i + 1)}</span>
    </div>`;
  }
  function coverBlock(p, i) {
    const src = p.cover || (p.images && p.images[0] && p.images[0].src);
    return src ? `<img src="${esc(src)}" alt="${esc(p.title)}" loading="lazy" />` : genCover(p, i);
  }

  function videoStage(p) {
    const vids = (p.videos || []).filter((v) => v && v.src);
    if (!vids.length) {
      return `<div class="media media-video"><div class="placeholder">
        <span class="ph-icon">▶</span><strong>Project video</strong>
        <span>Add entries to <code>videos</code> for “${esc(p.id)}” in <code>js/data.js</code></span>
      </div></div>`;
    }
    const v = vids[0];
    const stage = isUrl(v.src)
      ? `<div class="video-frame">${embedHtml(v.src, v.title) || ""}</div>`
      : `<video id="stage-video" controls playsinline muted loop preload="metadata" poster="${esc(v.poster || "")}"><source src="${esc(v.src)}" type="video/mp4"></video>`;
    return `
      <div class="video-stage">
        <div class="video-box">${stage}<button class="video-play" id="video-play" aria-label="Play">▶</button></div>
        <div class="video-caption" id="video-caption"><strong>${esc(v.title || "")}</strong><span>${esc(v.caption || "")}</span></div>
      </div>
      ${vids.length > 1 ? `<div class="video-strip" id="video-strip">${vids.map((x, i) => `
        <button class="vthumb${i === 0 ? " active" : ""}" data-i="${i}" data-cursor="Play">
          ${x.poster ? `<img src="${esc(x.poster)}" alt="" loading="lazy" />` : `<span class="vthumb-ph">▶</span>`}
          <span class="vthumb-t">${esc(x.title || "Clip " + (i + 1))}</span>
        </button>`).join("")}</div>` : ""}`;
  }

  function galleryBlock(p) {
    if (!p.images || !p.images.length) {
      return `<div class="media"><div class="placeholder">
        <span class="ph-icon">▦</span><strong>Image gallery</strong>
        <span>Add images to <code>assets/${esc(p.id)}/</code> and list them under <code>images</code> for “${esc(p.id)}” in <code>js/data.js</code></span>
      </div></div>`;
    }
    return `<div class="gallery" data-project="${esc(p.id)}" data-stagger>${p.images
      .map((im, i) => `<figure class="${im.photo ? "photo" : "diagram"}" data-index="${i}" data-cursor="Open"><img src="${esc(im.src)}" alt="${esc(im.caption || p.title)}" loading="lazy" /><figcaption>${esc(im.caption || "")}</figcaption></figure>`)
      .join("")}</div>`;
  }
  const lines = (arr) => arr.map((l) => `<span class="line-wrap"><span class="line">${esc(l)}</span></span>`).join("");

  // ---------- publication card ----------
  function pubCard(p, i) {
    const me = esc(SITE.name);
    const authors = p.authors ? esc(p.authors).replace(me, `<b>${me}</b>`) : "";
    const proj = p.project ? PROJECTS.find((x) => x.id === p.project) : null;
    const coverInner = p.cover
      ? `<img src="${esc(p.cover)}" alt="${esc(p.venueShort || p.venue)}" loading="lazy" />`
      : `<div class="cover-text"><span>${esc(p.venueShort || p.venue)}</span></div>`;
    return `
    <article class="pubcard" data-type="${esc(p.type)}" data-id="${esc(p.id)}" data-reveal data-delay="${(i % 2) * 0.06}">
      <div class="pubcard-cover${p.coverKind === "figure" ? " landscape" : ""}" data-tilt data-cursor="Open">
        <div class="cover3d">
          ${coverInner}
          ${p.logo ? `<img class="cover-logo" src="${esc(p.logo)}" alt="" />` : ""}
          <span class="cover-shine"></span>
        </div>
        <span class="pub-year mono">${esc(p.year)}</span>
      </div>
      <div class="pubcard-body">
        <div class="pub-top">
          <span class="pub-type">${esc(p.typeLabel || p.type)}</span>
          ${p.first ? `<span class="pub-pill first">First author</span>` : ""}
          ${p.oa ? `<span class="pub-pill oa">Open access</span>` : ""}
        </div>
        <h3>${esc(p.title)}</h3>
        ${authors ? `<div class="authors">${authors}</div>` : ""}
        <div class="venue">${esc(p.venue)}</div>
        <div class="pub-actions">
          <a class="btn btn-small" href="${esc(p.href)}" target="_blank" rel="noopener" data-magnetic>doi:${esc(p.doi)} ↗</a>
          ${(p.abstract || p.summary || (p.figures && p.figures.length)) ? `<button class="btn btn-small btn-ghost pub-expand" data-magnetic>${p.figures && p.figures.length ? "Abstract &amp; figures" : "In brief"}</button>` : ""}
          ${proj ? `<a class="btn btn-small btn-ghost" href="#/project/${esc(proj.id)}" data-magnetic>Project page →</a>` : ""}
        </div>
      </div>
      <div class="pub-details"><div class="pub-details-inner">
        ${p.abstract ? `<p class="pub-abstract"><span class="mono">Abstract</span>${esc(p.abstract)}</p>` : p.summary ? `<p class="pub-abstract"><span class="mono">In brief</span>${esc(p.summary)}</p>` : ""}
        ${p.figures && p.figures.length ? `<div class="pub-figs">${p.figures.map((f, k) => `
          <figure class="${f.photo ? "photo" : "diagram"}" data-pub="${esc(p.id)}" data-index="${k}" data-cursor="Open"><img src="${esc(f.src)}" alt="${esc(f.caption)}" loading="lazy" /><figcaption>${esc(f.caption)}</figcaption></figure>`).join("")}</div>` : ""}
        ${p.cite ? `<div class="pub-cite"><span class="mono">Cite</span><span class="cite-text">${esc(p.cite)}</span><button class="btn btn-small pub-copy" data-cite="${esc(p.cite)}">Copy</button></div>` : ""}
        ${p.license ? `<div class="pub-license mono">${esc(p.license)}</div>` : ""}
      </div></div>
    </article>`;
  }

  function initPubs() {
    const shelf = $("#pub-shelf");
    if (!shelf) return;
    shelf.addEventListener("click", (e) => {
      const expand = e.target.closest(".pub-expand"), cover = e.target.closest(".pubcard-cover"), copy = e.target.closest(".pub-copy");
      if (copy) {
        const txt = copy.dataset.cite;
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { copy.textContent = "Copied"; setTimeout(() => (copy.textContent = "Copy"), 1600); }).catch(() => { window.prompt("Copy the citation:", txt); });
        return;
      }
      if (expand || cover) {
        const card = e.target.closest(".pubcard");
        const open = card.classList.toggle("open");
        const btn = card.querySelector(".pub-expand");
        if (btn) { if (open) { btn.dataset.label = btn.textContent; btn.textContent = "Close"; } else btn.textContent = btn.dataset.label || "Abstract & figures"; }
        setTimeout(() => ScrollTrigger.refresh(), 550);
      }
    });
    const filters = $("#pub-filters");
    if (filters) filters.addEventListener("click", (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      filters.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
      const f = b.dataset.filter;
      shelf.querySelectorAll(".pubcard").forEach((c) => {
        const show = f === "all" || c.dataset.type === f;
        if (show && c.style.display === "none") { c.style.display = ""; gsap.fromTo(c, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }); }
        else if (!show && c.style.display !== "none") { gsap.to(c, { opacity: 0, duration: 0.2, onComplete: () => { c.style.display = "none"; ScrollTrigger.refresh(); } }); }
      });
      setTimeout(() => ScrollTrigger.refresh(), 400);
    });
  }

  // ---------- about + timeline ----------
  function aboutSection() {
    return `
    <section class="section about" id="about-me">
      <div class="about-grid">
        <div class="about-photo${ABOUT.photo ? "" : " empty"}" data-reveal="scale">
          ${ABOUT.photo ? `<img src="${esc(ABOUT.photo)}" alt="${esc(SITE.name)}" />` : `<div class="about-initials">${esc(SITE.first[0] + SITE.last[0])}</div>`}
        </div>
        <div>
          <div class="section-head" data-reveal><span class="kicker">00 · About</span><h2>${esc(ABOUT.title || "About")}</h2></div>
          <p class="about-lead" data-reveal>${esc(ABOUT.lead)}</p>
          ${ABOUT.facts && ABOUT.facts.length ? `<ul class="about-facts" data-stagger>${ABOUT.facts.map((f) => `<li><span class="mono">${esc(f[0])}</span><span>${esc(f[1])}</span></li>`).join("")}</ul>` : ""}
        </div>
      </div>
      ${ABOUT.timeline && ABOUT.timeline.length ? `
      <div class="timeline" data-stagger>
        ${ABOUT.timeline.map((t) => `
        <div class="tl-item">
          <span class="tl-dot"></span>
          <span class="mono tl-year">${esc(t.year)}</span>
          <h3>${esc(t.title)}</h3>
          <p>${esc(t.org)}</p>
        </div>`).join("")}
      </div>` : ""}
    </section>`;
  }

  // ---------- tools matrix ----------
  function toolsSection() {
    const levels = { Advanced: 3, Working: 2, Familiar: 1 };
    return `
    <section class="section" id="tools">
      <div class="section-head" data-reveal>
        <span class="kicker">02a · Tools</span>
        <h2>Tools and where they were used</h2>
        <p>Depth is stated honestly: advanced means daily use on delivered work, working means used to produce results, familiar means trained and applied in exercises.</p>
      </div>
      <div class="tools-grid" data-stagger>
        ${TOOLS.map((t) => `
        <div class="tool">
          <div class="tool-top"><h3>${esc(t.name)}</h3><span class="tool-level" title="${esc(t.level)}">${[1, 2, 3].map((i) => `<i class="${i <= (levels[t.level] || 1) ? "on" : ""}"></i>`).join("")}<span class="mono">${esc(t.level)}</span></span></div>
          ${t.note ? `<p>${esc(t.note)}</p>` : ""}
          ${t.used ? `<div class="tool-used">${t.used.map((u) => typeof u === "string" ? `<span class="tag">${esc(u)}</span>` : `<a class="tag" href="#/project/${esc(u.id)}">${esc(u.label)}</a>`).join("")}</div>` : ""}
        </div>`).join("")}
      </div>
    </section>`;
  }

  // ---------- services ----------
  function servicesSection() {
    const S = SERVICES;
    return `
    <section class="section" id="services">
      <div class="section-head" data-reveal>
        <span class="kicker">${esc(S.kicker)}</span>
        <h2>${esc(S.title)}</h2>
        <p>${esc(S.lead)}</p>
      </div>
      <div class="services-grid" data-stagger>
        ${S.items.map((it, i) => `
        <div class="service" data-tilt>
          <span class="mono service-idx">${pad(i + 1)}</span>
          <h3>${esc(it.name)}</h3>
          <p>${esc(it.body)}</p>
          <ul class="service-deliv">${it.deliverables.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <div class="service-foot">
            <span class="mono">${esc(it.turnaround)}</span>
            ${it.proof ? `<a class="tag" href="#/project/${esc(it.proof.id)}">${esc(it.proof.label)} →</a>` : ""}
          </div>
        </div>`).join("")}
      </div>
      ${S.extras && S.extras.length ? `<div class="service-extras" data-reveal><span class="mono">Also</span>${S.extras.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</div>` : ""}
      <div class="service-cta" data-reveal>
        <p>${esc(S.cta)}</p>
        <a class="btn btn-primary" href="mailto:${esc(SITE.email)}?subject=Freelance%20enquiry" data-magnetic>Ask for a quote</a>
      </div>
    </section>`;
  }

  // ---------- presentations ----------
  function presentationsSection() {
    return `
    <section class="section" id="presentations">
      <div class="section-head" data-reveal>
        <span class="kicker">02c · Presentations</span>
        <h2>Talks, reviews and posters</h2>
        <p>Open a deck to page through the slides.</p>
      </div>
      <div class="decks" data-stagger>
        ${PRESENTATIONS.map((d, i) => `
        <article class="deck" data-deck="${i}">
          <button class="deck-cover" type="button" data-cursor="Open" aria-label="Open slides: ${esc(d.title)}">
            <img src="${esc(d.cover)}" alt="" loading="lazy" />
            ${d.slides && d.slides.length ? `<span class="deck-count mono">${d.slides.length} of ${d.total || d.slides.length} slides</span>` : ""}
          </button>
          <div class="deck-body">
            <span class="pub-type">${esc(d.type || "Presentation")}</span>
            <h3>${esc(d.title)}</h3>
            <div class="deck-meta">${esc(d.event)}${d.date ? ` · ${esc(d.date)}` : ""}</div>
            ${d.note ? `<p>${esc(d.note)}</p>` : ""}
            ${d.href ? `<a class="btn btn-small" href="${esc(d.href)}" target="_blank" rel="noopener">Download ↗</a>` : ""}
          </div>
        </article>`).join("")}
      </div>
    </section>`;
  }

  // ---------- courses / training ----------
  function coursesSection() {
    const groups = [];
    COURSES.forEach((c) => { let g = groups.find((x) => x.provider === c.provider); if (!g) { g = { provider: c.provider, items: [] }; groups.push(g); } g.items.push(c); });
    return `
    <section class="section" id="training">
      <div class="section-head" data-reveal>
        <span class="kicker">02b · Training</span>
        <h2>Courses and training</h2>
        <p>${esc(COURSES_NOTE || `${COURSES.length} course${COURSES.length === 1 ? "" : "s"} across ${groups.length} provider${groups.length === 1 ? "" : "s"}.`)}</p>
      </div>
      <div class="course-groups">
        ${groups.map((g) => `
        <div class="course-group" data-reveal>
          <div class="course-provider"><span class="course-logo">${esc(g.provider.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase())}</span><h3>${esc(g.provider)}</h3><span class="mono">${g.items.length} course${g.items.length === 1 ? "" : "s"}</span></div>
          <div class="course-list" data-stagger>
            ${g.items.map((c) => `
            <${c.href ? `a href="${esc(c.href)}" target="_blank" rel="noopener"` : "div"} class="course">
              <div class="course-top"><span class="mono">${esc(c.year || "")}</span>${c.href ? `<span class="mono course-link">↗</span>` : ""}</div>
              <h4>${esc(c.title)}</h4>
              ${c.topics && c.topics.length ? `<div class="tags">${c.topics.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
              ${c.note ? `<p>${esc(c.note)}</p>` : ""}
            </${c.href ? "a" : "div"}>`).join("")}
          </div>
        </div>`).join("")}
      </div>
    </section>`;
  }

  // ---------- home view ----------
  function homeView() {
    return `
    <section class="hero" id="hero">
      <canvas class="hero-canvas" id="hero-canvas" aria-hidden="true"></canvas>
      <div class="hero-fade" aria-hidden="true"></div>
      <div class="hero-inner">
        <p class="eyebrow"><span class="dot"></span>${esc(SITE.role)} · ${esc(SITE.location)}</p>
        <h1 class="display">${lines([SITE.first, SITE.last])}</h1>
        <p class="tagline">${lines(SITE.headline)}</p>
        <p class="lede" data-reveal data-delay="0.55">${esc(SITE.profile)}</p>
        <div class="actions" data-reveal data-delay="0.7">
          <a class="btn btn-primary" href="#/#projects" data-magnetic>View projects</a>
          <a class="btn" href="${esc(SITE.cv)}" target="_blank" rel="noopener" data-magnetic>Download CV</a>
          <a class="btn btn-ghost" href="${esc(SITE.linkedin)}" target="_blank" rel="noopener" data-magnetic>LinkedIn ↗</a>
        </div>
      </div>
      <div class="hero-stats" data-stagger>
        ${SITE.stats.map((s) => `<div class="stat"><div class="v"><span data-count="${s.value}" data-decimals="${s.decimals}" data-suffix="${esc(s.suffix)}">0</span></div><div class="l">${esc(s.label)}</div></div>`).join("")}
      </div>
      <div class="scroll-cue" aria-hidden="true"><span></span>scroll</div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee-track">
      ${[...SITE.marquee, ...SITE.marquee].map((t) => `<span>${esc(t)}<i>✦</i></span>`).join("")}
    </div></div>

    <section class="section stance-block" id="about">
      <p class="stance-text" data-reveal="clip">“${esc(SITE.stance)}”</p>
      <p class="stance-avail" data-reveal>${esc(SITE.availability)}</p>
    </section>

    ${(typeof ABOUT !== "undefined") ? aboutSection() : ""}

    <section class="section" id="projects">
      <div class="section-head" data-reveal>
        <span class="kicker">01 · Projects</span>
        <h2>Selected work</h2>
        <p>Structures, design and research work. Each entry carries the numbers it stands on, with the simulations, images and interactive results behind them.</p>
      </div>
      <div class="filters" id="filters" data-reveal>
        ${CATEGORIES.map((c, i) => `<button class="chip${i === 0 ? " active" : ""}" data-filter="${esc(c)}">${esc(c)}</button>`).join("")}
      </div>
      <div class="cards" id="cards">
        ${PROJECTS.map((p, i) => `
        <a class="card" href="#/project/${esc(p.id)}" data-category="${esc(p.category)}" data-tilt data-cursor="View" data-reveal data-delay="${(i % 2) * 0.1}">
          <div class="card-cover">${coverBlock(p, i)}<div class="card-shine"></div>
            ${(p.videos && p.videos.length) ? `<span class="card-badge">▶ ${p.videos.length} video${p.videos.length > 1 ? "s" : ""}</span>` : ""}
            ${(p.charts && p.charts.length) ? `<span class="card-badge b2">◔ ${p.charts.length} interactive charts</span>` : ""}
          </div>
          <div class="card-body">
            <div class="card-top"><span class="mono">${pad(i + 1)}</span><span class="card-cat">${esc(p.category)}</span><span class="mono">${esc(p.period)}</span></div>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.subtitle)}</p>
            <div class="card-metrics">${p.metrics.slice(0, 2).map((m) => `<div><b>${esc(m.value)}</b><small>${esc(m.label)}</small></div>`).join("")}</div>
            <div class="tags">${p.tags.slice(0, 4).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          </div>
          <span class="card-arrow" aria-hidden="true">→</span>
        </a>`).join("")}
      </div>
    </section>

    <section class="section" id="skills">
      <div class="section-head" data-reveal>
        <span class="kicker">02 · Capability</span>
        <h2>Technical skills</h2>
      </div>
      <div class="skills-grid" data-stagger>
        ${SKILLS.map((s, i) => `<div class="skill"><span class="mono skill-idx">${pad(i + 1)}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div>`).join("")}
      </div>
    </section>

    ${(typeof TOOLS !== "undefined" && TOOLS.length) ? toolsSection() : ""}

    ${(typeof COURSES !== "undefined" && COURSES.length) ? coursesSection() : ""}

    ${(typeof PRESENTATIONS !== "undefined" && PRESENTATIONS.length) ? presentationsSection() : ""}

    <section class="section" id="publications">
      <div class="section-head" data-reveal>
        <span class="kicker">03 · Research</span>
        <h2>Publications</h2>
        <p>Peer-reviewed work from Symbiosis and Cranfield. Open a card for the abstract, the figures and a ready-made citation.</p>
      </div>
      <div class="filters" id="pub-filters" data-reveal>
        <button class="chip active" data-filter="all">All</button>
        <button class="chip" data-filter="journal">Journal articles</button>
        <button class="chip" data-filter="chapter">Book chapters</button>
      </div>
      <div class="pub-shelf" id="pub-shelf">${PUBLICATIONS.map((p, i) => pubCard(p, i)).join("")}</div>
      <div class="pub-profiles" data-reveal>
        ${SITE.researchgate ? `<a class="btn" href="${esc(SITE.researchgate)}" target="_blank" rel="noopener" data-magnetic>ResearchGate ↗</a>` : ""}
        ${SITE.orcid ? `<a class="btn" href="${esc(SITE.orcid)}" target="_blank" rel="noopener" data-magnetic>ORCID ↗</a>` : ""}
        ${SITE.scholar ? `<a class="btn" href="${esc(SITE.scholar)}" target="_blank" rel="noopener" data-magnetic>Google Scholar ↗</a>` : ""}
      </div>
    </section>

    <section class="section two-col" id="education">
      <div>
        <div class="section-head" data-reveal><span class="kicker">04 · Background</span><h2>Education</h2></div>
        <div data-stagger>
          ${EDUCATION.map((e) => `
          <div class="edu">
            <h3>${esc(e.degree)}</h3>
            <div class="school">${esc(e.school)}</div>
            <div class="mono period">${esc(e.period)}</div>
            ${e.body ? `<p>${esc(e.body)}</p>` : ""}
            ${e.note ? `<p class="note">${esc(e.note)}</p>` : ""}
          </div>`).join("")}
        </div>
      </div>
      <div>
        <div class="section-head" data-reveal><span class="kicker">&nbsp;</span><h2>Awards, membership and status</h2></div>
        ${(typeof AWARDS !== "undefined" && AWARDS.length) ? `<div class="awards" data-stagger>${AWARDS.map((a) => `
          <div class="award">
            ${a.image ? `<figure class="award-img" data-cursor="Open"><img src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy" /></figure>` : `<span class="award-mark">✦</span>`}
            <div><h3>${esc(a.title)}</h3><div class="award-meta">${esc(a.org)}${a.year ? ` · ${esc(a.year)}` : ""}</div>${a.note ? `<p>${esc(a.note)}</p>` : ""}</div>
          </div>`).join("")}</div>` : ""}
        <ul class="plain-list" data-stagger>${MEMBERSHIPS.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
      </div>
    </section>

    ${(typeof SERVICES !== "undefined") ? servicesSection() : ""}

    <section class="section contact" id="contact">
      <span class="kicker" data-reveal>05 · Contact</span>
      <h2 class="display-2" data-reveal>Let's talk.</h2>
      <a class="contact-email" href="mailto:${esc(SITE.email)}" data-reveal data-magnetic="0.15">${esc(SITE.email)}</a>
      <p class="contact-note" data-reveal>${esc(SITE.availability)}</p>
      <div class="actions" data-reveal>
        <a class="btn" href="${esc(SITE.linkedin)}" target="_blank" rel="noopener" data-magnetic>LinkedIn ↗</a>
        ${SITE.researchgate ? `<a class="btn" href="${esc(SITE.researchgate)}" target="_blank" rel="noopener" data-magnetic>ResearchGate ↗</a>` : ""}
        <a class="btn" href="${esc(SITE.cv)}" target="_blank" rel="noopener" data-magnetic>Download CV (PDF)</a>
      </div>
    </section>`;
  }

  let disposeHero = null;
  let booted = false;

  function initHome() {
    const startHero = () => {
      const c = $("#hero-canvas");
      if (c && window.initHero3D) disposeHero = window.initHero3D(c);
    };
    if (window.THREE) startHero(); else window.addEventListener("three-ready", startHero, { once: true });

    if (booted) {
      FX.splitLines($(".display"));
      FX.splitLines($(".tagline"), 0.25);
    }
    initPubs();

    const cards = Array.from(document.querySelectorAll("#cards .card"));
    $("#filters").addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      document.querySelectorAll("#filters .chip").forEach((c) => c.classList.toggle("active", c === b));
      const f = b.dataset.filter;
      cards.forEach((c) => {
        const show = f === "All" || c.dataset.category === f;
        if (show && c.style.display === "none") {
          c.style.display = "";
          gsap.fromTo(c, { opacity: 0, y: 20, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" });
        } else if (!show && c.style.display !== "none") {
          gsap.to(c, { opacity: 0, scale: 0.97, duration: 0.25, ease: "power2.in", onComplete: () => { c.style.display = "none"; ScrollTrigger.refresh(); } });
        }
      });
      setTimeout(() => ScrollTrigger.refresh(), 350);
    });
  }

  // ---------- project view ----------
  function projectView(p) {
    const i = PROJECTS.indexOf(p);
    const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
    const next = PROJECTS[(i + 1) % PROJECTS.length];
    const hasCharts = p.charts && p.charts.length;
    const hasCompare = p.compare && p.compare.length;
    return `
    <article class="project-page">
      <header class="pp-head">
        <a class="back" href="#/#projects" data-magnetic>← All projects</a>
        <span class="kicker">${pad(i + 1)} / ${pad(PROJECTS.length)} · ${esc(p.category)}</span>
        <h1 class="display-2">${lines([p.title])}</h1>
        <p class="pp-sub" data-reveal data-delay="0.2">${esc(p.subtitle)}</p>
        <div class="pp-meta" data-reveal data-delay="0.3"><span>${esc(p.org)}</span><span>${esc(p.role)}</span><span class="mono">${esc(p.period)}</span></div>
        <div class="tags" data-reveal data-delay="0.4">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        ${(hasCharts || hasCompare || (p.images && p.images.length)) ? `<nav class="pp-jump" data-reveal data-delay="0.45">
          <span class="mono">Jump to</span>
          ${(p.videos && p.videos.length) ? `<a href="#/project/${esc(p.id)}#videos">Simulations</a>` : ""}
          ${hasCharts ? `<a href="#/project/${esc(p.id)}#results">Interactive results</a>` : ""}
          ${hasCompare ? `<a href="#/project/${esc(p.id)}#compare">Before / after</a>` : ""}
          ${(p.images && p.images.length) ? `<a href="#/project/${esc(p.id)}#gallery">Gallery</a>` : ""}
        </nav>` : ""}
      </header>

      ${(p.hero || p.cover) ? `<div class="pp-hero" data-reveal="scale" data-delay="0.3"><img src="${esc(p.hero || p.cover)}" alt=""${p.heroPos ? ` style="object-position:${esc(p.heroPos)}"` : ""} /></div>` : ""}

      <div class="pp-body">
        <div class="pp-main">
          <p class="pp-summary" data-reveal>${esc(p.summary)}</p>
          <h2 class="h-small" data-reveal>Key results</h2>
          <ul class="highlights" data-stagger>${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
          ${p.steps && p.steps.length ? `
          <h2 class="h-small" data-reveal>How the work was done</h2>
          <ol class="steps">
            ${p.steps.map((s, k) => `<li class="${s.image ? "has-image" : ""}" data-reveal="left" data-delay="${(k % 3) * 0.05}"><span class="mono step-idx">${pad(k + 1)}</span><div class="step-text"><h4>${esc(s.title)}</h4><p>${esc(s.body)}</p></div>${s.image ? `<figure class="step-fig${s.photo ? " photo" : " diagram"}" data-project="${esc(p.id)}" data-step="${k}" data-cursor="Open"><img src="${esc(s.image)}" alt="${esc(s.imageCaption || s.title)}" loading="lazy" /><figcaption>${esc(s.imageCaption || "")}</figcaption></figure>` : ""}</li>`).join("")}
          </ol>` : ""}
        </div>
        <aside class="pp-aside">
          <div class="sticky">
            <div class="metrics" data-stagger>${p.metrics.map((m) => `<div class="metric"><div class="v">${esc(m.value)}</div><div class="l">${esc(m.label)}</div></div>`).join("")}</div>
            ${p.links && p.links.length ? `<div class="links" data-reveal>${p.links.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>` : ""}
          </div>
        </aside>
      </div>

      ${(p.videos && p.videos.length) ? `
      <section class="pp-videos" id="videos">
        <div class="section-head" data-reveal><span class="kicker">Simulations</span><h2>See it move</h2><p>${esc(p.videosNote || "Abaqus and ANSYS animations from the project. Pick a clip from the strip.")}</p></div>
        <div data-reveal="scale">${videoStage(p)}</div>
      </section>` : ""}

      ${hasCharts ? `
      <section class="pp-results" id="results">
        <div class="section-head" data-reveal>
          <span class="kicker">Interactive results</span>
          <h2>The numbers, live</h2>
          <p>Hover for values, switch datasets with the chips. Every figure is taken from the project reports.</p>
        </div>
        <div class="charts-grid">
          ${p.charts.map((c, k) => `<div class="chart-card${c.wide || c.type === "lines" && c.curves ? " wide" : ""}" data-chart="${k}"></div>`).join("")}
        </div>
      </section>` : ""}

      ${hasCompare ? `
      <section class="pp-compare" id="compare">
        <div class="section-head" data-reveal>
          <span class="kicker">Before / after</span>
          <h2>Drag to compare</h2>
          <p>Impact at 180 m/s, initial and final frames from the same viewpoint.</p>
        </div>
        ${p.compare.length > 1 ? `<div class="filters" id="compare-tabs" data-reveal>${p.compare.map((c, k) => `<button class="chip${k === 0 ? " active" : ""}" data-k="${k}">${esc(c.title)}</button>`).join("")}</div>` : ""}
        <div class="compare-wrap" id="compare-wrap" data-reveal="scale"></div>
      </section>` : ""}

      ${p.sequences && p.sequences.length ? `
      <section class="pp-sequences" id="sequences">
        <div class="section-head" data-reveal>
          <span class="kicker">Step by step</span>
          <h2>Scrub through the test</h2>
          <p>Drag across the image, use the slider, or press play.</p>
        </div>
        <div class="sequences-grid">${p.sequences.map((s, k) => `<div class="seq-card" data-seq="${k}" data-reveal="scale"></div>`).join("")}</div>
      </section>` : ""}

      <section class="pp-gallery" id="gallery">
        <div class="section-head" data-reveal><span class="kicker">Gallery</span><h2>Evidence</h2></div>
        <div data-reveal>${galleryBlock(p)}</div>
      </section>

      <nav class="pp-nav" data-stagger>
        <a class="pp-nav-link" href="#/project/${esc(prev.id)}" data-cursor="Prev"><span class="mono">← Previous</span><strong>${esc(prev.title)}</strong></a>
        <a class="pp-nav-link right" href="#/project/${esc(next.id)}" data-cursor="Next"><span class="mono">Next →</span><strong>${esc(next.title)}</strong></a>
      </nav>
    </article>`;
  }

  function resolveChart(spec) {
    if (!spec.curves) return spec;
    const out = Object.assign({}, spec);
    delete out.curves;
    out.datasets = {};
    Object.entries(spec.curves).forEach(([label, key]) => {
      const src = (window.CURVES || {})[key];
      if (!src) return;
      out.datasets[label] = { series: Object.entries(src).map(([name, pts]) => ({ name, points: pts, marker: false })) };
    });
    if (!Object.keys(out.datasets).length) delete out.datasets;
    return out;
  }

  function initProject(p) {
    FX.splitLines($(".display-2"));

    // video stage
    const strip = $("#video-strip"), stageVideo = $("#stage-video"), cap = $("#video-caption"), playBtn = $("#video-play");
    if (stageVideo && playBtn) {
      const sync = () => playBtn.classList.toggle("hidden", !stageVideo.paused);
      playBtn.addEventListener("click", () => { stageVideo.play(); });
      stageVideo.addEventListener("play", sync); stageVideo.addEventListener("pause", sync); stageVideo.addEventListener("ended", sync);
      stageVideo.addEventListener("click", () => { if (stageVideo.paused) stageVideo.play(); });
    } else if (playBtn) playBtn.remove();
    if (strip) {
      strip.addEventListener("click", (e) => {
        const b = e.target.closest(".vthumb"); if (!b) return;
        const v = p.videos[+b.dataset.i];
        strip.querySelectorAll(".vthumb").forEach((x) => x.classList.toggle("active", x === b));
        cap.innerHTML = `<strong>${esc(v.title || "")}</strong><span>${esc(v.caption || "")}</span>`;
        const box = $(".video-box");
        if (isUrl(v.src)) {
          box.innerHTML = `<div class="video-frame">${embedHtml(v.src, v.title) || ""}</div>`;
        } else if ($("#stage-video")) {
          const sv = $("#stage-video");
          sv.pause(); sv.poster = v.poster || ""; sv.querySelector("source").src = v.src; sv.load();
          sv.play().catch(() => {});
        } else {
          box.innerHTML = `<video id="stage-video" controls playsinline muted loop preload="metadata" poster="${esc(v.poster || "")}"><source src="${esc(v.src)}" type="video/mp4"></video>`;
          $("#stage-video").play().catch(() => {});
        }
        gsap.fromTo(box, { opacity: 0.4 }, { opacity: 1, duration: 0.4 });
      });
    }

    // charts
    if (p.charts && window.Charts) {
      document.querySelectorAll(".chart-card").forEach((el) => {
        const spec = resolveChart(p.charts[+el.dataset.chart]);
        try { Charts.render(el, spec); } catch (err) { el.innerHTML = `<div class="placeholder"><strong>Chart failed</strong><span>${esc(err.message)}</span></div>`; console.error(err); }
      });
    }

    // frame sequences
    if (p.sequences && window.Charts && Charts.sequence) {
      document.querySelectorAll(".seq-card").forEach((el) => Charts.sequence(el, p.sequences[+el.dataset.seq]));
    }

    // compare
    if (p.compare && window.Charts) {
      const wrap = $("#compare-wrap");
      const show = (k) => { wrap.innerHTML = ""; const c = document.createElement("div"); wrap.appendChild(c); Charts.compare(c, p.compare[k]); };
      show(0);
      const tabs = $("#compare-tabs");
      if (tabs) tabs.addEventListener("click", (e) => {
        const b = e.target.closest(".chip"); if (!b) return;
        tabs.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === b));
        show(+b.dataset.k);
      });
    }
  }

  // ---------- mount + transitions ----------
  function mount(html, init, { immediate = false, anchor = null } = {}) {
    const swap = () => {
      if (disposeHero) { disposeHero(); disposeHero = null; }
      FX.killScroll();
      app.innerHTML = html;
      if (lenis) lenis.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0);
      init && init();
      FX.reveal(app); FX.counters(app); FX.magnetize(app); FX.tilt(app); FX.parallax(app);
      ScrollTrigger.refresh();
      if (anchor) {
        const el = document.getElementById(anchor);
        if (el) setTimeout(() => scrollTo(el, { immediate }), 60);
      }
    };
    if (immediate || FX.reduced) { swap(); return; }
    const wipe = $("#wipe");
    gsap.timeline()
      .set(wipe, { scaleY: 0, transformOrigin: "bottom" })
      .to(wipe, { scaleY: 1, duration: 0.3, ease: "power3.inOut" })
      .add(swap)
      .set(wipe, { transformOrigin: "top" })
      .to(wipe, { scaleY: 0, duration: 0.4, ease: "power3.inOut" });
  }

  // ---------- router ----------
  let currentPath = null;
  function parse() {
    const h = location.hash.replace(/^#/, "") || "/";
    const [path, anchor] = h.split("#");
    return { path: path || "/", anchor: anchor || null };
  }
  function route(first = false) {
    const { path, anchor } = parse();
    const m = path.match(/^\/project\/([\w-]+)\/?$/);
    if (m) {
      const p = PROJECTS.find((x) => x.id === m[1]);
      if (!p) { location.hash = "#/"; return; }
      document.title = `${p.title} · ${SITE.name}`;
      setDescription(`${p.title}: ${p.subtitle}. ${p.summary.slice(0, 150)}`);
      if (currentPath !== path) { currentPath = path; mount(projectView(p), () => initProject(p), { immediate: first, anchor }); }
      else if (anchor) { const el = document.getElementById(anchor); if (el) scrollTo(el); }
      return;
    }
    document.title = `${SITE.name} · ${SITE.role}`;
    setDescription("");
    if (currentPath !== "/") {
      currentPath = "/";
      mount(homeView(), initHome, { immediate: first, anchor });
    } else if (anchor) {
      const el = document.getElementById(anchor);
      if (el) scrollTo(el);
    } else {
      scrollTo(0);
    }
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#/#${anchor}`));
  }
  window.addEventListener("hashchange", () => route(false));

  // ---------- lightbox ----------
  const lb = $("#lightbox"), lbImg = $("#lb-img"), lbCap = $("#lb-cap"), lbCount = $("#lb-count");
  let cur = { images: [], index: 0 };
  function show(i) {
    const im = cur.images[i]; if (!im) return;
    cur.index = i;
    gsap.fromTo(lbImg, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" });
    lbImg.src = im.src; lbImg.alt = im.caption || "";
    lbCap.textContent = im.caption || "";
    lbCount.textContent = `${i + 1} / ${cur.images.length}`;
  }
  function openLb(images, index) { cur.images = images; show(index); lb.hidden = false; if (lenis) lenis.stop(); document.body.style.overflow = "hidden"; }
  function closeLb() { lb.hidden = true; if (lenis) lenis.start(); document.body.style.overflow = ""; }
  const step = (d) => show((cur.index + d + cur.images.length) % cur.images.length);
  document.addEventListener("click", (e) => {
    const dk = e.target.closest(".deck-cover");
    if (dk) {
      const d = PRESENTATIONS[+dk.closest(".deck").dataset.deck];
      if (d && d.slides && d.slides.length) openLb(d.slides, 0);
      return;
    }
    const aw = e.target.closest(".award-img");
    if (aw) { const img = aw.querySelector("img"); openLb([{ src: img.getAttribute("src"), caption: img.alt }], 0); return; }
    const sf = e.target.closest(".step-fig");
    if (sf) {
      const proj = PROJECTS.find((x) => x.id === sf.dataset.project);
      if (proj) { const imgs = proj.steps.filter((s) => s.image).map((s) => ({ src: s.image, caption: s.imageCaption || s.title })); const k = +sf.dataset.step; const idx = proj.steps.slice(0, k).filter((s) => s.image).length; openLb(imgs, idx); }
      return;
    }
    const pf = e.target.closest(".pub-figs figure");
    if (pf) {
      const pub = PUBLICATIONS.find((x) => x.id === pf.dataset.pub);
      if (pub) openLb(pub.figures, Number(pf.dataset.index));
      return;
    }
    const fig = e.target.closest(".gallery figure");
    if (!fig) return;
    const p = PROJECTS.find((x) => x.id === fig.parentElement.dataset.project);
    if (p) openLb(p.images, Number(fig.dataset.index));
  });
  $("#lb-close").addEventListener("click", closeLb);
  $("#lb-prev").addEventListener("click", () => step(-1));
  $("#lb-next").addEventListener("click", () => step(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // ---------- boot ----------
  FX.initCursor();
  FX.magnetize(document);
  route(true);

  const pre = $("#preloader");
  const finish = () => {
    booted = true;
    const h1 = $(".display"), tag = $(".tagline");
    if (h1) FX.splitLines(h1, 0.1);
    if (tag) FX.splitLines(tag, 0.35);
    const d2 = $(".display-2");
    if (d2 && !h1) FX.splitLines(d2, 0.1);
    ScrollTrigger.refresh();
  };
  let seen = false;
  try { seen = sessionStorage.getItem("kd-seen") === "1"; sessionStorage.setItem("kd-seen", "1"); } catch (e) {}
  if (FX.reduced || seen) { pre.remove(); finish(); }
  else {
    setTimeout(() => { if (!booted) { pre.remove(); finish(); } }, 5000);
    gsap.timeline({ onComplete: () => { pre.remove(); } })
      .from(".preloader-name span", { yPercent: 110, duration: 0.7, ease: "expo.out", stagger: 0.06 })
      .from(".preloader-line i", { scaleX: 0, transformOrigin: "left", duration: 0.6, ease: "power3.inOut" }, "-=0.45")
      .from(".preloader-sub", { opacity: 0, y: 8, duration: 0.35 }, "-=0.4")
      .to(pre, { yPercent: -100, duration: 0.6, ease: "expo.inOut", delay: 0.1, onStart: finish });
  }
})();
