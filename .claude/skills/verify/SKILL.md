---
name: verify
description: Build-and-drive recipe for verifying Life Like Kaleidoscope changes in a real browser.
---

# Verifying LLK in a browser

1. Build: `npm run build` (tsc + vite; chunk-size warning on the main bundle is pre-existing noise).
2. Serve the build: `npx vite preview --port <port>` (background). The app lives under the
   GitHub Pages base path: `http://localhost:<port>/life-like-kaleidoscope/` — the root URL 404s.
3. Drive with `playwright-core` (dev dependency, no browser downloads):
   `chromium.launch({ channel: 'msedge', headless: true })`.
   **The script must run from the repo root** (a `*.tmp.mjs` copy works) — node won't resolve
   `playwright-core` from outside the project tree.

## Gotchas

- Each Playwright browser context has isolated storage — a fresh context = a fresh user
  (empty IndexedDB/localStorage). Use `newContext({ locale: 'ru-RU' })` etc. to test
  `navigator.language` detection.
- Buttons use `transition-colors` (~150ms). A screenshot or `getComputedStyle` taken right
  after a click catches colors mid-transition and looks like the wrong element is selected.
  Assert on classes/ARIA, or wait ~300ms before visual capture.
- The memory detail page renders the When/People/Places/Tags rows only when that data exists —
  don't wait on "When"/«Когда» after saving a story-only memory; wait on the version-history link.

## Flows worth driving

- Today: word appears → type → save → echoed below.
- Full form: `/memories/new` → save → detail → edit → history.
- Settings: language switch (check `<html lang>`, persistence across reload).
- Export/import round-trip on the Export page.
