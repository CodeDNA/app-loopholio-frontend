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
        "shrink-0 flex items-center text-foreground group",
        fullView ? "px-4 py-4 hover:text-emerald-500 " : "rounded-full",
      )}
    >
      <div
        className={cn(
          "flex items-center w-full",
          fullView
            ? "group-hover:bg-muted-foreground/20 gap-2 rounded-lg   p-2"
            : "",
        )}
      >
        <SquarePen
          className={cn("border-transparent", fullView ? "size-4" : "size-9")}
        />
        {fullView && (
          <p className="border-2 border-transparent font-semibold">
            Start New Analysis
          </p>
        )}
      </div>
    </button>
  );
}
