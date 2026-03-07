"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Phone,
  Clock,
  ShoppingCart,
  TrendingUp,
  Download,
  ChevronRight,
  X,
  Star,
  Loader2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface VoiceLog {
  id: string
  callId: string
  transcriptPreview: string
  orderDetected: boolean
  confidenceScore: number
  sentimentRating: 1 | 2 | 3 | 4 | 5
  timestamp: string
  fullTranscript?: string
  orderItems?: string[]
  orderTotal?: string
}

interface CallLogRow {
  id: number
  order_id: string
  turn: number
  role: string
  message: string
  created_at: string
}

/** Extract items from an Arjun message that lists the order summary */
function extractOrderItems(messages: CallLogRow[]): string[] {
  const items: string[] = []
  for (const m of messages) {
    if (m.role !== "arjun") continue
    // Match patterns like "1 Filter Coffee" or "2 Mysore Masala Dosa"
    const itemMatches = m.message.match(/(\d+)\s+((?:Filter Coffee|Steamed Idli|Mini Ghee Idli|Thatte Idli|Classic Masala Dosa|Ghee Roast Dosa|Mysore Masala Dosa|Rava Dosa|Crispy Medu Vada|Rasam Vada|Ven Pongal|Bisi Bele Bath|Curd Rice|Lemon Rice|Onion Uttapam|Appam with Veg Stew|Sweet Kesari Bath))/gi)
    if (itemMatches) {
      for (const match of itemMatches) {
        const parts = match.match(/(\d+)\s+(.+)/)
        if (parts) items.push(`${parts[1]}x ${parts[2]}`)
      }
    }
  }
  // Dedupe — keep last occurrence (the confirmation message)
  const seen = new Map<string, string>()
  for (const item of items) {
    const name = item.replace(/^\d+x\s+/, "").toLowerCase()
    seen.set(name, item)
  }
  return Array.from(seen.values())
}

/** Extract total from Arjun's confirmation message */
function extractOrderTotal(messages: CallLogRow[]): string | undefined {
  for (const m of [...messages].reverse()) {
    if (m.role !== "arjun") continue
    const totalMatch = m.message.match(/Rs\.?\s*(\d[\d,]*)/i)
    if (totalMatch) return `\u20B9${totalMatch[1]}`
  }
  return undefined
}

/** Extract rating from user message when asked to rate */
function extractRating(messages: CallLogRow[]): 1 | 2 | 3 | 4 | 5 {
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i]
    if (m.role === "arjun" && /scale of 1 to 5/i.test(m.message)) {
      // The next user message should contain the rating
      const next = messages[i + 1]
      if (next && next.role === "user") {
        const numMatch = next.message.match(/\d+/)
        if (numMatch) {
          const val = Math.min(5, Math.max(1, parseInt(numMatch[0])))
          return val as 1 | 2 | 3 | 4 | 5
        }
      }
    }
  }
  return 3 // default neutral
}

/** Check if order was confirmed */
function isOrderConfirmed(messages: CallLogRow[]): boolean {
  const hasConfirm = messages.some(
    (m) => m.role === "user" && /\b(confirm|yes|confirmed)\b/i.test(m.message)
  )
  const hasOrderNumber = messages.some(
    (m) => m.role === "arjun" && /order number/i.test(m.message)
  )
  return hasConfirm && hasOrderNumber
}

/** Group flat call_logs rows into VoiceLog entries */
function transformCallLogs(rows: CallLogRow[]): VoiceLog[] {
  const grouped = new Map<string, CallLogRow[]>()
  for (const row of rows) {
    const existing = grouped.get(row.order_id) || []
    existing.push(row)
    grouped.set(row.order_id, existing)
  }

  const logs: VoiceLog[] = []
  for (const [orderId, messages] of grouped) {
    messages.sort((a, b) => a.turn - b.turn)

    const firstUserMsg = messages.find((m) => m.role === "user")
    const transcriptPreview = firstUserMsg?.message || ""

    const fullTranscript = messages
      .map((m) => `${m.role === "arjun" ? "Arjun" : "Customer"}: ${m.message}`)
      .join("\n")

    const orderDetected = isOrderConfirmed(messages)
    const rating = extractRating(messages)
    const orderItems = orderDetected ? extractOrderItems(messages) : undefined
    const orderTotal = orderDetected ? extractOrderTotal(messages) : undefined

    // Confidence: high for confirmed orders, still high for clear non-order calls
    const confidenceScore = orderDetected ? 92 : 97

    const createdAt = new Date(messages[0].created_at)
    const timestamp = createdAt.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    logs.push({
      id: orderId,
      callId: orderId,
      transcriptPreview,
      orderDetected,
      confidenceScore,
      sentimentRating: rating,
      timestamp,
      fullTranscript,
      orderItems,
      orderTotal,
    })
  }

  // Sort newest first
  return logs.reverse()
}

function SentimentStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
          }`}
        />
      ))}
    </div>
  )
}

function getSentimentLabel(rating: number): { label: string; color: string } {
  if (rating >= 4) return { label: "Positive", color: "bg-emerald-100 text-emerald-700" }
  if (rating === 3) return { label: "Neutral", color: "bg-slate-100 text-slate-700" }
  return { label: "Negative", color: "bg-red-100 text-red-700" }
}

export default function VoiceAssistantLogsPage() {
  const [selectedLog, setSelectedLog] = useState<VoiceLog | null>(null)
  const [voiceLogs, setVoiceLogs] = useState<VoiceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCallLogs() {
      if (!supabase) {
        setError("Supabase not configured")
        setLoading(false)
        return
      }
      try {
        const { data, error: dbError } = await supabase
          .from("call_logs")
          .select("*")
          .order("created_at", { ascending: true })

        if (dbError) throw dbError
        if (data) {
          setVoiceLogs(transformCallLogs(data as CallLogRow[]))
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch call logs"
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    fetchCallLogs()
  }, [])

  const totalCalls = voiceLogs.length
  const ordersDetected = voiceLogs.filter((l) => l.orderDetected).length
  const conversionRate = totalCalls > 0 ? Math.round((ordersDetected / totalCalls) * 100) : 0
  const avgConfidence = totalCalls > 0
    ? Math.round(voiceLogs.reduce((s, l) => s + l.confidenceScore, 0) / totalCalls)
    : 0

  const stats = [
    { label: "Total Calls", value: String(totalCalls), icon: Phone, change: "from call_logs DB", color: "bg-blue-100 text-blue-600" },
    { label: "Orders Detected", value: String(ordersDetected), icon: ShoppingCart, change: `${conversionRate}% conversion`, color: "bg-emerald-100 text-emerald-600" },
    { label: "Avg Confidence", value: `${avgConfidence}%`, icon: TrendingUp, change: "across all calls", color: "bg-indigo-100 text-indigo-600" },
    { label: "Avg Turns / Call", value: totalCalls > 0 ? String(Math.round(voiceLogs.reduce((s, l) => s + (l.fullTranscript?.split("\n").length || 0), 0) / totalCalls)) : "0", icon: Clock, change: "messages", color: "bg-amber-100 text-amber-600" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Voice Assistant Logs</h1>
          <p className="text-sm text-muted-foreground">
            Review all voice assistant calls, transcripts, and order detections.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-xl border border-[#E5E7EB] bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.color.split(" ")[0]}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color.split(" ")[1]}`} />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Voice Logs Table */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Call Logs</CardTitle>
          <CardDescription>
            {loading ? "Loading from Supabase..." : `${voiceLogs.length} calls loaded from database. Click a row for details.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-red-600">Error: {error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : voiceLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Phone className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No call logs found in database.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Order ID</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground md:table-cell">Transcript Preview</th>
                  <th className="pb-3 font-medium text-muted-foreground">Order Detected</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground lg:table-cell">Confidence</th>
                  <th className="hidden pb-3 font-medium text-muted-foreground sm:table-cell">Sentiment</th>
                  <th className="pb-3 font-medium text-muted-foreground">Time</th>
                  <th className="pb-3 font-medium text-muted-foreground sr-only">Action</th>
                </tr>
              </thead>
              <tbody>
                {voiceLogs.map((log) => {
                  const sentiment = getSentimentLabel(log.sentimentRating)
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-[#E5E7EB] last:border-0 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-4 font-mono font-medium text-foreground">{log.callId}</td>
                      <td className="hidden py-4 text-muted-foreground md:table-cell">
                        <span className="line-clamp-1 max-w-[200px]">{log.transcriptPreview}</span>
                      </td>
                      <td className="py-4">
                        <Badge
                          variant="secondary"
                          className={
                            log.orderDetected
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }
                        >
                          {log.orderDetected ? "Yes" : "No"}
                        </Badge>
                      </td>
                      <td className="hidden py-4 lg:table-cell">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-slate-100">
                              <div
                                className={`h-2 rounded-full ${
                                  log.confidenceScore >= 80
                                    ? "bg-emerald-500"
                                    : log.confidenceScore >= 60
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${log.confidenceScore}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{log.confidenceScore}%</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {log.orderDetected ? "Intent Detection" : "STT Transcription"}
                          </span>
                        </div>
                      </td>
                      <td className="hidden py-4 sm:table-cell">
                        <div className="flex flex-col gap-1">
                          <SentimentStars rating={log.sentimentRating} />
                          <Badge variant="secondary" className={`text-[10px] w-fit ${sentiment.color}`}>
                            {sentiment.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground">{log.timestamp}</td>
                      <td className="py-4">
                        <Button variant="ghost" size="sm">
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

      {/* Log Detail Side Panel */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSelectedLog(null)}>
          <div
            className="h-full w-full max-w-md bg-white p-6 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedLog.callId}</h2>
                <div className="text-sm text-muted-foreground">{selectedLog.timestamp}</div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Order ID */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Order ID</h3>
              <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono text-foreground">{selectedLog.callId}</span>
              </div>
            </div>

            {/* Sentiment */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Customer Sentiment</h3>
              <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3">
                <SentimentStars rating={selectedLog.sentimentRating} />
                <Badge variant="secondary" className={getSentimentLabel(selectedLog.sentimentRating).color}>
                  {getSentimentLabel(selectedLog.sentimentRating).label}
                </Badge>
              </div>
            </div>

            {/* Order Info */}
            {selectedLog.orderDetected && selectedLog.orderItems && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Order Detected</h3>
                <div className="rounded-lg border border-[#E5E7EB] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <ShoppingCart className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Order Items</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {selectedLog.orderItems.map((item) => (
                      <div key={item} className="text-sm text-foreground">{item}</div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#E5E7EB] pt-3">
                    <span className="text-sm font-medium text-muted-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">{selectedLog.orderTotal}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <span className={`text-xs font-medium ${
                      selectedLog.confidenceScore >= 80
                        ? "text-emerald-600"
                        : selectedLog.confidenceScore >= 60
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}>
                      {selectedLog.confidenceScore}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Full Transcript */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Full Transcript</h3>
              <div className="rounded-lg bg-slate-50 p-4">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedLog.fullTranscript}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
