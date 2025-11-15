import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface HeadingProps {
	level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	variant?: "default" | "danger";
	/**
	 * Size preset for the heading. If not provided, uses default size for the level.
	 * - hero: Extra large (5xl-6xl) for hero sections
	 * - page: Large (4xl) for page titles
	 * - section: Medium-large (2xl) for section headers
	 * - subsection: Medium (lg-xl) for subsections
	 * - label: Small (sm) for labels and minor headings
	 */
	size?: "hero" | "page" | "section" | "subsection" | "label";
	className?: string;
	children: ReactNode;
}

// Default styles for each level (maintains backward compatibility)
const levelStyles = {
	h1: "text-3xl font-bold",
	h2: "text-xl font-semibold",
	h3: "text-sm font-medium",
	h4: "text-base font-medium",
	h5: "text-sm font-medium",
	h6: "text-xs font-medium",
};

// Size preset styles (override level defaults when specified)
const sizeStyles = {
	hero: "text-5xl md:text-6xl font-bold",
	page: "text-4xl font-bold",
	section: "text-2xl font-bold",
	subsection: "text-xl font-semibold",
	label: "text-sm font-semibold",
};

const variantStyles = {
	default: "text-slate-900",
	danger: "text-red-900",
};

export function Heading({
	level,
	variant = "default",
	size,
	className,
	children,
}: HeadingProps) {
	const Component = level;

	const sizeClass = size ? sizeStyles[size] : levelStyles[level];

	return (
		<Component className={cn(sizeClass, variantStyles[variant], className)}>
			{children}
		</Component>
	);
}
