import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { getSupabaseClient } = await import("@/integrations/supabase/client");
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      if (error) throw error;
      return data === true;
    },

  });

  return {
    isAdmin: query.data === true,
    loading: authLoading || (!!user && query.isLoading),
  };
};
