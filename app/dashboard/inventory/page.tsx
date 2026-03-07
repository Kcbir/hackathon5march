"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react"

interface IngredientRow {
  ingredient_id: number
  name: string
  price_per_unit: number
  shelf_life: string
  current_stock: number
  unit: string
  par_level: number
}

const inventoryData: IngredientRow[] = [
  { ingredient_id: 1, name: "Sona Masuri Rice", price_per_unit: 60.00, shelf_life: "6 months", current_stock: 45, unit: "kg", par_level: 50 },
  { ingredient_id: 2, name: "Urad Dal", price_per_unit: 120.00, shelf_life: "8 months", current_stock: 18, unit: "kg", par_level: 25 },
  { ingredient_id: 3, name: "Toor Dal", price_per_unit: 150.00, shelf_life: "8 months", current_stock: 12, unit: "kg", par_level: 20 },
  { ingredient_id: 4, name: "Rava", price_per_unit: 50.00, shelf_life: "4 months", current_stock: 10, unit: "kg", par_level: 15 },
  { ingredient_id: 5, name: "Filter Coffee Powder", price_per_unit: 600.00, shelf_life: "6 months", current_stock: 3, unit: "kg", par_level: 5 },
  { ingredient_id: 6, name: "Full Cream Milk", price_per_unit: 65.00, shelf_life: "3 days", current_stock: 20, unit: "ltr", par_level: 30 },
  { ingredient_id: 7, name: "Pure Desi Ghee", price_per_unit: 600.00, shelf_life: "9 months", current_stock: 4, unit: "kg", par_level: 8 },
  { ingredient_id: 8, name: "Refined Sunflower Oil", price_per_unit: 120.00, shelf_life: "12 months", current_stock: 15, unit: "ltr", par_level: 20 },
  { ingredient_id: 9, name: "Fresh Coconut", price_per_unit: 60.00, shelf_life: "5 days", current_stock: 8, unit: "pcs", par_level: 15 },
  { ingredient_id: 10, name: "Tamarind", price_per_unit: 180.00, shelf_life: "12 months", current_stock: 3, unit: "kg", par_level: 5 },
  { ingredient_id: 11, name: "Jaggery", price_per_unit: 60.00, shelf_life: "10 months", current_stock: 4, unit: "kg", par_level: 5 },
  { ingredient_id: 12, name: "Mustard Seeds", price_per_unit: 100.00, shelf_life: "12 months", current_stock: 2, unit: "kg", par_level: 3 },
  { ingredient_id: 13, name: "Curry Leaves", price_per_unit: 50.00, shelf_life: "5 days", current_stock: 0.5, unit: "kg", par_level: 1.5 },
  { ingredient_id: 14, name: "Onions", price_per_unit: 40.00, shelf_life: "2 weeks", current_stock: 12, unit: "kg", par_level: 15 },
  { ingredient_id: 15, name: "Potatoes", price_per_unit: 30.00, shelf_life: "3 weeks", current_stock: 10, unit: "kg", par_level: 15 },
]

function getStockStatus(current: number, parLevel: number): { color: string; label: string; badgeClass: string } {
  const pct = (current / parLevel) * 100
  if (pct <= 25) return { color: "bg-red-500", label: "Low Stock", badgeClass: "bg-red-100 text-red-700" }
  if (pct <= 60) return { color: "bg-amber-500", label: "Medium", badgeClass: "bg-amber-100 text-amber-700" }
  return { color: "bg-emerald-500", label: "Healthy", badgeClass: "bg-emerald-100 text-emerald-700" }
}

function isPerishable(shelfLife: string): boolean {
  return shelfLife.includes("day") || shelfLife.includes("week")
}

export default function InventoryPage() {
  const [search, setSearch] = useState("")

  const filtered = inventoryData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockCount = inventoryData.filter((i) => (i.current_stock / i.par_level) * 100 <= 25).length
  const perishableCount = inventoryData.filter((i) => isPerishable(i.shelf_life)).length
  const totalValue = inventoryData.reduce((sum, i) => sum + i.price_per_unit * i.current_stock, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Track ingredient stock levels, shelf life, and restock needs.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Ingredients</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{inventoryData.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Inventory value: ₹{totalValue.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Low Stock Items</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-red-600">{lowStockCount}</div>
            <div className="mt-1 text-xs text-muted-foreground">Need restocking soon</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Perishable Items</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{perishableCount}</div>
            <div className="mt-1 text-xs text-muted-foreground">Short shelf life (days/weeks)</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Package className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-base text-foreground">Ingredient Inventory</CardTitle>
                <CardDescription>Stock levels, pricing, and shelf life for all ingredients</CardDescription>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-56 rounded-lg border border-[#E5E7EB] bg-slate-50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-left">
                  <th className="pb-3 font-medium text-muted-foreground">#</th>
                  <th className="pb-3 font-medium text-muted-foreground">Ingredient</th>
                  <th className="pb-3 font-medium text-muted-foreground">Price / Unit</th>
                  <th className="pb-3 font-medium text-muted-foreground">Shelf Life</th>
                  <th className="pb-3 font-medium text-muted-foreground">Current Stock</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Restock Needed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const status = getStockStatus(item.current_stock, item.par_level)
                  const pct = (item.current_stock / item.par_level) * 100
                  const restockQty = Math.max(0, item.par_level - item.current_stock)
                  const perishable = isPerishable(item.shelf_life)

                  return (
                    <tr key={item.ingredient_id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-slate-50">
                      <td className="py-4 text-muted-foreground">{item.ingredient_id}</td>
                      <td className="py-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {item.name}
                          {perishable && (
                            <Clock className="h-3.5 w-3.5 text-amber-500" title="Perishable" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-foreground">₹{item.price_per_unit.toFixed(2)}/{item.unit}</td>
                      <td className="py-4 text-muted-foreground">{item.shelf_life}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-slate-200">
                            <div
                              className={`h-2 rounded-full ${status.color}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-foreground">
                            {item.current_stock} {item.unit}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="secondary" className={status.badgeClass}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="py-4">
                        {restockQty > 0 ? (
                          <span className="font-medium text-red-600">
                            +{restockQty % 1 === 0 ? restockQty : restockQty.toFixed(1)} {item.unit}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="text-sm">Stocked</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
