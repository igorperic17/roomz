// src/components/Floorplan.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Streamer } from '../models/Streamer';
import { GameState } from '../state/GameState';
import { GameLoop } from '../utils/GameLoop';

const floorplanImageSrc = "/floorplan.png"; // Path to your floorplan image
const playerImageSrc = "/player.png"; // Path to your player image

const Floorplan: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(new GameState());
  const initializedRef = useRef<boolean>(false);

  const avatarSize = 150; // 1.5 times larger
  const floorplanWidth = 1600;
  const floorplanHeight = 1200;

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true; // Mark as initialized to prevent re-initialization

    console.log("Initializing the game...");

    const gameState = gameStateRef.current;
    const floorplanImage = new Image();
    floorplanImage.src = floorplanImageSrc;

    const playerImage = new Image();
    playerImage.src = playerImageSrc;

    const player = new Streamer('Igor Peric', 600, 400, playerImageSrc);
    gameState.addStreamer(player);
    gameState.addStreamer(new Streamer('Rubi Diaz', 800, 550, playerImageSrc));
    gameState.addStreamer(new Streamer('Branko Krstic', 300, 200, playerImageSrc));

    player.setupCamera().then(() => {
      console.log("Camera setup complete, starting stream...");
      player.startStreaming('demoStream').catch(err => console.error('Error starting stream:', err));
    });

    const drawAvatar = (ctx: CanvasRenderingContext2D, streamer: Streamer) => {
      // Draw radial gradient glow effect
      const gradient = ctx.createRadialGradient(
        streamer.x + avatarSize / 2,
        streamer.y + avatarSize / 2,
        avatarSize / 2,
        streamer.x + avatarSize / 2,
        streamer.y + avatarSize / 2,
        avatarSize
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.beginPath();
      ctx.arc(streamer.x + avatarSize / 2, streamer.y + avatarSize / 2, avatarSize, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(streamer.x + avatarSize / 2, streamer.y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (streamer.cameraActive && streamer.videoElement) {
        const video = streamer.videoElement;
        const aspectRatio = video.videoWidth / video.videoHeight;
        const width = aspectRatio >= 1 ? video.videoWidth : video.videoHeight * aspectRatio;
        const height = aspectRatio >= 1 ? video.videoWidth / aspectRatio : video.videoHeight;

        ctx.drawImage(
          video,
          (video.videoWidth - width) / 2, // Crop start X
          (video.videoHeight - height) / 2, // Crop start Y
          width,
          height,
          streamer.x,
          streamer.y,
          avatarSize,
          avatarSize
        );
      } else {
        ctx.drawImage(playerImage, streamer.x, streamer.y, avatarSize, avatarSize);
      }

      ctx.restore();

      const textX = streamer.x + avatarSize / 2;
      const textY = streamer.y + avatarSize + 20;
      const gradientText = ctx.createLinearGradient(textX - 50, textY - 10, textX + 50, textY + 10);
      gradientText.addColorStop(0, "rgba(0, 0, 0, 0.0)");
      gradientText.addColorStop(0.5, "rgba(0, 0, 0, 0.6)");
      gradientText.addColorStop(1, "rgba(0, 0, 0, 0.0)");

      ctx.fillStyle = gradientText;
      ctx.fillRect(textX - 50, textY - 15, 100, 20);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "16px Arial";
      ctx.fillText(streamer.name, textX, textY);
    };

    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(floorplanImage, 0, 0, floorplanWidth, floorplanHeight);
      gameState.getStreamers().forEach(streamer => drawAvatar(ctx, streamer));
    };

    floorplanImage.onload = () => {
      const gameLoop = new GameLoop(draw, gameState);
      console.log("Starting game loop...");
      gameLoop.start();

      return () => {
        console.log("Stopping game loop...");
        gameLoop.stop();
      };
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <canvas
        ref={canvasRef}
        width={floorplanWidth}
        height={floorplanHeight}
        className="border"
      />
    </div>
  );
};

export default Floorplan;
