import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface StackProps {
	direction?: "vertical" | "horizontal";
	gap?: "xs" | "sm" | "md" | "lg" | "xl" | "none";
	align?: "start" | "center" | "end" | "stretch";
	className?: string;
	children: ReactNode;
}

const gapClasses = {
	vertical: {
		none: "",
		xs: "space-y-2",
		sm: "space-y-4",
		md: "space-y-6",
		lg: "space-y-8",
		xl: "space-y-12",
	},
	horizontal: {
		none: "",
		xs: "space-x-2",
		sm: "space-x-4",
		md: "space-x-6",
		lg: "space-x-8",
		xl: "space-x-12",
	},
};

const alignClasses = {
	vertical: {
		start: "items-start",
		center: "items-center",
		end: "items-end",
		stretch: "items-stretch",
	},
	horizontal: {
		start: "justify-start",
		center: "justify-center",
		end: "justify-end",
		stretch: "justify-stretch",
	},
};

/**
 * Stack - Layout component for vertical or horizontal stacking with consistent gaps
 * Follows props object pattern (no destructuring)
 *
 * @param props.direction - Stack direction (default: "vertical")
 * @param props.gap - Gap size between items (default: "md")
 * @param props.align - Alignment of items (default: "stretch")
 * @param props.className - Additional CSS classes
 * @param props.children - Stack content
 */
export function Stack(props: StackProps) {
	const direction = props.direction || "vertical";
	const gap = props.gap || "md";
	const align = props.align || "stretch";

	const isHorizontal = direction === "horizontal";
	const gapClass = gapClasses[direction][gap];
	const alignClass = alignClasses[direction][align];
	const flexDirection = isHorizontal ? "flex-row" : "flex-col";

	return (
		<div
			className={cn(
				"flex",
				flexDirection,
				gapClass,
				alignClass,
				props.className,
			)}
		>
			{props.children}
		</div>
	);
}
