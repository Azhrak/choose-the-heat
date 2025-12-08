/**
 * Reusable select dropdown component with consistent styling
 * Used for form inputs across admin and settings pages
 */
export function FormSelect<T extends string>(props: {
	id: string;
	label: string;
	value: T;
	options: Array<{ value: T; label: string }>;
	onChange: (value: T) => void;
	disabled?: boolean;
	className?: string;
}) {
	return (
		<div className={props.className}>
			<label
				htmlFor={props.id}
				className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2"
			>
				{props.label}
			</label>
			<select
				id={props.id}
				value={props.value}
				onChange={(e) => props.onChange(e.target.value as T)}
				disabled={props.disabled}
				className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{props.options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
