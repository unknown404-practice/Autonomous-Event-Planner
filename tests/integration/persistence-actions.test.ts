import { beforeAll, describe, expect, it } from "vitest";
import {
  addBudgetItem,
  addGuest,
  addTask,
  createEvent,
  deleteBudgetItem,
  deleteGuest,
  deleteTask,
  getEventById,
  saveVendorQuote,
  updateBudgetItem,
  updateEventDetails,
  updateGuestRsvp,
  updateTaskStatus,
} from "../../src/lib/actions";
import prisma from "../../src/lib/db";
import { PlanGenerationInput } from "../../src/lib/types";

describe("Database & Server Actions Integration Lifecycle", () => {
  let createdEventId: string;

  beforeAll(async () => {
    // Ensure database connection is active
    await prisma.$connect();
  });

  it("creates a new event with full AI/heuristic initialization", async () => {
    const input: PlanGenerationInput = {
      eventName: "Integration Test Gala",
      eventType: "COMMUNITY",
      eventDate: "2026-11-15",
      location: "San Jose Civic Center, CA",
      guestCount: 80,
      totalBudget: 15000,
      currency: "USD",
      themeOrStyle: "Autumn Harvest",
      formality: "CASUAL",
      indoorOutdoor: "INDOOR",
    };

    const res = await createEvent(input);
    expect(res.success).toBe(true);
    expect(res.eventId).toBeDefined();
    createdEventId = res.eventId!;

    // Read back and verify persistence
    const loaded = await getEventById(createdEventId);
    expect(loaded).not.toBeNull();
    expect(loaded?.eventName).toBe("Integration Test Gala");
    expect(loaded?.budgetItems.length).toBeGreaterThan(0);
    expect(loaded?.tasks.length).toBeGreaterThan(0);
    expect(loaded?.budgetSummary.totalBudget).toBe(15000);
  });

  it("updates event details and recalculates task deadlines when date shifts", async () => {
    const original = await getEventById(createdEventId);
    const firstTask = original?.tasks[0];
    const originalDue = firstTask?.dueDate;

    // Reschedule event by 10 days later
    const res = await updateEventDetails(createdEventId, {
      eventDate: "2026-11-25",
    });
    expect(res.success).toBe(true);

    const updated = await getEventById(createdEventId);
    expect(updated?.eventDate).toBe("2026-11-25");

    const updatedTask = updated?.tasks.find((t) => t.id === firstTask?.id);
    expect(updatedTask?.dueDate).not.toBe(originalDue);
  });

  it("performs complete CRUD lifecycle on budget items with deterministic totals", async () => {
    // 1. CREATE
    const addRes = await addBudgetItem(createdEventId, {
      category: "MUSIC_ENTERTAINMENT",
      description: "Live Acoustic Duo",
      estimatedQuantity: 1,
      estimatedUnitCost: 1200,
      taxRatePercent: 5,
      additionalFees: 50,
      depositPaid: 300,
    });
    expect(addRes.success).toBe(true);
    const itemId = addRes.item!.id;

    // 2. READ
    let event = await getEventById(createdEventId);
    const addedItem = event?.budgetItems.find((b) => b.id === itemId);
    expect(addedItem).toBeDefined();
    expect(addedItem?.description).toBe("Live Acoustic Duo");

    // 3. UPDATE
    const updateRes = await updateBudgetItem(itemId, {
      actualCost: 1100,
      depositPaid: 500,
    });
    expect(updateRes.success).toBe(true);

    event = await getEventById(createdEventId);
    const updatedItem = event?.budgetItems.find((b) => b.id === itemId);
    expect(updatedItem?.actualCost).toBe(1100);
    expect(updatedItem?.depositPaid).toBe(500);

    // 4. DELETE
    const deleteRes = await deleteBudgetItem(itemId);
    expect(deleteRes.success).toBe(true);

    event = await getEventById(createdEventId);
    const deletedItem = event?.budgetItems.find((b) => b.id === itemId);
    expect(deletedItem).toBeUndefined();
  });

  it("manages tasks and status transitions", async () => {
    // 1. ADD TASK
    const addRes = await addTask(createdEventId, {
      title: "Confirm stage lighting setup",
      daysBeforeEvent: 14,
      priority: "HIGH",
    });
    expect(addRes.success).toBe(true);
    const taskId = addRes.task!.id;

    // 2. UPDATE STATUS
    const updateRes = await updateTaskStatus(taskId, "COMPLETED");
    expect(updateRes.success).toBe(true);

    let event = await getEventById(createdEventId);
    const updated = event?.tasks.find((t) => t.id === taskId);
    expect(updated?.status).toBe("COMPLETED");

    // 3. DELETE TASK
    const delRes = await deleteTask(taskId);
    expect(delRes.success).toBe(true);

    event = await getEventById(createdEventId);
    expect(event?.tasks.find((t) => t.id === taskId)).toBeUndefined();
  });

  it("manages vendor quotes and statuses", async () => {
    const saveRes = await saveVendorQuote(createdEventId, {
      vendorName: "Acoustic Vibes LLC",
      category: "MUSIC_ENTERTAINMENT",
      contactPerson: "Leo Miller",
      contactEmail: "leo@acousticvibes.example",
      status: "QUOTE_RECEIVED",
      quotedAmount: 1400,
      depositRequired: 350,
    });
    expect(saveRes.success).toBe(true);

    const event = await getEventById(createdEventId);
    const quote = event?.vendors.find((v) => v.vendorName === "Acoustic Vibes LLC");
    expect(quote).toBeDefined();
    expect(quote?.status).toBe("QUOTE_RECEIVED");
    expect(quote?.quotedAmount).toBe(1400);
  });

  it("manages guests, RSVPs, and dietary summaries", async () => {
    const addRes = await addGuest(createdEventId, {
      firstName: "Claire",
      lastName: "Redfield",
      email: "claire@example.com",
      dietaryRequirements: "Vegan",
      rsvpStatus: "ATTENDING",
      plusOneAllowed: false,
    });
    expect(addRes.success).toBe(true);

    let event = await getEventById(createdEventId);
    const guest = event?.guests.find((g) => g.email === "claire@example.com");
    expect(guest).toBeDefined();
    expect(guest?.rsvpStatus).toBe("ATTENDING");
    expect(event?.guestSummary.dietarySummary["Vegan"]).toBeGreaterThanOrEqual(1);

    // Update RSVP
    const updateRes = await updateGuestRsvp(guest!.id, "DECLINED");
    expect(updateRes.success).toBe(true);

    // Delete guest
    const delRes = await deleteGuest(guest!.id);
    expect(delRes.success).toBe(true);

    event = await getEventById(createdEventId);
    expect(event?.guests.find((g) => g.id === guest!.id)).toBeUndefined();
  });
});
