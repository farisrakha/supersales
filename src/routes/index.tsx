import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowRight02Icon,
  Camera01Icon,
  RouteIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useMockStore } from "@/mocks/state"
import { getDemoNow } from "@/mocks"
import type { Exception } from "@/mocks/types"
import { useSimulatedError } from "@/components/route-error"

import {
  exceptionReasonLabel,
  WaveStatusBadge,
} from "@/components/dc/status-badge"
import { EmptyState } from "@/components/dc/empty-state"
import {
  formatClock,
  formatLongDate,
  formatRelative,
} from "@/components/dc/format"
import {
  exceptionsForDc,
  getActiveDcId,
  ordersForDc,
  progressForWave,
  storeName,
} from "@/components/dc/selectors"

export const Route = createFileRoute("/")({ component: TodayPage })

function TodayPage() {
  const errorView = useSimulatedError()
  if (errorView) return errorView
  return <TodayPageInner />
}

function TodayPageInner() {
  const dcs = useMockStore((s) => s.dcs)
  const stores = useMockStore((s) => s.stores)
  const orders = useMockStore((s) => s.orders)
  const exceptions = useMockStore((s) => s.exceptions)
  const waves = useMockStore((s) => s.waves)
  const trucks = useMockStore((s) => s.trucks)
  const users = useMockStore((s) => s.users)
  const closeException = useMockStore((s) => s.closeException)
  const rescheduleOrder = useMockStore((s) => s.rescheduleOrder)
  const reassignOrderToWave = useMockStore((s) => s.reassignOrderToWave)

  const state = useMockStore.getState()
  const activeDcId = getActiveDcId(state)
  const dc = dcs.find((d) => d.id === activeDcId) ?? dcs[0]

  const dcOrders = React.useMemo(
    () => ordersForDc(state, activeDcId),
    [orders, stores, activeDcId],
  )
  const dcExceptions = React.useMemo(
    () => exceptionsForDc(state, activeDcId),
    [exceptions, orders, stores, activeDcId],
  )
  const dcWaves = waves.filter((w) => w.dc_id === activeDcId)

  const pending = dcOrders.filter((o) => o.status === "submitted").length
  const inPick = dcOrders.filter(
    (o) => o.status === "confirmed" || o.status === "picking",
  ).length
  const inDispatch = dcOrders.filter((o) => o.status === "picked").length
  const inTransit = dcOrders.filter((o) => o.status === "in_transit").length
  const exceptionCount = dcExceptions.length

  const [openExceptionId, setOpenExceptionId] = React.useState<string | null>(
    null,
  )
  const openException = dcExceptions.find((e) => e.id === openExceptionId)

  const closeSheet = () => setOpenExceptionId(null)

  const handleClose = (exceptionId: string) => {
    closeException(exceptionId)
    toast.success("Exception closed", {
      description: "Logged against the order for the daily reconciliation.",
    })
    closeSheet()
  }

  const handleReschedule = (orderId: string) => {
    const tomorrow = new Date(getDemoNow().getTime() + 24 * 60 * 60 * 1000)
    rescheduleOrder(orderId, tomorrow.toISOString().slice(0, 10))
    toast.success("Order rescheduled for tomorrow")
    closeSheet()
  }

  const handleReassign = (orderId: string, waveId: string) => {
    reassignOrderToWave(orderId, waveId)
    toast.success("Order moved to a different wave")
    closeSheet()
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {dc.name}
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Today at the DC
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatLongDate(getDemoNow())}, {formatClock(getDemoNow().toISOString())} WIB.
            {" "}
            {dcOrders.length} active orders across {dcWaves.length} waves.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {pending} awaiting approval
          </Badge>
          <Button
            variant="default"
            size="sm"
            render={<Link to="/suggested-orders" />}
          >
            Review suggested orders
            <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} />
          </Button>
        </div>
      </header>

      <section
        aria-label="Pipeline status"
        className="grid grid-cols-2 gap-3 md:grid-cols-12"
      >
        <Card className="md:col-span-6">
          <CardHeader>
            <CardDescription>Pending approval</CardDescription>
            <CardTitle className="font-heading text-6xl font-semibold tabular-nums">
              {pending}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Suggested orders ready for ops to confirm before pick.
            </p>
            <Button
              variant="outline"
              size="sm"
              render={<Link to="/suggested-orders" />}
            >
              Confirm orders
              <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} />
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 md:col-span-6 md:grid-cols-2">
          <PipelineTile label="In pick" value={inPick} to="/dispatch" />
          <PipelineTile label="In dispatch" value={inDispatch} to="/dispatch" />
          <PipelineTile label="In transit" value={inTransit} to="/in-transit" />
          <PipelineTile
            label="Exceptions"
            value={exceptionCount}
            to="/in-transit"
            tone={exceptionCount > 0 ? "warn" : "neutral"}
          />
        </div>
      </section>

      <Separator className="my-10" />

      <section aria-label="Exceptions today" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-semibold">
              Exceptions today
            </h2>
            <p className="text-sm text-muted-foreground">
              Refused, damaged, or undeliverable orders. Click a row to triage.
            </p>
          </div>
          <Badge variant={exceptionCount > 0 ? "destructive" : "secondary"}>
            {exceptionCount} open
          </Badge>
        </div>

        {dcExceptions.length > 0 ? (
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="w-32">Wave</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {dcExceptions.map((ex) => {
                  const order = orders.find((o) => o.id === ex.order_id)
                  const wave = order?.wave_id
                    ? dcWaves.find((w) => w.id === order.wave_id)
                    : undefined
                  return (
                    <TableRow
                      key={ex.id}
                      className="cursor-pointer"
                      onClick={() => setOpenExceptionId(ex.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-7 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <HugeiconsIcon
                              icon={Alert02Icon}
                              strokeWidth={2}
                              className="size-3.5"
                            />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {order ? storeName(stores, order.store_id) : ex.order_id}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Order {ex.order_id.slice(0, 12)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {exceptionReasonLabel(ex.reason_code)}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {ex.note || "No driver note"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelative(ex.created_at)}
                      </TableCell>
                      <TableCell>
                        {wave ? (
                          <Badge variant="outline" className="font-normal">
                            {wave.id.slice(0, 8)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            None
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenExceptionId(ex.id)
                          }}
                        >
                          Triage
                          <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <EmptyState
            title="No exceptions today"
            description="Every delivery has been accepted. If a driver reports an issue, it will show up here for triage."
          />
        )}
      </section>

      <Separator className="my-10" />

      <section aria-label="Waves today" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-semibold">Waves today</h2>
            <p className="text-sm text-muted-foreground">
              Progress on each dispatch slot for {dc.name}.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link to="/dispatch" />}
          >
            Open dispatch
            <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} />
          </Button>
        </div>

        {dcWaves.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {dcWaves.map((wave) => {
              const { delivered, total } = progressForWave(wave, dcOrders)
              const truck = trucks.find((t) => t.id === wave.truck_id)
              const driver = users.find((u) => u.id === wave.driver_user_id)
              const pct = total === 0 ? 0 : Math.round((delivered / total) * 100)
              return (
                <Card key={wave.id} size="sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <HugeiconsIcon icon={RouteIcon} strokeWidth={2} />
                          {truck?.plate ?? "Unassigned truck"}
                        </CardTitle>
                        <CardDescription>
                          {driver?.name ?? "Driver to be assigned"}, dispatched{" "}
                          {wave.dispatch_date}
                        </CardDescription>
                      </div>
                      <WaveStatusBadge status={wave.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {delivered} of {total} stops delivered
                      </span>
                      <span className="tabular-nums">{pct}%</span>
                    </div>
                    <Progress value={pct} className="mt-2" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No waves yet"
            description="Confirm suggested orders and build a wave to start dispatching trucks for the day."
            action={
              <Button render={<Link to="/dispatch" />}>Build wave</Button>
            }
          />
        )}
      </section>

      <ExceptionSheet
        open={openException}
        onClose={closeSheet}
        onCloseException={handleClose}
        onReschedule={handleReschedule}
        onReassign={handleReassign}
        waves={dcWaves}
        storeNameOf={(id) => {
          const order = orders.find((o) => o.id === id)
          return order ? storeName(stores, order.store_id) : id
        }}
      />
    </div>
  )
}

function PipelineTile({
  label,
  value,
  to,
  tone = "neutral",
}: {
  label: string
  value: number
  to: string
  tone?: "neutral" | "warn"
}) {
  return (
    <Card size="sm" className="shadow-none ring-1 ring-border">
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Link
            to={to}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Open
          </Link>
        </div>
        <span
          className={
            tone === "warn" && value > 0
              ? "font-heading text-3xl font-semibold tabular-nums text-destructive"
              : "font-heading text-3xl font-semibold tabular-nums"
          }
        >
          {value}
        </span>
      </CardContent>
    </Card>
  )
}

function ExceptionSheet({
  open,
  onClose,
  onCloseException,
  onReschedule,
  onReassign,
  waves,
  storeNameOf,
}: {
  open: Exception | undefined
  onClose: () => void
  onCloseException: (id: string) => void
  onReschedule: (orderId: string) => void
  onReassign: (orderId: string, waveId: string) => void
  waves: Array<{ id: string; status: string }>
  storeNameOf: (orderId: string) => string
}) {
  const [reassignWaveId, setReassignWaveId] = React.useState<string | undefined>(
    undefined,
  )

  React.useEffect(() => {
    setReassignWaveId(undefined)
  }, [open?.id])

  return (
    <Sheet open={!!open} onOpenChange={(o) => (o ? null : onClose())}>
      {open ? (
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{exceptionReasonLabel(open.reason_code)}</SheetTitle>
            <SheetDescription>
              {storeNameOf(open.order_id)}, reported {formatRelative(open.created_at)}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-2">
            <div className="grid gap-4 text-sm">
              <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted/40 p-4">
                <div>
                  <div className="text-xs text-muted-foreground">Order</div>
                  <div className="font-medium">
                    {open.order_id.slice(0, 14)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Reported by</div>
                  <div className="font-medium">{open.created_by}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Time</div>
                  <div className="font-medium">
                    {formatClock(open.created_at)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Driver note
                </div>
                <p className="mt-1">{open.note || "No note recorded."}</p>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Proof photo
                </div>
                <div className="mt-2 flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-muted-foreground">
                  <div className="flex flex-col items-center gap-1">
                    <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} />
                    <span className="text-xs">
                      {open.photo_url ? "Photo on file" : "No photo attached"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Reassign to wave
                </div>
                <Select
                  value={reassignWaveId}
                  onValueChange={(v) =>
                    setReassignWaveId(typeof v === "string" ? v : undefined)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pick a wave" />
                  </SelectTrigger>
                  <SelectContent>
                    {waves.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No waves available
                      </div>
                    ) : (
                      waves.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.id.slice(0, 12)}, {w.status}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!reassignWaveId}
                  onClick={() =>
                    reassignWaveId && onReassign(open.order_id, reassignWaveId)
                  }
                >
                  Move order to selected wave
                </Button>
              </div>
            </div>
          </div>

          <SheetFooter className="flex-row justify-between gap-2 border-t border-border bg-background">
            <Button
              variant="outline"
              onClick={() => onReschedule(open.order_id)}
            >
              Reschedule
            </Button>
            <Button
              variant="default"
              onClick={() => onCloseException(open.id)}
            >
              Mark closed
            </Button>
          </SheetFooter>
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
