'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { CatalogSidebar, type CatalogFilter } from '@/components/CatalogSidebar';
import { ProductCard } from '@/components/ProductCard';
import { useCatalog, buildCatalogTree, productMatchesQuery } from '@/lib/catalog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function CatalogPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filter, setFilter] = useState<CatalogFilter>({});
  const [hydrated, setHydrated] = useState(false);

  // Restore filter from history state on mount (client-only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history.state?.filter) {
      setFilter(window.history.state.filter);
    }
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Initialize query from the URL search param `q`
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const [mobileFilters, setMobileFilters] = useState(false);

  // Keep history.state in sync so back-nav from product detail restores filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const s = window.history.state || {};
      window.history.replaceState({ ...s, filter }, '', window.location.href);
    }
  }, [filter]);

  const { data: products = [], isLoading, error } = useCatalog();
  const tree = useMemo(() => buildCatalogTree(products), [products]);
  const showLoading = hydrated && isLoading && products.length > 0;

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);

    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery.trim()) {
      params.set('q', nextQuery);
    } else {
      params.delete('q');
    }

    const nextUrl = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filter.brand && p.brand !== filter.brand) return false;
      if (filter.model && p.model !== filter.model) return false;
      if (filter.generation && p.generation !== filter.generation) return false;
      if (query && !productMatchesQuery(p, query)) return false;
      return true;
    });
  }, [products, filter, query]);

  const breadcrumb = ['Catalog', filter.brand, filter.model, filter.generation].filter(Boolean) as string[];
  const activeFilterCount = [filter.brand, filter.model, filter.generation].filter(Boolean).length;

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <header className="mb-8 rounded-3xl border border-border bg-card/90 p-5 shadow-card md:p-6">
          <div className="flex flex-col gap-5">
            <nav className="text-xs font-medium text-muted-foreground" aria-label="Breadcrumb">
              {breadcrumb.map((b, i) => (
                <span key={b}>
                  {i > 0 && <span className="mx-1.5 text-border">/</span>}
                  <span className={cn(i === breadcrumb.length - 1 && 'text-foreground')}>{b}</span>
                </span>
              ))}
            </nav>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Catalog
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                  {filter.brand
                    ? `${filter.brand}${filter.model ? ` ${filter.model}` : ''}${filter.generation ? ` · ${filter.generation}` : ''}`
                    : 'All wholesale parts'}
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
                  {showLoading ? 'Loading inventory…' : `${filtered.length} products ready to browse`}
                </p>
              </div>

              <div className="w-full lg:max-w-md">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => updateQuery(e.target.value)}
                    aria-label="Search catalog by SKU or name"
                    placeholder="Search SKU, name, brand, model"
                    className="h-12 rounded-full border-border bg-background/80 pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="rounded-full border border-border bg-secondary px-3 py-1">
                {showLoading ? 'Loading' : `${filtered.length} results`}
              </span>
              {activeFilterCount > 0 ? (
                <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-primary">
                  {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="rounded-full border border-border bg-background px-3 py-1">
                  No filters applied
                </span>
              )}
            </div>
          </div>
        </header>

        <section className="mb-8 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="grid gap-0 md:grid-cols-[1fr_1.05fr]">
            <div className="flex flex-col justify-center p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Bench tested
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
                Every part gets a look before it hits the shelf.
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                We inspect, sort, and stage inventory so repair shops can move from search to install without surprises.
              </p>
            </div>
            <div className="relative min-h-[16rem] md:min-h-[18rem]">
              <img
                src="/images/catalog-bench.jpg"
                alt="A repair bench with a phone under inspection"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-3xl border border-border bg-card/95 p-4 shadow-card">
              <CatalogSidebar tree={tree} filter={filter} onChange={setFilter} />
            </div>
          </aside>

          <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 rounded-full lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-0">
              <div className="h-full p-5 pt-8">
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
              <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive shadow-card">
                Failed to load catalog: {(error as Error).message}
              </div>
            ) : isLoading ? (
              <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[28rem] rounded-3xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex min-h-[24rem] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-20 text-center shadow-card">
                <p className="font-display text-lg font-semibold">No products found</p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Try adjusting your filters or search. The catalog is exacting about brand, model, and generation.
                </p>
              </div>
            ) : (
              <div className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogPageInner />
    </Suspense>
  );
}
