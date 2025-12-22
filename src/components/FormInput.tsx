import type { InputHTMLAttributes } from "react";
import { cn } from "~/lib/utils";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
	helperText?: string;
	containerClassName?: string;
	labelClassName?: string;
}

/**
 * FormInput - Reusable form input component with label, error, and helper text
 * Follows props object pattern (no destructuring) and parent-controlled spacing
 *
 * @param props.label - Input label text (required)
 * @param props.error - Error message to display
 * @param props.helperText - Helper text to display when no error
 * @param props.containerClassName - Additional classes for the container
 * @param props.labelClassName - Additional classes for the label
 * @param props.className - Additional classes for the input
 * @param props.id - Input ID (auto-generated from label if not provided)
 */
export function FormInput(props: FormInputProps) {
	const inputId = props.id || props.label.toLowerCase().replace(/\s+/g, "-");

	// Separate FormInputProps from HTML input props
	const {
		label,
		error,
		helperText,
		containerClassName,
		labelClassName,
		className,
		...inputProps
	} = props;

	return (
		<div className={cn("space-y-1", containerClassName)}>
			<label
				htmlFor={inputId}
				className={cn(
					"block text-sm font-medium text-slate-700 dark:text-gray-300",
					labelClassName,
				)}
			>
				{label}
			</label>
			<input
				id={inputId}
				className={cn(
					"w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-romance-500 focus:border-transparent transition-colors dark:bg-gray-800 dark:text-gray-100",
					error
						? "border-red-300 focus:ring-red-500"
						: "border-slate-300 dark:border-gray-600",
					className,
				)}
				{...inputProps}
			/>
			{error && (
				<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
			)}
			{helperText && !error && (
				<p className="text-xs text-slate-500 dark:text-gray-400">
					{helperText}
				</p>
			)}
		</div>
	);
}
