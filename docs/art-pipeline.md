# Art pipeline

Visual direction: warm lanterns, muted timber and stone, slate roofs, readable silhouettes, a calm uncanny atmosphere.
Current art is procedural placeholder geometry authored in src/world/world.ts.

## Asset conventions for the next stage
- Author in meters; use a documented forward axis and export conversion.
- Place building origins at ground center; props at their contact point.
- Keep Blender source under assets/source; optimized runtime GLBs under public/assets.
- Name assets by function and variant, e.g. village_library_medieval_01.glb.
- Use reusable wall/roof/window/door modules on a common grid.
- Author simple collision proxies separately from decorative meshes.
- Export GLB with transforms applied and review materials/animations in engine.
- Record creator, source, license, edits and attribution in an asset manifest.
- Use shared materials/atlases; add compression, LOD and instancing based on profiling.
- Default to 1K textures for ordinary props. Larger textures require a demonstrated need.

## Initial performance targets (not measurements)
60 fps on a representative desktop; 30 fps on a representative midrange phone.
Keep the first playable download below 15 MB compressed where practical.
Measure draw calls, GPU frame time, memory, scene transitions, and long-session stability.
Select actual test devices before enforcing budgets; never infer mobile performance from desktop CI.
