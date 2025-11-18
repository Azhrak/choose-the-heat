import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorMessageProps {
	message: string;
	variant?: "inline" | "centered";
	className?: string;
	children?: ReactNode;
}

export function ErrorMessage({
	message,
	variant = "inline",
	className = "",
	children,
}: ErrorMessageProps) {
	if (variant === "centered") {
		return (
			<div
				className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center ${className}`}
			>
				<div className="space-y-3">
					<AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400 mx-auto" />
					<p className="text-red-800 dark:text-red-200 text-lg">{message}</p>
					{children}
				</div>
			</div>
		);
	}

	return (
		<div
			className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}
		>
			<p className="text-red-800 dark:text-red-200 text-sm">{message}</p>
			{children}
		</div>
	);
}
