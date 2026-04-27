import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading } = useIsAdmin();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !loading) {
      if (!user) {
        router.replace(`/login?from=${encodeURIComponent(pathname ?? "/")}`);
      } else if (!isAdmin) {
        router.replace('/');
      }
    }
  }, [authLoading, loading, user, isAdmin, router, pathname]);

  if (authLoading || loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};
