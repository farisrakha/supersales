import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Camera01Icon, IdCardLanyardIcon } from "@hugeicons/core-free-icons"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { cn } from "@/lib/utils"

import { useMockStore } from "@/mocks/state"
import { getDemoNow } from "@/mocks/clock"
import type { Industry, QuoteStatus, VisitOutcome } from "@/mocks/types"

export const Route = createFileRoute("/admin/")({ component: AdminPage })

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRY_OPTIONS = [
  { value: "automotive", label: "Automotive" },
  { value: "electronics", label: "Electronics" },
  { value: "food_processing", label: "Food processing" },
  { value: "pharmaceutical", label: "Pharmaceutical" },
  { value: "other", label: "Other" },
]

const INDUSTRY_LABEL: Record<string, string> = {
  automotive: "Automotive",
  electronics: "Electronics",
  food_processing: "Food processing",
  pharmaceutical: "Pharmaceutical",
}

const CATEGORY_LABEL: Record<string, string> = {
  laser_profiler: "Laser profiler",
  vision_system: "Vision system",
  measurement: "Measurement",
  barcode_reader: "Barcode reader",
  fiber_sensor: "Fiber sensor",
  displacement_sensor: "Displacement sensor",
}

const FREQUENCY_OPTIONS = [
  { value: "1x/week", label: "Once a week" },
  { value: "2x/month", label: "Twice a month" },
  { value: "1x/month", label: "Once a month" },
]

const STATUS_OPTIONS: { value: QuoteStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "forwarded", label: "Forwarded" },
  { value: "closed", label: "Closed" },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

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

// ─── Inline badge components ──────────────────────────────────────────────────

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

// ─── Form initial state ───────────────────────────────────────────────────────

const INIT_ADD_FORM = {
  name: "",
  contact_name: "",
  contact_phone: "",
  industry: "automotive",
  assigned_rep_id: "",
  visit_frequency: "1x/month",
  notes: "",
}

const INIT_PRODUCT_FORM = {
  name: "",
  code: "",
  demo_units_available: 0,
  unit_price_idr: 0,
}

// ─── Main component ───────────────────────────────────────────────────────────

function AdminPage() {
  const demoNow = getDemoNow()

  const reps = useMockStore((s) => s.reps)
  const accounts = useMockStore((s) => s.accounts)
  const products = useMockStore((s) => s.products)
  const visits = useMockStore((s) => s.visits)
  const visitProducts = useMockStore((s) => s.visitProducts)
  const quoteInquiries = useMockStore((s) => s.quoteInquiries)
  const quoteInquiryLines = useMockStore((s) => s.quoteInquiryLines)
  const updateQuoteStatus = useMockStore((s) => s.updateQuoteStatus)

  // Tab state
  const [activeTab, setActiveTab] = React.useState("accounts")
  const [quoteSubTab, setQuoteSubTab] = React.useState("all")

  // Account management
  const [addAccountOpen, setAddAccountOpen] = React.useState(false)
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null)
  const [addForm, setAddForm] = React.useState({ ...INIT_ADD_FORM })

  // Rep management
  const [selectedRepId, setSelectedRepId] = React.useState<string | null>(null)

  // Product management
  const [editProductId, setEditProductId] = React.useState<string | null>(null)
  const [productForm, setProductForm] = React.useState({ ...INIT_PRODUCT_FORM })

  // Quote management
  const [selectedQuoteId, setSelectedQuoteId] = React.useState<string | null>(null)
  const [quoteAdminNote, setQuoteAdminNote] = React.useState("")
  const [quoteStatusEdit, setQuoteStatusEdit] = React.useState<QuoteStatus>("new")

  // ── Derived selections ──────────────────────────────────────────────────────

  const selectedAccount = selectedAccountId
    ? (accounts.find((a) => a.id === selectedAccountId) ?? null)
    : null

  const selectedRep = selectedRepId
    ? (reps.find((r) => r.id === selectedRepId) ?? null)
    : null

  const editingProduct = editProductId
    ? (products.find((p) => p.id === editProductId) ?? null)
    : null

  const selectedQuote = selectedQuoteId
    ? (quoteInquiries.find((q) => q.id === selectedQuoteId) ?? null)
    : null

  const selectedAccountVisits = React.useMemo(
    () =>
      selectedAccount
        ? [...visits]
            .filter((v) => v.account_id === selectedAccount.id)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 8)
        : [],
    [selectedAccount, visits],
  )

  const selectedRepAccounts = React.useMemo(
    () => (selectedRep ? accounts.filter((a) => a.assigned_rep_id === selectedRep.id) : []),
    [selectedRep, accounts],
  )

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

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function lastVisitDate(accountId: string): string | null {
    return (
      [...visits]
        .filter((v) => v.account_id === accountId)
        .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? null
    )
  }

  function visitFrequency(accountId: string): string {
    const cutoff = new Date(demoNow.getTime() - 30 * 24 * 60 * 60 * 1000)
    const count = visits.filter(
      (v) => v.account_id === accountId && new Date(v.date) >= cutoff,
    ).length
    if (count >= 4) return "1x/week"
    if (count >= 2) return "2x/month"
    return "1x/month"
  }

  function openQuotesCount(accountId: string): number {
    return quoteInquiries.filter(
      (q) => q.account_id === accountId && (q.status === "new" || q.status === "reviewing"),
    ).length
  }

  function visitsThisMonth(repId: string): number {
    const cutoff = new Date(demoNow.getTime() - 30 * 24 * 60 * 60 * 1000)
    return visits.filter((v) => v.rep_id === repId && new Date(v.date) >= cutoff).length
  }

  function repLastVisitForAccount(repId: string, accountId: string): string | null {
    return (
      [...visits]
        .filter((v) => v.rep_id === repId && v.account_id === accountId)
        .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? null
    )
  }

  function quoteProductNames(inquiryId: string): string {
    return quoteInquiryLines
      .filter((l) => l.inquiry_id === inquiryId)
      .map((l) => products.find((p) => p.id === l.product_id)?.code ?? l.product_id)
      .join(", ")
  }

  function quoteProductsForVisit(visitId: string): string {
    return visitProducts
      .filter((vp) => vp.visit_id === visitId && vp.demo_given)
      .map((vp) => products.find((p) => p.id === vp.product_id)?.code ?? vp.product_id)
      .join(", ")
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleSaveAccount() {
    if (!addForm.name.trim()) return
    useMockStore.setState((state) => ({
      accounts: [
        ...state.accounts,
        {
          id: `acc-${Date.now().toString(36)}`,
          name: addForm.name.trim(),
          industry: addForm.industry as Industry,
          address: "",
          city: "",
          area: "",
          contact_name: addForm.contact_name,
          contact_phone: addForm.contact_phone,
          assigned_rep_id: addForm.assigned_rep_id,
        },
      ],
    }))
    setAddAccountOpen(false)
    setAddForm({ ...INIT_ADD_FORM })
    toast.success("Account saved.")
  }

  function openProductEdit(productId: string) {
    const p = products.find((x) => x.id === productId)
    if (!p) return
    setEditProductId(productId)
    setProductForm({
      name: p.name,
      code: p.code,
      demo_units_available: p.demo_units_available,
      unit_price_idr: p.unit_price_idr,
    })
  }

  function handleSaveProduct() {
    useMockStore.setState((state) => ({
      products: state.products.map((p) =>
        p.id === editProductId
          ? {
              ...p,
              name: productForm.name,
              code: productForm.code,
              demo_units_available: productForm.demo_units_available,
              unit_price_idr: productForm.unit_price_idr,
            }
          : p,
      ),
    }))
    setEditProductId(null)
    toast.success("Product updated.")
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
    toast.success("Quote updated.")
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Admin portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bima · Account management, product catalog, and quote inbox
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as string)}>
        <TabsList
          variant="line"
          className="mb-6 w-full justify-start rounded-none border-b border-border bg-transparent px-0"
        >
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="reps">Reps</TabsTrigger>
          <TabsTrigger value="catalog">Product catalog</TabsTrigger>
          <TabsTrigger value="quotes">Quote inbox</TabsTrigger>
        </TabsList>

        {/* ── Accounts ── */}
        <TabsContent value="accounts">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {accounts.length} accounts
            </p>
            <Button size="sm" onClick={() => setAddAccountOpen(true)}>
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
              Add account
            </Button>
          </div>
          <Card size="sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Assigned rep</TableHead>
                  <TableHead>Visit frequency</TableHead>
                  <TableHead>Last visit</TableHead>
                  <TableHead className="text-right">Open quotes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => {
                  const rep = reps.find((r) => r.id === account.assigned_rep_id)
                  const lastDate = lastVisitDate(account.id)
                  const openQ = openQuotesCount(account.id)
                  return (
                    <TableRow
                      key={account.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedAccountId(account.id)}
                    >
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {INDUSTRY_LABEL[account.industry] ?? account.industry}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {rep?.name ?? account.assigned_rep_id}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {visitFrequency(account.id)}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {lastDate ? formatDateShort(lastDate) : "Never"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {openQ > 0 ? (
                          <span className="font-semibold text-amber-700 dark:text-amber-400">
                            {openQ}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── Reps ── */}
        <TabsContent value="reps">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {reps.length} field sales reps
          </p>
          <Card size="sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Territory</TableHead>
                  <TableHead className="text-right">Accounts</TableHead>
                  <TableHead className="text-right">Visits this month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reps.map((rep) => {
                  const assigned = accounts.filter((a) => a.assigned_rep_id === rep.id).length
                  const monthVisits = visitsThisMonth(rep.id)
                  return (
                    <TableRow
                      key={rep.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedRepId(rep.id)}
                    >
                      <TableCell className="font-medium">{rep.name}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {rep.phone}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{rep.territory}</TableCell>
                      <TableCell className="text-right tabular-nums">{assigned}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {monthVisits}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── Product catalog ── */}
        <TabsContent value="catalog">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {products.length} products · click a row to edit
          </p>
          <Card size="sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Demo units</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => openProductEdit(product.id)}
                  >
                    <TableCell className="font-mono text-xs font-semibold tracking-wider">
                      {product.code}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {CATEGORY_LABEL[product.category] ?? product.category}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {product.demo_units_available}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatIdr(product.unit_price_idr)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ── Quote inbox ── */}
        <TabsContent value="quotes">
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
                  <p className="text-sm text-muted-foreground">No quotes in this status.</p>
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
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════════════
          Sheets
      ═══════════════════════════════════════════════════════════════════════ */}

      {/* Add account */}
      <Sheet
        open={addAccountOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddAccountOpen(false)
            setAddForm({ ...INIT_ADD_FORM })
          }
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add account</SheetTitle>
            <SheetDescription>
              Register a new manufacturing account and assign a rep.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-6 pb-4">
            <div>
              <Label htmlFor="acc-name" className="mb-1.5 block">
                Company name
              </Label>
              <Input
                id="acc-name"
                placeholder="PT Contoh Manufacturing"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="acc-contact" className="mb-1.5 block">
                Contact name
              </Label>
              <Input
                id="acc-contact"
                placeholder="Pak Budi"
                value={addForm.contact_name}
                onChange={(e) => setAddForm((f) => ({ ...f, contact_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="acc-phone" className="mb-1.5 block">
                Contact phone
              </Label>
              <Input
                id="acc-phone"
                placeholder="+62 812 0000 0000"
                value={addForm.contact_phone}
                onChange={(e) => setAddForm((f) => ({ ...f, contact_phone: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Industry</Label>
              <Select
                value={addForm.industry}
                onValueChange={(v) => {
                  if (v) setAddForm((f) => ({ ...f, industry: v }))
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {INDUSTRY_OPTIONS.find((o) => o.value === addForm.industry)?.label ??
                      "Select industry"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Assigned rep</Label>
              <Select
                value={addForm.assigned_rep_id}
                onValueChange={(v) => {
                  if (v) setAddForm((f) => ({ ...f, assigned_rep_id: v }))
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {reps.find((r) => r.id === addForm.assigned_rep_id)?.name ?? "Select rep"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {reps.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                      <span className="text-muted-foreground"> · {r.territory}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Visit frequency</Label>
              <Select
                value={addForm.visit_frequency}
                onValueChange={(v) => {
                  if (v) setAddForm((f) => ({ ...f, visit_frequency: v }))
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {FREQUENCY_OPTIONS.find((o) => o.value === addForm.visit_frequency)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="acc-notes" className="mb-1.5 block">
                Notes
              </Label>
              <Textarea
                id="acc-notes"
                placeholder="Context about this account..."
                value={addForm.notes}
                onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 px-6 pb-6 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setAddAccountOpen(false)
                setAddForm({ ...INIT_ADD_FORM })
              }}
            >
              Cancel
            </Button>
            <Button disabled={!addForm.name.trim()} onClick={handleSaveAccount}>
              Save account
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Account detail (read-only) */}
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
                  {INDUSTRY_LABEL[selectedAccount.industry] ?? selectedAccount.industry}
                  {selectedAccount.city ? ` · ${selectedAccount.city}` : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-6 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium">
                      {selectedAccount.contact_name || "Not set"}
                    </p>
                    {selectedAccount.contact_phone && (
                      <p className="text-xs text-muted-foreground">
                        {selectedAccount.contact_phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">Assigned rep</p>
                    <p className="text-sm font-medium">
                      {reps.find((r) => r.id === selectedAccount.assigned_rep_id)?.name ??
                        "Unassigned"}
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
                                {formatDateShort(visit.date)}
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

      {/* Rep detail */}
      <Sheet
        open={selectedRepId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedRepId(null)
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selectedRep && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedRep.name}</SheetTitle>
                <SheetDescription>
                  {selectedRep.territory} · {selectedRep.phone}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-6 pb-6">
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Assigned accounts ({selectedRepAccounts.length})
                  </p>
                  {selectedRepAccounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No accounts assigned.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedRepAccounts.map((account) => {
                        const lastDate = repLastVisitForAccount(selectedRep.id, account.id)
                        return (
                          <div
                            key={account.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-border px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{account.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {INDUSTRY_LABEL[account.industry] ?? account.industry}
                              </p>
                            </div>
                            <p className="shrink-0 tabular-nums text-xs text-muted-foreground">
                              {lastDate ? formatDateShort(lastDate) : "No visits"}
                            </p>
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

      {/* Edit product */}
      <Sheet
        open={editProductId !== null}
        onOpenChange={(open) => {
          if (!open) setEditProductId(null)
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {editingProduct && (
            <>
              <SheetHeader>
                <SheetTitle>Edit product</SheetTitle>
                <SheetDescription>
                  {editingProduct.code} ·{" "}
                  {CATEGORY_LABEL[editingProduct.category] ?? editingProduct.category}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-6 pb-4">
                <div>
                  <Label htmlFor="prod-code" className="mb-1.5 block">
                    Product code
                  </Label>
                  <Input
                    id="prod-code"
                    value={productForm.code}
                    onChange={(e) => setProductForm((f) => ({ ...f, code: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="prod-name" className="mb-1.5 block">
                    Product name
                  </Label>
                  <Input
                    id="prod-name"
                    value={productForm.name}
                    onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="prod-units" className="mb-1.5 block">
                    Demo units available
                  </Label>
                  <Input
                    id="prod-units"
                    type="number"
                    min={0}
                    value={productForm.demo_units_available}
                    onChange={(e) =>
                      setProductForm((f) => ({
                        ...f,
                        demo_units_available: Math.max(0, Number(e.target.value)),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="prod-price" className="mb-1.5 block">
                    Unit price (IDR)
                  </Label>
                  <Input
                    id="prod-price"
                    type="number"
                    min={0}
                    value={productForm.unit_price_idr}
                    onChange={(e) =>
                      setProductForm((f) => ({
                        ...f,
                        unit_price_idr: Math.max(0, Number(e.target.value)),
                      }))
                    }
                  />
                </div>
              </div>
              <SheetFooter className="flex-row justify-end gap-2 px-6 pb-6 pt-2">
                <Button variant="outline" onClick={() => setEditProductId(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProduct}>Save changes</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Quote detail */}
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
