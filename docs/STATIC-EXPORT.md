# Static export — rebuild & redeploy

Read-only, serverless copy of the app for a reviewer. No terminal, no editing, no Claude agent —
just the scores, essays, story bank, coursework, schools, and Review page.

## Rebuild

```bash
npm run build:static
```

Produces `dist-static/` (gitignored — contains real personal data, never commit it). Two steps:
1. `VITE_STATIC=1 vite build` — SPA with a **relative** base (portable to any host; app uses HashRouter).
2. `scripts/build-static-content.mjs` — copies `content/` + `Agent/rubrics/` into `dist-static/` and
   generates `files-manifest.json` + `rubrics-manifest.json` (these replace the server's list endpoints).

Point at different data with `CONTENT_DIR=/path npm run build:static` — do this before publishing, since
the repo's own `content/` is demo data.

## Push to the Mac (for Netlify Drop)

```bash
rsync -az --delete dist-static/ mac:~/Desktop/amcas-review-site/
```

## Deploy / redeploy (Netlify Drop)

- **First time / unclaimed:** open <https://app.netlify.com/drop>, drag the folder
  `~/Desktop/amcas-review-site` onto it → instant unlisted `https://<random>.netlify.app`.
  Claim it with a free account to keep it alive / add password protection (Site → Access control).
- **Update an already-claimed site:** Netlify dashboard → the site → **Deploys** tab → drag the
  refreshed `amcas-review-site` folder onto the drop zone (replaces the live deploy, same URL).
- **CLI alternative** (if `netlify` is installed + authed): `npx netlify-cli deploy --prod --dir=dist-static`.

## One-liner (rebuild + push)

```bash
npm run build:static && rsync -az --delete dist-static/ mac:~/Desktop/amcas-review-site/
```

Then re-drag the folder on Netlify (Deploys tab) to publish the update.

## Privacy

The export contains real application data (essays, MCAT, family/identity). Keep the URL unlisted;
GitHub Pages on the public repo would make it world-readable and search-indexable — avoid that.
