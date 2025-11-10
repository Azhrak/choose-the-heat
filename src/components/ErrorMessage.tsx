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
				className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}
			>
				<AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
				<p className="text-red-800 text-lg">{message}</p>
				{children}
			</div>
		);
	}

	return (
		<div
			className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
		>
			<p className="text-red-800 text-sm">{message}</p>
			{children}
		</div>
	);
}
