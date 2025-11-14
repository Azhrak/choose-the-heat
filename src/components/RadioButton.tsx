import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface RadioButtonProps {
	selected: boolean;
	onClick: () => void;
	children: ReactNode;
	className?: string;
}

export function RadioButton({
	selected,
	onClick,
	children,
	className,
}: RadioButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"w-full p-4 rounded-lg border-2 transition-all text-left cursor-pointer",
				selected
					? "border-romance-500 bg-romance-50"
					: "border-slate-200 hover:border-romance-300",
				className,
			)}
		>
			<div className="flex items-center justify-between">
				<div className="flex-1">{children}</div>
				<div
					className={cn(
						"w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3",
						selected ? "border-romance-500 bg-romance-500" : "border-slate-300",
					)}
				>
					{selected && <div className="w-2 h-2 bg-white rounded-full" />}
				</div>
			</div>
		</button>
	);
}
