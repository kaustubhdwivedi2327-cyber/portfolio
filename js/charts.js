/* SVG charts for the project pages, driven by the chart specs in js/data.js.
   Types: bars (grouped), hbars (grouped), lines (linear or log axes, markers, reference lines, CURVES data).
   Categorical colours come from the validated palette tokens --c1..--c4; text uses text tokens only. */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const fmt = (v, d = 1) => (Math.abs(v) >= 1e5 ? v.toExponential(2).replace("e+", "\u00d710^") : (+v).toFixed(d));
  const niceStep = (range, n) => { const raw = range / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p; };
  const ticksLin = (lo, hi, n = 5) => { const st = niceStep(hi - lo || 1, n), out = []; for (let v = Math.ceil(lo / st) * st; v <= hi + st * 1e-6; v += st) out.push(+v.toFixed(10)); return out; };
  const ticksLog = (lo, hi) => { const out = []; for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) for (const m of [1, 2, 5]) { const v = m * 10 ** e; if (v >= lo && v <= hi) out.push(v); } return out; };
  const logLabel = v => { const e = Math.floor(Math.log10(v)), m = Math.round(v / 10 ** e); return e >= 4 ? `${m === 1 ? "" : m + "\u00d7"}10${String(e).split("").map(c => "\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079"[c]).join("")}` : String(v); };
  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const COLORS = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)"];

  /* Resolve the spec into tabs: [{label, categories?, series}] */
  function tabsOf(spec) {
    if (spec.curves) return Object.entries(spec.curves).map(([label, key]) => ({ label, series: Object.entries((window.CURVES || {})[key] || {}).map(([name, points]) => ({ name, points })) }));
    if (spec.datasets) return Object.entries(spec.datasets).map(([label, ds]) => ({ label, categories: ds.categories, series: ds.series }));
    return [{ label: "", categories: spec.categories, series: spec.series }];
  }

  function tooltip(box) {
    const t = document.createElement("div"); t.className = "ch-tip"; t.hidden = true; box.appendChild(t);
    return {
      show(html, x, y) { t.innerHTML = html; t.hidden = false; const bw = box.clientWidth; t.style.left = Math.min(Math.max(x, 8), bw - t.offsetWidth - 8) + "px"; t.style.top = Math.max(y - t.offsetHeight - 12, 4) + "px"; },
      hide() { t.hidden = true; }
    };
  }

  function drawBars(box, spec, tab, horizontal) {
    const W = 720, cats = tab.categories, ser = tab.series, dec = spec.decimals ?? 1;
    const max = Math.max(...ser.flatMap(s => s.values)) * 1.12 || 1;
    const svg = el("svg", { viewBox: `0 0 ${W} ${horizontal ? 60 + cats.length * (22 * ser.length + 18) : 360}`, class: "ch-svg", role: "img", "aria-label": spec.title });
    const tip = tooltip(box);
    if (!horizontal) {
      const H = 360, L = 58, R = 12, Tp = 16, B = spec.catSub ? 66 : 48, pw = W - L - R, ph = H - Tp - B;
      const ticks = ticksLin(0, max, 5);
      ticks.forEach(v => { const y = Tp + ph - v / max * ph; el("line", { x1: L, x2: W - R, y1: y, y2: y, class: "ch-grid" }, svg); el("text", { x: L - 8, y: y + 4, class: "ch-tick", "text-anchor": "end" }, svg).textContent = fmt(v, spec.tickDecimals ?? (max < 5 ? 2 : 0)); });
      if (spec.yLabel) { const t = el("text", { x: 14, y: Tp + ph / 2, class: "ch-axis", transform: `rotate(-90 14 ${Tp + ph / 2})`, "text-anchor": "middle" }, svg); t.textContent = spec.yLabel; }
      const gw = pw / cats.length, bw = Math.min(34, (gw - 14) / ser.length - 2);
      cats.forEach((c, i) => {
        const gx = L + i * gw + gw / 2, x0 = gx - (bw + 2) * ser.length / 2;
        ser.forEach((s, k) => {
          const v = s.values[i], h = Math.max(1, v / max * ph), x = x0 + k * (bw + 2), y = Tp + ph - h;
          const r = el("path", { d: `M${x},${Tp + ph} v${-h + 4} q0,-4 4,-4 h${bw - 8} q4,0 4,4 v${h - 4} z`, fill: COLORS[k % 4], class: "ch-bar", style: `--d:${i * 40 + k * 20}ms` }, svg);
          const hit = el("rect", { x: x - 1, y: Tp, width: bw + 2, height: ph, fill: "transparent" }, svg);
          hit.addEventListener("pointerenter", () => { r.classList.add("hot"); const b = box.getBoundingClientRect(), rb = r.getBoundingClientRect(); tip.show(`<b>${esc(c)}</b><span><i style="background:${COLORS[k % 4]}"></i>${esc(s.name)}: ${fmt(v, dec)}${spec.unit ? " " + esc(spec.unit) : ""}</span>`, rb.left - b.left, rb.top - b.top); });
          hit.addEventListener("pointerleave", () => { r.classList.remove("hot"); tip.hide(); });
        });
        el("text", { x: gx, y: Tp + ph + 20, class: "ch-cat", "text-anchor": "middle" }, svg).textContent = c;
        if (spec.catSub) el("text", { x: gx, y: Tp + ph + 38, class: "ch-sub", "text-anchor": "middle" }, svg).textContent = spec.catSub[i];
      });
      el("line", { x1: L, x2: W - R, y1: Tp + ph, y2: Tp + ph, class: "ch-base" }, svg);
    } else {
      const L = 70, R = 70, Tp = 10, rowH = 22 * ser.length + 18, pw = W - L - R;
      cats.forEach((c, i) => {
        const y0 = Tp + i * rowH;
        el("text", { x: L - 10, y: y0 + rowH / 2 + 2, class: "ch-cat", "text-anchor": "end" }, svg).textContent = c;
        ser.forEach((s, k) => {
          const v = s.values[i], w = Math.max(1, v / max * pw), y = y0 + 8 + k * 22;
          const r = el("path", { d: `M${L},${y} h${w - 4} q4,0 4,4 v10 q0,4 -4,4 h${-w + 4} z`, fill: COLORS[k % 4], class: "ch-bar h", style: `--d:${i * 40 + k * 20}ms` }, svg);
          el("text", { x: L + w + 6, y: y + 13, class: "ch-val" }, svg).textContent = fmt(v, spec.decimals ?? 1) + (spec.labelUnit || "");
          const hit = el("rect", { x: L, y: y - 2, width: pw, height: 22, fill: "transparent" }, svg);
          hit.addEventListener("pointerenter", () => { r.classList.add("hot"); const b = box.getBoundingClientRect(), rb = r.getBoundingClientRect(); tip.show(`<b>${esc(c)}</b><span><i style="background:${COLORS[k % 4]}"></i>${esc(s.name)}: ${fmt(v, spec.decimals ?? 1)}${esc(spec.labelUnit || "")}</span>`, rb.right - b.left - 80, rb.top - b.top); });
          hit.addEventListener("pointerleave", () => { r.classList.remove("hot"); tip.hide(); });
        });
      });
      el("line", { x1: L, x2: L, y1: Tp, y2: Tp + cats.length * rowH, class: "ch-base" }, svg);
    }
    return svg;
  }

  function drawLines(box, spec, tab) {
    const W = 720, H = 380, L = 64, R = 16, Tp = 16, B = 52, pw = W - L - R, ph = H - Tp - B, ser = tab.series;
    const pts = ser.flatMap(s => s.points);
    let xMin = spec.xMin ?? Math.min(...pts.map(p => p[0])), xMax = spec.xMax ?? Math.max(...pts.map(p => p[0]));
    let yMin = spec.yMin ?? Math.min(...pts.map(p => p[1])), yMax = spec.yMax ?? Math.max(...pts.map(p => p[1])) * 1.08;
    const X = v => L + (spec.xLog ? (Math.log10(v) - Math.log10(xMin)) / (Math.log10(xMax) - Math.log10(xMin)) : (v - xMin) / (xMax - xMin)) * pw;
    const Y = v => Tp + ph - (spec.yLog ? (Math.log10(v) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin)) : (v - yMin) / (yMax - yMin)) * ph;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, class: "ch-svg", role: "img", "aria-label": spec.title });
    const clipId = "cl" + Math.random().toString(36).slice(2);
    el("rect", { x: L, y: Tp, width: pw, height: ph }, el("clipPath", { id: clipId }, svg));
    (spec.yLog ? ticksLog(yMin, yMax) : ticksLin(yMin, yMax)).forEach(v => { const y = Y(v); el("line", { x1: L, x2: W - R, y1: y, y2: y, class: "ch-grid" }, svg); el("text", { x: L - 8, y: y + 4, class: "ch-tick", "text-anchor": "end" }, svg).textContent = spec.yLog ? logLabel(v) : fmt(v, (yMax - yMin) < 5 ? 1 : 0); });
    (spec.xLog ? ticksLog(xMin, xMax) : ticksLin(xMin, xMax, 6)).forEach(v => { const x = X(v); el("line", { x1: x, x2: x, y1: Tp + ph, y2: Tp + ph + 5, class: "ch-base" }, svg); el("text", { x, y: Tp + ph + 20, class: "ch-tick", "text-anchor": "middle" }, svg).textContent = spec.xLog ? logLabel(v) : fmt(v, spec.xTickDecimals ?? 1); });
    el("line", { x1: L, x2: W - R, y1: Tp + ph, y2: Tp + ph, class: "ch-base" }, svg);
    if (spec.xLabel) el("text", { x: L + pw / 2, y: H - 8, class: "ch-axis", "text-anchor": "middle" }, svg).textContent = spec.xLabel;
    if (spec.yLabel) el("text", { x: 14, y: Tp + ph / 2, class: "ch-axis", transform: `rotate(-90 14 ${Tp + ph / 2})`, "text-anchor": "middle" }, svg).textContent = spec.yLabel;
    (spec.refs || []).forEach(r => {
      if (r.y != null) { const y = Y(r.y); el("line", { x1: L, x2: W - R, y1: y, y2: y, class: "ch-ref" }, svg); el("text", { x: W - R - 4, y: y - 6, class: "ch-reflab", "text-anchor": "end" }, svg).textContent = r.label; }
      if (r.x != null) { const x = X(r.x); el("line", { x1: x, x2: x, y1: Tp, y2: Tp + ph, class: "ch-ref" }, svg); el("text", { x: x + 6, y: Tp + 14, class: "ch-reflab" }, svg).textContent = r.label; }
    });
    const g = el("g", { "clip-path": `url(#${clipId})` }, svg);
    ser.forEach((s, k) => {
      const c = COLORS[k % 4];
      if (s.line !== false && s.points.length > 1) el("path", { d: s.points.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(""), fill: "none", stroke: c, "stroke-width": s.width || 2, class: "ch-line", "stroke-linejoin": "round", "stroke-linecap": "round" }, g);
      if (s.marker) s.points.forEach((p, i) => {
        el("circle", { cx: X(p[0]), cy: Y(p[1]), r: (s.markerSize || 4) + 1, fill: c, stroke: "var(--surface)", "stroke-width": 2 }, g);
        if (s.pointLabels) el("text", { x: X(p[0]), y: Y(p[1]) - 12, class: "ch-sub", "text-anchor": "middle" }, svg).textContent = s.pointLabels[i];
      });
    });
    // crosshair: nearest point of every series to the pointer's x
    const cross = el("line", { y1: Tp, y2: Tp + ph, class: "ch-cross", visibility: "hidden" }, svg);
    const dots = ser.map((s, k) => el("circle", { r: 5, fill: COLORS[k % 4], stroke: "var(--surface)", "stroke-width": 2, visibility: "hidden" }, svg));
    const hit = el("rect", { x: L, y: Tp, width: pw, height: ph, fill: "transparent" }, svg);
    const tip = tooltip(box);
    hit.addEventListener("pointermove", e => {
      const r = svg.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * W;
      const rows = [];
      ser.forEach((s, k) => {
        let best = null, bd = Infinity; for (const p of s.points) { const d = Math.abs(X(p[0]) - sx); if (d < bd) { bd = d; best = p; } }
        if (best && bd < 40) { dots[k].setAttribute("cx", X(best[0])); dots[k].setAttribute("cy", Y(best[1])); dots[k].setAttribute("visibility", "visible"); rows.push(`<span><i style="background:${COLORS[k % 4]}"></i>${esc(s.name)}: ${fmt(best[1], spec.decimals ?? 1)}</span>`); rows.x = best[0]; }
        else dots[k].setAttribute("visibility", "hidden");
      });
      cross.setAttribute("x1", sx); cross.setAttribute("x2", sx); cross.setAttribute("visibility", "visible");
      const b = box.getBoundingClientRect();
      if (rows.length) tip.show(`<b>${esc(spec.xLabel || "x")}: ${fmt(rows.x, spec.xLog ? 0 : 2)}</b>${rows.join("")}`, e.clientX - b.left + 14, e.clientY - b.top); else tip.hide();
    });
    hit.addEventListener("pointerleave", () => { cross.setAttribute("visibility", "hidden"); dots.forEach(d => d.setAttribute("visibility", "hidden")); tip.hide(); });
    return svg;
  }

  function table(spec, tab) {
    if (tab.categories) return `<table><thead><tr><th></th>${tab.series.map(s => `<th>${esc(s.name)}</th>`).join("")}</tr></thead><tbody>${tab.categories.map((c, i) => `<tr><th>${esc(c)}${spec.catSub ? ` <small>${esc(spec.catSub[i])}</small>` : ""}</th>${tab.series.map(s => `<td>${fmt(s.values[i], spec.decimals ?? 2)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    return tab.series.map(s => `<table><caption>${esc(s.name)}</caption><thead><tr><th>${esc(spec.xLabel || "x")}</th><th>${esc(spec.yLabel || "y")}</th></tr></thead><tbody>${(s.points.length > 40 ? s.points.filter((_, i) => i % Math.ceil(s.points.length / 40) === 0) : s.points).map(p => `<tr><td>${fmt(p[0], 3)}</td><td>${fmt(p[1], spec.decimals ?? 2)}</td></tr>`).join("")}</tbody></table>`).join("");
  }

  window.renderChart = (host, spec) => {
    const tabs = tabsOf(spec);
    host.innerHTML = `<div class="ch-head"><h4>${esc(spec.title)}</h4>${spec.subtitle ? `<p>${esc(spec.subtitle)}</p>` : ""}</div>
      ${tabs.length > 1 ? `<div class="ch-tabs" role="tablist">${tabs.map((t, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(t.label)}</button>`).join("")}</div>` : ""}
      <div class="ch-legend"></div><div class="ch-box"></div>${spec.note ? `<p class="ch-note">${esc(spec.note)}</p>` : ""}<details class="ch-table"><summary>Data table</summary><div class="ch-table-in"></div></details>`;
    const box = host.querySelector(".ch-box"), leg = host.querySelector(".ch-legend"), tbl = host.querySelector(".ch-table-in");
    const show = i => {
      const tab = tabs[i];
      box.innerHTML = "";
      const svg = spec.type === "lines" ? drawLines(box, spec, tab) : drawBars(box, spec, tab, spec.type === "hbars");
      box.prepend(svg);
      leg.innerHTML = tab.series.length > 1 ? tab.series.map((s, k) => `<span><i style="background:${COLORS[k % 4]}"></i>${esc(s.name)}</span>`).join("") : "";
      tbl.innerHTML = table(spec, tab);
      requestAnimationFrame(() => svg.classList.add("in"));
      host.querySelectorAll(".ch-tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.i == i));
    };
    host.querySelectorAll(".ch-tabs button").forEach(b => b.addEventListener("click", () => show(+b.dataset.i)));
    show(0);
  };
})();
