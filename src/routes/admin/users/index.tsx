import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit2, Shield, Users as UsersIcon } from "lucide-react";
import {
	AdminLayout,
	DataTable,
	NoPermissions,
	RoleBadge,
} from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useAdminUsersQuery } from "~/hooks/useAdminUsersQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import type { User } from "~/lib/api/types";

export const Route = createFileRoute("/admin/users/")({
	component: UsersListPage,
});

function UsersListPage() {
	const navigate = useNavigate();

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch all users
	const {
		data: usersData,
		isLoading: usersLoading,
		error,
	} = useAdminUsersQuery(!!userData && userData.role === "admin");

	if (userLoading || usersLoading) {
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
				message="User management is restricted to administrators only. You need admin privileges to access this page."
				backTo="/admin"
			/>
		);
	}

	if (!usersData?.users) {
		return null;
	}

	const { role } = userData;
	const users = usersData.users;

	// Calculate statistics
	const stats = {
		total: users.length,
		user: users.filter((u) => u.role === "user").length,
		editor: users.filter((u) => u.role === "editor").length,
		admin: users.filter((u) => u.role === "admin").length,
		verified: users.filter((u) => u.email_verified).length,
	};

	return (
		<AdminLayout currentPath="/admin/users" userRole={role}>
			<div>
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-slate-900 mb-2">
						User Management
					</h1>
					<p className="text-slate-600">
						Manage user accounts, roles, and permissions. Admin access only.
					</p>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
					<StatBox
						label="Total Users"
						value={stats.total}
						icon={UsersIcon}
						color="purple"
					/>
					<StatBox
						label="Regular Users"
						value={stats.user}
						icon={UsersIcon}
						color="slate"
					/>
					<StatBox
						label="Editors"
						value={stats.editor}
						icon={Edit2}
						color="blue"
					/>
					<StatBox
						label="Admins"
						value={stats.admin}
						icon={Shield}
						color="purple-dark"
					/>
					<StatBox
						label="Verified"
						value={stats.verified}
						icon={UsersIcon}
						color="green"
					/>
				</div>

				{/* Users Table */}
				<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
					<DataTable
						data={users}
						columns={[
							{
								header: "Name",
								accessor: (u) => u.name,
								className: "font-medium text-slate-900",
							},
							{
								header: "Email",
								accessor: (u) => u.email,
								className: "text-slate-600",
							},
							{
								header: "Role",
								accessor: (u) => <RoleBadge role={u.role} />,
							},
							{
								header: "Verified",
								accessor: (u) => (
									<span
										className={
											u.email_verified
												? "text-green-600 font-medium"
												: "text-slate-400"
										}
									>
										{u.email_verified ? "Yes" : "No"}
									</span>
								),
							},
							{
								header: "Joined",
								accessor: (u) => new Date(u.created_at).toLocaleDateString(),
								className: "text-slate-600 text-sm",
							},
						]}
						onRowClick={(user) =>
							navigate({ to: `/admin/users/${user.id}/edit` })
						}
						emptyMessage="No users found."
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
	color: "purple" | "slate" | "blue" | "purple-dark" | "green";
}

function StatBox({ label, value, icon: Icon, color }: StatBoxProps) {
	const colorClasses = {
		purple: "bg-purple-50 text-purple-600",
		slate: "bg-slate-50 text-slate-600",
		blue: "bg-blue-50 text-blue-600",
		"purple-dark": "bg-purple-100 text-purple-700",
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
