// Derived selectors composed from the existing mock store contract.
// Do not mutate store state here, only read it.
import type { MockState } from "@/mocks/state"
import type {
  Exception,
  Order,
  OrderLine,
  OrderStatus,
  Store,
  Wave,
} from "@/mocks/types"

export function getActiveDcId(state: MockState): string {
  return state.dcs[0]?.id ?? "dc-jkt-01"
}

export function ordersForDc(state: MockState, dcId: string): Order[] {
  const dcStores = new Set(
    state.stores.filter((s) => s.home_dc_id === dcId).map((s) => s.id),
  )
  return state.orders.filter((o) => dcStores.has(o.store_id))
}

export function orderLineTotal(
  lines: OrderLine[],
  skuPrice: (skuId: string) => number,
): number {
  return lines.reduce(
    (sum, line) => sum + skuPrice(line.sku_id) * line.requested_qty,
    0,
  )
}

export function storeName(stores: Store[], storeId: string): string {
  return stores.find((s) => s.id === storeId)?.name ?? storeId
}

export function exceptionsForDc(
  state: MockState,
  dcId: string,
): Exception[] {
  const dcOrders = new Set(ordersForDc(state, dcId).map((o) => o.id))
  return state.exceptions.filter((e) => dcOrders.has(e.order_id))
}

export function unassignedConfirmed(
  state: MockState,
  dcId: string,
): Order[] {
  return ordersForDc(state, dcId).filter(
    (o) => o.status === "confirmed" && !o.wave_id,
  )
}

export function isPipelineActive(status: OrderStatus): boolean {
  return (
    status !== "delivered" &&
    status !== "closed" &&
    status !== "exception" &&
    status !== "draft"
  )
}

export function progressForWave(
  wave: Wave,
  orders: Order[],
): { delivered: number; total: number } {
  const set = new Set(wave.order_ids)
  const inWave = orders.filter((o) => set.has(o.id))
  const delivered = inWave.filter(
    (o) => o.status === "delivered" || o.status === "closed",
  ).length
  return { delivered, total: inWave.length }
}
