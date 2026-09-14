import { expect, it } from 'vitest';
import { ArcRotateCamera, NullEngine, Scene, Vector3 } from '@babylonjs/core';
import { FollowCamera } from '../../src/player/camera';
it('translates the follow target without changing orbit heading or zoom', () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera('camera', -Math.PI / 2, 1.03, 14, Vector3.Zero(), scene);
  const rig = new FollowCamera(camera, scene);
  camera.getViewMatrix(true);
  const alpha = camera.alpha, beta = camera.beta, radius = camera.radius;
  rig.reset(new Vector3(0, 1, -6));
  for (let i = 0; i < 60; i++) rig.update(new Vector3(-10, 1, -6), 1 / 60);
  expect(camera.alpha).toBeCloseTo(alpha);
  expect(camera.beta).toBeCloseTo(beta);
  expect(camera.radius).toBeCloseTo(radius);
  expect(camera.target.x).toBeLessThan(-9.9);
  rig.dispose(); scene.dispose(); engine.dispose();
});
