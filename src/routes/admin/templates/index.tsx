import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, Plus, Eye, EyeOff, Archive } from "lucide-react";
import { AdminLayout, DataTable, StatusBadge } from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useAdminTemplatesQuery } from "~/hooks/useAdminTemplatesQuery";
import type { Template } from "~/lib/api/types";

export const Route = createFileRoute("/admin/templates/")({
	component: TemplatesListPage,
});

function TemplatesListPage() {
	const navigate = useNavigate();

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch all templates
	const {
		data: templatesData,
		isLoading: templatesLoading,
		error,
	} = useAdminTemplatesQuery(!!userData);

	if (userLoading || templatesLoading) {
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

	if (!userData || !templatesData?.templates) {
		return null;
	}

	const { role } = userData;
	const templates = templatesData.templates;

	// Calculate statistics
	const stats = {
		total: templates.length,
		draft: templates.filter((t) => t.status === "draft").length,
		published: templates.filter((t) => t.status === "published").length,
		archived: templates.filter((t) => t.status === "archived").length,
	};

	return (
		<AdminLayout currentPath="/admin/templates" userRole={role}>
			<div>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-3xl font-bold text-slate-900 mb-2">
							Template Management
						</h1>
						<p className="text-slate-600">
							Manage novel templates, including drafts and archived content.
						</p>
					</div>
					<button
						type="button"
						onClick={() => navigate({ to: "/admin/templates/new" })}
						className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
					>
						<Plus className="w-5 h-5" />
						New Template
					</button>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
					<StatBox
						label="Total Templates"
						value={stats.total}
						icon={FileText}
						color="blue"
					/>
					<StatBox
						label="Published"
						value={stats.published}
						icon={Eye}
						color="green"
					/>
					<StatBox label="Drafts" value={stats.draft} icon={EyeOff} color="yellow" />
					<StatBox
						label="Archived"
						value={stats.archived}
						icon={Archive}
						color="gray"
					/>
				</div>

				{/* Templates Table */}
				<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
					<DataTable
						data={templates}
						columns={[
							{
								header: "Title",
								accessor: (t) => t.title,
								className: "font-medium text-slate-900",
							},
							{
								header: "Status",
								accessor: (t) => <StatusBadge status={t.status} />,
							},
							{
								header: "Tropes",
								accessor: (t) => t.base_tropes.join(", "),
								className: "text-slate-600 text-sm",
							},
							{
								header: "Scenes",
								accessor: (t) => t.estimated_scenes.toString(),
								className: "text-slate-600 text-center",
							},
							{
								header: "Updated",
								accessor: (t) => new Date(t.updated_at).toLocaleDateString(),
								className: "text-slate-600 text-sm",
							},
						]}
						onRowClick={(template) =>
							navigate({ to: `/admin/templates/${template.id}/edit` })
						}
						emptyMessage="No templates found. Create your first template to get started."
					/>
				</div>
			</div>
		</AdminLayout>
	);
}

interface StatBoxProps {
	label: string;
	value: number;
	icon: React.ElementType;
	color: "blue" | "green" | "yellow" | "gray";
}

function StatBox({ label, value, icon: Icon, color }: StatBoxProps) {
	const colorClasses = {
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
		yellow: "bg-yellow-50 text-yellow-600",
		gray: "bg-gray-50 text-gray-600",
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
