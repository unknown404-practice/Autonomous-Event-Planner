"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { createEvent } from "@/lib/actions";
import { EventType, PlanGenerationInput } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  DollarSign,
  Loader2,
  MapPin,
  Palette,
  Sparkles,
  Users,
} from "lucide-react";

const EVENT_TYPES: Array<{ value: EventType; label: string; defaultStyle: string }> = [
  { value: "WEDDING", label: "Wedding", defaultStyle: "Modern Botanical Elegance" },
  { value: "BIRTHDAY", label: "Birthday Milestone", defaultStyle: "Vibrant & Warm Celebration" },
  { value: "ANNIVERSARY", label: "Anniversary", defaultStyle: "Timeless Intimate Romance" },
  { value: "CORPORATE", label: "Corporate Gathering", defaultStyle: "Modern Executive Innovation" },
  { value: "CONFERENCE", label: "Conference / Summit", defaultStyle: "Tech-Forward Collaborative" },
  { value: "COMMUNITY", label: "Community Celebration", defaultStyle: "Festive & Inclusive" },
  { value: "FESTIVAL", label: "Festival / Exhibition", defaultStyle: "Artisan & Experiential" },
  { value: "DINNER_PARTY", label: "Private Dinner Party", defaultStyle: "Atmospheric Candlelit Feast" },
  { value: "OTHER", label: "Other Special Event", defaultStyle: "Custom Concept" },
];

type FormState = Omit<PlanGenerationInput, "guestCount" | "totalBudget"> & {
  guestCount: number | "";
  totalBudget: number | "";
};

function NewEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get("type") as EventType) || "WEDDING";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    eventName: "",
    eventType: initialType,
    eventDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    location: "",
    guestCount: initialType === "CORPORATE" ? 150 : 100,
    totalBudget: initialType === "CORPORATE" ? 50000 : 25000,
    currency: "USD",
    themeOrStyle: "Modern Botanical Elegance",
    formality: initialType === "CORPORATE" ? "FORMAL" : "SEMI_FORMAL",
    indoorOutdoor: "HYBRID",
    culturalTraditions: "",
    dietaryNotes: "",
    specialConstraints: "",
  });

  useEffect(() => {
    const matched = EVENT_TYPES.find((t) => t.value === initialType);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        eventType: initialType,
        themeOrStyle: matched.defaultStyle,
      }));
    }
  }, [initialType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      // Strip leading zeros before any digits, e.g. "01200" -> "1200", but allow empty string or single 0
      const sanitized = value.replace(/^0+(?=\d)/, "");
      if (e.target.value !== sanitized) {
        e.target.value = sanitized;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: sanitized === "" ? "" : Number(sanitized),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleTypeSelect = (typeValue: EventType) => {
    const matched = EVENT_TYPES.find((t) => t.value === typeValue);
    setFormData((prev) => ({
      ...prev,
      eventType: typeValue,
      themeOrStyle: matched?.defaultStyle || prev.themeOrStyle,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.eventName.trim()) {
      setErrorMsg("Please enter an event name.");
      return;
    }
    if (!formData.location.trim()) {
      setErrorMsg("Please specify an event location.");
      return;
    }
    if (!formData.eventDate) {
      setErrorMsg("Please select an event date.");
      return;
    }

    const parsedGuestCount = Number(formData.guestCount);
    const parsedTotalBudget = Number(formData.totalBudget);

    if (!formData.guestCount || isNaN(parsedGuestCount) || parsedGuestCount < 1) {
      setErrorMsg("Please specify a valid guest count (minimum 1 guest).");
      return;
    }
    if (!formData.totalBudget || isNaN(parsedTotalBudget) || parsedTotalBudget < 100) {
      setErrorMsg("Please specify an estimated budget (minimum 100).");
      return;
    }

    const payload: PlanGenerationInput = {
      ...formData,
      guestCount: parsedGuestCount,
      totalBudget: parsedTotalBudget,
    };

    setIsSubmitting(true);
    try {
      const res = await createEvent(payload);
      if (res.success && res.eventId) {
        router.push(`/events/${res.eventId}`);
      } else {
        setErrorMsg(res.error || "Failed to initialize event. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-4xl mx-auto px-4 py-8 w-full"
    >
      <motion.div whileHover={{ x: -2 }} className="inline-block mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </motion.div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Header with App Icon */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center p-2.5 shadow-sm ring-1 ring-slate-900/10 dark:ring-white/20 shrink-0">
            <Image
              src="/app-icon.png"
              alt="EventPilot"
              width={32}
              height={32}
              className="w-full h-full object-contain invert dark:invert-0"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create New Event
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Provide basic details and EventPilot will prepare your milestone schedule, initial budget, and vendor checklists.
            </p>
          </div>
        </div>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs font-medium text-rose-700 dark:text-rose-300"
          >
            {errorMsg}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Event Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Event Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {EVENT_TYPES.map((type) => {
                const isSelected = formData.eventType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeSelect(type.value)}
                    className={`relative p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 shadow-2xs font-semibold"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-xs">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Essentials */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Event Parameters</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="e.g. Maya & Julian's Napa Wedding"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Event Date *
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Location or Venue *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Meadowood Estate, Napa Valley, CA"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Budget & Headcount */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>Budget & Capacity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Estimated Total Budget *
                </label>
                <input
                  type="number"
                  name="totalBudget"
                  value={formData.totalBudget}
                  onChange={handleChange}
                  onFocus={(e) => {
                    if (e.target.value === "0") e.target.value = "";
                    e.currentTarget.select();
                  }}
                  min="100"
                  step="100"
                  placeholder="e.g. 25000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Currency *
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Expected Guests *
                </label>
                <input
                  type="number"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  onFocus={(e) => {
                    if (e.target.value === "0") e.target.value = "";
                    e.currentTarget.select();
                  }}
                  min="1"
                  step="1"
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Style & Preferences */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-500" />
              <span>Atmosphere & Preferences</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Theme / Design Vibe
                </label>
                <input
                  type="text"
                  name="themeOrStyle"
                  value={formData.themeOrStyle}
                  onChange={handleChange}
                  placeholder="e.g. Modern Rustic Elegance"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Formality
                </label>
                <select
                  name="formality"
                  value={formData.formality}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="CASUAL">Casual</option>
                  <option value="SEMI_FORMAL">Semi-Formal</option>
                  <option value="FORMAL">Formal</option>
                  <option value="BLACK_TIE">Black Tie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Setting
                </label>
                <select
                  name="indoorOutdoor"
                  value={formData.indoorOutdoor}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="INDOOR">Indoor Only</option>
                  <option value="OUTDOOR">Outdoor Only</option>
                  <option value="HYBRID">Hybrid (Indoor + Outdoor)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Customs & Traditions (Optional)
                </label>
                <input
                  type="text"
                  name="culturalTraditions"
                  value={formData.culturalTraditions}
                  onChange={handleChange}
                  placeholder="e.g. Bilingual welcome, tea ceremony, acoustic toasts"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Dietary & Special Notes (Optional)
                </label>
                <input
                  type="text"
                  name="dietaryNotes"
                  value={formData.dietaryNotes}
                  onChange={handleChange}
                  placeholder="e.g. Vegan and gluten-free guests, quiet hours by 10 PM"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </Link>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Structuring Event Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Event Plan</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default function NewEventPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-xs">Loading form...</p>
        </div>
      }
    >
      <NewEventForm />
    </Suspense>
  );
}
