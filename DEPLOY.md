# Putting the site online

The site is plain HTML, CSS and JavaScript with no build step, so any static host works. Two easy routes:

## GitHub Pages (free, permanent URL)

1. Sign in at github.com and create a new **public** repository. Call it `portfolio` (URL becomes `https://<username>.github.io/portfolio/`) or `<username>.github.io` (URL becomes `https://<username>.github.io/`). Do not add a README or .gitignore; the folder already has a commit.
2. In this folder run, replacing `<username>` and `<repo>`:

       git remote add origin https://github.com/<username>/<repo>.git
       git push -u origin main

   Git will open a browser window for you to sign in the first time.
3. On GitHub open **Settings → Pages**, set Source to *Deploy from a branch*, Branch *main*, folder */ (root)*, Save. The site is live in about a minute at the URL above.
4. Then replace `https://example.com` in `sitemap.xml` and `robots.txt` with that URL, make `og:image` in `index.html` absolute (`https://<username>.github.io/<repo>/assets/og.jpg`), commit and push again.

## Netlify (drag and drop)

Sign in at app.netlify.com, choose *Add new site → Deploy manually*, and drop this whole folder onto the page. Netlify gives a `*.netlify.app` URL immediately; a custom domain can be added later.

## Local preview

Double-click `preview.cmd` to serve the folder at http://localhost:8765/ (Windows PowerShell, no installs needed).
