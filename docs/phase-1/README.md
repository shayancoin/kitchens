# Particle Lifeform (Three.js) — Drop‑in bundle

Extracted from CodePen “Born of Data – A Three.js Particle Lifeform” by VoXelo.
This bundle is self‑contained and loads Three.js from a CDN via an import map.

## Files
- `index.html` — static entry. Serves the visualization.
- `styles.css` — UI and background styling.
- `main.js` — ESM module. All logic and shaders.

## How to mount in your repo
Option A — Static asset (works in any stack):
1. Copy this folder into your repo under any public assets path, e.g. `public/visualizations/particle-lifeform/`.
2. Commit and serve. The page is then reachable at `/visualizations/particle-lifeform/` (framework-dependent).

Option B — Next.js/React route:
- Prefer Option A. Import maps are defined at document level, so bundling through your app router is not ideal.
- If you must integrate as a React page, load `index.html` via iframe or port the imports to your bundler (Vite/Webpack) and replace the CDN import map with local npm modules.

## Performance knobs
Edit `main.js`:
- `const nodeCount = 28000` and `const trailCount = 10000` control GPU and CPU load.
- Mobile safe values: `nodeCount = 14000`, `trailCount = 5000`.
- All animation steps are O(n).

## Attribution
Source: CodePen by VoXelo. See NOTICE.txt for the original URL.
