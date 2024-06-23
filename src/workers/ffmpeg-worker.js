import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });
let ffmpegInitialized = false;

onmessage = async (event) => {
  const { type, data, streamServer, streamKey } = event.data;

  if (type === 'start') {
    if (!ffmpegInitialized) {
      await ffmpeg.load();
      ffmpegInitialized = true;
      postMessage({ type: 'log', data: 'FFmpeg loaded' });
    }

    postMessage({ type: 'log', data: 'FFmpeg started' });

  } else if (type === 'data') {
    try {
      ffmpeg.FS('writeFile', 'input.webm', await fetchFile(data));
      await ffmpeg.run('-re', '-i', 'input.webm', '-c:v', 'libx264', '-preset', 'veryfast', '-maxrate', '3000k', '-bufsize', '6000k', '-pix_fmt', 'yuv420p', '-g', '50', '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-strict', 'experimental', '-f', 'flv', `${streamServer}/${streamKey}`);
      postMessage({ type: 'log', data: 'Chunk processed' });
    } catch (error) {
      postMessage({ type: 'error', data: error.message });
    }
  }
};
