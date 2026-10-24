import { describe, expect, it } from "vitest";
import { generateHeuristicPlan } from "../../src/lib/ai/heuristic-planner";
import { GeneratedPlanSchema } from "../../src/lib/ai/schemas";
import { PlanGenerationInput } from "../../src/lib/types";

describe("AI Schema & Deterministic Heuristic Planner Verification", () => {
  const sampleInput: PlanGenerationInput = {
    eventName: "Sophia & Liam's Autumn Wedding",
    eventType: "WEDDING",
    eventDate: "2026-10-15",
    location: "Napa Valley, CA",
    guestCount: 120,
    totalBudget: 45000,
    currency: "USD",
    themeOrStyle: "Rustic Vineyard Romance",
    formality: "FORMAL",
    indoorOutdoor: "HYBRID",
    culturalTraditions: "Bilingual vows and traditional toast",
  };

  it("produces valid structured output that satisfies GeneratedPlanSchema strictly", () => {
    const plan = generateHeuristicPlan(sampleInput);
    const result = GeneratedPlanSchema.safeParse(plan);

    expect(result.success).toBe(true);
    if (!result.success) {
      console.error(result.error);
      return;
    }

    expect(plan.provenance).toBe("DETERMINISTIC_FALLBACK");
    expect(plan.concept.title).toContain("Wedding");
    expect(plan.concept.colorPalette.length).toBeGreaterThanOrEqual(2);
    expect(plan.recommendedBudgetItems.length).toBeGreaterThanOrEqual(3);
    expect(plan.recommendedSchedule.length).toBeGreaterThanOrEqual(4);
    expect(plan.contingencies.length).toBeGreaterThanOrEqual(2);
  });

  it("ensures all color palettes contain valid hex codes", () => {
    const plan = generateHeuristicPlan(sampleInput);
    for (const color of plan.concept.colorPalette) {
      expect(color.hex).toMatch(/^#([0-9a-fA-F]{3}){1,2}$/);
    }
  });

  it("ensures budget allocations are non-negative integers or rounded numbers", () => {
    const plan = generateHeuristicPlan(sampleInput);
    for (const item of plan.recommendedBudgetItems) {
      expect(item.estimatedQuantity).toBeGreaterThan(0);
      expect(item.estimatedUnitCost).toBeGreaterThanOrEqual(0);
    }
  });

  it("rejects malformed plans with missing critical fields", () => {
    const invalidPlan = {
      concept: {
        title: "Incomplete Plan",
        // missing tagline, themeDescription, colorPalette
      },
      recommendedBudgetItems: [],
    };

    const result = GeneratedPlanSchema.safeParse(invalidPlan);
    expect(result.success).toBe(false);
  });
});
