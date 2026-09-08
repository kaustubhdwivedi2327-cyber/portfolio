# Kaustubh Dwivedi · portfolio

Single-page app with client-side routing, an interactive 3D diamond-lattice hero (Three.js), scroll-driven animation (GSAP ScrollTrigger), smooth scrolling (Lenis), a custom cursor, light/dark theme, project filters, and per-project pages with a video stage, interactive charts, before/after comparison sliders and a lightbox gallery.

No build step. Open `index.html` directly, or serve the folder with any static server. GSAP and Lenis are bundled in `js/vendor/`; Three.js (for the 3D hero) and the Google fonts load from CDNs, so offline the site still works but without the lattice and with fallback fonts.

```
portfolio/
  index.html        shell, theme bootstrap, library tags
  css/style.css     all styling (tokens at the top; --accent is the brand colour, --c1..--c7 the chart series colours)
  js/data.js        ALL CONTENT — the file you normally edit
  js/curves.js      digitised force/deformation histories used by the bird-strike charts (generated)
  js/charts.js      chart engine (bars, horizontal bars, lines with log axes) + comparison slider
  js/main.js        router, views, transitions, video stage, lightbox
  js/fx.js          cursor, magnetic buttons, reveals, counters, tilt
  js/hero3d.js      3D lattice
  js/vendor/        gsap, ScrollTrigger, lenis (pinned copies)
  assets/           CV PDF and one folder per project (images, video/)
```

## Routes

- `#/` home
- `#/project/slat-track`, `#/project/bird-strike`, `#/project/gearbox`, `#/project/lattice`
- `#/#projects`, `#/#skills`, `#/#education`, `#/#contact` scroll to a section
- `#/project/slat-track#results` jumps to a section inside a project page (`videos`, `results`, `compare`, `gallery`)

Hash routes work on GitHub Pages and any static host with no server config.

## Editing content

Everything lives in `js/data.js`. Each project has:

```js
cover:   "assets/slat-track/cover.jpg",
videos:  [{ src: "assets/slat-track/video/x.mp4", poster: "assets/slat-track/video/x.jpg", title: "...", caption: "..." }],
         // src can also be a YouTube or Vimeo link
images:  [{ src: "assets/slat-track/01_location.jpg", caption: "..." }],
compare: [{ title: "CFRP", before: "...jpg", after: "...jpg", beforeLabel: "t = 0", afterLabel: "after impact" }],
charts:  [ /* chart specs, see below */ ],
```

### Charts

A chart spec looks like:

```js
{ type: "bars",                    // "bars" | "hbars" | "lines"
  title: "...", subtitle: "...", note: "...",
  categories: ["ZTOP", "XNEG"],    // bars/hbars
  series: [{ name: "Final", values: [0.718, 0.427] }],
  catSub: ["FoS 5.56", "FoS 8.13"],// optional second label line under each category
  decimals: 3, unit: "mm", yLabel: "U max (mm)",
}
```

- Put alternative data sets under `datasets: { "Label A": {...}, "Label B": {...} }` to get toggle chips.
- Line charts take `series: [{ name, points: [[x, y], ...] }]`, and support `xLog`, `yLog`, `refs: [{ y | x, label }]`, `pointLabels`.
- `curves: { "Label": "key" }` pulls digitised line data from `js/curves.js` (keys: `flat90`, `flat180`, `le90f`, `le180f`, `le90d`, `le180d`).
- `wide: true` makes a chart span the full width of the results grid.

### Videos

Local MP4s were converted from the Abaqus AVI recordings with FFmpeg (H.264, ≤1280 px wide, `-crf 23`, `+faststart`). To add one:

```
ffmpeg -i in.avi -vf "scale='min(1280,iw)':-2,format=yuv420p" -r 24 -c:v libx264 -crf 23 -movflags +faststart -an out.mp4
ffmpeg -ss 1 -i out.mp4 -frames:v 1 -q:v 3 out.jpg      # poster frame
```

YouTube or Vimeo links work in `src` as well and avoid hosting the file.

### Images

JPG, 1600 px wide or less (the originals were resized with Pillow). Thumbnails open in a lightbox with arrow-key navigation. `cover` is used on the home card and should be roughly 16:10.

## Deploying (free)

**GitHub Pages**
1. Create a repository (e.g. `kaustubh-portfolio`) and push this folder's contents to it.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / root.
3. Site appears at `https://<username>.github.io/kaustubh-portfolio/`.

**Netlify:** drag the folder onto https://app.netlify.com/drop.
**Vercel:** import the repo in the dashboard, framework preset "Other".

The folder is about 45 MB, almost all of it the simulation videos in `assets/bird-strike/video/`. That is fine for GitHub Pages and Netlify; if you want it smaller, move the videos to YouTube and use links.

## Notes

- Phone number is deliberately not on the site. Add it to `SITE` in `data.js` and to the contact section in `main.js` if you want it public.
- The bird-strike force and deformation histories were digitised from the report figures; peaks match the report tables to within about 1 %.
- The gearbox and lattice projects still use generated placeholder covers and have no media yet.
- Reduced-motion users get the content without animation.

## Publications shelf and frame sequences (added 8 Sept 2026)

- `PUBLICATIONS` in `js/data.js` drives the shelf on the home page. Each entry has `type` (`journal` | `chapter`), `cover` (portrait journal or book image in `assets/pubs/`), optional `coverKind: "figure"` + `logo` to show a landscape figure with a journal logo instead, `abstract` (verbatim) or `summary` (paraphrase, shown as "In brief"), `figures` (open in the lightbox), `cite` (one-click copy) and `project` (links to the project page).
- A project can carry `sequences: [{ title, frames: [...], labels: [...], caption }]`; each becomes a drag-to-scrub, playable frame sequence on the project page (used for the lattice compression test).
- Publisher artwork: the Materials Today Communications cover and the CRC book jacket are the publishers' images used for identification only; the JMMP paper is CC BY 4.0; the Elsevier figures are the authors' own.

## Performance notes (8 Sept 2026)

The site felt heavy, so the expensive parts were trimmed without removing any feature:

- No `backdrop-filter` blur anywhere (top bar, stat tiles, badges): blur over a WebGL canvas repaints on every scroll frame.
- The hero canvas no longer uses a CSS mask; a gradient overlay (`.hero-fade`) does the same job for free. The tools ticker uses edge overlays instead of a mask.
- The 3D lattice renders at a pixel ratio of at most 1.5, uses two lights instead of four, lighter geometry, fewer particles, and stops rendering entirely when it is off screen.
- The intro plays once per browser session (it is skipped on reloads and later visits), and page transitions and reveals are shorter.
- Smooth scrolling is snappier (`lerp` 0.18). If you would rather have native scrolling, delete the `new Lenis(...)` line in `js/main.js`.

## Second performance pass (8 Sept 2026, evening)

- Smooth (inertial) scrolling is off by default: `USE_SMOOTH_SCROLL = false` in `js/main.js`. Native scrolling responds to the wheel immediately; flip the flag to bring Lenis back.
- The 3D lattice renders at a pixel ratio of at most 1.25 and drops to 30 fps when the pointer has been still for more than 0.6 s.
- Card tilt and shine updates are throttled to one per frame; `will-change` layers were removed from buttons.
- Added `assets/favicon.svg` and a social-preview image `assets/og.jpg`. After deploying, change the `og:image` meta tag in `index.html` to the full public URL so LinkedIn and others can read it.
- Folder layout: this folder (`Documents\portfolio`) is the main site; `Documents\portfolio_chatgpt` is the alternative version made by ChatGPT.

## Image layout (8 Sept 2026, late)

- Each project page now opens on a wide hero image (`hero`, falling back to `cover`; `heroPos` sets the focal point, e.g. `"50% 72%"`), followed by the story. The simulations moved to their own "See it move" section below the narrative.
- Steps can carry `image`, `imageCaption` and `photo: true`; the figure sits beside the step text and opens in the lightbox. Diagrams are shown whole on a white tile; photos are cropped to fill.
- Gallery and publication figures use the same rule: add `photo: true` to an image entry to crop it, leave it off to show the whole figure.
- Composed images: `slat-track/hero.jpg` (contour keyed onto the dark background) and `slat-track/cover_dark.jpg` (render on dark) were made with Pillow from the asset library; `bird-strike/hero.jpg` is the GFRP/Nomex contour with the legend cropped off.

## Courses and training section

`COURSES` in `js/data.js` (provider, title, year, topics, optional href and note). Courses are grouped by provider with an auto-generated badge and summary line; the section only appears when the list is non-empty. `COURSES_NOTE` overrides the summary sentence. Current entries: 22 Dassault Systèmes courses (14 SIMULIA Abaqus, 8 CATIA and composites) selected from the folders in Google Drive; tyre, sheet-metal, moulded-parts and duplicate basics were left out on purpose.

## About, tools, awards and presentations (added 8 Sept 2026)

- `ABOUT` in `js/data.js`: `title`, `lead`, `photo` (4:5 portrait, `assets/portrait.jpg`; `portrait_src.jpg` is the original square), `facts` as [label, value] pairs and `timeline` entries (`year`, `title`, `org`). The block renders above Projects and the nav link is "About".
- `TOOLS`: one card per tool with `level` (Advanced, Working or Familiar, shown as three bars), a `note`, and `used` entries that are either `{ id, label }` (links to a project page) or plain strings.
- `AWARDS`: shown beside Education under "Awards, membership and status". An `image` opens in the lightbox. `MEMBERSHIPS` still renders below as a plain list.
- `PRESENTATIONS`: decks. Each has a `cover`, `total` slide count and `slides` (`src`, `caption`) that open in the lightbox in order; the nav link is "Talks". Slide images live in `assets/decks/irp` and `assets/decks/gdp`, rendered from the PPTX/PDF sources at 1400 px wide. To add a deck, export slides as PNG from PowerPoint (File > Export, or Slide.Export through COM), convert to JPEG and list them.
- Motion switch: the "Motion" button in the top bar stores `kd-motion` in localStorage and reloads. When off, the page gets `html.reduce`: no custom cursor, tilt or magnetic effects, no scroll animations, the hero scene renders one static frame and charts draw without tweens. The OS "reduce motion" preference has the same effect.
- SEO: three JSON-LD blocks in `index.html` (Person and the two journal articles), a per-route meta description, `sitemap.xml` and `robots.txt`. Replace `https://example.com` in both files and make `og:image` an absolute URL once the site has a domain.
- Mobile: below 720 px the top bar keeps the brand and the three buttons on one row and turns the section links into a horizontally scrolling row beneath them.

## Slat-track media sources (rebuilt 8 Sept 2026)

Every image and video on the slat-track page now comes from one of two sources only: the final thesis PDF (`IRP\Thesis Submission\466970 - N-ALS-THES-25-A25.pdf`, files named `t01…t22`, figure numbers in the captions) or the final presentation (`IRP\New folder\466970-N-ALS-THES-25-A25.pptx`, files named `d24…d52` by slide number, plus the five LPBF animations embedded in slides 3 and 48 to 51). The card cover and page hero are the deck's own renders keyed onto the dark background. The earlier asset-library images and the LC4 cap-load videos were removed because that load benchmark is not part of the final work. Thesis figures are rendered at 300 dpi from the PDF; deck slides are PowerPoint exports at 1400 px with the footer strip trimmed.

## Bird-strike media sources (rebuilt 8 Sept 2026)

The bird-strike page follows the same rule as the slat-track page: every image, clip and before/after pair comes from the final GDP thesis (`Downloads\N-ALS-GA-25-A25.pdf`, files `t01…t26`, figure or table numbers in the captions) or the final GDP deck (`Downloads\NALSGA25GDP2.pptx`, files `d21…d57` by slide number). The clips are the deck's own embedded animations (slides 19, 24, 30, 31, 39 and 43), re-encoded with a bitrate cap; the material label for each clip was read from the slide layout, not guessed. The three drop-tower clips are cut from the long test recordings on slide 24 around the impact. The before/after sliders use the initial and final renders from thesis Table 6.1; the frame scrubber uses twelve frames of the GFRP leading-edge animation; the card cover and hero are the thesis GFRP final-deformation render keyed onto the dark background. The publication figures for the JMMP paper point at the same thesis renders. The earlier LaTeX-folder figures, montage clips and AVI recordings were removed; a copy is kept in the working folder.

## Gearbox walkthrough video (added 8 Sept 2026)

`assets/gearbox/video/gearbox_3dx.mp4` is a 69-second cut (ends on the Dassault outro; the team slide with names and photos was cut out at his request) of `Downloads\Video Project 1.mp4` (a 149-second silent screen recording of the project on the 3DEXPERIENCE platform). Platform browsing runs at 4 to 5 times speed, the drawing, model views, summary slides and prototype photos run at normal or 1.5 times speed, with a fade in and out; the audio track was empty and was dropped. Two stills from the recording sit in the gallery. No music was added because no licensed track was available; drop an MP3 next to the source and it can be mixed in.
- Optional per-project `videosNote` replaces the default line under the "See it move" heading.
