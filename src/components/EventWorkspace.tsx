"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  addBudgetItem,
  addGuest,
  addTask,
  cancelEvent,
  deleteBudgetItem,
  deleteEvent,
  deleteGuest,
  deleteTask,
  deleteVendorQuote,
  reactivateEvent,
  saveVendorQuote,
  updateBudgetItem,
  updateEventDetails,
  updateGuestRsvp,
  updateTaskStatus,
} from "@/lib/actions";
import {
  saveEventToLocalHistory,
  removeEventFromLocalHistory,
} from "@/lib/local-storage-sync";
import { formatCurrency } from "@/lib/budget-math";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { StatCard } from "@/components/StatCard";
import {
  BudgetItemInput,
  CalculatedBudgetSummary,
  GuestSummary,
  ScheduledTask,
  VendorCategory,
  VendorStatus,
} from "@/lib/types";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  FileCheck2,
  MapPin,
  Plus,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Wallet,
  X,
  Store,
} from "lucide-react";

interface WorkspaceProps {
  event: any;
}

export function EventWorkspace({ event }: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "budget" | "timeline" | "vendors" | "guests" | "ai"
  >("overview");

  const [isUpdating, setIsUpdating] = useState(false);
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  // Budget Modal Form State
  const [newBudgetItem, setNewBudgetItem] = useState<BudgetItemInput>({
    category: "CATERING",
    description: "",
    estimatedQuantity: 1,
    estimatedUnitCost: 0,
    taxRatePercent: 0,
    additionalFees: 0,
    actualCost: undefined,
    depositPaid: 0,
  });

  // Task Modal Form State
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "GENERAL",
    priority: "MEDIUM",
    daysBeforeEvent: 30,
    assigneeName: "",
    dependsOnTaskId: "",
  });

  // Vendor Modal Form State
  const [newVendor, setNewVendor] = useState({
    vendorName: "",
    category: "VENUE" as VendorCategory,
    contactPerson: "",
    contactEmail: "",
    status: "QUOTE_RECEIVED" as VendorStatus,
    quotedAmount: 0,
    depositRequired: 0,
    cancellationPolicy: "",
    notes: "",
  });

  // Guest Modal Form State
  const [newGuest, setNewGuest] = useState({
    firstName: "",
    lastName: "",
    email: "",
    householdGroup: "",
    dietaryRequirements: "",
    accessibilityNeeds: "",
    rsvpStatus: "INVITED" as const,
    plusOneAllowed: false,
  });

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState(event.eventDate);

  // Cancel & History State
  const router = useRouter();
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(event.status || "PLANNING");

  // Sync detailed event history to browser localStorage
  useEffect(() => {
    saveEventToLocalHistory(event);
  }, [event]);

  const daysLeft = Math.ceil(
    (new Date(event.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const budgetSummary: CalculatedBudgetSummary = event.budgetSummary;
  const scheduledTasks: ScheduledTask[] = event.scheduledTasks;
  const guestSummary: GuestSummary = event.guestSummary;

  const completedTasksCount = scheduledTasks.filter((t) => t.status === "COMPLETED").length;
  const overdueTasksCount = scheduledTasks.filter((t) => t.isOverdue).length;
  const taskCompletionPercent =
    scheduledTasks.length > 0
      ? Math.round((completedTasksCount / scheduledTasks.length) * 100)
      : 0;

  // Cancel & Reactivation Handlers
  const handleCancelEvent = async () => {
    setIsCancelling(true);
    const res = await cancelEvent(event.id, cancelReason);
    if (res.success) {
      setCurrentStatus("CANCELLED");
      saveEventToLocalHistory({ ...event, status: "CANCELLED" }, "EVENT_CANCELLED");
      setModalOpen(null);
    }
    setIsCancelling(false);
  };

  const handleReactivateEvent = async () => {
    setIsCancelling(true);
    const res = await reactivateEvent(event.id);
    if (res.success) {
      setCurrentStatus("PLANNING");
      saveEventToLocalHistory({ ...event, status: "PLANNING" }, "EVENT_REACTIVATED");
    }
    setIsCancelling(false);
  };

  const handleDeletePermanently = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${event.eventName}"? All budget records, tasks, vendors, and guests will be removed from your SQLite database.`
      )
    )
      return;
    setIsCancelling(true);
    const res = await deleteEvent(event.id);
    if (res.success) {
      removeEventFromLocalHistory(event.id);
      router.push("/");
    }
    setIsCancelling(false);
  };

  // Handlers
  const handleAddBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await addBudgetItem(event.id, newBudgetItem);
    setModalOpen(null);
    setNewBudgetItem({
      category: "CATERING",
      description: "",
      estimatedQuantity: 1,
      estimatedUnitCost: 0,
      taxRatePercent: 0,
      additionalFees: 0,
      actualCost: undefined,
      depositPaid: 0,
    });
    setIsUpdating(false);
  };

  const handleDeleteBudgetItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget item?")) return;
    setIsUpdating(true);
    await deleteBudgetItem(id);
    setIsUpdating(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await addTask(event.id, {
      ...newTask,
      dependsOnTaskIds: newTask.dependsOnTaskId ? [newTask.dependsOnTaskId] : [],
    });
    setModalOpen(null);
    setNewTask({
      title: "",
      description: "",
      category: "GENERAL",
      priority: "MEDIUM",
      daysBeforeEvent: 30,
      assigneeName: "",
      dependsOnTaskId: "",
    });
    setIsUpdating(false);
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "NOT_STARTED" : "COMPLETED";
    setIsUpdating(true);
    await updateTaskStatus(taskId, nextStatus);
    setIsUpdating(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    setIsUpdating(true);
    await deleteTask(taskId);
    setIsUpdating(false);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await saveVendorQuote(event.id, newVendor);
    setModalOpen(null);
    setNewVendor({
      vendorName: "",
      category: "VENUE",
      contactPerson: "",
      contactEmail: "",
      status: "QUOTE_RECEIVED",
      quotedAmount: 0,
      depositRequired: 0,
      cancellationPolicy: "",
      notes: "",
    });
    setIsUpdating(false);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm("Are you sure you want to remove this vendor quotation?")) return;
    setIsUpdating(true);
    await deleteVendorQuote(vendorId);
    setIsUpdating(false);
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await addGuest(event.id, newGuest);
    setModalOpen(null);
    setNewGuest({
      firstName: "",
      lastName: "",
      email: "",
      householdGroup: "",
      dietaryRequirements: "",
      accessibilityNeeds: "",
      rsvpStatus: "INVITED",
      plusOneAllowed: false,
    });
    setIsUpdating(false);
  };

  const handleUpdateRsvp = async (guestId: string, status: string) => {
    setIsUpdating(true);
    await updateGuestRsvp(guestId, status);
    setIsUpdating(false);
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Remove this guest?")) return;
    setIsUpdating(true);
    await deleteGuest(guestId);
    setIsUpdating(false);
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await updateEventDetails(event.id, { eventDate: rescheduleDate });
    setModalOpen(null);
    setIsUpdating(false);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "budget", label: "Budget & Expenses" },
    { id: "timeline", label: `Timeline & Tasks (${scheduledTasks.length})` },
    { id: "vendors", label: `Vendors (${event.vendors.length})` },
    { id: "guests", label: `Guests (${guestSummary.totalGuests})` },
    { id: "ai", label: "Concept & Notes" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
      {/* Back Link & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <motion.div whileHover={{ x: -2 }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Events</span>
          </Link>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/events/${event.id}/print/run-sheet`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-500" />
            <span>Run Sheet (PDF)</span>
          </Link>

          <Link
            href={`/events/${event.id}/print/catering-specs`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-500" />
            <span>Catering Specs (PDF)</span>
          </Link>

          <Link
            href={`/events/${event.id}/print/guest-invitations`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-500" />
            <span>Guest Roster (PDF)</span>
          </Link>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setModalOpen("reschedule")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Reschedule Date</span>
          </motion.button>

          {currentStatus !== "CANCELLED" ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModalOpen("cancelEvent")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 shadow-2xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Cancel Event</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReactivateEvent}
              disabled={isCancelling}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Reactivate Event</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Cancelled Event History Banner */}
      {currentStatus === "CANCELLED" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-6 shadow-2xs"
        >
          <div className="flex items-center gap-3 text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">This Event is Cancelled.</span> Complete historical budget allocations, milestone tasks, vendor quotations, and guest rosters remain safely preserved in your SQLite database and browser local storage.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReactivateEvent}
              disabled={isCancelling}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Restore to Planning
            </button>
            <button
              onClick={handleDeletePermanently}
              disabled={isCancelling}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 font-semibold rounded-lg text-xs transition-colors"
            >
              Delete Permanently
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Event Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center p-2.5 shadow-sm ring-1 ring-slate-900/10 dark:ring-white/20 shrink-0 mt-0.5">
              <Image
                src="/app-icon.png"
                alt="EventPilot"
                width={32}
                height={32}
                className="w-full h-full object-contain invert dark:invert-0"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                  {event.eventType.replace("_", " ")}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    currentStatus === "CANCELLED"
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                      : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  }`}
                >
                  {currentStatus}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {event.eventName}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{event.eventDate} ({daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? "Today" : "Completed"})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{event.location}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{event.guestCount} Guests Planned</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Target Budget</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(budgetSummary.totalBudget, event.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation with Animated Indicator */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeWorkspaceTab"
                    className="absolute inset-0 bg-slate-900 dark:bg-indigo-600 rounded-xl -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* TAB CONTENT WITH ANIMATE PRESENCE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {budgetSummary.isOverBudget && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                  <div className="text-xs">
                    <span className="font-bold">Projected Over-Budget Warning:</span> Current allocations exceed the target budget by{" "}
                    <span className="font-bold underline">
                      {formatCurrency(Math.abs(budgetSummary.variance), event.currency)}
                    </span>
                    . Review line items in the Budget tab to balance allocations.
                  </div>
                </div>
              )}

              {overdueTasksCount > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-300">
                  <Clock className="w-5 h-5 shrink-0 text-amber-600" />
                  <div className="text-xs">
                    <span className="font-bold">Deadline Action Required:</span> You have{" "}
                    <span className="font-bold underline">{overdueTasksCount} overdue planning tasks</span>. Inspect the Timeline tab to update statuses or adjust dependencies.
                  </div>
                </div>
              )}

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Budget Allocated"
                  value={formatCurrency(budgetSummary.totalEstimated, event.currency)}
                  subtitle={`Remaining: ${formatCurrency(budgetSummary.remainingBudget, event.currency)}`}
                  icon={Wallet}
                  accentColor="indigo"
                  badge={{
                    text: budgetSummary.isOverBudget ? "Over Budget" : "On Track",
                    variant: budgetSummary.isOverBudget ? "danger" : "success",
                  }}
                />

                <StatCard
                  title="Task Progress"
                  value={`${taskCompletionPercent}%`}
                  subtitle={`${completedTasksCount} of ${scheduledTasks.length} milestones complete`}
                  icon={CheckCircle2}
                  accentColor="emerald"
                  badge={{
                    text: `${scheduledTasks.length - completedTasksCount} open`,
                    variant: "default",
                  }}
                />

                <StatCard
                  title="RSVP Responses"
                  value={`${guestSummary.attendingCount} Attending`}
                  subtitle={`${guestSummary.pendingCount} pending, ${guestSummary.declinedCount} declined`}
                  icon={Users}
                  accentColor="blue"
                  badge={{
                    text: `${Math.round((guestSummary.attendingCount / Math.max(1, guestSummary.totalGuests)) * 100)}% confirmed`,
                    variant: "purple",
                  }}
                />

                <StatCard
                  title="Vendors Vetted"
                  value={event.vendors.length}
                  subtitle={`${event.vendors.filter((v: any) => v.status === "CONFIRMED").length} confirmed contracts`}
                  icon={FileCheck2}
                  accentColor="amber"
                  badge={{
                    text: "Verified Records",
                    variant: "success",
                  }}
                />
              </div>

              {/* Concept Showcase & Color Palette */}
              {event.concept && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Creative Direction: {event.concept.title}
                    </h2>
                    <ProvenanceBadge provenance="AI_GENERATED" />
                  </div>
                  <p className="text-sm italic text-slate-600 dark:text-slate-300 mb-3">
                    &ldquo;{event.concept.tagline}&rdquo;
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">
                    {event.concept.themeDescription}
                  </p>

                  {/* Color Swatches */}
                  {event.concept.colorPalette && event.concept.colorPalette.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Harmonized Color Palette
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {event.concept.colorPalette.map((c: any, idx: number) => (
                          <div
                            key={idx}
                            className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40"
                          >
                            <div
                              className="w-9 h-9 rounded-xl shadow-xs border border-black/10 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {c.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">{c.hex}</div>
                              <div className="text-[10px] text-indigo-500 font-medium">{c.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Styling Ideas */}
                  {event.concept.stylingIdeas && event.concept.stylingIdeas.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Curated Styling & Spatial Direction
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        {event.concept.stylingIdeas.map((idea: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <span>{idea}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Contingencies & Risk Management */}
              {event.contingencies && event.contingencies.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Contingency & Mitigation Plans
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.contingencies.map((c: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {c.riskScenario}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              c.severity === "HIGH"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                          >
                            {c.severity} Severity
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {c.mitigationStrategy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Log Trail */}
              {event.activityLogs && event.activityLogs.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    Verified Event Audit Trail
                  </h2>
                  <div className="space-y-2.5">
                    {event.activityLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs bg-slate-50/40 dark:bg-slate-800/20"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {log.action}
                          </span>
                          <p className="text-slate-500 mt-0.5">{log.details}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <ProvenanceBadge provenance={log.provenance} />
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BUDGET & EXPENSES */}
          {activeTab === "budget" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Budget & Expenditures</h2>
                  <p className="text-xs text-slate-500">
                    Calculated via decimal-safe financial math. Tax rates and additional fees computed deterministically.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalOpen("budget")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Expense Item</span>
                </motion.button>
              </div>

              {/* Category Breakdown Chips */}
              {Object.keys(budgetSummary.categoryAllocations).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(budgetSummary.categoryAllocations)
                    .filter(([_, data]) => data.estimated > 0 || data.actual > 0)
                    .map(([cat, data]) => (
                      <div
                        key={cat}
                        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-2xs"
                      >
                        <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          {cat.replace("_", " ")}
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {formatCurrency(data.estimated, event.currency)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {data.percentageOfBudget}% of budget • {data.itemCount} items
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Itemized Table or Clean Empty State */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl overflow-hidden shadow-sm">
                {event.budgetItems.length === 0 ? (
                  <div className="p-12 text-center">
                    <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      No budget items yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      Start tracking costs by adding your first vendor fee, venue rental, or catering allocation.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setModalOpen("budget")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Expense</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Category & Description</th>
                          <th className="py-3 px-3">Qty</th>
                          <th className="py-3 px-3">Unit Cost</th>
                          <th className="py-3 px-3">Tax %</th>
                          <th className="py-3 px-3">Estimated Total</th>
                          <th className="py-3 px-3">Actual Cost</th>
                          <th className="py-3 px-3">Deposit Paid</th>
                          <th className="py-3 px-3">Balance</th>
                          <th className="py-3 px-3">Source</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {event.budgetItems.map((item: any) => {
                          const estSubtotal = item.estimatedQuantity * item.estimatedUnitCost;
                          const tax = (estSubtotal * (item.taxRatePercent || 0)) / 100;
                          const estTotal = estSubtotal + tax + (item.additionalFees || 0);
                          const effectiveTotal = item.actualCost ?? estTotal;
                          const balance = Math.max(0, effectiveTotal - (item.depositPaid || 0));

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {item.description}
                                </div>
                                <div className="text-[10px] text-slate-400">{item.category}</div>
                              </td>
                              <td className="py-3 px-3">{item.estimatedQuantity}</td>
                              <td className="py-3 px-3">{formatCurrency(item.estimatedUnitCost, event.currency)}</td>
                              <td className="py-3 px-3">{item.taxRatePercent || 0}%</td>
                              <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(estTotal, event.currency)}
                              </td>
                              <td className="py-3 px-3">
                                {item.actualCost !== null && item.actualCost !== undefined ? (
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(item.actualCost, event.currency)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Pending</span>
                                )}
                              </td>
                              <td className="py-3 px-3">{formatCurrency(item.depositPaid || 0, event.currency)}</td>
                              <td className="py-3 px-3 font-semibold">{formatCurrency(balance, event.currency)}</td>
                              <td className="py-3 px-3">
                                <ProvenanceBadge provenance={item.provenance} />
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => handleDeleteBudgetItem(item.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TIMELINE & TASKS */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Milestone Schedule & Tasks</h2>
                  <p className="text-xs text-slate-500">
                    Scheduled dynamically relative to event date ({event.eventDate}). Cycle-safe dependency engine.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setModalOpen("task")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Milestone Task</span>
                </motion.button>
              </div>

              {scheduledTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center">
                  <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No tasks or milestones scheduled
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Set up your milestones with automatic countdowns and prerequisite dependencies.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalOpen("task")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Milestone</span>
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      whileHover={{ y: -1 }}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        task.status === "COMPLETED"
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                          : task.isOverdue
                          ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
                          : task.isBlocked
                          ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                          : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/90 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status || "NOT_STARTED")}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            task.status === "COMPLETED"
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 dark:border-slate-600 hover:border-indigo-500"
                          }`}
                        >
                          {task.status === "COMPLETED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm font-bold ${
                                task.status === "COMPLETED"
                                  ? "line-through text-slate-400 dark:text-slate-500"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {task.priority}
                            </span>
                            {task.isBlocked && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                                Blocked by Prerequisite
                              </span>
                            )}
                            {task.isOverdue && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                                Overdue
                              </span>
                            )}
                            <ProvenanceBadge provenance={task.provenance} />
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                          )}

                          {task.blockedByTitles && task.blockedByTitles.length > 0 && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                              Waiting on: {task.blockedByTitles.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {task.dueDate}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {task.daysBeforeEvent > 0
                              ? `${task.daysBeforeEvent}d before event`
                              : task.daysBeforeEvent === 0
                              ? "Day of event"
                              : `${Math.abs(task.daysBeforeEvent)}d post event`}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VENDORS & QUOTES */}
          {activeTab === "vendors" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Vendors & Quotations</h2>
                  <p className="text-xs text-slate-500">
                    Truthful booking state machine. Keep quotes, deposits, and contact info organized in one place.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/events/${event.id}/print/run-sheet`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Run Sheet (PDF)</span>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalOpen("vendor")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Vendor Quote</span>
                  </motion.button>
                </div>
              </div>

              {event.vendors.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 text-center">
                  <Store className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No vendor quotes logged yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Record quotes from venues, caterers, photographers, and entertainers.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalOpen("vendor")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Vendor Quote</span>
                  </motion.button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.vendors.map((v: any) => (
                    <motion.div
                      key={v.id}
                      whileHover={{ y: -2 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {v.category}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {v.vendorName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              v.status === "CONFIRMED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : v.status === "DEPOSIT_PAID"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {v.status}
                          </span>
                          <button
                            onClick={() => handleDeleteVendor(v.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove vendor quote"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        {v.contactPerson && <div>Contact: {v.contactPerson}</div>}
                        {v.contactEmail && <div>Email: {v.contactEmail}</div>}
                        {v.contactPhone && <div>Phone: {v.contactPhone}</div>}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Quoted Amount</div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {v.quotedAmount ? formatCurrency(v.quotedAmount, event.currency) : "TBD"}
                          </div>
                        </div>
                        {v.depositRequired && (
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-medium">Deposit Required</div>
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {formatCurrency(v.depositRequired, event.currency)}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GUESTS & RSVPS */}
          {activeTab === "guests" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Guest List & RSVPs</h2>
                  <p className="text-xs text-slate-500">
                    Track invitations, attendee confirmations, plus-ones, and special dietary requests.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/events/${event.id}/print/guest-invitations`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-500" />
                    <span>Print Invitation List</span>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalOpen("guest")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Guest</span>
                  </motion.button>
                </div>
              </div>

              {/* Dietary Summary Banner */}
              {Object.keys(guestSummary.dietarySummary).length > 0 && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Dietary Requirements Summary (for Kitchen & Caterer):
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(guestSummary.dietarySummary).map(([diet, count]) => (
                      <span
                        key={diet}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                      >
                        {diet}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Guests Table or Empty State */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl overflow-hidden shadow-sm">
                {event.guests.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      No guests added yet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      Add guests individually to track attendance, dietary requirements, and seating.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setModalOpen("guest")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Guest</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Guest Name</th>
                          <th className="py-3 px-3">Contact</th>
                          <th className="py-3 px-3">Household</th>
                          <th className="py-3 px-3">Dietary / Accessibility</th>
                          <th className="py-3 px-3">RSVP Status</th>
                          <th className="py-3 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {event.guests.map((g: any) => (
                          <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                              {g.firstName} {g.lastName}
                              {g.plusOneAllowed && g.plusOneName && (
                                <div className="text-[10px] text-slate-400 font-normal">
                                  +1: {g.plusOneName}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-500">{g.email || g.phone || "—"}</td>
                            <td className="py-3 px-3">{g.householdGroup || "—"}</td>
                            <td className="py-3 px-3">
                              {g.dietaryRequirements && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 mr-1">
                                  {g.dietaryRequirements}
                                </span>
                              )}
                              {g.accessibilityNeeds && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  {g.accessibilityNeeds}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={g.rsvpStatus}
                                onChange={(e) => handleUpdateRsvp(g.id, e.target.value)}
                                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="INVITED">Invited (Pending)</option>
                                <option value="ATTENDING">Attending</option>
                                <option value="DECLINED">Declined</option>
                                <option value="TENTATIVE">Tentative</option>
                              </select>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleDeleteGuest(g.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: AI CONCEPT & REPLANNING */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Planning & Adaptation Notes
                    </h2>
                  </div>
                  <ProvenanceBadge provenance="AI_GENERATED" />
                </div>

                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  EventPilot decouples unstructured creative recommendations from deterministic financial and timeline calculations.
                  When parameters change, existing confirmed bookings and finalized contracts are strictly preserved.
                </p>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Active Architecture Rules:
                  </div>
                  <p className="text-slate-500">
                    1. Powered locally by Ollama <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">gemma:2b</code> with structured JSON verified against strict Zod schemas.
                  </p>
                  <p className="text-slate-500">
                    2. If Ollama is offline or unconfigured, EventPilot seamlessly activates the deterministic expert heuristic rules engine with identical typed data contracts.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* MODALS WITH FRAMER MOTION ANIMATE PRESENCE */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(null)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {modalOpen === "budget" && "Add Budget Line Item"}
                  {modalOpen === "task" && "Add Milestone Task"}
                  {modalOpen === "vendor" && "Add Vendor Quote"}
                  {modalOpen === "guest" && "Add Guest to Roster"}
                  {modalOpen === "reschedule" && "Reschedule Master Event"}
                  {modalOpen === "cancelEvent" && "Cancel Master Event"}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* MODAL: BUDGET */}
              {modalOpen === "budget" && (
                <form onSubmit={handleAddBudgetItem} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={newBudgetItem.category}
                      onChange={(e) =>
                        setNewBudgetItem({ ...newBudgetItem, category: e.target.value as VendorCategory })
                      }
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    >
                      <option value="VENUE">Venue</option>
                      <option value="CATERING">Catering</option>
                      <option value="PHOTOGRAPHY">Photography</option>
                      <option value="FLORIST">Florist</option>
                      <option value="MUSIC_ENTERTAINMENT">Music & Entertainment</option>
                      <option value="DECORATION">Decoration</option>
                      <option value="STATIONERY">Stationery</option>
                      <option value="CAKE_BAKERY">Cake & Bakery</option>
                      <option value="AV_EQUIPMENT">AV & Lighting</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Description *</label>
                    <input
                      type="text"
                      required
                      value={newBudgetItem.description}
                      onChange={(e) => setNewBudgetItem({ ...newBudgetItem, description: e.target.value })}
                      placeholder="e.g. Acoustic Guitarist for Ceremony"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={newBudgetItem.estimatedQuantity}
                        onChange={(e) =>
                          setNewBudgetItem({
                            ...newBudgetItem,
                            estimatedQuantity: Math.max(1, Number(e.target.value)),
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Unit Cost ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newBudgetItem.estimatedUnitCost}
                        onChange={(e) =>
                          setNewBudgetItem({
                            ...newBudgetItem,
                            estimatedUnitCost: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tax Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={newBudgetItem.taxRatePercent}
                        onChange={(e) =>
                          setNewBudgetItem({
                            ...newBudgetItem,
                            taxRatePercent: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Deposit Paid ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newBudgetItem.depositPaid}
                        onChange={(e) =>
                          setNewBudgetItem({
                            ...newBudgetItem,
                            depositPaid: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(null)}
                      className="px-4 py-2 border rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-indigo-500"
                    >
                      Save Item
                    </button>
                  </div>
                </form>
              )}

              {/* MODAL: TASK */}
              {modalOpen === "task" && (
                <form onSubmit={handleAddTask} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Task Title *</label>
                    <input
                      type="text"
                      required
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="e.g. Schedule final floral walkthrough"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Days Before Event Date *</label>
                    <input
                      type="number"
                      required
                      value={newTask.daysBeforeEvent}
                      onChange={(e) =>
                        setNewTask({ ...newTask, daysBeforeEvent: Number(e.target.value) })
                      }
                      placeholder="e.g. 30 (due 30 days prior)"
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Prerequisite Task (Optional)</label>
                      <select
                        value={newTask.dependsOnTaskId}
                        onChange={(e) => setNewTask({ ...newTask, dependsOnTaskId: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      >
                        <option value="">None (Independent)</option>
                        {scheduledTasks.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(null)}
                      className="px-4 py-2 border rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-indigo-500"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              )}

              {/* MODAL: VENDOR */}
              {modalOpen === "vendor" && (
                <form onSubmit={handleSaveVendor} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Vendor / Company Name *</label>
                    <input
                      type="text"
                      required
                      value={newVendor.vendorName}
                      onChange={(e) => setNewVendor({ ...newVendor, vendorName: e.target.value })}
                      placeholder="e.g. Artisan Bloom Co."
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Category</label>
                      <select
                        value={newVendor.category}
                        onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value as VendorCategory })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      >
                        <option value="VENUE">Venue</option>
                        <option value="CATERING">Catering</option>
                        <option value="PHOTOGRAPHY">Photography</option>
                        <option value="FLORIST">Florist</option>
                        <option value="MUSIC_ENTERTAINMENT">Music & Entertainment</option>
                        <option value="DECORATION">Decoration</option>
                        <option value="STATIONERY">Stationery</option>
                        <option value="CAKE_BAKERY">Cake & Bakery</option>
                        <option value="AV_EQUIPMENT">AV & Lighting</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Status</label>
                      <select
                        value={newVendor.status}
                        onChange={(e) => setNewVendor({ ...newVendor, status: e.target.value as VendorStatus })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      >
                        <option value="IDENTIFIED">Identified</option>
                        <option value="INQUIRY_SENT">Inquiry Sent</option>
                        <option value="QUOTE_RECEIVED">Quote Received</option>
                        <option value="CONTRACT_PENDING">Contract Pending</option>
                        <option value="DEPOSIT_PAID">Deposit Paid</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="DECLINED">Declined</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Quoted Amount ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newVendor.quotedAmount}
                        onChange={(e) => setNewVendor({ ...newVendor, quotedAmount: Math.max(0, Number(e.target.value)) })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Deposit Required ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newVendor.depositRequired}
                        onChange={(e) => setNewVendor({ ...newVendor, depositRequired: Math.max(0, Number(e.target.value)) })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Contact Person</label>
                      <input
                        type="text"
                        value={newVendor.contactPerson}
                        onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Contact Email</label>
                      <input
                        type="email"
                        value={newVendor.contactEmail}
                        onChange={(e) => setNewVendor({ ...newVendor, contactEmail: e.target.value })}
                        placeholder="e.g. sarah@example.com"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(null)}
                      className="px-4 py-2 border rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-indigo-500"
                    >
                      Save Vendor
                    </button>
                  </div>
                </form>
              )}

              {/* MODAL: GUEST */}
              {modalOpen === "guest" && (
                <form onSubmit={handleAddGuest} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">First Name *</label>
                      <input
                        type="text"
                        required
                        value={newGuest.firstName}
                        onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={newGuest.lastName}
                        onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Email or Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. guest@example.com"
                      value={newGuest.email}
                      onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Dietary Requirements</label>
                    <input
                      type="text"
                      placeholder="e.g. Vegan, Gluten-Free, Nut Allergy"
                      value={newGuest.dietaryRequirements}
                      onChange={(e) => setNewGuest({ ...newGuest, dietaryRequirements: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Accessibility Needs</label>
                    <input
                      type="text"
                      placeholder="e.g. Wheelchair ramp, ground floor seating"
                      value={newGuest.accessibilityNeeds}
                      onChange={(e) => setNewGuest({ ...newGuest, accessibilityNeeds: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(null)}
                      className="px-4 py-2 border rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-indigo-500"
                    >
                      Save Guest
                    </button>
                  </div>
                </form>
              )}

              {/* MODAL: RESCHEDULE */}
              {modalOpen === "reschedule" && (
                <form onSubmit={handleReschedule} className="space-y-4 text-xs">
                  <p className="text-xs text-slate-500">
                    Dependent milestone deadlines will be dynamically recalculated based on the new date.
                  </p>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">New Event Date</label>
                    <input
                      type="date"
                      required
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(null)}
                      className="px-4 py-2 border rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-indigo-500"
                    >
                      Confirm New Date
                    </button>
                  </div>
                </form>
              )}

              {/* MODAL: CANCEL EVENT */}
              {modalOpen === "cancelEvent" && (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-300">
                    <p className="font-bold text-sm">
                      Are you sure you want to cancel &ldquo;{event.eventName}&rdquo;?
                    </p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                      This marks the event as <span className="font-semibold text-rose-700 dark:text-rose-400">CANCELLED</span>.
                      All detailed history, including budget line items, milestone tasks, vendor quotations, and guest rosters, will remain safely archived in your SQLite database and browser local storage for future reference.
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
                      onClick={handleDeletePermanently}
                      disabled={isCancelling}
                      className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors underline"
                    >
                      Permanently delete from database
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setModalOpen(null)}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Keep Event
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEvent}
                        disabled={isCancelling}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
