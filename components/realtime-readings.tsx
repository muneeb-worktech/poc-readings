"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Reading } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RealtimeReadingsProps {
  // No props needed - component will fetch its own data
}

export function RealtimeReadings({}: RealtimeReadingsProps = {}) {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  console.log("readings: ", readings);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch initial readings data
  const fetchInitialReadings = async () => {
    try {
      console.log("🔄 Fetching initial readings...");
      const { data: readingsData, error: fetchError } = await supabase
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
        .limit(50);

      console.log("readingsData: ", readingsData);

      if (fetchError) {
        console.error("❌ Error fetching initial readings:", fetchError);
        setError("Failed to load initial readings");
        return;
      }

      console.log("✅ Initial readings loaded:", readingsData?.length || 0);
      setReadings(readingsData || []);
    } catch (err) {
      console.error("❌ Error in fetchInitialReadings:", err);
      setError("Failed to load initial readings");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    setConnectionStatus("connecting");
    setError(null);

    // Check if environment variables are set
    console.log(
      "Supabase URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing"
    );
    console.log(
      "Supabase Anon Key:",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing"
    );

    // Fetch initial data
    fetchInitialReadings();

    const readingsChannel = supabase.channel("readings-realtime");

    // Set up realtime subscription for readings changes
    const channel = readingsChannel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "readings",
        },
        async (payload) => {
          console.log("Reading change received:", payload.eventType, payload);

          try {
            if (payload.eventType === "INSERT") {
              console.log("New reading received:", payload.new);

              // Fetch the complete reading with session and asset info
              const { data: fullReading, error: fetchError } = await supabase
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
                .eq("id", payload.new.id)
                .single();

              if (fetchError) {
                console.error("Error fetching full reading:", fetchError);
                return;
              }

              if (fullReading) {
                // Add the new reading to the top of the list and keep only 50 most recent
                setReadings((current) => {
                  const updated = [
                    fullReading as Reading,
                    ...current.slice(0, 49),
                  ];
                  return updated;
                });
              }
            } else if (payload.eventType === "UPDATE") {
              console.log("Reading updated:", payload.new);

              // Fetch the complete updated reading
              const { data: fullReading, error: fetchError } = await supabase
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
                .eq("id", payload.new.id)
                .single();

              if (fetchError) {
                console.error("Error fetching updated reading:", fetchError);
                return;
              }

              if (fullReading) {
                // Update the existing reading in the list
                setReadings((current) =>
                  current.map((reading) =>
                    reading.id === fullReading.id
                      ? (fullReading as Reading)
                      : reading
                  )
                );
              }
            } else if (payload.eventType === "DELETE") {
              console.log("Reading deleted:", payload.old);
              // Remove the deleted reading from the list
              setReadings((current) =>
                current.filter((reading) => reading.id !== payload.old.id)
              );
            }
          } catch (err) {
            console.error("Error processing reading change:", err);
            setError("Error processing reading change");
          }
        }
      )
      .subscribe((status, err) => {
        console.log("Realtime subscription status:", status);
        if (err) console.error("Subscription error:", err);

        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
          setError(null);
          console.log("✅ Successfully subscribed to realtime updates");
        } else if (status === "CHANNEL_ERROR") {
          setConnectionStatus("disconnected");
          setError(
            `Failed to connect to realtime updates: ${
              err?.message || "Unknown error"
            }`
          );
          console.error("❌ Channel error:", err);
        } else if (status === "TIMED_OUT") {
          setConnectionStatus("disconnected");
          setError("Connection timed out");
          console.error("⏱️ Connection timed out");
        } else if (status === "CLOSED") {
          setConnectionStatus("disconnected");
          console.log("🔌 Connection closed");
        }
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [supabase]);

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

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "connecting":
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case "disconnected":
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {getConnectionIcon()}
          <span
            className={`font-medium ${
              connectionStatus === "connected"
                ? "text-green-600"
                : connectionStatus === "connecting"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {getConnectionText()}
          </span>
        </div>
        {!initialLoading && (
          <Badge variant="secondary">
            {readings.length} reading{readings.length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Realtime Readings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Realtime Readings
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500 animate-pulse"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
              }`}
            ></div>
          </CardTitle>
          <CardDescription>
            Live sensor data updates from all active sessions (most recent
            first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-4"></div>
              <p className="text-muted-foreground">
                Loading initial readings...
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {readings.map((reading, index) => (
                <div
                  key={reading.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-500 ${
                    index === 0 && connectionStatus === "connected"
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : ""
                  }`}
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
                      {reading.session?.asset?.location && (
                        <p className="text-xs text-muted-foreground">
                          📍 {reading.session.asset.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${getValueColor(
                        reading.sensor_type,
                        reading.value
                      )}`}
                    >
                      {reading.value.toFixed(1)} {reading.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reading.timestamp).toLocaleTimeString()}
                    </p>
                    {index === 0 && connectionStatus === "connected" && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Latest
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {readings.length === 0 && !initialLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No readings available yet.</p>
                  <p className="text-xs">
                    New readings will appear here automatically when the mock
                    data generator is running.
                  </p>
                  {connectionStatus === "disconnected" && (
                    <p className="text-xs text-red-500 mt-2">
                      Connection lost - readings may not update in real time.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
