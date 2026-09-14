export class Input {
 private keys = new Set<string>();
 private touch = new Set<string>();
 private controller = new AbortController();
 private gamepadPressed = false;
 enabled = false;
 constructor(private interact: () => void) {
  const options = { signal: this.controller.signal };
  window.addEventListener('keydown', e => {
   if (!this.enabled || e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
   const key = e.key.toLowerCase();
   if (['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright','e'].includes(key)) e.preventDefault();
   this.keys.add(key);
   if (key === 'e' && !e.repeat) this.interact();
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
 }
 clear() { this.keys.clear(); this.touch.clear(); }
 read() {
  if (!this.enabled) { this.clear(); return { x: 0, y: 0 }; }
  const pressed = (...names: string[]) => names.some(n => this.keys.has(n) || this.touch.has(n));
  let x = Number(pressed('d','arrowright')) - Number(pressed('a','arrowleft'));
  let y = Number(pressed('w','arrowup')) - Number(pressed('s','arrowdown'));
  const pad = navigator.getGamepads?.().find(p => p?.connected);
  if (pad) {
   const dead = (v: number) => Math.abs(v) < .18 ? 0 : v;
   x += dead(pad.axes[0] ?? 0); y -= dead(pad.axes[1] ?? 0);
   const action = !!pad.buttons[0]?.pressed;
   if (action && !this.gamepadPressed) this.interact();
   this.gamepadPressed = action;
  } else this.gamepadPressed = false;
  const length = Math.max(1, Math.hypot(x, y));
  return { x: x / length, y: y / length };
 }
 dispose() { this.controller.abort(); this.clear(); }
}
