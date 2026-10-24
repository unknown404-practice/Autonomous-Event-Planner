import "./globals.css";
import { Navbar } from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EventPilot AI — World-Class SaaS Event Planning Platform",
  description:
    "Evidence-first, competition-ready GenAI event planning platform with deterministic budget calculations, timeline dependency scheduling, and verifiable provenance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">EventPilot AI</span> — Governed by Zero-Hallucination Evidence Protocol
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Deterministic Financial Math</span>
              <span>•</span>
              <span>DAG Scheduling Engine</span>
              <span>•</span>
              <span>ACID Persistence</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
