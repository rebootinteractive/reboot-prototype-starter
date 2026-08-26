/**
 * Per-prototype namespace. CHANGE THIS FIRST in a new prototype.
 *
 * Every prototype shares one Supabase project, and this string is what keeps
 * their levels apart. Leaving it as the placeholder would pool this game's
 * levels in with every other prototype that forgot -- so the app refuses to
 * publish until it is changed, rather than quietly writing to the wrong bucket.
 */
export const PROTOTYPE = 'CHANGE-ME';

/** True while PROTOTYPE is still the placeholder. */
export const PROTOTYPE_UNSET = PROTOTYPE === 'CHANGE-ME' || !PROTOTYPE;

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * Shared levels are on when the studio project is reachable *and* this
 * prototype has claimed a namespace. Both come from files in the repo, so a
 * fresh clone is connected with nothing to configure.
 */
export const HAS_BACKEND = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !PROTOTYPE_UNSET);

if (PROTOTYPE_UNSET) {
  console.warn(
    '[config] PROTOTYPE is still "CHANGE-ME". Set it in src/config.ts before publishing — ' +
    'until then levels stay local to this browser.',
  );
}
