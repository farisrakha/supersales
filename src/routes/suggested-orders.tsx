import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SearchIcon,
  MoreHorizontalIcon,
  ArrowRight02Icon,
  SortByDown01Icon,
  SortByUp01Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useMockStore } from "@/mocks/state"
import type { Order, OrderSource, SKU } from "@/mocks/types"

import { OrderStatusBadge } from "@/components/dc/status-badge"
import {
  formatCompactIDR,
  formatIDR,
  formatRelative,
} from "@/components/dc/format"
import {
  getActiveDcId,
  ordersForDc,
  storeName,
} from "@/components/dc/selectors"
import { EmptyState } from "@/components/dc/empty-state"

export const Route = createFileRoute("/suggested-orders")({
  component: SuggestedOrdersPage,
})

type StatusFilter = "all" | "submitted" | "needs_review" | "confirmed"
type SortKey = "store" | "lines" | "total" | "age"
type SortDir = "asc" | "desc"

function SuggestedOrdersPage() {
  const stores = useMockStore((s) => s.stores)
  const orders = useMockStore((s) => s.orders)
  const orderLines = useMockStore((s) => s.orderLines)
  const skus = useMockStore((s) => s.skus)
  const inferredStock = useMockStore((s) => s.inferredStock)
  const confirmOrders = useMockStore((s) => s.confirmOrders)
  const flagOrderForReview = useMockStore((s) => s.flagOrderForReview)

  const state = useMockStore.getState()
  const activeDcId = getActiveDcId(state)
  const dcOrders = React.useMemo(
    () => ordersForDc(state, activeDcId),
    [orders, stores, activeDcId],
  )

  const skuPrice = React.useCallback(
    (skuId: string) => skus.find((s) => s.id === skuId)?.unit_price_idr ?? 0,
    [skus],
  )

  const skuById = React.useMemo(() => {
    const map = new Map<string, SKU>()
    skus.forEach((s) => map.set(s.id, s))
    return map
  }, [skus])

  const totalsByOrder = React.useMemo(() => {
    const map = new Map<string, { lineCount: number; total: number }>()
    for (const line of orderLines) {
      const cur = map.get(line.order_id) ?? { lineCount: 0, total: 0 }
      cur.lineCount += 1
      cur.total += skuPrice(line.sku_id) * line.requested_qty
      map.set(line.order_id, cur)
    }
    return map
  }, [orderLines, skuPrice])

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>(
    "submitted",
  )
  const [search, setSearch] = React.useState("")
  const [sourceFilter, setSourceFilter] = React.useState<"all" | OrderSource>(
    "all",
  )
  const [sortKey, setSortKey] = React.useState<SortKey>("total")
  const [sortDir, setSortDir] = React.useState<SortDir>("desc")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [activeRow, setActiveRow] = React.useState<string | null>(null)
  const [confirmBulkOpen, setConfirmBulkOpen] = React.useState(false)
  const [flagOrderId, setFlagOrderId] = React.useState<string | null>(null)
  const [flagNote, setFlagNote] = React.useState("")
  const [drawerOrderId, setDrawerOrderId] = React.useState<string | null>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = dcOrders.filter((o) => {
      const isCandidate =
        o.status === "submitted" ||
        o.status === "draft" ||
        o.status === "confirmed"
      if (!isCandidate) return false

      if (statusFilter === "submitted" && o.status !== "submitted")
        return false
      if (statusFilter === "needs_review" && !o.flagged_reason) return false
      if (statusFilter === "confirmed" && o.status !== "confirmed")
        return false

      if (sourceFilter !== "all" && o.source !== sourceFilter) return false

      if (query) {
        const name = storeName(stores, o.store_id).toLowerCase()
        if (!name.includes(query) && !o.id.toLowerCase().includes(query))
          return false
      }
      return true
    })

    const sorted = [...rows].sort((a, b) => {
      const ta = totalsByOrder.get(a.id) ?? { lineCount: 0, total: 0 }
      const tb = totalsByOrder.get(b.id) ?? { lineCount: 0, total: 0 }
      let cmp = 0
      if (sortKey === "store") {
        cmp = storeName(stores, a.store_id).localeCompare(
          storeName(stores, b.store_id),
        )
      } else if (sortKey === "lines") {
        cmp = ta.lineCount - tb.lineCount
      } else if (sortKey === "total") {
        cmp = ta.total - tb.total
      } else {
        cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return sorted
  }, [
    dcOrders,
    statusFilter,
    sourceFilter,
    search,
    sortKey,
    sortDir,
    totalsByOrder,
    stores,
  ])

  // Keyboard shortcuts: j/k navigate, x toggle select, c confirm selected, / focus search.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      if (e.key === "/" && !inField) {
        e.preventDefault()
        searchRef.current?.focus()
        return
      }
      if (inField) return

      if (e.key === "j") {
        e.preventDefault()
        if (filtered.length === 0) return
        setActiveRow((cur) => {
          const idx = cur ? filtered.findIndex((o) => o.id === cur) : -1
          return filtered[Math.min(idx + 1, filtered.length - 1)].id
        })
      } else if (e.key === "k") {
        e.preventDefault()
        if (filtered.length === 0) return
        setActiveRow((cur) => {
          const idx = cur ? filtered.findIndex((o) => o.id === cur) : 0
          return filtered[Math.max(idx - 1, 0)].id
        })
      } else if (e.key === "x") {
        if (!activeRow) return
        setSelected((cur) => {
          const next = new Set(cur)
          if (next.has(activeRow)) next.delete(activeRow)
          else next.add(activeRow)
          return next
        })
      } else if (e.key === "c") {
        if (selected.size > 0) setConfirmBulkOpen(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [filtered, activeRow, selected])

  const allSelected =
    filtered.length > 0 && filtered.every((o) => selected.has(o.id))
  const someSelected = filtered.some((o) => selected.has(o.id))

  const toggleAll = () => {
    setSelected((cur) => {
      const next = new Set(cur)
      if (allSelected) {
        filtered.forEach((o) => next.delete(o.id))
      } else {
        filtered.forEach((o) => next.add(o.id))
      }
      return next
    })
  }

  const toggleOne = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const runConfirm = (ids: string[]) => {
    const eligible = ids.filter((id) => {
      const o = dcOrders.find((x) => x.id === id)
      return o && (o.status === "submitted" || o.status === "draft")
    })
    if (eligible.length === 0) {
      toast.info("Nothing to confirm in the current selection.")
      return
    }
    confirmOrders({ orderIds: eligible })
    setSelected(new Set())
    setConfirmBulkOpen(false)
    toast.success(`${eligible.length} orders confirmed`, {
      description: "They are now ready to be built into a wave.",
    })
  }

  const drawerOrder = drawerOrderId
    ? orders.find((o) => o.id === drawerOrderId)
    : undefined

  const toggleSort = (key: SortKey) => {
    setSortKey((curKey) => {
      if (curKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        return curKey
      }
      setSortDir("desc")
      return key
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Suggested orders
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          The engine proposes a basket per store from inferred stock and burn rate.
          Confirm what looks right, flag what doesn't, edit before dispatch.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted
              <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                {dcOrders.filter((o) => o.status === "submitted").length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="needs_review">Needs review</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <HugeiconsIcon
              icon={SearchIcon}
              strokeWidth={2}
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search store or order (press /)"
              className="w-64 pl-9"
            />
          </div>
          <Select
            value={sourceFilter}
            onValueChange={(v) => setSourceFilter(v as "all" | OrderSource)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="engine">Engine</SelectItem>
              <SelectItem value="store">Store</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selected.size > 0 ? (
        <div className="mb-3 flex items-center justify-between rounded-3xl border border-border bg-muted/40 px-4 py-2 text-sm">
          <span>
            <span className="font-medium">{selected.size}</span> selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
            <Button size="sm" onClick={() => setConfirmBulkOpen(true)}>
              Confirm selected
            </Button>
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing to review"
          description="Switch tabs or change the source filter. New suggestions appear as the engine recomputes."
        />
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all in view"
                  />
                </TableHead>
                <SortableHead
                  label="Store"
                  active={sortKey === "store"}
                  dir={sortDir}
                  onClick={() => toggleSort("store")}
                />
                <SortableHead
                  label="Lines"
                  active={sortKey === "lines"}
                  dir={sortDir}
                  onClick={() => toggleSort("lines")}
                  className="text-right"
                />
                <SortableHead
                  label="Total"
                  active={sortKey === "total"}
                  dir={sortDir}
                  onClick={() => toggleSort("total")}
                  className="text-right"
                />
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <SortableHead
                  label="Age"
                  active={sortKey === "age"}
                  dir={sortDir}
                  onClick={() => toggleSort("age")}
                />
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const totals = totalsByOrder.get(order.id) ?? {
                  lineCount: 0,
                  total: 0,
                }
                const isActive = activeRow === order.id
                return (
                  <TableRow
                    key={order.id}
                    data-active={isActive ? "true" : undefined}
                    className={
                      isActive
                        ? "cursor-pointer bg-muted/50"
                        : "cursor-pointer"
                    }
                    onClick={() => {
                      setActiveRow(order.id)
                      setDrawerOrderId(order.id)
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(order.id)}
                        onCheckedChange={() => toggleOne(order.id)}
                        aria-label={`Select ${order.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {storeName(stores, order.store_id)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {order.id.slice(0, 16)}
                          {order.edited_by_store ? (
                            <Badge
                              variant="outline"
                              className="ml-2 font-normal"
                            >
                              edited by store
                            </Badge>
                          ) : null}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {totals.lineCount}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCompactIDR(totals.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal capitalize">
                        {order.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                      {order.flagged_reason ? (
                        <Badge
                          variant="destructive"
                          className="ml-1 font-normal"
                        >
                          flagged
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelative(order.created_at)}
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
                            onClick={() => runConfirm([order.id])}
                          >
                            Confirm order
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setFlagNote(order.flagged_reason ?? "")
                              setFlagOrderId(order.id)
                            }}
                          >
                            Flag for review
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDrawerOrderId(order.id)}
                          >
                            Open detail
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          <CardContent className="flex items-center justify-between border-t border-border py-3 text-xs text-muted-foreground">
            <span>{filtered.length} orders in view</span>
            <span>
              Shortcuts: j next, k prev, x select, c confirm, / search
            </span>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={confirmBulkOpen}
        onOpenChange={setConfirmBulkOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm {selected.size} orders
            </AlertDialogTitle>
            <AlertDialogDescription>
              The orders will move to confirmed and become available for wave
              building. Confirmed orders can still be flagged before dispatch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep reviewing</AlertDialogCancel>
            <AlertDialogAction onClick={() => runConfirm(Array.from(selected))}>
              Confirm orders
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!flagOrderId}
        onOpenChange={(o) => {
          if (!o) {
            setFlagOrderId(null)
            setFlagNote("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag for review</DialogTitle>
            <DialogDescription>
              Add a short note for the supervisor or store partner.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="flag-note">Reason</Label>
            <Textarea
              id="flag-note"
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              placeholder="Quantity spike from last week, please confirm with store."
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              disabled={flagNote.trim().length === 0}
              onClick={() => {
                if (flagOrderId) {
                  flagOrderForReview(flagOrderId, flagNote.trim())
                  toast.success("Order flagged for review")
                }
                setFlagOrderId(null)
                setFlagNote("")
              }}
            >
              Save flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={!!drawerOrder}
        onOpenChange={(o) => (o ? null : setDrawerOrderId(null))}
      >
        {drawerOrder ? (
          <OrderDetailSheet
            order={drawerOrder}
            storeNameOf={(id) => storeName(stores, id)}
            lines={orderLines.filter((l) => l.order_id === drawerOrder.id)}
            skuById={skuById}
            inferredStock={inferredStock.filter(
              (i) => i.store_id === drawerOrder.store_id,
            )}
            onConfirm={() => runConfirm([drawerOrder.id])}
            onFlag={() => {
              setFlagNote(drawerOrder.flagged_reason ?? "")
              setFlagOrderId(drawerOrder.id)
            }}
          />
        ) : null}
      </Sheet>
    </div>
  )
}

function SortableHead({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
  className?: string
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-foreground/80 transition-colors hover:text-foreground"
      >
        {label}
        {active ? (
          <HugeiconsIcon
            icon={dir === "asc" ? SortByUp01Icon : SortByDown01Icon}
            strokeWidth={2}
            className="size-3.5"
          />
        ) : null}
      </button>
    </TableHead>
  )
}

function OrderDetailSheet({
  order,
  storeNameOf,
  lines,
  skuById,
  inferredStock,
  onConfirm,
  onFlag,
}: {
  order: Order
  storeNameOf: (id: string) => string
  lines: ReturnType<typeof Array.prototype.filter>
  skuById: Map<string, SKU>
  inferredStock: Array<{
    sku_id: string
    on_hand_estimate: number
    days_of_cover: number
  }>
  onConfirm: () => void
  onFlag: () => void
}) {
  const lowCover = inferredStock
    .filter((i) => i.days_of_cover < 7)
    .sort((a, b) => a.days_of_cover - b.days_of_cover)
    .slice(0, 5)

  const orderTotal = lines.reduce((sum, l) => {
    const price = skuById.get(l.sku_id)?.unit_price_idr ?? 0
    return sum + price * l.requested_qty
  }, 0)

  return (
    <SheetContent className="flex w-full flex-col sm:max-w-lg">
      <SheetHeader>
        <SheetTitle>{storeNameOf(order.store_id)}</SheetTitle>
        <SheetDescription>
          Order {order.id.slice(0, 16)}, created {formatRelative(order.created_at)}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-4">
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted/40 p-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="mt-1">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Lines</div>
            <div className="mt-1 font-medium tabular-nums">{lines.length}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="mt-1 font-medium tabular-nums">
              {formatIDR(orderTotal)}
            </div>
          </div>
        </div>

        {order.flagged_reason ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <div className="font-medium text-destructive">Flagged</div>
            <p className="mt-1 text-muted-foreground">{order.flagged_reason}</p>
          </div>
        ) : null}

        <div>
          <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Lines
          </h3>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Suggested</TableHead>
                  <TableHead className="text-right">Requested</TableHead>
                  <TableHead className="text-right">Delivered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((l) => {
                  const sku = skuById.get(l.sku_id)
                  return (
                    <TableRow key={l.sku_id}>
                      <TableCell>
                        <div className="font-medium">{sku?.name ?? l.sku_id}</div>
                        <div className="text-xs text-muted-foreground">
                          {sku?.code}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {l.suggested_qty}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {l.requested_qty}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {l.delivered_qty}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Low cover at this store
          </h3>
          {lowCover.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No SKU below threshold. The store is well stocked.
            </p>
          ) : (
            <ul className="grid gap-1.5 text-sm">
              {lowCover.map((row) => {
                const sku = skuById.get(row.sku_id)
                return (
                  <li
                    key={row.sku_id}
                    className="flex items-center justify-between rounded-2xl border border-border px-3 py-2"
                  >
                    <span>{sku?.name ?? row.sku_id}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {row.days_of_cover.toFixed(1)} days cover
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <SheetFooter className="flex-row justify-between border-t border-border bg-background">
        <Button variant="outline" onClick={onFlag}>
          Flag for review
        </Button>
        <Button onClick={onConfirm}>
          Confirm order
          <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} />
        </Button>
      </SheetFooter>
    </SheetContent>
  )
}
