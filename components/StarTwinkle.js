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

    // Create stars
    const makeStars = (count, sizeRange, driftSpeed) =>
      Array.from({ length: count }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: sizeRange[0] + Math.random() * sizeRange[1],
        baseAlpha: 0.1 + Math.random() * 0.3,  // faint default brightness
        alpha: 0,
        sparkle: 0, // sparkle state
        driftX: (Math.random() - 0.5) * driftSpeed,
        driftY: (Math.random() - 0.5) * driftSpeed
      }));

    const foreground = makeStars(80, [0.8, 1.4], 0.05);
    const background = makeStars(150, [0.3, 0.5], 0.02);

    const drawStars = (stars) => {
      stars.forEach((s) => {

        // ⭐ STAR SPARKLE LOGIC ⭐
        // small chance per frame to trigger sparkle
        if (Math.random() < 0.008) {
          s.sparkle = 1; // start bright flash
        }

        if (s.sparkle > 0) {
          // bright flash that fades quickly
          s.alpha = 0.9 * s.sparkle;
          s.sparkle -= 0.06; // fade speed
        } else {
          // idle faint shine
          s.alpha = s.baseAlpha;
        }

        // drifting motion for realism
        s.x += s.driftX;
        s.y += s.driftY;

        // wrap around edges
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;

        // draw star
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
      });
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
      className="fixed inset-0 w-full h-full pointer-events-none"
    />
  );
}
