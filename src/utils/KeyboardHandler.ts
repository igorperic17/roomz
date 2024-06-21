// src/utils/KeyboardHandler.ts
export class KeyboardHandler {
    private keysPressed: { [key: string]: boolean } = {};
  
    constructor() {
      this.init();
    }
  
    private init() {
      window.addEventListener('keydown', (event) => {
        this.keysPressed[event.key] = true;
      });
  
      window.addEventListener('keyup', (event) => {
        this.keysPressed[event.key] = false;
      });
    }
  
    isKeyPressed(key: string): boolean {
      return !!this.keysPressed[key];
    }
  }
  