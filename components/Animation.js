"use client";

import { useRef, useEffect } from "react";

export function GradientInkBackground() {
  const bgRef = useRef(null);

  useEffect(() => {
    const el = bgRef.current;

    const handleMove = (e) => {
      const { clientX, clientY } = e;

      const angle =
        Math.atan2(
          clientY - window.innerHeight / 2,
          clientX - window.innerWidth / 2
        ) *
        (180 / Math.PI);

      el.style.setProperty("--x", clientX + "px");
      el.style.setProperty("--y", clientY + "px");
      el.style.setProperty("--angle", angle + "deg");
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      ref={bgRef}
      className="fixed inset-0 -z-10"
      style={{
        background: `
          radial-gradient(
            circle at var(--x, 50%) var(--y, 50%),
            rgba(0,255,100,0.22),
            transparent 28%
          ),
          linear-gradient(var(--angle, 0deg), #090909, #0d0d0d, #111)
        `,
        transition: "background 0.1s linear",
        pointerEvents: "none",
      }}
    />
  );
}


export function MouseAnimation() {
  const canvasRef = useRef(null);
  const particles = useRef([]).current;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Guard: canvas not ready yet
    
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // CONFIG — tweak these
    const BURST_PARTICLES = 30; // lower = less dense
    const PARTICLE_FADE = 0.009; // lower = slower fade & longer life
    const PARTICLE_SPEED = 0.3; // lower = slower movement
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
    // <canvas
    //   ref={canvasRef}
    //   className="fixed inset-0 pointer-events-none"
    //   style={{ zIndex: 999 }}
    // />
    <></>
  );
}
