"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Compass,
  FileCheck2,
  PlusCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const isCurrent = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                EventPilot <span className="text-xs bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">AI</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium">Evidence-First SaaS Architecture</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Events
            </Link>
            <Link
              href="/specs"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === "/specs"
                  ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Verified Protocol
            </Link>
          </nav>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Hallucination Active</span>
          </div>

          <Link
            href="/events/new"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all shadow-indigo-600/20 hover:shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan Event</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
