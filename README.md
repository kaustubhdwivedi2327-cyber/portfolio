# Kaustubh Dwivedi · portfolio

Single page with a scroll-driven flight hero: photoreal Blender renders of the NASA CRM-HL airliner (twilight, x-ray of the
inboard leading edge with the LPBF slat-track cans, SPH bird strike on the outboard slat, pull-back) composited with a live
Three.js layer for the lights; project pages open in place (charts, comparison sliders, videos, lightbox).

No build step: serve the folder with any static server (double-click `preview.cmd`), or see `DEPLOY.md`.

```
index.html          page head (title, description, Open Graph, JSON-LD) and script tags
css/                base, home, case (project pages), finish (the design layer)
js/data.js          project content          js/home-data.js   home page content
js/home.js          home page                js/case.js        project pages
js/scene.js         flight hero (Three.js)   js/frames.js      scroll position of every rendered frame
js/motion.js        theme, nav, scroll motion (GSAP ScrollTrigger)
assets/render/      rendered flight frames (WebP) and the sky panorama
assets/models/      aircraft and can meshes (base64), metadata
```

The previous version of the site (lattice hero) is kept on the `old-portfolio` branch and the `portfolio-v1` tag.
To put it back online: Settings > Pages > Branch > `old-portfolio`.
