import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Archive,
	ArrowUpDown,
	Eye,
	EyeOff,
	FileText,
	Plus,
	Trash2,
	Upload,
} from "lucide-react";
import { useState } from "react";
import {
	AdminLayout,
	BulkActionsToolbar,
	DataTable,
	FilterBar,
	PaginationControls,
	StatCard,
	StatusBadge,
} from "~/components/admin";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import {
	useAdminTemplatesPaginatedQuery,
	useAdminTemplatesStatsQuery,
} from "~/hooks/useAdminTemplatesQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useTableSorting } from "~/hooks/useTableSorting";
import type { TemplateStatus } from "~/lib/db/types";

// Search params schema
type TemplatesSearch = {
	page?: number;
	status?: TemplateStatus | "all";
	sortBy?: "title" | "status" | "scenes" | "created" | "updated";
	sortOrder?: "asc" | "desc";
};

export const Route = createFileRoute("/admin/templates/")({
	component: TemplatesListPage,
	validateSearch: (search: Record<string, unknown>): TemplatesSearch => {
		return {
			page: Number(search.page) || 1,
			status: (search.status as TemplateStatus | "all") || "all",
			sortBy:
				(search.sortBy as
					| "title"
					| "status"
					| "scenes"
					| "created"
					| "updated") || "updated",
			sortOrder: (search.sortOrder as "asc" | "desc") || "desc",
		};
	},
});

type SortField = "title" | "status" | "scenes" | "created" | "updated";
type StatusFilter = "all" | TemplateStatus;

// Map frontend sort fields to database column names
const sortFieldMap: Record<
	SortField,
	"title" | "status" | "estimated_scenes" | "created_at" | "updated_at"
> = {
	title: "title",
	status: "status",
	scenes: "estimated_scenes",
	created: "created_at",
	updated: "updated_at",
};

function TemplatesListPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBulkUpdating, setIsBulkUpdating] = useState(false);
	const [bulkError, setBulkError] = useState<string | null>(null);

	// Get state from URL params
	const currentPage = search.page || 1;
	const statusFilter = search.status || "all";
	const itemsPerPage = 10;

	// Use table sorting hook
	const { sortField, sortOrder, handleSort } = useTableSorting({
		defaultField: "updated" as SortField,
		defaultOrder: "desc",
		currentSearch: search,
		route: "/admin/templates",
	});

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch template statistics
	const { data: statsData, isLoading: statsLoading } =
		useAdminTemplatesStatsQuery(!!userData);

	// Fetch paginated templates
	const {
		data: templatesData,
		isLoading: templatesLoading,
		error,
		refetch,
	} = useAdminTemplatesPaginatedQuery({
		page: currentPage,
		limit: itemsPerPage,
		status: statusFilter,
		sortBy: sortFieldMap[sortField],
		sortOrder: sortOrder,
		enabled: !!userData,
	});

	if (userLoading || templatesLoading || statsLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<ErrorMessage
					message={error instanceof Error ? error.message : "An error occurred"}
				/>
			</div>
		);
	}

	if (
		!userData ||
		!templatesData?.templates ||
		!templatesData?.pagination ||
		!statsData
	) {
		return null;
	}

	const { role } = userData;
	const { templates, pagination } = templatesData;

	// Reset to page 1 when filters change
	const handleFilterChange = (filter: StatusFilter) => {
		navigate({
			to: "/admin/templates",
			search: {
				...search,
				status: filter,
				page: 1,
			},
		});
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		navigate({
			to: "/admin/templates",
			search: {
				...search,
				page,
			},
		});
	};

	// Pagination metadata from server
	const totalItems = pagination.total;
	const totalPages = pagination.totalPages;

	// Stats from server (accurate counts for all statuses)
	const stats = statsData;

	const handleBulkStatusUpdate = async (
		status: "published" | "draft" | "archived",
	) => {
		setBulkError(null);
		setIsBulkUpdating(true);

		try {
			const response = await fetch("/api/admin/templates/bulk-update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					templateIds: Array.from(selectedIds),
					status,
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Bulk update failed");
			}

			// Refetch templates and clear selection
			await refetch();
			setSelectedIds(new Set());
		} catch (err) {
			setBulkError(err instanceof Error ? err.message : "Bulk update failed");
		} finally {
			setIsBulkUpdating(false);
		}
	};

	const handleBulkDelete = async () => {
		const count = selectedIds.size;
		const confirmed = window.confirm(
			`Are you sure you want to permanently delete ${count} template${count !== 1 ? "s" : ""}? This action cannot be undone.`,
		);

		if (!confirmed) {
			return;
		}

		setBulkError(null);
		setIsBulkUpdating(true);

		try {
			const response = await fetch("/api/admin/templates/bulk-delete", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					templateIds: Array.from(selectedIds),
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Bulk delete failed");
			}

			// Refetch templates and clear selection
			await refetch();
			setSelectedIds(new Set());
		} catch (err) {
			setBulkError(err instanceof Error ? err.message : "Bulk delete failed");
		} finally {
			setIsBulkUpdating(false);
		}
	};

	return (
		<AdminLayout currentPath="/admin/templates" userRole={role}>
			<Stack gap="md">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-2">
						<Heading level="h1">Template Management</Heading>
						<Text>
							Manage novel templates, including drafts and archived content.
						</Text>
					</div>
					<div className="flex gap-3">
						<Button
							type="button"
							onClick={() => navigate({ to: "/admin/templates/bulk-import" })}
							variant="secondary"
						>
							<Upload className="w-5 h-5" />
							Bulk Import
						</Button>
						<Button
							type="button"
							onClick={() => navigate({ to: "/admin/templates/new" })}
							variant="primary"
						>
							<Plus className="w-5 h-5" />
							New Template
						</Button>
					</div>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<StatCard
						title="Total Templates"
						value={stats.total}
						icon={FileText}
						color="bg-blue-500"
					/>
					<StatCard
						title="Published"
						value={stats.published}
						icon={Eye}
						color="bg-green-500"
					/>
					<StatCard
						title="Drafts"
						value={stats.draft}
						icon={EyeOff}
						color="bg-yellow-500"
					/>
					<StatCard
						title="Archived"
						value={stats.archived}
						icon={Archive}
						color="bg-gray-500"
					/>
				</div>

				{/* Status Filter */}
				<FilterBar
					label="Filter by Status:"
					filters={[
						{
							value: "all",
							label: "All",
							count: stats.total,
							activeColor: "romance",
						},
						{
							value: "published",
							label: "Published",
							count: stats.published,
							activeColor: "green",
						},
						{
							value: "draft",
							label: "Drafts",
							count: stats.draft,
							activeColor: "yellow",
						},
						{
							value: "archived",
							label: "Archived",
							count: stats.archived,
							activeColor: "gray",
						},
					]}
					activeFilter={statusFilter}
					onChange={handleFilterChange}
				/>

				{/* Bulk Actions Toolbar */}
				<BulkActionsToolbar
					selectedCount={selectedIds.size}
					onClearSelection={() => setSelectedIds(new Set())}
					actions={[
						{
							label: "Publish",
							icon: Eye,
							onClick: () => handleBulkStatusUpdate("published"),
						},
						{
							label: "Set as Draft",
							icon: EyeOff,
							onClick: () => handleBulkStatusUpdate("draft"),
						},
						{
							label: "Archive",
							icon: Archive,
							onClick: () => handleBulkStatusUpdate("archived"),
						},
						{
							label: "Delete",
							icon: Trash2,
							onClick: handleBulkDelete,
							variant: "danger",
							requiresAdmin: true,
						},
					]}
					isLoading={isBulkUpdating}
					itemLabel="template"
					userRole={role}
					error={bulkError}
					accentColor="romance"
				/>

				{/* Templates Table */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
					<DataTable
						data={templates}
						selectable={true}
						selectedIds={selectedIds}
						onSelectionChange={setSelectedIds}
						onRowClick={(template) =>
							navigate({ to: `/admin/templates/${template.id}/edit` })
						}
						columns={[
							{
								header: (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => handleSort("title")}
										className="p-0 h-auto font-normal hover:text-slate-900 dark:hover:text-gray-100"
									>
										Title
										<ArrowUpDown className="w-3 h-3" />
									</Button>
								),
								accessor: (t) => t.title,
								className: "font-medium text-slate-900",
								key: "title",
							},
							{
								header: (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => handleSort("status")}
										className="p-0 h-auto font-normal hover:text-slate-900 dark:hover:text-gray-100"
									>
										Status
										<ArrowUpDown className="w-3 h-3" />
									</Button>
								),
								accessor: (t) => <StatusBadge status={t.status} />,
								key: "status",
							},
							{
								header: "Tropes",
								accessor: (t) => t.base_tropes.join(", "),
								className: "text-slate-600 dark:text-gray-400 text-sm",
								key: "tropes",
							},
							{
								header: (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => handleSort("scenes")}
										className="p-0 h-auto font-normal hover:text-slate-900 dark:hover:text-gray-100"
									>
										Scenes
										<ArrowUpDown className="w-3 h-3" />
									</Button>
								),
								accessor: (t) => t.estimated_scenes.toString(),
								className: "text-slate-600 text-center",
								key: "scenes",
							},
							{
								header: (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => handleSort("created")}
										className="p-0 h-auto font-normal hover:text-slate-900 dark:hover:text-gray-100"
									>
										Created
										<ArrowUpDown className="w-3 h-3" />
									</Button>
								),
								accessor: (t) => new Date(t.created_at).toLocaleDateString(),
								className: "text-slate-600 text-sm",
								key: "created",
							},
							{
								header: (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => handleSort("updated")}
										className="p-0 h-auto font-normal hover:text-slate-900 dark:hover:text-gray-100"
									>
										Updated
										<ArrowUpDown className="w-3 h-3" />
									</Button>
								),
								accessor: (t) => new Date(t.updated_at).toLocaleDateString(),
								className: "text-slate-600 text-sm",
								key: "updated",
							},
						]}
						emptyMessage="No templates found. Create your first template to get started."
					/>
				</div>

				{/* Pagination Controls */}
				<PaginationControls
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
					onPageChange={handlePageChange}
					itemLabel="template"
				/>
			</Stack>
		</AdminLayout>
	);
}
