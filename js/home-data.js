/* Homepage content (verbatim from the live site) and shared helpers. Project pages read js/data.js. */
/* Shared content: copied verbatim from the live portfolio. All three variants render from this object. */
const LIVE = "https://kaustubhdwivedi2327-cyber.github.io/portfolio/";
const D = {
  name: ["Kaustubh", "Dwivedi"],
  role: "Aerospace Structures & Design Engineer",
  place: "Cranfield, UK",
  eyebrow: "Aerospace Structures & Design Engineer \u00b7 Cranfield, UK",
  tagline: ["Structures that are", "substantiated,", "not just designed."],
  lede: "Aerospace structures and design engineer, completing an MSc in Advanced Lightweight and Composite Structures at Cranfield University. Two industry projects with GKN Aerospace: an LPBF redesign of the Airbus A320 slat-track can, taken from load definition to released native CAD 20.6 % lighter than the existing welded design, and an SPH\u2013FEA bird-strike assessment of composite leading-edge concepts, validated against manufactured specimens and published open access in 2026. Five peer-reviewed publications, including a first-author paper in Materials Today Communications.",
  links: {
    cv: LIVE + "assets/Kaustubh_Dwivedi_CV.pdf",
    linkedin: "https://www.linkedin.com/in/kaustubh-dwivedi-65586324a/",
    researchgate: "https://www.researchgate.net/scientific-contributions/Kaustubh-Dwivedi-2272720523",
    orcid: "https://orcid.org/0009-0004-6472-7732",
    email: "kaustubhdwivedi2327@gmail.com"
  },
  stats: [
    { v: "2", l: "industry projects with GKN Aerospace: A320 slat-track can and composite leading edge" },
    { v: "5", l: "peer-reviewed publications, one as first author" },
    { v: "18", l: "months of industry design experience at Dassault Syst\u00e8mes" },
    { v: "100+", l: "documented simulation runs in Abaqus, Tosca and ANSYS across the two projects" }
  ],
  marquee: ["Abaqus/Standard", "Abaqus/Explicit", "CATIA V5", "3DEXPERIENCE", "nCode", "ANSYS Additive", "Tosca Structure", "SPH\u2013FEA", "LPBF / AlSi10Mg", "CS 25.963", "CS 25.561", "EN 1999-1-3", "Python", "MATLAB", "Composites", "DfAM"],
  quote: "I work to a stated load basis and a documented evidence chain, and I am explicit about what a result clears and what it does not.",
  open: "Open to UK aerospace structures, design and analysis roles from Sept 2026.",
  about: {
    kicker: "00 \u00b7 About",
    title: "An engineer who shows the evidence.",
    body: "I am an aerospace structures engineer finishing my MSc at Cranfield University. I do not treat CAD, simulation and testing as separate tasks: a design is not finished for me until the model, the manufacturing constraints and the test evidence agree, and I say plainly when they do not. I am the person on a team who wants to understand why something works before trusting it, who keeps the plan and the documentation straight so others can pick up my work, and who takes feedback from more experienced engineers as the fastest way to get better. I have coordinated the technical work of a student team, worked to an industrial review cadence and published with co-authors, and what I want next is a UK structures, design or analysis role where I can learn from experienced engineers and be useful from the first week.",
    facts: [
      ["Based", "Cranfield, UK"],
      ["Status", "MSc Advanced Lightweight and Composite Structures, completing Sept 2026"],
      ["Looking for", "UK aerospace structures, design and analysis roles"],
      ["Working style", "Stated load basis, independent verification, clear close-out"]
    ],
    timeline: [
      ["2020", "B.Tech Mechanical Engineering begins", "Symbiosis Institute of Technology, Pune"],
      ["Dec 2022", "Engineering Design Intern, 18-month placement", "La Fondation Dassault Syst\u00e8mes / Dassault Syst\u00e8mes, Pune"],
      ["2024", "First-author paper and three CRC Press chapters; B.Tech completed", "Materials Today Communications; CRC Press"],
      ["Sept 2025", "MSc Advanced Lightweight and Composite Structures", "Cranfield University"],
      ["2025\u201326", "Two projects with GKN Aerospace", "A320 slat-track can LPBF redesign; composite leading-edge bird strike"],
      ["Sept 2026", "Bird-strike work published in JMMP; MSc completes", "Open to UK roles"]
    ]
  },
  projectsIntro: { kicker: "01 \u00b7 Projects", title: "Selected work", body: "Structures, design and research work. Each entry carries the numbers it stands on, with the simulations, images and interactive results behind them." },
  filters: ["All", "Structures & AM", "Composites & Impact", "Design & CAD", "Research"],
  projects: [
    { id: "slat-track", cat: "Structures & AM", dates: "2025 \u2013 2026", title: "Airbus A320 Slat-Track Can", sub: "LPBF redesign and structural substantiation",
      media: "\u25b6 5 videos \u25d4 8 interactive charts",
      nums: [["1.478 kg", "released monolithic design"], ["\u221220.6 %", "vs. 1.860 kg welded 6061-T6 reference"]],
      tags: ["LPBF / AlSi10Mg", "Abaqus", "CATIA V5", "Tosca"] },
    { id: "bird-strike", cat: "Composites & Impact", dates: "2025 \u2013 2026", title: "Composite Wing Leading Edge", sub: "Bird-strike concept assessment with SPH\u2013FEA",
      media: "\u25b6 14 videos \u25d4 5 interactive charts",
      nums: [["JMMP 2026", "published open access, J. Manuf. Mater. Process. 10(9), 343"], ["32", "production simulations: 16 configurations at 90 and 180 m/s"]],
      tags: ["Abaqus/Explicit", "SPH\u2013FEA", "Johnson\u2013Cook", "Hashin damage"] },
    { id: "gearbox", cat: "Design & CAD", dates: "Dec 2022 \u2013 May 2024", title: "Modular Multi-Ratio Gearbox", sub: "Concept to working prototype",
      media: "\u25b6 1 video",
      nums: [["18 mo", "industry placement"], ["Prototype", "built and working"]],
      tags: ["CATIA V5", "3DEXPERIENCE", "Abaqus", "Hand calculation"] },
    { id: "lattice", cat: "Research", dates: "2023 \u2013 2024", title: "3D-Printed Diamond Lattice Structures", sub: "Process parameters, mechanical integrity and nature-inspired ML optimisation",
      media: "",
      nums: [["1st", "author, Materials Today Communications (Elsevier)"], ["3", "CRC Press book chapters co-authored, 2024"]],
      tags: ["FDM / PLA+", "Lattice structures", "Compression testing", "Nature-inspired ML"] }
  ],
  skillsIntro: { kicker: "02 \u00b7 Capability", title: "Technical skills" },
  skills: [
    ["Finite element", "Abaqus/Standard and /Explicit: shell and solid modelling, geometric and material nonlinearity, contact and tie constraints, SPH impact, mesh sensitivity studies, verification against an independent mesh, simulation\u2013test correlation."],
    ["Optimisation & AM", "Tosca Structure (bead and shape), ANSYS Additive thermal simulation; DfAM: wall thickness, build orientation, support strategy, process risk."],
    ["CAD & release", "CATIA V5 and 3DEXPERIENCE: part, assembly and multi-section surface modelling, native solid reconstruction, STEP exchange, geometry validation and design documentation."],
    ["Composites", "Laminate and sandwich design, stacking sequence definition, specimen manufacture, mechanical and impact testing, damage and delamination modelling."],
    ["Standards & method", "CS 25.963 and CS 25.561 load definitions; EN 1999-1-3 fatigue curves; nCode; requirements verification matrices and evidence chains."],
    ["Programming", "Python for post-processing, mesh and field-data handling and figure generation; MATLAB; Excel."]
  ],
  toolsIntro: { kicker: "02A \u00b7 Tools", title: "Tools and where they were used", body: "Depth is stated honestly: advanced means daily use on delivered work, working means used to produce results, familiar means trained and applied in exercises." },
  tools: [
    ["Abaqus/Standard and /Explicit", "Advanced", "Static, modal and fatigue-input runs on the slat-track can; SPH\u2013FEA soft-body impact for the leading-edge study; contact, tie constraints and nonlinear materials.", ["Slat-track can", "Bird strike", "Gearbox"]],
    ["CATIA V5", "Advanced", "Native solid reconstruction of the released can geometry, multi-section surfaces and STEP exchange; concept-to-prototype gearbox modelling.", ["Slat-track can", "Gearbox"]],
    ["3DEXPERIENCE", "Working", "Platform modelling and design documentation during the Dassault Syst\u00e8mes placement; EduSpace training on the composites and structural apps.", ["Gearbox", "EduSpace courses"]],
    ["Tosca Structure", "Working", "Bead and shape guidance for where the can wall should carry material; the load-path result seeded the variable-wall method.", ["Slat-track can"]],
    ["nCode DesignLife", "Working", "EN 1999-1-3 weld-fatigue screening of the existing welded can, cross-checked by an independent shell tangent-stress route.", ["Slat-track can"]],
    ["ANSYS Additive", "Working", "LPBF thermal simulation locating the sustained hotspot at the root and collar band, with a control run on the existing welded geometry.", ["Slat-track can"]],
    ["Python", "Working", "Post-processing of Abaqus field and history output, mesh handling and figure generation; nature-inspired optimisation and ML for the lattice paper.", ["Slat-track can", "Bird strike", "Lattice"]],
    ["Materialise Magics", "Familiar", "Support strategy and build-orientation review for the LPBF candidate.", ["Slat-track can"]],
    ["MATLAB and Excel", "Familiar", "Hand-calculation checks, data reduction and verification matrices.", ["Coursework", "Project checks"]]
  ],
  trainingIntro: { kicker: "02B \u00b7 Training", title: "Courses and training", body: "Official Dassault Syst\u00e8mes training completed through the EduSpace programme in 2025. Listed here: the courses behind the analysis and CAD work on this site." },
  training: [
    { org: "Dassault Syst\u00e8mes SIMULIA \u00b7 Abaqus training", count: "14 courses", courses: [
      ["Analysis of Composite Materials with Abaqus", ["Composites", "Hashin damage", "Delamination"]],
      ["Composites Modeler for Abaqus/CAE", ["Layup definition", "Ply orientation"]],
      ["Modeling Fracture and Failure with Abaqus", ["Damage", "Cohesive zones", "XFEM"]],
      ["Modeling Extreme Deformation and Fluid Flow with Abaqus", ["SPH", "CEL", "Abaqus/Explicit"]],
      ["Crashworthiness Analysis with Abaqus", ["Impact", "Energy absorption", "Explicit"]],
      ["CZone for Abaqus", ["Composite crush", "Crashworthiness"]],
      ["Buckling, Postbuckling and Collapse Analysis", ["Stability", "Riks", "Imperfections"]],
      ["Modeling Contact and Resolving Convergence Issues with Abaqus", ["Contact", "Convergence"]],
      ["Obtaining a Converged Solution with Abaqus", ["Nonlinear analysis", "Solver controls"]],
      ["Substructures and Submodeling with Abaqus", ["Submodeling", "Verification"]],
      ["Heat Transfer and Thermal-Stress Analysis with Abaqus", ["Thermal", "Thermal stress"]],
      ["Abaqus Geometry Import and Meshing", ["Geometry repair", "Meshing"]],
      ["Introduction to Abaqus Scripting", ["Python", "Automation"]],
      ["Advanced Abaqus Scripting", ["Python", "Post-processing", "ODB"]]
    ]},
    { org: "Dassault Syst\u00e8mes EduSpace \u00b7 CATIA and composites", count: "8 courses", courses: [
      ["CATIA V5 Fundamentals", ["CATIA V5"]],
      ["CATIA Part Design and Part Design Expert", ["Part design", "Parametric modelling"]],
      ["CATIA Surface Design and Surface Design Expert", ["Surface modelling", "Multi-section surfaces"]],
      ["Generative Drafting Fundamentals (ISO)", ["Drawings", "ISO drafting"]],
      ["Understanding Composite Design", ["Composite design"]],
      ["Composites Grid Approach", ["Grid design", "Zones and plies"]],
      ["Composites Part Engineering", ["Ply definition", "Stacking"]],
      ["Composites Part Manufacturing", ["Manufacturing", "Flattening", "Producibility"]]
    ]}
  ],
  talksIntro: { kicker: "02C \u00b7 Presentations", title: "Talks, reviews and posters", body: "Open a deck to page through the slides." },
  talks: [
    { count: "16 of 60 slides", kind: "Final presentation", title: "Slat Track Can of the Future", where: "MSc Individual Research Project viva, Cranfield University, with GKN Aerospace \u00b7 Aug 2026",
      body: "Sixteen of the sixty slides: the component and why AM, the load basis and FEA setup, the material trade-space, how the HT-23 and AlSi10Mg walls were shaped, and the closing numbers." },
    { count: "16 of 32 slides", kind: "Group project presentation", title: "Effect of bird strike on sandwich composite aircraft wing leading edges", where: "Group Design Project review, Cranfield University, with GKN Aerospace \u00b7 May 2026",
      body: "Sixteen slides from the review deck: the modelling framework, validation against published data, and the flat-panel, leading-edge and sandwich comparisons at 90 and 180 m/s." }
  ],
  pubsIntro: { kicker: "03 \u00b7 Research", title: "Publications", body: "Peer-reviewed work from Symbiosis and Cranfield. Open a card for the abstract, the figures and a ready-made citation." },
  pubFilters: ["All", "Journal articles", "Book chapters"]
};

/* Shared content, part 2: publications, education, contact. Verbatim from the live site. */
D.pubs = [
  { year: "2026", type: "Journal article", badge: "Open access",
    title: "Comparative SPH\u2013Finite Element Assessment of Aerospace Material Systems Under Bird-Strike Loading",
    authors: "Mohsen Lalehparvar, Alex Nuttall, Dhruva Bavaria, Felix Mass\u00f3 Etxeberria, Kaustubh Dwivedi, Hessam Ghasemnejad, Pablo Coladas Mato, Wydo van de Waerdt",
    venue: "Journal of Manufacturing and Materials Processing, vol. 10, issue 9, article 343, published 7 September 2026 \u00b7 MDPI \u00b7 Cranfield University with GKN Aerospace and Fokker Aerospace",
    doi: "10.3390/jmmp10090343", project: "bird-strike", panel: "Abstract & figures", absLabel: "Abstract",
    abs: "Bird strikes cause aircraft damage, create serious risks to human safety and can contribute to catastrophic incidents, while continuing to impose substantial economic costs on airlines. The impact combines high kinetic energy with discontinuous, strongly nonlinear contact over a short duration, producing large structural deformations; appropriate nonlinear simulation techniques are therefore required to capture this complex interaction. For this purpose, the present study applies established Smoothed Particle Hydrodynamics (SPH)\u2013finite element modelling ingredients to a controlled matrix of aerospace material systems and target geometries. The approach is first benchmarked against a published aluminium flat-plate bird-impact test using a raster-digitised force-history comparison, after which monolithic metallic and composite structures and source-described honeycomb-sandwich alternatives are assessed in flat-panel and curved leading-edge configurations. The results show that contact-force and local-displacement rankings depend strongly on target geometry and response metric, with the curved leading edge changing the ordering observed for the flat panel. More compliant systems generally permit greater local displacement, whereas stiffer systems restrict displacement but can sustain higher short-duration force peaks; consequently, no universal material ranking follows from a single response measure, and the results are most suitable for preliminary design screening.",
    figs: ["Fig. 2: leading-edge model, the forward 600 mm of a NACA 23015 section (thesis Fig. 3.2).", "Fig. 3: honeycomb geometry wrapped to the leading-edge surface (thesis Fig. 3.4).", "Figs. 4\u20135: double-hemispherical-cap SPH bird, 226 \u00d7 113 mm, 1.8 kg (thesis Fig. 3.6).", "Fig. 6: leading-edge mesh-sensitivity force histories (thesis Fig. 3.9).", "Fig. 7: meshed leading edge with the SPH bird at the impact location (thesis Fig. 3.10).", "Fig. 8: aluminium flat-plate benchmark against the Liu et al. experiment and simulation (thesis Fig. 4.1).", "Fig. 16: GFRP/Nomex leading edge at 180 m/s, von Mises stress in the outer skin and core (thesis Fig. 6.10).", "Fig. 15: GFRP/Nomex leading edge at 90 m/s, outer skin and core (thesis Fig. 6.9)."],
    cite: "Lalehparvar, M., Nuttall, A., Bavaria, D., Mass\u00f3 Etxeberria, F., Dwivedi, K., Ghasemnejad, H., Coladas Mato, P., & van de Waerdt, W. (2026). Comparative SPH\u2013finite element assessment of aerospace material systems under bird-strike loading. Journal of Manufacturing and Materials Processing, 10(9), 343. https://doi.org/10.3390/jmmp10090343",
    note: "Open access under CC BY 4.0. Special Issue: External Field-Assisted Welding and Advanced Processing of Lightweight Metallurgical Structures. Figures shown from the project archive; numbering follows the published paper." },
  { year: "2024", type: "Journal article", badge: "First author",
    title: "Optimizing 3D printed diamond lattice structure and investigating the influence of process parameters on their mechanical integrity using nature-inspired machine learning algorithms",
    authors: "Kaustubh Dwivedi, Shreya Joshi, Rithvik Nair, Mandar S. Sapre, Vijaykumar S. Jatti",
    venue: "Materials Today Communications, vol. 38, article 108233, March 2024 (online 29 January 2024) \u00b7 Elsevier \u00b7 Symbiosis Institute of Technology, Pune",
    doi: "10.1016/j.mtcomm.2024.108233", project: "lattice", panel: "Abstract & figures", absLabel: "In brief",
    abs: "PLA+ diamond lattice specimens were printed on an FDM machine across a matrix of infill density, layer height, cell size and infill pattern, and compression-tested to ASTM D695 to obtain compressive strength, energy absorption and specific energy absorption. Feature-importance and interaction analysis ranked layer height and cell size as the dominant parameters, and nature-inspired Random Forest and XGBoost models tuned with particle-swarm optimisation were trained to predict compressive strength and specific energy absorption from the process settings, with R\u00b2 used to compare the two.",
    figs: ["Graphical abstract: printing to ASTM D695, compression testing, feature importance and interaction effects, nature-inspired Random Forest and XGBoost prediction.", "Fig. 1: workflow from lattice printing and UTM testing to XGBoost with particle-swarm optimisation.", "Fig. 2: diamond lattice specimen on the Ender FDM printer.", "Fig. 3: specimen between the UTM platens before compression.", "Fig. 4: load\u2013deflection curves for the printed lattice families.", "Figs. 5\u201312: compression progression; the full sequence is on the project page."],
    cite: "Dwivedi, K., Joshi, S., Nair, R., Sapre, M. S., & Jatti, V. S. (2024). Optimizing 3D printed diamond lattice structure and investigating the influence of process parameters on their mechanical integrity using nature-inspired machine learning algorithms. Materials Today Communications, 38, 108233. https://doi.org/10.1016/j.mtcomm.2024.108233",
    note: "\u00a9 2024 Elsevier Ltd. Figures reproduced from the authors' own article for portfolio use." },
  { year: "2024", type: "Book chapter", badge: "",
    title: "Optimizing Friction Stir Spot Welded ABS Weld Strength Using JAYA and Cohort Intelligence Algorithm",
    authors: "Rithvik Nair, Shreya Joshi, Kaustubh Dwivedi, Mandar S. Sapre, Ashwini V. Jatti",
    venue: "Chapter 7, pp. 99\u2013120, in Sustainable Materials: The Role of Artificial Intelligence and Machine Learning, eds. Akshansh Mishra, Vijaykumar S. Jatti and Shivangi Paliwal \u00b7 CRC Press, July 2024",
    doi: "10.1201/9781003437369-7", project: "", panel: "In brief", absLabel: "In brief",
    abs: "Friction-stir spot welding of ABS thermoplastic, with the weld-strength response optimised using two parameter-free metaheuristics, the JAYA algorithm and cohort intelligence.",
    figs: [],
    cite: "Nair, R., Joshi, S., Dwivedi, K., Sapre, M. S., & Jatti, A. V. (2024). Optimizing friction stir spot welded ABS weld strength using JAYA and cohort intelligence algorithm. In A. Mishra, V. S. Jatti, & S. Paliwal (Eds.), Sustainable Materials: The Role of Artificial Intelligence and Machine Learning (pp. 99\u2013120). CRC Press. https://doi.org/10.1201/9781003437369-7", note: "" },
  { year: "2024", type: "Book chapter", badge: "",
    title: "Supervised Machine Learning Based Classification of Dimensional Deviation of FDM 3D Printed Samples",
    authors: "Shreya Joshi, Rithvik Nair, Kaustubh Dwivedi, Bhargav Gadhiya, Mandar S. Sapre, Ashwini V. Jatti",
    venue: "Chapter 8, pp. 121\u2013144, in Sustainable Materials: The Role of Artificial Intelligence and Machine Learning \u00b7 CRC Press, July 2024",
    doi: "10.1201/9781003437369-8", project: "", panel: "In brief", absLabel: "In brief",
    abs: "Supervised machine-learning classifiers trained to predict the dimensional deviation class of fused-deposition-modelling parts from their printing parameters.",
    figs: [],
    cite: "Joshi, S., Nair, R., Dwivedi, K., Gadhiya, B., Sapre, M. S., & Jatti, A. V. (2024). Supervised machine learning based classification of dimensional deviation of FDM 3D printed samples. In A. Mishra, V. S. Jatti, & S. Paliwal (Eds.), Sustainable Materials: The Role of Artificial Intelligence and Machine Learning (pp. 121\u2013144). CRC Press. https://doi.org/10.1201/9781003437369-8", note: "" },
  { year: "2024", type: "Book chapter", badge: "",
    title: "Supervised Machine Learning Based Classification of Surface Roughness of Fused Deposition Modeling 3D Printed Samples",
    authors: "Rithvik Nair, Shreya Joshi, Kaustubh Dwivedi, Bhargav Gadhiya, Mandar S. Sapre, Ashwini V. Jatti",
    venue: "Chapter 10, pp. 161\u2013190, in Sustainable Materials: The Role of Artificial Intelligence and Machine Learning \u00b7 CRC Press, July 2024",
    doi: "10.1201/9781003437369-10", project: "", panel: "In brief", absLabel: "In brief",
    abs: "Supervised machine-learning classifiers trained to predict the surface-roughness class of fused-deposition-modelling parts from their printing parameters.",
    figs: [],
    cite: "Nair, R., Joshi, S., Dwivedi, K., Gadhiya, B., Sapre, M. S., & Jatti, A. V. (2024). Supervised machine learning based classification of surface roughness of fused deposition modeling 3D printed samples. In A. Mishra, V. S. Jatti, & S. Paliwal (Eds.), Sustainable Materials: The Role of Artificial Intelligence and Machine Learning (pp. 161\u2013190). CRC Press. https://doi.org/10.1201/9781003437369-10", note: "" }
];
D.eduIntro = { kicker: "04 \u00b7 Background", title: "Education" };
D.edu = [
  { deg: "MSc Advanced Lightweight and Composite Structures", inst: "Cranfield University", when: "Sept 2025 \u2013 Sept 2026",
    body: ["Accredited by RAeS and IMechE for further learning toward CEng registration. Composite structures, finite element methods, structural stability, impact mechanics.", "Thesis: Slat Track Cans of the Future \u2014 Exploring the Design Space of a High Criticality Fuel-Tank Component."] },
  { deg: "B.Tech Mechanical Engineering", inst: "Symbiosis Institute of Technology, Pune", when: "2020 \u2013 2024", body: ["CGPA 8.36 / 10."] }
];
D.awardsTitle = "Awards, membership and status";
D.awards = [
  ["ConnectNext Industry Internship Programme 2022\u201323", "La Fondation Dassault Syst\u00e8mes \u00b7 2024", "Certificate awarded on completing the 18-month engineering design placement in Pune."],
  ["Royal Aeronautical Society, Student Affiliate", "RAeS \u00b7 Nov 2025", "The MSc is accredited by RAeS and IMechE for further learning toward CEng registration."]
];
D.status = "UK Graduate Route eligible on MSc completion. Open to UK relocation, hybrid working and travel to client or manufacturing sites.";
D.contact = { kicker: "05 \u00b7 Contact", title: "Let's talk." };

/* Shared helpers */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ext = (href, label, cls = "") => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`;
const projUrl = id => "#project-" + id;
const doiUrl = d => "https://doi.org/" + d;
function copyText(btn, text) {
  const done = () => { const t = btn.textContent; btn.textContent = "Copied"; setTimeout(() => (btn.textContent = t), 1400); };
  try {
    navigator.clipboard.writeText(text).then(done, () => selectFallback(btn));
  } catch (e) { selectFallback(btn); }
}
function selectFallback(btn) {
  const el = btn.closest("[data-cite]")?.querySelector("[data-cite-text]");
  if (!el) return;
  const r = document.createRange(); r.selectNodeContents(el);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
}
/* NACA 5-digit 230xx section (used in the bird-strike study: NACA 23015). Returns upper/lower points, x in [0,1]. */
function naca230(t = 0.15, n = 90) {
  const m = 0.2025, k1 = 15.957, up = [], lo = [];
  for (let i = 0; i <= n; i++) {
    const b = Math.PI * i / n, x = (1 - Math.cos(b)) / 2;
    const yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
    let yc, dy;
    if (x < m) { yc = k1 / 6 * (x ** 3 - 3 * m * x * x + m * m * (3 - m) * x); dy = k1 / 6 * (3 * x * x - 6 * m * x + m * m * (3 - m)); }
    else { yc = k1 * m ** 3 / 6 * (1 - x); dy = -k1 * m ** 3 / 6; }
    const th = Math.atan(dy);
    up.push([x - yt * Math.sin(th), yc + yt * Math.cos(th)]);
    lo.push([x + yt * Math.sin(th), yc - yt * Math.cos(th)]);
  }
  return { up, lo };
}
/* Wire up filters, copy buttons and in-page nav for whichever variant is mounted. */
function wireCommon(root) {
  root.querySelectorAll("[data-filter-group]").forEach(group => {
    const target = root.querySelector(group.dataset.filterGroup);
    group.addEventListener("click", e => {
      const b = e.target.closest("[data-filter]"); if (!b) return;
      group.querySelectorAll("[data-filter]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      const f = b.dataset.filter;
      target.querySelectorAll("[data-cat]").forEach(it => { it.hidden = !(f === "All" || it.dataset.cat === f); });
    });
  });
  root.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", () => copyText(b, b.closest("[data-cite]").querySelector("[data-cite-text]").textContent)));
  root.querySelectorAll("[data-goto]").forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    root.querySelector("#" + a.dataset.goto)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));
}
/* Map publication types to the filter labels. */
const pubCat = t => (t === "Journal article" ? "Journal articles" : "Book chapters");
