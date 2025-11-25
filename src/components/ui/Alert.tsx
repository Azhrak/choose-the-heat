import type { ReactNode } from "react";

interface AlertProps {
	message?: string | null;
	variant?: "error" | "success" | "warning" | "info";
	className?: string;
	children?: ReactNode;
}

const variantClasses = {
	error:
		"bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400",
	success:
		"bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400",
	warning:
		"bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400",
	info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400",
};

export function Alert({
	message,
	variant = "error",
	className = "",
	children,
}: AlertProps) {
	const content = message || children;

	if (!content) return null;

	return (
		<div
			className={`p-3 border rounded-lg text-sm ${variantClasses[variant]} ${className}`.trim()}
		>
			{content}
		</div>
	);
}
