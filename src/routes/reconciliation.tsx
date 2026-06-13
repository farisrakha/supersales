import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMockStore } from "@/mocks/state"
import type { Order } from "@/mocks/types"

import { OrderStatusBadge } from "@/components/dc/status-badge"
import { EmptyState } from "@/components/dc/empty-state"
import { formatClock } from "@/components/dc/format"
import {
  getActiveDcId,
  ordersForDc,
  storeName,
} from "@/components/dc/selectors"

export const Route = createFileRoute("/reconciliation")({
  component: ReconciliationPage,
})

function ReconciliationPage() {
  const stores = useMockStore((s) => s.stores)
  const orders = useMockStore((s) => s.orders)
  const waves = useMockStore((s) => s.waves)
  const exceptions = useMockStore((s) => s.exceptions)
  const closeDay = useMockStore((s) => s.closeDay)

  const state = useMockStore.getState()
  const activeDcId = getActiveDcId(state)
  const dcOrders = React.useMemo(
    () => ordersForDc(state, activeDcId),
    [orders, stores, activeDcId],
  )
  const dcWaves = waves.filter((w) => w.dc_id === activeDcId)
  const [closeOpen, setCloseOpen] = React.useState(false)

  const planned = dcOrders.filter((o) =>
    ["delivered", "in_transit", "exception", "closed"].includes(o.status),
  )

  const exceptionOrderIds = new Set(exceptions.map((e) => e.order_id))
  const needsReason = planned.filter(
    (o) =>
      o.status !== "delivered" &&
      o.status !== "closed" &&
      !exceptionOrderIds.has(o.id) &&
      !o.flagged_reason,
  )
  const canClose = planned.length > 0 && needsReason.length === 0

  // Grouped per wave plus an unassigned bucket.
  const groups = React.useMemo(() => {
    const map = new Map<string, Order[]>()
    for (const o of planned) {
      const key = o.wave_id ?? "no-wave"
      const cur = map.get(key) ?? []
      cur.push(o)
      map.set(key, cur)
    }
    return Array.from(map.entries())
  }, [planned])

  const [activeTab, setActiveTab] = React.useState<string>(
    groups[0]?.[0] ?? "no-wave",
  )

  React.useEffect(() => {
    if (!groups.find(([k]) => k === activeTab)) {
      setActiveTab(groups[0]?.[0] ?? "no-wave")
    }
  }, [groups, activeTab])

  const delivered = planned.filter(
    (o) => o.status === "delivered" || o.status === "closed",
  ).length
  const exceptionsCount = planned.filter(
    (o) => o.status === "exception",
  ).length

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Reconciliation
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Review what was delivered today and what is still open. Close the
            day to lock the books for finance.
          </p>
        </div>
        <Button
          disabled={!canClose}
          onClick={() => setCloseOpen(true)}
          title={
            canClose
              ? "Close today and lock delivered orders"
              : "Resolve open stops with a reason or exception first"
          }
        >
          Close day
        </Button>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <SummaryTile label="Planned today" value={planned.length} />
        <SummaryTile
          label="Delivered"
          value={delivered}
          tone={delivered > 0 ? "ok" : "neutral"}
        />
        <SummaryTile
          label="Exceptions"
          value={exceptionsCount}
          tone={exceptionsCount > 0 ? "warn" : "neutral"}
        />
      </section>

      {needsReason.length > 0 ? (
        <Card className="mb-4 border-amber-500/40 bg-amber-500/5">
          <CardContent className="py-4 text-sm">
            <div className="font-medium text-amber-700 dark:text-amber-300">
              {needsReason.length} stop{needsReason.length === 1 ? "" : "s"}{" "}
              still need a reason before closing.
            </div>
            <p className="mt-1 text-muted-foreground">
              Mark each as delivered, or report an exception from In transit.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {planned.length === 0 ? (
        <EmptyState
          title="Nothing planned today"
          description="Once orders are dispatched, this view tracks delivery progress and reconciliation."
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="mb-4 flex-wrap">
            {groups.map(([waveId, list]) => {
              const wave = dcWaves.find((w) => w.id === waveId)
              const label =
                waveId === "no-wave"
                  ? "Unassigned"
                  : wave
                    ? `Wave ${waveId.slice(0, 10)}`
                    : `Wave ${waveId.slice(0, 10)}`
              return (
                <TabsTrigger key={waveId} value={waveId}>
                  {label}
                  <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                    {list.length}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {groups.map(([waveId, list]) => (
            <TabsContent key={waveId} value={waveId}>
              <Card className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivered at</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((o) => {
                      const reason = exceptions.find(
                        (e) => e.order_id === o.id,
                      )
                      return (
                        <TableRow key={o.id}>
                          <TableCell>
                            <div className="font-medium">
                              {storeName(stores, o.store_id)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {o.id.slice(0, 16)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={o.status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {o.delivered_at
                              ? formatClock(o.delivered_at)
                              : "Pending"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {reason ? (
                              <span className="text-destructive">
                                {reason.reason_code.replace(/_/g, " ")},{" "}
                                {reason.note || "no note"}
                              </span>
                            ) : o.flagged_reason ? (
                              <span className="text-amber-700 dark:text-amber-300">
                                Flagged: {o.flagged_reason}
                              </span>
                            ) : o.status === "delivered" ||
                              o.status === "closed" ? (
                              <span className="text-emerald-700 dark:text-emerald-300">
                                Clean delivery
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Needs reason
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close the day</AlertDialogTitle>
            <AlertDialogDescription>
              {delivered} delivered orders will be moved to closed. Exceptions
              stay open for follow up. This action is mocked and can be reset
              with the scenario selector.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                closeDay(activeDcId)
                setCloseOpen(false)
                toast.success("Day closed", {
                  description: `${delivered} delivered orders moved to closed.`,
                })
              }}
            >
              Close day
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SummaryTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: number
  tone?: "neutral" | "ok" | "warn"
}) {
  const colorClass =
    tone === "ok"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "warn" && value > 0
        ? "text-destructive"
        : "text-foreground"
  return (
    <Card size="sm" className="shadow-none ring-1 ring-border">
      <CardContent className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span
          className={`font-heading text-3xl font-semibold tabular-nums ${colorClass}`}
        >
          {value}
        </span>
      </CardContent>
    </Card>
  )
}

