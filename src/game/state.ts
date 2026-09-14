import { YEARS, type Era } from '../content/eras';
export interface Timeline {
  studied: boolean;
  helped: boolean;
  collected: number[];
  repair: 'work' | 'gift' | null;
}
export interface GameState {
  version: 2;
  era: Era;
  birth: Era;
  xp: number;
  energy: number;
  coins: number;
  seedPlanted: boolean;
  echoRead: boolean;
  crossings: number;
  inventory: string[];
  chronicle: { era: Era; text: string }[];
  timelines: Record<Era, Timeline>;
}
export function createGame(era: Era = 1200): GameState {
  return {
    version: 2, era, birth: era, xp: 0, energy: 20, coins: 15,
    seedPlanted: false, echoRead: false, crossings: 0,
    inventory: ["Traveler's journal"],
    chronicle: [{ era, text: 'A new thread begins.' }],
    timelines: {
      1200: { studied: false, helped: false, collected: [], repair: null },
      2080: { studied: false, helped: false, collected: [], repair: null }
    }
  };
}
export type Command = 'study' | 'help' | 'donate' | 'travel' | 'plant' | 'echo' | 'collect:0' | 'collect:1' | 'collect:2';
export function canTravel(s: GameState): boolean {
  return s.xp >= 40 && YEARS.some(y => s.timelines[y].studied) && s.energy >= 25;
}
export function applyCommand(previous: GameState, command: Command): { state: GameState; message: string; changed: boolean } {
  const s = structuredClone(previous), timeline = s.timelines[s.era];
  const reject = (message: string) => ({ state: previous, message, changed: false });
  let message: string;
  if (command === 'study') {
    if (timeline.studied) {
      if (s.energy === 100) return reject('You are rested. Your energy is full.');
      s.energy = Math.min(100, s.energy + 15); message = 'Quiet reflection restored energy.';
    } else {
      timeline.studied = true; s.xp += 20; s.energy = Math.min(100, s.energy + 20);
      s.inventory.push('Shadow manuscript · ' + s.era); message = 'Studied the shadow. +20 XP, +20 energy.';
    }
  } else if (command.startsWith('collect:')) {
    const id = Number(command.split(':')[1]);
    if (![0, 1, 2].includes(id) || timeline.collected.includes(id) || timeline.helped) return reject('There is nothing else to collect here.');
    timeline.collected.push(id); message = 'Collected repair supplies (' + timeline.collected.length + '/3).';
  } else if (command === 'help' || command === 'donate') {
    if (!timeline.studied) return reject('Visit the library first. The archivist has a manuscript for you.');
    if (timeline.helped) return reject('The village remembers your kindness.');
    if (command === 'help' && timeline.collected.length < 3) return reject('Find the three supply crates around the square, or contribute 10 gold.');
    if (command === 'donate' && s.coins < 10) return reject('You need 10 gold. Gathering supplies is another way to help.');
    timeline.helped = true; timeline.repair = command === 'help' ? 'work' : 'gift';
    if (command === 'donate') s.coins -= 10;
    s.xp += 20; s.energy = Math.min(100, s.energy + 20);
    if (!s.seedPlanted && !s.inventory.includes('Moonseed')) s.inventory.push('Moonseed');
    message = 'Restored the well through ' + (command === 'help' ? 'shared work' : 'generosity') + '. +20 XP, +20 energy. Received a Moonseed.';
  } else if (command === 'plant') {
    if (s.era !== 1200) return reject('This tree must begin in the past. Return to 1200.');
    if (s.seedPlanted) return reject('The seed is already growing.');
    if (!timeline.helped || !s.inventory.includes('Moonseed')) return reject('Help Mira restore the well to receive a Moonseed.');
    s.seedPlanted = true; s.inventory = s.inventory.filter(i => i !== 'Moonseed');
    s.xp += 15; s.energy = Math.min(100, s.energy + 10);
    message = 'Planted the Moonseed. +15 XP, +10 energy. What will survive the centuries?';
  } else if (command === 'echo') {
    if (s.era !== 2080 || !s.seedPlanted) return reject('There is no tree here yet. Its roots belong in the past.');
    if (s.echoRead) return reject('You carry the tree’s memory already.');
    s.echoRead = true; s.xp += 30; s.energy = Math.min(100, s.energy + 20);
    s.inventory.push('Memory of the Moon Tree');
    message = 'Read the inscription beneath the tree you planted. +30 XP, +20 energy.';
  } else if (command === 'travel') {
    if (!canTravel(s)) return reject('Travel needs 40 XP, a studied manuscript, and 25 energy.');
    s.energy -= 25; s.era = s.era === 1200 ? 2080 : 1200; s.crossings++;
    message = 'Crossed into ' + s.era + '. Your memories remain.';
  } else return reject('Unknown action.');
  s.chronicle.unshift({ era: s.era, text: message }); s.chronicle = s.chronicle.slice(0, 100);
  return { state: s, message, changed: true };
}
export interface Quest { id: string; title: string; detail: string; reward: string; complete: boolean }
export function quests(s: GameState): Quest[] {
  const t = s.timelines[s.era];
  return [
    { id: 'study', title: 'Know thy shadow', detail: 'Enter the library and read with Archivist Elian.', reward: '20 XP · 20 energy', complete: t.studied },
    { id: 'well', title: 'The water we share', detail: 'Bring three crates to the keeper (' + t.collected.length + '/3), or give 10 gold.', reward: '20 XP · Moonseed', complete: t.helped },
    { id: 'seed', title: 'A gift to tomorrow', detail: s.era === 1200 ? 'After helping Mira, plant the Moonseed at the garden patch.' : 'Return to 1200. Help Mira and plant a Moonseed.', reward: '15 XP · 10 energy', complete: s.seedPlanted },
    { id: 'crossing', title: 'Beyond one lifetime', detail: 'Enter the clocktower. A crossing costs 25 energy.', reward: 'A new era', complete: s.crossings > 0 },
    { id: 'echo', title: 'What the roots remember', detail: 'Travel to 2080 and read the inscription beneath your tree.', reward: '30 XP · Memory keepsake', complete: s.echoRead }
  ];
}
export function objective(s: GameState): string {
  if (s.era === 2080 && s.seedPlanted && !s.echoRead) return 'Read the inscription beneath the Moon Tree.';
  return quests(s).find(q => !q.complete)?.detail ?? 'Your first story is complete. Explore the other timeline.';
}
