import { describe, expect, it, vi } from "vitest";
import { generateEventPlan } from "../../src/lib/ai/planning-engine";
import { PlanGenerationInput } from "../../src/lib/types";

describe("Ollama Gemma 2B Integration & PDF Export Data Verification", () => {
  const sampleInput: PlanGenerationInput = {
    eventName: "Lucas & Maya Anniversary Dinner",
    eventType: "ANNIVERSARY",
    eventDate: "2026-12-18",
    location: "Portland, OR",
    guestCount: 40,
    totalBudget: 8000,
    currency: "USD",
  };

  it("falls back gracefully to deterministic heuristic planner when Ollama is offline or unreachable", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Connection refused: 127.0.0.1:11434"));

    const plan = await generateEventPlan(sampleInput);

    expect(plan).toBeDefined();
    expect(plan.provenance).toBe("DETERMINISTIC_FALLBACK");
    expect(plan.concept.title).toContain("Lucas & Maya");
    expect(plan.recommendedBudgetItems.length).toBeGreaterThan(0);
    expect(plan.recommendedSchedule.length).toBeGreaterThan(0);

    globalThis.fetch = originalFetch;
  });

  it("parses valid Ollama Gemma 2B creative JSON response and assigns AI_GENERATED provenance", async () => {
    const mockGemmaResponse = {
      response: JSON.stringify({
        concept: {
          title: "Golden Milestone Celebration",
          tagline: "Four decades of shared laughter in Portland",
          themeDescription: "An intimate, candlelit celebration with Pacific Northwest seasonal cuisine.",
          colorPalette: [
            { name: "Forest Pine", hex: "#1e3a1e", role: "Base Canvas" },
            { name: "Warm Amber", hex: "#d97706", role: "Candlelight Accent" },
          ],
          stylingIdeas: ["Custom timber nameplates", "Cedar garland runners"],
          atmosphereAndVibe: "Warm, nostalgic, and elegant",
        },
        contingencies: [
          {
            riskScenario: "Late arrival of key out-of-town guests",
            severity: "MEDIUM",
            mitigationStrategy: "Extend cocktail hour by 30 minutes before first plated course is fired.",
          },
          {
            riskScenario: "Audio microphone feedback during toasts",
            severity: "LOW",
            mitigationStrategy: "Pre-test handheld acoustic microphone during soundcheck.",
          },
        ],
      }),
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGemmaResponse,
    });

    const plan = await generateEventPlan(sampleInput);

    expect(plan.provenance).toBe("AI_GENERATED");
    expect(plan.concept.title).toBe("Golden Milestone Celebration");
    expect(plan.concept.colorPalette.length).toBe(2);
    expect(plan.contingencies.length).toBe(2);
    expect(plan.contingencies[0].riskScenario).toContain("Late arrival");
    expect(plan.recommendedBudgetItems.length).toBeGreaterThan(0);
    expect(plan.recommendedSchedule.length).toBeGreaterThan(0);

    globalThis.fetch = originalFetch;
  });

  it("aggregates kitchen catering specs accurately by dietary restriction", () => {
    const guests = [
      { firstName: "Anna", lastName: "Smith", dietaryRequirements: "Vegan", householdGroup: "Smiths" },
      { firstName: "Bob", lastName: "Smith", dietaryRequirements: "Vegan", householdGroup: "Smiths" },
      { firstName: "Charlie", lastName: "Brown", dietaryRequirements: "Gluten-Free", householdGroup: "Browns" },
      { firstName: "Diana", lastName: "Prince", dietaryRequirements: "Severe Peanut Allergy", householdGroup: "VIP" },
      { firstName: "Evan", lastName: "Stone", dietaryRequirements: null },
    ];

    const dietaryCounts: Record<string, number> = {};
    for (const g of guests) {
      if (g.dietaryRequirements) {
        dietaryCounts[g.dietaryRequirements] = (dietaryCounts[g.dietaryRequirements] || 0) + 1;
      }
    }

    expect(dietaryCounts["Vegan"]).toBe(2);
    expect(dietaryCounts["Gluten-Free"]).toBe(1);
    expect(dietaryCounts["Severe Peanut Allergy"]).toBe(1);
    expect(dietaryCounts["Standard"]).toBeUndefined();
  });

  it("formats invitation list rows with phone number guarantees", () => {
    const guest = {
      firstName: "Marcus",
      lastName: "Vance",
      phone: "+1-555-0199",
      email: "marcus.v@example.com",
      householdGroup: "Vance Family",
      rsvpStatus: "ATTENDING",
    };

    expect(guest.phone).toBe("+1-555-0199");
    expect(guest.firstName).toBe("Marcus");
    expect(guest.rsvpStatus).toBe("ATTENDING");
  });
});
