'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/store/cart';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

type OrderItemRow = {
  id: string;
  sku_id: string;
  quantity: number;
  unit_price: number;
  inventory: { part_name: string | null; image_url: string | null } | null;
};

type OrderRow = {
  id: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED';
  total_amount: number;
  created_at: string;
  stripe_session: string | null;
  order_items: OrderItemRow[];
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, user, router, pathname]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        const { getSupabaseClient } = await import('@/integrations/supabase/client');
        const supabase = await getSupabaseClient();
        const { data, error } = await supabase
          .from('orders')
          .select(
            `id, status, total_amount, created_at, stripe_session,
             order_items ( id, sku_id, quantity, unit_price, inventory ( part_name, image_url ) )`
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Failed loading orders:', error);
          if (mounted) setOrders([]);
          return;
        }
        if (mounted) setOrders((data as OrderRow[] | null) ?? []);
      } catch (e) {
        console.error(e);
        if (mounted) setOrders([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  // Show spinner while auth resolves or redirect is pending
  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const total = orders?.length ?? 0;
  const pendingCount = orders?.filter((o) => o.status === 'PENDING').length ?? 0;
  const shippedCount = orders?.filter((o) => o.status === 'SHIPPED').length ?? 0;

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <header className="mb-6">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account summary and recent orders.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <section aria-labelledby="user-summary" className="md:col-span-1">
            <h2 id="user-summary" className="sr-only">User summary</h2>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="mt-1 truncate font-semibold">{user?.email}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Joined:{' '}
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </p>
              {user?.created_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Account age:{' '}
                  {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                </p>
              )}
            </div>
          </section>

          <section className="md:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-sm text-muted-foreground">Total orders</p>
                <p className="mt-2 text-2xl font-bold">{total}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="mt-2 text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-sm text-muted-foreground">Shipped</p>
                <p className="mt-2 text-2xl font-bold">{shippedCount}</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold">Order history</h3>

              {orders === null ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 rounded-md" />
                  <Skeleton className="h-12 rounded-md" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <Table aria-label="User order history">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <span className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</span>
                        </TableCell>
                        <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{o.status}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{formatPrice(o.total_amount)}</TableCell>
                        <TableCell>
                          <Link
                            href={`/orders?orderId=${o.id}`}
                            className="rounded-md text-sm text-primary underline focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {pendingCount > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-4">
                <h4 className="mb-2 text-sm font-semibold">Pending orders</h4>
                <ul className="space-y-2">
                  {orders
                    ?.filter((o) => o.status === 'PENDING')
                    .map((o) => (
                      <li
                        key={o.id}
                        className="flex items-center justify-between rounded-md border border-border bg-background/30 p-3"
                      >
                        <div>
                          <p className="font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <Link href={`/orders?orderId=${o.id}`} className="text-primary underline">
                            View
                          </Link>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
