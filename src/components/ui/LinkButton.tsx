import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface LinkButtonProps {
	// TanStack Router props
	to: string;
	search?: Record<string, unknown>;
	params?: Record<string, string>;

	// Button styling props (matching existing Button component)
	variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";

	// Additional customization
	className?: string;
	children: ReactNode;

	// Accessibility
	title?: string;
	"aria-label"?: string;
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
 * LinkButton - Navigation link styled as a button
 *
 * Combines TanStack Router's Link functionality with Button component styling.
 * Use this for navigation that should look like a button (CTAs, action links).
 *
 * @example
 * <LinkButton to="/browse" variant="primary" size="md">
 *   Browse Stories
 * </LinkButton>
 *
 * @example With icons
 * <LinkButton to="/story/create" search={{ templateId: id }} variant="primary" size="lg">
 *   <Heart className="w-5 h-5" fill="currentColor" />
 *   Start Your Story
 * </LinkButton>
 */
export function LinkButton({
	to,
	search,
	params,
	variant = "primary",
	size = "md",
	className = "",
	children,
	title,
	"aria-label": ariaLabel,
}: LinkButtonProps) {
	return (
		<Link
			to={to}
			search={search}
			params={params}
			className={cn(
				"rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 cursor-pointer",
				variantClasses[variant],
				sizeClasses[size],
				className,
			)}
			title={title}
			aria-label={ariaLabel}
		>
			{children}
		</Link>
	);
}
