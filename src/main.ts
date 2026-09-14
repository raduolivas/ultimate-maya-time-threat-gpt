import { ArcRotateCamera, Color3, Color4, DirectionalLight, Engine, HemisphericLight, Scene, Vector3 } from '@babylonjs/core';
import { ERAS, type Era } from './content/eras';
import { applyCommand, canTravel, createGame, type Command } from './game/state';
import { load, save } from './platform/save';
import { Input } from './player/input';
import { Traveler } from './player/traveler';
import { World, type Room } from './world/world';
import { Hud } from './ui/hud';
import './ui/style.css';

const ui = new Hud();
function boot() {
 const engine = new Engine(ui.canvas, true);
 const scene = new Scene(engine);
 scene.clearColor = new Color4(.055,.085,.12,1); scene.collisionsEnabled=true;
 scene.fogMode=Scene.FOGMODE_EXP2;scene.fogDensity=.013;scene.fogColor=new Color3(.055,.085,.12);
 const ambient=new HemisphericLight('ambient',Vector3.Up(),scene);ambient.intensity=.9;ambient.groundColor=new Color3(.12,.17,.18);
 const moon=new DirectionalLight('moon',new Vector3(-.5,-1,.4),scene);moon.intensity=1.2;moon.diffuse=new Color3(.75,.85,1);
 const camera=new ArcRotateCamera('camera',-Math.PI/2,1.03,14,Vector3.Zero(),scene);
 camera.attachControl(ui.canvas,true);camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput');
 camera.lowerRadiusLimit=6;camera.upperRadiusLimit=20;camera.lowerBetaLimit=.3;camera.upperBetaLimit=1.3;camera.wheelPrecision=35;
 camera.checkCollisions=true;camera.collisionRadius=new Vector3(.4,.4,.4);camera.panningSensibility=0;
 const traveler=new Traveler(scene),world=new World(scene);
 let state=createGame(),started=false,time=0,accumulator=0;
 const input=new Input(interact);
 ui.onPause=paused=>{input.enabled=started&&!paused;input.clear();};
 function quality(){
  const low=ui.get<HTMLSelectElement>('quality').value==='low';
  const dpr=Math.min(devicePixelRatio||1,low?1:1.5);
  engine.setHardwareScalingLevel(1/dpr);
 }
 quality();ui.get('quality').onchange=quality;
 function refresh(){ui.update(state,world.room);}
 function persist(manual=false){
  if(!started)return;
  try{save(localStorage,state);if(manual)ui.notify('Journey saved in this browser.');}
  catch{ui.notify('Storage unavailable. Your current session is still active.');}
 }
 function rebuild(room:Room='village',x=0,z=-6){
  world.build(state.era,room);traveler.spawn(x,z);camera.setTarget(traveler.mesh.position.add(new Vector3(0,.5,0)));refresh();
 }
 function begin(era:Era){
  state=createGame(era);started=true;rebuild();input.enabled=true;persist();ui.notify('Find the library to the left of the square.');
 }
 function restore(){
  try{
   const saved=load(localStorage);
   if(!saved){ui.notify('No saved journey found.');if(!started)welcome();return;}
   state=saved;started=true;rebuild();input.enabled=true;ui.notify('Journey restored at the village square.');
  }catch{ui.notify('This save could not be loaded.');if(!started)welcome();}
 }
 function welcome(){
  ui.show('Every life is a doorway.',
   'Explore a lantern-lit village at the edge of time. Study, help its people, and discover what crosses with you.\n\nWASD / arrows to walk · drag to orbit · scroll to zoom · E to interact. Touch buttons and a gamepad are also supported.\n\nChoose your starting era:',
   [{label:'Begin in 1200 · The Lantern Age',run:()=>begin(1200)},{label:'Begin in 2080 · A Possible Tomorrow',run:()=>begin(2080)},{label:'Continue saved journey',run:restore}],false);
 }
 function command(action:Command){
  const result=applyCommand(state,action);state=result.state;
  if(action==='travel'&&result.changed)rebuild();
  refresh();if(result.changed)persist();ui.notify(result.message);
 }
 function interact(){
  if(!started||ui.dialog.open)return;
  const target=world.nearest(traveler.mesh.position);if(!target||target.distance>2.2)return;
  if(target.id==='library'||target.id==='tower'){rebuild(target.id,0,-4);return;}
  if(target.id==='exit'){const previous=world.room;rebuild('village',previous==='library'?-10:10,3.5);return;}
  if(target.id==='study'){
   ui.show('The unexamined shadow','The manuscript invites you to notice the parts of yourself you avoid acknowledging. What might defensiveness be protecting?\n\nThese are fictional, Jung-inspired game mechanics. Rest restores energy; ordinary enjoyment is not penalized.',
    [{label:'Read and reflect',run:()=>command('study')}]);return;
  }
  if(target.id==='help'){
   ui.show(ERAS[state.era].npc+' · Keeper of the well','The village well needs care. Will you offer your time to help restore it?',
    [{label:'Offer help',run:()=>command('help')}]);return;
  }
  if(!canTravel(state)){
   ui.show('The gate is still sleeping','A crossing requires 40 XP, one studied manuscript, and 25 temporal energy. Read at the library and help the villager. Return to the manuscript to restore energy.');return;
  }
  ui.show('Another thread awaits','Cross into '+(state.era===1200?2080:1200)+'? The cost is 25 energy. Your inventory and chronicle remain; each era remembers its own quests.',
   [{label:'Cross the threshold',run:()=>command('travel')}]);
 }
 ui.get('interact').onclick=interact;
 ui.get('inventory').onclick=()=>{if(started)ui.show('What you carry',state.inventory.join('\n\n'));};
 ui.get('chronicle').onclick=()=>{if(started)ui.show('Your chronicle',state.chronicle.map(e=>e.era+' — '+e.text).join('\n\n'));};
 ui.get('save').onclick=()=>persist(true);ui.get('load').onclick=restore;
 const resize=()=>engine.resize();
 const hidden=()=>{if(document.hidden){input.clear();persist();}};
 window.addEventListener('resize',resize);document.addEventListener('visibilitychange',hidden);
 rebuild();welcome();
 engine.runRenderLoop(()=>{
  const delta=Math.min(engine.getDeltaTime()/1000,.1);time+=delta;accumulator+=delta;
  const movement=input.read();
  while(accumulator>=1/60){if(started&&!ui.dialog.open)traveler.step(movement,camera,1/60);accumulator-=1/60;}
  camera.setTarget(Vector3.Lerp(camera.target,traveler.mesh.position.add(new Vector3(0,.5,0)),1-Math.exp(-10*delta)));
  world.animate(time);
  const target=world.nearest(traveler.mesh.position);
  ui.get('prompt').textContent=started&&target&&target.distance<2.2?'E · '+target.label:'WASD · Walk    Drag · Orbit    Scroll · Zoom';
  scene.render();ui.canvas.dataset.ready='true';
 });
 const cleanup=(event:PageTransitionEvent)=>{
  persist();if(event.persisted)return;
  engine.stopRenderLoop();input.dispose();world.dispose();traveler.dispose();scene.dispose();engine.dispose();
  window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',hidden);ui.dispose();
 };
 window.addEventListener('pagehide',cleanup,{once:true});
}
try{boot();}catch(error){
 console.error(error);
 ui.show('The 3D world could not start','This browser could not initialize the game. Try a browser with WebGL enabled and hardware acceleration available.',[],false);
}
