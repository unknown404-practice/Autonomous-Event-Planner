import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  addBudgetItem,
  addGuest,
  addTask,
  createEvent,
  deleteBudgetItem,
  deleteGuest,
  deleteTask,
  deleteVendorQuote,
  getEventById,
  getEvents,
  saveVendorQuote,
  updateBudgetItem,
  updateEventDetails,
  updateGuest,
  updateGuestRsvp,
  updateTask,
  updateTaskStatus,
  updateVendorQuote,
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

    // Delete vendor quote
    const delRes = await deleteVendorQuote(quote!.id);
    expect(delRes.success).toBe(true);

    const afterDelEvent = await getEventById(createdEventId);
    expect(afterDelEvent?.vendors.find((v) => v.id === quote!.id)).toBeUndefined();
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

  it("persists and returns AI vendor procurement requirements (BUG-05)", async () => {
    const event = await getEventById(createdEventId);
    expect(event).not.toBeNull();
    expect(event?.vendorRequirements).toBeDefined();
    expect(Array.isArray(event?.vendorRequirements)).toBe(true);
    expect(event!.vendorRequirements.length).toBeGreaterThanOrEqual(2);
    expect(event!.vendorRequirements[0].category).toBeDefined();
    expect(event!.vendorRequirements[0].keyQuestionsToAsk.length).toBeGreaterThan(0);
  });

  it("supports comprehensive editing of tasks, guests, and vendor quotes (BUG-07)", async () => {
    // 1. Task editing via updateTask
    const taskAdd = await addTask(createdEventId, {
      title: "Preliminary Soundcheck",
      daysBeforeEvent: 20,
      priority: "LOW",
    });
    expect(taskAdd.success).toBe(true);
    const taskId = taskAdd.task!.id;

    const taskUpdate = await updateTask(taskId, {
      title: "Critical Soundcheck & Acoustics Validation",
      priority: "CRITICAL",
      daysBeforeEvent: 15,
      assigneeName: "Lead Audio Engineer",
    });
    expect(taskUpdate.success).toBe(true);

    let event = await getEventById(createdEventId);
    const updatedTask = event?.tasks.find((t) => t.id === taskId);
    expect(updatedTask?.title).toBe("Critical Soundcheck & Acoustics Validation");
    expect(updatedTask?.priority).toBe("CRITICAL");
    expect(updatedTask?.daysBeforeEvent).toBe(15);
    expect(updatedTask?.assigneeName).toBe("Lead Audio Engineer");

    // 2. Guest editing via updateGuest
    const guestAdd = await addGuest(createdEventId, {
      firstName: "Jill",
      lastName: "Valentine",
      email: "jill@example.com",
      rsvpStatus: "INVITED",
      plusOneAllowed: false,
    });
    expect(guestAdd.success).toBe(true);
    const guestId = guestAdd.guest!.id;

    const guestUpdate = await updateGuest(guestId, {
      lastName: "Valentine-Redfield",
      rsvpStatus: "ATTENDING",
      plusOneAllowed: true,
      plusOneName: "Carlos Oliveira",
      dietaryRequirements: "Gluten-Free",
    });
    expect(guestUpdate.success).toBe(true);

    event = await getEventById(createdEventId);
    const updatedGuest = event?.guests.find((g) => g.id === guestId);
    expect(updatedGuest?.lastName).toBe("Valentine-Redfield");
    expect(updatedGuest?.rsvpStatus).toBe("ATTENDING");
    expect(updatedGuest?.plusOneAllowed).toBe(true);
    expect(updatedGuest?.plusOneName).toBe("Carlos Oliveira");
    expect(updatedGuest?.dietaryRequirements).toBe("Gluten-Free");

    // 3. Vendor quote editing via updateVendorQuote
    const quoteSave = await saveVendorQuote(createdEventId, {
      vendorName: "Sonic Stage Rentals",
      category: "AV_EQUIPMENT",
      status: "QUOTE_RECEIVED",
      quotedAmount: 2200,
      depositRequired: 500,
    });
    expect(quoteSave.success).toBe(true);
    const vendorId = quoteSave.vendor!.id;

    const quoteUpdate = await updateVendorQuote(vendorId, {
      quotedAmount: 2000,
      depositRequired: 400,
      status: "CONTRACT_PENDING",
      notes: "Negotiated discount applied",
    });
    expect(quoteUpdate.success).toBe(true);

    event = await getEventById(createdEventId);
    const updatedQuote = event?.vendors.find((v) => v.id === vendorId);
    expect(updatedQuote?.quotedAmount).toBe(2000);
    expect(updatedQuote?.depositRequired).toBe(400);
    expect(updatedQuote?.status).toBe("CONTRACT_PENDING");
    expect(updatedQuote?.notes).toBe("Negotiated discount applied");

    // Clean up created items
    await deleteTask(taskId);
    await deleteGuest(guestId);
    await deleteVendorQuote(vendorId);
  });

  it("detects and rejects circular task dependencies, invalid references, and impossible schedules (BUG-06)", async () => {
    // Create Task A (due 25 days before) and Task B (due 20 days before)
    const taskARes = await addTask(createdEventId, {
      title: "Venue Contract Signing",
      daysBeforeEvent: 25,
    });
    const taskBRes = await addTask(createdEventId, {
      title: "Floorplan Draft Design",
      daysBeforeEvent: 20,
      dependsOnTaskIds: [taskARes.task!.id],
    });
    expect(taskARes.success).toBe(true);
    expect(taskBRes.success).toBe(true);

    // 1. Updating Task A to depend on Task B creates a cycle: A -> B -> A
    const cycleRes = await updateTask(taskARes.task!.id, {
      dependsOnTaskIds: [taskBRes.task!.id],
    });
    expect(cycleRes.success).toBe(false);
    expect(cycleRes.error).toContain("Circular task dependency detected");

    // 2. Self-dependency rejected
    const selfDepRes = await updateTask(taskARes.task!.id, {
      dependsOnTaskIds: [taskARes.task!.id],
    });
    expect(selfDepRes.success).toBe(false);
    expect(selfDepRes.error).toContain("Circular task dependency detected");

    // 3. Dependency on non-existent task ID rejected
    const nonExistentRes = await addTask(createdEventId, {
      title: "Bogus Task",
      daysBeforeEvent: 10,
      dependsOnTaskIds: ["non-existent-task-id-12345"],
    });
    expect(nonExistentRes.success).toBe(false);
    expect(nonExistentRes.error).toContain("Invalid task dependency");

    // 4. Infeasible schedule: dependent task due BEFORE its prerequisite
    // Task A is due 25 days before. Attempting to add Task C (due 30 days before, i.e. earlier) depending on Task A
    const infeasibleRes = await addTask(createdEventId, {
      title: "Premature Dependent Task",
      daysBeforeEvent: 30,
      dependsOnTaskIds: [taskARes.task!.id],
    });
    expect(infeasibleRes.success).toBe(false);
    expect(infeasibleRes.error).toContain("Schedule feasibility conflict");

    // Clean up
    await deleteTask(taskARes.task!.id);
    await deleteTask(taskBRes.task!.id);
  });

  it("enforces strict runtime Zod validation on server actions inputs (BUG-09)", async () => {
    // 1. Negative budget rejected
    const badEventRes = await createEvent({
      eventName: "Negative Budget Event",
      eventType: "CORPORATE",
      eventDate: "2026-12-01",
      location: "San Jose",
      guestCount: 50,
      totalBudget: -500,
      currency: "USD",
    });
    expect(badEventRes.success).toBe(false);

    // 2. Negative budget item unit cost rejected
    const badBudgetRes = await addBudgetItem(createdEventId, {
      category: "CATERING",
      description: "Invalid Negative Item",
      estimatedQuantity: 1,
      estimatedUnitCost: -100,
    });
    expect(badBudgetRes.success).toBe(false);

    // 3. Task with empty title rejected
    const badTaskRes = await addTask(createdEventId, {
      title: "",
      daysBeforeEvent: 10,
    });
    expect(badTaskRes.success).toBe(false);

    // 4. Vendor quote with negative deposit rejected
    const badVendorRes = await saveVendorQuote(createdEventId, {
      vendorName: "Invalid Vendor",
      category: "FLORIST",
      status: "QUOTE_RECEIVED",
      depositRequired: -150,
    });
    expect(badVendorRes.success).toBe(false);

    // 5. Guest with empty first name rejected
    const badGuestRes = await addGuest(createdEventId, {
      firstName: "",
      lastName: "Tester",
      rsvpStatus: "INVITED",
      plusOneAllowed: false,
    });
    expect(badGuestRes.success).toBe(false);
  });

  it("filters events by current user for tenant data isolation (BUG-04)", async () => {
    const events = await getEvents();
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
    const currentEvent = events.find((e) => e.id === createdEventId);
    expect(currentEvent).toBeDefined();
    expect(currentEvent?.userId).toBe("usr_demo_organizer_01");
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
});
