"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Palette,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"

type Theme = "light" | "dark" | "system"

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<Theme>("light")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of your dashboard.
        </p>
      </div>

      {/* Theme Selection */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Palette className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Theme</CardTitle>
              <CardDescription>Select your preferred color theme</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center rounded-xl border-2 p-6 transition-all ${
                theme === "light"
                  ? "border-[#8B0000] bg-[#FFF5F5]"
                  : "border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                theme === "light" ? "bg-[#8B0000]" : "bg-slate-100"
              }`}>
                <Sun className={`h-6 w-6 ${theme === "light" ? "text-white" : "text-slate-600"}`} />
              </div>
              <span className="mt-3 font-medium text-foreground">Light</span>
              <span className="mt-1 text-xs text-muted-foreground">Bright and clean</span>
              {theme === "light" && (
                <Badge className="mt-3 bg-[#8B0000] text-white">Active</Badge>
              )}
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center rounded-xl border-2 p-6 transition-all ${
                theme === "dark"
                  ? "border-[#8B0000] bg-[#FFF5F5]"
                  : "border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                theme === "dark" ? "bg-[#8B0000]" : "bg-slate-100"
              }`}>
                <Moon className={`h-6 w-6 ${theme === "dark" ? "text-white" : "text-slate-600"}`} />
              </div>
              <span className="mt-3 font-medium text-foreground">Dark</span>
              <span className="mt-1 text-xs text-muted-foreground">Easy on the eyes</span>
              {theme === "dark" && (
                <Badge className="mt-3 bg-[#8B0000] text-white">Active</Badge>
              )}
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center rounded-xl border-2 p-6 transition-all ${
                theme === "system"
                  ? "border-[#8B0000] bg-[#FFF5F5]"
                  : "border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                theme === "system" ? "bg-[#8B0000]" : "bg-slate-100"
              }`}>
                <Monitor className={`h-6 w-6 ${theme === "system" ? "text-white" : "text-slate-600"}`} />
              </div>
              <span className="mt-3 font-medium text-foreground">System</span>
              <span className="mt-1 text-xs text-muted-foreground">Match device</span>
              {theme === "system" && (
                <Badge className="mt-3 bg-[#8B0000] text-white">Active</Badge>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-foreground">Preview</CardTitle>
          <CardDescription>How your dashboard will look with the selected theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-full bg-slate-200" />
              <div>
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="mt-1 h-2 w-16 rounded bg-slate-100" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-16 rounded-lg bg-slate-100" />
              <div className="h-16 rounded-lg bg-slate-100" />
              <div className="h-16 rounded-lg bg-slate-100" />
            </div>
            <div className="mt-4 h-32 rounded-lg bg-slate-100" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Dark mode support coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
