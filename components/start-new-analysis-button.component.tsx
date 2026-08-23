import { CircleFadingPlus, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";

interface StartNewAnalysisButtonProps {
  isLoading: boolean;
  fullView?: boolean;
  handleNewAnalysis: () => void;
}

export function StartNewAnalysisButton({
  isLoading,
  fullView = true,
  handleNewAnalysis,
}: StartNewAnalysisButtonProps) {
  return (
    <button
      disabled={isLoading}
      onClick={handleNewAnalysis}
      className={cn(
        "group shrink-0 flex items-center text-foreground",
        fullView ? "px-4 py-4" : "rounded-full",
      )}
    >
      <div
        className={cn(
          "flex items-center w-full space-x-2",
          fullView
            ? isLoading
              ? "text-muted group-hover:bg-none p-2"
              : "group-hover:bg-muted-foreground/20 group-hover:text-emerald-500 gap-2 rounded-lg p-2"
            : "",
        )}
      >
        <SquarePen
          className={cn("border-transparent", fullView ? "size-4" : "size-6")}
        />
        {fullView && (
          <p className="border-2 border-transparent font-semibold">
            Start New Analysis
          </p>
        )}
        {!fullView && (
          <p className="border-2 border-transparent text-md font-semibold">
            New
          </p>
        )}
      </div>
    </button>
  );
}
