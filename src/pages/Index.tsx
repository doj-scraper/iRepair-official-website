import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Truck, ShieldCheck, PackageCheck, Smartphone, Battery, Camera, Search } from "lucide-react";

const FEATURES = [
  { icon: Truck, title: "Same-day Houston dispatch", desc: "Local stock, no overseas wait." },
  { icon: ShieldCheck, title: "QC tested", desc: "Every part inspected before shipping." },
  { icon: PackageCheck, title: "Bulk pricing", desc: "Volume discounts that scale with your shop." },
];

const CATEGORIES = [
  { icon: Smartphone, label: "Screens", count: 6 },
  { icon: Battery, label: "Batteries", count: 4 },
  { icon: Camera, label: "Cameras", count: 3 },
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!searchTerm) return;
    const id = setTimeout(() => {
      router.push(`/catalog?q=${encodeURIComponent(searchTerm)}`);
    }, 350);
    return () => clearTimeout(id);
  }, [searchTerm, router]);

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Pale-yellow accent stripe at the very top */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-hairline z-10" aria-hidden="true" />

        {/* Muted bay-blue→teal gradient */}
        <div className="absolute inset-0 gradient-hero" aria-hidden="true" />

        {/* Subtle dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="container relative grid gap-10 py-16 md:grid-cols-2 md:py-24 lg:py-32">
          <div className="flex flex-col justify-center text-primary-foreground">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              Houston, TX · Wholesale Only
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Repair parts,<br />sourced direct.
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/80 sm:text-lg">
              iRepair Technologies stocks bulk iPhone and Samsung parts for independent repair shops
              across the greater Houston area. Your tech, our care.
            </p>
            <div className="mt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") router.push(`/catalog?q=${encodeURIComponent(searchTerm)}`);
                  }}
                  placeholder="Search SKU, model or name..."
                  className="pl-9 w-full bg-primary-foreground/10 border-primary-foreground/25 text-primary-foreground placeholder:text-primary-foreground/45 focus-visible:ring-primary-foreground/40"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/catalog">
                <Button size="lg" className="w-full bg-background text-foreground hover:bg-background/95 sm:w-auto shadow-md">
                  Browse catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                >
                  Wholesale account
                </Button>
              </Link>
            </div>
          </div>

          {/* Right panel — hero image with a pale-yellow accent border */}
          <div className="relative hidden md:flex items-center justify-center">
            <div
              className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 0 0 2px hsl(52 85% 83% / 0.55), 0 20px 48px -12px hsl(212 52% 20% / 0.45)" }}
            >
              <img
                alt="Phone repair parts"
                loading="lazy"
                src="/images/houston-1-800.jpg"
                className="h-full w-full object-cover"
              />
              {/* Subtle teal overlay to unify with palette */}
              <div className="absolute inset-0 bg-primary/15 mix-blend-multiply" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-border bg-card/70">
        <div className="container grid gap-6 py-10 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">Catalog</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Shop by category</h2>
          </div>
          <Link href="/catalog" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {CATEGORIES.map(({ icon: Icon, label, count }) => (
            <Link
              key={label}
              href="/catalog"
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
            >
              {/* Pale-yellow left accent line */}
              <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-hairline opacity-70" aria-hidden="true" />
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground">
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <h3 className="font-display text-lg font-bold">{label}</h3>
              <p className="text-sm text-muted-foreground">{count}+ SKUs in stock</p>
              <ArrowRight className="absolute right-5 top-5 h-4 w-4 -translate-x-2 text-muted-foreground/50 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {/* Pale-yellow top accent line */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-hairline" aria-hidden="true" />
          <div className="p-8 md:p-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                  Open a wholesale account
                </h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Get net terms, dedicated support, and custom volume pricing. Verified repair shops only.
                </p>
              </div>
              <Link href="/login">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-elegant hover:opacity-90 transition-smooth">
                  Apply now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;

export async function getServerSideProps() {
  return { props: {} };
}
