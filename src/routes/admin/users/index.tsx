import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit2, Shield, Users as UsersIcon } from "lucide-react";
import {
	AdminLayout,
	DataTable,
	FilterBar,
	NoPermissions,
	PaginationControls,
	RoleBadge,
	StatCard,
} from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Stack } from "~/components/ui/Stack";
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
			<Stack gap="md">
				<div className="flex flex-col gap-2">
					<Heading level="h1">User Management</Heading>
					<p className="text-slate-600 dark:text-gray-300">
						Manage user accounts, roles, and permissions. Admin access only.
					</p>
				</div>

				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
					<StatCard
						title="Total Users"
						value={stats.total}
						icon={UsersIcon}
						color="bg-purple-500"
					/>
					<StatCard
						title="Regular Users"
						value={stats.user}
						icon={UsersIcon}
						color="bg-slate-500"
					/>
					<StatCard
						title="Editors"
						value={stats.editor}
						icon={Edit2}
						color="bg-blue-500"
					/>
					<StatCard
						title="Admins"
						value={stats.admin}
						icon={Shield}
						color="bg-purple-600"
					/>
					<StatCard
						title="Verified"
						value={stats.verified}
						icon={UsersIcon}
						color="bg-green-500"
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
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
					<DataTable
						data={users}
						columns={[
							{
								header: "Name",
								accessor: (u) => u.name,
								className: "font-medium text-slate-900 dark:text-gray-100",
								key: "name",
							},
							{
								header: "Email",
								accessor: (u) => u.email,
								className: "text-slate-600 dark:text-gray-400",
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
												? "text-green-600 dark:text-green-400 font-medium"
												: "text-slate-400 dark:text-gray-500"
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
								className: "text-slate-600 dark:text-gray-400 text-sm",
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
			</Stack>
		</AdminLayout>
	);
}
