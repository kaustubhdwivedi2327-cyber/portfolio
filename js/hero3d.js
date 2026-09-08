/* Interactive 3D diamond lattice for the hero. Uses window.THREE (set by the
   inline module in index.html). Returns a dispose() function.
   Tuned for cost: pixel ratio capped at 1.5, one directional + one hemisphere light,
   low-poly instanced geometry, and rendering pauses whenever the hero is off screen. */

window.initHero3D = function (canvas) {
  const THREE = window.THREE;
  if (!THREE || !canvas) return () => {};

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("reduce");
  const css = getComputedStyle(document.documentElement);
  const readColor = (v) => new THREE.Color(css.getPropertyValue(v).trim() || "#b5561c");

  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: dpr <= 1.5, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(-0.6, 0.2, 13.5);

  // ---------- diamond lattice ----------
  // Cubic diamond: FCC sites + basis offset (1/4,1/4,1/4). Bonds join atoms
  // at distance sqrt(3)/4 (unit cell a = 1).
  const N = 3;
  const fcc = [[0, 0, 0], [0, .5, .5], [.5, 0, .5], [.5, .5, 0]];
  const atoms = [];
  const seen = new Set();
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) {
    for (const f of fcc) for (const b of [[0, 0, 0], [.25, .25, .25]]) {
      const p = [i + f[0] + b[0], j + f[1] + b[1], k + f[2] + b[2]];
      if (p.some((c) => c > N + 1e-6)) continue;
      const key = p.map((c) => c.toFixed(3)).join(",");
      if (seen.has(key)) continue;
      seen.add(key);
      atoms.push(new THREE.Vector3(p[0], p[1], p[2]));
    }
  }
  const bondLen = Math.sqrt(3) / 4;
  const bonds = [];
  for (let a = 0; a < atoms.length; a++) for (let b = a + 1; b < atoms.length; b++) {
    if (Math.abs(atoms[a].distanceTo(atoms[b]) - bondLen) < 1e-3) bonds.push([a, b]);
  }

  const group = new THREE.Group();
  const center = new THREE.Vector3(N / 2, N / 2, N / 2);
  const scale = 1.55;

  const accent = readColor("--accent");
  const nodeCol = readColor("--lattice-node");
  const strutCol = readColor("--lattice-strut");

  const strutMat = new THREE.MeshStandardMaterial({ color: strutCol, metalness: 0.5, roughness: 0.4 });
  const nodeMat = new THREE.MeshStandardMaterial({ color: nodeCol, metalness: 0.55, roughness: 0.35, emissive: accent, emissiveIntensity: 0.15 });

  const strutGeo = new THREE.CylinderGeometry(0.014, 0.014, 1, 5, 1, true);
  const struts = new THREE.InstancedMesh(strutGeo, strutMat, bonds.length);
  const up = new THREE.Vector3(0, 1, 0);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), mid = new THREE.Vector3(), dir = new THREE.Vector3();
  bonds.forEach(([a, b], idx) => {
    const pa = atoms[a].clone().sub(center).multiplyScalar(scale);
    const pb = atoms[b].clone().sub(center).multiplyScalar(scale);
    mid.copy(pa).add(pb).multiplyScalar(0.5);
    dir.copy(pb).sub(pa);
    const len = dir.length();
    q.setFromUnitVectors(up, dir.normalize());
    s.set(1, len, 1);
    m.compose(mid, q, s);
    struts.setMatrixAt(idx, m);
  });
  group.add(struts);

  const nodeGeo = new THREE.SphereGeometry(0.045, 8, 6);
  const nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, atoms.length);
  const unitQ = new THREE.Quaternion(), unitS = new THREE.Vector3(1, 1, 1);
  atoms.forEach((p, idx) => {
    const v = p.clone().sub(center).multiplyScalar(scale);
    m.compose(v, unitQ, unitS);
    nodes.setMatrixAt(idx, m);
  });
  group.add(nodes);

  // faint bounding cube
  const boxGeo = new THREE.BoxGeometry(N * scale, N * scale, N * scale);
  const boxEdges = new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo), new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.25 }));
  group.add(boxEdges);

  group.rotation.set(0.45, -0.6, 0);
  scene.add(group);

  // ---------- drifting particles ----------
  const pCount = 200;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 16;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: accent, size: 0.025, transparent: true, opacity: 0.45, sizeAttenuation: true });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ---------- lights (two, both cheap) ----------
  const hemi = new THREE.HemisphereLight(0xffffff, accent.getHex(), 0.9);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(4, 6, 6); scene.add(key);

  // ---------- interaction ----------
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  let scrollY = 0;
  let lastMove = 0, frame = 0;
  function onMove(e) {
    lastMove = performance.now();
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }
  function onScroll() { scrollY = window.scrollY || 0; }
  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    group.scale.setScalar(w < 720 ? 0.72 : 1);
  }
  window.addEventListener("resize", resize);
  resize();

  // theme change: recolour
  function onTheme() {
    const c2 = getComputedStyle(document.documentElement);
    const rc = (v) => new THREE.Color(c2.getPropertyValue(v).trim());
    strutMat.color.copy(rc("--lattice-strut"));
    nodeMat.color.copy(rc("--lattice-node"));
    const acc = rc("--accent");
    nodeMat.emissive.copy(acc); pMat.color.copy(acc); boxEdges.material.color.copy(acc); hemi.groundColor.copy(acc);
    needsFrame = true;
  }
  window.addEventListener("themechange", onTheme);

  // ---------- render loop: only while the hero is on screen ----------
  let raf = 0, t0 = performance.now(), running = false, visible = true, needsFrame = true, disposed = false;
  function loop(now) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    frame++;
    if (now - lastMove > 600 && frame % 2) return;   // idle: render at 30 fps
    const t = (now - t0) / 1000;
    cur.x += (target.x - cur.x) * 0.06;
    cur.y += (target.y - cur.y) * 0.06;
    const spin = reduced ? 0 : t * 0.12;
    group.rotation.y = -0.6 + spin + cur.x * 0.35;
    group.rotation.x = 0.45 + cur.y * 0.25 + scrollY * 0.0008;
    group.position.y = -scrollY * 0.0012;
    particles.rotation.y = t * 0.02;
    particles.position.y = scrollY * 0.0006;
    renderer.render(scene, camera);
    needsFrame = false;
    if (reduced && !needsFrame) { running = false; cancelAnimationFrame(raf); } // static scene: one frame is enough
  }
  function start() { if (disposed || running) return; if (!visible || document.hidden) return; running = true; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  function onVis() { if (document.hidden) stop(); else start(); }
  document.addEventListener("visibilitychange", onVis);
  let io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; if (visible) start(); else stop(); }, { threshold: 0.02 });
    io.observe(canvas);
  }
  if (reduced) { window.addEventListener("mousemove", () => { needsFrame = true; start(); }, { passive: true }); }
  start();

  return function dispose() {
    disposed = true;
    stop();
    if (io) io.disconnect();
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", resize);
    window.removeEventListener("themechange", onTheme);
    document.removeEventListener("visibilitychange", onVis);
    strutGeo.dispose(); nodeGeo.dispose(); boxGeo.dispose(); pGeo.dispose();
    strutMat.dispose(); nodeMat.dispose(); pMat.dispose();
    renderer.dispose();
  };
};
