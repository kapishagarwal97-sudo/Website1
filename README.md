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

## The form — find your table (`personality-test.html`)

The join flow: **61 questions across 7 sections**, transcribed from
`TRYB_Form_Questions.docx`. One question per screen, self-contained (its own CSS
and JS, no build step, no dependencies).

Every "Join TRYB" entry point links to it: header nav, hero button, "take a
personality test" (step 1), the first FAQ answer, and the footer.

### Progress is a walk to the table

Instead of a bar or a counter, a fixed strip along the bottom shows a round
table with five people and **one empty seat**. Each answer moves your token
along a dotted path toward it, and the caption changes as you go — *setting
out → on your way → getting closer → almost there → one seat away*. Answer the
last question and you arrive: the empty seat fills, the five greet you, and the
caption reads *you're at the table*. No numbers anywhere.

### Sections

| Section | Questions | Type |
|---|---|---|
| I see myself as someone who | 8 | scale 0–7 |
| How strongly do you agree | 6 | scale 0–7 |
| Where do you really land | 8 | single choice, **untimed** |
| How well do you know yourself | 10 | scale 0–7, custom end labels |
| A little more about you | 6 | multi-select |
| Rapid fire | 7 | two tiles, **10-second clock** |
| Essentials | 16 | mixed |

Rapid fire is the only timed part. When its clock runs out the answer is
recorded as blank and the form moves on. Revisiting a rapid-fire question via
Back does not restart the clock.

A short card introduces each section where the way you answer changes. **The
"Join the waitlist" button appears once, on the final screen** — never after a
section.

### Editing questions

They live in the `QUESTIONS` array near the top of the `<script>`:

```js
{ id:"s1",  s:0, type:"scale",  min:0, max:7, text:"…" }        // 0–7, 0–10
{ id:"w1",  s:2, type:"choice", text:"…", options:["…","…"] }   // A–F, untimed
{ id:"r1",  s:5, type:"rapid",  text:"…", options:["…","…"] }   // two tiles, timed
{ id:"h1",  s:4, type:"multi",  text:"…", options:[…] }         // pick any number
{ id:"e3",  s:6, type:"text",   text:"…", placeholder:"…" }     // short answer
{ id:"e8",  s:6, type:"date",   text:"…" }                      // date of birth
```

`s` indexes into `SECTIONS`, `labels:["…","…"]` or `["…","…","…"]` overrides a
scale's end captions, and `SECTION_CARDS` holds the interstitials. Adding or
removing questions needs no other change — the walk recomputes from `QUESTIONS`.

Scales up to ten steps take the number keys; the 0–10 scales are click-only,
since `1` and `10` cannot be told apart on keydown. Answers persist through a
refresh (`localStorage`); the intro then offers to resume or start over.

### Choices made while transcribing

- **Rapid-fire titles were blank** in the form ("Type a question" placeholder) —
  the seven titles here are written to fit the answer pairs and need your sign-off.
- **Name, email and phone are not in the Tally form.** A waitlist with no way
  to reach anyone does not work, so the final screen asks for all three (phone
  optional). These are not counted among the 61 questions. Remove
  `{ kind:"details" }` from `STEPS` if you'd rather not.
- **Date of birth gates at 18+** (`MIN_AGE`), given the alcohol and smoking
  questions. Set it to `0` to remove the gate.
- **Dietary preferences and preferable cuisines are multi-select**; the form has
  them single-select, but both are worded plurally. Change `type:"multi"` to
  `type:"choice"` to revert.
- Fixed from the source: `1 yeear` → `1 year`, "How long have been living" →
  "How long have you been living", and the placeholder `Option 13` in the
  hobbies list was dropped.
- Budget options are set as `₹1,000 – ₹2,000` rather than `Rs. 1000 - Rs. 2000`.

### Sending responses to Google Sheets

1. Create the spreadsheet, then **Extensions ▸ Apps Script**.
2. Replace `Code.gs` with `apps-script/Code.gs` from this repo and save.
3. **Deploy ▸ New deployment ▸ Web app** — *Execute as* **Me**, *Who has access*
   **Anyone**. Authorise it when Google asks.
4. Copy the `/exec` URL and paste it into `SHEET_ENDPOINT` at the top of the
   `<script>` in `personality-test.html`.

Until that URL is set the form runs in **preview mode**: nothing is sent, and
the finish screen shows exactly what would have been recorded.

The sheet is set in `SPREADSHEET_ID` (already pointing at the TRYB responses
sheet), and a `Responses` tab is created on the first submission. Each new
response is inserted at **row 2**, directly under the frozen header, so the
newest is always the row you see — set `NEWEST_FIRST = false` to append instead.

Columns are `Submitted at · Name · Email · Phone` + one per question +
`Unanswered (timed out)` · `Time taken (s)` — **67 in total**. Columns are built from the
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
