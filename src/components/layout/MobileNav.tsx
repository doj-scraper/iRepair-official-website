import { NavLink } from "@/components/NavLink";
import { Home, Grid3x3, Info, LogIn, ShoppingCart, ClipboardList, Shield } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export const MobileNav = () => {
  const { items, setOpen } = useCart();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const count = items.reduce((a, i) => a + i.quantity, 0);
  const navItems = user
    ? [
        { to: "/", label: "Home", icon: Home, end: true },
        { to: "/catalog", label: "Catalog", icon: Grid3x3 },
        { to: "/orders", label: "Orders", icon: ClipboardList },
        isAdmin
          ? { to: "/admin", label: "Admin", icon: Shield }
          : { to: "/about", label: "About", icon: Info },
      ]
    : [
        { to: "/", label: "Home", icon: Home, end: true },
        { to: "/catalog", label: "Catalog", icon: Grid3x3 },
        { to: "/about", label: "About", icon: Info },
        { to: "/login", label: "Log in", icon: LogIn },
      ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
      aria-label="Primary"
    >
      <div className="grid grid-cols-5">
        {navItems.slice(0, 2).map((n) => (
          <NavItem key={n.to} {...n} />
        ))}
        {/* Center cart FAB */}
        <button
          onClick={() => setOpen(true)}
          className="relative flex flex-col items-center justify-center gap-1 py-2.5 text-muted-foreground transition-smooth active:scale-95"
          aria-label={`Cart, ${count} items`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary shadow-elegant">
            <ShoppingCart className="h-[18px] w-[18px] text-white" strokeWidth={2} />
            {count > 0 && (
              <span className="absolute right-[14px] top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold text-background">
                {count}
              </span>
            )}
          </div>
        </button>
        {navItems.slice(2).map((n) => (
          <NavItem key={n.to} {...n} />
        ))}
      </div>
    </nav>
  );
};

const NavItem = ({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
}) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-smooth",
        isActive ? "text-primary" : "text-muted-foreground/70"
      )
    }
  >
    <Icon className="h-[19px] w-[19px]" strokeWidth={2} />
    <span>{label}</span>
  </NavLink>
);
