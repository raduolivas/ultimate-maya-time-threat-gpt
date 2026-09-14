# Architecture and decisions

## Runtime boundary
Babylon owns rendering, meshes, camera and basic collision queries.
Game rules are pure TypeScript data transitions and have no DOM, engine, network, or storage dependency.
The application composes game commands, world rebuilding, and HUD updates.
A small modular application is sufficient now; ECS and a monorepo are not prerequisites for production quality.

## State and time travel
Each era owns independent studied/helped flags, collected supply IDs and its chosen repair method. The planted seed and discovered inscription are persistent cross-era consequences. Inventory and chronicle cross with the traveler.
Only the current world is rendered. Inactive timelines persist as data; they are not being simulated in parallel.
Commands clone state, reject unavailable actions, and cap energy.
Save version 2 is validated at the storage boundary; version 1 is explicitly migrated on load using the existing storage key. Existing rewards and chronicle remain. Incompatible data is rejected.
Browser saves are single-player convenience data, not trusted multiplayer authority.

## Movement and camera
Movement uses a 60 Hz fixed step, normalized input, and camera-relative directions.
Input is sampled once per rendered frame; the accumulator is capped to avoid background-tab catch-up.
The kinematic controller uses Babylon ellipsoid collision sweeps, support rays, acceleration/deceleration, gravity, jump buffering and coyote time. Jump input is consumed once per fixed-step update. Procedural limbs follow motion state.
Stairs, complex slopes and dynamic bodies need a dedicated physics controller and additional collision tests.
Camera collision is enabled; tagged obstructing meshes fade independently of shared materials. Heading remains user-controlled; R recenters behind the traveler. Tight interiors still require physical playtesting.

## Mobile strategy
GLB assets, content definitions, pure gameplay rules and action-based input reduce coupling.
Low/standard graphics cap rendering resolution. Touch controls exist; device testing is outstanding.
A mobile web/PWA build can reuse the browser runtime; a native wrapper or native host needs separate testing.
Moving to Godot/Unity requires rewriting engine integration and possibly gameplay code. It is not an automatic export.
Do not promise frame rates before profiling actual devices.

## Resource ownership
World owns and disposes generated meshes/materials at transitions.
Traveler owns its mesh/materials. Input owns event listeners. Application owns engine/scene and page lifecycle.
Share materials within scenes; avoid per-frame creation of meshes/materials.

## AI/MCP boundary (future)
Browser -> authenticated game API -> quest service / MCP host -> permitted tools.
Use a QuestProvider interface returning validated content, not executable code.
Server validates objectives, reachable targets, reward limits, prerequisites, and idempotency.
Deterministic authored quests stay available when the provider times out.
MCP is a tool integration layer, not the render loop or multiplayer transport.
No client credential storage and no runtime AI code execution.

## Quality gates
Typecheck, lint, domain tests and browser smoke tests in CI.
Before release: full quest walkthrough; keyboard focus; collisions; era/save restoration;
device profiles; no console errors; asset licensing review.

## Interactions and quests
Animated door hinges precede a short scene transition. Movement and repeated interaction are blocked during the transition.
Authored conversations return commands to the domain; dialogue cannot bypass reward/prerequisite validation.
Five quests expose objective, completion and reward text. Work and gold are alternate repair paths.
In 1200 planting shows a sapling; in 2080 the same location shows a grown tree and a new inscription.
NPC memory dialogue reflects that consequence. Only the active scene is rebuilt.
