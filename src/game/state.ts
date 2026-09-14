import { YEARS, type Era } from '../content/eras';
export interface Timeline { studied: boolean; helped: boolean }
export interface GameState {
 version: 1; era: Era; birth: Era; xp: number; energy: number;
 inventory: string[]; chronicle: { era: Era; text: string }[];
 timelines: Record<Era, Timeline>;
}
export function createGame(era: Era = 1200): GameState {
 return { version: 1, era, birth: era, xp: 0, energy: 20, inventory: ["Traveler's journal"],
 chronicle: [{ era, text: 'A new thread begins.' }],
 timelines: { 1200: { studied: false, helped: false }, 2080: { studied: false, helped: false } } };
}
export type Command = 'study' | 'help' | 'travel';
export function canTravel(s: GameState): boolean {
 return s.xp >= 40 && YEARS.some(y => s.timelines[y].studied) && s.energy >= 25;
}
export function applyCommand(previous: GameState, command: Command): { state: GameState; message: string; changed: boolean } {
 const s = structuredClone(previous);
 const timeline = s.timelines[s.era];
 let message: string;
 if (command === 'study') {
  if (timeline.studied) { s.energy = Math.min(100, s.energy + 15); message = 'Quiet reflection restored energy.'; }
  else {
   timeline.studied = true; s.xp += 20; s.energy = Math.min(100, s.energy + 20);
   s.inventory.push('Shadow manuscript · ' + s.era); message = 'Studied the shadow. +20 XP, +20 energy.';
  }
 } else if (command === 'help') {
  if (!timeline.studied) return { state: previous, changed: false, message: 'Visit the library first. The archivist has a manuscript for you.' };
  if (timeline.helped) return { state: previous, changed: false, message: 'The village remembers your kindness.' };
  timeline.helped = true; s.xp += 20; s.energy = Math.min(100, s.energy + 20); message = 'Helped restore the well. +20 XP, +20 energy.';
 } else {
  if (!canTravel(s)) return { state: previous, changed: false, message: 'Travel needs 40 XP, a studied manuscript, and 25 energy.' };
  s.energy -= 25; s.era = s.era === 1200 ? 2080 : 1200; message = 'Crossed into ' + s.era + '. Your memories remain.';
 }
 s.chronicle.unshift({ era: s.era, text: message }); s.chronicle = s.chronicle.slice(0, 100);
 return { state: s, message, changed: true };
}
export function objective(s: GameState): string {
 const t = s.timelines[s.era];
 return !t.studied ? 'Enter the library. Read the manuscript.' : !t.helped ? 'Help the villager beside the well.' : 'Enter the clocktower and cross the time gate.';
}
