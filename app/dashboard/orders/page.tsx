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
  User,
  MapPin,
  FileText,
  X,
  ChevronRight,
  Download,
} from "lucide-react"

type OrderSource = "User" | "Call Order" | "Dine-in" | "Zomato" | "Swiggy"
type OrderStatus = "Pending" | "Preparing" | "Ready" | "Delivered"

interface OrderItem {
  item_code: string
  item_name: string
  qty: number
  unit_price: number
  line_total: number
}

interface Order {
  id: string
  source: OrderSource
  customerName: string
  customerPhone?: string
  deliveryAddress?: string
  status: OrderStatus
  totalAmount: string
  time: string
  items: string[]
  orderItems: OrderItem[]
  specialInstructions: string | null
  deliveryType: string
  rating: number | null
}

// Orders from orders_rows.csv + order_items_rows.csv + call_logs_rows.csv
const orders: Order[] = [
  // === Call Orders (from CSV data — voice assistant orders) ===
  {
    id: "ORD-C7A835",
    source: "Call Order",
    customerName: "Anonymous",
    status: "Delivered",
    totalAmount: "\u20B950",
    time: "5:18 PM",
    deliveryType: "Takeout",
    rating: 3,
    items: ["1x Authentic Filter Coffee"],
    orderItems: [
      { item_code: "B01", item_name: "Authentic Filter Coffee", qty: 1, unit_price: 50, line_total: 50 },
    ],
    specialInstructions: null,
  },
  {
    id: "ORD-84EFDE",
    source: "Call Order",
    customerName: "Anonymous",
    status: "Delivered",
    totalAmount: "\u20B950",
    time: "5:38 PM",
    deliveryType: "Takeout",
    rating: 10,
    items: ["1x Authentic Filter Coffee"],
    orderItems: [
      { item_code: "B01", item_name: "Authentic Filter Coffee", qty: 1, unit_price: 50, line_total: 50 },
    ],
    specialInstructions: null,
  },
  {
    id: "ORD-635412",
    source: "Call Order",
    customerName: "Anonymous",
    status: "Delivered",
    totalAmount: "\u20B9110",
    time: "6:27 PM",
    deliveryType: "Takeout",
    rating: 4,
    items: ["1x Steamed Idli (2 pieces)", "1x Authentic Filter Coffee"],
    orderItems: [
      { item_code: "I01", item_name: "Steamed Idli (2 pieces)", qty: 1, unit_price: 60, line_total: 60 },
      { item_code: "B01", item_name: "Authentic Filter Coffee", qty: 1, unit_price: 50, line_total: 50 },
    ],
    specialInstructions: null,
  },
  {
    id: "ORD-D12152",
    source: "Call Order",
    customerName: "Anonymous",
    status: "Delivered",
    totalAmount: "\u20B9170",
    time: "7:03 PM",
    deliveryType: "Takeout",
    rating: 5,
    items: ["1x Authentic Filter Coffee", "1x Steamed Idli (2 pieces)", "1x Sweet Kesari Bath"],
    orderItems: [
      { item_code: "B01", item_name: "Authentic Filter Coffee", qty: 1, unit_price: 50, line_total: 50 },
      { item_code: "I01", item_name: "Steamed Idli (2 pieces)", qty: 1, unit_price: 60, line_total: 60 },
      { item_code: "B02", item_name: "Sweet Kesari Bath", qty: 1, unit_price: 60, line_total: 60 },
    ],
    specialInstructions: null,
  },
  {
    id: "ORD-F207A9",
    source: "Call Order",
    customerName: "Anonymous",
    status: "Delivered",
    totalAmount: "\u20B990",
    time: "7:13 PM",
    deliveryType: "Takeout",
    rating: 4,
    items: ["1x Mysore Masala Dosa"],
    orderItems: [
      { item_code: "D03", item_name: "Mysore Masala Dosa", qty: 1, unit_price: 90, line_total: 90 },
    ],
    specialInstructions: null,
  },
  {
    id: "ORD-BF4CE3",
    source: "Call Order",
    customerName: "Anonymous",
    status: "Delivered",
    totalAmount: "\u20B9110",
    time: "6:09 AM",
    deliveryType: "Takeout",
    rating: 5,
    items: ["1x Steamed Idli (2 pieces)", "1x Authentic Filter Coffee"],
    orderItems: [
      { item_code: "I01", item_name: "Steamed Idli (2 pieces)", qty: 1, unit_price: 60, line_total: 60 },
      { item_code: "B01", item_name: "Authentic Filter Coffee", qty: 1, unit_price: 50, line_total: 50 },
    ],
    specialInstructions: null,
  },
  // === User Orders (walk-in / direct) ===
  {
    id: "ORD-D94C18",
    source: "User",
    customerName: "Anonymous",
    status: "Delivered",
    totalAmount: "\u20B960",
    time: "8:50 PM",
    deliveryType: "Takeout",
    rating: 4,
    items: ["1x Sweet Kesari Bath"],
    orderItems: [
      { item_code: "B02", item_name: "Sweet Kesari Bath", qty: 1, unit_price: 60, line_total: 60 },
    ],
    specialInstructions: null,
  },
  {
    id: "ORD-3A7F12",
    source: "User",
    customerName: "Anonymous",
    status: "Preparing",
    totalAmount: "\u20B9140",
    time: "9:05 PM",
    deliveryType: "Takeout",
    rating: null,
    items: ["1x Mysore Masala Dosa", "1x Authentic Filter Coffee"],
    orderItems: [
      { item_code: "D03", item_name: "Mysore Masala Dosa", qty: 1, unit_price: 90, line_total: 90 },
      { item_code: "B01", item_name: "Authentic Filter Coffee", qty: 1, unit_price: 50, line_total: 50 },
    ],
    specialInstructions: null,
  },
  // === Swiggy Orders ===
  {
    id: "ORD-A19B3C",
    source: "Swiggy",
    customerName: "Swiggy Order",
    status: "Preparing",
    totalAmount: "\u20B9200",
    time: "7:45 PM",
    deliveryType: "Delivery",
    rating: null,
    items: ["2x Steamed Idli (2 pieces)", "1x Mysore Masala Dosa"],
    orderItems: [
      { item_code: "I01", item_name: "Steamed Idli (2 pieces)", qty: 2, unit_price: 60, line_total: 120 },
      { item_code: "D03", item_name: "Mysore Masala Dosa", qty: 1, unit_price: 80, line_total: 80 },
    ],
    specialInstructions: "Extra chutney please",
  },
  {
    id: "ORD-B83E41",
    source: "Swiggy",
    customerName: "Swiggy Order",
    status: "Delivered",
    totalAmount: "\u20B9120",
    time: "8:20 PM",
    deliveryType: "Delivery",
    rating: 5,
    items: ["1x Steamed Idli (2 pieces)", "1x Sweet Kesari Bath"],
    orderItems: [
      { item_code: "I01", item_name: "Steamed Idli (2 pieces)", qty: 1, unit_price: 60, line_total: 60 },
      { item_code: "B02", item_name: "Sweet Kesari Bath", qty: 1, unit_price: 60, line_total: 60 },
    ],
    specialInstructions: null,
  },
  {
    id: "ORD-FC8912",
    source: "Swiggy",
    customerName: "Swiggy Order",
    status: "Pending",
    totalAmount: "\u20B950",
    time: "9:10 PM",
    deliveryType: "Delivery",
    rating: null,
    items: ["1x Authentic Filter Coffee"],
    orderItems: [
      { item_code: "B01", item_name: "Authentic Filter Coffee", qty: 1, unit_price: 50, line_total: 50 },
    ],
    specialInstructions: null,
  },
  // === Zomato Orders ===
  {
    id: "ORD-E52F7D",
    source: "Zomato",
    customerName: "Zomato Order",
    status: "Pending",
    totalAmount: "\u20B9150",
    time: "8:02 PM",
    deliveryType: "Delivery",
    rating: null,
    items: ["1x Mysore Masala Dosa", "1x Sweet Kesari Bath"],
    orderItems: [
      { item_code: "D03", item_name: "Mysore Masala Dosa", qty: 1, unit_price: 90, line_total: 90 },
      { item_code: "B02", item_name: "Sweet Kesari Bath", qty: 1, unit_price: 60, line_total: 60 },
    ],
    specialInstructions: "No onion",
  },
  {
    id: "ORD-7F29AC",
    source: "Zomato",
    customerName: "Zomato Order",
    status: "Ready",
    totalAmount: "\u20B9260",
    time: "8:35 PM",
    deliveryType: "Delivery",
    rating: null,
    items: ["2x Authentic Filter Coffee", "1x Mysore Masala Dosa", "1x Sweet Kesari Bath"],
    orderItems: [
      { item_code: "B01", item_name: "Authentic Filter Coffee", qty: 2, unit_price: 50, line_total: 100 },
      { item_code: "D03", item_name: "Mysore Masala Dosa", qty: 1, unit_price: 90, line_total: 90 },
      { item_code: "B02", item_name: "Sweet Kesari Bath", qty: 1, unit_price: 70, line_total: 70 },
    ],
    specialInstructions: null,
  },
  {
    id: "ORD-2B91D6",
    source: "Zomato",
    customerName: "Zomato Order",
    status: "Delivered",
    totalAmount: "\u20B9110",
    time: "9:15 PM",
    deliveryType: "Delivery",
    rating: 4,
    items: ["1x Steamed Idli (2 pieces)", "1x Authentic Filter Coffee"],
    orderItems: [
      { item_code: "I01", item_name: "Steamed Idli (2 pieces)", qty: 1, unit_price: 60, line_total: 60 },
      { item_code: "B01", item_name: "Authentic Filter Coffee", qty: 1, unit_price: 50, line_total: 50 },
    ],
    specialInstructions: null,
  },
  // === Dine-in Orders ===
  {
    id: "ORD-8E3C47",
    source: "Dine-in",
    customerName: "Dine-in Guest",
    status: "Delivered",
    totalAmount: "\u20B990",
    time: "7:13 PM",
    deliveryType: "Dine-in",
    rating: 4,
    items: ["1x Mysore Masala Dosa"],
    orderItems: [
      { item_code: "D03", item_name: "Mysore Masala Dosa", qty: 1, unit_price: 90, line_total: 90 },
    ],
    specialInstructions: null,
  },
  {
    id: "ORD-5D14A8",
    source: "Dine-in",
    customerName: "Dine-in Guest",
    status: "Ready",
    totalAmount: "\u20B9170",
    time: "8:45 PM",
    deliveryType: "Dine-in",
    rating: null,
    items: ["1x Authentic Filter Coffee", "1x Steamed Idli (2 pieces)", "1x Sweet Kesari Bath"],
    orderItems: [
      { item_code: "B01", item_name: "Authentic Filter Coffee", qty: 1, unit_price: 50, line_total: 50 },
      { item_code: "I01", item_name: "Steamed Idli (2 pieces)", qty: 1, unit_price: 60, line_total: 60 },
      { item_code: "B02", item_name: "Sweet Kesari Bath", qty: 1, unit_price: 60, line_total: 60 },
    ],
    specialInstructions: null,
  },
]

function getSourceBadgeStyle(source: OrderSource) {
  switch (source) {
    case "User":
      return "bg-blue-100 text-blue-700"
    case "Zomato":
      return "bg-red-100 text-red-700"
    case "Swiggy":
      return "bg-orange-100 text-orange-700"
    case "Dine-in":
      return "bg-slate-100 text-slate-700"
    case "Call Order":
      return "bg-purple-100 text-purple-700"
  }
}

function getSourceIcon(source: OrderSource) {
  switch (source) {
    case "User":
      return <User className="h-3.5 w-3.5" />
    case "Zomato":
    case "Swiggy":
      return <Truck className="h-3.5 w-3.5" />
    case "Dine-in":
      return <UtensilsCrossed className="h-3.5 w-3.5" />
    case "Call Order":
      return <Phone className="h-3.5 w-3.5" />
  }
}

function getStatusBadgeStyle(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "bg-amber-100 text-amber-700"
    case "Preparing":
      return "bg-blue-100 text-blue-700"
    case "Ready":
      return "bg-emerald-100 text-emerald-700"
    case "Delivered":
      return "bg-slate-100 text-slate-600"
  }
}

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [sourceFilter, setSourceFilter] = useState<"All" | OrderSource>("All")

  const statusOrder: Record<OrderStatus, number> = { Pending: 0, Preparing: 1, Ready: 2, Delivered: 3 }
  const filteredOrders = (sourceFilter === "All" 
    ? orders 
    : orders.filter((o) => o.source === sourceFilter)
  ).sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all orders from voice, delivery platforms, and dine-in.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Source Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(["All", "User", "Call Order", "Dine-in", "Zomato", "Swiggy"] as const).map((src) => (
          <button
            key={src}
            onClick={() => setSourceFilter(src)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              sourceFilter === src
                ? "bg-[#8B0000] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {src}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-foreground">
            {filteredOrders.length} Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No orders found</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                No orders match your current filter. Try selecting a different source.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Order ID</th>
                    <th className="pb-3 font-medium text-muted-foreground">Source</th>
                    <th className="hidden pb-3 font-medium text-muted-foreground sm:table-cell">Customer</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="hidden pb-3 font-medium text-muted-foreground md:table-cell">Amount</th>
                    <th className="hidden pb-3 font-medium text-muted-foreground lg:table-cell">Time</th>
                    <th className="pb-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="border-b border-[#E5E7EB] last:border-0 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-4 font-mono font-medium text-foreground">{order.id}</td>
                      <td className="py-4">
                        <Badge variant="secondary" className={`text-xs gap-1 ${getSourceBadgeStyle(order.source)}`}>
                          {getSourceIcon(order.source)}
                          {order.source}
                        </Badge>
                      </td>
                      <td className="hidden py-4 text-foreground sm:table-cell">{order.customerName}</td>
                      <td className="py-4">
                        <Badge variant="secondary" className={`text-xs ${getStatusBadgeStyle(order.status)}`}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="hidden py-4 font-medium text-foreground md:table-cell">{order.totalAmount}</td>
                      <td className="hidden py-4 text-muted-foreground lg:table-cell">{order.time}</td>
                      <td className="py-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOrder(order)
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
                <Badge variant="secondary" className={`mt-1 text-xs gap-1 ${getSourceBadgeStyle(selectedOrder.source)}`}>
                  {getSourceIcon(selectedOrder.source)}
                  {selectedOrder.source}
                </Badge>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Customer Details</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{selectedOrder.customerName}</span>
                </div>
                {selectedOrder.customerPhone && (
                  <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedOrder.customerPhone}</span>
                  </div>
                )}
                {selectedOrder.deliveryAddress && (
                  <div className="flex items-start gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-foreground">{selectedOrder.deliveryAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Order Items</h3>
              <div className="flex flex-col gap-2">
                {selectedOrder.orderItems.map((item) => (
                  <div key={item.item_code} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-4 py-3">
                    <span className="text-sm text-foreground">{item.qty}x {item.item_name}</span>
                    <span className="text-sm font-medium text-foreground">{"\u20B9"}{item.line_total}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#E5E7EB] pt-3">
                <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                <span className="text-lg font-bold text-foreground">{selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Delivery Type & Rating */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Order Info</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-4 py-3">
                  <span className="text-sm text-muted-foreground">Delivery Type</span>
                  <Badge variant="secondary" className="text-xs capitalize">{selectedOrder.deliveryType}</Badge>
                </div>
                {selectedOrder.rating !== null && (
                  <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-4 py-3">
                    <span className="text-sm text-muted-foreground">Customer Rating</span>
                    <span className="text-sm font-semibold text-foreground">{selectedOrder.rating}/5</span>
                  </div>
                )}
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
                  Instructions: NA
                </div>
              )}
            </div>

            {/* Order Status */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Order Status</h3>
              <Badge variant="secondary" className={`text-sm px-4 py-2 ${getStatusBadgeStyle(selectedOrder.status)}`}>
                {selectedOrder.status}
              </Badge>
            </div>


          </div>
        </div>
      )}
    </div>
  )
}
