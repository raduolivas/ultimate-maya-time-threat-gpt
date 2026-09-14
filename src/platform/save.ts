import { YEARS } from '../content/eras';
import type { GameState } from '../game/state';
export const SAVE_KEY = 'ultimate-maya.save.v1';
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
function object(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }
function year(v: unknown): boolean { return YEARS.some(y => y === v); }
export function decodeSave(raw: string): GameState {
 const s: unknown = JSON.parse(raw);
 if (!object(s) || s.version !== 1 || !year(s.era) || !year(s.birth) ||
 typeof s.xp !== 'number' || !Number.isSafeInteger(s.xp) || s.xp < 0 ||
 typeof s.energy !== 'number' || !Number.isFinite(s.energy) || s.energy < 0 || s.energy > 100 ||
 !Array.isArray(s.inventory) || s.inventory.length > 100 || !s.inventory.every(i => typeof i === 'string' && i.length < 250) ||
 !Array.isArray(s.chronicle) || s.chronicle.length > 100 ||
 !s.chronicle.every(e => object(e) && year(e.era) && typeof e.text === 'string' && e.text.length < 1000) ||
 !object(s.timelines)) throw new Error('Unsupported or damaged save.');
 for (const y of YEARS) {
  const t = s.timelines[y];
  if (!object(t) || typeof t.studied !== 'boolean' || typeof t.helped !== 'boolean') throw new Error('Invalid timeline.');
 }
 return s as unknown as GameState;
}
export function save(storage: StoragePort, state: GameState): void { storage.setItem(SAVE_KEY, JSON.stringify(state)); }
export function load(storage: StoragePort): GameState | null {
 const raw = storage.getItem(SAVE_KEY); return raw === null ? null : decodeSave(raw);
}
