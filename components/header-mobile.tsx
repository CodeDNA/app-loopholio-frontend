import { ConnectionPill } from "@/components/connection-pill";
import { ConnectionStatus } from "@/types-and-constants/connection-status";

interface HeaderMobileProps {
  sidebarOpen: boolean;
  setSidebarOpen: any;
  backendStatus: ConnectionStatus;
}
export function HeaderMobile({
  setSidebarOpen,
  sidebarOpen,
  backendStatus,
}: HeaderMobileProps) {
  return (
    <>
      {/* Mobile Header/Top Bar with Burger Menu */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-transparent border-b border-border/30 shrink-0">
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
          <h1 className="text-lg font-bold text-primary">LoopHolio 1.0</h1>
        </div>
        <div className="w-10" />
        <ConnectionPill backendStatus={backendStatus} />
      </div>
    </>
  );
}
