'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Truck, ShieldCheck, PackageCheck, Smartphone, Battery, Camera, Search } from 'lucide-react';

const FEATURES = [
  { icon: Truck, title: 'Same-day Houston dispatch', desc: 'Local stock, no overseas wait.' },
  { icon: ShieldCheck, title: 'QC tested', desc: 'Every part inspected before shipping.' },
  { icon: PackageCheck, title: 'Bulk pricing', desc: 'Volume discounts that scale with your shop.' },
];

const CATEGORIES = [
  { icon: Smartphone, label: 'Screens', count: 6 },
  { icon: Battery, label: 'Batteries', count: 4 },
  { icon: Camera, label: 'Cameras', count: 3 },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
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
        <div className="absolute inset-0 gradient-hero opacity-95" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, hsl(0 0% 100% / 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 80%, hsl(0 0% 100% / 0.1) 0%, transparent 40%)',
          }}
          aria-hidden="true"
        />
        <div className="container relative grid gap-10 py-16 md:grid-cols-2 md:py-24 lg:py-32">
          <div className="flex flex-col justify-center text-primary-foreground">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              Houston, TX · Wholesale Only
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Repair parts,<br />sourced direct.
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/85 sm:text-lg">
              iRepair Technologies stocks bulk iPhone and Samsung parts for independent repair shops
              across the greater Houston area. Your tech, our care.
            </p>
            <div className="mt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') router.push(`/catalog?q=${encodeURIComponent(searchTerm)}`);
                  }}
                  placeholder="Search SKU, model or name..."
                  className="pl-9 w-full"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/catalog">
                <Button size="lg" className="w-full bg-background text-foreground shadow-elegant hover:bg-background/95 sm:w-auto">
                  Browse catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                >
                  Wholesale account
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-3xl border border-primary-foreground/20 bg-primary-foreground/5 p-1 backdrop-blur-md shadow-elegant overflow-hidden">
              <img
                alt="Wholesale repair parts illustration"
                loading="lazy"
                src="/images/home-hero.svg"
                className="h-full w-full rounded-3xl object-cover bg-[#f7fbff]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container grid gap-6 py-12 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Catalog</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Shop by category</h2>
          </div>
          <Link href="/catalog" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {CATEGORIES.map(({ icon: Icon, label, count }) => (
            <Link
              key={label}
              href="/catalog"
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-elegant">
                <Icon className="h-7 w-7" strokeWidth={1.8} />
              </div>
              <h3 className="font-display text-xl font-bold">{label}</h3>
              <p className="text-sm text-muted-foreground">{count}+ SKUs in stock</p>
              <ArrowRight className="absolute right-6 top-6 h-5 w-5 -translate-x-2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-primary group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-16">
        <div className="overflow-hidden rounded-3xl border border-border gradient-subtle p-8 md:p-12">
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
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-elegant hover:opacity-95">
                Apply now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
