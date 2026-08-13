"use client";
import { cn } from "@/lib/utils";
import { ConnectionStatus } from "@/types/connection-status";

interface ConnectionPillProps {
  backendStatus: ConnectionStatus;
}

export function ConnectionPill({ backendStatus }: ConnectionPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 p-2 rounded-full border text-xs font-medium transition-colors duration-300",
        {
          "bg-emerald-500/10 border-emerald-500/20 text-emerald-500":
            backendStatus === ConnectionStatus.CONNECTED,
          "bg-red-500/10 border-red-500/20 text-red-500":
            backendStatus === ConnectionStatus.DISCONNECTED,
          "bg-muted border-border text-muted-foreground":
            backendStatus === ConnectionStatus.CHECKING,
        },
      )}
    >
      {/* Connection status */}
      <div
        className={cn("w-2 h-2 rounded-full", {
          "bg-emerald-500 animate-pulse":
            backendStatus === ConnectionStatus.CONNECTED,
          "bg-red-500": backendStatus === ConnectionStatus.DISCONNECTED,
          "bg-muted-foreground animate-pulse":
            backendStatus === ConnectionStatus.CHECKING,
        })}
      />

      <span className="capitalize">
        {backendStatus === ConnectionStatus.CHECKING
          ? "Connecting..."
          : backendStatus}
      </span>
    </div>
  );
}
