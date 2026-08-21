import Image from "next/image";

export function NewAnalysisComponent() {
  return (
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
        Upload a Terms of Service document or paste text/url below to analyze
        key risks, clauses, and compliance issues
      </p>
    </div>
  );
}
