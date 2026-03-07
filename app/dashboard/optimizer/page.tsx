"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Check,
  X,
  TrendingUp,
  Sparkles,
  Send,
  Package,
  ArrowRight,
  DollarSign,
} from "lucide-react"

const priceItems = [
  { id: 1, item: "Mysore Masala Dosa", currentPrice: 90, suggestedPrice: 99, confidence: 88, impact: "+\u20B94,200/week", elasticity: "Low" },
  { id: 2, item: "Ghee Roast Dosa", currentPrice: 90, suggestedPrice: 105, confidence: 92, impact: "+\u20B96,800/week", elasticity: "Low" },
  { id: 3, item: "Classic Masala Dosa", currentPrice: 70, suggestedPrice: 79, confidence: 76, impact: "+\u20B92,100/week", elasticity: "Medium" },
  { id: 4, item: "Steamed Idli (2 pcs)", currentPrice: 60, suggestedPrice: 65, confidence: 84, impact: "+\u20B93,500/week", elasticity: "Low" },
  { id: 5, item: "Bisi Bele Bath", currentPrice: 80, suggestedPrice: 89, confidence: 80, impact: "+\u20B92,800/week", elasticity: "Medium" },
  { id: 6, item: "Crispy Medu Vada (2 pcs)", currentPrice: 60, suggestedPrice: 69, confidence: 86, impact: "+\u20B93,900/week", elasticity: "Low" },
]

const combos = [
  {
    id: 1,
    name: "Classic Breakfast Combo",
    items: ["Steamed Idli (2 pcs)", "Crispy Medu Vada (2 pcs)", "Authentic Filter Coffee"],
    originalTotal: 170,
    comboPrice: 139,
    projectedAovIncrease: "+\u20B935",
    published: false,
  },
  {
    id: 2,
    name: "Family Feast",
    items: ["2x Mysore Masala Dosa", "2x Ven Pongal", "4x Steamed Idli", "2x Authentic Filter Coffee"],
    originalTotal: 420,
    comboPrice: 349,
    projectedAovIncrease: "+\u20B975",
    published: true,
  },
  {
    id: 3,
    name: "Dosa Delight",
    items: ["Mysore Masala Dosa", "Rasam Vada", "Authentic Filter Coffee"],
    originalTotal: 220,
    comboPrice: 179,
    projectedAovIncrease: "+\u20B945",
    published: false,
  },
  {
    id: 4,
    name: "South Indian Thali",
    items: ["Bisi Bele Bath", "Curd Rice", "Crispy Medu Vada (2 pcs)", "Sweet Kesari Bath"],
    originalTotal: 260,
    comboPrice: 219,
    projectedAovIncrease: "+\u20B955",
    published: false,
  },
]

export default function OptimizerPage() {
  const [decisions, setDecisions] = useState<Record<number, "approved" | "rejected">>({})
  const [publishedCombos, setPublishedCombos] = useState<Record<number, boolean>>(
    Object.fromEntries(combos.map((c) => [c.id, c.published]))
  )

  const approvedItems = priceItems.filter((p) => decisions[p.id] === "approved")
  const weeklyEstimate = approvedItems.reduce((acc, item) => {
    const weeklyValue = parseInt(item.impact.replace(/[^\d]/g, "")) || 0
    return acc + weeklyValue
  }, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Price & Combo Optimizer</h1>
        <p className="text-sm text-muted-foreground">AI-driven pricing suggestions and smart combo recommendations to maximize revenue.</p>
      </div>

      {/* Weekly Profit Estimator */}
      <Card className="border-success/20 bg-success/5">
        <CardContent className="p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Estimated Weekly Profit Increase</div>
                <div className="text-3xl font-bold text-success">{"\u20B9"}{weeklyEstimate.toLocaleString("en-IN")}</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Based on <span className="font-semibold text-foreground">{approvedItems.length}</span> approved price changes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Optimization */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <TrendingUp className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">AI Price Optimization</CardTitle>
              <CardDescription>Review AI-suggested price changes based on demand analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Item</th>
                  <th className="pb-3 font-medium text-muted-foreground">Current Price</th>
                  <th className="pb-3 font-medium text-muted-foreground">AI Suggested</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground sm:table-cell">Confidence</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground md:table-cell">Demand Elasticity</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground lg:table-cell">Est. Impact</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {priceItems.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-4 font-medium text-foreground">{item.item}</td>
                    <td className="py-4 text-muted-foreground">{"\u20B9"}{item.currentPrice}</td>
                    <td className="py-4">
                      <span className="font-semibold text-success">{"\u20B9"}{item.suggestedPrice}</span>
                      <span className="ml-1 text-xs text-success">(+{"\u20B9"}{item.suggestedPrice - item.currentPrice})</span>
                    </td>
                    <td className="hidden py-4 sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={item.confidence} className="h-2 w-20" />
                        <span className="text-xs font-medium text-foreground">{item.confidence}%</span>
                      </div>
                    </td>
                    <td className="hidden py-4 md:table-cell">
                      <Badge variant="secondary" className={
                        item.elasticity === "Low"
                          ? "bg-success/10 text-success hover:bg-success/10"
                          : item.elasticity === "Medium"
                          ? "bg-warning/10 text-warning hover:bg-warning/10"
                          : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                      }>
                        {item.elasticity}
                      </Badge>
                    </td>
                    <td className="hidden py-4 lg:table-cell">
                      <span className="text-sm font-medium text-success">{item.impact}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        {decisions[item.id] ? (
                          <Badge
                            variant="secondary"
                            className={
                              decisions[item.id] === "approved"
                                ? "bg-success/10 text-success hover:bg-success/10"
                                : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                            }
                          >
                            {decisions[item.id] === "approved" ? "Approved" : "Rejected"}
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-success hover:bg-success/10 hover:text-success"
                              onClick={() => setDecisions((prev) => ({ ...prev, [item.id]: "approved" }))}
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDecisions((prev) => ({ ...prev, [item.id]: "rejected" }))}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Smart Combo Builder */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Sparkles className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Smart Combo Builder</CardTitle>
              <CardDescription>AI-generated combo suggestions to increase average order value</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {combos.map((combo) => (
              <div
                key={combo.id}
                className="flex flex-col rounded-xl border border-border bg-background p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{combo.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {combo.items.map((item) => (
                        <Badge key={item} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Package className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Original</div>
                    <div className="text-sm text-muted-foreground line-through">{"\u20B9"}{combo.originalTotal}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Combo Price</div>
                    <div className="text-lg font-bold text-foreground">{"\u20B9"}{combo.comboPrice}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs text-muted-foreground">AOV Impact</div>
                    <div className="text-sm font-semibold text-success">{combo.projectedAovIncrease}</div>
                  </div>
                </div>

                <div className="mt-4">
                  {publishedCombos[combo.id] ? (
                    <Button size="sm" variant="outline" className="w-full gap-2 text-success" disabled>
                      <Check className="h-4 w-4" />
                      Published to Petpooja POS & Voice Assistant
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => setPublishedCombos((prev) => ({ ...prev, [combo.id]: true }))}
                    >
                      <Send className="h-4 w-4" />
                      Publish to Petpooja POS & Voice Assistant
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
