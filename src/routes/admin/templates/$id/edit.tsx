import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	ArrowLeft,
	Save,
	Trash2,
	Eye,
	EyeOff,
	Archive,
	ArchiveRestore,
} from "lucide-react";
import {
	AdminLayout,
	StatusBadge,
	ConfirmDialog,
} from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import type { TemplateStatus, UserRole } from "~/lib/db/types";

export const Route = createFileRoute("/admin/templates/$id/edit")({
	component: EditTemplatePage,
});

interface Template {
	id: string;
	title: string;
	description: string;
	status: TemplateStatus;
	base_tropes: string[];
	estimated_scenes: number;
	cover_gradient: string;
	created_at: string;
	updated_at: string;
	archived_at: string | null;
}

interface TemplateFormData {
	title: string;
	description: string;
	base_tropes: string;
	estimated_scenes: number;
	cover_gradient: string;
}

function EditTemplatePage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { id } = Route.useParams();

	const [formData, setFormData] = useState<TemplateFormData | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showStatusDialog, setShowStatusDialog] = useState(false);
	const [pendingStatus, setPendingStatus] = useState<TemplateStatus | null>(
		null,
	);

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

	// Fetch template
	const {
		data: templateData,
		isLoading: templateLoading,
		error,
	} = useQuery({
		queryKey: ["adminTemplate", id],
		queryFn: async () => {
			const response = await fetch(`/api/admin/templates/${id}`, {
				credentials: "include",
			});
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error("Template not found");
				}
				if (response.status === 403) {
					navigate({ to: "/browse" });
					return null;
				}
				throw new Error("Failed to fetch template");
			}
			return response.json() as Promise<{ template: Template }>;
		},
		enabled: !!userData,
	});

	// Initialize form data when template loads
	if (templateData?.template && !formData) {
		setFormData({
			title: templateData.template.title,
			description: templateData.template.description,
			base_tropes: templateData.template.base_tropes.join(", "),
			estimated_scenes: templateData.template.estimated_scenes,
			cover_gradient: templateData.template.cover_gradient,
		});
	}

	// Update template mutation
	const updateMutation = useMutation({
		mutationFn: async (data: TemplateFormData) => {
			const response = await fetch(`/api/admin/templates/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					title: data.title,
					description: data.description,
					base_tropes: data.base_tropes.split(",").map((t) => t.trim()),
					estimated_scenes: data.estimated_scenes,
					cover_gradient: data.cover_gradient,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update template");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adminTemplate", id] });
			queryClient.invalidateQueries({ queryKey: ["adminTemplates"] });
			setFormError(null);
		},
		onError: (error) => {
			setFormError(error instanceof Error ? error.message : "An error occurred");
		},
	});

	// Update status mutation
	const statusMutation = useMutation({
		mutationFn: async (status: TemplateStatus) => {
			const response = await fetch(`/api/admin/templates/${id}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ status }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update status");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["adminTemplate", id] });
			queryClient.invalidateQueries({ queryKey: ["adminTemplates"] });
			setShowStatusDialog(false);
			setPendingStatus(null);
		},
		onError: (error) => {
			setFormError(error instanceof Error ? error.message : "An error occurred");
		},
	});

	// Delete template mutation
	const deleteMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch(`/api/admin/templates/${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete template");
			}

			return response.json();
		},
		onSuccess: () => {
			navigate({ to: "/admin/templates" });
		},
		onError: (error) => {
			setFormError(error instanceof Error ? error.message : "An error occurred");
			setShowDeleteDialog(false);
		},
	});

	if (userLoading || templateLoading) {
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

	if (!userData || !templateData?.template || !formData) {
		return null;
	}

	const { role } = userData;
	const template = templateData.template;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		// Validation
		if (!formData.title.trim()) {
			setFormError("Title is required");
			return;
		}
		if (!formData.description.trim()) {
			setFormError("Description is required");
			return;
		}
		if (!formData.base_tropes.trim()) {
			setFormError("At least one trope is required");
			return;
		}
		if (formData.estimated_scenes < 1 || formData.estimated_scenes > 100) {
			setFormError("Estimated scenes must be between 1 and 100");
			return;
		}

		updateMutation.mutate(formData);
	};

	const handleStatusChange = (status: TemplateStatus) => {
		setPendingStatus(status);
		setShowStatusDialog(true);
	};

	const confirmStatusChange = () => {
		if (pendingStatus) {
			statusMutation.mutate(pendingStatus);
		}
	};

	const getStatusDialogMessage = () => {
		if (!pendingStatus) return "";

		switch (pendingStatus) {
			case "draft":
				return "This will unpublish the template and hide it from public view.";
			case "published":
				return "This will make the template visible to all users.";
			case "archived":
				return "This will archive the template and hide it from public view. Existing user stories will remain accessible.";
			default:
				return "";
		}
	};

	const gradientOptions = [
		{ value: "from-purple-600 to-pink-600", label: "Purple to Pink" },
		{ value: "from-blue-600 to-cyan-600", label: "Blue to Cyan" },
		{ value: "from-green-600 to-teal-600", label: "Green to Teal" },
		{ value: "from-red-600 to-orange-600", label: "Red to Orange" },
		{ value: "from-indigo-600 to-purple-600", label: "Indigo to Purple" },
		{ value: "from-pink-600 to-rose-600", label: "Pink to Rose" },
		{ value: "from-amber-600 to-yellow-600", label: "Amber to Yellow" },
		{ value: "from-slate-600 to-slate-800", label: "Slate Dark" },
	];

	return (
		<AdminLayout currentPath="/admin/templates" userRole={role}>
			<div>
				<div className="mb-6">
					<button
						type="button"
						onClick={() => navigate({ to: "/admin/templates" })}
						className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Templates
					</button>
					<div className="flex items-start justify-between">
						<div>
							<h1 className="text-3xl font-bold text-slate-900 mb-2">
								Edit Template
							</h1>
							<p className="text-slate-600">
								Update template details and manage its status.
							</p>
						</div>
						<StatusBadge status={template.status} />
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

						{/* Title */}
						<div>
							<label
								htmlFor="title"
								className="block text-sm font-medium text-slate-900 mb-2"
							>
								Title *
							</label>
							<input
								type="text"
								id="title"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								required
							/>
						</div>

						{/* Description */}
						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-slate-900 mb-2"
							>
								Description *
							</label>
							<textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								rows={4}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								required
							/>
						</div>

						{/* Base Tropes */}
						<div>
							<label
								htmlFor="tropes"
								className="block text-sm font-medium text-slate-900 mb-2"
							>
								Base Tropes *
							</label>
							<input
								type="text"
								id="tropes"
								value={formData.base_tropes}
								onChange={(e) =>
									setFormData({ ...formData, base_tropes: e.target.value })
								}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								required
							/>
							<p className="mt-1 text-sm text-slate-600">
								Separate multiple tropes with commas
							</p>
						</div>

						{/* Estimated Scenes */}
						<div>
							<label
								htmlFor="scenes"
								className="block text-sm font-medium text-slate-900 mb-2"
							>
								Estimated Scenes *
							</label>
							<input
								type="number"
								id="scenes"
								value={formData.estimated_scenes}
								onChange={(e) =>
									setFormData({
										...formData,
										estimated_scenes: Number.parseInt(e.target.value, 10),
									})
								}
								min={1}
								max={100}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								required
							/>
						</div>

						{/* Cover Gradient */}
						<div>
							<label
								htmlFor="gradient"
								className="block text-sm font-medium text-slate-900 mb-2"
							>
								Cover Gradient *
							</label>
							<select
								id="gradient"
								value={formData.cover_gradient}
								onChange={(e) =>
									setFormData({ ...formData, cover_gradient: e.target.value })
								}
								className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
								required
							>
								{gradientOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							<div className="mt-2">
								<div
									className={`h-24 rounded-lg bg-gradient-to-br ${formData.cover_gradient}`}
								/>
							</div>
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

					{/* Status Management */}
					<div className="mt-8 pt-8 border-t border-slate-200">
						<h2 className="text-xl font-semibold text-slate-900 mb-4">
							Status Management
						</h2>
						<div className="flex flex-wrap gap-3">
							{template.status !== "draft" && (
								<button
									type="button"
									onClick={() => handleStatusChange("draft")}
									className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
								>
									<EyeOff className="w-4 h-4" />
									Set as Draft
								</button>
							)}
							{template.status !== "published" && (
								<button
									type="button"
									onClick={() => handleStatusChange("published")}
									className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
								>
									<Eye className="w-4 h-4" />
									Publish
								</button>
							)}
							{template.status !== "archived" && (
								<button
									type="button"
									onClick={() => handleStatusChange("archived")}
									className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
								>
									<Archive className="w-4 h-4" />
									Archive
								</button>
							)}
							{template.status === "archived" && (
								<button
									type="button"
									onClick={() => handleStatusChange("published")}
									className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
								>
									<ArchiveRestore className="w-4 h-4" />
									Unarchive
								</button>
							)}
						</div>
					</div>

					{/* Danger Zone (Admin Only) */}
					{role === "admin" && (
						<div className="mt-8 pt-8 border-t border-red-200">
							<h2 className="text-xl font-semibold text-red-900 mb-4">
								Danger Zone
							</h2>
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
								<p className="text-sm text-red-800 mb-4">
									Deleting a template is permanent and will remove all
									associated choice points. User stories will remain but may have
									orphaned data.
								</p>
								<button
									type="button"
									onClick={() => setShowDeleteDialog(true)}
									className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
								>
									<Trash2 className="w-4 h-4" />
									Delete Template
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Status Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showStatusDialog}
				onClose={() => {
					setShowStatusDialog(false);
					setPendingStatus(null);
				}}
				onConfirm={confirmStatusChange}
				title={`Change status to ${pendingStatus}?`}
				message={getStatusDialogMessage()}
				confirmText="Change Status"
				loading={statusMutation.isPending}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showDeleteDialog}
				onClose={() => setShowDeleteDialog(false)}
				onConfirm={() => deleteMutation.mutate()}
				title="Delete Template?"
				message="This action cannot be undone. All choice points will be deleted. User stories will remain but may have orphaned data."
				confirmText="Delete Template"
				loading={deleteMutation.isPending}
			/>
		</AdminLayout>
	);
}
