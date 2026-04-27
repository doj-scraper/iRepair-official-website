'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { MapPin, Globe2, Users, Award } from 'lucide-react';

const STATS = [
  { value: '5,000+', label: 'Repair shops served' },
  { value: '48hr', label: 'Avg. fulfillment' },
  { value: '100%', label: 'QC tested parts' },
  { value: '10yr+', label: 'In wholesale' },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <section className="relative overflow-hidden gradient-hero">
        <div className="container py-16 text-primary-foreground md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">About us</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight md:text-5xl">
            The Houston wholesale source for cell phone repair parts.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            We bridge factories in China and the independent repair shops keeping Texas connected.
            Real inventory, fair pricing, and parts that actually work the first time.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-6 shadow-card">
              <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container grid gap-10 pb-16 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Our story</h2>
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              iRepair Technologies started as a single-bench repair shop in Houston. As demand
              grew, we opened direct supplier relationships in Shenzhen — and started passing those
              savings to other independents who couldn&apos;t get the same margins.
            </p>
            <p>
              Today we operate a Houston-based warehouse with thousands of SKUs in stock, ready to
              ship the same day. Our team personally inspects every shipment before it goes out.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Globe2, title: 'Direct from factory', desc: 'Shenzhen sourcing, no middlemen.' },
            { icon: MapPin, title: 'Houston warehouse', desc: 'Local pickup & same-day ship.' },
            { icon: Users, title: 'Independents only', desc: 'We don\'t sell to big-box retailers.' },
            { icon: Award, title: 'QC guarantee', desc: '30-day warranty on every part.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
