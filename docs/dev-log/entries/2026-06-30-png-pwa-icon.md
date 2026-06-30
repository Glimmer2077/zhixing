# 2026-06-30 - PNG PWA Icon

## Goal

Use the user-provided root `icon.png` as the app icon for browser tabs and phone
installation.

## Completed

- Confirmed `icon.png` is a 1024x1024 PNG.
- Generated deployable icon sizes:
  - `public/icons/zhixing-180.png` for iOS `apple-touch-icon`.
  - `public/icons/zhixing-192.png` for favicon and PWA manifest.
  - `public/icons/zhixing-512.png` for PWA manifest.
- Updated `index.html` to use PNG favicon and Apple touch icon.
- Updated both `public/manifest.webmanifest` and the `vite-plugin-pwa` manifest in
  `vite.config.ts`.
- Removed the old SVG icon from `public/icons/` so it is no longer precached.

## Verification

- `./node_modules/.bin/prettier --write index.html public/manifest.webmanifest vite.config.ts`
  - passed.
- `./node_modules/.bin/tsc -b --pretty false` - passed.
- `./node_modules/.bin/eslint . --max-warnings=0` - passed.
- `./node_modules/.bin/vitest run` - passed: 117 tests across 25 files.
- `env BASE_PATH=/zhixing/ ./node_modules/.bin/vite build` - passed.
- `dist/manifest.webmanifest` references `icons/zhixing-192.png` and
  `icons/zhixing-512.png`.
- `dist/index.html` references `icons/zhixing-192.png` and
  `icons/zhixing-180.png`.
- `dist/sw.js` precaches the new PNG icon sizes and no longer precaches the old SVG.

## Decision

Keep `icon.png` at the repository root as the source image. Only the derived 180,
192, and 512 PNG files are published under `public/icons/`.

## Next Steps

1. Commit and push the icon update.
2. Wait for GitHub Pages deployment.
3. Verify the new icon on the installed phone PWA.
