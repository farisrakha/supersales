import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Delete02Icon,
  PencilEdit02Icon,
  SearchIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  Tabs,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMockStore } from "@/mocks/state"
import type { SKU, SKUCategory } from "@/mocks/types"

import { formatIDR } from "@/components/dc/format"
import { EmptyState } from "@/components/dc/empty-state"

export const Route = createFileRoute("/catalog")({ component: CatalogPage })

const CATEGORIES: Array<{ value: SKUCategory; label: string }> = [
  { value: "snacks", label: "Snacks" },
  { value: "beverages", label: "Beverages" },
  { value: "toiletries", label: "Toiletries" },
]

const categoryTone: Record<SKUCategory, string> = {
  snacks: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  beverages: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  toiletries: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
}

function CatalogPage() {
  const skus = useMockStore((s) => s.skus)
  const upsertSku = useMockStore((s) => s.upsertSku)
  const deleteSku = useMockStore((s) => s.deleteSku)

  const [category, setCategory] = React.useState<SKUCategory | "all">("all")
  const [search, setSearch] = React.useState("")
  const [editing, setEditing] = React.useState<SKU | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState<SKU | null>(null)

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return skus.filter((s) => {
      if (category !== "all" && s.category !== category) return false
      if (q && !s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q))
        return false
      return true
    })
  }, [skus, category, search])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Catalog
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            The SKU master used by the engine to suggest orders. Adjust burn rate
            and thresholds to tune the recommendations.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          Add SKU
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v as SKUCategory | "all")}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative">
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={2}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or code"
            className="w-64 pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No SKUs match"
          description="Switch categories or clear the search. Use Add SKU to define a new one."
        />
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Burn / day</TableHead>
                <TableHead className="text-right">Reorder at</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.code}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="ghost"
                      className={categoryTone[s.category]}
                    >
                      {s.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.default_burn_per_day}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.reorder_threshold_days} d
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatIDR(s.unit_price_idr)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditing(s)}
                        aria-label={`Edit ${s.name}`}
                      >
                        <HugeiconsIcon
                          icon={PencilEdit02Icon}
                          strokeWidth={2}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setConfirmDelete(s)}
                        aria-label={`Delete ${s.name}`}
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <SkuDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => {
          setEditing(null)
          setCreating(false)
        }}
        onSubmit={(input) => {
          const saved = upsertSku(input)
          toast.success(editing ? "SKU updated" : "SKU added", {
            description: `${saved.code}, ${saved.name}`,
          })
          setEditing(null)
          setCreating(false)
        }}
      />

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => {
          if (!o) setConfirmDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this SKU</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete
                ? `${confirmDelete.name} (${confirmDelete.code}) will be removed from the master. Orders that already reference it stay intact.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep SKU</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (confirmDelete) {
                  deleteSku(confirmDelete.id)
                  toast.success("SKU deleted")
                }
                setConfirmDelete(null)
              }}
            >
              Delete SKU
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SkuDialog({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean
  initial: SKU | null
  onClose: () => void
  onSubmit: (input: {
    id?: string
    code: string
    name: string
    category: SKUCategory
    default_burn_per_day: number
    reorder_threshold_days: number
    unit_price_idr: number
  }) => void
}) {
  const [code, setCode] = React.useState("")
  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState<SKUCategory>("snacks")
  const [burn, setBurn] = React.useState("10")
  const [threshold, setThreshold] = React.useState("3")
  const [price, setPrice] = React.useState("5000")

  React.useEffect(() => {
    if (open) {
      setCode(initial?.code ?? "")
      setName(initial?.name ?? "")
      setCategory(initial?.category ?? "snacks")
      setBurn(String(initial?.default_burn_per_day ?? 10))
      setThreshold(String(initial?.reorder_threshold_days ?? 3))
      setPrice(String(initial?.unit_price_idr ?? 5000))
    }
  }, [open, initial])

  const valid =
    code.trim().length > 0 &&
    name.trim().length > 0 &&
    Number(burn) > 0 &&
    Number(threshold) > 0 &&
    Number(price) >= 0

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit SKU" : "Add SKU"}</DialogTitle>
          <DialogDescription>
            Changes apply to the next engine recomputation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="sku-code">Code</Label>
            <Input
              id="sku-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SK-001"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sku-name">Name</Label>
            <Input
              id="sku-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Indomie Goreng 85g"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as SKUCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="sku-burn">Burn / day</Label>
              <Input
                id="sku-burn"
                type="number"
                inputMode="numeric"
                value={burn}
                onChange={(e) => setBurn(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sku-threshold">Reorder days</Label>
              <Input
                id="sku-threshold"
                type="number"
                inputMode="numeric"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sku-price">Price (IDR)</Label>
              <Input
                id="sku-price"
                type="number"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            disabled={!valid}
            onClick={() =>
              onSubmit({
                id: initial?.id,
                code: code.trim(),
                name: name.trim(),
                category,
                default_burn_per_day: Number(burn),
                reorder_threshold_days: Number(threshold),
                unit_price_idr: Number(price),
              })
            }
          >
            {initial ? "Save changes" : "Add SKU"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
