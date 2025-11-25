import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	AdminLayout,
	ConfirmDialog,
	NoPermissions,
	RoleBadge,
} from "~/components/admin";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Stack } from "~/components/ui/Stack";
import { useAdminUserQuery } from "~/hooks/useAdminUserQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useDeleteUserMutation } from "~/hooks/useDeleteUserMutation";
import { useUpdateUserMutation } from "~/hooks/useUpdateUserMutation";
import type { UserRole } from "~/lib/db/types";

export const Route = createFileRoute("/admin/users/$id/edit")({
	component: EditUserPage,
});

interface UserFormData {
	email: string;
	name: string;
	role: UserRole;
}

function EditUserPage() {
	const navigate = useNavigate();
	const { id } = Route.useParams();

	const [formData, setFormData] = useState<UserFormData | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	// Fetch current user to get role
	const { data: currentUserData, isLoading: currentUserLoading } =
		useCurrentUserQuery();

	// Fetch user to edit
	const {
		data: userData,
		isLoading: userLoading,
		error,
	} = useAdminUserQuery(
		id,
		!!currentUserData && currentUserData.role === "admin",
	);

	// Initialize form data when user loads
	if (userData?.user && !formData) {
		setFormData({
			email: userData.user.email,
			name: userData.user.name,
			role: userData.user.role,
		});
	}

	// Update user mutation
	const updateMutation = useUpdateUserMutation(id);

	const handleUpdateSuccess = () => {
		setFormError(null);
	};

	const handleUpdateError = (error: Error) => {
		setFormError(error.message);
	};

	// Delete user mutation
	const deleteMutation = useDeleteUserMutation(id);

	const handleDeleteSuccess = () => {
		navigate({ to: "/admin/users" });
	};

	const handleDeleteError = (error: Error) => {
		setFormError(error.message);
		setShowDeleteDialog(false);
	};

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

		updateMutation.mutate(formData, {
			onSuccess: handleUpdateSuccess,
			onError: handleUpdateError,
		});
	};

	const handleDelete = () => {
		// Prevent self-deletion
		if (isEditingSelf) {
			setFormError("You cannot delete your own account");
			return;
		}

		deleteMutation.mutate(undefined, {
			onSuccess: handleDeleteSuccess,
			onError: handleDeleteError,
		});
	};

	return (
		<AdminLayout currentPath="/admin/users" userRole={currentUser.role}>
			<Stack gap="md">
				<Stack gap="sm">
					<Button
						variant="ghost"
						onClick={() => navigate({ to: "/admin/users" })}
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Users
					</Button>
					<div className="flex items-start justify-between">
						<div className="flex flex-col gap-2">
							<Heading level="h1">Edit User</Heading>
							<p className="text-slate-600">
								Update user details and manage their role.
							</p>
						</div>
						<RoleBadge role={user.role} />
					</div>
				</Stack>

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
						<FormInput
							label="Name *"
							type="text"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							required
						/>

						{/* Email */}
						<FormInput
							label="Email *"
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							required
						/>

						{/* Role */}
						<Stack gap="xs">
							<label
								htmlFor="role"
								className="block text-sm font-medium text-slate-900"
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
								<option value="user">
									User - Can create stories and read templates
								</option>
								<option value="editor">
									Editor - Can manage all templates
								</option>
								<option value="admin">
									Admin - Full system access and user management
								</option>
							</select>
							<p className="text-sm text-slate-600">
								Roles determine what actions a user can perform
							</p>
						</Stack>

						{/* Save Button */}
						<div className="pt-4 border-t border-slate-200">
							<Button
								type="submit"
								loading={updateMutation.isPending}
								variant="primary"
							>
								<Save className="w-5 h-5" />
								Save Changes
							</Button>
						</div>
					</form>{" "}
					{/* Danger Zone */}
					{!isEditingSelf && (
						<div className="mt-8 pt-8 border-t border-red-200 space-y-4">
							<Heading level="h2" variant="danger">
								Danger Zone
							</Heading>
							<div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
								<p className="text-sm text-red-800">
									Deleting a user is permanent and will remove their account,
									but their stories and choices will remain in the database.
									This action cannot be undone.
								</p>
								<Button
									type="button"
									onClick={() => setShowDeleteDialog(true)}
									variant="danger"
									size="sm"
								>
									<Trash2 className="w-4 h-4" />
									Delete User
								</Button>
							</div>
						</div>
					)}
				</div>
			</Stack>

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
