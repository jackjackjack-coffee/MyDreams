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

---

## Build order — where we are

1. ✅ Scaffold (Vite + R3F + Rapier + Supabase SDK + Tailwind)
2. ✅ First 3D scene (sky, ground, placeholder cube)
3. ✅ First-person walking (WASD + PointerLockControls + Rapier capsule)
4. 🟢 **NEXT — Decorate the world with landmarks (watercolor storybook aesthetic)**
5. ⏳ Hardcoded dream marker + click interaction
6. ⏳ Supabase setup (DB + storage + RLS)
7. ⏳ Load dreams from DB
8. ⏳ Place-a-dream form (text first)
9. ⏳ Image uploads
10. ⏳ Video uploads
11. ⏳ Dream popup viewer
12. ⏳ **Safety pass** (report button, rate limit, profanity filter, file size caps) — **non-negotiable before any public link**
13. ⏳ Polish + deploy to Vercel

Task tracker has all 13 steps; step 4 is unblocked and ready.

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

Start **Step 4: Decorate the world with landmarks** in the locked Luma watercolor aesthetic.

Suggested order within step 4:
1. **Sky overhaul first** (gradient dome + moons + aurora) — biggest visual impact, no physics dependency
2. **Terrain replacement** (rolling hills instead of flat plane) — affects walking, do early so Player still works
3. **Fog + bloom postprocess** — sets the mood instantly
4. **Mother Tree** in the distance as the hero landmark
5. **Floating islands + far mountain light**
6. **Foreground flora:** flowers, mushrooms, standing stones, crystals, bioluminescent grass sparkle
7. **Watercolor post-process** as the final polish

After step 4 is in: have the user walk around and react. Tune toward "softer/dreamier" or "sharper/more defined" based on what they say. Then move to step 5 (first dream marker).

Dev server should still be runnable via `npm run dev`. If a previous background instance is gone, just relaunch it.
