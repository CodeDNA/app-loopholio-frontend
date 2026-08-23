export interface ConfirmationDialogArgs {
  title?: string;
  description?: string[];
  cancelText?: string;
  confirmText?: string;
  critical?: boolean;
  id?: string;
  deleteAll?: boolean;
  onConfirm?: () => void | Promise<void>;
}
