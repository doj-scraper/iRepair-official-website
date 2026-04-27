import { useState } from "react";
import { ChevronRight, ChevronDown, Smartphone } from "lucide-react";
import { type CatalogTree } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export type CatalogFilter = {
  brand?: string;
  model?: string;
  generation?: string;
};

export const CatalogSidebar = ({
  tree,
  filter,
  onChange,
}: {
  tree: CatalogTree;
  filter: CatalogFilter;
  onChange: (f: CatalogFilter) => void;
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Apple: true,
    Samsung: true,
  });

  const toggle = (key: string) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  const isActive = (b?: string, m?: string, g?: string) =>
    filter.brand === b && filter.model === m && filter.generation === g;

  return (
    <nav className="w-full" aria-label="Catalog filters">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Browse
          </h2>
          <p className="mt-1 text-sm text-foreground">Refine by brand, model, and generation</p>
        </div>
        {(filter.brand || filter.model || filter.generation) && (
          <button
            onClick={() => onChange({})}
            className="rounded-full border border-border bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-secondary"
          >
            Clear
          </button>
        )}
      </div>
      <button
        onClick={() => onChange({})}
        className={cn(
          "mb-3 flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-colors",
          !filter.brand
            ? "border-primary/20 bg-primary/5 text-foreground shadow-sm"
            : "border-border bg-background text-muted-foreground hover:border-primary/20 hover:bg-secondary hover:text-foreground"
        )}
      >
        <Smartphone className="h-4 w-4 shrink-0" /> All Products
      </button>

      <ul className="space-y-2">
        {Object.entries(tree).map(([brand, models]) => (
          <li key={brand}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggle(brand)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label={`Toggle ${brand}`}
              >
                {expanded[brand] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => onChange({ brand })}
                className={cn(
                  "flex-1 rounded-2xl px-3 py-2 text-left text-sm font-semibold transition-colors",
                  filter.brand === brand && !filter.model
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                )}
              >
                {brand}
              </button>
            </div>

            {expanded[brand] && (
              <ul className="ml-5 mt-2 space-y-1 border-l border-border/70 pl-3">
                {Object.entries(models).map(([model, gens]) => {
                  const modelKey = `${brand}/${model}`;
                  return (
                    <li key={model}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggle(modelKey)}
                          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          aria-label={`Toggle ${model}`}
                        >
                          {expanded[modelKey] ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => onChange({ brand, model })}
                          className={cn(
                            "flex-1 rounded-xl px-2 py-1.5 text-left text-xs font-medium transition-colors",
                            filter.brand === brand && filter.model === model && !filter.generation
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-background hover:text-foreground"
                          )}
                        >
                          {model}
                        </button>
                      </div>
                      {expanded[modelKey] && (
                        <ul className="ml-4 border-l border-border/60 pl-3">
                          {gens.map((g) => (
                            <li key={g}>
                              <button
                                onClick={() => onChange({ brand, model, generation: g })}
                                className={cn(
                                  "block w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors",
                                  isActive(brand, model, g)
                                    ? "bg-primary/5 font-semibold text-primary"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                              >
                                {g}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};
