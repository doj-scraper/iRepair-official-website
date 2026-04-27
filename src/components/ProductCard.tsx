import { type CatalogProduct, PLACEHOLDER_IMG } from "@/lib/catalog";
import { useCart, formatPrice } from "@/store/cart";
import { Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const ProductCard = ({ product }: { product: CatalogProduct }) => {
  const { addItem, setOpen } = useCart();
  /* history state handled in Catalog via window.history.replaceState */
  const lowStock = product.stock_level > 0 && product.stock_level <= 20;
  const hasPrice = typeof product.wholesale_price === "number" && product.wholesale_price > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        skuId: product.sku_id,
        name: product.part_name ?? product.sku_id,
        price: product.wholesale_price!,
        image: product.image_url,
      },
      product.moq
    );
    setOpen(true);
  };

  return (
    <Link
      href={`/catalog/${encodeURIComponent(product.sku_id)}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card/95 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-elegant"
    >
      <div className="relative aspect-[4/5] overflow-hidden border-b border-border bg-gradient-to-br from-secondary/60 via-background to-muted/50">
        <img
          src={product.image_url || PLACEHOLDER_IMG}
          alt={product.part_name ?? product.sku_id}
          loading="lazy"
          className="h-full w-full object-contain p-5 transition-transform duration-200 group-hover:scale-[1.04]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-border bg-background/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground shadow-sm">
            MOQ {product.moq}
          </span>
          {lowStock && (
            <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[10px] font-semibold text-warning shadow-sm">
              <AlertTriangle className="h-2.5 w-2.5" /> Low stock
            </span>
          )}
          {product.quality_grade && (
            <span className="inline-flex items-center rounded-full border border-border bg-background/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-sm">
              {product.quality_grade}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {product.sku_id}
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-foreground">
          {product.part_name ?? product.sku_id}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.brand} · {product.model} {product.generation}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p className="font-display text-2xl font-bold leading-none text-foreground">
              {!hasPrice
                ? "On request"
                : formatPrice(product.wholesale_price)}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">per unit</p>
          </div>
          <Button
            onClick={handleAdd}
            disabled={product.stock_level === 0 || !hasPrice}
            size="sm"
            className="h-10 shrink-0 rounded-full px-4"
            aria-label={`Add ${product.part_name ?? product.sku_id} to cart`}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Link>
  );
};
