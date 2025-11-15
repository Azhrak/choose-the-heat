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

const colorClasses = {
	purple: "bg-purple-600",
	slate: "bg-slate-600",
	blue: "bg-blue-600",
	"purple-dark": "bg-purple-700",
	green: "bg-green-600",
	yellow: "bg-yellow-600",
	gray: "bg-gray-600",
	romance: "bg-romance-600",
};

export function FilterBar<T extends string = string>({
	label,
	filters,
	activeFilter,
	onChange,
}: FilterBarProps<T>) {
	return (
		<div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
			<div className="flex items-center gap-3">
				<span className="text-sm font-medium text-slate-700">{label}</span>
				<div className="flex gap-2">
					{filters.map((filter) => (
						<button
							key={filter.value as string}
							type="button"
							onClick={() => onChange(filter.value)}
							className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
								activeFilter === filter.value
									? `${colorClasses[filter.activeColor]} text-white`
									: "bg-slate-100 text-slate-700 hover:bg-slate-200"
							}`}
						>
							{filter.label} ({filter.count})
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
