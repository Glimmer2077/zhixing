# Install To Phone

知行 is a PWA. The phone installs it from a real HTTPS website, not from the local `127.0.0.1` development URL.

## Build

```bash
pnpm build
```

The production files are generated in `dist/`.

## Host

Upload the contents of `dist/` to any HTTPS static host:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- Your own Nginx/Caddy static server with TLS

The hosted site must serve these files from the same origin:

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `workbox-*.js`
- `assets/*`
- `icons/*`

PWA installability depends on a web app manifest and, for normal devices, an HTTPS origin. `localhost` / `127.0.0.1` is only a development exception on the same machine.

## Deploy With GitHub Pages

This repository includes `.github/workflows/deploy-pages.yml`.

1. Push the repository to GitHub.
2. In the GitHub repository, open Settings -> Pages.
3. Set Build and deployment -> Source to GitHub Actions.
4. Push to `main`, or run the `Deploy GitHub Pages` workflow manually.
5. Wait for the workflow to finish, then open the Pages URL on the phone.

For a normal project page, the URL is usually:

```text
https://<user-or-org>.github.io/<repo>/
```

The workflow automatically builds Vite with `BASE_PATH=/<repo>/` for that case.

For a root Pages repository named `<user-or-org>.github.io`, the workflow uses
`BASE_PATH=/`.

If the project later uses a custom domain at the site root, set a GitHub repository
variable named `PAGES_BASE_PATH` to `/`.

If the GitHub repository must stay private, confirm that the GitHub account plan
supports Pages for private repositories. The repository `Glimmer2077/zhixing` was
made private on 2026-06-30, and GitHub returned `Your current plan does not support
GitHub Pages for this repository` when enabling Pages for that private repository.
In that case, use a host that supports deploying from private repositories, such
as Vercel, Netlify, or Cloudflare Pages, while keeping the deployed PWA URL public
for installation.

## Install On iPhone

1. Open the HTTPS site URL on the iPhone.
2. Use Safari for the safest path.
3. Tap Share.
4. Tap Add to Home Screen.
5. Keep the name `知行`, then tap Add.
6. Launch it from the new Home Screen icon.

On iOS 16.4 and later, other browsers can also expose Add to Home Screen from the share menu, but Safari remains the least ambiguous install path.

## Install On Android

1. Open the HTTPS site URL in Chrome.
2. Use the browser menu or the install prompt.
3. Tap Install app or Add to Home screen.
4. Launch it from the new Home Screen icon.

## Verify After Installing

1. Open the Home Screen icon and confirm it launches as `知行`.
2. Add a test card.
3. Close and reopen the app; the card should still be there.
4. Turn on airplane mode and reopen; the app shell should still load after the first successful online visit.
5. Open Settings and tap Export to create a JSON backup.

## Backup Rule

All card data is private and local to that device. There is no server copy. Before deleting the Home Screen app, clearing browser data, changing phones, or reinstalling, export JSON from Settings and keep the file somewhere safe.

## References

- MDN PWA installability: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- web.dev PWA installation: https://web.dev/learn/pwa/installation
