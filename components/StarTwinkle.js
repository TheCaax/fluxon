"use client";

import { useEffect, useRef } from "react";

export default function StarTwinkle() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // CONFIG — tweak these to control performance
    const STAR_COUNT_BG = 120;   // decrease/increase density
    const STAR_COUNT_FG = 60;
    const SPARKLE_CHANCE = 0.005; // smaller = less sparkle
    const SPARKLE_FADE = 0.045;   // smaller = slower fade
    const DRIFT_SPEED_BG = 0.015;
    const DRIFT_SPEED_FG = 0.035;

    // Generate stars with precomputed randoms (cheaper per frame)
    const makeStars = (count, sizeRange, driftSpeed) =>
      Array.from({ length: count }).map(() => {
        const radius = sizeRange[0] + Math.random() * sizeRange[1];
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          baseAlpha: 0.15 + Math.random() * 0.25,
          alpha: 0,
          sparkle: 0,
          driftX: (Math.random() - 0.5) * driftSpeed,
          driftY: (Math.random() - 0.5) * driftSpeed,
        };
      });

    const background = makeStars(STAR_COUNT_BG, [0.2, 0.45], DRIFT_SPEED_BG);
    const foreground = makeStars(STAR_COUNT_FG, [0.6, 1.2], DRIFT_SPEED_FG);

    const drawStars = (stars) => {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Sparkle start
        if (s.sparkle <= 0 && Math.random() < SPARKLE_CHANCE) {
          s.sparkle = 1;
        }

        // Sparkle fade
        if (s.sparkle > 0) {
          s.alpha = 0.9 * s.sparkle;
          s.sparkle -= SPARKLE_FADE;
        } else {
          s.alpha = s.baseAlpha;
        }

        // Drift (no randomness inside frame loop — cheaper)
        s.x += s.driftX;
        s.y += s.driftY;

        // Wrap edges (simple and cheap)
        if (s.x < 0) s.x += canvas.width;
        if (s.x > canvas.width) s.x -= canvas.width;
        if (s.y < 0) s.y += canvas.height;
        if (s.y > canvas.height) s.y -= canvas.height;

        // Draw
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawStars(background);
      drawStars(foreground);

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-full h-full"
    />
  );
}