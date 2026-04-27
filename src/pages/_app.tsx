import type { AppProps } from 'next/app';
import '../index.css';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('../instrumentation-client').catch((e) => console.warn('BotID init skipped:', e));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
