"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  TrendingUp,
  DollarSign,
  Lightbulb,
  Pencil,
  Check,
  X,
  Combine,
  Trash2,
  ArrowRight,
  Package,
} from "lucide-react"

interface PriceItem {
  id: number
  menuItem: string
  currentPrice: number
  aiSuggestedPrice: number
  expectedImpact: string
  confidenceScore: number
}

interface ComboSuggestion {
  id: number
  name: string
  items: string[]
  originalTotal: number
  comboPrice: number
  aovIncrease: string
  successProb: string
}

const initialPriceItems: PriceItem[] = [
  { id: 1, menuItem: "Mysore Masala Dosa", currentPrice: 90, aiSuggestedPrice: 99, expectedImpact: "+\u20B94,200/week", confidenceScore: 88 },
  { id: 2, menuItem: "Ghee Roast Dosa", currentPrice: 90, aiSuggestedPrice: 105, expectedImpact: "+\u20B96,800/week", confidenceScore: 92 },
  { id: 3, menuItem: "Classic Masala Dosa", currentPrice: 70, aiSuggestedPrice: 79, expectedImpact: "+\u20B92,100/week", confidenceScore: 76 },
  { id: 4, menuItem: "Steamed Idli (2 pcs)", currentPrice: 60, aiSuggestedPrice: 65, expectedImpact: "+\u20B93,500/week", confidenceScore: 84 },
  { id: 5, menuItem: "Bisi Bele Bath", currentPrice: 80, aiSuggestedPrice: 89, expectedImpact: "+\u20B92,800/week", confidenceScore: 80 },
  { id: 6, menuItem: "Crispy Medu Vada (2 pcs)", currentPrice: 60, aiSuggestedPrice: 69, expectedImpact: "+\u20B93,900/week", confidenceScore: 86 },
  { id: 7, menuItem: "Authentic Filter Coffee", currentPrice: 50, aiSuggestedPrice: 55, expectedImpact: "+\u20B95,400/week", confidenceScore: 91 },
  { id: 8, menuItem: "Ven Pongal", currentPrice: 70, aiSuggestedPrice: 79, expectedImpact: "+\u20B92,500/week", confidenceScore: 78 },
]

const initialComboSuggestions: ComboSuggestion[] = [
  {
    id: 1,
    name: "Classic Breakfast Combo",
    items: ["Steamed Idli (2 pcs)", "Crispy Medu Vada (2 pcs)", "Authentic Filter Coffee"],
    originalTotal: 170,
    comboPrice: 139,
    aovIncrease: "+\u20B935",
    successProb: "88%",
  },
  {
    id: 2,
    name: "Dosa Delight",
    items: ["Mysore Masala Dosa", "Rasam Vada", "Authentic Filter Coffee"],
    originalTotal: 220,
    comboPrice: 179,
    aovIncrease: "+\u20B945",
    successProb: "85%",
  },
  {
    id: 3,
    name: "South Indian Thali",
    items: ["Bisi Bele Bath", "Curd Rice", "Crispy Medu Vada (2 pcs)", "Sweet Kesari Bath"],
    originalTotal: 260,
    comboPrice: 219,
    aovIncrease: "+\u20B955",
    successProb: "82%",
  },
  {
    id: 4,
    name: "Ghee Lover's Special",
    items: ["Ghee Roast Dosa", "Mini Ghee Idli (14 pcs)", "Authentic Filter Coffee"],
    originalTotal: 220,
    comboPrice: 189,
    aovIncrease: "+\u20B940",
    successProb: "78%",
  },
  {
    id: 5,
    name: "Family Feast",
    items: ["2x Mysore Masala Dosa", "2x Ven Pongal", "4x Steamed Idli", "2x Authentic Filter Coffee"],
    originalTotal: 420,
    comboPrice: 349,
    aovIncrease: "+\u20B975",
    successProb: "76%",
  },
  {
    id: 6,
    name: "Evening Snack Pack",
    items: ["Onion Uttapam", "Rasam Vada", "Lemon Rice", "Authentic Filter Coffee"],
    originalTotal: 260,
    comboPrice: 219,
    aovIncrease: "+\u20B950",
    successProb: "80%",
  },
]

export default function PricingPage() {
  const [priceItems, setPriceItems] = useState(initialPriceItems)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [editingCurrentPriceId, setEditingCurrentPriceId] = useState<number | null>(null)
  const [editCurrentPriceValue, setEditCurrentPriceValue] = useState<number>(0)
  const [comboSuggestions, setComboSuggestions] = useState(initialComboSuggestions)
  const [approvedCombos, setApprovedCombos] = useState<Record<number, boolean>>({})
  const [editingComboId, setEditingComboId] = useState<number | null>(null)
  const [editComboPrice, setEditComboPrice] = useState<number>(0)

  // Edit current price
  const handleStartEditCurrentPrice = (item: PriceItem) => {
    setEditingCurrentPriceId(item.id)
    setEditCurrentPriceValue(item.currentPrice)
  }

  const handleSaveCurrentPrice = (id: number) => {
    setPriceItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, currentPrice: editCurrentPriceValue } : item
      )
    )
    setEditingCurrentPriceId(null)
  }

  const handleCancelCurrentPriceEdit = () => {
    setEditingCurrentPriceId(null)
    setEditCurrentPriceValue(0)
  }

  // Apply AI suggested price to current price
  const handleApplyAiPrice = (id: number) => {
    setPriceItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, currentPrice: item.aiSuggestedPrice } : item
      )
    )
  }

  // Edit AI suggested price - disabled, AI suggested is read-only
  const handleStartEdit = (item: PriceItem) => {
    // AI suggested price is read-only per requirements
    return
  }

  const handleSaveEdit = (id: number) => {
    setPriceItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, aiSuggestedPrice: editValue } : item
      )
    )
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue(0)
  }

  const handleApproveCombo = (id: number) => {
    setApprovedCombos((prev) => ({ ...prev, [id]: true }))
  }

  const handleDisapproveCombo = (id: number) => {
    setApprovedCombos((prev) => ({ ...prev, [id]: false }))
  }

  const handleDeleteCombo = (id: number) => {
    setComboSuggestions((prev) => prev.filter((c) => c.id !== id))
    // Also remove from approved state
    setApprovedCombos((prev) => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
  }

  const handleStartComboEdit = (combo: ComboSuggestion) => {
    setEditingComboId(combo.id)
    setEditComboPrice(combo.comboPrice)
  }

  const handleSaveComboEdit = (id: number) => {
    setComboSuggestions((prev) =>
      prev.map((combo) =>
        combo.id === id ? { ...combo, comboPrice: editComboPrice } : combo
      )
    )
    setEditingComboId(null)
  }

  const totalWeeklyImpact = priceItems.reduce((acc, item) => {
    const match = item.expectedImpact.match(/[\d,]+/)
    return acc + (match ? parseInt(match[0].replace(/,/g, "")) : 0)
  }, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pricing, Combos & Upselling</h1>
        <p className="text-sm text-muted-foreground">
          AI-generated pricing recommendations and combo suggestions to maximize revenue.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Weekly Impact</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600">
              {"\u20B9"}{totalWeeklyImpact.toLocaleString("en-IN")}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">If all suggestions applied</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price Suggestions</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{priceItems.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Items with AI recommendations</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Combo Suggestions</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Combine className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{comboSuggestions.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">AI suggested combos</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Price Recommendations Table */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base text-foreground">AI Price Recommendations</CardTitle>
                <CardDescription>Review and edit AI-suggested price changes</CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-[#CF1F2E] hover:bg-[#B01A26] text-white"
              onClick={() => alert('Prices saved to POS successfully!')}
            >
              Save Changes to POS
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Menu Item</th>
                  <th className="pb-3 font-medium text-muted-foreground">Current Price</th>
                  <th className="pb-3 font-medium text-muted-foreground">AI Suggested Price</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground md:table-cell">Expected Impact</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground sm:table-cell">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {priceItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-slate-50">
                    <td className="py-4 font-medium text-foreground">{item.menuItem}</td>
                    <td className="py-4">
                      {editingCurrentPriceId === item.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">{"\u20B9"}</span>
                          <Input
                            type="number"
                            value={editCurrentPriceValue}
                            onChange={(e) => setEditCurrentPriceValue(parseInt(e.target.value) || 0)}
                            className="h-8 w-20"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleSaveCurrentPrice(item.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            onClick={handleCancelCurrentPriceEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{"\u20B9"}{item.currentPrice}</span>
                          <button
                            onClick={() => handleStartEditCurrentPrice(item)}
                            className="rounded p-1 hover:bg-slate-100"
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4">
                      <span className="font-semibold text-emerald-600">
                        {"\u20B9"}{item.aiSuggestedPrice}
                        <span className="ml-1 text-xs">
                          (+{"\u20B9"}{item.aiSuggestedPrice - item.currentPrice})
                        </span>
                      </span>
                    </td>
                    <td className="hidden py-4 md:table-cell">
                      <span className="text-sm font-medium text-emerald-600">{item.expectedImpact}</span>
                    </td>
                    <td className="hidden py-4 sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full ${
                              item.confidenceScore >= 85
                                ? "bg-emerald-500"
                                : item.confidenceScore >= 70
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${item.confidenceScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground">{item.confidenceScore}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggested Combos */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Combine className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">AI Suggested Combos</CardTitle>
              <CardDescription>Approve, edit, or delete AI-generated combo recommendations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {comboSuggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No combo suggestions</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                AI will generate new combo suggestions based on your order patterns.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {comboSuggestions.map((combo) => (
                <div
                  key={combo.id}
                  className={`flex flex-col rounded-xl border p-5 transition-all ${
                    approvedCombos[combo.id]
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-[#E5E7EB] bg-white hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-foreground">{combo.name}</h3>
                    <div className="flex items-center gap-1">
                      {!approvedCombos[combo.id] && (
                        <>
                          <button
                            onClick={() => handleStartComboEdit(combo)}
                            className="rounded p-1.5 hover:bg-slate-100"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDeleteCombo(combo.id)}
                            className="rounded p-1.5 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {combo.items.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Original</div>
                      <div className="text-sm text-muted-foreground line-through">
                        {"\u20B9"}{combo.originalTotal}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Combo</div>
                      {editingComboId === combo.id ? (
                        <div className="flex items-center gap-1">
                          <span>{"\u20B9"}</span>
                          <Input
                            type="number"
                            value={editComboPrice}
                            onChange={(e) => setEditComboPrice(parseInt(e.target.value) || 0)}
                            className="h-7 w-16 text-sm"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => handleSaveComboEdit(combo.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-foreground">
                          {"\u20B9"}{combo.comboPrice}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      AOV Impact: <span className="font-semibold text-emerald-600">{combo.aovIncrease}</span>
                    </span>
                    <span>
                      Success: <span className="font-semibold text-foreground">{combo.successProb}</span>
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {approvedCombos[combo.id] ? (
                      <>
                        <Button size="sm" variant="outline" className="flex-1 gap-2 text-emerald-600 border-emerald-200 bg-emerald-50" disabled>
                          <Check className="h-4 w-4" />
                          Approved
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-red-600 hover:bg-red-50"
                          onClick={() => handleDisapproveCombo(combo.id)}
                        >
                          <X className="h-4 w-4" />
                          Disapprove
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 gap-2 bg-[#8B0000] hover:bg-[#6B0000]"
                          onClick={() => handleApproveCombo(combo.id)}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-slate-600 hover:bg-slate-50"
                          onClick={() => handleDeleteCombo(combo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
