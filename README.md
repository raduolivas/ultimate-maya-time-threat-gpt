# Ultimate Maya · Threads of Time

A browser-first 3D RPG foundation inspired by memory, choices, and parallel timelines.
Built with Babylon.js, TypeScript, and Vite. This is an early playable prototype, not a finished game.

## Run locally
Requires Node.js 22.12+ and npm.

```sh
git clone --branch feat/3d-foundation https://github.com/raduolivas/ultimate-maya-time-threat-gpt.git
cd ultimate-maya-time-threat-gpt
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173). Keep the terminal open.
Do not open index.html directly. After a lockfile is committed, use npm ci for clean installs.

## First journey
1. Choose 1200 or 2080.
2. Walk to the library on the left, approach its front door, and press E.
3. Approach the reading table and study the manuscript.
4. Leave using the glowing floor marker.
5. Talk to the villager beside the well and offer help.
6. Enter the tall clocktower on the right. Approach the ring and cross.
7. Save and reload. Your quests, energy, inventory, and chronicle persist.

WASD/arrows move relative to the camera. Drag to orbit; wheel to zoom.
Touch devices display movement buttons; gamepads use left stick and button A.
Touch/gamepad behavior needs physical-device validation. Saves restore at the square, not at exact coordinates.

## Checks
```sh
npm run check
npx playwright install chromium
npm run test:browser
npm run build
npm run preview
```
CI runs type checks, lint, progression/save tests, browser smoke tests, and a production build.
A browser smoke pass does not certify art quality, complete navigation, or mobile performance.

## Source map
- src/game: engine-independent state and commands
- src/content: authored era definitions
- src/world: procedural meshes, scene transitions, interaction locations
- src/player: camera-relative movement and keyboard/touch/gamepad input
- src/platform: validated versioned browser storage
- src/ui: DOM interface, dialogue, notices, graphics selector
- src/main.ts: composition, lifecycle, render loop
- tests/unit: progression and save contracts
- tests/browser: real browser startup and save smoke tests
- docs: architecture, art pipeline, milestones, verification checklist

## Scope
Two stylized eras, a modular village, library and clocktower interiors, dialogue,
a short authored quest, inventory, chronicle, time travel, and local saves.
No server, live AI, MCP service, multiplayer, combat, skeletal animation, stairs, or arbitrary-year generation yet.
Models are editable procedural geometry, not final authored GLB assets.
The spiritual themes are fictional game mechanics, not psychological assessment or historical claims.

## Deployment
The production output is dist/ and can be served by a static host. No deployment is configured automatically.
Do not place API keys in Vite variables: client assets are public. Future AI/MCP credentials belong on the server.

## License
No project license has been selected. Dependencies retain their own licenses.
