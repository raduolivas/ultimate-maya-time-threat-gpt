import { describe, expect, it } from 'vitest';
import { applyCommand, createGame, quests } from '../../src/game/state';
import { decodeSave } from '../../src/platform/save';
import { conversation } from '../../src/content/dialogue';
import { horizontalVelocity, MOTION } from '../../src/player/motion';

describe('a gift to tomorrow', () => {
  it('connects supplies, repair, seed, crossing and the future inscription', () => {
    let s = createGame();
    expect(applyCommand(s, 'plant').changed).toBe(false);
    s = applyCommand(s, 'study').state;
    expect(applyCommand(s, 'help').changed).toBe(false);
    for (const id of [0, 1, 2] as const) s = applyCommand(s, ('collect:' + id) as 'collect:0').state;
    expect(applyCommand(s, 'collect:0').changed).toBe(false);
    s = applyCommand(s, 'help').state;
    expect(s.coins).toBe(15); expect(s.timelines[1200].repair).toBe('work');
    s = applyCommand(s, 'plant').state;
    expect(s.inventory).not.toContain('Moonseed');
    expect(applyCommand(s, 'plant').changed).toBe(false);
    s = applyCommand(s, 'travel').state;
    expect(s.era).toBe(2080);
    expect(conversation('memory', s).text).toContain('Was that you');
    s = applyCommand(s, 'echo').state;
    expect(s.echoRead).toBe(true);
    expect(applyCommand(s, 'echo').changed).toBe(false);
    expect(quests(s).find(q => q.id === 'seed')?.complete).toBe(true);
    const restored = decodeSave(JSON.stringify(s));
    expect(restored).toEqual(s);
    s = applyCommand(s, 'travel').state;
    expect(s.seedPlanted).toBe(true); expect(s.timelines[1200].helped).toBe(true);
  });

  it('makes gifts an alternative with costs and no repeated rewards', () => {
    let s = applyCommand(createGame(), 'study').state;
    s = applyCommand(s, 'donate').state;
    expect(s.coins).toBe(5); expect(s.timelines[1200].repair).toBe('gift');
    expect(applyCommand(s, 'donate').changed).toBe(false);
    s = applyCommand(s, 'travel').state; s = applyCommand(s, 'study').state;
    expect(applyCommand(s, 'donate').changed).toBe(false);
    expect(applyCommand(s, 'plant').changed).toBe(false);
    expect(applyCommand(s, 'echo').changed).toBe(false);
  });

  it('migrates version 1 and preserves already-earned rewards', () => {
    const old = {
      version: 1, era: 1200, birth: 1200, xp: 40, energy: 60,
      inventory: ["Traveler's journal"], chronicle: [],
      timelines: { 1200: { studied: true, helped: true }, 2080: { studied: false, helped: false } }
    };
    const s = decodeSave(JSON.stringify(old));
    expect(s.version).toBe(2); expect(s.xp).toBe(40); expect(s.inventory).toContain('Moonseed');
    expect(applyCommand(s, 'help').changed).toBe(false);
    expect(applyCommand(s, 'plant').changed).toBe(true);
    expect(() => decodeSave(JSON.stringify({ ...s, coins: -1 }))).toThrow();
    expect(() => decodeSave(JSON.stringify({ ...s, seedPlanted: false, echoRead: true }))).toThrow();
  });
});

describe('kinematic motion', () => {
  it('accelerates consistently across fixed steps and caps diagonal speed', () => {
    let a = { x: 0, z: 0 }, b = { x: 0, z: 0 };
    const desired = { x: MOTION.run / Math.sqrt(2), z: MOTION.run / Math.sqrt(2) };
    for (let i = 0; i < 60; i++) a = horizontalVelocity(a, desired, 1 / 60);
    for (let i = 0; i < 120; i++) b = horizontalVelocity(b, desired, 1 / 120);
    expect(Math.hypot(a.x, a.z)).toBeCloseTo(MOTION.run);
    expect(a.x).toBeCloseTo(b.x);
    for (let i = 0; i < 30; i++) a = horizontalVelocity(a, { x: 0, z: 0 }, 1 / 60);
    expect(a).toEqual({ x: 0, z: 0 });
  });
});
