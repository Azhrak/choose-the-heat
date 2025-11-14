import type { TextareaHTMLAttributes } from "react";
import { cn } from "~/lib/utils";

interface FormTextareaProps
	extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label: string;
	error?: string;
	helperText?: string;
	containerClassName?: string;
	labelClassName?: string;
}

export function FormTextarea({
	label,
	error,
	helperText,
	containerClassName = "",
	labelClassName = "",
	className = "",
	id,
	...props
}: FormTextareaProps) {
	const textareaId = id || label.toLowerCase().replace(/\s+/g, "-");

	return (
		<div className={containerClassName}>
			<label
				htmlFor={textareaId}
				className={cn(
					"block text-sm font-medium text-slate-700 mb-1",
					labelClassName,
				)}
			>
				{label}
			</label>
			<textarea
				id={textareaId}
				className={cn(
					"w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-romance-500 focus:border-transparent transition-colors",
					error ? "border-red-300 focus:ring-red-500" : "border-slate-300",
					className,
				)}
				{...props}
			/>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
			{helperText && !error && (
				<p className="mt-1 text-xs text-slate-500">{helperText}</p>
			)}
		</div>
	);
}
