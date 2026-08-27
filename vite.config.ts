import { defineConfig } from 'vite';
import { repoLevels } from './plugins/repoLevels';

export default defineConfig({
  // Dev-only (apply: 'serve'). This is what makes the editor's Repo tab able to
  // write level files locally, and absent from the deployed build.
  plugins: [repoLevels()],
  base: './',
  server: { port: 5173 },
  build: { target: 'es2022' },
});
