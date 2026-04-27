import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

vi.mock('next/link', () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }),
  usePathname: () => '/',
}));

const mockProducts = [
  {
    sku_id: "SKU1",
    part_name: "iPhone Screen",
    wholesale_price: 1000,
    moq: 1,
    stock_level: 10,
    image_url: null,
    quality_grade: "A",
    brand: "Apple",
    model: "iPhone X",
    generation: "2018",
    category: "Screen",
  },
  {
    sku_id: "SKU2",
    part_name: "Galaxy Battery",
    wholesale_price: 500,
    moq: 1,
    stock_level: 5,
    image_url: null,
    quality_grade: "B",
    brand: "Samsung",
    model: "Galaxy S9",
    generation: "2017",
    category: "Battery",
  },
];

vi.mock("@/lib/catalog", async () => {
  const original: any = await vi.importActual("@/lib/catalog");
  return {
    ...original,
    useCatalog: () => ({ data: mockProducts, isLoading: false, error: null }),
    buildCatalogTree: (ps: any) => {
      const tree: Record<string, Record<string, string[]>> = {};
      for (const p of ps) {
        if (!tree[p.brand]) tree[p.brand] = {};
        if (!tree[p.brand][p.model]) tree[p.brand][p.model] = [];
        if (!tree[p.brand][p.model].includes(p.generation)) tree[p.brand][p.model].push(p.generation);
      }
      return tree;
    },
    productMatchesQuery: (p: any, q: string) => {
      if (!q) return true;
      return (
        (p.part_name ?? "").toLowerCase().includes(q.toLowerCase()) ||
        (p.sku_id ?? "").toLowerCase().includes(q.toLowerCase())
      );
    },
  };
});

// Mock auth to avoid requiring AuthProvider in tests
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: null, loading: false, signOut: vi.fn() }),
}));

import Catalog from "@/pages/Catalog";

test("renders catalog and filters by search", () => {
  const qc = new QueryClient();
  render(
    <QueryClientProvider client={qc}>
        <Catalog />
    </QueryClientProvider>
  );

  // both products should render initially
  expect(screen.getByText("iPhone Screen")).toBeInTheDocument();
  expect(screen.getByText("Galaxy Battery")).toBeInTheDocument();

  const input = screen.getByLabelText("Search catalog by SKU or name");
  fireEvent.change(input, { target: { value: "iphone" } });

  // after searching, only the matching product remains
  expect(screen.getByText("iPhone Screen")).toBeInTheDocument();
  expect(screen.queryByText("Galaxy Battery")).toBeNull();
});
