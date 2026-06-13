import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Camera01Icon,
  Clock02Icon,
  MoreHorizontalIcon,
  RouteIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useMockStore } from "@/mocks/state"
import type {
  ExceptionReason,
  Order,
  OrderLine,
  OrderStatus,
} from "@/mocks/types"

import {
  exceptionReasonLabel,
  OrderStatusBadge,
} from "@/components/dc/status-badge"
import { EmptyState } from "@/components/dc/empty-state"
import { formatClock } from "@/components/dc/format"
import {
  getActiveDcId,
  progressForWave,
  storeName,
} from "@/components/dc/selectors"

export const Route = createFileRoute("/in-transit")({
  component: InTransitPage,
})

type StopStatus = "queued" | "arrived" | "delivered" | "exception"

function stopStatusFor(o: Order): StopStatus {
  if (o.status === "exception") return "exception"
  if (o.status === "delivered" || o.status === "closed") return "delivered"
  if (o.arrived_at) return "arrived"
  return "queued"
}

function InTransitPage() {
  const stores = useMockStore((s) => s.stores)
  const orders = useMockStore((s) => s.orders)
  const orderLines = useMockStore((s) => s.orderLines)
  const waves = useMockStore((s) => s.waves)
  const trucks = useMockStore((s) => s.trucks)
  const users = useMockStore((s) => s.users)
  const exceptions = useMockStore((s) => s.exceptions)
  const markStopArrived = useMockStore((s) => s.markStopArrived)
  const deliverStop = useMockStore((s) => s.deliverStop)
  const reportException = useMockStore((s) => s.reportException)
  const reassignOrderToWave = useMockStore((s) => s.reassignOrderToWave)

  const activeDcId = getActiveDcId(useMockStore.getState())
  const liveWaves = waves.filter(
    (w) => w.dc_id === activeDcId && w.status === "in_transit",
  )

  const [activeWaveId, setActiveWaveId] = React.useState<string | undefined>(
    liveWaves[0]?.id,
  )

  React.useEffect(() => {
    if (!liveWaves.find((w) => w.id === activeWaveId)) {
      setActiveWaveId(liveWaves[0]?.id)
    }
  }, [liveWaves, activeWaveId])

  const [sheetOrderId, setSheetOrderId] = React.useState<string | null>(null)
  const [reportOrderId, setReportOrderId] = React.useState<string | null>(null)
  const [reassignOrderId, setReassignOrderId] = React.useState<string | null>(
    null,
  )

  const tickClock = (minutes: number) => {
    // Find live stops across all in-transit waves and advance some.
    const inFlightOrders = orders.filter(
      (o) =>
        o.status === "in_transit" &&
        liveWaves.some((w) => w.order_ids.includes(o.id)),
    )
    if (inFlightOrders.length === 0) {
      toast.info("No active stops to advance.")
      return
    }

    // Pick how many to advance based on the tick size.
    const advanceCount = minutes >= 30 ? 3 : 1

    // Prefer stops without arrival yet, then advance arrived ones.
    const queued = inFlightOrders.filter((o) => !o.arrived_at)
    const arrived = inFlightOrders.filter((o) => o.arrived_at)

    let arrivedAdvanced = 0
    let deliveredAdvanced = 0

    queued.slice(0, advanceCount).forEach((o) => {
      markStopArrived({ orderId: o.id })
      arrivedAdvanced += 1
    })

    arrived.slice(0, advanceCount).forEach((o) => {
      const lines = orderLines
        .filter((l) => l.order_id === o.id)
        .map((l) => ({ skuId: l.sku_id, deliveredQty: l.requested_qty }))
      deliverStop({
        orderId: o.id,
        lines,
        capturedBy: "demo-clock",
      })
      deliveredAdvanced += 1
    })

    toast.success(`Advanced ${minutes} min`, {
      description: `${arrivedAdvanced} arrived, ${deliveredAdvanced} delivered.`,
    })
  }

  const sheetOrder = sheetOrderId
    ? orders.find((o) => o.id === sheetOrderId)
    : undefined
  const reportOrder = reportOrderId
    ? orders.find((o) => o.id === reportOrderId)
    : undefined

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            In transit
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Active waves, stops per truck, and exception triage. Use the mock
            clock to simulate progress for the demo.
          </p>
        </div>

        <Card size="sm" className="ring-1 ring-border shadow-none">
          <CardContent className="flex items-center gap-3 py-2">
            <span className="flex items-center gap-2 text-sm">
              <HugeiconsIcon icon={Clock02Icon} strokeWidth={2} />
              Mock clock
            </span>
            <Button variant="outline" size="sm" onClick={() => tickClock(5)}>
              Tick 5 min
            </Button>
            <Button variant="outline" size="sm" onClick={() => tickClock(30)}>
              Tick 30 min
            </Button>
          </CardContent>
        </Card>
      </header>

      {liveWaves.length === 0 ? (
        <EmptyState
          title="No waves in transit"
          description="Dispatch a wave from the Dispatch page, then come back here to track it."
        />
      ) : (
        <Tabs value={activeWaveId} onValueChange={setActiveWaveId}>
          <TabsList variant="line" className="mb-4 flex-wrap">
            {liveWaves.map((w) => {
              const truck = trucks.find((t) => t.id === w.truck_id)
              const driver = users.find((u) => u.id === w.driver_user_id)
              return (
                <TabsTrigger key={w.id} value={w.id}>
                  <HugeiconsIcon icon={RouteIcon} strokeWidth={2} />
                  {truck?.plate ?? "Truck"} {" "}
                  <span className="text-xs text-muted-foreground">
                    {driver?.name ?? ""}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {liveWaves.map((wave) => {
            const stops = orders.filter((o) => wave.order_ids.includes(o.id))
            const truck = trucks.find((t) => t.id === wave.truck_id)
            const driver = users.find((u) => u.id === wave.driver_user_id)
            const { delivered, total } = progressForWave(wave, stops)
            const pct = total === 0 ? 0 : Math.round((delivered / total) * 100)

            return (
              <TabsContent key={wave.id} value={wave.id}>
                <Card className="mb-4" size="sm">
                  <CardHeader>
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">
                          {truck?.plate ?? "Unassigned truck"}, driven by{" "}
                          {driver?.name ?? "unknown"}
                        </CardTitle>
                        <CardDescription>
                          Dispatch {wave.dispatch_date}, {total} stops on this
                          route
                        </CardDescription>
                      </div>
                      <div className="min-w-48 grow max-w-xs">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {delivered} of {total} delivered
                          </span>
                          <span className="tabular-nums">{pct}%</span>
                        </div>
                        <Progress value={pct} className="mt-1" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stop</TableHead>
                        <TableHead>Store</TableHead>
                        <TableHead>ETA window</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stops.map((o, idx) => {
                        const stopStatus = stopStatusFor(o)
                        return (
                          <TableRow key={o.id}>
                            <TableCell className="font-medium tabular-nums">
                              {idx + 1}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {storeName(stores, o.store_id)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {o.id.slice(0, 16)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {o.arrived_at
                                ? `Arrived ${formatClock(o.arrived_at)}`
                                : o.delivered_at
                                  ? `Delivered ${formatClock(o.delivered_at)}`
                                  : windowFor(idx)}
                            </TableCell>
                            <TableCell>
                              <StopStatusBadge status={stopStatus} />
                            </TableCell>
                            <TableCell
                              className="text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label="Row actions"
                                    />
                                  }
                                >
                                  <HugeiconsIcon
                                    icon={MoreHorizontalIcon}
                                    strokeWidth={2}
                                  />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setSheetOrderId(o.id)}
                                  >
                                    View detail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setReassignOrderId(o.id)}
                                  >
                                    Reassign to wave
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setReportOrderId(o.id)}
                                  >
                                    Report exception
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>
      )}

      <Sheet
        open={!!sheetOrder}
        onOpenChange={(o) => (o ? null : setSheetOrderId(null))}
      >
        {sheetOrder ? (
          <StopDetailSheet
            order={sheetOrder}
            storeNameOf={(id) => storeName(stores, id)}
            lines={orderLines.filter((l) => l.order_id === sheetOrder.id)}
            related={exceptions.filter((e) => e.order_id === sheetOrder.id)}
            onReportException={() => {
              setReportOrderId(sheetOrder.id)
              setSheetOrderId(null)
            }}
          />
        ) : null}
      </Sheet>

      <ReportExceptionDialog
        order={reportOrder}
        onClose={() => setReportOrderId(null)}
        onSubmit={(input) => {
          if (!reportOrder) return
          reportException({
            orderId: reportOrder.id,
            reasonCode: input.reason,
            note: input.note,
            createdBy: "demo-ops",
          })
          setReportOrderId(null)
          toast.success("Exception logged", {
            description: "Visible on the Today and Reconciliation pages.",
          })
        }}
      />

      <ReassignDialog
        open={!!reassignOrderId}
        order={reassignOrderId ? orders.find((o) => o.id === reassignOrderId) : undefined}
        waves={waves.filter(
          (w) =>
            w.dc_id === activeDcId &&
            (w.status === "building" || w.status === "in_transit"),
        )}
        onClose={() => setReassignOrderId(null)}
        onPick={(waveId) => {
          if (reassignOrderId) {
            reassignOrderToWave(reassignOrderId, waveId)
            toast.success("Order moved to a different wave")
          }
          setReassignOrderId(null)
        }}
      />
    </div>
  )
}

function windowFor(index: number): string {
  // Synthesise a plausible window per stop ordering.
  const base = 8 + Math.floor(index / 2)
  const startH = base.toString().padStart(2, "0")
  const endH = (base + 1).toString().padStart(2, "0")
  return `${startH}:00 to ${endH}:30 WIB`
}

function StopStatusBadge({ status }: { status: StopStatus }) {
  const map = {
    queued: { label: "Queued", className: "bg-muted text-muted-foreground" },
    arrived: {
      label: "Arrived",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    delivered: {
      label: "Delivered",
      className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    exception: {
      label: "Exception",
      className: "bg-destructive/10 text-destructive",
    },
  } as const
  const tone = map[status]
  return <Badge variant="ghost" className={tone.className}>{tone.label}</Badge>
}

function StopDetailSheet({
  order,
  storeNameOf,
  lines,
  related,
  onReportException,
}: {
  order: Order
  storeNameOf: (id: string) => string
  lines: OrderLine[]
  related: Array<{ id: string; reason_code: ExceptionReason; note: string }>
  onReportException: () => void
}) {
  return (
    <SheetContent className="flex w-full flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{storeNameOf(order.store_id)}</SheetTitle>
        <SheetDescription>
          Order {order.id.slice(0, 16)}, current status{" "}
          <OrderStatusBadge status={order.status} className="ml-1" />
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-6 pb-2 text-sm">
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/40 p-4">
          <div>
            <div className="text-xs text-muted-foreground">Arrived</div>
            <div className="font-medium">
              {order.arrived_at ? formatClock(order.arrived_at) : "Not yet"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Delivered</div>
            <div className="font-medium">
              {order.delivered_at
                ? formatClock(order.delivered_at)
                : "Not yet"}
            </div>
          </div>
        </div>

        <h3 className="mt-6 mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Lines
        </h3>
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Requested</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((l) => (
                <TableRow key={l.sku_id}>
                  <TableCell>{l.sku_id}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {l.requested_qty}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {l.delivered_qty}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {related.length > 0 ? (
          <div className="mt-6">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Linked exceptions
            </h3>
            <ul className="grid gap-2">
              {related.map((e) => (
                <li
                  key={e.id}
                  className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3"
                >
                  <div className="font-medium text-destructive">
                    {exceptionReasonLabel(e.reason_code)}
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {e.note || "No note"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <SheetFooter className="flex-row justify-end border-t border-border">
        <Button variant="outline" onClick={onReportException}>
          Report exception
        </Button>
      </SheetFooter>
    </SheetContent>
  )
}

function ReportExceptionDialog({
  order,
  onClose,
  onSubmit,
}: {
  order: Order | undefined
  onClose: () => void
  onSubmit: (input: { reason: ExceptionReason; note: string }) => void
}) {
  const [reason, setReason] = React.useState<ExceptionReason>("refused")
  const [note, setNote] = React.useState("")

  React.useEffect(() => {
    if (order) {
      setReason("refused")
      setNote("")
    }
  }, [order])

  return (
    <Dialog
      open={!!order}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report exception</DialogTitle>
          <DialogDescription>
            This stop will be flagged for triage and removed from the auto
            advance.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Reason</Label>
            <RadioGroup
              value={reason}
              onValueChange={(v) => setReason(v as ExceptionReason)}
              className="grid gap-2"
            >
              {(
                [
                  "store_closed",
                  "refused",
                  "damaged",
                  "address_wrong",
                  "other",
                ] as ExceptionReason[]
              ).map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border px-3 py-2 text-sm"
                >
                  <RadioGroupItem value={r} />
                  <span>{exceptionReasonLabel(r)}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="exc-note">Driver note</Label>
            <Textarea
              id="exc-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Store said warehouse renovation, asked to redeliver tomorrow."
            />
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} />
              Photo proof would be attached from the driver app.
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={() => onSubmit({ reason, note })}>
            Log exception
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReassignDialog({
  open,
  order,
  waves,
  onClose,
  onPick,
}: {
  open: boolean
  order: Order | undefined
  waves: Array<{ id: string; status: OrderStatus | string }>
  onClose: () => void
  onPick: (waveId: string) => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign stop</DialogTitle>
          <DialogDescription>
            Move {order ? order.id.slice(0, 14) : "this stop"} to a different
            wave.
          </DialogDescription>
        </DialogHeader>

        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm" className="justify-between">
                <span>Pick a wave</span>
              </Button>
            }
          />
          <PopoverContent className="w-72 p-0">
            <Command>
              <CommandInput placeholder="Find wave" />
              <CommandList>
                <CommandEmpty>No waves available</CommandEmpty>
                <CommandGroup>
                  {waves.map((w) => (
                    <CommandItem
                      key={w.id}
                      value={w.id}
                      onSelect={() => onPick(w.id)}
                    >
                      {w.id.slice(0, 14)}, {w.status}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
