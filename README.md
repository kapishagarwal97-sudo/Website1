# TRYB — Real life, in good company

A minimalist, editorial **one-page** website for **TRYB** — a platform that curates
real-life invitations so five strangers can become one story. Built as a fast,
dependency-free static site (plain HTML, CSS, JavaScript).

> Design language: *luxury magazine + invitation card + journal + boutique hotel.
> Not a startup.*

## Structure (single scrolling page — `index.html`)

Each section is sized close to one screen; the nav smooth-scrolls to anchors.

| # | Section | Anchor | Notes |
|---|---------|--------|-------|
| 1 | **Hero** | `#top` | Blank navy canvas, real cursive logo, polaroid photo clusters fanning from the corners, cursor-popping images |
| 2 | **What is TRYB** | `#what` | "The world doesn't need another social app" + tilted poster cards |
| 3 | **Our Promise** | `#promise` | Bronze manifesto — bring back the joy of meeting in real life |
| 4 | **How it works** | `#how` | Four big scroll-revealed steps (222-style), ~2 screens |
| 5 | **Experiences** | `#experiences` | Full-screen 3-slide auto slider (cinematic → trade timeline → matching) |
| 6 | **Invitations** | `#invites` | City filters + horizontal invite carousel with "tryb invited you" chips |
| 7 | **FAQ** | `#faq` | Accordion |
| — | **Footer** | | Logo + 5 links + © line |

Header (logo + Why TRYB / Our Promise / How It Works / Invitations / **Join TRYB**)
is fixed and permanent; it gains a translucent dark bar once you scroll.

## Brand palette (all five in use)

| Token | Hex | Where |
|-------|-----|-------|
| Ink | `#1e2a44` | Canvas, dark sections, text on light |
| Bronze | `#b07a4b` | Eyebrows, accents, promise band |
| Sand | `#d7cec3` | Muted text, borders |
| Cream | `#f7f2ea` | Paper sections, text on dark, polaroid frames |
| Ember | `#eb642e` | CTAs, highlights, hover states |

## Assets

- `logo.png` — the real cursive TRYB logo (transparent), used in header, hero,
  loader and footer.
- `pop-1..6.jpg` — the supplied brand poster photos, used for the cursor-popping
  images and the tilted "what is TRYB" cards.
- `scene-*.jpg` — clean crops of the photos (headline/watermark removed), used for
  polaroids, the slider arch timeline, invite cards and the matching photos.
- `av-1..3.jpg` — small avatars for the "your friend invited you" chips.
- Original uploads (`1.png`…`9.png`, `LOGO.jpg`, `Brand Mood 1.jpeg`) are kept as
  source files; the site serves the optimised derivatives above.

## Add a real video (slider slide 1)

Slide 1 currently uses a darkened brand photo. To use a real film, swap the
`.slide--cine .slide__bg > img` for a `<video autoplay muted loop playsinline>`.

## Run locally

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Fonts

Google Fonts: **Pacifico** (nods to the logo), **Fraunces** (headings), **Inter**
(body). Requires internet on first load.
