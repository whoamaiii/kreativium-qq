"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/ilp", label: "ILP" },
  { href: "/aac", label: "AAC" },
  { href: "/chat", label: "Chat" },
];

const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="bg-slate-800 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Kreativium
        </Link>

        <nav className="flex items-center space-x-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm hover:text-purple-400 transition-colors ${
                pathname === href ? "text-purple-500" : "text-slate-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-sm">U</span> {/* Placeholder User Avatar */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
