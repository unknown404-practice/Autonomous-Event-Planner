"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { formatCurrency } from "@/lib/budget-math";
import { cancelEvent, deleteEvent, reactivateEvent } from "@/lib/actions";
import {
  saveEventToLocalHistory,
  syncAllEventsToLocalHistory,
  removeEventFromLocalHistory,
} from "@/lib/local-storage-sync";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  FileCheck2,
  MapPin,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Users,
  Wallet,
  X,
  AlertTriangle,
  Briefcase,
  Heart,
  Utensils,
} from "lucide-react";

interface EventItem {
  id: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  status?: string;
  _count: {
    budgetItems: number;
    tasks: number;
    vendors: number;
    guests: number;
  };
}

interface DashboardViewProps {
  events: EventItem[];
}

export function DashboardView({ events }: DashboardViewProps) {
  const [eventList, setEventList] = useState<EventItem[]>(events);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [eventToCancel, setEventToCancel] = useState<EventItem | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync latest SQLite database events to user's browser localStorage on mount
  useEffect(() => {
    setEventList(events);
    syncAllEventsToLocalHistory(events);
  }, [events]);

  const activeEvents = eventList.filter((e) => e.status !== "CANCELLED");
  const historyEvents = eventList.filter((e) => e.status === "CANCELLED");

  const displayedEvents = activeTab === "active" ? activeEvents : historyEvents;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmCancel = async () => {
    if (!eventToCancel) return;
    setIsProcessing(true);
    const res = await cancelEvent(eventToCancel.id, cancelReason);
    if (res.success) {
      setEventList((prev) =>
        prev.map((e) => (e.id === eventToCancel.id ? { ...e, status: "CANCELLED" } : e))
      );
      saveEventToLocalHistory({ ...eventToCancel, status: "CANCELLED" }, "EVENT_CANCELLED");
      showToast(`"${eventToCancel.eventName}" cancelled. History preserved in SQLite & LocalStorage.`);
      setEventToCancel(null);
      setCancelReason("");
    }
    setIsProcessing(false);
  };

  const handleReactivate = async (evt: EventItem) => {
    setIsProcessing(true);
    const res = await reactivateEvent(evt.id);
    if (res.success) {
      setEventList((prev) =>
        prev.map((e) => (e.id === evt.id ? { ...e, status: "PLANNING" } : e))
      );
      saveEventToLocalHistory({ ...evt, status: "PLANNING" }, "EVENT_REACTIVATED");
      showToast(`"${evt.eventName}" reactivated to active planning.`);
    }
    setIsProcessing(false);
  };

  const handlePermanentDelete = async (evt: EventItem) => {
    if (!confirm(`Permanently delete "${evt.eventName}"? All records will be removed from SQLite database.`)) return;
    setIsProcessing(true);
    const res = await deleteEvent(evt.id);
    if (res.success) {
      setEventList((prev) => prev.filter((e) => e.id !== evt.id));
      removeEventFromLocalHistory(evt.id);
      showToast(`"${evt.eventName}" permanently removed.`);
      if (eventToCancel?.id === evt.id) setEventToCancel(null);
    }
    setIsProcessing(false);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 dark:border-slate-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800/90 p-8 sm:p-12 mb-10 shadow-sm"
      >
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>Clean Architecture & Deterministic Planning</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQLite DB & LocalStorage Active</span>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-4">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center p-2.5 shadow-md ring-1 ring-slate-900/10 dark:ring-white/20 shrink-0 mt-1"
            >
              <Image
                src="/app-icon.png"
                alt="EventPilot"
                width={40}
                height={40}
                className="w-full h-full object-contain invert dark:invert-0"
              />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Plan every event with calm and precision.
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Orchestrate budgets, milestone dependencies, vendor quotes, and guest RSVPs — with full SQLite history and local browser persistence.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/events/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Plan a New Event</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/specs"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl text-sm shadow-2xs transition-colors"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>System Specs & Provenance</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Feature Guarantees */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-400 dark:text-slate-500 font-medium">Database Persistence</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>SQLite History</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 dark:text-slate-500 font-medium">Browser Storage</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>LocalStorage Mirror</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 dark:text-slate-500 font-medium">AI Generation</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Ollama Gemma 2B</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 dark:text-slate-500 font-medium">Budget Accounting</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Decimal-Safe Math</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Section Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "active"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Active Plans ({activeEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "history"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Event History & Cancelled ({historyEvents.length})
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {activeTab === "active"
              ? activeEvents.length === 0
                ? "No active events right now"
                : `${activeEvents.length} active project${activeEvents.length === 1 ? "" : "s"} in your SQLite database`
              : `${historyEvents.length} cancelled or archived event record${historyEvents.length === 1 ? "" : "s"} preserved in database & local storage`}
          </p>
        </div>

        {activeEvents.length > 0 && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/events/new"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Another Event</span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Empty State */}
      {displayedEvents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-10 sm:p-14 text-center"
        >
          <div className="max-w-md mx-auto">
            <motion.div
              whileHover={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center p-3.5 mx-auto mb-5 shadow-md ring-1 ring-slate-900/10 dark:ring-white/20"
            >
              <Image
                src="/app-icon.png"
                alt="EventPilot Icon"
                width={48}
                height={48}
                className="w-full h-full object-contain invert dark:invert-0"
              />
            </motion.div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {activeTab === "active"
                ? "Ready to plan your next gathering?"
                : "No event history found"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {activeTab === "active"
                ? "You don't have any active events. Start by creating your first event — all data is saved directly in your local SQLite database and mirrored to your browser's local storage."
                : "Cancelled and archived events will appear here with complete audit trails and data contracts intact."}
            </p>

            {activeTab === "active" && (
              <div className="mt-6 flex justify-center">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/events/new"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Your First Event</span>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        /* Event Cards Grid */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayedEvents.map((evt) => {
            const isCancelled = evt.status === "CANCELLED";
            const daysLeft = Math.ceil(
              (new Date(evt.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <motion.div
                key={evt.id}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                      {evt.eventType.replace("_", " ")}
                    </span>

                    {isCancelled ? (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        CANCELLED
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? "Today" : "Completed"}
                      </span>
                    )}
                  </div>

                  <Link href={`/events/${evt.id}`}>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1">
                      {evt.eventName}
                    </h3>
                  </Link>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{evt.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-medium">Budget</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {formatCurrency(evt.totalBudget, evt.currency)}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-medium">Tasks</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {evt._count.tasks}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-medium">Guests</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {evt.guestCount}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar for every created event */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <Link
                      href={`/events/${evt.id}`}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors"
                    >
                      Open Workspace &rarr;
                    </Link>

                    {!isCancelled ? (
                      <button
                        type="button"
                        onClick={() => setEventToCancel(evt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-rose-200/90 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shadow-2xs"
                        title="Cancel this event"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Cancel Event</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReactivate(evt)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
                        title="Restore event to active planning"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reactivate</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Confirmation Modal: Viewport Safe & Physics-Based */}
      <AnimatePresence>
        {eventToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEventToCancel(null)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Cancel Event</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEventToCancel(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-300">
                  <p className="font-bold text-sm">
                    Are you sure you want to cancel &ldquo;{eventToCancel.eventName}&rdquo;?
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                    The event will be marked as <span className="font-semibold text-rose-700 dark:text-rose-400">CANCELLED</span>.
                    All associated budget allocations, scheduled tasks, vendor quotations, and guest lists remain archived in your SQLite database and browser local storage for future reference.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Reason for Cancellation (Optional)
                  </label>
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="e.g. Schedule conflict, budget constraint, postponed"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handlePermanentDelete(eventToCancel)}
                    disabled={isProcessing}
                    className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors underline"
                  >
                    Permanently delete instead
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setEventToCancel(null)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Keep Event
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCancel}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      {isProcessing ? "Updating..." : "Confirm Cancellation"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
