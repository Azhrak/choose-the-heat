import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "~/components/Checkbox";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Alert } from "~/components/ui/Alert";
import { Stack } from "~/components/ui/Stack";
import { useTropesQuery } from "~/hooks/useTropesQuery";

interface TropeSelectorProps {
	label: string;
	selectedTropeKeys: string[];
	onChange: (tropeKeys: string[]) => void;
	required?: boolean;
	helperText?: string;
}

/**
 * TropeSelector - Multi-select component for choosing tropes with search
 * Follows props object pattern (no destructuring)
 *
 * @param props.label - Label for the selector
 * @param props.selectedTropeKeys - Currently selected trope keys
 * @param props.onChange - Callback when selection changes
 * @param props.required - Whether selection is required (default: false)
 * @param props.helperText - Optional helper text
 */
export function TropeSelector(props: TropeSelectorProps) {
	const required = props.required || false;
	const [searchQuery, setSearchQuery] = useState("");
	const [isExpanded, setIsExpanded] = useState(false);
	const { data: tropesData, isLoading, error } = useTropesQuery();

	const handleToggle = (tropeKey: string) => {
		if (props.selectedTropeKeys.includes(tropeKey)) {
			// Remove the trope
			props.onChange(props.selectedTropeKeys.filter((key) => key !== tropeKey));
		} else {
			// Add the trope
			props.onChange([...props.selectedTropeKeys, tropeKey]);
		}
	};

	if (isLoading) {
		return (
			<Stack gap="xs">
				<div className="block text-sm font-medium text-slate-900 dark:text-gray-100">
					{props.label} {required && <span className="text-red-500">*</span>}
				</div>
				<div className="flex items-center justify-center p-8 border border-slate-300 dark:border-gray-600 rounded-lg">
					<LoadingSpinner />
				</div>
			</Stack>
		);
	}

	if (error || !tropesData) {
		return (
			<Stack gap="xs">
				<div className="block text-sm font-medium text-slate-900 dark:text-gray-100">
					{props.label} {required && <span className="text-red-500">*</span>}
				</div>
				<Alert message="Failed to load tropes" variant="error" />
			</Stack>
		);
	}

	const { tropes } = tropesData;

	// Filter tropes based on search query
	const filteredTropes = tropes.filter((trope) => {
		if (!searchQuery.trim()) return true;
		const query = searchQuery.toLowerCase();
		return (
			trope.label.toLowerCase().includes(query) ||
			trope.key.toLowerCase().includes(query) ||
			trope.description?.toLowerCase().includes(query)
		);
	});

	return (
		<Stack gap="xs">
			<div className="block text-sm font-medium text-slate-900 dark:text-gray-100">
				{props.label} {required && <span className="text-red-500">*</span>}
			</div>

			{props.helperText && (
				<p className="text-sm text-slate-600 dark:text-gray-400">
					{props.helperText}
				</p>
			)}

			{/* Search Input */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search tropes..."
					className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-romance-500 focus:border-romance-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
				/>
			</div>

			<div className="relative">
				<div
					className={`border border-slate-300 dark:border-gray-600 rounded-lg p-4 space-y-2 overflow-y-auto bg-white dark:bg-gray-800 transition-all ${
						isExpanded ? "max-h-[600px]" : "max-h-64"
					}`}
				>
					{tropes.length === 0 ? (
						<p className="text-sm text-slate-500 dark:text-gray-400 text-center py-4">
							No tropes available. Please add tropes first.
						</p>
					) : filteredTropes.length === 0 ? (
						<p className="text-sm text-slate-500 dark:text-gray-400 text-center py-4">
							No tropes match "{searchQuery}"
						</p>
					) : (
						filteredTropes.map((trope) => (
							<div
								key={trope.id}
								className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
							>
								<Checkbox
									checked={props.selectedTropeKeys.includes(trope.key)}
									onChange={() => handleToggle(trope.key)}
									label={trope.label}
									description={trope.description ?? undefined}
								/>
							</div>
						))
					)}
				</div>

				{/* Expand/Collapse Button */}
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					className="absolute bottom-2 right-2 flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-md text-sm text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
				>
					{isExpanded ? (
						<>
							<ChevronUp className="w-4 h-4" />
							Show Less
						</>
					) : (
						<>
							<ChevronDown className="w-4 h-4" />
							Show More
						</>
					)}
				</button>
			</div>

			{props.selectedTropeKeys.length > 0 && (
				<div className="flex flex-wrap gap-2 mt-2">
					{props.selectedTropeKeys.map((key) => {
						const trope = tropes.find((t) => t.key === key);
						return (
							<span
								key={key}
								className="inline-flex items-center gap-1 px-2 py-1 bg-romance-100 dark:bg-romance-900/30 text-romance-700 dark:text-romance-600 rounded-md text-sm"
							>
								{trope?.label || key}
								<button
									type="button"
									onClick={() => handleToggle(key)}
									className="hover:text-romance-900 dark:hover:text-romance-100"
									aria-label={`Remove ${trope?.label || key}`}
								>
									×
								</button>
							</span>
						);
					})}
				</div>
			)}
		</Stack>
	);
}
