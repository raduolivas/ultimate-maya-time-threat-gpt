# Foundation verification

Verified in GitHub Actions on Ubuntu, Node 22, headless Chromium:
- Strict TypeScript check
- ESLint
- 5 unit tests covering prerequisites, repeat rewards, timeline round trips, save validation and adapters
- Production build
- 2 browser smoke tests covering WebGL startup, inventory, save/reload, future-era start and corrupt-save recovery

The initial older toolchain reported higher-severity advisories. Vite, Vitest and Playwright were
updated using the npm registry and verified again. The resolved package manifest and lockfile were then committed.
At that verification, npm audit reported two low-severity advisories and no moderate/high/critical advisories.
This is not a guarantee about future advisories.

Not verified:
- Full physical walkthrough and camera occlusion in every location
- Real touch/gamepad hardware
- iOS Safari / Android browsers
- Frame-time, thermal and memory budgets on mobile
- Production-host deployment

The flat-scene movement controller and procedural art are intentional foundations.
No native mobile export, AI quest service or multiplayer is claimed.
