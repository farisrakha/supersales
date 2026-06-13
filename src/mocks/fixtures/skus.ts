import type { SKU, SKUCategory } from '../types'

interface SkuSeed {
  brand: string
  product: string
  variant: string
  category: SKUCategory
  burn: number
  threshold: number
  price: number
}

const seeds: SkuSeed[] = [
  { brand: 'Renyahku', product: 'Keripik Kentang', variant: 'Original 75g', category: 'snacks', burn: 18, threshold: 3, price: 9500 },
  { brand: 'Renyahku', product: 'Keripik Kentang', variant: 'Balado 75g', category: 'snacks', burn: 16, threshold: 3, price: 9500 },
  { brand: 'Renyahku', product: 'Keripik Kentang', variant: 'Keju 75g', category: 'snacks', burn: 14, threshold: 3, price: 9500 },
  { brand: 'Renyahku', product: 'Keripik Singkong', variant: 'Pedas 60g', category: 'snacks', burn: 22, threshold: 2, price: 7500 },
  { brand: 'Renyahku', product: 'Keripik Singkong', variant: 'Manis 60g', category: 'snacks', burn: 12, threshold: 3, price: 7500 },
  { brand: 'Garingo', product: 'Wafer Cokelat', variant: 'Stik 40g', category: 'snacks', burn: 26, threshold: 2, price: 4000 },
  { brand: 'Garingo', product: 'Wafer Vanilla', variant: 'Stik 40g', category: 'snacks', burn: 24, threshold: 2, price: 4000 },
  { brand: 'Garingo', product: 'Wafer Stroberi', variant: 'Stik 40g', category: 'snacks', burn: 18, threshold: 3, price: 4000 },
  { brand: 'Garingo', product: 'Biskuit Roma', variant: 'Cokelat 120g', category: 'snacks', burn: 20, threshold: 3, price: 8500 },
  { brand: 'Garingo', product: 'Biskuit Roma', variant: 'Susu 120g', category: 'snacks', burn: 19, threshold: 3, price: 8500 },
  { brand: 'Mantul', product: 'Kacang Atom', variant: 'Pedas 100g', category: 'snacks', burn: 15, threshold: 4, price: 6500 },
  { brand: 'Mantul', product: 'Kacang Atom', variant: 'Original 100g', category: 'snacks', burn: 13, threshold: 4, price: 6500 },
  { brand: 'Mantul', product: 'Kacang Bawang', variant: 'Toples 200g', category: 'snacks', burn: 9, threshold: 5, price: 14500 },
  { brand: 'Mantul', product: 'Kacang Mete', variant: 'Pouch 150g', category: 'snacks', burn: 6, threshold: 7, price: 28000 },
  { brand: 'Mantul', product: 'Kerupuk Udang', variant: 'Mentah 250g', category: 'snacks', burn: 11, threshold: 4, price: 15000 },
  { brand: 'Snekita', product: 'Permen Mint', variant: 'Roll 28g', category: 'snacks', burn: 30, threshold: 2, price: 3000 },
  { brand: 'Snekita', product: 'Permen Kopi', variant: 'Roll 28g', category: 'snacks', burn: 24, threshold: 2, price: 3000 },
  { brand: 'Snekita', product: 'Permen Susu', variant: 'Bag 125g', category: 'snacks', burn: 10, threshold: 4, price: 8500 },
  { brand: 'Snekita', product: 'Cokelat Batang', variant: 'Susu 45g', category: 'snacks', burn: 17, threshold: 3, price: 6000 },
  { brand: 'Snekita', product: 'Cokelat Batang', variant: 'Dark 45g', category: 'snacks', burn: 11, threshold: 3, price: 6000 },
  { brand: 'Cilukbao', product: 'Roti Sobek', variant: 'Cokelat 200g', category: 'snacks', burn: 14, threshold: 2, price: 12500 },
  { brand: 'Cilukbao', product: 'Roti Sobek', variant: 'Susu 200g', category: 'snacks', burn: 13, threshold: 2, price: 12500 },
  { brand: 'Cilukbao', product: 'Roti Sisir', variant: 'Mentega 180g', category: 'snacks', burn: 9, threshold: 2, price: 11000 },
  { brand: 'Cilukbao', product: 'Bolu Pandan', variant: 'Slice 60g', category: 'snacks', burn: 16, threshold: 2, price: 3500 },
  { brand: 'Cilukbao', product: 'Brownies Mini', variant: 'Pack 4', category: 'snacks', burn: 8, threshold: 3, price: 9500 },
  { brand: 'Mie Pak Eko', product: 'Mie Goreng', variant: 'Pedas 85g', category: 'snacks', burn: 40, threshold: 3, price: 3500 },
  { brand: 'Mie Pak Eko', product: 'Mie Goreng', variant: 'Original 85g', category: 'snacks', burn: 38, threshold: 3, price: 3500 },
  { brand: 'Mie Pak Eko', product: 'Mie Kuah', variant: 'Ayam Bawang 70g', category: 'snacks', burn: 34, threshold: 3, price: 3000 },
  { brand: 'Mie Pak Eko', product: 'Mie Kuah', variant: 'Soto 70g', category: 'snacks', burn: 28, threshold: 3, price: 3000 },
  { brand: 'Mie Pak Eko', product: 'Mie Kuah', variant: 'Kari Ayam 70g', category: 'snacks', burn: 26, threshold: 3, price: 3000 },
  { brand: 'Sehatea', product: 'Teh Botol', variant: 'Tawar 350ml', category: 'beverages', burn: 32, threshold: 2, price: 4500 },
  { brand: 'Sehatea', product: 'Teh Botol', variant: 'Manis 350ml', category: 'beverages', burn: 36, threshold: 2, price: 4500 },
  { brand: 'Sehatea', product: 'Teh Botol', variant: 'Lemon 350ml', category: 'beverages', burn: 22, threshold: 3, price: 4500 },
  { brand: 'Sehatea', product: 'Teh Hijau', variant: 'Botol 500ml', category: 'beverages', burn: 18, threshold: 3, price: 6500 },
  { brand: 'Sehatea', product: 'Teh Melati', variant: 'Kotak 250ml', category: 'beverages', burn: 28, threshold: 2, price: 4000 },
  { brand: 'Segarmu', product: 'Air Mineral', variant: 'Botol 600ml', category: 'beverages', burn: 60, threshold: 2, price: 3500 },
  { brand: 'Segarmu', product: 'Air Mineral', variant: 'Botol 1500ml', category: 'beverages', burn: 28, threshold: 2, price: 6000 },
  { brand: 'Segarmu', product: 'Air Mineral', variant: 'Gelas 240ml', category: 'beverages', burn: 90, threshold: 2, price: 750 },
  { brand: 'Segarmu', product: 'Air Mineral', variant: 'Galon 19L', category: 'beverages', burn: 4, threshold: 5, price: 22000 },
  { brand: 'Segarmu', product: 'Air Berperisa', variant: 'Lemon 500ml', category: 'beverages', burn: 12, threshold: 3, price: 5500 },
  { brand: 'Kopiku', product: 'Kopi Sachet', variant: 'Hitam 20g', category: 'beverages', burn: 50, threshold: 3, price: 2000 },
  { brand: 'Kopiku', product: 'Kopi Sachet', variant: 'Susu 25g', category: 'beverages', burn: 55, threshold: 3, price: 2000 },
  { brand: 'Kopiku', product: 'Kopi Sachet', variant: 'Moka 25g', category: 'beverages', burn: 30, threshold: 3, price: 2500 },
  { brand: 'Kopiku', product: 'Kopi Bubuk', variant: 'Kantong 165g', category: 'beverages', burn: 8, threshold: 5, price: 18500 },
  { brand: 'Kopiku', product: 'Kopi Susu', variant: 'Kaleng 240ml', category: 'beverages', burn: 14, threshold: 3, price: 9500 },
  { brand: 'Susukita', product: 'Susu UHT', variant: 'Cokelat 250ml', category: 'beverages', burn: 26, threshold: 2, price: 6500 },
  { brand: 'Susukita', product: 'Susu UHT', variant: 'Stroberi 250ml', category: 'beverages', burn: 22, threshold: 2, price: 6500 },
  { brand: 'Susukita', product: 'Susu UHT', variant: 'Full Cream 250ml', category: 'beverages', burn: 20, threshold: 2, price: 6500 },
  { brand: 'Susukita', product: 'Susu UHT', variant: 'Full Cream 1L', category: 'beverages', burn: 9, threshold: 3, price: 19500 },
  { brand: 'Susukita', product: 'Susu Kental Manis', variant: 'Sachet 42g', category: 'beverages', burn: 35, threshold: 2, price: 2500 },
  { brand: 'Buahria', product: 'Jus Jeruk', variant: 'Kotak 250ml', category: 'beverages', burn: 18, threshold: 3, price: 5500 },
  { brand: 'Buahria', product: 'Jus Mangga', variant: 'Kotak 250ml', category: 'beverages', burn: 16, threshold: 3, price: 5500 },
  { brand: 'Buahria', product: 'Jus Apel', variant: 'Kotak 250ml', category: 'beverages', burn: 14, threshold: 3, price: 5500 },
  { brand: 'Buahria', product: 'Minuman Isotonik', variant: 'Botol 500ml', category: 'beverages', burn: 20, threshold: 2, price: 7000 },
  { brand: 'Buahria', product: 'Minuman Soda', variant: 'Kaleng 330ml', category: 'beverages', burn: 24, threshold: 3, price: 7500 },
  { brand: 'Berseh', product: 'Sabun Mandi Batang', variant: 'Klasik 80g', category: 'toiletries', burn: 22, threshold: 4, price: 3500 },
  { brand: 'Berseh', product: 'Sabun Mandi Batang', variant: 'Bunga 80g', category: 'toiletries', burn: 18, threshold: 4, price: 3500 },
  { brand: 'Berseh', product: 'Sabun Mandi Cair', variant: 'Refill 450ml', category: 'toiletries', burn: 9, threshold: 5, price: 18500 },
  { brand: 'Berseh', product: 'Sabun Mandi Cair', variant: 'Botol 250ml', category: 'toiletries', burn: 7, threshold: 5, price: 14500 },
  { brand: 'Berseh', product: 'Sabun Cuci Tangan', variant: 'Refill 200ml', category: 'toiletries', burn: 8, threshold: 5, price: 9500 },
  { brand: 'Lembutku', product: 'Sampo', variant: 'Hitam 170ml', category: 'toiletries', burn: 10, threshold: 5, price: 17500 },
  { brand: 'Lembutku', product: 'Sampo', variant: 'Anti Ketombe 170ml', category: 'toiletries', burn: 9, threshold: 5, price: 18500 },
  { brand: 'Lembutku', product: 'Sampo Sachet', variant: 'Hitam 5ml x 12', category: 'toiletries', burn: 28, threshold: 3, price: 6500 },
  { brand: 'Lembutku', product: 'Kondisioner', variant: 'Botol 170ml', category: 'toiletries', burn: 6, threshold: 6, price: 18500 },
  { brand: 'Lembutku', product: 'Minyak Rambut', variant: 'Pomade 80g', category: 'toiletries', burn: 4, threshold: 7, price: 24500 },
  { brand: 'Putihgigi', product: 'Pasta Gigi', variant: 'Mint 190g', category: 'toiletries', burn: 12, threshold: 5, price: 14500 },
  { brand: 'Putihgigi', product: 'Pasta Gigi', variant: 'Herbal 190g', category: 'toiletries', burn: 9, threshold: 5, price: 15500 },
  { brand: 'Putihgigi', product: 'Pasta Gigi', variant: 'Anak Stroberi 75g', category: 'toiletries', burn: 11, threshold: 5, price: 10500 },
  { brand: 'Putihgigi', product: 'Sikat Gigi', variant: 'Soft Dewasa', category: 'toiletries', burn: 13, threshold: 5, price: 8500 },
  { brand: 'Putihgigi', product: 'Obat Kumur', variant: 'Botol 250ml', category: 'toiletries', burn: 5, threshold: 7, price: 22500 },
  { brand: 'Rumahku', product: 'Deterjen Bubuk', variant: 'Sachet 60g', category: 'toiletries', burn: 32, threshold: 3, price: 2500 },
  { brand: 'Rumahku', product: 'Deterjen Bubuk', variant: 'Pak 800g', category: 'toiletries', burn: 11, threshold: 5, price: 19500 },
  { brand: 'Rumahku', product: 'Deterjen Cair', variant: 'Refill 750ml', category: 'toiletries', burn: 7, threshold: 6, price: 23500 },
  { brand: 'Rumahku', product: 'Pelembut Pakaian', variant: 'Sachet 22ml', category: 'toiletries', burn: 28, threshold: 3, price: 1500 },
  { brand: 'Rumahku', product: 'Pembersih Lantai', variant: 'Botol 800ml', category: 'toiletries', burn: 8, threshold: 5, price: 16500 },
  { brand: 'Halusin', product: 'Tisu Wajah', variant: 'Pak 250 lembar', category: 'toiletries', burn: 14, threshold: 4, price: 17500 },
  { brand: 'Halusin', product: 'Tisu Basah', variant: 'Pak 50 lembar', category: 'toiletries', burn: 16, threshold: 4, price: 12500 },
  { brand: 'Halusin', product: 'Pembalut Wanita', variant: 'Reguler 10s', category: 'toiletries', burn: 18, threshold: 4, price: 13500 },
  { brand: 'Halusin', product: 'Popok Bayi', variant: 'M 20s', category: 'toiletries', burn: 7, threshold: 5, price: 48500 },
  { brand: 'Halusin', product: 'Kapas', variant: 'Roll 75g', category: 'toiletries', burn: 6, threshold: 6, price: 9500 },
]

export const skus: SKU[] = seeds.map((s, i) => {
  const idx = String(i + 1).padStart(3, '0')
  const code = `${s.brand.slice(0, 3).toUpperCase()}-${idx}`
  return {
    id: `sku-${idx}`,
    code,
    name: `${s.brand} ${s.product} ${s.variant}`,
    category: s.category,
    default_burn_per_day: s.burn,
    reorder_threshold_days: s.threshold,
    unit_price_idr: s.price,
  }
})
