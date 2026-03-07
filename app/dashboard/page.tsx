"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Lightbulb,
  Combine,
  Plug,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Send,
  Check,
  Package,
  Zap,
  Timer,
  PauseCircle,
  Play,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

/* ─── Top Metric Cards (Updated) ─── */
const kpiCards = [
  {
    title: "Today's Revenue",
    value: "\u20B924,580",
    change: "+14.2%",
    icon: DollarSign,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Total Orders",
    value: "156",
    change: "+12.5%",
    icon: ShoppingCart,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Average Order Value",
    value: "\u20B9385",
    change: "+8.2%",
    icon: TrendingUp,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    title: "AI Assisted Orders",
    value: "47",
    change: "+15.3%",
    icon: Sparkles,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
]

/* ─── Menu Performance Table ─── */
const menuItems = [
  { name: "Mysore Masala Dosa", category: "Dosa", popularity: 92, margin: 68, quadrant: "Star", action: "Promote on voice assistant" },
  { name: "Ghee Roast Dosa", category: "Dosa", popularity: 88, margin: 72, quadrant: "Star", action: "Feature in combo deals" },
  { name: "Steamed Idli (2 pcs)", category: "Idli", popularity: 90, margin: 22, quadrant: "Plowhorse", action: "Increase price by \u20B95" },
  { name: "Classic Masala Dosa", category: "Dosa", popularity: 30, margin: 70, quadrant: "Puzzle", action: "Pair with Filter Coffee" },
  { name: "Appam with Veg Stew", category: "Specials", popularity: 15, margin: 82, quadrant: "Puzzle", action: "Promote as weekend special" },
  { name: "Onion Uttapam", category: "Specials", popularity: 10, margin: 15, quadrant: "Dog", action: "Consider removing" },
]

/* ─── AI Insights ─── */
const aiInsights = [
  "Ghee Roast Dosa has high margin but low sales - promote in combos.",
  "Classic Masala Dosa frequently ordered with Filter Coffee - create combo.",
  "Bisi Bele Bath price elasticity suggests +5% price increase possible.",
  "Weekend dinner orders spike 40% - schedule voice assistant upsell mode.",
]

/* ─── Combo Suggestions ─── */
const comboSuggestions = [
  { items: "Mysore Masala Dosa + Medu Vada", aovIncrease: "+\u20B945", successProb: "82%" },
  { items: "Idli + Vada + Coffee", aovIncrease: "+\u20B935", successProb: "88%" },
  { items: "Ghee Roast Dosa + Filter Coffee", aovIncrease: "+\u20B930", successProb: "85%" },
  { items: "Classic Masala Dosa + Filter Coffee", aovIncrease: "+\u20B925", successProb: "88%" },
]

/* ─── POS Integrations ─── */
const posIntegrations = [
  { name: "Petpooja POS", status: "connected" as const, lastSync: "2 min ago" },
  { name: "Toast POS", status: "pending" as const, lastSync: "Setup in progress" },
  { name: "Square POS", status: "disconnected" as const, lastSync: "Not configured" },
]

/* ─── Charts ─── */
const peakHoursData = [
  { hour: "9AM", orders: 12 },
  { hour: "10AM", orders: 18 },
  { hour: "11AM", orders: 24 },
  { hour: "12PM", orders: 42 },
  { hour: "1PM", orders: 56 },
  { hour: "2PM", orders: 38 },
  { hour: "3PM", orders: 20 },
  { hour: "5PM", orders: 22 },
  { hour: "6PM", orders: 35 },
  { hour: "7PM", orders: 52 },
  { hour: "8PM", orders: 68 },
  { hour: "9PM", orders: 48 },
]

const topSellingItems = [
  { name: "Mysore Masala Dosa", value: 142 },
  { name: "Ghee Roast Dosa", value: 118 },
  { name: "Bisi Bele Bath", value: 95 },
  { name: "Steamed Idli", value: 88 },
  { name: "Crispy Medu Vada", value: 72 },
]

const PIE_COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#64748B", "#8B5CF6"]

/* ─── Daily Action Plan Cards ─── */
const dailyActionPlanCards = [
  {
    id: "wastage-prevention",
    title: "Wastage Prevention",
    context: "15kg of Sona Masuri Rice used for Idli is nearing shelf life.",
    action: "Bundle Steamed Idli (2 pcs) with Authentic Filter Coffee as a \"Breakfast Starter\" combo priced at \u20B999.",
    expectedProfit: "+\u20B92,100",
    profitDetail: "Prevents \u20B9900 in ingredient waste and adds \u20B91,200 incremental sales.",
    buttonText: "Deploy to Voice Assistant",
    buttonIcon: "send",
    justification: {
      proposedAction: "Upsell Steamed Idli combo with every coffee order",
      inventoryStatus: "Sona Masuri Rice stock at 85% - nearing shelf life expiry",
      preparationTime: "3 minutes",
      salesData: "78% of morning customers order either idli or coffee",
      expectedResult: "Reduces waste by 15kg rice, adds \u20B91,200 daily revenue",
    },
  },
  {
    id: "peak-demand-pricing",
    title: "Peak Demand Pricing",
    context: "It is Sunday morning. Ghee Roast Dosa and Thatte Idli are trending 40% higher than usual.",
    action: "Increase price temporarily:\nGhee Roast Dosa \u2192 \u20B9110\nThatte Idli \u2192 \u20B985\nValid until 2:00 PM.",
    expectedProfit: "+\u20B93,500",
    profitDetail: "Estimated extra profit based on order velocity.",
    buttonText: "Update POS Prices Now",
    buttonIcon: "zap",
    justification: {
      proposedAction: "Temporary price increase for high-demand items",
      inventoryStatus: "Ghee and Idli batter stock sufficient for 200+ orders",
      preparationTime: "N/A - pricing change only",
      salesData: "Sunday morning orders 40% higher than weekday average",
      expectedResult: "Average bill increases from \u20B990 to \u20B9110 per order",
    },
  },
]

/* ─── Smart Inventory Alerts ─── */
const inventoryAlerts = [
  {
    id: "ghee-alert",
    ingredient: "Desi Ghee",
    stockLevel: 18,
    status: "critical",
    pauseItems: ["Ghee Roast Dosa", "Mini Ghee Idli"],
    promoteItems: ["Rava Dosa", "Classic Masala Dosa"],
    reason: "High semolina stock available",
    expectedBenefit: "Prevents customer cancellations and kitchen disruptions",
  },
]

/* ─── Dynamic Pricing Strategy ─── */
const dynamicPricingData = [
  {
    item: "Authentic Filter Coffee",
    weekdayPrice: "\u20B950",
    weekendPrice: "\u20B965",
    reason: "Weekend leisure demand is higher",
  },
  {
    item: "Bisi Bele Bath",
    weekdayStrategy: "Quick Lunch Combo",
    weekendStrategy: "Signature Special promotion",
    reason: "Different consumption patterns",
  },
  {
    item: "Mysore Masala Dosa",
    weekdayPrice: "\u20B990",
    weekendPrice: "\u20B9105",
    reason: "Family brunch orders spike on weekends",
  },
]

/* ─── Next 3 Hours Forecast ─── */
const forecastData = {
  rushItem: "Vada items",
  recommendation: "Promote Rasam Vada with Express Delivery",
  reason: "Maintain kitchen flow while increasing average order value",
  timeframe: "Next 3 hours",
  confidence: 87,
}

function getQuadrantBadge(quadrant: string) {
  switch (quadrant) {
    case "Star":
      return (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          Star
        </Badge>
      )
    case "Puzzle":
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          Puzzle
        </Badge>
      )
    case "Plowhorse":
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          Plowhorse
        </Badge>
      )
    case "Dog":
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
          Dog
        </Badge>
      )
    default:
      return null
  }
}

export default function DashboardPage() {
  const [deployedActions, setDeployedActions] = useState<Set<string>>(new Set())
  const [justificationModal, setJustificationModal] = useState<{
    open: boolean
    action: typeof dailyActionPlanCards[0] | null
  }>({ open: false, action: null })
  const [pausedAlerts, setPausedAlerts] = useState<Set<string>>(new Set())

  const handleDeployAction = (actionId: string) => {
    setDeployedActions((prev) => new Set(prev).add(actionId))
  }

  const handleOpenJustification = (action: typeof dailyActionPlanCards[0]) => {
    setJustificationModal({ open: true, action })
  }

  const handlePauseAlert = (alertId: string) => {
    setPausedAlerts((prev) => new Set(prev).add(alertId))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here is what is happening at your restaurant today.</p>
      </div>

      {/* ─── AI Revenue Contribution Card ─── */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-gradient-to-r from-indigo-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                <Sparkles className="h-7 w-7 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">AI Upsell Revenue Today</div>
                <div className="text-3xl font-bold text-indigo-600">{"\u20B9"}1,250</div>
                <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 mt-1">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +18.5% from yesterday
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-xs text-muted-foreground mb-1">Powered by Voice Assistant</div>
              <div className="text-sm text-foreground">47 upsell suggestions accepted</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Daily Action Plan (Manager's Cheat Sheet) ─── */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-foreground">Daily Action Plan</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Actionable business decisions you can approve instantly</p>
            </div>
            <Badge className="bg-[#CF1F2E]/10 text-[#CF1F2E] hover:bg-[#CF1F2E]/20">
              <Sparkles className="mr-1 h-3 w-3" />
              AI Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {dailyActionPlanCards.map((card) => {
              const isDeployed = deployedActions.has(card.id)
              return (
                <Card
                  key={card.id}
                  className={`rounded-xl border transition-all hover:shadow-md ${
                    isDeployed
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
                      : "border-border bg-card"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CF1F2E]/10">
                          {card.id === "wastage-prevention" ? (
                            <Package className="h-5 w-5 text-[#CF1F2E]" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-[#CF1F2E]" />
                          )}
                        </div>
                        <CardTitle className="text-base font-semibold text-foreground">{card.title}</CardTitle>
                      </div>
                      {isDeployed && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          <Check className="mr-1 h-3 w-3" />
                          Deployed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4">
                    {/* Context */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                            Context
                          </div>
                          <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">{card.context}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
                      <div className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wide text-blue-700 dark:text-blue-400">
                            The Action
                          </div>
                          <p className="mt-1 text-sm text-blue-900 dark:text-blue-200 whitespace-pre-line">{card.action}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expected Profit */}
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <div>
                          <div className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                            Expected Profit
                          </div>
                          <p className="mt-1 text-lg font-bold text-emerald-600">{card.expectedProfit}</p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">{card.profitDetail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenJustification(card)}
                      >
                        View AI Reasoning
                      </Button>
                      {isDeployed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2 border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                          disabled
                        >
                          <Check className="h-4 w-4" />
                          Deployed
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 gap-2 bg-[#CF1F2E] hover:bg-[#B01A26] text-white"
                          onClick={() => handleDeployAction(card.id)}
                        >
                          {card.buttonIcon === "send" ? <Send className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                          {card.buttonText}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Smart Inventory Alerts + Next 3 Hours Forecast Row ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Smart Inventory Alerts */}
        <Card className="rounded-xl border border-[#E5E7EB] bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Smart Inventory Alerts</CardTitle>
            <p className="text-sm text-muted-foreground">Prevent selling items when ingredients are running out</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {inventoryAlerts.map((alert) => {
                const isPaused = pausedAlerts.has(alert.id)
                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isPaused
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isPaused ? "bg-emerald-100" : "bg-red-100"
                        }`}>
                          {isPaused ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className={`font-semibold ${isPaused ? "text-emerald-800" : "text-red-800"}`}>
                            {alert.ingredient} stock is {isPaused ? "being managed" : "critically low"} ({alert.stockLevel}%)
                          </div>
                          
                          {!isPaused && (
                            <>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-xs font-medium text-red-700">Pause upselling:</span>
                                {alert.pauseItems.map((item) => (
                                  <Badge key={item} variant="outline" className="border-red-300 text-red-700 bg-white">
                                    <PauseCircle className="mr-1 h-3 w-3" />
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs font-medium text-emerald-700">Promote instead:</span>
                                {alert.promoteItems.map((item) => (
                                  <Badge key={item} variant="outline" className="border-emerald-300 text-emerald-700 bg-white">
                                    <Play className="mr-1 h-3 w-3" />
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                              
                              <p className="mt-2 text-xs text-muted-foreground">
                                <span className="font-medium">Reason:</span> {alert.reason}
                              </p>
                              <p className="text-xs text-emerald-700 font-medium mt-1">
                                Expected benefit: {alert.expectedBenefit}
                              </p>
                            </>
                          )}
                          
                          {isPaused && (
                            <p className="mt-1 text-sm text-emerald-700">
                              Voice Assistant updated. Now promoting {alert.promoteItems.join(", ")} instead.
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {!isPaused && (
                        <Button
                          size="sm"
                          className="shrink-0 bg-[#CF1F2E] hover:bg-[#B01A26] text-white"
                          onClick={() => handlePauseAlert(alert.id)}
                        >
                          <Send className="mr-1 h-3 w-3" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Next 3 Hours Forecast */}
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Next 3 Hours Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                  <Timer className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Rush expected for</div>
                  <div className="text-lg font-bold text-foreground">{forecastData.rushItem}</div>
                </div>
              </div>
              
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-indigo-700">Recommendation</div>
                <p className="mt-1 text-sm font-medium text-indigo-900">{forecastData.recommendation}</p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Purpose:</span> {forecastData.reason}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Confidence Score</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${forecastData.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-indigo-600">{forecastData.confidence}%</span>
                </div>
              </div>
              
              <Button size="sm" className="w-full bg-[#CF1F2E] hover:bg-[#B01A26] text-white">
                <Send className="mr-2 h-4 w-4" />
                Deploy to Voice Assistant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Dynamic Pricing Strategy ─── */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Dynamic Pricing Strategy</CardTitle>
          <p className="text-sm text-muted-foreground">Weekday vs weekend strategy recommendations</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Item</th>
                  <th className="pb-3 font-medium text-muted-foreground">Weekday</th>
                  <th className="pb-3 font-medium text-muted-foreground">Weekend</th>
                  <th className="pb-3 font-medium text-muted-foreground">Reason</th>
                  <th className="pb-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {dynamicPricingData.map((row) => (
                  <tr key={row.item} className="border-b border-[#E5E7EB] last:border-0 hover:bg-slate-50">
                    <td className="py-3 font-medium text-foreground">{row.item}</td>
                    <td className="py-3">
                      {row.weekdayPrice ? (
                        <span className="text-foreground">{row.weekdayPrice}</span>
                      ) : (
                        <Badge variant="outline" className="text-xs">{row.weekdayStrategy}</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      {row.weekendPrice ? (
                        <span className="font-semibold text-emerald-600">{row.weekendPrice}</span>
                      ) : (
                        <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700">{row.weekendStrategy}</Badge>
                      )}
                    </td>
                    <td className="py-3 text-muted-foreground text-xs max-w-[200px]">{row.reason}</td>
                    <td className="py-3">
                      <Button size="sm" variant="outline" className="text-xs">
                        Apply Now
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Top Metric Cards ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.title} className="rounded-xl border border-[#E5E7EB] bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-3 text-3xl font-bold text-foreground">{card.value}</div>
              <div className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {card.change} from yesterday
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-xl border border-[#E5E7EB] bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Peak Order Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={topSellingItems}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {topSellingItems.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-col gap-2">
              {topSellingItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                    <span className="text-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Menu Performance Table ─── */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-foreground">Menu Performance</CardTitle>
          <Button variant="outline" size="sm" className="text-xs">
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Item Name</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground sm:table-cell">Category</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground md:table-cell">Popularity</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground md:table-cell">Margin</th>
                  <th className="pb-3 font-medium text-muted-foreground">Quadrant</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground lg:table-cell">Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.name} className="border-b border-[#E5E7EB] last:border-0 hover:bg-slate-50">
                    <td className="py-3 font-medium text-foreground">{item.name}</td>
                    <td className="hidden py-3 text-muted-foreground sm:table-cell">{item.category}</td>
                    <td className="hidden py-3 md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-slate-100">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${item.popularity}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.popularity}</span>
                      </div>
                    </td>
                    <td className="hidden py-3 text-foreground md:table-cell">{item.margin}%</td>
                    <td className="py-3">{getQuadrantBadge(item.quadrant)}</td>
                    <td className="hidden py-3 lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Lightbulb className="h-3 w-3 shrink-0 text-amber-500" />
                        {item.action}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>



      {/* ─── AI Upselling / Combo Suggestions ─── */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-foreground">AI Upselling Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {comboSuggestions.map((combo, i) => (
              <div key={i} className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Combine className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold text-foreground">{combo.items}</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="text-xs text-muted-foreground">Est. AOV Increase</div>
                    <div className="text-sm font-bold text-emerald-600">{combo.aovIncrease}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Success Prob.</div>
                    <div className="text-sm font-bold text-foreground">{combo.successProb}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── POS Integration Panel ─── */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-foreground">POS Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {posIntegrations.map((pos) => (
              <div key={pos.name} className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  pos.status === "connected"
                    ? "bg-emerald-100"
                    : pos.status === "pending"
                    ? "bg-amber-100"
                    : "bg-slate-100"
                }`}>
                  <Plug className={`h-5 w-5 ${
                    pos.status === "connected"
                      ? "text-emerald-600"
                      : pos.status === "pending"
                      ? "text-amber-600"
                      : "text-slate-500"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{pos.name}</div>
                  <div className="text-xs text-muted-foreground">{pos.lastSync}</div>
                </div>
                {pos.status === "connected" && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                )}
                {pos.status === "pending" && (
                  <Clock className="h-5 w-5 shrink-0 text-amber-500" />
                )}
                {pos.status === "disconnected" && (
                  <XCircle className="h-5 w-5 shrink-0 text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Profit Justification Modal ─── */}
      <Dialog open={justificationModal.open} onOpenChange={(open) => setJustificationModal({ open, action: open ? justificationModal.action : null })}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#CF1F2E]" />
              Profitability Breakdown
            </DialogTitle>
            <DialogDescription>
              AI reasoning behind the recommendation for {justificationModal.action?.title}
            </DialogDescription>
          </DialogHeader>
          
          {justificationModal.action?.justification && (
            <div className="flex flex-col gap-3 py-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-blue-700">Proposed Action</div>
                <p className="mt-1 text-sm text-blue-900">{justificationModal.action.justification.proposedAction}</p>
              </div>
              
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-amber-700">Inventory Status</div>
                <p className="mt-1 text-sm text-amber-900">{justificationModal.action.justification.inventoryStatus}</p>
              </div>
              
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-700">Preparation Time</div>
                <p className="mt-1 text-sm text-slate-900">{justificationModal.action.justification.preparationTime}</p>
              </div>
              
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-indigo-700">Sales Data</div>
                <p className="mt-1 text-sm text-indigo-900">{justificationModal.action.justification.salesData}</p>
              </div>
              
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-emerald-700">Expected Result</div>
                <p className="mt-1 text-sm font-semibold text-emerald-600">{justificationModal.action.justification.expectedResult}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setJustificationModal({ open: false, action: null })}>
              Close
            </Button>
            <Button
              className="bg-[#CF1F2E] hover:bg-[#B01A26] text-white"
              onClick={() => {
                if (justificationModal.action) {
                  handleDeployAction(justificationModal.action.id)
                  setJustificationModal({ open: false, action: null })
                }
              }}
              disabled={justificationModal.action ? deployedActions.has(justificationModal.action.id) : false}
            >
              {justificationModal.action && deployedActions.has(justificationModal.action.id) ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Already Deployed
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Approve & Deploy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
