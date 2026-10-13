import type { Plugin } from 'vite';
import { PROTOTYPE, PROTOTYPE_UNSET } from '../src/config';

/**
 * Build-only. Writes dist/hub.json naming this prototype's levels namespace.
 *
 * The studio server reads it when someone makes a share link, and copies this
 * prototype's levels into the shared copy -- a share link has no password, so
 * the game can't reach the levels API from there.
 */
export function hubMeta(): Plugin {
  return {
    name: 'hub-meta',
    apply: 'build',
    generateBundle() {
      if (PROTOTYPE_UNSET) return;
      this.emitFile({ type: 'asset', fileName: 'hub.json', source: JSON.stringify({ prototype: PROTOTYPE }) });
    },
  };
}
