export const ERAS = {
 1200: { title: 'The Lantern Age', place: 'Lantern Hollow', wall: '#9a8060', roof: '#374754', accent: '#ffd293', ground: '#2e4940', npc: 'Mira' },
 2080: { title: 'A Possible Tomorrow', place: 'The Remembered City', wall: '#547584', roof: '#244656', accent: '#87f6e1', ground: '#233e48', npc: 'Sora' }
} as const;
export type Era = keyof typeof ERAS;
export const YEARS: Era[] = [1200, 2080];
