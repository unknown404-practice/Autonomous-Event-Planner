// EventPilot AI - Date-Aware Scheduling & Dependency Engine
// Adheres strictly to Directive 7 (Timeline controls and deterministic dependency validation)

import { ScheduledTask, TaskInput, TaskStatus } from "./types";

/**
 * Normalizes an ISO date string to midnight UTC to prevent subtle off-by-one timezone shifting.
 */
export function normalizeDate(dateInput: string | Date): Date {
  const d = typeof dateInput === "string" ? new Date(dateInput) : new Date(dateInput.getTime());
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date provided: ${dateInput}`);
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Formats a Date object to YYYY-MM-DD string.
 */
export function formatDateISO(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates a task's due date given the event date and days before event.
 * daysBeforeEvent = 30 means due 30 days before event date.
 * daysBeforeEvent = 0 means due on event date.
 * daysBeforeEvent = -1 means due 1 day after event date.
 */
export function calculateDueDate(eventDateISO: string, daysBeforeEvent: number): string {
  const eventDate = normalizeDate(eventDateISO);
  const targetDate = new Date(eventDate.getTime());
  targetDate.setUTCDate(targetDate.getUTCDate() - daysBeforeEvent);
  return formatDateISO(targetDate);
}

/**
 * Checks for circular dependencies in task graphs using depth-first search.
 * Returns true if cycle exists, plus cycle path description.
 */
export function detectDependencyCycle(
  tasks: Array<{ id: string; dependsOnTaskIds?: string[] }>
): { hasCycle: boolean; cyclePath?: string[] } {
  const graph = new Map<string, string[]>();
  for (const t of tasks) {
    graph.set(t.id, t.dependsOnTaskIds || []);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        path.push(neighbor);
        return true;
      }
    }

    recursionStack.delete(node);
    path.pop();
    return false;
  }

  for (const taskId of graph.keys()) {
    if (!visited.has(taskId)) {
      if (dfs(taskId)) {
        return { hasCycle: true, cyclePath: path };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Schedules all tasks against the event date and reference date (today).
 * Computes overdue status, blocked status, and identifies unmet dependencies.
 */
export function scheduleTasks(
  eventDateISO: string,
  tasks: TaskInput[],
  currentDateISO?: string
): ScheduledTask[] {
  const referenceDate = currentDateISO
    ? normalizeDate(currentDateISO)
    : normalizeDate(new Date().toISOString().split("T")[0]);

  const taskMap = new Map<string, TaskInput>();
  for (const t of tasks) {
    taskMap.set(t.id, t);
  }

  return tasks.map((task) => {
    const dueDate = calculateDueDate(eventDateISO, task.daysBeforeEvent);
    const dueDateObj = normalizeDate(dueDate);

    const status: TaskStatus = task.status || "NOT_STARTED";
    const isCompleted = status === "COMPLETED";

    // Overdue check: past due date and not completed
    const isOverdue = !isCompleted && dueDateObj.getTime() < referenceDate.getTime();

    // Dependency check: are all tasks in dependsOnTaskIds completed?
    const blockedByTitles: string[] = [];
    if (task.dependsOnTaskIds && task.dependsOnTaskIds.length > 0) {
      for (const depId of task.dependsOnTaskIds) {
        const depTask = taskMap.get(depId);
        if (depTask && depTask.status !== "COMPLETED") {
          blockedByTitles.push(depTask.title);
        }
      }
    }

    const isBlocked = blockedByTitles.length > 0 && status !== "COMPLETED";

    return {
      ...task,
      status: isBlocked && status === "NOT_STARTED" ? "BLOCKED" : status,
      dueDate,
      isOverdue,
      isBlocked,
      blockedByTitles: blockedByTitles.length > 0 ? blockedByTitles : undefined,
    };
  });
}

/**
 * Validates whether any dependent task has an impossible timeline
 * (i.e. due before the prerequisite task it depends on).
 */
export function validateScheduleFeasibility(
  eventDateISO: string,
  tasks: TaskInput[]
): { isFeasible: boolean; conflicts: string[] } {
  const conflicts: string[] = [];
  const scheduled = scheduleTasks(eventDateISO, tasks);
  const scheduledMap = new Map<string, ScheduledTask>();

  for (const s of scheduled) {
    scheduledMap.set(s.id, s);
  }

  for (const s of scheduled) {
    if (s.dependsOnTaskIds) {
      for (const depId of s.dependsOnTaskIds) {
        const dep = scheduledMap.get(depId);
        if (dep) {
          const depDue = normalizeDate(dep.dueDate);
          const taskDue = normalizeDate(s.dueDate);

          // If prerequisite is due strictly AFTER this task, that's impossible
          if (depDue.getTime() > taskDue.getTime()) {
            conflicts.push(
              `Task "${s.title}" is due on ${s.dueDate}, before its prerequisite "${dep.title}" due on ${dep.dueDate}.`
            );
          }
        }
      }
    }
  }

  return {
    isFeasible: conflicts.length === 0,
    conflicts,
  };
}

/**
 * Recalculates all task schedules when the master event date shifts.
 */
export function rescheduleEvent(
  newEventDateISO: string,
  tasks: TaskInput[],
  currentDateISO?: string
): ScheduledTask[] {
  return scheduleTasks(newEventDateISO, tasks, currentDateISO);
}
