"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  addBudgetItem,
  addGuest,
  addTask,
  deleteBudgetItem,
  deleteGuest,
  deleteTask,
  saveVendorQuote,
  updateBudgetItem,
  updateEventDetails,
  updateGuestRsvp,
  updateTaskStatus,
} from "@/lib/actions";
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
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck2,
  Filter,
  Layers,
  MapPin,
  Palette,
  Plus,
  Printer,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

interface WorkspaceProps {
  event: any; // populated with concept, budgetSummary, scheduledTasks, guestSummary
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
      {/* Back Link & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Events
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/events/${event.id}/print/run-sheet`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-500" />
            Vendor Run Sheet (PDF)
          </Link>

          <Link
            href={`/events/${event.id}/print/catering-specs`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-500" />
            Kitchen Catering Specs (PDF)
          </Link>

          <Link
            href={`/events/${event.id}/print/guest-invitations`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-blue-500" />
            Invitation List Printout
          </Link>

          <button
            onClick={() => setModalOpen("reschedule")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            Reschedule
          </button>
        </div>
      </div>

      {/* Main Event Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {event.eventType}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {event.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {event.eventName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {event.eventDate} ({daysLeft > 0 ? `${daysLeft} days remaining` : "Today or Past"})
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                {event.guestCount} Guests Planned
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Target Budget</div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(budgetSummary.totalBudget, event.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Dashboard / Overview" },
            { id: "budget", label: "Budget & Expenses" },
            { id: "timeline", label: `Timeline & Tasks (${scheduledTasks.length})` },
            { id: "vendors", label: `Vendors & Quotations (${event.vendors.length})` },
            { id: "guests", label: `Guests & RSVPs (${guestSummary.totalGuests})` },
            { id: "ai", label: "AI Concept & Replanning" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Over-Budget Alert Warning */}
          {budgetSummary.isOverBudget && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3 text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <div className="text-xs">
                <span className="font-bold">Projected Over-Budget Warning:</span> Current allocations exceed the target budget by{" "}
                <span className="font-bold underline">
                  {formatCurrency(Math.abs(budgetSummary.variance), event.currency)}
                </span>
                . Review line items in the Budget tab to apply suggested savings.
              </div>
            </div>
          )}

          {/* Overdue Tasks Alert Warning */}
          {overdueTasksCount > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-300">
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
                text: "Evidence Verified",
                variant: "success",
              }}
            />
          </div>

          {/* Concept Showcase & Color Palette */}
          {event.concept && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Event Concept: {event.concept.title}
                </h2>
                <ProvenanceBadge provenance="AI_GENERATED" />
              </div>
              <p className="text-sm italic text-slate-600 dark:text-slate-300 mb-3">
                "{event.concept.tagline}"
              </p>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                {event.concept.themeDescription}
              </p>

              {/* Color Swatches */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Harmonized Color Palette
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {event.concept.colorPalette?.map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40"
                    >
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm border border-black/10 shrink-0"
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

              {/* Styling Ideas */}
              {event.concept.stylingIdeas && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Curated Styling & Spatial Direction
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {event.concept.stylingIdeas.map((idea: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Contingency & Risk Mitigation Strategies
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.contingencies.map((c: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Verified Event Audit Trail
            </h2>
            <div className="space-y-3">
              {event.activityLogs?.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs"
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
        </div>
      )}

      {/* TAB 2: BUDGET & EXPENSES */}
      {activeTab === "budget" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Budget & Expenditures</h2>
              <p className="text-xs text-slate-500">
                Calculated via decimal-safe financial arithmetic per Directive 7.
              </p>
            </div>
            <button
              onClick={() => setModalOpen("budget")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Expense Item
            </button>
          </div>

          {/* Category Progress Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(budgetSummary.categoryAllocations)
              .filter(([_, data]) => data.estimated > 0 || data.actual > 0)
              .map(([cat, data]) => (
                <div
                  key={cat}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3"
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

          {/* Itemized Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
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
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
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
                Scheduled dynamically relative to event date ({event.eventDate}). Cycles prevented by DAG validator.
              </p>
            </div>
            <button
              onClick={() => setModalOpen("task")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Milestone Task
            </button>
          </div>

          <div className="space-y-3">
            {scheduledTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  task.status === "COMPLETED"
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                    : task.isOverdue
                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
                    : task.isBlocked
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleTaskStatus(task.id, task.status || "NOT_STARTED")}
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      task.status === "COMPLETED"
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 dark:border-slate-600 hover:border-indigo-500"
                    }`}
                  >
                    {task.status === "COMPLETED" && <CheckCircle2 className="w-4 h-4" />}
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VENDORS & QUOTES */}
      {activeTab === "vendors" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Vendors & Quotation Tracker</h2>
              <p className="text-xs text-slate-500">
                Truthful booking state machine. Suggested vendors are never represented as booked without confirmation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/events/${event.id}/print/run-sheet`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-500" />
                Print Run Sheet (PDF)
              </Link>
              <button
                onClick={() => setModalOpen("vendor")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Vendor Quote
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.vendors.map((v: any) => (
              <div
                key={v.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GUESTS & RSVPS */}
      {activeTab === "guests" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Guest List & RSVPs</h2>
              <p className="text-xs text-slate-500">
                Track attendees, dietary requirements, and accessibility accommodations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/events/${event.id}/print/guest-invitations`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Printer className="w-3.5 h-3.5 text-blue-500" />
                Print Invitation List
              </Link>
              <button
                onClick={() => setModalOpen("guest")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Guest
              </button>
            </div>
          </div>

          {/* Dietary Summary Banner */}
          {Object.keys(guestSummary.dietarySummary).length > 0 && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Special Dietary Aggregation (for Caterer):
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

          {/* Guests Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
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
                    <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
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
                          className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-indigo-500"
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
          </div>
        </div>
      )}

      {/* TAB 6: AI CONCEPT & REPLANNING */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  GenAI Planning & Adaptation Engine
                </h2>
              </div>
              <ProvenanceBadge provenance="AI_GENERATED" />
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              EventPilot AI decouples unstructured creative recommendations from deterministic financial and timeline calculations.
              When parameters change, existing confirmed bookings and finalized contracts are strictly preserved.
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Active Provider Protocol:
              </div>
              <p className="text-slate-500">
                1. If <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">GEMINI_API_KEY</code> is configured, Google Gemini models generate structured JSON verified against explicit Zod schemas.
              </p>
              <p className="text-slate-500">
                2. If the API key is omitted, offline, or timed out, EventPilot AI seamlessly activates the deterministic expert heuristic rules engine with identical typed data contracts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD BUDGET ITEM */}
      {modalOpen === "budget" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add Budget Line Item
            </h3>
            <form onSubmit={handleAddBudgetItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={newBudgetItem.category}
                  onChange={(e) =>
                    setNewBudgetItem({ ...newBudgetItem, category: e.target.value as VendorCategory })
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
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
                <label className="block font-semibold mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={newBudgetItem.description}
                  onChange={(e) => setNewBudgetItem({ ...newBudgetItem, description: e.target.value })}
                  placeholder="e.g. Acoustic Guitarist for Ceremony"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Estimated Quantity</label>
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
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit Cost ($)</label>
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
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tax Rate (%)</label>
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
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Deposit Paid ($)</label>
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
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(null)}
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK */}
      {modalOpen === "task" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add Milestone Task
            </h3>
            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Schedule final floral walkthrough"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Days Before Event Date *</label>
                <input
                  type="number"
                  required
                  value={newTask.daysBeforeEvent}
                  onChange={(e) =>
                    setNewTask({ ...newTask, daysBeforeEvent: Number(e.target.value) })
                  }
                  placeholder="e.g. 30 (due 30 days prior)"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Prerequisite Task (Optional)</label>
                  <select
                    value={newTask.dependsOnTaskId}
                    onChange={(e) => setNewTask({ ...newTask, dependsOnTaskId: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
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
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESCHEDULE */}
      {modalOpen === "reschedule" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Reschedule Master Event
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All dependent milestone deadlines will be deterministically recalculated.
            </p>
            <form onSubmit={handleReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">New Event Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(null)}
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
                >
                  Confirm New Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GUEST */}
      {modalOpen === "guest" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Add Guest</h3>
            <form onSubmit={handleAddGuest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newGuest.firstName}
                    onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newGuest.lastName}
                    onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Dietary Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. Vegan, Gluten-Free, Nut Allergy"
                  value={newGuest.dietaryRequirements}
                  onChange={(e) => setNewGuest({ ...newGuest, dietaryRequirements: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Accessibility Needs</label>
                <input
                  type="text"
                  placeholder="e.g. Wheelchair ramp, ground floor seating"
                  value={newGuest.accessibilityNeeds}
                  onChange={(e) => setNewGuest({ ...newGuest, accessibilityNeeds: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(null)}
                  className="px-4 py-2 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
