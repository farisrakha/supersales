import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  ExceptionReason,
  OrderStatus,
  WaveStatus,
} from "@/mocks/types"

const orderTone: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  submitted: {
    label: "Submitted",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  picking: {
    label: "Picking",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  picked: {
    label: "Picked",
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  in_transit: {
    label: "In transit",
    className: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  exception: {
    label: "Exception",
    className: "bg-destructive/10 text-destructive",
  },
  closed: {
    label: "Closed",
    className: "bg-muted text-muted-foreground",
  },
}

const waveTone: Record<WaveStatus, { label: string; className: string }> = {
  building: {
    label: "Building",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  dispatched: {
    label: "Dispatched",
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  in_transit: {
    label: "In transit",
    className: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
}

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus
  className?: string
}) {
  const tone = orderTone[status]
  return (
    <Badge variant="ghost" className={cn(tone.className, className)}>
      {tone.label}
    </Badge>
  )
}

export function WaveStatusBadge({
  status,
  className,
}: {
  status: WaveStatus
  className?: string
}) {
  const tone = waveTone[status]
  return (
    <Badge variant="ghost" className={cn(tone.className, className)}>
      {tone.label}
    </Badge>
  )
}

export function exceptionReasonLabel(code: ExceptionReason | string): string {
  switch (code) {
    case "store_closed":
      return "Store closed"
    case "refused":
      return "Refused"
    case "damaged":
      return "Damaged on arrival"
    case "address_wrong":
      return "Address mismatch"
    case "other":
      return "Other"
    default:
      return code
  }
}
