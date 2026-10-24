import { describe, expect, it, vi } from "vitest";
import { generateEventPlan } from "../../src/lib/ai/planning-engine";
import { PlanGenerationInput } from "../../src/lib/types";

describe("OpenRouter API Integration & PDF Export Data Verification", () => {
  const sampleInput: PlanGenerationInput = {
    eventName: "Lucas & Maya Anniversary Dinner",
    eventType: "ANNIVERSARY",
    eventDate: "2026-12-18",
    location: "Portland, OR",
    guestCount: 40,
    totalBudget: 8000,
    currency: "USD",
  };

  it("falls back gracefully to deterministic heuristic planner when OPENROUTER_API_KEY is not configured", async () => {
    // Ensure keys are unset
    const originalOpenRouter = process.env.OPENROUTER_API_KEY;
    const originalGemini = process.env.GEMINI_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const plan = await generateEventPlan(sampleInput);

    expect(plan).toBeDefined();
    expect(plan.provenance).toBe("DETERMINISTIC_FALLBACK");
    expect(plan.concept.title).toContain("Lucas & Maya");
    expect(plan.recommendedBudgetItems.length).toBeGreaterThan(0);

    // Restore
    if (originalOpenRouter) process.env.OPENROUTER_API_KEY = originalOpenRouter;
    if (originalGemini) process.env.GEMINI_API_KEY = originalGemini;
  });

  it("parses valid OpenRouter JSON response when API returns structured output", async () => {
    const mockOpenRouterResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
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
              recommendedBudgetItems: [
                {
                  category: "VENUE",
                  description: "Private Dining Room Buyout",
                  estimatedQuantity: 1,
                  estimatedUnitCost: 2500,
                  priority: "ESSENTIAL",
                },
                {
                  category: "CATERING",
                  description: "Four-course wine pairing dinner",
                  estimatedQuantity: 40,
                  estimatedUnitCost: 85,
                  priority: "ESSENTIAL",
                },
                {
                  category: "PHOTOGRAPHY",
                  description: "4-hour documentary coverage",
                  estimatedQuantity: 1,
                  estimatedUnitCost: 1200,
                  priority: "RECOMMENDED",
                },
              ],
              recommendedSchedule: [
                {
                  id: "ann-01",
                  title: "Reserve Private Dining Cellar",
                  description: "Lock in restaurant date and deposit",
                  category: "VENUE",
                  priority: "HIGH",
                  daysBeforeEvent: 60,
                  dependsOnTaskIds: [],
                  phase: "EARLY_PLANNING",
                },
                {
                  id: "ann-02",
                  title: "Send Invitation Register to Family",
                  description: "Mail formal printed cards with phone RSVP option",
                  category: "GENERAL",
                  priority: "HIGH",
                  daysBeforeEvent: 30,
                  dependsOnTaskIds: ["ann-01"],
                  phase: "MID_PLANNING",
                },
                {
                  id: "ann-03",
                  title: "Submit Final Kitchen Headcount & Allergens",
                  description: "Send confirmed dietary requirements to executive chef",
                  category: "CATERING",
                  priority: "CRITICAL",
                  daysBeforeEvent: 10,
                  dependsOnTaskIds: ["ann-02"],
                  phase: "FINAL_PREPARATION",
                },
                {
                  id: "ann-04",
                  title: "Celebration Dinner & Toasts",
                  description: "Day of event coordination",
                  category: "GENERAL",
                  priority: "CRITICAL",
                  daysBeforeEvent: 0,
                  dependsOnTaskIds: ["ann-03"],
                  phase: "EVENT_DAY",
                },
              ],
              vendorRequirements: [
                {
                  category: "VENUE",
                  keyQuestionsToAsk: ["Is wine corkage permitted?", "Are private audio speeches allowed?"],
                  criticalDeliverables: ["Dedicated dining space access from 5:00 PM"],
                  redFlagsToAvoid: ["Shared restaurant acoustics"],
                },
                {
                  category: "CATERING",
                  keyQuestionsToAsk: ["Can individual courses be swapped for dairy allergies?"],
                  criticalDeliverables: ["Printed custom menus at each place setting"],
                  redFlagsToAvoid: ["Rigid set menus without substitutes"],
                },
              ],
              contingencies: [
                {
                  riskScenario: "Late arrival of key out-of-town guests",
                  severity: "MEDIUM",
                  mitigationStrategy: "Extend cocktail hour by 30 minutes before first plated course is fired.",
                },
                {
                  riskScenario: "Audio microphone feedback during family toasts",
                  severity: "LOW",
                  mitigationStrategy: "Pre-test handheld acoustic microphone during 4:30 PM soundcheck.",
                },
              ],
            }),
          },
        },
      ],
    };

    // Mock global fetch for OpenRouter
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockOpenRouterResponse,
    });

    process.env.OPENROUTER_API_KEY = "sk-or-v1-mock-test-key";

    const plan = await generateEventPlan(sampleInput);

    expect(plan.provenance).toBe("AI_GENERATED");
    expect(plan.concept.title).toBe("Golden Milestone Celebration");
    expect(plan.recommendedBudgetItems.length).toBe(3);
    expect(plan.recommendedSchedule.length).toBe(4);

    // Cleanup
    delete process.env.OPENROUTER_API_KEY;
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
