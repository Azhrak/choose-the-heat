import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	children: ReactNode;
	className?: string;
}

const variantClasses = {
	primary: "bg-romance-600 text-white hover:bg-romance-700",
	secondary:
		"bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-600",
	outline:
		"border-2 border-romance-600 dark:border-romance-400 text-romance-600 dark:text-romance-400 hover:bg-romance-50 dark:hover:bg-romance-900/20",
	danger: "bg-red-600 text-white hover:bg-red-700",
	ghost:
		"text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700",
};

const sizeClasses = {
	sm: "px-4 py-2 text-sm",
	md: "px-6 py-3",
	lg: "px-8 py-4 text-lg",
};

/**
 * Button - Reusable button component with variants, sizes, and loading state
 * Follows props object pattern (no destructuring)
 *
 * @param props.variant - Button style variant (default: "primary")
 * @param props.size - Button size (default: "md")
 * @param props.loading - Show loading spinner and disable button
 * @param props.disabled - Disable button interaction
 * @param props.children - Button content
 * @param props.className - Additional CSS classes
 */
export function Button(props: ButtonProps) {
	const variant = props.variant || "primary";
	const size = props.size || "md";
	const loading = props.loading || false;

	// Separate ButtonProps from HTML button props
	const {
		variant: _variant,
		size: _size,
		loading: _loading,
		children,
		className,
		disabled,
		...buttonProps
	} = props;

	return (
		<button
			className={cn(
				"rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 cursor-pointer",
				variantClasses[variant],
				sizeClasses[size],
				(disabled || loading) && "opacity-50 cursor-not-allowed",
				className,
			)}
			disabled={disabled || loading}
			{...buttonProps}
		>
			{loading && <Loader2 className="w-5 h-5 animate-spin" />}
			{children}
		</button>
	);
}
