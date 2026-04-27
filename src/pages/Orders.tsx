import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/store/cart";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { PackageOpen } from "lucide-react";
import { getErrorMessage } from "@/lib/error";

type OrderItemRow = {
  id: string;
  sku_id: string;
  quantity: number;
  unit_price: number;
  inventory: { part_name: string | null; image_url: string | null } | null;
};

type OrderRow = {
  id: string;
  status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";
  total_amount: number;
  created_at: string;
  stripe_session: string | null;
  order_items: OrderItemRow[];
};

const statusVariant: Record<OrderRow["status"], string> = {
  PENDING: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  PAID: "bg-green-500/15 text-green-700 border-green-500/30",
  SHIPPED: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  CANCELLED: "bg-destructive/15 text-destructive border-destructive/30",
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const router = useRouter();

  const load = async () => {
    if (!user) return;
    const { getSupabaseClient } = await import("@/integrations/supabase/client");
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `id, status, total_amount, created_at, stripe_session,
         order_items ( id, sku_id, quantity, unit_price,
           inventory ( part_name, image_url ) )`
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setOrders((data as OrderRow[] | null) ?? []);
  };

  useEffect(() => {
    load();
  }, [user]);

  // Verify payment on return from Stripe
  useEffect(() => {
    const sid = typeof router.query.session_id === 'string' ? router.query.session_id : Array.isArray(router.query.session_id) ? router.query.session_id[0] : undefined;
    if (!sid || !user) return;
    (async () => {
      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid }),
        });
        const result = await response.json();
        if (!response.ok) {
          toast.error(getErrorMessage(result?.error ?? result));
        } else if (result?.paid) {
          toast.success('Payment confirmed — order is PAID');
        } else {
          toast.message('Payment status: ' + (result?.status ?? 'unknown'));
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
      const newQuery = { ...router.query } as Record<string, any>;
      delete newQuery.session_id;
      router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
      load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Your orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track wholesale orders and payment status.
          </p>
        </header>

        {orders === null ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <PackageOpen className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-display text-lg font-semibold">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Orders you place will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li
                key={o.id}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={statusVariant[o.status]}
                    >
                      {o.status}
                    </Badge>
                    <span className="font-display text-xl font-bold">
                      {formatPrice(o.total_amount)}
                    </span>
                  </div>
                </div>
                <ul className="mt-3 divide-y divide-border">
                  {o.order_items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 py-2">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                        {it.inventory?.image_url && (
                          <img
                            src={it.inventory.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {it.inventory?.part_name ?? it.sku_id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {it.sku_id} · qty {it.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatPrice(it.unit_price * it.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MainLayout>
  );
};

export default Orders;

export async function getServerSideProps() {
  return { props: {} };
}
