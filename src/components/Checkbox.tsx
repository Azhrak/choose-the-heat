import { Check, Minus } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "~/lib/utils";

interface CheckboxProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	label?: ReactNode;
	description?: string;
	indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	function Checkbox(
		{ label, description, className, id, indeterminate, ...props },
		ref,
	) {
		const checkboxId =
			id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

		return (
			<label
				htmlFor={checkboxId}
				className={cn(
					"flex items-start gap-3 cursor-pointer w-fit",
					props.disabled && "opacity-50 cursor-not-allowed",
					className,
				)}
			>
				<div className="relative flex items-center">
					<input
						type="checkbox"
						id={checkboxId}
						ref={ref}
						className="sr-only peer"
						{...props}
					/>
					<div
						className={cn(
							"w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
							"border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700",
							"peer-checked:bg-romance-600 peer-checked:border-romance-600 dark:peer-checked:bg-romance-500 dark:peer-checked:border-romance-500",
							"peer-focus-visible:ring-2 peer-focus-visible:ring-romance-500 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-gray-900",
							"peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
							indeterminate &&
								"bg-romance-600 border-romance-600 dark:bg-romance-500 dark:border-romance-500",
						)}
					>
						{indeterminate ? (
							<Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
						) : (
							<Check
								className={cn(
									"w-3.5 h-3.5 text-white transition-transform",
									props.checked ? "scale-100" : "scale-0",
								)}
								strokeWidth={3}
							/>
						)}
					</div>
				</div>
				{(label || description) && (
					<div className="flex flex-col gap-0.5">
						{label && (
							<span className="text-sm font-medium text-slate-700 dark:text-gray-300">
								{label}
							</span>
						)}
						{description && (
							<span className="text-xs text-slate-500 dark:text-gray-400">
								{description}
							</span>
						)}
					</div>
				)}
			</label>
		);
	},
);
