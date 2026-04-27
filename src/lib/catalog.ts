import { useQuery } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

type CatalogQueryRow = Tables<"inventory"> & {
  models: {
    marketing_name: string | null;
    generation: string | null;
    brands: { name: string } | null;
  } | null;
  categories: { name: string } | null;
};

export type CatalogProduct = {
  sku_id: string;
  part_name: string | null;
  wholesale_price: number | null;
  moq: number;
  stock_level: number;
  image_url: string | null;
  quality_grade: string | null;
  brand: string;
  model: string;
  generation: string;
  category: string;
};

// useCatalog fetches inventory with joined model/brand/category info and normalizes the result
export const useCatalog = () =>
  useQuery({
    queryKey: ["catalog"],
    queryFn: async (): Promise<CatalogProduct[]> => {
      // Query inventory with deep joins for models, brands, and categories
      const { getSupabaseClient } = await import("@/integrations/supabase/client");
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from("inventory")
        .select(`
          sku_id,
          part_name,
          wholesale_price,
          moq,
          stock_level,
          image_url,
          quality_grade,
          models!inner ( marketing_name, generation, brands!inner ( name ) ),
          categories!inner ( name )
        `)
        .order("sku_id");

      if (error) throw error;

      // Normalize the joined data into a flat CatalogProduct structure
      return (data ?? []).map((row) => {
        const typedRow = row as CatalogQueryRow;
        return {
          sku_id: typedRow.sku_id,
          part_name: typedRow.part_name,
          wholesale_price: typedRow.wholesale_price,
          moq: typedRow.moq,
          stock_level: typedRow.stock_level,
          image_url: typedRow.image_url,
          quality_grade: typedRow.quality_grade,
          brand: typedRow.models?.brands?.name ?? "",
          model: typedRow.models?.marketing_name ?? "",
          generation: typedRow.models?.generation ?? "",
          category: typedRow.categories?.name ?? "",
        };
      });
    },
    // Prevent server-side fetching during SSG/SSR where the browser-only supabase client may be unavailable
    enabled: typeof window !== 'undefined',
  });

export type CatalogTree = Record<string, Record<string, string[]>>;

export function buildCatalogTree(products: CatalogProduct[]): CatalogTree {
  const tree: CatalogTree = {};
  for (const p of products) {
    if (!tree[p.brand]) tree[p.brand] = {};
    if (!tree[p.brand][p.model]) tree[p.brand][p.model] = [];
    if (!tree[p.brand][p.model].includes(p.generation)) {
      tree[p.brand][p.model].push(p.generation);
    }
  }
  return tree;
}

/**
 * Search helpers
 */
export function normalizeForSearch(s?: string): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function tokenizeQuery(q: string): string[] {
  return q
    .split(/\s+/)
    .map((t) => normalizeForSearch(t))
    .filter(Boolean);
}

/**
 * Check whether a product matches a search query.
 * Normalizes model numbers and SKU by stripping non-alphanumeric characters and lowercasing.
 * Tokens from the query must all match (as substrings) against the normalized product fields.
 */
export function productMatchesQuery(p: CatalogProduct, query: string): boolean {
  if (!query) return true;

  const rawTokens = query.split(/\s+/).map((t) => t.toLowerCase()).filter(Boolean);
  const normalizedTokens = rawTokens.map((t) => normalizeForSearch(t));

  if (normalizedTokens.length === 0) return true;

  const rawFields = `${p.part_name ?? ""} ${p.sku_id ?? ""} ${p.brand ?? ""} ${p.model ?? ""} ${p.generation ?? ""}`.toLowerCase();
  const normalizedFields = normalizeForSearch(rawFields);

  for (let i = 0; i < normalizedTokens.length; i++) {
    const rawToken = rawTokens[i];
    const normToken = normalizedTokens[i];
    if (rawFields.includes(rawToken)) continue;
    if (normalizedFields.includes(normToken)) continue;
    return false;
  }
  return true;
}

export const PLACEHOLDER_IMG = "/F8B48E10-46F9-4474-A98F-191D370F222D.png";
