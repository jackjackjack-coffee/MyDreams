# MyDreams — Session Context

> Read this on session start. It captures everything decided so far. The user is a **total beginner who has never coded** — explain decisions in plain language, do the coding yourself, ask before committing/pushing.

---

## What we're building

A browser-based 3D "metaverse-lite" world where strangers leave dreams (text, image, or video) for other strangers to discover by walking around and clicking glowing markers.

- **No login required.** Anonymous-auth via Supabase.
- **Async multiplayer:** everyone sees the same world and all dream markers, but no real-time avatars. You're alone in a shared garden of wishes.
- **Monetization (ads in-world) is v2.** Architecture must not block it but don't design for it yet.
- **Working repo:** https://github.com/jackjackjack-coffee/MyDreams (main, currently 1 commit)
- **User's GitHub:** `jackjackjack-coffee`
- **User's email:** `brown172635@gmail.com`

The plan file with full reasoning is at `~/.claude/plans/i-want-to-create-flickering-willow.md`.

---

## Stack (locked)

| Layer | Choice |
|---|---|
| Build tool | **Vite** |
| Language | **TypeScript** |
| UI framework | **React 18** |
| 3D | **React Three Fiber** (Three.js) |
| 3D helpers | **@react-three/drei** |
| Physics | **@react-three/rapier** |
| Styling | **Tailwind CSS** |
| Backend (planned) | **Supabase** (Postgres + Storage + Anon Auth) |
| Moderation helper | `bad-words` npm |
| Hosting (planned) | **Vercel** |

All deps already installed (`npm install` is done). Dev server: `npm run dev` → http://localhost:5173

### Working on the web vs. locally

This project supports two modes:

- **Local on your laptop:** `npm run dev`, open http://localhost:5173. Fast iteration, full HMR.
- **Claude Code on the web:** the dev server runs inside a cloud container — `http://localhost:5173` from there is *not* reachable from your laptop. To verify changes:
  1. Let Claude push the branch to GitHub.
  2. Vercel auto-deploys a preview URL for the PR.
  3. Open the preview URL in your browser.

Don't expect localhost to work when Claude is running on the web. Always check the dev server log to confirm it actually came up — if it's there, the preview build will be fine too.

---

## Build order — where we are

1. ✅ Scaffold (Vite + R3F + Rapier + Supabase SDK + Tailwind)
2. ✅ First 3D scene (sky, ground, placeholder cube)
3. ✅ First-person walking (WASD + PointerLockControls + Rapier capsule)
4. ✅ Decorate the world with landmarks (watercolor storybook aesthetic)
4b. ✅ **Visual polish pass** — branching Mother Tree, dome mushroom caps, toon shading on terrain/trunk/islands/mushrooms/stones, drei `<Outlines>` for cel edges, fewer/larger standing stones
5. ✅ Dream marker + click interaction (real marker, color-coded glow, R3F raycaster on `onClick`)
6. ✅ Supabase setup — schema in `supabase/schema.sql`, walkthrough in `SETUP.md`
7. ✅ Load dreams from DB (initial fetch + realtime inserts)
8. ✅ Place-a-dream form — text + image tabs working (image picker with drag-drop, preview, size cap)
9. ✅ Image uploads — Supabase Storage `dream-media` bucket, 5 MB cap, per-user folder RLS, public-read
10. ✅ Video uploads — same `dream-media` bucket, 50 MB cap, MP4/WebM/MOV, picker + drag-drop, caption, popup player
11. ✅ Dream popup viewer — text + image + video, Copy-link button, per-dream remount (`key`) fix
12. ✅ Safety pass — 500-char cap, profanity filter, Report button, size caps, **DB-level rate limits** (5 dreams/hr + 5 uploads/hr per user, enforced in RLS — no Edge Function needed), one-report-per-user-per-dream, **auto-hide at 3 reports** via trigger, `moderation_queue` view reviewed from the Supabase dashboard (SETUP.md §9)
13. ⏳ Polish + deploy to Vercel — Vercel preview auto-deploys already working (deploy step still pending)
14. ✅ **Polish phase 1** — procedural ambient audio (`src/audio/ambient.ts`: wind/drone/chimes/footsteps, all WebAudio, no files; mute button top-left), world density (`src/world/flora/Grass.tsx` ~9k instanced wind-swept blades in one draw call, `Pebbles.tsx` 120 rocks, denser flowers/mushrooms/crystals/stones), embodied movement (head-bob + footsteps in `Player.tsx`)
15. ✅ **Polish phase 2** — cinematic post-processing (`src/world/effects/Postprocess.tsx`): tamed Bloom (threshold 0.34/intensity 1.35), cool desaturated grade, film-grain `Noise` (paper feel), softer vignette. Deliberately NO depth-of-field/tilt-shift (nausea + perf on a first-person camera; fog already handles far-haze).
16. ✅ **Polish phase 3 — procedural textures** (`src/world/textures.ts`, all canvas-2D/DataTexture, no asset files): painterly mottle on the terrain (tiled near-white map multiplying the vertex colors), bark streaks + knots on the Mother Tree trunk/branches (one shared material), lichen-mottled rock on standing stones (map + bump) and pebbles, and animated water ripples on the lake (procedural normal map scrolled each frame, doubling as reflection `distortionMap`). All textures near-white so they modulate the locked palette instead of repainting it; seamless tiling via wrapped stamps / integer-frequency waves.

**Also in place:** shareable deep links (`?dream=<id>` teleports to + opens that dream), "Drift to a random dream" button + dream count on the start overlay, `supabase/seed.sql` with 20 starter dreams (SETUP.md §8). Also fixed: the remote-HDR `<Environment preset>` that crashed the whole canvas to black if the CDN failed — now an in-engine `Lightformer` environment (`World.tsx`), no network dependency.

**Branch / PR state (as of this handoff):**
- Active branch: **`claude/mydreams-phase-3-textures-7xfbhk`** (continues from `claude/fervent-meitner-AJEqQ` / PR #9 history). Contains: safety pass + sharing (step 12), polish phases 1–3.
- Headless-verification gotcha discovered this session: under the container's software renderer the physics steps are so large the player capsule falls straight through the terrain, so first-person screenshots show only sky. Workaround for screenshots: temporarily set the Player RigidBody to `type="fixed"` (revert before committing). Does NOT happen on real machines at normal frame rates.
- Build verified: `npx tsc -b` clean, `npm run build` succeeds. Headless render shows no shader/runtime errors (exact exposure/colour only judgeable on the real GPU / Vercel preview — the cloud container's software renderer blows out bright surfaces, so don't trust its brightness).
- **User still must, in Supabase:** (1) re-run `supabase/schema.sql` (re-runnable, adds `hidden` column + rate-limit funcs/policies + auto-hide trigger + moderation view; no data loss); (2) optionally run `supabase/seed.sql` once; (3) enable Anonymous Sign-In (Auth → Providers); (4) add `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` to Vercel env vars.

**Decision locked this session:** Phase 3 = **procedural textures only** — surface detail (bark/ground/rock/water) generated in code via noise/shaders. The "code-generated only, no asset files" rule STAYS (user chose not to relax it for hand-made CC0 textures or 3D models). Revisit models/textures-as-files later only if the user asks.

**Next-PR backlog:**
- Performance pass on a weak machine (grass count, shadow map size, bloom kernel are the knobs)
- Deploy to Vercel — step 13

---

## Aesthetic — LOCKED to Luma watercolor storybook

The user reviewed ~12 reference images from Leonardo (Phoenix 1.0), Google Flow (Imagen 4), Skybox AI, Luma AI, and Kling 3.0. **Selected aesthetic: Luma watercolor.** *Not* Kling-polished-anime, *not* Leonardo-cinematic. Loose painted storybook.

User's exact directive:
> "go with luma concept but do not directly copy the image. use all available skills and plugins and mcps that are necessary. Keep the vibe and atmosphere."

### Visual brief (translate to code, don't replicate the image)

- **Style:** loose watercolor / picture-book. Soft edges, hand-painted feel, NOT photorealistic, NOT polished anime.
- **Mood:** dreamy, ethereal, mythical, calm, sacred. The vibe of *Over the Garden Wall* / Studio Ghibli / Journey-game at twilight.
- **Time of day:** eternal twilight. Sky glows lavender-rose at horizon, deepens to indigo overhead. First stars visible.
- **Sky elements:** faint teal-and-gold **aurora ribbons** drifting slowly across the sky. **Two small moons** low on horizon — one warm gold, one cool silver-blue. A few stars.
- **Hero landmark:** an impossibly tall **slate-blue Mother Tree**, canopy lost in low clouds, bioluminescent **blue motes drift upward from its base**. Visible from anywhere.
- **Mid-distance:** 2–3 small **floating islands** drifting low in the sky (with grass/stones on top). A distant **mountain peak** with a single warm light point ("The Far Light," can never be reached).
- **Ground:** rolling sage-teal hills with silver-tipped grass. Knee-high blue-tinted **ground fog** in low patches.
- **Flora:** glowing **pollen flowers** (tall stems with bloom-orb tops releasing cyan motes), **crystalline pink-magenta mushrooms** clusters, **bluebell-like cyan glowing flowers** in foreground, **pink crystal clusters** as occasional accents.
- **Stones:** **mossy standing stones** in small clusters, weathered, with faint glowing runes optional.
- **Bioluminescent ground sparkle:** tiny scattered cyan light points through the grass — the secret-sauce detail.
- **Color palette:**
  - Sky: `#7a5e94` (lavender) → `#cf8a8a` (rose horizon) → `#2a2547` (indigo zenith)
  - Grass: `#5e8a7a` to `#7ba89a` (sage-teal, NOT emerald green)
  - Highlights: warm gold `#e8c279`, cool silver-blue `#a8c5e0`, soft cyan `#6dd5d8`, pink-magenta `#d8a0c4`
  - Shadows: deep blue-violet `#3a3358` — never neutral gray/black

### How dream markers fit in

CRITICAL: dream markers (added in step 5) **are part of the flora**, not UI bolted on. A tall stem, glowing orb at top, gentle hum, particles. They look like wishing flowers until you walk up to one and click. Color-coded glow: gold=text, cyan=image, magenta=video.

---

## Implementation hints for step 4

**Don't try to replicate the Luma image pixel-by-pixel.** Build the same *vibe* in code:

| Element | Recommended technique |
|---|---|
| Watercolor look | drei `<EffectComposer>` with a custom watercolor post-process (kuwahara filter, or grain + soft edge) |
| Toon edges | drei `<Outline>` effect on objects OR custom shader with stepped lighting |
| Rolling hills | Procedural Perlin/simplex noise displacement on a subdivided plane |
| Lavender/rose sky | Custom gradient skydome shader OR drei `<Sky>` with tuned `turbidity`, `rayleigh`, `inclination` |
| Aurora ribbons | Animated transparent curved planes with shader noise + additive blending |
| Ground fog | R3F native `<fog />` (cheap) + low-altitude particle layer |
| Wishing flowers / grass | Instanced thin meshes + drei `<Sparkles>` for motes |
| Crystalline mushrooms | Low-poly geometry with `emissive` material |
| Standing stones | Hand-built low-poly rocks, scattered via instancing |
| Mother Tree | Single large mesh — trunk + billboard for canopy fade-into-clouds |
| Floating islands | Simple low-poly chunks with subtle vertical bob (`useFrame` sine wave) |
| Bloom (the glow) | drei `<EffectComposer>` + `<Bloom>` — **this is what makes glowy things actually glow** |
| Bioluminescent grass sparkle | drei `<Sparkles>` scattered at ground level |

**Reference Three.js / R3F docs via the `context7` MCP** when you need current API syntax — the library evolves fast.

---

## Project structure

```
MyDreams/
├── CLAUDE.md                # this file
├── index.html
├── package.json             # all deps installed
├── vite.config.ts
├── tsconfig.json / .node.json
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
└── src/
    ├── main.tsx             # React entry
    ├── App.tsx              # Canvas + KeyboardControls + overlay UI
    ├── styles.css           # Tailwind base
    ├── vite-env.d.ts
    ├── ui/
    │   └── Settings.tsx     # gear menu, mouse sensitivity slider, persisted to localStorage
    └── world/
        ├── World.tsx        # sky + ground + placeholder cube — REPLACE in step 4
        └── Player.tsx       # first-person controls + Rapier capsule
```

When you add new files for step 4, suggested layout:

```
src/world/
├── World.tsx                # composes everything
├── Player.tsx               # don't touch
├── sky/Sky.tsx              # sky dome, aurora, moons, stars
├── terrain/Terrain.tsx      # rolling hills + ground collider
├── landmarks/MotherTree.tsx
├── landmarks/FloatingIslands.tsx
├── landmarks/FarLight.tsx   # distant mountain + light
├── flora/Mushrooms.tsx
├── flora/WishingFlowers.tsx
├── flora/StandingStones.tsx
├── flora/CrystalClusters.tsx
└── effects/Postprocess.tsx  # bloom + watercolor pass
```

---

## Settings already in place

- **Mouse sensitivity slider** lives in `src/ui/Settings.tsx`. Top-right gear button when pointer is unlocked. Persisted to `localStorage` under key `mydreams.mouseSensitivity` (default `1.0`, range `0.1`–`3.0`).
- **Keyboard map:** WASD + arrows for movement, Space for jump (see `KEYS` in `App.tsx`).
- **Esc** releases pointer lock (browser default).

---

## Tools & MCPs to use

- **`context7` MCP** — fetch up-to-date docs for `@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`, `three`. Prefer this over guessing from training data; the libraries change fast.
- **Playwright MCP** — to take screenshots of the running dev server when you want to verify a step visually. Browser may need re-opening if the previous session closed it.
- **`verify` skill** — run the app and confirm a step worked end-to-end after building it.
- **`run` skill** — re-launch the dev server if it's not running (it was running in the previous session via `npm run dev`).
- **Background processes** — use `run_in_background: true` on Bash for the dev server so HMR keeps working while you edit files.

---

## Conventions

- **Type-check after every meaningful change:** `npx tsc -b`. Catch typos before runtime — the user can't easily read errors.
- **Don't commit without asking.** User reviews progress before commits.
- **Don't push without asking.** Especially since the repo is public.
- **Don't add new deps without flagging.** Current deps were chosen carefully; ask before adding more.
- **Don't ship AI-generated images as game assets.** All visuals must be code-generated (shaders, geometry, particles). AI images are reference-only.
- **Mobile is v2.** Desktop-first; ignore touch controls.
- **Real-time multiplayer is out of scope.** Don't add WebSocket / Yjs / etc.

---

## What the user wants from interaction

- Plain-English explanations alongside code changes (they're a beginner)
- Visible progress every step — HMR reload is the heartbeat
- Pause for them to actually walk around / click after each step before moving on
- Options laid out clearly when there's a creative decision; recommend a default
- Honesty when something isn't going to work cheaply (e.g. Skybox paywall)

---

## Immediate next action

**Polish phase 3 — procedural textures (stays 100% code-generated; no asset files).** User picked this over hand-made CC0 textures/models, so the "everything is code" rule holds.

Goal: give surfaces a hand-painted tooth so they stop reading as flat primitives, using code-drawn detail only (canvas-2D textures, `DataTexture`, or noise in shaders via `onBeforeCompile`). Highest-value targets, in order:
1. **Ground/terrain** — a subtle procedural variation (mottled sage-teal, faint painterly speckle) instead of the current flat vertex-colour toon. Biggest area on screen.
2. **Mother Tree trunk + branches** — procedural bark stripes/noise so the hero landmark isn't smooth plastic.
3. **Standing stones + pebbles** — procedural rough/mottled rock.
4. **Water (Lake)** — animated ripple/normal detail (already reflective; add moving normals or caustic-ish shimmer).
5. Optional: gentle procedural normal/bump so twilight lighting catches surface detail.

Keep it CHEAP (weak-machine target) and keep the locked palette (sage-teal grass, blue-violet shadows, gold/cyan/magenta highlights). After each surface, have the user check the **Vercel preview** (the cloud container's software renderer blows out brightness — don't judge look locally).

Watch-outs for the next session:
- Container is ephemeral: `npm install` may be needed; `node_modules` and un-pushed work do not survive restarts. Everything real is on branch `claude/fervent-meitner-AJEqQ` / PR #9.
- To screenshot-verify headless: Playwright is global at `/opt/node22/lib/node_modules/playwright`, Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; launch with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`. Drive the FP camera by dispatching synthetic `mousemove` with `movementX/Y` after clicking to lock (negative movementY = look down).
- Type-check after every change: `npx tsc -b`. Then `npm run build`.
- Don't commit/push without asking; end commit messages with the Co-Authored-By / session trailers.

Dev server: `npm run dev`. If a previous background instance is gone, just relaunch it.
