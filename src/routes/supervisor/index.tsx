import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowRight02Icon,
  Image01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getDemoNow } from "@/mocks/clock"
import {
  selectClustersForDC,
  selectExceptionsForCluster,
  selectInferredStockForStore,
  selectOrderById,
  selectOrderLines,
  selectStoreById,
  selectStoresForCluster,
  useMockStore,
} from "@/mocks/state"
import type { ExceptionReason, Order, OrderLine, SKU, Store } from "@/mocks/types"
import { ClusterPicker } from "@/components/sup/cluster-picker"
import type { ClusterOption } from "@/components/sup/cluster-picker"
import { useSimulatedError } from "@/components/route-error"

export const Route = createFileRoute("/supervisor/")({
  component: SupervisorHomeRoute,
})

function SupervisorHomeRoute() {
  const errorView = useSimulatedError()
  if (errorView) return errorView
  return <SupervisorHome />
}

const STOCK_OUT_THRESHOLD_DAYS = 1.5
const ON_TIME_REFERENCE_HOURS = 24

function clusterLabel(id: string): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function reasonLabel(code: ExceptionReason): string {
  switch (code) {
    case "store_closed":
      return "Store closed"
    case "refused":
      return "Refused"
    case "damaged":
      return "Damaged"
    case "address_wrong":
      return "Address mismatch"
    default:
      return "Other"
  }
}

function reasonTone(code: ExceptionReason): "destructive" | "secondary" {
  return code === "damaged" || code === "refused" ? "destructive" : "secondary"
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  const now = getDemoNow().getTime()
  const diffMin = Math.round((now - then) / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hr ago`
  const diffDay = Math.round(diffHr / 24)
  return `${diffDay} d ago`
}

function formatDate(iso?: string): string {
  if (!iso) return "Not yet"
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  })
}

function SupervisorHome() {
  const state = useMockStore()
  const { dcs } = state

  const clusterOptions: ClusterOption[] = React.useMemo(() => {
    const options: ClusterOption[] = []
    for (const dc of dcs) {
      const clusters = selectClustersForDC(state, dc.id)
      for (const cluster of clusters) {
        const stores = selectStoresForCluster(state, cluster)
        options.push({
          id: cluster,
          label: clusterLabel(cluster),
          dcName: dc.name,
          storeCount: stores.length,
        })
      }
    }
    return options.sort((a, b) => a.label.localeCompare(b.label))
  }, [state, dcs])

  const defaultSelection = React.useMemo(
    () => clusterOptions.slice(0, 1).map((o) => o.id),
    [clusterOptions],
  )

  const [selectedClusters, setSelectedClusters] = React.useState<string[]>(
    defaultSelection,
  )

  React.useEffect(() => {
    if (
      selectedClusters.length > 0 &&
      selectedClusters.every((id) => !clusterOptions.find((o) => o.id === id))
    ) {
      setSelectedClusters(defaultSelection)
    }
  }, [clusterOptions, defaultSelection, selectedClusters])

  const effectiveClusters =
    selectedClusters.length === 0
      ? clusterOptions.map((o) => o.id)
      : selectedClusters

  const stores = React.useMemo(() => {
    const seen = new Set<string>()
    const collected: Store[] = []
    for (const id of effectiveClusters) {
      for (const store of selectStoresForCluster(state, id)) {
        if (!seen.has(store.id)) {
          seen.add(store.id)
          collected.push(store)
        }
      }
    }
    return collected
  }, [state, effectiveClusters])

  const rows = React.useMemo(() => {
    return stores.map((store) => {
      const orders = state.orders.filter((o) => o.store_id === store.id)
      const total = orders.length
      const delivered = orders.filter(
        (o) => o.status === "delivered" || o.status === "closed",
      ).length
      const exceptions = orders.filter((o) => o.status === "exception").length
      const active = orders.filter(
        (o) =>
          o.status !== "delivered" &&
          o.status !== "closed" &&
          o.status !== "exception",
      ).length
      const onTimePct =
        total === 0 ? null : Math.round((delivered / Math.max(total, 1)) * 100)
      const stock = selectInferredStockForStore(state, store.id)
      const lowStock = stock.filter(
        (s) => s.days_of_cover < STOCK_OUT_THRESHOLD_DAYS,
      ).length
      const lastDeliveredIso = orders
        .filter((o) => o.delivered_at)
        .map((o) => o.delivered_at as string)
        .sort()
        .pop()
      return {
        store,
        total,
        delivered,
        exceptions,
        active,
        onTimePct,
        lowStock,
        lastDeliveredIso,
      }
    })
  }, [state, stores])

  const exceptions = React.useMemo(() => {
    const collected = effectiveClusters.flatMap((id) =>
      selectExceptionsForCluster(state, id),
    )
    const seen = new Set<string>()
    return collected
      .filter((e) => {
        if (seen.has(e.id)) return false
        seen.add(e.id)
        return true
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
  }, [state, effectiveClusters])

  const [openOrderId, setOpenOrderId] = React.useState<string | null>(null)
  const openOrder = openOrderId ? selectOrderById(state, openOrderId) : undefined
  const openStore = openOrder ? selectStoreById(state, openOrder.store_id) : undefined
  const openLines: OrderLine[] = openOrder ? selectOrderLines(state, openOrder.id) : []
  const openException = openOrder
    ? state.exceptions.find((e) => e.order_id === openOrder.id)
    : undefined

  const totalStores = rows.length
  const storesNeedingAttention = rows.filter(
    (r) => r.exceptions > 0 || r.lowStock >= 2,
  ).length
  const totalLowStock = rows.reduce((acc, r) => acc + r.lowStock, 0)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Cluster health
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read the room across the stores you supervise. Switch clusters to
            shift focus.
          </p>
        </div>
        <ClusterPicker
          options={clusterOptions}
          value={selectedClusters}
          onChange={setSelectedClusters}
        />
      </header>

      <section
        aria-label="Cluster summary"
        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <Card size="sm">
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Stores in view</span>
            <span className="font-heading text-2xl font-semibold tabular-nums">
              {totalStores}
            </span>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Need attention
            </span>
            <span className="font-heading text-2xl font-semibold tabular-nums">
              {storesNeedingAttention}
            </span>
            <span className="text-xs text-muted-foreground">
              Open exceptions or two-plus low stock SKUs
            </span>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Low stock SKU count
            </span>
            <span className="font-heading text-2xl font-semibold tabular-nums">
              {totalLowStock}
            </span>
            <span className="text-xs text-muted-foreground">
              Below {STOCK_OUT_THRESHOLD_DAYS} days of cover
            </span>
          </CardContent>
        </Card>
      </section>

      <Card className="mb-6">
        <CardHeader className="border-b">
          <CardTitle>Store health</CardTitle>
          <CardDescription>
            Computed from order history and inferred stock. Hover any metric for
            its definition.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              Pick at least one cluster to see stores.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>
                    <MetricLabel
                      label="On time"
                      hint="Delivered orders divided by all orders ever placed for this store."
                    />
                  </TableHead>
                  <TableHead>
                    <MetricLabel
                      label="Low stock"
                      hint={`SKUs with under ${STOCK_OUT_THRESHOLD_DAYS} days of cover, based on inferred burn rate.`}
                    />
                  </TableHead>
                  <TableHead>Last delivery</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.store.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{row.store.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {clusterLabel(row.store.cluster_id)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.onTimePct === null ? (
                        <span className="text-muted-foreground">No data</span>
                      ) : (
                        <span className="font-medium">{row.onTimePct}%</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.lowStock > 0 ? (
                        <Badge variant="destructive">
                          {row.lowStock} SKUs
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Healthy</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(row.lastDeliveredIso)}
                    </TableCell>
                    <TableCell className="tabular-nums">{row.active}</TableCell>
                    <TableCell>
                      <StatusBadge
                        exceptions={row.exceptions}
                        lowStock={row.lowStock}
                        onTimePct={row.onTimePct}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <section aria-label="Today's exceptions" className="grid gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Recent exceptions
            </h2>
            <p className="text-sm text-muted-foreground">
              Drill in to see what the driver reported. Read only here.
            </p>
          </div>
          <Badge variant="secondary" className="font-normal">
            {exceptions.length} open
          </Badge>
        </div>
        <Card>
          <CardContent className="p-0">
            {exceptions.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                No exceptions in the selected clusters. Quiet day so far.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {exceptions.map((ex) => {
                  const order = selectOrderById(state, ex.order_id)
                  const store = order
                    ? selectStoreById(state, order.store_id)
                    : undefined
                  return (
                    <li
                      key={ex.id}
                      className="flex items-start gap-3 px-5 py-4 text-sm"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                      >
                        <HugeiconsIcon
                          icon={Alert02Icon}
                          strokeWidth={2}
                          className="size-4"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {store?.name ?? "Unknown store"}
                          </span>
                          <Badge variant={reasonTone(ex.reason_code)}>
                            {reasonLabel(ex.reason_code)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(ex.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-muted-foreground">
                          {ex.note}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenOrderId(ex.order_id)}
                      >
                        Open
                        <HugeiconsIcon
                          icon={ArrowRight02Icon}
                          strokeWidth={2}
                        />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <Sheet
        open={openOrderId !== null}
        onOpenChange={(open) => {
          if (!open) setOpenOrderId(null)
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          {openOrder ? (
            <OrderDetail
              order={openOrder}
              store={openStore}
              lines={openLines}
              skus={state.skus}
              exception={openException}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function MetricLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="inline-flex items-center gap-1 text-foreground">
            {label}
            <HugeiconsIcon
              icon={InformationCircleIcon}
              strokeWidth={2}
              className="size-3.5 text-muted-foreground"
            />
          </span>
        }
      />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}

function StatusBadge({
  exceptions,
  lowStock,
  onTimePct,
}: {
  exceptions: number
  lowStock: number
  onTimePct: number | null
}) {
  if (exceptions > 0) {
    return <Badge variant="destructive">{exceptions} exception</Badge>
  }
  if (lowStock >= 2) {
    return <Badge variant="secondary">Watch</Badge>
  }
  if (onTimePct !== null && onTimePct < 70) {
    return <Badge variant="secondary">Lagging</Badge>
  }
  return <Badge variant="outline">Healthy</Badge>
}

function OrderDetail({
  order,
  store,
  lines,
  skus,
  exception,
}: {
  order: Order
  store: Store | undefined
  lines: OrderLine[]
  skus: SKU[]
  exception:
    | {
        reason_code: ExceptionReason
        note: string
        photo_url: string
        created_at: string
      }
    | undefined
}) {
  const skuLookup = React.useMemo(() => {
    const map = new Map<string, SKU>()
    for (const sku of skus) map.set(sku.id, sku)
    return map
  }, [skus])

  const requested = lines.reduce((acc, l) => acc + l.requested_qty, 0)
  const delivered = lines.reduce((acc, l) => acc + l.delivered_qty, 0)

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="border-b">
        <SheetTitle>Order {order.id}</SheetTitle>
        <SheetDescription>
          {store?.name ?? "Unknown store"}, {store?.address ?? ""}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="mt-1 font-medium capitalize">
              {order.status.replace("_", " ")}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Contact</div>
            <div className="mt-1 font-medium">{store?.contact ?? "Unknown"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Requested</div>
            <div className="mt-1 font-medium tabular-nums">
              {requested} units
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Delivered</div>
            <div className="mt-1 font-medium tabular-nums">
              {delivered} units
            </div>
          </div>
        </div>

        {exception ? (
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                {reasonLabel(exception.reason_code)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {timeAgo(exception.created_at)}
              </span>
            </div>
            <p className="mt-2 text-foreground">{exception.note}</p>
            <div className="mt-3 flex aspect-video items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <div className="flex flex-col items-center gap-1 text-xs">
                <HugeiconsIcon
                  icon={Image01Icon}
                  strokeWidth={2}
                  className="size-6"
                />
                <span>Driver photo placeholder</span>
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <div className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Order lines
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Req</TableHead>
                  <TableHead className="text-right">Del</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => {
                  const sku = skuLookup.get(line.sku_id)
                  return (
                    <TableRow key={line.sku_id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {sku?.name ?? line.sku_id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {sku?.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {line.requested_qty}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {line.delivered_qty}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Supervisor view is read only. To resolve, ask the DC ops team or the
          assigned driver.
        </p>
      </div>
    </div>
  )
}

// Reference value kept for future on-time calculations.
void ON_TIME_REFERENCE_HOURS
