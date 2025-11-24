import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
	className,
}: PaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisiblePages = 7;

		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			// Calculate range around current page
			let startPage = Math.max(2, currentPage - 1);
			let endPage = Math.min(totalPages - 1, currentPage + 1);

			// Adjust range if near start or end
			if (currentPage <= 3) {
				endPage = 5;
			} else if (currentPage >= totalPages - 2) {
				startPage = totalPages - 4;
			}

			// Add ellipsis after first page if needed
			if (startPage > 2) {
				pages.push("...");
			}

			// Add middle pages
			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}

			// Add ellipsis before last page if needed
			if (endPage < totalPages - 1) {
				pages.push("...");
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
	};

	return (
		<div className={cn("flex items-center justify-center gap-2", className)}>
			{/* Previous Button */}
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className={cn(
					"flex items-center justify-center w-10 h-10 rounded-lg border transition-colors",
					currentPage === 1
						? "border-slate-200 text-slate-400 cursor-not-allowed"
						: "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-romance-300",
				)}
				aria-label="Previous page"
			>
				<ChevronLeft className="w-5 h-5" />
			</button>

			{/* Page Numbers */}
			{getPageNumbers().map((page, index) => {
				if (page === "...") {
					return (
						<span
							key={`ellipsis-${index}`}
							className="flex items-center justify-center w-10 h-10 text-slate-500"
						>
							...
						</span>
					);
				}

				const pageNumber = page as number;
				const isActive = pageNumber === currentPage;

				return (
					<button
						key={pageNumber}
						onClick={() => onPageChange(pageNumber)}
						className={cn(
							"flex items-center justify-center w-10 h-10 rounded-lg border font-medium transition-colors",
							isActive
								? "bg-romance-600 border-romance-600 text-white"
								: "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-romance-300",
						)}
						aria-label={`Page ${pageNumber}`}
						aria-current={isActive ? "page" : undefined}
					>
						{pageNumber}
					</button>
				);
			})}

			{/* Next Button */}
			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className={cn(
					"flex items-center justify-center w-10 h-10 rounded-lg border transition-colors",
					currentPage === totalPages
						? "border-slate-200 text-slate-400 cursor-not-allowed"
						: "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-romance-300",
				)}
				aria-label="Next page"
			>
				<ChevronRight className="w-5 h-5" />
			</button>
		</div>
	);
}
