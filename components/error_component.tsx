// "use client";
interface ErrorComponentProps {
  error: any;
}
export function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h3 className="text-lg font-bold text-red-500">ERROR!</h3>
      </div>
      <div className="space-y-4">
        <div className="border-2 border-red-500 rounded-2xl p-6 space-y-4 bg-transparent animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-foreground font-mono italic border border-red-500 rounded-md p-2 bg--muted-red-600 text-sm">
            An error occured while processing your request.
          </h3>
          <p className="text-red-500 text-sm font-mono italic ">
            {error.error}
          </p>
          <p className="text-red-500 text-sm font-mono italic">
            {error.message}
          </p>
          <h2 className="text-md text-foreground leading-relaxed">
            Please try again after sometime!
          </h2>
        </div>
      </div>
    </div>
  );
}
