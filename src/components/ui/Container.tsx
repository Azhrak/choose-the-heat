import type { ReactNode } from "react";

interface ContainerProps {
	size?: "sm" | "md" | "lg" | "xl" | "full";
	padding?: boolean;
	className?: string;
	children: ReactNode;
}

const sizeClasses = {
	sm: "max-w-2xl",
	md: "max-w-4xl",
	lg: "max-w-6xl",
	xl: "max-w-7xl",
	full: "max-w-full",
};

export function Container({
	size = "lg",
	padding = true,
	className = "",
	children,
}: ContainerProps) {
	const sizeClass = sizeClasses[size];
	const paddingClass = padding ? "px-4" : "";

	return (
		<div
			className={`container mx-auto ${sizeClass} ${paddingClass} ${className}`.trim()}
		>
			{children}
		</div>
	);
}
