import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Trash2, Shield } from "lucide-react";
import { AdminLayout, RoleBadge, ConfirmDialog, NoPermissions } from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import type { UserRole } from "~/lib/db/types";

export const Route = createFileRoute("/admin/users/$id/edit")({
	component: EditUserPage,
});

interface User {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	email_verified: boolean;
	created_at: string;
	updated_at: string;
}

interface UserFormData {
	email: string;
	name: string;
	role: UserRole;
}

function EditUserPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { id } = Route.useParams();

	const [formData, setFormData] = useState<UserFormData | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	// Fetch current user to get role
	const { data: currentUserData, isLoading: currentUserLoading } = useQuery({
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

	// Fetch user to edit
	const {
		data: userData,
		isLoading: userLoading,
		error,
	} = useQuery({
		queryKey: ["adminUser", id],
		queryFn: async () => {
			const response = await fetch(`/api/admin/users/${id}`, {
				credentials: "include",
			});
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error("User not found");
				}
				if (response.status === 403) {
					navigate({ to: "/admin" });
					return null;
				}
				throw new Error("Failed to fetch user");
			}
			return response.json() as Promise<{ user: User }>;
		},
		enabled:
			!!currentUserData && currentUserData.role === "admin",
	});

	// Initialize form data when user loads
	if (userData?.user && !formData) {
		setFormData({
			email: userData.user.email,
			name: userData.user.name,
			role: userData.user.role,
		});
	}

	// Update user mutation
	const updateMutation = useMutation({
		mutationFn: async (data: UserFormData) => {
			const response = await fetch(`/api/admin/users/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update user");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adminUser", id] });
			queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
			setFormError(null);
		},
		onError: (error) => {
			setFormError(error instanceof Error ? error.message : "An error occurred");
		},
	});

	// Delete user mutation
	const deleteMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch(`/api/admin/users/${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete user");
			}

			return response.json();
		},
		onSuccess: () => {
			navigate({ to: "/admin/users" });
		},
		onError: (error) => {
			setFormError(error instanceof Error ? error.message : "An error occurred");
			setShowDeleteDialog(false);
		},
	});

	if (currentUserLoading || userLoading) {
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

	if (!currentUserData) {
		return null;
	}

	// Check if user is admin
	if (currentUserData.role !== "admin") {
		return (
			<NoPermissions
				title="Admin Access Required"
				message="User management is restricted to administrators only. You need admin privileges to access this page."
				backTo="/admin"
			/>
		);
	}

	if (!userData?.user || !formData) {
		return null;
	}

	const currentUser = currentUserData;
	const user = userData.user;
	const isEditingSelf = currentUser.id === user.id;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		// Validation
		if (!formData.email.trim()) {
			setFormError("Email is required");
			return;
		}
		if (!formData.name.trim()) {
			setFormError("Name is required");
			return;
		}

		// Prevent demoting self from admin
		if (isEditingSelf && formData.role !== "admin") {
			setFormError("You cannot change your own admin role");
			return;
		}

		updateMutation.mutate(formData);
	};

	const handleDelete = () => {
		// Prevent self-deletion
		if (isEditingSelf) {
			setFormError("You cannot delete your own account");
			return;
		}

		deleteMutation.mutate();
	};

	return (
		<AdminLayout currentPath="/admin/users" userRole={currentUser.role}>
			<div>
				<div className="mb-6">
					<button
						type="button"
						onClick={() => navigate({ to: "/admin/users" })}
						className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Users
					</button>
					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-3xl font-bold text-slate-900 mb-2">
								Edit User
							</h1>
							<p className="text-slate-600">
								Update user details and manage their role.
							</p>
						</div>
						<RoleBadge role={user.role} />
					</div>
				</div>

				<div className="max-w-3xl">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Error Message */}
						{formError && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<ErrorMessage message={formError} />
							</div>
						)}

						{/* Self-Edit Warning */}
						{isEditingSelf && (
							<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
								<div className="flex items-start gap-3">
									<Shield className="w-5 h-5 text-amber-600 mt-0.5" />
									<div>
										<p className="text-sm font-medium text-amber-900">
											Editing Your Own Account
										</p>
										<p className="text-sm text-amber-700 mt-1">
											You cannot change your own role or delete your account.
										</p>
									</div>
								</div>
							</div>
						)}

						{/* User Info */}
						<div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="text-slate-600">User ID</p>
									<p className="font-mono text-slate-900">{user.id}</p>
								</div>
								<div>
									<p className="text-slate-600">Email Verified</p>
									<p
										className={
											user.email_verified
												? "text-green-600 font-medium"
												: "text-slate-400"
										}
									>
										{user.email_verified ? "Yes" : "No"}
									</p>
								</div>
								<div>
									<p className="text-slate-600">Account Created</p>
									<p className="text-slate-900">
										{new Date(user.created_at).toLocaleString()}
									</p>
								</div>
								<div>
									<p className="text-slate-600">Last Updated</p>
									<p className="text-slate-900">
										{new Date(user.updated_at).toLocaleString()}
									</p>
								</div>
							</div>
						</div>

						{/* Name */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-slate-900 mb-2"
							>
								Name *
							</label>
							<input
								type="text"
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								required
							/>
						</div>

						{/* Email */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-slate-900 mb-2"
							>
								Email *
							</label>
							<input
								type="email"
								id="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								required
							/>
						</div>

						{/* Role */}
						<div>
							<label
								htmlFor="role"
								className="block text-sm font-medium text-slate-900 mb-2"
							>
								Role *
							</label>
							<select
								id="role"
								value={formData.role}
								onChange={(e) =>
									setFormData({ ...formData, role: e.target.value as UserRole })
								}
								disabled={isEditingSelf}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
								required
							>
								<option value="user">User - Can create stories and read templates</option>
								<option value="editor">
									Editor - Can manage all templates
								</option>
								<option value="admin">
									Admin - Full system access and user management
								</option>
							</select>
							<p className="mt-1 text-sm text-slate-600">
								Roles determine what actions a user can perform
							</p>
						</div>

						{/* Save Button */}
						<div className="pt-4 border-t border-slate-200">
							<button
								type="submit"
								disabled={updateMutation.isPending}
								className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{updateMutation.isPending ? (
									<LoadingSpinner />
								) : (
									<>
										<Save className="w-5 h-5" />
										Save Changes
									</>
								)}
							</button>
						</div>
					</form>

					{/* Danger Zone */}
					{!isEditingSelf && (
						<div className="mt-8 pt-8 border-t border-red-200">
							<h2 className="text-xl font-semibold text-red-900 mb-4">
								Danger Zone
							</h2>
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<p className="text-sm text-red-800 mb-4">
									Deleting a user is permanent and will remove their account, but
									their stories and choices will remain in the database. This
									action cannot be undone.
								</p>
								<button
									type="button"
									onClick={() => setShowDeleteDialog(true)}
									className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
								>
									<Trash2 className="w-4 h-4" />
									Delete User
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showDeleteDialog}
				onClose={() => setShowDeleteDialog(false)}
				onConfirm={handleDelete}
				title="Delete User?"
				message={`This action cannot be undone. The user "${user.name}" (${user.email}) will be permanently deleted. Their stories will remain but will be orphaned.`}
				confirmText="Delete User"
				loading={deleteMutation.isPending}
			/>
		</AdminLayout>
	);
}
