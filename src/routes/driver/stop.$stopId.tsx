import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  Alert02Icon,
  Call02Icon,
  Camera01Icon,
  Location01Icon,
  Navigation02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

import { useMockStore } from "@/mocks/state"
import type { ExceptionReason, OrderLine, SKU } from "@/mocks/types"
import { useDefaultDriver } from "@/components/driver/driver-layout"
import { SignaturePadFrame } from "@/components/driver/signature-pad"
import type { SignaturePadHandle } from "@/components/driver/signature-pad"

export const Route = createFileRoute("/driver/stop/$stopId")({
  component: DriverStopPage,
})

const REASONS: Array<{ value: ExceptionReason; label: string }> = [
  { value: "store_closed", label: "Store closed" },
  { value: "refused", label: "Refused" },
  { value: "damaged", label: "Damaged" },
  { value: "address_wrong", label: "Address wrong" },
  { value: "other", label: "Other" },
]

function DriverStopPage() {
  const { stopId } = Route.useParams()
  const navigate = useNavigate()
  const driver = useDefaultDriver()

  const allOrders = useMockStore((s) => s.orders)
  const allLines = useMockStore((s) => s.orderLines)
  const stores = useMockStore((s) => s.stores)
  const skus = useMockStore((s) => s.skus)
  const waves = useMockStore((s) => s.waves)

  const order = allOrders.find((o) => o.id === stopId)
  const orderLines = allLines.filter((l) => l.order_id === stopId)
  const store = order ? stores.find((s) => s.id === order.store_id) : undefined
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

  const markStopArrived = useMockStore((s) => s.markStopArrived)
  const deliverStop = useMockStore((s) => s.deliverStop)
  const reportException = useMockStore((s) => s.reportException)

  const [deliverOpen, setDeliverOpen] = React.useState(false)
  const [exceptionOpen, setExceptionOpen] = React.useState(false)

  if (!order || !store) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <Card size="sm">
          <CardContent className="py-6 text-sm text-muted-foreground">
            This stop is not on your route.
          </CardContent>
        </Card>
      </div>
    )
  }

  const skuName = (id: string): string =>
    skus.find((s: SKU) => s.id === id)?.name ?? id

  const arrived = Boolean(order.arrived_at)
  const delivered = order.status === "delivered"
  const isException = order.status === "exception"
  const completed = delivered || isException

  function navigateToNextStop() {
    if (!route) return
    const next = route.orders.find(
      (o) => o.id !== order!.id && o.status !== "delivered" && o.status !== "exception",
    )
    if (next) {
      navigate({ to: "/driver/stop/$stopId", params: { stopId: next.id } })
    } else {
      navigate({ to: "/driver" })
    }
  }

  const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(store.address)}`
  const telHref = `tel:${store.contact.replace(/\s+/g, "")}`

  return (
    <div className="flex flex-col gap-5">
      <BackLink />

      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {store.name}
          </h1>
          <StopBadge
            arrived={arrived}
            delivered={delivered}
            isException={isException}
          />
        </div>
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <HugeiconsIcon
            icon={Location01Icon}
            strokeWidth={2}
            className="mt-0.5 size-4 shrink-0"
          />
          <span>{store.address}</span>
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="lg"
          className="h-11"
          render={
            <a href={telHref}>
              <HugeiconsIcon
                icon={Call02Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Call store
            </a>
          }
        />
        <Button
          variant="outline"
          size="lg"
          className="h-11"
          render={
            <a href={mapsHref} target="_blank" rel="noreferrer">
              <HugeiconsIcon
                icon={Navigation02Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Navigate
            </a>
          }
        />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-sm font-medium text-muted-foreground">
          Order summary
        </h2>
        <Card size="sm">
          <CardContent className="p-0">
            {orderLines.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted-foreground">
                No lines on this order.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {orderLines.map((line) => (
                  <li
                    key={line.sku_id}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate pr-3">
                      {skuName(line.sku_id)}
                    </span>
                    <span className="font-heading text-sm font-semibold tabular-nums">
                      {line.requested_qty}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {!completed ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={arrived ? "secondary" : "default"}
              size="lg"
              className="h-12"
              disabled={arrived}
              onClick={() => {
                markStopArrived({ orderId: order.id })
                toast.success("Marked arrived")
              }}
            >
              {arrived ? "Arrived" : "Mark arrived"}
            </Button>
            <Button
              variant="default"
              size="lg"
              className="h-12"
              onClick={() => setDeliverOpen(true)}
            >
              Mark delivered
            </Button>
          </div>
          <Button
            variant="destructive"
            size="lg"
            className="h-12"
            onClick={() => setExceptionOpen(true)}
          >
            <HugeiconsIcon
              icon={Alert02Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Report exception
          </Button>
        </div>
      ) : (
        <Card size="sm" className="bg-muted/40 shadow-none">
          <CardContent className="flex flex-col gap-3 py-1">
            <p className="flex items-center gap-2 font-heading text-sm font-medium">
              {delivered ? (
                <>
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    strokeWidth={2.5}
                    className="text-primary"
                  />
                  Delivered
                </>
              ) : (
                <>
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    strokeWidth={2.5}
                    className="text-destructive"
                  />
                  Logged as exception
                </>
              )}
            </p>
            <Button
              size="lg"
              className="h-12 w-full"
              onClick={navigateToNextStop}
            >
              Next stop
            </Button>
          </CardContent>
        </Card>
      )}

      <DeliverSheet
        open={deliverOpen}
        onOpenChange={setDeliverOpen}
        orderLines={orderLines}
        skuName={skuName}
        onConfirm={(lines, podSignatureUrl, podPhotoUrl) => {
          deliverStop({
            orderId: order.id,
            lines,
            podSignatureUrl,
            podPhotoUrl,
            capturedBy: driver?.id ?? "user-driver",
          })
          setDeliverOpen(false)
          toast.success("Delivery recorded")
        }}
      />

      <ExceptionSheet
        open={exceptionOpen}
        onOpenChange={setExceptionOpen}
        onConfirm={(reasonCode, note, photoUrl) => {
          reportException({
            orderId: order.id,
            reasonCode,
            note,
            photoUrl,
            createdBy: driver?.id ?? "user-driver",
          })
          setExceptionOpen(false)
          toast.success("Exception sent to dispatcher")
        }}
      />
    </div>
  )
}

function BackLink() {
  const navigate = useNavigate()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 self-start"
      onClick={() => navigate({ to: "/driver" })}
    >
      <HugeiconsIcon
        icon={ArrowLeft02Icon}
        strokeWidth={2}
        data-icon="inline-start"
      />
      All stops
    </Button>
  )
}

function StopBadge({
  arrived,
  delivered,
  isException,
}: {
  arrived: boolean
  delivered: boolean
  isException: boolean
}) {
  if (isException) return <Badge variant="destructive">Exception</Badge>
  if (delivered) return <Badge>Delivered</Badge>
  if (arrived) return <Badge variant="secondary">Arrived</Badge>
  return <Badge variant="outline">Queued</Badge>
}

function DeliverSheet({
  open,
  onOpenChange,
  orderLines,
  skuName,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  orderLines: OrderLine[]
  skuName: (id: string) => string
  onConfirm: (
    lines: Array<{ skuId: string; deliveredQty: number }>,
    signatureUrl: string,
    photoUrl: string,
  ) => void
}) {
  const padRef = React.useRef<SignaturePadHandle | null>(null)
  const [qty, setQty] = React.useState<Record<string, number>>({})
  const [photoName, setPhotoName] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    const next: Record<string, number> = {}
    for (const l of orderLines) next[l.sku_id] = l.requested_qty
    setQty(next)
    setPhotoName(null)
  }, [open, orderLines])

  function handleConfirm() {
    const lines = orderLines.map((l) => ({
      skuId: l.sku_id,
      deliveredQty: qty[l.sku_id] ?? l.requested_qty,
    }))
    const signatureUrl = padRef.current?.toDataURL() ?? ""
    onConfirm(lines, signatureUrl, photoName ?? "")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl"
      >
        <SheetHeader>
          <SheetTitle>Confirm delivery</SheetTitle>
          <SheetDescription>
            Capture delivered quantities, a photo, and the recipient signature.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-6 pb-4">
          <section className="flex flex-col gap-2">
            <p className="text-sm font-medium">Delivered quantities</p>
            <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
              {orderLines.map((line) => (
                <li
                  key={line.sku_id}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {skuName(line.sku_id)}
                  </span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className="h-9 w-20 text-right"
                    value={qty[line.sku_id] ?? 0}
                    onChange={(e) =>
                      setQty((prev) => ({
                        ...prev,
                        [line.sku_id]: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </li>
              ))}
            </ul>
          </section>

          <Separator />

          <section className="flex flex-col gap-2">
            <Label htmlFor="pod-photo" className="text-sm font-medium">
              <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} className="size-4" />
              Photo proof
            </Label>
            <input
              id="pod-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-medium file:text-secondary-foreground"
            />
            {photoName && (
              <p className="text-xs text-muted-foreground">Attached: {photoName}</p>
            )}
          </section>

          <Separator />

          <SignaturePadFrame padRef={padRef} />
        </div>

        <SheetFooter>
          <Button size="lg" className="h-12 w-full" onClick={handleConfirm}>
            Confirm delivery
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function ExceptionSheet({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: (reason: ExceptionReason, note: string, photoUrl: string) => void
}) {
  const [reason, setReason] = React.useState<ExceptionReason>("store_closed")
  const [note, setNote] = React.useState("")
  const [photoName, setPhotoName] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setReason("store_closed")
    setNote("")
    setPhotoName(null)
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl"
      >
        <SheetHeader>
          <SheetTitle>Report exception</SheetTitle>
          <SheetDescription>
            The dispatcher sees this immediately. Add a photo so they can act.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-6 pb-4">
          <section className="flex flex-col gap-3">
            <Label className="text-sm font-medium">Reason</Label>
            <RadioGroup
              value={reason}
              onValueChange={(v) => setReason(v as ExceptionReason)}
            >
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3 text-sm has-data-checked:border-ring has-data-checked:bg-muted/40"
                >
                  <RadioGroupItem value={r.value} />
                  <span>{r.label}</span>
                </label>
              ))}
            </RadioGroup>
          </section>

          <section className="flex flex-col gap-2">
            <Label htmlFor="exception-note" className="text-sm font-medium">
              Note (optional)
            </Label>
            <Textarea
              id="exception-note"
              placeholder="Add detail the dispatcher needs."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </section>

          <section className="flex flex-col gap-2">
            <Label htmlFor="exception-photo" className="text-sm font-medium">
              <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} className="size-4" />
              Photo (required)
            </Label>
            <input
              id="exception-photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-medium file:text-secondary-foreground"
            />
            {photoName && (
              <p className="text-xs text-muted-foreground">Attached: {photoName}</p>
            )}
          </section>
        </div>

        <SheetFooter>
          <Button
            variant="destructive"
            size="lg"
            className="h-12 w-full"
            onClick={() =>
              onConfirm(reason, note, photoName ?? "/mock/exceptions/driver.jpg")
            }
          >
            Send exception
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
