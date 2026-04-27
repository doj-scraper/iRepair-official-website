import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  compact?: boolean;
  variant?: "default" | "light";
}

export const Logo = ({ compact = false, variant = "default" }: LogoProps) => {
  const isLight = variant === "light";
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded gradient-primary shadow-elegant">
        <Wrench className="h-4 w-4 text-white" strokeWidth={2.5} />
      </div>
      {!compact && (
        <div className="leading-none">
          <div
            className={cn(
              "font-display text-[17px] font-bold tracking-tight",
              isLight ? "text-white" : "text-foreground"
            )}
          >
            <span className="text-primary">i</span>Repair
          </div>
          <div
            className={cn(
              "text-[9px] font-semibold uppercase tracking-[0.2em]",
              isLight ? "text-white/45" : "text-muted-foreground"
            )}
          >
            Technologies
          </div>
        </div>
      )}
    </div>
  );
};
