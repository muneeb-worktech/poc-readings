"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface AdminControlsProps {
  onDataChange: () => void
}

export function AdminControls({ onDataChange }: AdminControlsProps) {
  const [isCreatingAsset, setIsCreatingAsset] = useState(false)
  const [isGeneratingReading, setIsGeneratingReading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const [newAsset, setNewAsset] = useState({
    name: "",
    description: "",
    location: "",
  })

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingAsset(true)

    try {
      const { error } = await supabase.from("assets").insert([newAsset])

      if (error) throw error

      toast({
        title: "Asset created",
        description: "New asset has been added successfully.",
      })

      setNewAsset({ name: "", description: "", location: "" })
      onDataChange()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create asset",
        variant: "destructive",
      })
    } finally {
      setIsCreatingAsset(false)
    }
  }

  const generateMockReading = async () => {
    setIsGeneratingReading(true)

    try {
      // Get active sessions
      const { data: sessions } = await supabase.from("sessions").select("*").eq("status", "active").limit(1)

      if (!sessions || sessions.length === 0) {
        toast({
          title: "No active sessions",
          description: "Create an active session first to generate readings.",
          variant: "destructive",
        })
        return
      }

      const session = sessions[0]
      const sensorTypes = ["temperature", "pressure", "humidity"]
      const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)]

      let value: number
      let unit: string

      switch (sensorType) {
        case "temperature":
          value = 18 + Math.random() * 12 // 18-30°C
          unit = "°C"
          break
        case "pressure":
          value = 95 + Math.random() * 15 // 95-110 kPa
          unit = "kPa"
          break
        case "humidity":
          value = 30 + Math.random() * 40 // 30-70%
          unit = "%"
          break
        default:
          value = Math.random() * 100
          unit = "units"
      }

      const { error } = await supabase.from("readings").insert([
        {
          session_id: session.id,
          sensor_type: sensorType,
          value: Math.round(value * 10) / 10, // Round to 1 decimal place
          unit,
          timestamp: new Date().toISOString(),
        },
      ])

      if (error) throw error

      toast({
        title: "Mock reading generated",
        description: `${sensorType}: ${value.toFixed(1)} ${unit}`,
      })

      onDataChange()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate reading",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Controls</CardTitle>
        <CardDescription>Manage assets and generate test data (Admin only)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create Asset Form */}
        <div>
          <h3 className="text-lg font-medium mb-3">Create New Asset</h3>
          <form onSubmit={handleCreateAsset} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="asset-name">Name</Label>
                <Input
                  id="asset-name"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="Temperature Sensor A1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="asset-location">Location</Label>
                <Input
                  id="asset-location"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  placeholder="Warehouse Section A"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="asset-description">Description</Label>
              <Textarea
                id="asset-description"
                value={newAsset.description}
                onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                placeholder="Main warehouse temperature monitoring"
              />
            </div>
            <Button type="submit" disabled={isCreatingAsset}>
              {isCreatingAsset ? "Creating..." : "Create Asset"}
            </Button>
          </form>
        </div>

        {/* Generate Mock Data */}
        <div>
          <h3 className="text-lg font-medium mb-3">Generate Test Data</h3>
          <div className="flex gap-2">
            <Button onClick={generateMockReading} disabled={isGeneratingReading} variant="outline">
              {isGeneratingReading ? "Generating..." : "Generate Mock Reading"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Generates a random sensor reading for an active session to test realtime updates.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
