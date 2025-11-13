import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Lock, Settings, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Header } from "~/components/Header";
import { PageContainer } from "~/components/PageContainer";
import type { UserRole } from "~/lib/db/types";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

interface UserProfile {
	name: string;
	email: string;
	role: UserRole;
	createdAt: string;
	preferences: any;
}

function ProfilePage() {
	const navigate = useNavigate();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	// Profile update state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [profileError, setProfileError] = useState("");
	const [profileSuccess, setProfileSuccess] = useState("");
	const [profileUpdating, setProfileUpdating] = useState(false);

	// Password change state
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [passwordSuccess, setPasswordSuccess] = useState("");
	const [passwordUpdating, setPasswordUpdating] = useState(false);

	// Delete account state
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
	const [deleteError, setDeleteError] = useState("");
	const [deleting, setDeleting] = useState(false);

	const fetchProfile = useCallback(async () => {
		try {
			const response = await fetch("/api/profile", {
				credentials: "include",
			});

			if (!response.ok) {
				if (response.status === 401) {
					navigate({ to: "/auth/login" });
					return;
				}
				throw new Error("Failed to fetch profile");
			}

			const data = await response.json();
			setProfile(data);
			setName(data.name || "");
			setEmail(data.email || "");
		} catch (error) {
			console.error("Error fetching profile:", error);
		} finally {
			setLoading(false);
		}
	}, [navigate]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setProfileError("");
		setProfileSuccess("");
		setProfileUpdating(true);

		try {
			const response = await fetch("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email }),
				credentials: "include",
			});

			const data = await response.json();

			if (!response.ok) {
				setProfileError(data.error || "Failed to update profile");
				return;
			}

			setProfileSuccess("Profile updated successfully!");
			setProfile({ ...profile!, name: data.name, email: data.email });
			setTimeout(() => setProfileSuccess(""), 3000);
		} catch (_error) {
			setProfileError("An unexpected error occurred");
		} finally {
			setProfileUpdating(false);
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

		setPasswordUpdating(true);

		try {
			const response = await fetch("/api/profile/password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					currentPassword,
					newPassword,
				}),
				credentials: "include",
			});

			const data = await response.json();

			if (!response.ok) {
				setPasswordError(data.error || "Failed to change password");
				return;
			}

			setPasswordSuccess("Password changed successfully!");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => setPasswordSuccess(""), 3000);
		} catch (_error) {
			setPasswordError("An unexpected error occurred");
		} finally {
			setPasswordUpdating(false);
		}
	};

	const handleDeleteAccount = async () => {
		setDeleteError("");
		setDeleting(true);

		try {
			const response = await fetch("/api/profile", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password: deleteConfirmPassword }),
				credentials: "include",
			});

			const data = await response.json();

			if (!response.ok) {
				setDeleteError(data.error || "Failed to delete account");
				setDeleting(false);
				return;
			}

			// Account deleted, redirect to home
			window.location.href = "/";
		} catch (_error) {
			setDeleteError("An unexpected error occurred");
			setDeleting(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100 flex items-center justify-center">
				<div className="text-lg text-slate-600">Loading...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100">
			<Header currentPath="/profile" userRole={profile?.role} />

			{/* Main Content */}
			<PageContainer maxWidth="md">
				<div className="flex items-center gap-3 mb-8">
					<User className="w-8 h-8 text-romance-600" />
					<h1 className="text-4xl font-bold text-slate-900">
						Profile Settings
					</h1>
				</div>

				{/* Profile Information */}
				<div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
					<div className="flex items-center gap-2 mb-6">
						<User className="w-5 h-5 text-romance-500" />
						<h2 className="text-2xl font-bold text-slate-900">
							Profile Information
						</h2>
					</div>

					<form onSubmit={handleUpdateProfile} className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-slate-700 mb-1"
							>
								Name
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-romance-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-slate-700 mb-1"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-romance-500 focus:border-transparent"
							/>
						</div>

						{profile?.createdAt && (
							<div className="text-sm text-slate-600">
								Account created:{" "}
								{new Date(profile.createdAt).toLocaleDateString()}
							</div>
						)}

						{profileError && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
								{profileError}
							</div>
						)}

						{profileSuccess && (
							<div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
								{profileSuccess}
							</div>
						)}

						<button
							type="submit"
							disabled={profileUpdating}
							className="px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{profileUpdating ? "Updating..." : "Update Profile"}
						</button>
					</form>
				</div>

				{/* Password Change */}
				<div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
					<div className="flex items-center gap-2 mb-6">
						<Lock className="w-5 h-5 text-romance-500" />
						<h2 className="text-2xl font-bold text-slate-900">
							Change Password
						</h2>
					</div>

					<form onSubmit={handleChangePassword} className="space-y-4">
						<div>
							<label
								htmlFor="currentPassword"
								className="block text-sm font-medium text-slate-700 mb-1"
							>
								Current Password
							</label>
							<input
								id="currentPassword"
								type="password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								required
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-romance-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label
								htmlFor="newPassword"
								className="block text-sm font-medium text-slate-700 mb-1"
							>
								New Password
							</label>
							<input
								id="newPassword"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-romance-500 focus:border-transparent"
							/>
							<p className="mt-1 text-xs text-slate-500">
								At least 8 characters with uppercase, lowercase, and numbers
							</p>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-slate-700 mb-1"
							>
								Confirm New Password
							</label>
							<input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-romance-500 focus:border-transparent"
							/>
						</div>

						{passwordError && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
								{passwordError}
							</div>
						)}

						{passwordSuccess && (
							<div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
								{passwordSuccess}
							</div>
						)}

						<button
							type="submit"
							disabled={passwordUpdating}
							className="px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{passwordUpdating ? "Changing..." : "Change Password"}
						</button>
					</form>
				</div>

				{/* Preferences */}
				<div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
					<div className="flex items-center gap-2 mb-6">
						<Settings className="w-5 h-5 text-romance-500" />
						<h2 className="text-2xl font-bold text-slate-900">
							Reading Preferences
						</h2>
					</div>

					{profile?.preferences ? (
						<>
							<div className="space-y-4 mb-6">
								<div>
									<h3 className="font-semibold text-slate-700 mb-2">
										Favorite Genres
									</h3>
									<div className="flex flex-wrap gap-2">
										{(() => {
											try {
												const prefs =
													typeof profile.preferences === "string"
														? JSON.parse(profile.preferences)
														: profile.preferences;
												return (prefs.genres || []).map((genre: string) => (
													<span
														key={genre}
														className="px-3 py-1 bg-romance-100 text-romance-700 rounded-full text-sm"
													>
														{genre
															.split("-")
															.map(
																(word) =>
																	word.charAt(0).toUpperCase() + word.slice(1),
															)
															.join(" ")}
													</span>
												));
											} catch {
												return <span className="text-slate-500">None set</span>;
											}
										})()}
									</div>
								</div>

								<div>
									<h3 className="font-semibold text-slate-700 mb-2">
										Favorite Tropes
									</h3>
									<div className="flex flex-wrap gap-2">
										{(() => {
											try {
												const prefs =
													typeof profile.preferences === "string"
														? JSON.parse(profile.preferences)
														: profile.preferences;
												return (prefs.tropes || []).map((trope: string) => (
													<span
														key={trope}
														className="px-3 py-1 bg-romance-100 text-romance-700 rounded-full text-sm"
													>
														{trope
															.split("-")
															.map(
																(word: string) =>
																	word.charAt(0).toUpperCase() + word.slice(1),
															)
															.join(" ")}
													</span>
												));
											} catch {
												return <span className="text-slate-500">None set</span>;
											}
										})()}
									</div>
								</div>

								<div className="grid grid-cols-3 gap-4">
									<div>
										<h3 className="font-semibold text-slate-700 mb-1">
											Spice Level
										</h3>
										<p className="text-slate-600">
											{(() => {
												try {
													const prefs =
														typeof profile.preferences === "string"
															? JSON.parse(profile.preferences)
															: profile.preferences;
													const level = prefs.spiceLevel || 3;
													return `Level ${level} ${"🔥".repeat(level)}`;
												} catch {
													return "Not set";
												}
											})()}
										</p>
									</div>

									<div>
										<h3 className="font-semibold text-slate-700 mb-1">
											Pacing
										</h3>
										<p className="text-slate-600">
											{(() => {
												try {
													const prefs =
														typeof profile.preferences === "string"
															? JSON.parse(profile.preferences)
															: profile.preferences;
													return (prefs.pacing || "slow-burn")
														.split("-")
														.map(
															(word: string) =>
																word.charAt(0).toUpperCase() + word.slice(1),
														)
														.join(" ");
												} catch {
													return "Not set";
												}
											})()}
										</p>
									</div>

									<div>
										<h3 className="font-semibold text-slate-700 mb-1">
											Scene Length
										</h3>
										<p className="text-slate-600">
											{(() => {
												try {
													const prefs =
														typeof profile.preferences === "string"
															? JSON.parse(profile.preferences)
															: profile.preferences;
													const length = prefs.sceneLength || "medium";
													return (
														length.charAt(0).toUpperCase() + length.slice(1)
													);
												} catch {
													return "Not set";
												}
											})()}
										</p>
									</div>
								</div>
							</div>{" "}
							<Link
								to="/preferences"
								className="inline-flex items-center px-6 py-3 border-2 border-romance-600 text-romance-600 rounded-lg font-semibold hover:bg-romance-50 transition-colors"
							>
								Update Preferences
							</Link>
						</>
					) : (
						<>
							<p className="text-slate-600 mb-4">
								Set up your reading preferences to get personalized story
								recommendations
							</p>

							<Link
								to="/preferences"
								className="inline-flex items-center px-6 py-3 bg-romance-600 text-white rounded-lg font-semibold hover:bg-romance-700 transition-colors"
							>
								Set Up Preferences
							</Link>
						</>
					)}
				</div>

				{/* Danger Zone */}
				<div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
					<div className="flex items-center gap-2 mb-6">
						<AlertTriangle className="w-5 h-5 text-red-500" />
						<h2 className="text-2xl font-bold text-red-900">Danger Zone</h2>
					</div>

					<p className="text-slate-600 mb-4">
						Once you delete your account, there is no going back. All your
						stories and preferences will be permanently deleted.
					</p>

					<button
						onClick={() => setShowDeleteModal(true)}
						className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
					>
						Delete Account
					</button>
				</div>
			</PageContainer>

			{/* Delete Account Modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
						<div className="flex items-center gap-2 mb-4 text-red-600">
							<AlertTriangle className="w-6 h-6" />
							<h3 className="text-2xl font-bold">Delete Account</h3>
						</div>

						<p className="text-slate-600 mb-6">
							This action cannot be undone. All your data will be permanently
							deleted.
						</p>

						<div className="mb-6">
							<label
								htmlFor="deletePassword"
								className="block text-sm font-medium text-slate-700 mb-1"
							>
								Enter your password to confirm
							</label>
							<input
								id="deletePassword"
								type="password"
								value={deleteConfirmPassword}
								onChange={(e) => setDeleteConfirmPassword(e.target.value)}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
								placeholder="Your password"
							/>
						</div>

						{deleteError && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
								{deleteError}
							</div>
						)}

						<div className="flex gap-3">
							<button
								onClick={() => {
									setShowDeleteModal(false);
									setDeleteConfirmPassword("");
									setDeleteError("");
								}}
								disabled={deleting}
								className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteAccount}
								disabled={deleting || !deleteConfirmPassword}
								className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{deleting ? "Deleting..." : "Delete Account"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
