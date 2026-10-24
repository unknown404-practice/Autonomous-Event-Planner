import { describe, expect, it } from "vitest";
import {
  calculateBudgetItem,
  calculateBudgetSummary,
  formatCurrency,
  roundToTwoDecimals,
} from "../../src/lib/budget-math";
import { BudgetItemInput } from "../../src/lib/types";

describe("Decimal-Safe Budget Arithmetic", () => {
  it("rounds accurately to two decimals without floating point inaccuracies", () => {
    expect(roundToTwoDecimals(10.005)).toBe(10.01);
    expect(roundToTwoDecimals(19.994)).toBe(19.99);
    expect(roundToTwoDecimals(0)).toBe(0);
    expect(roundToTwoDecimals(NaN)).toBe(0);
    expect(roundToTwoDecimals(Infinity)).toBe(0);
  });

  it("calculates individual budget item subtotals, taxes, and balances", () => {
    const item: BudgetItemInput = {
      category: "CATERING",
      description: "Plated Dinner",
      estimatedQuantity: 100,
      estimatedUnitCost: 45.5,
      taxRatePercent: 8.5,
      additionalFees: 150.0,
      depositPaid: 1000.0,
    };

    const calculated = calculateBudgetItem(item);

    // 100 * 45.5 = 4550.00
    expect(calculated.estimatedSubtotal).toBe(4550.0);
    // 4550 * 0.085 = 386.75
    expect(calculated.taxAmount).toBe(386.75);
    // 4550 + 386.75 + 150 = 5086.75
    expect(calculated.estimatedTotal).toBe(5086.75);
    // 5086.75 - 1000 = 4086.75
    expect(calculated.balanceRemaining).toBe(4086.75);
  });

  it("prioritizes actualCost over estimatedTotal when actualCost is set", () => {
    const item: BudgetItemInput = {
      category: "VENUE",
      description: "Ballroom Rental",
      estimatedQuantity: 1,
      estimatedUnitCost: 3000,
      actualCost: 2800,
      depositPaid: 1000,
    };

    const calculated = calculateBudgetItem(item);
    expect(calculated.actualTotal).toBe(2800);
    expect(calculated.balanceRemaining).toBe(1800);
  });

  it("computes comprehensive budget summary and identifies over-budget status", () => {
    const items: BudgetItemInput[] = [
      {
        category: "VENUE",
        description: "Venue Hire",
        estimatedQuantity: 1,
        estimatedUnitCost: 4000,
        taxRatePercent: 10,
        depositPaid: 2000,
      },
      {
        category: "PHOTOGRAPHY",
        description: "Photo Package",
        estimatedQuantity: 1,
        estimatedUnitCost: 2000,
        depositPaid: 500,
      },
    ];

    const summary = calculateBudgetSummary(5000, items);

    // Venue: 4000 + 400 = 4400. Photo: 2000. Total = 6400.
    expect(summary.totalEstimated).toBe(6400);
    expect(summary.totalCommittedDeposits).toBe(2500);
    expect(summary.totalBudget).toBe(5000);
    // 5000 - 6400 = -1400
    expect(summary.variance).toBe(-1400);
    expect(summary.isOverBudget).toBe(true);
    expect(summary.categoryAllocations.VENUE.estimated).toBe(4400);
    expect(summary.categoryAllocations.PHOTOGRAPHY.estimated).toBe(2000);
  });

  it("correctly identifies under-budget status", () => {
    const items: BudgetItemInput[] = [
      {
        category: "DECORATION",
        description: "Floral Centerpieces",
        estimatedQuantity: 5,
        estimatedUnitCost: 100,
      },
    ];

    const summary = calculateBudgetSummary(1000, items);
    expect(summary.totalEstimated).toBe(500);
    expect(summary.remainingBudget).toBe(500);
    expect(summary.variance).toBe(500);
    expect(summary.isOverBudget).toBe(false);
  });

  it("handles empty items array gracefully", () => {
    const summary = calculateBudgetSummary(10000, []);
    expect(summary.totalEstimated).toBe(0);
    expect(summary.totalActual).toBe(0);
    expect(summary.remainingBudget).toBe(10000);
    expect(summary.isOverBudget).toBe(false);
  });

  it("formats currency strings cleanly", () => {
    expect(formatCurrency(1234.5, "USD", "en-US")).toBe("$1,234.50");
    expect(formatCurrency(0, "USD", "en-US")).toBe("$0.00");
  });
});
