import type { LevelData } from '../shared/types';

const l1: LevelData = {
  id: 'b1-tutorial', name: 'Tutorial', prototype: 'starter-example',
  elements: [{ type: 'dot', x: 0.5, y: 0.5, color: 0x6cc24a }],
};
const l2: LevelData = {
  id: 'b2-three', name: 'Three Dots', prototype: 'starter-example',
  elements: [
    { type: 'dot', x: 0.3, y: 0.4, color: 0x6cc24a },
    { type: 'dot', x: 0.7, y: 0.4, color: 0xff6b6b },
    { type: 'dot', x: 0.5, y: 0.7, color: 0x4d96ff },
  ],
};
const l3: LevelData = {
  id: 'b3-grid', name: 'Six Pack', prototype: 'starter-example',
  elements: [0.25, 0.5, 0.75].flatMap((y) =>
    [0.35, 0.65].map((x) => ({ type: 'dot' as const, x, y, color: 0xffd93d })),
  ),
};

export const BUILTIN_LEVELS: LevelData[] = [l1, l2, l3];
