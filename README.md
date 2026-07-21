# TRYB — Real life, in good company

A minimalist, editorial website for **TRYB** — a platform that curates real-life
invitations so five strangers can become one story. Built as a fast, dependency-free
static site (plain HTML, CSS, JavaScript).

> Design language: *luxury magazine + invitation card + journal + boutique hotel.
> Not a startup.*

## The idea

The homepage is a **blank navy canvas** (`#1e2a44`) with the cursive `tryb`
wordmark. As you move the cursor, brand images **pop** into view along its path.
Inner pages alternate dark and **light (cream/sand/bronze)** editorial sections so
the full five-colour palette is used throughout.

## Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Blank-canvas hero, cursor-popping images, four pillars |
| Why TRYB | `why.html` | Who we are + the case for real conversations |
| Our Promise | `promise.html` | Mission: the joy of meeting people in real life |
| How It Works | `works.html` | The 8-step journey, matching signals, safety |
| Your Invitations | `invitations.html` | Curated invitation cards + mood filters |

> **Language rule:** they are always **Invitations**, never "Events."

## Brand palette (all five in use)

| Token | Hex | Where |
|-------|-----|-------|
| Ink | `#1e2a44` | Canvas, dark sections, text on light |
| Bronze | `#b07a4b` | Eyebrows, accents, "third place" |
| Sand | `#d7cec3` | Soft light sections, muted text, borders |
| Cream | `#f7f2ea` | Paper sections, text on dark, wordmark |
| Ember | `#eb642e` | CTAs, highlights, hover states |

## Features

- **Custom cursor** — dot + trailing ring, grows over interactive elements.
- **Cursor-popping images** — brand imagery appears along the cursor's path.
- **Animated hero background** — canvas "video" of drifting brand-coloured blobs.
- **Scroll reveals**, marquee, hover motion; respects `prefers-reduced-motion`.
- **Fully responsive** with a mobile menu.

## ⚠️ Add your real photos & logo

The four cursor-popping images and the in-card imagery currently use **branded
SVG placeholders** (`assets/pop-1.svg` … `pop-4.svg`) that echo the four photos
you shared. The photos you pasted in chat weren't saved as files, so they could
not be embedded automatically.

To use your real assets:

1. Drop your four photos into `assets/` (e.g. `pop-1.jpg` … `pop-4.jpg`).
2. In each page, update the `<img src="assets/pop-#.svg">` paths inside
   `.float-layer` (and the invitation cards) to your filenames.
3. For the logo, the wordmark renders in **Pacifico** (close to your cursive
   mark). To use the exact logo image, drop it at `assets/logo.png` and swap the
   `.brand` / `.hero__mark` / `.footer-brand` text for an `<img>`.

## Add a brand video

In `index.html`, uncomment the `<video>` block inside `.hero` and add your file
at `assets/hero.mp4`. It layers beneath the wordmark; the animated canvas stays
as a fallback.

## Run locally

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Fonts

Google Fonts: **Pacifico** (wordmark), **Fraunces** (headings), **Inter** (body).
Requires internet on first load.
