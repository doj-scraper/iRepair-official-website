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
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Browse
        </h2>
        {(filter.brand || filter.model || filter.generation) && (
          <button
            onClick={() => onChange({})}
            className="text-[10px] font-semibold uppercase tracking-wide text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      <button
        onClick={() => onChange({})}
        className={cn(
          "mb-1 flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm font-medium transition-colors",
          !filter.brand
            ? "border-l-2 border-primary bg-primary/8 text-foreground font-semibold pl-1.5"
            : "border-l-2 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground pl-1.5"
        )}
      >
        <Smartphone className="h-3.5 w-3.5 shrink-0" /> All Products
      </button>

      <ul className="mt-1 space-y-0.5">
        {Object.entries(tree).map(([brand, models]) => (
          <li key={brand}>
            <div className="flex items-center">
              <button
                onClick={() => toggle(brand)}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label={`Toggle ${brand}`}
              >
                {expanded[brand] ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => onChange({ brand })}
                className={cn(
                  "flex-1 rounded px-2 py-1.5 text-left text-sm font-semibold transition-colors",
                  filter.brand === brand && !filter.model
                    ? "text-foreground"
                    : "text-foreground/80 hover:text-foreground"
                )}
              >
                {brand}
              </button>
            </div>

            {expanded[brand] && (
              <ul className="ml-5 mt-0.5 space-y-0 border-l-2 border-border">
                {Object.entries(models).map(([model, gens]) => {
                  const modelKey = `${brand}/${model}`;
                  return (
                    <li key={model}>
                      <div className="flex items-center">
                        <button
                          onClick={() => toggle(modelKey)}
                          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                          aria-label={`Toggle ${model}`}
                        >
                          {expanded[modelKey] ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          onClick={() => onChange({ brand, model })}
                          className={cn(
                            "flex-1 pl-1 py-1 text-left text-xs transition-colors",
                            filter.brand === brand && filter.model === model && !filter.generation
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {model}
                        </button>
                      </div>
                      {expanded[modelKey] && (
                        <ul className="ml-4 border-l border-border/60">
                          {gens.map((g) => (
                            <li key={g}>
                              <button
                                onClick={() => onChange({ brand, model, generation: g })}
                                className={cn(
                                  "block w-full py-1 pl-3 text-left text-xs transition-colors",
                                  isActive(brand, model, g)
                                    ? "font-semibold text-primary"
                                    : "text-muted-foreground hover:text-foreground"
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
