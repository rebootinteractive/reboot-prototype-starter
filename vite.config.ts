import { defineConfig } from 'vite';
import { repoLevels } from './plugins/repoLevels';
import { hubMeta } from './plugins/hubMeta';

export default defineConfig({
  // repoLevels is dev-only: it lets the editor's Repo tab write level files.
  // hubMeta is build-only: it tells share links which levels to bundle.
  plugins: [repoLevels(), hubMeta()],
  base: './',
  server: {
    port: 5173,
    // The Server tab talks to the studio server. Deployed, that's the same
    // origin; under `npm run dev` this forwards it, and the browser asks for the
    // team password the first time. Origin is rewritten because the server only
    // accepts changes that come from its own site.
    proxy: {
      '/_hub': {
        target: 'https://protos.reboot.gs',
        changeOrigin: true,
        configure: (proxy) => proxy.on('proxyReq', (req) => {
          if (req.getHeader('origin')) req.setHeader('origin', 'https://protos.reboot.gs');
        }),
      },
    },
  },
  build: { target: 'es2022' },
});
