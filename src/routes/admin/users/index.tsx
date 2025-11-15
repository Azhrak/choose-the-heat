import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit2, Shield, Users as UsersIcon } from "lucide-react";
import {
	AdminLayout,
	DataTable,
	FilterBar,
	NoPermissions,
	PaginationControls,
	RoleBadge,
} from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import {
	useAdminUsersPaginatedQuery,
	useAdminUsersStatsQuery,
} from "~/hooks/useAdminUsersQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import type { UserRole } from "~/lib/db/types";

// Search params schema
type UsersSearch = {
	page?: number;
	role?: UserRole | "all";
};

export const Route = createFileRoute("/admin/users/")({
	component: UsersListPage,
	validateSearch: (search: Record<string, unknown>): UsersSearch => {
		return {
			page: Number(search.page) || 1,
			role: (search.role as UserRole | "all") || "all",
		};
	},
});

type RoleFilter = "all" | UserRole;

function UsersListPage() {
	const navigate = useNavigate();
	const search = Route.useSearch();

	// Get state from URL params
	const currentPage = search.page || 1;
	const roleFilter = search.role || "all";
	const itemsPerPage = 10;

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch user statistics
	const { data: statsData, isLoading: statsLoading } = useAdminUsersStatsQuery(
		!!userData && userData.role === "admin",
	);

	// Fetch paginated users
	const {
		data: usersData,
		isLoading: usersLoading,
		error,
	} = useAdminUsersPaginatedQuery({
		page: currentPage,
		limit: itemsPerPage,
		role: roleFilter,
		enabled: !!userData && userData.role === "admin",
	});

	if (userLoading || usersLoading || statsLoading) {
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

	if (!usersData?.users || !usersData?.pagination || !statsData) {
		return null;
	}

	const { role } = userData;
	const { users, pagination } = usersData;

	// Handle role filter change
	const handleRoleFilterChange = (filter: RoleFilter) => {
		navigate({
			to: "/admin/users",
			search: {
				...search,
				role: filter,
				page: 1,
			},
		});
	};

	// Handle page change
	const handlePageChange = (page: number) => {
		navigate({
			to: "/admin/users",
			search: {
				...search,
				page,
			},
		});
	};

	// Pagination metadata from server
	const totalItems = pagination.total;
	const totalPages = pagination.totalPages;

	// Stats from server (accurate counts for all roles)
	const stats = statsData;

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
				<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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

				{/* Role Filter */}
				<FilterBar
					label="Filter by Role:"
					filters={[
						{
							value: "all",
							label: "All",
							count: stats.total,
							activeColor: "purple",
						},
						{
							value: "user",
							label: "Users",
							count: stats.user,
							activeColor: "slate",
						},
						{
							value: "editor",
							label: "Editors",
							count: stats.editor,
							activeColor: "blue",
						},
						{
							value: "admin",
							label: "Admins",
							count: stats.admin,
							activeColor: "purple-dark",
						},
					]}
					activeFilter={roleFilter}
					onChange={handleRoleFilterChange}
				/>

				{/* Users Table */}
				<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
					<DataTable
						data={users}
						columns={[
							{
								header: "Name",
								accessor: (u) => u.name,
								className: "font-medium text-slate-900",
								key: "name",
							},
							{
								header: "Email",
								accessor: (u) => u.email,
								className: "text-slate-600",
								key: "email",
							},
							{
								header: "Role",
								accessor: (u) => <RoleBadge role={u.role} />,
								key: "role",
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
								key: "verified",
							},
							{
								header: "Joined",
								accessor: (u) => new Date(u.created_at).toLocaleDateString(),
								className: "text-slate-600 text-sm",
								key: "joined",
							},
						]}
						onRowClick={(user) =>
							navigate({ to: `/admin/users/${user.id}/edit` })
						}
						emptyMessage="No users found."
					/>
				</div>

				{/* Pagination Controls */}
				<PaginationControls
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					itemsPerPage={itemsPerPage}
					onPageChange={handlePageChange}
					itemLabel="user"
				/>
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
