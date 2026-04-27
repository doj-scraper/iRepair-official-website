import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MainLayout } from "@/components/layout/MainLayout";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart, formatPrice } from "@/store/cart";
import { PLACEHOLDER_IMG } from "@/lib/catalog";
import { ArrowLeft, Minus, Plus, ShieldCheck, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { type CatalogFilter } from "@/components/CatalogSidebar";

type Detail = {
  sku_id: string;
  part_name: string | null;
  specifications: string | null;
  quality_grade: "OEM" | "Premium" | "Aftermarket" | null;
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
  NonNullable<Detail["quality_grade"]>,
  { label: string; description: string; tone: string }
> = {
  OEM: {
    label: "OEM",
    description:
      "Original Equipment Manufacturer parts — identical to those installed at the factory. Highest quality and price.",
    tone: "bg-primary/10 text-primary border-primary/30",
  },
  Premium: {
    label: "Premium",
    description:
      "High-grade aftermarket parts engineered to OEM specifications. Excellent quality at a better price.",
    tone: "bg-green-500/10 text-green-700 border-green-500/30",
  },
  Aftermarket: {
    label: "Aftermarket",
    description:
      "Cost-effective parts that meet baseline functional standards. Best value for high-volume repairs.",
    tone: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  },
};

const ProductDetail = () => {
  const router = useRouter();
  const rawSku = Array.isArray(router.query.skuId) ? router.query.skuId[0] : (router.query.skuId ?? "");
  const skuId = typeof rawSku === 'string' ? String(rawSku) : '';
  const [product, setProduct] = useState<Detail | null>(null);
  const [compat, setCompat] = useState<Compatible[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addItem, setOpen } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { getSupabaseClient } = await import("@/integrations/supabase/client");
      const supabase = await getSupabaseClient();
      const [{ data: prod, error: prodErr }, { data: compatRows }] =
        await Promise.all([
          supabase
            .from("inventory")
            .select(
              `sku_id, part_name, specifications, quality_grade, wholesale_price, moq, stock_level, image_url,
               models ( marketing_name, generation, brands ( name ) ),
               categories ( name )`
            )
            .eq("sku_id", skuId)
            .maybeSingle(),
          supabase
            .from("compatibility_map")
            .select(
              `models ( marketing_name, generation, brands ( name ) )`
            )
            .eq("sku_id", skuId),
        ]);

      if (cancelled) return;
      if (prodErr) {
        toast.error(prodErr.message);
      }
      const typedProduct = (prod as Detail | null) ?? null;
      setProduct(typedProduct);
      setCompat(((compatRows as CompatibilityRow[] | null) ?? [])
        .map((r) => r.models)
        .filter((model): model is Compatible => Boolean(model)));
      setQty(typedProduct?.moq ?? 1);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [skuId]);

  const filterState = typeof window !== 'undefined' ? (window.history.state?.filter as CatalogFilter | undefined) : undefined;

  const goBack = () => {
    // Use Next router to navigate back to catalog. Restoring history.state is handled by the client.
    router.push('/catalog');
  };

  const handleAdd = () => {
    if (!product || product.wholesale_price == null) return;
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

  return (
    <MainLayout>
      <div className="container py-6 md:py-10">
        <button
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to catalog
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border-2 border-border bg-card">
            <img
              src={product.image_url || PLACEHOLDER_IMG}
              alt={product.part_name ?? product.sku_id}
              className="aspect-square w-full object-contain p-6"
            />
          </div>

          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {product.sku_id}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight md:text-3xl">
              {product.part_name ?? "Unnamed part"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.models?.brands?.name} {product.models?.marketing_name}
              {product.models?.generation ? ` · ${product.models.generation}` : ""}
              {product.categories?.name ? ` · ${product.categories.name}` : ""}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {quality && (
                <Badge variant="outline" className={`rounded border-2 text-[10px] uppercase tracking-wide font-semibold ${quality.tone}`}>
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {quality.label}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`rounded border-2 text-[10px] uppercase tracking-wide font-semibold ${
                  inStock
                    ? "border-green-500/40 bg-green-500/8 text-green-700"
                    : "border-destructive/40 bg-destructive/8 text-destructive"
                }`}
              >
                <Package className="mr-1 h-3 w-3" />
                {inStock ? `${product.stock_level} in stock` : "Out of stock"}
              </Badge>
              <Badge variant="outline" className="rounded border-2 text-[10px] uppercase tracking-wide font-semibold">
                MOQ {product.moq}
              </Badge>
            </div>

            <div className="mt-6 rounded-lg border-2 border-border bg-secondary/20 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Wholesale price
              </p>
              <p className="font-display text-4xl font-bold mt-1">
                {product.wholesale_price === 0
                  ? "Contact for price"
                  : formatPrice(product.wholesale_price)}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="inline-flex items-center rounded border-2 border-border bg-background">
                  <button
                    onClick={() => setQty((q) => Math.max(product.moq, q - 1))}
                    className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={!inStock || product.wholesale_price === 0 || product.wholesale_price == null}
                  className="flex-1 rounded border-2"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to cart
                </Button>
              </div>
              {product.wholesale_price === 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
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
              <div className="mt-5 rounded-lg border-2 border-border p-4">
                <p className="text-xs font-bold uppercase tracking-wide">
                  About {quality.label} grade
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {quality.description}
                </p>
              </div>
            )}

            {product.specifications && (
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">Specifications</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                  {product.specifications}
                </p>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">
                Compatible models
              </h2>
              {compat.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No additional compatibility data available.
                </p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {compat.map((m, i) => (
                    <li key={i}>
                      <Badge variant="outline" className="rounded border border-border text-xs font-normal text-muted-foreground">
                        {m.brands?.name} {m.marketing_name}
                        {m.generation ? ` · ${m.generation}` : ""}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetail;

export async function getServerSideProps() {
  return { props: {} };
}
