import { NavLink } from "@/components/NavLink";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, LogIn, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useCart } from "@/store/cart";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/catalog", label: "Catalog" },
  { to: "/about", label: "About" },
];

export const Header = () => {
  const { items, setOpen } = useCart();
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const router = useRouter();
  const count = items.reduce((a, i) => a + i.quantity, 0);
  const nav = [
    ...NAV,
    ...(user ? [{ to: "/orders", label: "Orders" }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/92 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-[60px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center" aria-label="iRepair Technologies home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "relative rounded px-3.5 py-2 text-sm font-medium transition-smooth",
                  isActive
                    ? "text-primary font-semibold after:absolute after:bottom-0 after:left-3.5 after:right-3.5 after:h-[2px] after:rounded-full after:bg-primary after:content-['']"
                    : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full gradient-primary px-1 text-[10px] font-bold text-white shadow-elegant">
                {count}
              </span>
            )}
          </button>

          <ThemeSwitcher />

          {user ? (
            <button
              onClick={handleSignOut}
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded border border-border/60 bg-secondary/60 px-3.5 text-sm font-medium text-foreground transition-smooth hover:bg-secondary hover:border-border"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded gradient-primary px-4 text-sm font-semibold text-white shadow-elegant transition-smooth hover:opacity-90 active:scale-[0.98]"
            >
              <LogIn className="h-3.5 w-3.5" />
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
