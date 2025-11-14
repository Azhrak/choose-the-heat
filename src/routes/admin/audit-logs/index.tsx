import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calendar, FileText, Search, Users } from "lucide-react";
import { useState } from "react";
import { AdminLayout, NoPermissions } from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useAuditLogsQuery } from "~/hooks/useAuditLogsQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import type { AuditEntityType } from "~/lib/db/types";

export const Route = createFileRoute("/admin/audit-logs/")({
	component: AuditLogsPage,
});

interface AuditLog {
	id: string;
	userId: string;
	action: string;
	entityType: AuditEntityType;
	entityId: string | null;
	changes: Record<string, any> | null;
	createdAt: string;
	userEmail?: string;
	userName?: string;
}

function AuditLogsPage() {
	const navigate = useNavigate();
	const [filters, setFilters] = useState({
		entityType: "all" as AuditEntityType | "all",
		userId: "",
		search: "",
	});

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch audit logs with filters
	const {
		data: logsData,
		isLoading: logsLoading,
		error,
	} = useAuditLogsQuery(
		{
			entityType: filters.entityType !== "all" ? filters.entityType : undefined,
			userId: filters.userId || undefined,
		},
		!!userData && userData.role === "admin",
	);

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

	if (!logsData?.logs) {
		return null;
	}

	const { role } = userData;
	let logs = logsData.logs;

	// Apply client-side search filter
	if (filters.search) {
		const searchLower = filters.search.toLowerCase();
		logs = logs.filter(
			(log) =>
				log.action.toLowerCase().includes(searchLower) ||
				log.userEmail?.toLowerCase().includes(searchLower) ||
				log.userName?.toLowerCase().includes(searchLower) ||
				log.entityId?.toLowerCase().includes(searchLower),
		);
	}

	// Calculate statistics
	const stats = {
		total: logs.length,
		template: logs.filter((l) => l.entityType === "template").length,
		user: logs.filter((l) => l.entityType === "user").length,
		today: logs.filter(
			(l) => new Date(l.createdAt).toDateString() === new Date().toDateString(),
		).length,
	};

	return (
		<AdminLayout currentPath="/admin/audit-logs" userRole={role}>
			<div>
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-slate-900 mb-2">Audit Logs</h1>
					<p className="text-slate-600">
						View all administrative actions and changes. Logs are retained for
						90 days.
					</p>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
				<div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label
								htmlFor="search"
								className="block text-sm font-medium text-slate-900 mb-2"
							>
								<Search className="w-4 h-4 inline mr-1" />
								Search
							</label>
							<FormInput
								label=""
								type="text"
								id="search"
								value={filters.search}
								onChange={(e) =>
									setFilters({ ...filters, search: e.target.value })
								}
								placeholder="Action, user, or entity ID..."
								containerClassName="mb-0"
							/>
						</div>
						<div>
							<label
								htmlFor="entityType"
								className="block text-sm font-medium text-slate-900 mb-2"
							>
								Entity Type
							</label>
							<select
								id="entityType"
								value={filters.entityType}
								onChange={(e) =>
									setFilters({
										...filters,
										entityType: e.target.value as AuditEntityType | "all",
									})
								}
								className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							>
								<option value="all">All Types</option>
								<option value="template">Templates</option>
								<option value="user">Users</option>
							</select>
						</div>
						<div className="flex items-end">
							<button
								type="button"
								onClick={() =>
									setFilters({ entityType: "all", userId: "", search: "" })
								}
								className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
							>
								Clear Filters
							</button>
						</div>
					</div>
				</div>

				{/* Audit Logs Table */}
				<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
					{logs.length === 0 ? (
						<div className="p-8 text-center text-slate-600">
							No audit logs found matching your filters.
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-slate-50 border-b border-slate-200">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
											Timestamp
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
											User
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
											Action
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
											Entity Type
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
											Entity ID
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
											Changes
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200">
									{logs.map((log) => (
										<tr
											key={log.id}
											className="hover:bg-slate-50 transition-colors"
										>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
												{new Date(log.createdAt).toLocaleString()}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												<div className="text-slate-900 font-medium">
													{log.userName || "Unknown"}
												</div>
												<div className="text-slate-500 text-xs">
													{log.userEmail || log.userId}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
													{log.action}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														log.entityType === "template"
															? "bg-purple-100 text-purple-800"
															: "bg-green-100 text-green-800"
													}`}
												>
													{log.entityType}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">
												{log.entityId
													? `${log.entityId.substring(0, 8)}...`
													: "N/A"}
											</td>
											<td className="px-6 py-4 text-sm text-slate-600">
												{log.changes ? (
													<details className="cursor-pointer">
														<summary className="text-indigo-600 hover:text-indigo-800">
															View Changes
														</summary>
														<pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-auto max-w-md">
															{JSON.stringify(log.changes, null, 2)}
														</pre>
													</details>
												) : (
													<span className="text-slate-400">No changes</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Info Box */}
				<div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
					<p className="text-sm text-blue-800">
						<strong>Retention Policy:</strong> Audit logs are automatically
						deleted after 90 days. Use the cleanup script to manually remove
						older logs:{" "}
						<code className="bg-blue-100 px-2 py-1 rounded">
							pnpm cleanup:audit-logs [days]
						</code>
					</p>
				</div>
			</div>
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
		<div className="bg-white rounded-lg border border-slate-200 p-4">
			<div className="flex items-center gap-3">
				<div className={`p-2 rounded-lg ${colorClasses[color]}`}>
					<Icon className="w-5 h-5" />
				</div>
				<div>
					<p className="text-sm text-slate-600">{label}</p>
					<p className="text-2xl font-bold text-slate-900">{value}</p>
				</div>
			</div>
		</div>
	);
}
