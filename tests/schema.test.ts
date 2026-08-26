import { describe, it, expect } from 'vitest';
import { SCHEMA_VERSION, isSchemaSupported, schemaOf } from '../src/levels/schema';
import type { LevelData } from '../src/shared/types';

const level = (meta?: Record<string, unknown>): LevelData => ({
  id: 'x', name: 'X', prototype: 'p', elements: [], ...(meta ? { meta } : {}),
});

describe('schemaOf', () => {
  it('reads the edition a level declares', () => {
    expect(schemaOf(level({ schema: 2 }))).toBe(2);
  });
  it('treats a level with no edition as 1 — it predates the field', () => {
    expect(schemaOf(level())).toBe(1);
    expect(schemaOf(level({ cols: 6 }))).toBe(1);
  });
  it('treats a nonsense edition as 1 rather than NaN', () => {
    expect(schemaOf(level({ schema: 'banana' }))).toBe(1);
    expect(schemaOf(level({ schema: 0 }))).toBe(1);
  });
});

describe('isSchemaSupported', () => {
  it('accepts anything this build knows', () => {
    expect(isSchemaSupported(level({ schema: SCHEMA_VERSION }))).toBe(true);
    expect(isSchemaSupported(level())).toBe(true);
  });
  it('refuses a level from a newer editor instead of guessing at it', () => {
    expect(isSchemaSupported(level({ schema: SCHEMA_VERSION + 1 }))).toBe(false);
  });
});
