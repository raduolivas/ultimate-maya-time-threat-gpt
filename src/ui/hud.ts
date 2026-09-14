import { ERAS } from '../content/eras';
import { objective, type GameState } from '../game/state';
export class Hud {
 readonly canvas: HTMLCanvasElement;
 readonly dialog: HTMLDialogElement;
 onPause: (paused: boolean) => void = () => {};
 private timer: ReturnType<typeof setTimeout> | undefined;
 constructor() {
  document.querySelector('#app')!.innerHTML = `
   <canvas id="game" aria-label="Ultimate Maya 3D world"></canvas>
   <header><span>THREADS OF TIME</span><h1>ULTIMATE MAYA</h1><small>A life beyond one lifetime</small></header>
   <aside id="status"></aside><section id="objective"><span>THE AWAKENING</span><p id="quest"></p></section>
   <div id="location"></div><div id="prompt"></div>
   <nav><button id="quests">Quests</button><button id="inventory">Inventory</button><button id="chronicle">Chronicle</button><button id="save">Save</button><button id="load">Load</button><button id="recenter">Camera</button><label>Graphics <select id="quality"><option value="low">Low</option><option value="standard" selected>Standard</option></select></label></nav>
   <div class="touch"><button data-move="w">↑</button><div><button data-move="a">←</button><button id="interact">E</button><button data-move="d">→</button></div><button data-move="s">↓</button><div><button data-move="shift">Run</button><button id="jump">Jump</button></div></div>
   <div id="notice" role="status"></div>
   <dialog id="dialog"><span>ULTIMATE MAYA</span><h2 id="dialog-title"></h2><p id="dialog-body"></p><div id="dialog-actions"></div></dialog>`;
  this.canvas = this.get<HTMLCanvasElement>('game');
  this.dialog = this.get<HTMLDialogElement>('dialog');
  this.dialog.addEventListener('close', () => this.onPause(this.dialog.open));
 }
 get<T extends HTMLElement = HTMLElement>(id: string): T { return document.getElementById(id) as T; }
 update(state: GameState, room: string) {
  this.get('status').textContent = state.era + ' · ' + state.xp + ' XP · ' + state.energy + '/100 energy · ' + state.coins + ' gold';
  this.get('quest').textContent = objective(state);
  this.get('location').textContent = room === 'village' ? ERAS[state.era].place : room === 'library' ? 'The Archive' : 'The Clocktower';
 }
 show(title: string, body: string, actions: { label: string; run: () => void }[] = [], closeable = true) {
  this.onPause(true);
  this.get('dialog-title').textContent = title; this.get('dialog-body').textContent = body;
  const container = this.get('dialog-actions'); container.replaceChildren();
  const add=(label:string,run:()=>void)=>{
   const button=document.createElement('button');button.textContent=label;
   button.onclick=()=>{this.dialog.close();run();};container.append(button);
  };
  actions.forEach(a=>add(a.label,a.run));
  if(closeable)add('Return to the world',()=>{});
  this.dialog.oncancel=e=>{if(!closeable)e.preventDefault();};
  if(!this.dialog.open)this.dialog.showModal();
 }
 notify(text: string) {
  clearTimeout(this.timer);this.get('notice').textContent=text;this.get('notice').classList.add('visible');
  this.timer=setTimeout(()=>this.get('notice').classList.remove('visible'),4000);
 }
 dispose(){clearTimeout(this.timer);document.querySelector('#app')?.replaceChildren();}
}
