// src/models/Streamer.ts
export class Streamer {
  name: string;
  x: number;
  y: number;
  imageSrc: string;
  videoElement: HTMLVideoElement | null = null;
  cameraActive: boolean = false;

  constructor(name: string, x: number, y: number, imageSrc: string) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.imageSrc = imageSrc;
  }

  setVideoElement(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    this.cameraActive = true;
  }
}
