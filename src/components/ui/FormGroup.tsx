import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface FormGroupProps {
	spacing?: "sm" | "md" | "lg";
	className?: string;
	children: ReactNode;
}

const spacingClasses = {
	sm: "space-y-4",
	md: "space-y-6",
	lg: "space-y-8",
};

export function FormGroup({
	spacing = "md",
	className = "",
	children,
}: FormGroupProps) {
	return (
		<div className={cn(spacingClasses[spacing], className)}>{children}</div>
	);
}
