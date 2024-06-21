// src/utils/GameLoop.ts
export class GameLoop {
    private callback: () => void;
    private animationFrameId: number | null = null;
  
    constructor(callback: () => void) {
      this.callback = callback;
    }
  
    start() {
      const loop = () => {
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
  }
  