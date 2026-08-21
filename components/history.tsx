import { HistorySidebar } from "@/components/history-sidebar";
import { cn } from "@/lib/utils";
import { ConnectionStatus } from "@/types-and-constants/connection-status";

interface HistoryWrapperProps {
  historyItems: any;
  currentAnalysis: any;
  sidebarOpen: any;
  handleHistorySelect: any;
  handleClearHistory: any;
  handleDeleteItem: any;
  handleRenameItem: any;
  setSidebarOpen: any;
  backendStatus: ConnectionStatus;
  handleNewAnalysis: () => void;
  isLoading: boolean;
  backgroundClass: string; //FEATURE FLAG
}

export function HistoryWrapper({
  historyItems,
  currentAnalysis,
  sidebarOpen,
  handleHistorySelect,
  handleClearHistory,
  handleDeleteItem,
  handleRenameItem,
  setSidebarOpen,
  backendStatus,
  handleNewAnalysis,
  isLoading,
  backgroundClass, //FEATURE FLAG
}: HistoryWrapperProps) {
  return (
    <>
      {/* WEB - History Sidebar */}
      <div className="hidden lg:block relative z-20 bg-transparent h-screen overflow-hidden">
        <HistorySidebar
          backendStatus={backendStatus}
          mobileView={false}
          items={historyItems}
          selectedId={currentAnalysis?.id || null}
          onSelect={handleHistorySelect}
          onClear={handleClearHistory}
          onDelete={handleDeleteItem}
          onRename={handleRenameItem}
          streaming={currentAnalysis?.isStreaming}
          handleNewAnalysis={handleNewAnalysis}
          isLoading={isLoading}
        />
      </div>

      {/* MOBILE - History Sidebar Overlay*/}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* MOBILE - History Sidebar */}
      <div
        className={cn(
          `fixed left-0 top-0 h-screen w-[20.8rem] border-r border-border z-40 lg:hidden transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`,
          backgroundClass, // FEATURE FLAG
        )}
      >
        <HistorySidebar
          backendStatus={backendStatus}
          mobileView={true}
          items={historyItems}
          selectedId={currentAnalysis?.id || null}
          onSelect={(id) => {
            handleHistorySelect(id);
            setSidebarOpen(false);
          }}
          onClear={handleClearHistory}
          onDelete={handleDeleteItem}
          onRename={handleRenameItem}
          streaming={currentAnalysis?.isStreaming}
          handleNewAnalysis={() => {
            handleNewAnalysis();
            setSidebarOpen(false);
          }}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
