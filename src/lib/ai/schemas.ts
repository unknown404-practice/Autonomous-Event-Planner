// EventPilot AI - Zod Schemas for Structured GenAI Output & Input Validation
// Adheres strictly to Directive 6 (Strict AI Schemas and Untrusted Model Output Handling)

import { z } from "zod";

export const ColorItemSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Must be valid hex code"),
  role: z.string().min(1),
});

export const ConceptSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  themeDescription: z.string().min(10),
  colorPalette: z.array(ColorItemSchema).min(2),
  stylingIdeas: z.array(z.string().min(1)).min(2),
  atmosphereAndVibe: z.string().min(5),
});

export const VendorCategoryEnum = z.enum([
  "VENUE",
  "CATERING",
  "PHOTOGRAPHY",
  "VIDEOGRAPHY",
  "DECORATION",
  "FLORIST",
  "MUSIC_ENTERTAINMENT",
  "TRANSPORTATION",
  "ATTIRE_BEAUTY",
  "STATIONERY",
  "CAKE_BAKERY",
  "SECURITY_STAFF",
  "AV_EQUIPMENT",
  "OTHER",
]);

export const ProvenanceEnum = z.enum([
  "USER_ENTERED",
  "VERIFIED_EXTERNAL",
  "APPLICATION_CALCULATED",
  "AI_GENERATED",
  "DETERMINISTIC_FALLBACK",
  "SYNTHETIC_DEMO",
]);

export const RecommendedBudgetItemSchema = z.object({
  category: VendorCategoryEnum,
  description: z.string().min(1),
  estimatedQuantity: z.number().int().positive().default(1),
  estimatedUnitCost: z.number().nonnegative(),
  priority: z.enum(["ESSENTIAL", "RECOMMENDED", "OPTIONAL"]),
  costSavingTip: z.string().optional(),
});

export const RecommendedScheduleItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.union([VendorCategoryEnum, z.literal("GENERAL")]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  daysBeforeEvent: z.number().int(),
  dependsOnTaskIds: z.array(z.string()).default([]),
  phase: z.enum([
    "EARLY_PLANNING",
    "MID_PLANNING",
    "FINAL_PREPARATION",
    "EVENT_DAY",
    "POST_EVENT",
  ]),
});

export const VendorRequirementSchema = z.object({
  category: VendorCategoryEnum,
  keyQuestionsToAsk: z.array(z.string().min(1)).min(1),
  criticalDeliverables: z.array(z.string().min(1)).min(1),
  redFlagsToAvoid: z.array(z.string().min(1)).min(1),
});

export const ContingencySchema = z.object({
  riskScenario: z.string().min(1),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  mitigationStrategy: z.string().min(5),
});

export const GeneratedPlanSchema = z.object({
  concept: ConceptSchema,
  recommendedBudgetItems: z.array(RecommendedBudgetItemSchema).min(3),
  recommendedSchedule: z.array(RecommendedScheduleItemSchema).min(4),
  vendorRequirements: z.array(VendorRequirementSchema).min(2),
  contingencies: z.array(ContingencySchema).min(2),
});

export type GeneratedPlanSchemaType = z.infer<typeof GeneratedPlanSchema>;

export const CreateEventSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  eventType: z.enum([
    "WEDDING",
    "BIRTHDAY",
    "ANNIVERSARY",
    "CORPORATE",
    "CONFERENCE",
    "COMMUNITY",
    "FESTIVAL",
    "DINNER_PARTY",
    "OTHER",
  ]),
  eventDate: z.string().min(1, "Event date is required"),
  location: z.string().min(1, "Location is required"),
  guestCount: z.coerce.number().int().positive("Guest count must be at least 1"),
  totalBudget: z.coerce.number().nonnegative("Budget cannot be negative"),
  currency: z.string().default("USD"),
  themeOrStyle: z.string().nullish().transform((v) => v ?? undefined),
  formality: z.enum(["CASUAL", "SEMI_FORMAL", "FORMAL", "BLACK_TIE"]).optional().default("SEMI_FORMAL"),
  indoorOutdoor: z.enum(["INDOOR", "OUTDOOR", "HYBRID"]).optional().default("HYBRID"),
  culturalTraditions: z.string().nullish().transform((v) => v ?? undefined),
  dietaryNotes: z.string().nullish().transform((v) => v ?? undefined),
  specialConstraints: z.string().nullish().transform((v) => v ?? undefined),
});

export const BudgetItemInputSchema = z.object({
  id: z.string().optional(),
  category: VendorCategoryEnum,
  description: z.string().min(1, "Description is required"),
  estimatedQuantity: z.coerce.number().int().positive().default(1),
  estimatedUnitCost: z.coerce.number().nonnegative("Unit cost cannot be negative"),
  taxRatePercent: z.coerce.number().nonnegative().optional().default(0),
  additionalFees: z.coerce.number().nonnegative().optional().default(0),
  actualCost: z.coerce.number().nonnegative().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  depositPaid: z.coerce.number().nonnegative().optional().default(0),
  notes: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  provenance: ProvenanceEnum.optional(),
});

export const TaskInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  category: z.union([VendorCategoryEnum, z.literal("GENERAL")]).default("GENERAL"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  daysBeforeEvent: z.coerce.number().int().default(30),
  estimatedDurationHours: z.coerce.number().positive().optional(),
  dependsOnTaskIds: z.array(z.string()).optional().default([]),
  assigneeName: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "BLOCKED", "CANCELLED"]).optional().default("NOT_STARTED"),
  provenance: ProvenanceEnum.optional(),
});

export const GuestInputSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")).nullish().transform((v) => (!v ? undefined : v)),
  phone: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  householdGroup: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  rsvpStatus: z.enum(["INVITED", "ATTENDING", "DECLINED", "TENTATIVE"]).default("INVITED"),
  dietaryRequirements: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  accessibilityNeeds: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  plusOneAllowed: z.boolean().optional().default(false),
  plusOneName: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  isAttendingPlusOne: z.boolean().optional().default(false),
  notes: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
});

export const VendorQuoteInputSchema = z.object({
  id: z.string().optional(),
  vendorName: z.string().min(1, "Vendor name is required"),
  category: VendorCategoryEnum,
  contactPerson: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  contactEmail: z.string().email().optional().or(z.literal("")).nullish().transform((v) => (!v ? undefined : v)),
  contactPhone: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  status: z.enum([
    "IDENTIFIED",
    "INQUIRY_SENT",
    "QUOTE_RECEIVED",
    "CONTRACT_PENDING",
    "DEPOSIT_PAID",
    "CONFIRMED",
    "DECLINED",
  ]).default("QUOTE_RECEIVED"),
  quotedAmount: z.coerce.number().nonnegative("Quoted amount cannot be negative").default(0),
  depositRequired: z.coerce.number().nonnegative("Deposit cannot be negative").default(0),
  cancellationPolicy: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
  notes: z.string().nullish().transform((v) => (v === null || v === undefined ? undefined : v)),
});
