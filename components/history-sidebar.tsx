"use client";

import { useState } from "react";
import { HistoryItem } from "@/lib/types/analysis.interface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConnectionPill } from "@/components/connection-pill.component";
import { ConnectionStatus } from "@/lib/types/connection-status.enum";
import { HistorySideBarItem } from "@/components/history-sidebar-item.component";
import { ChevronDown, ChevronRight, CircleFadingPlus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { StartNewAnalysisButton } from "@/components/start-new-analysis-button.component";

interface HistorySidebarProps {
  items: HistoryItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  streaming?: boolean;
  mobileView?: boolean;
  backendStatus: ConnectionStatus;
  handleNewAnalysis: () => void;
  isLoading: boolean;
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
  handleNewAnalysis,
  isLoading,
}: HistorySidebarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isOpen, setIsOpen] = useState(true);

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
    onDelete(id);
    setOpenMenuId(null);
  };

  return (
    <div className="w-[20.8rem] border-r border-border bg-transparent flex flex-col h-screen">
      {/* Top Header - Logo, Brand name, Connection pill */}
      <div className="px-4 py-4 shrink-0 flex justify-between">
        {/* LoopHolio Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-foreground border border-blue-900/50">
            <p>LH</p>
          </div>
          {/* LoopHolio Brand Text */}
          <h1 className={cn("text-2xl text-primary")}>LoopHolio 1.0</h1>
        </div>
        {/* Connection Pill - Sidebar */}
        {!mobileView && <ConnectionPill backendStatus={backendStatus} />}
      </div>

      <StartNewAnalysisButton
        isLoading={isLoading}
        handleNewAnalysis={handleNewAnalysis}
      />

      {/* Recents Header */}
      <Collapsible open={isOpen}>
        <div className="px-4 py-2 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center justify-center font-semibold text-foreground">
              <p>Recents</p>
              {items.length > 0 && (
                <CollapsibleTrigger
                  className="flex items-center justify-center size-5"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {!isOpen && <ChevronRight />}
                  {isOpen && <ChevronDown />}
                </CollapsibleTrigger>
              )}
            </div>
            {items.length > 0 && (
              <Button
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                variant="destructive"
                className={"text-xs py-1 h-auto"}
              >
                Delete all
              </Button>
            )}
          </div>
        </div>

        {/* History List */}
        <CollapsibleContent>
          <div className="h-screen flex-1 overflow-y-scroll pb-50">
            {items.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-muted-foreground">
                  <h3 className="font-bold text-foreground mb-3">
                    No Analysis Yet
                  </h3>
                  <p>See what matters before you click Agree.</p>
                  <p>Start a new analysis.</p>
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
                    handleDelete={(id: string) => handleDelete(id)}
                    error={item.error}
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
