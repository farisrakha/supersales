import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Camera01Icon, IdCardLanyardIcon } from "@hugeicons/core-free-icons"

import { useMockStore, selectKpiForPeriod } from "@/mocks/state"
import { getDemoNow } from "@/mocks/clock"
import type { VisitOutcome } from "@/mocks/types"

export const Route = createFileRoute("/supervisor/")({ component: SupervisorHome })

type RepStatus = "on_schedule" | "no_checkin" | "overdue"

const INDUSTRY_LABEL: Record<string, string> = {
  automotive: "Automotive",
  electronics: "Electronics",
  food_processing: "Food processing",
  pharmaceutical: "Pharmaceutical",
}

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

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

function daysSince(dateStr: string, now: Date): number {
  return Math.floor(
    (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  )
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
  const demoNow = getDemoNow()
  const today = demoNow.toISOString().slice(0, 10)

  const reps = useMockStore((s) => s.reps)
  const accounts = useMockStore((s) => s.accounts)
  const visits = useMockStore((s) => s.visits)
  const visitPlans = useMockStore((s) => s.visitPlans)
  const visitProducts = useMockStore((s) => s.visitProducts)
  const products = useMockStore((s) => s.products)
  const quoteInquiries = useMockStore((s) => s.quoteInquiries)
  const quoteInquiryLines = useMockStore((s) => s.quoteInquiryLines)
  const kpi = useMockStore((s) => selectKpiForPeriod(s, "today"))

  const [activeTab, setActiveTab] = React.useState("today")
  const [selectedVisitId, setSelectedVisitId] = React.useState<string | null>(null)
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null)
  const [flaggedVisitIds, setFlaggedVisitIds] = React.useState<Set<string>>(new Set())
  const [queueRepFilter, setQueueRepFilter] = React.useState("all")

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

  const overdueAccountIds = React.useMemo(() => {
    const recentlyVisited = new Set(
      visits
        .filter((v) => daysSince(v.date, demoNow) <= 21)
        .map((v) => v.account_id),
    )
    return new Set(accounts.filter((a) => !recentlyVisited.has(a.id)).map((a) => a.id))
  }, [visits, accounts, demoNow])

  const filteredPlans = React.useMemo(
    () =>
      queueRepFilter === "all"
        ? todayPendingPlans
        : todayPendingPlans.filter((p) => p.rep_id === queueRepFilter),
    [todayPendingPlans, queueRepFilter],
  )

  const sortedVisits = React.useMemo(
    () => [...visits].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [visits],
  )

  const selectedVisit = selectedVisitId
    ? (visits.find((v) => v.id === selectedVisitId) ?? null)
    : null

  const selectedAccount = selectedAccountId
    ? (accounts.find((a) => a.id === selectedAccountId) ?? null)
    : null

  const selectedAccountVisits = React.useMemo(
    () =>
      selectedAccount
        ? [...visits]
            .filter((v) => v.account_id === selectedAccount.id)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 10)
        : [],
    [selectedAccount, visits],
  )

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

  function flagVisit(visitId: string) {
    setFlaggedVisitIds((prev) => new Set([...prev, visitId]))
    toast.success("Flagged for admin review.")
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as string)}>
        <TabsList
          variant="line"
          className="mb-6 w-full justify-start rounded-none border-b border-border bg-transparent px-0"
        >
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="queue">Visit queue</TabsTrigger>
          <TabsTrigger value="activity">Activity feed</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        {/* Today: rep status grid */}
        <TabsContent value="today">
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
        </TabsContent>

        {/* Visit Queue */}
        <TabsContent value="queue">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pending visits today
            </p>
            <Select
              value={queueRepFilter}
              onValueChange={(v) => {
                if (v) setQueueRepFilter(v)
              }}
            >
              <SelectTrigger size="sm" aria-label="Filter by rep">
                <SelectValue>
                  {queueRepFilter === "all"
                    ? "All reps"
                    : (reps.find((r) => r.id === queueRepFilter)?.name ?? "All reps")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All reps</SelectItem>
                {reps.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredPlans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-sm text-muted-foreground">
                All visits completed for the selected rep.
              </p>
            </div>
          ) : (
            <Card size="sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rep</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => {
                    const rep = reps.find((r) => r.id === plan.rep_id)
                    const account = accounts.find((a) => a.id === plan.account_id)
                    return (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">
                          {rep?.name ?? plan.rep_id}
                        </TableCell>
                        <TableCell>{account?.name ?? plan.account_id}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {account?.area ?? ""}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {plan.note ?? (
                            <span className="italic text-muted-foreground/50">
                              No note
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Activity Feed */}
        <TabsContent value="activity">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            All visits, newest first
          </p>
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
        </TabsContent>

        {/* Accounts */}
        <TabsContent value="accounts">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            All accounts
          </p>
          <Card size="sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Assigned rep</TableHead>
                  <TableHead>Last visit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const isOverdue = overdueAccountIds.has(account.id)
                  const lastVisit = [...visits]
                    .filter((v) => v.account_id === account.id)
                    .sort((a, b) => b.date.localeCompare(a.date))[0]
                  const assignedRep = reps.find(
                    (r) => r.id === account.assigned_rep_id,
                  )
                  return (
                    <TableRow
                      key={account.id}
                      className={cn(
                        "cursor-pointer",
                        isOverdue &&
                          "bg-amber-500/[0.04] hover:bg-amber-500/[0.07]",
                      )}
                      onClick={() => setSelectedAccountId(account.id)}
                    >
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-2">
                          {isOverdue && (
                            <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                          )}
                          {account.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {INDUSTRY_LABEL[account.industry] ?? account.industry}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {account.area}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {assignedRep?.name ?? account.assigned_rep_id}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "tabular-nums",
                          isOverdue
                            ? "font-medium text-amber-700 dark:text-amber-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {lastVisit
                          ? `${formatDate(lastVisit.date)} (${daysSince(lastVisit.date, demoNow)}d ago)`
                          : "Never visited"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

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

      {/* Account detail sheet */}
      <Sheet
        open={selectedAccountId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAccountId(null)
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selectedAccount && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedAccount.name}</SheetTitle>
                <SheetDescription>
                  {INDUSTRY_LABEL[selectedAccount.industry] ??
                    selectedAccount.industry}{" "}
                  · {selectedAccount.city}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-6 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">
                      Assigned rep
                    </p>
                    <p className="text-sm font-medium">
                      {reps.find((r) => r.id === selectedAccount.assigned_rep_id)
                        ?.name ?? selectedAccount.assigned_rep_id}
                    </p>
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium">
                      {selectedAccount.contact_name}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Visit history
                  </p>
                  {selectedAccountVisits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Visits logged for this account will appear here.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedAccountVisits.map((visit) => {
                        const visitRep = reps.find((r) => r.id === visit.rep_id)
                        return (
                          <div
                            key={visit.id}
                            className="flex items-start justify-between gap-4 rounded-2xl border border-border px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="tabular-nums text-xs text-muted-foreground">
                                {formatDate(visit.date)}
                              </p>
                              <p className="text-sm font-medium">
                                {visitRep?.name ?? visit.rep_id}
                              </p>
                              {visit.note && (
                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                  {visit.note}
                                </p>
                              )}
                            </div>
                            <OutcomeBadge outcome={visit.outcome} />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
