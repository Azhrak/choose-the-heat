import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	children: ReactNode;
	className?: string;
}

const variantClasses = {
	primary: "bg-romance-600 text-white hover:bg-romance-700",
	secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
	outline: "border-2 border-romance-600 text-romance-600 hover:bg-romance-50",
	danger: "bg-red-600 text-white hover:bg-red-700",
	ghost: "text-slate-700 hover:bg-slate-50",
};

const sizeClasses = {
	sm: "px-4 py-2 text-sm",
	md: "px-6 py-3",
	lg: "px-8 py-4 text-lg",
};

export function Button({
	variant = "primary",
	size = "md",
	loading = false,
	children,
	className = "",
	disabled,
	...props
}: ButtonProps) {
	return (
		<button
			className={cn(
				"rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 cursor-pointer",
				variantClasses[variant],
				sizeClasses[size],
				(disabled || loading) && "opacity-50 cursor-not-allowed",
				className,
			)}
			disabled={disabled || loading}
			{...props}
		>
			{loading && <Loader2 className="w-5 h-5 animate-spin" />}
			{children}
		</button>
	);
}
