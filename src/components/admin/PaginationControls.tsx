import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/Button";

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
	itemLabel: string;
}

export function PaginationControls({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
	itemLabel,
}: PaginationControlsProps) {
	if (totalPages <= 1) {
		return null;
	}

	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

	return (
		<div className="mt-4 flex items-center justify-between">
			<div className="text-sm text-slate-600">
				Showing {startIndex + 1}-{endIndex} of {totalItems} {itemLabel}
				{totalItems !== 1 ? "s" : ""}
			</div>
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
				>
					<ChevronLeft className="w-4 h-4" />
					Previous
				</Button>

				<div className="flex gap-1">
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
						// Show first page, last page, current page, and pages around current
						const showPage =
							page === 1 ||
							page === totalPages ||
							Math.abs(page - currentPage) <= 1;

						if (!showPage) {
							// Show ellipsis for gaps
							if (page === currentPage - 2 || page === currentPage + 2) {
								return (
									<span key={page} className="px-3 py-1.5 text-slate-500">
										...
									</span>
								);
							}
							return null;
						}

						return (
							<button
								key={page}
								type="button"
								onClick={() => onPageChange(page)}
								className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
									currentPage === page
										? "bg-purple-600 text-white"
										: "bg-slate-100 text-slate-700 hover:bg-slate-200"
								}`}
							>
								{page}
							</button>
						);
					})}
				</div>

				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
				>
					Next
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
