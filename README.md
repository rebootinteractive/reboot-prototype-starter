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

## Three level sources, never merged

The menu has a tab per source. They are deliberately kept apart: merged into one
list, a local copy replaces a same-id level from the server, so a colleague's
published edit disappears behind an older local one with nothing on screen to
say so. A level living in more than one source is now flagged, not hidden.

| tab | where | editable | deletable | who sees it |
| --- | --- | --- | --- | --- |
| **Local** | this browser's `localStorage` | yes | yes | only you |
| **Repo** | `src/levels/published/*.json` | yes | yes | whoever pulls the repo |
| **Server** | Supabase | no | yes | everyone |

**Save** writes back to the tab a level came from and never moves it. The `→`
buttons copy a level to another tab, keeping its id so a later publish replaces
rather than duplicates. **Publish** is the deliberate step that shares a level.

**Repo is a real filesystem tab, dev-server only.** A browser cannot write to
disk, so it talks to `plugins/repoLevels.ts`, a Vite middleware marked
`apply: 'serve'`. The deployed build has no server, so the tab is absent there —
enforced by architecture, not a flag. What it writes are ordinary files: git
tracks them, and a designer commits, diffs and reverts them as usual. Filenames
follow the level name so diffs read well; a rename moves the file, collisions
get a suffix, and anything that is not a bare kebab-case `.json` is refused so
nothing can be written outside the levels directory.

**A server level is not edited in place.** To revise one, copy it down to Local
or Repo, edit, and publish again — the id is preserved, so publishing replaces
rather than duplicates.

**Delete on the Server tab removes a level for everyone**, with no undo. It
needs the delete grant and policy in `docs/supabase-schema.sql`; without them it
fails loudly rather than appearing to work, because PostgREST reports a delete
that matched no rows exactly as it reports one that did.

**Push all to Server** on the Local or Repo tab publishes that whole tab at
once. It says how many are new and names the ones it would overwrite before it
starts, since those are a colleague's published copies.

**Nothing ships in the bundle.** A freshly deployed prototype shows only what
has been published, so publish your baseline levels as part of first deploy.

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
