"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
type ConnectionStatus = "checking" | "connected" | "disconnected";

interface ConnectionPillProps {
  pollIntervalMs?: number; // seconds
}

export function ConnectionPill({
  pollIntervalMs = 10000,
}: ConnectionPillProps) {
  const [status, setStatus] = useState<ConnectionStatus>("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health", {
          method: "GET",
          cache: "no-store",
        });
        if (response.ok) {
          setStatus("connected");
        } else {
          setStatus("disconnected");
        }
      } catch (error) {
        setStatus("disconnected");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, pollIntervalMs);

    // 3. Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 p-2 rounded-full border text-xs font-medium transition-colors duration-300",
        {
          "bg-emerald-500/10 border-emerald-500/20 text-emerald-500":
            status === "connected",
          "bg-red-500/10 border-red-500/20 text-red-500":
            status === "disconnected",
          "bg-muted border-border text-muted-foreground": status === "checking",
        },
      )}
    >
      {/* Connection Dot */}
      <div
        className={cn("w-2 h-2 rounded-full", {
          "bg-emerald-500 animate-pulse": status === "connected",
          "bg-red-500": status === "disconnected",
          "bg-muted-foreground animate-pulse": status === "checking",
        })}
      />

      {/* Connection status */}
      <span className="capitalize">
        {status === "checking" ? "Connecting..." : status}
      </span>
    </div>
  );
}
