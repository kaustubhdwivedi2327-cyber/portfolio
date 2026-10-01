# Kaustubh Dwivedi · portfolio

Single page with a scroll-driven flight hero: photoreal Blender renders of the NASA CRM-HL airliner (twilight, x-ray of the
inboard leading edge with the LPBF slat-track cans, SPH bird strike on the outboard slat, pull-back) composited with a live
Three.js layer for the lights. In the x-ray, while the reader scrolls, the aircraft is drawn live with lighting baked from
the same Blender scene (`js/rt.js`); when they stop, the real rendered frame shows. Project pages open in place.

No build step: serve the folder with any static server (double-click `preview.cmd`), or see `DEPLOY.md`.

```
index.html          page head (title, description, Open Graph, JSON-LD) and script tags
css/                base, home, case (project pages), finish (the design layer)
js/data.js          project content          js/home-data.js   home page content
js/home.js          home page                js/case.js        project pages
js/scene.js         flight hero (Three.js)   js/frames.js      scroll position of every rendered frame
js/rt.js            live x-ray layer (baked lighting, drawn while scrolling)
js/motion.js        theme, nav, scroll motion (GSAP ScrollTrigger)
assets/render/      rendered flight frames (WebP) and the sky panorama
assets/rt/          baked lighting atlases, meshes, colour-look table and sky for the live x-ray layer
assets/models/      aircraft and can meshes (base64), metadata
```

Earlier versions are kept on branches (to put one online: Settings > Pages > Branch, or merge it into `main`):
`frames-version` (rendered frames only, x-ray cutaway), `simple-version` (rendered frames, simpler see-through x-ray)
and `old-portfolio` (lattice hero; also the `portfolio-v1` tag).
