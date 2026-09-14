import { describe, expect, it } from 'vitest';
import { applyCommand, canTravel, createGame } from '../../src/game/state';
import { decodeSave, load, save, SAVE_KEY, type StoragePort } from '../../src/platform/save';
describe('the awakening',()=>{
 it('requires learning and service before crossing',()=>{
  let s=createGame();expect(canTravel(s)).toBe(false);
  expect(applyCommand(s,'travel').state).toEqual(s);
  expect(applyCommand(s,'donate').changed).toBe(false);
  s=applyCommand(s,'study').state;expect(s.xp).toBe(20);
  s=applyCommand(s,'donate').state;expect(canTravel(s)).toBe(true);
  const previous=structuredClone(s);
  const next=applyCommand(s,'travel').state;
  expect(s).toEqual(previous);expect(next.era).toBe(2080);expect(next.energy).toBe(s.energy-25);
  expect(next.inventory).toEqual(s.inventory);expect(next.timelines[1200].helped).toBe(true);
  expect(next.timelines[2080].helped).toBe(false);
 });
 it('does not farm XP or duplicate rewards from repeated interactions',()=>{
  let s=applyCommand(createGame(),'study').state;
  s=applyCommand(s,'study').state;
  expect(s.xp).toBe(20);expect(s.inventory).toHaveLength(2);
  s=applyCommand(s,'donate').state;
  expect(applyCommand(s,'donate').state.xp).toBe(40);
  for(let i=0;i<20;i++)s=applyCommand(s,'study').state;
  expect(s.energy).toBe(100);
 });
 it('preserves both timelines on returning and blocks depleted energy',()=>{
  let s=applyCommand(applyCommand(createGame(),'study').state,'donate').state;
  s=applyCommand(s,'travel').state;s=applyCommand(s,'travel').state;
  expect(s.era).toBe(1200);expect(s.timelines[1200].helped).toBe(true);
  expect(s.energy).toBe(10);expect(applyCommand(s,'travel').changed).toBe(false);
  s=applyCommand(s,'study').state;expect(canTravel(s)).toBe(true);
 });
});
describe('save boundary',()=>{
 it('round-trips through a storage adapter',()=>{
  const memory=new Map<string,string>();
  const storage:StoragePort={getItem:k=>memory.get(k)??null,setItem:(k,v)=>{memory.set(k,v);}};
  expect(load(storage)).toBe(null);
  const s=applyCommand(createGame(2080),'study').state;
  save(storage,s);expect(memory.has(SAVE_KEY)).toBe(true);expect(load(storage)).toEqual(s);
 });
 it('rejects corrupt, unsupported, and invalid state',()=>{
  for(const raw of ['bad','null','{}',JSON.stringify({...createGame(),version:99}),JSON.stringify({...createGame(),energy:-1}),JSON.stringify({...createGame(),era:3000})])
   expect(()=>decodeSave(raw)).toThrow();
 });
});
