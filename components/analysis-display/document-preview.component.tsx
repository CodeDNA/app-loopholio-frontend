import { Analysis } from "@/lib/types/analysis.interface";

interface DocumentPreviewComponentProps {
  viewFullText: boolean;
  currentAnalysis: Analysis;
  setViewFullText: (viewFullText: boolean) => void;
}

export function DocumentPreviewComponent({
  viewFullText,
  currentAnalysis,
  setViewFullText,
}: DocumentPreviewComponentProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {viewFullText
            ? currentAnalysis.documentPreview
            : (currentAnalysis.documentPreview &&
                `${currentAnalysis.documentPreview.substring(0, 200)}...`) ||
              currentAnalysis.title}
        </p>

        <div className="flex justify-between mt-5">
          <p className="text-xs text-muted-foreground mt-1">
            Analysis completed{" : "}
            {new Date(currentAnalysis.uploadedAt).toLocaleString()}
          </p>
          {/* Toggle button is only required in case of text input coz documentPreview is not generated only for file input. */}
          {currentAnalysis.documentPreview && (
            <p
              className="text-emerald-500 hover:text-emerald-900"
              onClick={() => setViewFullText(!viewFullText)}
            >
              {viewFullText ? "view less" : "view more"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
