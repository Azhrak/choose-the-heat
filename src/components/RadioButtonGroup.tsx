interface RadioOption<T extends string> {
	value: T;
	label: string;
	description: string;
}

interface RadioButtonGroupProps<T extends string> {
	label: string;
	value: T | null;
	options: RadioOption<T>[];
	onChange: (value: T) => void;
	columns?: 1 | 2 | 3;
}

/**
 * Generic radio button group component
 * Used for pacing, scene length, and other preference selections
 */
export function RadioButtonGroup<T extends string>({
	label,
	value,
	options,
	onChange,
	columns = 2,
}: RadioButtonGroupProps<T>) {
	const gridClass = {
		1: "grid-cols-1",
		2: "grid-cols-2",
		3: "grid-cols-3",
	}[columns];

	return (
		<div className="space-y-3">
			<div className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
				{label}
			</div>
			<div className={`grid ${gridClass} gap-3`}>
				{options.map((option) => (
					<button
						key={option.value}
						type="button"
						onClick={() => onChange(option.value)}
						className={`p-4 rounded-lg border-2 transition-all text-left ${
							value === option.value
								? "border-romance-600 bg-romance-50 dark:bg-romance-900/20"
								: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
						}`}
					>
						<div className="space-y-1">
							<div className="font-semibold text-slate-900 dark:text-slate-100">
								{option.label}
							</div>
							<div className="text-sm text-slate-600 dark:text-slate-400">
								{option.description}
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
