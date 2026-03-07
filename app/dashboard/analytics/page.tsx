"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  DollarSign,
  ShoppingCart,
  Users,
  Bot,
  Phone,
  Utensils,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const weeklyRevenue = [
  { day: "Mon", revenue: 18500, orders: 42 },
  { day: "Tue", revenue: 22000, orders: 51 },
  { day: "Wed", revenue: 19800, orders: 46 },
  { day: "Thu", revenue: 24500, orders: 58 },
  { day: "Fri", revenue: 31200, orders: 72 },
  { day: "Sat", revenue: 38000, orders: 88 },
  { day: "Sun", revenue: 35500, orders: 82 },
]

const monthlyAOV = [
  { week: "Week 1", aov: 340 },
  { week: "Week 2", aov: 355 },
  { week: "Week 3", aov: 370 },
  { week: "Week 4", aov: 385 },
]

const orderSources = [
  { name: "Voice Assistant", value: 35, color: "#10B981" },
  { name: "App/Online", value: 40, color: "#3B82F6" },
  { name: "Walk-in POS", value: 25, color: "#64748B" },
]

const upsellPerformance = [
  { week: "W1", suggested: 120, accepted: 38 },
  { week: "W2", suggested: 135, accepted: 48 },
  { week: "W3", suggested: 148, accepted: 52 },
  { week: "W4", suggested: 160, accepted: 58 },
]

const topPerformers = [
  { name: "Mysore Masala Dosa", revenue: "\u20B912,780", orders: 142, trend: "up" },
  { name: "Ghee Roast Dosa", revenue: "\u20B910,620", orders: 118, trend: "up" },
  { name: "Bisi Bele Bath", revenue: "\u20B97,600", orders: 95, trend: "up" },
  { name: "Steamed Idli", revenue: "\u20B911,280", orders: 188, trend: "down" },
  { name: "Crispy Medu Vada", revenue: "\u20B94,320", orders: 72, trend: "up" },
]

const kpis = [
  { title: "Total Revenue (Week)", value: "\u20B91,89,500", change: "+14.2%", icon: DollarSign, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", positive: true },
  { title: "Total Orders", value: "439", change: "+18.5%", icon: ShoppingCart, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", positive: true },
  { title: "Unique Customers", value: "312", change: "+9.8%", icon: Users, iconBg: "bg-indigo-100", iconColor: "text-indigo-600", positive: true },
  { title: "AI Revenue Contribution", value: "\u20B932,400", change: "+24.1%", icon: Bot, iconBg: "bg-indigo-100", iconColor: "text-indigo-600", positive: true },
  { title: "Voice Orders", value: "154", change: "+15.3%", icon: Phone, iconBg: "bg-slate-100", iconColor: "text-slate-600", positive: true },
  { title: "Avg Prep Time", value: "18 min", change: "-2.1 min", icon: Utensils, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", positive: true },
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Comprehensive performance analytics for your restaurant operations.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="rounded-xl border border-slate-100 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{kpi.title}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${kpi.iconBg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {kpi.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Revenue */}
        <Card className="rounded-xl border border-slate-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyRevenue}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} tickFormatter={(v) => `\u20B9${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`\u20B9${value.toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AOV Trend */}
        <Card className="rounded-xl border border-slate-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Average Order Value Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyAOV}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} domain={[300, 420]} tickFormatter={(v) => `\u20B9${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`\u20B9${value}`, "AOV"]}
                />
                <Line type="monotone" dataKey="aov" stroke="#F59E0B" strokeWidth={2.5} dot={{ fill: "#F59E0B", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Source Distribution */}
        <Card className="rounded-xl border border-slate-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Order Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={orderSources} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {orderSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {orderSources.map((source) => (
                  <div key={source.name} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <div>
                      <div className="text-sm font-medium text-foreground">{source.name}</div>
                      <div className="text-xs text-muted-foreground">{source.value}% of orders</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upsell Performance */}
        <Card className="rounded-xl border border-slate-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base text-foreground">AI Upsell Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={upsellPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="suggested" fill="#F1F5F9" radius={[4, 4, 0, 0]} name="Suggested" />
                <Bar dataKey="accepted" fill="#10B981" radius={[4, 4, 0, 0]} name="Accepted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Items */}
      <Card className="rounded-xl border border-slate-100 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Top Performing Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Item</th>
                  <th className="pb-3 font-medium text-muted-foreground">Revenue</th>
                  <th className="pb-3 font-medium text-muted-foreground">Orders</th>
                  <th className="pb-3 font-medium text-muted-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((item) => (
                  <tr key={item.name} className="border-b border-border last:border-0 hover:bg-[#F8FAFC]">
                    <td className="py-3 font-medium text-foreground">{item.name}</td>
                    <td className="py-3 font-medium text-foreground">{item.revenue}</td>
                    <td className="py-3 text-muted-foreground">{item.orders}</td>
                    <td className="py-3">
                      {item.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-[#10B981]" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-[#F59E0B]" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
