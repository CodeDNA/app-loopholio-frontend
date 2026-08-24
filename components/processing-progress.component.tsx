import LiquidWaveSpinner from "@/components/ui/shadcn-space/spinner/spinner-10";
import { Spinner } from "./ui/spinner";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

interface ProcessingComponentProps {
  analysisProgress: number;
  currentStatus: string;
}

export function ProcessingComponent({
  analysisProgress,
  currentStatus,
}: ProcessingComponentProps) {
  return (
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
  );
}

export default ProcessingComponent;
