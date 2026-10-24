"use client";

import { Printer } from "lucide-react";

interface Props {
  label?: string;
}

export function PrintButton({ label = "Print / Export PDF" }: Props) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
