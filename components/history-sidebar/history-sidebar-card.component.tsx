import { cn } from "@/lib/utils";
import { Pencil, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";

interface HistorySidebarCardProps {
  item: any;
  handleRenameSave: any;
  onSelect: any;
  handleRenameStart: any;
  handleDelete: any;
  selectedId: any;
  streaming: any;
  setOpenMenuId: any;
  renamingId: any;
  newName: any;
  setNewName: any;
  setRenamingId: any;
  openMenuId: any;
  mobileView?: boolean;
  error: any;
}

export function HistorySidebarCard({
  item,
  handleRenameSave,
  onSelect,
  handleRenameStart,
  handleDelete,
  selectedId,
  streaming,
  setOpenMenuId,
  renamingId,
  newName,
  setNewName,
  setRenamingId,
  openMenuId,
  mobileView,
  error,
}: HistorySidebarCardProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openMenuId === item.id &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId === item.id) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId, item.id, setOpenMenuId]);

  return (
    <div className="relative">
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
              : "hover:bg-muted-foreground/20"
          }`}
        >
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-xs font-medium truncate text-foreground/80 flex items-center gap-2",
                // error ? "text-red-700/70" : "text-foreground/80 ",
              )}
            >
              {item.fileName}
              {error && <TriangleAlert className="size-3 text-red-700" />}
            </p>

            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(item.uploadedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {!error && (
              <>
                {item.highRiskCount > 0 && (
                  <div className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-700/70 text-red-500 border border-slate-600">
                    {item.highRiskCount}
                  </div>
                )}
                {item.mediumRiskCount > 0 && (
                  <div className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-700/70 text-yellow-500 border border-slate-600">
                    {item.mediumRiskCount}
                  </div>
                )}
                {item.lowRiskCount > 0 && (
                  <div className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-700/70 text-emerald-500 border border-slate-600">
                    {item.lowRiskCount}
                  </div>
                )}
              </>
            )}
            <div className="relative" ref={menuRef}>
              {!streaming && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === item.id ? null : item.id);
                  }}
                  className={cn(
                    "p-1 rounded hover:bg-primary/20 transition-all group-hover:opacity-100 text-muted-foreground hover:text-foreground",
                    mobileView || selectedId === item.id
                      ? "opacity-100"
                      : "opacity-0",
                  )}
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
                    className="flex gap-1 items-center w-full text-left px-4 py-2 text-xs hover:bg-primary/10 transition-all text-foreground first:rounded-t-lg"
                  >
                    <Pencil className="size-3" />
                    Rename
                  </button>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="flex gap-1 items-center w-full text-left px-4 py-2 text-xs hover:bg-red-500/10 transition-all text-red-400 last:rounded-b-lg border-t border-border/50"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
