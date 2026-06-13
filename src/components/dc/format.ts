// Formatting helpers shared across DC Ops surfaces.
import { getDemoNow } from "@/mocks"

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

export function formatIDR(n: number): string {
  return idrFormatter.format(n)
}

export function formatCompactIDR(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`
  return `Rp ${n}`
}

export function formatRelative(iso: string | undefined): string {
  if (!iso) return "Not set"
  const now = getDemoNow().getTime()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const absMin = Math.round(Math.abs(diffMs) / 60_000)
  const inFuture = diffMs < 0
  if (absMin < 1) return "Just now"
  if (absMin < 60) return inFuture ? `In ${absMin} min` : `${absMin} min ago`
  const hours = Math.round(absMin / 60)
  if (hours < 24) return inFuture ? `In ${hours} h` : `${hours} h ago`
  const days = Math.round(hours / 24)
  if (days < 14) return inFuture ? `In ${days} d` : `${days} d ago`
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

export function formatClock(iso: string | undefined): string {
  if (!iso) return "Not set"
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  })
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  })
}
