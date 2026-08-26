import type { LevelData } from '../shared/types';
import type { LevelStore } from '../levels/store';

export interface MenuOptions {
  store: LevelStore;
  onPlay: (level: LevelData) => void;
  onEdit: (level?: LevelData) => void;
}

export class MainMenu {
  private root: HTMLDivElement;

  constructor(private parent: HTMLElement, private opts: MenuOptions) {
    this.root = document.createElement('div');
    this.root.className = 'menu overlay';
    this.root.innerHTML = `<h1>Prototype</h1>
      <p class="menu-status"></p>
      <div class="menu-list">Loading…</div>
      <button class="btn" data-act="new">+ Create New Level</button>`;

    // Whether a saved level can reach anyone else is otherwise invisible.
    const status = this.root.querySelector<HTMLElement>('.menu-status')!;
    status.textContent = opts.store.canPublish
      ? 'Shared levels are on — Publish sends a level to everyone.'
      : 'Local only — set PROTOTYPE in src/config.ts to share levels.';
    status.classList.toggle('live', opts.store.canPublish);
    this.root.querySelector('[data-act="new"]')!.addEventListener('click', () => this.opts.onEdit());
    this.parent.appendChild(this.root);
    void this.load();
  }

  private async load() {
    const levels = await this.opts.store.list();
    if (!this.root.isConnected) return;
    if (this.opts.store.publishedUnreachable) {
      const status = this.root.querySelector<HTMLElement>('.menu-status')!;
      status.textContent = 'Could not reach the shared levels. Anything saved here is still yours.';
      status.classList.remove('live');
      status.classList.add('warn');
    }

    const list = this.root.querySelector('.menu-list')!;
    list.innerHTML = '';
    if (!levels.length) {
      const empty = document.createElement('p');
      empty.className = 'menu-empty';
      empty.textContent = this.opts.store.publishedUnreachable
        ? 'No levels to show — the shared levels could not be reached, and this browser has no drafts.'
        : 'No levels yet. Create one, then Publish it to share it with everyone.';
      list.appendChild(empty);
      return;
    }
    for (const lv of levels) {
      const card = document.createElement('button');
      card.className = 'level-card';
      card.textContent = lv.name;
      card.onclick = () => this.opts.onPlay(lv);
      list.appendChild(card);
    }
  }

  dispose() { this.root.remove(); }
}
