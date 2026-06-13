import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import { Camera01Icon, IdCardLanyardIcon } from "@hugeicons/core-free-icons"

import { useMockStore } from "@/mocks/state"
import type { VisitOutcome } from "@/mocks/types"

export const Route = createFileRoute("/supervisor/activity")({ component: ActivityFeedPage })

function formatIdr(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `Rp ${Math.round(value / 1_000_000)}jt`
  return `Rp ${value.toLocaleString("id-ID")}`
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

function OutcomeBadge({ outcome }: { outcome: VisitOutcome }) {
  if (outcome === "interested") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      >
        Interested
      </Badge>
    )
  }
  if (outcome === "quote_submitted") {
    return (
      <Badge
        variant="outline"
        className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
      >
        Quote submitted
      </Badge>
    )
  }
  return <Badge variant="outline">Not interested this visit</Badge>
}

function ActivityFeedPage() {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const reps = useMockStore((s) => s.reps)
  const accounts = useMockStore((s) => s.accounts)
  const visits = useMockStore((s) => s.visits)
  const visitProducts = useMockStore((s) => s.visitProducts)
  const products = useMockStore((s) => s.products)
  const quoteInquiries = useMockStore((s) => s.quoteInquiries)
  const quoteInquiryLines = useMockStore((s) => s.quoteInquiryLines)
  const updateQuoteStatus = useMockStore((s) => s.updateQuoteStatus)

  const [selectedVisitId, setSelectedVisitId] = React.useState<string | null>(null)
  const [flaggedVisitIds, setFlaggedVisitIds] = React.useState<Set<string>>(new Set())

  const sortedVisits = React.useMemo(
    () => [...visits].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [visits],
  )

  const selectedVisit = selectedVisitId
    ? (visits.find((v) => v.id === selectedVisitId) ?? null)
    : null

  const selectedVisitDemoedProducts = React.useMemo(() => {
    if (!selectedVisit) return []
    return visitProducts
      .filter((vp) => vp.visit_id === selectedVisit.id && vp.demo_given)
      .map((vp) => products.find((p) => p.id === vp.product_id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
  }, [selectedVisit, visitProducts, products])

  const selectedVisitQuote = React.useMemo(
    () =>
      selectedVisit
        ? (quoteInquiries.find((q) => q.visit_id === selectedVisit.id) ?? null)
        : null,
    [selectedVisit, quoteInquiries],
  )

  const selectedVisitQuoteLines = React.useMemo(
    () =>
      selectedVisitQuote
        ? quoteInquiryLines.filter((l) => l.inquiry_id === selectedVisitQuote.id)
        : [],
    [selectedVisitQuote, quoteInquiryLines],
  )

  function flagVisit(visitId: string) {
    const quote = quoteInquiries.find((q) => q.visit_id === visitId)
    if (!quote) {
      toast.error("No quote inquiry attached to this visit")
      return
    }
    updateQuoteStatus(quote.id, "new")
    setFlaggedVisitIds((prev) => new Set([...prev, visitId]))
    toast.success("Flagged for admin review.")
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Skeleton className="mb-2 h-9 w-44" />
        <Skeleton className="mb-8 h-4 w-36" />
        <Skeleton className="mb-4 h-3 w-32" />
        <Card size="sm">
          <Table>
            <TableHeader><TableRow>{Array.from({ length: 5 }).map((_, i) => <TableHead key={i}><Skeleton className="h-3 w-16" /></TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Activity feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">All visits, newest first</p>
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        All visits, newest first
      </p>
      {sortedVisits.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No visits logged today.
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Completed visits will appear here as reps check in.
          </p>
        </div>
      ) : (
      <Card size="sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Rep</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVisits.map((visit) => {
              const rep = reps.find((r) => r.id === visit.rep_id)
              const account = accounts.find((a) => a.id === visit.account_id)
              return (
                <TableRow
                  key={visit.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedVisitId(visit.id)}
                >
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatDate(visit.date)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {rep?.name ?? visit.rep_id}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {account?.name ?? visit.account_id}
                  </TableCell>
                  <TableCell>
                    <OutcomeBadge outcome={visit.outcome} />
                  </TableCell>
                  <TableCell
                    className="p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
                        aria-label="Visit actions"
                      >
                        <span
                          className="text-base leading-none tracking-wider"
                          aria-hidden="true"
                        >
                          ···
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={flaggedVisitIds.has(visit.id)}
                          onClick={() => flagVisit(visit.id)}
                        >
                          {flaggedVisitIds.has(visit.id)
                            ? "Already flagged"
                            : "Flag for admin"}
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
      )}

      {/* Visit detail sheet */}
      <Sheet
        open={selectedVisitId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedVisitId(null)
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selectedVisit && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {accounts.find((a) => a.id === selectedVisit.account_id)?.name ??
                    selectedVisit.account_id}
                </SheetTitle>
                <SheetDescription>
                  {reps.find((r) => r.id === selectedVisit.rep_id)?.name ??
                    selectedVisit.rep_id}{" "}
                  · {formatDate(selectedVisit.date)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-6 pb-6">
                {/* Products demoed */}
                {selectedVisitDemoedProducts.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Products demoed
                    </p>
                    <ul className="space-y-1">
                      {selectedVisitDemoedProducts.map((product) => (
                        <li key={product.id} className="text-sm">
                          <span className="font-medium">{product.code}</span>
                          <span className="text-muted-foreground">
                            {" · "}
                            {product.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Outcome + field note */}
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Outcome
                  </p>
                  <OutcomeBadge outcome={selectedVisit.outcome} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Field note
                  </p>
                  <p className="text-sm">
                    {selectedVisit.note || "No note recorded."}
                  </p>
                </div>

                {/* Photo evidence placeholders */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Visit evidence
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-muted">
                        <HugeiconsIcon
                          icon={Camera01Icon}
                          strokeWidth={1.5}
                          className="size-6 text-muted-foreground/40"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Demo setup</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-muted">
                        <HugeiconsIcon
                          icon={IdCardLanyardIcon}
                          strokeWidth={1.5}
                          className="size-6 text-muted-foreground/40"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Client verification
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quote inquiry (only when outcome is quote_submitted) */}
                {selectedVisit.outcome === "quote_submitted" &&
                  selectedVisitQuote && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Quote inquiry
                      </p>
                      <div className="space-y-1.5 rounded-xl border border-border px-3 py-2.5">
                        {selectedVisitQuoteLines.map((line) => {
                          const product = products.find(
                            (p) => p.id === line.product_id,
                          )
                          return (
                            <div
                              key={line.product_id}
                              className="flex items-baseline justify-between gap-2"
                            >
                              <p className="text-sm">
                                <span className="font-medium">
                                  {product?.name ?? line.product_id}
                                </span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  {"×"} {line.quantity}{" "}
                                  {line.quantity === 1 ? "unit" : "units"}
                                </span>
                              </p>
                              <p className="shrink-0 tabular-nums text-sm text-muted-foreground">
                                {formatIdr(line.quantity * line.unit_price_idr)}
                              </p>
                            </div>
                          )
                        })}
                        <div className="border-t border-border pt-1.5">
                          <div className="flex items-baseline justify-between">
                            <p className="text-xs text-muted-foreground">Total</p>
                            <p className="tabular-nums text-sm font-semibold">
                              {formatIdr(selectedVisitQuote.total_idr)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Flag action */}
                <div className="border-t border-border pt-4">
                  <button
                    type="button"
                    disabled={flaggedVisitIds.has(selectedVisit.id)}
                    onClick={() => {
                      flagVisit(selectedVisit.id)
                      setSelectedVisitId(null)
                    }}
                    className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {flaggedVisitIds.has(selectedVisit.id)
                      ? "Already flagged"
                      : "Flag for admin"}
                  </button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
