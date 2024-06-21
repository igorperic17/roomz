// src/state/GameState.ts
import { Streamer } from '../models/Streamer';

export class GameState {
  streamers: Streamer[];

  constructor() {
    this.streamers = [];
  }

  addStreamer(streamer: Streamer) {
    if (this.streamers.findIndex((x) => streamer.name === x.name) != -1)
      return;
    this.streamers.push(streamer);
  }

  updateStreamerPosition(name: string, x: number, y: number) {
    const streamer = this.streamers.find(s => s.name === name);
    if (streamer) {
      streamer.x = x;
      streamer.y = y;
    }
  }

  getStreamers() {
    return this.streamers;
  }
}
