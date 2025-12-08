import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { cn } from "~/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
	message: string;
	type?: ToastType;
	onClose: () => void;
	duration?: number;
}

const TOAST_ICONS = {
	success: CheckCircle,
	error: XCircle,
	warning: AlertTriangle,
	info: Info,
} as const;

const TOAST_STYLES = {
	success:
		"bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300",
	error:
		"bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300",
	warning:
		"bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-300",
	info: "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-300",
} as const;

export function Toast({
	message,
	type = "success",
	onClose,
	duration = 5000,
}: ToastProps) {
	const Icon = TOAST_ICONS[type];

	useEffect(() => {
		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	return (
		<div
			className={cn(
				"fixed top-4 left-1/2 -translate-x-1/2 z-50 min-w-[320px] max-w-md",
				"flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4",
				"animate-in slide-in-from-top-5 duration-300",
				TOAST_STYLES[type],
			)}
			role="alert"
		>
			<Icon className="w-5 h-5 shrink-0" />
			<p className="flex-1 text-sm font-medium">{message}</p>
			<button
				type="button"
				onClick={onClose}
				className="shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
				aria-label="Close notification"
			>
				<X className="w-4 h-4" />
			</button>
		</div>
	);
}
