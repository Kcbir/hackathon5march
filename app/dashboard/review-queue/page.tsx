"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  XCircle,
  Clock,
  ChevronRight,
  X,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────
interface MenuItem {
  code: string
  name: string
  price: number
  category: string
}

interface ReviewItem {
  id: number
  orderId: string
  originalUtterance: string
  proposedCode: string | null
  proposedName: string | null
  confidence: number
  method: string
  reason: string
  timestamp: string
  status: "pending" | "approved" | "corrected" | "rejected"
  resolvedCode?: string
  resolvedName?: string
}

// ─── Menu data for correction dropdown ──────────────────────
const MENU_ITEMS: MenuItem[] = [
  { code: "I01", name: "Steamed Idli (2 pcs)", price: 60, category: "Idlis" },
  { code: "I02", name: "Mini Ghee Idli (14 pcs)", price: 80, category: "Idlis" },
  { code: "I03", name: "Thatte Idli", price: 70, category: "Idlis" },
  { code: "D01", name: "Classic Masala Dosa", price: 70, category: "Dosa" },
  { code: "D02", name: "Ghee Roast Dosa", price: 90, category: "Dosa" },
  { code: "D03", name: "Mysore Masala Dosa", price: 90, category: "Dosa" },
  { code: "D04", name: "Rava Dosa", price: 80, category: "Dosa" },
  { code: "V01", name: "Crispy Medu Vada (2 pcs)", price: 60, category: "Vadas" },
  { code: "V02", name: "Rasam Vada", price: 70, category: "Vadas" },
  { code: "R01", name: "Ven Pongal", price: 70, category: "Rice & Meals" },
  { code: "R02", name: "Bisi Bele Bath", price: 80, category: "Rice & Meals" },
  { code: "R03", name: "Curd Rice", price: 60, category: "Rice & Meals" },
  { code: "R04", name: "Lemon Rice", price: 60, category: "Rice & Meals" },
  { code: "S01", name: "Onion Uttapam", price: 70, category: "Specials" },
  { code: "S02", name: "Appam with Veg Stew", price: 90, category: "Specials" },
  { code: "B01", name: "Authentic Filter Coffee", price: 50, category: "Beverages" },
  { code: "B02", name: "Sweet Kesari Bath", price: 60, category: "Beverages" },
]

// ─── Demo review queue data ─────────────────────────────────
const initialQueue: ReviewItem[] = [
  {
    id: 1,
    orderId: "ORD-C7A835",
    originalUtterance: "Nashik masala",
    proposedCode: "D03",
    proposedName: "Mysore Masala Dosa",
    confidence: 0.74,
    method: "fuzzy",
    reason: "Low confidence (74%), STT phonetic error — 'Nashik' vs 'Mysore'",
    timestamp: "2026-03-06 17:20:12",
    status: "pending",
  },
  {
    id: 2,
    orderId: "ORD-84EFDE",
    originalUtterance: "that plate wala idli",
    proposedCode: "I03",
    proposedName: "Thatte Idli",
    confidence: 0.78,
    method: "fuzzy",
    reason: "Low confidence (78%), colloquial description",
    timestamp: "2026-03-06 17:42:05",
    status: "pending",
  },
  {
    id: 3,
    orderId: "ORD-635412",
    originalUtterance: "sambar rice",
    proposedCode: "R02",
    proposedName: "Bisi Bele Bath",
    confidence: 0.62,
    method: "fuzzy",
    reason: "Low confidence (62%), item not on menu — closest match proposed",
    timestamp: "2026-03-06 18:30:44",
    status: "pending",
  },
  {
    id: 4,
    orderId: "ORD-D12152",
    originalUtterance: "one strong coffee",
    proposedCode: "B01",
    proposedName: "Authentic Filter Coffee",
    confidence: 0.81,
    method: "fuzzy",
    reason: "Low confidence (81%), modifier 'strong' not in canonical name",
    timestamp: "2026-03-06 19:05:18",
    status: "pending",
  },
  {
    id: 5,
    orderId: "ORD-BF4CE3",
    originalUtterance: "crispy dosa",
    proposedCode: "D01",
    proposedName: "Classic Masala Dosa",
    confidence: 0.71,
    method: "fuzzy",
    reason: "Low confidence (71%), ambiguous — could be D01, D02, or D04",
    timestamp: "2026-03-07 06:12:33",
    status: "pending",
  },
  {
    id: 6,
    orderId: "ORD-F207A9",
    originalUtterance: "set dosa",
    proposedCode: null,
    proposedName: null,
    confidence: 0.45,
    method: "fuzzy",
    reason: "Low confidence (45%), item may not be on menu",
    timestamp: "2026-03-06 19:15:02",
    status: "pending",
  },
]

function getConfidenceColor(confidence: number) {
  if (confidence >= 0.85) return "text-emerald-600"
  if (confidence >= 0.6) return "text-amber-600"
  return "text-red-600"
}

function getConfidenceBg(confidence: number) {
  if (confidence >= 0.85) return "bg-emerald-100 text-emerald-700"
  if (confidence >= 0.6) return "bg-amber-100 text-amber-700"
  return "bg-red-100 text-red-700"
}

function getStatusBadge(status: ReviewItem["status"]) {
  switch (status) {
    case "pending":
      return { bg: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending Review" }
    case "approved":
      return { bg: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, label: "Approved" }
    case "corrected":
      return { bg: "bg-blue-100 text-blue-700", icon: ArrowRight, label: "Corrected" }
    case "rejected":
      return { bg: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" }
  }
}

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState<ReviewItem[]>(initialQueue)
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null)
  const [correctionCode, setCorrectionCode] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "resolved">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredQueue = queue.filter((item) => {
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "pending" && item.status === "pending") ||
      (filterStatus === "resolved" && item.status !== "pending")
    const matchesSearch =
      !searchQuery ||
      item.originalUtterance.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const pendingCount = queue.filter((i) => i.status === "pending").length
  const resolvedCount = queue.filter((i) => i.status !== "pending").length
  const avgConfidence = queue.length > 0
    ? queue.reduce((sum, i) => sum + i.confidence, 0) / queue.length
    : 0

  function handleApprove(item: ReviewItem) {
    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? { ...q, status: "approved" as const, resolvedCode: q.proposedCode || undefined, resolvedName: q.proposedName || undefined }
          : q
      )
    )
    setSelectedItem(null)
  }

  function handleCorrect(item: ReviewItem, code: string) {
    const menuItem = MENU_ITEMS.find((m) => m.code === code)
    if (!menuItem) return
    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? { ...q, status: "corrected" as const, resolvedCode: code, resolvedName: menuItem.name }
          : q
      )
    )
    setCorrectionCode("")
    setSelectedItem(null)
  }

  function handleReject(item: ReviewItem) {
    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id ? { ...q, status: "rejected" as const } : q
      )
    )
    setSelectedItem(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Item Mapping Review Queue</h1>
        <p className="text-sm text-muted-foreground">
          Actor-Critic pipeline: items below the 85% confidence threshold need manual review.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{(avgConfidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">85%</p>
                <p className="text-xs text-muted-foreground">Auto-Accept Threshold</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {(["all", "pending", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                filterStatus === f
                  ? "bg-[#8B0000] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search utterances or order IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#8B0000] sm:w-72"
          />
        </div>
      </div>

      {/* Queue Table */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-foreground">
            {filteredQueue.length} Items in Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">All clear!</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                No items need review. The Actor-Critic pipeline is handling mappings automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Customer Said</th>
                    <th className="pb-3 font-medium text-muted-foreground">Actor&apos;s Proposal</th>
                    <th className="pb-3 font-medium text-muted-foreground">Confidence</th>
                    <th className="hidden pb-3 font-medium text-muted-foreground md:table-cell">Order</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((item) => {
                    const statusInfo = getStatusBadge(item.status)
                    const StatusIcon = statusInfo.icon
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-[#E5E7EB] last:border-0 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">&ldquo;{item.originalUtterance}&rdquo;</span>
                            <span className="text-xs text-muted-foreground mt-0.5">{item.method} match</span>
                          </div>
                        </td>
                        <td className="py-4">
                          {item.proposedName ? (
                            <div className="flex flex-col">
                              <span className="text-foreground">{item.proposedName}</span>
                              <span className="text-xs text-muted-foreground font-mono">{item.proposedCode}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">No match</span>
                          )}
                        </td>
                        <td className="py-4">
                          <Badge variant="secondary" className={`text-xs ${getConfidenceBg(item.confidence)}`}>
                            {(item.confidence * 100).toFixed(0)}%
                          </Badge>
                        </td>
                        <td className="hidden py-4 font-mono text-foreground md:table-cell">
                          {item.orderId}
                        </td>
                        <td className="py-4">
                          <Badge variant="secondary" className={`text-xs gap-1 ${statusInfo.bg}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedItem(item)
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Explanation Card */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Actor-Critic Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-[#E5E7EB] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</div>
                <h4 className="text-sm font-semibold text-foreground">Actor (Mapper)</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Takes raw utterance → runs alias lookup, fuzzy SequenceMatcher, and token overlap against the canonical menu to propose the best POS item match.
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E7EB] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">2</div>
                <h4 className="text-sm font-semibold text-foreground">Critic (Validator)</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Evaluates the Actor&apos;s proposal using method confidence, length-ratio analysis, and assigns a composite score. Alias matches get 100% trust.
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E7EB] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">3</div>
                <h4 className="text-sm font-semibold text-foreground">Router</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Confidence ≥ 85% → auto-accept and map to POS. Below 85% → flagged as &ldquo;Ambiguous Item&rdquo; and pushed here for admin review.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Side Panel */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSelectedItem(null)}>
          <div
            className="h-full w-full max-w-md bg-white p-6 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Review Item #{selectedItem.id}</h2>
                <span className="text-sm text-muted-foreground font-mono">{selectedItem.orderId}</span>
              </div>
              <button onClick={() => setSelectedItem(null)} className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Original Utterance */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Customer Said</h3>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-sm font-medium text-amber-800">&ldquo;{selectedItem.originalUtterance}&rdquo;</p>
              </div>
            </div>

            {/* Actor's Proposal */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Actor&apos;s Proposal</h3>
              <div className="rounded-lg border border-[#E5E7EB] px-4 py-3">
                {selectedItem.proposedName ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedItem.proposedName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{selectedItem.proposedCode}</p>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${getConfidenceBg(selectedItem.confidence)}`}>
                      {(selectedItem.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No confident match found</p>
                )}
              </div>
            </div>

            {/* Critic's Reason */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Critic&apos;s Analysis</h3>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-700">{selectedItem.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">Method: {selectedItem.method} | Time: {selectedItem.timestamp}</p>
              </div>
            </div>

            {/* Resolution (if resolved) */}
            {selectedItem.status !== "pending" && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">Resolution</h3>
                <div className={`rounded-lg px-4 py-3 ${
                  selectedItem.status === "approved" ? "bg-emerald-50 border border-emerald-200" :
                  selectedItem.status === "corrected" ? "bg-blue-50 border border-blue-200" :
                  "bg-red-50 border border-red-200"
                }`}>
                  {selectedItem.status === "rejected" ? (
                    <p className="text-sm text-red-700">Item rejected — not on menu</p>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">{selectedItem.resolvedName}</p>
                      <p className="text-xs font-mono text-muted-foreground">{selectedItem.resolvedCode}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions (only for pending) */}
            {selectedItem.status === "pending" && (
              <div className="space-y-4">
                {/* Approve Actor's suggestion */}
                {selectedItem.proposedCode && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                    onClick={() => handleApprove(selectedItem)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve: {selectedItem.proposedName}
                  </Button>
                )}

                {/* Correct with different item */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Or select correct item:
                  </label>
                  <select
                    value={correctionCode}
                    onChange={(e) => setCorrectionCode(e.target.value)}
                    className="w-full h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm outline-none focus:border-[#8B0000]"
                  >
                    <option value="">Choose POS item...</option>
                    {MENU_ITEMS.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.code} — {m.name} (₹{m.price})
                      </option>
                    ))}
                  </select>
                  {correctionCode && (
                    <Button
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700 gap-2"
                      onClick={() => handleCorrect(selectedItem, correctionCode)}
                    >
                      <ArrowRight className="h-4 w-4" />
                      Map to {MENU_ITEMS.find((m) => m.code === correctionCode)?.name}
                    </Button>
                  )}
                </div>

                {/* Reject */}
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 gap-2"
                  onClick={() => handleReject(selectedItem)}
                >
                  <XCircle className="h-4 w-4" />
                  Reject — Item Not on Menu
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
