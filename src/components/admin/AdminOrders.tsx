import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

type AdminOrderItem = {
  id: string;
  orderId: string;
  skuId: string;
  quantity: number;
  unitPrice: number;
};

type AdminOrderProfile = {
  id: string;
  email: string;
  name: string | null;
  shopName: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminOrder = {
  id: string;
  userId: string | null;
  stripeSessionId: string | null;
  totalAmount: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  profile: AdminOrderProfile | null;
  items: AdminOrderItem[];
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PAID: "default",
  PENDING: "secondary",
  SHIPPED: "outline",
  CANCELLED: "destructive",
};

export const AdminOrders = () => {
  const { session } = useAuth();
  const { data: orders, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
      });

      const payload = (await response.json()) as { ok: boolean; orders?: AdminOrder[]; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Failed to load admin orders");
      }

      return payload.orders ?? [];
    },
    enabled: typeof window !== "undefined" && !!session?.access_token,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">All orders</h2>
        <p className="text-sm text-muted-foreground">
          {orders?.length ?? 0} orders across all customers
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Loading…</TableCell></TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center">
                  <div className="space-y-2">
                    <p className="font-medium">Unable to load admin orders</p>
                    <p className="text-sm text-muted-foreground">
                      {error instanceof Error ? error.message : "Unknown error"}
                    </p>
                    <button
                      type="button"
                      onClick={() => void refetch()}
                      disabled={isFetching}
                      className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                    >
                      {isFetching ? "Retrying…" : "Retry"}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && orders?.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No orders yet</TableCell></TableRow>
            )}
            {!isError && orders?.map((order) => {
              const itemCount = order.items.reduce((a, i) => a + i.quantity, 0);
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {order.profile?.shopName || order.profile?.name || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">{order.profile?.email ?? "—"}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-sm">
                      {itemCount} unit{itemCount !== 1 ? "s" : ""}
                    <div className="text-xs text-muted-foreground">
                      {order.items.map((i) => i.skuId).join(", ")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${(order.totalAmount / 100).toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
