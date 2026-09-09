// ============================================================
//  PORTFOLIO CONTENT — edit this file to change the site.
//
//  Each project has:
//   cover     card + header image
//   videos    [{ src, poster, title, caption }]  (local mp4 or YouTube/Vimeo link)
//   images    [{ src, caption }]                  (gallery, lightbox)
//   compare   [{ title, before, after, beforeLabel, afterLabel }] (drag slider)
//   charts    [spec]  interactive charts, see js/charts.js for the spec format
//             `curves: "key"` pulls digitised line data from js/curves.js
// ============================================================

const SITE = {
  name: "Kaustubh Dwivedi",
  first: "Kaustubh",
  last: "Dwivedi",
  role: "Aerospace Structures & Design Engineer",
  location: "Cranfield, UK",
  email: "kaustubhdwivedi2327@gmail.com",
  linkedin: "https://www.linkedin.com/in/kaustubh-dwivedi-65586324a/",
  researchgate: "https://www.researchgate.net/scientific-contributions/Kaustubh-Dwivedi-2272720523",
  orcid: "https://orcid.org/0009-0004-6472-7732",
  cv: "assets/Kaustubh_Dwivedi_CV.pdf",
  headline: ["Structures that are", "substantiated,", "not just designed."],
  profile:
    "Aerospace structures and design engineer, completing an MSc in Advanced Lightweight and Composite Structures at Cranfield University. Two industry projects with GKN Aerospace: an LPBF redesign of the Airbus A320 slat-track can, taken from load definition to released native CAD 20.6 % lighter than the existing welded design, and an SPH–FEA bird-strike assessment of composite leading-edge concepts, validated against manufactured specimens and published open access in 2026. Five peer-reviewed publications, including a first-author paper in Materials Today Communications.",
  stance:
    "I work to a stated load basis and a documented evidence chain, and I am explicit about what a result clears and what it does not.",
  availability: "Open to UK aerospace structures, design and analysis roles from Sept 2026.",
  stats: [
    { value: 2, suffix: "", decimals: 0, label: "industry projects with GKN Aerospace: A320 slat-track can and composite leading edge" },
    { value: 5, suffix: "", decimals: 0, label: "peer-reviewed publications, one as first author" },
    { value: 18, suffix: "", decimals: 0, label: "months of industry design experience at Dassault Systèmes" },
    { value: 100, suffix: "+", decimals: 0, label: "documented simulation runs in Abaqus, Tosca and ANSYS across the two projects" },
  ],
  marquee: [
    "Abaqus/Standard", "Abaqus/Explicit", "CATIA V5", "3DEXPERIENCE", "nCode", "ANSYS Additive",
    "Tosca Structure", "SPH–FEA", "LPBF / AlSi10Mg", "CS 25.963", "CS 25.561", "EN 1999-1-3",
    "Python", "MATLAB", "Composites", "DfAM",
  ],
};

const CATEGORIES = ["All", "Structures & AM", "Composites & Impact", "Design & CAD", "Research"];

// ---------- shared numbers (slat-track can) ----------
const ST = {
  cases: ["ZTOP", "XNEG", "XPOS", "CAP", "ROOT"],
  caseK: ["K = 3.0", "K = 1.5", "K = 1.5", "K = 1.5", "K = 1.5"],
  refU: [0.639, 0.555, 0.555, 0.0197, 0.0298],
  finalU: [0.718, 0.427, 0.427, 0.018, 0.015],
  finalS: [41.4, 28.29, 28.47, 3.09, 1.82],
  finalFoS: ["FoS 5.56", "FoS 8.13", "FoS 8.08", "FoS 74", "FoS 127"],
  modes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  f6061: [238.86, 287.63, 543.18, 591.07, 823.87, 840.30, 874.15, 987.21, 999.98, 1282.02],
  fHT23: [121.63, 123.59, 314.60, 316.29, 377.41, 439.88, 443.97, 607.38, 612.46, 722.95],
  fAlSi: [295.49, 307.40, 529.48, 534.46, 781.46, 783.56, 893.87, 897.65, 925.53, 1053.15],
};
// EN 1999-1-3 category 50-4.3: N = 2e6 (50/dsigma)^4.3
const SN = [];
for (let s = 32; s <= 105; s += 2) SN.push([2e6 * Math.pow(50 / s, 4.3), s]);

const PROJECTS = [
  {
    id: "slat-track",
    category: "Structures & AM",
    title: "Airbus A320 Slat-Track Can",
    subtitle: "LPBF redesign and structural substantiation",
    period: "2025 – 2026",
    org: "Supervised and reviewed by GKN Aerospace · MSc research project, Cranfield University",
    role: "Sole engineer, load definition to released CAD",
    tags: ["LPBF / AlSi10Mg", "Abaqus", "CATIA V5", "Tosca", "nCode", "ANSYS Additive", "CS 25.963 / 25.561", "DfAM"],
    metrics: [
      { value: "1.478 kg", label: "released monolithic design" },
      { value: "−20.6 %", label: "vs. 1.860 kg welded 6061-T6 reference" },
      { value: "5.56", label: "minimum yield FoS, PEEQ = 0" },
      { value: "3.82×", label: "fatigue margin on the 300k-repeat target" },
    ],
    summary:
      "Slat-track cans enclose the part of the leading-edge slat mechanism that enters the wing fuel tank, keeping the fuel boundary while leaving clearance for the track. I replaced a multi-part welded 6061-T6 can with a single AlSi10Mg laser powder-bed fusion part and substantiated it end to end: load basis, route down-selection across four AM materials, load-path optimisation, response-guided variable-wall sizing, native CATIA reconstruction, independent re-verification, fatigue, modal and build-process screens, closed out against a requirements verification matrix.",
    highlights: [
      "Released a monolithic AlSi10Mg LPBF design at 1.478 kg in place of a multi-part welded 6061-T6 assembly, removing 20.6 % of the mass with all five load cases elastic and a minimum yield factor of safety of 5.56.",
      "Quantified what the redesign actually bought: at a fixed 1.450 kg, redistributing wall material alone cut displacement 3.4–5.1 % and von Mises stress 3.7–10.1 %, and a uniform 1.50 mm wall of comparable mass yielded locally where the variable wall stayed elastic.",
      "Set the load basis with the industrial supervisor where the certified definition was proprietary: a five-case directional pressure matrix on CS 25.963 fuel-head loading, bounded against CS 25.561 emergency-landing inertia.",
    ],
    steps: [
      { title: "Load basis", image: "assets/slat-track/t03_load_regions.jpg", imageCaption: "The five loaded regions on the can exterior: ZTOP at K = 3, CAP, ROOT, XNEG and XPOS at K = 1.5 (thesis Fig. 3.2).", body: "Five mutually exclusive quasi-static pressure cases, p = KρgL with ρ = 785 kg/m³ and L = 1.50 m, applied over defined exterior regions. K = 3 on the top surface (ZTOP) bounds CS 25.963 fuel-head loading; K = 1.5 lateral, cap and root cases bracket CS 25.561 emergency-landing inertia. The certified aircraft load definition was proprietary, so the basis was agreed with the industrial supervisor and stated in full." },
      { title: "Welded reference", image: "assets/slat-track/t04_reference_model.jpg", imageCaption: "Reference 6061-T6 shell: modelled weld/HAZ bands at 0.6× parent strength and a fully fixed lower attachment (Fig. 3.3).", body: "18,230-element S4R/S3 stitched shell with 10 mm heat-affected-zone bands at 0.6× parent strength. ZTOP gives 0.639 mm and 65.1 MPa on the 1.860 kg assembly: the stiffness and strength datum every candidate was measured against." },
      { title: "Route down-selection", image: "assets/slat-track/d42_five_material.jpg", imageCaption: "Five-material static comparison from the final presentation: maximum displacement and strength utilisation.", body: "PA2241 FR, ALM HT-23 and ULTEM 9085 printed polymers against AlSi10Mg. Both polymer routes were rejected on quantified stiffness grounds: the best HT-23 concept still moved 6.2× the reference under ZTOP, and even a 10 mm PA2241 FR wall at 3.41 kg stayed 5.5× more compliant. AlSi10Mg retained 94 % of the baseline specific stiffness." },
      { title: "Load-path learning", image: "assets/slat-track/t08_ht23_sequence.jpg", imageCaption: "HT-23 wall-development sequence: reference wall, historical load path, critical regions and the MR02 basis (Fig. 4.4).", body: "Tosca Structure guided the HT-23 MR02 concept; a common-basis reinforcement study showed a continuous root sleeve delivered 14.84 % of the 15.21 % five-case displacement reduction, so gussets and flutes were dropped. The variable-wall method, not the polymer, was carried to the metal design." },
      { title: "Response-guided variable wall", image: "assets/slat-track/t12_blend_delta.jpg", imageCaption: "Final same-mass redistribution at 1.450 kg: red added, blue removed (Fig. 5.5).", body: "Protected inner surface fixed; the outer wall trimmed 1.750 → 1.600 → 1.450 kg with stress, PEEQ and hotspot checks at each step, then redistributed at constant 1.450 kg toward the high-response regions. That last step alone cut displacement 3.4–5.1 % and stress 3.7–10.1 % across all five cases." },
      { title: "Release and independent verification", image: "assets/slat-track/d40_final_ztop.jpg", imageCaption: "ZTOP K = 3 on the native-CAD design: 0.71 mm and 41.4 MPa (final presentation).", body: "Watertight native CATIA V5 solid (1.4775 kg, STEP volume difference −0.06 %, cavity change +0.26 %), re-meshed on an independent 239,329-element C3D10 model sharing no nodes with the development mesh. All five cases elastic; minimum yield FoS 5.56 under ZTOP." },
      { title: "Fatigue screen", image: "assets/slat-track/d29_fatigue_contours.jpg", imageCaption: "nCode life and damage contours for the welded baseline (final presentation).", body: "Welded reference screened to EN 1999-1-3 detail category 50–4.3 in nCode: 1.145 × 10⁶ repeats, 3.82× the 300,000-repeat target, cross-checked to within 3 % by an independent shell tangent-stress route. Not transferred to the LPBF design, where supplier allowables are still needed." },
      { title: "Modal and LPBF process screens", image: "assets/slat-track/t15_mode_shapes.jpg", imageCaption: "First three dry fixed-base mode shapes of the three designs (Fig. 5.19).", body: "Dry fixed-base modal extraction kept the final design in the reference's low-order band. ANSYS Additive thermal simulation located the sustained hotspot at the root and collar band, and a control run on the existing welded geometry showed the pattern follows build direction, not the redesign." },
      { title: "Close-out", image: "assets/slat-track/t20_outcome.jpg", imageCaption: "Project outcome and the remaining validation stages (Fig. 7.1).", body: "Requirements verification matrix separating what the numerical evidence closes from what still needs supplier allowables, a buckling check and leak/proof testing before prototype release." },
    ],
    cover: "assets/slat-track/cover_dark.jpg",
    hero: "assets/slat-track/hero.jpg",
    videos: [
      { src: "assets/slat-track/video/lpbf_structural.mp4", poster: "assets/slat-track/video/lpbf_structural.jpg", title: "LPBF build, structural", caption: "ANSYS Additive layer-by-layer structural build of the can: total deformation as the part grows on the build plate (final presentation, slide 3)." },
      { src: "assets/slat-track/video/lpbf_temp_alsi.mp4", poster: "assets/slat-track/video/lpbf_temp_alsi.jpg", title: "LPBF thermal, AlSi10Mg design", caption: "Temperature history of the AlSi10Mg build, used to locate the sustained hotspot at the root and collar band (slide 49)." },
      { src: "assets/slat-track/video/lpbf_hotspot_alsi.mp4", poster: "assets/slat-track/video/lpbf_hotspot_alsi.jpg", title: "LPBF hotspot indicator, AlSi10Mg design", caption: "Hotspot indicator during deposition of the AlSi10Mg design (slide 51)." },
      { src: "assets/slat-track/video/lpbf_temp_ref.mp4", poster: "assets/slat-track/video/lpbf_temp_ref.jpg", title: "LPBF thermal, reference geometry", caption: "Control run on the 6061-T6 reference geometry: the thermal pattern follows build direction, not the redesign (slide 48)." },
      { src: "assets/slat-track/video/lpbf_hotspot_ref.mp4", poster: "assets/slat-track/video/lpbf_hotspot_ref.jpg", title: "LPBF hotspot indicator, reference geometry", caption: "Hotspot indicator for the reference-geometry control run (slide 50)." },
    ],
    images: [
      { src: "assets/slat-track/t01_location.jpg", caption: "Location of the slat-track can in the leading-edge mechanism (thesis Fig. 1.1, adapted from the Airbus reference)." },
      { src: "assets/slat-track/t02_component.jpg", caption: "The reference slat-track can and its principal regions: connector, hose assembly, end cap, body and flange (Fig. 1.2)." },
      { src: "assets/slat-track/d24_load_cases.jpg", caption: "Load cases overview from the final presentation: fuel hydrostatic, ZTOP top-down, cap and ice crush, root support and lateral oscillatory." },
      { src: "assets/slat-track/t03_load_regions.jpg", caption: "The five loaded regions on the can exterior with the pressure basis p = KρgL (Fig. 3.2)." },
      { src: "assets/slat-track/t04_reference_model.jpg", caption: "Reference 6061-T6 shell model: weld/HAZ bands and the fully fixed lower attachment (Fig. 3.3)." },
      { src: "assets/slat-track/t05_ref_ztop_u.jpg", caption: "6061-T6 reference: displacement magnitude under ZTOP K = 3, 0.639 mm peak (Fig. 3.4)." },
      { src: "assets/slat-track/d42_five_material.jpg", caption: "Five-material static response comparison: maximum displacement and strength utilisation for the reference, PA2241 FR, HT-23, ULTEM 9085 and AlSi10Mg (final presentation)." },
      { src: "assets/slat-track/t06_bead_optimisation.jpg", caption: "Tosca bead-optimisation design displacement for two of the shortlisted candidates, outward positive (Fig. 4.2)." },
      { src: "assets/slat-track/t07_shape_candidates.jpg", caption: "The three shortlisted HT-23 shape candidates and the surface deviation between A and C (Fig. 4.3)." },
      { src: "assets/slat-track/t08_ht23_sequence.jpg", caption: "HT-23 wall-development sequence: reference wall, historical load path, critical regions and the MR02 basis at 1.718 kg (Fig. 4.4)." },
      { src: "assets/slat-track/t09_ht23_peeq.jpg", caption: "Equivalent plastic strain in the unreinforced HT-23 concept under ZTOP K = 3, confined to the root (Fig. 4.6)." },
      { src: "assets/slat-track/d35_reinforcement.jpg", caption: "Reinforcement study on HT-23: root-only sleeve with four shallow gussets, taller gussets, a 2.0 mm sleeve and eight flutes (final presentation)." },
      { src: "assets/slat-track/t10_retain_score.jpg", caption: "Retain/protect score P on the development model: P = 0 trim-eligible, P = 1 protected (Fig. 5.3)." },
      { src: "assets/slat-track/t11_above_150.jpg", caption: "Wall retained above the 1.50 mm floor by the precursor (Fig. 5.4)." },
      { src: "assets/slat-track/t12_blend_delta.jpg", caption: "Final same-mass redistribution Δt at 1.450 kg: red added, blue removed (Fig. 5.5)." },
      { src: "assets/slat-track/d39_retained_redistributed.jpg", caption: "Retained thickness and final redistribution side by side, with the design-review interpretation (final presentation)." },
      { src: "assets/slat-track/t13_wall_section.jpg", caption: "Wall thickness of the released design in section: longitudinal median band and three station details (Fig. 5.9)." },
      { src: "assets/slat-track/t14_c3d10_mesh.jpg", caption: "Independent C3D10 mesh of the released STEP solid: 239,329 elements sharing no nodes with the development model (Fig. 5.10)." },
      { src: "assets/slat-track/d40_final_ztop.jpg", caption: "AlSi10Mg final design under ZTOP K = 3: 0.71 mm maximum displacement and 41.4 MPa von Mises, PEEQ = 0 (final presentation)." },
      { src: "assets/slat-track/d41_final_xpos.jpg", caption: "AlSi10Mg final design under XPOS K = 1.5: 0.42 mm and 28.5 MPa (final presentation)." },
      { src: "assets/slat-track/d29_fatigue_contours.jpg", caption: "nCode life and damage contours for the welded 6061-T6 baseline, minimum life 1.145 × 10⁶ repeats (final presentation)." },
      { src: "assets/slat-track/t15_mode_shapes.jpg", caption: "First three dry fixed-base mode shapes: 6061-T6 reference, HT-23 concept and the AlSi10Mg design (Fig. 5.19)." },
      { src: "assets/slat-track/t21_modes_ref_10.jpg", caption: "Appendix: first ten modes of the 6061-T6 reference, 238.9 Hz to 1282 Hz." },
      { src: "assets/slat-track/t22_modes_ht23_10.jpg", caption: "Appendix: first ten modes of the HT-23 concept, 121.6 Hz to 722.9 Hz." },
      { src: "assets/slat-track/t16_lpbf_build.jpg", caption: "ANSYS Additive preliminary LPBF build arrangement of the AlSi10Mg design on the plate (Fig. 5.20)." },
      { src: "assets/slat-track/t17_lpbf_temp_alsi.jpg", photo: true, caption: "LPBF temperature field, AlSi10Mg design, during deposition (Fig. 5.22)." },
      { src: "assets/slat-track/t18_lpbf_hotspot_alsi.jpg", photo: true, caption: "LPBF hotspot indicator, AlSi10Mg design: the sustained hotspot sits at the root and collar band (Fig. 5.23)." },
      { src: "assets/slat-track/t19_lpbf_temp_ref.jpg", photo: true, caption: "Control run on the reference geometry: the temperature pattern follows build direction, not the redesign (Fig. 5.24)." },
      { src: "assets/slat-track/t20_outcome.jpg", caption: "Project outcome and remaining validation stages: supplier qualification, LPBF fatigue evidence, prototype testing, installed dynamics (Fig. 7.1)." },
      { src: "assets/slat-track/d52_conclusion.jpg", caption: "Conclusion slide: representative design mass by material route and the closing numbers (final presentation)." },
    ],
    charts: [
      {
        type: "bars", title: "Final five-case static envelope", subtitle: "Independent 239,329-element C3D10 model of the released CATIA solid. All cases elastic.",
        datasets: {
          "Maximum displacement (mm)": { categories: ST.cases, series: [{ name: "6061-T6 welded reference (1.860 kg)", values: ST.refU }, { name: "AlSi10Mg final (1.478 kg)", values: ST.finalU }] },
          "von Mises stress, final (MPa)": { categories: ST.cases, series: [{ name: "AlSi10Mg final, accepted peak", values: ST.finalS }] },
        },
        catSub: ST.finalFoS, unit: "", decimals: 3, tickDecimals: 2,
        note: "ZTOP governs. CAP accepted value excludes one warned element (3.65 MPa raw). Reference values from the K3 shell model.",
      },
      {
        type: "bars", title: "Mass versus response through the development", subtitle: "ZTOP K = 3 on the common development model. The last step is redistribution at the same mass, not further removal.",
        datasets: {
          "Maximum displacement (mm)": { categories: ["VT02", "VT03", "VT04 trim", "Smooth outer", "Final blend"], series: [{ name: "U max, ZTOP", values: [0.7906, 0.8406, 0.9579, 0.9466, 0.8980] }] },
          "von Mises stress (MPa)": { categories: ["VT02", "VT03", "VT04 trim", "Smooth outer", "Final blend"], series: [{ name: "von Mises, ZTOP", values: [72.33, 74.24, 75.74, 81.45, 78.46] }] },
        },
        catSub: ["1.750 kg", "1.600 kg", "1.450 kg", "1.450 kg", "1.450 kg"], decimals: 3, tickDecimals: 2,
        note: "PEEQ was zero in every listed case. Development-model values; the native-CAD result is reported separately above.",
      },
      {
        type: "hbars", title: "What material placement alone bought", subtitle: "Percentage reduction in every load case, same topology and supports.",
        datasets: {
          "vs mass-matched smooth outer (1.450 kg)": { categories: ST.cases, series: [{ name: "Maximum displacement", values: [5.1, 3.4, 3.4, 3.7, 4.8] }, { name: "von Mises stress", values: [3.7, 10.1, 9.7, 4.6, 6.6] }] },
          "vs uniform 1.50 mm wall (1.353 kg)": { categories: ST.cases, series: [{ name: "Maximum displacement", values: [37.0, 15.0, 15.0, 29.9, 35.8] }, { name: "Raw von Mises stress", values: [24.3, 28.5, 27.7, 27.5, 30.3] }] },
        },
        decimals: 1, labelUnit: " %", unit: "%",
        note: "The uniform wall is 6.7 % lighter yet worse in all five cases; it also yielded locally where the variable wall stayed elastic.",
      },
      {
        type: "bars", title: "Route screen on one lateral case", subtitle: "XPOS K = 1.5 maximum displacement for the compared design routes; lower is stiffer.",
        categories: ["6061-T6 ref.", "AlSi10Mg V11", "HT-23 MR02", "PA2241 FR 10 mm", "ULTEM 9085"],
        catSub: ["1.860 kg", "1.478 kg", "1.718 kg", "3.41 kg", "1.855 kg"],
        series: [{ name: "Maximum displacement (mm)", values: [0.555, 0.427, 2.293, 3.04, 5.167] }],
        decimals: 3, tickDecimals: 1, yLabel: "U max (mm)",
        note: "Printed polymers offered 7–17 % of the baseline specific stiffness; AlSi10Mg retained 94 %. PA2241 FR shown at its stiffest uniform wall.",
      },
      {
        type: "lines", title: "PA2241 FR uniform-wall sweep", subtitle: "Thickening the wall reduced displacement, but the mass it added removed the density advantage.",
        series: [{ name: "PA2241 FR, XPOS K = 1.5", points: [[4, 9.08], [6, 5.58], [8, 3.96], [10, 3.04]], marker: true, pointLabels: ["1.36 kg", "2.04 kg", "2.72 kg", "3.41 kg"] }],
        refs: [{ y: 0.555, label: "6061-T6 reference 0.555 mm" }],
        xLabel: "Uniform wall thickness (mm)", yLabel: "Maximum displacement (mm)", decimals: 2, xTickDecimals: 0, xMin: 3, xMax: 11, yMin: 0,
      },
      {
        type: "lines", title: "Fatigue screen of the welded reference", subtitle: "EN 1999-1-3 category 50–4.3 curve; two independent routes both clear the 300,000-repeat project target.",
        series: [
          { name: "EN 1999-1-3 cat. 50–4.3", points: SN, marker: false, width: 2 },
          { name: "Local solid weld/HAZ: 56.7 MPa, 1.145 × 10⁶ repeats (3.82×)", points: [[1.145e6, 56.7]], marker: true, markerSize: 6, line: false },
          { name: "Shell tangent stress: 55.13 MPa, 1.314 × 10⁶ repeats (4.38×)", points: [[1.314e6, 55.13]], marker: true, markerSize: 6, line: false },
        ],
        refs: [{ x: 3e5, label: "300,000-repeat target" }],
        xLog: true, yLog: true, xMin: 1.5e5, xMax: 1.2e7, yMin: 30, yMax: 110, xLabel: "Life N (repeats)", yLabel: "Stress range (MPa)", decimals: 1,
        note: "A comparative durability screen under a simplified project event, not an approved aircraft spectrum. Not transferred to the LPBF design.",
      },
      {
        type: "lines", title: "Dry fixed-base natural frequencies", subtitle: "First ten modes. The final design sits in the reference band; the polymer concept does not.",
        datasets: {
          "Frequency (Hz)": { series: [
            { name: "6061-T6 reference", points: ST.modes.map((m, i) => [m, ST.f6061[i]]), marker: true },
            { name: "HT-23 concept", points: ST.modes.map((m, i) => [m, ST.fHT23[i]]), marker: true },
            { name: "AlSi10Mg final", points: ST.modes.map((m, i) => [m, ST.fAlSi[i]]), marker: true },
          ] },
        },
        xLabel: "Mode", yLabel: "Natural frequency (Hz)", decimals: 1, xTickDecimals: 0, xMin: 0.5, xMax: 10.5, yMin: 0,
        note: "Comparative component-level check only; no installed resonance margin is claimed.",
      },
      {
        type: "bars", title: "AlSi10Mg final relative to the 6061-T6 reference", subtitle: "Change in natural frequency, mode by mode.",
        categories: ST.modes.map(String), series: [{ name: "Change vs reference", values: ST.modes.map((m, i) => +((ST.fAlSi[i] / ST.f6061[i] - 1) * 100).toFixed(1)) }],
        decimals: 1, labelUnit: " %", prefixSign: true, unit: "%", yLabel: "Change (%)", yMin: -22, yMax: 28,
      },
    ],
  },
  {
    id: "bird-strike",
    category: "Composites & Impact",
    title: "Composite Wing Leading Edge",
    subtitle: "Bird-strike concept assessment with SPH–FEA",
    period: "2025 – 2026",
    org: "GKN Aerospace / Cranfield University · industry-linked group design project",
    role: "Technical lead",
    tags: ["Abaqus/Explicit", "SPH–FEA", "Johnson–Cook", "Hashin damage", "CFRP / GFRP / Kevlar", "Nomex & Al honeycomb", "Test correlation"],
    metrics: [
      { value: "JMMP 2026", label: "published open access, J. Manuf. Mater. Process. 10(9), 343" },
      { value: "32", label: "production simulations: 16 configurations at 90 and 180 m/s" },
      { value: "90 / 180 m/s", label: "1.8 kg SPH bird, NACA 23015 leading edge" },
      { value: "1.94 kJ/kg", label: "highest internal energy per unit mass, GFRP skins on aluminium core" },
    ],
    links: [
      { label: "Published paper · Journal of Manufacturing and Materials Processing 2026, 10(9), 343 (open access)", href: "https://doi.org/10.3390/jmmp10090343" },
    ],
    summary:
      "Bird strike is a certification-critical event for wing leading edges. I led the numerical side of a GKN-linked group project that ranked monolithic AA2024-T3, CFRP, GFRP and Kevlar/epoxy skins and six sandwich configurations with Nomex and aluminium honeycomb cores under the same 1.8 kg SPH bird at 90 and 180 m/s, in Abaqus/Explicit, and validated the modelling approach against published tests and specimens we manufactured and impact-tested ourselves.",
    highlights: [
      "Published as Lalehparvar, Nuttall, Bavaria, Massó Etxeberria, Dwivedi, Ghasemnejad, Coladas Mato and van de Waerdt (2026), Comparative SPH–Finite Element Assessment of Aerospace Material Systems Under Bird-Strike Loading, Journal of Manufacturing and Materials Processing 10(9), 343, with GKN Aerospace and Fokker co-authors.",
      "Ranked five concept families, CFRP, GFRP, Kevlar/epoxy, honeycomb sandwich and metallic, under common loading using Abaqus/Explicit SPH–FEA at 90 and 180 m/s on deformation, peak force, stress distribution and energy absorption.",
      "Validated the models against published data and against specimens the team manufactured and tested, working closely with teammates to reconcile simulation and test results until the whole group could trust the conclusions.",
      "Converted the analysis into design recommendations, weighing laminate behaviour and manufacturability alongside impact performance.",
    ],
    steps: [
      { title: "Geometry", image: "assets/bird-strike/t01_le_geometry.jpg", imageCaption: "Leading-edge surface generated from the NACA 23015 profile: 900 mm span, 600 mm depth, 535 mm height, 5 mm skin (thesis Fig. 3.2).", body: "500 × 500 mm flat panels for screening and validation, then the forward 600 mm of a NACA 23015 section over a 900 mm span, 535 mm high, with 5 mm skins. Same profile as the A320 family, so the curvature and load paths are representative." },
      { title: "Bird model", image: "assets/bird-strike/t04_bird_capsule.jpg", imageCaption: "Hemispherical-ended capsule SPH bird, 226 × 113 mm, 1.8 kg (Fig. 3.6).", body: "1.8 kg capsule-shaped SPH bird with a Mie–Grüneisen equation of state (ρ₀ = 950 kg/m³, c₀ = 1482.96 m/s, s = 2, Γ₀ = 0), 41,052 particles converted from C3D8R elements, fired at 90 and 180 m/s." },
      { title: "Materials", image: "assets/bird-strike/t03_honeycomb_workflow.jpg", imageCaption: "Honeycomb-core modelling workflow: flat sheet wrapped to the leading-edge curvature (Fig. 3.4).", body: "Johnson–Cook plasticity for AA2024-T3; Hashin progressive damage for T700/M21 CFRP, GFRP and Kevlar/epoxy laminates; Nomex and AL5052 honeycomb cores as orthotropic shells wrapped to the leading-edge curvature." },
      { title: "Validation", image: "assets/bird-strike/t09_al_force_validation.jpg", imageCaption: "Aluminium flat-panel force history against the Liu et al. experiment and simulation (Fig. 4.1).", body: "Aluminium flat-panel force–time and deformation–time histories checked against the Liu et al. experiment and simulation; CFRP/Nomex sandwich checked against Zheng et al.; manufactured CFRP, Nomex-core and aluminium-core specimens tested on the drop tower and compared with the same models." },
      { title: "Simulation matrix", image: "assets/bird-strike/t07_meshed_le_bird.jpg", imageCaption: "Meshed leading edge with the SPH bird at the impact location (Fig. 3.10).", body: "Six flat-panel and ten leading-edge configurations, each at 90 and 180 m/s: 32 production runs on a 2.5 mm mesh chosen from a 20 → 2.5 mm sensitivity study (201,799 nodes on the leading edge)." },
      { title: "Findings", image: "assets/bird-strike/t23_gfrp_nomex_180.jpg", imageCaption: "GFRP/Nomex sandwich leading edge at 180 m/s: von Mises in the outer skin and with the skin hidden (Fig. 6.10).", body: "Stiffness controls deformation but not force: CFRP deformed least, GFRP deformed most and absorbed the most energy, Kevlar sat between. Nomex cores lowered peak force slightly; aluminium cores stored more energy per unit mass. No single material won every metric, and every selected thickness kept its structural integrity at both speeds." },
      { title: "Coordination", body: "Task allocation, deadline tracking, integration of teammates' analysis and test inputs, and presentation of recommendations at project reviews." },
    ],
    cover: "assets/bird-strike/cover.jpg",
    hero: "assets/bird-strike/hero.jpg",
    videos: [
      { src: "assets/bird-strike/video/le_iso_gfrp.mp4", poster: "assets/bird-strike/video/le_iso_gfrp.jpg", title: "GFRP leading edge, 180 m/s", caption: "Isometric view with the stress contour: GFRP deforms most and absorbs most (final presentation, slide 39)." },
      { src: "assets/bird-strike/video/le_iso_al.mp4", poster: "assets/bird-strike/video/le_iso_al.jpg", title: "AA2024-T3 leading edge, 180 m/s", caption: "The aluminium skin takes a short, high force peak with the smallest deformation (slide 39)." },
      { src: "assets/bird-strike/video/le_iso_cfrp.mp4", poster: "assets/bird-strike/video/le_iso_cfrp.jpg", title: "CFRP leading edge, 180 m/s", caption: "CFRP T700/M21: stiffest response, least deformation (slide 39)." },
      { src: "assets/bird-strike/video/le_iso_kevlar.mp4", poster: "assets/bird-strike/video/le_iso_kevlar.jpg", title: "Kevlar/epoxy leading edge, 180 m/s", caption: "Kevlar sits between CFRP and GFRP on both force and deformation (slide 39)." },
      { src: "assets/bird-strike/video/le_iso_cfrp_al.mp4", poster: "assets/bird-strike/video/le_iso_cfrp_al.jpg", title: "CFRP skins on aluminium core, 180 m/s", caption: "Sandwich leading edge with the AL5052 honeycomb core (slide 43)." },
      { src: "assets/bird-strike/video/le_iso_cfrp_nomex.mp4", poster: "assets/bird-strike/video/le_iso_cfrp_nomex.jpg", title: "CFRP skins on Nomex core, 180 m/s", caption: "Sandwich leading edge with the Nomex honeycomb core (slide 43)." },
      { src: "assets/bird-strike/video/test_nomex.mp4", poster: "assets/bird-strike/video/test_nomex.jpg", title: "Drop-weight test, CFRP/Nomex sandwich", caption: "Cranfield Impact Centre drop tower: the flat 160 mm impactor on the Nomex-core sandwich specimen (slide 24)." },
      { src: "assets/bird-strike/video/test_al_core.mp4", poster: "assets/bird-strike/video/test_al_core.jpg", title: "Drop-weight test, CFRP/aluminium sandwich", caption: "Flat impactor on the aluminium-core sandwich specimen (slide 24)." },
      { src: "assets/bird-strike/video/flat_al.mp4", poster: "assets/bird-strike/video/flat_al.jpg", title: "Flat panel, AA2024-T3, 180 m/s", caption: "Top view of the 500 mm panel with the deformation contour (slide 30)." },
      { src: "assets/bird-strike/video/flat_cfrp.mp4", poster: "assets/bird-strike/video/flat_cfrp.jpg", title: "Flat panel, CFRP, 180 m/s", caption: "Top view of the CFRP panel (slide 30)." },
      { src: "assets/bird-strike/video/flat_gfrp.mp4", poster: "assets/bird-strike/video/flat_gfrp.jpg", title: "Flat panel, GFRP, 180 m/s", caption: "Top view of the GFRP panel (slide 30)." },
      { src: "assets/bird-strike/video/flat_kevlar.mp4", poster: "assets/bird-strike/video/flat_kevlar.jpg", title: "Flat panel, Kevlar/epoxy, 180 m/s", caption: "Top view of the Kevlar panel (slide 30)." },
      { src: "assets/bird-strike/video/flat_cfrp_sandwich.mp4", poster: "assets/bird-strike/video/flat_cfrp_sandwich.jpg", title: "CFRP sandwich flat panel, 180 m/s", caption: "Sandwich panel: core crushing spreads the load (slide 31)." },
      { src: "assets/bird-strike/video/nomex_validation.mp4", poster: "assets/bird-strike/video/nomex_validation.jpg", title: "Nomex-core validation panel", caption: "Low-energy impact on the CFRP/Nomex panel used for the literature validation (slide 19)." },
    ],
    images: [
      { src: "assets/bird-strike/t01_le_geometry.jpg", caption: "Three-dimensional leading-edge surface generated from the NACA 23015 profile: 900 mm span, 600 mm depth, 535 mm height, 5 mm skin (thesis Fig. 3.2)." },
      { src: "assets/bird-strike/d57_naca.jpg", caption: "Why NACA 23015: the A320-representative aerofoil and its chord data (final presentation)." },
      { src: "assets/bird-strike/t02_honeycomb_cores.jpg", caption: "Nomex and aluminium honeycomb cores used for the sandwich configurations (Fig. 3.3)." },
      { src: "assets/bird-strike/t03_honeycomb_workflow.jpg", caption: "Honeycomb-core modelling workflow: flat sheet and the core wrapped to the leading-edge curvature (Fig. 3.4)." },
      { src: "assets/bird-strike/t04_bird_capsule.jpg", caption: "Hemispherical capsule SPH bird geometry used for the soft-body impactor (Fig. 3.6)." },
      { src: "assets/bird-strike/t05_bird_dimensions.jpg", caption: "Principal dimensions of the 1.8 kg capsule bird: 226 mm long, 113 mm diameter (Fig. 3.7)." },
      { src: "assets/bird-strike/t06_mesh_sensitivity.jpg", caption: "Leading-edge mesh sensitivity: force histories for 1, 2.5, 5 and 10 mm elements (Fig. 3.9)." },
      { src: "assets/bird-strike/t07_meshed_le_bird.jpg", caption: "Meshed leading edge with the SPH bird positioned at the impact location (Fig. 3.10)." },
      { src: "assets/bird-strike/t08_boundary_conditions.jpg", caption: "Boundary conditions: flat-panel clamping and leading-edge support (Fig. 3.11)." },
      { src: "assets/bird-strike/d28_simulation_plan.jpg", caption: "Simulation plan from the final presentation: flat-panel configurations at 90 and 180 m/s." },
      { src: "assets/bird-strike/t09_al_force_validation.jpg", caption: "Aluminium force–time validation against the Liu et al. flat-panel bird-strike data (Fig. 4.1)." },
      { src: "assets/bird-strike/t10_al_disp_validation.jpg", caption: "Aluminium displacement–time validation against Liu et al. (Fig. 4.2)." },
      { src: "assets/bird-strike/t11_nomex_validation.jpg", caption: "CFRP/Nomex sandwich force–time validation against the Zheng et al. low-energy impact data (Fig. 4.3)." },
      { src: "assets/bird-strike/d21_manufacturing.jpg", caption: "Manufacturing route: laminate trimming and lay-up, debulking, autoclave preparation, cure, finished sample, waterjet cutting (final presentation)." },
      { src: "assets/bird-strike/t13_manufacturing.jpg", photo: true, caption: "Specimens prepared for cure and a vacuum-bagged panel inside the autoclave (Fig. 4.5)." },
      { src: "assets/bird-strike/t12_thickness_measure.jpg", photo: true, caption: "Measured sandwich specimen thickness after manufacture (Fig. 4.4)." },
      { src: "assets/bird-strike/d22_testing_impactors.jpg", caption: "Drop-weight impactors and bases: 25 mm hemispherical impactor for monolithic panels, 160 mm flat impactor for sandwich panels (final presentation)." },
      { src: "assets/bird-strike/t14_mono_fixture.jpg", photo: true, caption: "Monolithic specimen in the drop-weight fixture with the hemispherical impactor above the window support (Fig. 4.6)." },
      { src: "assets/bird-strike/t16_sandwich_fixture.jpg", photo: true, caption: "Sandwich specimen in the drop-weight fixture with the flat impactor above the panel (Fig. 4.8)." },
      { src: "assets/bird-strike/t17_test_setups.jpg", photo: true, caption: "Representative drop-weight setups: monolithic CFRP, Nomex sandwich and aluminium sandwich (Fig. 4.10)." },
      { src: "assets/bird-strike/t18_cfrp_exp_num_force.jpg", caption: "Averaged experimental and numerical force for the monolithic CFRP specimen (Fig. 4.14)." },
      { src: "assets/bird-strike/t19_nomex_exp_num.jpg", caption: "Averaged experimental and numerical response for the Nomex sandwich specimen (Fig. 4.18)." },
      { src: "assets/bird-strike/t20_al_sandwich_exp_num.jpg", caption: "Averaged experimental and numerical response for the aluminium sandwich specimen (Fig. 4.21)." },
      { src: "assets/bird-strike/t21_flat_contour_table.jpg", caption: "Maximum and final deformation of the flat-panel configurations (Table 5.1)." },
      { src: "assets/bird-strike/d30_flat_panel_180.jpg", caption: "Flat panels at 180 m/s in the final presentation: aluminium, GFRP, CFRP and Kevlar." },
      { src: "assets/bird-strike/d39_le_simulation.jpg", caption: "Leading-edge simulations at 180 m/s: aluminium, CFRP, GFRP and Kevlar (final presentation)." },
      { src: "assets/bird-strike/t24_le_contour_table.jpg", caption: "Initial and final deformation of the leading-edge configurations (Table 6.1)." },
      { src: "assets/bird-strike/t22_gfrp_nomex_90.jpg", caption: "GFRP/Nomex sandwich leading edge at 90 m/s: von Mises in the outer skin and with the skin hidden (Fig. 6.9)." },
      { src: "assets/bird-strike/t23_gfrp_nomex_180.jpg", caption: "GFRP/Nomex sandwich leading edge at 180 m/s: von Mises in the outer skin and with the skin hidden (Fig. 6.10)." },
      { src: "assets/bird-strike/d43_sandwich_iso.jpg", caption: "Monolithic versus sandwich leading edges, isometric (final presentation)." },
      { src: "assets/bird-strike/t25_sea.jpg", caption: "Specific energy absorption of the leading-edge structures at 90 and 180 m/s (Fig. 6.13)." },
      { src: "assets/bird-strike/t26_penetration.jpg", caption: "Penetration as a percentage of wing depth at 90 and 180 m/s (Fig. 6.14)." },
      { src: "assets/bird-strike/d24_testing.jpg", caption: "Drop-weight testing at the Cranfield Impact Centre: monolithic, Nomex-core and aluminium-core samples (final presentation)." },
    ],
    compare: [
      { title: "AA2024-T3", before: "assets/bird-strike/cmp_al_initial.jpg", after: "assets/bird-strike/cmp_al_final.jpg", beforeLabel: "initial deformation", afterLabel: "final deformation" },
      { title: "CFRP", before: "assets/bird-strike/cmp_cfrp_initial.jpg", after: "assets/bird-strike/cmp_cfrp_final.jpg", beforeLabel: "initial deformation", afterLabel: "final deformation" },
      { title: "GFRP", before: "assets/bird-strike/cmp_gfrp_initial.jpg", after: "assets/bird-strike/cmp_gfrp_final.jpg", beforeLabel: "initial deformation", afterLabel: "final deformation" },
      { title: "Kevlar/epoxy", before: "assets/bird-strike/cmp_kevlar_initial.jpg", after: "assets/bird-strike/cmp_kevlar_final.jpg", beforeLabel: "initial deformation", afterLabel: "final deformation" },
      { title: "CFRP / aluminium core", before: "assets/bird-strike/cmp_cfrp_al_initial.jpg", after: "assets/bird-strike/cmp_cfrp_al_final.jpg", beforeLabel: "initial deformation", afterLabel: "final deformation" },
      { title: "CFRP / Nomex core", before: "assets/bird-strike/cmp_cfrp_nomex_initial.jpg", after: "assets/bird-strike/cmp_cfrp_nomex_final.jpg", beforeLabel: "initial deformation", afterLabel: "final deformation" },
    ],
    sequences: [
      { title: "GFRP leading edge at 180 m/s, frame by frame", caption: "Twelve frames from the final-presentation animation (slide 39). Drag the scrubber or press play.", frames: [
        "assets/bird-strike/seq/gfrp_le_01.jpg", "assets/bird-strike/seq/gfrp_le_02.jpg", "assets/bird-strike/seq/gfrp_le_03.jpg", "assets/bird-strike/seq/gfrp_le_04.jpg",
        "assets/bird-strike/seq/gfrp_le_05.jpg", "assets/bird-strike/seq/gfrp_le_06.jpg", "assets/bird-strike/seq/gfrp_le_07.jpg", "assets/bird-strike/seq/gfrp_le_08.jpg",
        "assets/bird-strike/seq/gfrp_le_09.jpg", "assets/bird-strike/seq/gfrp_le_10.jpg", "assets/bird-strike/seq/gfrp_le_11.jpg", "assets/bird-strike/seq/gfrp_le_12.jpg" ] },
    ],
    charts: [
      {
        type: "lines", title: "Contact force histories", subtitle: "Hover to read the four materials at any instant. Digitised from the report figures.",
        curves: { "Flat panel, 90 m/s": "flat90", "Flat panel, 180 m/s": "flat180", "Leading edge, 90 m/s": "le90f", "Leading edge, 180 m/s": "le180f" },
        xLabel: "Time (ms)", yLabel: "Force (kN)", decimals: 1, xTickDecimals: 1, yMin: 0,
        note: "Flat panels show the classic double peak; on the curved leading edge aluminium and CFRP carry the largest short-duration peaks while GFRP spreads the load over a longer time.",
      },
      {
        type: "lines", title: "Leading-edge deformation histories", subtitle: "Monolithic skins: the deformation ranking is the inverse of stiffness.",
        curves: { "90 m/s": "le90d", "180 m/s": "le180d" },
        xLabel: "Time (ms)", yLabel: "Deformation (mm)", decimals: 1, xTickDecimals: 1, yMin: 0,
      },
      {
        type: "bars", title: "Peak contact force by concept", subtitle: "Leading edge, monolithic skins and sandwich configurations.",
        datasets: {
          "90 m/s": { categories: ["AA2024-T3", "CFRP", "Kevlar", "GFRP", "CFRP/Al", "CFRP/Nomex", "Kevlar/Al", "Kevlar/Nomex", "GFRP/Al", "GFRP/Nomex"], series: [{ name: "Peak force (kN)", values: [54, 50, 47, 41, 49, 51, 45, 46, 34, 32] }] },
          "180 m/s": { categories: ["AA2024-T3", "CFRP", "Kevlar", "GFRP", "CFRP/Al", "CFRP/Nomex", "Kevlar/Al", "Kevlar/Nomex", "GFRP/Al", "GFRP/Nomex"], series: [{ name: "Peak force (kN)", values: [204, 205, 190, 165, 197, 188, 171, 166, 125, 120] }] },
        },
        decimals: 0, unit: "kN", yLabel: "Peak force (kN)",
        note: "Approximate peaks read from the force histories. Nomex cores lower the peak slightly for the same skin.",
      },
      {
        type: "bars", title: "Maximum deformation by concept", subtitle: "Leading edge. GFRP deforms most and absorbs most; CFRP deforms least.",
        datasets: {
          "90 m/s": { categories: ["AA2024-T3", "CFRP", "Kevlar", "GFRP", "CFRP/Al", "CFRP/Nomex", "Kevlar/Al", "Kevlar/Nomex", "GFRP/Al", "GFRP/Nomex"], series: [{ name: "Max deformation (mm)", values: [10, 30, 45, 90, 70, 80, 96, 108, 168, 205] }] },
          "180 m/s": { categories: ["AA2024-T3", "CFRP", "Kevlar", "GFRP", "CFRP/Al", "CFRP/Nomex", "Kevlar/Al", "Kevlar/Nomex", "GFRP/Al", "GFRP/Nomex"], series: [{ name: "Max deformation (mm)", values: [66, 60, 89, 175, 106, 106, 139, 142, 259, 282] }] },
        },
        decimals: 0, unit: "mm", yLabel: "Deformation (mm)",
      },
      {
        type: "bars", title: "Internal energy per unit structural mass", subtitle: "Reported maximum internal energy divided by structural mass, a screening indicator rather than measured absorbed energy. Aluminium cores score higher than Nomex for the same skin.",
        datasets: {
          "90 m/s": { categories: ["AA2024-T3", "CFRP", "Kevlar", "GFRP", "CFRP/Al", "CFRP/Nomex", "Kevlar/Al", "Kevlar/Nomex", "GFRP/Al", "GFRP/Nomex"], series: [{ name: "SEA (kJ/kg)", values: [0.07, 0.09, 0.15, 0.32, 0.15, 0.15, 0.35, 0.19, 0.39, 0.33] }] },
          "180 m/s": { categories: ["AA2024-T3", "CFRP", "Kevlar", "GFRP", "CFRP/Al", "CFRP/Nomex", "Kevlar/Al", "Kevlar/Nomex", "GFRP/Al", "GFRP/Nomex"], series: [{ name: "SEA (kJ/kg)", values: [0.57, 0.57, 0.79, 1.76, 0.67, 0.59, 1.60, 0.91, 1.94, 1.33] }] },
        },
        catSub: ["12.56 kg", "7.23 kg", "7.45 kg", "6.44 kg", "10.46 kg", "10.41 kg", "8.78 kg", "8.73 kg", "9.06 kg", "9.01 kg"],
        decimals: 2, unit: "kJ/kg", yLabel: "SEA (kJ/kg)",
      },
    ],
  },
  {
    id: "gearbox",
    category: "Design & CAD",
    title: "Modular Multi-Ratio Gearbox",
    subtitle: "Concept to working prototype",
    period: "Dec 2022 – May 2024",
    org: "Engineering Design Intern · La Fondation Dassault Systèmes ConnectNext Industry Internship Programme 2022–23 / Dassault Systèmes, Pune",
    role: "18-month industry placement",
    tags: ["CATIA V5", "3DEXPERIENCE", "Abaqus", "Hand calculation", "Prototyping", "Design review"],
    metrics: [
      { value: "18 mo", label: "industry placement" },
      { value: "Prototype", label: "built and working" },
    ],
    summary:
      "Took a modular multi-ratio gearbox from concept to a working prototype inside a Dassault Systèmes engineering environment, iterating against load transfer, packaging and manufacturability constraints under a structured review cadence.",
    highlights: [
      "Combined CATIA V5 / 3DEXPERIENCE modelling, hand calculation and Abaqus assessment to carry the design from concept to prototype.",
      "Iterated the design against load transfer, packaging and manufacturability constraints, keeping the technical documentation current with each change.",
      "Worked to a structured review cadence, responding to senior-engineer feedback and managing design changes through to sign-off.",
    ],
    steps: [
      { title: "Concept", image: "assets/gearbox/01_exploded.jpg", imageCaption: "Exploded view: motor, adapter and stackable stage housings.", photo: true, body: "Modular architecture allowing multiple ratios from a common set of parts; packaging and load paths set out by hand calculation first." },
      { title: "Detail design", image: "assets/gearbox/02_section.jpg", imageCaption: "Section through the stacked planetary stages.", photo: true, body: "CATIA V5 / 3DEXPERIENCE part and assembly modelling with Abaqus assessment of the load-carrying members." },
      { title: "Iteration", body: "Design changes managed through a structured review cadence, with documentation kept current at each step through to sign-off." },
      { title: "Prototype", body: "Working prototype built and demonstrated." },
    ],
    cover: "assets/gearbox/cover.jpg",
    videosNote: "A paced walkthrough of the project on the 3DEXPERIENCE platform, from the collaborative space to the prototype photographs.",
    videos: [
      { src: "assets/gearbox/video/gearbox_3dx.mp4", poster: "assets/gearbox/video/gearbox_3dx.jpg", title: "Gearbox project on the 3DEXPERIENCE platform", caption: "A paced cut of the project walkthrough: the collaborative space, task board and design documents (sped up), then the drawing, the 3D model in the platform viewer, the modularity and improvement summaries and the prototype photographs at normal speed. Silent, 69 s." },
    ],
    images: [
      { src: "assets/gearbox/01_exploded.jpg", photo: true, caption: "Exploded view of the modular gearbox: brushed DC motor, motor adapter and stackable hexagonal stage housings that bolt together to build up the ratio." },
      { src: "assets/gearbox/02_section.jpg", photo: true, caption: "Section through the assembled unit: stacked planetary stages, each ring gear and carrier a separate module, so different ratios come from the same set of parts." },
      { src: "assets/gearbox/03_certificate.jpg", caption: "ConnectNext 2022–23 Industry Internship Programme certificate, La Fondation Dassault Systèmes." },
      { src: "assets/gearbox/04_modularity.jpg", caption: "Enhanced modularity: stackable planetary stages give ratios from 3.25 to 100:1 in a smaller, lighter package (still from the project walkthrough)." },
      { src: "assets/gearbox/05_prototype_pictures.jpg", caption: "Prototype parts: machined housings, carriers and gear sets ahead of assembly (still from the project walkthrough)." },
    ],
  },
  {
    id: "lattice",
    category: "Research",
    title: "3D-Printed Diamond Lattice Structures",
    subtitle: "Process parameters, mechanical integrity and nature-inspired ML optimisation",
    period: "2023 – 2024",
    org: "Symbiosis Institute of Technology, Pune · Materials Today Communications 38 (2024) 108233",
    role: "First author; specimen design, manufacture, compression testing, analysis",
    tags: ["FDM / PLA+", "Lattice structures", "Compression testing", "Nature-inspired ML", "Friction stir spot welding", "Publication"],
    metrics: [
      { value: "1st", label: "author, Materials Today Communications (Elsevier)" },
      { value: "3", label: "CRC Press book chapters co-authored, 2024" },
      { value: "5", label: "co-authors, one research group" },
    ],
    summary:
      "Designed, manufactured and compression-tested 3D-printed PLA+ diamond lattice specimens, linking process parameters and cell geometry to mechanical performance, and used nature-inspired machine-learning algorithms to optimise the design. The same group's work on friction-stir spot welding of ABS and on machine-learning classification of FDM print quality became three chapters in a CRC Press book. The lattice in the site header is the same cubic-diamond cell.",
    highlights: [
      "Dwivedi, K., Joshi, S., Nair, R., Sapre, M. S. and Jatti, V. S. (2024). Optimizing 3D printed diamond lattice structure and investigating the influence of process parameters on their mechanical integrity using nature-inspired machine learning algorithms. Materials Today Communications, 38, 108233.",
      "Three co-authored chapters in Sustainable Materials: The Role of Artificial Intelligence and Machine Learning (CRC Press, 2024): JAYA and cohort-intelligence optimisation of friction-stir spot-welded ABS weld strength, and supervised machine-learning classification of dimensional deviation and of surface roughness in FDM-printed samples.",
      "Designed, manufactured and compression-tested the PLA+ diamond lattice specimens, linking process parameters and cell geometry to mechanical performance.",
    ],
    steps: [
      { title: "Specimen design", image: "assets/lattice/fig02.jpg", imageCaption: "Diamond lattice specimen on the Ender printer.", photo: true, body: "Diamond lattice unit cells parameterised by cell geometry, printed in PLA+ across a matrix of process parameters." },
      { title: "Testing", image: "assets/lattice/fig03.jpg", imageCaption: "Specimen between the UTM platens.", photo: true, body: "Compression testing of the printed specimens, linking process parameters and geometry to stiffness and failure behaviour." },
      { title: "Optimisation", image: "assets/lattice/00_graphical_abstract.jpg", imageCaption: "From printing and testing to feature importance and ML prediction.", body: "Nature-inspired machine-learning algorithms used to optimise the lattice against the measured mechanical response." },
      { title: "Publication", body: "First-author paper in Materials Today Communications (Elsevier, vol. 38, March 2024)." },
      { title: "Related chapters", body: "Co-authored chapters 7, 8 and 10 of Sustainable Materials: The Role of Artificial Intelligence and Machine Learning, edited by Akshansh Mishra, Vijaykumar S. Jatti and Shivangi Paliwal, CRC Press, July 2024: friction-stir spot welding of ABS optimised with JAYA and cohort intelligence, and supervised ML classification of dimensional deviation and surface roughness of FDM parts." },
    ],
    links: [
      { label: "Paper · doi:10.1016/j.mtcomm.2024.108233", href: "https://doi.org/10.1016/j.mtcomm.2024.108233" },
      { label: "Chapter 7 · FSSW ABS weld strength, JAYA and cohort intelligence", href: "https://doi.org/10.1201/9781003437369-7" },
      { label: "Chapter 8 · ML classification of FDM dimensional deviation", href: "https://doi.org/10.1201/9781003437369-8" },
      { label: "Chapter 10 · ML classification of FDM surface roughness", href: "https://doi.org/10.1201/9781003437369-10" },
      { label: "All publications on ResearchGate", href: "https://www.researchgate.net/scientific-contributions/Kaustubh-Dwivedi-2272720523" },
    ],
    cover: "assets/lattice/fig02.jpg",
    hero: "assets/lattice/fig02.jpg", heroPos: "50% 88%",
    videos: [],
    images: [
      { src: "assets/lattice/00_graphical_abstract.jpg", caption: "Graphical abstract: diamond lattices printed to ASTM D695, compression-tested, then feature importance, interaction effects and nature-inspired Random Forest and XGBoost models predicting compressive strength and specific energy absorption." },
      { src: "assets/lattice/fig01.jpg", caption: "Workflow: PLA diamond lattices printed across infill density, layer height, cell size and infill pattern; UTM compression; energy absorption, SEA and compressive strength; XGBoost tuned with particle-swarm optimisation." },
      { src: "assets/lattice/fig02.jpg", photo: true, caption: "Diamond lattice specimen being printed on an Ender FDM machine." },
      { src: "assets/lattice/fig03.jpg", photo: true, caption: "Lattice specimen in the universal testing machine before compression." },
      { src: "assets/lattice/fig04.jpg", caption: "Load–deflection curves for the printed lattice families: the plateau and densification behaviour that feed the energy-absorption metrics." },
      { src: "assets/lattice/fig12.jpg", photo: true, caption: "Lattice at the end of the compression test." },
    ],
    sequences: [
      {
        title: "Diamond lattice under compression, eight stages",
        frames: ["assets/lattice/fig05.jpg", "assets/lattice/fig06.jpg", "assets/lattice/fig07.jpg", "assets/lattice/fig08.jpg", "assets/lattice/fig09.jpg", "assets/lattice/fig10.jpg", "assets/lattice/fig11.jpg", "assets/lattice/fig12.jpg"],
        labels: ["Stage 1 · contact", "Stage 2 · elastic", "Stage 3 · first strut bending", "Stage 4 · plateau", "Stage 5 · plateau", "Stage 6 · layer collapse", "Stage 7 · densification", "Stage 8 · end of test"],
        caption: "Photographs from the published paper (Materials Today Communications 38, 108233): the PLA+ diamond lattice compressed between the UTM platens, from first contact to densification.",
      },
    ],
  },
];

// Courses and training. The section only appears when this list has entries.
// provider: platform or institution; topics: short tags; year: completion year; href: optional link to the course or badge.
const COURSES = [
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Analysis of Composite Materials with Abaqus", year: "2025", topics: ["Composites", "Hashin damage", "Delamination"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Composites Modeler for Abaqus/CAE", year: "2025", topics: ["Layup definition", "Ply orientation"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Modeling Fracture and Failure with Abaqus", year: "2025", topics: ["Damage", "Cohesive zones", "XFEM"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Modeling Extreme Deformation and Fluid Flow with Abaqus", year: "2025", topics: ["SPH", "CEL", "Abaqus/Explicit"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Crashworthiness Analysis with Abaqus", year: "2025", topics: ["Impact", "Energy absorption", "Explicit"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "CZone for Abaqus", year: "2025", topics: ["Composite crush", "Crashworthiness"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Buckling, Postbuckling and Collapse Analysis", year: "2025", topics: ["Stability", "Riks", "Imperfections"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Modeling Contact and Resolving Convergence Issues with Abaqus", year: "2025", topics: ["Contact", "Convergence"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Obtaining a Converged Solution with Abaqus", year: "2025", topics: ["Nonlinear analysis", "Solver controls"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Substructures and Submodeling with Abaqus", year: "2025", topics: ["Submodeling", "Verification"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Heat Transfer and Thermal-Stress Analysis with Abaqus", year: "2025", topics: ["Thermal", "Thermal stress"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Abaqus Geometry Import and Meshing", year: "2025", topics: ["Geometry repair", "Meshing"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Introduction to Abaqus Scripting", year: "2025", topics: ["Python", "Automation"] },
  { provider: "Dassault Systèmes SIMULIA · Abaqus training", title: "Advanced Abaqus Scripting", year: "2025", topics: ["Python", "Post-processing", "ODB"] },
  { provider: "Dassault Systèmes EduSpace · CATIA and composites", title: "CATIA V5 Fundamentals", year: "2025", topics: ["CATIA V5"] },
  { provider: "Dassault Systèmes EduSpace · CATIA and composites", title: "CATIA Part Design and Part Design Expert", year: "2025", topics: ["Part design", "Parametric modelling"] },
  { provider: "Dassault Systèmes EduSpace · CATIA and composites", title: "CATIA Surface Design and Surface Design Expert", year: "2025", topics: ["Surface modelling", "Multi-section surfaces"] },
  { provider: "Dassault Systèmes EduSpace · CATIA and composites", title: "Generative Drafting Fundamentals (ISO)", year: "2025", topics: ["Drawings", "ISO drafting"] },
  { provider: "Dassault Systèmes EduSpace · CATIA and composites", title: "Understanding Composite Design", year: "2025", topics: ["Composite design"] },
  { provider: "Dassault Systèmes EduSpace · CATIA and composites", title: "Composites Grid Approach", year: "2025", topics: ["Grid design", "Zones and plies"] },
  { provider: "Dassault Systèmes EduSpace · CATIA and composites", title: "Composites Part Engineering", year: "2025", topics: ["Ply definition", "Stacking"] },
  { provider: "Dassault Systèmes EduSpace · CATIA and composites", title: "Composites Part Manufacturing", year: "2025", topics: ["Manufacturing", "Flattening", "Producibility"] },
];
const COURSES_NOTE = "Official Dassault Systèmes training completed through the EduSpace programme in 2025. Listed here: the courses behind the analysis and CAD work on this site.";

const SKILLS = [
  { title: "Finite element", body: "Abaqus/Standard and /Explicit: shell and solid modelling, geometric and material nonlinearity, contact and tie constraints, SPH impact, mesh sensitivity studies, verification against an independent mesh, simulation–test correlation." },
  { title: "Optimisation & AM", body: "Tosca Structure (bead and shape), ANSYS Additive thermal simulation; DfAM: wall thickness, build orientation, support strategy, process risk." },
  { title: "CAD & release", body: "CATIA V5 and 3DEXPERIENCE: part, assembly and multi-section surface modelling, native solid reconstruction, STEP exchange, geometry validation and design documentation." },
  { title: "Composites", body: "Laminate and sandwich design, stacking sequence definition, specimen manufacture, mechanical and impact testing, damage and delamination modelling." },
  { title: "Standards & method", body: "CS 25.963 and CS 25.561 load definitions; EN 1999-1-3 fatigue curves; nCode; requirements verification matrices and evidence chains." },
  { title: "Programming", body: "Python for post-processing, mesh and field-data handling and figure generation; MATLAB; Excel." },
];

const EDUCATION = [
  {
    degree: "MSc Advanced Lightweight and Composite Structures",
    school: "Cranfield University",
    period: "Sept 2025 – Sept 2026",
    body: "Accredited by RAeS and IMechE for further learning toward CEng registration. Composite structures, finite element methods, structural stability, impact mechanics.",
    note: "Thesis: Slat Track Cans of the Future — Exploring the Design Space of a High Criticality Fuel-Tank Component.",
  },
  {
    degree: "B.Tech Mechanical Engineering",
    school: "Symbiosis Institute of Technology, Pune",
    period: "2020 – 2024",
    body: "CGPA 8.36 / 10.",
    note: "",
  },
];

// Publications. `type` drives the filter chips: "journal" | "chapter".
// `cover` is a portrait journal/book image; set coverKind: "figure" to show a landscape figure with the journal logo instead.
// `abstract` is shown verbatim; `summary` is a paraphrase shown as "In brief" when no abstract is available.
const CRC_BOOK = "Sustainable Materials: The Role of Artificial Intelligence and Machine Learning";
const PUBLICATIONS = [
  {
    id: "jmmp2026", type: "journal", typeLabel: "Journal article", year: 2026, oa: true, first: false,
    title: "Comparative SPH–Finite Element Assessment of Aerospace Material Systems Under Bird-Strike Loading",
    authors: "Mohsen Lalehparvar, Alex Nuttall, Dhruva Bavaria, Felix Massó Etxeberria, Kaustubh Dwivedi, Hessam Ghasemnejad, Pablo Coladas Mato, Wydo van de Waerdt",
    venue: "Journal of Manufacturing and Materials Processing, vol. 10, issue 9, article 343, published 7 September 2026 · MDPI · Cranfield University with GKN Aerospace and Fokker Aerospace",
    venueShort: "J. Manuf. Mater. Process.",
    href: "https://doi.org/10.3390/jmmp10090343", doi: "10.3390/jmmp10090343",
    cover: "assets/pubs/cover_jmmp.jpg",
    project: "bird-strike",
    abstract: "Bird strikes cause aircraft damage, create serious risks to human safety and can contribute to catastrophic incidents, while continuing to impose substantial economic costs on airlines. The impact combines high kinetic energy with discontinuous, strongly nonlinear contact over a short duration, producing large structural deformations; appropriate nonlinear simulation techniques are therefore required to capture this complex interaction. For this purpose, the present study applies established Smoothed Particle Hydrodynamics (SPH)–finite element modelling ingredients to a controlled matrix of aerospace material systems and target geometries. The approach is first benchmarked against a published aluminium flat-plate bird-impact test using a raster-digitised force-history comparison, after which monolithic metallic and composite structures and source-described honeycomb-sandwich alternatives are assessed in flat-panel and curved leading-edge configurations. The results show that contact-force and local-displacement rankings depend strongly on target geometry and response metric, with the curved leading edge changing the ordering observed for the flat panel. More compliant systems generally permit greater local displacement, whereas stiffer systems restrict displacement but can sustain higher short-duration force peaks; consequently, no universal material ranking follows from a single response measure, and the results are most suitable for preliminary design screening.",
    figures: [
      { src: "assets/bird-strike/t01_le_geometry.jpg", caption: "Fig. 2: leading-edge model, the forward 600 mm of a NACA 23015 section (thesis Fig. 3.2)." },
      { src: "assets/bird-strike/t03_honeycomb_workflow.jpg", caption: "Fig. 3: honeycomb geometry wrapped to the leading-edge surface (thesis Fig. 3.4)." },
      { src: "assets/bird-strike/t04_bird_capsule.jpg", caption: "Figs. 4–5: double-hemispherical-cap SPH bird, 226 × 113 mm, 1.8 kg (thesis Fig. 3.6)." },
      { src: "assets/bird-strike/t06_mesh_sensitivity.jpg", caption: "Fig. 6: leading-edge mesh-sensitivity force histories (thesis Fig. 3.9)." },
      { src: "assets/bird-strike/t07_meshed_le_bird.jpg", caption: "Fig. 7: meshed leading edge with the SPH bird at the impact location (thesis Fig. 3.10)." },
      { src: "assets/bird-strike/t09_al_force_validation.jpg", caption: "Fig. 8: aluminium flat-plate benchmark against the Liu et al. experiment and simulation (thesis Fig. 4.1)." },
      { src: "assets/bird-strike/t23_gfrp_nomex_180.jpg", caption: "Fig. 16: GFRP/Nomex leading edge at 180 m/s, von Mises stress in the outer skin and core (thesis Fig. 6.10)." },
      { src: "assets/bird-strike/t22_gfrp_nomex_90.jpg", caption: "Fig. 15: GFRP/Nomex leading edge at 90 m/s, outer skin and core (thesis Fig. 6.9)." },
    ],
    cite: "Lalehparvar, M., Nuttall, A., Bavaria, D., Massó Etxeberria, F., Dwivedi, K., Ghasemnejad, H., Coladas Mato, P., & van de Waerdt, W. (2026). Comparative SPH–finite element assessment of aerospace material systems under bird-strike loading. Journal of Manufacturing and Materials Processing, 10(9), 343. https://doi.org/10.3390/jmmp10090343",
    license: "Open access under CC BY 4.0. Special Issue: External Field-Assisted Welding and Advanced Processing of Lightweight Metallurgical Structures. Figures shown from the project archive; numbering follows the published paper.",
  },
  {
    id: "mtcomm2024", type: "journal", typeLabel: "Journal article", year: 2024, oa: false, first: true,
    title: "Optimizing 3D printed diamond lattice structure and investigating the influence of process parameters on their mechanical integrity using nature-inspired machine learning algorithms",
    authors: "Kaustubh Dwivedi, Shreya Joshi, Rithvik Nair, Mandar S. Sapre, Vijaykumar S. Jatti",
    venue: "Materials Today Communications, vol. 38, article 108233, March 2024 (online 29 January 2024) · Elsevier · Symbiosis Institute of Technology, Pune",
    venueShort: "Materials Today Communications",
    href: "https://doi.org/10.1016/j.mtcomm.2024.108233", doi: "10.1016/j.mtcomm.2024.108233",
    cover: "assets/pubs/cover_mtcomm.jpg",
    project: "lattice",
    summary: "PLA+ diamond lattice specimens were printed on an FDM machine across a matrix of infill density, layer height, cell size and infill pattern, and compression-tested to ASTM D695 to obtain compressive strength, energy absorption and specific energy absorption. Feature-importance and interaction analysis ranked layer height and cell size as the dominant parameters, and nature-inspired Random Forest and XGBoost models tuned with particle-swarm optimisation were trained to predict compressive strength and specific energy absorption from the process settings, with R² used to compare the two.",
    figures: [
      { src: "assets/lattice/00_graphical_abstract.jpg", caption: "Graphical abstract: printing to ASTM D695, compression testing, feature importance and interaction effects, nature-inspired Random Forest and XGBoost prediction." },
      { src: "assets/lattice/fig01.jpg", caption: "Fig. 1: workflow from lattice printing and UTM testing to XGBoost with particle-swarm optimisation." },
      { src: "assets/lattice/fig02.jpg", photo: true, caption: "Fig. 2: diamond lattice specimen on the Ender FDM printer." },
      { src: "assets/lattice/fig03.jpg", photo: true, caption: "Fig. 3: specimen between the UTM platens before compression." },
      { src: "assets/lattice/fig04.jpg", caption: "Fig. 4: load–deflection curves for the printed lattice families." },
      { src: "assets/lattice/fig08.jpg", caption: "Figs. 5–12: compression progression; the full sequence is on the project page." },
    ],
    cite: "Dwivedi, K., Joshi, S., Nair, R., Sapre, M. S., & Jatti, V. S. (2024). Optimizing 3D printed diamond lattice structure and investigating the influence of process parameters on their mechanical integrity using nature-inspired machine learning algorithms. Materials Today Communications, 38, 108233. https://doi.org/10.1016/j.mtcomm.2024.108233",
    license: "© 2024 Elsevier Ltd. Figures reproduced from the authors' own article for portfolio use.",
  },
  {
    id: "crc-ch7", type: "chapter", typeLabel: "Book chapter", year: 2024, first: false,
    title: "Optimizing Friction Stir Spot Welded ABS Weld Strength Using JAYA and Cohort Intelligence Algorithm",
    authors: "Rithvik Nair, Shreya Joshi, Kaustubh Dwivedi, Mandar S. Sapre, Ashwini V. Jatti",
    venue: `Chapter 7, pp. 99–120, in ${CRC_BOOK}, eds. Akshansh Mishra, Vijaykumar S. Jatti and Shivangi Paliwal · CRC Press, July 2024`,
    venueShort: "Sustainable Materials · CRC Press",
    href: "https://doi.org/10.1201/9781003437369-7", doi: "10.1201/9781003437369-7",
    cover: "assets/pubs/cover_crc.jpg",
    summary: "Friction-stir spot welding of ABS thermoplastic, with the weld-strength response optimised using two parameter-free metaheuristics, the JAYA algorithm and cohort intelligence.",
    cite: `Nair, R., Joshi, S., Dwivedi, K., Sapre, M. S., & Jatti, A. V. (2024). Optimizing friction stir spot welded ABS weld strength using JAYA and cohort intelligence algorithm. In A. Mishra, V. S. Jatti, & S. Paliwal (Eds.), ${CRC_BOOK} (pp. 99–120). CRC Press. https://doi.org/10.1201/9781003437369-7`,
  },
  {
    id: "crc-ch8", type: "chapter", typeLabel: "Book chapter", year: 2024, first: false,
    title: "Supervised Machine Learning Based Classification of Dimensional Deviation of FDM 3D Printed Samples",
    authors: "Shreya Joshi, Rithvik Nair, Kaustubh Dwivedi, Bhargav Gadhiya, Mandar S. Sapre, Ashwini V. Jatti",
    venue: `Chapter 8, pp. 121–144, in ${CRC_BOOK} · CRC Press, July 2024`,
    venueShort: "Sustainable Materials · CRC Press",
    href: "https://doi.org/10.1201/9781003437369-8", doi: "10.1201/9781003437369-8",
    cover: "assets/pubs/cover_crc.jpg",
    summary: "Supervised machine-learning classifiers trained to predict the dimensional deviation class of fused-deposition-modelling parts from their printing parameters.",
    cite: `Joshi, S., Nair, R., Dwivedi, K., Gadhiya, B., Sapre, M. S., & Jatti, A. V. (2024). Supervised machine learning based classification of dimensional deviation of FDM 3D printed samples. In A. Mishra, V. S. Jatti, & S. Paliwal (Eds.), ${CRC_BOOK} (pp. 121–144). CRC Press. https://doi.org/10.1201/9781003437369-8`,
  },
  {
    id: "crc-ch10", type: "chapter", typeLabel: "Book chapter", year: 2024, first: false,
    title: "Supervised Machine Learning Based Classification of Surface Roughness of Fused Deposition Modeling 3D Printed Samples",
    authors: "Rithvik Nair, Shreya Joshi, Kaustubh Dwivedi, Bhargav Gadhiya, Mandar S. Sapre, Ashwini V. Jatti",
    venue: `Chapter 10, pp. 161–190, in ${CRC_BOOK} · CRC Press, July 2024`,
    venueShort: "Sustainable Materials · CRC Press",
    href: "https://doi.org/10.1201/9781003437369-10", doi: "10.1201/9781003437369-10",
    cover: "assets/pubs/cover_crc.jpg",
    summary: "Supervised machine-learning classifiers trained to predict the surface-roughness class of fused-deposition-modelling parts from their printing parameters.",
    cite: `Nair, R., Joshi, S., Dwivedi, K., Gadhiya, B., Sapre, M. S., & Jatti, A. V. (2024). Supervised machine learning based classification of surface roughness of fused deposition modeling 3D printed samples. In A. Mishra, V. S. Jatti, & S. Paliwal (Eds.), ${CRC_BOOK} (pp. 161–190). CRC Press. https://doi.org/10.1201/9781003437369-10`,
  },
];

const MEMBERSHIPS = [
  "UK Graduate Route eligible on MSc completion. Open to UK relocation, hybrid working and travel to client or manufacturing sites.",
];

// About block and timeline. `photo` is a 4:5 portrait; facts are [label, value] pairs.
const ABOUT = {
  title: "An engineer who shows the evidence.",
  photo: "assets/portrait.jpg",
  lead:
    "I am an aerospace structures engineer finishing my MSc at Cranfield University. I do not treat CAD, simulation and testing as separate tasks: a design is not finished for me until the model, the manufacturing constraints and the test evidence agree, and I say plainly when they do not. I am the person on a team who wants to understand why something works before trusting it, who keeps the plan and the documentation straight so others can pick up my work, and who takes feedback from more experienced engineers as the fastest way to get better. I have coordinated the technical work of a student team, worked to an industrial review cadence and published with co-authors, and what I want next is a UK structures, design or analysis role where I can learn from experienced engineers and be useful from the first week.",
  facts: [
    ["Based", "Cranfield, UK"],
    ["Status", "MSc Advanced Lightweight and Composite Structures, completing Sept 2026"],
    ["Looking for", "UK aerospace structures, design and analysis roles"],
    ["Working style", "Stated load basis, independent verification, clear close-out"],
  ],
  timeline: [
    { year: "2020", title: "B.Tech Mechanical Engineering begins", org: "Symbiosis Institute of Technology, Pune" },
    { year: "Dec 2022", title: "Engineering Design Intern, 18-month placement", org: "La Fondation Dassault Systèmes / Dassault Systèmes, Pune" },
    { year: "2024", title: "First-author paper and three CRC Press chapters; B.Tech completed", org: "Materials Today Communications; CRC Press" },
    { year: "Sept 2025", title: "MSc Advanced Lightweight and Composite Structures", org: "Cranfield University" },
    { year: "2025–26", title: "Two projects with GKN Aerospace", org: "A320 slat-track can LPBF redesign; composite leading-edge bird strike" },
    { year: "Sept 2026", title: "Bird-strike work published in JMMP; MSc completes", org: "Open to UK roles" },
  ],
};

// Tools matrix. `level`: Advanced | Working | Familiar. `used` entries are project ids ({id,label}) or plain strings.
const TOOLS = [
  { name: "Abaqus/Standard and /Explicit", level: "Advanced", note: "Static, modal and fatigue-input runs on the slat-track can; SPH–FEA soft-body impact for the leading-edge study; contact, tie constraints and nonlinear materials.", used: [{ id: "slat-track", label: "Slat-track can" }, { id: "bird-strike", label: "Bird strike" }, { id: "gearbox", label: "Gearbox" }] },
  { name: "CATIA V5", level: "Advanced", note: "Native solid reconstruction of the released can geometry, multi-section surfaces and STEP exchange; concept-to-prototype gearbox modelling.", used: [{ id: "slat-track", label: "Slat-track can" }, { id: "gearbox", label: "Gearbox" }] },
  { name: "3DEXPERIENCE", level: "Working", note: "Platform modelling and design documentation during the Dassault Systèmes placement; EduSpace training on the composites and structural apps.", used: [{ id: "gearbox", label: "Gearbox" }, "EduSpace courses"] },
  { name: "Tosca Structure", level: "Working", note: "Bead and shape guidance for where the can wall should carry material; the load-path result seeded the variable-wall method.", used: [{ id: "slat-track", label: "Slat-track can" }] },
  { name: "nCode DesignLife", level: "Working", note: "EN 1999-1-3 weld-fatigue screening of the existing welded can, cross-checked by an independent shell tangent-stress route.", used: [{ id: "slat-track", label: "Slat-track can" }] },
  { name: "ANSYS Additive", level: "Working", note: "LPBF thermal simulation locating the sustained hotspot at the root and collar band, with a control run on the existing welded geometry.", used: [{ id: "slat-track", label: "Slat-track can" }] },
  { name: "Python", level: "Working", note: "Post-processing of Abaqus field and history output, mesh handling and figure generation; nature-inspired optimisation and ML for the lattice paper.", used: [{ id: "slat-track", label: "Slat-track can" }, { id: "bird-strike", label: "Bird strike" }, { id: "lattice", label: "Lattice" }] },
  { name: "Materialise Magics", level: "Familiar", note: "Support strategy and build-orientation review for the LPBF candidate.", used: [{ id: "slat-track", label: "Slat-track can" }] },
  { name: "MATLAB and Excel", level: "Familiar", note: "Hand-calculation checks, data reduction and verification matrices.", used: ["Coursework", "Project checks"] },
];

// Awards and recognitions. `image` opens in the lightbox.
const AWARDS = [
  { title: "ConnectNext Industry Internship Programme 2022–23", org: "La Fondation Dassault Systèmes", year: "2024", image: "assets/gearbox/03_certificate.jpg", note: "Certificate awarded on completing the 18-month engineering design placement in Pune." },
  { title: "Royal Aeronautical Society, Student Affiliate", org: "RAeS", year: "Nov 2025", note: "The MSc is accredited by RAeS and IMechE for further learning toward CEng registration." },
];

// Presentations and posters. `slides` open in the lightbox in order; `total` is the full deck length.
const PRESENTATIONS = [
  {
    id: "irp-final", type: "Final presentation",
    title: "Slat Track Can of the Future",
    event: "MSc Individual Research Project viva, Cranfield University, with GKN Aerospace", date: "Aug 2026",
    cover: "assets/decks/irp/s01.jpg", total: 60,
    note: "Sixteen of the sixty slides: the component and why AM, the load basis and FEA setup, the material trade-space, how the HT-23 and AlSi10Mg walls were shaped, and the closing numbers.",
    slides: [
      { src: "assets/decks/irp/s01.jpg", caption: "Title slide, with the Cranfield and GKN Aerospace supervisory team." },
      { src: "assets/decks/irp/s02.jpg", caption: "Where the slat-track can sits: a protective enclosure inside the fuel tank around the slat track, with stiffness, clearance and interface requirements." },
      { src: "assets/decks/irp/s03.jpg", caption: "Why additive manufacturing: the welded 6061-T6 assembly carries joining complexity, weld distortion risk and tooling dependency; a monolithic AM can removes them." },
      { src: "assets/decks/irp/s11.jpg", caption: "Project framework: industrial context, aim and selection basis, the four AM material routes and the three investigation workstreams." },
      { src: "assets/decks/irp/s18.jpg", caption: "Software chain: CATIA for geometry, Abaqus for static and modal response, Tosca for load-path guidance, then ANSYS Additive, Materialise Magics and nCode DesignLife for manufacturing and fatigue checks." },
      { src: "assets/decks/irp/s23.jpg", caption: "Candidate material trade-space: the 6061-T6 baseline against PA2241 FR, ALM HT-23, ULTEM 9085 and AlSi10Mg." },
      { src: "assets/decks/irp/s24.jpg", caption: "The five load cases: fuel hydrostatic, ZTOP top-down, cap and ice crush, root support load and lateral oscillatory pressure." },
      { src: "assets/decks/irp/s25.jpg", caption: "Abaqus setup: mesh, the pressure basis P = K·ρ·g·L and a fully fixed lower attachment." },
      { src: "assets/decks/irp/s26.jpg", caption: "6061-T6 baseline under ZTOP: 0.639 mm peak displacement and 65.1 MPa von Mises." },
      { src: "assets/decks/irp/s28.jpg", caption: "Weld-fatigue screening of the baseline to EN 1999-1-3 detail category 50-4.3, clear of the repeat target by both the solid-weld and shell tangent-stress routes." },
      { src: "assets/decks/irp/s32.jpg", caption: "HT-23 geometry development: from a uniform wall through the Tosca load path and the high-stress band to the mass-reduced candidate." },
      { src: "assets/decks/irp/s36.jpg", caption: "The root sleeve delivered almost all of the stiffness improvement; gussets and flutes added only fractions of a percent." },
      { src: "assets/decks/irp/s42.jpg", caption: "Five-material static comparison: maximum displacement and strength utilisation for 6061-T6, PA2241 FR, HT-23, ULTEM 9085 and AlSi10Mg." },
      { src: "assets/decks/irp/s43.jpg", caption: "Response-guided wall refinement improved all five load cases at the same 1.45 kg mass and the same mesh." },
      { src: "assets/decks/irp/s45.jpg", caption: "First three fixed-base mode shapes for 6061-T6, HT-23 and AlSi10Mg." },
      { src: "assets/decks/irp/s52.jpg", caption: "Conclusion: 20.6 % mass reduction, 0.71 mm governing displacement, minimum yield factor of safety 5.56, zero plastic strain, 75+ documented structural runs." },
    ],
  },
  {
    id: "gdp-final", type: "Group project presentation",
    title: "Effect of bird strike on sandwich composite aircraft wing leading edges",
    event: "Group Design Project review, Cranfield University, with GKN Aerospace", date: "May 2026",
    cover: "assets/decks/gdp/s07.jpg", total: 32,
    note: "Sixteen slides from the review deck: the modelling framework, validation against published data, and the flat-panel, leading-edge and sandwich comparisons at 90 and 180 m/s.",
    slides: [
      { src: "assets/decks/gdp/s03.jpg", caption: "Aim and objectives: build a validated numerical framework, then compare the material systems under identical bird-strike conditions." },
      { src: "assets/decks/gdp/s06.jpg", caption: "Flat-panel baseline: a 500 mm square panel isolates material behaviour before curvature is introduced." },
      { src: "assets/decks/gdp/s07.jpg", caption: "Curved NACA 23015 leading-edge section, 900 mm span, used for the realistic load-path comparison." },
      { src: "assets/decks/gdp/s08.jpg", caption: "The bird as a deformable soft body: a 1.8 kg capsule discretised into SPH particles, fired at 90 and 180 m/s." },
      { src: "assets/decks/gdp/s13.jpg", caption: "Leading-edge setup: clamped root, simply supported surface and the SPH impact assembly." },
      { src: "assets/decks/gdp/s14.jpg", caption: "Mesh sensitivity: the 2.5 mm model captures the sharpest early impact pulse." },
      { src: "assets/decks/gdp/s16.jpg", caption: "Layered validation: aluminium and Nomex flat-panel responses checked against published and experimental data." },
      { src: "assets/decks/gdp/s18.jpg", caption: "The aluminium model reproduces the characteristic impact pulse with Johnson-Cook plasticity." },
      { src: "assets/decks/gdp/s19.jpg", caption: "The sandwich validation supports the skin-core modelling strategy." },
      { src: "assets/decks/gdp/s20.jpg", caption: "Flat panels at 90 m/s: GFRP reaches the largest force peak, CFRP controls deformation." },
      { src: "assets/decks/gdp/s21.jpg", caption: "At 180 m/s velocity amplifies force nonlinearly and changes the ranking." },
      { src: "assets/decks/gdp/s23.jpg", caption: "Monolithic leading edges at 90 m/s: curvature lowers the force peaks and highlights stiffness differences." },
      { src: "assets/decks/gdp/s24.jpg", caption: "At 180 m/s CFRP and aluminium carry high peaks; GFRP absorbs energy by deforming, with no rupture." },
      { src: "assets/decks/gdp/s27.jpg", caption: "Sandwich and SEA comparison: core compliance shifts the trade-off between force, deformation and energy absorption." },
      { src: "assets/decks/gdp/s28.jpg", caption: "The best material depends on the design objective: low deformation, energy absorption, balanced response or load spreading." },
      { src: "assets/decks/gdp/s30.jpg", caption: "Conclusion: no single material wins every metric; all selected leading-edge thicknesses retained structural integrity at 90 and 180 m/s." },
    ],
  },
];
