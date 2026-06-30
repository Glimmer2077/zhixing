# 2026-06-30 - GitHub Pages Deploy Wiring

## Goal

Make the current PWA deployable to GitHub Pages without manually editing build
paths after the repository name is known.

## Completed

- Added `.github/workflows/deploy-pages.yml` to build, verify, upload, and deploy
  `dist/` through GitHub Pages on pushes to `main` or manual workflow runs.
- Added a `BASE_PATH`-driven Vite `base` value so GitHub project pages can serve
  assets from `/<repo>/`.
- Made PWA icon URLs relative in the generated manifest and HTML head so project
  pages do not request icons from the domain root.
- Documented the GitHub Pages flow in `docs/INSTALL_PHONE.md`.

## Verification

- `./node_modules/.bin/prettier --write vite.config.ts index.html public/manifest.webmanifest .github/workflows/deploy-pages.yml docs/INSTALL_PHONE.md`
  - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 117 tests across 25 files.
- `env BASE_PATH=/zhixing/ ./node_modules/.bin/vite build` - passed and generated
  `/zhixing/` paths for JS, CSS, manifest, and service worker registration.
- `./node_modules/.bin/vite build` - passed for the default `/` base path.

## Decisions

- The workflow uses Node 24 and Corepack so `pnpm` follows the repository
  `packageManager` field.
- The default deployment target is a normal GitHub project page:
  `https://<user-or-org>.github.io/<repo>/`.
- If the repository is named `<owner>.github.io`, the workflow builds with
  `BASE_PATH=/`.
- If a custom domain is later attached at the site root, set the GitHub repository
  variable `PAGES_BASE_PATH` to `/`.

## Next Steps

1. Commit these deployment changes.
2. Push to GitHub.
3. In GitHub Settings -> Pages, set Build and deployment -> Source to GitHub
   Actions.
4. After the first successful deployment, open the Pages URL on a phone and install
   it from the browser.
