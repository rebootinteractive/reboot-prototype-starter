import { Application, Container, Graphics } from 'pixi.js';
import type { FederatedPointerEvent } from 'pixi.js';
import type { LevelData } from '../shared/types';

export interface GameOptions {
  level: LevelData;
  onMenu: () => void;
  onWin?: () => void;
}

const STAGE_W = 393;
const STAGE_H = 852;
const DOT_R = 26;

export class GameApp {
  private app = new Application();
  private root = new Container();
  private dots: Graphics[] = [];
  private resizeObserver?: ResizeObserver;
  private backBtn?: HTMLButtonElement;

  private constructor(private parent: HTMLElement, private opts: GameOptions) {}

  static async create(parent: HTMLElement, opts: GameOptions): Promise<GameApp> {
    const g = new GameApp(parent, opts);
    await g.init();
    return g;
  }

  private async init() {
    await this.app.init({ width: STAGE_W, height: STAGE_H, background: 0x1c1f2a, antialias: true });
    this.parent.appendChild(this.app.canvas);
    this.app.canvas.style.touchAction = 'none';
    this.app.stage.addChild(this.root);
    this.build();
    this.addBackButton();
    this.resizeObserver = new ResizeObserver(() => this.fit());
    this.resizeObserver.observe(this.parent);
    this.fit();
  }

  private build() {
    for (const el of this.opts.level.elements) {
      const dot = new Graphics().circle(0, 0, DOT_R).fill((el.color as number) ?? 0xffffff);
      dot.position.set(el.x * STAGE_W, el.y * STAGE_H);
      dot.eventMode = 'static';
      dot.cursor = 'pointer';
      dot.on('pointertap', (_e: FederatedPointerEvent) => this.pop(dot));
      this.root.addChild(dot);
      this.dots.push(dot);
    }
  }

  private pop(dot: Graphics) {
    this.root.removeChild(dot);
    dot.destroy();
    this.dots = this.dots.filter((d) => d !== dot);
    if (this.dots.length === 0) this.opts.onWin?.();
  }

  restart() {
    for (const d of this.dots) { this.root.removeChild(d); d.destroy(); }
    this.dots = [];
    this.build();
  }

  private fit() {
    // letterbox the fixed 393×852 stage into the parent
    const { clientWidth: w, clientHeight: h } = this.parent;
    const scale = Math.min(w / STAGE_W, h / STAGE_H);
    this.app.stage.scale.set(scale);
    this.app.stage.position.set((w - STAGE_W * scale) / 2, (h - STAGE_H * scale) / 2);
    this.app.renderer.resize(w, h);
  }

  private addBackButton() {
    const btn = document.createElement('button');
    btn.className = 'btn ghost overlay-back';
    btn.textContent = '← Menu';
    btn.onclick = () => this.opts.onMenu();
    this.parent.appendChild(btn);
    this.backBtn = btn;
  }

  dispose() {
    this.resizeObserver?.disconnect();
    this.backBtn?.remove();
    // destroys renderer, view canvas, and all stage children/graphics
    this.app.destroy({ removeView: true }, { children: true });
  }
}
