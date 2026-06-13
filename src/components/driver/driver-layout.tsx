import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BatteryFullIcon,
  CellularNetworkIcon,
  Wifi02Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { useMockStore } from "@/mocks/state"
import type { User } from "@/mocks/types"

export function useDefaultDriver(): User | undefined {
  const users = useMockStore((s) => s.users)
  return users.find((u) => u.role === "driver")
}

export function DriverLayout({ children }: { children: React.ReactNode }) {
  const driver = useDefaultDriver()
  const waves = useMockStore((s) => s.waves)
  const allOrders = useMockStore((s) => s.orders)

  const wave = driver
    ? waves.find(
        (w) => w.driver_user_id === driver.id && w.status !== "completed",
      )
    : undefined
  const orders = wave ? allOrders.filter((o) => wave.order_ids.includes(o.id)) : []

  const total = orders.length
  const delivered = orders.filter((o) => o.status === "delivered").length
  const exceptionCount = orders.filter((o) => o.status === "exception").length
  const remaining = Math.max(0, total - delivered - exceptionCount)

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-start justify-center bg-muted/40 p-4 sm:p-6">
      <div
        className={cn(
          "relative w-full max-w-[420px] overflow-hidden rounded-[2.5rem] border border-border bg-background shadow-2xl ring-1 ring-foreground/5",
          "min-h-[760px]",
        )}
      >
        <div className="flex h-9 items-center justify-between border-b border-border/60 bg-card px-5 text-[11px] font-medium tabular-nums text-muted-foreground">
          <span>9:41</span>
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={CellularNetworkIcon} strokeWidth={2} className="size-3.5" />
            <HugeiconsIcon icon={Wifi02Icon} strokeWidth={2} className="size-3.5" />
            <HugeiconsIcon icon={BatteryFullIcon} strokeWidth={2} className="size-3.5" />
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div className="min-w-0">
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
              Signed in
            </p>
            <p className="truncate font-heading text-sm font-medium">
              {driver?.name ?? "No driver"}
            </p>
          </div>
          {total > 0 && (
            <div className="text-right">
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                Progress
              </p>
              <p className="font-heading text-sm font-semibold tabular-nums">
                {delivered + exceptionCount} of {total}
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-5 pb-24">{children}</div>

        {total > 0 && (
          <div className="absolute inset-x-0 bottom-0 border-t border-border bg-card/95 px-5 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {delivered} delivered, {exceptionCount} exception
                {exceptionCount === 1 ? "" : "s"}, {remaining} left
              </span>
              <span className="font-heading text-sm font-semibold tabular-nums">
                {Math.round(((delivered + exceptionCount) / total) * 100)}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${((delivered + exceptionCount) / total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
