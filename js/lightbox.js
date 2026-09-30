/* Full-screen viewer for gallery images, figures and slide decks. Keyboard, swipe and thumbnails. */
(() => {
  const lb = document.getElementById("lb");
  let items = [], i = 0, lastFocus = null, title = "";
  lb.innerHTML = `
    <div class="lb-top"><p class="lb-title" id="lb-title"></p><span class="lb-count" id="lb-count"></span><button type="button" class="lb-x" data-lb-close aria-label="Close viewer">\u2715</button></div>
    <div class="lb-stage"><button type="button" class="lb-nav prev" data-lb-prev aria-label="Previous">\u2039</button><figure class="lb-fig"><img id="lb-img" alt=""><figcaption id="lb-cap"></figcaption></figure><button type="button" class="lb-nav next" data-lb-next aria-label="Next">\u203a</button></div>
    <div class="lb-thumbs" id="lb-thumbs"></div>`;
  const img = lb.querySelector("#lb-img"), cap = lb.querySelector("#lb-cap"), count = lb.querySelector("#lb-count"), thumbs = lb.querySelector("#lb-thumbs"), ttl = lb.querySelector("#lb-title");
  const show = n => {
    i = (n + items.length) % items.length;
    img.classList.remove("in"); img.src = items[i].src; img.alt = items[i].caption || "";
    img.onload = () => img.classList.add("in");
    cap.textContent = items[i].caption || "";
    count.textContent = items.length > 1 ? `${i + 1} / ${items.length}` : "";
    thumbs.querySelectorAll("button").forEach((b, k) => { b.classList.toggle("on", k === i); if (k === i) b.scrollIntoView({ block: "nearest", inline: "center" }); });
  };
  window.openLightbox = (list, start = 0, heading = "") => {
    items = list; title = heading; lastFocus = document.activeElement;
    ttl.textContent = title;
    thumbs.innerHTML = items.length > 1 ? items.map((it, k) => `<button type="button" data-k="${k}" aria-label="Show ${k + 1}"><img src="${it.src}" alt="" loading="lazy"></button>`).join("") : "";
    lb.hidden = false; requestAnimationFrame(() => lb.classList.add("open"));
    document.body.classList.add("locked"); if (window.pageScroll) pageScroll.stop();
    show(start);
    lb.querySelector("[data-lb-close]").focus();
  };
  const close = () => {
    lb.classList.remove("open");
    setTimeout(() => { lb.hidden = true; img.src = ""; }, 300);
    if (!document.getElementById("case").classList.contains("open")) { document.body.classList.remove("locked"); if (window.pageScroll) pageScroll.start(); }
    if (lastFocus) lastFocus.focus();
  };
  window.openDeck = n => { const d = PRESENTATIONS[n]; window.openLightbox(d.slides, 0, d.title); };
  lb.addEventListener("click", e => {
    if (e.target.closest("[data-lb-close]") || e.target === lb || e.target.classList.contains("lb-stage")) close();
    else if (e.target.closest("[data-lb-prev]")) show(i - 1);
    else if (e.target.closest("[data-lb-next]")) show(i + 1);
    else { const t = e.target.closest("[data-k]"); if (t) show(+t.dataset.k); }
  });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") { e.stopPropagation(); close(); }
    else if (e.key === "ArrowRight") show(i + 1);
    else if (e.key === "ArrowLeft") show(i - 1);
  }, true);
  let x0 = null;
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
})();
