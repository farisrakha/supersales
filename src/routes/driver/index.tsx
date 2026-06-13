import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight02Icon,
  Location01Icon,
  Tick02Icon,
  Alert02Icon,
  Clock01Icon,
  TruckIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useMockStore } from "@/mocks/state"
import { useDefaultDriver } from "@/components/driver/driver-layout"
import type { Order } from "@/mocks/types"
import { useSimulatedError } from "@/components/route-error"

export const Route = createFileRoute("/driver/")({
  component: DriverTodayRoute,
})

function DriverTodayRoute() {
  const errorView = useSimulatedError()
  if (errorView) return errorView
  return <DriverTodayPage />
}

type StopStatus = "queued" | "arrived" | "delivered" | "exception"

function resolveStopStatus(order: Order): StopStatus {
  if (order.status === "exception") return "exception"
  if (order.status === "delivered") return "delivered"
  if (order.arrived_at) return "arrived"
  return "queued"
}

function statusLabel(s: StopStatus): string {
  switch (s) {
    case "queued":
      return "Queued"
    case "arrived":
      return "Arrived"
    case "delivered":
      return "Delivered"
    case "exception":
      return "Exception"
  }
}

function statusVariant(
  s: StopStatus,
): "secondary" | "default" | "destructive" | "outline" {
  switch (s) {
    case "queued":
      return "outline"
    case "arrived":
      return "secondary"
    case "delivered":
      return "default"
    case "exception":
      return "destructive"
  }
}

function DriverTodayPage() {
  const navigate = useNavigate()
  const driver = useDefaultDriver()
  const stores = useMockStore((s) => s.stores)
  const waves = useMockStore((s) => s.waves)
  const allOrders = useMockStore((s) => s.orders)

  const driverWave = driver
    ? waves.find(
        (w) => w.driver_user_id === driver.id && w.status !== "completed",
      )
    : undefined
  const route = driverWave
    ? {
        wave: driverWave,
        orders: allOrders.filter((o) => driverWave.order_ids.includes(o.id)),
      }
    : undefined

  if (!driver) {
    return (
      <Card size="sm">
        <CardContent className="py-6 text-sm text-muted-foreground">
          No driver account is loaded in this scenario.
        </CardContent>
      </Card>
    )
  }

  const heading = (
    <header className="flex flex-col gap-1">
      <p className="text-xs tracking-wide text-muted-foreground uppercase">
        Today, Tuesday 26 May
      </p>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Today's route
      </h1>
    </header>
  )

  if (!route) {
    return (
      <div className="flex flex-col gap-5">
        {heading}
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <HugeiconsIcon icon={TruckIcon} strokeWidth={2} />
            </span>
            <p className="font-heading text-base font-medium">No route yet</p>
            <p className="max-w-[26ch] text-sm text-muted-foreground">
              The dispatcher will send your stops when the wave is ready.
              Check back shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const truck = useMockStore.getState().trucks.find(
    (t) => t.id === route.wave.truck_id,
  )
  const orders = route.orders

  function storeFor(id: string) {
    return stores.find((s) => s.id === id)
  }

  return (
    <div className="flex flex-col gap-5">
      {heading}

      <Card size="sm" className="bg-muted/40 shadow-none">
        <CardContent className="flex items-center justify-between py-1 text-sm">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={TruckIcon}
              strokeWidth={2}
              className="text-muted-foreground"
            />
            <span className="font-medium tabular-nums">
              {truck?.plate ?? "Unassigned"}
            </span>
          </div>
          <span className="text-muted-foreground">
            {orders.length} stop{orders.length === 1 ? "" : "s"}
          </span>
        </CardContent>
      </Card>

      <ol className="flex flex-col gap-3">
        {orders.map((order, idx) => {
          const stopStatus = resolveStopStatus(order)
          const store = storeFor(order.store_id)
          return (
            <li key={order.id}>
              <Card
                size="sm"
                onClick={() =>
                  navigate({
                    to: "/driver/stop/$stopId",
                    params: { stopId: order.id },
                  })
                }
                className="cursor-pointer transition-colors hover:bg-muted/40"
              >
                <CardContent className="flex items-start gap-3 py-1">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-sm font-semibold tabular-nums">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-heading text-sm font-medium">
                        {store?.name ?? "Unknown store"}
                      </p>
                      <Badge variant={statusVariant(stopStatus)}>
                        {stopStatus === "delivered" && (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            strokeWidth={2.5}
                            data-icon="inline-start"
                          />
                        )}
                        {stopStatus === "exception" && (
                          <HugeiconsIcon
                            icon={Alert02Icon}
                            strokeWidth={2.5}
                            data-icon="inline-start"
                          />
                        )}
                        {stopStatus === "arrived" && (
                          <HugeiconsIcon
                            icon={Clock01Icon}
                            strokeWidth={2.5}
                            data-icon="inline-start"
                          />
                        )}
                        {statusLabel(stopStatus)}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                      <HugeiconsIcon
                        icon={Location01Icon}
                        strokeWidth={2}
                        className="mt-0.5 size-3 shrink-0"
                      />
                      <span className="line-clamp-1">
                        {store?.address ?? "Address not on file"}
                      </span>
                    </p>
                  </div>
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    strokeWidth={2}
                    className="mt-2 size-4 text-muted-foreground"
                  />
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
