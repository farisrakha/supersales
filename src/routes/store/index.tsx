import { Link, createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight02Icon,
  PackageIcon,
  TruckIcon,
  InboxIcon,
} from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useMockStore } from "@/mocks/state"
import { getDemoNow } from "@/mocks/clock"
import { formatDateLong } from "@/components/store/format"
import { useSimulatedError } from "@/components/route-error"

export const Route = createFileRoute("/store/")({ component: StoreHomeRoute })

function StoreHomeRoute() {
  const errorView = useSimulatedError()
  if (errorView) return errorView
  return <StoreHome />
}

function useStorePersonaId(): string {
  const users = useMockStore((s) => s.users)
  const persona = users.find((u) => u.role === "store")
  return persona?.store_id ?? "store-001"
}

function StoreHome() {
  const storeId = useStorePersonaId()
  const allOrders = useMockStore((s) => s.orders)
  const allLines = useMockStore((s) => s.orderLines)
  const stores = useMockStore((s) => s.stores)

  const orders = allOrders.filter((o) => o.store_id === storeId)
  const draft = orders.find((o) => o.status === "draft")
  const store = stores.find((s) => s.id === storeId)
  const lines = draft ? allLines.filter((l) => l.order_id === draft.id) : []

  const inTransit = orders.filter((o) => o.status === "in_transit")
  const recent = orders
    .filter(
      (o) =>
        o.status === "delivered" ||
        o.status === "submitted" ||
        o.status === "confirmed",
    )
    .slice(0, 3)

  const today = formatDateLong(getDemoNow().toISOString())

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <header>
        <p className="text-xs text-muted-foreground">{today}</p>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Selamat pagi, {store?.name ?? "Toko"}
        </h1>
      </header>

      {/* Draft order */}
      {draft ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="font-normal">
                Saran pesanan
              </Badge>
              <span className="text-xs text-muted-foreground tabular-nums">
                {draft.id.slice(0, 12)}
              </span>
            </div>
            <CardTitle className="mt-2">
              {lines.length} item siap dikirim
            </CardTitle>
            <CardDescription>
              Pesanan dari sistem berdasarkan estimasi stok. Tinjau jumlah,
              ubah jika perlu, lalu kirim ke gudang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/store/draft"
              className={buttonVariants({ size: "lg", className: "w-full" })}
            >
              Review and submit
              <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <span className="flex size-10 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <HugeiconsIcon
                icon={InboxIcon}
                strokeWidth={2}
                className="size-5"
              />
            </span>
            <CardTitle className="mt-2">Belum ada draft</CardTitle>
            <CardDescription>
              Saran pesanan berikutnya muncul di sini begitu sistem
              menghitung kebutuhan stok Anda.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* In transit deliveries */}
      <section className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-sm font-semibold">
            Pengiriman hari ini
          </h2>
          <span className="text-xs text-muted-foreground">
            {inTransit.length} dalam perjalanan
          </span>
        </div>

        {inTransit.length > 0 ? (
          <Card className="gap-0 p-0">
            <ul className="divide-y divide-border">
              {inTransit.map((o) => (
                <li key={o.id}>
                  <Link
                    to="/store/receive/$orderId"
                    params={{ orderId: o.id }}
                    className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/60"
                  >
                    <span className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <HugeiconsIcon
                        icon={TruckIcon}
                        strokeWidth={2}
                        className="size-4"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        Order {o.id.slice(0, 10)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Tap untuk catat penerimaan
                      </div>
                    </div>
                    <HugeiconsIcon
                      icon={ArrowRight02Icon}
                      strokeWidth={2}
                      className="size-4 text-muted-foreground"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card size="sm">
            <CardContent className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
              <HugeiconsIcon
                icon={TruckIcon}
                strokeWidth={2}
                className="size-4"
              />
              Tidak ada pengiriman aktif hari ini.
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      {/* Recent orders preview */}
      <section className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-sm font-semibold">
            Pesanan terakhir
          </h2>
          <Link
            to="/store/history"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "-mr-2 h-7 px-2 text-xs",
            })}
          >
            Lihat semua
            <HugeiconsIcon icon={ArrowRight02Icon} strokeWidth={2} />
          </Link>
        </div>

        {recent.length > 0 ? (
          <Card className="gap-0 p-0">
            <ul className="divide-y divide-border">
              {recent.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="flex size-8 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <HugeiconsIcon
                      icon={PackageIcon}
                      strokeWidth={2}
                      className="size-4"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      Order {o.id.slice(0, 10)}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {translateStatus(o.status)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card size="sm">
            <CardContent className="py-2 text-sm text-muted-foreground">
              Belum ada riwayat pesanan.
            </CardContent>
          </Card>
        )}
      </section>

    </div>
  )
}

function translateStatus(status: string): string {
  switch (status) {
    case "submitted":
      return "Menunggu konfirmasi"
    case "confirmed":
      return "Disiapkan gudang"
    case "picking":
      return "Sedang disiapkan"
    case "picked":
      return "Siap dikirim"
    case "in_transit":
      return "Dalam perjalanan"
    case "delivered":
      return "Diterima"
    case "exception":
      return "Bermasalah"
    case "closed":
      return "Selesai"
    default:
      return status
  }
}
