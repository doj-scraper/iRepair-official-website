import { vi, describe, it, expect } from "vitest";

vi.mock('next/link', () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }),
  usePathname: () => '/',
}));

// Mock supabase client for test environment to avoid requiring env vars
vi.mock("../integrations/supabase/client", () => {
  return {
    supabase: {
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
      auth: {
        onAuthStateChange: (_cb: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null } }),
        signInWithPassword: async () => ({ error: null }),
        signUp: async () => ({ error: null }),
        signOut: async () => ({ error: null }),
      },
    },
  };
});

// Provide a lightweight mock for AuthContext so Header can render without the real provider
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: null, session: null, loading: false, signOut: async () => {} }),
}));

import { render } from "@testing-library/react";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from "../components/layout/Header";


describe("Accessibility - main nav", () => {
  it("main nav has a labeled navigation region and links are focusable", () => {
    const queryClient = new QueryClient();
    const { container } = render(
      <QueryClientProvider client={queryClient}>
          <Header />
        </QueryClientProvider>
    );
    const nav = container.querySelector('nav[aria-label="Main navigation"]');
    expect(nav).toBeTruthy();
    const firstLink = nav?.querySelector('a');
    expect(firstLink).toBeTruthy();
    (firstLink as HTMLElement).focus();
    expect(document.activeElement).toBe(firstLink);
  });
});
