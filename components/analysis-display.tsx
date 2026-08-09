"use client";

import { RiskLevel } from "@/types/analysis";
import { ErrorComponent } from "@/components/error_component";
interface AnalysisDisplayProps {
  riskLevels: RiskLevel[];
  fileName: string;
  isStreaming: boolean;
  error?: string;
}

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

export function AnalysisDisplay({
  riskLevels,
  fileName,
  isStreaming,
  error,
}: AnalysisDisplayProps) {
  const highRisks = riskLevels.filter((r) => r.level === "High").length;
  const mediumRisks = riskLevels.filter((r) => r.level === "Medium").length;
  const lowRisks = riskLevels.filter((r) => r.level === "Low").length;

  const riskfoundComponent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {highRisks > 0 && (
            <div className="rounded-lg border border-red-500/30 p-3">
              <p className="text-2xl font-bold text-red-400">{highRisks}</p>
              <p className="text-xs text-muted-foreground">High Risk</p>
            </div>
          )}
          {mediumRisks > 0 && (
            <div className="rounded-lg border border-amber-500/30 p-3">
              <p className="text-2xl font-bold text-amber-400">{mediumRisks}</p>
              <p className="text-xs text-muted-foreground">Medium Risk</p>
            </div>
          )}
          {lowRisks > 0 && (
            <div className="rounded-lg border border-emerald-500/30 p-3">
              <p className="text-2xl font-bold text-emerald-400">{lowRisks}</p>
              <p className="text-xs text-muted-foreground">Low Risk</p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Items */}
      <div className="space-y-4">
        {riskLevels.map((risk, index) => (
          <div
            key={index}
            className={`border-2 rounded-2xl p-6 space-y-4 bg-transparent ${getRiskColor(risk.level)} animate-in fade-in slide-in-from-bottom-2`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
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
                  Exact Clause
                </p>
                <div className="rounded-lg p-3 border border-muted/20">
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed italic">
                    {risk.exactClause}
                  </p>
                </div>
              </div>
              {/* Source Text / Citation */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                  Source Text
                </p>
                <div className="rounded-lg p-3 border border-muted/20">
                  <p className="text-sm text-muted-foreground font-mono leading-relaxed italic">
                    {risk.section_title}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed italic">
                    {risk.source_text}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                  Reason
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {risk.reason}
                </p>
              </div>

              {/* Why This Matters */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                  Why This Matters
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {risk.whyMatters}
                </p>
              </div>

              {/* Recommendation */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">
                  Recommendation
                </p>
                <p className="text-sm text-foreground font-medium leading-relaxed">
                  {risk.recommendation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isStreaming && (
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <p className="text-sm text-muted-foreground">Analyzing document...</p>
        </div>
      )}
    </div>
  );
  console.log("riskLevels");
  console.log(riskLevels);

  const noRiskfoundComponent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h3 className="text-lg font-bold text-foreground">
          Yay! No Risk Found 🎉
        </h3>
      </div>
      {/* Risk Items */}
      <div className="space-y-4">
        <div className="border-2 border-emerald-400 rounded-2xl p-6 space-y-4 bg-transparent animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-white font-mono italic">
            After completing the analysis, LoopHolio was not able to determine
            any potential risks. 🎉
          </h3>
          <h2 className="text-md text-foreground leading-relaxed">
            If you are not satisfied, please re-run the analysis.
          </h2>
        </div>
      </div>
    </div>
  );

  if (error) {
    return <ErrorComponent error={error} />;
  }
  if (riskLevels.length === 0) {
    return noRiskfoundComponent;
  }
  if (!isStreaming && riskLevels.length === 0) {
    return noRiskfoundComponent;
  }
  return riskfoundComponent;
}
