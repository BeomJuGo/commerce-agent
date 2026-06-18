import { describe, it, expect } from "vitest";
import {
  recommendSchema,
  reviewSchema,
  sourcingSchema,
  linksPostSchema,
  loginSchema,
} from "../lib/schemas.js";

describe("recommendSchema", () => {
  it("accepts valid situation + optional budget", () => {
    const r = recommendSchema.safeParse({ situation: "캠핑 의자", budget: "50000" });
    expect(r.success).toBe(true);
    expect(r.data.budget).toBe(50000); // 문자열 강제 변환
  });
  it("rejects too-short situation", () => {
    expect(recommendSchema.safeParse({ situation: "x" }).success).toBe(false);
  });
  it("rejects non-positive budget", () => {
    expect(recommendSchema.safeParse({ situation: "캠핑 의자", budget: -1 }).success).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("requires productName >= 2 chars", () => {
    expect(reviewSchema.safeParse({ productName: "가습기" }).success).toBe(true);
    expect(reviewSchema.safeParse({ productName: "" }).success).toBe(false);
  });
});

describe("sourcingSchema", () => {
  it("requires category or keyword", () => {
    expect(sourcingSchema.safeParse({}).success).toBe(false);
    expect(sourcingSchema.safeParse({ keyword: "캠핑" }).success).toBe(true);
  });
  it("bounds marginTarget to 0..100", () => {
    expect(sourcingSchema.safeParse({ keyword: "캠핑", marginTarget: 30 }).success).toBe(true);
    expect(sourcingSchema.safeParse({ keyword: "캠핑", marginTarget: 150 }).success).toBe(false);
  });
});

describe("linksPostSchema", () => {
  it("requires an http(s) url", () => {
    expect(linksPostSchema.safeParse({ url: "https://coupang.com/p/1" }).success).toBe(true);
    expect(linksPostSchema.safeParse({ url: "not-a-url" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password", () => {
    expect(loginSchema.safeParse({ password: "admin" }).success).toBe(true);
    expect(loginSchema.safeParse({ password: "" }).success).toBe(false);
  });
});
