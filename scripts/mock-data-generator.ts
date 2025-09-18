// Mock data generator for continuous testing
// This script generates realistic sensor readings for active sessions

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nicapthbnchhnjsmzupf.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pY2FwdGhibmNoaG5qc216dXBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE2OTI1MSwiZXhwIjoyMDczNzQ1MjUxfQ._eyi6ZjUy-XHgPO0l7PBQ5WcxwI9l4gPgD9onomQSBQ";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SensorConfig {
  type: string;
  unit: string;
  minValue: number;
  maxValue: number;
  trend?: "increasing" | "decreasing" | "stable";
}

const sensorConfigs: SensorConfig[] = [
  {
    type: "temperature",
    unit: "°C",
    minValue: 18,
    maxValue: 30,
    trend: "stable",
  },
  {
    type: "pressure",
    unit: "kPa",
    minValue: 95,
    maxValue: 110,
    trend: "stable",
  },
  { type: "humidity", unit: "%", minValue: 30, maxValue: 70, trend: "stable" },
  {
    type: "vibration",
    unit: "Hz",
    minValue: 0,
    maxValue: 100,
    trend: "stable",
  },
  {
    type: "flow_rate",
    unit: "L/min",
    minValue: 10,
    maxValue: 50,
    trend: "stable",
  },
];

function generateRealisticValue(
  config: SensorConfig,
  previousValue?: number
): number {
  const { minValue, maxValue, trend } = config;
  const range = maxValue - minValue;

  if (!previousValue) {
    return minValue + Math.random() * range;
  }

  // Add some realistic variation (±5% of range)
  const variation = range * 0.05;
  let newValue = previousValue + (Math.random() - 0.5) * variation;

  // Apply trend if specified
  if (trend === "increasing") {
    newValue += Math.random() * (range * 0.02);
  } else if (trend === "decreasing") {
    newValue -= Math.random() * (range * 0.02);
  }

  // Keep within bounds
  return Math.max(minValue, Math.min(maxValue, newValue));
}

async function generateMockReading() {
  try {
    // Get active sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("status", "active");

    if (sessionsError) throw sessionsError;

    if (!sessions || sessions.length === 0) {
      console.log("No active sessions found");
      return;
    }

    // Pick a random session
    const session = sessions[Math.floor(Math.random() * sessions.length)];

    // Pick a random sensor type
    const sensorConfig =
      sensorConfigs[Math.floor(Math.random() * sensorConfigs.length)];

    // Get the last reading for this session and sensor type to create realistic progression
    const { data: lastReading } = await supabase
      .from("readings")
      .select("value")
      .eq("session_id", session.id)
      .eq("sensor_type", sensorConfig.type)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    const value = generateRealisticValue(sensorConfig, lastReading?.value);

    // Insert the new reading
    const { error: insertError } = await supabase.from("readings").insert([
      {
        session_id: session.id,
        sensor_type: sensorConfig.type,
        value: Math.round(value * 10) / 10, // Round to 1 decimal place
        unit: sensorConfig.unit,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (insertError) throw insertError;

    console.log(
      `Generated reading: ${sensorConfig.type} = ${value.toFixed(1)} ${
        sensorConfig.unit
      }`
    );
  } catch (error) {
    console.error("Error generating mock reading:", error);
  }
}

async function startMockDataGenerator(intervalMs = 5000) {
  console.log(`Starting mock data generator (interval: ${intervalMs}ms)`);

  // Generate initial reading
  await generateMockReading();

  // Set up interval for continuous generation
  const interval = setInterval(generateMockReading, intervalMs);

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\nStopping mock data generator...");
    clearInterval(interval);
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\nStopping mock data generator...");
    clearInterval(interval);
    process.exit(0);
  });
}

// Run the generator if this script is executed directly
if (require.main === module) {
  const interval = process.argv[2] ? Number.parseInt(process.argv[2]) : 5000;
  startMockDataGenerator(interval);
}

export { generateMockReading, startMockDataGenerator };
