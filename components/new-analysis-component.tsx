import { cn } from "@/lib/utils";
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
      <div className={cn("text-muted-foreground max-w-md px-10 lg:px-0")}>
        <p className="font-bold text-md">
          See what matters before you click Agree!
        </p>
        <p className="text-justify">
          Upload, paste, or add a link to any Terms of Service. LoopHolio
          identifies the clauses that matter, explains the risks in plain
          language and shows exactly where each finding comes from.
        </p>
        <p className="mt-10 text-start">
          Supports PDF, Word, text, image(or a screenshot of the text document)
          and Terms of Service URLs.
        </p>
      </div>
    </div>
  );
}
