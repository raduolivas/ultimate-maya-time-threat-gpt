import { AbstractMesh, ArcRotateCamera, Ray, Scene, Vector3 } from '@babylonjs/core';
/** Orbit heading stays player-controlled; R recenters behind the traveler. */
export class FollowCamera {
  private faded: AbstractMesh[] = [];
  constructor(readonly camera: ArcRotateCamera, private scene: Scene) {}
  reset(position: Vector3) {
    this.restore();
    this.camera.setTarget(position.add(new Vector3(0, .45, 0)));
    this.camera.inertialAlphaOffset = 0; this.camera.inertialBetaOffset = 0;
    this.camera.inertialRadiusOffset = 0;
  }
  recenter(facing: number) {
    this.camera.alpha = Math.atan2(-Math.cos(facing), -Math.sin(facing));
    this.camera.beta = 1.03;
    this.camera.inertialAlphaOffset = 0; this.camera.inertialBetaOffset = 0;
  }
  update(position: Vector3, dt: number) {
    const target = position.add(new Vector3(0, .45, 0));
    this.camera.setTarget(Vector3.Lerp(this.camera.target, target, 1 - Math.exp(-12 * dt)));
    this.restore();
    const direction = target.subtract(this.camera.position), distance = direction.length();
    if (distance < .1) return;
    const hits = this.scene.multiPickWithRay(
      new Ray(this.camera.position, direction.normalize(), distance),
      mesh => mesh.metadata?.cameraOccluder === true && mesh.isEnabled()
    ) ?? [];
    for (const hit of hits) {
      if (hit.pickedMesh && hit.distance < distance - .35) {
        hit.pickedMesh.visibility = .2;
        this.faded.push(hit.pickedMesh);
      }
    }
  }
  private restore() { this.faded.forEach(m => { if (!m.isDisposed()) m.visibility = 1; }); this.faded = []; }
  dispose() { this.restore(); }
}
