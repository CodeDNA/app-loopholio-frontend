"use client";

import { useState } from "react";
import { HistoryItem } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConnectionPill } from "@/components/connection-pill";
import { ConnectionStatus } from "@/types/connection-status";
import { HistorySideBarItem } from "@/components/history-sidebar-item";

interface HistorySidebarProps {
  items: HistoryItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  streaming?: boolean;
  mobileView?: boolean;
  backendStatus: ConnectionStatus;
}

export function HistorySidebar({
  items,
  selectedId,
  onSelect,
  onClear,
  onDelete,
  onRename,
  streaming,
  mobileView,
  backendStatus,
}: HistorySidebarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const handleRenameStart = (id: string, currentName: string) => {
    // console.log("Rename clicked");
    setRenamingId(id);
    setNewName(currentName);
    setOpenMenuId(null);
  };

  const handleRenameSave = (id: string) => {
    // console.log("Rename save initiated");
    if (newName.trim() && onRename) {
      onRename(id, newName.trim());
    }
    setRenamingId(null);
    setNewName("");
  };

  const handleDelete = (id: string) => {
    // console.log("Delete Clicked");
    if (onDelete) {
      onDelete(id);
    }
    setOpenMenuId(null);
  };

  return (
    <div className="w-[20.8rem] border-r border-border bg-[#0f0f0f] flex flex-col h-screen overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-4 shrink-0 flex justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <p>LH</p>
          </div>
          <h1 className={cn("text-2xl text-primary")}>LoopHolio 1.0</h1>
        </div>
        {!mobileView && <ConnectionPill backendStatus={backendStatus} />}
      </div>

      {/* Recents Header */}
      <div className="px-4 py-2 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-semibold text-foreground">Recents</h3>
          {items.length > 0 && (
            <Button
              onClick={onClear}
              variant="outline"
              className="text-xs py-1 h-auto"
            >
              Delete all
            </Button>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-muted-foreground">
              <h3 className="font-bold text-foreground mb-3">
                No Analysis Yet
              </h3>
              <h2>
                Upload a Terms of Service document or paste text in the textbox
                to analyze key risks, clauses, and compliance issues.
              </h2>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-4 pb-15">
            {items.map((item) => (
              <HistorySideBarItem
                key={item.id}
                item={item}
                handleRenameSave={handleRenameSave}
                onSelect={onSelect}
                handleRenameStart={handleRenameStart}
                handleDelete={handleDelete}
                selectedId={selectedId}
                streaming={streaming}
                setOpenMenuId={setOpenMenuId}
                renamingId={renamingId}
                newName={newName}
                setNewName={setNewName}
                setRenamingId={setRenamingId}
                openMenuId={openMenuId}
                mobileView={mobileView}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
