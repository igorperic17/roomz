// src/models/Streamer.ts
import ThetaStream from '../api/ThetaStream';

export class Streamer {
  name: string;
  x: number;
  y: number;
  imageSrc: string;
  videoElement: HTMLVideoElement | null = null;
  cameraActive: boolean = false;
  thetaStream: ThetaStream;

  constructor(name: string, x: number, y: number, imageSrc: string) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.imageSrc = imageSrc;
    this.thetaStream = new ThetaStream();
  }

  async setupCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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

  async startStreaming(streamName: string) {
    try {
      await this.thetaStream.initialize();
      const streamId = await this.thetaStream.createStream(streamName);
      const ingestors = await this.thetaStream.listEdgeIngestors();
      if (ingestors.length > 0) {
        for (const ingestor of ingestors) {
          try {
            const { streamServer, streamKey } = await this.thetaStream.selectEdgeIngestor(ingestor.id, streamId);
            if (this.videoElement) {
              this.setupMediaRecorder(streamServer!, streamKey!);
            }
            break; // If the selection is successful, exit the loop
          } catch (error) {
            console.error(`Failed to select ingestor ${ingestor.id}, trying next...`, error);
          }
        }
      } else {
        console.error("No available ingestors found.");
      }
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  }

  setupMediaRecorder(streamServer: string, streamKey: string) {
    const stream = this.videoElement!.srcObject as MediaStream;

    try {
      const mimeType = 'video/webm; codecs=vp9';
      const videoRecorder = new MediaRecorder(stream, { mimeType });
      const audioRecorder = new MediaRecorder(stream, { mimeType });

      const videoChunks: Blob[] = [];
      const audioChunks: Blob[] = [];

      videoRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunks.push(event.data);
        }
      };

      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      videoRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunks, { type: mimeType });
        const audioBlob = new Blob(audioChunks, { type: mimeType });

        const worker = new Worker(new URL('../workers/ffmpeg-worker.js', import.meta.url));
        worker.postMessage({
          type: 'start',
          streamServer,
          streamKey,
          videoBlob,
          audioBlob,
        });

        worker.onmessage = (event) => {
          const { type, data } = event.data;
          if (type === 'log') {
            console.log(data);
          } else if (type === 'error') {
            console.error(data);
          }
        };
      };

      videoRecorder.start(1000); // Collect 1-second chunks
      audioRecorder.start(1000); // Collect 1-second chunks

    } catch (error) {
      console.error('Error starting MediaRecorder:', error);
    }
  }
}
