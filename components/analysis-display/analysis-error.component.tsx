"use client";
interface ErrorComponentProps {
  error: any;
}
export function ErrorComponent({ error }: ErrorComponentProps) {
  // console.log("error received in the error component: ", error);
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h3 className="text-lg font-bold text-foreground/50">
          Something went wrong. Please see the details below.
        </h3>
      </div>
      <div className="space-y-4">
        <div className="border-2 border-red-500/80 rounded-2xl p-6 space-y-4 bg-transparent animate-in fade-in slide-in-from-bottom-2 wrap-break-word">
          <h3 className="text-red-500 font-mono border border-foreground/50 rounded-md p-2 bg--muted-red-600 text-sm">
            An error occured while processing your request!
          </h3>
          <p className="text-red-500/70 font-bold text-sm font-mono">
            {error.message || error}
          </p>
          <p className="text-red-500/70 text-sm font-bold">{error.error}</p>
          <p className="text-red-500/70 font-bold text-sm font-mono">
            {error.message}
          </p>
          <h2 className="text-md text-foreground/50 font-bold leading-relaxed">
            Please try again!
          </h2>
        </div>
      </div>
    </div>
  );
}
