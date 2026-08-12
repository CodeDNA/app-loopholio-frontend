"use client";

import { useState, useRef, useEffect } from "react";
import { HistoryItem } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HistorySidebarProps {
  items: HistoryItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  streaming?: boolean;
}

function getRiskBadge(level: "High" | "Medium" | "Low") {
  const colors = {
    High: "bg-red-500/20 text-red-400 border-red-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Low: "bg-green-500/20 text-green-400 border-green-500/30",
  };
  return colors[level];
}

export function HistorySidebar({
  items,
  selectedId,
  onSelect,
  onClear,
  onDelete,
  onRename,
  streaming,
}: HistorySidebarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRenameStart = (id: string, currentName: string) => {
    setRenamingId(id);
    setNewName(currentName);
    setOpenMenuId(null);
  };

  const handleRenameSave = (id: string) => {
    if (newName.trim() && onRename) {
      onRename(id, newName.trim());
    }
    setRenamingId(null);
    setNewName("");
  };

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
    setOpenMenuId(null);
  };

  return (
    <div className="w-[20.8rem] border-r border-border bg-[#0f0f0f] flex flex-col h-screen overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <p>LH</p>
            {/* <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg> */}
          </div>
          {/* <Image
            className="rounded-xl opacity-90"
            src="/images/no_analysis_dark_no_bg.png" // Maps directly to public/logo.png
            alt="Company Logo"
            width={100}
            height={100}
          /> */}
          {/* <Image
            className="rounded-xl opacity-90"
            src="/images/history_banner.png" // Maps directly to public/logo.png
            alt="Company Logo"
            width={100}
            height={50}
          /> */}
          <h1 className={cn("text-2xl text-primary")}>LoopHolio 1.0</h1>
        </div>
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
          <div className="space-y-1 p-4">
            {items.map((item) => (
              <div key={item.id} className="relative">
                {renamingId === item.id ? (
                  // Rename input
                  <div className="p-2 rounded-lg border border-primary bg-primary/10">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSave(item.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none border-b border-primary pb-1"
                      placeholder="New name..."
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => onSelect(item.id)}
                    className={`w-full text-left p-2 rounded-lg transition-all flex items-start justify-between gap-2 group cursor-pointer ${
                      selectedId === item.id
                        ? "bg-primary/20"
                        : "hover:bg-[#6a6a6a]"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(item.uploadedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {item.highRiskCount > 0 && (
                        <div className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-red-400 border border-slate-600">
                          {item.highRiskCount}
                        </div>
                      )}
                      {item.mediumRiskCount > 0 && (
                        <div className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-yellow-400 border border-slate-600">
                          {item.mediumRiskCount}
                        </div>
                      )}
                      {item.lowRiskCount > 0 && (
                        <div className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-700 text-emerald-400 border border-slate-600">
                          {item.lowRiskCount}
                        </div>
                      )}
                      <div className="relative" ref={menuRef}>
                        {!streaming && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(
                                openMenuId === item.id ? null : item.id,
                              );
                            }}
                            className="p-1 rounded hover:bg-primary/20 transition-all opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                            title="More options"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 8c1.1 0 2-0.9 2-2s-0.9-2-2-2-2 0.9-2 2 0.9 2 2 2zm0 2c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2zm0 6c-1.1 0-2 0.9-2 2s0.9 2 2 2 2-0.9 2-2-0.9-2-2-2z" />
                            </svg>
                          </button>
                        )}

                        {/* Dropdown Menu */}
                        {openMenuId === item.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-card border border-border rounded-lg shadow-lg z-50">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameStart(item.id, item.fileName);
                              }}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-primary/10 transition-all text-foreground first:rounded-t-lg"
                            >
                              Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-red-500/10 transition-all text-red-400 last:rounded-b-lg border-t border-border/50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
