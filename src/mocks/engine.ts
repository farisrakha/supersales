import type { InferredStock, Order, OrderLine, SKU, Store } from './types'
import { getDemoNowIso } from './clock'

export interface EngineInput {
  stores: Store[]
  skus: SKU[]
  inferredStock: InferredStock[]
}

export interface EngineResult {
  orders: Order[]
  lines: OrderLine[]
}

const COVER_DAYS_TARGET = 7

export function computeSuggestedOrders(input: EngineInput): EngineResult {
  const skuById = new Map(input.skus.map((s) => [s.id, s]))
  const stockByStore = new Map<string, InferredStock[]>()
  for (const row of input.inferredStock) {
    const bucket = stockByStore.get(row.store_id) ?? []
    bucket.push(row)
    stockByStore.set(row.store_id, bucket)
  }

  const now = getDemoNowIso()
  const orders: Order[] = []
  const lines: OrderLine[] = []

  for (const store of input.stores) {
    const stockRows = stockByStore.get(store.id) ?? []
    const due = stockRows
      .map((row) => {
        const sku = skuById.get(row.sku_id)
        if (!sku) return null
        if (row.days_of_cover >= sku.reorder_threshold_days) return null
        const suggested = Math.max(1, Math.round(sku.default_burn_per_day * COVER_DAYS_TARGET))
        return { sku, suggested }
      })
      .filter((x): x is { sku: SKU; suggested: number } => x !== null)

    if (due.length === 0) continue

    const orderId = `order-${store.id}-draft`
    orders.push({
      id: orderId,
      store_id: store.id,
      status: 'draft',
      created_at: now,
      source: 'engine',
    })
    for (const item of due) {
      lines.push({
        order_id: orderId,
        sku_id: item.sku.id,
        suggested_qty: item.suggested,
        requested_qty: item.suggested,
        delivered_qty: 0,
      })
    }
  }

  return { orders, lines }
}
