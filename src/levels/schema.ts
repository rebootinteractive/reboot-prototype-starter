import type { LevelData } from '../shared/types';

/**
 * Edition of the level format.
 *
 * A level document is read by more than one program -- this prototype now, and
 * often a Unity port later, built months apart. Without a version number a
 * format change fails silently: a level loads and plays *wrong*, which costs
 * far more to find than one that refuses to load.
 *
 * Bump this on any change an older reader would misinterpret, and have every
 * reader refuse an edition it does not know.
 *
 *   1 -- initial.
 */
export const SCHEMA_VERSION = 1;

/** The edition a level declares. Levels predating the field really are 1. */
export function schemaOf(level: LevelData): number {
  const raw = (level.meta as Record<string, unknown> | undefined)?.schema;
  return typeof raw === 'number' && Number.isFinite(raw) && raw >= 1 ? Math.round(raw) : 1;
}

/** False when the level was authored by a newer editor than this build. */
export function isSchemaSupported(level: LevelData): boolean {
  return schemaOf(level) <= SCHEMA_VERSION;
}
