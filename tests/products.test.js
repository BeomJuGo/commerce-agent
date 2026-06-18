import { describe, it, expect } from "vitest";
import { productKey } from "../lib/products.js";

describe("productKey", () => {
  it("uses productId when present", () => {
    expect(productKey({ productId: "12345", link: "https://x" })).toBe("12345");
  });
  it("falls back to base64url of link", () => {
    const link = "https://search.shopping.naver.com/catalog/abc?q=1";
    const expected = Buffer.from(link).toString("base64url");
    expect(productKey({ link })).toBe(expected);
  });
  it("base64url has no +/= chars (URL-safe)", () => {
    const key = productKey({ link: "https://a.b/c?d=e&f=g+h" });
    expect(key).not.toMatch(/[+/=]/);
  });
  it("handles missing fields", () => {
    expect(productKey({})).toBe("");
    expect(productKey()).toBe("");
  });
});
