import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  Calendar03Icon,
  PackageIcon,
  FilterIcon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useMockStore } from "@/mocks/state"
import type { Order, OrderStatus } from "@/mocks/types"
import { getDemoNow } from "@/mocks/clock"
import {
  formatDateShort,
  formatIDR,
  formatRelative,
} from "@/components/store/format"

export const Route = createFileRoute("/store/history")({
  component: HistoryPage,
})

function useStorePersonaId(): string {
  const users = useMockStore((s) => s.users)
  const persona = users.find((u) => u.role === "store")
  return persona?.store_id ?? "store-001"
}

function HistoryPage() {
  const navigate = useNavigate()
  const storeId = useStorePersonaId()
  const allOrders = useMockStore((s) => s.orders)
  const orders = allOrders.filter((o) => o.store_id === storeId)
  const skus = useMockStore((s) => s.skus)
  const allLines = useMockStore((s) => s.orderLines)

  const [filterDate, setFilterDate] = React.useState<Date | undefined>(
    undefined,
  )
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(
    null,
  )

  const filtered = React.useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    if (!filterDate) return sorted
    const d = filterDate.toDateString()
    return sorted.filter(
      (o) => new Date(o.created_at).toDateString() === d,
    )
  }, [orders, filterDate])

  const selected = selectedOrderId
    ? orders.find((o) => o.id === selectedOrderId)
    : undefined
  const selectedLines = selected
    ? allLines.filter((l) => l.order_id === selected.id)
    : []
  const selectedTotal = selectedLines.reduce((sum, l) => {
    const sku = skus.find((s) => s.id === l.sku_id)
    return sum + l.requested_qty * (sku?.unit_price_idr ?? 0)
  }, 0)

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/95 px-3 py-3 backdrop-blur">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate({ to: "/store" })}
          aria-label="Kembali"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="font-heading text-sm font-semibold">
            Riwayat pesanan
          </div>
          <div className="text-[11px] text-muted-foreground">
            {filtered.length} dari {orders.length} pesanan
          </div>
        </div>
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1">
                <HugeiconsIcon
                  icon={filterDate ? Calendar03Icon : FilterIcon}
                  strokeWidth={2}
                />
                {filterDate ? formatDateShort(filterDate.toISOString()) : "Filter"}
              </Button>
            }
          />
          <PopoverContent align="end" className="w-auto p-2">
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={setFilterDate}
            />
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setFilterDate(undefined)}
            >
              Hapus filter
            </Button>
          </PopoverContent>
        </Popover>
      </header>

      <div className="flex-1 px-4 py-4">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Tidak ada pesanan pada tanggal terpilih.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((o) => (
              <li key={o.id}>
                <HistoryRow
                  order={o}
                  totalValue={computeOrderValue(o, allLines, skus)}
                  itemCount={countItems(o, allLines)}
                  onOpen={() => setSelectedOrderId(o.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null)
        }}
      >
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>
              {selected ? `Order ${selected.id.slice(0, 12)}` : "Detail"}
            </SheetTitle>
            <SheetDescription>
              {selected
                ? `${translateStatus(selected.status)}, dibuat ${formatRelative(selected.created_at, getDemoNow())}.`
                : ""}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-6 pb-6">
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {selectedLines.map((l) => {
                const sku = skus.find((s) => s.id === l.sku_id)
                return (
                  <li
                    key={l.sku_id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{sku?.name}</div>
                      <div className="text-[11px] text-muted-foreground tabular-nums">
                        {sku?.code}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="tabular-nums">
                        {l.requested_qty} unit
                      </div>
                      <div className="text-[11px] text-muted-foreground tabular-nums">
                        {formatIDR(
                          l.requested_qty * (sku?.unit_price_idr ?? 0),
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="flex items-center justify-between rounded-2xl bg-muted px-3 py-3 text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-heading text-base font-semibold tabular-nums">
                {formatIDR(selectedTotal)}
              </span>
            </div>
            {selected?.note ? (
              <div className="rounded-2xl border border-border p-3 text-sm">
                <div className="text-[11px] text-muted-foreground">
                  Catatan
                </div>
                <p className="mt-1">{selected.note}</p>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function HistoryRow({
  order,
  totalValue,
  itemCount,
  onOpen,
}: {
  order: Order
  totalValue: number
  itemCount: number
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-3xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/60"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <HugeiconsIcon
          icon={PackageIcon}
          strokeWidth={2}
          className="size-5"
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            Order {order.id.slice(0, 10)}
          </span>
          <StatusBadge status={order.status} />
        </div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {itemCount} item . {formatRelative(order.created_at, getDemoNow())}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-heading text-sm font-semibold tabular-nums">
          {formatIDR(totalValue)}
        </div>
      </div>
    </button>
  )
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    draft: { label: "Draft", variant: "secondary" },
    submitted: { label: "Terkirim", variant: "secondary" },
    confirmed: { label: "Dikonfirmasi", variant: "outline" },
    picking: { label: "Disiapkan", variant: "outline" },
    picked: { label: "Siap kirim", variant: "outline" },
    in_transit: { label: "Dalam perjalanan", variant: "default" },
    delivered: { label: "Diterima", variant: "secondary" },
    exception: { label: "Bermasalah", variant: "destructive" },
    closed: { label: "Selesai", variant: "secondary" },
  }
  const m = map[status]
  return <Badge variant={m.variant}>{m.label}</Badge>
}

function translateStatus(status: OrderStatus): string {
  return {
    draft: "Draft",
    submitted: "Menunggu konfirmasi",
    confirmed: "Disiapkan gudang",
    picking: "Sedang disiapkan",
    picked: "Siap dikirim",
    in_transit: "Dalam perjalanan",
    delivered: "Diterima",
    exception: "Bermasalah",
    closed: "Selesai",
  }[status]
}

function computeOrderValue(
  order: Order,
  allLines: ReturnType<typeof useMockStore.getState>["orderLines"],
  skus: ReturnType<typeof useMockStore.getState>["skus"],
): number {
  return allLines
    .filter((l) => l.order_id === order.id)
    .reduce((sum, l) => {
      const sku = skus.find((s) => s.id === l.sku_id)
      return sum + l.requested_qty * (sku?.unit_price_idr ?? 0)
    }, 0)
}

function countItems(
  order: Order,
  allLines: ReturnType<typeof useMockStore.getState>["orderLines"],
): number {
  return allLines
    .filter((l) => l.order_id === order.id)
    .reduce((sum, l) => sum + l.requested_qty, 0)
}

