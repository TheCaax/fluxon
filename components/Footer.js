"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Footer({ name, bridge }) {
  const [currentYear, setCurrentYear] = useState(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <>
      {/*  Footer */}
      <footer className="relative py-12 px-6 border-t backdrop-blur-lg bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold bg-linear-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            <Link href={"/"}>{name}@Fluxon</Link>
          </div>
          <p className="text-yellow-400 mb-6 text-2xl">
            <span className="text-cyan-400">"</span>
            <span className="text-amber-400">{bridge}</span>
            <span className="text-cyan-400">"</span>
          </p>
          <div className="text-sm text-gray-300">
            © {currentYear} Fluxon. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
