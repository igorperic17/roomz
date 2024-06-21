// src/utils/GameLoop.ts
import { KeyboardHandler } from './KeyboardHandler';
import { GameState } from '../state/GameState';

export class GameLoop {
  private callback: () => void;
  private animationFrameId: number | null = null;
  private keyboardHandler: KeyboardHandler;
  private gameState: GameState;
  private step = 1;
  private friction = 0.9;
  private velocity = { x: 0, y: 0 };

  constructor(callback: () => void, gameState: GameState) {
    this.callback = callback;
    this.keyboardHandler = new KeyboardHandler();
    this.gameState = gameState;
  }

  start() {
    const loop = () => {
      this.update();
      this.callback();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  update() {
    const player = this.gameState.getStreamers().find(s => s.name === 'Igor Peric');
    if (!player) return;

    let dx = 0;
    let dy = 0;
    if (this.keyboardHandler.isKeyPressed('ArrowUp')) dy -= this.step;
    if (this.keyboardHandler.isKeyPressed('ArrowDown')) dy += this.step;
    if (this.keyboardHandler.isKeyPressed('ArrowLeft')) dx -= this.step;
    if (this.keyboardHandler.isKeyPressed('ArrowRight')) dx += this.step;

    this.velocity.x += dx;
    this.velocity.y += dy;

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    const newX = Math.max(0, Math.min(player.x + this.velocity.x, 1600 - 150)); // floorplanWidth - avatarSize
    const newY = Math.max(0, Math.min(player.y + this.velocity.y, 1200 - 150)); // floorplanHeight - avatarSize

    this.gameState.updateStreamerPosition('Igor Peric', newX, newY);
  }
}
