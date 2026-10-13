/**
 * Per-prototype namespace. CHANGE THIS FIRST in a new prototype.
 *
 * Every prototype's levels live on the same studio server, and this string is
 * what keeps them apart. Leaving it as the placeholder would pool this game's
 * levels in with every other prototype that forgot -- so the app refuses to
 * publish until it is changed, rather than quietly writing to the wrong bucket.
 */
// Annotated `string` on purpose. Without it TypeScript infers the literal type
// 'CHANGE-ME', and the placeholder check below becomes a compile error the
// moment anyone renames it -- breaking the build on the one step every new
// prototype has to perform.
export const PROTOTYPE: string = 'CHANGE-ME';

const PLACEHOLDER = 'CHANGE-ME';

/** True while PROTOTYPE is still the placeholder. */
export const PROTOTYPE_UNSET = PROTOTYPE === PLACEHOLDER || !PROTOTYPE;

/**
 * True on a public share link (https://protos.reboot.gs/s/<id>/). There the
 * levels API is out of reach -- it sits behind the team password -- so the game
 * reads the levels the server bundled into the link instead.
 * (`typeof location` guard: vite.config imports this file under Node.)
 */
export const IS_SHARE_LINK = typeof location !== 'undefined' && /^\/s\/[^/]+\//.test(location.pathname);

if (PROTOTYPE_UNSET) {
  console.warn(
    '[config] PROTOTYPE is still "CHANGE-ME". Set it in src/config.ts before publishing — ' +
    'until then levels stay local to this browser.',
  );
}
