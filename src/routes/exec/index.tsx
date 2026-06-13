import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { useMockStore, selectKpiForPeriod } from "@/mocks/state"
import { getDemoNow } from "@/mocks/clock"

export const Route = createFileRoute("/exec/")({ component: ExecOverview })

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "today" | "7d" | "30d"

// ─── Mock deltas (vs prior same-length period) ───────────────────────────────

const MOCK_DELTAS: Record<
  Period,
  { completion: number; quotes: number; accounts: number; avgVisits: number }
> = {
  today: { completion: 5, quotes: 0, accounts: 1, avgVisits: 0.1 },
  "7d": { completion: 8, quotes: 2, accounts: 3, avgVisits: 0.3 },
  "30d": { completion: 12, quotes: 5, accounts: 4, avgVisits: 0.8 },
}

// ─── Delta chip ───────────────────────────────────────────────────────────────

function DeltaChip({
  value,
  format = "int",
}: {
  value: number
  format?: "int" | "decimal"
}) {
  const label =
    value === 0
      ? "no change"
      : `${value > 0 ? "+" : ""}${format === "decimal" ? value.toFixed(1) : value} vs prev`
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        value === 0
          ? "text-muted-foreground"
          : value > 0
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400",
      )}
    >
      {label}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function ExecOverview() {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const demoNow = getDemoNow()
  const today = demoNow.toISOString().slice(0, 10)
  const cutoff7 = new Date(demoNow.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  const cutoff30 = new Date(demoNow.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const reps = useMockStore((s) => s.reps)
  const accounts = useMockStore((s) => s.accounts)
  const products = useMockStore((s) => s.products)
  const visits = useMockStore((s) => s.visits)
  const visitPlans = useMockStore((s) => s.visitPlans)
  const visitProducts = useMockStore((s) => s.visitProducts)
  const quoteInquiries = useMockStore((s) => s.quoteInquiries)
  const quoteInquiryLines = useMockStore((s) => s.quoteInquiryLines)

  const [period, setPeriod] = React.useState<Period>("today")
  const [sortAsc, setSortAsc] = React.useState(true)

  const kpi = useMockStore((s) => selectKpiForPeriod(s, period))
  const deltas = MOCK_DELTAS[period]

  // ── Period filter helper ──────────────────────────────────────────────────

  const inPeriod = React.useCallback(
    (dateStr: string): boolean => {
      if (period === "today") return dateStr === today
      if (period === "7d") return dateStr >= cutoff7
      return dateStr >= cutoff30
    },
    [period, today, cutoff7, cutoff30],
  )

  // ── Completion rate ───────────────────────────────────────────────────────

  const pendingPlanCount = React.useMemo(
    () =>
      visitPlans.filter((p) => inPeriod(p.planned_date) && p.status === "pending")
        .length,
    [visitPlans, inPeriod],
  )

  const completionRate = React.useMemo(() => {
    const total = kpi.visits_completed + pendingPlanCount
    return total === 0 ? 0 : Math.round((kpi.visits_completed / total) * 100)
  }, [kpi.visits_completed, pendingPlanCount])

  // ── Per-rep rows ─────────────────────────────────────────────────────────

  const repRows = React.useMemo(
    () =>
      reps.map((rep) => {
        const repVisits = visits.filter(
          (v) => v.rep_id === rep.id && inPeriod(v.date),
        )
        const planned = visitPlans.filter(
          (p) =>
            p.rep_id === rep.id &&
            inPeriod(p.planned_date) &&
            p.status !== "cancelled",
        ).length
        const completed = repVisits.length
        const quotes = quoteInquiries.filter(
          (q) => q.rep_id === rep.id && inPeriod(q.created_at.slice(0, 10)),
        ).length
        const coveredAccounts = new Set(repVisits.map((v) => v.account_id)).size
        const pct =
          planned > 0 ? Math.round((completed / planned) * 100) : null
        return { rep, planned, completed, pct, quotes, coveredAccounts }
      }),
    [reps, visits, visitPlans, quoteInquiries, inPeriod],
  )

  const sortedRepRows = React.useMemo(
    () =>
      [...repRows].sort((a, b) => {
        const aPct = a.pct ?? (sortAsc ? Infinity : -Infinity)
        const bPct = b.pct ?? (sortAsc ? Infinity : -Infinity)
        return sortAsc ? aPct - bPct : bPct - aPct
      }),
    [repRows, sortAsc],
  )

  // ── Product rows ─────────────────────────────────────────────────────────

  const productRows = React.useMemo(() => {
    const visitIdsInPeriod = new Set(
      visits.filter((v) => inPeriod(v.date)).map((v) => v.id),
    )
    const quoteIdsInPeriod = new Set(
      quoteInquiries
        .filter((q) => inPeriod(q.created_at.slice(0, 10)))
        .map((q) => q.id),
    )
    return products
      .map((product) => {
        const demoCount = visitProducts.filter(
          (vp) =>
            vp.product_id === product.id &&
            vp.demo_given &&
            visitIdsInPeriod.has(vp.visit_id),
        ).length
        const quoteCount = quoteInquiryLines.filter(
          (l) =>
            l.product_id === product.id && quoteIdsInPeriod.has(l.inquiry_id),
        ).length
        const convRate =
          demoCount > 0 ? Math.round((quoteCount / demoCount) * 100) : 0
        return { product, demoCount, quoteCount, convRate }
      })
      .filter((r) => r.demoCount > 0 || r.quoteCount > 0)
      .sort((a, b) => b.demoCount - a.demoCount)
  }, [products, visitProducts, quoteInquiries, quoteInquiryLines, visits, inPeriod])

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Skeleton className="mb-2 h-9 w-64" />
        <Skeleton className="mb-8 h-4 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} size="sm"><CardContent className="pt-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <Tabs
        value={period}
        onValueChange={(v) => {
          if (v) setPeriod(v as Period)
        }}
      >
        {/* Header + period selector */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              Performance summary
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pak Arief · Java territory, read-only
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
          </TabsList>
        </div>

        {/* Content updates on period switch */}
        <TabsContent value={period}>
          {/* KPI tiles */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Completion rate: differentiated by progress bar */}
            <Card size="sm" className="col-span-2 lg:col-span-1">
              <CardContent className="pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Visit completion
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-semibold tabular-nums leading-none">
                    {completionRate}
                  </span>
                  <span className="text-xl font-semibold text-muted-foreground">
                    %
                  </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-foreground transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {kpi.visits_completed} done · {pendingPlanCount} pending
                </p>
                <DeltaChip value={deltas.completion} />
              </CardContent>
            </Card>

            {/* Quote inquiries */}
            <Card size="sm">
              <CardContent className="pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Quote inquiries
                </p>
                <span className="font-heading text-4xl font-semibold tabular-nums leading-none">
                  {kpi.quote_inquiries_raised}
                </span>
                <p className="mt-2 text-xs text-muted-foreground">
                  submitted this period
                </p>
                <DeltaChip value={deltas.quotes} />
              </CardContent>
            </Card>

            {/* Accounts covered */}
            <Card size="sm">
              <CardContent className="pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Accounts covered
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-4xl font-semibold tabular-nums leading-none">
                    {kpi.accounts_covered}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    of {accounts.length}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  unique accounts visited
                </p>
                <DeltaChip value={deltas.accounts} />
              </CardContent>
            </Card>

            {/* Avg visits per rep */}
            <Card size="sm">
              <CardContent className="pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Avg visits / rep
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-heading text-4xl font-semibold tabular-nums leading-none">
                    {kpi.avg_visits_per_rep.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ week</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  across {kpi.active_reps} active reps
                </p>
                <DeltaChip value={deltas.avgVisits} format="decimal" />
              </CardContent>
            </Card>
          </div>

          {/* Per-rep breakdown */}
          <div className="mt-10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rep breakdown
            </p>
            <Card size="sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rep</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead className="text-right">Planned</TableHead>
                    <TableHead className="text-right">Completed</TableHead>
                    <TableHead
                      className="cursor-pointer select-none text-right"
                      onClick={() => setSortAsc((v) => !v)}
                    >
                      Completion {sortAsc ? "↑" : "↓"}
                    </TableHead>
                    <TableHead className="text-right">Quotes</TableHead>
                    <TableHead className="text-right">Accounts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRepRows.map(
                    ({ rep, planned, completed, pct, quotes, coveredAccounts }) => (
                      <TableRow key={rep.id}>
                        <TableCell className="font-medium">{rep.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {rep.territory}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {planned}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">
                          {completed}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {pct === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span
                              className={cn(
                                "font-semibold",
                                pct < 50
                                  ? "text-red-600 dark:text-red-400"
                                  : pct < 100
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-emerald-600 dark:text-emerald-400",
                              )}
                            >
                              {pct}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {quotes}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {coveredAccounts}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Top products */}
          {productRows.length > 0 && (
            <div className="mt-10 mb-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Product performance
              </p>
              <Card size="sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Demo count</TableHead>
                      <TableHead className="text-right">Quote inquiries</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productRows.map(({ product, demoCount, quoteCount, convRate }) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold tracking-wider">
                            {product.code}
                          </span>
                          <span className="ml-2 text-muted-foreground">
                            {product.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">
                          {demoCount}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {quoteCount}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span
                            className={cn(
                              convRate === 0
                                ? "text-muted-foreground"
                                : convRate >= 50
                                  ? "font-semibold text-emerald-600 dark:text-emerald-400"
                                  : "",
                            )}
                          >
                            {convRate}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
