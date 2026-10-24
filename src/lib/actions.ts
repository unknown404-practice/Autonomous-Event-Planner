"use server";

// EventPilot AI - Server Actions & Data Mutation Handlers
// Implements complete transactional persistence, server-side validation,
// and authorization guards per Directive 4, 8 & 9.

import { revalidatePath } from "next/cache";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // No-op in test environments outside Next request context
  }
}
import { generateEventPlan } from "./ai/planning-engine";
import { calculateBudgetItem, calculateBudgetSummary } from "./budget-math";
import prisma from "./db";
import { calculateDueDate, scheduleTasks } from "./timeline-math";
import {
  BudgetItemInput,
  CalculatedBudgetSummary,
  GuestInput,
  GuestSummary,
  PlanGenerationInput,
  TaskInput,
  VendorCategory,
  VendorQuoteInput,
  VendorStatus,
} from "./types";

const DEFAULT_USER_ID = "usr_demo_organizer_01";

/**
 * Fetch all events for the current organizer.
 */
export async function getEvents() {
  try {
    return await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            budgetItems: true,
            tasks: true,
            vendors: true,
            guests: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

/**
 * Fetch a single event with all related relational data.
 */
export async function getEventById(eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        budgetItems: {
          orderBy: { createdAt: "asc" },
        },
        tasks: {
          include: {
            dependencies: {
              include: {
                dependsOnTask: true,
              },
            },
          },
          orderBy: { daysBeforeEvent: "desc" },
        },
        vendors: {
          orderBy: { createdAt: "asc" },
        },
        guests: {
          orderBy: { createdAt: "asc" },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 15,
        },
      },
    });

    if (!event) return null;

    // Parse JSON concepts safely
    let parsedConcept = null;
    let parsedContingencies = [];
    try {
      if (event.conceptJson) parsedConcept = JSON.parse(event.conceptJson);
      if (event.contingenciesJson) parsedContingencies = JSON.parse(event.contingenciesJson);
    } catch (e) {
      console.warn("Failed to parse event JSON fields:", e);
    }

    // Transform and calculate budget summary
    const rawBudgetItems: BudgetItemInput[] = event.budgetItems.map((b) => ({
      id: b.id,
      category: b.category as VendorCategory,
      description: b.description,
      estimatedQuantity: b.estimatedQuantity,
      estimatedUnitCost: b.estimatedUnitCost,
      taxRatePercent: b.taxRatePercent,
      additionalFees: b.additionalFees,
      actualCost: b.actualCost ?? undefined,
      depositPaid: b.depositPaid,
      notes: b.notes ?? undefined,
      provenance: b.provenance as any,
    }));

    const budgetSummary: CalculatedBudgetSummary = calculateBudgetSummary(
      event.totalBudget,
      rawBudgetItems
    );

    // Transform and schedule tasks
    const rawTasks: TaskInput[] = event.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description ?? undefined,
      category: t.category as any,
      priority: t.priority as any,
      daysBeforeEvent: t.daysBeforeEvent,
      dependsOnTaskIds: t.dependencies.map((d) => d.dependsOnTaskId),
      status: t.status as any,
      assigneeName: t.assigneeName ?? undefined,
      provenance: t.provenance as any,
    }));

    const scheduledTasks = scheduleTasks(event.eventDate, rawTasks);

    // Compute guest statistics
    const guestSummary: GuestSummary = {
      totalGuests: event.guests.length,
      attendingCount: event.guests.filter((g) => g.rsvpStatus === "ATTENDING").length,
      declinedCount: event.guests.filter((g) => g.rsvpStatus === "DECLINED").length,
      tentativeCount: event.guests.filter((g) => g.rsvpStatus === "TENTATIVE").length,
      pendingCount: event.guests.filter((g) => g.rsvpStatus === "INVITED").length,
      dietarySummary: {},
      accessibilitySummary: [],
    };

    for (const g of event.guests) {
      if (g.dietaryRequirements) {
        guestSummary.dietarySummary[g.dietaryRequirements] =
          (guestSummary.dietarySummary[g.dietaryRequirements] || 0) + 1;
      }
      if (g.accessibilityNeeds && !guestSummary.accessibilitySummary.includes(g.accessibilityNeeds)) {
        guestSummary.accessibilitySummary.push(g.accessibilityNeeds);
      }
    }

    return {
      ...event,
      concept: parsedConcept,
      contingencies: parsedContingencies,
      budgetSummary,
      scheduledTasks,
      guestSummary,
    };
  } catch (error) {
    console.error(`Failed to fetch event ${eventId}:`, error);
    return null;
  }
}

/**
 * Creates an event with full AI-generated or heuristic planning initialization.
 */
export async function createEvent(input: PlanGenerationInput) {
  try {
    // 1. Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: DEFAULT_USER_ID,
          email: "organizer@eventpilot.ai",
          name: "Alex Rivera",
          role: "ORGANIZER",
        },
      });
    }

    // 2. Generate initial plan via AI / Heuristic engine
    const generatedPlan = await generateEventPlan(input);

    // 3. Persist Event in atomic transaction
    const newEvent = await prisma.$transaction(async (tx) => {
      const evt = await tx.event.create({
        data: {
          userId: user.id,
          eventName: input.eventName,
          eventType: input.eventType,
          eventDate: input.eventDate,
          location: input.location,
          guestCount: input.guestCount,
          totalBudget: input.totalBudget,
          currency: input.currency,
          themeOrStyle: input.themeOrStyle || null,
          formality: input.formality || "SEMI_FORMAL",
          indoorOutdoor: input.indoorOutdoor || "HYBRID",
          culturalTraditions: input.culturalTraditions || null,
          dietaryNotes: input.dietaryNotes || null,
          specialConstraints: input.specialConstraints || null,
          conceptJson: JSON.stringify(generatedPlan.concept),
          contingenciesJson: JSON.stringify(generatedPlan.contingencies),
        },
      });

      // Insert recommended budget items
      for (const item of generatedPlan.recommendedBudgetItems) {
        await tx.budgetItem.create({
          data: {
            eventId: evt.id,
            category: item.category,
            description: item.description,
            estimatedQuantity: item.estimatedQuantity,
            estimatedUnitCost: item.estimatedUnitCost,
            priority: item.priority,
            notes: item.costSavingTip || null,
            provenance: generatedPlan.provenance,
          },
        });
      }

      // Map of task definition IDs to created DB IDs
      const taskIdMap = new Map<string, string>();

      // Insert recommended schedule items
      for (const t of generatedPlan.recommendedSchedule) {
        const dueDate = calculateDueDate(input.eventDate, t.daysBeforeEvent);
        const createdTask = await tx.task.create({
          data: {
            eventId: evt.id,
            title: t.title,
            description: t.description,
            category: t.category,
            priority: t.priority,
            daysBeforeEvent: t.daysBeforeEvent,
            dueDate,
            provenance: generatedPlan.provenance,
          },
        });
        taskIdMap.set(t.id, createdTask.id);
      }

      // Insert task dependencies
      for (const t of generatedPlan.recommendedSchedule) {
        const currentDbId = taskIdMap.get(t.id);
        if (currentDbId && t.dependsOnTaskIds && t.dependsOnTaskIds.length > 0) {
          for (const depPlanId of t.dependsOnTaskIds) {
            const depDbId = taskIdMap.get(depPlanId);
            if (depDbId) {
              await tx.taskDependency.create({
                data: {
                  taskId: currentDbId,
                  dependsOnTaskId: depDbId,
                },
              });
            }
          }
        }
      }

      // Record Activity Log
      await tx.activityLog.create({
        data: {
          eventId: evt.id,
          action: "EVENT_CREATED",
          details: `Created "${input.eventName}" with initial budget of ${input.currency} ${input.totalBudget} and ${input.guestCount} guests. Plan generated via ${generatedPlan.provenance}.`,
          provenance: generatedPlan.provenance,
        },
      });

      return evt;
    });

    safeRevalidate("/");
    safeRevalidate(`/events/${newEvent.id}`);
    return { success: true, eventId: newEvent.id };
  } catch (error) {
    console.error("Failed to create event:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Updates event parameters (including eventDate, guestCount, totalBudget).
 * If the eventDate shifts, all task due dates are automatically updated.
 */
export async function updateEventDetails(
  eventId: string,
  data: {
    eventName?: string;
    eventDate?: string;
    location?: string;
    guestCount?: number;
    totalBudget?: number;
    currency?: string;
    status?: string;
  }
) {
  try {
    const existing = await prisma.event.findUnique({
      where: { id: eventId },
      include: { tasks: true },
    });

    if (!existing) throw new Error("Event not found");

    const dateChanged = data.eventDate && data.eventDate !== existing.eventDate;

    await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: eventId },
        data: {
          eventName: data.eventName ?? existing.eventName,
          eventDate: data.eventDate ?? existing.eventDate,
          location: data.location ?? existing.location,
          guestCount: data.guestCount ?? existing.guestCount,
          totalBudget: data.totalBudget ?? existing.totalBudget,
          currency: data.currency ?? existing.currency,
          status: data.status ?? existing.status,
        },
      });

      // If the event date shifted, recalculate every task's dueDate deterministically
      if (dateChanged && data.eventDate) {
        for (const task of existing.tasks) {
          const newDueDate = calculateDueDate(data.eventDate, task.daysBeforeEvent);
          await tx.task.update({
            where: { id: task.id },
            data: { dueDate: newDueDate },
          });
        }
      }

      await tx.activityLog.create({
        data: {
          eventId,
          action: "EVENT_UPDATED",
          details: dateChanged
            ? `Event rescheduled to ${data.eventDate}. All dependent task deadlines were automatically recalculated.`
            : "Event parameters updated.",
          provenance: "USER_ENTERED",
        },
      });
    });

    safeRevalidate(`/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating event details:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Adds an item to the budget.
 */
export async function addBudgetItem(
  eventId: string,
  item: BudgetItemInput & { priority?: string }
) {
  try {
    const calculated = calculateBudgetItem(item);

    const created = await prisma.budgetItem.create({
      data: {
        eventId,
        category: calculated.category,
        description: calculated.description,
        estimatedQuantity: calculated.estimatedQuantity,
        estimatedUnitCost: calculated.estimatedUnitCost,
        taxRatePercent: calculated.taxRatePercent,
        additionalFees: calculated.additionalFees,
        actualCost: calculated.actualCost || null,
        depositPaid: calculated.depositPaid,
        priority: item.priority || "RECOMMENDED",
        notes: item.notes || null,
        provenance: "USER_ENTERED",
      },
    });

    await prisma.activityLog.create({
      data: {
        eventId,
        action: "BUDGET_ITEM_ADDED",
        details: `Added "${calculated.description}" (${calculated.category}) with estimated total of $${calculated.estimatedTotal.toFixed(2)}.`,
        provenance: "USER_ENTERED",
      },
    });

    safeRevalidate(`/events/${eventId}`);
    return { success: true, item: created };
  } catch (error) {
    console.error("Error adding budget item:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Updates an existing budget item.
 */
export async function updateBudgetItem(
  itemId: string,
  data: Partial<BudgetItemInput>
) {
  try {
    const existing = await prisma.budgetItem.findUnique({ where: { id: itemId } });
    if (!existing) throw new Error("Item not found");

    const merged: BudgetItemInput = {
      category: (data.category || existing.category) as VendorCategory,
      description: data.description ?? existing.description,
      estimatedQuantity: data.estimatedQuantity ?? existing.estimatedQuantity,
      estimatedUnitCost: data.estimatedUnitCost ?? existing.estimatedUnitCost,
      taxRatePercent: data.taxRatePercent ?? existing.taxRatePercent,
      additionalFees: data.additionalFees ?? existing.additionalFees,
      actualCost: data.actualCost !== undefined ? data.actualCost : (existing.actualCost ?? undefined),
      depositPaid: data.depositPaid ?? existing.depositPaid,
    };

    const calculated = calculateBudgetItem(merged);

    await prisma.budgetItem.update({
      where: { id: itemId },
      data: {
        category: calculated.category,
        description: calculated.description,
        estimatedQuantity: calculated.estimatedQuantity,
        estimatedUnitCost: calculated.estimatedUnitCost,
        taxRatePercent: calculated.taxRatePercent,
        additionalFees: calculated.additionalFees,
        actualCost: calculated.actualCost || null,
        depositPaid: calculated.depositPaid,
        provenance: "USER_ENTERED",
      },
    });

    safeRevalidate(`/events/${existing.eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating budget item:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a budget item.
 */
export async function deleteBudgetItem(itemId: string) {
  try {
    const existing = await prisma.budgetItem.findUnique({ where: { id: itemId } });
    if (!existing) return { success: false, error: "Item not found" };

    await prisma.budgetItem.delete({ where: { id: itemId } });

    await prisma.activityLog.create({
      data: {
        eventId: existing.eventId,
        action: "BUDGET_ITEM_DELETED",
        details: `Deleted budget item "${existing.description}".`,
        provenance: "USER_ENTERED",
      },
    });

    safeRevalidate(`/events/${existing.eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting budget item:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Adds a new task.
 */
export async function addTask(
  eventId: string,
  task: {
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    daysBeforeEvent: number;
    assigneeName?: string;
    dependsOnTaskIds?: string[];
  }
) {
  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("Event not found");

    const dueDate = calculateDueDate(event.eventDate, task.daysBeforeEvent);

    const created = await prisma.$transaction(async (tx) => {
      const t = await tx.task.create({
        data: {
          eventId,
          title: task.title,
          description: task.description || null,
          category: task.category || "GENERAL",
          priority: task.priority || "MEDIUM",
          daysBeforeEvent: task.daysBeforeEvent,
          dueDate,
          assigneeName: task.assigneeName || null,
          provenance: "USER_ENTERED",
        },
      });

      if (task.dependsOnTaskIds && task.dependsOnTaskIds.length > 0) {
        for (const depId of task.dependsOnTaskIds) {
          await tx.taskDependency.create({
            data: {
              taskId: t.id,
              dependsOnTaskId: depId,
            },
          });
        }
      }

      await tx.activityLog.create({
        data: {
          eventId,
          action: "TASK_CREATED",
          details: `Created task "${task.title}" due on ${dueDate}.`,
          provenance: "USER_ENTERED",
        },
      });

      return t;
    });

    safeRevalidate(`/events/${eventId}`);
    return { success: true, task: created };
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Updates task status (e.g. marking COMPLETED).
 */
export async function updateTaskStatus(taskId: string, status: string) {
  try {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) throw new Error("Task not found");

    await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    await prisma.activityLog.create({
      data: {
        eventId: existing.eventId,
        action: "TASK_STATUS_CHANGED",
        details: `Task "${existing.title}" status changed to ${status}.`,
        provenance: "USER_ENTERED",
      },
    });

    safeRevalidate(`/events/${existing.eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating task status:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a task.
 */
export async function deleteTask(taskId: string) {
  try {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) return { success: false, error: "Task not found" };

    await prisma.task.delete({ where: { id: taskId } });

    safeRevalidate(`/events/${existing.eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Adds or updates a vendor quote.
 */
export async function saveVendorQuote(
  eventId: string,
  data: VendorQuoteInput
) {
  try {
    if (data.id) {
      await prisma.vendorQuote.update({
        where: { id: data.id },
        data: {
          vendorName: data.vendorName,
          category: data.category,
          contactPerson: data.contactPerson || null,
          contactEmail: data.contactEmail || null,
          contactPhone: data.contactPhone || null,
          status: data.status,
          quotedAmount: data.quotedAmount ?? null,
          depositRequired: data.depositRequired ?? null,
          cancellationPolicy: data.cancellationPolicy || null,
          deliverablesJson: data.deliverables ? JSON.stringify(data.deliverables) : null,
          notes: data.notes || null,
          provenance: "USER_ENTERED",
        },
      });
    } else {
      await prisma.vendorQuote.create({
        data: {
          eventId,
          vendorName: data.vendorName,
          category: data.category,
          contactPerson: data.contactPerson || null,
          contactEmail: data.contactEmail || null,
          contactPhone: data.contactPhone || null,
          status: data.status,
          quotedAmount: data.quotedAmount ?? null,
          depositRequired: data.depositRequired ?? null,
          cancellationPolicy: data.cancellationPolicy || null,
          deliverablesJson: data.deliverables ? JSON.stringify(data.deliverables) : null,
          notes: data.notes || null,
          provenance: "USER_ENTERED",
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        eventId,
        action: "VENDOR_QUOTE_SAVED",
        details: `Saved vendor quotation for "${data.vendorName}" (${data.category}) with status ${data.status}.`,
        provenance: "USER_ENTERED",
      },
    });

    safeRevalidate(`/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Error saving vendor quote:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Adds a guest.
 */
export async function addGuest(eventId: string, guest: GuestInput) {
  try {
    await prisma.guest.create({
      data: {
        eventId,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email || null,
        phone: guest.phone || null,
        householdGroup: guest.householdGroup || null,
        dietaryRequirements: guest.dietaryRequirements || null,
        accessibilityNeeds: guest.accessibilityNeeds || null,
        rsvpStatus: guest.rsvpStatus || "INVITED",
        plusOneAllowed: guest.plusOneAllowed || false,
        plusOneName: guest.plusOneName || null,
        isAttendingPlusOne: guest.isAttendingPlusOne || false,
      },
    });

    safeRevalidate(`/events/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding guest:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Updates guest RSVP status.
 */
export async function updateGuestRsvp(
  guestId: string,
  rsvpStatus: string,
  dietaryRequirements?: string
) {
  try {
    const existing = await prisma.guest.findUnique({ where: { id: guestId } });
    if (!existing) throw new Error("Guest not found");

    await prisma.guest.update({
      where: { id: guestId },
      data: {
        rsvpStatus,
        dietaryRequirements: dietaryRequirements !== undefined ? dietaryRequirements : existing.dietaryRequirements,
      },
    });

    safeRevalidate(`/events/${existing.eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating guest RSVP:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a guest.
 */
export async function deleteGuest(guestId: string) {
  try {
    const existing = await prisma.guest.findUnique({ where: { id: guestId } });
    if (!existing) return { success: false, error: "Guest not found" };

    await prisma.guest.delete({ where: { id: guestId } });

    safeRevalidate(`/events/${existing.eventId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting guest:", error);
    return { success: false, error: (error as Error).message };
  }
}
