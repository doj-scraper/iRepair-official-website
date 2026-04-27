import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart, formatPrice } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { PLACEHOLDER_IMG } from "@/lib/catalog";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import { toast } from "sonner";
import { useState } from "react";
import { getErrorMessage } from "@/lib/error";

export const CartDrawer = () => {
  const { isOpen, setOpen, items, setQuantity, removeItem, clear } = useCart();
  const { user, session } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      return;
    }
    if (!session?.access_token) {
      toast.error("Your session is still loading. Please try again in a moment.");
      return;
    }
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
        body: JSON.stringify({
          items: items.map((i) => ({
            skuId: i.skuId,
            quantity: i.quantity,
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) throw result?.error || new Error('Checkout failed');
      if (!result?.url) throw new Error('No checkout URL returned');
      clear();
      setOpen(false);
      window.location.href = result.url;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
            {totalUnits > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                {totalUnits} units
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="rounded-full bg-secondary p-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-display text-lg font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Browse the catalog to start a wholesale order.</p>
            <Link href="/catalog" onClick={() => setOpen(false)}>
              <Button className="mt-2">Browse catalog</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.skuId} className="flex gap-3 rounded-lg border border-border p-3">
                    <img
                      src={item.image || PLACEHOLDER_IMG}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-md bg-secondary object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <p className="text-xs text-muted-foreground">{item.skuId}</p>
                      <p className="text-sm font-semibold leading-tight line-clamp-2">{item.name}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-md border border-border">
                          <button
                            onClick={() => setQuantity(item.skuId, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-secondary"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => setQuantity(item.skuId, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-secondary"
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="font-display text-sm font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.skuId)}
                      className="self-start text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border bg-secondary/30 px-6 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-2xl font-bold">{formatPrice(subtotal)}</span>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Wholesale pricing. Shipping & taxes calculated at checkout.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clear} className="flex-1" disabled={submitting}>
                  Clear
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="flex-1 gradient-primary text-primary-foreground shadow-elegant hover:opacity-95"
                >
                  {submitting ? "Redirecting…" : user ? "Pay with Stripe" : "Sign in to checkout"}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
