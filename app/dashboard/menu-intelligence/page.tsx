"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Lightbulb,
  ChevronRight,
  ChevronDown,
  Package,
} from "lucide-react"
import { FIXED_RESTAURANT_MENU } from "@/data/menu"

interface Ingredient {
  name: string
  shelfLife: string
  currentQuantity: number
  parLevel: number
  unit: string
}

interface MenuAnalyticsItem {
  menuId: string
  name: string
  category: string
  salesVolume: number
  margin: number
  popularity: number
  suggestion: string
  ingredients: Ingredient[]
}

const menuAnalyticsData: MenuAnalyticsItem[] = [
  {
    menuId: "m6",
    name: FIXED_RESTAURANT_MENU.find(m => m.id === "m6")?.name || "Mysore Masala Dosa",
    category: FIXED_RESTAURANT_MENU.find(m => m.id === "m6")?.category || "Dosa",
    salesVolume: 142,
    margin: 68,
    popularity: 92,
    suggestion: "Best performer - promote on Voice Assistant",
    ingredients: [
      { name: "Dosa Batter", shelfLife: "2 days", currentQuantity: 8, parLevel: 10, unit: "kg" },
      { name: "Ghee", shelfLife: "90 days", currentQuantity: 3, parLevel: 5, unit: "kg" },
      { name: "Potato Masala", shelfLife: "1 day", currentQuantity: 6, parLevel: 8, unit: "kg" },
      { name: "Chutney Powder", shelfLife: "30 days", currentQuantity: 2, parLevel: 4, unit: "kg" },
    ],
  },
  {
    menuId: "m5",
    name: FIXED_RESTAURANT_MENU.find(m => m.id === "m5")?.name || "Ghee Roast Dosa",
    category: FIXED_RESTAURANT_MENU.find(m => m.id === "m5")?.category || "Dosa",
    salesVolume: 118,
    margin: 72,
    popularity: 88,
    suggestion: "Feature in combo deals",
    ingredients: [
      { name: "Dosa Batter", shelfLife: "2 days", currentQuantity: 4, parLevel: 8, unit: "kg" },
      { name: "Ghee", shelfLife: "90 days", currentQuantity: 2, parLevel: 5, unit: "kg" },
      { name: "Spice Mix", shelfLife: "60 days", currentQuantity: 1.5, parLevel: 3, unit: "kg" },
    ],
  },
  {
    menuId: "m11",
    name: FIXED_RESTAURANT_MENU.find(m => m.id === "m11")?.name || "Bisi Bele Bath",
    category: FIXED_RESTAURANT_MENU.find(m => m.id === "m11")?.category || "Rice & Meals",
    salesVolume: 95,
    margin: 65,
    popularity: 85,
    suggestion: "Add premium variant at higher price",
    ingredients: [
      { name: "Rice", shelfLife: "180 days", currentQuantity: 15, parLevel: 20, unit: "kg" },
      { name: "Toor Dal", shelfLife: "365 days", currentQuantity: 8, parLevel: 10, unit: "kg" },
      { name: "BBB Powder", shelfLife: "90 days", currentQuantity: 2, parLevel: 3, unit: "kg" },
      { name: "Vegetables", shelfLife: "3 days", currentQuantity: 5, parLevel: 8, unit: "kg" },
      { name: "Ghee", shelfLife: "90 days", currentQuantity: 2, parLevel: 5, unit: "kg" },
    ],
  },
  {
    menuId: "m1",
    name: FIXED_RESTAURANT_MENU.find(m => m.id === "m1")?.name || "Steamed Idli",
    category: FIXED_RESTAURANT_MENU.find(m => m.id === "m1")?.category || "Idli",
    salesVolume: 188,
    margin: 22,
    popularity: 90,
    suggestion: "Increase price by Rs 5 - low elasticity",
    ingredients: [
      { name: "Idli Batter", shelfLife: "2 days", currentQuantity: 10, parLevel: 15, unit: "kg" },
      { name: "Sambar Mix", shelfLife: "30 days", currentQuantity: 1, parLevel: 2, unit: "kg" },
      { name: "Coconut", shelfLife: "3 days", currentQuantity: 3, parLevel: 5, unit: "kg" },
    ],
  },
  {
    menuId: "m8",
    name: FIXED_RESTAURANT_MENU.find(m => m.id === "m8")?.name || "Crispy Medu Vada",
    category: FIXED_RESTAURANT_MENU.find(m => m.id === "m8")?.category || "Vada",
    salesVolume: 140,
    margin: 20,
    popularity: 75,
    suggestion: "Bundle with high-margin items",
    ingredients: [
      { name: "Urad Dal", shelfLife: "365 days", currentQuantity: 5, parLevel: 10, unit: "kg" },
      { name: "Curry Leaves", shelfLife: "5 days", currentQuantity: 0.5, parLevel: 1, unit: "kg" },
      { name: "Oil", shelfLife: "90 days", currentQuantity: 8, parLevel: 15, unit: "ltr" },
    ],
  },
  {
    menuId: "m16",
    name: FIXED_RESTAURANT_MENU.find(m => m.id === "m16")?.name || "Authentic Filter Coffee",
    category: FIXED_RESTAURANT_MENU.find(m => m.id === "m16")?.category || "Specials",
    salesVolume: 28,
    margin: 70,
    popularity: 30,
    suggestion: "Pair with breakfast items to increase AOV",
    ingredients: [
      { name: "Coffee Powder", shelfLife: "180 days", currentQuantity: 2, parLevel: 3, unit: "kg" },
      { name: "Milk", shelfLife: "3 days", currentQuantity: 8, parLevel: 15, unit: "ltr" },
      { name: "Sugar", shelfLife: "365 days", currentQuantity: 10, parLevel: 15, unit: "kg" },
    ],
  },
  {
    menuId: "m4",
    name: FIXED_RESTAURANT_MENU.find(m => m.id === "m4")?.name || "Classic Masala Dosa",
    category: FIXED_RESTAURANT_MENU.find(m => m.id === "m4")?.category || "Dosa",
    salesVolume: 35,
    margin: 65,
    popularity: 38,
    suggestion: "Pair with Filter Coffee to increase AOV",
    ingredients: [
      { name: "Dosa Batter", shelfLife: "2 days", currentQuantity: 3, parLevel: 8, unit: "kg" },
      { name: "Potato", shelfLife: "14 days", currentQuantity: 5, parLevel: 10, unit: "kg" },
      { name: "Onion", shelfLife: "14 days", currentQuantity: 5, parLevel: 8, unit: "kg" },
      { name: "Mustard Seeds", shelfLife: "365 days", currentQuantity: 0.5, parLevel: 1, unit: "kg" },
    ],
  },
  {
    menuId: "m14",
    name: FIXED_RESTAURANT_MENU.find(m => m.id === "m14")?.name || "Onion Uttapam",
    category: FIXED_RESTAURANT_MENU.find(m => m.id === "m14")?.category || "Specials",
    salesVolume: 8,
    margin: 15,
    popularity: 10,
    suggestion: "Consider removing from menu",
    ingredients: [
      { name: "Dosa Batter", shelfLife: "2 days", currentQuantity: 2, parLevel: 5, unit: "kg" },
      { name: "Onion", shelfLife: "14 days", currentQuantity: 5, parLevel: 8, unit: "kg" },
      { name: "Tomato", shelfLife: "5 days", currentQuantity: 2, parLevel: 5, unit: "kg" },
      { name: "Coriander", shelfLife: "3 days", currentQuantity: 0.2, parLevel: 1, unit: "kg" },
    ],
  },
]

const menuItems = menuAnalyticsData

function getQuantityStatus(current: number, parLevel: number): { color: string; label: string } {
  const percentage = (current / parLevel) * 100
  if (percentage <= 20) return { color: "bg-red-500", label: "Urgent Restock" }
  if (percentage <= 50) return { color: "bg-amber-500", label: "Medium" }
  return { color: "bg-emerald-500", label: "Healthy" }
}

export default function MenuIntelligencePage() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const toggleItem = (name: string) => {
    setExpandedItem(expandedItem === name ? null : name)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Menu Intelligence</h1>
        <p className="text-sm text-muted-foreground">AI-powered menu performance analysis with integrated inventory tracking.</p>
      </div>

      {/* Menu Items with Ingredient Drill-Down */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Package className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Menu Items & Inventory</CardTitle>
              <CardDescription>Click on a menu item to view ingredient inventory details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => {
              const isExpanded = expandedItem === item.name
              const hasLowStock = item.ingredients.some((ing) => {
                const percentage = (ing.currentQuantity / ing.parLevel) * 100
                return percentage <= 20
              })

              return (
                <div key={item.name} className="rounded-xl border border-[#E5E7EB] overflow-hidden">
                  {/* Menu Item Row */}
                  <button
                    onClick={() => toggleItem(item.name)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      {hasLowStock && (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Lightbulb className="h-3 w-3 text-amber-500" />
                        <span className="max-w-[200px] truncate">{item.suggestion}</span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Ingredient Table */}
                  {isExpanded && (
                    <div className="border-t border-[#E5E7EB] bg-slate-50 p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#E5E7EB] text-left">
                              <th className="pb-2 font-medium text-muted-foreground">Ingredient Name</th>
                              <th className="pb-2 font-medium text-muted-foreground">Shelf Life</th>
                              <th className="pb-2 font-medium text-muted-foreground">Current Quantity</th>
                              <th className="pb-2 font-medium text-muted-foreground">Status</th>
                              <th className="pb-2 font-medium text-muted-foreground">Restock Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.ingredients.map((ing) => {
                              const status = getQuantityStatus(ing.currentQuantity, ing.parLevel)
                              const restockAmount = Math.max(0, ing.parLevel - ing.currentQuantity)
                              const percentage = (ing.currentQuantity / ing.parLevel) * 100

                              return (
                                <tr key={ing.name} className="border-b border-[#E5E7EB] last:border-0">
                                  <td className="py-3 font-medium text-foreground">{ing.name}</td>
                                  <td className="py-3 text-muted-foreground">{ing.shelfLife}</td>
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-16 rounded-full bg-slate-200">
                                        <div
                                          className={`h-2 rounded-full ${status.color}`}
                                          style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-foreground">
                                        {ing.currentQuantity} {ing.unit}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <Badge
                                      variant="secondary"
                                      className={
                                        status.label === "Urgent Restock"
                                          ? "bg-red-100 text-red-700"
                                          : status.label === "Medium"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-emerald-100 text-emerald-700"
                                      }
                                    >
                                      {status.label}
                                    </Badge>
                                  </td>
                                  <td className="py-3">
                                    {restockAmount > 0 ? (
                                      <span className="font-medium text-red-600">
                                        +{restockAmount.toFixed(1)} {ing.unit}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
