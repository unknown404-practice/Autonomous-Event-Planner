"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { formatCurrency } from "@/lib/budget-math";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck2,
  MapPin,
  Plus,
  Sparkles,
  Users,
  Wallet,
  ArrowRight,
  PartyPopper,
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
      {/* Hero Section: Refined, Humanized, Non-slop */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800/90 p-8 sm:p-12 mb-10 shadow-sm"
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Clean Architecture & Deterministic Planning</span>
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
                Orchestrate budgets, milestone dependencies, vendor quotes, and guest RSVPs — with zero guesswork and mathematically verified accuracy.
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

        {/* Feature Guarantees (Subtle & Clean) */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-400 dark:text-slate-500 font-medium">Budget Accounting</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Decimal-Safe Math</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 dark:text-slate-500 font-medium">Timeline Scheduling</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>DAG Cycle Detection</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 dark:text-slate-500 font-medium">Planning Assistance</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Schema-Checked AI</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 dark:text-slate-500 font-medium">Data Storage</div>
            <div className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ACID SQLite Engine</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Event Plans</h2>
          <p className="text-xs text-slate-500">
            {events.length === 0
              ? "Your workspace is ready for your first project"
              : `${events.length} active ${events.length === 1 ? "project" : "projects"} in your workspace`}
          </p>
        </div>
        {events.length > 0 && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/events/new"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create another event</span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* Empty State: Warm, Humanized, Welcoming */}
      {events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-10 sm:p-14 text-center"
        >
          <div className="max-w-md mx-auto">
            {/* App Icon Presentation */}
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
              Ready to plan your next gathering?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              You don&apos;t have any active events yet. Start by creating your first event — we&apos;ll automatically structure your budget, set up your milestones, and organize your guest RSVPs.
            </p>

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

            {/* Quick Inspiration Options */}
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">
                Popular Event Starters
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/events/new?type=WEDDING"
                  className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs"
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span>Wedding</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Catering, venue, photography & floral budgeting.</p>
                </Link>

                <Link
                  href="/events/new?type=CORPORATE"
                  className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs"
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Corporate Summit</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">AV equipment, keynote schedules & badge lists.</p>
                </Link>

                <Link
                  href="/events/new?type=DINNER_PARTY"
                  className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs"
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <Utensils className="w-3.5 h-3.5 text-amber-500" />
                    <span>Dinner Celebration</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Chef menu specs, dietary tracking & table seating.</p>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Event Cards Grid with Staggered Entrance */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {events.map((evt) => {
            const daysLeft = Math.ceil(
              (new Date(evt.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <motion.div
                key={evt.id}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Link
                  href={`/events/${evt.id}`}
                  className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                        {evt.eventType.replace("_", " ")}
                      </span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? "Today" : "Completed"}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {evt.eventName}
                    </h3>

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

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
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
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
