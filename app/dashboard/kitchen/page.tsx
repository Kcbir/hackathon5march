"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Phone,
  Truck,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  ChevronRight,
  X,
  MapPin,
  Volume2,
  ChefHat,
  AlertCircle,
} from "lucide-react"

interface KitchenOrder {
  id: string
  items: { name: string; qty: number; notes?: string }[]
  source: "Call" | "Third Party" | "Dine-in"
  platform?: string
  status: "pending" | "preparing" | "ready"
  time: string
  specialInstructions: string | null
  customerPhone?: string
  customerAddress?: string
  hasCallLog?: boolean
  transcriptModifications?: string[]
}

const kitchenOrders: KitchenOrder[] = [
  {
    id: "KOT-1045",
    items: [
      { name: "Mysore Masala Dosa", qty: 2, notes: "Extra chutney" },
      { name: "Crispy Medu Vada", qty: 2 },
      { name: "Authentic Filter Coffee", qty: 2 },
    ],
    source: "Call",
    status: "pending",
    time: "2 min ago",
    specialInstructions: "Extra crispy dosa",
    customerPhone: "+91 98765 43210",
    customerAddress: "45, MG Road, Koramangala, Bangalore",
    hasCallLog: true,
    transcriptModifications: ["EXTRA CHUTNEY", "CRISPY DOSA", "STRONG COFFEE"],
  },
  {
    id: "KOT-1044",
    items: [
      { name: "Bisi Bele Bath", qty: 1 },
      { name: "Curd Rice", qty: 1 },
      { name: "Sweet Kesari Bath", qty: 1 },
    ],
    source: "Third Party",
    platform: "Zomato",
    status: "pending",
    time: "5 min ago",
    specialInstructions: null,
    customerAddress: "HSR Layout, Sector 2",
  },
  {
    id: "KOT-1043",
    items: [
      { name: "Ghee Roast Dosa", qty: 2 },
      { name: "Steamed Idli", qty: 2 },
    ],
    source: "Dine-in",
    status: "preparing",
    time: "8 min ago",
    specialInstructions: "Table 5",
    transcriptModifications: ["EXTRA GHEE", "EXTRA SAMBAR"],
  },
  {
    id: "KOT-1042",
    items: [
      { name: "Classic Masala Dosa", qty: 3 },
      { name: "Authentic Filter Coffee", qty: 3 },
    ],
    source: "Call",
    status: "preparing",
    time: "12 min ago",
    specialInstructions: null,
    customerPhone: "+91 87654 32109",
    customerAddress: "Indiranagar, 100ft Road",
    hasCallLog: true,
    transcriptModifications: ["CRISPY DOSA", "STRONG COFFEE"],
  },
  {
    id: "KOT-1041",
    items: [
      { name: "Rava Dosa", qty: 2 },
      { name: "Rasam Vada", qty: 2 },
    ],
    source: "Third Party",
    platform: "Swiggy",
    status: "ready",
    time: "18 min ago",
    specialInstructions: "Pack separately",
    customerAddress: "BTM Layout, 1st Stage",
  },
  {
    id: "KOT-1040",
    items: [
      { name: "Ven Pongal", qty: 2 },
      { name: "Mini Ghee Idli", qty: 1 },
    ],
    source: "Dine-in",
    status: "ready",
    time: "22 min ago",
    specialInstructions: "Table 8 - Extra sambar",
    transcriptModifications: ["EXTRA SAMBAR", "EXTRA COCONUT CHUTNEY"],
  },
]

function getSourceIcon(source: KitchenOrder["source"]) {
  switch (source) {
    case "Call":
      return <Phone className="h-4 w-4" />
    case "Third Party":
      return <Truck className="h-4 w-4" />
    case "Dine-in":
      return <UtensilsCrossed className="h-4 w-4" />
  }
}

function getSourceBadgeStyle(source: KitchenOrder["source"], platform?: string) {
  if (source === "Call") return "bg-blue-100 text-blue-700"
  if (source === "Third Party") {
    if (platform === "Zomato") return "bg-red-100 text-red-700"
    if (platform === "Swiggy") return "bg-orange-100 text-orange-700"
    return "bg-purple-100 text-purple-700"
  }
  return "bg-slate-100 text-slate-700"
}

function getStatusColor(status: KitchenOrder["status"]) {
  switch (status) {
    case "pending":
      return "bg-amber-500"
    case "preparing":
      return "bg-blue-500"
    case "ready":
      return "bg-emerald-500"
  }
}

export default function KitchenOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null)
  const [chefViewMode, setChefViewMode] = useState(false)

  const pending = kitchenOrders.filter((o) => o.status === "pending")
  const preparing = kitchenOrders.filter((o) => o.status === "preparing")
  const ready = kitchenOrders.filter((o) => o.status === "ready")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kitchen Orders</h1>
          <p className="text-sm text-muted-foreground">
            Real-time kitchen order tickets with preparation status tracking.
          </p>
        </div>
        <Button 
          variant={chefViewMode ? "default" : "outline"} 
          size="sm" 
          className={`gap-2 ${chefViewMode ? "bg-[#8B0000] hover:bg-[#6B0000]" : ""}`}
          onClick={() => setChefViewMode(!chefViewMode)}
        >
          <ChefHat className="h-4 w-4" />
          Chef View Mode
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{pending.length}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <UtensilsCrossed className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{preparing.length}</div>
                <div className="text-sm text-muted-foreground">Preparing</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{ready.length}</div>
                <div className="text-sm text-muted-foreground">Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Kanban */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending Column */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-sm font-semibold text-foreground">Pending</span>
            <Badge variant="secondary" className="ml-auto">{pending.length}</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {pending.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm font-semibold text-foreground">{order.id}</span>
                  <Badge variant="secondary" className={`text-xs ${getSourceBadgeStyle(order.source, order.platform)}`}>
                    {getSourceIcon(order.source)}
                    <span className="ml-1">{order.platform || order.source}</span>
                  </Badge>
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  {order.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.qty}x {item.name}</span>
                      {item.notes && <span className="text-xs text-amber-600">{item.notes}</span>}
                    </div>
                  ))}
                </div>
                {order.specialInstructions && !chefViewMode && (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <strong>Instructions:</strong> {order.specialInstructions}
                  </div>
                )}
                {!order.specialInstructions && !chefViewMode && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    Instructions: NA
                  </div>
                )}
                {/* Transcript Summary / Chef View Mode Tags */}
                {order.transcriptModifications && order.transcriptModifications.length > 0 && (
                  <div className={`mt-3 ${chefViewMode ? "p-2 rounded-lg bg-red-50 border border-red-200" : ""}`}>
                    {chefViewMode && (
                      <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-red-700">
                        <AlertCircle className="h-3 w-3" />
                        Modifications
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {order.transcriptModifications.map((mod) => (
                        <span
                          key={mod}
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            chefViewMode
                              ? "bg-red-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{order.time}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preparing Column */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-foreground">Preparing</span>
            <Badge variant="secondary" className="ml-auto">{preparing.length}</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {preparing.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm font-semibold text-foreground">{order.id}</span>
                  <Badge variant="secondary" className={`text-xs ${getSourceBadgeStyle(order.source, order.platform)}`}>
                    {getSourceIcon(order.source)}
                    <span className="ml-1">{order.platform || order.source}</span>
                  </Badge>
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  {order.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.qty}x {item.name}</span>
                      {item.notes && <span className="text-xs text-amber-600">{item.notes}</span>}
                    </div>
                  ))}
                </div>
                {order.specialInstructions && !chefViewMode && (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <strong>Instructions:</strong> {order.specialInstructions}
                  </div>
                )}
                {!order.specialInstructions && !chefViewMode && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    Instructions: NA
                  </div>
                )}
                {/* Transcript Summary / Chef View Mode Tags */}
                {order.transcriptModifications && order.transcriptModifications.length > 0 && (
                  <div className={`mt-3 ${chefViewMode ? "p-2 rounded-lg bg-red-50 border border-red-200" : ""}`}>
                    {chefViewMode && (
                      <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-red-700">
                        <AlertCircle className="h-3 w-3" />
                        Modifications
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {order.transcriptModifications.map((mod) => (
                        <span
                          key={mod}
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            chefViewMode
                              ? "bg-red-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{order.time}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ready Column */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-sm font-semibold text-foreground">Ready</span>
            <Badge variant="secondary" className="ml-auto">{ready.length}</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {ready.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-sm font-semibold text-foreground">{order.id}</span>
                  <Badge variant="secondary" className={`text-xs ${getSourceBadgeStyle(order.source, order.platform)}`}>
                    {getSourceIcon(order.source)}
                    <span className="ml-1">{order.platform || order.source}</span>
                  </Badge>
                </div>
                <div className="mt-3 flex flex-col gap-1">
                  {order.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.qty}x {item.name}</span>
                      {item.notes && <span className="text-xs text-amber-600">{item.notes}</span>}
                    </div>
                  ))}
                </div>
                {order.specialInstructions && !chefViewMode && (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <strong>Instructions:</strong> {order.specialInstructions}
                  </div>
                )}
                {!order.specialInstructions && !chefViewMode && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    Instructions: NA
                  </div>
                )}
                {/* Transcript Summary / Chef View Mode Tags */}
                {order.transcriptModifications && order.transcriptModifications.length > 0 && (
                  <div className={`mt-3 ${chefViewMode ? "p-2 rounded-lg bg-red-50 border border-red-200" : ""}`}>
                    {chefViewMode && (
                      <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-red-700">
                        <AlertCircle className="h-3 w-3" />
                        Modifications
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {order.transcriptModifications.map((mod) => (
                        <span
                          key={mod}
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            chefViewMode
                              ? "bg-red-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{order.time}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order Detail Side Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSelectedOrder(null)}>
          <div
            className="h-full w-full max-w-md bg-white p-6 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedOrder.id}</h2>
                <Badge variant="secondary" className={`mt-1 text-xs ${getSourceBadgeStyle(selectedOrder.source, selectedOrder.platform)}`}>
                  {selectedOrder.platform || selectedOrder.source}
                </Badge>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Order Items</h3>
              <div className="flex flex-col gap-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-4 py-3">
                    <span className="font-medium text-foreground">{item.qty}x {item.name}</span>
                    {item.notes && <span className="text-xs text-amber-600">{item.notes}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Special Instructions</h3>
              {selectedOrder.specialInstructions ? (
                <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {selectedOrder.specialInstructions}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  NA
                </div>
              )}
            </div>

            {/* Transcript Summary */}
            {selectedOrder.transcriptModifications && selectedOrder.transcriptModifications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Transcript Summary</h3>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    Key Modifications from Voice Call
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.transcriptModifications.map((mod) => (
                      <span
                        key={mod}
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Details */}
            {(selectedOrder.customerPhone || selectedOrder.customerAddress) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Customer Details</h3>
                <div className="flex flex-col gap-3">
                  {selectedOrder.customerPhone && (
                    <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedOrder.customerPhone}</span>
                    </div>
                  )}
                  {selectedOrder.customerAddress && (
                    <div className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-foreground">{selectedOrder.customerAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Call Log for Voice Orders */}
            {selectedOrder.hasCallLog && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Call Log</h3>
                <div className="rounded-lg border border-[#E5E7EB] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Volume2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Voice Recording</div>
                      <div className="text-xs text-muted-foreground">Duration: 1:24</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Volume2 className="h-4 w-4" />
                    Play Audio
                  </Button>
                  <div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Transcript Preview</div>
                    <p className="text-sm text-foreground leading-relaxed">
                      Customer: "Hello, I want to order 2 Mysore Masala Dosa with extra chutney and 2 Medu Vada..."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1" variant="outline">
                Print KOT
              </Button>
              <Button className="flex-1">
                Mark Ready
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
