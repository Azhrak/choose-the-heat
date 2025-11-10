import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	message?: string;
	className?: string;
}

const sizeClasses = {
	sm: "w-5 h-5",
	md: "w-8 h-8",
	lg: "w-12 h-12",
};

export function LoadingSpinner({
	size = "md",
	message,
	className = "",
}: LoadingSpinnerProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center py-20 ${className}`}
		>
			<Loader2
				className={`${sizeClasses[size]} text-romance-600 animate-spin`}
			/>
			{message && <p className="mt-4 text-slate-600 text-lg">{message}</p>}
		</div>
	);
}
