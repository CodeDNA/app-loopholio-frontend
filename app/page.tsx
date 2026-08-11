"use client";

import { useState, useEffect, useRef } from "react";
import { UploadArea } from "@/components/upload-area";
import { AnalysisDisplay } from "@/components/analysis-display";
import { HistorySidebar } from "@/components/history-sidebar";
import { Analysis, HistoryItem, RiskLevel } from "@/types/analysis";
import LiquidWaveSpinner from "@/components/ui/shadcn-space/spinner/spinner-10";
import Image from "next/image";

const STORAGE_KEY = "tos_analysis_history";

export default function Page() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>(
    "Calling LoopHolio AI...",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure isStreaming is false for all loaded analyses
        const processed = parsed.map((a: Analysis) => ({
          ...a,
          uploadedAt: new Date(a.uploadedAt),
          isStreaming: false,
        }));
        setAnalyses(processed);
        if (processed.length > 0) {
          setCurrentAnalysis(processed[0]);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
  }, [analyses]);

  // Sync currentAnalysis back to analyses array
  useEffect(() => {
    if (currentAnalysis) {
      setAnalyses((prev) =>
        prev.map((a) => (a.id === currentAnalysis.id ? currentAnalysis : a)),
      );
    }
  }, [currentAnalysis]);

  const handleAnalyze = async (file: File, text: string) => {
    setIsLoading(true);

    const analysis: Analysis = {
      id: Date.now().toString(),
      fileName: file.name,
      uploadedAt: new Date(),
      documentPreview: text.substring(0, 100) || file.name,
      riskLevels: [],
      overallRiskLevel: "Low",
      isStreaming: true,
    };

    setCurrentAnalysis(analysis);
    setAnalyses((prev) => [analysis, ...prev]);

    // Prepare form data for API call
    const formData = new FormData();

    formData.append("file", file);
    if (text) {
      formData.append("text", text);
    }
    console.log("**********FORM DATA: PAGE.TSX **********");
    console.log(formData);

    try {
      // Stream the response from the backend
      const response = await fetch("/api/analyze-tos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("API Error:", await response.text());
        setIsLoading(false);
        return;
      }

      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log("DONE FOUND IN READER>READ page.tsx");
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "title") {
                  setCurrentAnalysis((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      title: data.content,
                      fileName: data.content,
                    };
                  });
                } else if (data.type === "status") {
                  console.log(data);
                  setCurrentStatus(data.content);
                } else if (data.type === "error") {
                  console.error("Backend error detected: ", data.content);
                  setCurrentAnalysis((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      error: data.content,
                      isStreaming: false,
                    };
                  });
                } else if (data.type === "risk_item") {
                  const newRiskLevel: RiskLevel = data.content;
                  setCurrentAnalysis((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      riskLevels: [...prev.riskLevels, newRiskLevel],
                    };
                  });
                } else if (data.type === "overall_risk") {
                  setCurrentAnalysis((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      overallRiskLevel: data.content,
                    };
                  });
                } else if (data.type === "no_risk_found") {
                  setCurrentAnalysis((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      riskLevels: [],
                      isStreaming: false,
                    };
                  });
                } else if (data.type === "done") {
                  setCurrentAnalysis((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      isStreaming: false,
                    };
                  });
                }
              } catch (error) {
                console.error("Failed to parse stream data:", error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error analyzing ToS:", error);
      alert("Failed to analyze document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (id: string) => {
    if (currentAnalysis?.isStreaming == false) {
      const selected = analyses.find((a) => a.id === id);
      if (selected) {
        setCurrentAnalysis({
          ...selected,
          isStreaming: false,
        });
        setIsLoading(false);
      }
    }
  };

  const handleClearHistory = () => {
    if (!currentAnalysis?.isStreaming) {
      if (confirm("Are you sure you want to clear all analysis history?")) {
        setAnalyses([]);
        setCurrentAnalysis(null);
      }
    }
  };

  const handleDeleteItem = (id: string) => {
    setAnalyses((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(updated.length > 0 ? updated[0] : null);
      }
      return updated;
    });
  };

  const handleRenameItem = (id: string, newName: string) => {
    setAnalyses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, fileName: newName } : a)),
    );
    if (currentAnalysis?.id === id) {
      setCurrentAnalysis((prev) =>
        prev ? { ...prev, fileName: newName } : null,
      );
    }
  };

  const historyItems: HistoryItem[] = analyses.map((a) => ({
    id: a.id,
    fileName: a.fileName,
    uploadedAt: a.uploadedAt,
    overallRiskLevel: a.overallRiskLevel,
    highRiskCount:
      a.highRiskCount ?? a.riskLevels.filter((r) => r.level === "High").length,
    mediumRiskCount:
      a.mediumRiskCount ??
      a.riskLevels.filter((r) => r.level === "Medium").length,
    lowRiskCount:
      a.lowRiskCount ?? a.riskLevels.filter((r) => r.level === "Low").length,
  }));

  return (
    <main className="h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-5" />
      </div>

      {/* Sidebar - Hidden on mobile, visible on larger screens */}
      <div className="hidden lg:block relative z-20 h-screen overflow-hidden">
        <HistorySidebar
          items={historyItems}
          selectedId={currentAnalysis?.id || null}
          onSelect={handleHistorySelect}
          onClear={handleClearHistory}
          onDelete={handleDeleteItem}
          onRename={handleRenameItem}
          streaming={currentAnalysis?.isStreaming}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed left-0 top-0 h-screen w-[20.8rem] bg-[#0f0f0f] border-r border-border z-40 lg:hidden transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <HistorySidebar
          items={historyItems}
          selectedId={currentAnalysis?.id || null}
          onSelect={(id) => {
            handleHistorySelect(id);
            setSidebarOpen(false);
          }}
          onClear={handleClearHistory}
          onDelete={handleDeleteItem}
          onRename={handleRenameItem}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Mobile Header with Burger Menu */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-[#0f0f0f] border-b border-border/30 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-10 w-10 flex items-center justify-center rounded-lg border border-border/50 hover:border-primary/50 hover:text-primary transition-all text-muted-foreground"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-primary">LoopHolio</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-64 bg-[#0f0f0f]">
          {currentAnalysis && !currentAnalysis.isStreaming ? (
            // && currentAnalysis.riskLevels.length >= 0
            <div className="max-w-3xl mx-auto px-6 py-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {currentAnalysis.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Analysis completed{" : "}
                      {new Date(currentAnalysis.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <AnalysisDisplay
                  riskLevels={currentAnalysis.riskLevels}
                  fileName={currentAnalysis.fileName}
                  isStreaming={currentAnalysis.isStreaming}
                  error={currentAnalysis.error}
                />
              </div>
            </div>
          ) : currentAnalysis && currentAnalysis.isStreaming ? (
            <div className="max-w-3xl mx-auto px-6 py-8">
              <div className="text-center py-16">
                <div className="inline-block">
                  {/* <div className="w-16 h-16 rounded-full border-3 border-primary border-t-transparent animate-spin mb-6"></div> */}
                  <LiquidWaveSpinner
                    words={[currentStatus]}
                    size={"lg"}
                    interval={50}
                  />
                </div>
                {/* <h3 className="text-xl font-semibold text-foreground">
                  {currentStatus}
                </h3> */}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Image
                className="w-full rounded-xl opacity-80 min-w-100 min-h-50 max-w-200 max-h-100"
                src="/images/no_analysis_dark_no_bg.png" // Maps directly to public/logo.png
                // src="/images/history_banner.png" // Maps directly to public/logo.png
                alt="Company Logo"
                loading="eager"
                width={800}
                height={400}
                style={{ width: "50%", height: "60%" }}
              />
              {/* <div className="text-6xl mb-6 filter drop-shadow-lg">📋</div> */}
              {/* <h2 className="text-3xl font-bold text-foreground mb-3">
                No Analysis Yet
              </h2> */}
              <p className="text-muted-foreground max-w-md text-center">
                Upload a Terms of Service document or paste text below to
                analyze key risks, clauses, and compliance issues
              </p>
            </div>
          )}
          <div ref={contentRef} />
        </div>

        {/* Sticky Bottom Input */}
        <div className="sticky bottom-0 bg-[#0f0f0f] backdrop-blur-sm px-6 py-6 z-30">
          <div className="max-w-3xl mx-auto">
            <UploadArea onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </main>
  );
}
