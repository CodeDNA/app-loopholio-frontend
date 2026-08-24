import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  title?: string;
  description?: string[];
  cancelText?: string;
  confirmText?: string;
  critical?: boolean;
  open: boolean;
  onConfirm: any;
  id: string;
  deleteAll: boolean;
}

export function ConfirmationDialog({
  title = "Are you sure?",
  description = ["Are you sure you want to do this?"],
  cancelText = "Cancel",
  confirmText = "Continue",
  critical = false,
  open,
  onConfirm,
  id = "",
  deleteAll,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={cn(critical ? "text-red-500/70" : "")}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description.map((item, index) => {
              return (
                <span className="flex" key={index}>
                  {item}
                </span>
              );
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className={cn("font-semibold")}
            onClick={() => onConfirm(false)}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(true, deleteAll, id)}
            className={cn(
              "text-foreground font-semibold",
              critical
                ? "bg-red-500 hover:bg-red-500/70"
                : "bg-emerald-500 hover:bg-emerald-500/70",
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
