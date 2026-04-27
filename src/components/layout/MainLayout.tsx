import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileNav } from "./MobileNav";
import { CartDrawer } from "@/components/cart/CartDrawer";

export const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-background">
    <Header />
    <main className="flex-1 pb-20 md:pb-0">{children}</main>
    <Footer />
    <MobileNav />
    <CartDrawer />
  </div>
);
