import { AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";
import { Stack } from "~/components/ui/Stack";
import { Button } from "../Button";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string | ReactNode;
	confirmText?: string;
	confirmVariant?: "primary" | "danger";
	loading?: boolean;
}

export function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	confirmVariant = "primary",
	loading = false,
}: ConfirmDialogProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Backdrop */}
			<button
				type="button"
				className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				aria-label="Close dialog"
			/>
			{/* Dialog */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
					{/* Close button */}
					<Button
						onClick={onClose}
						variant="ghost"
						size="sm"
						className="absolute top-4 right-4 text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-gray-200"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</Button>
					<Stack gap="sm">
						{/* Icon */}
						<div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30">
							<AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
						</div>
						<Stack gap="xs">
							{/* Content */}
							<h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
								{title}
							</h3>
							<div className="text-sm text-slate-600 dark:text-gray-300">
								{message}
							</div>
						</Stack>
						{/* Actions */}
						<div className="flex gap-3 justify-end">
							<Button
								variant="secondary"
								onClick={onClose}
								disabled={loading}
								size="sm"
							>
								Cancel
							</Button>
							<Button
								variant={confirmVariant}
								onClick={onConfirm}
								loading={loading}
								size="sm"
							>
								{confirmText}
							</Button>
						</div>
					</Stack>
				</div>
			</div>
		</div>
	);
}
