import { describe, expect, it, beforeEach, afterAll } from "vitest";
import prisma from "../../src/lib/db";
import { cancelEvent, reactivateEvent, deleteEvent } from "../../src/lib/actions";
import {
  getLocalEventHistory,
  saveEventToLocalHistory,
  syncAllEventsToLocalHistory,
  removeEventFromLocalHistory,
} from "../../src/lib/local-storage-sync";

// Mock browser localStorage for Node test runner
const localStorageStore: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => localStorageStore[key] || null,
  setItem: (key: string, value: string) => {
    localStorageStore[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageStore[key];
  },
  clear: () => {
    for (const key in localStorageStore) delete localStorageStore[key];
  },
  length: 0,
  key: () => null,
};

describe("Cancel Event & SQLite Database / LocalStorage History", () => {
  const testEventId = "test_cancel_flow_event_999";
  const testUserId = "usr_demo_organizer_01";

  beforeEach(() => {
    localStorage.clear();
  });

  afterAll(async () => {
    // Clean engineering: Always teardown test records to prevent db pollution
    try {
      await prisma.event.deleteMany({
        where: { id: testEventId },
      });
    } catch {
      // Ignore if already deleted
    }
  });

  it("marks event as CANCELLED in SQLite and preserves full activity log audit trail", async () => {
    // 1. Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: testUserId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: testUserId,
          email: "organizer@eventpilot.ai",
          name: "Alex Rivera",
        },
      });
    }

    // 2. Create test event in SQLite
    await prisma.event.create({
      data: {
        id: testEventId,
        userId: user.id,
        eventName: "Summer Lakeside Banquet",
        eventType: "DINNER_PARTY",
        eventDate: "2026-08-15",
        location: "Lake Tahoe, CA",
        guestCount: 60,
        totalBudget: 15000,
        currency: "USD",
        status: "PLANNING",
      },
    });

    // 3. Cancel the event with reason
    const cancelRes = await cancelEvent(
      testEventId,
      "Postponed due to client venue rescheduling"
    );
    expect(cancelRes.success).toBe(true);

    // 4. Verify status is CANCELLED in SQLite
    const fetched = await prisma.event.findUnique({
      where: { id: testEventId },
      include: { activityLogs: true },
    });
    expect(fetched).not.toBeNull();
    expect(fetched?.status).toBe("CANCELLED");

    // 5. Verify ActivityLog recorded in SQLite
    const cancelLog = fetched?.activityLogs.find((l) => l.action === "EVENT_CANCELLED");
    expect(cancelLog).toBeDefined();
    expect(cancelLog?.details).toContain("Postponed due to client venue rescheduling");

    // 6. Test Reactivation
    const reactivateRes = await reactivateEvent(testEventId);
    expect(reactivateRes.success).toBe(true);

    const reactivated = await prisma.event.findUnique({
      where: { id: testEventId },
      include: { activityLogs: true },
    });
    expect(reactivated?.status).toBe("PLANNING");
    const reactivateLog = reactivated?.activityLogs.find((l) => l.action === "EVENT_REACTIVATED");
    expect(reactivateLog).toBeDefined();
  });

  it("stores and synchronizes complete event detailed history in localStorage", () => {
    const sampleEvent = {
      id: "evt_local_01",
      eventName: "Pacific Coast Anniversary",
      eventType: "ANNIVERSARY",
      eventDate: "2026-10-10",
      location: "Carmel, CA",
      guestCount: 45,
      totalBudget: 12000,
      currency: "USD",
      status: "PLANNING",
      concept: { title: "Ocean Breeze Romance" },
      tasks: [{ id: "t1" }, { id: "t2" }],
      budgetItems: [{ id: "b1" }],
    };

    // Save to local history
    saveEventToLocalHistory(sampleEvent, "EVENT_CREATED");

    let history = getLocalEventHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe("evt_local_01");
    expect(history[0].eventName).toBe("Pacific Coast Anniversary");
    expect(history[0].status).toBe("PLANNING");
    expect(history[0].conceptTitle).toBe("Ocean Breeze Romance");
    expect(history[0].taskCount).toBe(2);

    // Update with CANCELLED status
    saveEventToLocalHistory({ ...sampleEvent, status: "CANCELLED" }, "EVENT_CANCELLED");
    history = getLocalEventHistory();
    expect(history.length).toBe(1);
    expect(history[0].status).toBe("CANCELLED");
    expect(history[0].lastAction).toBe("EVENT_CANCELLED");

    // Remove from local history
    removeEventFromLocalHistory("evt_local_01");
    history = getLocalEventHistory();
    expect(history.length).toBe(0);
  });

  it("bulk synchronizes multiple SQLite events to browser localStorage", () => {
    const dbEvents = [
      {
        id: "evt_bulk_1",
        eventName: "Tech Summit 2026",
        eventType: "CONFERENCE",
        eventDate: "2026-09-01",
        location: "Seattle, WA",
        guestCount: 200,
        totalBudget: 40000,
        currency: "USD",
        status: "PLANNING",
        _count: { tasks: 12, budgetItems: 8 },
      },
      {
        id: "evt_bulk_2",
        eventName: "Autumn Charity Gala",
        eventType: "COMMUNITY",
        eventDate: "2026-11-15",
        location: "Chicago, IL",
        guestCount: 150,
        totalBudget: 35000,
        currency: "USD",
        status: "CANCELLED",
        _count: { tasks: 5, budgetItems: 4 },
      },
    ];

    syncAllEventsToLocalHistory(dbEvents);

    const history = getLocalEventHistory();
    expect(history.length).toBe(2);
    expect(history.find((e) => e.id === "evt_bulk_1")?.status).toBe("PLANNING");
    expect(history.find((e) => e.id === "evt_bulk_2")?.status).toBe("CANCELLED");
  });
});
