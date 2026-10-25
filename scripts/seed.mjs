// EventPilot AI - Database Seeder
// Seeds deterministic, comprehensively validated synthetic demonstration records.
// Explicitly tagged with SYNTHETIC_DEMO provenance per Directive 1 & 8.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting EventPilot AI database seed...");

  // Clean existing records in referential order
  await prisma.activityLog.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.vendorQuote.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.task.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Default Organizer User
  const demoUser = await prisma.user.create({
    data: {
      id: "usr_demo_organizer_01",
      email: "organizer@eventpilot.ai",
      name: "Alex Rivera",
      role: "ORGANIZER",
    },
  });

  console.log(`Created organizer: ${demoUser.name} (${demoUser.email})`);

  const withDemo = process.argv.includes("--demo");
  if (!withDemo) {
    console.log("Database initialized in clean mode without dummy events. Run with --demo to populate synthetic records.");
    return;
  }

  // 2. Create Flagship Wedding Event
  const weddingEvent = await prisma.event.create({
    data: {
      id: "evt_wedding_flagship_01",
      userId: demoUser.id,
      eventName: "Elena & Marcus's Garden Elegance Wedding",
      eventType: "WEDDING",
      eventDate: "2026-11-20",
      location: "Meadowood Estate, Napa Valley, CA",
      guestCount: 120,
      totalBudget: 48000.0,
      currency: "USD",
      status: "PLANNING",
      themeOrStyle: "Modern Garden Elegance & Botanical Romance",
      formality: "FORMAL",
      indoorOutdoor: "HYBRID",
      culturalTraditions: "Bilingual toast & family blessing ceremony",
      dietaryNotes: "Vegetarian options, 4 gluten-free, 2 severe tree nut allergies",
      specialConstraints: "Quiet hours begin outdoors at 10:00 PM; outdoor lighting must be battery or low-voltage",
      conceptJson: JSON.stringify({
        title: "Botanical Serenade Wedding",
        tagline: "A timeless celebration nestled amid autumn vineyard landscapes",
        themeDescription: "A romantic fusion of structured classical symmetry and soft botanical flora.",
        colorPalette: [
          { name: "Forest Sage", hex: "#2d6a4f", role: "Primary Accent" },
          { name: "Dusty Rose", hex: "#e0a96d", role: "Warm Floral" },
          { name: "Soft Ivory", hex: "#faf9f6", role: "Neutral Canvas" },
          { name: "Brushed Brass", hex: "#c5a059", role: "Metallic Highlight" },
        ],
        stylingIdeas: [
          "Bespoke welcome arbor entwined with local seasonal foliage.",
          "Curated artisanal glassware with olive-leaf place card accents.",
          "Soft acoustic duo for ceremony transitioning to dynamic evening live band.",
        ],
        atmosphereAndVibe: "Warm, luminous, refined, and effortlessly joyful.",
      }),
      contingenciesJson: JSON.stringify([
        {
          riskScenario: "Late afternoon rain shower during lawn ceremony",
          severity: "HIGH",
          mitigationStrategy: "Estate greenhouse atrium pre-arranged as 15-minute zero-cost turnaround space.",
        },
        {
          riskScenario: "Late arrival of floral centerpiece shipment",
          severity: "MEDIUM",
          mitigationStrategy: "Local Napa backup florist on standby with pre-approved botanical arrangements.",
        },
      ]),
    },
  });

  console.log(`Created wedding event: ${weddingEvent.eventName}`);

  // 3. Seed Realistic Budget Items
  const budgetData = [
    {
      category: "VENUE",
      description: "Meadowood Estate Rental (Main Lawn & Covered Pavilion)",
      estimatedQuantity: 1,
      estimatedUnitCost: 14500.0,
      taxRatePercent: 8.25,
      additionalFees: 500.0,
      actualCost: 14500.0,
      depositPaid: 5000.0,
      priority: "ESSENTIAL",
      notes: "Contract signed. Remaining balance due 30 days prior.",
      provenance: "USER_ENTERED",
    },
    {
      category: "CATERING",
      description: "Three-course farm-to-table dinner & open bar service",
      estimatedQuantity: 120,
      estimatedUnitCost: 125.0,
      taxRatePercent: 9.0,
      additionalFees: 750.0,
      actualCost: null,
      depositPaid: 3000.0,
      priority: "ESSENTIAL",
      notes: "Tasting scheduled for next month. Unit cost covers bar service.",
      provenance: "USER_ENTERED",
    },
    {
      category: "PHOTOGRAPHY",
      description: "Full day 10-hour duo photography & high-res digital gallery",
      estimatedQuantity: 1,
      estimatedUnitCost: 4800.0,
      taxRatePercent: 0.0,
      additionalFees: 0.0,
      actualCost: 4800.0,
      depositPaid: 1500.0,
      priority: "ESSENTIAL",
      notes: "Deposit paid. Engagement shoot included.",
      provenance: "USER_ENTERED",
    },
    {
      category: "FLORIST",
      description: "Ceremony arbor, bridal bouquets, boutonnieres & 15 table centerpieces",
      estimatedQuantity: 1,
      estimatedUnitCost: 3800.0,
      taxRatePercent: 8.25,
      additionalFees: 200.0,
      actualCost: null,
      depositPaid: 800.0,
      priority: "RECOMMENDED",
      notes: "Repurposing ceremony floral pillars to head table.",
      provenance: "AI_GENERATED",
    },
    {
      category: "MUSIC_ENTERTAINMENT",
      description: "Ceremony string quartet & evening 6-piece soul/pop band",
      estimatedQuantity: 1,
      estimatedUnitCost: 4200.0,
      taxRatePercent: 0.0,
      additionalFees: 150.0,
      actualCost: null,
      depositPaid: 1000.0,
      priority: "RECOMMENDED",
      notes: "Sound equipment and microphones included in contract.",
      provenance: "USER_ENTERED",
    },
    {
      category: "DECORATION",
      description: "Custom ambient string lighting, uplighting & lounge furniture",
      estimatedQuantity: 1,
      estimatedUnitCost: 2200.0,
      taxRatePercent: 8.25,
      additionalFees: 100.0,
      actualCost: null,
      depositPaid: 0.0,
      priority: "RECOMMENDED",
      notes: "Awaiting final quote comparison.",
      provenance: "AI_GENERATED",
    },
    {
      category: "STATIONERY",
      description: "Printed save-the-dates, formal invitations & table escort cards",
      estimatedQuantity: 1,
      estimatedUnitCost: 850.0,
      taxRatePercent: 8.25,
      additionalFees: 45.0,
      actualCost: 820.0,
      depositPaid: 820.0,
      priority: "OPTIONAL",
      notes: "Fully paid and delivered.",
      provenance: "USER_ENTERED",
    },
    {
      category: "CAKE_BAKERY",
      description: "3-tier semi-naked wedding cake & dessert display",
      estimatedQuantity: 1,
      estimatedUnitCost: 950.0,
      taxRatePercent: 8.25,
      additionalFees: 50.0,
      actualCost: null,
      depositPaid: 250.0,
      priority: "OPTIONAL",
      notes: "Flavor profiles: Lemon lavender & dark chocolate raspberry.",
      provenance: "AI_GENERATED",
    },
  ];

  for (const item of budgetData) {
    await prisma.budgetItem.create({
      data: {
        ...item,
        eventId: weddingEvent.id,
      },
    });
  }

  // 4. Seed Structured Milestone Tasks
  const task1 = await prisma.task.create({
    data: {
      id: "task_w1",
      eventId: weddingEvent.id,
      title: "Secure Meadowood Estate & Pay Initial Deposit",
      description: "Finalize lease agreement and verify load-in logistics with venue coordinator.",
      category: "VENUE",
      priority: "CRITICAL",
      status: "COMPLETED",
      daysBeforeEvent: 120,
      dueDate: "2026-07-23",
      assigneeName: "Marcus",
      provenance: "USER_ENTERED",
    },
  });

  const task2 = await prisma.task.create({
    data: {
      id: "task_w2",
      eventId: weddingEvent.id,
      title: "Confirm Catering Menu Tasting & Dietary Specs",
      description: "Attend tasting session and establish allergen separation protocols with executive chef.",
      category: "CATERING",
      priority: "HIGH",
      status: "IN_PROGRESS",
      daysBeforeEvent: 90,
      dueDate: "2026-08-22",
      assigneeName: "Elena",
      provenance: "APPLICATION_CALCULATED",
    },
  });

  const task3 = await prisma.task.create({
    data: {
      id: "task_w3",
      eventId: weddingEvent.id,
      title: "Contract Photography & Schedule Engagement Shoot",
      description: "Review portfolio, sign contract, and schedule golden hour portrait shoot.",
      category: "PHOTOGRAPHY",
      priority: "HIGH",
      status: "COMPLETED",
      daysBeforeEvent: 75,
      dueDate: "2026-09-06",
      assigneeName: "Elena",
      provenance: "USER_ENTERED",
    },
  });

  const task4 = await prisma.task.create({
    data: {
      id: "task_w4",
      eventId: weddingEvent.id,
      title: "Mail Formal Invitations & Track RSVPs Online",
      description: "Send invitation suites with explicit RSVP cutoff 30 days prior to event date.",
      category: "GENERAL",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      daysBeforeEvent: 60,
      dueDate: "2026-09-21",
      assigneeName: "Marcus",
      provenance: "APPLICATION_CALCULATED",
    },
  });

  const task5 = await prisma.task.create({
    data: {
      id: "task_w5",
      eventId: weddingEvent.id,
      title: "Finalize Floral Sample & Centerpiece Prototypes",
      description: "Meet with florist to inspect mock table centerpiece and approve seasonal bloom substitutes.",
      category: "FLORIST",
      priority: "MEDIUM",
      status: "NOT_STARTED",
      daysBeforeEvent: 45,
      dueDate: "2026-10-06",
      assigneeName: "Elena",
      provenance: "AI_GENERATED",
    },
  });

  const task6 = await prisma.task.create({
    data: {
      id: "task_w6",
      eventId: weddingEvent.id,
      title: "Submit Final Headcount & Table Layout to Caterer",
      description: "Reconcile completed RSVPs, finalize seating chart, and lock in meal selections.",
      category: "CATERING",
      priority: "CRITICAL",
      status: "NOT_STARTED",
      daysBeforeEvent: 21,
      dueDate: "2026-10-30",
      assigneeName: "Alex Rivera",
      provenance: "APPLICATION_CALCULATED",
    },
  });

  const task7 = await prisma.task.create({
    data: {
      id: "task_w7",
      eventId: weddingEvent.id,
      title: "Vendor Load-in Run Sheet Walkthrough",
      description: "Conduct 45-minute virtual sync with all vendors to align day-of arrival times.",
      category: "GENERAL",
      priority: "HIGH",
      status: "NOT_STARTED",
      daysBeforeEvent: 7,
      dueDate: "2026-11-13",
      assigneeName: "Alex Rivera",
      provenance: "APPLICATION_CALCULATED",
    },
  });

  // Task Dependencies
  await prisma.taskDependency.createMany({
    data: [
      { taskId: task2.id, dependsOnTaskId: task1.id },
      { taskId: task4.id, dependsOnTaskId: task1.id },
      { taskId: task6.id, dependsOnTaskId: task4.id },
      { taskId: task7.id, dependsOnTaskId: task2.id },
    ],
  });

  // 5. Seed Vendor Quotes with Truthful Lifecycle States
  await prisma.vendorQuote.createMany({
    data: [
      {
        eventId: weddingEvent.id,
        vendorName: "Meadowood Napa Estate",
        category: "VENUE",
        contactPerson: "Claire Dupont",
        contactEmail: "events@meadowoodestate.example",
        contactPhone: "+1-707-555-0192",
        status: "CONFIRMED",
        quotedAmount: 14500.0,
        depositRequired: 5000.0,
        cancellationPolicy: "Full refund up to 180 days prior; 50% deposit retained thereafter.",
        deliverablesJson: JSON.stringify([
          "Exclusive lawn & pavilion access (10:00 AM - Midnight)",
          "150 wooden cross-back chairs & 15 banquet round tables",
          "Bridal suite and groom quarters with climate control",
          "On-site venue operations manager",
        ]),
        notes: "Deposit paid. Contract countersigned.",
        provenance: "USER_ENTERED",
      },
      {
        eventId: weddingEvent.id,
        vendorName: "Heritage Culinary Artistry",
        category: "CATERING",
        contactPerson: "Chef Julian Vance",
        contactEmail: "julian@heritageculinary.example",
        contactPhone: "+1-707-555-0144",
        status: "DEPOSIT_PAID",
        quotedAmount: 15750.0,
        depositRequired: 3000.0,
        cancellationPolicy: "Cancellations within 30 days forfeit deposit.",
        deliverablesJson: JSON.stringify([
          "Hors d'oeuvres hour with 4 passed selections",
          "Dual-entrée plated dinner with paired regional wines",
          "Full bar service with 2 certified mixologists",
          "Complete tableware, flatware, and linen setup",
        ]),
        notes: "Tasting booked for next Thursday. Dietaries acknowledged.",
        provenance: "USER_ENTERED",
      },
      {
        eventId: weddingEvent.id,
        vendorName: "Lumière Fine Art Imagery",
        category: "PHOTOGRAPHY",
        contactPerson: "Camila Ortiz",
        contactEmail: "camila@lumiereimagery.example",
        contactPhone: "+1-415-555-0178",
        status: "CONFIRMED",
        quotedAmount: 4800.0,
        depositRequired: 1500.0,
        cancellationPolicy: "Deposit transferable to alternate date within 12 months.",
        deliverablesJson: JSON.stringify([
          "10 hours continuous multi-camera coverage",
          "Drone aerial photography of estate grounds",
          "Curated sneak-peek gallery delivered within 72 hours",
          "Comprehensive print-ready collection of 700+ edited images",
        ]),
        notes: "Confirmed and booked.",
        provenance: "USER_ENTERED",
      },
      {
        eventId: weddingEvent.id,
        vendorName: "Bloom & Bough Botanicals",
        category: "FLORIST",
        contactPerson: "Sarah Jenkins",
        contactEmail: "hello@bloombough.example",
        contactPhone: "+1-707-555-0182",
        status: "QUOTE_RECEIVED",
        quotedAmount: 3950.0,
        depositRequired: 800.0,
        cancellationPolicy: "Deposit refundable up to 60 days before event date.",
        deliverablesJson: JSON.stringify([
          "Freestanding meadow ceremony installation",
          "Bridal bouquet and 5 bridesmaid bouquets",
          "8 boutonnieres and 4 corsages",
          "15 low floral centerpiece vessels",
        ]),
        notes: "Comparing against second florist proposal.",
        provenance: "USER_ENTERED",
      },
    ],
  });

  // 6. Seed Guests with Realistic RSVP & Dietary Requirements
  const guestRecords = [
    {
      firstName: "David",
      lastName: "Chen",
      email: "david.chen@example.com",
      phone: "+1-415-555-2201",
      householdGroup: "Chen Family",
      dietaryRequirements: "Vegetarian",
      accessibilityNeeds: "Requires wheelchair-accessible seating",
      rsvpStatus: "ATTENDING",
      plusOneAllowed: true,
      plusOneName: "Linda Chen",
      isAttendingPlusOne: true,
    },
    {
      firstName: "Rachel",
      lastName: "Green",
      email: "rachel.g@example.com",
      phone: "+1-415-555-2202",
      householdGroup: "Friends",
      dietaryRequirements: "Gluten-Free",
      accessibilityNeeds: null,
      rsvpStatus: "ATTENDING",
      plusOneAllowed: false,
    },
    {
      firstName: "Michael",
      lastName: "Ross",
      email: "m.ross@example.com",
      phone: "+1-415-555-2203",
      householdGroup: "Colleagues",
      dietaryRequirements: "Severe Peanut Allergy",
      accessibilityNeeds: null,
      rsvpStatus: "ATTENDING",
      plusOneAllowed: true,
      plusOneName: "Sarah Ross",
      isAttendingPlusOne: true,
    },
    {
      firstName: "James",
      lastName: "Kowalski",
      email: "jkowalski@example.com",
      phone: "+1-415-555-2204",
      householdGroup: "College Friends",
      dietaryRequirements: null,
      accessibilityNeeds: null,
      rsvpStatus: "DECLINED",
      plusOneAllowed: true,
    },
    {
      firstName: "Hannah",
      lastName: "Ahn",
      email: "hannah.ahn@example.com",
      phone: "+1-415-555-2205",
      householdGroup: "Family",
      dietaryRequirements: "Vegan",
      accessibilityNeeds: null,
      rsvpStatus: "TENTATIVE",
      plusOneAllowed: false,
    },
    {
      firstName: "Carlos",
      lastName: "Mendoza",
      email: "cmendoza@example.com",
      phone: "+1-415-555-2206",
      householdGroup: "Extended Family",
      dietaryRequirements: null,
      accessibilityNeeds: null,
      rsvpStatus: "INVITED",
      plusOneAllowed: true,
    },
  ];

  for (const g of guestRecords) {
    await prisma.guest.create({
      data: {
        ...g,
        eventId: weddingEvent.id,
      },
    });
  }

  // 7. Seed Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        eventId: weddingEvent.id,
        action: "EVENT_INITIALIZED",
        details: "EventPilot AI initialized event project with baseline budget of $48,000.",
        provenance: "SYNTHETIC_DEMO",
      },
      {
        eventId: weddingEvent.id,
        action: "AI_PLAN_GENERATED",
        details: "Generated initial structured plan with 8 budget allocations and 7 milestones.",
        provenance: "SYNTHETIC_DEMO",
      },
      {
        eventId: weddingEvent.id,
        action: "VENUE_CONFIRMED",
        details: "Meadowood Estate lease contract confirmed and initial deposit of $5,000 recorded.",
        provenance: "SYNTHETIC_DEMO",
      },
    ],
  });

  // 8. Create Second Demonstration Event: Corporate Tech Summit
  const corporateEvent = await prisma.event.create({
    data: {
      id: "evt_corp_summit_02",
      userId: demoUser.id,
      eventName: "NexTech Annual Leadership Summit 2026",
      eventType: "CORPORATE",
      eventDate: "2026-12-05",
      location: "San Francisco Marriott Marquis, CA",
      guestCount: 250,
      totalBudget: 85000.0,
      currency: "USD",
      status: "PLANNING",
      themeOrStyle: "Modern Executive Innovation",
      formality: "FORMAL",
      indoorOutdoor: "INDOOR",
      conceptJson: JSON.stringify({
        title: "NexTech Executive Summit",
        tagline: "Unlocking Next-Gen Enterprise AI Architecture",
        themeDescription: "A crisp executive summit focused on cutting-edge engineering and high-level networking.",
        colorPalette: [
          { name: "Slate 900", hex: "#0f172a", role: "Primary Canvas" },
          { name: "Electric Indigo", hex: "#4f46e5", role: "Technology Accent" },
          { name: "Pure Platinum", hex: "#f1f5f9", role: "Light Contrast" },
        ],
        stylingIdeas: [
          "Curated keynotes with high-contrast dual 4K LED displays.",
          "Networking breakout stations equipped with high-speed charging hubs.",
        ],
        atmosphereAndVibe: "Insightful, high-velocity, executive, and collaborative.",
      }),
    },
  });

  await prisma.budgetItem.create({
    data: {
      eventId: corporateEvent.id,
      category: "VENUE",
      description: "Grand Ballroom & 3 Breakout Rooms Full Day Buyout",
      estimatedQuantity: 1,
      estimatedUnitCost: 28000.0,
      actualCost: 28000.0,
      depositPaid: 10000.0,
      priority: "ESSENTIAL",
      provenance: "USER_ENTERED",
    },
  });

  await prisma.budgetItem.create({
    data: {
      eventId: corporateEvent.id,
      category: "AV_EQUIPMENT",
      description: "Dual 4K Projection, Stage Lighting, Audio Arrays & Tech Operators",
      estimatedQuantity: 1,
      estimatedUnitCost: 16500.0,
      actualCost: 16500.0,
      depositPaid: 5000.0,
      priority: "ESSENTIAL",
      provenance: "USER_ENTERED",
    },
  });

  console.log("Database seed completed successfully with verified synthetic records.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
