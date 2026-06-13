import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DeltaBadge } from "@/components/exec/delta-badge"
import { TrendRow } from "@/components/exec/trend-row"
import { selectKpiForPeriod, useMockStore } from "@/mocks/state"
import type { MockState } from "@/mocks/state"
import type { ScenarioId } from "@/mocks/types"
import { useSimulatedError } from "@/components/route-error"

export const Route = createFileRoute("/exec/")({ component: ExecOverviewRoute })

function ExecOverviewRoute() {
  const errorView = useSimulatedError()
  if (errorView) return errorView
  return <ExecOverview />
}

type Period = "today" | "7d" | "30d"

const PERIOD_LABEL: Record<Period, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
}

const PERIOD_RANGE: Record<Period, string> = {
  today: "Tuesday, 26 May 2026",
  "7d": "20 to 26 May 2026",
  "30d": "27 April to 26 May 2026",
}

// Scenario tone shifts the KPI surface so demoers see meaningful change when
// they swap scenarios. The selector in state.ts is pure on period; we layer a
// scenario adjustment here.
const SCENARIO_TONE: Record<ScenarioId, { stock: number; on: number; acc: number; cycle: number }> = {
  "calm-tuesday": { stock: 0, on: 0, acc: 0, cycle: 0 },
  "exception-friday": { stock: 2.4, on: -5.6, acc: -3.1, cycle: 4.8 },
  "end-of-month-surge": { stock: 1.1, on: -2.3, acc: 2.7, cycle: 6.2 },
}

function tonedKpi(
  state: MockState,
  period: Period,
): {
  stockOutRatePct: number
  onTimePct: number
  acceptancePct: number
  avgCycleHours: number
} {
  const base = selectKpiForPeriod(state, period)
  const t = SCENARIO_TONE[state.currentScenario]
  return {
    stockOutRatePct: Math.round((base.stockOutRatePct + t.stock) * 10) / 10,
    onTimePct: Math.round((base.onTimePct + t.on) * 10) / 10,
    acceptancePct: Math.round((base.acceptancePct + t.acc) * 10) / 10,
    avgCycleHours: Math.round((base.avgCycleHours + t.cycle) * 10) / 10,
  }
}

function previousPeriod(p: Period): Period {
  // For the mock, treat "previous" as the next-longer window. The deltas
  // shift meaningfully when the user toggles tabs.
  return p === "today" ? "7d" : p === "7d" ? "30d" : "today"
}

function deriveDcKpis(state: MockState, dcId: string, period: Period) {
  // Per-DC values are gently perturbed from network values using a stable hash.
  const base = tonedKpi(state, period)
  const hash = Array.from(dcId).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0,
    7,
  )
  const drift = ((hash % 13) - 6) / 10 // -0.6 to +0.6
  const driftPct = ((hash % 21) - 10) / 10 // -1.0 to +1.0
  return {
    stockOutRatePct:
      Math.round((base.stockOutRatePct + drift) * 10) / 10,
    onTimePct: Math.round((base.onTimePct + driftPct) * 10) / 10,
    acceptancePct: Math.round((base.acceptancePct - driftPct) * 10) / 10,
    avgCycleHours: Math.round((base.avgCycleHours + drift) * 10) / 10,
  }
}

function shapeForPeriod(p: Period): number[] {
  // Stable shape per period; conveys variation without claiming real data.
  if (p === "today") return [3, 4, 5, 4, 6, 5, 7]
  if (p === "7d") return [4, 5, 4, 6, 5, 7, 6]
  return [5, 6, 5, 7, 6, 8, 7, 6, 7]
}

function ExecOverview() {
  const state = useMockStore()
  const [period, setPeriod] = React.useState<Period>("today")
  const kpi = tonedKpi(state, period)
  const prev = tonedKpi(state, previousPeriod(period))

  const shape = shapeForPeriod(period)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Operations overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {PERIOD_RANGE[period]}, across all distribution centers.
          </p>
        </div>
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as Period)}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <section
        aria-label="Network KPIs"
        className="grid grid-cols-1 gap-3 lg:grid-cols-3"
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardDescription className="text-xs tracking-wide uppercase">
              North star, stock out rate
            </CardDescription>
            <CardTitle className="font-heading text-lg font-medium">
              Shelves staying full
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-5xl font-semibold tabular-nums sm:text-6xl">
                  {kpi.stockOutRatePct}
                  <span className="ml-1 text-xl font-medium text-muted-foreground">
                    %
                  </span>
                </span>
              </div>
              <DeltaBadge
                current={kpi.stockOutRatePct}
                previous={prev.stockOutRatePct}
                betterDirection="down"
                unit="%"
              />
              <p className="max-w-md text-sm text-muted-foreground">
                Share of store-SKUs that ran dry during the period. Lower is
                better. Track this above all else.
              </p>
            </div>
            <TrendRow
              values={shape}
              tone={kpi.stockOutRatePct > prev.stockOutRatePct ? "warn" : "neutral"}
              className="h-16"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <SmallKpi
            label="On time delivery"
            value={`${kpi.onTimePct}%`}
            current={kpi.onTimePct}
            previous={prev.onTimePct}
            betterDirection="up"
            unit="%"
          />
          <SmallKpi
            label="Suggested order acceptance"
            value={`${kpi.acceptancePct}%`}
            current={kpi.acceptancePct}
            previous={prev.acceptancePct}
            betterDirection="up"
            unit="%"
          />
          <SmallKpi
            label="Average cycle"
            value={`${kpi.avgCycleHours}h`}
            current={kpi.avgCycleHours}
            previous={prev.avgCycleHours}
            betterDirection="down"
            unit="h"
          />
        </div>
      </section>

      <Separator className="my-8" />

      <section aria-label="Per DC breakdown" className="grid gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">By distribution center</h2>
            <p className="text-sm text-muted-foreground">
              Same metrics, broken out by site. {PERIOD_LABEL[period]}.
            </p>
          </div>
          <Badge variant="secondary" className="font-normal">
            {state.dcs.length} sites
          </Badge>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Distribution center</TableHead>
                  <TableHead className="text-right">Stock out</TableHead>
                  <TableHead className="text-right">On time</TableHead>
                  <TableHead className="text-right">Acceptance</TableHead>
                  <TableHead className="text-right">Avg cycle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.dcs.map((dc) => {
                  const row = deriveDcKpis(state, dc.id, period)
                  return (
                    <TableRow key={dc.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{dc.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {dc.region}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {row.stockOutRatePct}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.onTimePct}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.acceptancePct}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.avgCycleHours}h
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function SmallKpi({
  label,
  value,
  current,
  previous,
  betterDirection,
  unit,
}: {
  label: string
  value: string
  current: number
  previous: number
  betterDirection: "up" | "down"
  unit: string
}) {
  return (
    <Card size="sm" className="shadow-none ring-1 ring-border">
      <CardContent className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-heading text-2xl font-semibold tabular-nums">
          {value}
        </span>
        <DeltaBadge
          current={current}
          previous={previous}
          betterDirection={betterDirection}
          unit={unit}
        />
      </CardContent>
    </Card>
  )
}
