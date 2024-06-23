import ThetaStream from '../api/ThetaStream';

export class Streamer {
  name: string;
  x: number;
  y: number;
  imageSrc: string;
  videoElement: HTMLVideoElement | null = null;
  cameraActive: boolean = false;
  thetaStream: ThetaStream;
  socket: WebSocket | null = null;

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
      const ingestorId = '0x093D7e6936fbd2e86f72DB6A5050CbC1535A232A';
      try {
        const { streamServer, streamKey } = await this.thetaStream.selectEdgeIngestor(ingestorId, streamId);
        if (this.videoElement) {
          const rtmpUrl = `${streamServer}/${streamKey}`;
          console.log(`Constructed RTMP URL: ${rtmpUrl}`);
          this.setupMediaRecorder(`ws://localhost:8080`, rtmpUrl);
        }
      } catch (error) {
        console.error(`Failed to select ingestor ${ingestorId}`, error);
      }
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  }

  setupMediaRecorder(wsUrl: string, rtmpUrl: string) {
    const stream = this.videoElement!.srcObject as MediaStream;
    const mimeType = 'video/webm; codecs=vp9';
    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connection opened');
      console.log(`Sending RTMP URL: ${rtmpUrl}`);
      this.socket!.send(JSON.stringify({ rtmpUrl }));
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.socket?.readyState === WebSocket.OPEN) {
        console.log('Sending data chunk:', event.data);
        this.socket.send(event.data);
      }
    };

    mediaRecorder.start(1000); // Collect 1-second chunks
  }
}
