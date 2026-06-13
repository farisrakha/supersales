import { cn } from "@/lib/utils"

interface TrendRowProps {
  values: number[]
  className?: string
  tone?: "neutral" | "warn"
}

// Renders a small set of vertical bars as a hint at the period's shape.
// Pure divs, no chart library. Heights scale to the largest value in the row.
export function TrendRow({ values, className, tone = "neutral" }: TrendRowProps) {
  const max = Math.max(...values, 1)
  return (
    <div
      className={cn("flex h-7 items-end gap-1", className)}
      aria-hidden="true"
    >
      {values.map((v, i) => {
        const pct = Math.max(8, Math.round((v / max) * 100))
        return (
          <div
            key={i}
            className={cn(
              "w-1.5 rounded-sm",
              tone === "warn"
                ? "bg-destructive/40"
                : "bg-foreground/30",
            )}
            style={{ height: `${pct}%` }}
          />
        )
      })}
    </div>
  )
}
