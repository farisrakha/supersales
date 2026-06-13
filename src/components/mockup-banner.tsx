import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

export function MockupBanner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Mockup notice"
      className={cn(
        "flex items-center gap-2 border-b border-border bg-accent/40 px-4 py-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <HugeiconsIcon
        icon={InformationCircleIcon}
        strokeWidth={2}
        className="size-3.5 shrink-0"
      />
      <span className="truncate">
        Mockup. Data is illustrative, actions persist only in this session.
      </span>
    </div>
  )
}
