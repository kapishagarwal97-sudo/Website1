# TRYB — Studio Website

A minimalist, new-age website for the **TRYB** brand. Built as a fast, dependency-free
static site (plain HTML, CSS and JavaScript) so it can be hosted anywhere.

## The idea

The homepage is a **blank navy canvas** (`#1e2a44`) with the cursive `tryb` wordmark.
As you move the cursor, brand-coloured images **pop** into view and fade away — a living,
playful surface. Inner pages carry the same custom cursor, grain, scroll-reveal
animations and floating imagery.

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Blank-canvas hero, cursor-popping images, links to the four pillars |
| Why TRYB | `why.html` | The story and belief behind the name |
| Mission | `mission.html` | What we build and who we build it for |
| Process | `process.html` | The 5-step method, spark → launch |
| Events | `events.html` | Upcoming event listings |

## Brand palette

| Token | Hex | Use |
|-------|-----|-----|
| Ink (canvas) | `#1e2a44` | Background |
| Bronze | `#b07a4b` | Accents, eyebrows |
| Sand | `#d7cec3` | Muted text, borders |
| Cream | `#f7f2ea` | Primary text, wordmark |
| Ember | `#eb642e` | Highlights, hover states |

## Features

- **Custom cursor** — dot + trailing ring, grows over interactive elements.
- **Cursor-popping images** — abstract brand artwork appears along the cursor's path.
- **Animated hero background** — a canvas "video" of drifting brand-coloured blobs.
- **Scroll reveals** — content fades and rises into view via `IntersectionObserver`.
- **Fully responsive** with a mobile menu.
- **Accessible** — respects `prefers-reduced-motion`; system cursor on touch devices.

## Add your own video

The hero is set up for a real brand film. In `index.html`, uncomment the `<video>`
block inside `.hero` and drop your file at `assets/hero.mp4`:

```html
<video class="hero__video" autoplay muted loop playsinline poster="assets/art-1.svg">
  <source src="assets/hero.mp4" type="video/mp4" />
</video>
```

It layers beneath the wordmark. The animated canvas stays as a fallback.

## Swap the popping images

Replace the SVGs in `assets/` (`art-1.svg` … `art-6.svg`) with your own photos
(`.jpg`/`.png` are fine) and update the `<img src>` paths inside each page's
`.float-layer`.

## Run locally

It's static — open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Fonts

Loaded from Google Fonts: **Pacifico** (wordmark), **Fraunces** (headings),
**Inter** (body). Requires an internet connection on first load.
