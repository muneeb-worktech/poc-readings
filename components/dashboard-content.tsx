"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Asset, Session, Reading, UserProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { RealtimeReadings } from "@/components/realtime-readings";
import { AdminControls } from "@/components/admin-controls";

interface DashboardContentProps {
  user: User;
  profile: UserProfile;
}

export function DashboardContent({ user, profile }: DashboardContentProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load assets
      const { data: assetsData } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });

      // Load sessions with asset info
      const { data: sessionsData } = await supabase
        .from("sessions")
        .select(
          `
          *,
          asset:assets(*)
        `
        )
        .order("created_at", { ascending: false });

      setAssets(assetsData || []);
      setSessions(sessionsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Asset Monitor Dashboard</h1>
            <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
              {profile.role}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.filter((s) => s.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Realtime Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Live</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Controls - Only visible to admins */}
        {profile.role === "admin" && (
          <>
            <AdminControls onDataChange={loadData} />
            <Separator />
          </>
        )}

        {/* Realtime Readings */}
        <RealtimeReadings />

        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>
              All monitored assets in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {asset.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Location: {asset.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Active Sessions:{" "}
                      {
                        sessions.filter(
                          (s) =>
                            s.asset_id === asset.id && s.status === "active"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Monitoring sessions for assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{session.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Asset: {session.asset?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Started: {new Date(session.start_time).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        session.status === "active" ? "default" : "secondary"
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
