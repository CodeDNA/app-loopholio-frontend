import { RiskLevel } from "@/lib/types/analysis";
import { useState } from "react";
import { ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function RiskItemCard({ risk }: { risk: RiskLevel }) {
  const [viewFullText, setViewFullText] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  function getRiskColor(level: "High" | "Medium" | "Low") {
    switch (level) {
      case "High":
        return "border-red-500/30";
      case "Medium":
        return "border-amber-500/30";
      case "Low":
        return "border-emerald-500/30";
    }
  }

  function getRiskBadgeColor(level: "High" | "Medium" | "Low") {
    switch (level) {
      case "High":
        return "bg-red-500/30 text-red-200 border border-red-500/50";
      case "Medium":
        return "bg-amber-500/30 text-amber-200 border border-amber-500/50";
      case "Low":
        return "bg-emerald-500/30 text-emerald-200 border border-emerald-500/50";
    }
  }
  return (
    <Collapsible open={isOpen}>
      <div
        className={`border rounded-2xl p-6 space-y-4 bg-transparent ${getRiskColor(risk.level)} animate-in fade-in slide-in-from-bottom-2`}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${getRiskBadgeColor(risk.level)}`}
                >
                  {risk.level === "High" && "⚠️ HIGH RISK"}
                  {risk.level === "Medium" && "⚠️ MEDIUM RISK"}
                  {risk.level === "Low" && "✓ LOW RISK"}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Confidence: {risk.confidence}%
                </span>
              </div>
              <CollapsibleTrigger className="text-emerald-500 hover:text-emerald-900">
                {!isOpen && (
                  <span onClick={() => setIsOpen(!isOpen)}>view more</span>
                )}
                {isOpen && (
                  <span onClick={() => setIsOpen(!isOpen)}>view less</span>
                )}
                {/* <ChevronUp
                  onClick={() => setIsOpen(!isOpen)}
                  className={cn(
                    "hover:text-emerald-500",
                    isOpen ? "rotate-0" : "rotate-180",
                  )}
                /> */}
              </CollapsibleTrigger>
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {risk.category}
            </h3>
          </div>
        </div>

        {/* Content Grid */}

        <div className="space-y-4">
          {/* Exact Clause */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
              Exact Clause from the section
            </p>
            <div className="rounded-lg p-3 border border-muted/20">
              <p className="text-xs text-muted-foreground font-mono leading-relaxed italic">
                {risk.exactClause}
              </p>
            </div>
          </div>

          {/* Source Text / Citation */}
          <CollapsibleContent>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                  Source Section
                </p>
                <div className="rounded-lg p-3 border border-muted/20">
                  <p className="text-sm text-muted-foreground font-mono leading-relaxed italic">
                    {risk.section_title}
                  </p>
                  <div className="flex-col">
                    <p className="text-xs text-muted-foreground font-mono leading-relaxed italic">
                      {viewFullText
                        ? risk.source_text
                        : `${risk.source_text.substring(0, 100).trim()}...`}
                    </p>
                    <p
                      className="flex justify-end text-emerald-500 hover:text-emerald-900"
                      onClick={() => setViewFullText(!viewFullText)}
                    >
                      {viewFullText ? "view less" : "view more"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                  Reason
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {risk.reason}
                </p>
              </div>

              {/* Why This Matters */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                  Why This Matters
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {risk.whyMatters}
                </p>
              </div>

              {/* Recommendation */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                  Recommendation
                </p>
                <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                  {risk.recommendation}
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}
