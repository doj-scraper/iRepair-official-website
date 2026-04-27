'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart, formatPrice } from '@/store/cart';
import { PLACEHOLDER_IMG } from '@/lib/catalog';
import { ArrowLeft, Minus, Plus, ShieldCheck, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { type CatalogFilter } from '@/components/CatalogSidebar';

type Detail = {
  sku_id: string;
  part_name: string | null;
  specifications: string | null;
  quality_grade: 'OEM' | 'Premium' | 'Aftermarket' | null;
  wholesale_price: number | null;
  moq: number;
  stock_level: number;
  image_url: string | null;
  models: {
    marketing_name: string | null;
    generation: string | null;
    brands: { name: string } | null;
  } | null;
  categories: { name: string } | null;
};

type Compatible = {
  marketing_name: string | null;
  generation: string | null;
  brands: { name: string } | null;
};

type CompatibilityRow = {
  models: Compatible | null;
};

const QUALITY_INFO: Record<
  NonNullable<Detail['quality_grade']>,
  { label: string; description: string; tone: string }
> = {
  OEM: {
    label: 'OEM',
    description:
      'Original Equipment Manufacturer parts — identical to those installed at the factory. Highest quality and price.',
    tone: 'bg-primary/10 text-primary border-primary/30',
  },
  Premium: {
    label: 'Premium',
    description:
      'High-grade aftermarket parts engineered to OEM specifications. Excellent quality at a better price.',
    tone: 'bg-green-500/10 text-green-700 border-green-500/30',
  },
  Aftermarket: {
    label: 'Aftermarket',
    description:
      'Cost-effective parts that meet baseline functional standards. Best value for high-volume repairs.',
    tone: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  },
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawSku = params?.skuId;
  const skuId = Array.isArray(rawSku) ? rawSku[0] : (rawSku ?? '');

  const [product, setProduct] = useState<Detail | null>(null);
  const [compat, setCompat] = useState<Compatible[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem, setOpen } = useCart();

  useEffect(() => {
    if (!skuId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { getSupabaseClient } = await import('@/integrations/supabase/client');
      const supabase = await getSupabaseClient();
      const [{ data: prod, error: prodErr }, { data: compatRows }] = await Promise.all([
        supabase
          .from('inventory')
          .select(
            `sku_id, part_name, specifications, quality_grade, wholesale_price, moq, stock_level, image_url,
             models ( marketing_name, generation, brands ( name ) ),
             categories ( name )`
          )
          .eq('sku_id', skuId)
          .maybeSingle(),
        supabase
          .from('compatibility_map')
          .select(`models ( marketing_name, generation, brands ( name ) )`)
          .eq('sku_id', skuId),
      ]);

      if (cancelled) return;
      if (prodErr) toast.error(prodErr.message);
      const typedProduct = (prod as Detail | null) ?? null;
      setProduct(typedProduct);
      setCompat(
        ((compatRows as CompatibilityRow[] | null) ?? [])
          .map((r) => r.models)
          .filter((m): m is Compatible => Boolean(m))
      );
      setQty(typedProduct?.moq ?? 1);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [skuId]);

  const goBack = () => router.push('/catalog');

  const handleAdd = () => {
    if (!product || !hasPrice) return;
    addItem(
      {
        skuId: product.sku_id,
        name: product.part_name ?? product.sku_id,
        price: product.wholesale_price,
        image: product.image_url,
      },
      qty
    );
    toast.success(`Added ${qty} × ${product.part_name ?? product.sku_id}`);
    setOpen(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 md:py-12">
          <Skeleton className="mb-6 h-6 w-32" />
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <p className="font-display text-xl font-semibold">Product not found</p>
          <Button className="mt-4" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to catalog
          </Button>
        </div>
      </MainLayout>
    );
  }

  const quality = product.quality_grade ? QUALITY_INFO[product.quality_grade] : null;
  const inStock = product.stock_level > 0;
  const hasPrice = typeof product.wholesale_price === 'number' && product.wholesale_price > 0;

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <button
          onClick={goBack}
          className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to catalog
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <img
              src={product.image_url || PLACEHOLDER_IMG}
              alt={product.part_name ?? product.sku_id}
              className="aspect-square w-full object-cover"
            />
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {product.sku_id}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {product.part_name ?? 'Unnamed part'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {product.models?.brands?.name} {product.models?.marketing_name}
              {product.models?.generation ? ` · ${product.models.generation}` : ''}
              {product.categories?.name ? ` · ${product.categories.name}` : ''}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {quality && (
                <Badge variant="outline" className={quality.tone}>
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {quality.label}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={
                  inStock
                    ? 'border-green-500/30 bg-green-500/10 text-green-700'
                    : 'border-destructive/30 bg-destructive/10 text-destructive'
                }
              >
                <Package className="mr-1 h-3 w-3" />
                {inStock ? `${product.stock_level} in stock` : 'Out of stock'}
              </Badge>
              <Badge variant="outline">MOQ {product.moq}</Badge>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-secondary/30 p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Wholesale price
              </p>
              <p className="font-display text-4xl font-bold">
                {!hasPrice
                  ? 'Contact for price'
                  : formatPrice(product.wholesale_price)}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="inline-flex items-center rounded-md border border-border bg-background">
                  <button
                    onClick={() => setQty((q) => Math.max(product.moq, q - 1))}
                    className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:bg-secondary"
                    aria-label="Decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:bg-secondary"
                    aria-label="Increase"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={!inStock || !hasPrice}
                  className="flex-1"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to cart
                </Button>
              </div>
              {!hasPrice && (
                <p className="mt-3 text-sm text-muted-foreground">
                  This item is priced on request. Please contact us for a custom quote.
                </p>
              )}
              {qty < product.moq && (
                <p className="mt-2 text-xs text-destructive">
                  Minimum order quantity is {product.moq}.
                </p>
              )}
            </div>

            {quality && (
              <div className="mt-6 rounded-lg border border-border p-4">
                <p className="font-display text-sm font-semibold">About {quality.label} grade</p>
                <p className="mt-1 text-sm text-muted-foreground">{quality.description}</p>
              </div>
            )}

            {product.specifications && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-semibold">Specifications</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {product.specifications}
                </p>
              </div>
            )}

            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold">Compatible models</h2>
              {compat.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No additional compatibility data available.
                </p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {compat.map((m, i) => (
                    <li key={i}>
                      <Badge variant="secondary" className="font-normal">
                        {m.brands?.name} {m.marketing_name}
                        {m.generation ? ` · ${m.generation}` : ''}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="grid gap-0 md:grid-cols-[1fr_0.95fr]">
            <div className="flex flex-col justify-center p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Inside the part
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
                The detail image shows the layers customers are actually paying for.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Use this as a visual check when you’re comparing assemblies, screens, batteries,
                and board-level components. It belongs on the product page where buyers are already
                making a technical decision.
              </p>
            </div>
            <div className="relative min-h-[18rem] bg-secondary/30">
              <img
                src="/images/product-exploded-phone.jpg"
                alt="Exploded phone assembly showing layers of internal components"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
