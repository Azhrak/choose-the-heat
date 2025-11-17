import type { ReactNode } from "react";
import { Checkbox } from "~/components/Checkbox";
import { cn } from "~/lib/utils";

interface Column<T> {
	key: string;
	header: string | ReactNode;
	accessor: keyof T | ((row: T) => ReactNode);
	className?: string;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	onRowClick?: (row: T) => void;
	emptyMessage?: string;
	className?: string;
	// Selection props
	selectable?: boolean;
	selectedIds?: Set<string>;
	onSelectionChange?: (selectedIds: Set<string>) => void;
}

export function DataTable<T extends { id: string }>({
	columns,
	data,
	onRowClick,
	emptyMessage = "No data available",
	className,
	selectable = false,
	selectedIds = new Set(),
	onSelectionChange,
}: DataTableProps<T>) {
	const getCellValue = (row: T, column: Column<T>) => {
		if (typeof column.accessor === "function") {
			return column.accessor(row);
		}
		return row[column.accessor] as ReactNode;
	};

	const handleSelectAll = (checked: boolean) => {
		if (!onSelectionChange) return;

		if (checked) {
			const allIds = new Set(data.map((row) => row.id));
			onSelectionChange(allIds);
		} else {
			onSelectionChange(new Set());
		}
	};

	const handleSelectRow = (rowId: string, checked: boolean) => {
		if (!onSelectionChange) return;

		const newSelection = new Set(selectedIds);
		if (checked) {
			newSelection.add(rowId);
		} else {
			newSelection.delete(rowId);
		}
		onSelectionChange(newSelection);
	};

	const isAllSelected = data.length > 0 && selectedIds.size === data.length;
	const isSomeSelected = selectedIds.size > 0 && selectedIds.size < data.length;

	if (data.length === 0) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-12 text-center">
				<p className="text-slate-500 dark:text-gray-400">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden",
				className,
			)}
		>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900">
							{selectable && (
								<th className="px-6 py-3 w-12">
									<Checkbox
										checked={isAllSelected}
										indeterminate={isSomeSelected}
										onChange={(e) => handleSelectAll(e.target.checked)}
									/>
								</th>
							)}
							{columns.map((column, index) => (
								<th
									key={column.key ?? `column-${index}`}
									className={cn(
										"px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider",
										column.className,
									)}
								>
									{column.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-gray-700">
						{data.map((row) => (
							<tr
								key={row.id}
								onClick={() => onRowClick?.(row)}
								className={cn(
									"hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors",
									selectedIds.has(row.id) &&
										"bg-romance-50 dark:bg-romance-500/20",
									onRowClick && "cursor-pointer",
								)}
							>
								{selectable && (
									<td
										className="px-6 py-4 w-12"
										onClick={(e) => e.stopPropagation()}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.stopPropagation();
											}
										}}
									>
										<Checkbox
											checked={selectedIds.has(row.id)}
											onChange={(e) => {
												handleSelectRow(row.id, e.target.checked);
											}}
										/>
									</td>
								)}
								{columns.map((column, index) => (
									<td
										key={column.key ?? `column-${index}`}
										className={cn(
											"px-6 py-4 text-sm text-slate-900 dark:text-gray-100",
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
