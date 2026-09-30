/* Homepage markup. Text is verbatim from home-data.js (D); project media paths come from the site's js/data.js (PROJECTS). */
const PJ = id => PROJECTS.find(p => p.id === id);
const PH = f => `assets/photos/${f}.jpg`;
const NAV = [["about-me", "About"], ["projects", "Projects"], ["skills", "Skills"], ["presentations", "Talks"], ["education", "Education"], ["contact", "Contact"]];
const PREVIEW = { "slat-track": { video: "assets/slat-track/video/lpbf_temp_alsi.mp4" }, "bird-strike": { video: "assets/bird-strike/video/le_iso_gfrp.mp4", light: true },
  gearbox: { frames: ["assets/gearbox/01_exploded.jpg", "assets/gearbox/02_section.jpg", "assets/gearbox/05_prototype_pictures.jpg"] },
  lattice: { frames: ["assets/lattice/fig05.jpg", "assets/lattice/fig06.jpg", "assets/lattice/fig07.jpg", "assets/lattice/fig08.jpg", "assets/lattice/fig09.jpg", "assets/lattice/fig10.jpg", "assets/lattice/fig11.jpg", "assets/lattice/fig12.jpg"] } };
const head = (k, t, body = "", cls = "") => `<header class="sec-head ${cls}" data-reveal><p class="kicker">${esc(k)}</p><h2>${esc(t)}</h2>${body ? `<p class="sec-lede">${esc(body)}</p>` : ""}</header>`;
const seg = (id, items) => `<div class="seg" role="group" aria-label="Filter" data-filter-group="#${id}"><span class="seg-ind" aria-hidden="true"></span>${items.map((f, i) => `<button type="button" data-filter="${esc(f)}" aria-pressed="${i === 0}">${esc(f)}</button>`).join("")}</div>`;
const dual = (day, night) => `<img class="img-day" src="${day}" alt=""><img class="img-night" src="${night}" alt="">`;
const SUN = `<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/></svg>`;
const MOON = `<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/></svg>`;
const ARROW = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

function chapterCard(p, n) {
  return `<div class="chap-cap">
    <p class="kicker">${String(n).padStart(2, "0")} \u00b7 ${esc(p.cat)} \u00b7 ${esc(p.dates)}</p>
    <h2>${esc(p.title)}</h2>
    <p class="sub">${esc(p.sub)}</p>
    <dl class="cap-nums">${p.nums.map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join("")}</dl>
    <button type="button" class="cap-link" data-open="${p.id}">View project ${ARROW}</button>
  </div>`;
}

function homeHTML(d) {
  const tick = d.marquee.map(m => `<span>${esc(m)}</span><i aria-hidden="true">\u2726</i>`).join("");
  const [p1, p2] = d.projects;
  return `
<header class="nav" id="nav"><div class="nav-in">
  <a class="brand" href="#" data-goto="top"><span class="brand-mark" aria-hidden="true"></span>K. Dwivedi</a>
  <nav class="nav-links" aria-label="Sections">${NAV.map(([id, l]) => `<a href="#" data-goto="${id}" data-spy="${id}">${l}</a>`).join("")}</nav>
  <button type="button" class="theme-btn" id="theme-btn" aria-label="Switch between day and night mode">${SUN}${MOON}</button>
  ${ext(d.links.cv, "CV \u2197", "btn btn-sm btn-glass")}
</div><div class="progress" aria-hidden="true"><i id="progress"></i></div></header>

<section class="flight" id="top">
  <div class="flight-stage" id="flight-stage">
    <div class="sky" aria-hidden="true"></div>
    <div class="sky-photo" aria-hidden="true"><img src="assets/render/f00000.webp" alt=""></div>
    <canvas id="wing" aria-label="3D model of the NASA Common Research Model airliner in high-lift configuration: a scan plane cuts the skin away to show LPBF slat-track cans behind the front spar, then a bird strikes the outboard slat"></canvas>
    <div class="flight-scrim" aria-hidden="true"></div>
    <span class="pin" id="pin-can" aria-hidden="true"><span>Track can \u00b7 ${esc(p1.tags[0].replace(" / ", " "))}</span></span>
    <span class="pin" id="pin-hit" aria-hidden="true"><span>${esc(p2.tags[1])}</span></span>
    <div class="chap c0"><div class="wrap">
      <p class="eyebrow"><span class="pulse" aria-hidden="true"></span>${esc(d.eyebrow)}</p>
      <h1 class="hero-name"><span class="ln"><span>${esc(d.name[0])}</span></span><span class="ln"><span>${esc(d.name[1])}</span></span></h1>
      <p class="hero-tag">${esc(d.tagline[0])} <em>${esc(d.tagline[1])}</em> ${esc(d.tagline[2])}</p>
      <div class="actions">
        <a class="btn btn-accent" href="#" data-goto="projects">View projects</a>
        ${ext(d.links.cv, "Download CV", "btn btn-glass")}
        ${ext(d.links.linkedin, "LinkedIn \u2197", "btn btn-text")}
      </div>
    </div><div class="scroll-cue" aria-hidden="true"><span>Scroll</span><i></i></div></div>
    <div class="chap c1 cap"><div class="wrap">${chapterCard(p1, 1)}</div></div>
    <div class="chap c2 cap"><div class="wrap">${chapterCard(p2, 2)}</div></div>
    <div class="chap c3 cap"><div class="wrap"><div class="stats">
      ${d.stats.map(s => `<div class="stat"><span class="stat-v">${esc(s.v)}</span><span class="stat-l">${esc(s.l)}</span></div>`).join("")}
    </div></div></div>
    <nav class="flight-hud" aria-label="Story chapters">${["Approach", "Slat track", "Bird strike", "The numbers"].map((l, i) => `<button type="button" class="hud-step" data-chapter="${i}"><i><b></b></i><span>${l}</span></button>`).join("")}</nav>
    <div class="scene-load" id="scene-load" aria-hidden="true"><span>Loading aircraft</span><i></i></div>
  </div>
</section>

<section class="intro" aria-label="Profile"><div class="wrap"><p class="intro-lede" data-reveal>${esc(d.lede)}</p></div></section>

<div class="ticker" aria-label="Tools and standards"><div class="ticker-t">${tick}${tick}</div></div>

<section class="statement" id="about">
  <div class="statement-bg" aria-hidden="true" data-parallax>${dual(PH("clouds"), PH("dusk"))}</div>
  <div class="statement-scrim" aria-hidden="true"></div>
  <div class="wrap statement-in">
    <blockquote id="quote">\u201c${esc(d.quote)}\u201d</blockquote>
    <p class="pill"><span class="pulse" aria-hidden="true"></span>${esc(d.open)}</p>
  </div>
</section>

<section class="sec" id="about-me">
  <div class="wrap about">
    <aside class="about-side">
      <figure class="portrait" data-reveal><img src="assets/portrait.jpg" alt="Portrait of Kaustubh Dwivedi" loading="lazy"></figure>
      <dl class="facts" data-reveal>${d.about.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
    </aside>
    <div class="about-main">
      ${head(d.about.kicker, d.about.title)}
      <p class="about-body" data-reveal>${esc(d.about.body)}</p>
      <div class="timeline" id="timeline">
        <span class="tl-track" aria-hidden="true"><span class="tl-fill" id="tl-fill"></span></span>
        <ol>${d.about.timeline.map(([t, a, b]) => `<li class="tl-item"><span class="tl-dot" aria-hidden="true"></span><span class="tl-date">${esc(t)}</span><span class="tl-title">${esc(a)}</span><span class="tl-org">${esc(b)}</span></li>`).join("")}</ol>
      </div>
    </div>
  </div>
</section>

<section class="sec alt" id="projects">
  <div class="wrap">
    <div class="work-head">${head(d.projectsIntro.kicker, d.projectsIntro.title, d.projectsIntro.body)}<div class="filter-row">${seg("works", d.filters)}</div></div>
    <div class="works" id="works">${d.projects.map((p, i) => {
      const pr = PREVIEW[p.id] || {}, cover = PJ(p.id).cover;
      return `<article class="work w${i + 1}" data-cat="${esc(p.cat)}" data-reveal>
        <div class="work-media${pr.light ? " light" : ""}">
          <img class="work-cover" src="${cover}" alt="${esc(p.title)}" loading="lazy">
          ${pr.video ? `<video class="work-prev" src="${pr.video}" muted loop playsinline preload="none" aria-hidden="true"></video>` : ""}
          ${pr.frames ? `<div class="work-frames" aria-hidden="true">${pr.frames.map(f => `<img src="${f}" alt="" loading="lazy">`).join("")}</div>` : ""}
          <span class="work-i">${String(i + 1).padStart(2, "0")}</span>
        </div>
        <div class="work-body">
          <p class="work-meta"><span>${esc(p.cat)}</span><span>${esc(p.dates)}</span></p>
          <h3>${esc(p.title)}</h3>
          <p class="work-sub">${esc(p.sub)}</p>
          <div class="work-nums">${p.nums.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div>
          <ul class="chips">${p.tags.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
          <div class="work-foot">${p.media ? `<span class="media">${esc(p.media)}</span>` : "<span></span>"}<span class="work-go">View project ${ARROW}</span></div>
        </div>
        <button type="button" class="work-hit" data-open="${p.id}" aria-label="View project: ${esc(p.title)}"></button>
      </article>`; }).join("")}
    </div>
  </div>
</section>

<section class="sec" id="skills"><div class="wrap">
  ${head(d.skillsIntro.kicker, d.skillsIntro.title)}
  <div class="bento">${d.skills.map(([t, b], i) => `
    <div class="tile t${i + 1}${i === 0 ? " photo" : ""}" data-reveal>
      ${i === 0 ? `<img class="tile-bg" src="${PH("tunnel")}" alt="" loading="lazy"><span class="tile-shade" aria-hidden="true"></span>` : ""}
      <span class="tile-i">${String(i + 1).padStart(2, "0")}</span><h3>${esc(t)}</h3><p>${esc(b)}</p></div>`).join("")}
  </div>
</div></section>

<section class="sec alt" id="tools"><div class="wrap">
  ${head(d.toolsIntro.kicker, d.toolsIntro.title, d.toolsIntro.body)}
  <div class="tools">${d.tools.map(([n, l, u, ps]) => `
    <div class="tool" data-reveal>
      <div class="tool-h"><h3>${esc(n)}</h3><span class="meter" data-level="${{ Advanced: 3, Working: 2, Familiar: 1 }[l]}" aria-label="${l}"><i></i><i></i><i></i></span><span class="lvl">${esc(l)}</span></div>
      <p>${esc(u)}</p><ul class="chips">${ps.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
    </div>`).join("")}
  </div>
</div></section>

<section class="sec" id="training"><div class="wrap">
  ${head(d.trainingIntro.kicker, d.trainingIntro.title, d.trainingIntro.body)}
  <div class="train">${d.training.map(g => { const m = g.count.match(/^(\d+)\s*(.*)$/); return `
    <div class="train-card" data-reveal>
      <div class="train-h"><span class="ds" aria-hidden="true">DS</span><p>${esc(g.org)}</p><span class="train-n"><b>${m[1]}</b> ${esc(m[2])}</span></div>
      <ul class="clamp">${g.courses.map(([c, tags]) => `<li><span class="yr">2025</span><div><span class="cn">${esc(c)}</span><span class="ct">${tags.map(esc).join(" \u00b7 ")}</span></div></li>`).join("")}</ul>
      ${g.courses.length > 5 ? `<button type="button" class="more" data-more data-all="Show all ${esc(g.count)}" data-less="Show fewer">Show all ${esc(g.count)}</button>` : ""}
    </div>`; }).join("")}
  </div>
</div></section>

<section class="sec alt" id="presentations"><div class="wrap">
  ${head(d.talksIntro.kicker, d.talksIntro.title, d.talksIntro.body)}
  <div class="decks">${d.talks.map((t, i) => `
    <button type="button" class="deck" data-deck="${i}" data-reveal>
      <span class="deck-media"><img src="${PRESENTATIONS[i].cover}" alt="${esc(t.title)}, title slide" loading="lazy"><span class="deck-count">${esc(t.count)}</span><span class="deck-play" aria-hidden="true">${ARROW}</span></span>
      <span class="kicker">${esc(t.kind)}</span>
      <span class="deck-t">${esc(t.title)}</span>
      <span class="deck-where">${esc(t.where)}</span>
      <span class="deck-body">${esc(t.body)}</span>
    </button>`).join("")}
  </div>
</div></section>

<section class="banner on-photo" id="publications">
  <div class="banner-media" aria-hidden="true"><img src="${PH("a350")}" alt="" loading="lazy" data-parallax></div>
  <div class="banner-shade" aria-hidden="true"></div>
  <div class="wrap banner-in">${head(d.pubsIntro.kicker, d.pubsIntro.title, d.pubsIntro.body)}</div>
</section>
<section class="sec pubs-sec"><div class="wrap">
  <div class="filter-row filter-left">${seg("pubs", d.pubFilters)}</div>
  <div class="pubs" id="pubs">${d.pubs.map((p, i) => `
    <article class="pub" data-cat="${pubCat(p.type)}" data-reveal>
      <img class="pub-cover" src="${PUBLICATIONS[i].cover}" alt="" loading="lazy">
      <div class="pub-body">
        <p class="pub-meta"><span>${esc(p.year)}</span><span>${esc(p.type)}</span>${p.badge ? `<em>${esc(p.badge)}</em>` : ""}</p>
        <h3>${esc(p.title)}</h3>
        <p class="pub-auth">${esc(p.authors).replace("Kaustubh Dwivedi", "<strong>Kaustubh Dwivedi</strong>")}</p>
        <p class="pub-venue">${esc(p.venue)}</p>
        <div class="pub-links">${ext(doiUrl(p.doi), "doi:" + esc(p.doi) + " \u2197", "link")}${p.project ? `<button type="button" class="link" data-open="${p.project}">Project page \u2192</button>` : ""}</div>
        <details class="pub-det"><summary><span>${esc(p.panel)}</span><i aria-hidden="true"></i></summary>
          <div class="det-in">
            <h4>${esc(p.absLabel)}</h4><p>${esc(p.abs)}</p>
            ${p.figs.length ? `<h4>Figures</h4><div class="figs">${(PUBLICATIONS[i].figures || []).map((f, k) => `<figure><button type="button" class="fig-btn" data-lb-group="pub${i}" data-lb-index="${k}"><img src="${f.src}" alt="" loading="lazy"></button><figcaption>${esc(p.figs[k] || f.caption || "")}</figcaption></figure>`).join("")}</div>` : ""}
            <div class="cite" data-cite><h4>Cite</h4><p data-cite-text>${esc(p.cite)}</p><button type="button" class="btn btn-sm btn-solid" data-copy>Copy</button></div>
            ${p.note ? `<p class="fine">${esc(p.note)}</p>` : ""}
          </div>
        </details>
      </div>
    </article>`).join("")}
  </div>
  <div class="actions">${ext(d.links.researchgate, "ResearchGate \u2197", "btn btn-outline")}${ext(d.links.orcid, "ORCID \u2197", "btn btn-outline")}</div>
</div></section>

<section class="sec alt" id="education"><div class="wrap">
  ${head(d.eduIntro.kicker, d.eduIntro.title)}
  <div class="edu">${d.edu.map((e, i) => `
    <div class="edu-card${i ? " plain" : ""}" data-reveal>
      ${i === 0 ? `<div class="edu-photo"><img src="${PH("cranfield")}" alt="Cranfield University library" loading="lazy" data-parallax></div>` : ""}
      <div class="edu-in"><p class="edu-when">${esc(e.when)}</p><h3>${esc(e.deg)}</h3><p class="edu-inst">${esc(e.inst)}</p>${e.body.map(b => `<p class="b">${esc(b)}</p>`).join("")}</div>
    </div>`).join("")}
  </div>
  <h3 class="awards-h" data-reveal>${esc(d.awardsTitle)}</h3>
  <div class="awards">${d.awards.map(([t, m, b], i) => `
    <div class="award" data-reveal>${i === 0 ? `<button type="button" class="fig-btn" data-lb-src="assets/gearbox/03_certificate.jpg" data-lb-cap="${esc(t)}"><img src="assets/gearbox/03_certificate.jpg" alt="ConnectNext certificate" loading="lazy"></button>` : `<span class="award-mark" aria-hidden="true">\u2726</span>`}
      <div><h4>${esc(t)}</h4><p class="award-m">${esc(m)}</p><p>${esc(b)}</p></div></div>`).join("")}
  </div>
  <p class="status" data-reveal>${esc(d.status)}</p>
</div></section>

<section class="contact" id="contact">
  <div class="contact-media" aria-hidden="true"><img src="${PH("glow")}" alt="" loading="lazy" data-parallax></div>
  <div class="contact-shade" aria-hidden="true"></div>
  <div class="wrap contact-in">
    <p class="kicker">${esc(d.contact.kicker)}</p>
    <h2 class="contact-h" data-reveal>${esc(d.contact.title)}</h2>
    <div class="mail" data-cite data-reveal><span data-cite-text>${esc(d.links.email)}</span><button type="button" class="btn btn-sm btn-glass" data-copy>Copy</button></div>
    <p class="contact-open" data-reveal>${esc(d.open)}</p>
    <div class="actions" data-reveal>${ext(d.links.linkedin, "LinkedIn \u2197", "btn btn-glass")}${ext(d.links.researchgate, "ResearchGate \u2197", "btn btn-glass")}${ext(d.links.cv, "Download CV (PDF)", "btn btn-accent")}</div>
  </div>
</section>
<footer class="foot">
  <div class="wrap foot-in">
    <div><p class="foot-name">${esc(d.name.join(" "))}</p><p>${esc(d.eyebrow)}</p></div>
    <nav aria-label="Links"><a href="mailto:${esc(d.links.email)}">Email</a>${ext(d.links.linkedin, "LinkedIn")}${ext(d.links.researchgate, "ResearchGate")}${ext(d.links.cv, "CV")}</nav>
    <p>\u00a9 2026</p>
  </div>
  <p class="wrap credits">Photography via Wikimedia Commons: Jacky Lo and Paul-Vincent Roll (CC0); Mike McBey (${ext("https://creativecommons.org/licenses/by/2.0/", "CC BY 2.0")}); Achim Hering (${ext("https://creativecommons.org/licenses/by/3.0/", "CC BY 3.0")}); Laurent Errera (${ext("https://creativecommons.org/licenses/by-sa/2.0/", "CC BY-SA 2.0")}); Daniel Case, Priyaflorenceshah and Chemical Engineer (${ext("https://creativecommons.org/licenses/by-sa/4.0/", "CC BY-SA 4.0")}); wind-tunnel photograph NASA (public domain). 3D aircraft: NASA Common Research Model, high-lift reference geometry (CRM-HL), used for research visualisation; slat-track can: the LPBF AlSi10Mg design from this project.</p>
</footer>
<div class="case" id="case" hidden role="dialog" aria-modal="true" aria-label="Project"></div>
<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Image viewer"></div>`;
}

document.getElementById("app").innerHTML = homeHTML(D);
wireCommon(document.getElementById("app"));
