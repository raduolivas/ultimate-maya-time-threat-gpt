# Contributing

Use Node 22.12+ and npm ci. Keep changes on a focused branch and open a PR.
Run npm run check and npm run test:browser before requesting review.

## Change boundaries
- Add gameplay rules to src/game without DOM or Babylon imports.
- Put authored era/content data under src/content.
- Route input through actions rather than reading keys in gameplay rules.
- Keep storage behind the StoragePort; validate external state.
- Dispose scene-owned assets on transitions.
- Keep credentials out of source and client environment variables.
- Do not silently replace a save schema; introduce migration tests.

## Reviewing a game change
Describe the player-visible problem and result. Include a short walkthrough, test results,
and screenshots/video for visual changes. Mark untested devices and remaining limitations.
Tests should cover game contracts (reward duplication, save restore, transition costs),
not duplicate private implementation details.

## Assets and dependencies
Record asset license/provenance and keep editable sources separate from runtime exports.
Large Blender sources can use Git LFS once configured.
Pin dependencies, commit package-lock.json, and run checks after upgrades.
CI blocks high/critical dependency advisories; review lower-severity advisories in context.
