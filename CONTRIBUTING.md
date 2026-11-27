# Contributing to LINEUP

Thanks for helping make this better. It is a deliberately small, no-build-step project — keep it that way.

## Ground rules

- **No build step, no frameworks.** Plain HTML/CSS/JS. If you think you need a dependency, open an issue first.
- **Design system first.** Paper `#f4f3f0`, ink `#151412`, grey `#77736c`, hairline `#e3e0da`. Instrument Serif for display type, Manrope for UI. Pill buttons, soft shadows, `cubic-bezier(.76,0,.24,1)`.
- **Calm motion only.** Nothing bouncy, nothing fast.
- **Accessibility is not optional.** Keyboard paths, focus-visible states, `prefers-reduced-motion`, sensible alt text.
- **Prices are USD.** Keep copy short and plain.

## Dev setup

```sh
python3 -m http.server 8080   # serve the site at http://localhost:8080
npm run check                 # asset references + JS syntax
npm i --no-save jsdom && npm run smoke   # headless smoke test
```

## Pull requests

1. Fork, branch, make your change.
2. Run `npm run check` and `npm run smoke` — CI runs the same.
3. One concern per PR. Include before/after screenshots for visual changes.
4. Fill in the PR template honestly.

## Reporting bugs

Use the issue template. Include browser, OS, and steps to reproduce.
