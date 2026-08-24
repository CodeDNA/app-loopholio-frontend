"use client";

import { useState, useEffect, useRef } from "react";
import { UploadArea } from "@/components/upload-area.component";
import { AnalysisDisplay } from "@/components/analysis-display/analysis-display.component";
import { HistorySidebarWrapper } from "@/components/history-sidebar/history-sidebar-wrapper-component";
import {
  Analysis,
  HistoryItem,
  RiskLevel,
} from "@/lib/types/analysis.interface";
import { HeaderMobile } from "@/components/header-mobile.component";
import { ConnectionStatus } from "@/lib/types/connection-status.enum";
import { ProcessingComponent } from "@/components/processing-progress.component";
import { NewAnalysisComponent } from "@/components/new-analysis.component";
import { DocumentPreviewComponent } from "@/components/analysis-display/document-preview.component";
import { cn } from "@/lib/utils";
import {
  BACKGROUNDS,
  UPLOAD_AREA_BACKGROUNDS,
} from "@/lib/classes/background.classes";
import { FEATURE_FLAGS_ENUM } from "@/lib/flags/flags.enum";
import { ConfirmationDialog } from "@/components/ui/custom/confirmation-dialog.component";
import { ConfirmationDialogArgs } from "@/lib/types/confirmation-dialog-args.interface";

const STORAGE_KEY = "tos_analysis_history";
interface AppShellProps {
  FEATURE_FLAGS: Record<string, string>;
}

export function AppShell({ FEATURE_FLAGS }: AppShellProps) {
  const backgroundVersion = FEATURE_FLAGS[FEATURE_FLAGS_ENUM.bgversion];
  let backgroundClass = "";
  let uploadAreaBackGroungClass = "";
  switch (backgroundVersion) {
    case "blue_bg":
      backgroundClass = BACKGROUNDS.blue_bg;
      uploadAreaBackGroungClass = UPLOAD_AREA_BACKGROUNDS.blue_bg;
      break;
    case "original_mud_bg":
      backgroundClass = BACKGROUNDS.original_mud_bg;
      uploadAreaBackGroungClass = UPLOAD_AREA_BACKGROUNDS.original_mud_bg;
      break;
  }

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
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const [confirmationDialogProps, setConfirmationDialogProps] =
    useState<ConfirmationDialogArgs>({});

  // Check backend connection status
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let controller: AbortController | null = null;

    const checkHealth = async () => {
      // if analysis is running that means the backend is up and running, no need to call the health api
      if (currentAnalysis?.isStreaming) {
        setBackendStatus(ConnectionStatus.CONNECTED);
        return;
      }
      controller?.abort();
      controller = new AbortController();

      try {
        const response = await fetch("/api/health", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.ok) {
          setBackendStatus(ConnectionStatus.CONNECTED);
        } else {
          setBackendStatus(ConnectionStatus.DISCONNECTED);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "Abort Error") {
          return;
        }
        setBackendStatus(ConnectionStatus.DISCONNECTED);
      }
    };

    const startPolling = () => {
      stopPolling();
      if (currentAnalysis?.isStreaming) {
        setBackendStatus(ConnectionStatus.CONNECTED);
        return;
      }

      checkHealth();

      intervalId = setInterval(checkHealth, POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      controller?.abort();
      controller = null;
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
        // if (processed.length > 0) {
        //   setCurrentAnalysis(processed[0]);
        // }
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
    if (!currentAnalysis?.isStreaming) {
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

  const deleteAllHistoryItems = () => {
    if (!currentAnalysis?.isStreaming) {
      setAnalyses([]);
      setCurrentAnalysis(null);
    }
  };

  const deleteOneHistoryItem = (id: string) => {
    setAnalyses((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(updated.length > 0 ? updated[0] : null);
      }
      return updated;
    });
  };

  function handleDeletionConfirmed(
    res: boolean,
    deleteAll?: boolean,
    id?: string,
  ) {
    setIsConfirmationDialogOpen(false);
    if (res) {
      if (deleteAll) {
        deleteAllHistoryItems();
      } else if (id) {
        deleteOneHistoryItem(id);
      }
    }
  }

  const openConfirmationDialog = (args: ConfirmationDialogArgs) => {
    setConfirmationDialogProps(args);
    setIsConfirmationDialogOpen(true);
  };

  const handleDeleteItem = (deleteAll: boolean, id?: string) => {
    const description = !deleteAll
      ? ["Are you sure you want to delete this analysis?"]
      : ["Are you sure you want to delete all analyses?"];
    const title = !deleteAll ? "Delete analysis?" : "Delete all analyses?";

    openConfirmationDialog({
      deleteAll: deleteAll,
      title: title,
      description: description,
      cancelText: "Cancel",
      confirmText: !deleteAll ? "Delete" : "Delete All",
      critical: true,
      id: id,
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

  const handleNewAnalysis = () => {
    setCurrentAnalysis(null);
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
    <main
      className={cn(
        "h-dvh flex flex-col lg:flex-row overflow-hidden",
        backgroundClass, // FEATURE FLAG
      )}
    >
      {/* Background elements - Glow circle */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-4xl opacity-3" />
      </div>

      <HistorySidebarWrapper
        backgroundClass={backgroundClass} // FEATURE FLAG
        handleNewAnalysis={handleNewAnalysis}
        backendStatus={backendStatus}
        historyItems={historyItems}
        currentAnalysis={currentAnalysis}
        handleHistorySelect={handleHistorySelect}
        handleClearHistory={() => handleDeleteItem(true)}
        handleDeleteItem={(id: string) => handleDeleteItem(false, id)}
        handleRenameItem={handleRenameItem}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isLoading={isLoading}
      />

      <HeaderMobile
        showNewAnalysisButton={!!currentAnalysis}
        isLoading={isLoading}
        backendStatus={backendStatus}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleNewAnalysis={handleNewAnalysis}
      />
      {/* Main Result Content Area - Analysis Results*/}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden bg-transparent">
        {/* PREVIEW + RISK ITEMS - File name in case of file and text in case of text input */}
        <div
          ref={backgroundRef}
          className="flex-1 overflow-y-auto pb-20 bg-transparent"
        >
          {currentAnalysis && !currentAnalysis.isStreaming ? (
            // This div decides the max-width of the analyses container
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
              <DocumentPreviewComponent
                viewFullText={viewFullText}
                currentAnalysis={currentAnalysis}
                setViewFullText={setViewFullText}
              />
              <AnalysisDisplay
                key={currentAnalysis.id}
                riskLevels={currentAnalysis.riskLevels}
                isStreaming={currentAnalysis.isStreaming}
                error={currentAnalysis.error}
              />
            </div>
          ) : currentAnalysis && currentAnalysis.isStreaming ? (
            <ProcessingComponent
              analysisProgress={analysisProgress}
              currentStatus={currentStatus}
            />
          ) : (
            <NewAnalysisComponent />
          )}
          <div ref={contentRef} />
        </div>

        {/* UPLOAD/INPUT AREA*/}
        <div
          onWheel={handleForegroundWheel}
          className="sticky bottom-0 bg-transparent backdrop-blur-sm px-6 z-30"
        >
          <div className="max-w-3xl mx-auto">
            {!currentAnalysis && (
              <UploadArea
                uploadAreaBackGroungClass={uploadAreaBackGroungClass} // FEATURE FLAG
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                backendStatus={backendStatus}
              />
            )}
          </div>
        </div>
      </div>
      {isConfirmationDialogOpen && (
        <ConfirmationDialog
          deleteAll={confirmationDialogProps.deleteAll || false}
          id={confirmationDialogProps.id || ""}
          title={confirmationDialogProps.title}
          description={confirmationDialogProps.description}
          cancelText={confirmationDialogProps.cancelText}
          confirmText={confirmationDialogProps.confirmText}
          critical={confirmationDialogProps.critical}
          open={true}
          onConfirm={(res: boolean, deleteAll: boolean, id: string) =>
            handleDeletionConfirmed(res, deleteAll, id)
          }
        />
      )}
    </main>
  );
}
