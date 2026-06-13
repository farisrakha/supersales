import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useMockStore } from "@/mocks/state"
import type { OrderStatus, Store } from "@/mocks/types"

import { OrderStatusBadge } from "@/components/dc/status-badge"
import { EmptyState } from "@/components/dc/empty-state"
import {
  formatRelative,
  formatShortDate,
} from "@/components/dc/format"
import { getActiveDcId } from "@/components/dc/selectors"

export const Route = createFileRoute("/stores")({ component: StoresPage })

function coverTone(days: number): {
  label: string
  className: string
} {
  if (days < 3)
    return {
      label: "Critical",
      className: "bg-destructive/10 text-destructive",
    }
  if (days < 7)
    return {
      label: "Low",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    }
  return {
    label: "Healthy",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  }
}

function StoresPage() {
  const stores = useMockStore((s) => s.stores)
  const orders = useMockStore((s) => s.orders)
  const exceptions = useMockStore((s) => s.exceptions)
  const inferredStock = useMockStore((s) => s.inferredStock)
  const skus = useMockStore((s) => s.skus)

  const activeDcId = getActiveDcId(useMockStore.getState())
  const dcStores = stores.filter((s) => s.home_dc_id === activeDcId)

  const [search, setSearch] = React.useState("")
  const [cluster, setCluster] = React.useState<string>("all")
  const [openStoreId, setOpenStoreId] = React.useState<string | null>(null)

  const clusters = React.useMemo(() => {
    return Array.from(new Set(dcStores.map((s) => s.cluster_id))).sort()
  }, [dcStores])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return dcStores.filter((s) => {
      if (cluster !== "all" && s.cluster_id !== cluster) return false
      if (q && !s.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [dcStores, search, cluster])

  const storeStats = React.useMemo(() => {
    const map = new Map<
      string,
      {
        lastDelivered?: string
        active: number
        onTime: number
      }
    >()
    for (const o of orders) {
      const cur = map.get(o.store_id) ?? {
        lastDelivered: undefined,
        active: 0,
        onTime: 92,
      }
      if (
        o.status !== "delivered" &&
        o.status !== "closed" &&
        o.status !== "draft"
      ) {
        cur.active += 1
      }
      if (
        o.delivered_at &&
        (!cur.lastDelivered ||
          new Date(o.delivered_at) > new Date(cur.lastDelivered))
      ) {
        cur.lastDelivered = o.delivered_at
      }
      map.set(o.store_id, cur)
    }
    // synthesize a stable per-store on-time
    for (const s of stores) {
      const cur = map.get(s.id) ?? { active: 0, onTime: 92 }
      const seed = s.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
      cur.onTime = 80 + (seed % 18)
      map.set(s.id, cur)
    }
    return map
  }, [orders, stores])

  const openStore = openStoreId
    ? stores.find((s) => s.id === openStoreId)
    : undefined

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Stores
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Retail outlets served by this DC. Click a row for inferred stock,
          recent orders, and open exceptions.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search store name"
            className="w-64 pl-9"
          />
        </div>
        <Select
          value={cluster}
          onValueChange={(v) =>
            setCluster(typeof v === "string" ? v : "all")
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clusters</SelectItem>
            {clusters.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-auto">
          {filtered.length} stores
        </Badge>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No stores match"
          description="Clear the search or pick a different cluster."
        />
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Last delivered</TableHead>
                <TableHead className="text-right">On-time</TableHead>
                <TableHead className="text-right">Active orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const stat = storeStats.get(s.id)
                const onTime = stat?.onTime ?? 0
                return (
                  <TableRow
                    key={s.id}
                    className="cursor-pointer"
                    onClick={() => setOpenStoreId(s.id)}
                  >
                    <TableCell>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {s.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {s.cluster_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {stat?.lastDelivered
                        ? formatRelative(stat.lastDelivered)
                        : "No deliveries yet"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span
                        className={
                          onTime >= 92
                            ? "text-emerald-700 dark:text-emerald-300"
                            : onTime >= 85
                              ? "text-foreground"
                              : "text-destructive"
                        }
                      >
                        {onTime}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {stat?.active ?? 0}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Sheet
        open={!!openStore}
        onOpenChange={(o) => (o ? null : setOpenStoreId(null))}
      >
        {openStore ? (
          <StoreDetailSheet
            store={openStore}
            stock={inferredStock
              .filter((i) => i.store_id === openStore.id)
              .map((i) => ({
                ...i,
                sku: skus.find((s) => s.id === i.sku_id),
              }))}
            orders={orders
              .filter((o) => o.store_id === openStore.id)
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .slice(0, 8)}
            exceptions={exceptions.filter((e) =>
              orders.some(
                (o) => o.id === e.order_id && o.store_id === openStore.id,
              ),
            )}
          />
        ) : null}
      </Sheet>
    </div>
  )
}

function StoreDetailSheet({
  store,
  stock,
  orders,
  exceptions,
}: {
  store: Store
  stock: Array<{
    sku_id: string
    on_hand_estimate: number
    days_of_cover: number
    sku: { name?: string; code?: string } | undefined
  }>
  orders: Array<{
    id: string
    created_at: string
    status: OrderStatus
  }>
  exceptions: Array<{ id: string; reason_code: string; note: string }>
}) {
  const sortedStock = stock
    .slice()
    .sort((a, b) => a.days_of_cover - b.days_of_cover)
  return (
    <SheetContent className="flex w-full flex-col sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>{store.name}</SheetTitle>
        <SheetDescription>
          {store.address}, {store.cluster_id}. Contact {store.contact}.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-4 text-sm">
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Inferred stock
          </h3>
          {sortedStock.length === 0 ? (
            <p className="text-muted-foreground">
              No recent stock signal. The engine will compute on next pulse.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">On-hand</TableHead>
                    <TableHead className="text-right">Cover</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStock.slice(0, 10).map((row) => {
                    const tone = coverTone(row.days_of_cover)
                    return (
                      <TableRow key={row.sku_id}>
                        <TableCell>
                          <div className="font-medium">
                            {row.sku?.name ?? row.sku_id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {row.sku?.code}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.on_hand_estimate}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="ghost" className={tone.className}>
                            {row.days_of_cover.toFixed(1)} d, {tone.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recent orders
          </h3>
          {orders.length === 0 ? (
            <p className="text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">
                        {o.id.slice(0, 14)}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatShortDate(o.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        {exceptions.length > 0 ? (
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pending exceptions
            </h3>
            <ul className="grid gap-2">
              {exceptions.map((e) => (
                <li
                  key={e.id}
                  className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm"
                >
                  <div className="font-medium text-destructive">
                    {e.reason_code.replace(/_/g, " ")}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {e.note || "No note"}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SheetContent>
  )
}
