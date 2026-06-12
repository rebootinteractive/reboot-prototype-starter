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
    this.root.innerHTML = `<h1>Prototype</h1><div class="menu-list">Loading…</div>
      <button class="btn" data-act="new">+ Create New Level</button>`;
    this.root.querySelector('[data-act="new"]')!.addEventListener('click', () => this.opts.onEdit());
    this.parent.appendChild(this.root);
    void this.load();
  }

  private async load() {
    const levels = await this.opts.store.list();
    if (!this.root.isConnected) return;
    const list = this.root.querySelector('.menu-list')!;
    list.innerHTML = '';
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
