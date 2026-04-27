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

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <header className="mb-8">
          <nav className="text-xs font-medium text-muted-foreground" aria-label="Breadcrumb">
            {breadcrumb.map((b, i) => (
              <span key={b}>
                {i > 0 && <span className="mx-1.5">/</span>}
                <span className={i === breadcrumb.length - 1 ? 'text-foreground' : ''}>{b}</span>
              </span>
            ))}
          </nav>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                {filter.brand
                  ? `${filter.brand}${filter.model ? ` ${filter.model}` : ''}${filter.generation ? ` · ${filter.generation}` : ''}`
                  : 'All wholesale parts'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {showLoading ? 'Loading…' : `${filtered.length} products`}
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                aria-label="Search catalog by SKU or name"
                placeholder="Search SKU or name…"
                className="pl-9"
              />
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-4 shadow-card">
              <CatalogSidebar tree={tree} filter={filter} onChange={setFilter} />
            </div>
          </aside>

          <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
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
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                Failed to load catalog: {(error as Error).message}
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
                <p className="font-display text-lg font-semibold">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
