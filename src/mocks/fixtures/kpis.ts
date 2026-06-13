import type { KpiSlice } from '../types'

export const kpis: Record<'today' | '7d' | '30d', KpiSlice> = {
  today: {
    visits_completed: 4,
    quote_inquiries_raised: 1,
    quote_value_idr: 185_000_000,
    active_reps: 6,
    accounts_covered: 4,
    avg_visits_per_rep: 0.7,
  },
  '7d': {
    visits_completed: 16,
    quote_inquiries_raised: 6,
    quote_value_idr: 1_133_000_000,
    active_reps: 8,
    accounts_covered: 16,
    avg_visits_per_rep: 2.0,
  },
  '30d': {
    visits_completed: 40,
    quote_inquiries_raised: 14,
    quote_value_idr: 2_740_000_000,
    active_reps: 8,
    accounts_covered: 18,
    avg_visits_per_rep: 5.0,
  },
}
