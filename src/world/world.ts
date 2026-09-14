import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3 } from '@babylonjs/core';
import { ERAS, type Era } from '../content/eras';
export type Room = 'village' | 'library' | 'tower';
export type TargetId = 'library' | 'tower' | 'exit' | 'study' | 'help' | 'travel' | 'plant' | 'echo' | 'collect:0' | 'collect:1' | 'collect:2';
export interface Target { id: TargetId; label: string; position: Vector3 }
export interface WorldProgress { wellRepaired: boolean; planted: boolean; collected: number[] }
export class World {
 room: Room = 'village';
 targets: Target[] = [];
 private meshes: Mesh[] = [];
 private materials: StandardMaterial[] = [];
 private ring: Mesh | null = null;
 private doors = new Map<TargetId, TransformNode>();
 private opening: TargetId | null = null;
 private hinges: TransformNode[] = [];
 constructor(private scene: Scene) {}
 private mat(name: string, color: string, glow = false) {
  const m = new StandardMaterial(name, this.scene);
  m.diffuseColor = Color3.FromHexString(color); m.specularColor = Color3.Black();
  if (glow) m.emissiveColor = m.diffuseColor.scale(.8);
  this.materials.push(m); return m;
 }
 private box(name: string, x: number, y: number, z: number, w: number, h: number, d: number, material: StandardMaterial, solid = true) {
  const mesh = MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, this.scene);
  mesh.position.set(x,y,z); mesh.material = material; mesh.checkCollisions = solid;
  mesh.metadata = { cameraOccluder: h > 2 }; mesh.receiveShadows = true; this.meshes.push(mesh); return mesh;
 }
 private target(id: TargetId, label: string, x: number, z: number) {
  this.targets.push({ id, label, position: new Vector3(x, 0, z) });
 }
 private sphere(name: string, x: number, y: number, z: number, size: number, material: StandardMaterial) {
  const mesh = MeshBuilder.CreateSphere(name, { diameter: size, segments: 8 }, this.scene);
  mesh.position.set(x,y,z); mesh.material = material; this.meshes.push(mesh); return mesh;
 }
 build(era: Era, room: Room = 'village', progress: WorldProgress = { wellRepaired: false, planted: false, collected: [] }) {
  this.dispose(); this.room = room;
  const palette = ERAS[era], future = era === 2080;
  const grass = this.mat('ground', palette.ground), stone = this.mat('stone','#687675');
  const wall = this.mat('walls',palette.wall), roof = this.mat('roof',palette.roof);
  const wood = this.mat('timber','#514536'), glow = this.mat('lanterns',palette.accent,true);
  const leaves = this.mat('foliage', future ? '#476973' : '#3c6551');
  this.box('ground',0,-.25,0,44,.5,44,grass);
  if (room !== 'village') {
   this.box('floor',0,.02,0,15,.04,16,wood,false);
   this.box('back-wall',0,3,7.5,15,6,.4,wall);
   this.box('left-wall',-7.5,3,0,.4,6,16,wall);
   this.box('right-wall',7.5,3,0,.4,6,16,wall);
   this.box('front-wall',0,1,-8,15,2,.4,wall);
   this.target('exit','Return to the square',0,-6);
   this.box('exit-marker',0,.04,-6,2,.05,1,glow,false);
   if (room === 'library') {
    const covers = ['#91996c','#ac785d','#697a94'].map((c,i) => this.mat('book-'+i,c));
    for (const x of [-5,0,5]) {
     this.box('bookcase',x,2,6.6,3.6,4,.6,wood);
     for (let row=0;row<3;row++) for (let j=0;j<7;j++) {
      this.box('book',x-1.3+j*.42,.6+row*1.1,6.23,.3,.75,.25,covers[(j+row)%3],false);
     }
    }
    this.box('reading-table',0,.8,2,3,1.6,1.5,wood);
    this.box('manuscript',0,1.65,2,.9,.1,.6,glow,false);
    this.target('study','Speak with Elian / read',0,.5);
    const robe=this.mat('archivist-robe','#747ea0'),skin=this.mat('archivist-skin','#d7b391');
    this.box('Elian',-2.6,.65,2,.6,1.3,.5,robe,false);
    this.sphere('Elian-head',-2.6,1.55,2,.45,skin);
   } else {
    this.box('gate-left',-2,2,3,.6,4,.6,stone);
    this.box('gate-right',2,2,3,.6,4,.6,stone);
    this.ring = MeshBuilder.CreateTorus('time-gate',{diameter:3.6,thickness:.18,tessellation:48},this.scene);
    this.ring.position.set(0,2,3); this.ring.rotation.x = Math.PI/2; this.ring.material=glow;
    this.meshes.push(this.ring); this.target('travel','Cross the time gate',0,1);
   }
   return;
  }
  for (const z of [-21,21]) this.box('boundary',0,.7,z,44,1.4,1,stone);
  for (const x of [-21,21]) this.box('boundary',x,.7,0,1,1.4,44,stone);
  this.box('north-road',0,.015,0,7,.03,40,stone,false);
  this.box('east-road',0,.025,0,40,.05,6,stone,false);
  const house=(x:number,z:number,title:string,tower=false)=>{
   const height=tower?7:4;
   this.box(title,x,height/2,z,6,height,5,wall);
   if (future) {
    this.box('flat-roof',x,height+.25,z,6.5,.5,5.5,roof);
    this.box('light-strip',x,height-.3,z-2.56,5.7,.12,.1,glow,false);
   } else {
    const top=MeshBuilder.CreateCylinder('roof',{height:2.4,diameterTop:0,diameterBottom:9,tessellation:4},this.scene);
    top.position.set(x,height+1.2,z);top.rotation.y=Math.PI/4;top.scaling.z=.85;top.material=roof;top.metadata={cameraOccluder:true};this.meshes.push(top);
    for(const dx of [-2.7,0,2.7])this.box('timber-beam',x+dx,height/2,z-2.54,.16,height,.1,wood,false);
   }
   for(const dx of [-1.7,1.7])this.box('window',x+dx,2.5,z-2.56,1,1.3,.1,glow,false);
   const hinge=new TransformNode(title+'-door-hinge',this.scene);
   hinge.position.set(x-.6,0,z-2.6);
   const door=this.box('door',.6,1.1,0,1.2,2.2,.1,wood,false);door.parent=hinge;
   const id:TargetId=title==='library'?'library':title==='clocktower'?'tower':'exit';
   this.hinges.push(hinge);if(id!=='exit')this.doors.set(id,hinge);
  };
  house(-10,8,'library'); this.target('library','Enter the library',-10,4.5);
  house(10,8,'clocktower',true); this.target('tower','Enter the clocktower',10,4.5);
  house(-10,-10,'workshop'); house(10,-10,'tavern');
  const water=this.mat('water',future?'#7aded4':'#719ca7',true);
  this.box('well',-2.8,.5,0,2,1,2,stone);
  if(progress.wellRepaired)this.box('water',-2.8,1.03,0,1.4,.04,1.4,water,false);
  const cloak=this.mat('villager','#b28b74'),skin=this.mat('skin','#d7b391');
  const npc=MeshBuilder.CreateCylinder('villager',{height:1.3,diameterTop:.4,diameterBottom:.8},this.scene);
  npc.position.set(-5,.65,-1);npc.material=cloak;this.meshes.push(npc);
  this.sphere('head',-5,1.55,-1,.48,skin);
  this.target('help','Speak with '+palette.npc,-5,-2);
  const cratePositions=[[-7,-5],[6,-5],[6,1]];
  if(!progress.wellRepaired)cratePositions.forEach(([x,z],id)=>{
   if(progress.collected.includes(id))return;
   this.box('supply-crate',x,.35,z,.7,.7,.7,wood);
   this.box('crate-mark',x,.73,z,.3,.05,.3,glow,false);
   this.target(('collect:'+id) as TargetId,'Collect supply crate',x,z-.7);
  });
  this.box('garden-patch',5,.035,-2,2,.07,2,wood,false);
  if(progress.planted){
   const scale=future?1:.22;
   this.box('moon-tree-trunk',5,2*scale,-2,.55*scale,4*scale,.55*scale,wood);
   const crown=this.sphere('moon-tree-crown',5,5*scale,-2,4*scale,leaves);
   crown.metadata={cameraOccluder:true};
   if(future)this.box('inscription',5,.4,-3,.8,.8,.3,stone);
  }
  this.target(future?'echo':'plant',future?'Read the garden inscription':'Plant the Moonseed',5,-3.5);
  for(let i=0;i<14;i++){
   const angle=i/14*Math.PI*2,x=Math.cos(angle)*18,z=Math.sin(angle)*18;
   this.box('trunk',x,1,z,.45,2,.45,wood);
   const crown=this.sphere('tree',x,3,z,3,leaves);crown.scaling.y=1.3;
  }
  for(const [x,z] of [[-4,-4],[4,4],[-4,11],[4,-11]]){
   this.box('lamp-post',x,1.6,z,.15,3.2,.15,wood);
   this.box('lantern',x,3,z,.45,.65,.45,glow,false);
  }
 }
 nearest(position: Vector3) {
  return this.targets.map(t=>({...t,distance:Math.hypot(t.position.x-position.x,t.position.z-position.z)})).sort((a,b)=>a.distance-b.distance)[0];
 }
 openDoor(id: TargetId){this.opening=id;}
 animate(time:number,dt=.016){
  if(this.ring)this.ring.scaling.setAll(1+Math.sin(time*2)*.035);
  const hinge=this.opening?this.doors.get(this.opening):undefined;
  if(hinge)hinge.rotation.y=Math.max(-1.6,hinge.rotation.y-dt*4);
 }
 dispose(){this.doors.clear();this.opening=null;this.hinges.forEach(h=>h.dispose());this.hinges=[];this.ring=null;this.meshes.forEach(m=>m.dispose());this.materials.forEach(m=>m.dispose());this.meshes=[];this.materials=[];this.targets=[];}
}
