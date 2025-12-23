import { Button } from "~/components/Button";

interface FilterOption<T = string> {
	value: T;
	label: string;
	count: number;
	activeColor:
		| "purple"
		| "slate"
		| "blue"
		| "purple-dark"
		| "green"
		| "yellow"
		| "gray"
		| "romance";
}

interface FilterBarProps<T = string> {
	label: string;
	filters: FilterOption<T>[];
	activeFilter: T;
	onChange: (value: T) => void;
}

const activeColorClasses = {
	purple: "!bg-purple-600 hover:!bg-purple-700 !text-white",
	slate:
		"!bg-slate-600 hover:!bg-slate-700 !text-white dark:!bg-slate-500 dark:hover:!bg-slate-600",
	blue: "!bg-blue-600 hover:!bg-blue-700 !text-white",
	"purple-dark": "!bg-purple-700 hover:!bg-purple-800 !text-white",
	green: "!bg-green-600 hover:!bg-green-700 !text-white",
	yellow: "!bg-yellow-600 hover:!bg-yellow-700 !text-white",
	gray: "!bg-gray-600 hover:!bg-gray-700 !text-white",
	romance: "!bg-romance-600 hover:!bg-romance-700 !text-white",
};

/**
 * FilterBar - Horizontal filter buttons with counts
 * Follows props object pattern (no destructuring)
 *
 * @param props.label - Label for the filter bar
 * @param props.filters - Array of filter options with counts
 * @param props.activeFilter - Currently active filter value
 * @param props.onChange - Callback when filter changes
 */
export function FilterBar<T extends string = string>(props: FilterBarProps<T>) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4">
			<div className="flex items-center gap-3">
				<span className="text-sm font-medium text-slate-700 dark:text-gray-300">
					{props.label}
				</span>
				<div className="flex gap-2">
					{props.filters.map((filter) => (
						<Button
							key={filter.value as string}
							type="button"
							variant="secondary"
							size="sm"
							onClick={() => props.onChange(filter.value)}
							className={
								props.activeFilter === filter.value
									? activeColorClasses[filter.activeColor]
									: ""
							}
						>
							{filter.label} ({filter.count})
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
