import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileText, Users, Archive, Eye, EyeOff, FilePlus } from "lucide-react";
import { AdminLayout, NoPermissions } from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import type { UserRole } from "~/lib/db/types";

export const Route = createFileRoute("/admin/")({
	component: AdminDashboard,
});

interface DashboardStats {
	templates?: {
		total: number;
		draft: number;
		published: number;
		archived: number;
	};
	users?: {
		total: number;
		user: number;
		editor: number;
		admin: number;
	};
}

function AdminDashboard() {
	const navigate = useNavigate();

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useQuery({
		queryKey: ["currentUser"],
		queryFn: async () => {
			const response = await fetch("/api/profile", {
				credentials: "include",
			});
			if (!response.ok) {
				if (response.status === 401) {
					navigate({ to: "/auth/login" });
					return null;
				}
				throw new Error("Failed to fetch user");
			}
			return response.json() as Promise<{
				id: string;
				role: UserRole;
			}>;
		},
	});

	// Fetch dashboard stats
	const { data: stats, isLoading: statsLoading, error } = useQuery({
		queryKey: ["adminDashboard"],
		queryFn: async () => {
			const response = await fetch("/api/admin/dashboard", {
				credentials: "include",
			});
			if (!response.ok) {
				if (response.status === 403) {
					navigate({ to: "/browse" });
					return null;
				}
				throw new Error("Failed to fetch dashboard statistics");
			}
			return response.json() as Promise<{ stats: DashboardStats }>;
		},
		enabled: !!userData,
	});

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
			<NoPermissions
				message="You don't have permission to access the admin panel. This area is restricted to editors and administrators only."
			/>
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
				<h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
				<p className="text-slate-600 mb-8">
					Welcome to the admin panel. Here's an overview of your site.
				</p>

				{/* Template Statistics (visible to editors and admins) */}
				{dashboardStats.templates && (
					<div className="mb-8">
						<h2 className="text-xl font-semibold text-slate-900 mb-4">
							Template Statistics
						</h2>
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
					<div>
						<h2 className="text-xl font-semibold text-slate-900 mb-4">
							User Statistics
						</h2>
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
		<div className="bg-white rounded-lg border border-slate-200 p-6">
			<div className="flex items-center justify-between mb-4">
				<div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
					<Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
				</div>
			</div>
			<h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
			<p className="text-3xl font-bold text-slate-900">{value}</p>
		</div>
	);
}
