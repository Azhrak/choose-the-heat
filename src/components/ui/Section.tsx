import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface SectionProps {
	spacing?: "sm" | "md" | "lg";
	maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
	centered?: boolean;
	className?: string;
	children: ReactNode;
}

const spacingClasses = {
	sm: "py-4",
	md: "py-8",
	lg: "py-12",
};

const maxWidthClasses = {
	sm: "max-w-2xl",
	md: "max-w-4xl",
	lg: "max-w-6xl",
	xl: "max-w-7xl",
	full: "max-w-full",
};

export function Section({
	spacing = "md",
	maxWidth = "lg",
	centered = true,
	className = "",
	children,
}: SectionProps) {
	const spacingClass = spacingClasses[spacing];
	const maxWidthClass = maxWidthClasses[maxWidth];
	const centeredClass = centered ? "mx-auto" : "";

	return (
		<section
			className={cn(spacingClass, maxWidthClass, centeredClass, className)}
		>
			{children}
		</section>
	);
}
