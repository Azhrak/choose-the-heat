import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface HeadingProps {
	level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	variant?: "default" | "danger";
	className?: string;
	children: ReactNode;
}

const levelStyles = {
	h1: "text-3xl font-bold",
	h2: "text-xl font-semibold",
	h3: "text-sm font-medium",
	h4: "text-base font-medium",
	h5: "text-sm font-medium",
	h6: "text-xs font-medium",
};

const variantStyles = {
	default: "text-slate-900",
	danger: "text-red-900",
};

export function Heading({
	level,
	variant = "default",
	className,
	children,
}: HeadingProps) {
	const Component = level;

	return (
		<Component
			className={cn(levelStyles[level], variantStyles[variant], className)}
		>
			{children}
		</Component>
	);
}
