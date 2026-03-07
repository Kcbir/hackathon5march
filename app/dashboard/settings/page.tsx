"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Bell,
  Save,
} from "lucide-react"

export default function GeneralSettingsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "Raj's Kitchen",
    phone: "+91 98765 43210",
    email: "contact@rajskitchen.com",
    address: "45, MG Road, Koramangala, Bangalore - 560095",
  })

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: "09:00", close: "23:00", enabled: true },
    tuesday: { open: "09:00", close: "23:00", enabled: true },
    wednesday: { open: "09:00", close: "23:00", enabled: true },
    thursday: { open: "09:00", close: "23:00", enabled: true },
    friday: { open: "09:00", close: "23:00", enabled: true },
    saturday: { open: "09:00", close: "23:00", enabled: true },
    sunday: { open: "10:00", close: "22:00", enabled: true },
  })

  const notificationSettings = [
    { label: "Email notifications for new orders", enabled: true },
    { label: "SMS alerts for low inventory", enabled: true },
    { label: "Push notifications for voice assistant errors", enabled: true },
    { label: "Daily revenue summary email", enabled: false },
    { label: "Weekly analytics report", enabled: true },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">General Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your restaurant profile, operating hours, and notification preferences.
        </p>
      </div>

      {/* Restaurant Information */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Restaurant Information</CardTitle>
              <CardDescription>Basic details about your restaurant</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Restaurant Name</label>
              <div className="mt-1.5 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={restaurantInfo.name}
                  onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Phone Number</label>
              <div className="mt-1.5 flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={restaurantInfo.phone}
                  onChange={(e) => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="mt-1.5 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={restaurantInfo.email}
                  onChange={(e) => setRestaurantInfo({ ...restaurantInfo, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Address</label>
              <div className="mt-1.5 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={restaurantInfo.address}
                  onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
                />
              </div>
            </div>
          </div>
          <Button className="mt-4 gap-2 bg-[#8B0000] hover:bg-[#6B0000]">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Clock className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Operating Hours</CardTitle>
              <CardDescription>Set your restaurant's opening and closing times</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {Object.entries(operatingHours).map(([day, hours]) => (
              <div
                key={day}
                className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  {mounted && (
                    <Switch
                      checked={hours.enabled}
                      onCheckedChange={(checked) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...hours, enabled: checked },
                        })
                      }
                    />
                  )}
                  <span className="text-sm font-medium text-foreground capitalize w-24">{day}</span>
                </div>
                {hours.enabled ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...hours, open: e.target.value },
                        })
                      }
                      className="h-8 w-24"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...hours, close: e.target.value },
                        })
                      }
                      className="h-8 w-24"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Closed</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="rounded-xl border border-[#E5E7EB] bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <Bell className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground">Notification Preferences</CardTitle>
              <CardDescription>Control how and when you receive notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {notificationSettings.map((setting) => (
              <div
                key={setting.label}
                className="flex items-center justify-between rounded-lg border border-[#E5E7EB] px-4 py-3"
              >
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
