import { render, screen, within } from "@testing-library/react";

vi.mock('next/link', () => ({
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {} }),
  usePathname: () => '/',
}));
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Dashboard from "@/pages/Dashboard";

// Mock auth and supabase
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "tester@example.com", created_at: "2023-01-01T00:00:00Z" },
    loading: false,
    signOut: vi.fn(),
  }),
}));

const mockOrders = [
  {
    id: "ord_123",
    status: "PENDING",
    total_amount: 12345,
    created_at: "2024-01-01T12:00:00Z",
    stripe_session: null,
    order_items: [
      { id: "i1", sku_id: "sku_1", quantity: 1, unit_price: 12345, inventory: { part_name: "Screen", image_url: null } },
    ],
  },
];

vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: mockOrders, error: null }),
        }),
      }),
    }),
    rpc: () => Promise.resolve({ data: false }),
  }),
}));

describe("Dashboard", () => {
  it("renders user info and orders with mock data", async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
          <Dashboard />
      </QueryClientProvider>
    );

    // user email should be present
    expect(await screen.findByText("tester@example.com")).toBeTruthy();

    // Metric values - locate the 'Total orders' card and assert the numeric value inside it
    const totalLabel = await screen.findByText("Total orders");
    const container = totalLabel.parentElement as HTMLElement;
    const { getByText } = within(container);
    expect(getByText("1")).toBeTruthy();

    // Order entry within the order history table
    const table = await screen.findByRole("table", { name: "User order history" });
    expect(within(table).getByText(/#ORD_123/i)).toBeTruthy();
    expect(within(table).getByText(/PENDING/i)).toBeTruthy();
  });
});
