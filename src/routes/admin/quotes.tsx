import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Camera01Icon, IdCardLanyardIcon } from "@hugeicons/core-free-icons"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useMockStore } from "@/mocks/state"
import type { QuoteStatus, VisitOutcome } from "@/mocks/types"

export const Route = createFileRoute("/admin/quotes")({ component: QuotesPage })

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "forwarded", label: "Forwarded" },
  { value: "closed", label: "Closed" },
]

function formatIdr(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `Rp ${Math.round(value / 1_000_000)}jt`
  return `Rp ${value.toLocaleString("id-ID")}`
}

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function isoToDate(iso: string): string {
  return iso.slice(0, 10)
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

function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  if (status === "new") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      >
        New
      </Badge>
    )
  }
  if (status === "reviewing") return <Badge variant="secondary">Reviewing</Badge>
  if (status === "forwarded") {
    return (
      <Badge
        variant="outline"
        className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
      >
        Forwarded
      </Badge>
    )
  }
  return <Badge variant="outline">Closed</Badge>
}

function QuotesPage() {
  const reps = useMockStore((s) => s.reps)
  const accounts = useMockStore((s) => s.accounts)
  const products = useMockStore((s) => s.products)
  const visits = useMockStore((s) => s.visits)
  const quoteInquiries = useMockStore((s) => s.quoteInquiries)
  const quoteInquiryLines = useMockStore((s) => s.quoteInquiryLines)
  const updateQuoteStatus = useMockStore((s) => s.updateQuoteStatus)

  const [quoteSubTab, setQuoteSubTab] = React.useState("all")
  const [selectedQuoteId, setSelectedQuoteId] = React.useState<string | null>(null)
  const [quoteAdminNote, setQuoteAdminNote] = React.useState("")
  const [quoteStatusEdit, setQuoteStatusEdit] = React.useState<QuoteStatus>("new")

  const selectedQuote = selectedQuoteId
    ? (quoteInquiries.find((q) => q.id === selectedQuoteId) ?? null)
    : null

  const selectedQuoteLines = React.useMemo(
    () =>
      selectedQuote
        ? quoteInquiryLines.filter((l) => l.inquiry_id === selectedQuote.id)
        : [],
    [selectedQuote, quoteInquiryLines],
  )

  const selectedQuoteVisit = React.useMemo(
    () =>
      selectedQuote ? (visits.find((v) => v.id === selectedQuote.visit_id) ?? null) : null,
    [selectedQuote, visits],
  )

  const sortedQuotes = React.useMemo(
    () => [...quoteInquiries].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [quoteInquiries],
  )

  const filteredQuotes = React.useMemo(
    () =>
      quoteSubTab === "all"
        ? sortedQuotes
        : sortedQuotes.filter((q) => q.status === quoteSubTab),
    [sortedQuotes, quoteSubTab],
  )

  const quoteCounts = React.useMemo(
    () => ({
      all: quoteInquiries.length,
      new: quoteInquiries.filter((q) => q.status === "new").length,
      reviewing: quoteInquiries.filter((q) => q.status === "reviewing").length,
      forwarded: quoteInquiries.filter((q) => q.status === "forwarded").length,
      closed: quoteInquiries.filter((q) => q.status === "closed").length,
    }),
    [quoteInquiries],
  )

  function quoteProductNames(inquiryId: string): string {
    return quoteInquiryLines
      .filter((l) => l.inquiry_id === inquiryId)
      .map((l) => products.find((p) => p.id === l.product_id)?.code ?? l.product_id)
      .join(", ")
  }

  function openQuoteDetail(quoteId: string) {
    const q = quoteInquiries.find((x) => x.id === quoteId)
    if (!q) return
    setSelectedQuoteId(quoteId)
    setQuoteStatusEdit(q.status)
    setQuoteAdminNote("")
  }

  function handleSaveQuote() {
    if (!selectedQuoteId) return
    updateQuoteStatus(selectedQuoteId, quoteStatusEdit)
    setSelectedQuoteId(null)
    const label = STATUS_OPTIONS.find((o) => o.value === quoteStatusEdit)?.label ?? quoteStatusEdit
    toast.success(`Quote updated to ${label}`)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Quote inbox</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bima · {quoteInquiries.length} inquiries
        </p>
      </div>

      <Tabs value={quoteSubTab} onValueChange={(v) => setQuoteSubTab(v as string)}>
        <TabsList
          variant="line"
          className="mb-4 w-full justify-start rounded-none border-b border-border bg-transparent px-0"
        >
          <TabsTrigger value="all">All ({quoteCounts.all})</TabsTrigger>
          <TabsTrigger value="new">New ({quoteCounts.new})</TabsTrigger>
          <TabsTrigger value="reviewing">Reviewing ({quoteCounts.reviewing})</TabsTrigger>
          <TabsTrigger value="forwarded">Forwarded ({quoteCounts.forwarded})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({quoteCounts.closed})</TabsTrigger>
        </TabsList>
        <TabsContent value={quoteSubTab}>
          {filteredQuotes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No {quoteSubTab === "all" ? "" : `${quoteSubTab} `}inquiries.
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Submitted quote inquiries from field reps appear here.
              </p>
            </div>
          ) : (
            <Card size="sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rep</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Est. value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => {
                    const rep = reps.find((r) => r.id === quote.rep_id)
                    const account = accounts.find((a) => a.id === quote.account_id)
                    return (
                      <TableRow
                        key={quote.id}
                        className="cursor-pointer"
                        onClick={() => openQuoteDetail(quote.id)}
                      >
                        <TableCell className="font-medium">
                          {rep?.name ?? quote.rep_id}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {account?.name ?? quote.account_id}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {quoteProductNames(quote.id)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">
                          {formatIdr(quote.total_idr)}
                        </TableCell>
                        <TableCell>
                          <QuoteStatusBadge status={quote.status} />
                        </TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {formatDateShort(isoToDate(quote.created_at))}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quote detail sheet */}
      <Sheet
        open={selectedQuoteId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedQuoteId(null)
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selectedQuote && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {accounts.find((a) => a.id === selectedQuote.account_id)?.name ??
                    selectedQuote.account_id}
                </SheetTitle>
                <SheetDescription>
                  {reps.find((r) => r.id === selectedQuote.rep_id)?.name ?? selectedQuote.rep_id}
                  {selectedQuoteVisit
                    ? ` · ${formatDateLong(isoToDate(selectedQuote.created_at))}`
                    : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-6 pb-4">
                {/* Visit info */}
                {selectedQuoteVisit && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="mb-0.5 text-xs text-muted-foreground">Visit date</p>
                      <p className="font-medium">
                        {formatDateLong(selectedQuoteVisit.date)}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-muted-foreground">Rep</p>
                      <p className="font-medium">
                        {reps.find((r) => r.id === selectedQuoteVisit.rep_id)?.name ??
                          selectedQuoteVisit.rep_id}
                      </p>
                    </div>
                  </div>
                )}

                {/* Products and line values */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Products
                  </p>
                  <div className="space-y-1.5 rounded-xl border border-border px-3 py-2.5">
                    {selectedQuoteLines.map((line) => {
                      const product = products.find((p) => p.id === line.product_id)
                      return (
                        <div
                          key={line.product_id}
                          className="flex items-baseline justify-between gap-2"
                        >
                          <p className="text-sm">
                            <span className="font-medium">
                              {product?.name ?? line.product_id}
                            </span>
                            <span className="text-muted-foreground"> × {line.quantity}</span>
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
                          {formatIdr(selectedQuote.total_idr)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client field note */}
                {selectedQuoteVisit?.note && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Client field note
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedQuoteVisit.note}</p>
                  </div>
                )}

                {/* Photo placeholders */}
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
                      <p className="text-xs text-muted-foreground">Client verification</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <Label className="mb-1.5 block">Status</Label>
                  <Select
                    value={quoteStatusEdit}
                    onValueChange={(v) => {
                      if (v) setQuoteStatusEdit(v as QuoteStatus)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {STATUS_OPTIONS.find((o) => o.value === quoteStatusEdit)?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin notes */}
                <div>
                  <Label htmlFor="quote-notes" className="mb-1.5 block">
                    Admin notes
                  </Label>
                  <Textarea
                    id="quote-notes"
                    placeholder="Internal notes for this inquiry..."
                    value={quoteAdminNote}
                    onChange={(e) => setQuoteAdminNote(e.target.value)}
                  />
                </div>
              </div>
              <SheetFooter className="flex-row justify-end gap-2 px-6 pb-6 pt-2">
                <Button variant="outline" onClick={() => setSelectedQuoteId(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveQuote}>Save changes</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
