"use client";

import Link from "next/link";
import { FiUserPlus, FiCloud } from "react-icons/fi";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* Brand/Home Link */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
            <FiCloud className="text-xl" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">SkyCast</span>
        </Link>

        {/* Action Link: Show only Sign Up per request */}
        <div className="flex items-center gap-4">
          <Link 
            href="/register" 
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <FiUserPlus /> Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}