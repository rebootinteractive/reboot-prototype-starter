# reboot-prototype-starter

Template for Reboot Studio 2D casual-puzzle prototypes.
Vite + TypeScript + PixiJS + Supabase. Cloned per prototype by the
`reboot-prototype` skill.

## Per-prototype setup
1. Clone/degit this repo into `~/Documents/RebootPrototypes/<Name>/`.
2. Set `PROTOTYPE` in `src/config.ts` to a unique namespace string.
3. Replace the example mechanic in `src/game/GameApp.ts`, the palette in
   `src/editor/EditorApp.ts`, and `src/levels/builtin.ts`.
4. Replace `composition.html` with the locked stage for this prototype.
5. Update `prototype.json`.

## Live levels (Supabase)
- Run `docs/supabase-schema.sql` once in the shared studio project.
- Copy `.env.example` → `.env`, fill `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- Without them, the app runs on builtin levels + an in-memory editor (no sharing).

## Commands
- `npm run dev` — local dev
- `npm test` — pure-TS unit tests
- `npm run build` — type-check + production build
