# reboot-prototype-starter

Template for Reboot Studio 2D casual-puzzle prototypes.
Vite + TypeScript + PixiJS + Supabase. Cloned per prototype by the
`reboot-prototype` skill.

## Per-prototype setup
1. Clone/degit this repo into `~/Documents/RebootPrototypes/<Name>/`.
2. **Set `PROTOTYPE` in `src/config.ts`** to a unique namespace string. Do this
   first — see below.
3. Replace the example mechanic in `src/game/GameApp.ts`, the palette in
   `src/editor/EditorApp.ts`, and `src/levels/builtin.ts`.
4. Replace `composition.html` with the locked stage for this prototype.
5. Update `prototype.json`.

## Live levels — already connected

There is nothing to set up. `.env` is committed with the shared studio Supabase
project, so a fresh clone can publish levels the moment `PROTOTYPE` is set. No
dashboard visit, no SQL, no secrets: every prototype shares one project and one
`levels` table, and the `prototype` column keeps them apart.

`docs/supabase-schema.sql` records the table's shape. It has **already been run**
and is reference only.

### `PROTOTYPE` is the one thing you must change

It ships as `CHANGE-ME`, and while it stays that way the app refuses to publish
and keeps every level local to the browser — the menu says so. This is
deliberate: with credentials baked in, a forgotten rename would quietly pool
this game's levels in with every other prototype that forgot.

### The key is public on purpose

It is embedded in the bundle and extractable from any build, so it is committed
rather than pretended to be secret. It grants read, insert and update on the
`levels` table and nothing else — no delete. To retire it, roll it in the
Supabase dashboard; deleting the file will not remove it from git history. The
`service_role` / secret key never belongs in the repo.

## Save vs Publish

- **Save draft** — private to that browser, always. `localStorage`, never shared.
- **Publish** — the deliberate second step that shares a level with everyone.

They use separate backends (`LocalDraftBackend` and `SupabaseBackend`) so that
having a shared backend configured can never turn a private Save into a live
publish.

`LevelStore.list()` layers builtin → published → drafts, and a later layer
replaces a same-id level from an earlier one. So a draft shadows the published
copy of the level being edited, and either layer failing still returns the
others.

## Level format version

`src/levels/schema.ts` holds `SCHEMA_VERSION`, stamped into `meta.schema` on
every save. A level document is usually read by more than one program — this
prototype, and often a Unity port months later — and without a version a format
change fails *silently*: the level loads and plays wrong. Bump it on any change
an older reader would misread, and have every reader refuse an edition it does
not know.

## Commands
- `npm run dev` — local dev
- `npm test` — pure-TS unit tests
- `npm run build` — type-check + production build
