import type { MockDataSlice } from '../state'
import { dcs } from '../fixtures/dcs'
import { stores } from '../fixtures/stores'
import { skus } from '../fixtures/skus'
import { trucks } from '../fixtures/trucks'
import { users } from '../fixtures/users'
import { buildScenario } from './_helpers'

const built = buildScenario({
  draftStoreCount: 12,
  submittedExtras: 4,
  waves: 1,
  exceptions: [],
  seed: 11,
})

const scenario: MockDataSlice = {
  dcs,
  stores,
  skus,
  trucks,
  users,
  inferredStock: built.inferredStock,
  orders: built.orders,
  orderLines: built.orderLines,
  waves: built.waves,
  exceptions: built.exceptions,
  pods: built.pods,
}

export default scenario
