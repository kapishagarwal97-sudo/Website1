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

## Personality test (`personality-test.html`)

The join flow. One question per screen, a hairline progress bar with no counts,
and a 7-second timer on the value-section multiple choice only. Self-contained —
its own CSS and JS, no build step, no dependencies.

Every "Join TRYB" entry point links to it: header nav, hero button, "take a
personality test" (step 1), the first FAQ answer, and the footer.

**Editing questions.** They live in the `QUESTIONS` array near the top of the
`<script>`. Each entry is one of:

```js
{ id:"b1", part:0, type:"scale",  max:5, text:"…" }              // 1–5 or 1–7
{ id:"c1", part:2, type:"choice", timed:true, text:"…",          // A/B/C/D
  options:["…","…"] }
```

`part` indexes into `PARTS` (the section labels), `timed:true` turns on the
7-second clock, and an optional `labels:["…","…","…"]` overrides the
disagree/neutral/agree captions for one scale question. Adding or removing
questions needs no other change — the progress bar and section ticks recompute.

Answers survive a refresh (saved to `localStorage`); the intro then offers to
resume or start over. The draft is discarded once a response is sent.

### Sending responses to Google Sheets

1. Create the spreadsheet, then **Extensions ▸ Apps Script**.
2. Replace `Code.gs` with `apps-script/Code.gs` from this repo and save.
3. **Deploy ▸ New deployment ▸ Web app** — *Execute as* **Me**, *Who has access*
   **Anyone**. Authorise it when Google asks.
4. Copy the `/exec` URL and paste it into `SHEET_ENDPOINT` at the top of the
   `<script>` in `personality-test.html`.

Until that URL is set the form runs in **preview mode**: nothing is sent, and
the finish screen shows exactly what would have been recorded.

A `Responses` tab is created on the first submission. Columns are built from the
payload and matched by header name after that, so adding questions later just
adds columns — existing rows stay aligned. `SUBMIT_TOKEN` must match on both
sides; it plus a honeypot field keeps casual bots out. Note that the endpoint URL
is visible in the page source, which is inherent to posting from a static site —
the token deters scripted junk, it does not authenticate anyone.

Re-deploy the Apps Script (**Deploy ▸ Manage deployments ▸ edit ▸ Version: New**)
after any change to `Code.gs`, or the live URL keeps running the old version.

## Run locally

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Fonts

Google Fonts: **Pacifico** (nods to the logo), **Fraunces** (headings), **Inter**
(body). Requires internet on first load.
