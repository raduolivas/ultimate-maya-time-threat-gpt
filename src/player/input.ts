import type { Movement } from './traveler';
export class Input {
  private keys = new Set<string>();
  private touch = new Set<string>();
  private controller = new AbortController();
  private previousPad: boolean[] = [];
  private jumpQueued = false;
  enabled = false;

  constructor(private interact: () => void, private recenter: () => void = () => {}) {
    const options = { signal: this.controller.signal };
    window.addEventListener('keydown', e => {
      if (!this.enabled || e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const key = e.key.toLowerCase();
      if (['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright','e',' ','shift','r'].includes(key)) e.preventDefault();
      this.keys.add(key);
      if (!e.repeat) {
        if (key === 'e') this.interact();
        if (key === ' ') this.jumpQueued = true;
        if (key === 'r') this.recenter();
      }
    }, options);
    window.addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()), options);
    window.addEventListener('blur', () => this.clear(), options);
    document.querySelectorAll<HTMLButtonElement>('[data-move]').forEach(button => {
      const key = button.dataset.move!;
      button.addEventListener('pointerdown', e => {
        if (!this.enabled) return;
        e.preventDefault(); button.setPointerCapture(e.pointerId); this.touch.add(key);
      }, options);
      for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, () => this.touch.delete(key), options);
    });
    document.getElementById('jump')?.addEventListener('click', () => { if (this.enabled) this.jumpQueued = true; }, options);
    document.getElementById('recenter')?.addEventListener('click', () => { if (this.enabled) this.recenter(); }, options);
  }
  clear() { this.keys.clear(); this.touch.clear(); this.jumpQueued = false; }

  sample(): Omit<Movement, 'jump'> {
    const pad = navigator.getGamepads?.().find(p => p?.connected);
    const buttons = pad ? pad.buttons.map(b => b.pressed) : [];
    if (!this.enabled) {
      this.clear(); this.previousPad = buttons;
      return { x: 0, y: 0, sprint: false };
    }
    const held = (...names: string[]) => names.some(n => this.keys.has(n) || this.touch.has(n));
    let x = Number(held('d','arrowright')) - Number(held('a','arrowleft'));
    let y = Number(held('w','arrowup')) - Number(held('s','arrowdown'));
    if (pad) {
      const dead = (v: number) => Math.abs(v) < .18 ? 0 : v;
      x += dead(pad.axes[0] ?? 0); y -= dead(pad.axes[1] ?? 0);
      if (buttons[0] && !this.previousPad[0]) this.jumpQueued = true;
      if (buttons[2] && !this.previousPad[2]) this.interact();
      if (buttons[3] && !this.previousPad[3]) this.recenter();
    }
    this.previousPad = buttons;
    const length = Math.max(1, Math.hypot(x, y));
    return { x: x / length, y: y / length, sprint: held('shift') || !!buttons[10] };
  }
  consumeJump() { const value = this.jumpQueued; this.jumpQueued = false; return value; }
  dispose() { this.controller.abort(); this.clear(); }
}
