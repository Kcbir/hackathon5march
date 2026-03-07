"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Zap,
  TrendingUp,
  Globe,
  Volume2,
  Check,
} from "lucide-react"

const voiceSettings = [
  { label: "Auto-answer incoming calls", enabled: true },
  { label: "AI upsell suggestions during calls", enabled: true },
  { label: "Auto-push orders to POS", enabled: true },
  { label: "Send order confirmation SMS", enabled: true },
  { label: "Log all call transcriptions", enabled: true },
  { label: "Escalate low-confidence orders to staff", enabled: true },
]

export default function AIAssistantSettingsPage() {
  const [assistantMode, setAssistantMode] = useState<"fast" | "upsell">("upsell")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Assistant Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure Petpooja Vani voice assistant behavior and preferences.
        </p>
      </div>

      {/* Assistant Personality Mode */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Sparkles className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Assistant Personality Mode</CardTitle>
              <CardDescription>Choose how Petpooja Vani behaves during voice calls</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => setAssistantMode("fast")}
              className={`flex flex-col items-start rounded-xl border-2 p-5 text-left transition-all ${
                assistantMode === "fast"
                  ? "border-[#8B0000] bg-[#FFF5F5]"
                  : "border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className={`h-5 w-5 ${assistantMode === "fast" ? "text-[#8B0000]" : "text-muted-foreground"}`} />
                <span className="font-semibold text-foreground">Fast & Efficient</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Quick order-taking with minimal conversation. Best for high-volume rush hours.
              </p>
              {assistantMode === "fast" && (
                <Badge className="mt-3 bg-[#8B0000] text-white">Active</Badge>
              )}
            </button>
            <button
              onClick={() => setAssistantMode("upsell")}
              className={`flex flex-col items-start rounded-xl border-2 p-5 text-left transition-all ${
                assistantMode === "upsell"
                  ? "border-[#8B0000] bg-[#FFF5F5]"
                  : "border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-5 w-5 ${assistantMode === "upsell" ? "text-[#8B0000]" : "text-muted-foreground"}`} />
                <span className="font-semibold text-foreground">Sales & Upsell Mode</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Engages customers with smart suggestions and combo offers. Maximizes AOV.
              </p>
              {assistantMode === "upsell" && (
                <Badge className="mt-3 bg-[#8B0000] text-white">Active</Badge>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Multilingual Support */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Globe className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Supported Languages</CardTitle>
              <CardDescription>The Voice Assistant auto-detects customer language</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">Supported Languages: Multilingual</p>
                <p className="mt-1 text-sm text-emerald-700">
                  The Voice Assistant automatically detects and responds in the customer's preferred language.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Assistant Configuration */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Volume2 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Voice Assistant Configuration</CardTitle>
              <CardDescription>Configure call handling and order processing settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {voiceSettings.map((setting) => (
              <div key={setting.label} className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-4 py-3">
                <span className="text-sm font-medium text-foreground">{setting.label}</span>
                {mounted && <Switch defaultChecked={setting.enabled} />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
