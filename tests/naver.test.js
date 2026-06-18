import { describe, it, expect } from "vitest";
import { stripTags, titleKey, dedupListings, priceStats, MIN_PRICE } from "../lib/naver.js";

describe("stripTags", () => {
  it("removes HTML tags", () => {
    expect(stripTags("<b>무선</b> 이어폰")).toBe("무선 이어폰");
  });
  it("decodes common entities and trims", () => {
    expect(stripTags("  A &amp; B &quot;C&quot;  ")).toBe('A & B "C"');
  });
  it("handles empty / undefined", () => {
    expect(stripTags()).toBe("");
    expect(stripTags("")).toBe("");
  });
});

describe("titleKey", () => {
  it("strips bracketed option labels", () => {
    expect(titleKey("클레어 미니 가습기 [단품]")).toBe(titleKey("클레어 미니 가습기 (정품)"));
  });
  it("removes noise tokens and special chars", () => {
    expect(titleKey("샤오미 가습기!! 무료배송")).toBe("샤오미 가습기");
  });
  it("lowercases ascii", () => {
    expect(titleKey("MNS Bottle")).toBe("mns bottle");
  });
  it("keeps genuinely different titles distinct", () => {
    expect(titleKey("샤오미 가습기 2세대")).not.toBe(titleKey("샤오미 가습기 3세대"));
  });
});

describe("dedupListings", () => {
  it("collapses same normalized title", () => {
    const out = dedupListings([
      { title: "가습기 [단품]", image: "a.jpg", productId: "1" },
      { title: "가습기 (정품)", image: "b.jpg", productId: "2" },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].productId).toBe("1"); // 첫 항목 유지
  });
  it("collapses identical image even if title differs", () => {
    const out = dedupListings([
      { title: "가습기 화이트", image: "same.jpg", productId: "1" },
      { title: "MNS 가습기 화이트 풀세트", image: "same.jpg", productId: "2" },
    ]);
    expect(out).toHaveLength(1);
  });
  it("keeps distinct products", () => {
    const out = dedupListings([
      { title: "가습기", image: "a.jpg", productId: "1" },
      { title: "공기청정기", image: "b.jpg", productId: "2" },
    ]);
    expect(out).toHaveLength(2);
  });
  it("handles empty input", () => {
    expect(dedupListings()).toEqual([]);
    expect(dedupListings([])).toEqual([]);
  });
});

describe("priceStats", () => {
  it("computes min/max/avg over lprice", () => {
    const s = priceStats([{ lprice: 1000 }, { lprice: 3000 }, { lprice: 2000 }]);
    expect(s).toMatchObject({ count: 3, min: 1000, max: 3000, avg: 2000 });
  });
  it("returns nulls when no valid prices", () => {
    const s = priceStats([{ lprice: null }]);
    expect(s).toMatchObject({ count: 1, min: null, max: null, avg: null });
  });
});

describe("MIN_PRICE", () => {
  it("is the 1000원 censorship floor", () => {
    expect(MIN_PRICE).toBe(1000);
  });
});
