"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2 } from "lucide-react";
import type { Reading } from "@/lib/types";

interface AdminControlsProps {
  onDataChange: () => void;
}

export function AdminControls({ onDataChange }: AdminControlsProps) {
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);
  const [isGeneratingReading, setIsGeneratingReading] = useState(false);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [isUpdatingReading, setIsUpdatingReading] = useState(false);
  const [isCreatingReading, setIsCreatingReading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    sensor_type: "",
    value: "",
    unit: "",
  });
  const [createForm, setCreateForm] = useState({
    session_id: "",
    sensor_type: "",
    value: "",
    unit: "",
  });
  const { toast } = useToast();
  const supabase = createClient();

  const [newAsset, setNewAsset] = useState({
    name: "",
    description: "",
    location: "",
  });

  // Load readings and sessions on component mount
  useEffect(() => {
    loadReadings();
    loadSessions();
  }, []);

  const loadReadings = async () => {
    try {
      const { data: readingsData, error } = await supabase
        .from("readings")
        .select(
          `
          *,
          session:sessions(
            *,
            asset:assets(*)
          )
        `
        )
        .order("timestamp", { ascending: false })
        .limit(20);

      if (error) throw error;
      setReadings(readingsData || []);
    } catch (error) {
      console.error("Error loading readings:", error);
      toast({
        title: "Error",
        description: "Failed to load readings",
        variant: "destructive",
      });
    } finally {
      setLoadingReadings(false);
    }
  };

  const loadSessions = async () => {
    try {
      const { data: sessionsData, error } = await supabase
        .from("sessions")
        .select(
          `
          *,
          asset:assets(*)
        `
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(sessionsData || []);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAsset(true);

    try {
      const { error } = await supabase.from("assets").insert([newAsset]);

      if (error) throw error;

      toast({
        title: "Asset created",
        description: "New asset has been added successfully.",
      });

      setNewAsset({ name: "", description: "", location: "" });
      onDataChange();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create asset",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAsset(false);
    }
  };

  const generateMockReading = async () => {
    setIsGeneratingReading(true);

    try {
      // Get active sessions
      const { data: sessions } = await supabase
        .from("sessions")
        .select("*")
        .eq("status", "active")
        .limit(1);

      if (!sessions || sessions.length === 0) {
        toast({
          title: "No active sessions",
          description: "Create an active session first to generate readings.",
          variant: "destructive",
        });
        return;
      }

      const session = sessions[0];
      const sensorTypes = ["temperature", "pressure", "humidity"];
      const sensorType =
        sensorTypes[Math.floor(Math.random() * sensorTypes.length)];

      let value: number;
      let unit: string;

      switch (sensorType) {
        case "temperature":
          value = 18 + Math.random() * 12; // 18-30°C
          unit = "°C";
          break;
        case "pressure":
          value = 95 + Math.random() * 15; // 95-110 kPa
          unit = "kPa";
          break;
        case "humidity":
          value = 30 + Math.random() * 40; // 30-70%
          unit = "%";
          break;
        default:
          value = Math.random() * 100;
          unit = "units";
      }

      const { error } = await supabase.from("readings").insert([
        {
          session_id: session.id,
          sensor_type: sensorType,
          value: Math.round(value * 10) / 10, // Round to 1 decimal place
          unit,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast({
        title: "Mock reading generated",
        description: `${sensorType}: ${value.toFixed(1)} ${unit}`,
      });

      onDataChange();
      loadReadings();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate reading",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReading(false);
    }
  };

  const handleEditReading = (reading: Reading) => {
    setEditingReading(reading);
    setEditForm({
      sensor_type: reading.sensor_type || "",
      value: reading.value.toString(),
      unit: reading.unit || "",
    });
  };

  const handleUpdateReading = async () => {
    if (!editingReading) return;

    setIsUpdatingReading(true);

    try {
      const { error } = await supabase
        .from("readings")
        .update({
          sensor_type: editForm.sensor_type,
          value: parseFloat(editForm.value),
          unit: editForm.unit,
        })
        .eq("id", editingReading.id);

      if (error) throw error;

      toast({
        title: "Reading updated",
        description: "Reading has been updated successfully.",
      });

      setEditingReading(null);
      loadReadings();
      onDataChange();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update reading",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingReading(false);
    }
  };

  const handleDeleteReading = async (readingId: string) => {
    try {
      const { error } = await supabase
        .from("readings")
        .delete()
        .eq("id", readingId);

      if (error) throw error;

      toast({
        title: "Reading deleted",
        description: "Reading has been deleted successfully.",
      });

      loadReadings();
      onDataChange();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete reading",
        variant: "destructive",
      });
    }
  };

  const handleOpenCreateDialog = () => {
    setCreateForm({
      session_id: "",
      sensor_type: "",
      value: "",
      unit: "",
    });
    setShowCreateDialog(true);
  };

  const handleCreateReading = async () => {
    if (
      !createForm.session_id ||
      !createForm.sensor_type ||
      !createForm.value ||
      !createForm.unit
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields to create a reading.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingReading(true);

    try {
      const { error } = await supabase.from("readings").insert([
        {
          session_id: createForm.session_id,
          sensor_type: createForm.sensor_type,
          value: parseFloat(createForm.value),
          unit: createForm.unit,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast({
        title: "Reading created",
        description: "New reading has been created successfully.",
      });

      setShowCreateDialog(false);
      loadReadings();
      onDataChange();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create reading",
        variant: "destructive",
      });
    } finally {
      setIsCreatingReading(false);
    }
  };

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType) {
      case "temperature":
        return "🌡️";
      case "pressure":
        return "⚡";
      case "humidity":
        return "💧";
      case "vibration":
        return "📳";
      case "flow_rate":
        return "🌊";
      default:
        return "📊";
    }
  };

  const getValueColor = (sensorType: string, value: number) => {
    switch (sensorType) {
      case "temperature":
        if (value > 25) return "text-red-500";
        if (value < 20) return "text-blue-500";
        return "text-green-500";
      case "pressure":
        if (value > 105) return "text-red-500";
        if (value < 95) return "text-blue-500";
        return "text-green-500";
      case "humidity":
        if (value > 60) return "text-red-500";
        if (value < 30) return "text-blue-500";
        return "text-green-500";
      case "vibration":
        if (value > 80) return "text-red-500";
        if (value < 10) return "text-blue-500";
        return "text-green-500";
      case "flow_rate":
        if (value > 45) return "text-red-500";
        if (value < 15) return "text-blue-500";
        return "text-green-500";
      default:
        return "text-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Controls</CardTitle>
        <CardDescription>
          Manage assets and generate test data (Admin only)
        </CardDescription>
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
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, name: e.target.value })
                  }
                  placeholder="Temperature Sensor A1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="asset-location">Location</Label>
                <Input
                  id="asset-location"
                  value={newAsset.location}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, location: e.target.value })
                  }
                  placeholder="Warehouse Section A"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="asset-description">Description</Label>
              <Textarea
                id="asset-description"
                value={newAsset.description}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, description: e.target.value })
                }
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
            <Button
              onClick={generateMockReading}
              disabled={isGeneratingReading}
              variant="outline"
            >
              {isGeneratingReading ? "Generating..." : "Generate Mock Reading"}
            </Button>
            <Button
              onClick={handleOpenCreateDialog}
              disabled={isCreatingReading}
              variant="outline"
            >
              Create Reading
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Generate random readings or create custom readings for testing
            realtime updates.
          </p>
        </div>

        <Separator />

        {/* Manage Readings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium">Manage Readings</h3>
            <Badge variant="secondary">{readings.length} readings</Badge>
          </div>

          {loadingReadings ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              <p className="text-sm text-muted-foreground">
                Loading readings...
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {readings.map((reading) => (
                <div
                  key={reading.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getSensorIcon(reading.sensor_type)}
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {reading.sensor_type.replace("_", " ")}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {reading.session?.name || "Unknown Session"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Asset: {reading.session?.asset?.name || "Unknown Asset"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reading.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <p
                        className={`text-lg font-bold ${getValueColor(
                          reading.sensor_type,
                          reading.value
                        )}`}
                      >
                        {reading.value.toFixed(1)} {reading.unit}
                      </p>
                    </div>
                    <Dialog
                      open={
                        !!editingReading && editingReading.id === reading.id
                      }
                      onOpenChange={(open) => {
                        if (!open) setEditingReading(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReading(reading)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Reading</DialogTitle>
                          <DialogDescription>
                            Update the sensor reading values.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-sensor-type">
                              Sensor Type
                            </Label>
                            <Select
                              value={editForm.sensor_type}
                              onValueChange={(value) =>
                                setEditForm({ ...editForm, sensor_type: value })
                              }
                              disabled={isUpdatingReading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select sensor type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="temperature">
                                  Temperature
                                </SelectItem>
                                <SelectItem value="pressure">
                                  Pressure
                                </SelectItem>
                                <SelectItem value="humidity">
                                  Humidity
                                </SelectItem>
                                <SelectItem value="vibration">
                                  Vibration
                                </SelectItem>
                                <SelectItem value="flow_rate">
                                  Flow Rate
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-value">Value</Label>
                            <Input
                              id="edit-value"
                              type="number"
                              step="0.1"
                              value={editForm.value}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  value: e.target.value,
                                })
                              }
                              placeholder="25.5"
                              disabled={isUpdatingReading}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-unit">Unit</Label>
                            <Input
                              id="edit-unit"
                              value={editForm.unit}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  unit: e.target.value,
                                })
                              }
                              placeholder="°C"
                              disabled={isUpdatingReading}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setEditingReading(null)}
                            disabled={isUpdatingReading}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateReading}
                            disabled={isUpdatingReading}
                          >
                            {isUpdatingReading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Updating...
                              </>
                            ) : (
                              "Update Reading"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Reading</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this reading? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteReading(reading.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              {readings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No readings available yet.</p>
                  <p className="text-xs">
                    Generate some mock readings to see them here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Create Reading Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Reading</DialogTitle>
            <DialogDescription>
              Add a new sensor reading for an active session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-session">Session</Label>
              <Select
                value={createForm.session_id}
                onValueChange={(value) =>
                  setCreateForm({ ...createForm, session_id: value })
                }
                disabled={isCreatingReading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name} - {session.asset?.name || "Unknown Asset"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="create-sensor-type">Sensor Type</Label>
              <Select
                value={createForm.sensor_type}
                onValueChange={(value) =>
                  setCreateForm({ ...createForm, sensor_type: value })
                }
                disabled={isCreatingReading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sensor type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="pressure">Pressure</SelectItem>
                  <SelectItem value="humidity">Humidity</SelectItem>
                  <SelectItem value="vibration">Vibration</SelectItem>
                  <SelectItem value="flow_rate">Flow Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="create-value">Value</Label>
              <Input
                id="create-value"
                type="number"
                step="0.1"
                value={createForm.value}
                onChange={(e) =>
                  setCreateForm({ ...createForm, value: e.target.value })
                }
                placeholder="25.5"
                disabled={isCreatingReading}
              />
            </div>
            <div>
              <Label htmlFor="create-unit">Unit</Label>
              <Input
                id="create-unit"
                value={createForm.unit}
                onChange={(e) =>
                  setCreateForm({ ...createForm, unit: e.target.value })
                }
                placeholder="°C"
                disabled={isCreatingReading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreatingReading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateReading} disabled={isCreatingReading}>
              {isCreatingReading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Reading"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
