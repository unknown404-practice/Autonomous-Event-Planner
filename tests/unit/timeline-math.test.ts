import { describe, expect, it } from "vitest";
import {
  calculateDueDate,
  detectDependencyCycle,
  rescheduleEvent,
  scheduleTasks,
  validateScheduleFeasibility,
} from "../../src/lib/timeline-math";
import { TaskInput } from "../../src/lib/types";

describe("Date-Aware Scheduling & Dependency Engine", () => {
  it("calculates due dates relative to the event date correctly", () => {
    const eventDate = "2026-12-31";
    // 30 days before Dec 31 is Dec 01
    expect(calculateDueDate(eventDate, 30)).toBe("2026-12-01");
    // 0 days before is Dec 31
    expect(calculateDueDate(eventDate, 0)).toBe("2026-12-31");
    // -2 days is Jan 02, 2027
    expect(calculateDueDate(eventDate, -2)).toBe("2027-01-02");
  });

  it("detects overdue tasks when due date precedes the reference date", () => {
    const tasks: TaskInput[] = [
      {
        id: "t1",
        title: "Book Venue",
        category: "VENUE",
        priority: "CRITICAL",
        daysBeforeEvent: 90,
        status: "NOT_STARTED",
      },
      {
        id: "t2",
        title: "Send Invites",
        category: "GENERAL",
        priority: "HIGH",
        daysBeforeEvent: 10,
        status: "NOT_STARTED",
      },
    ];

    // Event is 2026-10-01. t1 due 90 days before = 2026-07-03.
    // If today is 2026-08-01: t1 is overdue! t2 is due 2026-09-21, so t2 is not overdue.
    const scheduled = scheduleTasks("2026-10-01", tasks, "2026-08-01");

    const t1 = scheduled.find((t) => t.id === "t1")!;
    const t2 = scheduled.find((t) => t.id === "t2")!;

    expect(t1.isOverdue).toBe(true);
    expect(t2.isOverdue).toBe(false);
  });

  it("flags tasks as blocked when their prerequisites are not completed", () => {
    const tasks: TaskInput[] = [
      {
        id: "t1",
        title: "Sign Venue Lease",
        category: "VENUE",
        priority: "CRITICAL",
        daysBeforeEvent: 60,
        status: "IN_PROGRESS",
      },
      {
        id: "t2",
        title: "Book Caterer",
        category: "CATERING",
        priority: "HIGH",
        daysBeforeEvent: 45,
        dependsOnTaskIds: ["t1"],
        status: "NOT_STARTED",
      },
    ];

    const scheduled = scheduleTasks("2026-12-01", tasks);
    const t2 = scheduled.find((t) => t.id === "t2")!;

    expect(t2.isBlocked).toBe(true);
    expect(t2.status).toBe("BLOCKED");
    expect(t2.blockedByTitles).toContain("Sign Venue Lease");
  });

  it("unblocks task once prerequisite is completed", () => {
    const tasks: TaskInput[] = [
      {
        id: "t1",
        title: "Sign Venue Lease",
        category: "VENUE",
        priority: "CRITICAL",
        daysBeforeEvent: 60,
        status: "COMPLETED",
      },
      {
        id: "t2",
        title: "Book Caterer",
        category: "CATERING",
        priority: "HIGH",
        daysBeforeEvent: 45,
        dependsOnTaskIds: ["t1"],
        status: "NOT_STARTED",
      },
    ];

    const scheduled = scheduleTasks("2026-12-01", tasks);
    const t2 = scheduled.find((t) => t.id === "t2")!;

    expect(t2.isBlocked).toBe(false);
    expect(t2.status).toBe("NOT_STARTED");
  });

  it("identifies dependency cycles in task definitions", () => {
    const cyclicTasks = [
      { id: "A", dependsOnTaskIds: ["B"] },
      { id: "B", dependsOnTaskIds: ["C"] },
      { id: "C", dependsOnTaskIds: ["A"] },
    ];

    const result = detectDependencyCycle(cyclicTasks);
    expect(result.hasCycle).toBe(true);
  });

  it("confirms acyclic task graph has no cycles", () => {
    const validTasks = [
      { id: "A", dependsOnTaskIds: [] },
      { id: "B", dependsOnTaskIds: ["A"] },
      { id: "C", dependsOnTaskIds: ["A", "B"] },
    ];

    const result = detectDependencyCycle(validTasks);
    expect(result.hasCycle).toBe(false);
  });

  it("detects impossible scheduling where dependent task is due before prerequisite", () => {
    const tasks: TaskInput[] = [
      {
        id: "t1",
        title: "Venue Contract",
        category: "VENUE",
        priority: "CRITICAL",
        daysBeforeEvent: 30, // Due 30 days before event
      },
      {
        id: "t2",
        title: "Send Invitations With Venue Address",
        category: "GENERAL",
        priority: "HIGH",
        daysBeforeEvent: 60, // Due 60 days before event (BEFORE venue contract!)
        dependsOnTaskIds: ["t1"],
      },
    ];

    const validation = validateScheduleFeasibility("2026-12-01", tasks);
    expect(validation.isFeasible).toBe(false);
    expect(validation.conflicts.length).toBeGreaterThan(0);
    expect(validation.conflicts[0]).toContain('Task "Send Invitations With Venue Address"');
  });

  it("shifts all task due dates smoothly when the event date is rescheduled", () => {
    const tasks: TaskInput[] = [
      {
        id: "t1",
        title: "Setup Run Sheet",
        category: "GENERAL",
        priority: "HIGH",
        daysBeforeEvent: 10,
      },
    ];

    const originalScheduled = scheduleTasks("2026-06-20", tasks);
    expect(originalScheduled[0].dueDate).toBe("2026-06-10");

    const rescheduled = rescheduleEvent("2026-08-20", tasks);
    expect(rescheduled[0].dueDate).toBe("2026-08-10");
  });
});
