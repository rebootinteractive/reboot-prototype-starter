# reboot-prototype-starter

Template for Reboot Studio casual-puzzle prototypes (2D, or 3D with a Three.js
`GameApp`). Vite + TypeScript + PixiJS; shared levels live on the studio server
(protos.reboot.gs). Cloned per prototype by the `reboot-prototype` skill.

## Per-prototype setup
1. Clone/degit this repo into `~/Documents/RebootPrototypes/<Name>/`.
2. **Set `PROTOTYPE` in `src/config.ts`** to a unique namespace string. Do this
   first — see below.
3. Replace the example mechanic in `src/game/GameApp.ts`, the palette in
   `src/editor/EditorApp.ts`, and `src/levels/builtin.ts`.
4. Replace `composition.html` with the locked stage for this prototype.
5. Update `prototype.json`.

## Live levels — already connected

There is nothing to set up. Shared levels are stored by the studio server's
`protos-hub` app at `/_hub/api/levels/<PROTOTYPE>`, behind the same team
password as the prototypes — no keys, no accounts, nothing in `.env`. Deployed
at `https://protos.reboot.gs/<Name>/`, the game reaches it on its own origin.

Under `npm run dev`, `vite.config.ts` proxies `/_hub` to protos.reboot.gs and
the browser asks for the team password the first time the Server tab loads.

**Share links carry a snapshot.** A public share link (`/s/…`) has no password,
so it can't reach the API. The build writes `hub.json` naming the namespace, and
when someone makes a share link the server copies this prototype's current
levels into it as `shared-levels.json`. The Server tab there is read-only and
frozen at the moment the link was made — publish first, then share.

### `PROTOTYPE` is the one thing you must change

It ships as `CHANGE-ME`, and while it stays that way the Server tab is hidden
and every level stays local to the browser (the server refuses `CHANGE-ME`
too). This is deliberate: a forgotten rename would otherwise pool this game's
levels in with every other prototype that forgot.

## Three level sources, never merged

The menu has a tab per source. They are deliberately kept apart: merged into one
list, a local copy replaces a same-id level from the server, so a colleague's
published edit disappears behind an older local one with nothing on screen to
say so. A level living in more than one source is now flagged, not hidden.

| tab | where | editable | deletable | who sees it |
| --- | --- | --- | --- | --- |
| **Local** | this browser's `localStorage` | yes | yes | only you |
| **Repo** | `src/levels/published/*.json` | yes | yes | whoever pulls the repo |
| **Server** | studio server (protos-hub) | no | yes | everyone |

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

**Delete on the Server tab removes a level for everyone**, with no undo, and
the server keeps no backup — keep anything precious in the Repo tab too.

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
