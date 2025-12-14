"use client";

import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { name: "Overview", path: "/" },
  { name: "Merge", path: "/merge" },
  { name: "Compose", path: "/nup" },
  { name: "Split", path: "/split" },
  { name: "Imaging", path: "/imaging" },
  { name: "About", path: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-black/20 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-4xl tracking-wide select-none whitespace-nowrap">
            <span
              className="bg-linear-to-r from-cyan-400 via-blue-400 to-red-400 bg-clip-text text-transparent overflow-hidden"
              style={{ fontWeight: "bolder" }}
            >
              Fluxon
            </span>
            <span
              className="text-blue-600"
              style={{ fontWeight: "bolder", fontSize: "45px" }}
            >
              .
            </span>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <ul className="hidden md:flex gap-8 text-sm font-medium">
          {NAV_LINKS.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`hover:text-yellow-300 transition cursor-pointer font-bold ${
                  pathname === item.path ? "text-emerald-400" : "text-white"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-white"
          aria-label="Toggle Menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden bg-black/40 backdrop-blur-xl border-t border-white/10 px-6 py-4">
          <ul className="flex flex-col gap-4 text-white text-sm font-medium">
            {NAV_LINKS.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className={`block py-2 px-1 hover:text-indigo-300 transition cursor-pointer ${
                    pathname === item.path ? "text-indigo-400" : ""
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
