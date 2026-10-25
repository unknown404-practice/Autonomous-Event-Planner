import { describe, expect, it } from "vitest";

describe("Number Input Sanitization & Leading Zero Prevention", () => {
  // Logic from src/app/events/new/page.tsx:
  // const sanitized = value.replace(/^0+(?=\d)/, "");
  function sanitizeNumberInput(value: string): string {
    return value.replace(/^0+(?=\d)/, "");
  }

  it("strips leading zero when user types 1200 after a 0", () => {
    expect(sanitizeNumberInput("01200")).toBe("1200");
  });

  it("strips multiple leading zeros: 007 -> 7", () => {
    expect(sanitizeNumberInput("007")).toBe("7");
  });

  it("preserves standalone single zero: 0 -> 0", () => {
    expect(sanitizeNumberInput("0")).toBe("0");
  });

  it("preserves empty string: '' -> ''", () => {
    expect(sanitizeNumberInput("")).toBe("");
  });

  it("preserves clean numbers: 1200 -> 1200", () => {
    expect(sanitizeNumberInput("1200")).toBe("1200");
  });

  it("preserves numbers with internal zeros: 1005 -> 1005", () => {
    expect(sanitizeNumberInput("1005")).toBe("1005");
  });
});
