import type { ReactNode } from "react";

interface BadgeProps {
	variant?: "default" | "success" | "warning" | "danger" | "info";
	size?: "sm" | "md";
	className?: string;
	children: ReactNode;
}

const variantClasses = {
	default: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200",
	success:
		"bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
	warning:
		"bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
	danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
	info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
};

const sizeClasses = {
	sm: "px-2 py-0.5 text-xs",
	md: "px-2.5 py-1 text-sm",
};

export function Badge({
	variant = "default",
	size = "md",
	className = "",
	children,
}: BadgeProps) {
	return (
		<span
			className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
		>
			{children}
		</span>
	);
}
