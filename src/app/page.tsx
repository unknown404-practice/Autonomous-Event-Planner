import Link from "next/link";
import { getEvents } from "@/lib/actions";
import { formatCurrency } from "@/lib/budget-math";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  MapPin,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Hero / System Status Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous GenAI & Deterministic Planning Core</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            EventPilot AI Platform
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Transform high-level event concepts into actionable, financially rigorous, date-aware plans.
            Every budget figure is calculated with decimal-safe arithmetic; every milestone is verified via DAG scheduling; and all AI outputs are strictly schema-validated.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Launch New Event Plan</span>
            </Link>

            <Link
              href="/specs"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium rounded-xl text-sm transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Review Evidence & Audit Trail</span>
            </Link>
          </div>
        </div>

        {/* Real-time system guarantees badge grid */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Budget Engine</div>
            <div className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Deterministic Math
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Timeline Engine</div>
            <div className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> DAG Cycle-Safe
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">GenAI Reliability</div>
            <div className="text-indigo-300 font-semibold mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Zod Validated + Fallback
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Persistence</div>
            <div className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> ACID Relational DB
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Event Plans</h2>
          <p className="text-xs text-slate-500">Live projects stored in persistent database</p>
        </div>
        <Link
          href="/events/new"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Create another
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No events found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Initialize your first AI-assisted event plan with custom budget bounds and date-aware milestones.
          </p>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Event</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const daysLeft = Math.ceil(
              (new Date(evt.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <Link
                key={evt.id}
                href={`/events/${evt.id}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {evt.eventType}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? "Today" : "Completed"}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {evt.eventName}
                  </h3>

                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{evt.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-medium">Budget</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {formatCurrency(evt.totalBudget, evt.currency)}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-medium">Tasks</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {evt._count.tasks}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-400 font-medium">Guests</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {evt.guestCount}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
