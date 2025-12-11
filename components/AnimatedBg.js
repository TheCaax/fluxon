"use client";
import { useEffect, useRef } from "react";

export default function AnimatedBg() {
  const canvasRef = useRef(null);
  const particles = useRef([]).current;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // CONFIG — tweak these
    const BURST_PARTICLES = 50; // lower = less dense
    const PARTICLE_FADE = 0.01; // lower = slower fade & longer life
    const PARTICLE_SPEED = 0.5; // lower = slower movement
    const COLOR = "0, 255, 25"; // lime green

    let lastBurst = 0;

    const createBurst = (x, y) => {
      for (let i = 0; i < BURST_PARTICLES; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          x,
          y,
          size: Math.random() * 2 + 1,
          speed: Math.random() * PARTICLE_SPEED + 0.3,
          angle,
          alpha: 1,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let index = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.alpha <= 0) continue; // skip dead particles

        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.alpha -= PARTICLE_FADE;

        ctx.fillStyle = `rgba(${COLOR}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        particles[index++] = p; // pack alive particles to the front
      }

      particles.length = index; // remove dead particles in one operation

      requestAnimationFrame(animate);
    };

    animate();

    const handleMove = (e) => {
      const now = performance.now();

      // Throttle bursts (avoid 200 bursts/sec on high FPS mouse)
      if (now - lastBurst > 20) {
        createBurst(e.clientX, e.clientY);
        lastBurst = now;
      }
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 999 }}
    />
  );
}
