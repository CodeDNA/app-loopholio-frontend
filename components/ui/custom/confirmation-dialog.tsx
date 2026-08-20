import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ButtonWithConfirmationProps {
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  critical?: boolean;
  open: boolean;
  onConfirm: any;
}
export function ConfirmationDialog({
  title = "Are you sure?",
  description = "This action cannot be undone. Are you absolutely sure you want to do this?",
  cancelText = "Cancel",
  confirmText = "Continue",
  critical = false,
  open,
  onConfirm,
}: ButtonWithConfirmationProps) {
  console.log("rendered");
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className={cn("font-semibold")}
            onClick={() => onConfirm(false)}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(true)}
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
