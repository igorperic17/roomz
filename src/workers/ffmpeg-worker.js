import * as ffmpeg from '@ffmpeg/ffmpeg';

const { createFFmpeg, fetchFile } = ffmpeg;

const ffmpegInstance = createFFmpeg({ log: true });

self.onmessage = async (event) => {
  const { type, streamServer, streamKey, videoBlob, audioBlob } = event.data;

  if (type === 'start') {
    await ffmpegInstance.load();

    // Write video and audio blobs to FFmpeg file system
    ffmpegInstance.FS('writeFile', 'video.webm', await fetchFile(videoBlob));
    ffmpegInstance.FS('writeFile', 'audio.webm', await fetchFile(audioBlob));

    // Run FFmpeg command to stream to RTMP server
    await ffmpegInstance.run(
      '-re',
      '-i', 'video.webm',
      '-i', 'audio.webm',
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-f', 'flv',
      `${streamServer}/${streamKey}`
    );

    self.postMessage({ type: 'log', data: 'Streaming started' });
  }
};
