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

  async setupCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.play();
      this.setVideoElement(videoElement);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }

  setVideoElement(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    this.cameraActive = true;
  }
}
