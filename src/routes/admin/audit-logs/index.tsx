import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calendar, FileText, Users } from "lucide-react";
import {
	AdminLayout,
	NoPermissions,
	PaginationControls,
} from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import { useAuditLogsPaginatedQuery } from "~/hooks/useAuditLogsQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import type { AuditEntityType } from "~/lib/db/types";

// Search params schema
type AuditLogsSearch = {
	page?: number;
	entityType?: AuditEntityType | "all";
};

export const Route = createFileRoute("/admin/audit-logs/")({
	component: AuditLogsPage,
	validateSearch: (search: Record<string, unknown>): AuditLogsSearch => {
		return {
			page: Number(search.page) || 1,
			entityType: (search.entityType as AuditEntityType | "all") || "all",
		};
	},
});

function AuditLogsPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();

	// Get state from URL params
	const currentPage = search.page || 1;
	const entityTypeFilter = search.entityType || "all";
	const itemsPerPage = 20;

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch paginated audit logs with filters
	const {
		data: logsData,
		isLoading: logsLoading,
		error,
	} = useAuditLogsPaginatedQuery({
		page: currentPage,
		limit: itemsPerPage,
		entityType: entityTypeFilter,
		enabled: !!userData && userData.role === "admin",
	});

	if (userLoading || logsLoading) {
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

	if (!userData) {
		return null;
	}

	// Check if user is admin
	if (userData.role !== "admin") {
		return (
			<NoPermissions
				title="Admin Access Required"
				message="Audit logs are restricted to administrators only. You need admin privileges to access this page."
				backTo="/admin"
			/>
		);
	}

	if (!logsData?.logs || !logsData?.pagination) {
		return null;
	}

	const { role } = userData;
	const { logs, pagination } = logsData;

	// Reset to page 1 when entity type filter changes
	const handleEntityTypeChange = (entityType: AuditEntityType | "all") => {
		navigate({
			to: "/admin/audit-logs",
			search: {
				...search,
				entityType,
				page: 1,
			},
		});
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		navigate({
			to: "/admin/audit-logs",
			search: {
				...search,
				page,
			},
		});
	};

	// Handle clearing all filters
	const handleClearFilters = () => {
		navigate({
			to: "/admin/audit-logs",
			search: {
				page: 1,
				entityType: "all",
			},
		});
	};

	// Pagination metadata from server
	const totalItems = pagination.total;
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	// Calculate simple statistics from current page
	const stats = {
		total: totalItems,
		template: logs.filter((l) => l.entityType === "template").length,
		user: logs.filter((l) => l.entityType === "user").length,
		today: logs.filter(
			(l) => new Date(l.createdAt).toDateString() === new Date().toDateString(),
		).length,
	};

	return (
		<AdminLayout currentPath="/admin/audit-logs" userRole={role}>
			<Stack gap="md">
				<div className="flex flex-col gap-2">
					<Heading level="h1">Audit Logs</Heading>
					<Text>
						View all administrative actions and changes. Logs are retained for
						90 days.
					</Text>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<StatBox
						label="Total Logs"
						value={stats.total}
						icon={FileText}
						color="slate"
					/>
					<StatBox
						label="Template Actions"
						value={stats.template}
						icon={FileText}
						color="blue"
					/>
					<StatBox
						label="User Actions"
						value={stats.user}
						icon={Users}
						color="purple"
					/>
					<StatBox
						label="Today"
						value={stats.today}
						icon={Calendar}
						color="green"
					/>
				</div>

				{/* Filters */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Stack gap="xs">
							<label
								htmlFor="entityType"
								className="block text-sm font-medium text-slate-900 dark:text-gray-100"
							>
								Entity Type
							</label>
							<select
								id="entityType"
								value={entityTypeFilter}
								onChange={(e) =>
									handleEntityTypeChange(
										e.target.value as AuditEntityType | "all",
									)
								}
								className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
							>
								<option value="all">All Types</option>
								<option value="template">Templates</option>
								<option value="user">Users</option>
							</select>
						</Stack>
						<div className="flex items-end">
							<button
								type="button"
								onClick={handleClearFilters}
								className="px-4 py-2 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-gray-100 transition-colors"
							>
								Clear Filters
							</button>
						</div>
					</div>
				</div>

				{/* Audit Logs Table */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
					{logs.length === 0 ? (
						<div className="p-8 text-center text-slate-600 dark:text-gray-400">
							No audit logs found matching your filters.
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider">
											Timestamp
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider">
											User
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider">
											Action
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider">
											Entity Type
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider">
											Entity ID
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-gray-400 uppercase tracking-wider">
											Changes
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200 dark:divide-gray-700">
									{logs.map((log) => (
										<tr
											key={log.id}
											className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
										>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-gray-400">
												{new Date(log.createdAt).toLocaleString()}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												<div className="text-slate-900 dark:text-gray-100 font-medium">
													{log.userName || "Unknown"}
												</div>
												<div className="text-slate-500 dark:text-gray-400 text-xs">
													{log.userEmail || log.userId}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
													{log.action}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														log.entityType === "template"
															? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
															: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
													}`}
												>
													{log.entityType}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600 dark:text-gray-400">
												{log.entityId
													? `${log.entityId.substring(0, 8)}...`
													: "N/A"}
											</td>
											<td className="px-6 py-4 text-sm text-slate-600 dark:text-gray-400">
												{log.changes ? (
													<details className="cursor-pointer">
														<summary className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
															View Changes
														</summary>
														<pre className="mt-2 p-2 bg-slate-50 dark:bg-gray-900 rounded text-xs overflow-auto max-w-md">
															{JSON.stringify(log.changes, null, 2)}
														</pre>
													</details>
												) : (
													<span className="text-slate-400 dark:text-gray-500">
														No changes
													</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Pagination Controls */}
				<PaginationControls
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
					onPageChange={handlePageChange}
					itemLabel="log"
				/>

				{/* Info Box */}
				<div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
					<p className="text-sm text-blue-800 dark:text-blue-200">
						<strong>Retention Policy:</strong> Audit logs are automatically
						deleted after 90 days. Use the cleanup script to manually remove
						older logs:{" "}
						<code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
							pnpm cleanup:audit-logs [days]
						</code>
					</p>
				</div>
			</Stack>
		</AdminLayout>
	);
}

interface StatBoxProps {
	label: string;
	value: number;
	icon: React.ElementType;
	color: "slate" | "blue" | "purple" | "green";
}

function StatBox({ label, value, icon: Icon, color }: StatBoxProps) {
	const colorClasses = {
		slate: "bg-slate-50 text-slate-600",
		blue: "bg-blue-50 text-blue-600",
		purple: "bg-purple-50 text-purple-600",
		green: "bg-green-50 text-green-600",
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-4">
			<div className="flex items-center gap-3">
				<div className={`p-2 rounded-lg ${colorClasses[color]}`}>
					<Icon className="w-5 h-5" />
				</div>
				<div>
					<p className="text-sm text-slate-600 dark:text-gray-400">{label}</p>
					<p className="text-2xl font-bold text-slate-900 dark:text-gray-100">
						{value}
					</p>
				</div>
			</div>
		</div>
	);
}
