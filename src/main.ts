import { MainMenu } from './ui/MainMenu';
import { GameApp } from './game/GameApp';
import { EditorApp } from './editor/EditorApp';
import { LevelStore } from './levels/store';
import { SupabaseBackend } from './levels/supabaseBackend';
import { LocalDraftBackend } from './levels/localBackend';
import { BUILTIN_LEVELS } from './levels/builtin';
import { PROTOTYPE, HAS_BACKEND } from './config';
import type { LevelData } from './shared/types';

const appEl = document.getElementById('app')!;
// Drafts are always local. Supabase is the *publish* target only, so having a
// shared backend configured never turns a private Save into a live publish.
const drafts = new LocalDraftBackend(PROTOTYPE);
const published = HAS_BACKEND ? new SupabaseBackend() : null;
const store = new LevelStore(PROTOTYPE, drafts, published, BUILTIN_LEVELS);

let current: { dispose(): void } | undefined;
function clearApp() { current?.dispose(); current = undefined; }

let navSeq = 0;

function showMenu() {
  clearApp();
  navSeq++;
  current = new MainMenu(appEl, {
    store,
    onPlay: (lv) => showGame(lv),
    onEdit: (lv) => showEditor(lv),
  });
}

async function showGame(level: LevelData, returnToEditor?: LevelData) {
  clearApp();
  const seq = ++navSeq;
  const g = await GameApp.create(appEl, {
    level,
    onMenu: () => (returnToEditor ? showEditor(returnToEditor) : showMenu()),
    onWin: () => { /* v1: silent; mechanic decides win UX */ },
  });
  if (seq !== navSeq) { g.dispose(); return; }  // superseded by a newer navigation
  current = g;
}

async function showEditor(initial?: LevelData) {
  clearApp();
  const seq = ++navSeq;
  const e = await EditorApp.create(appEl, {
    store, prototype: PROTOTYPE, initial,
    onExit: () => showMenu(),
    onTest: (lv) => showGame(lv, lv),
  });
  if (seq !== navSeq) { e.dispose(); return; }  // superseded by a newer navigation
  current = e;
}

showMenu();
