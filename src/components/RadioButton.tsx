import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface RadioButtonProps {
	selected: boolean;
	onClick: () => void;
	children: ReactNode;
	className?: string;
}

export function RadioButton(props: RadioButtonProps) {
	return (
		<button
			type="button"
			onClick={props.onClick}
			className={cn(
				"w-full p-4 rounded-lg border-2 transition-all text-left cursor-pointer",
				props.selected
					? "border-romance-500 bg-romance-50 dark:bg-romance-500/20"
					: "border-slate-200 dark:border-gray-600 hover:border-romance-300 dark:hover:border-romance-500",
				props.className,
			)}
		>
			<div className="flex items-center justify-between">
				<div className="flex-1">{props.children}</div>
				<div
					className={cn(
						"w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3",
						props.selected
							? "border-romance-500 bg-romance-500"
							: "border-slate-300 dark:border-gray-600",
					)}
				>
					{props.selected && <div className="w-2 h-2 bg-white rounded-full" />}
				</div>
			</div>
		</button>
	);
}
