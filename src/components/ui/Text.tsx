import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

type TextElement = "p" | "span" | "div" | "strong" | "em" | "small";

interface TextProps {
	/**
	 * The HTML element to render
	 * @default 'p'
	 */
	as?: TextElement;

	/**
	 * Color variant for the text
	 * - primary: Default body text (text-slate-700 dark:text-slate-300)
	 * - secondary: De-emphasized text (text-slate-600 dark:text-slate-300)
	 * - muted: Subtle text (text-slate-600 dark:text-slate-400)
	 * - emphasis: Important text (text-slate-900 dark:text-slate-100)
	 * @default 'primary'
	 */
	variant?: "primary" | "secondary" | "muted" | "emphasis" | "ondark";

	/**
	 * Text size
	 * @default 'base'
	 */
	size?: "xs" | "sm" | "base" | "lg" | "xl";

	/**
	 * Font weight
	 * @default 'normal'
	 */
	weight?: "normal" | "medium" | "semibold" | "bold";

	/**
	 * Use monospace font (for code/technical text)
	 * @default false
	 */
	mono?: boolean;

	/**
	 * Additional CSS classes
	 */
	className?: string;

	/**
	 * Text content
	 */
	children: ReactNode;
}

const variantClasses = {
	primary: "text-slate-700 dark:text-slate-300",
	secondary: "text-slate-600 dark:text-slate-300",
	muted: "text-slate-600 dark:text-slate-400",
	emphasis: "text-slate-900 dark:text-slate-100",
	ondark: "text-slate-300",
};

const sizeClasses = {
	xs: "text-xs",
	sm: "text-sm",
	base: "text-base",
	lg: "text-lg",
	xl: "text-xl",
};

const weightClasses = {
	normal: "font-normal",
	medium: "font-medium",
	semibold: "font-semibold",
	bold: "font-bold",
};

export function Text({
	as = "p",
	variant = "primary",
	size = "base",
	weight = "normal",
	mono = false,
	className,
	children,
}: TextProps) {
	const Component = as;

	return (
		<Component
			className={cn(
				variantClasses[variant],
				sizeClasses[size],
				weightClasses[weight],
				mono && "font-mono",
				className,
			)}
		>
			{children}
		</Component>
	);
}
