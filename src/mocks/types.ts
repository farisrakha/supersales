export type Role = 'supervisor' | 'admin' | 'exec'

export type ScenarioId = 'active-tuesday' | 'territory-gap'

export type Industry = 'automotive' | 'electronics' | 'food_processing' | 'pharmaceutical'

export type VisitOutcome = 'interested' | 'not_interested' | 'quote_submitted'

export type QuoteStatus = 'new' | 'reviewing' | 'forwarded' | 'closed'

export type ProductCategory =
  | 'laser_profiler'
  | 'vision_system'
  | 'measurement'
  | 'barcode_reader'
  | 'fiber_sensor'
  | 'displacement_sensor'

export type VisitPlanStatus = 'pending' | 'completed' | 'cancelled'

export interface Rep {
  id: string
  name: string
  territory: string
  phone: string
}

export interface Account {
  id: string
  name: string
  industry: Industry
  address: string
  city: string
  area: string
  contact_name: string
  contact_phone: string
  assigned_rep_id: string
}

export interface Product {
  id: string
  code: string
  name: string
  category: ProductCategory
  demo_units_available: number
  unit_price_idr: number
}

export interface VisitPlan {
  id: string
  rep_id: string
  account_id: string
  planned_date: string
  note?: string
  status: VisitPlanStatus
}

export interface Visit {
  id: string
  rep_id: string
  account_id: string
  visit_plan_id?: string
  date: string
  outcome: VisitOutcome
  note: string
  created_at: string
}

export interface VisitProduct {
  visit_id: string
  product_id: string
  demo_given: boolean
}

export interface VisitEvidence {
  id: string
  visit_id: string
  photo_url: string
  caption: string
}

export interface QuoteInquiry {
  id: string
  visit_id: string
  account_id: string
  rep_id: string
  status: QuoteStatus
  total_idr: number
  created_at: string
  note?: string
}

export interface QuoteInquiryLine {
  inquiry_id: string
  product_id: string
  quantity: number
  unit_price_idr: number
}

export interface User {
  id: string
  role: Role
  name: string
}

export interface KpiSlice {
  visits_completed: number
  quote_inquiries_raised: number
  quote_value_idr: number
  active_reps: number
  accounts_covered: number
  avg_visits_per_rep: number
}
