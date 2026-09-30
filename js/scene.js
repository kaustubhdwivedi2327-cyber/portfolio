/* Flight hero: the NASA Common Research Model (high-lift reference, CRM-HL) at full scale, with Kaustubh's
   LPBF AlSi10Mg slat-track can (ALPBF_VT04.stl) installed behind the front spar at two inboard slat-track stations.
   Scroll chapters: 0 approach \u00b7 1 x-ray of the inboard leading edge, cans and tracks \u00b7 2 SPH bird strike on the
   outboard slat \u00b7 3 pull back. Photoreal Blender frames for the opening, the bird strike and the pull-back; live WebGL between. Axes: x aft, y up, z span (right wing); metres. */
(() => {
  const root = document.documentElement;
  const flight = document.getElementById("top"), stage = document.getElementById("flight-stage"), canvas = document.getElementById("wing");
  if (!flight || !canvas) return;
  const chaps = [...stage.querySelectorAll(".chap")], hud = [...stage.querySelectorAll(".flight-hud b")], hudBtns = [...stage.querySelectorAll(".hud-step")];
  const pinCan = document.getElementById("pin-can"), pinHit = document.getElementById("pin-hit");
  if (pinCan) pinCan.classList.add("left");      // the can's label reads to the left, over open wing, clear of the rollers and track
  const mkPin = t => { const e = document.createElement("span"); e.className = "pin"; e.setAttribute("aria-hidden", "true"); e.innerHTML = `<span>${t}</span>`; stage.appendChild(e); return e; };
  const pinSlat = mkPin("Slat"), pinTrack = mkPin("Slat track"), pinSpar = mkPin("Front spar"), pinTank = mkPin("Fuel tank");
  const loadEl = document.getElementById("scene-load");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches, small = innerWidth < 760;
  const glOK = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } })();
  const fallback = () => root.classList.add("no-3d");
  if (!window.THREE || reduce || !glOK) { fallback(); return; }
  const T = THREE, M = "assets/models/";

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (v, a, b) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const jet = v => [clamp(1.5 - Math.abs(4 * v - 3)), clamp(1.5 - Math.abs(4 * v - 2)), clamp(1.5 - Math.abs(4 * v - 1))];
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const lin = c => Math.pow(c / 255, 2.2);
  // the exported grey belly follows mesh vertices and shows a saw-tooth edge: paint the fuselage one white instead
  const belly = (c, o) => c[o] === 212 && c[o + 1] === 218 && c[o + 2] === 226;
  let AO_LO = .28, AO_A = .04, AO_B = .9;

  /* ---------- binary mesh loaders (meshes ship as base64 text so any static host serves them) ---------- */
  async function getBuf(name) {
    const b = atob((await (await fetch(M + name + ".b64.txt")).text()).trim()), u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u.buffer;
  }
  async function kdm2(name) {
    const buf = await getBuf(name), dv = new DataView(buf);
    const nv = dv.getUint32(4, true), ni = dv.getUint32(8, true), f = new Float32Array(buf.slice(12, 36));
    let o = 36;
    const q = new Uint16Array(buf.slice(o, o + nv * 6)); o += nv * 6;
    const nq = new Int8Array(buf.slice(o, o + nv * 4)); o += nv * 4;
    const cq = new Uint8Array(buf.slice(o, o + nv * 4)); o += nv * 4;
    const idx = new Uint32Array(buf.slice(o, o + ni * 4));
    const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
    for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) {
      pos[i * 3 + k] = f[k] + q[i * 3 + k] / 65535 * (f[k + 3] - f[k]);
      nrm[i * 3 + k] = nq[i * 4 + k] / 127; col[i * 3 + k] = lin(belly(cq, i * 4) ? [247, 248, 250][k] : cq[i * 4 + k]);
    }
    // the exported triangles wind against their normals; flip them so front faces, culling and lighting agree
    let agree = 0;
    for (let t = 0; t < ni; t += 3 * 11) {
      const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
      const e1x = pos[b] - pos[a], e1y = pos[b + 1] - pos[a + 1], e1z = pos[b + 2] - pos[a + 2], e2x = pos[c] - pos[a], e2y = pos[c + 1] - pos[a + 1], e2z = pos[c + 2] - pos[a + 2];
      agree += Math.sign((e1y * e2z - e1z * e2y) * nrm[a] + (e1z * e2x - e1x * e2z) * nrm[a + 1] + (e1x * e2y - e1y * e2x) * nrm[a + 2]);
    }
    if (agree < 0) for (let t = 0; t < ni; t += 3) { const k = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = k; }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(pos, 3)); g.setAttribute("normal", new T.BufferAttribute(nrm, 3)); g.setAttribute("color", new T.BufferAttribute(col, 3));
    g.setIndex(new T.BufferAttribute(idx, 1)); g.computeBoundingSphere();
    return g;
  }
  async function kdm1(name) {
    const buf = await getBuf(name), dv = new DataView(buf);
    const nv = dv.getUint32(4, true), nf = dv.getUint32(8, true);
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(new Float32Array(buf.slice(12, 12 + nv * 12)), 3));
    g.setIndex(new T.BufferAttribute(new Uint16Array(buf.slice(12 + nv * 12, 12 + nv * 12 + nf * 6)), 1));
    g.computeVertexNormals();
    // displacement-style contour: blue at the flange, red at the closed end
    const p = g.attributes.position, col = [];
    let hi = 0; for (let i = 0; i < p.count; i++) hi = Math.max(hi, p.getY(i));
    for (let i = 0; i < p.count; i++) col.push(...jet(.08 + .9 * p.getY(i) / hi));
    g.setAttribute("color", new T.Float32BufferAttribute(col, 3));
    return g;
  }

  async function edges(name) {
    const buf = await getBuf(name), dv = new DataView(buf), n = dv.getUint32(4, true), f = new Float32Array(buf.slice(8, 32));
    const q = new Uint16Array(buf.slice(32, 32 + n * 6)), pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) pos[i * 3 + k] = f[k] + q[i * 3 + k] / 65535 * (f[k + 3] - f[k]);
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(pos, 3)); return g;
  }

  /* ---------- renderer, scene, environment ---------- */
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  let dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.outputEncoding = T.sRGBEncoding; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = .92; renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = false;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, 0.05, 900);
  /* ---------- twilight: the Blender sky panorama is the live background and the reflection environment ---------- */
  const pmrem = new T.PMREMGenerator(renderer);
  const skyMat = new T.ShaderMaterial({ uniforms: { map: { value: null }, opacity: { value: 1 } }, transparent: true, depthWrite: false, depthTest: false, side: T.BackSide,
    vertexShader: "varying vec3 vDir; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vDir = w.xyz - cameraPosition; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: "uniform sampler2D map; uniform float opacity; varying vec3 vDir; void main(){ vec3 d = normalize(vDir); vec2 uv = vec2(atan(d.z, d.x) * 0.15915494 + 0.5, asin(clamp(d.y, -1.0, 1.0)) * 0.31830989 + 0.5); gl_FragColor = vec4(texture2D(map, uv).rgb, opacity); }" });
  const skyBall = new T.Mesh(new T.SphereGeometry(500, 48, 24), skyMat), skyScene = new T.Scene(); skyBall.frustumCulled = false; skyScene.add(skyBall);
  let skyReady = false, skyAsked = false;
  // loaded only where the live aircraft is drawn (phones, narrow or ultra-wide windows): on desktop the frames are the picture
  const loadSky = () => { if (skyAsked) return; skyAsked = true; new T.TextureLoader().load("assets/render/pano.jpg", t => {
    // the background shows the image's own sRGB values untouched; the lighting copy is decoded to linear
    t.minFilter = T.LinearFilter; t.generateMipmaps = false; skyMat.uniforms.map.value = t; skyReady = true;
    const e = t.clone(); e.encoding = T.sRGBEncoding; e.mapping = T.EquirectangularReflectionMapping; e.needsUpdate = true; scene.environment = pmrem.fromEquirectangular(e).texture; }); };
  // soft light from the open sky on the camera side, a faint warm rim from the afterglow behind, dim skylight
  const hemi = new T.HemisphereLight(0x5b6d92, 0x0b0907, .18); scene.add(hemi);
  const fill = new T.DirectionalLight(0xa4b8ff, .26); fill.position.set(-70, 22, 80); fill.target.position.set(30, 6, 0); scene.add(fill, fill.target);
  const rim = new T.DirectionalLight(0xffa15e, .45); rim.position.set(150, 12, -20); rim.target.position.set(30, 6, 0); scene.add(rim, rim.target);
  const LIGHTS = [[hemi, .18], [fill, .26], [rim, .45]];
  for (const [l] of LIGHTS) l.layers.enable(3);
  // the scan plane of the x-ray chapter: skin forward of it is cut away
  const scan = new T.Plane(new T.Vector3(1, 0, 0), 1);

  /* ---------- load the aircraft and the can ---------- */
  const craft = new T.Group(); scene.add(craft);
  const paint = new T.MeshPhysicalMaterial({ vertexColors: true, color: 0xcfd3da, metalness: .1, roughness: .5, clearcoat: .7, clearcoatRoughness: .2, envMapIntensity: 1, clippingPlanes: [scan], clipShadows: true });
  // inside of the skin, seen through the scan cut: dark, like the inside of a cutaway
  const skinIn = new T.MeshStandardMaterial({ color: 0x14161a, roughness: .85, metalness: 0, side: T.BackSide, clippingPlanes: [scan] });
  const slatMat = new T.MeshPhysicalMaterial({ vertexColors: true, metalness: .3, roughness: .32, clearcoat: .4, envMapIntensity: .8, side: T.DoubleSide });
  const ghostMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, side: T.DoubleSide, uniforms: { col: { value: new T.Color(0x7cc4ff) }, amt: { value: 0 }, sweep: { value: -1 }, band: { value: 0 } },
    vertexShader: "varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 col; uniform float amt; uniform float sweep; uniform float band; varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2); float d = vW.x - sweep; float b = band * exp(-d * d * 60.0); float a = (0.015 + 0.34 * f) * amt * step(d, 0.0) + b * 0.85; gl_FragColor = vec4(mix(col, vec3(1.0), b * 0.6) * (1.0 + b), a); }" });
  const wireMat = new T.LineBasicMaterial({ color: 0x7cc4ff, transparent: true, opacity: 0, depthWrite: false });
  const canMat = new T.MeshStandardMaterial({ vertexColors: true, metalness: .2, roughness: .45, emissive: 0x0b0b0b });
  const trackMat = new T.MeshStandardMaterial({ color: 0xa9b3c2, metalness: .9, roughness: .22 });
  const rollerMat = new T.MeshStandardMaterial({ color: 0x2b3240, metalness: .7, roughness: .35 });
  const sparMat = new T.MeshBasicMaterial({ color: 0xdfe9f6, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false });
  const sparLine = new T.LineBasicMaterial({ color: 0x1e6fd9, transparent: true, opacity: 0, depthWrite: false });
  const logoMat = new T.MeshStandardMaterial({ color: 0xe8621f, roughness: .45, metalness: .1, side: T.DoubleSide, clippingPlanes: [scan] });
  const fanTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
    x.fillStyle = "#11151c"; x.beginPath(); x.arc(128, 128, 127, 0, 7); x.fill();
    for (let i = 0; i < 22; i++) { x.save(); x.translate(128, 128); x.rotate(i / 22 * Math.PI * 2); const g = x.createLinearGradient(0, 0, 120, 0); g.addColorStop(0, "#3a4250"); g.addColorStop(1, "#8a94a3");
      x.fillStyle = g; x.beginPath(); x.moveTo(18, -4); x.quadraticCurveTo(70, -22, 124, -14); x.lineTo(124, 4); x.quadraticCurveTo(70, 0, 18, 5); x.fill(); x.restore(); }
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; })();
  const fanMat = new T.MeshStandardMaterial({ map: fanTex, metalness: .75, roughness: .35, side: T.DoubleSide, clippingPlanes: [scan] });
  let ready = false, meta = null, cans = [], hitV = new T.Vector3(), slatOut = null, sOutPos = null, sOutOrig = null, sOutCol = null;
  let readyAt = 0, ovDirty = false, strobeLights = [], fans = [], moving = null, movingL = null, screwM = null, trackMid = null, slatMid = null, sparMid = null, tankPt = null, lights = [];

  const bird = [], NB = small ? 380 : 700, bPos = new Float32Array(NB * 3), bGeo = new T.BufferGeometry();
  bGeo.setAttribute("position", new T.BufferAttribute(bPos, 3));
  const bCol = new Float32Array(NB * 3); bGeo.setAttribute("color", new T.BufferAttribute(bCol, 3));
  const dot = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.5, "rgba(255,255,255,.8)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  const bMat = new T.PointsMaterial({ vertexColors: true, size: 0.03, map: dot, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const birdPts = new T.Points(bGeo, bMat); birdPts.frustumCulled = false; birdPts.layers.set(3); scene.add(birdPts);
  // the gelatin bird substitute itself: glossy amber gel, 226 mm long with hemispherical ends, flying nose-first along +x
  const gelMat = new T.MeshPhysicalMaterial({ color: 0xc8733a, emissive: 0x2a1004, roughness: .16, metalness: 0, clearcoat: 1, clearcoatRoughness: .06, sheen: .6, sheenColor: new T.Color(0xffc9a0), transparent: true });
  const gel = new T.Mesh(new T.CapsuleGeometry(.0565, .113, 10, 24), gelMat); gel.rotation.z = Math.PI / 2; gel.layers.set(3); gel.visible = false; scene.add(gel);
  // SPH bird: 226 \u00d7 113 mm capsule (the paper's double-hemispherical-cap bird)
  while (bird.length < NB) {
    const x = (Math.random() - .5) * .226, y = (Math.random() - .5) * .113, z = (Math.random() - .5) * .113, ax = Math.max(0, Math.abs(x) - .0565);
    if (ax * ax + y * y + z * z > .0565 * .0565) continue;
    bird.push({ tr: Math.random() < .35 ? Math.pow(Math.random(), 1.7) : 0, o: new T.Vector3(x, y, z), d: new T.Vector3(-.15 - Math.random() * .3, gauss() * .5, gauss() * 1.1).normalize(), sp: .15 + Math.random() * .45 });
  }

  const leAt = zs => { const L = meta.leline; let k = 0; while (k < L.length - 2 && L[k + 1][2] < zs) k++; const a = L[k], b = L[k + 1], t = clamp((zs - a[2]) / (b[2] - a[2])); return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), zs]; };

  let loaded = 0; const tickLoad = x => { loaded++; if (loadEl) loadEl.style.setProperty("--p", loaded / 7); return x; };
  Promise.all([kdm2("body").then(tickLoad), edges("edges").then(tickLoad), kdm2("slat_in").then(tickLoad), kdm2("slat_out").then(tickLoad), kdm1("can").then(tickLoad), fetch(M + "crm-meta.json").then(r => r.json()).then(tickLoad), getBuf("ao").then(b => new Uint8Array(b), () => null).then(tickLoad)]).then(([gBody, gE, gSi, gSo, gCan, m, aoB]) => {
    meta = m;
    // livery on the live model, matching the renders
    const FZ = meta.fuselage.slice(0, 61).map(r => new T.Vector2(r[1], r[2]));
    paint.onBeforeCompile = sh => {
      sh.uniforms.FZ = { value: FZ };
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vLiv;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvLiv = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", ["#include <common>", "varying vec3 vLiv; uniform vec2 FZ[61]; float liv_glass = 0.0, liv_glow = 0.0;",
          "float livCock(float x, float y, float ay, float phi, float e) {",
          "  float sill = 6.10 + 0.05 * (x - 3.9), dzs = y - sill, outer = clamp((phi - 20.0) / 30.0, 0.0, 1.0);",
          "  float w1 = step(3.72 + phi * 0.0035 + dzs * 0.35 * outer - e, x) * step(x, 4.74 + e) * step(0.045 - e, ay) * step(sill - e, y) * step(y, 6.76 + e);",
          "  float w2 = step(4.82 - e, x) * step(x, 5.50 + e) * step(sill - e, y) * step(y, 6.76 - (x - 4.82) * 0.15 + e);",
          "  float w3 = step(5.58 - e, x) * step(x, 6.08 - (y - 6.2) * 0.5 + e) * step(sill - e, y) * step(y, 6.69 + e);",
          "  return max(max(w1, w2), w3); }",
          "float liv_aa(float d) { return clamp(0.5 - d / max(fwidth(d), 1e-5), 0.0, 1.0); }"].join("\n"))
        .replace("#include <color_fragment>", [
          "#include <color_fragment>",
          "{ float fx = clamp(vLiv.x - 3.0, 0.0, 59.0); int fi = int(floor(fx)); vec2 sec = mix(FZ[fi], FZ[fi + 1], fx - float(fi));",
          "  float dz = vLiv.y - sec.x, ay = abs(vLiv.z), h = dz / sec.y, phi = degrees(atan(ay, dz));",
          "  float onf = step(ay, 3.35) * step(length(vec2(ay, dz)), sec.y * 1.06), x = vLiv.x, ao = clamp(vColor.g / 0.94, 0.0, 1.0);",
          "  float band = onf * step(8.2, x) * step(x, 53.0);",
          "  float belly = onf * liv_aa(h + 0.5) * step(4.5, x) * step(x, 55.0);",
          "  float navy = band * liv_aa(max(-0.055 - h, h - 0.035)), orng = band * liv_aa(max(0.05 - h, h - 0.068));",
          "  float y = vLiv.y; liv_glass = onf * livCock(x, y, ay, phi, 0.0); float seal = onf * livCock(x, y, ay, phi, 0.028) - liv_glass;",
          "  float kk = floor((x - 8.6) / 0.53 + 0.5), xk = 8.6 + 0.53 * kk, sg = mod(0.53 * kk, 11.2), zw = sec.x + min(sec.y * 0.4, 0.45);",
          "  float sidew = onf * step(-0.5, kk) * step(xk, 51.0) * (1.0 - step(0.2, sg) * step(sg, 1.3)) * step(sec.y * 0.6, ay);",
          "  vec2 q = abs(vec2(x - xk, y - zw)) - vec2(0.035, 0.095); float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.09;",
          "  float cabin = sidew * liv_aa(sd), reveal = sidew * liv_aa(sd - 0.018), rn = fract(sin((kk + step(0.0, vLiv.z) * 97.0) * 12.9898) * 43758.5453);",
          "  liv_glow = cabin * step(0.1, rn) * (0.6 + 0.4 * rn) * (0.6 + (y - zw) * 1.6) * clamp(-sd / 0.045, 0.0, 1.0);",
          "  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.50, 0.52, 0.56) * ao, belly);",
          "  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.012, 0.03, 0.085) * ao, navy);",
          "  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.85, 0.30, 0.06) * ao, orng);",
          "  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.30, 0.31, 0.33) * ao, reveal);",
          "  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.012, 0.013, 0.016), cabin);",
          "  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.035, 0.038, 0.045), seal);",
          "  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.02, 0.03, 0.045), liv_glass); liv_glass = max(liv_glass, cabin); }"].join("\n"))
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.05, liv_glass);")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(1.0, 0.64, 0.34) * liv_glow * 2.4;");
    };
    paint.extensions = { derivatives: true }; paint.needsUpdate = true;
    // ambient occlusion baked offline (one byte per vertex): contact shading at the wing root, pylons, intakes and flap gaps
    if (aoB) { let o = 0; for (const g of [gBody, gSi, gSo]) { const c = g.attributes.color.array, nv = g.attributes.position.count; if (o + nv > aoB.length) break;
      for (let i = 0; i < nv; i++) { const f = AO_LO + (1 - AO_LO) * smooth(aoB[o + i] / 255, AO_A, AO_B); c[i * 3] *= f; c[i * 3 + 1] *= f; c[i * 3 + 2] *= f; }
      o += nv; g.attributes.color.needsUpdate = true; } }
    const add = (g, mat, mirror, shadow = true) => { const me = new T.Mesh(g, mat); if (mirror) me.scale.z = -1; me.castShadow = shadow; me.receiveShadow = shadow; craft.add(me); return me; };
    add(gBody, paint, false); add(gBody, paint, true); add(gBody, skinIn, false, false); add(gBody, skinIn, true, false);
    add(gBody, ghostMat, false, false).layers.set(3); add(gBody, ghostMat, true, false).layers.set(3);
    const e1 = new T.LineSegments(gE, wireMat), e2 = e1.clone(); e2.scale.z = -1; e1.layers.set(3); e2.layers.set(3); craft.add(e1, e2);
    // the outboard slat takes the bird: keep its undeformed positions and add a contour overlay
    sOutOrig = Float32Array.from(gSo.attributes.position.array);
    slatOut = add(gSo, slatMat, false); add(gSo.clone(), slatMat, true);
    const ov = new T.BufferGeometry(); ov.setAttribute("position", gSo.attributes.position); ov.setIndex(gSo.index);
    sOutCol = new T.BufferAttribute(new Float32Array(gSo.attributes.position.count * 4), 4); ov.setAttribute("color", sOutCol);
    const over = new T.Mesh(ov, new T.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, toneMapped: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    over.renderOrder = 10; over.layers.set(3); craft.add(over); sOutPos = gSo.attributes.position;
    hitV.set(...meta.hit);
    const sideR = new T.Group(), sideL = new T.Group(); sideL.scale.z = -1; craft.add(sideR, sideL);
    /* ---------- inboard slat mechanism, fitted to the CRM-HL: slat and tracks move as one rigid body ---------- */
    const mech = meta.mechanism, sc = new T.Vector3(...mech.center), sn = new T.Vector3(...mech.axis).normalize();
    const screwPt = (p, u) => p.clone().sub(sc).applyAxisAngle(sn, u * mech.angle).add(sc).addScaledVector(sn, u * mech.slide);
    const mA = new T.Matrix4(), mB = new T.Matrix4(), mC = new T.Matrix4();
    screwM = u => mA.makeTranslation(sc.x + sn.x * u * mech.slide, sc.y + sn.y * u * mech.slide, sc.z + sn.z * u * mech.slide)
      .multiply(mB.makeRotationAxis(sn, u * mech.angle)).multiply(mC.makeTranslation(-sc.x, -sc.y, -sc.z));
    moving = new T.Group(); movingL = new T.Group(); moving.matrixAutoUpdate = movingL.matrixAutoUpdate = false;
    sideR.add(moving); sideL.add(movingL);
    const sI = new T.Mesh(gSi, slatMat); sI.castShadow = sI.receiveShadow = true; moving.add(sI); movingL.add(sI.clone());
    slatMid = new T.Vector3(); gSi.computeBoundingBox(); gSi.boundingBox.getCenter(slatMid);
    const shape = new T.Shape(); shape.moveTo(-.022, -.045); shape.lineTo(.022, -.045); shape.lineTo(.022, .045); shape.lineTo(-.022, .045); shape.closePath();
    const up = new T.Vector3(0, 1, 0), aft = new T.Vector3(1, 0, 0);
    mech.stations.forEach((st, k) => {
      const A = new T.Vector3(...st.attach), pts = [];
      for (let i = 0; i <= 60; i++) pts.push(screwPt(A, st.u_end * i / 60));
      const tr = new T.Mesh(new T.ExtrudeGeometry(shape, { steps: 90, bevelEnabled: false, extrudePath: new T.CatmullRomCurve3(pts) }), trackMat);
      tr.castShadow = true; moving.add(tr); movingL.add(tr.clone());
      if (k === 1) trackMid = pts[Math.round(pts.length * .18)].clone();
      st.rollers.forEach(r => { for (const off of [-.07, .07]) {
        const rl = new T.Mesh(new T.CylinderGeometry(.04, .04, .06, 18), rollerMat);
        rl.position.set(r[0], r[1] + off, r[2]); rl.quaternion.setFromUnitVectors(up, sn); sideR.add(rl); sideL.add(rl.clone()); } });
      // the can: open end on the spar, facing the slat; its arched body runs aft into the tank and bends the same way
      // the track bends, so the track enters through the open end and slides along the arch towards the closed end
      const t0 = screwPt(A, st.u_spar), t1 = screwPt(A, st.u_spar + .25 / st.step), t2 = screwPt(A, st.u_spar + .5 / st.step);
      const Yc = t1.clone().sub(t0).normalize();
      const Zc = t2.clone().sub(t1).sub(t1.clone().sub(t0)).projectOnPlane(Yc).normalize();
      const Xc = new T.Vector3().crossVectors(Yc, Zc).normalize();
      const can = new T.Mesh(gCan, canMat);
      can.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(Xc, Yc, Zc));
      can.position.copy(t0).addScaledVector(Yc, .012);
      can.castShadow = true; sideR.add(can); sideL.add(can.clone()); cans.push(can);
      if (k === 0) tankPt = new T.Vector3(st.flange[0] + 2.6, st.flange[1] + .05, st.flange[2] + .2);
    });
    // front spar web across the inboard slat span (ghosted in the x-ray)
    const sp = mech.spar, spPos = [], spIdx = [], spEdge = [];
    sp.forEach((r, i) => { spPos.push(r[0], r[1], r[3], r[0], r[2], r[3]);
      if (i) { const a = (i - 1) * 2; spIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        spEdge.push(sp[i - 1][0], sp[i - 1][1], sp[i - 1][3], r[0], r[1], r[3], sp[i - 1][0], sp[i - 1][2], sp[i - 1][3], r[0], r[2], r[3]); } });
    const spG = new T.BufferGeometry(); spG.setAttribute("position", new T.Float32BufferAttribute(spPos, 3)); spG.setIndex(spIdx);
    const spE = new T.BufferGeometry(); spE.setAttribute("position", new T.Float32BufferAttribute(spEdge, 3));
    const spM = new T.Mesh(spG, sparMat), spL = new T.LineSegments(spE, sparLine); sideR.add(spM, spL); sideL.add(spM.clone(), spL.clone());
    const mid = sp[sp.length - 1]; sparMid = new T.Vector3(mid[0], mid[1] + .9 * (mid[2] - mid[1]), mid[3]);

    /* ---------- details: doors, fan faces, fin logo, lights (cabin windows are painted by the livery shader) ---------- */
    const fz = meta.fuselage, fAt = x => { let k = 0; while (k < fz.length - 2 && fz[k + 1][0] < x) k++; const a = fz[k], b = fz[k + 1], t = clamp((x - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; };
    // passenger doors in the window gaps: rounded outlines drawn on the fuselage surface
    const doorMat = new T.LineBasicMaterial({ color: 0x3a3f47, transparent: true, opacity: .75, clippingPlanes: [scan] });
    for (let k = 0; k < 4; k++) {
      const xc = 8.6 + 11.2 * k + .75, [yc, R] = fAt(xc), pts = [], hw = .5, y0 = yc - .75, y1 = yc + 1.1, rr = .16;
      const corner = (cx, cy, a0) => { for (let t = 0; t <= 6; t++) { const a = a0 + t / 6 * Math.PI / 2; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } };
      corner(xc + hw - rr, y1 - rr, 0); corner(xc - hw + rr, y1 - rr, Math.PI / 2); corner(xc - hw + rr, y0 + rr, Math.PI); corner(xc + hw - rr, y0 + rr, 1.5 * Math.PI);
      const v = pts.map(([x, y]) => { const [yy, RR] = fAt(x); return new T.Vector3(x, y, Math.sqrt(Math.max(RR * RR - (y - yy) ** 2, 0)) + .012); });
      const door = new T.LineLoop(new T.BufferGeometry().setFromPoints(v), doorMat); sideR.add(door); sideL.add(door.clone());
    }
    const E = meta.engine, fan = new T.Mesh(new T.CircleGeometry(E.fan_r, 48), fanMat);
    fan.position.set(E.centre[0] + .55, E.centre[1], E.centre[2]); fan.rotation.y = -Math.PI / 2;
    const spin = new T.Mesh(new T.ConeGeometry(.42, .9, 32), new T.MeshStandardMaterial({ color: 0xdfe4ea, metalness: .6, roughness: .25, clippingPlanes: [scan] }));
    spin.position.set(E.centre[0] + .2, E.centre[1], E.centre[2]); spin.rotation.z = Math.PI / 2;
    sideR.add(fan, spin); const fanL = fan.clone(); sideL.add(fanL, spin.clone()); fans.push(fan, fanL);
    const logo = new T.Mesh(new T.PlaneGeometry(2.1, 2.1), logoMat); logo.position.set(...meta.fin_logo); logo.rotation.z = Math.PI / 4; sideR.add(logo); sideL.add(logo.clone());
    const glow = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.1, "rgba(255,255,255,.95)"); g.addColorStop(.22, "rgba(255,255,255,.32)"); g.addColorStop(.5, "rgba(255,255,255,.07)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
    const tip = meta.leline[meta.leline.length - 1];
    const light = (col, p, kind, size = .03) => {
      const m = new T.SpriteMaterial({ map: glow, color: col, transparent: true, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: false, toneMapped: false });
      const s_ = new T.Sprite(m); s_.scale.set(size, size, 1); s_.position.set(...p); s_.layers.set(1); craft.add(s_); lights.push({ m, kind, s: s_, size }); };
    light(0xff2d2d, [tip[0] + .5, tip[1] + .1, 29.5], "nav", .05); light(0x39ff6a, [tip[0] + .5, tip[1] + .1, -29.5], "nav", .05);
    light(0xffffff, [tip[0] + .9, tip[1] + .1, 29.5], "strobe", .085); light(0xffffff, [tip[0] + .9, tip[1] + .1, -29.5], "strobe", .085);
    light(0xff3b30, [30, 8.8, 0], "beacon", .05); light(0xff3b30, [31, 2.35, 0], "beacon", .05);
    light(0xfff4dd, [26.2, 4.2, 4.1], "land", .07); light(0xfff4dd, [26.2, 4.2, -4.1], "land", .07);
    for (const sz of [1, -1]) {   // logo lights on the tailplane wash the fin
      const sl = new T.SpotLight(0xfff0d6, 3, 22, .7, .8, 1.6); sl.position.set(58.2, 7.4, 5.8 * sz); sl.target.position.set(60.4, 12.6, 0); craft.add(sl, sl.target);
      const pl = new T.PointLight(0xffffff, 0, 14, 1.8); pl.position.set(tip[0] + .6, tip[1] + .3, 29.2 * sz); craft.add(pl); strobeLights.push(pl); }
    warm(); ready = true; if (photoOK()) try { depthPass(); } catch (e) {} readyAt = performance.now(); if (loadEl) loadEl.classList.add("done"); stage.classList.add("loaded");
  }).catch(fallback);

  /* ---------- camera path ---------- */
  const KF = [
    { p: 0, pos: [-38, 3, 46], tgt: [0, 8, 7] },
    { p: 0.16, pos: [-33, 3.5, 42], tgt: [2, 8, 7] },
    { p: 0.3, pos: [24.9, 3.1, 3.3], tgt: [28.5, 4.6, 6.3] },
    { p: 0.5, pos: [25.5, 5.4, 2.9], tgt: [28.7, 4.6, 6.3] },
    // out along the span, well ahead of the leading edge and clear of the engine, to the outboard slat
    { p: 0.62, pos: [35.2, 6.0, 25.6], tgt: [37.6, 5.45, 20.0], via: [[20.5, 5.3, 6.8], [25.5, 6.1, 15.5], [31, 6.2, 22.5]] },
    // bird strike seen side-on from outboard, so the bird crosses the frame into the slat
    { p: 0.82, pos: [35.2, 6.0, 25.6], tgt: [37.6, 5.45, 20.0] },
    { p: 1, pos: [-70, 44, 92], tgt: [32, 6, 0] }
  ];
  const tmpP = new T.Vector3(), tmpT = new T.Vector3(), look = new T.Vector3(), mobT = new T.Vector3(), mvR = new T.Vector3(), mvU = new T.Vector3();
  function camAt(p) {
    let k = 0; while (k < KF.length - 2 && p > KF[k + 1].p) k++;
    const a = KF[k], b = KF[k + 1], t = smooth(p, a.p, b.p);
    if (b.via) { b.curve = b.curve || new T.CatmullRomCurve3([a.pos, ...b.via, b.pos].map(v => new T.Vector3(...v)), false, "centripetal"); tmpP.copy(b.curve.getPointAt(t)); }
    else tmpP.set(lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t));
    tmpT.set(lerp(a.tgt[0], b.tgt[0], t), lerp(a.tgt[1], b.tgt[1], t), lerp(a.tgt[2], b.tgt[2], t));
    if (camera.aspect < 1) {   // phones: in the opening shots frame the whole aircraft, low in the picture under the intro text
      const farW = 1 - smooth(p, .12, .26);
      if (farW > 0) tmpT.lerp(mobT.set(27, 6.5, 3), .75 * farW);
      tmpP.sub(tmpT).multiplyScalar(1.6 + .45 * farW).add(tmpT);
    }
  }

  /* ---------- sizing, visibility, pointer ---------- */
  // layout is measured here, never inside the frame loop (a read there after the loop's own style writes forces a layout every frame)
  let sW = 1, sH = 1, fTop = 0, fH = 1, vH = innerHeight;
  const measure = () => { sW = stage.clientWidth || sW; sH = stage.clientHeight || sH; fTop = flight.offsetTop; fH = flight.offsetHeight; vH = innerHeight; };
  // over the rendered frames (1200 px tall) a canvas taller than ~1350 px adds no detail, only cost
  const photoMode = () => innerWidth >= 760 && (window.FRAMES || []).length > 0 && sW / sH > 1.05 && sW / sH <= 2640 / 1200 + .01;
  const resize = () => { measure(); renderer.setPixelRatio(photoMode() ? Math.min(dpr, Math.max(1, 1350 / sH)) : dpr); renderer.setSize(sW, sH, false); camera.aspect = sW / sH; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(stage); new ResizeObserver(measure).observe(flight); addEventListener("resize", measure); resize();
  // on short screens the intro can be taller than the space under the top bar: it scrolls up before it fades
  let c0Over = 0; const c0Wrap = chaps[0] && chaps[0].querySelector(".wrap");
  const measureC0 = () => { if (!c0Wrap) return; const nh = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 56; c0Over = Math.max(0, c0Wrap.offsetHeight + nh - stage.clientHeight); };
  if (c0Wrap) { new ResizeObserver(measureC0).observe(c0Wrap); new ResizeObserver(measureC0).observe(stage); }
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { measure(); tick(); } }, { rootMargin: "100px" }).observe(flight);
  let mx = 0, my = 0, smx = 0, smy = 0;
  stage.addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });

  /* ---------- photoreal Blender frames (desktop): opening sequence, bird-strike plate, pull-back sequence ---------- */
  const RS = "assets/render/", RW = 2640, RH = 1200;
  const FR = (window.FRAMES || []).map(([p, n, fan]) => ({ p, n, src: RS + n + ".webp", fan }));
  // frames: fetched once (a two-thirds-size photo for scrolling with the aircraft matte in its alpha, and the sky
  // plate), decoded off the main thread only around the reader, uploaded to the GPU ahead; once the reader stops, the
  // full-size photo of the frames on screen replaces the scrolling copy
  const blobs = [], bmps = [], bgs = [], texs = [], st = [], hi = [];   // hi[k]: { st, bm, tex, up } full-size photo     // st: 0 new, 1 fetching, 2 have files, 3 decoding, 4 decoded, 5 failed
  const has = k => !!bmps[k], onGPU = k => !!(texs[k] && texs[k].up);     // decoded / on the GPU
  const photoOK = () => innerWidth >= 760 && FR.length > 0 && camera.aspect > 1.05 && camera.aspect <= RW / RH + .01;
  const frameAt = p => { let lo = 0, hi = FR.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (FR[m].p <= p) lo = m; else hi = m; } return lo; };
  // files stream in nearest-first (six frames at a time); frames near the reader are decoded (four at a time, up to AHEAD
  // in the scroll direction and BEHIND the other way, every other one first) and those further than DROP are released
  const AHEAD = 10, BEHIND = 3, DROP = 12;
  const DECODE_ORDER = [0, 1, 2, 4, 6, 8, 10, 3, 5, 7, 9];
  let fetching = 0, decoding = 0, lastC = 0, dir = 1, vel = 0, velT = 0, upT = 0, unfetched = FR.length;
  const get = url => fetch(url).then(r => r.ok ? r.blob() : null, () => null);
  const bitmap = (b, o) => b ? createImageBitmap(b, o).catch(() => null) : null;
  const straight = { premultiplyAlpha: "none" };
  const idle = window.requestIdleCallback ? f => requestIdleCallback(f, { timeout: 1500 }) : f => setTimeout(f, 200);
  const blank = (() => { const t = new T.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1); t.needsUpdate = true; return t; })();
  const texOf = bm => { const t = new T.Texture(bm); t.flipY = false; t.generateMipmaps = false; t.minFilter = t.magFilter = T.LinearFilter; t.needsUpdate = true;
    t.onUpdate = () => { t.image = { width: bm.width, height: bm.height }; if (bm.close) bm.close(); }; return t; };   // free the decoded copy once it is on the GPU
  // pictures go up in strips (~1.4 MB, one per screen update) into storage made first, so no update carries a whole
  // frame (a scrolling frame is 5.6 MB: 4-8 ms in one go on integrated graphics)
  const gl = renderer.getContext(), STRIP = 1.4e6, strips = renderer.capabilities.isWebGL2;
  let upJob = null;                     // { key, t, bm, y, done }
  const extTex = (w, h) => {            // a texture three.js draws but does not fill: storage made here
    const t = new T.Texture(), g = gl.createTexture(), P = renderer.properties.get(t);
    t.image = { width: w, height: h }; t.flipY = false; t.generateMipmaps = false; t.minFilter = t.magFilter = T.LinearFilter;
    renderer.state.bindTexture(gl.TEXTURE_2D, g); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    P.__webglTexture = g; P.__webglInit = true;
    t.addEventListener("dispose", () => { gl.deleteTexture(g); renderer.properties.remove(t); });
    return t;
  };
  function stripStep() {                // the next strip of the picture going up
    const j = upJob, w = j.bm.width, h = j.bm.height, n = Math.min(Math.max(1, Math.floor(STRIP / (w * 4))), h - j.y);
    renderer.state.bindTexture(gl.TEXTURE_2D, renderer.properties.get(j.t).__webglTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.pixelStorei(gl.UNPACK_SKIP_ROWS, j.y); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, j.y, w, n, gl.RGBA, gl.UNSIGNED_BYTE, j.bm); gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
    j.y += n; if (j.y >= h) { upJob = null; j.bm.close(); j.done(); }
  }
  const upload = (key, bm, done) => {   // start a picture going up (whole, where strips are not available)
    if (!strips) { const t = texOf(bm); renderer.initTexture(t); done(); return t; }
    const t = extTex(bm.width, bm.height); upJob = { key, t, bm, y: 0, done }; stripStep(); return t;
  };
  const release = k => {
    dropHi(k);
    if (upJob && texs[k] && upJob.key === texs[k]) upJob = null;
    for (const b of [bmps[k], bgs[k]]) if (b && b.close) b.close();
    bmps[k] = bgs[k] = null;
    if (texs[k]) { for (const t of [texs[k].ph, texs[k].g]) if (t && t !== blank) t.dispose(); texs[k] = null; }
  };
  const texFor = k => texs[k];
  // a worker fetches and decodes; the page only sends requests and receives decoded bitmaps
  const WSRC = [
    "const files = new Map();",
    "const get = u => fetch(u).then(r => r.ok ? r.blob() : null, () => null);",
    "self.onmessage = async e => { const d = e.data;",
    "  if (d.cmd === 'fetch') { const [ph, g] = await Promise.all(d.urls.map(get)); if (ph) files.set(d.k, { ph, g }); postMessage({ cmd: 'fetched', k: d.k, ok: !!ph }); }",
    "  else if (d.cmd === 'decode') { const f = files.get(d.k); if (!f) { postMessage({ cmd: 'decoded', k: d.k }); return; }",
    "    try { const [b, g] = await Promise.all([createImageBitmap(f.ph, { premultiplyAlpha: 'none' }), f.g ? createImageBitmap(f.g) : null]);",
    "      postMessage({ cmd: 'decoded', k: d.k, b, g }, g ? [b, g] : [b]); } catch (err) { postMessage({ cmd: 'decoded', k: d.k }); } }",
    "  else if (d.cmd === 'full') { const b = await get(d.url); let bm = null; try { bm = b ? await createImageBitmap(b) : null; } catch (err) {}",
    "    postMessage({ cmd: 'full', k: d.k, bm }, bm ? [bm] : []); } };"].join("\n");
  let worker = null;
  try { worker = new Worker(URL.createObjectURL(new Blob([WSRC], { type: "text/javascript" }))); } catch (e) { worker = null; }
  const abs = u => new URL(u, location.href).href;
  if (worker) {
    worker.onerror = () => { worker = null; };
    worker.onmessage = e => { const d = e.data, k = d.k;
      if (d.cmd === "fetched") { fetching--; st[k] = d.ok ? 2 : 5; }
      else if (d.cmd === "decoded") { decoding--;
        if (!d.b) { st[k] = 5; return; }
        if (Math.abs(k - lastC) > DROP) { st[k] = 2; d.b.close(); if (d.g) d.g.close(); } else { bmps[k] = d.b; bgs[k] = d.g || null; st[k] = 4; } }
      else if (d.cmd === "full") { const h = hi[k]; if (!h || !d.bm) { if (h) h.st = 3; if (d.bm) d.bm.close(); return; } h.bm = d.bm; h.st = 2; } };
  }
  const dropHi = k => { const h = hi[k]; if (!h) return; if (upJob && upJob.key === h) upJob = null; if (h.tex) h.tex.dispose(); if (h.bm && h.bm.close) h.bm.close(); hi[k] = null; };
  function feed(p, rest) {
    if (!photoOK()) return;
    const c = frameAt(p), now = performance.now(), dtv = Math.min(.1, Math.max(.001, (now - velT) / 1000)); velT = now;
    vel += (Math.abs(c - lastC) / dtv - vel) * Math.min(1, dtv * 6);               // frames per second the reader is passing
    if (c !== lastC) { dir = c > lastC ? 1 : -1; lastC = c; }
    const stride = Math.max(1, Math.min(4, Math.round(vel / 50)));                     // ~one decoded frame per refresh when fast
    for (let r = 0; r < FR.length && fetching < 6 && unfetched > 0; r++) for (let side = 0; side < 2; side++) {
      const k = c + (side ? -r : r) * dir;
      if (fetching >= 6 || k < 0 || k >= FR.length || st[k]) continue;
      fetching++; st[k] = 1; unfetched--;
      if (worker) { worker.postMessage({ cmd: "fetch", k, urls: [abs(RS + "m/" + FR[k].n + ".webp"), abs(RS + "bg/" + FR[k].n + ".webp")] }); continue; }
      Promise.all([get(RS + "m/" + FR[k].n + ".webp"), get(RS + "bg/" + FR[k].n + ".webp")])
        .then(([ph, g]) => { if (ph) { blobs[k] = { ph, g }; st[k] = 2; } else st[k] = 5; }).finally(() => { fetching--; });
    }
    for (const r0 of DECODE_ORDER) for (let side = 0; side < (r0 <= BEHIND ? 2 : 1); side++) {
      const k = side ? c - r0 * dir : c + r0 * stride * dir;
      if (decoding >= 4 || k < 0 || k >= FR.length || st[k] !== 2) continue;
      decoding++; st[k] = 3;
      if (worker) { worker.postMessage({ cmd: "decode", k }); continue; }
      const f = blobs[k];              // decoded at full size: the GPU scales it when drawing (a resize here runs on the GPU process's main thread)
      Promise.all([bitmap(f.ph, straight), bitmap(f.g, {})])
        .then(([b, g]) => {
          if (!b) { st[k] = 5; return; }
          if (Math.abs(k - lastC) > DROP) st[k] = 2;
          else { bmps[k] = b; bgs[k] = g; st[k] = 4; } })
        .finally(() => { decoding--; });
    }
    for (let k = 0; k < FR.length; k++) if (bmps[k] && Math.abs(k - c) > DROP * stride && !(lastPair && (k === lastPair[0] || k === lastPair[1]))) { release(k); st[k] = 2; }
    // at rest: the full-size photos of the frames on screen (fetched, decoded, then uploaded like the rest)
    const onScreen = lastPair ? [lastPair[0], lastPair[1]].filter(k => k >= 0) : [];
    if (rest) for (const k of onScreen) if (!hi[k] && has(k)) {
      const h = hi[k] = { st: 1 };
      if (worker) { worker.postMessage({ cmd: "full", k, url: abs(FR[k].src) }); continue; }
      get(FR[k].src).then(b => bitmap(b, {})).then(bm => { if (hi[k] !== h) return; if (bm) { h.bm = bm; h.st = 2; } else h.st = 3; });
    }
    for (let k = 0; k < FR.length; k++) if (hi[k] && Math.abs(k - c) > 3 && !onScreen.includes(k)) dropHi(k);
    // upload ahead: one frame per screen update (a scrolling copy is ~3 ms, a full-size photo ~7 ms), nearest first
    let up = 0;
    if (upJob) { stripStep(); up++; }                 // a picture part-way up: its next strip
    if (rest) for (const k of onScreen) { const h = hi[k]; if (up < 1 && h && h.st === 2 && !h.tex && onGPU(k)) { h.tex = upload(h, h.bm, () => { h.up = true; }); up++; } }
    // ahead-of-need uploads are paced (~30 a second) so a fast scroll does not upload on every refresh; the frames the
    // reader is at go up straight away
    let near = false;                   // is any frame near the reader already on the GPU?
    for (let k = Math.max(0, c - 12); k <= Math.min(FR.length - 1, c + 13) && !near; k++) near = onGPU(k) && Math.abs(FR[k].p - p) < .02;
    for (let r = 0; r <= 6; r++) for (let side = 0; side < 2; side++) {
      const k = r ? (side ? c - r * dir : c + r * stride * dir) : (side ? c + dir : c);
      if (near && now - upT < 33) continue;
      if (up >= 1 || k < 0 || k >= FR.length || !has(k) || texs[k]) continue;
      const tx = texs[k] = { ph: null, g: bgs[k] ? texOf(bgs[k]) : blank, up: false };      // the small sky plate goes up whole
      if (tx.g !== blank) renderer.initTexture(tx.g);
      tx.ph = upload(tx, bmps[k], () => { tx.up = true; }); up++; upT = now;
    }
  }
  // spinning fans: the fan regions re-rendered at six blade angles, cycled while the reader is still
  const fanCrops = new Map();                     // frame index -> "loading" | "none" | [{ box, tx: [6 textures] }]
  function loadFans(k) {
    const f = FR[k]; if (!f || !f.fan || fanCrops.has(k)) return;
    fanCrops.set(k, "loading");
    Promise.all(f.fan.map(([e, x0, y0, x1, y1]) => Promise.all([0, 1, 2, 3, 4, 5].map(ph =>
      fetch(RS + "fan/" + f.n + "_e" + e + "_k" + ph + ".webp").then(r => r.ok ? r.blob() : Promise.reject(r.status)).then(b => createImageBitmap(b, straight)).then(texOf)))
      .then(tx => ({ box: new T.Vector4(x0, y0, x1, y1), tx }))))
      .then(list => { fanCrops.set(k, list); for (const [j, v] of fanCrops) if (Math.abs(j - k) > 8) { if (Array.isArray(v)) v.forEach(o => o.tx.forEach(t => t.dispose())); fanCrops.delete(j); } },
            () => fanCrops.set(k, "none"));
  }
  function fanPhase(a, b, rest, now) {         // blade phase to show, or -1 for the frame's own
    if (!rest || !FR[a].fan || (b >= 0 && !FR[b].fan)) return -1;
    loadFans(a); if (b >= 0) loadFans(b);
    if (!Array.isArray(fanCrops.get(a)) || (b >= 0 && !Array.isArray(fanCrops.get(b)))) return -1;
    return Math.floor(now / 1000 * 24) % 6;
  }
  // the plate: one full-screen pass. Each pixel's 3D point comes from the live aircraft's depth (drawn depth-only for
  // this camera) or, where there is no aircraft, is a direction (sky). Both are projected into the cameras of the two
  // frames on screen and looked up there: sky from the photo with the aircraft hole filled from the sky plate, aircraft
  // from the photo (with the fan crops) through its matte. At a frame's own camera this is the photo exactly; between
  // frames the picture moves like the live model
  const NOBOX = new T.Vector4(-1, -1, -1, -1);
  const plateU = { pA: { value: blank }, mA: { value: blank }, gA: { value: blank }, pB: { value: blank }, mB: { value: blank }, gB: { value: blank },
    fA0: { value: blank }, fA1: { value: blank }, fB0: { value: blank }, fB1: { value: blank },
    bA0: { value: NOBOX }, bA1: { value: NOBOX }, bB0: { value: NOBOX }, bB1: { value: NOBOX }, dTex: { value: blank },
    t: { value: 0 }, hasB: { value: 0 }, res: { value: new T.Vector2(1, 1) }, camPos: { value: new T.Vector3() },
    invVP: { value: new T.Matrix4() }, VPa: { value: new T.Matrix4() }, VPb: { value: new T.Matrix4() }, hasD: { value: 0 }, dist: { value: 50 }, ghost: { value: 0 } };
  const plateMat = new T.ShaderMaterial({ uniforms: plateU, depthTest: false, depthWrite: false,
    vertexShader: "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: [
      "uniform sampler2D pA, mA, gA, pB, mB, gB, fA0, fA1, fB0, fB1, dTex; uniform vec4 bA0, bA1, bB0, bB1;",
      "uniform float t, hasB, hasD, dist, ghost; uniform vec2 res; uniform vec3 camPos; uniform mat4 invVP, VPa, VPb;",
      "const vec2 RP = vec2(" + RW + ".0, " + RH + ".0);",
      "vec2 toRef(mat4 VP, vec4 X) { vec4 c = VP * X; vec2 n = c.xy / c.w; return vec2((n.x * 0.5 + 0.5) * RP.x, (0.5 - n.y * 0.5) * RP.y); }",
      "vec3 world(vec2 ndc, float d) { vec4 w = invVP * vec4(ndc, d * 2.0 - 1.0, 1.0); return w.xyz / w.w; }",
      "vec4 fan(sampler2D ft, vec4 b, vec2 rp) { if (b.x < 0.0 || rp.x < b.x || rp.y < b.y || rp.x > b.z || rp.y > b.w) return vec4(0.0); return texture2D(ft, (rp - b.xy) / (b.zw - b.xy)); }",
      "vec3 photo(sampler2D P, sampler2D F0, sampler2D F1, vec4 b0, vec4 b1, vec2 rp) {",
      "  vec3 c = texture2D(P, rp / RP).rgb; vec4 f = fan(F0, b0, rp); c = mix(c, f.rgb, f.a); f = fan(F1, b1, rp); return mix(c, f.rgb, f.a); }",
      "vec3 frame(mat4 VP, sampler2D P, sampler2D M, sampler2D G, sampler2D F0, sampler2D F1, vec4 b0, vec4 b1, vec3 dir, vec3 X, float ac) {",
      // the sky behind: the photo, or the sky plate where the photo shows aircraft
      "  vec2 us = toRef(VP, vec4(dir, 0.0)) / RP;",
      "  vec3 sky = mix(texture2D(P, us).rgb, texture2D(G, us).rgb, smoothstep(0.0, 0.05, texture2D(M, us).a));",
      "  if (ac < 0.5) return sky;",
      // the aircraft premultiplied (the photo less the sky seen through it) over that sky: at the frame's own camera
      // this is the photo exactly, see-through x-ray parts included
      "  vec2 ra = toRef(VP, vec4(X, 1.0)), ua = ra / RP; float m = texture2D(M, ua).a;",
      "  vec3 air = photo(P, F0, F1, b0, b1, ra) - (1.0 - m) * texture2D(G, ua).rgb;",
      "  return mix(sky, air + (1.0 - m) * sky, smoothstep(0.0, 0.05, m)); }",
      // the nearest aircraft depth on rings of 2 to 22 reference pixels
      "float nearDepth(vec2 uv, float s) {",
      "  for (int r = 0; r < 6; r++) {",
      "    float rad = (r == 0 ? 2.0 : r == 1 ? 4.0 : r == 2 ? 7.0 : r == 3 ? 11.0 : r == 4 ? 16.0 : 22.0) * s, dm = 1.0;",
      "    for (int i = 0; i < 8; i++) { float a = float(i) * 0.785398 + float(r) * 0.392699; dm = min(dm, texture2D(dTex, uv + vec2(cos(a), sin(a)) * rad / res).r); }",
      "    if (dm < 1.0) return dm; }",
      "  return 1.0; }",
      "void main() {",
      "  vec2 uv = gl_FragCoord.xy / res, ndc = uv * 2.0 - 1.0; vec3 dir = normalize(world(ndc, 1.0) - camPos);",
      "  float d = texture2D(dTex, uv).r, mS = texture2D(mA, toRef(VPa, vec4(dir, 0.0)) / RP).a;",
      "  if (d >= 1.0 && (mS > 0.0 || (hasB > 0.5 && texture2D(mB, toRef(VPb, vec4(dir, 0.0)) / RP).a > 0.0))) d = nearDepth(uv, res.y / RP.y);",
      "  float ac = d < 1.0 ? 1.0 : 0.0; vec3 X = world(ndc, min(d, 0.9999999));",
      "  if (hasD < 0.5 || (ghost > 0.5 && ac < 0.5 && mS > 0.0)) { ac = 1.0; X = camPos + dir * dist; }   // aircraft not loaded yet, or the x-ray's see-through ghost: one plane at the subject's distance",
      "  vec3 c = frame(VPa, pA, mA, gA, fA0, fA1, bA0, bA1, dir, X, ac);",
      "  if (hasB > 0.5) c = mix(c, frame(VPb, pB, mB, gB, fB0, fB1, bB0, bB1, dir, X, ac), t);",
      "  gl_FragColor = vec4(c, 1.0); }"].join("\n") });
  const plateScene = new T.Scene(), plateQuad = new T.Mesh(new T.PlaneGeometry(2, 2), plateMat); plateQuad.frustumCulled = false; plateScene.add(plateQuad);
  // compiled and drawn once (empty) while the page is still loading, so the first real frame does not stall on it
  if (photoOK()) try { renderer.compile(plateScene, camera); renderer.setClearColor(0x000000, 0); renderer.render(plateScene, camera); renderer.clear(); } catch (e) {}
  let plateOn = false, lastPair = null;
  // the camera each frame was rendered with (same path, same lens shift; the frame's own 2640 x 1200 picture)
  const refCam = new T.PerspectiveCamera(30, RW / RH, .05, 900), refVPs = new Map(), keepP = new T.Vector3(), keepT = new T.Vector3();
  const refVP = k => {
    let m = refVPs.get(k); if (m) return m;
    const q = FR[k].p; keepP.copy(tmpP); keepT.copy(tmpT);        // camAt writes the shared vectors: keep the reader's
    camAt(q); refCam.position.copy(tmpP); refCam.lookAt(tmpT);
    const off = Math.min(smooth(q, .2, .3), 1 - smooth(q, .82, .92));
    if (off > .001) refCam.setViewOffset(RW, RH, -RH * .224 * off, RH * .06 * off, RW, RH); else refCam.clearViewOffset();
    refCam.updateMatrixWorld(); m = new T.Matrix4().multiplyMatrices(refCam.projectionMatrix, refCam.matrixWorldInverse);
    tmpP.copy(keepP); tmpT.copy(keepT); refVPs.set(k, m); return m;
  };
  // the live aircraft's depth for this camera: solid parts only, cut by the x-ray plane like the drawn ones
  let depthRT = null, depthList = null;
  function depthPass() {
    plateU.hasD.value = ready ? 1 : 0; if (!ready) return;
    renderer.getDrawingBufferSize(bufSize);
    if (!depthRT || depthRT.width !== bufSize.x || depthRT.height !== bufSize.y) {
      if (depthRT) depthRT.dispose();
      depthRT = new T.WebGLRenderTarget(bufSize.x, bufSize.y, { depthTexture: new T.DepthTexture(bufSize.x, bufSize.y, T.FloatType) });
      plateU.dTex.value = depthRT.depthTexture;
    }
    if (!depthList) {
      const twins = new Map(); depthList = [];
      scene.traverse(o => { if (!(o.layers.mask & 1) || !(o.isMesh || o.isLine || o.isPoints)) return;
        const m = o.material, solid = o.isMesh && m && m !== sparMat;
        // two depth-only materials (cut by the x-ray plane or not), both sides: the nearest surface wins either way
        const ck = m && m.clippingPlanes ? "clip" : "solid";
        let tw = null; if (solid) { tw = twins.get(ck); if (!tw) { tw = new T.MeshBasicMaterial({ colorWrite: false, side: T.DoubleSide, clippingPlanes: m.clippingPlanes || null }); twins.set(ck, tw); } }
        depthList.push([o, m, tw, true]); });
    }
    for (const e of depthList) if (e[2]) e[0].material = e[2]; else { e[3] = e[0].visible; e[0].visible = false; }
    camera.layers.set(0); renderer.setRenderTarget(depthRT); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera);
    for (const e of depthList) if (e[2]) e[0].material = e[1]; else e[0].visible = e[3];
    camera.layers.enableAll(); renderer.setRenderTarget(null);
  }
  const bufSize = new T.Vector2();
  function setFans(pre, k, ph) {
    const list = ph >= 0 ? fanCrops.get(k) : null;
    for (const e of [0, 1]) {
      const o = Array.isArray(list) && list[e];
      plateU["f" + pre + e].value = o ? o.tx[ph] : blank; plateU["b" + pre + e].value = o ? o.box : NOBOX;
    }
  }
  function updatePlate(p, rest, now) {
    // the nearest decoded frame at or before the reader and the nearest after, blended by position (frames may be
    // skipped while scrolling fast)
    const i = frameAt(p);
    let a = -1, b = -1, tt = 0, res = true;
    for (let k = i; k >= Math.max(0, i - 24); k--) if (onGPU(k)) { a = k; break; }            // only frames already on the GPU,
    for (let k = i + 1; k <= Math.min(FR.length - 1, i + 25); k++) if (onGPU(k)) { b = k; break; }   // so drawing never uploads
    if (a >= 0 && Math.abs(FR[a].p - p) > .05) a = -1;       // re-projected, a frame a little way off still sits right
    if (b >= 0 && Math.abs(FR[b].p - p) > .05) b = -1;
    if (a < 0 && b >= 0) { a = b; b = -1; }
    if (a >= 0 && b >= 0) { tt = clamp((p - FR[a].p) / (FR[b].p - FR[a].p)); if (tt < .01) b = -1; else if (tt > .99) { a = b; b = -1; tt = 0; } }
    if (a < 0) {
      if (lastPair && onGPU(lastPair[0]) && (lastPair[1] < 0 || onGPU(lastPair[1]))) { [a, b, tt] = lastPair; res = "stale"; }
      else return false;
    }
    if (window.__kdForce && onGPU(a - window.__kdForce)) { a -= window.__kdForce; b = -1; tt = 0; }       // diagnostics: re-project a frame further back
    lastPair = [a, b, tt];
    if (window.__kdRec) window.__kdRec.push([now, p, b >= 0 ? lerp(FR[a].p, FR[b].p, tt) : FR[a].p, res === true ? 1 : 0, b >= 0 ? b - a : 0]);   // diagnostics: shown vs wanted position
    const ph = res === true ? fanPhase(a, b, rest, now) : -1;
    const A = texFor(a), Bx = b >= 0 ? texFor(b) : A, full = k => hi[k] && hi[k].up ? hi[k].tex : texs[k].ph;
    plateU.pA.value = full(a); plateU.mA.value = A.ph; plateU.gA.value = A.g;          // the matte is the scrolling copy's alpha
    plateU.pB.value = b >= 0 ? full(b) : plateU.pA.value; plateU.mB.value = Bx.ph; plateU.gB.value = Bx.g;
    plateU.t.value = tt; plateU.hasB.value = b >= 0 ? 1 : 0;
    setFans("A", a, ph); setFans("B", b >= 0 ? b : a, b >= 0 ? ph : -1);
    renderer.getDrawingBufferSize(bufSize); plateU.res.value.copy(bufSize);
    camera.updateMatrixWorld(); plateU.invVP.value.multiplyMatrices(camera.matrixWorld, camera.projectionMatrixInverse); plateU.camPos.value.setFromMatrixPosition(camera.matrixWorld);
    plateU.dist.value = tmpP.distanceTo(tmpT); plateU.VPa.value = refVP(a); plateU.VPb.value = refVP(b >= 0 ? b : a);
    return res;
  }
  // compositing: sky and live aircraft fade in over the photo; overlays (lights, bird, contour, x-ray) always on top, masked by the aircraft's depth
  const liveRT = new T.WebGLRenderTarget(2, 2, { type: T.HalfFloatType, samples: renderer.capabilities.isWebGL2 ? 4 : 0 });
  const quadMat = new T.MeshBasicMaterial({ map: liveRT.texture, transparent: true, depthTest: false, depthWrite: false });
  const quadScene = new T.Scene(), quadCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 2), quad = new T.Mesh(new T.PlaneGeometry(2, 2), quadMat); quad.position.z = -1; quadScene.add(quad);
  // the aircraft's depth, so the light glows hide behind it over the photo frames: depth only, no shading
  const depthOnly = new T.MeshBasicMaterial({ colorWrite: false, side: T.DoubleSide });
  function compose(Lv, over) {
    renderer.autoClear = false;
    if (plateOn) depthPass();
    renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 0); renderer.clear();
    if (plateOn) renderer.render(plateScene, quadCam);
    if (Lv > .001 && skyReady) { skyBall.position.copy(camera.position); skyMat.uniforms.opacity.value = Lv; renderer.render(skyScene, camera); }
    if (Lv > .999) { camera.layers.enableAll(); renderer.render(scene, camera); }
    else {
      if (Lv > .001) {
        const v = new T.Vector2(); renderer.getDrawingBufferSize(v); if (liveRT.width !== v.x || liveRT.height !== v.y) liveRT.setSize(v.x, v.y);
        camera.layers.set(0); camera.layers.enable(3); renderer.setRenderTarget(liveRT); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null);
        quadMat.opacity = Lv; renderer.render(quadScene, quadCam);
      }
      if (over) {
        renderer.clearDepth();
        camera.layers.set(0); scene.overrideMaterial = depthOnly; renderer.render(scene, camera); scene.overrideMaterial = null;
        camera.layers.set(1); renderer.render(scene, camera);
      }
      camera.layers.enableAll();
    }
    renderer.autoClear = true;
  }
  let photoEase = 0, liveEase = -1, hideOv = false;
  // compile every shader (x-ray ghost, wires, gel, spray, contour, sky, crossfade quad) and allocate the crossfade buffer up front,
  // so entering a chapter never stalls on a shader compile
  function warm() {
    if (photoOK()) return;                      // desktop: frames are the picture; only the cheap mask and glow shaders are used
    const hidden = [], ct = canMat.transparent;
    try {
      camera.layers.enableAll(); renderer.compile(scene, camera); renderer.compile(skyScene, camera);
      scene.traverse(o => { if (!o.visible) { hidden.push(o); o.visible = true; } });
      camAt(1); camera.position.copy(tmpP); camera.lookAt(tmpT); camera.updateMatrixWorld();
      renderer.autoClear = false;
      // live mode draws straight to the screen: compile exactly those variants (the crossfade buffer only serves a mode change)
      for (const tr of [false, true]) {
        canMat.transparent = tr;
        renderer.setRenderTarget(null); renderer.clear();
        if (skyReady) renderer.render(skyScene, camera);
        camera.layers.enableAll(); renderer.render(scene, camera);
      }
    } catch (e) {}
    scene.overrideMaterial = null; renderer.setRenderTarget(null); renderer.clear(); renderer.autoClear = true;
    canMat.transparent = ct; hidden.forEach(o => { o.visible = false; }); camera.layers.enableAll();
  }

  const proj = new T.Vector3(), pv = new T.Vector3(), pv2 = new T.Vector3();
  const setS = (el, k, v) => { if (el["_s" + k] !== v) { el["_s" + k] = v; el.style[k] = v; } };
  let pending = [];
  const place = (el, v, show) => {
    if (!el) return; proj.copy(v).project(camera);
    const ok = show && proj.z < 1; setS(el, "opacity", ok ? "1" : "0");
    if (ok) pending.push({ el, x: (proj.x + 1) / 2 * sW, y: (1 - proj.y) / 2 * sH });
  };
  const flushPins = () => {        // nudge labels apart vertically so none overlap
    pending.sort((a, b) => a.y - b.y);
    for (let i = 1; i < pending.length; i++) for (let j = 0; j < i; j++) {
      const a = pending[j], b = pending[i];
      if (Math.abs(a.x - b.x) < 190 && b.y - a.y < 28) b.y = a.y + 28;
    }
    for (const p of pending) setS(p.el, "transform", `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`);
    pending = [];
  };
  const win = (p, a, b, f = .045) => Math.min(smooth(p, a, a + f), 1 - smooth(p, b - f, b));
  const WINDOWS = [[-1, .15], [.27, .53], [.64, .84], [.88, 1.2]], STARTS = [0, .24, .62, .86], ENDS = [.24, .62, .86, 1];
  stage.addEventListener("click", e => {
    const b = e.target.closest("[data-chapter]"); if (!b) return;
    const span = flight.offsetHeight - innerHeight, at = [0, .36, .72, .95][+b.dataset.chapter];
    scrollTo({ top: flight.offsetTop + at * span, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  let pS = 0, last = performance.now(), raf = 0, slowFrames = 0, frames = 0;

  function tick() {
    cancelAnimationFrame(raf);
    if (!visible) return;
    raf = requestAnimationFrame(tick);
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now;
    // adaptive quality: drop resolution and shadows if frames are slow
    frames++; if (dt > .026) slowFrames++;
    if (frames === 90) { if (slowFrames > 45 && dpr > 1) { dpr = 1; renderer.setPixelRatio(dpr); resize(); renderer.shadowMap.enabled = false; } frames = slowFrames = 0; }
    const span = fH - vH, p = clamp((scrollY - fTop) / (span || 1));
    pS += (p - pS) * Math.min(1, dt * 5);

    // the sky lights come up once the aircraft has loaded
    const rv = ready ? smooth((now - readyAt) / 1000, .1, 2.6) : 0;
    for (const [l, I] of LIGHTS) l.intensity = I * (.06 + .94 * rv);
    paint.envMapIntensity = .55 * (.06 + .94 * rv); slatMat.envMapIntensity = .5 * (.06 + .94 * rv);

    if (ready) {
      // chapter 1: x-ray of the inboard leading edge
      const xr = smooth(pS, .24, .32) * (1 - smooth(pS, .52, .6));
      // a scan plane sweeps aft through the aircraft; ahead of it the skin is cut away to show the structure inside
      const sx = lerp(-1.5, 41, xr); scan.constant = -sx; plateU.ghost.value = xr > .001 ? 1 : 0;
      ghostMat.uniforms.amt.value = xr; ghostMat.uniforms.sweep.value = sx; ghostMat.uniforms.band.value = Math.sin(Math.PI * xr) * (xr < .999 ? 1 : 0); wireMat.opacity = .85 * xr;
      // the slat stows (track runs aft through the spar into the can), holds, then runs out again
      const ret = smooth(pS, .33, .42) * (1 - smooth(pS, .45, .5));
      const Mx = screwM(ret); moving.matrix.copy(Mx); movingL.matrix.copy(Mx); moving.matrixWorldNeedsUpdate = movingL.matrixWorldNeedsUpdate = true;
      sparMat.opacity = .32 * xr; sparLine.opacity = xr;
      canMat.transparent = xr > .01; canMat.opacity = 1 - .3 * xr; canMat.depthWrite = xr < .5;
      for (const f of fans) f.rotation.z += dt * 7;
      const lab = xr > .72 && pS < .49 && !hideOv, tmpV = pv;
      place(pinSlat, tmpV.copy(slatMid).applyMatrix4(Mx).applyMatrix4(craft.matrixWorld), lab);
      place(pinTrack, pv.copy(trackMid).applyMatrix4(Mx).applyMatrix4(craft.matrixWorld), lab);
      place(pinSpar, pv.copy(sparMid).applyMatrix4(craft.matrixWorld), lab);
      place(pinTank, pv.copy(tankPt).applyMatrix4(craft.matrixWorld), lab);
      // chapter 2: bird strike on the outboard slat
      const q = clamp((pS - .62) / .2), qi = .42, tt = clamp((q - qi) / (1 - qi)), fade = 1 - smooth(pS, .82, .9), eo = 1 - Math.pow(1 - tt, 3);
      const start = hitV.x - 3.2, fly = q < qi ? q / qi : 1, bx = lerp(start, hitV.x - .12, fly), by = hitV.y + .04;
      // intact gel body in flight; on contact it squashes flat and thins out as the material flows over the slat
      const squash = smooth(tt, 0, .12), gone = smooth(tt, .04, .16);
      gel.visible = q > 0 && gone < .999 && fade > .01;
      gel.position.set(bx + .05 * squash, by, hitV.z); gel.scale.set(1 + .7 * squash, 1 - .5 * squash, 1 + .7 * squash);
      gelMat.opacity = (1 - gone) * fade * smooth(q, 0, .04);
      // SPH spray after contact, coloured by speed (red fast, blue slow) like the solver's velocity plot
      const bo = (q >= qi && q < 1 ? 1 : 0) * smooth(tt, .0, .06) * (1 - smooth(tt, .6, 1) * .75) * fade;
      const liveDrawn = liveEase > 0 || !photoOK();
      if (bo > 0 && liveDrawn) for (let i = 0; i < NB; i++) {
        const b = bird[i]; let x, y, z;
        if (q < qi) { x = bx + b.o.x; y = by + b.o.y; z = hitV.z + b.o.z; }
        else { x = hitV.x - .02 + b.o.x * .25 * (1 - eo) + b.d.x * b.sp * eo * .7; y = by + b.o.y * (1 - eo) + b.d.y * b.sp * eo; z = hitV.z + b.o.z * (1 - eo) + b.d.z * b.sp * eo * 1.3; }
        bPos[i * 3] = x; bPos[i * 3 + 1] = y; bPos[i * 3 + 2] = z;
        const [cr, cg, cb] = jet(clamp(.12 + .88 * (1 - eo) * (.45 + b.sp)));
        bCol[i * 3] = cr; bCol[i * 3 + 1] = cg; bCol[i * 3 + 2] = cb;
      }
      if (bo > 0 && liveDrawn) { bGeo.attributes.color.needsUpdate = true; bGeo.attributes.position.needsUpdate = true; }
      bMat.opacity = bo; birdPts.visible = bo > 0;
      const k = smooth(tt, 0, .06) * fade;
      if ((k > 0 || ovDirty) && liveDrawn) { ovDirty = k > 0;
        const P = sOutPos.array, O = sOutOrig, C = sOutCol.array;
        for (let i = 0; i < sOutPos.count; i++) {
          const dx = O[i * 3] - hitV.x, dy = O[i * 3 + 1] - hitV.y, dz = O[i * 3 + 2] - hitV.z, r = Math.sqrt(dx * dx + dy * dy + dz * dz);
          P[i * 3] = O[i * 3] + .035 * Math.exp(-r * r / .02) * eo * fade;
          const wave = Math.exp(-Math.pow(r - 2.2 * tt, 2) / (.02 + .09 * tt)) * (1 - .5 * tt) + Math.exp(-r * r / .03) * (1 - .3 * tt);
          const [jr, jg, jb] = jet(clamp(.12 + wave * .88));
          C[i * 4] = jr; C[i * 4 + 1] = jg; C[i * 4 + 2] = jb; C[i * 4 + 3] = k * clamp(wave * 2.8) * (r < 3.2 ? 1 : 0);
        }
        sOutPos.needsUpdate = true; sOutCol.needsUpdate = true;
      }
      place(pinCan, cans[0] ? cans[0].getWorldPosition(pv).add(pv2.set(.3, .08, 0)) : hitV, lab);
      // lights: steady navigation lights, double-flash strobes, pulsing beacons
      const tl = now / 1000, night = rv;
      for (const L of lights) {
        let o = 1; if (L.kind === "strobe") { const ph = tl % 1.3; o = ph < .05 || (ph > .16 && ph < .21) ? 1 : 0; }
        else if (L.kind === "beacon") o = Math.pow(Math.max(0, Math.sin(tl * Math.PI * 1.1)), 6);
        else if (L.kind === "land") o = .8;
        L.m.opacity = o * night * (1 - xr); L.s.scale.setScalar(L.size * (L.kind === "strobe" ? .7 + o * .6 : 1));
      }
      const ph = tl % 1.3, flash = ph < .05 || (ph > .16 && ph < .21) ? 1 : 0;
      for (const pl of strobeLights) pl.intensity = flash * 55 * (1 - xr);
      place(pinHit, hitV, q > qi + .05 && fade > .5 && !hideOv);
    }

    // camera; mouse parallax only while the view is live (the photos are fixed frames)
    camAt(pS);
    const want = photoOK() ? 0 : 1; feed(pS, Math.abs(p - pS) < 3e-4); if (want || liveEase > 0) loadSky();
    smx += (mx - smx) * Math.min(1, dt * 3); smy += (my - smy) * Math.min(1, dt * 3);
    const D = tmpP.distanceTo(tmpT), d = D * .02 * want * want;
    camera.position.set(tmpP.x + smx * d * 3, tmpP.y - smy * d * 2, tmpP.z + smx * d);
    look.copy(tmpT); camera.lookAt(look);
    // over the rendered frames the mouse slides the camera sideways without turning it, most in the wide shots: the
    // aircraft moves against the sky (the frames are re-projected through its depth, so this is real parallax)
    const pst = want < .999 ? clamp((D - 8) / 40) : 0;
    if (pst > 0) { const k = .536 * D * pst; mvR.set(1, 0, 0).applyQuaternion(camera.quaternion); mvU.set(0, 1, 0).applyQuaternion(camera.quaternion);
      camera.position.addScaledVector(mvR, smx * .053 * k).addScaledVector(mvU, -smy * .02 * k); }
    const off = Math.min(smooth(pS, .2, .3), 1 - smooth(pS, .82, .92)) * (camera.aspect > 1 ? 1 : 0), cw = sW, ch = sH;
    const mOff = camera.aspect < 1 ? 1 - smooth(pS, .1, .24) : 0;
    // close-ups move the subject right and up by fixed fractions of the height (the rendered frames have the same shift baked in)
    if (off > .001) camera.setViewOffset(cw, ch, -ch * .224 * off, ch * .06 * off, cw, ch);
    else if (mOff > .001) camera.setViewOffset(cw, ch, 0, -ch * .2 * mOff, cw, ch); else camera.clearViewOffset();
    const pl = want < .999 ? updatePlate(pS, Math.abs(p - pS) < 3e-4, now) : false, shown = !!pl;
    plateOn = shown; const ps_ = pl === "stale" ? "stale" : shown ? "1" : "0"; if (stage.dataset.photo !== ps_) stage.dataset.photo = ps_;
    photoEase += ((shown ? 1 : 0) - photoEase) * Math.min(1, dt * 4);
    if (shown && photoEase > .98) photoEase = 1;
    if (liveEase < 0) liveEase = want;
    liveEase += (want - liveEase) * Math.min(1, dt * 4); if (Math.abs(want - liveEase) < .02) liveEase = want;
    hideOv = want < .999 && !shown;                            // no photo yet: no glows or labels
    if (shown && loadEl) loadEl.classList.add("done");
    compose(liveEase, !hideOv);

    flushPins();
    chaps.forEach((el, i) => { const o = win(pS, WINDOWS[i][0], WINDOWS[i][1]); setS(el, "opacity", o.toFixed(4)); setS(el, "transform", `translateY(${((1 - o) * 24 - (i ? 0 : c0Over * smooth(pS, .004, .1))).toFixed(2)}px)`); el.classList.toggle("hidden-now", o < .1); });
    hud.forEach((b, i) => setS(b, "transform", `scaleX(${clamp((pS - STARTS[i]) / (ENDS[i] - STARTS[i])).toFixed(4)})`));
    hudBtns.forEach((b, i) => b.classList.toggle("on", pS >= STARTS[i] - .001 && pS < ENDS[i] + (i === 3 ? 1 : 0)));
  }
  tick();
})();
