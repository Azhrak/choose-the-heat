import type { ReactNode } from "react";

interface PageContainerProps {
	children: ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
	className?: string;
}

const maxWidthClasses = {
	sm: "max-w-2xl",
	md: "max-w-3xl",
	lg: "max-w-4xl",
	xl: "max-w-5xl",
	"2xl": "max-w-6xl",
	full: "max-w-7xl",
};

/**
 * PageContainer - Container with responsive max-width and padding
 * Follows props object pattern (no destructuring)
 *
 * @param props.children - Content to render inside container
 * @param props.maxWidth - Maximum width preset (default: "full")
 * @param props.className - Additional CSS classes
 */
export function PageContainer(props: PageContainerProps) {
	const maxWidth = props.maxWidth || "full";
	const className = props.className || "";

	return (
		<div className="container mx-auto px-4 py-12">
			<div className={`${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
				{props.children}
			</div>
		</div>
	);
}
