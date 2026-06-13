import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  MinusSignIcon,
  PlusSignIcon,
  MoreVerticalIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMockStore } from "@/mocks/state"
import type { OrderLine } from "@/mocks/types"
import { formatIDR } from "@/components/store/format"

export const Route = createFileRoute("/store/draft")({ component: DraftPage })

function useStorePersonaId(): string {
  const users = useMockStore((s) => s.users)
  const persona = users.find((u) => u.role === "store")
  return persona?.store_id ?? "store-001"
}

function DraftPage() {
  const navigate = useNavigate()
  const storeId = useStorePersonaId()
  const allOrders = useMockStore((s) => s.orders)
  const allLines = useMockStore((s) => s.orderLines)
  const skus = useMockStore((s) => s.skus)
  const editOrderLine = useMockStore((s) => s.editOrderLine)
  const removeOrderLine = useMockStore((s) => s.removeOrderLine)
  const submitStoreOrder = useMockStore((s) => s.submitStoreOrder)

  const draft = allOrders.find(
    (o) => o.store_id === storeId && o.status === "draft",
  )
  const lines = draft ? allLines.filter((l) => l.order_id === draft.id) : []

  const [note, setNote] = React.useState("")

  if (!draft) {
    return (
      <div className="flex flex-col gap-4 px-5 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Tidak ada draft</CardTitle>
            <CardDescription>
              Tidak ada saran pesanan aktif untuk ditinjau.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/store" })}
            >
              Kembali ke beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalItems = lines.reduce((sum, l) => sum + l.requested_qty, 0)
  const totalValue = lines.reduce((sum, l) => {
    const sku = skus.find((s) => s.id === l.sku_id)
    return sum + l.requested_qty * (sku?.unit_price_idr ?? 0)
  }, 0)

  function adjust(line: OrderLine, delta: number) {
    const next = Math.max(0, line.requested_qty + delta)
    if (next === 0) {
      removeOrderLine({ orderId: draft!.id, skuId: line.sku_id })
      return
    }
    editOrderLine({ orderId: draft!.id, skuId: line.sku_id, requestedQty: next })
  }

  function onQtyInput(line: OrderLine, raw: string) {
    const v = Math.max(0, Math.min(999, Number(raw) || 0))
    editOrderLine({ orderId: draft!.id, skuId: line.sku_id, requestedQty: v })
  }

  function handleSubmit() {
    submitStoreOrder({ orderId: draft!.id, note: note.trim() || undefined })
    toast.success("Pesanan terkirim ke gudang", {
      description: "Tim DC akan memproses dalam jam kerja.",
    })
    navigate({ to: "/store" })
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Header */}
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
          <div className="truncate font-heading text-sm font-semibold">
            Draft pesanan
          </div>
          <div className="truncate text-[11px] text-muted-foreground tabular-nums">
            {draft.id} . dari sistem
          </div>
        </div>
      </header>

      {/* Lines */}
      <div className="flex-1 px-4 py-4">
        {lines.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Semua item dihapus</CardTitle>
              <CardDescription>
                Tambahkan kembali item dengan menaikkan jumlah, atau kembali
                ke beranda untuk menunggu saran berikutnya.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {lines.map((line) => {
              const sku = selectSkuByIdLocal(skus, line.sku_id)
              if (!sku) return null
              const edited = line.requested_qty !== line.suggested_qty
              return (
                <li
                  key={line.sku_id}
                  className="rounded-3xl border border-border bg-card p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {sku.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="tabular-nums">{sku.code}</span>
                        <span>.</span>
                        <span>{formatIDR(sku.unit_price_idr)}/unit</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Aksi baris"
                          />
                        }
                      >
                        <HugeiconsIcon
                          icon={MoreVerticalIcon}
                          strokeWidth={2}
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            removeOrderLine({
                              orderId: draft.id,
                              skuId: line.sku_id,
                            })
                          }
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            strokeWidth={2}
                          />
                          Hapus dari pesanan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-muted-foreground">
                        Saran sistem
                      </span>
                      <span className="text-sm tabular-nums">
                        {line.suggested_qty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-muted p-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full bg-background"
                        onClick={() => adjust(line, -1)}
                        aria-label="Kurangi"
                      >
                        <HugeiconsIcon
                          icon={MinusSignIcon}
                          strokeWidth={2}
                        />
                      </Button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={line.requested_qty}
                        onChange={(e) => onQtyInput(line, e.target.value)}
                        className="h-8 w-14 rounded-full bg-transparent text-center text-sm font-medium tabular-nums outline-none focus-visible:bg-background"
                        aria-label={`Jumlah ${sku.name}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full bg-background"
                        onClick={() => adjust(line, +1)}
                        aria-label="Tambah"
                      >
                        <HugeiconsIcon
                          icon={PlusSignIcon}
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  </div>

                  {edited ? (
                    <p className="mt-2 text-[11px] text-primary">
                      Diubah dari saran sistem.
                    </p>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-border bg-background px-4 pt-3 pb-4">
        <div className="mb-3 flex flex-col gap-2">
          <Label htmlFor="note" className="text-xs">
            Catatan untuk gudang (opsional)
          </Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Tolong kirim sebelum jam 11."
            className="min-h-16"
          />
        </div>
        <Separator className="my-3" />
        <div className="mb-3 flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">
              {totalItems} item dari {lines.length} SKU
            </span>
            <span className="font-heading text-base font-semibold tabular-nums">
              {formatIDR(totalValue)}
            </span>
          </div>
        </div>
        <Button
          size="lg"
          className="w-full"
          disabled={lines.length === 0}
          onClick={handleSubmit}
        >
          Approve and submit
        </Button>
      </div>
    </div>
  )
}

function selectSkuByIdLocal(
  skus: ReturnType<typeof useMockStore.getState>["skus"],
  id: string,
) {
  return skus.find((s) => s.id === id)
}

