# Hero Concept — "The Build Crew"
### A living, expressive minion theatre for the home page

> Logline: A crew of little AI minions boot up, scatter across the screen, forage the tools from the toolkit, haul them home and build something — until a bumbling minion-magician puffs it all away in a blast to his own face, and the real Developer Pass appears. The crew goes *yay*.

This is the home-page hero. It replaces the static Developer Pass with a short, looping, **interactive** show. It runs itself the first time (a ~20s mini-film), then settles into a playable idle world the visitor can poke, grab, and command.

---

## 1. The species

One species, many personalities. They share a silhouette so the screen reads as a *crew*, and are told apart by **prop + accent colour + behaviour + a signature expression** (faces are tiny, so character lives in motion and props, not fine facial art).

Base body: the scanning-visor agent — a bone pixel body, a dark visor slit with one expressive "eye" dot, antenna, bracket arms, stubby legs. Working name for the species: **"the Crew"** (alt names to pick from below).

Shared anatomy we animate for expression:
- **Eye dot** — position = where they look (tracks cursor, blocks, each other); shape = mood (dot = neutral, ring = surprise, arc = happy, flat line = strain/blink).
- **Antenna tip** — lights in their accent colour; flickers when "thinking", droops when tired.
- **Arms** — raise to carry, flex to lift heavy, throw up to cheer.
- **Body tilt + bob** — lean into a push, stagger under weight, hop when excited.

---

## 2. The stage & the spawn zone

- Full-width dark stage (Ship black `#0a0a0a`), faint dot-grid floor.
- **Spawn zone**: a terminal cursor parked bottom-left labelled `agent-runtime`. Minions boot out of it and also bring blocks *back* here to stack.
- **Raw materials**: the toolkit favicons/motifs (Python, PyTorch, Docker, MCP, GraphRAG…) lie scattered across the stage as pick-up-able **blocks**.
- Name overlay top-left (SAJID TAMBOLI + one-line bio); command bar bottom-center.

---

## 3. The storyline — 5 acts (~20s, then loops to idle)

**Act 0 · Cold boot (0–2s).** Black stage, terminal cursor blinks. A line types: `> spawning crew…`.

**Act 1 · Spawn (2–5s).** Minions assemble out of the terminal one by one (pixel column rises → pops into a minion). Each does a one-beat intro true to character (Torch flexes, Visio immediately locks onto your cursor, Nimbus drifts up and has to be tugged down). They look around, blink, stretch.

**Act 2 · Scatter & forage (5–9s).** The crew fans out across the screen toward the scattered tool-blocks — each minion makes a beeline for *its* block (Faiss zigzags like a nearest-neighbour search; Pyo overshoots and doubles back).

**Act 3 · Heavy lifting & build (9–15s).** They pick up blocks and haul them to the spawn zone — light blocks carried easily, heavy ones dragged with comic strain (sweat drop, stagger). Docky aligns them neatly; Kube stands on a block and directs traffic; Rooty links blocks with little graph lines. The blocks **stack into a rocket** ("ship what's next"). The crew steps back, proud.

**Act 4 · The Magician (15–18s).** **Sudo**, the minion-magician (wizard hat, tiny cape, wand), struts in late, takes a theatrical bow, raises the wand — *puff!* The spell **over-fires**: a blast of smoke, soot all over his face, hat askew, a little cough of smoke. The rocket and all the blocks **vanish in the blast**.

**Act 5 · The reveal & yay (18–20s).** From the clearing smoke, the **Developer Pass** rises and settles into place. The crew throws their arms up — *yay!* — little exclamation pixels and hops. Sudo, still sooty, gives a sheepish grin and a bow.

**Idle loop (after).** Minions mill around the badge: some nap, some chase the cursor, Hugo hugs a neighbour, Emcee passes a stray packet around. Always-on micro-motion so it never goes stale.

---

## 4. The cast — 13 minions + 1 magician

Each carries a real tool from your toolkit (the "blocks"), so the build literally assembles your stack.

| # | Name | Carries (block) | Personality | Signature behaviour | Expression tell | Reveal reaction |
|---|------|------------------|-------------|----------------------|------------------|------------------|
| 1 | **Pyo** | Python | Eager generalist, overcommits | Sprints first, overshoots, juggles two blocks, drops one | Wide bright eye, always "on" | Front-row jumping |
| 2 | **Torch** | PyTorch | The muscle / gym bro | Grabs the heaviest block, flexes before lifting | Determined squint + sweat drop | Flex pose |
| 3 | **Tensor** | TensorFlow | Torch's rival twin | Races Torch to out-lift, sulks if beaten | Smug half-eye | Arm-wrestles Torch |
| 4 | **Faiss** | FAISS / vectors | The speedster scout | Zigzag dash (nearest-neighbour), fastest forager | Motion-blur eye | Victory lap |
| 5 | **Docky** | Docker | Neat-freak organiser | Aligns every block perfectly, fixes others' messes | Calm, content arc | Tidies the confetti |
| 6 | **Nimbus** | AWS / cloud | Dreamy, lazy, floaty | Drifts upward, gets distracted, slow drags | Sleepy half-lidded eye | Floats up, happy |
| 7 | **Emcee** | MCP | The connector / social | Relays blocks between minions, never carries far | Chatty wink | Hi-fives everyone |
| 8 | **Rooty** | GraphRAG | The librarian/thinker | Links blocks with graph lines, ponders placement | Thoughtful glint | Nods sagely |
| 9 | **Query** | PostgreSQL | The dependable archivist | Slow but never drops; stacks in tidy rows | Steady, unblinking | Steady clap |
| 10 | **Hugo** | Hugging Face | The friendly hugger | Hugs blocks & minions, causes traffic jams | Warm closed-eye smile | Group hug |
| 11 | **Visio** | OpenCV | The watcher / paparazzi | Locks onto the cursor, follows it, bumps into things | Big tracking eye | Films the badge |
| 12 | **Sonnet** | Claude | The clever poet | Graceful, helps stragglers, leaves tiny notes | Serene | Takes a bow |
| 13 | **Kube** | Kubernetes · EKS | The foreman | Stands on a block, points, orchestrates the others | Authoritative brow | Salutes the badge |
| ✦ | **Sudo** (magician) | the wand | Dramatic showman, overconfident | Late entrance, big bow, casts the puff — blast backfires | Grand → shocked → sooty sheepish grin | Sheepish bow |

---

## 5. Interactivity (reactive + expressive, always)

- **Cursor:** all minions glance toward the cursor; if it sweeps through them they scatter and regroup; Visio actively follows it.
- **Grab & toss:** pick up any minion — it dangles and protests; throw it — it tumbles, lands dizzy (spiral eye), shakes it off, walks back.
- **Hover a minion:** floats its name + the tool it carries.
- **Click Sudo:** re-casts the puff → replays the disappear + badge reveal (the replay button, in-world).
- **Command bar / chips:** `gather`, `scatter`, `build` (re-run the haul), `show work` (line up + reveal your projects), `reset`.
- **Hover the badge:** the crew turns and cheers.
- **Reduced-motion:** if the visitor prefers reduced motion, skip the film — show the badge immediately with a calm, still crew (no auto-animation).

---

## 6. Build path (so we actually land it)

1. **Engine + 4 hero minions (vertical slice).** Spawn → forage → carry → stack, with Pyo, Torch, Docky, Visio. Prove the feel, weight, and expressiveness.
2. **The magician beat.** Sudo entrance → puff → blast → badge reveal → yay. Prove the comedic timing.
3. **Expand to all 13 + idle loop.** Add the rest, personalities, idle behaviours.
4. **Interactivity polish.** Grab/toss, hover tags, command bar, click-to-replay.
5. **Port to hero** as `BuildCrew` component — lazy-loaded, render-paused off-screen, reduced-motion fallback; log the engine in SETUP.md.

We approve at each stage before moving on, so we never thrash a 14-character build all at once.

---

## 7. Open decisions (to lock before Stage 1)
- **Species name:** "the Crew" · "Stackers" · "Shipmates" · "Cores" — or yours.
- **What they build** before the magic: a **rocket/ship** (nods to "ship what's next") · your initials **ST** · a tower · the badge's rough outline.
- **Playback:** auto-play the film once on load → then interactive idle (recommended) · or fully interactive sandbox with a "play story" button.

---

## 8. Addendum v2 — emergent behaviour & ongoing life

The crew isn't choreographed frame-by-frame. Each minion has a few **trait dials**, and the comedy *emerges* from simple rules colliding — so no two visits look the same.

**Trait dials (per minion, 0–1):**
- `strength` — how many blocks it can carry (1, 2, or 3) and how fast under load.
- `greed` — likelihood to grab extra blocks (and then struggle / drop one).
- `laziness` — chance to slack: sit, nap, wander off, "work to rule".
- `mischief` — chance to steal a block from another, or shove a slacker.
- `pride` — how hard it shows off (flex, victory lap) and sulks when bested.

**Emergent actions these produce (the "limitless possibilities"):**
- Carry **1, 2 or 3** blocks; the greedy ones overload, wobble, and **drop one** mid-walk.
- **Theft:** a mischievous minion snatches a block off a carrier; chase ensues.
- **Slacking:** a lazy one downs tools and naps — until a **foreman/bossy** minion stomps over and **smacks it back to work** (it grumbles, complies).
- **Hand-offs:** the social ones relay blocks instead of carrying (MCP-style).
- **Rivalry:** two race for the same block; loser sulks, winner struts.
- **Collisions & pile-ups:** huggers cause traffic jams; blocks tumble.
- **The straggler:** one brings **nothing** the whole time, just supervises / gets in the way — and somehow still cheers loudest at the reveal.

**Decisions locked:**
- **Build:** a **rocket** assembled from the tool-blocks — pays off "ship what's next," then the magic swaps it for the badge.
- **Playback:** **auto-play the ~20s film once**, then the crew **keeps living** — ongoing emergent plots (thefts, naps, rivalries, hand-offs, cursor games) with no fixed end. Not a static idle; a tiny world that keeps running. `prefers-reduced-motion` → skip to the badge with a calm still crew.
- **Count:** 10–15 minions + Sudo the magician.

**Species name:** **Blips** — each minion is a little blip of compute.
