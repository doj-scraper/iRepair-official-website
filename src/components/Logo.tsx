import { cn } from "@/lib/utils";

interface LogoProps {
  compact?: boolean;
  variant?: "default" | "light";
  className?: string;
}

export const Logo = ({ compact = false, variant = "default", className }: LogoProps) => {
  const isLight = variant === "light";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden shadow-elegant",
          isLight
            ? "border border-white/15 bg-white/10"
            : "border border-hairline/50 bg-gradient-to-br from-primary via-primary to-primary-deep",
        )}
      >
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 h-0.5",
            isLight ? "bg-white/70" : "bg-hairline/90"
          )}
          aria-hidden="true"
        />
        <svg
          viewBox="0 0 36 36"
          className="relative h-5 w-5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8 25.5C11.2 22.3 14.8 20.7 18 20.7C21.2 20.7 24.8 22.3 28 25.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M10.8 20.8C13.4 18.2 15.9 16.9 18 16.9C20.1 16.9 22.6 18.2 25.2 20.8"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M13.9 16C15.7 14.2 17.1 13.4 18 13.4C18.9 13.4 20.3 14.2 22.1 16"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="18" cy="28.2" r="1.9" fill="white" />
        </svg>
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
