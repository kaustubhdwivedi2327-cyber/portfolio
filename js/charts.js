/* Lightweight interactive SVG charts for the portfolio.
   Theme-aware (reads CSS variables), animated with GSAP when available,
   hover tooltips, dataset toggles. No dependencies beyond gsap (optional).

   Charts.render(container, spec)
   spec = {
     type: "bars" | "lines" | "hbars",
     title, subtitle, note,            // text
     yLabel, xLabel, unit,             // axis labels (unit appended in tooltip)
     decimals,                          // value formatting
     datasets: { "90 m/s": {...}, "180 m/s": {...} }   // optional toggles
     ...or the data directly:
     categories: [...], series: [{ name, values: [...] }]              (bars/hbars)
     series: [{ name, points: [[x,y],...], marker, dashed }],           (lines)
     xLog, yLog, xMin, xMax, yMin, yMax, refs: [{ y | x, label }], labels: true
   }
*/
window.Charts = (function () {
  const NS = "http://www.w3.org/2000/svg";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce");

  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const palette = () => ["--c1", "--c2", "--c3", "--c4", "--c5", "--c6", "--c7"].map(css);
  const el = (tag, attrs = {}, parent = null) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const div = (cls, parent, html) => {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    if (parent) parent.appendChild(d);
    return d;
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (v, d) => {
    if (v == null || isNaN(v)) return "";
    if (d != null) return Number(v).toFixed(d);
    const a = Math.abs(v);
    if (a >= 1000) return Math.round(v).toLocaleString();
    if (a >= 100) return v.toFixed(0);
    if (a >= 10) return v.toFixed(1);
    if (a >= 1) return v.toFixed(2);
    return v.toFixed(3);
  };
  const sci = (v) => {
    const e = Math.floor(Math.log10(v));
    const m = v / Math.pow(10, e);
    return (Math.abs(m - 1) < 1e-9 ? "" : fmt(m, 1) + "×") + "10^" + e;
  };

  // ---------- axis helpers ----------
  function niceTicks(min, max, n = 5) {
    if (min === max) { max = min + 1; }
    const span = max - min;
    const rough = span / n;
    const p = Math.pow(10, Math.floor(Math.log10(rough)));
    const r = rough / p;
    const step = (r >= 5 ? 10 : r >= 2 ? 5 : r >= 1 ? 2 : 1) * p;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let t = lo; t <= hi + step / 2; t += step) ticks.push(+t.toFixed(10));
    return { ticks, lo, hi, step };
  }
  function logTicks(min, max) {
    const lo = Math.floor(Math.log10(min)), hi = Math.ceil(Math.log10(max));
    const ticks = [];
    for (let e = lo; e <= hi; e++) ticks.push(Math.pow(10, e));
    return { ticks, lo: Math.pow(10, lo), hi: Math.pow(10, hi) };
  }

  // ---------- tooltip ----------
  function makeTip(container) {
    const t = div("chart-tip", container);
    t.hidden = true;
    return {
      show(html, x, y) {
        t.innerHTML = html;
        t.hidden = false;
        const r = container.getBoundingClientRect();
        let left = x - r.left + 14, top = y - r.top - 10;
        if (left + t.offsetWidth > r.width - 8) left = x - r.left - t.offsetWidth - 14;
        t.style.left = left + "px";
        t.style.top = top + "px";
      },
      hide() { t.hidden = true; },
    };
  }

  // ---------- frame ----------
  function frame(container, spec) {
    container.classList.add("chart");
    container.innerHTML = "";
    const head = div("chart-head", container);
    if (spec.title) div("chart-title", head, esc(spec.title));
    if (spec.subtitle) div("chart-sub", head, esc(spec.subtitle));
    let toggles = null;
    if (spec.datasets) {
      toggles = div("chart-toggles", head);
      Object.keys(spec.datasets).forEach((k, i) => {
        const b = document.createElement("button");
        b.className = "chip chart-chip" + (i === 0 ? " active" : "");
        b.textContent = k;
        b.dataset.key = k;
        toggles.appendChild(b);
      });
    }
    const body = div("chart-body", container);
    const legend = div("chart-legend", container);
    if (spec.note) div("chart-note", container, esc(spec.note));
    return { head, toggles, body, legend };
  }

  function legendFor(legend, names, colors, markers) {
    legend.innerHTML = names.map((n, i) => `<span class="lg"><i style="background:${colors[i % colors.length]}"></i>${esc(n)}</span>`).join("");
  }

  // ---------- bars ----------
  function drawBars(body, tip, data, spec, colors) {
    const W = 720, H = 340, mL = 56, mR = 16, mT = 18, mB = 54;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart-svg", role: "img" }, body);
    const cats = data.categories, series = data.series;
    let vmax = -Infinity, vmin = 0;
    series.forEach((s) => s.values.forEach((v) => { if (v != null) { vmax = Math.max(vmax, v); vmin = Math.min(vmin, v); } }));
    if (spec.yMax != null) vmax = spec.yMax;
    if (spec.yMin != null) vmin = spec.yMin;
    const { ticks, lo, hi } = niceTicks(Math.min(vmin, 0), vmax * 1.08, 5);
    const y = (v) => mT + (H - mT - mB) * (1 - (v - lo) / (hi - lo));
    const x0 = mL, x1 = W - mR, iw = x1 - x0;
    const gw = iw / cats.length;
    const n = series.length;
    const bw = Math.min(46, (gw * 0.72) / n);
    const ink3 = css("--ink-3"), line = css("--line"), ink2 = css("--ink-2");

    // grid + y ticks
    ticks.forEach((t) => {
      el("line", { x1: x0, x2: x1, y1: y(t), y2: y(t), stroke: line, "stroke-width": t === 0 ? 1.2 : 0.8, "stroke-dasharray": t === 0 ? "" : "3 4" }, svg);
      el("text", { x: x0 - 8, y: y(t) + 4, "text-anchor": "end", class: "tick", fill: ink3 }, svg).textContent = fmt(t, spec.tickDecimals);
    });
    if (spec.yLabel) el("text", { x: 14, y: (mT + H - mB) / 2, transform: `rotate(-90 14 ${(mT + H - mB) / 2})`, "text-anchor": "middle", class: "axis-label", fill: ink2 }, svg).textContent = spec.yLabel;

    const bars = [];
    cats.forEach((c, ci) => {
      const cx = x0 + gw * ci + gw / 2;
      el("text", { x: cx, y: H - mB + 20, "text-anchor": "middle", class: "cat", fill: ink2 }, svg).textContent = c;
      if (spec.catSub && spec.catSub[ci]) el("text", { x: cx, y: H - mB + 36, "text-anchor": "middle", class: "cat-sub", fill: ink3 }, svg).textContent = spec.catSub[ci];
      series.forEach((s, si) => {
        const v = s.values[ci];
        if (v == null) return;
        const bx = cx - (n * bw) / 2 + si * bw + 1;
        const top = y(Math.max(v, 0)), bottom = y(Math.min(v, 0));
        const color = s.color || colors[si % colors.length];
        const r = el("rect", { x: bx, y: top, width: bw - 2, height: Math.max(bottom - top, 0.5), rx: 3, fill: color, class: "bar" }, svg);
        r.style.transformOrigin = `${bx + bw / 2}px ${y(0)}px`;
        bars.push(r);
        if (spec.labels !== false) {
          const t = el("text", { x: bx + (bw - 2) / 2, y: v >= 0 ? top - 5 : bottom + 12, "text-anchor": "middle", class: "val", fill: ink2 }, svg);
          t.textContent = (spec.prefixSign && v > 0 ? "+" : "") + fmt(v, spec.decimals) + (spec.labelUnit || "");
          bars.push(t);
        }
        r.addEventListener("mousemove", (e) => tip.show(`<b>${esc(s.name)}</b><br>${esc(c)}: ${fmt(v, spec.decimals)}${esc(spec.unit ? " " + spec.unit : "")}`, e.clientX, e.clientY));
        r.addEventListener("mouseleave", tip.hide);
      });
    });
    return { svg, animate: () => animateBars(bars, svg) };
  }

  function animateBars(nodes, svg) {
    if (reduced || !window.gsap) return;
    const rects = nodes.filter((n) => n.tagName === "rect");
    const texts = nodes.filter((n) => n.tagName === "text");
    gsap.set(rects, { scaleY: 0 });
    gsap.set(texts, { opacity: 0 });
    gsap.to(rects, { scaleY: 1, duration: 1.1, delay: 0.15, ease: "back.out(1.4)", stagger: 0.05, scrollTrigger: { trigger: svg, start: "top 80%", once: true } });
    gsap.to(texts, { opacity: 1, duration: 0.5, delay: 0.9, stagger: 0.03, scrollTrigger: { trigger: svg, start: "top 80%", once: true } });
  }

  // ---------- horizontal bars ----------
  function drawHBars(body, tip, data, spec, colors) {
    const cats = data.categories, series = data.series, n = series.length;
    const rowH = 22 * n + 14;
    const W = 720, mL = 110, mR = 60, mT = 12, mB = 36;
    const H = mT + mB + rowH * cats.length;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart-svg" }, body);
    let vmax = 0; series.forEach((s) => s.values.forEach((v) => { vmax = Math.max(vmax, v || 0); }));
    if (spec.xMax != null) vmax = spec.xMax;
    const { ticks, hi } = niceTicks(0, vmax * 1.05, 5);
    const x = (v) => mL + (W - mL - mR) * (v / hi);
    const ink3 = css("--ink-3"), line = css("--line"), ink2 = css("--ink-2");
    ticks.forEach((t) => {
      el("line", { x1: x(t), x2: x(t), y1: mT, y2: H - mB, stroke: line, "stroke-width": 0.8, "stroke-dasharray": "3 4" }, svg);
      el("text", { x: x(t), y: H - mB + 16, "text-anchor": "middle", class: "tick", fill: ink3 }, svg).textContent = fmt(t, spec.tickDecimals) + (spec.labelUnit || "");
    });
    if (spec.xLabel) el("text", { x: (mL + W - mR) / 2, y: H - 6, "text-anchor": "middle", class: "axis-label", fill: ink2 }, svg).textContent = spec.xLabel;
    const bars = [];
    cats.forEach((c, ci) => {
      const y0 = mT + rowH * ci + 7;
      el("text", { x: mL - 10, y: y0 + (rowH - 14) / 2 + 4, "text-anchor": "end", class: "cat", fill: ink2 }, svg).textContent = c;
      series.forEach((s, si) => {
        const v = s.values[ci]; if (v == null) return;
        const by = y0 + si * 22;
        const color = s.color || colors[si % colors.length];
        const r = el("rect", { x: mL, y: by, width: Math.max(x(v) - mL, 0.5), height: 18, rx: 3, fill: color, class: "bar" }, svg);
        r.style.transformOrigin = `${mL}px ${by}px`;
        bars.push(r);
        const t = el("text", { x: x(v) + 6, y: by + 13, class: "val", fill: ink2 }, svg);
        t.textContent = fmt(v, spec.decimals) + (spec.labelUnit || "");
        bars.push(t);
        r.addEventListener("mousemove", (e) => tip.show(`<b>${esc(s.name)}</b><br>${esc(c)}: ${fmt(v, spec.decimals)}${esc(spec.unit ? " " + spec.unit : "")}`, e.clientX, e.clientY));
        r.addEventListener("mouseleave", tip.hide);
      });
    });
    return { svg, animate: () => {
      if (reduced || !window.gsap) return;
      const rects = bars.filter((n) => n.tagName === "rect"), texts = bars.filter((n) => n.tagName === "text");
      gsap.set(rects, { scaleX: 0 }); gsap.set(texts, { opacity: 0 });
      gsap.to(rects, { scaleX: 1, duration: 1.1, delay: 0.15, ease: "power3.out", stagger: 0.05, scrollTrigger: { trigger: svg, start: "top 80%", once: true } });
      gsap.to(texts, { opacity: 1, duration: 0.5, delay: 0.9, stagger: 0.03, scrollTrigger: { trigger: svg, start: "top 80%", once: true } });
    } };
  }

  // ---------- lines ----------
  function drawLines(body, tip, data, spec, colors) {
    const W = 720, H = 360, mL = 62, mR = 18, mT = 18, mB = 50;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart-svg" }, body);
    const series = data.series;
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    series.forEach((s) => s.points.forEach(([px, py]) => { xmin = Math.min(xmin, px); xmax = Math.max(xmax, px); ymin = Math.min(ymin, py); ymax = Math.max(ymax, py); }));
    (spec.refs || []).forEach((r) => { if (r.y != null) { ymin = Math.min(ymin, r.y); ymax = Math.max(ymax, r.y); } if (r.x != null) { xmin = Math.min(xmin, r.x); xmax = Math.max(xmax, r.x); } });
    if (spec.xMin != null) xmin = spec.xMin; if (spec.xMax != null) xmax = spec.xMax;
    if (spec.yMin != null) ymin = spec.yMin; if (spec.yMax != null) ymax = spec.yMax;
    const xs = spec.xLog ? logTicks(xmin, xmax) : niceTicks(xmin, xmax, 6);
    const ys = spec.yLog ? logTicks(ymin, ymax) : niceTicks(spec.yFromZero === false ? ymin : Math.min(ymin, 0), ymax * (spec.yLog ? 1 : 1.06), 5);
    const xlo = spec.xLog ? Math.log10(xs.lo) : xs.lo, xhi = spec.xLog ? Math.log10(xs.hi) : xs.hi;
    const ylo = spec.yLog ? Math.log10(ys.lo) : ys.lo, yhi = spec.yLog ? Math.log10(ys.hi) : ys.hi;
    const X = (v) => mL + (W - mL - mR) * (((spec.xLog ? Math.log10(v) : v) - xlo) / (xhi - xlo));
    const Y = (v) => mT + (H - mT - mB) * (1 - ((spec.yLog ? Math.log10(v) : v) - ylo) / (yhi - ylo));
    const ink3 = css("--ink-3"), line = css("--line"), ink2 = css("--ink-2");

    ys.ticks.forEach((t) => {
      el("line", { x1: mL, x2: W - mR, y1: Y(t), y2: Y(t), stroke: line, "stroke-width": 0.8, "stroke-dasharray": "3 4" }, svg);
      el("text", { x: mL - 8, y: Y(t) + 4, "text-anchor": "end", class: "tick", fill: ink3 }, svg).textContent = spec.yLog ? fmt(t) : fmt(t, spec.tickDecimals);
    });
    xs.ticks.forEach((t) => {
      el("line", { x1: X(t), x2: X(t), y1: mT, y2: H - mB, stroke: line, "stroke-width": 0.6, "stroke-dasharray": "3 4" }, svg);
      el("text", { x: X(t), y: H - mB + 18, "text-anchor": "middle", class: "tick", fill: ink3 }, svg).textContent = spec.xLog ? sci(t).replace("10^", "1e") : fmt(t, spec.xTickDecimals);
    });
    if (spec.yLabel) el("text", { x: 14, y: (mT + H - mB) / 2, transform: `rotate(-90 14 ${(mT + H - mB) / 2})`, "text-anchor": "middle", class: "axis-label", fill: ink2 }, svg).textContent = spec.yLabel;
    if (spec.xLabel) el("text", { x: (mL + W - mR) / 2, y: H - 8, "text-anchor": "middle", class: "axis-label", fill: ink2 }, svg).textContent = spec.xLabel;

    // reference lines
    (spec.refs || []).forEach((r) => {
      const accent = css("--ink-3");
      if (r.y != null) {
        el("line", { x1: mL, x2: W - mR, y1: Y(r.y), y2: Y(r.y), stroke: accent, "stroke-width": 1, "stroke-dasharray": "6 4" }, svg);
        el("text", { x: W - mR - 4, y: Y(r.y) - 5, "text-anchor": "end", class: "ref", fill: ink2 }, svg).textContent = r.label || "";
      }
      if (r.x != null) {
        el("line", { x1: X(r.x), x2: X(r.x), y1: mT, y2: H - mB, stroke: accent, "stroke-width": 1, "stroke-dasharray": "6 4" }, svg);
        el("text", { x: X(r.x) + 5, y: mT + 12, class: "ref", fill: ink2 }, svg).textContent = r.label || "";
      }
    });

    const paths = [], marks = [];
    series.forEach((s, si) => {
      const color = s.color || colors[si % colors.length];
      const pts = s.points.filter(([px, py]) => px != null && py != null && (!spec.xLog || px > 0) && (!spec.yLog || py > 0));
      if (s.line !== false && pts.length > 1) {
        const d = pts.map(([px, py], i) => (i ? "L" : "M") + X(px).toFixed(1) + " " + Y(py).toFixed(1)).join(" ");
        const p = el("path", { d, fill: "none", stroke: color, "stroke-width": s.width || 2.4, "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": s.dashed ? "7 5" : "" }, svg);
        paths.push(p);
      }
      if (s.marker !== false && (s.marker || pts.length <= 40)) {
        pts.forEach(([px, py], i) => {
          const c = el("circle", { cx: X(px), cy: Y(py), r: s.markerSize || 4, fill: color, stroke: css("--bg-elev"), "stroke-width": 1.5, class: "mark" }, svg);
          marks.push(c);
          c.addEventListener("mousemove", (e) => tip.show(`<b>${esc(s.name)}</b><br>${esc(spec.xLabel || "x")}: ${spec.xLog ? sci(px) : fmt(px, spec.xTickDecimals)}<br>${esc(spec.yLabel || "y")}: ${fmt(py, spec.decimals)}${esc(spec.unit ? " " + spec.unit : "")}`, e.clientX, e.clientY));
          c.addEventListener("mouseleave", tip.hide);
          if (s.pointLabels) el("text", { x: X(px), y: Y(py) - 9, "text-anchor": "middle", class: "val", fill: ink2 }, svg).textContent = s.pointLabels[i] || "";
        });
      }
    });

    // hover crosshair for dense lines (no markers)
    if (series.some((s) => s.points.length > 40)) {
      const guide = el("line", { x1: 0, x2: 0, y1: mT, y2: H - mB, stroke: ink3, "stroke-width": 1, opacity: 0 }, svg);
      const dots = series.map((s, si) => el("circle", { r: 4.5, fill: s.color || colors[si % colors.length], stroke: css("--bg-elev"), "stroke-width": 1.5, opacity: 0 }, svg));
      const hit = el("rect", { x: mL, y: mT, width: W - mL - mR, height: H - mT - mB, fill: "transparent" }, svg);
      hit.addEventListener("mousemove", (e) => {
        const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
        const xv = xlo + ((loc.x - mL) / (W - mL - mR)) * (xhi - xlo);
        const xval = spec.xLog ? Math.pow(10, xv) : xv;
        guide.setAttribute("x1", loc.x); guide.setAttribute("x2", loc.x); guide.setAttribute("opacity", 0.6);
        let rows = [];
        series.forEach((s, si) => {
          let best = null, bd = Infinity;
          s.points.forEach((p) => { const d = Math.abs(p[0] - xval); if (d < bd) { bd = d; best = p; } });
          if (best) {
            dots[si].setAttribute("cx", X(best[0])); dots[si].setAttribute("cy", Y(best[1])); dots[si].setAttribute("opacity", 1);
            rows.push(`<span class="tip-row"><i style="background:${s.color || colors[si % colors.length]}"></i>${esc(s.name)} <b>${fmt(best[1], spec.decimals)}</b></span>`);
          }
        });
        tip.show(`<div class="tip-x">${esc(spec.xLabel || "")} ${fmt(xval, spec.xTickDecimals)}</div>` + rows.join(""), e.clientX, e.clientY);
      });
      hit.addEventListener("mouseleave", () => { guide.setAttribute("opacity", 0); dots.forEach((d) => d.setAttribute("opacity", 0)); tip.hide(); });
    }

    return { svg, animate: () => {
      if (reduced || !window.gsap) return;
      paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = p.getAttribute("stroke-dasharray") ? p.getAttribute("stroke-dasharray") : `${L}`; p.style.strokeDashoffset = L; });
      gsap.to(paths, { strokeDashoffset: 0, duration: 1.6, delay: 0.15, ease: "power2.inOut", stagger: 0.15, scrollTrigger: { trigger: svg, start: "top 80%", once: true } });
      gsap.from(marks, { scale: 0, transformOrigin: "center", duration: 0.4, ease: "back.out(2)", stagger: 0.01, delay: 0.6, scrollTrigger: { trigger: svg, start: "top 85%", once: true } });
    } };
  }

  // ---------- public ----------
  function render(container, spec) {
    const f = frame(container, spec);
    const tip = makeTip(container);
    const colors = palette();
    let current = spec.datasets ? Object.keys(spec.datasets)[0] : null;

    function draw(first) {
      f.body.innerHTML = "";
      const data = spec.datasets ? spec.datasets[current] : spec;
      const merged = Object.assign({}, spec, data);
      const drawer = spec.type === "lines" ? drawLines : spec.type === "hbars" ? drawHBars : drawBars;
      const out = drawer(f.body, tip, data, merged, colors);
      legendFor(f.legend, data.series.map((s) => s.name), data.series.map((s, i) => s.color || colors[i % colors.length]));
      if (first) out.animate();
      else if (!reduced && window.gsap) gsap.from(f.body, { opacity: 0, y: 8, duration: 0.4, ease: "power2.out" });
    }
    draw(true);
    if (f.toggles) {
      f.toggles.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        f.toggles.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
        current = b.dataset.key;
        draw(false);
      });
    }
    // redraw on theme change so colours follow the palette
    window.addEventListener("themechange", () => { if (document.body.contains(container)) { draw(false); } });
    return container;
  }

  // ---------- before / after image comparison ----------
  function compare(container, opts) {
    container.classList.add("compare");
    container.innerHTML = `
      <img class="cmp-a" src="${esc(opts.before)}" alt="${esc(opts.beforeLabel || "before")}" />
      <div class="cmp-b-wrap"><img class="cmp-b" src="${esc(opts.after)}" alt="${esc(opts.afterLabel || "after")}" /></div>
      <div class="cmp-handle" role="slider" aria-label="Comparison slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0"><span></span></div>
      <span class="cmp-label l">${esc(opts.beforeLabel || "Before")}</span>
      <span class="cmp-label r">${esc(opts.afterLabel || "After")}</span>`;
    const wrap = container.querySelector(".cmp-b-wrap"), handle = container.querySelector(".cmp-handle");
    const imgA = container.querySelector(".cmp-a");
    const fit = () => { if (imgA.naturalWidth) container.style.aspectRatio = `${imgA.naturalWidth} / ${imgA.naturalHeight}`; container.style.setProperty("--cmp-w", container.clientWidth + "px"); };
    imgA.addEventListener("load", fit); fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(container);
    let pos = 50;
    const set = (p) => { pos = Math.max(0, Math.min(100, p)); wrap.style.width = pos + "%"; handle.style.left = pos + "%"; handle.setAttribute("aria-valuenow", Math.round(pos)); };
    set(50);
    let dragging = false;
    const move = (clientX) => { const r = container.getBoundingClientRect(); set(((clientX - r.left) / r.width) * 100); };
    container.addEventListener("pointerdown", (e) => { dragging = true; move(e.clientX); container.setPointerCapture(e.pointerId); });
    container.addEventListener("pointermove", (e) => { if (dragging) move(e.clientX); });
    container.addEventListener("pointerup", () => { dragging = false; });
    container.addEventListener("pointercancel", () => { dragging = false; });
    handle.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") set(pos - 3); if (e.key === "ArrowRight") set(pos + 3); });
    if (!reduced && window.gsap) {
      gsap.fromTo({ p: 50 }, { p: 50 }, { p: 30, duration: 1.4, ease: "power2.inOut", yoyo: true, repeat: 1, onUpdate: function () { if (!dragging) set(this.targets()[0].p); }, scrollTrigger: { trigger: container, start: "top 80%", once: true } });
    }
    return container;
  }

  return { render, compare };
})();

/* ---------- frame sequence scrubber (e.g. a compression test step by step) ---------- */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  window.Charts.sequence = function (container, opts) {
    const frames = opts.frames || [];
    const n = frames.length;
    if (!n) return container;
    const labels = opts.labels || frames.map((f, i) => `Frame ${i + 1}`);
    container.classList.add("seq");
    container.innerHTML = `
      ${opts.title ? `<div class="seq-title">${esc(opts.title)}</div>` : ""}
      <div class="seq-stage" data-cursor="Scrub">
        <img class="seq-img" src="${esc(frames[0])}" alt="${esc(labels[0])}" />
        <div class="seq-label mono"></div>
        <div class="seq-ticks">${frames.map((f, i) => `<i data-i="${i}"></i>`).join("")}</div>
      </div>
      <div class="seq-controls">
        <button class="btn btn-small seq-play" type="button">▶ Play</button>
        <input class="seq-range" type="range" min="0" max="${n - 1}" step="1" value="0" aria-label="Frame" />
        <span class="mono seq-count"></span>
      </div>
      ${opts.caption ? `<p class="seq-caption">${esc(opts.caption)}</p>` : ""}`;
    const img = container.querySelector(".seq-img"), range = container.querySelector(".seq-range"),
      label = container.querySelector(".seq-label"), count = container.querySelector(".seq-count"),
      play = container.querySelector(".seq-play"), stage = container.querySelector(".seq-stage"),
      ticks = container.querySelectorAll(".seq-ticks i");
    img.addEventListener("load", () => { if (img.naturalWidth && !stage.style.aspectRatio) stage.style.aspectRatio = img.naturalWidth + " / " + img.naturalHeight; }, { once: true });
    // preload
    frames.forEach((f) => { const im = new Image(); im.src = f; });
    let cur = 0, timer = null;
    const set = (i) => {
      cur = ((i % n) + n) % n;
      img.src = frames[cur]; img.alt = labels[cur];
      range.value = cur; label.textContent = labels[cur]; count.textContent = `${cur + 1} / ${n}`;
      ticks.forEach((t, k) => t.classList.toggle("on", k <= cur));
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; play.textContent = "▶ Play"; } };
    const start = () => { stop(); play.textContent = "❚❚ Pause"; timer = setInterval(() => { if (cur === n - 1) { stop(); return; } set(cur + 1); }, opts.interval || 550); };
    play.addEventListener("click", () => { if (timer) stop(); else { if (cur === n - 1) set(0); start(); } });
    range.addEventListener("input", () => { stop(); set(+range.value); });
    let dragging = false;
    const scrub = (x) => { const r = stage.getBoundingClientRect(); set(Math.round(((x - r.left) / r.width) * (n - 1))); };
    stage.addEventListener("pointerdown", (e) => { dragging = true; stop(); scrub(e.clientX); stage.setPointerCapture(e.pointerId); });
    stage.addEventListener("pointermove", (e) => { if (dragging) scrub(e.clientX); });
    stage.addEventListener("pointerup", () => { dragging = false; });
    stage.addEventListener("pointercancel", () => { dragging = false; });
    container.tabIndex = 0;
    container.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") { stop(); set(cur - 1); } if (e.key === "ArrowRight") { stop(); set(cur + 1); } if (e.key === " ") { e.preventDefault(); play.click(); } });
    set(0);
    if (!reduced && window.gsap && window.ScrollTrigger) {
      ScrollTrigger.create({ trigger: container, start: "top 75%", once: true, onEnter: () => { if (!timer && cur === 0) start(); } });
    }
    return container;
  };
})();
