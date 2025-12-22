import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface CardProps {
	children: ReactNode;
	className?: string;
	padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
	none: "",
	sm: "p-4",
	md: "p-6",
	lg: "p-8",
};

/**
 * Card - Reusable card container component
 * Provides consistent styling for white card containers with rounded corners and shadow
 * Follows props object pattern (no destructuring)
 *
 * @param props.children - Card content
 * @param props.className - Additional CSS classes
 * @param props.padding - Padding size (default: "lg")
 */
export function Card(props: CardProps) {
	const padding = props.padding || "lg";

	return (
		<div
			className={cn(
				"bg-white dark:bg-gray-800 rounded-2xl shadow-lg",
				paddingClasses[padding],
				props.className,
			)}
		>
			{props.children}
		</div>
	);
}
