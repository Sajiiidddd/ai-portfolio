# The Blips — parked

A self-contained "living crew" hero animation. **Currently NOT used on the site** —
it's parked here so the portfolio stays clean. Everything you need to understand it,
play with it, or ship it back into the site lives in this folder.

---

## What it is

**The Blips** are a crew of 13 cute, smooth-vector mascot characters that live on an
HTML5 canvas. Each is a *shallow-depth box* — a dominant front face (a little screen
with eyes) plus a thin top and side sliver for depth — with curly-brace `{ }` arms,
little legs and shoes, and a unique accent colour. They turn in real 3D space by
scaling their width through zero (so they can face you, turn side-on, or show their
back), and they're heading-locked: while walking they face their direction of travel
(biased toward facing the viewer), and they settle front-on when they stop.

It is **not** pixel art and **not** Three.js/WebGL — it's anti-aliased Canvas 2D
drawing, on a `#0a0a0a` "Ship" aesthetic.

### The crew (roster)

Each Blip has its own signature behaviour:

| Blip | Accent | Signature |
|---|---|---|
| Pyo | blue | stacks tools |
| Torch | orange | gym-bro push-ups |
| Tensor | teal | dumbbell curls (Torch's rival) |
| Faiss | sky | skates / kickflips |
| Docky | grey | sweeps up litter |
| Nimbus | purple | floats a balloon |
| Emcee | coral | sings on a mic |
| Rooty | green | paints |
| Hugo | pink | seeks hugs |
| Visio | amber | takes photos (flash) |
| Kube | gold | foreman — whistles, smacks slackers |
| Snooze | lilac | naps |
| Grub | lime | eats bananas, drops peels |

Plus **Sudo**, a wizard who only appears for the finale.

### What they do

- **Autonomous life**: wander, do their signature acts, and pair off for *plots* —
  high-fives, hugs, arguments, gossip, help-ups, theft, bat fights (bump + stars +
  knockdown → cry → console), arm-wrestles, photos, balloon rescues, paint-fights,
  see-saw, tug-of-war, leap-frog — plus group scenes (rocket, dance party, conga).
  They keep a relationship memory, so friends and rivals emerge over time.
- **Full emotions**: neutral, happy, sad, cry, angry, dizzy, scared, sleepy,
  surprise, proud, jealous.
- **User interaction**: hover to get noticed; grab & drag a Blip; drop it hard → it's
  dizzy, or set it down gently → it gives you a heart; tap → it giggles; tap a
  paint-splattered one → it gets cleaned; click Nimbus's balloon → it pops and a
  friend blows a new one. Others react when one of them is grabbed.
- **Props spawn with the Blip** (Grub's banana → dropped peel that others slip on),
  never pre-scattered. Nobody ever leaves the screen; faces are never covered.

### The film (`blips-hero.html`)

The cinematic storyline, in order:

1. **Boot** — the crew spawns out of a terminal cursor and scatters.
2. **A day in the life** — the full living playground for a while.
3. **Build** — the crew hauls the tech stack (Python, PyTorch, TF, FAISS, Docker,
   AWS, Postgres, MCP, Graph — real logos on the tiles) and assembles a rocket,
   straining, sweating, and occasionally fumbling a tile.
4. **Magic** — **Sudo** the wizard struts in, raises his wand… the puff backfires:
   flash, soot, the rocket vanishes, Sudo is left sooty and sheepish.
5. **Reveal** — a card rises from the smoke and **crossfades into the real Developer
   Pass**; the crew freezes in awe ("…woah."), then cheers.
6. **Idle** — the pass stays; the crew drops back into ambient free-play.

---

## Files in this folder

| File | What it is |
|---|---|
| `blips-playground.html` | Standalone living playground (autonomous life + full user interaction). Open in any browser. |
| `blips-hero.html` | Standalone full film (boot → life → build → magic → reveal → idle), with a minimal Developer-Pass card. Open in any browser. |
| `BlipsLayer.tsx` | The React/Next client wrapper — a full-viewport fixed canvas that mounts the engine and crossfades the canvas card into the site's real `.ab-pass` DOM card. |
| `blipsEngine.ts` | The canvas engine (ported from `blips-hero.html`). `// @ts-nocheck`, no dependencies — pure Canvas 2D. |

> Tip: just double-click `blips-playground.html` or `blips-hero.html` to see it run —
> no build step needed.

---

## How to ship it back into the site

The React port (`BlipsLayer.tsx` + `blipsEngine.ts`) is ready to go. To re-enable:

1. **Move the two files into the build:**
   - `blips/BlipsLayer.tsx`  → `src/components/BlipsLayer.tsx`
   - `blips/blipsEngine.ts`  → `src/components/blipsEngine.ts`

2. **Remove `"blips"` from `exclude`** in `tsconfig.json` only if you left other
   files here you want type-checked (not required just to run the component).

3. **Mount it on the home page** (`src/app/page.tsx`):
   - add the import near the top:
     `import BlipsLayer from "@/components/BlipsLayer";`
   - render it once, just after `</nav>` (before the hero `<section>`):
     `<BlipsLayer />`

That's it. No other wiring, no new dependencies.

### What it expects on the page

The film's finale crossfades into the site's existing Developer Pass, so the home
page must contain those elements (they already do):

- `.ab-pass` — the Developer Pass card (used to position the reveal).
- `.ab-tilt` — the pass's wrapper; the engine sets its `opacity` (hidden until the
  reveal, then faded in). If you rename these, update `getPassRect` / the
  `.ab-tilt` selector in `BlipsLayer.tsx`.

### Behaviour & accessibility

- Plays the **full film once on load**, then loops to ambient free-play.
- **`prefers-reduced-motion`**: the crew is skipped entirely and the pass is shown
  immediately.
- The canvas is `position: fixed; z-index: 1; pointer-events: none`, so it sits
  **behind** your content (z-2) and never blocks clicks. Interaction is wired on
  `window` and ignores clicks over links/buttons/`.ab-pass`. To make the crew walk
  *over* the page instead of behind it, raise the canvas `zIndex`.

### Performance levers (in `blipsEngine.ts`)

These exist because a full-viewport canvas on a heavy page can get expensive:

- **Pixel ratio** — `dpr = Math.min(devicePixelRatio || 1, 1.25)`. Drop to `1` for
  more speed, raise toward `2` for more crispness.
- **Frame cap** — the loop gates on `now - last < 22` (~45 fps). Raise the number to
  cap lower (e.g. `33` ≈ 30 fps).
- **Crew size** — the `ROSTER` array (13 Blips). Trim it for lighter machines.
- **Layout reads** are throttled (the pass position is measured ~5×/sec, never during
  idle) and a **singleton guard** destroys any previous instance on mount so dev
  hot-reloads can't stack render loops.
- The canvas is isolated onto its own GPU layer (`transform: translateZ(0)`,
  `contain: strict`) so it doesn't force the page to repaint on scroll.

> Note on lag: when this was live, the main causes of jank were (1) measuring the DOM
> pass every frame (forced reflow) and (2) zombie animation loops piling up across
> hot-reloads. Both are now mitigated in the engine, but if you re-ship it and still
> see jank, start with `dpr = 1` and a smaller `ROSTER`.

---

## Design history (so future-you doesn't relitigate it)

The look was locked after a lot of iteration: **smooth vector, shallow-depth box,
monochrome bone body, dark screen face, brace arms** — explicitly *not* pixel art and
*not* WebGL. The full design notes and concept bible were kept alongside the project
during development; this README is the canonical summary. If you revive it, keep the
locked look — that part is settled.
