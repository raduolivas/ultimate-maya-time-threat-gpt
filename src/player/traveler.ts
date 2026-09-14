import { ArcRotateCamera, Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core';
export class Traveler {
 readonly mesh: Mesh;
 private material: StandardMaterial;
 private faceMaterial: StandardMaterial;
 constructor(scene: Scene) {
  this.mesh = MeshBuilder.CreateCapsule('traveler', { height: 1.8, radius: .35, tessellation: 12 }, scene);
  this.mesh.ellipsoid.set(.35, .9, .35);
  this.material = new StandardMaterial('traveler-cloak', scene);
  this.material.diffuseColor = Color3.FromHexString('#8ac0b5'); this.material.specularColor = Color3.Black();
  this.mesh.material = this.material;
  const face = MeshBuilder.CreateBox('traveler-face', { width: .24, height: .16, depth: .09 }, scene);
  face.parent = this.mesh; face.position.set(0, .5, .33);
  this.faceMaterial = new StandardMaterial('traveler-skin', scene);
  this.faceMaterial.diffuseColor = Color3.FromHexString('#edc79b'); face.material = this.faceMaterial;
  this.spawn();
 }
 spawn(x = 0, z = -6) { this.mesh.position.set(x, .95, z); }
 step(input: { x: number; y: number }, camera: ArcRotateCamera, dt: number) {
  const forward = camera.getForwardRay().direction; forward.y = 0; forward.normalize();
  const right = Vector3.Cross(Vector3.Up(), forward);
  const direction = forward.scale(input.y).add(right.scale(input.x));
  if (direction.lengthSquared() > .001) this.mesh.rotation.y = Math.atan2(direction.x, direction.z);
  const displacement = direction.scale(4.2 * dt);
  // Flat-world controller. Upgrade to a swept physics controller before stairs/jumping.
  displacement.y = -4.8 * dt;
  this.mesh.moveWithCollisions(displacement);
 }
 dispose() { this.mesh.dispose(); this.material.dispose(); this.faceMaterial.dispose(); }
}
