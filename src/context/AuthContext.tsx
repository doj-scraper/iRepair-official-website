import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    (async () => {
      try {
        const { getSupabaseClient } = await import("@/integrations/supabase/client");
        const supabase = await getSupabaseClient();
        if (!supabase || !supabase.auth) {
          setLoading(false);
          return;
        }

        const res = supabase.auth.onAuthStateChange((_event: any, newSession: any) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        });
        // res.data may be undefined in some runtime variants — guard safely
        subscription = (res && (res as any).data && (res as any).data.subscription) || res?.subscription || null;

        // Initialize existing session
        const sessResp = await supabase.auth.getSession();
        if (!mounted) return;
        const existing = sessResp?.data?.session ?? null;
        setSession(existing);
        setUser(existing?.user ?? null);
        setLoading(false);
      } catch (err) {
        // Non-fatal — ensure we don't block rendering
        // eslint-disable-next-line no-console
        console.warn('Auth init failed', err);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      try {
        if (subscription && typeof subscription.unsubscribe === 'function') subscription.unsubscribe();
      } catch (err) {
        /* ignore */
      }
    };
  }, []);

  const signOut = async () => {
    try {
      const { getSupabaseClient } = await import("@/integrations/supabase/client");
      const supabase = await getSupabaseClient();
      if (supabase && supabase.auth) await supabase.auth.signOut();
    } catch (err) {
      // ignore signout failures
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
