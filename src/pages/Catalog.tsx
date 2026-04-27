import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { MainLayout } from "@/components/layout/MainLayout";
import { CatalogSidebar, type CatalogFilter } from "@/components/CatalogSidebar";
import { ProductCard } from "@/components/ProductCard";
import { useCatalog, buildCatalogTree, productMatchesQuery } from "@/lib/catalog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const Catalog = () => {
  const router = useRouter();
  const [filter, setFilter] = useState<CatalogFilter>({});
  // restore filter from history state if present (client only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history.state?.filter) {
      setFilter(window.history.state.filter);
    }
  }, []);
  // Initialize query from URL query param 'q' (client only)
  const [query, setQuery] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setQuery(searchParams.get('q') ?? '');
    }
  }, []);
  const [mobileFilters, setMobileFilters] = useState(false);

  // Keep location.state in sync so back-nav from detail restores filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const s = window.history.state || {};
      window.history.replaceState({ ...s, filter }, '', window.location.href);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const { data: products = [], isLoading, error } = useCatalog();
  const tree = useMemo(() => buildCatalogTree(products), [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filter.brand && p.brand !== filter.brand) return false;
      if (filter.model && p.model !== filter.model) return false;
      if (filter.generation && p.generation !== filter.generation) return false;
      if (query && !productMatchesQuery(p, query)) return false;
      return true;
    });
  }, [products, filter, query]);

  const breadcrumb = ["Catalog", filter.brand, filter.model, filter.generation].filter(Boolean) as string[];

  return (
    <MainLayout>
      <div className="container py-6 md:py-10">
        <header className="mb-6">
          <nav className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" aria-label="Breadcrumb">
            {breadcrumb.map((b, i) => (
              <span key={b}>
                {i > 0 && <span className="mx-1.5 opacity-40">/</span>}
                <span className={i === breadcrumb.length - 1 ? "text-foreground" : ""}>{b}</span>
              </span>
            ))}
          </nav>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                {filter.brand
                  ? `${filter.brand}${filter.model ? ` ${filter.model}` : ""}${filter.generation ? ` · ${filter.generation}` : ""}`
                  : "All wholesale parts"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isLoading ? "Loading…" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search catalog by SKU or name"
                placeholder="Search SKU or name…"
                className="pl-9 rounded-md border-2 border-border bg-background text-sm focus-visible:border-primary focus-visible:ring-0"
              />
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-lg border-2 border-border bg-card p-4">
              <CatalogSidebar tree={tree} filter={filter} onChange={setFilter} />
            </div>
          </aside>

          <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden rounded border-2 border-border mb-4">
                <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
              <div className="pt-6">
                <CatalogSidebar
                  tree={tree}
                  filter={filter}
                  onChange={(f) => {
                    setFilter(f);
                    setMobileFilters(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          <section>
            {error ? (
              <div className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
                Failed to load catalog: {(error as Error).message}
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-20 text-center">
                <p className="font-display text-base font-semibold">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <ProductCard key={p.sku_id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Catalog;

export async function getServerSideProps() {
  return { props: {} };
}
