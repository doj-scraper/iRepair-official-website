import { describe, it, expect } from "vitest";
import { productMatchesQuery } from "@/lib/catalog";

const product = {
  sku_id: "SM-G993U",
  part_name: "Front Screen G993",
  wholesale_price: 10,
  moq: 1,
  stock_level: 5,
  image_url: null,
  quality_grade: "A",
  brand: "Samsung",
  model: "SM-G993U",
  generation: "2022",
};

describe("productMatchesQuery", () => {
  it("matches model with various formats", () => {
    expect(productMatchesQuery(product as any, "G993")).toBe(true);
    expect(productMatchesQuery(product as any, "g993")).toBe(true);
    expect(productMatchesQuery(product as any, "SM G993 U")).toBe(true);
    expect(productMatchesQuery(product as any, "SM-G993-U")).toBe(true);
    expect(productMatchesQuery(product as any, "g99")).toBe(true);
    expect(productMatchesQuery(product as any, "samsung g993")).toBe(true);
  });

  it("does not match unrelated terms", () => {
    expect(productMatchesQuery(product as any, "iPhone")).toBe(false);
  });
});
