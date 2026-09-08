/* Motion and interaction helpers. Depends on gsap + ScrollTrigger (global). */

window.FX = (function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce");
  const finePointer = window.matchMedia("(pointer: fine)").matches && !reduced;

  // ---------- custom cursor ----------
  function initCursor() {
    const el = document.getElementById("cursor");
    if (!el || !finePointer) { el && el.remove(); return; }
    document.documentElement.classList.add("has-cursor");
    const dot = el.querySelector(".cursor-dot");
    const ring = el.querySelector(".cursor-ring");
    const dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("mousemove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); el.classList.add("on"); });
    document.addEventListener("mouseleave", () => el.classList.remove("on"));
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("a, button, [data-cursor], .gallery figure, .card");
      el.classList.toggle("hover", !!t);
      const label = t && t.getAttribute("data-cursor");
      ring.setAttribute("data-label", label || "");
      el.classList.toggle("label", !!label);
    });
    document.addEventListener("mousedown", () => el.classList.add("down"));
    document.addEventListener("mouseup", () => el.classList.remove("down"));
  }

  // ---------- magnetic elements ----------
  function magnetize(root = document) {
    if (!finePointer || reduced) return;
    root.querySelectorAll("[data-magnetic]").forEach((el) => {
      if (el._magnetic) return;
      el._magnetic = true;
      const strength = parseFloat(el.getAttribute("data-magnetic")) || 0.35;
      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  // ---------- scroll reveals ----------
  function reveal(root = document) {
    const els = root.querySelectorAll("[data-reveal]");
    els.forEach((el) => {
      if (el._revealed) return;
      el._revealed = true;
      const kind = el.getAttribute("data-reveal") || "up";
      const delay = parseFloat(el.getAttribute("data-delay")) || 0;
      if (reduced) { el.style.opacity = 1; return; }
      const from = { opacity: 0, duration: 0.7, ease: "power3.out", delay };
      if (kind === "up") Object.assign(from, { y: 24 });
      if (kind === "left") Object.assign(from, { x: -36 });
      if (kind === "right") Object.assign(from, { x: 36 });
      if (kind === "scale") Object.assign(from, { scale: 0.94 });
      if (kind === "clip") { from.clipPath = "inset(0 0 100% 0)"; from.y = 0; }
      gsap.from(el, { ...from, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });

    root.querySelectorAll("[data-stagger]").forEach((el) => {
      if (el._staggered) return;
      el._staggered = true;
      const kids = Array.from(el.children);
      if (reduced || !kids.length) return;
      gsap.from(kids, {
        opacity: 0, y: 20, duration: 0.6, ease: "power3.out", stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
  }

  // ---------- split text lines ----------
  function splitLines(el, delay = 0.1) {
    if (!el) return;
    const lines = el.querySelectorAll(".line");
    if (reduced || !lines.length) return;
    gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, delay, overwrite: true });
    // Safety: if frames are throttled (background tab), never leave the heading hidden.
    setTimeout(() => gsap.set(lines, { yPercent: 0, overwrite: true }), 3500);
  }

  // ---------- counters ----------
  function counters(root = document) {
    root.querySelectorAll("[data-count]").forEach((el) => {
      if (el._counted) return;
      el._counted = true;
      const target = parseFloat(el.getAttribute("data-count"));
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const fmt = (v) => v.toFixed(decimals) + suffix;
      if (reduced) { el.textContent = fmt(target); return; }
      const obj = { v: 0 };
      el.textContent = fmt(0);
      gsap.to(obj, {
        v: target, duration: 1.4, ease: "power3.out",
        onUpdate: () => { el.textContent = fmt(obj.v); },
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });
  }

  // ---------- parallax ----------
  function parallax(root = document) {
    if (reduced) return;
    root.querySelectorAll("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.getAttribute("data-parallax")) || 0.15;
      gsap.to(el, {
        yPercent: amt * 100, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  }

  // ---------- 3D tilt on cards ----------
  function tilt(root = document) {
    if (!finePointer || reduced) return;
    root.querySelectorAll("[data-tilt]").forEach((el) => {
      if (el._tilt) return;
      el._tilt = true;
      const rX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
      const rY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
      gsap.set(el, { transformPerspective: 900 });
      let pending = 0;
      el.addEventListener("mousemove", (e) => {
        if (pending) return;
        const cx = e.clientX, cy = e.clientY;
        pending = requestAnimationFrame(() => {
          pending = 0;
          const r = el.getBoundingClientRect();
          const px = (cx - r.left) / r.width - 0.5;
          const py = (cy - r.top) / r.height - 0.5;
          rY(px * 8); rX(-py * 8);
          el.style.setProperty("--mx", (px + 0.5) * 100 + "%");
          el.style.setProperty("--my", (py + 0.5) * 100 + "%");
        });
      });
      el.addEventListener("mouseleave", () => { rX(0); rY(0); });
    });
  }

  function killScroll() {
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  return { reduced, finePointer, initCursor, magnetize, reveal, splitLines, counters, parallax, tilt, killScroll };
})();
