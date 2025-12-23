import { ChevronDown, Filter, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "~/components/Checkbox";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useTropesQuery } from "~/hooks/useTropesQuery";

interface TropeFilterProps {
	selectedTropeKeys: string[];
	onChange: (tropeKeys: string[]) => void;
}

export function TropeFilter(props: TropeFilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { data: tropesData, isLoading, error } = useTropesQuery();

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	const handleToggle = (tropeKey: string) => {
		if (props.selectedTropeKeys.includes(tropeKey)) {
			props.onChange(props.selectedTropeKeys.filter((key) => key !== tropeKey));
		} else {
			props.onChange([...props.selectedTropeKeys, tropeKey]);
		}
	};

	const handleRemoveAll = () => {
		props.onChange([]);
	};

	if (error || !tropesData) {
		return null;
	}

	const { tropes } = tropesData;

	// Filter tropes based on search query
	const filteredTropes = tropes.filter((trope) => {
		if (!searchQuery.trim()) return true;
		const query = searchQuery.toLowerCase();
		return trope.label.toLowerCase().includes(query);
	});

	const selectedTropes = tropes.filter((trope) =>
		props.selectedTropeKeys.includes(trope.key),
	);

	return (
		<div className="space-y-3">
			<div className="relative" ref={dropdownRef}>
				{/* Trigger Button */}
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="w-full sm:w-auto flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors text-slate-700 dark:text-gray-300 font-medium"
				>
					<Filter className="w-4 h-4" />
					<span>
						Filter by Tropes
						{props.selectedTropeKeys.length > 0 && (
							<span className="ml-1.5 px-2 py-0.5 bg-romance-100 dark:bg-romance-900/30 text-romance-700 dark:text-romance-700 rounded-full text-xs font-semibold">
								{props.selectedTropeKeys.length}
							</span>
						)}
					</span>
					<ChevronDown
						className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
					/>
				</button>

				{/* Dropdown */}
				{isOpen && (
					<div className="absolute z-50 mt-2 w-full sm:w-80 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-lg shadow-lg">
						{/* Search Input */}
						<div className="p-3 border-b border-slate-200 dark:border-gray-700">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search tropes..."
									className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-romance-500 focus:border-romance-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
								/>
							</div>
						</div>

						{/* Tropes List */}
						<div className="max-h-64 overflow-y-auto">
							{isLoading ? (
								<div className="flex items-center justify-center p-8">
									<LoadingSpinner />
								</div>
							) : filteredTropes.length === 0 ? (
								<div className="p-4 text-center text-sm text-slate-500 dark:text-gray-400">
									{searchQuery
										? `No tropes match "${searchQuery}"`
										: "No tropes available"}
								</div>
							) : (
								<div className="p-2">
									{filteredTropes.map((trope) => (
										<Checkbox
											key={trope.id}
											checked={props.selectedTropeKeys.includes(trope.key)}
											onChange={() => handleToggle(trope.key)}
											label={trope.label}
											className="p-2 rounded hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors w-full"
										/>
									))}
								</div>
							)}
						</div>

						{/* Footer with Clear All */}
						{props.selectedTropeKeys.length > 0 && (
							<div className="p-3 border-t border-slate-200 dark:border-gray-700">
								<button
									type="button"
									onClick={handleRemoveAll}
									className="w-full px-3 py-1.5 text-sm text-romance-600 dark:text-romance-500 hover:text-romance-700 dark:hover:text-romance-300 font-medium transition-colors"
								>
									Clear all filters
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Selected Tropes as Tags */}
			{selectedTropes.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{selectedTropes.map((trope) => (
						<button
							type="button"
							key={trope.key}
							onClick={() => handleToggle(trope.key)}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-romance-100 dark:bg-romance-500/20 dark:border-romance-500/30 border text-romance-700 dark:text-pink-200 rounded-full text-sm font-medium hover:bg-romance-200 dark:hover:bg-romance-900/50 transition-colors"
						>
							{trope.label}
							<X className="w-3.5 h-3.5" />
						</button>
					))}
				</div>
			)}
		</div>
	);
}
