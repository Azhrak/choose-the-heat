import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Archive, Eye, FilePlus, FileText, Users } from "lucide-react";
import { AdminLayout, NoPermissions } from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useAdminDashboardQuery } from "~/hooks/useAdminDashboardQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboard,
});

function AdminDashboard() {
	const _navigate = useNavigate();

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch dashboard stats
	const {
		data: stats,
		isLoading: statsLoading,
		error,
	} = useAdminDashboardQuery(!!userData);

	if (userLoading || statsLoading) {
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

	// Check if user has editor or admin role
	if (userData.role !== "editor" && userData.role !== "admin") {
		return (
			<NoPermissions message="You don't have permission to access the admin panel. This area is restricted to editors and administrators only." />
		);
	}

	if (!stats?.stats) {
		return null;
	}

	const { role } = userData;
	const dashboardStats = stats.stats;

	return (
		<AdminLayout currentPath="/admin" userRole={role}>
			<div>
				<div className="flex flex-col gap-2 mb-8">
					<Heading level="h1">Dashboard</Heading>
					<p className="text-slate-600">
						Welcome to the admin panel. Here's an overview of your site.
					</p>
				</div>

				{/* Template Statistics (visible to editors and admins) */}
				{dashboardStats.templates && (
					<div className="mb-8 flex flex-col gap-4">
						<Heading level="h2">Template Statistics</Heading>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<StatCard
								title="Total Templates"
								value={dashboardStats.templates.total}
								icon={FileText}
								color="bg-blue-500"
							/>
							<StatCard
								title="Published"
								value={dashboardStats.templates.published}
								icon={Eye}
								color="bg-green-500"
							/>
							<StatCard
								title="Drafts"
								value={dashboardStats.templates.draft}
								icon={FilePlus}
								color="bg-yellow-500"
							/>
							<StatCard
								title="Archived"
								value={dashboardStats.templates.archived}
								icon={Archive}
								color="bg-gray-500"
							/>
						</div>
					</div>
				)}

				{/* User Statistics (visible to admins only) */}
				{dashboardStats.users && (
					<div className="flex flex-col gap-4">
						<Heading level="h2">User Statistics</Heading>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<StatCard
								title="Total Users"
								value={dashboardStats.users.total}
								icon={Users}
								color="bg-purple-500"
							/>
							<StatCard
								title="Regular Users"
								value={dashboardStats.users.user}
								icon={Users}
								color="bg-slate-500"
							/>
							<StatCard
								title="Editors"
								value={dashboardStats.users.editor}
								icon={Users}
								color="bg-blue-500"
							/>
							<StatCard
								title="Admins"
								value={dashboardStats.users.admin}
								icon={Users}
								color="bg-purple-600"
							/>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
}

interface StatCardProps {
	title: string;
	value: number;
	icon: React.ElementType;
	color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
	return (
		<div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
					<Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<Heading level="h3" className="text-slate-600">
					{title}
				</Heading>
				<p className="text-3xl font-bold text-slate-900">{value}</p>
			</div>
		</div>
	);
}
