import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface Column<T> {
	header: string;
	accessor: keyof T | ((row: T) => ReactNode);
	className?: string;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	onRowClick?: (row: T) => void;
	emptyMessage?: string;
	className?: string;
}

export function DataTable<T extends { id: string }>({
	columns,
	data,
	onRowClick,
	emptyMessage = "No data available",
	className,
}: DataTableProps<T>) {
	const getCellValue = (row: T, column: Column<T>) => {
		if (typeof column.accessor === "function") {
			return column.accessor(row);
		}
		return row[column.accessor] as ReactNode;
	};

	if (data.length === 0) {
		return (
			<div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
				<p className="text-slate-500">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"bg-white rounded-lg border border-slate-200 overflow-hidden",
				className,
			)}
		>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-slate-200 bg-slate-50">
							{columns.map((column, index) => (
								<th
									key={index}
									className={cn(
										"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider",
										column.className,
									)}
								>
									{column.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200">
						{data.map((row) => (
							<tr
								key={row.id}
								onClick={() => onRowClick?.(row)}
								className={cn(
									"hover:bg-slate-50 transition-colors",
									onRowClick && "cursor-pointer",
								)}
							>
								{columns.map((column, index) => (
									<td
										key={index}
										className={cn(
											"px-6 py-4 text-sm text-slate-900",
											column.className,
										)}
									>
										{getCellValue(row, column)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
