"use client";

import { RiskLevel } from "@/lib/types/analysis.interface";
import { ErrorComponent } from "@/components/analysis-error.component";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { RiskItemCard } from "@/components/risk_item_card.component";
import { FILTERS } from "@/lib/types/filters.enum";

interface AnalysisDisplayProps {
  riskLevels: RiskLevel[];
  isStreaming: boolean;
  error?: string;
}

export function AnalysisDisplay({
  riskLevels,
  isStreaming,
  error,
}: AnalysisDisplayProps) {
  const highRisks = riskLevels.filter((r) => r.level === "High").length;
  const mediumRisks = riskLevels.filter((r) => r.level === "Medium").length;
  const lowRisks = riskLevels.filter((r) => r.level === "Low").length;
  const [currentFilter, setCurrentFilter] = useState<FILTERS>(FILTERS.ALL);

  const filteredRiskLevels = riskLevels.filter((risk) => {
    if (currentFilter === FILTERS.ALL) return true;
    if (currentFilter === FILTERS.HIGH) return risk.level === "High";
    if (currentFilter === FILTERS.MEDIUM) return risk.level === "Medium";
    if (currentFilter === FILTERS.LOW) return risk.level === "Low";
    return true;
  });

  const changeFilter = (selectedFilter: FILTERS) => {
    if (selectedFilter === currentFilter) {
      setCurrentFilter(FILTERS.ALL);
      return;
    }
    setCurrentFilter(selectedFilter);
  };

  const riskfoundComponent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {highRisks > 0 && (
            <div
              onClick={() => changeFilter(FILTERS.HIGH)}
              className={cn(
                "rounded-lg border border-red-500/30 p-3",
                currentFilter === FILTERS.HIGH
                  ? "bg-red-500/30"
                  : "hover:bg-red-500/10",
              )}
            >
              <p className="text-2xl font-bold text-red-400">{highRisks}</p>
              <p className="text-xs text-muted-foreground">High Risk</p>
            </div>
          )}
          {mediumRisks > 0 && (
            <div
              onClick={() => changeFilter(FILTERS.MEDIUM)}
              className={cn(
                "rounded-lg border border-amber-500/30 p-3",
                currentFilter === FILTERS.MEDIUM
                  ? "bg-amber-500/30"
                  : "hover:bg-amber-500/10",
              )}
            >
              <p className="text-2xl font-bold text-amber-400">{mediumRisks}</p>
              <p className="text-xs text-muted-foreground">Medium Risk</p>
            </div>
          )}
          {lowRisks > 0 && (
            <div
              onClick={() => changeFilter(FILTERS.LOW)}
              className={cn(
                "rounded-lg border border-emerald-500/30 p-3",
                currentFilter === FILTERS.LOW
                  ? "bg-emerald-500/30"
                  : "hover:bg-emerald-500/10",
              )}
            >
              <p className="text-2xl font-bold text-emerald-400">{lowRisks}</p>
              <p className="text-xs text-muted-foreground">Low Risk</p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Items */}
      <div className="space-y-4">
        {filteredRiskLevels.map((riskItem, index) => (
          <RiskItemCard key={index} risk={riskItem} />
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
