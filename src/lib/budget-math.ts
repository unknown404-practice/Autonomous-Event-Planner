// EventPilot AI - Decimal-Safe Budget & Financial Calculation Engine
// Adheres strictly to Directive 7 (Financial and Scheduling Correctness)

import {
  BudgetItemInput,
  CalculatedBudgetItem,
  CalculatedBudgetSummary,
  VendorCategory,
} from "./types";

/**
 * Standard rounding to 2 decimal places to prevent floating-point anomalies.
 * Uses Math.round with epsilon offset for deterministic precision.
 */
export function roundToTwoDecimals(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return 0;
  }
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Validates and calculates financial figures for a single budget item.
 */
export function calculateBudgetItem(item: BudgetItemInput): CalculatedBudgetItem {
  const qty = Math.max(0, Number(item.estimatedQuantity) || 0);
  const unitCost = Math.max(0, Number(item.estimatedUnitCost) || 0);
  const taxRate = Math.max(0, Number(item.taxRatePercent) || 0);
  const additionalFees = Math.max(0, Number(item.additionalFees) || 0);
  const actualCost = item.actualCost !== undefined && item.actualCost !== null ? Math.max(0, Number(item.actualCost)) : 0;
  const depositPaid = Math.max(0, Number(item.depositPaid) || 0);

  const estimatedSubtotal = roundToTwoDecimals(qty * unitCost);
  const taxAmount = roundToTwoDecimals((estimatedSubtotal * taxRate) / 100);
  const estimatedTotal = roundToTwoDecimals(estimatedSubtotal + taxAmount + additionalFees);

  // If actual cost is set, that represents the finalized total liability.
  // Otherwise, estimatedTotal is used as the current liability.
  const effectiveTotal = actualCost > 0 ? actualCost : estimatedTotal;
  const balanceRemaining = roundToTwoDecimals(Math.max(0, effectiveTotal - depositPaid));

  return {
    ...item,
    estimatedQuantity: qty,
    estimatedUnitCost: unitCost,
    taxRatePercent: taxRate,
    additionalFees,
    actualCost,
    depositPaid,
    estimatedSubtotal,
    taxAmount,
    estimatedTotal,
    actualTotal: actualCost,
    balanceRemaining,
  };
}

/**
 * Computes deterministic aggregated financial metrics across all budget items.
 * Ensures estimated, actual, committed deposits, and variances are accurately separated.
 */
export function calculateBudgetSummary(
  totalBudget: number,
  items: BudgetItemInput[]
): CalculatedBudgetSummary {
  const safeTotalBudget = Math.max(0, Number(totalBudget) || 0);

  let totalEstimated = 0;
  let totalActual = 0;
  let totalCommittedDeposits = 0;

  const initialCategories: Record<
    VendorCategory,
    { estimated: number; actual: number; percentageOfBudget: number; itemCount: number }
  > = {
    VENUE: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    CATERING: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    PHOTOGRAPHY: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    VIDEOGRAPHY: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    DECORATION: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    FLORIST: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    MUSIC_ENTERTAINMENT: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    TRANSPORTATION: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    ATTIRE_BEAUTY: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    STATIONERY: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    CAKE_BAKERY: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    SECURITY_STAFF: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    AV_EQUIPMENT: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
    OTHER: { estimated: 0, actual: 0, percentageOfBudget: 0, itemCount: 0 },
  };

  const calculatedItems = items.map(calculateBudgetItem);

  for (const item of calculatedItems) {
    totalEstimated += item.estimatedTotal;
    totalActual += item.actualTotal;
    totalCommittedDeposits += item.depositPaid || 0;

    const cat = item.category in initialCategories ? item.category : "OTHER";
    initialCategories[cat].estimated += item.estimatedTotal;
    initialCategories[cat].actual += item.actualTotal;
    initialCategories[cat].itemCount += 1;
  }

  totalEstimated = roundToTwoDecimals(totalEstimated);
  totalActual = roundToTwoDecimals(totalActual);
  totalCommittedDeposits = roundToTwoDecimals(totalCommittedDeposits);

  // Compute category percentages
  for (const cat of Object.keys(initialCategories) as VendorCategory[]) {
    initialCategories[cat].estimated = roundToTwoDecimals(initialCategories[cat].estimated);
    initialCategories[cat].actual = roundToTwoDecimals(initialCategories[cat].actual);
    initialCategories[cat].percentageOfBudget =
      safeTotalBudget > 0
        ? roundToTwoDecimals((initialCategories[cat].estimated / safeTotalBudget) * 100)
        : 0;
  }

  // The operational cost basis: actual costs for finalized items, estimated for unfinalized
  const activeSpendBasis = totalActual > 0 ? totalActual : totalEstimated;
  const remainingBudget = roundToTwoDecimals(safeTotalBudget - activeSpendBasis);
  const variance = roundToTwoDecimals(safeTotalBudget - totalEstimated);
  const isOverBudget = activeSpendBasis > safeTotalBudget;

  return {
    totalBudget: roundToTwoDecimals(safeTotalBudget),
    totalEstimated,
    totalActual,
    totalCommittedDeposits,
    remainingBudget,
    variance,
    isOverBudget,
    categoryAllocations: initialCategories,
  };
}

/**
 * Formats a monetary amount with currency symbol and localized formatting.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "USD",
  locale: string = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${currencyCode} ${(amount || 0).toFixed(2)}`;
  }
}
