import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
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

export const Route = createFileRoute("/supervisor/")({ component: SupervisorHome })

type RepStatus = "on_schedule" | "no_checkin" | "overdue"

function formatIdr(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `Rp ${Math.round(value / 1_000_000)}jt`
  return `Rp ${value.toLocaleString("id-ID")}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  })
}

function daysSince(dateStr: string, now: Date): number {
  return Math.floor(
    (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  )
}

function RepStatusBadge({ status }: { status: RepStatus }) {
  if (status === "on_schedule") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      >
        On schedule
      </Badge>
    )
  }
  if (status === "overdue") {
    return <Badge variant="destructive">Overdue</Badge>
  }
  return <Badge variant="secondary">No check-in</Badge>
}

function SupervisorHome() {
  const [loading, setLoading] = React.useState(true)
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const demoNow = getDemoNow()
  const today = demoNow.toISOString().slice(0, 10)

  const reps = useMockStore((s) => s.reps)
  const visits = useMockStore((s) => s.visits)
  const visitPlans = useMockStore((s) => s.visitPlans)
  const kpi = useMockStore((s) => selectKpiForPeriod(s, "today"))

  const todayVisits = React.useMemo(
    () => visits.filter((v) => v.date === today),
    [visits, today],
  )

  const todayPendingPlans = React.useMemo(
    () => visitPlans.filter((p) => p.planned_date === today && p.status === "pending"),
    [visitPlans, today],
  )

  const overdueRepCount = React.useMemo(() => {
    const completedRepIds = new Set(todayVisits.map((v) => v.rep_id))
    const plannedRepIds = new Set(todayPendingPlans.map((p) => p.rep_id))
    return reps.filter((rep) => {
      if (completedRepIds.has(rep.id) || plannedRepIds.has(rep.id)) return false
      const lastVisit = [...visits]
        .filter((v) => v.rep_id === rep.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0]
      return lastVisit !== undefined && daysSince(lastVisit.date, demoNow) > 7
    }).length
  }, [reps, visits, todayVisits, todayPendingPlans, demoNow])

  function getRepStatus(repId: string): RepStatus {
    if (todayVisits.some((v) => v.rep_id === repId)) return "on_schedule"
    if (todayPendingPlans.some((p) => p.rep_id === repId)) return "no_checkin"
    const lastVisit = [...visits]
      .filter((v) => v.rep_id === repId)
      .sort((a, b) => b.date.localeCompare(a.date))[0]
    if (lastVisit && daysSince(lastVisit.date, demoNow) > 7) return "overdue"
    return "no_checkin"
  }

  function getLastCheckin(repId: string): string | null {
    const match = [...todayVisits]
      .filter((v) => v.rep_id === repId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
    return match ? formatTime(match.created_at) : null
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Skeleton className="mb-2 h-9 w-56" />
        <Skeleton className="mb-8 h-4 w-40" />
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} size="sm"><CardContent className="pt-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="mb-4 h-3 w-24" />
        <Card size="sm">
          <Table>
            <TableHeader><TableRow>{Array.from({ length: 5 }).map((_, i) => <TableHead key={i}><Skeleton className="h-3 w-16" /></TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
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
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Good morning, Dewi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {demoNow.toLocaleDateString("en-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
          })}
        </p>
      </div>

      {/* KPI strip */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card size="sm" className="bg-emerald-500/[0.06] ring-1 ring-emerald-500/10">
          <CardContent className="pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Visits completed
            </p>
            <p className="mt-2 font-heading text-5xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              {kpi.visits_completed}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">today</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Visits planned
            </p>
            <p className="mt-2 font-heading text-4xl font-semibold tabular-nums">
              {kpi.visits_completed + todayPendingPlans.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {kpi.active_reps} reps active
            </p>
          </CardContent>
        </Card>

        <Card
          size="sm"
          className={
            overdueRepCount > 0 ? "bg-amber-500/[0.06] ring-1 ring-amber-500/10" : ""
          }
        >
          <CardContent className="pt-4">
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                overdueRepCount > 0
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground",
              )}
            >
              Reps overdue
            </p>
            <p
              className={cn(
                "mt-2 font-heading text-4xl font-semibold tabular-nums",
                overdueRepCount > 0
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-foreground",
              )}
            >
              {overdueRepCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">no check-in in 7+ days</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quotes raised
            </p>
            <p className="mt-2 font-heading text-4xl font-semibold tabular-nums">
              {kpi.quote_inquiries_raised}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatIdr(kpi.quote_value_idr)} today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rep status */}
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Rep status
      </p>
      <Card size="sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rep</TableHead>
              <TableHead>Territory</TableHead>
              <TableHead className="text-right">Visits today</TableHead>
              <TableHead>Last check-in</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reps.map((rep) => {
              const done = todayVisits.filter((v) => v.rep_id === rep.id).length
              const pending = todayPendingPlans.filter(
                (p) => p.rep_id === rep.id,
              ).length
              const status = getRepStatus(rep.id)
              const lastCheckin = getLastCheckin(rep.id)
              return (
                <TableRow key={rep.id}>
                  <TableCell className="font-medium">{rep.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {rep.territory}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="font-semibold">{done}</span>
                    <span className="text-muted-foreground">
                      {" / "}
                      {done + pending}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {lastCheckin ?? (
                      <span className="italic text-muted-foreground/60">
                        No activity
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <RepStatusBadge status={status} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
