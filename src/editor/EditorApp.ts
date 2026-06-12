import { Application, Container, Graphics, Rectangle } from 'pixi.js';
import type { LevelData, GameElement } from '../shared/types';
import type { LevelStore } from '../levels/store';

export interface EditorOptions {
  store: LevelStore;
  prototype: string;
  initial?: LevelData;
  onExit: () => void;
  onTest: (level: LevelData) => void;
}

const STAGE_W = 393;
const STAGE_H = 852;
const DOT_R = 26;
const PALETTE: Array<{ type: string; color: number }> = [
  { type: 'dot', color: 0x6cc24a },
  { type: 'dot', color: 0xff6b6b },
  { type: 'dot', color: 0x4d96ff },
  { type: 'dot', color: 0xffd93d },
];

export class EditorApp {
  private app = new Application();
  private root = new Container();
  private elements: GameElement[];
  private chrome?: HTMLDivElement;
  private resizeObserver?: ResizeObserver;
  private active = 0;
  private name: string;
  private id: string;

  private constructor(private parent: HTMLElement, private opts: EditorOptions) {
    this.elements = opts.initial ? structuredClone(opts.initial.elements) : [];
    this.name = opts.initial?.name ?? 'New Level';
    this.id = opts.initial?.id ?? `custom-${this.slugSeed()}`;
  }

  static async create(parent: HTMLElement, opts: EditorOptions): Promise<EditorApp> {
    const e = new EditorApp(parent, opts);
    await e.init();
    return e;
  }

  private slugSeed(): string {
    // id stable per editor session; uniqueness comes from name + content on save
    return Math.abs(hashString(this.parent.clientWidth + ':' + (this.opts.initial?.id ?? 'new'))).toString(36);
  }

  private async init() {
    await this.app.init({ width: STAGE_W, height: STAGE_H, background: 0x141722, antialias: true });
    this.parent.appendChild(this.app.canvas);
    this.app.canvas.style.touchAction = 'none';
    this.app.stage.addChild(this.root);
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = new Rectangle(0, 0, STAGE_W, STAGE_H);
    this.app.stage.on('pointertap', (e) => this.place(e.global.x, e.global.y));
    this.redraw();
    this.buildChrome();
    this.resizeObserver = new ResizeObserver(() => this.fit());
    this.resizeObserver.observe(this.parent);
    this.fit();
  }

  private place(globalX: number, globalY: number) {
    const local = this.app.stage.toLocal({ x: globalX, y: globalY });
    const nx = local.x / STAGE_W, ny = local.y / STAGE_H;
    if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
    const p = PALETTE[this.active];
    this.elements.push({ type: p.type, x: nx, y: ny, color: p.color });
    this.redraw();
  }

  private redraw() {
    this.root.removeChildren().forEach((c) => c.destroy());
    for (const el of this.elements) {
      const color = typeof el.color === 'number' ? el.color : 0xffffff;
      const dot = new Graphics().circle(0, 0, DOT_R).fill(color);
      dot.position.set(el.x * STAGE_W, el.y * STAGE_H);
      this.root.addChild(dot);
    }
  }

  private snapshot(): LevelData {
    return { id: this.id, name: this.name, prototype: this.opts.prototype, elements: structuredClone(this.elements) };
  }

  private buildChrome() {
    const bar = document.createElement('div');
    bar.className = 'editor-chrome overlay';
    bar.innerHTML = `
      <div class="editor-palette"></div>
      <input class="editor-name" value="${this.name}" />
      <div class="editor-actions">
        <button class="btn small" data-act="clear">Clear</button>
        <button class="btn small" data-act="test">▶ Test</button>
        <button class="btn small" data-act="save">Save</button>
        <button class="btn ghost small" data-act="exit">← Menu</button>
      </div>`;
    const pal = bar.querySelector('.editor-palette')!;
    PALETTE.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'color-dot' + (i === this.active ? ' active' : '');
      b.style.background = '#' + p.color.toString(16).padStart(6, '0');
      b.onclick = () => { this.active = i; pal.querySelectorAll('.color-dot').forEach((n) => n.classList.remove('active')); b.classList.add('active'); };
      pal.appendChild(b);
    });
    bar.querySelector<HTMLInputElement>('.editor-name')!.oninput = (e) => { this.name = (e.target as HTMLInputElement).value; };
    bar.querySelector('[data-act="clear"]')!.addEventListener('click', () => { this.elements = []; this.redraw(); });
    bar.querySelector('[data-act="test"]')!.addEventListener('click', () => this.opts.onTest(this.snapshot()));
    bar.querySelector('[data-act="exit"]')!.addEventListener('click', () => this.opts.onExit());
    bar.querySelector('[data-act="save"]')!.addEventListener('click', async (ev) => {
      const btn = ev.target as HTMLButtonElement;
      btn.disabled = true; btn.textContent = 'Saving…';
      try { await this.opts.store.save(this.snapshot()); btn.textContent = 'Saved ✓'; }
      catch (err) { btn.textContent = 'Save failed'; console.error(err); }
      finally { setTimeout(() => { btn.disabled = false; btn.textContent = 'Save'; }, 1200); }
    });
    this.parent.appendChild(bar);
    this.chrome = bar;
  }

  private fit() {
    const { clientWidth: w, clientHeight: h } = this.parent;
    const scale = Math.min(w / STAGE_W, h / STAGE_H);
    this.app.stage.scale.set(scale);
    this.app.stage.position.set((w - STAGE_W * scale) / 2, (h - STAGE_H * scale) / 2);
    this.app.renderer.resize(w, h);
  }

  dispose() {
    this.resizeObserver?.disconnect();
    this.chrome?.remove();
    this.elements = [];
    // destroys renderer, view canvas, and all stage children/graphics
    this.app.destroy({ removeView: true }, { children: true });
  }
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return h;
}
