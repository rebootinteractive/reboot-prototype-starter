import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { LevelData, LevelsBackend } from '../shared/types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

// Row shape in the `levels` table.
interface LevelRow {
  id: string;
  prototype: string;
  name: string;
  data: LevelData;
}

export class SupabaseBackend implements LevelsBackend {
  private client: SupabaseClient;

  constructor(url = SUPABASE_URL, key = SUPABASE_ANON_KEY) {
    this.client = createClient(url, key);
  }

  async fetch(prototype: string): Promise<LevelData[]> {
    const { data, error } = await this.client
      .from('levels')
      .select('data')
      .eq('prototype', prototype);
    if (error) throw error;
    return (data ?? []).map((r) => (r as { data: LevelData }).data);
  }

  async insert(level: LevelData): Promise<void> {
    const row: LevelRow = { id: level.id, prototype: level.prototype, name: level.name, data: level };
    // Matches the (prototype, id) key: an id is unique within a game, not across
    // the studio's shared table. Conflicting on `id` alone would let one
    // prototype's level overwrite another's.
    const { error } = await this.client.from('levels').upsert(row, { onConflict: 'prototype,id' });
    if (error) throw error;
  }
}
