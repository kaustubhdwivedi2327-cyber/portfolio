/* The live x-ray layer (desktop): the aircraft and its interior drawn live, with lighting baked from the same Blender
   (Cycles) scene as the rendered frames, the paint's reflections of the twilight sky and the metals' highlights worked out
   live for the camera, the x-ray window cut live, and the renders' colour look (AgX Medium High Contrast) applied from a
   table measured in Blender. scene.js shows it while the reader scrolls through the x-ray; when they stop, the view
   settles on the nearest rendered frame and that real photo is shown instead. Its own canvas, over the site's. */
(() => {
  if (!window.THREE) return;
  const T = THREE, A = "assets/rt/";
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (v, a, b) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const K = window.KDRT = { ready: false, loading: false, failed: false, still: true };
  let canvas = null, renderer = null, scene = null, post = null, postScene = null, postCam = null, rt = null, W = 1, H = 1;
  let CU, KU, TU, slatU, G, fanC, interior = [], slats = [], geo = null, screwM = null, shown = -1;

  K.attach = (stage, after) => {
    canvas = document.createElement("canvas"); canvas.className = "rt-layer"; canvas.setAttribute("aria-hidden", "true");
    after.after(canvas);
  };
  K.resize = (w, h) => {
    W = w; H = h; if (!renderer) return;
    renderer.setSize(w, h, false); if (rt) { rt.dispose(); rt = null; } if (rtLow) { rtLow.dispose(); rtLow = null; }
  };
  // the drawing buffers, made when needed and released after a few idle seconds (they are most of the GPU memory it holds)
  let lastUse = 0, rtLow = null;
  const target = (scale) => { const pr = renderer.getPixelRatio() * scale;
    return new T.WebGLRenderTarget(Math.max(1, Math.round(W * pr)), Math.max(1, Math.round(H * pr)), { type: T.HalfFloatType, samples: 4 }); };
  const ensureRT = () => { lastUse = performance.now(); if (!rt) rt = target(1); };
  // while the reader scrolls fast the scene is drawn at half resolution and scaled up (a quarter of the work: at that
  // speed nobody sees it, and a stopped view is the rendered photo anyway); normal scrolling is drawn at full resolution
  const ensureLow = () => { lastUse = performance.now(); if (!rtLow) rtLow = target(.5); };
  // 0..1: how much of the layer shows (CSS fades it: in quickly, out over a quarter second)
  K.show = (v, fade) => {
    if (!canvas || v === shown) return; const up = v > shown; shown = v;
    canvas.style.transition = !fade ? "none" : up ? "opacity .08s linear, visibility 0s" : "opacity .25s ease-out, visibility 0s .25s"; canvas.style.opacity = v.toFixed(3);
    canvas.style.visibility = v > 0 ? "visible" : "hidden";             // (a hidden layer costs the compositor nothing)
  };
  let ctrl = null;
  K.pause = () => { if (ctrl && !K.ready) ctrl.abort(); };           // stops the downloads (K.load starts them again)
  K.load = () => {
    if (K.loading || K.ready || K.failed || !canvas) return; K.loading = true;
    build().then(() => { K.ready = true; K.loading = false; }, e => { K.loading = false; if (e && e.name === "AbortError") return; K.failed = true; console.warn("live x-ray layer unavailable:", e); });
  };

  function dropArray() { this.array = null; }
  async function build() {
    // everything is downloaded first (low priority, cancellable) and decoded off the main thread; nothing is made until then
    ctrl = new AbortController(); const opt = { signal: ctrl.signal, priority: "low" };
    const get = u => fetch(u, opt).then(r => { if (!r.ok) throw new Error(u); return r; });
    const json = u => get(u).then(r => r.json()), bin = u => get(u).then(r => r.arrayBuffer());
    const bitmapOf = (u, flip = true) => get(u).then(r => r.blob())
      .then(b => createImageBitmap(b, { premultiplyAlpha: "none", colorSpaceConversion: "none", imageOrientation: flip ? "flipY" : "none" }));
    const [g, buf, bake, cmeta, envBuf, lutImg] = await Promise.all([json(A + "rt_geo.json"), bin(A + "rt_geo.bin"), json(A + "rt_meta.json"),
      json("assets/models/crm-meta.json"), bin(A + "rt_env.bin"), bitmapOf(A + "rt_lut.png", false)]);
    const names = Object.keys(bake), ambNames = names.filter(k => bake[k].arange);
    const [bms, abms, pbm] = await Promise.all([Promise.all(names.map(k => bitmapOf(A + `rt_${k}.webp`))), Promise.all(ambNames.map(k => bitmapOf(A + `rt_${k}_amb.webp`))),
      bitmapOf("assets/render/pano.jpg")]);
    renderer = new T.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));        // 2x is fill-bound on an integrated GPU; 1.5x holds 120 Hz
    renderer.outputEncoding = T.LinearEncoding; renderer.toneMapping = T.NoToneMapping;
    scene = new T.Scene();
    const gl = renderer.getContext(), jobs = [], anisoX = gl.getExtension("EXT_texture_filter_anisotropic");
    // shaders compile in the background: no status queries (they would wait) until the driver says they are done
    const par = gl.getExtension("KHR_parallel_shader_compile"); renderer.debug.checkShaderErrors = false;
    const WAIT = "wait", compiled = () => !par || renderer.info.programs.every(p => gl.getProgramParameter(p.program, par.COMPLETION_STATUS_KHR));
    let waitN = 0; const waitCompiled = () => { if (compiled() || ++waitN > 600) { waitN = 0; return true; } return WAIT; };
    // a texture three.js draws but does not fill: storage made here, filled in strips by jobs
    const stripTex = (bm, srgb, mips, repeatS) => {
      const w = bm.width, h = bm.height, t = new T.Texture(), g = gl.createTexture(), Pp = renderer.properties.get(t);
      t.image = { width: w, height: h }; t.flipY = false; t.generateMipmaps = false; t.encoding = srgb ? T.sRGBEncoding : T.LinearEncoding;
      t.minFilter = mips ? T.LinearMipmapLinearFilter : T.LinearFilter; t.magFilter = T.LinearFilter; if (repeatS) t.wrapS = T.RepeatWrapping;
      renderer.state.bindTexture(gl.TEXTURE_2D, g);
      gl.texStorage2D(gl.TEXTURE_2D, mips ? Math.floor(Math.log2(Math.max(w, h))) + 1 : 1, srgb ? gl.SRGB8_ALPHA8 : gl.RGBA8, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mips ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeatS ? gl.REPEAT : gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (mips && anisoX) gl.texParameterf(gl.TEXTURE_2D, anisoX.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(anisoX.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      Pp.__webglTexture = g; Pp.__webglInit = true;
      let y = 0;
      jobs.push(() => {                 // one strip (~2 MB) per call
        const n = Math.min(Math.max(1, Math.floor(2e6 / (w * 4))), h - y);
        renderer.state.bindTexture(gl.TEXTURE_2D, g);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.pixelStorei(gl.UNPACK_SKIP_ROWS, y); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, y, w, n, gl.RGBA, gl.UNSIGNED_BYTE, bm); gl.pixelStorei(gl.UNPACK_SKIP_ROWS, 0);
        y += n; if (y < h) return false;
        bm.close(); return true;
      });
      if (mips) jobs.push(() => { renderer.state.bindTexture(gl.TEXTURE_2D, g); gl.generateMipmap(gl.TEXTURE_2D); return true; });
      return t;
    };
    geo = g;
    const atlas = {}, ambTex = {};
    names.forEach((k, i) => { atlas[k] = stripTex(bms[i], true, true); });
    ambNames.forEach((k, i) => { ambTex[k] = stripTex(abms[i], true, true); });
    const pano = stripTex(pbm, false, false, true);
    // the sky, linear HDR, for the reflections
    const env = new T.DataTexture(new Uint16Array(envBuf), 1024, 512, T.RGBAFormat, T.HalfFloatType);
    env.mapping = T.EquirectangularReflectionMapping; env.magFilter = env.minFilter = T.LinearFilter; env.needsUpdate = true;
    let envMap = null, pmrem = null; const physical = [];
    jobs.push(() => { pmrem = new T.PMREMGenerator(renderer); pmrem.compileEquirectangularShader(); return true; }, waitCompiled);
    jobs.push(() => {                   // the sky's reflections (a few small renders), then given to the paint
      envMap = pmrem.fromEquirectangular(env).texture;
      for (const m of physical) { m.envMap = envMap; m.needsUpdate = true; } return true;
    });
    // the look: [green row j][red i + N * blue k] -> 3D texture (x red, y green, z blue)
    const N = 33, cv = document.createElement("canvas"); cv.width = lutImg.width; cv.height = lutImg.height;
    const cx = cv.getContext("2d"); cx.drawImage(lutImg, 0, 0); const px = cx.getImageData(0, 0, cv.width, cv.height).data;
    const lutData = new Uint8Array(N * N * N * 4);
    for (let k = 0; k < N; k++) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const s = (j * cv.width + i + N * k) * 4, d = (i + N * (j + N * k)) * 4;
      lutData[d] = px[s]; lutData[d + 1] = px[s + 1]; lutData[d + 2] = px[s + 2]; lutData[d + 3] = 255;
    }
    const lut = new T.Data3DTexture(lutData, N, N, N); lut.format = T.RGBAFormat; lut.type = T.UnsignedByteType;
    lut.minFilter = lut.magFilter = T.LinearFilter; lut.unpackAlignment = 1; lut.needsUpdate = true;

    /* the x-ray window, as rendered: a cone from the camera to the subject (a cylinder near the camera) */
    CU = { cC: { value: new T.Vector3() }, cT: { value: new T.Vector3() }, cOpen: { value: 0 } };
    const cutCode = (sh, cut) => {
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWp;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      let pre = "varying vec3 vWp; uniform vec3 cC, cT; uniform float cOpen, cW, cD;", body = "float band = 0.0;";
      if (cut) {
        Object.assign(sh.uniforms, CU, { cW: { value: cut[0] }, cD: { value: cut[1] } });
        body += "\n  { vec3 d = vWp - cC, ct = cT - cC; float tT = length(ct); vec3 ax = ct / tT; float t = dot(d, ax); float r = length(d - ax * t);" +
          "\n    float R = max(t * 0.2, 1.25) * cOpen * cW;" +
          "\n    if (cOpen > 0.0005 && t < tT + cD && t > 0.05) { if (r < R) discard; if (r < R + t * 0.0022) band = 1.0; } }";
      } else pre = "varying vec3 vWp;";
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\n" + pre).replace("void main() {", "void main() {\n  " + body);
    };
    const KEY = (cut, extra) => () => "rt" + (cut ? cut.join("_") : "n") + extra;
    // painted skin: the baked light (with the paint colour) plus the sky's reflection in the paint and its clear coat
    const paintMat = (t, R, rough, coat, cut) => {
      const m = new T.MeshPhysicalMaterial({ color: 0x000000, roughness: rough, metalness: 0, clearcoat: coat, clearcoatRoughness: .06, envMap,
        emissive: 0xffffff, emissiveIntensity: R, emissiveMap: t, side: T.DoubleSide });
      physical.push(m);
      m.onBeforeCompile = sh => {
        cutCode(sh, cut);
        sh.fragmentShader = sh.fragmentShader
          .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n  if (band > 0.5) roughnessFactor = 0.32;")
          .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\n  if (band > 0.5) { metalnessFactor = 1.0; diffuseColor.rgb = vec3(0.8, 0.81, 0.82); }")
          .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n  if (band > 0.5 || !gl_FrontFacing) totalEmissiveRadiance = vec3(0.0);")
          .replace("#include <output_fragment>", "#include <output_fragment>\n  if (!gl_FrontFacing && band < 0.5) gl_FragColor = vec4(vec3(0.42, 0.47, 0.40) * 0.02, 1.0);");
      };
      m.customProgramCacheKey = KEY(cut, "paint"); return m;
    };
    // drawn as baked (exterior metal parts)
    const litMat = (t, R, cut, side) => {
      const m = new T.MeshBasicMaterial({ map: t, color: new T.Color().setScalar(R), side });
      m.onBeforeCompile = sh => {
        cutCode(sh, cut);
        sh.fragmentShader = sh.fragmentShader.replace("#include <output_fragment>", "  if (band > 0.5) outgoingLight = max(outgoingLight * 1.6, vec3(0.03));\n#include <output_fragment>");
      };
      m.customProgramCacheKey = KEY(cut, "lit"); return m;
    };
    // the inboard slat: see-through in the x-ray (faces clear, edges kept, a cool rim), as in the renders
    slatU = { uG: { value: 0 } };
    const slatMat = (t, R) => {
      const m = paintMat(t, R, .30, .2, null);       // 25% metal: its reflection strength without a diffuse layer (that is baked)
      m.specularColor = new T.Color(4.38, 4.56, 4.81);
      m.transparent = true; m.premultipliedAlpha = true;
      const base = m.onBeforeCompile;
      m.onBeforeCompile = sh => {
        base(sh); sh.uniforms.uG = slatU.uG;
        sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uG;")
          .replace("if (!gl_FrontFacing && band < 0.5) gl_FragColor = vec4(vec3(0.42, 0.47, 0.40) * 0.02, 1.0);",
            "{ float c = abs(dot(normalize(vViewPosition), normal)); float facing = pow(1.0 - c, 0.7);\n" +
            "    float tr = clamp(pow(1.0 - facing, 0.35) * uG, 0.0, 1.0); vec3 rim = vec3(0.62, 0.80, 1.0) * clamp(pow(facing, 4.0) * uG, 0.0, 1.0) * 0.5;\n" +
            "    gl_FragColor = vec4(gl_FragColor.rgb * (1.0 - tr) + rim, 1.0 - tr); }");
      };
      m.customProgramCacheKey = () => "rtslat"; return m;
    };
    // parts that ride with the slat carry two bakes (slat out / slat in), blended with its travel
    TU = { uRet: { value: 0 } };
    const twinize = m => {
      const base = m.onBeforeCompile, key = m.customProgramCacheKey;
      m.onBeforeCompile = sh => {
        base(sh); sh.uniforms.uRet = TU.uRet;
        sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec2 uv2b; varying vec2 vUv2b;")
          .replace("#include <uv_vertex>", "#include <uv_vertex>\n  vUv2b = uv2b;");
        sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec2 vUv2b; uniform float uRet;")
          .replace("#include <map_fragment>", m.map ? "  diffuseColor *= mix(texture2D(map, vUv), texture2D(map, vUv2b), uRet);" : "#include <map_fragment>")
          .replace("#include <emissivemap_fragment>", "  totalEmissiveRadiance *= mix(texture2D(emissiveMap, vUv), texture2D(emissiveMap, vUv2b), uRet).rgb;");
      };
      m.customProgramCacheKey = () => key() + "twin"; return m;
    };
    // interior: the baked light (everything but reflections), the key light's highlight worked out live for the camera's
    // real direction (GGX, widened for the light's size) and scaled by the baked key-light map (its shadows kept), and
    // the metals' reflection of their surroundings (a baked map of the light around each point, without the key itself)
    KU = { kPos: { value: new T.Vector3() }, kSize: { value: 2.2 }, kInt: { value: 1 }, kXr: { value: 1 } };
    const interiorMat = (t, R, KR, cut, side, pbr, twin, amb, AR, fuel) => new T.ShaderMaterial({
      uniforms: Object.assign({ map: { value: t }, amb: { value: amb || null }, AR: { value: AR || 0 }, R: { value: R }, KR: { value: KR || 0 }, uBase: { value: new T.Vector3(pbr[0], pbr[1], pbr[2]) },
        uMetal: { value: pbr[3] }, uRough: { value: Math.max(.08, pbr[4]) }, cW: { value: cut ? cut[0] : 0 }, cD: { value: cut ? cut[1] : 0 } }, CU, KU, TU),
      defines: Object.assign({}, cut ? { CUT: 1 } : {}, twin ? { TWIN: 1 } : {}, KR ? { SPEC: 1 } : {}, amb ? { AMB: 1 } : {}, fuel ? { FUEL: 1 } : {}),
      transparent: !!fuel, premultipliedAlpha: !!fuel, depthWrite: !fuel, side,
      vertexShader: [
        "attribute vec2 uv2b; varying vec2 vUv, vUv2; varying vec3 vWp, vN;",
        "void main() { vUv = uv; vUv2 = uv2b; vec4 w = modelMatrix * vec4(position, 1.0); vWp = w.xyz; vN = normalize(mat3(modelMatrix) * normal);",
        "  gl_Position = projectionMatrix * viewMatrix * w; }"].join("\n"),
      fragmentShader: [
        "uniform sampler2D map, amb; uniform float AR, R, KR, kInt, kXr, uRet, uMetal, uRough, kSize, cOpen, cW, cD; uniform vec3 uBase, kPos, cC, cT;",
        "varying vec2 vUv, vUv2; varying vec3 vWp, vN;",
        "void main() {",
        "  float band = 0.0;",
        "#ifdef CUT",
        "  { vec3 d = vWp - cC, ct = cT - cC; float tT = length(ct); vec3 ax = ct / tT; float t = dot(d, ax); float r = length(d - ax * t);",
        "    float Rc = max(t * 0.2, 1.25) * cOpen * cW;",
        "    if (cOpen > 0.0005 && t < tT + cD && t > 0.05) { if (r < Rc) discard; if (r < Rc + t * 0.0022) band = 1.0; } }",
        "#endif",
        "  vec4 tx = texture2D(map, vUv);",
        "#ifdef TWIN",
        "  tx = mix(tx, texture2D(map, vUv2), uRet);",
        "#endif",
        "  vec3 col = tx.rgb * R * kInt;",
        "#ifdef SPEC",
        "  vec3 N = normalize(vN), V = normalize(cameraPosition - vWp); if (dot(N, V) < 0.0) N = -N;",
        "  vec3 Lv = kPos - vWp; float dl = length(Lv); vec3 L = Lv / dl, H = normalize(L + V);",
        "  float NL = max(dot(N, L), 1e-3), NV = max(dot(N, V), 1e-3), NH = max(dot(N, H), 0.0), VH = max(dot(V, H), 0.0);",
        "  float a = uRough * uRough, ap = clamp(a + kSize / (3.0 * dl), 0.0, 1.0), a2 = ap * ap;",
        "  float dd = NH * NH * (a2 - 1.0) + 1.0, D = a2 / (3.14159 * dd * dd) * (a * a) / (a2 + 1e-6);",
        "  float k = ap * 0.5, Vis = 1.0 / ((NL * (1.0 - k) + k) * (NV * (1.0 - k) + k) * 4.0);",
        "  vec3 F0 = mix(vec3(0.04), uBase, uMetal), F = F0 + (1.0 - F0) * pow(1.0 - VH, 5.0);",
        "  col += D * Vis * F * tx.a * tx.a * KR * 3.14159 * kXr;",
        "#ifdef AMB",
        "  float Am = texture2D(amb, vUv).r;",
        "#ifdef TWIN",
        "  Am = mix(Am, texture2D(amb, vUv2).r, uRet);",
        "#endif",
        "  vec3 Fe = F0 + (max(vec3(1.0 - uRough), F0) - F0) * pow(1.0 - NV, 5.0);",
        "  col += Fe * Am * AR * kInt;",
        "#endif",
        "#endif",
        "  if (band > 0.5) col = max(col * 1.6, vec3(0.03));",
        "#ifdef FUEL",
        "  { vec3 Nf = normalize(vN), Vf = normalize(cameraPosition - vWp); float a = clamp((1.0 - abs(dot(Nf, Vf))) * 0.30 + 0.16, 0.0, 1.0);",
        "    gl_FragColor = vec4(col * a, a); }",
        "#else",
        "  gl_FragColor = vec4(col, 1.0);",
        "#endif",
        "}"].join("\n") });

    /* the meshes */
    const mech = cmeta.mechanism, sc = new T.Vector3(...mech.center), sn = new T.Vector3(...mech.axis).normalize(), mB = new T.Matrix4(), mC = new T.Matrix4();
    screwM = (u, out) => out.makeTranslation(sc.x + sn.x * u * mech.slide, sc.y + sn.y * u * mech.slide, sc.z + sn.z * u * mech.slide)
      .multiply(mB.makeRotationAxis(sn, u * mech.angle)).multiply(mC.makeTranslation(-sc.x, -sc.y, -sc.z));
    const group = name => { const o = new T.Group(); o.name = name; o.matrixAutoUpdate = false; scene.add(o); return o; };
    G = { static: group("static"), moving: group("moving"), pinion0: group("pinion0"), pinion1: group("pinion1"), fanL: group("fanL"), fanR: group("fanR") };
    const E = cmeta.engine;
    fanC = { fanL: new T.Vector3(E.centre[0] + .55, E.centre[1], -Math.abs(E.centre[2])), fanR: new T.Vector3(E.centre[0] + .55, E.centre[1], Math.abs(E.centre[2])) };
    for (const c of geo.chunks) {
      const gm = new T.BufferGeometry();
      gm.setAttribute("position", new T.BufferAttribute(new Uint16Array(buf, c.pos, c.nv * 3), 3, true));
      gm.setAttribute("normal", new T.InterleavedBufferAttribute(new T.InterleavedBuffer(new Int8Array(buf, c.nrm, c.nv * 4), 4), 3, 0, true));
      gm.setAttribute("uv", new T.BufferAttribute(new Uint16Array(buf, c.uv, c.nv * 2), 2, true));
      gm.setIndex(new T.BufferAttribute(new Uint32Array(buf, c.idx, c.ni), 1));
      if (c.uv2 != null) gm.setAttribute("uv2b", new T.BufferAttribute(new Uint16Array(buf, c.uv2, c.nv * 2), 2, true));
      gm.boundingSphere = new T.Sphere(new T.Vector3(.5, .5, .5), .87); gm.boundingBox = new T.Box3(new T.Vector3(), new T.Vector3(1, 1, 1));
      for (const a of [...Object.values(gm.attributes), gm.index]) (a.isInterleavedBufferAttribute ? a.data : a).onUpload(dropArray);   // (the page's copy goes once it is on the GPU)
      const R = bake[c.atlas].range, t = atlas[c.atlas], isInt = c.atlas === "int" || c.atlas === "hero";
      let mat;
      if (c.shade === "paint") {
        const rc = { livery: [.30, .5], paint_nacelle: [.28, .55], inlet_lip: [.25, .3], gear_dark: [.5, 0], engine_dark: [.5, 0] }[c.mat] || [.35, .3];
        mat = paintMat(t, R, rc[0], rc[1], c.cut);
      } else if (c.shade === "slat") { mat = slatMat(t, R); slats.push(mat); }
      else if (isInt) mat = interiorMat(t, R, bake[c.atlas].krange, c.cut, c.atlas === "int" && c.mat !== "skin_inner" ? T.DoubleSide : T.FrontSide, c.pbr || [.5, .5, .5, 0, .5], c.uv2 != null,
        ambTex[c.atlas], bake[c.atlas].arange, c.mat === "xi_fuel");
      else mat = litMat(t, R, c.cut, T.FrontSide);
      if (c.uv2 != null && !isInt) twinize(mat);
      const m = new T.Mesh(gm, mat); m.position.set(...c.lo); m.scale.setScalar(c.s);
      (G[c.role] || G.static).add(m);
      if (isInt) interior.push(m);
    }
    for (const o of Object.values(G)) o.updateMatrixWorld(true);
    if (geo.key) { KU.kPos.value.set(...geo.key.p); KU.kSize.value = geo.key.size; }

    /* post: radiance -> the renders' look; the rendered sky panorama where nothing was drawn */
    post = new T.ShaderMaterial({
      uniforms: { tHDR: { value: null }, lut: { value: lut }, pano: { value: pano }, invVP: { value: new T.Matrix4() }, camPos: { value: new T.Vector3() } },
      vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: [
        "precision highp sampler3D;",
        "uniform sampler2D tHDR, pano; uniform sampler3D lut; uniform mat4 invVP; uniform vec3 camPos; varying vec2 vUv;",
        "void main() {",
        "  vec4 h = texture2D(tHDR, vUv); float a = clamp(h.a, 0.0, 1.0);",
        "  vec3 col = h.rgb / max(a, 1e-4);",
        "  vec3 x = clamp((log2(max(col, vec3(exp2(-12.0)))) + 12.0) / 17.0, 0.0, 1.0);",
        "  vec3 disp = texture(lut, x * (32.0 / 33.0) + 0.5 / 33.0).rgb;",
        "  vec4 w = invVP * vec4(vUv * 2.0 - 1.0, 1.0, 1.0); vec3 d = normalize(w.xyz / w.w - camPos);",
        "  vec3 sky = texture2D(pano, vec2(atan(d.z, d.x) * 0.15915494 + 0.5, asin(clamp(d.y, -1.0, 1.0)) * 0.31830989 + 0.5)).rgb;",
        "  gl_FragColor = vec4(mix(sky, disp, a), 1.0);",
        "}"].join("\n"),
      depthTest: false, depthWrite: false });
    postScene = new T.Scene(); postCam = new T.Camera(); postScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), post));
    K.resize(W, H); ensureRT();
    setInterval(() => { if (performance.now() - lastUse > 4000) { if (rt) { rt.dispose(); rt = null; } if (rtLow) { rtLow.dispose(); rtLow = null; } } }, 2000);

    // warm-up, one part at a time: its geometry goes up and its shader compiles, so the first live frame costs nothing
    const wc = new T.PerspectiveCamera(30, W / H, .05, 900); wc.position.set(25.2, 4.25, 3.1); wc.lookAt(28.6, 4.6, 6.3); wc.updateMatrixWorld();
    const meshes = []; scene.traverse(o => { if (o.isMesh) meshes.push(o); });
    // (three.js reads each program's uniforms as soon as it links, which waits for the compile: so one part per step)
    for (const m of meshes) jobs.push(() => { for (const o of meshes) o.visible = o === m; renderer.compile(scene, wc); return true; });
    jobs.push(() => { renderer.compile(postScene, postCam); return true; });
    for (const m of meshes) jobs.push(() => {
      for (const o of meshes) o.visible = o === m;
      const fc = m.frustumCulled; m.frustumCulled = false;
      ensureRT(); renderer.setRenderTarget(rt); renderer.render(scene, wc); renderer.setRenderTarget(null); m.frustumCulled = fc; return true;
    });
    jobs.push(() => { for (const o of meshes) o.visible = true; renderer.initTexture(lut); ensureRT(); post.uniforms.tHDR.value = rt.texture; renderer.render(postScene, postCam); return true; });
    // the jobs run while the reader is not scrolling, a few milliseconds' worth per screen update
    await new Promise(done => {
      const step = () => {
        if (!jobs.length) { done(); return; }
        if (K.still) { const t0 = performance.now(); while (jobs.length && performance.now() - t0 < 4) { const j0 = performance.now(), r = jobs[0](), jd = performance.now() - j0;
          if (jd > 6) (K.slow = K.slow || []).push([Math.round(jd), String(jobs[0]).slice(0, 60)]); if (r === WAIT) break; if (r) jobs.shift(); } }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* one live frame for the site's camera (the same camera as the frames), at scroll position p */
  const M1 = new T.Matrix4(), M2 = new T.Matrix4(), M3 = new T.Matrix4(), X = new T.Vector3(1, 0, 0);
  let lastP = null, lastT = 0, fastUntil = 0;
  K.render = (camera, coneC, coneT, p, now) => {
    if (!K.ready) return;
    const sp = lastP === null ? 0 : Math.abs(p - lastP) / Math.max(.001, (now - lastT) / 1000); lastP = p; lastT = now;
    if (sp > .5) fastUntil = now + 250;                                    // (~2600 px a second and more: a fast flick)
    const fast = now < fastUntil;
    const xr = smooth(p, .24, .32) * (1 - smooth(p, .52, .6)), cut = smooth(p, .24, .32) * (1 - smooth(p, .505, .535));
    const ret = smooth(p, .33, .42) * (1 - smooth(p, .45, .5));
    CU.cC.value.copy(coneC); CU.cT.value.copy(coneT); CU.cOpen.value = cut;
    screwM(ret, G.moving.matrix); G.moving.matrixWorldNeedsUpdate = true;      // the slat and tracks run in, pinions turn with them
    for (const k of [0, 1]) {
      const pv = geo.pivots["pinion" + k], o = G["pinion" + k]; if (!pv) continue;
      pv.axV = pv.axV || new T.Vector3(...pv.ax).normalize();
      o.matrix.makeTranslation(...pv.c).multiply(M2.makeRotationAxis(pv.axV, pv.k * ret)).multiply(M3.makeTranslation(-pv.c[0], -pv.c[1], -pv.c[2])); o.matrixWorldNeedsUpdate = true;
    }
    const ph = (now / 1000 * .9) % (Math.PI * 2);                              // the fans turn as on the site (~50 deg/s)
    for (const s of ["fanL", "fanR"]) { const c = fanC[s]; G[s].matrix.makeTranslation(c.x, c.y, c.z).multiply(M2.makeRotationAxis(X, ph)).multiply(M3.makeTranslation(-c.x, -c.y, -c.z)); G[s].matrixWorldNeedsUpdate = true; }
    for (const m of interior) m.visible = cut > .0005;
    KU.kInt.value = .3 + .7 * xr; KU.kXr.value = xr;
    for (const m of slats) m.depthWrite = .92 * xr < .01;
    slatU.uG.value = .92 * xr; TU.uRet.value = ret;
    const layers = camera.layers.mask; camera.layers.enableAll();
    let tg; if (fast) { ensureLow(); tg = rtLow; } else { ensureRT(); tg = rt; }
    renderer.setRenderTarget(tg); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    post.uniforms.tHDR.value = tg.texture; post.uniforms.invVP.value.multiplyMatrices(camera.matrixWorld, camera.projectionMatrixInverse);
    post.uniforms.camPos.value.setFromMatrixPosition(camera.matrixWorld);
    renderer.render(postScene, postCam);
    camera.layers.mask = layers;
  };
})();
