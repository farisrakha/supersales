import { Badge } from "@/components/ui/badge"

export type DeltaDirection = "up-good" | "down-good" | "neutral"

interface DeltaBadgeProps {
  current: number
  previous: number
  betterDirection: "up" | "down"
  unit?: string
}

export function DeltaBadge({
  current,
  previous,
  betterDirection,
  unit = "",
}: DeltaBadgeProps) {
  const diff = current - previous
  const rounded = Math.round(diff * 10) / 10
  const sign = rounded > 0 ? "+" : rounded < 0 ? "" : ""
  if (rounded === 0) {
    return (
      <Badge variant="outline" className="font-normal">
        Flat vs last period
      </Badge>
    )
  }
  const improving =
    (rounded > 0 && betterDirection === "up") ||
    (rounded < 0 && betterDirection === "down")
  const label = `${sign}${rounded}${unit} vs last period`
  if (improving) {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      >
        {label}
      </Badge>
    )
  }
  return (
    <Badge variant="destructive" className="font-medium">
      {label}
    </Badge>
  )
}
