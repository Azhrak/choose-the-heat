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

/**
 * PaginationControls - Pagination UI with page numbers and navigation buttons
 * Follows props object pattern (no destructuring)
 *
 * @param props.currentPage - Current active page number
 * @param props.totalPages - Total number of pages
 * @param props.totalItems - Total number of items across all pages
 * @param props.itemsPerPage - Number of items per page
 * @param props.onPageChange - Callback when page changes
 * @param props.itemLabel - Label for items (e.g., "template", "user")
 */
export function PaginationControls(props: PaginationControlsProps) {
	if (props.totalPages <= 1) {
		return null;
	}

	const startIndex = (props.currentPage - 1) * props.itemsPerPage;
	const endIndex = Math.min(startIndex + props.itemsPerPage, props.totalItems);

	return (
		<div className="mt-4 flex items-center justify-between">
			<div className="text-sm text-slate-600">
				Showing {startIndex + 1}-{endIndex} of {props.totalItems}{" "}
				{props.itemLabel}
				{props.totalItems !== 1 ? "s" : ""}
			</div>
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => props.onPageChange(Math.max(1, props.currentPage - 1))}
					disabled={props.currentPage === 1}
				>
					<ChevronLeft className="w-4 h-4" />
					Previous
				</Button>

				<div className="flex gap-1">
					{Array.from({ length: props.totalPages }, (_, i) => i + 1).map(
						(page) => {
							// Show first page, last page, current page, and pages around current
							const showPage =
								page === 1 ||
								page === props.totalPages ||
								Math.abs(page - props.currentPage) <= 1;

							if (!showPage) {
								// Show ellipsis for gaps
								if (
									page === props.currentPage - 2 ||
									page === props.currentPage + 2
								) {
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
									onClick={() => props.onPageChange(page)}
									className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
										props.currentPage === page
											? "bg-purple-600 text-white"
											: "bg-slate-100 text-slate-700 hover:bg-slate-200"
									}`}
								>
									{page}
								</button>
							);
						},
					)}
				</div>

				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() =>
						props.onPageChange(
							Math.min(props.totalPages, props.currentPage + 1),
						)
					}
					disabled={props.currentPage === props.totalPages}
				>
					Next
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
