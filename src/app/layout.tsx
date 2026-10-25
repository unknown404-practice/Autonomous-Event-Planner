import "./globals.css";
import { Navbar } from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EventPilot — Thoughtful Event Planning & Management",
  description:
    "A clean, humanized event planning suite. Deterministic budget math, DAG milestone scheduling, and real-time vendor collaboration.",
  icons: {
    icon: "/app-icon.png",
    shortcut: "/app-icon.png",
    apple: "/app-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500/10 selection:text-indigo-600">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 py-7 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">EventPilot</span>
              <span className="text-slate-400">•</span>
              <span>Intelligent Event Orchestration</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Financial Math</span>
              <span>•</span>
              <span>DAG Scheduling</span>
              <span>•</span>
              <span>ACID Storage</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
