import { AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";
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
			<div
				className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
				onClick={onClose}
			/>

			{/* Dialog */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
					{/* Close button */}
					<Button
						onClick={onClose}
						variant="ghost"
						size="sm"
						className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
						aria-label="Close"
					>
						<X className="w-5 h-5" />
					</Button>{" "}
					{/* Icon */}
					<div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
						<AlertTriangle className="w-6 h-6 text-red-600" />
					</div>
					{/* Content */}
					<h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
					<div className="text-sm text-slate-600 mb-6">{message}</div>
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
				</div>
			</div>
		</div>
	);
}
