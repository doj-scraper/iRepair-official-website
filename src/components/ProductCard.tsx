import { type CatalogProduct, PLACEHOLDER_IMG } from "@/lib/catalog";
import { useCart, formatPrice } from "@/store/cart";
import { Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { type CatalogFilter } from "@/components/CatalogSidebar";
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
      className="group flex flex-col overflow-hidden rounded-lg border-2 border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden border-b-2 border-border bg-muted/40">
        <img
          src={product.image_url || PLACEHOLDER_IMG}
          alt={product.part_name ?? product.sku_id}
          loading="lazy"
          className="h-full w-full object-contain p-3 transition-transform duration-200 group-hover:scale-[1.03]"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <span className="inline-flex items-center rounded bg-background border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
            MOQ {product.moq}
          </span>
          {lowStock && (
            <span className="inline-flex items-center gap-1 rounded bg-warning/10 border border-warning/30 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
              <AlertTriangle className="h-2.5 w-2.5" /> Low
            </span>
          )}
          {product.quality_grade && (
            <span className="inline-flex items-center rounded bg-background border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {product.quality_grade}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {product.sku_id}
        </p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {product.part_name ?? product.sku_id}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {product.brand} · {product.model} {product.generation}
        </p>
        <div className="mt-auto pt-4 flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-xl font-bold leading-none text-foreground">
              {!hasPrice
                ? "On request"
                : formatPrice(product.wholesale_price)}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">per unit</p>
          </div>
          <Button
            onClick={handleAdd}
            disabled={product.stock_level === 0 || !hasPrice}
            size="sm"
            className="shrink-0 rounded border-2"
            aria-label={`Add ${product.part_name ?? product.sku_id} to cart`}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>
    </Link>
  );
};
