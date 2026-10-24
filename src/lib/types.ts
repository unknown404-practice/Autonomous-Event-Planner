// EventPilot AI - Core Domain Types & Data Contracts

export type Provenance =
  | "USER_ENTERED"
  | "VERIFIED_EXTERNAL"
  | "APPLICATION_CALCULATED"
  | "AI_GENERATED"
  | "DETERMINISTIC_FALLBACK"
  | "SYNTHETIC_DEMO";

export type EventType =
  | "WEDDING"
  | "BIRTHDAY"
  | "ANNIVERSARY"
  | "CORPORATE"
  | "CONFERENCE"
  | "COMMUNITY"
  | "FESTIVAL"
  | "DINNER_PARTY"
  | "OTHER";

export type EventStatus =
  | "PLANNING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type TaskStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED"
  | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type VendorCategory =
  | "VENUE"
  | "CATERING"
  | "PHOTOGRAPHY"
  | "VIDEOGRAPHY"
  | "DECORATION"
  | "FLORIST"
  | "MUSIC_ENTERTAINMENT"
  | "TRANSPORTATION"
  | "ATTIRE_BEAUTY"
  | "STATIONERY"
  | "CAKE_BAKERY"
  | "SECURITY_STAFF"
  | "AV_EQUIPMENT"
  | "OTHER";

export type VendorStatus =
  | "IDENTIFIED"
  | "INQUIRY_SENT"
  | "QUOTE_RECEIVED"
  | "CONTRACT_PENDING"
  | "DEPOSIT_PAID"
  | "CONFIRMED"
  | "DECLINED";

export type RsvpStatus =
  | "INVITED"
  | "ATTENDING"
  | "DECLINED"
  | "TENTATIVE";

export interface BudgetItemInput {
  id?: string;
  category: VendorCategory;
  description: string;
  estimatedQuantity: number;
  estimatedUnitCost: number;
  taxRatePercent?: number; // e.g. 5 for 5%
  additionalFees?: number;
  actualCost?: number;
  depositPaid?: number;
  notes?: string;
  provenance?: Provenance;
}

export interface CalculatedBudgetItem extends Omit<BudgetItemInput, "depositPaid"> {
  depositPaid: number;
  estimatedSubtotal: number;
  taxAmount: number;
  estimatedTotal: number;
  actualTotal: number;
  balanceRemaining: number;
}

export interface CalculatedBudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  totalCommittedDeposits: number;
  remainingBudget: number;
  variance: number; // positive = under budget, negative = over budget
  isOverBudget: boolean;
  categoryAllocations: Record<
    VendorCategory,
    {
      estimated: number;
      actual: number;
      percentageOfBudget: number;
      itemCount: number;
    }
  >;
}

export interface TaskInput {
  id: string;
  title: string;
  description?: string;
  category: VendorCategory | "GENERAL";
  priority: TaskPriority;
  daysBeforeEvent: number; // relative scheduling
  estimatedDurationHours?: number;
  dependsOnTaskIds?: string[];
  status?: TaskStatus;
  assigneeName?: string;
  provenance?: Provenance;
}

export interface ScheduledTask extends TaskInput {
  dueDate: string; // ISO date string YYYY-MM-DD
  isOverdue: boolean;
  isBlocked: boolean;
  blockedByTitles?: string[];
}

export interface GuestInput {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  householdGroup?: string;
  dietaryRequirements?: string;
  accessibilityNeeds?: string;
  rsvpStatus: RsvpStatus;
  plusOneAllowed: boolean;
  plusOneName?: string;
  isAttendingPlusOne?: boolean;
}

export interface GuestSummary {
  totalGuests: number;
  attendingCount: number;
  declinedCount: number;
  tentativeCount: number;
  pendingCount: number;
  dietarySummary: Record<string, number>;
  accessibilitySummary: string[];
}

export interface VendorQuoteInput {
  id?: string;
  vendorName: string;
  category: VendorCategory;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: VendorStatus;
  quotedAmount?: number;
  depositRequired?: number;
  cancellationPolicy?: string;
  deliverables?: string[];
  notes?: string;
  provenance?: Provenance;
}

export interface PlanGenerationInput {
  eventName: string;
  eventType: EventType;
  eventDate: string; // YYYY-MM-DD
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  themeOrStyle?: string;
  formality?: "CASUAL" | "SEMI_FORMAL" | "FORMAL" | "BLACK_TIE";
  indoorOutdoor?: "INDOOR" | "OUTDOOR" | "HYBRID";
  culturalTraditions?: string;
  dietaryNotes?: string;
  specialConstraints?: string;
}

export interface GeneratedPlanOutput {
  concept: {
    title: string;
    tagline: string;
    themeDescription: string;
    colorPalette: Array<{ name: string; hex: string; role: string }>;
    stylingIdeas: string[];
    atmosphereAndVibe: string;
  };
  recommendedBudgetItems: Array<{
    category: VendorCategory;
    description: string;
    estimatedQuantity: number;
    estimatedUnitCost: number;
    priority: "ESSENTIAL" | "RECOMMENDED" | "OPTIONAL";
    costSavingTip?: string;
  }>;
  recommendedSchedule: Array<{
    id: string;
    title: string;
    description: string;
    category: VendorCategory | "GENERAL";
    priority: TaskPriority;
    daysBeforeEvent: number;
    dependsOnTaskIds: string[];
    phase: "EARLY_PLANNING" | "MID_PLANNING" | "FINAL_PREPARATION" | "EVENT_DAY" | "POST_EVENT";
  }>;
  vendorRequirements: Array<{
    category: VendorCategory;
    keyQuestionsToAsk: string[];
    criticalDeliverables: string[];
    redFlagsToAvoid: string[];
  }>;
  contingencies: Array<{
    riskScenario: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    mitigationStrategy: string;
  }>;
  provenance: Provenance;
  generatedAt: string;
}
