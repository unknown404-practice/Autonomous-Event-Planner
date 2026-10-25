import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createEvent, getEventById } from "../../src/lib/actions";
import prisma from "../../src/lib/db";
import { PlanGenerationInput } from "../../src/lib/types";

describe("User Screenshot Flow Reproduction", () => {
  let createdEventId: string | null = null;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    if (createdEventId) {
      await prisma.activityLog.deleteMany({ where: { eventId: createdEventId } });
      await prisma.guest.deleteMany({ where: { eventId: createdEventId } });
      await prisma.vendorQuote.deleteMany({ where: { eventId: createdEventId } });
      await prisma.taskDependency.deleteMany({
        where: {
          OR: [
            { task: { eventId: createdEventId } },
            { dependsOnTask: { eventId: createdEventId } },
          ],
        },
      });
      await prisma.task.deleteMany({ where: { eventId: createdEventId } });
      await prisma.budgetItem.deleteMany({ where: { eventId: createdEventId } });
      await prisma.event.deleteMany({ where: { id: createdEventId } });
    }
    await prisma.$disconnect();
  });

  it("successfully creates event matching user's exact screenshot inputs", async () => {
    const input: PlanGenerationInput = {
      eventName: "Royal Concert Gala",
      eventType: "WEDDING",
      eventDate: "2026-11-20",
      location: "Grand Ballroom, Mumbai",
      guestCount: 1200,
      totalBudget: 250000,
      currency: "INR",
      themeOrStyle: "Modern Botanical Elegance",
      formality: "SEMI_FORMAL",
      indoorOutdoor: "HYBRID",
      culturalTraditions: "Multilingual Song Concert",
      dietaryNotes: "Multiple Gelatin free and complete alcohol free.",
      specialConstraints: "",
    };

    const res = await createEvent(input);
    console.log("createEvent result:", res);

    expect(res.success).toBe(true);
    expect(res.eventId).toBeDefined();
    createdEventId = res.eventId!;

    const loaded = await getEventById(createdEventId);
    expect(loaded).not.toBeNull();
    expect(loaded?.eventName).toBe("Royal Concert Gala");
    expect(loaded?.currency).toBe("INR");
    expect(loaded?.guestCount).toBe(1200);
    expect(loaded?.totalBudget).toBe(250000);
    expect(loaded?.budgetItems.length).toBeGreaterThan(0);
    expect(loaded?.tasks.length).toBeGreaterThan(0);
  }, 35000);
});
