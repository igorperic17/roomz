// src/components/Floorplan.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const floorplanImage = "/floorplan.png"; // Path to your floorplan image
const playerImage = "/player.png"; // Path to your player image

const avatars = [
  { name: "Rubi Diaz", position: { x: 800, y: 550 } },
  { name: "Branko Krstic", position: { x: 400, y: 200 } },
];

const Floorplan: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 100, y: 100 });
  const [velocity, setVelocity] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const step = 5;
  const avatarSize = 100; // Twice as big as before
  const floorplanWidth = 1200;
  const floorplanHeight = 900;
  const friction = 0.9;

  const drawAvatar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, name: string, playerImage: HTMLImageElement) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(playerImage, x, y, avatarSize, avatarSize);
    ctx.restore();
    
    // Draw gradient background for text
    const textX = x + avatarSize / 2;
    const textY = y + avatarSize + 20;
    const gradient = ctx.createLinearGradient(textX - 80, textY - 10, textX + 80, textY + 10);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.0)");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.6)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.0)");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(textX - 80, textY - 15, 180, 20);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "16px Arial";
    ctx.fillText(name, textX, textY);
  }, []);

  const drawAvatars = useCallback((ctx: CanvasRenderingContext2D, image: HTMLImageElement, playerImage: HTMLImageElement) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(image, 0, 0, floorplanWidth, floorplanHeight);
    drawAvatar(ctx, position.x, position.y, "Igor Peric", playerImage);

    avatars.forEach(avatar => {
      drawAvatar(ctx, avatar.position.x, avatar.position.y, avatar.name, playerImage);
    });
  }, [position, drawAvatar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const image = new Image();
    image.src = floorplanImage;
    const player = new Image();
    player.src = playerImage;

    image.onload = () => {
      ctx.drawImage(image, 0, 0, floorplanWidth, floorplanHeight);
      drawAvatars(ctx, image, player);
    };

    let animationFrameId: number;
    const animate = () => {
      setPosition((prev) => {
        const newX = Math.max(0, Math.min(prev.x + velocity.x, floorplanWidth - avatarSize));
        const newY = Math.max(0, Math.min(prev.y + velocity.y, floorplanHeight - avatarSize));
        return { x: newX, y: newY };
      });

      setVelocity((prev) => ({
        x: prev.x * friction,
        y: prev.y * friction,
      }));

      ctx.drawImage(image, 0, 0, floorplanWidth, floorplanHeight);
      drawAvatars(ctx, image, player);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [velocity, drawAvatars]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setVelocity((prev) => {
        let dx = 0;
        let dy = 0;
        if (event.key === "ArrowUp") dy = -step;
        if (event.key === "ArrowDown") dy = step;
        if (event.key === "ArrowLeft") dx = -step;
        if (event.key === "ArrowRight") dx = step;
        return { x: prev.x + dx, y: prev.y + dy };
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      const image = new Image();
      image.src = floorplanImage;
      const player = new Image();
      player.src = playerImage;

      image.onload = () => {
        drawAvatars(ctx, image, player);
      };
    }
  }, [position, drawAvatars]);

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
