"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { UploadArea } from "@/components/upload-area";
import { AnalysisDisplay } from "@/components/analysis-display";
import { HistoryWrapper } from "@/components/history";
import { Analysis, HistoryItem, RiskLevel } from "@/types/analysis";
import LiquidWaveSpinner from "@/components/ui/shadcn-space/spinner/spinner-10";
import { HeaderMobile } from "@/components/header-mobile";
import { ConnectionStatus } from "@/types/connection-status";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Spinner } from "./ui/spinner";

const STORAGE_KEY = "tos_analysis_history";
interface MainPageProps {
  FEATURE_FLAGS: Record<string, any>;
}

export default function MainPage({ FEATURE_FLAGS }: MainPageProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const initialProcessStatus = "Thinking...";
  const [currentStatus, setCurrentStatus] =
    useState<string>(initialProcessStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewFullText, setViewFullText] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [backendStatus, setBackendStatus] = useState<ConnectionStatus>(
    ConnectionStatus.CHECKING,
  );
  const [analysisProgress, setAnalysisProgress] = useState<number>(1);
  const POLL_INTERVAL_MS = 60000; // milliseconds
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Check backend connection status
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health", {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          setBackendStatus(ConnectionStatus.CONNECTED);
        } else {
          setBackendStatus(ConnectionStatus.DISCONNECTED);
        }
      } catch {
        setBackendStatus(ConnectionStatus.DISCONNECTED);
      }
    };

    const startPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      checkHealth();
      intervalId = setInterval(checkHealth, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // If the browser is not visible, stop polling to avoid un-necessary backend calls
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === "visible") {
      startPolling();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [POLL_INTERVAL_MS]);

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

  // Set progress bar text and percentage
  useEffect(() => {
    switch (currentStatus) {
      case "Processing your text...":
        setAnalysisProgress(7);
        break;
      case "Processing your file...":
        setAnalysisProgress(7);
        break;
      case "Executing agent pipeline...":
        setAnalysisProgress(10);
        break;
      case "Extracting clauses...":
        setAnalysisProgress(15);
        break;
      case "Analyzing Risks...":
        setAnalysisProgress(30);
        break;
      case "Generating explanations...":
        setAnalysisProgress(60);
        break;
      case "Preparing Report...":
        setAnalysisProgress(90);
        break;
    }
    return () => setAnalysisProgress(0);
  }, [currentStatus]);
  // Allows scrolling through the results even when the cursor is over the upload area
  const handleForegroundWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    backgroundRef.current?.scrollBy({
      top: event.deltaY,
      left: event.deltaX,
    });
  };

  const handleAnalyze = async (text: string, isURL: boolean, file?: File) => {
    setIsLoading(true);

    const analysis: Analysis = {
      id: Date.now().toString(),
      fileName: file ? file.name : `${text.substring(0, 100)}`,
      uploadedAt: new Date(),
      documentPreview: text || "",
      riskLevels: [],
      overallRiskLevel: "Low",
      isStreaming: true,
    };

    setCurrentAnalysis(analysis);
    setAnalyses((prev) => [analysis, ...prev]);

    // Prepare form data for API call
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    }
    if (text) {
      formData.append("text", text);
    }
    if (isURL) {
      formData.append("text", text); //contains the url
      formData.append("isURL", `${isURL}`); // isurl = true/false
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
                } else if (data.type === "documentPreview") {
                  setCurrentAnalysis((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      documentPreview: data.content,
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
      setCurrentStatus(initialProcessStatus);
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
    error: a.error,
  }));

  return (
    <main className="h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-5" />
      </div>

      <HistoryWrapper
        backendStatus={backendStatus}
        historyItems={historyItems}
        currentAnalysis={currentAnalysis}
        handleHistorySelect={handleHistorySelect}
        handleClearHistory={handleClearHistory}
        handleDeleteItem={handleDeleteItem}
        handleRenameItem={handleRenameItem}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <HeaderMobile
        backendStatus={backendStatus}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      {/* Main Result Content Area - Analysis Results*/}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* PREVIEW + RISK ITEMS - File name in case of file and text in case of text input */}
        <div
          ref={backgroundRef}
          className="flex-1 overflow-y-auto pb-20 bg-[#0f0f0f]"
        >
          {currentAnalysis && !currentAnalysis.isStreaming ? (
            // This div decides the max-width of the analyses container
            <div className="max-w-5xl mx-auto px-6 py-8">
              <div className="space-y-6">
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
                <AnalysisDisplay
                  key={currentAnalysis.id}
                  riskLevels={currentAnalysis.riskLevels}
                  isStreaming={currentAnalysis.isStreaming}
                  error={currentAnalysis.error}
                />
              </div>
            </div>
          ) : currentAnalysis && currentAnalysis.isStreaming ? (
            <div className="max-w-3xl mx-auto px-6 py-8 items-center justify-center">
              <div className="text-center py-16">
                <div className="flex-row">
                  <LiquidWaveSpinner
                    words={["Processing..."]}
                    size={"lg"}
                    interval={50}
                  />
                  <Progress className="w-full" value={analysisProgress}>
                    <ProgressLabel className="flex gap-1 items-center text-emerald-500">
                      <Spinner />
                      {currentStatus}
                    </ProgressLabel>
                    <ProgressValue className="text-emerald-500" />
                  </Progress>
                  {/* <p>{analysisProgress}%</p> */}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Image
                className="w-full rounded-xl opacity-80 min-w-100 min-h-50 max-w-200 max-h-100"
                src="/images/no_analysis_dark_no_bg.png"
                alt="Company Logo"
                loading="eager"
                width={800}
                height={400}
                style={{ width: "50%", height: "60%" }}
              />
              <p className="text-muted-foreground max-w-md text-center">
                Upload a Terms of Service document or paste text/url below to
                analyze key risks, clauses, and compliance issues
              </p>
            </div>
          )}
          <div ref={contentRef} />
        </div>

        {/* INPUT AREA*/}
        <div
          onWheel={handleForegroundWheel}
          className="sticky bottom-0 bg-[#0f0f0f] backdrop-blur-sm px-6 z-30"
        >
          <div className="max-w-3xl mx-auto">
            <UploadArea
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              backendStatus={backendStatus}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
