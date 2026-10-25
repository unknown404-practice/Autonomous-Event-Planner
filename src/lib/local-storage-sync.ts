// EventPilot AI - Browser LocalStorage & SQLite History Synchronization
// Guarantees each event's detailed history and state is securely mirrored in the user's browser localStorage

export interface LocalEventHistoryItem {
  id: string;
  eventName: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  status: string; // PLANNING, CONFIRMED, COMPLETED, CANCELLED
  syncedAt: string;
  themeOrStyle?: string | null;
  conceptTitle?: string;
  lastAction?: string;
  taskCount?: number;
  budgetCount?: number;
  guestCountPlanned?: number;
}

const STORAGE_KEY = "eventpilot_event_history";

function hasLocalStorage(): boolean {
  return typeof localStorage !== "undefined";
}

/**
 * Retrieve all event history entries saved in the user's browser localStorage.
 */
export function getLocalEventHistory(): LocalEventHistoryItem[] {
  if (!hasLocalStorage()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to read event history from localStorage:", err);
    return [];
  }
}

/**
 * Save or update a single event's detailed history snapshot in localStorage.
 */
export function saveEventToLocalHistory(event: any, lastAction?: string): void {
  if (!hasLocalStorage() || !event?.id) return;

  try {
    const existing = getLocalEventHistory();
    const filtered = existing.filter((item) => item.id !== event.id);

    let conceptTitle: string | undefined;
    if (event.concept?.title) {
      conceptTitle = event.concept.title;
    } else if (typeof event.conceptJson === "string") {
      try {
        const parsed = JSON.parse(event.conceptJson);
        conceptTitle = parsed?.title;
      } catch {
        // no-op
      }
    }

    const newItem: LocalEventHistoryItem = {
      id: event.id,
      eventName: event.eventName,
      eventType: event.eventType,
      eventDate: event.eventDate,
      location: event.location,
      guestCount: event.guestCount,
      totalBudget: event.totalBudget,
      currency: event.currency || "USD",
      status: event.status || "PLANNING",
      syncedAt: new Date().toISOString(),
      themeOrStyle: event.themeOrStyle || null,
      conceptTitle,
      lastAction: lastAction || (event.status === "CANCELLED" ? "EVENT_CANCELLED" : "EVENT_SYNCED"),
      taskCount: event._count?.tasks ?? (Array.isArray(event.tasks) ? event.tasks.length : undefined),
      budgetCount: event._count?.budgetItems ?? (Array.isArray(event.budgetItems) ? event.budgetItems.length : undefined),
      guestCountPlanned: event.guestCount,
    };

    const updated = [newItem, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save event to localStorage:", err);
  }
}

/**
 * Bulk sync an array of events from SQLite into browser localStorage.
 */
export function syncAllEventsToLocalHistory(events: any[]): void {
  if (!hasLocalStorage() || !Array.isArray(events)) return;

  try {
    const existingMap = new Map<string, LocalEventHistoryItem>();
    for (const item of getLocalEventHistory()) {
      existingMap.set(item.id, item);
    }

    for (const evt of events) {
      if (!evt?.id) continue;
      let conceptTitle = existingMap.get(evt.id)?.conceptTitle;
      if (typeof evt.conceptJson === "string") {
        try {
          const parsed = JSON.parse(evt.conceptJson);
          conceptTitle = parsed?.title || conceptTitle;
        } catch {
          // no-op
        }
      }

      existingMap.set(evt.id, {
        id: evt.id,
        eventName: evt.eventName,
        eventType: evt.eventType,
        eventDate: evt.eventDate,
        location: evt.location,
        guestCount: evt.guestCount,
        totalBudget: evt.totalBudget,
        currency: evt.currency || "USD",
        status: evt.status || "PLANNING",
        syncedAt: new Date().toISOString(),
        themeOrStyle: evt.themeOrStyle || null,
        conceptTitle,
        taskCount: evt._count?.tasks,
        budgetCount: evt._count?.budgetItems,
        guestCountPlanned: evt.guestCount,
      });
    }

    const merged = Array.from(existingMap.values()).sort(
      (a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime()
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn("Failed to sync events to localStorage:", err);
  }
}

/**
 * Remove an event completely from localStorage when permanently deleted.
 */
export function removeEventFromLocalHistory(eventId: string): void {
  if (!hasLocalStorage()) return;

  try {
    const existing = getLocalEventHistory();
    const filtered = existing.filter((item) => item.id !== eventId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn("Failed to remove event from localStorage:", err);
  }
}
