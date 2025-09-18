export interface Asset {
  id: string
  name: string
  description: string | null
  location: string | null
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  asset_id: string
  name: string
  start_time: string
  end_time: string | null
  status: "active" | "completed" | "paused"
  created_at: string
  updated_at: string
  asset?: Asset
}

export interface Reading {
  id: string
  session_id: string
  sensor_type: string
  value: number
  unit: string | null
  timestamp: string
  created_at: string
  session?: Session
}

export interface UserProfile {
  id: string
  email: string
  role: "viewer" | "admin"
  created_at: string
  updated_at: string
}
