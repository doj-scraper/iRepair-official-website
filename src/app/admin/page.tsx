'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminInventory } from '@/components/admin/AdminInventory';
import { AdminOrders } from '@/components/admin/AdminOrders';
import { Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading || adminLoading) return;
    if (!user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    } else if (!isAdmin) {
      router.replace('/');
    }
  }, [authLoading, adminLoading, user, isAdmin, router, pathname]);

  if (authLoading || adminLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage inventory and review orders</p>
          </div>
        </div>

        <Tabs defaultValue="inventory">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="inventory" className="mt-6">
            <AdminInventory />
          </TabsContent>
          <TabsContent value="orders" className="mt-6">
            <AdminOrders />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
