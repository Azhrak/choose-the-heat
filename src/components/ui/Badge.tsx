import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

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

/**
 * Badge - Small inline badge component with variants
 * Follows props object pattern (no destructuring)
 *
 * @param props.variant - Badge style variant (default: "default")
 * @param props.size - Badge size (default: "md")
 * @param props.className - Additional CSS classes
 * @param props.children - Badge content
 */
export function Badge(props: BadgeProps) {
	const variant = props.variant || "default";
	const size = props.size || "md";

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full font-medium",
				variantClasses[variant],
				sizeClasses[size],
				props.className,
			)}
		>
			{props.children}
		</span>
	);
}
