"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Monitor,
  Truck,
  ChefHat,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plug,
  Settings,
} from "lucide-react"

const posIntegrations = [
  {
    name: "Petpooja POS",
    description: "Primary POS system for order management and billing",
    icon: Monitor,
    status: "connected" as const,
    lastSync: "2 min ago",
    ordersToday: 142,
    syncRate: "99.8%",
  },
  {
    name: "Toast POS",
    description: "Secondary POS for online and delivery orders",
    icon: Monitor,
    status: "pending" as const,
    lastSync: "Setup in progress",
    ordersToday: 0,
    syncRate: "-",
  },
  {
    name: "Square POS",
    description: "Payment processing and inventory management",
    icon: Monitor,
    status: "disconnected" as const,
    lastSync: "Not configured",
    ordersToday: 0,
    syncRate: "-",
  },
]

const deliveryIntegrations = [
  { name: "Swiggy", status: "connected" as const, lastSync: "5 min ago", ordersToday: 38 },
  { name: "Zomato", status: "connected" as const, lastSync: "3 min ago", ordersToday: 45 },
  { name: "Dunzo", status: "disconnected" as const, lastSync: "Never", ordersToday: 0 },
]

const kitchenIntegrations = [
  { name: "Kitchen Display System", status: "connected" as const, lastSync: "1 min ago" },
  { name: "Inventory Tracker", status: "connected" as const, lastSync: "10 min ago" },
  { name: "Staff Scheduler", status: "pending" as const, lastSync: "Setting up" },
]

function StatusBadge({ status }: { status: "connected" | "pending" | "disconnected" }) {
  if (status === "connected") {
    return (
      <Badge variant="secondary" className="bg-[#D1FAE5] text-[#059669] hover:bg-[#D1FAE5]">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Connected
      </Badge>
    )
  }
  if (status === "pending") {
    return (
      <Badge variant="secondary" className="bg-[#FEF3C7] text-[#D97706] hover:bg-[#FEF3C7]">
        <AlertCircle className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="bg-[#F1F5F9] text-[#64748B] hover:bg-[#F1F5F9]">
      <XCircle className="mr-1 h-3 w-3" />
      Disconnected
    </Badge>
  )
}

export default function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations (POS)</h1>
        <p className="text-sm text-muted-foreground">Manage your POS systems, delivery platforms, and kitchen integrations.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Integrations</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D1FAE5]">
                <Plug className="h-4 w-4 text-[#059669]" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">5</div>
            <div className="mt-1 text-xs text-muted-foreground">Systems connected</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Setup</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF3C7]">
                <Clock className="h-4 w-4 text-[#D97706]" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">2</div>
            <div className="mt-1 text-xs text-muted-foreground">Awaiting configuration</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sync Success Rate</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9]">
                <RefreshCw className="h-4 w-4 text-[#475569]" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">99.8%</div>
            <div className="mt-1 text-xs text-muted-foreground">Last 24 hours</div>
          </CardContent>
        </Card>
      </div>

      {/* POS Systems */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F1F5F9]">
              <Settings className="h-5 w-5 text-[#475569]" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">POS Systems</CardTitle>
              <CardDescription>Point of Sale integrations for order management</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {posIntegrations.map((pos) => (
              <div key={pos.name} className="flex items-center gap-4 rounded-xl border border-border p-5 hover:bg-[#F8FAFC] transition-colors">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  pos.status === "connected" ? "bg-[#D1FAE5]" : pos.status === "pending" ? "bg-[#FEF3C7]" : "bg-[#F1F5F9]"
                }`}>
                  <pos.icon className={`h-6 w-6 ${
                    pos.status === "connected" ? "text-[#059669]" : pos.status === "pending" ? "text-[#D97706]" : "text-[#64748B]"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{pos.name}</div>
                  <div className="text-xs text-muted-foreground">{pos.description}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    {pos.status === "connected" ? (
                      <Wifi className="h-3 w-3 text-success" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span>Last sync: {pos.lastSync}</span>
                    {pos.ordersToday > 0 && <span>{pos.ordersToday} orders today</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={pos.status} />
                  {pos.status === "connected" && (
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="sr-only">Refresh sync</span>
                    </Button>
                  )}
                  {pos.status === "disconnected" && (
                    <Button size="sm" variant="outline">Connect</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Platforms */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF3C7]">
              <Truck className="h-5 w-5 text-[#D97706]" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Delivery Platforms</CardTitle>
              <CardDescription>Third-party delivery service integrations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {deliveryIntegrations.map((d) => (
              <div key={d.name} className="flex items-center gap-4 rounded-xl border border-border p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  d.status === "connected" ? "bg-[#D1FAE5]" : "bg-[#F1F5F9]"
                }`}>
                  <Truck className={`h-5 w-5 ${
                    d.status === "connected" ? "text-[#059669]" : "text-[#64748B]"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.status === "connected" ? `${d.ordersToday} orders today` : "Not connected"}
                  </div>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kitchen Systems */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D1FAE5]">
              <ChefHat className="h-5 w-5 text-[#059669]" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Kitchen Systems</CardTitle>
              <CardDescription>Kitchen display and operations management</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {kitchenIntegrations.map((k) => (
              <div key={k.name} className="flex items-center gap-4 rounded-xl border border-border p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  k.status === "connected" ? "bg-[#D1FAE5]" : "bg-[#FEF3C7]"
                }`}>
                  <ChefHat className={`h-5 w-5 ${
                    k.status === "connected" ? "text-[#059669]" : "text-[#D97706]"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">{k.name}</div>
                  <div className="text-xs text-muted-foreground">Last sync: {k.lastSync}</div>
                </div>
                <StatusBadge status={k.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
