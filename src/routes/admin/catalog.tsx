import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

import { useMockStore } from "@/mocks/state"

export const Route = createFileRoute("/admin/catalog")({ component: CatalogPage })

const CATEGORY_LABEL: Record<string, string> = {
  laser_profiler: "Laser profiler",
  vision_system: "Vision system",
  measurement: "Measurement",
  barcode_reader: "Barcode reader",
  fiber_sensor: "Fiber sensor",
  displacement_sensor: "Displacement sensor",
}

function formatIdr(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `Rp ${Math.round(value / 1_000_000)}jt`
  return `Rp ${value.toLocaleString("id-ID")}`
}

const INIT_PRODUCT_FORM = {
  name: "",
  code: "",
  demo_units_available: 0,
  unit_price_idr: 0,
}

function CatalogPage() {
  const products = useMockStore((s) => s.products)

  const [editProductId, setEditProductId] = React.useState<string | null>(null)
  const [productForm, setProductForm] = React.useState({ ...INIT_PRODUCT_FORM })

  const editingProduct = editProductId
    ? (products.find((p) => p.id === editProductId) ?? null)
    : null

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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Product catalog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bima · {products.length} products · click a row to edit
        </p>
      </div>

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

      {/* Edit product sheet */}
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
    </div>
  )
}
