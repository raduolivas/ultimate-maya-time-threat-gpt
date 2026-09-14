import { YEARS } from '../content/eras';
import type { GameState } from '../game/state';
// Keep the key stable so existing v1 journeys can be migrated.
export const SAVE_KEY = 'ultimate-maya.save.v1';
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
function object(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }
function year(v: unknown): boolean { return YEARS.some(y => y === v); }
function nonnegative(v: unknown): v is number { return typeof v === 'number' && Number.isSafeInteger(v) && v >= 0; }
export function decodeSave(raw: string): GameState {
  const s: unknown = JSON.parse(raw);
  if (!object(s) || (s.version !== 1 && s.version !== 2) || !year(s.era) || !year(s.birth) ||
    !nonnegative(s.xp) || typeof s.energy !== 'number' || !Number.isFinite(s.energy) || s.energy < 0 || s.energy > 100 ||
    !Array.isArray(s.inventory) || s.inventory.length > 100 || !s.inventory.every(i => typeof i === 'string' && i.length < 250) ||
    !Array.isArray(s.chronicle) || s.chronicle.length > 100 ||
    !s.chronicle.every(e => object(e) && year(e.era) && typeof e.text === 'string' && e.text.length < 1000) ||
    !object(s.timelines)) throw new Error('Unsupported or damaged save.');
  const legacy = s.version === 1;
  for (const y of YEARS) {
    const t = s.timelines[y];
    if (!object(t) || typeof t.studied !== 'boolean' || typeof t.helped !== 'boolean') throw new Error('Invalid timeline.');
    if (legacy) { t.collected = []; t.repair = t.helped ? 'work' : null; }
    if (!Array.isArray(t.collected) || t.collected.length > 3 ||
      !t.collected.every(id => id === 0 || id === 1 || id === 2) ||
      new Set(t.collected).size !== t.collected.length ||
      ![null, 'work', 'gift'].includes(t.repair as null | string)) throw new Error('Invalid quest data.');
  }
  if (legacy) {
    s.version = 2; s.coins = 15; s.seedPlanted = false; s.echoRead = false; s.crossings = 0;
    if (YEARS.some(y => (s.timelines as Record<string, { helped: boolean }>)[y].helped) && !s.inventory.includes('Moonseed')) s.inventory.push('Moonseed');
  }
  if (!nonnegative(s.coins) || !nonnegative(s.crossings) || typeof s.seedPlanted !== 'boolean' ||
    typeof s.echoRead !== 'boolean' || (s.echoRead && !s.seedPlanted)) throw new Error('Invalid journey data.');
  return s as unknown as GameState;
}
export function save(storage: StoragePort, state: GameState): void { storage.setItem(SAVE_KEY, JSON.stringify(state)); }
export function load(storage: StoragePort): GameState | null {
  const raw = storage.getItem(SAVE_KEY); return raw === null ? null : decodeSave(raw);
}
