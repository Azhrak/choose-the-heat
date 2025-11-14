import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { FullPageLoader } from "~/components/FullPageLoader";
import { Header } from "~/components/Header";
import { PageContainer } from "~/components/PageContainer";
import {
	DangerZone,
	DeleteAccountModal,
	PasswordChange,
	PreferencesDisplay,
	ProfileInformation,
} from "~/components/profile";
import { useChangePasswordMutation } from "~/hooks/useChangePasswordMutation";
import { useDeleteAccountMutation } from "~/hooks/useDeleteAccountMutation";
import { useProfileQuery } from "~/hooks/useProfileQuery";
import { useUpdateProfileMutation } from "~/hooks/useUpdateProfileMutation";
import { ApiError } from "~/lib/api/client";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const navigate = useNavigate();
	const { data: profile, isLoading } = useProfileQuery();
	const updateProfile = useUpdateProfileMutation();
	const changePassword = useChangePasswordMutation();
	const deleteAccount = useDeleteAccountMutation();

	// Profile update state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [profileError, setProfileError] = useState("");
	const [profileSuccess, setProfileSuccess] = useState("");

	// Password change state
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [passwordSuccess, setPasswordSuccess] = useState("");

	// Delete account state
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
	const [deleteError, setDeleteError] = useState("");

	// Update form fields when profile data loads
	useEffect(() => {
		if (profile) {
			setName(profile.name || "");
			setEmail(profile.email || "");
		}
	}, [profile]);

	// Handle authentication redirect
	useEffect(() => {
		if (!isLoading && !profile) {
			navigate({ to: "/auth/login" });
		}
	}, [isLoading, profile, navigate]);

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setProfileError("");
		setProfileSuccess("");

		try {
			await updateProfile.mutateAsync({ name, email });
			setProfileSuccess("Profile updated successfully!");
			setTimeout(() => setProfileSuccess(""), 3000);
		} catch (error) {
			if (error instanceof ApiError) {
				setProfileError(error.message || "Failed to update profile");
			} else {
				setProfileError("An unexpected error occurred");
			}
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setPasswordError("");
		setPasswordSuccess("");

		if (newPassword !== confirmPassword) {
			setPasswordError("Passwords do not match");
			return;
		}

		if (newPassword.length < 8) {
			setPasswordError("Password must be at least 8 characters");
			return;
		}

		try {
			await changePassword.mutateAsync({
				currentPassword,
				newPassword,
			});
			setPasswordSuccess("Password changed successfully!");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => setPasswordSuccess(""), 3000);
		} catch (error) {
			if (error instanceof ApiError) {
				setPasswordError(error.message || "Failed to change password");
			} else {
				setPasswordError("An unexpected error occurred");
			}
		}
	};

	const handleDeleteAccount = async () => {
		setDeleteError("");

		try {
			await deleteAccount.mutateAsync({ password: deleteConfirmPassword });
			// Account deleted, redirect to home
			window.location.href = "/";
		} catch (error) {
			if (error instanceof ApiError) {
				setDeleteError(error.message || "Failed to delete account");
			} else {
				setDeleteError("An unexpected error occurred");
			}
		}
	};

	const handleDeleteModalClose = () => {
		setShowDeleteModal(false);
		setDeleteConfirmPassword("");
		setDeleteError("");
	};

	if (isLoading) {
		return <FullPageLoader />;
	}

	if (!profile) {
		return null;
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100">
			<Header currentPath="/profile" userRole={profile?.role} />

			<PageContainer maxWidth="md">
				<div className="flex items-center gap-3 mb-8">
					<User className="w-8 h-8 text-romance-600" />
					<h1 className="text-4xl font-bold text-slate-900">
						Profile Settings
					</h1>
				</div>

				<ProfileInformation
					name={name}
					email={email}
					createdAt={profile.createdAt}
					onNameChange={setName}
					onEmailChange={setEmail}
					onSubmit={handleUpdateProfile}
					isUpdating={updateProfile.isPending}
					error={profileError}
					success={profileSuccess}
				/>

				<PasswordChange
					currentPassword={currentPassword}
					newPassword={newPassword}
					confirmPassword={confirmPassword}
					onCurrentPasswordChange={setCurrentPassword}
					onNewPasswordChange={setNewPassword}
					onConfirmPasswordChange={setConfirmPassword}
					onSubmit={handleChangePassword}
					isUpdating={changePassword.isPending}
					error={passwordError}
					success={passwordSuccess}
				/>

				<PreferencesDisplay preferences={profile.preferences} />

				<DangerZone onDeleteClick={() => setShowDeleteModal(true)} />
			</PageContainer>

			<DeleteAccountModal
				isOpen={showDeleteModal}
				password={deleteConfirmPassword}
				onPasswordChange={setDeleteConfirmPassword}
				onConfirm={handleDeleteAccount}
				onCancel={handleDeleteModalClose}
				isDeleting={deleteAccount.isPending}
				error={deleteError}
			/>
		</div>
	);
}
