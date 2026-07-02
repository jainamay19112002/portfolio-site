# Amay Jain — Portfolio

A single-page React portfolio built with Vite.

## Run it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Before you deploy

Two things in `src/App.jsx` are placeholders — search for them and fill in:

- **LinkedIn URL** — currently `href="#"` in two places (hero and contact section).
- **Résumé download** — currently `href="#" download` in the nav bar. Put your resume
  PDF in the `public/` folder (e.g. `public/resume.pdf`) and point the link at
  `/resume.pdf`.

## Deploy to GitHub Pages

### Option A — automatic (recommended)

This repo already includes `.github/workflows/deploy.yml`, which builds and deploys
on every push to `main`.

1. Push this project to a new GitHub repo.
2. In the repo, go to **Settings → Pages**, and under "Build and deployment", set
   **Source** to **GitHub Actions**.
3. Push to `main` (or re-run the workflow from the Actions tab). Your site will be
   live at `https://<your-username>.github.io/<repo-name>/`.

No changes needed to `vite.config.js` — it's already set to use relative paths
(`base: "./"`), so it works whether your repo becomes a user site or a project site.

### Option B — manual, one command

```bash
npm run deploy
```

This runs `vite build` and pushes the `dist/` folder to a `gh-pages` branch using
the `gh-pages` npm package (already in `devDependencies`). Then in **Settings →
Pages**, set **Source** to **Deploy from a branch**, and pick `gh-pages` / `root`.

## Project structure

```
portfolio-site/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx      # React entry point
│   ├── App.jsx       # the whole site — sections, data, styling
│   └── index.css     # minimal global reset
└── .github/workflows/deploy.yml
```

All content (projects, research log entries, skills, achievements) lives in
plain arrays at the top of `src/App.jsx` — edit those directly to update the
site, no need to touch the JSX layout below them.
