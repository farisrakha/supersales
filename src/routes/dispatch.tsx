import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  ChevronDownIcon,
  DeliveryTruck02Icon,
  UserIcon,
  Add01Icon,
  RouteIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Calendar } from "@/components/ui/calendar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useMockStore } from "@/mocks/state"
import { getDemoNow } from "@/mocks"
import type { Wave } from "@/mocks/types"

import { WaveStatusBadge } from "@/components/dc/status-badge"
import { EmptyState } from "@/components/dc/empty-state"
import {
  formatCompactIDR,
  formatShortDate,
} from "@/components/dc/format"
import {
  getActiveDcId,
  storeName,
  unassignedConfirmed,
} from "@/components/dc/selectors"

export const Route = createFileRoute("/dispatch")({ component: DispatchPage })

function DispatchPage() {
  const stores = useMockStore((s) => s.stores)
  const orders = useMockStore((s) => s.orders)
  const orderLines = useMockStore((s) => s.orderLines)
  const skus = useMockStore((s) => s.skus)
  const waves = useMockStore((s) => s.waves)
  const trucks = useMockStore((s) => s.trucks)
  const users = useMockStore((s) => s.users)
  const createWave = useMockStore((s) => s.createWave)
  const dispatchWave = useMockStore((s) => s.dispatchWave)
  const assignWave = useMockStore((s) => s.assignWave)
  const reassignOrderToWave = useMockStore((s) => s.reassignOrderToWave)

  const state = useMockStore.getState()
  const activeDcId = getActiveDcId(state)
  const confirmed = React.useMemo(
    () => unassignedConfirmed(state, activeDcId),
    [orders, stores, activeDcId],
  )
  const dcWaves = waves.filter((w) => w.dc_id === activeDcId)
  const dcTrucks = trucks.filter((t) => t.dc_id === activeDcId)
  const dcDrivers = users.filter(
    (u) => u.role === "driver" && u.dc_id === activeDcId,
  )

  const priceOf = React.useCallback(
    (skuId: string) => skus.find((s) => s.id === skuId)?.unit_price_idr ?? 0,
    [skus],
  )

  const totalsByOrder = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const l of orderLines) {
      map.set(
        l.order_id,
        (map.get(l.order_id) ?? 0) + priceOf(l.sku_id) * l.requested_qty,
      )
    }
    return map
  }, [orderLines, priceOf])

  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [buildOpen, setBuildOpen] = React.useState(false)

  const toggleAll = () => {
    if (selected.size === confirmed.length && confirmed.length > 0) {
      setSelected(new Set())
    } else {
      setSelected(new Set(confirmed.map((o) => o.id)))
    }
  }
  const toggleOne = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Dispatch
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Group confirmed orders into waves, assign a truck and driver, send
            them out.
          </p>
        </div>
        <Button
          onClick={() => setBuildOpen(true)}
          disabled={selected.size === 0}
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          Build wave from {selected.size} order{selected.size === 1 ? "" : "s"}
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-label="Confirmed, awaiting dispatch">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Confirmed, awaiting dispatch
              </h2>
              <p className="text-sm text-muted-foreground">
                Select orders to bundle into a wave.
              </p>
            </div>
            <Badge variant="secondary">{confirmed.length} ready</Badge>
          </div>

          {confirmed.length === 0 ? (
            <EmptyState
              title="Nothing waiting to dispatch"
              description="Confirm suggested orders first, then come back here to build a wave."
            />
          ) : (
            <Card className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selected.size === confirmed.length}
                        indeterminate={
                          selected.size > 0 &&
                          selected.size < confirmed.length
                        }
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead className="text-right">Lines</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {confirmed.map((o) => {
                    const lineCount = orderLines.filter(
                      (l) => l.order_id === o.id,
                    ).length
                    return (
                      <TableRow
                        key={o.id}
                        className="cursor-pointer"
                        onClick={() => toggleOne(o.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selected.has(o.id)}
                            onCheckedChange={() => toggleOne(o.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {storeName(stores, o.store_id)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {o.id.slice(0, 16)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {lineCount}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCompactIDR(totalsByOrder.get(o.id) ?? 0)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </section>

        <section aria-label="Today's waves">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Today's waves
              </h2>
              <p className="text-sm text-muted-foreground">
                Building waves go out as soon as you dispatch them.
              </p>
            </div>
            <Badge variant="secondary">{dcWaves.length} total</Badge>
          </div>

          {dcWaves.length === 0 ? (
            <EmptyState
              title="No waves yet"
              description="Select orders on the left, then click Build wave to assemble the first one."
            />
          ) : (
            <div className="grid gap-3">
              {dcWaves.map((wave) => (
                <WaveCard
                  key={wave.id}
                  wave={wave}
                  storeNameOf={(id) => storeName(stores, id)}
                  ordersInWave={orders.filter((o) =>
                    wave.order_ids.includes(o.id),
                  )}
                  otherWaves={dcWaves.filter((w) => w.id !== wave.id)}
                  trucks={dcTrucks}
                  drivers={dcDrivers}
                  onDispatch={() => {
                    dispatchWave({ waveId: wave.id })
                    toast.success("Wave dispatched", {
                      description: `${wave.order_ids.length} stops are now in transit.`,
                    })
                  }}
                  onAssign={(input) => {
                    assignWave({ waveId: wave.id, ...input })
                    toast.success("Wave updated")
                  }}
                  onReassign={(orderId, newWaveId) => {
                    reassignOrderToWave(orderId, newWaveId)
                    toast.success("Order moved to a different wave")
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <BuildWaveDialog
        open={buildOpen}
        onOpenChange={setBuildOpen}
        trucks={dcTrucks}
        drivers={dcDrivers}
        selectedOrderIds={Array.from(selected)}
        selectedSummary={Array.from(selected)
          .map((id) => orders.find((o) => o.id === id))
          .filter((o): o is NonNullable<typeof o> => !!o)}
        storeNameOf={(id) => storeName(stores, id)}
        onCreate={({ truckId, driverUserId, dispatchDate }) => {
          createWave({
            dcId: activeDcId,
            orderIds: Array.from(selected),
            truckId,
            driverUserId,
            dispatchDate,
          })
          setSelected(new Set())
          setBuildOpen(false)
          toast.success("Wave created", {
            description:
              "It is building. Dispatch it when the truck is loaded.",
          })
        }}
      />
    </div>
  )
}

function WaveCard({
  wave,
  storeNameOf,
  ordersInWave,
  otherWaves,
  trucks,
  drivers,
  onDispatch,
  onAssign,
  onReassign,
}: {
  wave: Wave
  storeNameOf: (id: string) => string
  ordersInWave: Array<{ id: string; store_id: string }>
  otherWaves: Wave[]
  trucks: Array<{ id: string; plate: string }>
  drivers: Array<{ id: string; name: string }>
  onDispatch: () => void
  onAssign: (input: { truckId?: string; driverUserId?: string }) => void
  onReassign: (orderId: string, newWaveId: string) => void
}) {
  const truck = trucks.find((t) => t.id === wave.truck_id)
  const driver = drivers.find((d) => d.id === wave.driver_user_id)
  const canDispatch =
    wave.status === "building" && !!wave.truck_id && !!wave.driver_user_id

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={RouteIcon} strokeWidth={2} />
              {truck?.plate ?? "Truck not assigned"}
            </CardTitle>
            <CardDescription>
              {driver?.name ?? "Driver not assigned"}, dispatch{" "}
              {formatShortDate(wave.dispatch_date)}
            </CardDescription>
          </div>
          <WaveStatusBadge status={wave.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <HoverCard>
          <HoverCardTrigger
            render={
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-2xl border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"
              />
            }
          >
            <span>
              <span className="font-medium tabular-nums">
                {wave.order_ids.length}
              </span>{" "}
              stops
            </span>
            <span className="text-xs text-muted-foreground">
              Hover to preview
            </span>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Stops
            </div>
            <ol className="mt-2 grid gap-1 text-sm">
              {ordersInWave.slice(0, 8).map((o, i) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate">
                    {i + 1}. {storeNameOf(o.store_id)}
                  </span>
                </li>
              ))}
              {ordersInWave.length > 8 ? (
                <li className="text-xs text-muted-foreground">
                  +{ordersInWave.length - 8} more
                </li>
              ) : null}
            </ol>
          </HoverCardContent>
        </HoverCard>

        {wave.status === "building" ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <ComboboxField
              label="Truck"
              value={wave.truck_id}
              placeholder="Pick a truck"
              icon={DeliveryTruck02Icon}
              options={trucks.map((t) => ({ value: t.id, label: t.plate }))}
              onChange={(v) => onAssign({ truckId: v })}
            />
            <ComboboxField
              label="Driver"
              value={wave.driver_user_id}
              placeholder="Pick a driver"
              icon={UserIcon}
              options={drivers.map((d) => ({ value: d.id, label: d.name }))}
              onChange={(v) => onAssign({ driverUserId: v })}
            />
          </div>
        ) : null}

        {wave.status === "building" && otherWaves.length > 0 ? (
          <details className="rounded-2xl border border-border px-3 py-2 text-sm">
            <summary className="cursor-pointer font-medium">
              Reassign a stop
            </summary>
            <div className="mt-2 grid gap-2">
              {ordersInWave.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate text-sm">
                    {storeNameOf(o.store_id)}
                  </span>
                  <ReassignWavePicker
                    waves={otherWaves}
                    onPick={(newWaveId) => onReassign(o.id, newWaveId)}
                  />
                </div>
              ))}
            </div>
          </details>
        ) : null}

        <div className="flex items-center justify-end gap-2 pt-1">
          {wave.status === "building" ? (
            <Button size="sm" disabled={!canDispatch} onClick={onDispatch}>
              Dispatch wave
            </Button>
          ) : (
            <Badge variant="ghost" className="bg-muted text-muted-foreground">
              Already dispatched
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ReassignWavePicker({
  waves,
  onPick,
}: {
  waves: Wave[]
  onPick: (waveId: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" size="xs">
            Move
            <HugeiconsIcon icon={ChevronDownIcon} strokeWidth={2} />
          </Button>
        }
      />
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Find wave" />
          <CommandList>
            <CommandEmpty>No other waves</CommandEmpty>
            <CommandGroup>
              {waves.map((w) => (
                <CommandItem
                  key={w.id}
                  value={w.id}
                  onSelect={() => {
                    onPick(w.id)
                    setOpen(false)
                  }}
                >
                  {w.id.slice(0, 12)}, {w.status}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function ComboboxField({
  label,
  value,
  placeholder,
  icon,
  options,
  onChange,
}: {
  label: string
  value: string | undefined
  placeholder: string
  icon: typeof DeliveryTruck02Icon
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const current = options.find((o) => o.value === value)
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant="outline" size="sm" className="justify-between">
              <span className="flex items-center gap-2">
                <HugeiconsIcon icon={icon} strokeWidth={2} />
                {current?.label ?? placeholder}
              </span>
              <HugeiconsIcon icon={ChevronDownIcon} strokeWidth={2} />
            </Button>
          }
        />
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}`} />
            <CommandList>
              <CommandEmpty>No matches</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.label}
                    onSelect={() => {
                      onChange(o.value)
                      setOpen(false)
                    }}
                  >
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function BuildWaveDialog({
  open,
  onOpenChange,
  trucks,
  drivers,
  selectedOrderIds,
  selectedSummary,
  storeNameOf,
  onCreate,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  trucks: Array<{ id: string; plate: string }>
  drivers: Array<{ id: string; name: string }>
  selectedOrderIds: string[]
  selectedSummary: Array<{ id: string; store_id: string }>
  storeNameOf: (id: string) => string
  onCreate: (input: {
    truckId?: string
    driverUserId?: string
    dispatchDate: string
  }) => void
}) {
  const [truckId, setTruckId] = React.useState<string | undefined>(undefined)
  const [driverId, setDriverId] = React.useState<string | undefined>(undefined)
  const [date, setDate] = React.useState<Date>(getDemoNow())
  const [calOpen, setCalOpen] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setTruckId(undefined)
      setDriverId(undefined)
      setDate(getDemoNow())
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Build wave</DialogTitle>
          <DialogDescription>
            {selectedOrderIds.length} orders selected. Assign a truck and
            driver, pick the dispatch date.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <ComboboxField
            label="Truck"
            value={truckId}
            placeholder="Pick a truck"
            icon={DeliveryTruck02Icon}
            options={trucks.map((t) => ({ value: t.id, label: t.plate }))}
            onChange={setTruckId}
          />
          <ComboboxField
            label="Driver"
            value={driverId}
            placeholder="Pick a driver"
            icon={UserIcon}
            options={drivers.map((d) => ({ value: d.id, label: d.name }))}
            onChange={setDriverId}
          />

          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Dispatch date
            </Label>
            <Popover open={calOpen} onOpenChange={setCalOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
                      {date.toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <HugeiconsIcon icon={ChevronDownIcon} strokeWidth={2} />
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d)
                    setCalOpen(false)
                  }}
                  required
                />
              </PopoverContent>
            </Popover>
          </div>

          {selectedSummary.length > 0 ? (
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Stops included
              </Label>
              <ul className="max-h-40 overflow-y-auto rounded-2xl border border-border p-2 text-sm">
                {selectedSummary.map((o, i) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between px-2 py-1"
                  >
                    <span>
                      {i + 1}. {storeNameOf(o.store_id)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {o.id.slice(0, 10)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            disabled={selectedOrderIds.length === 0}
            onClick={() =>
              onCreate({
                truckId,
                driverUserId: driverId,
                dispatchDate: date.toISOString().slice(0, 10),
              })
            }
          >
            Create wave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
