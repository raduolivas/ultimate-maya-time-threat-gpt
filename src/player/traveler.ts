import { ArcRotateCamera, Color3, Mesh, MeshBuilder, Ray, Scene, StandardMaterial, TransformNode, Vector3 } from '@babylonjs/core';
import { horizontalVelocity, MOTION } from './motion';
export interface Movement { x: number; y: number; sprint: boolean; jump: boolean }
export class Traveler {
  readonly mesh: Mesh;
  grounded = false;
  motion: 'idle' | 'walk' | 'run' | 'jump' = 'idle';
  private velocity = { x: 0, z: 0 };
  private vertical = 0;
  private phase = 0;
  private coyote = 0;
  private jumpBuffer = 0;
  private visual: TransformNode;
  private limbs: TransformNode[] = [];
  private materials: StandardMaterial[] = [];

  constructor(private scene: Scene) {
    this.mesh = MeshBuilder.CreateCapsule('traveler', { height: 1.8, radius: .35, tessellation: 12 }, scene);
    this.mesh.isVisible = false;
    this.mesh.isPickable = false;
    this.mesh.ellipsoid.set(.35, .9, .35);
    this.visual = new TransformNode('traveler-visual', scene);
    this.visual.parent = this.mesh;

    const material = (name: string, hex: string) => {
      const m = new StandardMaterial(name, scene);
      m.diffuseColor = Color3.FromHexString(hex); m.specularColor = Color3.Black();
      this.materials.push(m); return m;
    };
    const cloth = material('traveler-cloak', '#80b5aa');
    const skin = material('traveler-skin', '#ecc79d');
    const boots = material('traveler-boots', '#343c40');
    const torso = MeshBuilder.CreateCylinder('torso', { height: .72, diameterTop: .5, diameterBottom: .65, tessellation: 8 }, scene);
    torso.parent = this.visual; torso.position.y = .02; torso.material = cloth;
    const head = MeshBuilder.CreateSphere('head', { diameter: .4, segments: 12 }, scene);
    head.parent = this.visual; head.position.y = .64; head.material = skin;
    const face = MeshBuilder.CreateBox('face', { width: .23, height: .12, depth: .08 }, scene);
    face.parent = head; face.position.z = .18; face.material = boots;
    for (let i = 0; i < 4; i++) {
      const arm = i < 2, side = i % 2 === 0 ? -1 : 1;
      const pivot = new TransformNode('limb-pivot', scene);
      pivot.parent = this.visual; pivot.position.set(side * (arm ? .35 : .17), arm ? .3 : -.3, 0);
      const limb = MeshBuilder.CreateBox('limb', { width: arm ? .16 : .21, height: arm ? .55 : .58, depth: .2 }, scene);
      limb.parent = pivot; limb.position.y = arm ? -.22 : -.29; limb.material = arm ? cloth : boots;
      this.limbs.push(pivot);
    }
    this.visual.getChildMeshes().forEach(m => { m.isPickable = false; });
    this.spawn();
  }

  spawn(x = 0, z = -6) {
    this.mesh.position.set(x, .95, z);
    this.velocity = { x: 0, z: 0 }; this.vertical = 0;
    this.jumpBuffer = 0; this.coyote = 0; this.grounded = false;
  }

  step(input: Movement, camera: ArcRotateCamera, dt: number) {
    // Ray only identifies support; Babylon's ellipsoid sweep resolves displacement.
    const foot = this.mesh.position.add(new Vector3(0, -.84, 0));
    const hit = this.scene.pickWithRay(new Ray(foot, Vector3.Down(), .16), m => m.checkCollisions && m.isEnabled());
    this.grounded = !!hit?.hit && this.vertical <= 0;
    this.coyote = this.grounded ? .1 : Math.max(0, this.coyote - dt);
    this.jumpBuffer = input.jump ? .12 : Math.max(0, this.jumpBuffer - dt);
    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.vertical = MOTION.jump; this.grounded = false; this.coyote = 0; this.jumpBuffer = 0;
    } else if (this.grounded) this.vertical = -.5;
    else this.vertical = Math.max(-25, this.vertical - MOTION.gravity * dt);

    const forward = camera.getForwardRay().direction; forward.y = 0; forward.normalize();
    const right = Vector3.Cross(Vector3.Up(), forward);
    const direction = forward.scale(input.y).add(right.scale(input.x));
    const speed = input.sprint ? MOTION.run : MOTION.walk;
    this.velocity = horizontalVelocity(this.velocity, { x: direction.x * speed, z: direction.z * speed }, dt);
    const moving = Math.hypot(this.velocity.x, this.velocity.z);
    if (moving > .05) {
      const desired = Math.atan2(this.velocity.x, this.velocity.z);
      const angle = Math.atan2(Math.sin(desired - this.mesh.rotation.y), Math.cos(desired - this.mesh.rotation.y));
      this.mesh.rotation.y += angle * (1 - Math.exp(-18 * dt));
    }
    const before = this.mesh.position.y;
    this.mesh.moveWithCollisions(new Vector3(this.velocity.x * dt, this.vertical * dt, this.velocity.z * dt));
    if (this.vertical > 0 && this.mesh.position.y - before < this.vertical * dt * .3) this.vertical = 0;
    if (this.mesh.position.y < -5) this.spawn();
    this.motion = !this.grounded ? 'jump' : moving < .15 ? 'idle' : input.sprint ? 'run' : 'walk';
    this.phase += moving * dt * 2;
    this.limbs.forEach((limb, i) => {
      const swing = this.grounded ? Math.sin(this.phase + (i === 0 || i === 3 ? 0 : Math.PI)) * Math.min(.8, moving * .12) : (i < 2 ? -.5 : .25);
      limb.rotation.x += (swing - limb.rotation.x) * (1 - Math.exp(-16 * dt));
    });
    this.visual.position.y = this.grounded ? Math.abs(Math.sin(this.phase)) * Math.min(.035, moving * .005) : 0;
  }
  dispose() { this.mesh.dispose(); this.materials.forEach(m => m.dispose()); }
}
