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
