import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	className?: string;
}

export function Pagination(props: PaginationProps) {
	if (props.totalPages <= 1) {
		return null;
	}

	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		const maxVisiblePages = 7;

		if (props.totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			for (let i = 1; i <= props.totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			// Calculate range around current page
			let startPage = Math.max(2, props.currentPage - 1);
			let endPage = Math.min(props.totalPages - 1, props.currentPage + 1);

			// Adjust range if near start or end
			if (props.currentPage <= 3) {
				endPage = 5;
			} else if (props.currentPage >= props.totalPages - 2) {
				startPage = props.totalPages - 4;
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
			if (endPage < props.totalPages - 1) {
				pages.push("...");
			}

			// Always show last page
			pages.push(props.totalPages);
		}

		return pages;
	};

	return (
		<div
			className={cn("flex items-center justify-center gap-2", props.className)}
		>
			{/* Previous Button */}
			<button
				type="button"
				onClick={() => props.onPageChange(props.currentPage - 1)}
				disabled={props.currentPage === 1}
				className={cn(
					"flex items-center justify-center w-10 h-10 rounded-lg border transition-colors",
					props.currentPage === 1
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
					// Use the previous page number to create a unique key for ellipsis
					const pages = getPageNumbers();
					const prevPage = index > 0 ? pages[index - 1] : 0;
					return (
						<span
							key={`ellipsis-after-${prevPage}`}
							className="flex items-center justify-center w-10 h-10 text-slate-500"
						>
							...
						</span>
					);
				}

				const pageNumber = page as number;
				const isActive = pageNumber === props.currentPage;

				return (
					<button
						type="button"
						key={pageNumber}
						onClick={() => props.onPageChange(pageNumber)}
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
				type="button"
				onClick={() => props.onPageChange(props.currentPage + 1)}
				disabled={props.currentPage === props.totalPages}
				className={cn(
					"flex items-center justify-center w-10 h-10 rounded-lg border transition-colors",
					props.currentPage === props.totalPages
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
