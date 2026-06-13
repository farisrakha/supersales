import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  Camera01Icon,
  CheckmarkCircle02Icon,
  Image01Icon,
  TruckIcon,
} from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useMockStore } from "@/mocks/state"
import { formatIDR } from "@/components/store/format"

export const Route = createFileRoute("/store/receive/$orderId")({
  component: ReceivePage,
})

function ReceivePage() {
  const { orderId } = Route.useParams()
  const navigate = useNavigate()
  const allOrders = useMockStore((s) => s.orders)
  const allLines = useMockStore((s) => s.orderLines)
  const skus = useMockStore((s) => s.skus)
  const users = useMockStore((s) => s.users)
  const markStoreReceived = useMockStore((s) => s.markStoreReceived)

  const order = allOrders.find((o) => o.id === orderId)
  const lines = allLines.filter((l) => l.order_id === orderId)

  const persona = users.find((u) => u.role === "store")
  const [open, setOpen] = React.useState(false)
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  if (!order) {
    return (
      <div className="px-5 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Pesanan tidak ditemukan</CardTitle>
            <CardDescription>
              Pesanan mungkin sudah ditutup atau diubah.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: "/store" })}>
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

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(URL.createObjectURL(file))
  }

  function confirmReceived() {
    markStoreReceived({
      orderId: order!.id,
      podPhotoUrl: photoUrl ?? "",
      capturedBy: persona?.id ?? "user-store",
    })
    toast.success("Penerimaan dicatat", {
      description: "Tim DC akan menutup pesanan dalam hari ini.",
    })
    setOpen(false)
    navigate({ to: "/store" })
  }

  const isInTransit = order.status === "in_transit"

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
          <div className="truncate font-heading text-sm font-semibold">
            Terima pesanan
          </div>
          <div className="truncate text-[11px] text-muted-foreground tabular-nums">
            {order.id}
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HugeiconsIcon
                  icon={TruckIcon}
                  strokeWidth={2}
                  className="size-5"
                />
              </span>
              <div>
                <CardTitle>Ringkasan pesanan</CardTitle>
                <CardDescription>
                  {totalItems} item dari {lines.length} SKU
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {lines.map((l) => {
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
                    <div className="shrink-0 text-right tabular-nums">
                      {l.requested_qty}
                    </div>
                  </li>
                )
              })}
            </ul>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total nilai</span>
              <span className="font-heading text-base font-semibold tabular-nums">
                {formatIDR(totalValue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {order.status === "delivered" ? (
          <Card>
            <CardContent className="flex items-center gap-3 py-4 text-sm">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                className="size-5 text-primary"
              />
              <div>
                <div className="font-medium">Sudah diterima</div>
                <div className="text-[11px] text-muted-foreground">
                  Pesanan ini sudah dicatat sebagai diterima.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background px-4 pt-3 pb-4">
        <Button
          size="lg"
          className="w-full"
          disabled={!isInTransit}
          onClick={() => setOpen(true)}
        >
          Mark received
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Konfirmasi penerimaan</SheetTitle>
            <SheetDescription>
              Ambil foto bukti penerimaan, lalu konfirmasi.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pod-photo">Foto bukti</Label>
              <input
                ref={fileRef}
                id="pod-photo"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhoto}
                className="hidden"
              />
              {photoUrl ? (
                <div className="overflow-hidden rounded-2xl border border-border">
                  <img
                    src={photoUrl}
                    alt="Bukti penerimaan"
                    className="block aspect-video w-full object-cover"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground transition-colors hover:bg-muted"
                >
                  <HugeiconsIcon
                    icon={Image01Icon}
                    strokeWidth={2}
                    className="size-6"
                  />
                  <span>Belum ada foto</span>
                </button>
              )}
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
              >
                <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} />
                {photoUrl ? "Ganti foto" : "Ambil foto"}
              </Button>
            </div>
          </div>
          <SheetFooter>
            <Button size="lg" onClick={confirmReceived}>
              Catat penerimaan
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
