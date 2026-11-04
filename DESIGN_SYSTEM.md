# FinPilot × Behance — Reverse-Engineered Design System

**Source:** `behance.net/gallery/255759877/FinPilot-AI-Personal-Finance-App-UI-UX-Design`
**Inspected:** 2026-11-04, live DOM + CSSOM in a Chromium browser (Turkish locale, logged out)

---

## 0. How to read this report

The URL contains **two separate design systems**, and this report covers both:

| Layer | What it is | How values were obtained | Confidence |
|---|---|---|---|
| **A. FinPilot (the product)** | The finance app shown in the case-study images | Read from the case study's own style-guide panel (hex labels, typeface sheet) and visual inspection of 13 project images | **Exact** where the designer printed a hex code; **≈ estimated** (marked `≈`) where sampled by eye. Pixel sampling was blocked because the image CDN doesn't send CORS headers. |
| **B. Behance (the host page)** | Adobe Behance's web UI ("Be" design system) | Extracted from 826 CSS custom properties in the CSSOM, plus `getComputedStyle` on rendered elements | **Exact.** These values come straight from the site's CSS. |

If you want to rebuild **the FinPilot app**, use Layer A. If you want to rebuild **a Behance-like portfolio or gallery UI**, use Layer B.

---

# PART A — FinPilot App Design System

## A1. Overview and principles

> Brief from the case study's client quote: *"a brand that feels intelligent and financially empowering."*

- **Visual language:** Clean, airy iOS-native fintech. White surfaces on a very light grey canvas (`#F5F6F7`), with one confident sky blue (`#41A1FD`) carrying brand and action.
- **Pastel data coding:** Financial categories get soft tinted cards (blue = income, lavender = expenses, lilac = comparison), so meaning comes through colour without loud saturation.
- **Numbers come first:** Very large balance figures with **de-emphasised decimals** (`$12,480` in black, `.00` in light grey) and tabular-style alignment.
- **AI as a companion:** AI surfaces use the sparkle glyph and blue text highlights ("finance **ai assistant.**"), and sit in a tinted card instead of a modal.
- **Soft geometry:** Generous radii, pill controls, and a floating black pill tab bar. There are almost no hard borders, and shadows are very subtle.
- **Tone:** Confident, calm, friendly ("Good morning Alex", "Hi Alex, I'm Finpilot!").

## A2. Colour tokens

### Brand palette (printed in the style guide)

| Token | HEX | RGB | Role |
|---|---|---|---|
| `brand-500` | **#41A1FD** | 65, 161, 253 | Primary brand, logo tile, primary CTA ("Let's talk"), progress fill, AI highlights |
| `lavender-200` | **#D0D1FF** | 208, 209, 255 | Expenses card, secondary data tint |
| `lilac-200` | **#E7D0FF** | 231, 208, 255 | "Vs last month" card, tertiary data tint |
| `neutral-50` | **#F5F6F7** | 245, 246, 247 | App canvas / grouped background |
| `white` | **#FFFFFF** | 255, 255, 255 | Cards, sheets |
| `black` | **#000000** | 0, 0, 0 | Primary text, tab bar, filled chips, "GET" button |

### Brand blue ramp (≈ sampled from the 8-step swatch column)

| Token | ≈ HEX | Use |
|---|---|---|
| `brand-1000` | ≈ #000000 | Ramp anchor |
| `brand-900` | ≈ #0A2347 | Dark navy surfaces (type-specimen panel) |
| `brand-700` | ≈ #0B4C9A | Pressed state, dark accents |
| `brand-600` | ≈ #2D7FE0 | Hover on primary |
| `brand-500` | **#41A1FD** | Base |
| `brand-300` | ≈ #7BBEFE | Progress track dots, decorative |
| `brand-200` | ≈ #A8D3FE | Problem-statement panel, income tint |
| `brand-100` | ≈ #D6E9FF | AI-insights card bg, light chips |

### Semantic

| Token | ≈ HEX | Observed use |
|---|---|---|
| `danger-500` | ≈ #EF4E54 | Coral-red brand swatch; "+12.3%" spending-up badge; "Scheduled" label |
| `success-500` | ≈ #22C55E | "● Live" status in AI chat header; wireframe step dot |
| `warning` | *not observed* | Suggested: `#F5A524` |
| `info` | = `brand-500` | AI insights, links ("Adjust budget") |

### Text

| Token | ≈ HEX | Use |
|---|---|---|
| `text-primary` | #000000 / ≈ #0E0E10 | Headlines, amounts |
| `text-secondary` | ≈ #6B6F76 | Labels ("Available Balance", "This week") |
| `text-tertiary` | ≈ #A3A7AE | Decimals, metadata ("Groceries · Chase Checking · 3:11 PM") |
| `text-brand` | #41A1FD | Inline highlights, text buttons |

## A3. Typography

**Primary typeface: Geist** (Vercel; free on Google Fonts and npm `geist`). Weights shown on the specimen: **Regular 400, Medium 500, SemiBold 600, Bold 700**.
The case-study marketing headlines ("One insight drove everything.") use a light/regular grotesk at display size. This looks like Geist 400 as well.

| Style | ≈ Size / Line height | Weight | Letter-spacing | Example |
|---|---|---|---|---|
| `display-balance` | 44 / 48 | 500 | −0.02em | `$12,480` (decimals: same size, `text-tertiary`) |
| `display-hero` | 34 / 40 | 400 | −0.02em | "Your personal finance ai assistant." |
| `title-lg` | 28 / 34 | 500 | −0.01em | `$3,840.00` (spending) |
| `title-md` | 20 / 26 | 600 | −0.01em | "Evangeline!", "Transaction Summary" |
| `title-sm` | 16 / 22 | 600 | 0 | Card headings ("Upcoming", "Suggestions for you") |
| `body` | 14 / 20 | 400 | 0 | Insight copy, list titles |
| `body-strong` | 14 / 20 | 600 | 0 | "Dining is running 28% above your usual pace." |
| `caption` | 12 / 16 | 400 | 0 | Metadata, "This week" |
| `micro` | 10 / 14 | 500 | +0.04em, UPPERCASE | "PROBLEM DEFINITION", "AGE RATING" |
| `button` | 14 / 20 | 600 | 0 | "Adjust budget", "Ask Finpilot" |

## A4. Spacing and sizing (≈, 4-pt grid)

| Token | px | Use |
|---|---|---|
| `space-1` | 4 | Icon ↔ label |
| `space-2` | 8 | Stat-card gap, chip gap |
| `space-3` | 12 | Card inner padding (compact stat cards) |
| `space-4` | 16 | Screen side margin, card padding |
| `space-5` | 20 | Section gap |
| `space-6` | 24 | Large card padding |
| `space-8` | 32 | Between major blocks |
| Tab bar height | ≈ 56 | Floating pill nav |
| List row height | ≈ 56–64 | Transactions |
| Icon size | 16 / 20 / 24 | Inline / list / nav |

## A5. Elevation

| Token | ≈ Value | Use |
|---|---|---|
| `elev-0` | none | Tinted cards sitting on the canvas |
| `elev-1` | `0 1px 2px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04)` | White cards on `#F5F6F7` |
| `elev-2` | `0 8px 24px rgba(0,0,0,.08)` | Floating widgets (spending card), tab bar |
| `elev-3` | `0 16px 40px rgba(0,0,0,.12)` | Modals / sheets (inferred) |

## A6. Borders and radii

| Token | ≈ px | Use |
|---|---|---|
| `radius-xs` | 6 | Small badges ("+12.3%") |
| `radius-sm` | 8 | Icon buttons in stat cards |
| `radius-md` | 12 | Stat cards, list groups |
| `radius-lg` | 16 | Main cards (AI insights, spending) |
| `radius-xl` | 24 | Marketing panels, app-store sheet |
| `radius-2xl` | 28 | App icon tile (iOS squircle) |
| `radius-full` | 9999 | Chips, CTA buttons, tab bar, avatar |
| `border-subtle` | 1px `#ECEDEF` | List dividers, outline chips |

## A7. Breakpoints

FinPilot is presented as an **iOS app at a 390 × 844 pt frame (iPhone 14/15/16)**. No responsive web breakpoints exist for it. For a web build, reuse the Behance breakpoints (B6) or a standard `sm 640 / md 768 / lg 1024 / xl 1280` set.

## A8. Component inventory

### Balance header
- **Anatomy:** avatar 40 (circle) + greeting caption + `title-md` name → bell icon button (top-right, 36 circle, outline) → centred `caption` "Available Balance" → `display-balance` amount with grey decimals → `caption` "Across 3 accounts".
- **Usage:** Home screen hero.

### Stat card (Income / Spent / Vs last month)
- **Anatomy:** label (caption) → value (`title-sm`, sign-prefixed `+$6,200` / `−$3,840` / `+4.2%`) → corner arrow icon-button (white, `radius-sm`, ↗/↙).
- **Variants:** `income` (brand-100 bg), `expense` (lavender-200), `compare` (lilac-200).
- **Layout:** 3-up grid, `space-2` gap, `radius-md`.
- **States:** tappable. Press = darken tint about 4% (suggested).

### AI Insight card
- **Anatomy:** header row (sparkle icon + "AI Insights" caption + close ×) → `body-strong` headline → `caption` explanation → divider → two text buttons ("Adjust budget" brand-blue | "Ask Finpilot" black).
- **Style:** `brand-100` bg, `radius-lg`, no shadow.
- **States:** dismissible; buttons have hover/press underline or tint.

### Progress meter ("Safe to spend with last month?")
- **Anatomy:** title + right caption ("12 days left") → dotted track with brand-500 filled segment and glowing knob → footer ("$3,240 spent of $4,600" | "70% used").
- **Style:** fill `brand-500`, track dots `brand-300` at 40%, knob halo `brand-200`.

### Spending chart card
- **Anatomy:** label + delta badge (red pill "+12.3%") → `title-lg` amount → "Details" text button → **dot-matrix bar chart** (black = current period, grey = background grid) → footer comparison ("Aug $2,250.23 · Sep **$4,230.23**").
- **Signature element:** dot-matrix bars rather than solid bars.

### Filter chips (segmented)
- **Variants:** `selected` = black fill, white text. `default` = white fill, 1px subtle border, black text.
- **Shape:** `radius-full`, height ≈ 28, padding 12 horizontal, `caption`/600.

### Transaction list row
- **Anatomy:** 36 leading icon tile (tinted, `radius-sm`, brand logo glyph) → title (`body` 600) + meta (`caption`, tertiary) → trailing amount (`body` 600, `−$84.20`).
- **Grouping:** date section header ("Today", "Oct 1") with right-aligned daily total; rows sit in a white `radius-md` group.

### Floating tab bar
- **Anatomy:** black pill (`radius-full`, ≈ 56 h) with 5 icons. The active item is a white circle with a black icon; inactive icons are white at 70%.
- **Position:** floating ~16px above the safe-area bottom, centred, `elev-2`.

### AI chat screen
- **Header:** back chevron + "FinPilot Ai" `title-sm` + sub-caption + right "● Live" (success green).
- **Hero:** sparkle → "Hi Alex, I'm Finpilot!" → `display-hero` with brand-blue highlight words.
- **Suggestion list:** white card titled "Suggestions for you" with rows (brand icon tile → prompt text → chevron).
- **Composer:** bottom pill input "Ask about bills, budgets, or plans…" with a circular send button.

### Buttons
| Variant | Style | Example |
|---|---|---|
| Primary | `brand-500` bg, white text, `radius-full`, h 44, optional leading icon | "🎙 Let's talk" |
| Contrast | black bg, white text, `radius-full`, h 32 | "GET" |
| Text | no bg, brand-500 or black text, 600 | "Adjust budget", "Details" |
| Icon (outline) | 36 circle, 1px subtle border | Bell |
| Icon (filled) | 28, white, `radius-sm` | Stat-card arrows |

States (inferred, not shown): hover = `brand-600`, active = `brand-700`, focus = 2px `brand-500` ring at 2px offset, disabled = `#E6E8EB` bg, `#A3A7AE` text.

### Badges
- **Delta badge:** `danger-500` bg, white `micro`/600, `radius-xs`, leading ↑ icon.
- **Status pill:** outline 1px black, `radius-full`, uppercase `micro` ("PROBLEM DEFINITION").
- **Notification dot:** red circle with white count on the app icon (iOS style).

### Budget donut ("Monthly Budget")
- A thick ring split into segments (Shopping / Health / Invest / Tax) with a centred amount ("$10,000") and a legend list with dot markers.

---

# PART B — Behance Host-Page Design System ("Be" tokens, exact)

## B1. Overview

Behance uses a mature, token-driven system: primitive colour ramps (`--be-color-*-rgb`), semantic aliases (`--be-text-*`, `--be-bg-*`, `--be-border-*`), and component tokens (`--be-button-*`, `--be-input-*`). Light mode lives on `:root`; dark mode is a `.be-theme-dark` class that remaps the semantic aliases. The look is neutral and gallery-like: content first, an off-white canvas, one electric blue for actions, pill-shaped buttons, and Adobe's **Acumin Pro** typeface.

## B2. Colour primitives (exact)

**Neutrals**

| Token | HEX | RGB |
|---|---|---|
| `--be-color-white` | #FFFFFF | 255,255,255 |
| `--be-color-grey-50` | #F9F9F9 | 249,249,249 |
| `--be-color-grey-100` | #F0F0F0 | 240,240,240 |
| `--be-color-grey-200` | #ECECEC | 236,236,236 |
| `--be-color-grey-300` | #E8E8E8 | 232,232,232 |
| `--be-color-grey-350` | #E0E0E0 | 224,224,224 |
| `--be-color-grey-400` | #CDCDCD | 205,205,205 |
| `--be-color-grey-500` | #909090 | 144,144,144 |
| `--be-color-grey-600` | #707070 | 112,112,112 |
| `--be-color-grey-650` | #595959 | 89,89,89 |
| `--be-color-grey-700` | #474747 | 71,71,71 |
| `--be-color-grey-800` | #303030 | 48,48,48 |
| `--be-color-grey-900` | #191919 | 25,25,25 |
| `--be-color-black` | #000000 | 0,0,0 |

**Blue (brand / action)**

| Token | HEX | RGB |
|---|---|---|
| `blue-100` | #F5F8FF | 245,248,255 |
| `blue-150` | #EBF1FF | 235,241,255 |
| `blue-200` | #E0EAFF | 224,234,255 |
| `blue-300` | #BFD2FF | 191,210,255 |
| `blue-400` | #6292FF | 98,146,255 |
| `blue-450` | #146AFF | 20,106,255 |
| **`blue-500`** | **#0057FF** | 0,87,255 ← `--be-brand-color` |
| `blue-700` | #003ECB | 0,62,203 |
| `blue-800` | #002F9A | 0,47,154 |
| `blue-900` | #0F214D | 15,33,77 |

**Green / Red / Orange / Purple / Slate**

| Token | HEX | | Token | HEX |
|---|---|---|---|---|
| `green-100` | #E8F3E8 | | `red-100` | #FAE7E5 |
| `green-300` | #02CB00 | | `red-300` | #FFC5C1 |
| `green-400` | #028901 | | `red-400` | #EB1000 (= `--adobe-red`) |
| `green-500` | #1A8316 | | `red-500` | #D00D00 |
| `green-700` | #046700 | | `red-700` | #AA0000 |
| `green-900` | #024400 | | `red-900` | #910000 |
| `orange-100` | #FFFCF8 | | `purple-100` | #F7E9F9 |
| `orange-200` | #FEF7F1 | | `purple-500` | #B125C0 (AI star icon) |
| `orange-300` | #FCE2CC | | `slate-100` | #E6F1F4 |
| `orange-500` | #F97C00 | | `slate-500` | #0A7494 |

**Translucent:** `--be-color-translucent-{black|white}-{100…900}` = `rgba(0|255, …, 0.1 … 0.9)`.

**Gradients:** Pro button `rgba(1,136,253) → rgba(0,59,255) → rgba(0,31,170)`. AI banner `linear-gradient(90deg, rgba(252,223,255,.5) 0%, #F5F8FF 100%)`. Promo banner `blue-800 → blue-500 → blue-800`.

## B3. Semantic colour aliases (light → dark)

| Alias | Light | Dark (`.be-theme-dark`) |
|---|---|---|
| `--be-text-primary` | grey-900 #191919 | white |
| `--be-text-secondary` | grey-600 #707070 | grey-500 |
| `--be-text-disabled` | grey-500 #909090 | — |
| `--be-text-error` | red-500 #D00D00 | — |
| `--be-text-accent` | blue-500 | grey-500 |
| `--be-bg-primary` | white | grey-900 |
| `--be-bg-secondary` | grey-50 #F9F9F9 (page canvas) | grey-800 |
| `--be-bg-tertiary` | grey-200 | grey-700 |
| `--be-bg-accent-primary` | blue-500 | grey-200 |
| `--be-bg-accent-secondary` | blue-100 | grey-800 |
| `--be-border-primary` | grey-300 #E8E8E8 | grey-700 |
| `--be-border-primary-hover` | grey-400 | grey-600 |
| `--be-border-accent` | blue-500 | grey-700 |
| `--be-action-color` | blue-500 → hover blue-700 → active blue-800 | white |
| `--be-confirmation-color` | green-400 → green-700 → green-900 | — |
| `--be-warning-color` | red-500 → red-700 → red-900 (bg #FAE7E5) | — |
| `--be-modal-backdrop` | rgba(0,0,0,.65) | — |

## B4. Typography (exact)

**Font stacks**
- `--be-acumin-font-stack`: `'acumin-pro', 'Acumin Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif` (**base**, loaded from Adobe Typekit)
- `--be-acumin-wide-font-stack`: `'acumin-pro-wide', …`
- `--be-tungsten-font-stack`: `'Tungsten A', 'Tungsten B', 'Tungsten', 'Arial Narrow'` (condensed display)
- `--be-utopia-font-stack`: `'Utopia', Georgia, serif`
- `--be-adobe-clean-font-stack`: `'adobe-clean', …` plus CJK fallbacks
- Icon font: `BeIcons.woff2`. Social icons: `'SSSocial'`.

**Weights:** light 300 · normal 400 · semibold 600 · bold 700 · black 800.

**Size scale**

| Token | rem | px | Semantic alias |
|---|---|---|---|
| `--be-font-size-1` | 0.625 | 10 | legal disclaimer, sidebar heading |
| `--be-font-size-2` | 0.75 | 12 | small description / small button / small input |
| `--be-font-size-2-5` | 0.813 | 13 | checkbox/radio label, tags, badges |
| `--be-font-size-3` | 0.875 | 14 | normal button, input, secondary paragraph |
| `--be-font-size-4` | 0.9375 | 15 | paragraph, large input |
| `--be-font-size-5` | 1 | 16 | label, nav, section header, large button |
| `--be-font-size-5-5` | 1.125 | 18 | CTA, small subhead |
| `--be-font-size-6` | 1.25 | 20 | subhead, callout, search |
| `--be-font-size-7` | 2.75 | 44 | headline |
| `--be-font-size-8` | 4 | 64 | hero |
| `--modal-title-font-size` | 1.875 | 30 | modal title |

Parallel "Spectrum-style" scale: `--be-font-size-20…400` = 9 / 11 / 12 / 13 / 14 / 15 / 16 / 18 / 20 px. Paragraph line height is `1.45em`.

**Computed usage on this page (most frequent first):** 16/400/20.8 · 12/400/15.6 (body default; `body` is 12px, line height 1.3) · 12/700 · 14/700/18.2 · 20/400/28 · 15/400/22 · 14/600. Project title `h1` = 16px/700. Popup `h2` = 20px/700/24.

## B5. Spacing scale (exact, `--be-sp-*`, 1 unit = 0.25rem)

| Token | px | | Token | px | | Token | px |
|---|---|---|---|---|---|---|---|
| `sp-px` | 1 | | `sp-4` | 16 | | `sp-16` | 64 |
| `sp-0-5` | 2 | | `sp-4-5` | 18 | | `sp-20` | 80 |
| `sp-1` | 4 | | `sp-5` | 20 | | `sp-24` | 96 |
| `sp-1-25` | 5 | | `sp-5-5` | 22 | | `sp-28` | 112 |
| `sp-1-5` | 6 | | `sp-6` | 24 | | `sp-32` | 128 |
| `sp-2` | 8 | | `sp-7` | 28 | | `sp-40` | 160 |
| `sp-2-5` | 10 | | `sp-7-5` | 30 | | `sp-48` | 192 |
| `sp-3` | 12 | | `sp-8` | 32 | | `sp-64` | 256 |
| `sp-3-25` | 13 | | `sp-10` | 40 | | `sp-80` | 320 |
| `sp-3-5` | 14 | | `sp-11` | 44 | | `sp-96` | 384 |
| `sp-3-75` | 15 | | `sp-12` | 48 | | | |

**Layout aliases:** text spacers 6 / 10 / 16 / 20 · grid spacer 10 / 20 · input row/column gap 20 · modal padding 32 (mobile 16, large 44) · modal width 500 (large 800) · `--be-modal-content-padding` 30px.

## B6. Elevation (exact)

| Token | Value |
|---|---|
| `--be-box-shadow-small` | `0 1px 2px rgba(0,0,0,.20)` |
| `--be-box-shadow-card` | `0 1px 10px rgba(0,0,0,.10)` |
| `--be-box-shadow` | `0 5px 20px rgba(0,0,0,.13)` |
| `--be-tooltip-box-shadow` | `0 1px 5px rgba(0,0,0,.30)` |
| `--be-box-shadow-blue` | `0 1px 15px 0 rgba(0,87,255,.20)` |
| `--be-box-shadow-blue-large` | `0 1px 20px 0 rgba(0,87,255,.20)` |
| `--be-box-shadow-blue-light` | `0 1px 15px 0 rgba(0,87,255,.05)` |
| `--be-navigation-menu-trigger-box-shadow` | `0 0 3px 0 rgba(0,0,0,.10)` |

## B7. Borders and radii (exact)

`--be-border-width: 1px` · `--be-border-primary-shorthand: 1px solid #E8E8E8`

| Token | rem | px | Used by |
|---|---|---|---|
| `--be-border-radius-1` | 0.25 | 4 | inputs, select trigger |
| `--be-border-radius-1-25` | 0.313 | 5 | popover |
| `--be-border-radius-1-5` | 0.375 | 6 | modal, tooltip, pill info buttons, PRO badge |
| `--be-border-radius-2` | 0.5 | 8 | dialog, rounded badge |
| `--be-border-radius-2-5` | 0.625 | 10 | — |
| `--be-border-radius-3` | 0.75 | 12 | — |
| `--be-border-radius-5` | 1.25 | 20 | — |
| `--be-border-radius-7-5` | 1.875 | 30 | — |
| `--be-border-radius-25` | 6.25 | 100 | **buttons (pill)**, nav, dialog close, prev/next |

## B8. Breakpoints (exact, from `@media` rules)

Main layout tiers:

| Tier | Query |
|---|---|
| Mobile | `max-width: 603px` (sub-tier `445–603`, `max-width: 488px`) |
| Tablet | `604px – 1024px` (also `604–921`, `max-width: 921px`) |
| Desktop | `min-width: 1025px` |
| Grid columns (gallery) | `604–1038` · `1039–1200` · `1201–1488` · `1489–1912` · `≥1913` |
| Image srcset tiers | `601` · `1401` · `1801` · `2201` · `2601` · `3001` |
| Feature queries | `(hover: hover)`, `(hover: none)`, `(prefers-reduced-motion: reduce)`, `(prefers-contrast: more)`, `-webkit-min-device-pixel-ratio: 2` |

## B9. Motion (computed)

`background-color .2s ease-in-out, border-color .2s ease-in-out` (buttons) · `background-color .15s linear` · `color .3s, background .3s, border .3s` · `filter .2s ease-in-out` (image hover). `prefers-reduced-motion` is respected.

## B10. Component inventory (Behance)

### Button (`BeButton`)
| Variant | Default | Hover | Active | Border | Text |
|---|---|---|---|---|---|
| **Primary** | blue-500 #0057FF | blue-700 #003ECB | blue-800 #002F9A | transparent | white |
| **Secondary** | white | grey-100 | grey-300 | grey-300 | grey-900 |
| **Tertiary** | blue-100 #F5F8FF | blue-200 | blue-300 | blue-200 → blue-300 | blue-500 |
| **Contrast** | grey-900 | grey-700 | grey-500 | transparent | white |
| **Ghost** | rgba(0,0,0,.65) | .80 | .95 | transparent | white |
| **Minimal** | transparent | transparent | transparent | transparent | grey-600 |
| **Confirmation** | green-400 | green-700 | green-900 | — | white |
| **Reject** | red-500 | red-700 | red-900 | — | white |
| **Disabled** | grey-300 bg, grey-500 text | | | | |

**Sizes:** small h 28 (pad 8/14, 12px) · normal h 32 (pad 0 20 1, 14px/600) · large h 40 (pad 14/28, 16px). All `radius 100px`.
**Measured:** "Giriş Yap" tertiary = 14px/600, `#0057FF` on `#F5F8FF`, `1px solid #E0EAFF`, h 32, padding `0 20px 1px`.
**Focus:** `--be-accessibility-outline-color` = blue-500 (white on dark surfaces).

### Icon / round action button
32×32 circle, white bg, `1px solid #E8E8E8` (sidebar "Save", "Embed", owner avatars). Scroller arrows: 40px, white, `radius 100px`.

### Input / Select
Height `32 + 2×1px border`. Border grey-400 → hover grey-600 → focus blue-500 → error red-500. Radius 4px. Text grey-900 14px, placeholder grey-600. Disabled bg grey-100 with grey-500 text. Notched floating label in 13px bold. Select item padding 12/16, 14px/600. Dropdown hover = blue-500 bg with white text.

### Switch
Track blue-200 → hover blue-300 → on blue-500 → on-hover blue-700. Handle white. Border blue-300/400.

### Badge
Height 15–32, text 13px, radius 8 (rounded) or pill. Colour pairs (bg / text): blue `#0057FF`/white · green `#E8F3E8`/`#046700` · orange `rgba(249,124,0,.1)`/`#F97C00` · purple `rgba(177,37,192,.1)`/`#B125C0` · red `rgba(208,13,0,.1)`/`#D00D00` · grey `#F0F0F0`/`#474747` · celadon `#E6F1F4`/`#0A7494`. PRO pill = 9px/700, radius 6, blue gradient.

### Tag / "Pill-shaped info" tiles (tools and fields)
h 47, radius 6, 12px white text on a brand-coloured bg (Photoshop `#001E36`, Illustrator `#330000`, generic fields `#959595`).

### Card (project cover)
`--be-card-*`: bg `bg-primary`, border `#E8E8E8` → hover `#CDCDCD`, focus outline blue-500. Cover placeholder grey-100. Hover overlay is a black gradient (`--be-bg-translucent-true-black-gradient`).

### Modal / Dialog
Backdrop `rgba(0,0,0,.65)` (lightbox `.9`). Width 500/800. Radius 6–8. Padding 32 (mobile 16). Mobile title bar 45px grey-900. Close button: pill, padding 10, icon grey-600.

### Tooltip / Popover
Tooltip: grey-900 bg, white text, radius 6, padding `10px 15px`, shadow `0 1px 5px rgba(0,0,0,.3)`. Popover: black bg, radius 5, padding 10–20.

### Navigation
Top bar ("Be" logo, hamburger at < 1025px): hamburger button 55px tall, padding `20px 16px`. Nav menu triggers: pill (radius 24), text grey-600 → grey-900, hover bg grey-200, active bg grey-900 (contrast). Tab underline 2px. Hamburger links 11px/600 grey-900.

### Project sticky bar and sidebar
Sticky info bar shows thumbnail + title (16px/700) + owner dropdown + "Follow all" (white pill) + "Appreciate" (blue pill with thumbs-up). There is a floating 48px blue circular "Appreciate" FAB bottom-right, and a vertical sidebar of 32px round icon buttons.

### Progress / Spinner
Spinner 20–36px in brand colour. Progress meter h 8, radius 40, bg blue-100, fill blue-500.

### Banners
Warning: bg orange-100, 4px left border orange-500, icon circle orange-500. AI banner: pink→blue-100 gradient with the purple AI star.

---

## Observations and inconsistencies

1. **Two competing font-size scales on Behance:** `--be-font-size-1…8` and `--be-font-size-20…400` overlap (e.g., 0.75rem appears in both; 0.813 vs 0.8125rem). This looks like a legacy scale left in place during migration to a Spectrum-aligned scale.
2. **Rounding drift:** `--be-sp-1-25` / `--be-border-radius-1-25` = `0.313rem` (5.008px) and `--be-font-size-2-5` = `0.813rem`, which renders as **13.008px** in computed styles. The exact values would be `0.3125rem` / `0.8125rem`.
3. **Token bugs:** `--be-color-orange-200` resolves to `orange-100-rgb` rather than its own `orange-200-rgb`. `--be-base-font-stack` is set to the *string* `--be-acumin-font-stack` with no `var()`. `--be-modal-default-box-shadow-color: rgba(var(--be-color-white), 0.8)` nests an rgba inside rgba, which is invalid. `--be-badge-text-transparent-grey` points to an `-rgb` triplet rather than a colour. A media query `(max-height: var(--be-modal-height)128px)` is malformed, and `preferes-contrast` is misspelled next to the correct one.
4. **Hard-coded escapes:** `--select-error-color: #d00d00` and `--be-warning-background-color: rgba(250,231,229)` duplicate tokens instead of referencing `red-500` / `red-100`. Several `--be-popover-*` values use raw px.
5. **Radius inconsistency:** buttons are `100px` pills, while pill-shaped info tiles use 6px and the CreatorPro "pill" uses 6px. "Pill" means two different shapes.
6. **Breakpoint sprawl:** more than 80 distinct media queries with near-duplicates (1079/1080, 603/604, 1024/1025). Component-level queries were clearly authored ad hoc instead of from shared tokens.
7. **Brand-blue mismatch (A vs B):** FinPilot's `#41A1FD` is a soft sky blue, while Behance's `#0057FF` is electric. Don't mix them when rebuilding either one.
8. **FinPilot case-study copy:** text such as "…moments of joy for young learners" and "every tennis interaction" looks reused from another template. It isn't a design token, but it suggests the presentation layouts are templated.
9. **FinPilot ramp gaps:** no warning/amber semantic is defined, and success green appears only once ("Live"). Production use would need a full semantic set (added as suggestions in the export).

---

## Implementation export

### 1. CSS custom properties: FinPilot app

```css
/* FinPilot — exact where the case study prints hex; ≈ elsewhere */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');

:root {
  /* Brand */
  --fp-brand-100: #D6E9FF;
  --fp-brand-200: #A8D3FE;
  --fp-brand-300: #7BBEFE;
  --fp-brand-500: #41A1FD; /* exact */
  --fp-brand-600: #2D7FE0;
  --fp-brand-700: #0B4C9A;
  --fp-brand-900: #0A2347;

  /* Data tints */
  --fp-lavender-200: #D0D1FF; /* exact */
  --fp-lilac-200:    #E7D0FF; /* exact */

  /* Neutrals */
  --fp-white:      #FFFFFF;  /* exact */
  --fp-neutral-50: #F5F6F7;  /* exact */
  --fp-neutral-100:#ECEDEF;
  --fp-neutral-400:#A3A7AE;
  --fp-neutral-600:#6B6F76;
  --fp-black:      #000000;  /* exact */

  /* Semantic */
  --fp-success: #22C55E;
  --fp-danger:  #EF4E54;
  --fp-warning: #F5A524; /* suggested */
  --fp-info:    var(--fp-brand-500);

  /* Aliases */
  --fp-bg-canvas: var(--fp-neutral-50);
  --fp-bg-surface: var(--fp-white);
  --fp-text-primary: var(--fp-black);
  --fp-text-secondary: var(--fp-neutral-600);
  --fp-text-tertiary: var(--fp-neutral-400);
  --fp-border-subtle: var(--fp-neutral-100);
  --fp-card-income: var(--fp-brand-100);
  --fp-card-expense: var(--fp-lavender-200);
  --fp-card-compare: var(--fp-lilac-200);

  /* Type */
  --fp-font: 'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --fp-fs-micro: 10px;  --fp-fs-caption: 12px; --fp-fs-body: 14px;
  --fp-fs-title-sm: 16px; --fp-fs-title-md: 20px; --fp-fs-title-lg: 28px;
  --fp-fs-hero: 34px;  --fp-fs-balance: 44px;
  --fp-fw-regular: 400; --fp-fw-medium: 500; --fp-fw-semibold: 600; --fp-fw-bold: 700;

  /* Space (4pt) */
  --fp-space-1: 4px;  --fp-space-2: 8px;  --fp-space-3: 12px; --fp-space-4: 16px;
  --fp-space-5: 20px; --fp-space-6: 24px; --fp-space-8: 32px;

  /* Radius */
  --fp-radius-xs: 6px; --fp-radius-sm: 8px; --fp-radius-md: 12px; --fp-radius-lg: 16px;
  --fp-radius-xl: 24px; --fp-radius-full: 9999px;

  /* Elevation */
  --fp-elev-1: 0 1px 2px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04);
  --fp-elev-2: 0 8px 24px rgba(0,0,0,.08);
  --fp-elev-3: 0 16px 40px rgba(0,0,0,.12);
}
```

### 2. CSS custom properties: Behance core (exact, trimmed to essentials)

```css
:root {
  --be-color-white:#FFFFFF; --be-color-black:#000000;
  --be-color-grey-50:#F9F9F9; --be-color-grey-100:#F0F0F0; --be-color-grey-200:#ECECEC;
  --be-color-grey-300:#E8E8E8; --be-color-grey-400:#CDCDCD; --be-color-grey-500:#909090;
  --be-color-grey-600:#707070; --be-color-grey-700:#474747; --be-color-grey-800:#303030;
  --be-color-grey-900:#191919;
  --be-color-blue-100:#F5F8FF; --be-color-blue-200:#E0EAFF; --be-color-blue-300:#BFD2FF;
  --be-color-blue-500:#0057FF; --be-color-blue-700:#003ECB; --be-color-blue-800:#002F9A;
  --be-color-green-400:#028901; --be-color-green-700:#046700;
  --be-color-red-500:#D00D00;  --be-color-red-700:#AA0000;
  --be-color-orange-500:#F97C00; --be-color-purple-500:#B125C0;

  --be-text-primary:var(--be-color-grey-900); --be-text-secondary:var(--be-color-grey-600);
  --be-bg-primary:var(--be-color-white); --be-bg-secondary:var(--be-color-grey-50);
  --be-border-primary:var(--be-color-grey-300); --be-brand-color:var(--be-color-blue-500);

  --be-font:'acumin-pro','Acumin Pro','Helvetica Neue',Helvetica,Arial,sans-serif;
  --be-border-radius-1:.25rem; --be-border-radius-1-5:.375rem; --be-border-radius-2:.5rem;
  --be-border-radius-25:6.25rem;
  --be-box-shadow-small:0 1px 2px rgba(0,0,0,.2);
  --be-box-shadow-card:0 1px 10px rgba(0,0,0,.1);
  --be-box-shadow:0 5px 20px rgba(0,0,0,.13);
}
.be-theme-dark {
  --be-text-primary:var(--be-color-white); --be-text-secondary:var(--be-color-grey-500);
  --be-bg-primary:var(--be-color-grey-900); --be-bg-secondary:var(--be-color-grey-800);
  --be-border-primary:var(--be-color-grey-700);
}
```

### 3. Tailwind config (FinPilot)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: { 100:'#D6E9FF', 200:'#A8D3FE', 300:'#7BBEFE', 500:'#41A1FD', 600:'#2D7FE0', 700:'#0B4C9A', 900:'#0A2347', DEFAULT:'#41A1FD' },
        lavender: { 200:'#D0D1FF' },
        lilac:    { 200:'#E7D0FF' },
        neutral:  { 50:'#F5F6F7', 100:'#ECEDEF', 400:'#A3A7AE', 600:'#6B6F76' },
        success: '#22C55E', danger: '#EF4E54', warning: '#F5A524',
      },
      fontFamily: { sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      fontSize: {
        micro:   ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
        caption: ['12px', { lineHeight: '16px' }],
        body:    ['14px', { lineHeight: '20px' }],
        'title-sm': ['16px', { lineHeight: '22px' }],
        'title-md': ['20px', { lineHeight: '26px', letterSpacing: '-0.01em' }],
        'title-lg': ['28px', { lineHeight: '34px', letterSpacing: '-0.01em' }],
        hero:    ['34px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        balance: ['44px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
      },
      borderRadius: { xs:'6px', sm:'8px', md:'12px', lg:'16px', xl:'24px' },
      boxShadow: {
        'elev-1': '0 1px 2px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04)',
        'elev-2': '0 8px 24px rgba(0,0,0,.08)',
        'elev-3': '0 16px 40px rgba(0,0,0,.12)',
      },
    },
  },
};
```

### 4. W3C design-tokens JSON (FinPilot)

```json
{
  "color": {
    "brand":   { "500": { "$value": "#41A1FD", "$type": "color" },
                 "100": { "$value": "#D6E9FF", "$type": "color" },
                 "700": { "$value": "#0B4C9A", "$type": "color" } },
    "tint":    { "lavender": { "$value": "#D0D1FF", "$type": "color" },
                 "lilac":    { "$value": "#E7D0FF", "$type": "color" } },
    "neutral": { "0":  { "$value": "#FFFFFF", "$type": "color" },
                 "50": { "$value": "#F5F6F7", "$type": "color" },
                 "1000": { "$value": "#000000", "$type": "color" } },
    "semantic": { "success": { "$value": "#22C55E", "$type": "color" },
                  "danger":  { "$value": "#EF4E54", "$type": "color" } }
  },
  "font": {
    "family": { "base": { "$value": "Geist, system-ui, sans-serif", "$type": "fontFamily" } },
    "weight": { "regular": { "$value": 400 }, "medium": { "$value": 500 },
                "semibold": { "$value": 600 }, "bold": { "$value": 700 } }
  },
  "radius": { "sm": { "$value": "8px" }, "md": { "$value": "12px" },
              "lg": { "$value": "16px" }, "full": { "$value": "9999px" } },
  "space":  { "1": { "$value": "4px" }, "2": { "$value": "8px" }, "3": { "$value": "12px" },
              "4": { "$value": "16px" }, "6": { "$value": "24px" }, "8": { "$value": "32px" } }
}
```
