import { ERAS } from './eras';
import type { Command, GameState } from '../game/state';
export interface Choice { label: string; next?: string; command?: Command }
export interface Conversation { title: string; text: string; choices: Choice[] }
/** Authored conversation graph. Commands remain validated by the game rules. */
export function conversation(node: string, s: GameState): Conversation {
  const keeper = ERAS[s.era].npc;
  if (node === 'archivist') return {
    title: 'Elian · Archivist',
    text: 'A role can serve you without defining you. What brought you to the archive?',
    choices: [{ label: 'I want to understand myself.', next: 'shadow' }, { label: 'I seek the power to travel.', next: 'power' }]
  };
  if (node === 'power') return {
    title: 'Elian · Power and responsibility',
    text: 'Power is a tool. Read first, then decide how your actions can support another life.',
    choices: [{ label: 'Tell me about the shadow.', next: 'shadow' }]
  };
  if (node === 'shadow') return {
    title: 'The unexamined shadow',
    text: 'Notice what you defend before you know why. Acknowledging difficult feelings does not mean obeying them. These are fictional, Jung-inspired themes, not a psychological assessment.',
    choices: [{ label: 'Read and reflect.', command: 'study' }, { label: 'Return to Elian.', next: 'archivist' }]
  };
  if (node === 'keeper') return {
    title: keeper + ' · Keeper of the well',
    text: s.timelines[s.era].helped ? 'Water flows again. There is room now to care for what comes next.' :
      'The well has fallen silent. We need supplies, or enough gold to buy them. How would you like to help?',
    choices: s.timelines[s.era].helped
      ? [{ label: 'What should I do with the Moonseed?', next: 'seed' }, { label: 'What do you remember of this place?', next: 'memory' }]
      : [{ label: 'I will gather supplies.', next: 'supplies' }, { label: 'Contribute 10 gold.', command: 'donate' }, { label: 'Use my collected supplies.', command: 'help' }]
  };
  if (node === 'supplies') return {
    title: keeper + ' · Shared work',
    text: 'Look for three marked crates: beside the western workshop, southeast of the well, and near the eastern lane. Bring them back here.',
    choices: [{ label: 'Let us repair it together.', command: 'help' }, { label: 'Consider another way to help.', next: 'keeper' }]
  };
  if (node === 'seed') return {
    title: 'A gift to tomorrow',
    text: 'Plant the Moonseed in the garden patch in 1200. You may never see its shade in that lifetime. Time will remember.',
    choices: [{ label: 'What happened in another era?', next: 'memory' }]
  };
  return {
    title: keeper + ' · The memory of a place',
    text: s.era === 1200 ? 'We do not know who will inherit this village. We can still leave it kinder.' :
      s.seedPlanted ? 'This tree has sheltered generations. An inscription names a traveler who planted it centuries ago. Was that you?' :
      'This patch has been empty for as long as anyone remembers. Sometimes I dream there was a tree.',
    choices: [{ label: 'Return to our conversation.', next: 'keeper' }]
  };
}
