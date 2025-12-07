import { useEffect, useState } from 'react';

export default function AnimatedBg() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
    <div className="fixed inset-0 opacity-30 pointer-events-none" style={{ background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(47, 255, 255, 0.8), transparent 35%)`}}/>
    </>
  )
}
