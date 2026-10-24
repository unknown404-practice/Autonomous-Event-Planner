// EventPilot AI - Deterministic Expert Heuristic Planning Engine
// High-fidelity fallback when AI provider is offline or API key is not configured.
// Adheres strictly to Directive 5 (Ban Fake Functionality) & Directive 6 (Explicit Fallback Behavior)

import { GeneratedPlanOutput, PlanGenerationInput, VendorCategory } from "../types";

export function generateHeuristicPlan(input: PlanGenerationInput): GeneratedPlanOutput {
  const {
    eventName,
    eventType,
    guestCount,
    totalBudget,
    currency,
    location,
    themeOrStyle,
    formality = "SEMI_FORMAL",
    indoorOutdoor = "HYBRID",
  } = input;

  const perGuestBudget = guestCount > 0 ? totalBudget / guestCount : totalBudget;

  // 1. Contextual Concept Generation
  let title = `${eventName} Celebration`;
  let tagline = `An unforgettable ${eventType.toLowerCase()} in ${location}`;
  let atmosphereAndVibe = "Warm, engaging, and beautifully coordinated with refined modern touches.";
  let colorPalette = [
    { name: "Classic Navy", hex: "#1e3a8a", role: "Primary Base" },
    { name: "Champagne Gold", hex: "#d97706", role: "Warm Accent" },
    { name: "Crisp Ivory", hex: "#f8fafc", role: "Neutral Background" },
  ];

  if (eventType === "WEDDING") {
    title = themeOrStyle ? `${themeOrStyle} Wedding Elegance` : "Timeless & Modern Wedding Celebration";
    tagline = `A harmonious union celebrating love with curated elegance in ${location}`;
    atmosphereAndVibe = "Romantic, timeless, intimate, and seamlessly orchestrated from vow to celebration.";
    colorPalette = [
      { name: "Eucalyptus Green", hex: "#065f46", role: "Botanical Accent" },
      { name: "Rose Quartz", hex: "#fda4af", role: "Soft Romantic" },
      { name: "Warm Gold", hex: "#f59e0b", role: "Metallic Highlight" },
      { name: "Soft Alabaster", hex: "#f1f5f9", role: "Neutral Grounding" },
    ];
  } else if (eventType === "CORPORATE" || eventType === "CONFERENCE") {
    title = `${eventName} Professional Summit`;
    tagline = `Driving innovation and strategic connection in ${location}`;
    atmosphereAndVibe = "Professional, high-energy, polished, and structured for seamless networking.";
    colorPalette = [
      { name: "Tech Slate", hex: "#334155", role: "Executive Primary" },
      { name: "Electric Indigo", hex: "#4f46e5", role: "Innovation Accent" },
      { name: "Pure Silver", hex: "#e2e8f0", role: "Modern Border" },
    ];
  } else if (eventType === "BIRTHDAY" || eventType === "ANNIVERSARY") {
    title = `${eventName} Milestone Gala`;
    tagline = `Celebrating memorable milestones with joy, laughter, and family in ${location}`;
    atmosphereAndVibe = "Vibrant, celebratory, full of laughter and personalized nostalgic memories.";
    colorPalette = [
      { name: "Deep Amethyst", hex: "#581c87", role: "Festive Drama" },
      { name: "Sunset Coral", hex: "#fb7185", role: "Warm Radiance" },
      { name: "Shimmering Pearl", hex: "#f8fafc", role: "Highlight Accent" },
    ];
  }

  // 2. Budget Allocation Heuristics (Proportional to industry standards: Venue ~35%, Catering ~30%, Photo/Video ~15%, Decor/Audio ~12%, Contingency ~8%)
  const venueCost = Math.round(totalBudget * 0.32);
  const cateringUnitCost = Math.round((totalBudget * 0.32) / Math.max(1, guestCount));
  const photoCost = Math.round(totalBudget * 0.12);
  const decorCost = Math.round(totalBudget * 0.10);
  const musicCost = Math.round(totalBudget * 0.08);
  const stationeryCost = Math.round(totalBudget * 0.03);
  const securityAvCost = Math.round(totalBudget * 0.03);

  const recommendedBudgetItems = [
    {
      category: "VENUE" as VendorCategory,
      description: `Venue rental package in ${location} (${indoorOutdoor.toLowerCase()} setup)`,
      estimatedQuantity: 1,
      estimatedUnitCost: venueCost,
      priority: "ESSENTIAL" as const,
      costSavingTip: "Inquire about package inclusions like tables, chairs, and cleanup to avoid separate rental fees.",
    },
    {
      category: "CATERING" as VendorCategory,
      description: `Multi-course dinner & beverage service for ${guestCount} guests`,
      estimatedQuantity: Math.max(1, guestCount),
      estimatedUnitCost: cateringUnitCost,
      priority: "ESSENTIAL" as const,
      costSavingTip: "A curated buffet or family-style dinner often saves 15-20% compared to plated meal service.",
    },
    {
      category: "PHOTOGRAPHY" as VendorCategory,
      description: "Full event coverage with digital delivery and rights",
      estimatedQuantity: 1,
      estimatedUnitCost: photoCost,
      priority: "RECOMMENDED" as const,
      costSavingTip: "Book an 8-hour coverage window instead of full 12-hour day to lower hourly rates.",
    },
    {
      category: "DECORATION" as VendorCategory,
      description: "Atmospheric lighting, table settings, and focal point decor",
      estimatedQuantity: 1,
      estimatedUnitCost: decorCost,
      priority: "RECOMMENDED" as const,
      costSavingTip: "Repurpose ceremony floral arrangements at the reception tables.",
    },
    {
      category: "MUSIC_ENTERTAINMENT" as VendorCategory,
      description: "Live DJ, audio sound system, and master of ceremonies",
      estimatedQuantity: 1,
      estimatedUnitCost: musicCost,
      priority: "RECOMMENDED" as const,
      costSavingTip: "Confirm sound equipment is included with the DJ quote to prevent separate AV invoices.",
    },
    {
      category: "STATIONERY" as VendorCategory,
      description: "Printed/digital invitations, menus, and signage",
      estimatedQuantity: 1,
      estimatedUnitCost: stationeryCost,
      priority: "OPTIONAL" as const,
      costSavingTip: "Digital invitations combined with physical day-of signage reduce printing waste.",
    },
    {
      category: "AV_EQUIPMENT" as VendorCategory,
      description: "Microphones, projection screens, and backup power equipment",
      estimatedQuantity: 1,
      estimatedUnitCost: securityAvCost,
      priority: "OPTIONAL" as const,
      costSavingTip: "Check venue built-in PA capabilities before renting third-party sound gear.",
    },
  ];

  // 3. Date-Aware Milestone Timeline
  const recommendedSchedule = [
    {
      id: "task-01",
      title: "Confirm Venue & Sign Lease Agreement",
      description: "Secure the physical space, lock in date, and review cancellation clauses.",
      category: "VENUE" as VendorCategory,
      priority: "CRITICAL" as const,
      daysBeforeEvent: 120,
      dependsOnTaskIds: [],
      phase: "EARLY_PLANNING" as const,
    },
    {
      id: "task-02",
      title: "Select Catering & Schedule Tasting Menu",
      description: "Review dietary options, finalize head count pricing, and verify alcohol licensing.",
      category: "CATERING" as VendorCategory,
      priority: "HIGH" as const,
      daysBeforeEvent: 90,
      dependsOnTaskIds: ["task-01"],
      phase: "EARLY_PLANNING" as const,
    },
    {
      id: "task-03",
      title: "Contract Photographer & Videographer",
      description: "Confirm shot list, timeline walkthrough, and contract terms.",
      category: "PHOTOGRAPHY" as VendorCategory,
      priority: "HIGH" as const,
      daysBeforeEvent: 75,
      dependsOnTaskIds: ["task-01"],
      phase: "MID_PLANNING" as const,
    },
    {
      id: "task-04",
      title: "Send Formal Invitations & Launch RSVP Collection",
      description: "Distribute digital/paper invites with explicit RSVP deadline 30 days prior.",
      category: "GENERAL" as const,
      priority: "CRITICAL" as const,
      daysBeforeEvent: 60,
      dependsOnTaskIds: ["task-01", "task-02"],
      phase: "MID_PLANNING" as const,
    },
    {
      id: "task-05",
      title: "Finalize Decor, Florals, and Spatial Layout",
      description: "Approve table schematics, lighting plan, and floral installations.",
      category: "DECORATION" as VendorCategory,
      priority: "MEDIUM" as const,
      daysBeforeEvent: 45,
      dependsOnTaskIds: ["task-01"],
      phase: "MID_PLANNING" as const,
    },
    {
      id: "task-06",
      title: "Lock In Final Guest Headcount with Caterer",
      description: "Reconcile RSVP responses and submit confirmed dietary requirements.",
      category: "CATERING" as VendorCategory,
      priority: "CRITICAL" as const,
      daysBeforeEvent: 21,
      dependsOnTaskIds: ["task-04"],
      phase: "FINAL_PREPARATION" as const,
    },
    {
      id: "task-07",
      title: "Distribute Event Day Master Run Sheet to All Vendors",
      description: "Share load-in schedule, contact numbers, and parking logistics.",
      category: "GENERAL" as const,
      priority: "HIGH" as const,
      daysBeforeEvent: 7,
      dependsOnTaskIds: ["task-02", "task-03", "task-05"],
      phase: "FINAL_PREPARATION" as const,
    },
    {
      id: "task-08",
      title: "Day-of Vendor Coordination & Setup Inspection",
      description: "Oversee sound checks, table placements, and timeline adherence.",
      category: "GENERAL" as const,
      priority: "CRITICAL" as const,
      daysBeforeEvent: 0,
      dependsOnTaskIds: ["task-07"],
      phase: "EVENT_DAY" as const,
    },
    {
      id: "task-09",
      title: "Post-Event Reconciliation & Final Vendor Settlements",
      description: "Verify security deposit returns and distribute tips/final balances.",
      category: "GENERAL" as const,
      priority: "MEDIUM" as const,
      daysBeforeEvent: -3,
      dependsOnTaskIds: ["task-08"],
      phase: "POST_EVENT" as const,
    },
  ];

  // 4. Vendor Requirements & Vetting Checklists
  const vendorRequirements = [
    {
      category: "VENUE" as VendorCategory,
      keyQuestionsToAsk: [
        "What are exact load-in and load-out hours permitted?",
        "Are there noise curfews or decibel restrictions?",
        "Is there dedicated backup electrical power for AV and kitchen equipment?",
      ],
      criticalDeliverables: [
        "Floorplan schematic with designated emergency exits",
        "Certificate of venue liability insurance coverage",
        "Clear itemization of cleanup fees and security deposit return criteria",
      ],
      redFlagsToAvoid: [
        "Vague cancellation refund policies",
        "Mandatory in-house vendors with inflated mandatory service fees",
        "Lack of accessible restrooms or ADA ramps",
      ],
    },
    {
      category: "CATERING" as VendorCategory,
      keyQuestionsToAsk: [
        "How do you handle severe allergies and separate kosher/halal/vegan prep areas?",
        "Is staffing (servers, bussers, bartenders) included in the quote or billed separately?",
        "What is the policy on leftover food distribution?",
      ],
      criticalDeliverables: [
        "Signed menu tasting agreement with confirmed portions",
        "Food handler health certification and insurance binder",
        "Guaranteed ratio of servers per table (standard 1:12 for plated, 1:25 for buffet)",
      ],
      redFlagsToAvoid: [
        "Hidden per-head corkage or cake-cutting fees",
        "Refusal to accommodate dietary substitutes",
        "Unwillingness to provide references from similar events",
      ],
    },
  ];

  // 5. Contingency Plans
  const contingencies = [
    {
      riskScenario: "Inclement weather during outdoor event segments",
      severity: "HIGH" as const,
      mitigationStrategy:
        "Contract a 48-hour weather-hold tent rental option or pre-book the venue indoor pavilion as guaranteed backup.",
    },
    {
      riskScenario: "Late guest cancellations altering final catering minimums",
      severity: "MEDIUM" as const,
      mitigationStrategy:
        "Negotiate a 5% flexibility buffer with the caterer 72 hours before the event; maintain an alternate standby guest list.",
    },
    {
      riskScenario: "Key AV / Audio equipment failure during speeches or ceremony",
      severity: "HIGH" as const,
      mitigationStrategy:
        "Require vendor contract to include secondary wireless microphone and standalone battery-powered backup speaker.",
    },
  ];

  return {
    concept: {
      title,
      tagline,
      themeDescription: `A tailored ${formality.toLowerCase()} concept designed for ${guestCount} attendees in ${location}. Focuses on seamless guest arrival, cohesive visual identity, and memorable hospitality.`,
      colorPalette,
      stylingIdeas: [
        "Curated accent lighting with soft warm illumination to enhance spatial depth.",
        "Custom branded/themed welcome signage at primary reception entrance.",
        "Coordinated linen textures paired with eco-conscious reusable floral installations.",
      ],
      atmosphereAndVibe,
    },
    recommendedBudgetItems,
    recommendedSchedule,
    vendorRequirements,
    contingencies,
    provenance: "DETERMINISTIC_FALLBACK",
    generatedAt: new Date().toISOString(),
  };
}
