# Lulu Valentine Cinematic Experience

A cinematic interactive valentine letter for **Tokoloho "Lulu" Mahaotsane**, designed with richer product-level motion and atmosphere.

## Design direction (inspiration synthesis)

This refinement pass intentionally borrows from motion principles seen in top animated product experiences:

- **Apple-style cinematic pacing** (intentional staging, reveal hierarchy)
- **Stripe-like ambient gradients and depth** (layered light for premium feel)
- **Linear-like motion discipline** (fast response + smooth micro-interactions)
- **Award-site storytelling rhythm** (ritual interaction → reveal → emotional close)

## What changed

- Rebuilt the visual scene with stronger lighting, depth, and premium atmosphere
- Added a richer envelope ritual: drag progress ring + tilt + responsive movement
- Added typed-ink reveal for each paragraph (instead of static fade-only)
- Added atmospheric FX canvas (stars + floating hearts)
- Upgraded pacing and transitions for better emotional rhythm
- Preserved keyboard accessibility (`Enter`/`Space`) and replay flow

## Run locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploy to Vercel

This project is static and uses `vercel.json`.

### CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Dashboard

1. Push repo to GitHub/GitLab/Bitbucket
2. Import in Vercel
3. Framework: **Other**
4. Build command: *(empty)*
5. Output directory: `.`
