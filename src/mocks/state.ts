import { create } from 'zustand'
import type {
  Account,
  KpiSlice,
  Product,
  QuoteInquiry,
  QuoteInquiryLine,
  QuoteStatus,
  Rep,
  Role,
  ScenarioId,
  User,
  Visit,
  VisitEvidence,
  VisitOutcome,
  VisitPlan,
  VisitPlanStatus,
  VisitProduct,
} from './types'
import activeTuesdayScenario from './scenarios/active-tuesday'
import territoryGapScenario from './scenarios/territory-gap'
import { getDemoNow } from './clock'
import { kpis } from './fixtures/kpis'

export interface MockDataSlice {
  reps: Rep[]
  accounts: Account[]
  products: Product[]
  visits: Visit[]
  visitProducts: VisitProduct[]
  visitEvidences: VisitEvidence[]
  quoteInquiries: QuoteInquiry[]
  quoteInquiryLines: QuoteInquiryLine[]
  visitPlans: VisitPlan[]
  users: User[]
}

export interface LogVisitInput {
  repId: string
  accountId: string
  visitPlanId?: string
  outcome: VisitOutcome
  note: string
  productIds?: string[]
}

export interface SubmitQuoteInquiryInput {
  visitId: string
  accountId: string
  repId: string
  note?: string
  lines: Array<{ productId: string; quantity: number; unitPriceIdr: number }>
}

export interface ScheduleVisitInput {
  repId: string
  accountId: string
  plannedDate: string
  note?: string
}

export interface MockState extends MockDataSlice {
  currentRole: Role
  currentScenario: ScenarioId

  setCurrentRole: (role: Role) => void
  setCurrentScenario: (id: ScenarioId) => void
  resetToScenario: (id: ScenarioId) => void

  logVisit: (input: LogVisitInput) => Visit
  submitQuoteInquiry: (input: SubmitQuoteInquiryInput) => QuoteInquiry
  updateQuoteStatus: (inquiryId: string, status: QuoteStatus) => void
  scheduleVisit: (input: ScheduleVisitInput) => VisitPlan
  cancelVisitPlan: (planId: string) => void
}

const SCENARIOS: Record<ScenarioId, MockDataSlice> = {
  'active-tuesday': activeTuesdayScenario,
  'territory-gap': territoryGapScenario,
}

const DEFAULT_SCENARIO: ScenarioId = 'active-tuesday'
const DEFAULT_ROLE: Role = 'supervisor'

function cloneSlice(slice: MockDataSlice): MockDataSlice {
  return {
    reps: slice.reps.map((x) => ({ ...x })),
    accounts: slice.accounts.map((x) => ({ ...x })),
    products: slice.products.map((x) => ({ ...x })),
    visits: slice.visits.map((x) => ({ ...x })),
    visitProducts: slice.visitProducts.map((x) => ({ ...x })),
    visitEvidences: slice.visitEvidences.map((x) => ({ ...x })),
    quoteInquiries: slice.quoteInquiries.map((x) => ({ ...x })),
    quoteInquiryLines: slice.quoteInquiryLines.map((x) => ({ ...x })),
    visitPlans: slice.visitPlans.map((x) => ({ ...x })),
    users: slice.users.map((x) => ({ ...x })),
  }
}

function nowIso(): string {
  return getDemoNow().toISOString()
}

function nextId(prefix: string, existing: ReadonlyArray<{ id: string }>): string {
  const base = `${prefix}-${getDemoNow().getTime().toString(36)}`
  let i = 1
  let candidate = `${base}-${i}`
  const taken = new Set(existing.map((x) => x.id))
  while (taken.has(candidate)) {
    i += 1
    candidate = `${base}-${i}`
  }
  return candidate
}

export const useMockStore = create<MockState>((set, get) => ({
  ...cloneSlice(SCENARIOS[DEFAULT_SCENARIO]),
  currentRole: DEFAULT_ROLE,
  currentScenario: DEFAULT_SCENARIO,

  setCurrentRole: (role) => set({ currentRole: role }),
  setCurrentScenario: (id) => {
    get().resetToScenario(id)
  },
  resetToScenario: (id) => {
    set({ ...cloneSlice(SCENARIOS[id]), currentScenario: id })
  },

  logVisit: ({ repId, accountId, visitPlanId, outcome, note, productIds }) => {
    const state = get()
    const today = getDemoNow().toISOString().slice(0, 10)
    const id = nextId('v', state.visits)
    const visit: Visit = {
      id,
      rep_id: repId,
      account_id: accountId,
      visit_plan_id: visitPlanId,
      date: today,
      outcome,
      note,
      created_at: nowIso(),
    }
    const newVisitProducts: VisitProduct[] = (productIds ?? []).map((pid) => ({
      visit_id: id,
      product_id: pid,
      demo_given: true,
    }))
    const updatedPlans = visitPlanId
      ? state.visitPlans.map((p) =>
          p.id === visitPlanId ? { ...p, status: 'completed' as VisitPlanStatus } : p,
        )
      : state.visitPlans
    set({
      visits: [visit, ...state.visits],
      visitProducts: [...state.visitProducts, ...newVisitProducts],
      visitPlans: updatedPlans,
    })
    return visit
  },

  submitQuoteInquiry: ({ visitId, accountId, repId, note, lines }) => {
    const state = get()
    const id = nextId('qi', state.quoteInquiries)
    const total_idr = lines.reduce((sum, l) => sum + l.quantity * l.unitPriceIdr, 0)
    const inquiry: QuoteInquiry = {
      id,
      visit_id: visitId,
      account_id: accountId,
      rep_id: repId,
      status: 'new',
      total_idr,
      created_at: nowIso(),
      note,
    }
    const newLines: QuoteInquiryLine[] = lines.map((l) => ({
      inquiry_id: id,
      product_id: l.productId,
      quantity: l.quantity,
      unit_price_idr: l.unitPriceIdr,
    }))
    set({
      quoteInquiries: [inquiry, ...state.quoteInquiries],
      quoteInquiryLines: [...state.quoteInquiryLines, ...newLines],
    })
    return inquiry
  },

  updateQuoteStatus: (inquiryId, status) => {
    set((state) => ({
      quoteInquiries: state.quoteInquiries.map((q) =>
        q.id === inquiryId ? { ...q, status } : q,
      ),
    }))
  },

  scheduleVisit: ({ repId, accountId, plannedDate, note }) => {
    const state = get()
    const id = nextId('vp', state.visitPlans)
    const plan: VisitPlan = {
      id,
      rep_id: repId,
      account_id: accountId,
      planned_date: plannedDate,
      note,
      status: 'pending',
    }
    set({ visitPlans: [plan, ...state.visitPlans] })
    return plan
  },

  cancelVisitPlan: (planId) => {
    set((state) => ({
      visitPlans: state.visitPlans.map((p) =>
        p.id === planId ? { ...p, status: 'cancelled' as VisitPlanStatus } : p,
      ),
    }))
  },
}))

export function selectRepById(state: MockState, id: string): Rep | undefined {
  return state.reps.find((r) => r.id === id)
}

export function selectAccountById(state: MockState, id: string): Account | undefined {
  return state.accounts.find((a) => a.id === id)
}

export function selectProductById(state: MockState, id: string): Product | undefined {
  return state.products.find((p) => p.id === id)
}

export function selectVisitsForRep(state: MockState, repId: string): Visit[] {
  return state.visits.filter((v) => v.rep_id === repId)
}

export function selectVisitsForAccount(state: MockState, accountId: string): Visit[] {
  return state.visits.filter((v) => v.account_id === accountId)
}

export function selectQuotesForAccount(state: MockState, accountId: string): QuoteInquiry[] {
  return state.quoteInquiries.filter((q) => q.account_id === accountId)
}

export function selectQuotesForRep(state: MockState, repId: string): QuoteInquiry[] {
  return state.quoteInquiries.filter((q) => q.rep_id === repId)
}

export function selectVisitPlansForRep(
  state: MockState,
  repId: string,
  date?: string,
): VisitPlan[] {
  return state.visitPlans.filter(
    (p) => p.rep_id === repId && (date ? p.planned_date === date : true),
  )
}

export function selectVisitProductsForVisit(
  state: MockState,
  visitId: string,
): VisitProduct[] {
  return state.visitProducts.filter((vp) => vp.visit_id === visitId)
}

export function selectEvidenceForVisit(
  state: MockState,
  visitId: string,
): VisitEvidence[] {
  return state.visitEvidences.filter((ve) => ve.visit_id === visitId)
}

export function selectActiveRepsToday(state: MockState): Rep[] {
  const today = getDemoNow().toISOString().slice(0, 10)
  const activeRepIds = new Set<string>()
  for (const v of state.visits) {
    if (v.date === today) activeRepIds.add(v.rep_id)
  }
  for (const p of state.visitPlans) {
    if (p.planned_date === today && p.status === 'pending') activeRepIds.add(p.rep_id)
  }
  return state.reps.filter((r) => activeRepIds.has(r.id))
}

export function selectAccountsWithNoRecentVisit(
  state: MockState,
  days: number,
): Account[] {
  const cutoff = new Date(getDemoNow().getTime() - days * 24 * 60 * 60 * 1000)
  const recentlyVisited = new Set(
    state.visits
      .filter((v) => new Date(v.date) >= cutoff)
      .map((v) => v.account_id),
  )
  return state.accounts.filter((a) => !recentlyVisited.has(a.id))
}

export function selectRepVisitCount(
  state: MockState,
  repId: string,
  days: number,
): number {
  const cutoff = new Date(getDemoNow().getTime() - days * 24 * 60 * 60 * 1000)
  return state.visits.filter(
    (v) => v.rep_id === repId && new Date(v.date) >= cutoff,
  ).length
}

export function selectLinesForQuote(
  state: MockState,
  inquiryId: string,
): QuoteInquiryLine[] {
  return state.quoteInquiryLines.filter((l) => l.inquiry_id === inquiryId)
}

export function selectKpiForPeriod(
  state: MockState,
  period: 'today' | '7d' | '30d',
): KpiSlice {
  const base = kpis[period]
  if (state.currentScenario === 'territory-gap') {
    return {
      ...base,
      active_reps: Math.max(1, base.active_reps - 1),
      visits_completed: Math.max(0, base.visits_completed - 2),
      accounts_covered: Math.max(0, base.accounts_covered - 2),
    }
  }
  return base
}
