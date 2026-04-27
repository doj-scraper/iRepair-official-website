import Link from 'next/link';
import { cn } from '@/lib/utils';

export type MarqueeItem = {
  label: string;
  detail?: string;
  href?: string;
};

type AnnouncementMarqueeProps = {
  items: MarqueeItem[];
  label?: string;
  detail?: string;
  reverse?: boolean;
  durationSeconds?: number;
  className?: string;
};

export function AnnouncementMarquee({
  items,
  label = 'Bulletin',
  detail = 'Old-school scrolling notes for the shop floor',
  reverse = false,
  durationSeconds = 28,
  className,
}: AnnouncementMarqueeProps) {
  const loopedItems = [...items, ...items];

  return (
    <section className={cn('overflow-hidden border border-border bg-card shadow-card', className)}>
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            {label}
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            {detail}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          scrolls forever
        </span>
      </div>

      <div className="relative overflow-hidden bg-background">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent"
        />

        <div
          className={cn(
            'flex w-max items-stretch gap-3 px-4 py-4',
            reverse ? 'animate-marquee-reverse' : 'animate-marquee',
            'motion-reduce:animate-none',
          )}
          style={{ ['--marquee-duration' as string]: `${durationSeconds}s` }}
        >
          {loopedItems.map((item, index) => {
            const content = (
              <div className="flex min-w-max items-center gap-3 border border-border bg-background px-4 py-3 shadow-soft transition-colors hover:border-primary/20 hover:bg-secondary/30">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-border bg-primary text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground">
                  {String((index % items.length) + 1).padStart(2, '0')}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                    {item.label}
                  </span>
                  {item.detail ? (
                    <span className="text-[11px] text-muted-foreground">{item.detail}</span>
                  ) : null}
                </span>
              </div>
            );

            return item.href ? (
              <Link key={`${item.label}-${index}`} href={item.href} className="shrink-0">
                {content}
              </Link>
            ) : (
              <div key={`${item.label}-${index}`} className="shrink-0">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
