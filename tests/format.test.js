import { describe, it, expect } from "vitest";
import { formatPrice } from "../lib/format.js";

describe("formatPrice", () => {
  it("formats numbers with ko-KR grouping + 원", () => {
    expect(formatPrice(1000)).toBe("1,000원");
    expect(formatPrice(1234567)).toBe("1,234,567원");
  });
  it("coerces numeric strings", () => {
    expect(formatPrice("5000")).toBe("5,000원");
  });
  it("returns fallback for null/undefined/NaN", () => {
    expect(formatPrice(null)).toBe("가격정보 없음");
    expect(formatPrice(undefined)).toBe("가격정보 없음");
    expect(formatPrice("abc")).toBe("가격정보 없음");
  });
  it("handles zero", () => {
    expect(formatPrice(0)).toBe("0원");
  });
});
