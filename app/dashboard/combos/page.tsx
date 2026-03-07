"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Combine,
  Send,
  Check,
  ArrowRight,
  Package,
  TrendingUp,
  Lightbulb,
} from "lucide-react"

const combos = [
  {
    id: 1,
    name: "Classic Breakfast Combo",
    items: ["Steamed Idli (2 pcs)", "Crispy Medu Vada (2 pcs)", "Authentic Filter Coffee"],
    originalTotal: 170,
    comboPrice: 139,
    aovIncrease: "+\u20B935",
    successProb: "88%",
    published: true,
  },
  {
    id: 2,
    name: "Dosa Delight",
    items: ["Mysore Masala Dosa", "Rasam Vada", "Authentic Filter Coffee"],
    originalTotal: 220,
    comboPrice: 179,
    aovIncrease: "+\u20B945",
    successProb: "85%",
    published: true,
  },
  {
    id: 3,
    name: "South Indian Thali",
    items: ["Bisi Bele Bath", "Curd Rice", "Crispy Medu Vada (2 pcs)", "Sweet Kesari Bath"],
    originalTotal: 260,
    comboPrice: 219,
    aovIncrease: "+\u20B955",
    successProb: "82%",
    published: false,
  },
  {
    id: 4,
    name: "Ghee Lover's Special",
    items: ["Ghee Roast Dosa", "Mini Ghee Idli (14 pcs)", "Authentic Filter Coffee"],
    originalTotal: 220,
    comboPrice: 189,
    aovIncrease: "+\u20B940",
    successProb: "78%",
    published: false,
  },
  {
    id: 5,
    name: "Family Feast",
    items: ["2x Mysore Masala Dosa", "2x Ven Pongal", "4x Steamed Idli", "2x Authentic Filter Coffee"],
    originalTotal: 420,
    comboPrice: 349,
    aovIncrease: "+\u20B975",
    successProb: "76%",
    published: true,
  },
  {
    id: 6,
    name: "Evening Snack Pack",
    items: ["Onion Uttapam", "Rasam Vada", "Lemon Rice", "Authentic Filter Coffee"],
    originalTotal: 260,
    comboPrice: 219,
    aovIncrease: "+\u20B950",
    successProb: "80%",
    published: false,
  },
]

const upsellInsights = [
  "Mysore Masala Dosa orders have 72% Filter Coffee add-on rate \u2014 bundle automatically.",
  "Filter Coffee upsell on all dosa orders increases AOV by \u20B925 on average.",
  "Weekend Bisi Bele Bath orders respond well to Sweet Kesari Bath suggestions.",
  "Mini Ghee Idli combo acceptance rate is 78% when suggested via Voice Assistant.",
]

export default function CombosPage() {
  const [published, setPublished] = useState<Record<number, boolean>>(
    Object.fromEntries(combos.map((c) => [c.id, c.published]))
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Combos & Upselling</h1>
        <p className="text-sm text-muted-foreground">AI-generated combo recommendations and upselling strategies to maximize revenue.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Combos</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D1FAE5]">
                <Combine className="h-4 w-4 text-[#059669]" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{Object.values(published).filter(Boolean).length}</div>
            <div className="mt-1 text-xs text-muted-foreground">Published to Voice Assistant</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg AOV Lift</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF3C7]">
                <TrendingUp className="h-4 w-4 text-[#D97706]" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">{"\u20B9"}55</div>
            <div className="mt-1 text-xs text-muted-foreground">Per combo order</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Upsell Rate</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9]">
                <Package className="h-4 w-4 text-[#475569]" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">34.2%</div>
            <div className="mt-1 text-xs text-muted-foreground">Voice Assistant acceptance</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Upsell Insights */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF3C7]">
              <Lightbulb className="h-5 w-5 text-[#D97706]" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">AI Upsell Insights</CardTitle>
              <CardDescription>Data-driven suggestions to improve upselling</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {upsellInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-secondary p-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" />
                <span className="text-sm text-foreground leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Combo Cards */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D1FAE5]">
              <Combine className="h-5 w-5 text-[#059669]" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Smart Combo Builder</CardTitle>
              <CardDescription>AI-generated combo suggestions based on order patterns</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo) => (
              <div key={combo.id} className="flex flex-col rounded-xl border border-border bg-background p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">{combo.name}</h3>
                  <Package className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {combo.items.map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Original</div>
                    <div className="text-sm text-muted-foreground line-through">{"\u20B9"}{combo.originalTotal}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Combo</div>
                    <div className="text-lg font-bold text-foreground">{"\u20B9"}{combo.comboPrice}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>AOV Impact: <span className="font-semibold text-success">{combo.aovIncrease}</span></span>
                  <span>Success: <span className="font-semibold text-foreground">{combo.successProb}</span></span>
                </div>
                <div className="mt-4">
                  {published[combo.id] ? (
                    <Button size="sm" variant="outline" className="w-full gap-2 text-success" disabled>
                      <Check className="h-4 w-4" />
                      Published
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => setPublished((prev) => ({ ...prev, [combo.id]: true }))}
                    >
                      <Send className="h-4 w-4" />
                      Publish to Voice Assistant
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
