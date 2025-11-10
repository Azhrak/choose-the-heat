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

export function PageContainer({
	children,
	maxWidth = "full",
	className = "",
}: PageContainerProps) {
	return (
		<div className="container mx-auto px-4 py-12">
			<div className={`${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
				{children}
			</div>
		</div>
	);
}
