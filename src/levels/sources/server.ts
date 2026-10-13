import type { LevelData } from '../../shared/types';
import { PROTOTYPE, PROTOTYPE_UNSET, IS_SHARE_LINK } from '../../config';
import { validateLevelData } from '../serialize';
import type { LevelSource } from './types';

/** The levels API on the studio server (protos-hub). Same origin as the deployed game. */
export const LEVELS_API = '/_hub/api/levels';
/** Written into a share link's copy by the hub: the levels as they were when it was shared. */
export const SHARED_LEVELS_FILE = './shared-levels.json';

/**
 * Levels shared with everyone, stored on the studio server behind the team
 * password, one file per level under this prototype's namespace.
 *
 * There is no `save`: a level here is not edited in place. Publishing is a
 * deliberate act from the editor or the Push all button, and revising one means
 * copying it down to Local or Repo, editing, and publishing again -- the id is
 * preserved, so it replaces rather than duplicates.
 *
 * `remove` exists and deletes for everyone, immediately.
 *
 * Under `npm run dev` the Vite dev server proxies the API to protos.reboot.gs,
 * and the browser asks for the team password the first time.
 */
export class ServerSource implements LevelSource {
  readonly id = 'server' as const;
  readonly label = 'Server';
  readonly blurb = 'Shared with everyone. Copy one down to change it; Delete removes it for everyone.';
  // An unset namespace would pool this game's levels with every other one that forgot.
  readonly available = !PROTOTYPE_UNSET && !IS_SHARE_LINK;

  constructor(private prototype: string = PROTOTYPE) {}

  async list(): Promise<LevelData[]> {
    const levels = await request<unknown[]>('GET', this.url());
    return levels.filter(validateLevelData);
  }

  async remove(level: LevelData): Promise<void> {
    await request('DELETE', this.url(level.id));
  }

  /** Not part of LevelSource -- publishing is an explicit action, not a save. */
  async publish(level: LevelData): Promise<void> {
    // The namespace is the server's key; a level copied in from elsewhere still lands here.
    await request('PUT', this.url(level.id), { ...level, prototype: this.prototype });
  }

  private url(id?: string): string {
    const base = `${LEVELS_API}/${encodeURIComponent(this.prototype)}`;
    return id === undefined ? base : `${base}/${encodeURIComponent(id)}`;
  }
}

/**
 * The Server tab on a public share link. The API sits behind the team password,
 * so a share carries a snapshot of the levels instead -- read-only, and fixed at
 * the moment the link was made.
 */
export class SharedLevelsSource implements LevelSource {
  readonly id = 'server' as const;
  readonly label = 'Server';
  readonly blurb = 'The shared levels as they were when this link was made.';
  readonly available = IS_SHARE_LINK;

  async list(): Promise<LevelData[]> {
    const res = await fetch(SHARED_LEVELS_FILE, { cache: 'no-store' });
    if (res.status === 404) return [];   // shared before the game had any levels
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return ((await res.json()) as unknown[]).filter(validateLevelData);
  }
}

/** Why Publish can't run here, or null when it can. */
export function publishBlockedReason(): string | null {
  if (IS_SHARE_LINK) return 'Not on share links';
  if (PROTOTYPE_UNSET) return 'Set PROTOTYPE first';
  return null;
}

async function request<T = unknown>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    cache: 'no-store',
    // The hub refuses changes without this header, so another website can't
    // make a visitor's saved password publish or delete levels.
    headers: method === 'GET' ? {} : { 'X-Protos-Hub': '1', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const reason = (data as { error?: string } | null)?.error ?? res.statusText;
    throw new Error(res.status === 401 ? 'not signed in to protos.reboot.gs' : `${res.status} ${reason}`);
  }
  return data as T;
}
