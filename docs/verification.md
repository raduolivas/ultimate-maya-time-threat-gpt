# Verification

The foundation passed CI with five unit tests and two Chromium smoke tests.
The village expansion adds tests for linked quest progression, migration, motion, and a browser walkthrough.

## Expansion acceptance
- Typecheck, lint, production build, dependency audit
- Prerequisites, no duplicate rewards, work/gift alternatives, future tree consequence
- Save v1 migration and v2 round trip
- Kinematic acceleration and diagonal speed bounds
- Browser startup, inventory, save restore, corrupt-save recovery
- Browser jump, library door, dialogue, gift repair, planting, clocktower, future inscription and persisted keepsake

CI status on the current PR is the source of truth for these checks.

Still needs physical playtesting: camera occlusion at every angle, touch/gamepad hardware,
iOS Safari/Android, frame time/thermal/memory budgets, complex collision surfaces.
Art uses procedural geometry and procedural limb motion, not final imported character animation.
No native mobile export, AI service, multiplayer or deployment is claimed.
