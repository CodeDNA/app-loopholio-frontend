import { HistorySidebar } from "@/components/history-sidebar";

interface HistoryWrapperProps {
  historyItems: any;
  currentAnalysis: any;
  sidebarOpen: any;
  handleHistorySelect: any;
  handleClearHistory: any;
  handleDeleteItem: any;
  handleRenameItem: any;
  setSidebarOpen: any;
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
}: HistoryWrapperProps) {
  return (
    <>
      {/* WEB - History Sidebar */}
      <div className="hidden lg:block relative z-20 h-screen overflow-hidden">
        <HistorySidebar
          mobileView={false}
          items={historyItems}
          selectedId={currentAnalysis?.id || null}
          onSelect={handleHistorySelect}
          onClear={handleClearHistory}
          onDelete={handleDeleteItem}
          onRename={handleRenameItem}
          streaming={currentAnalysis?.isStreaming}
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
        className={`fixed left-0 top-0 h-screen w-[20.8rem] bg-[#0f0f0f] border-r border-border z-40 lg:hidden transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <HistorySidebar
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
        />
      </div>
    </>
  );
}
