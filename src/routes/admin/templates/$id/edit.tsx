import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Archive,
	ArchiveRestore,
	ArrowLeft,
	Eye,
	EyeOff,
	Save,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import {
	AdminLayout,
	ChoicePointForm,
	ConfirmDialog,
	StatusBadge,
} from "~/components/admin";
import type { ChoicePoint } from "~/components/admin/ChoicePointForm";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useAdminTemplateQuery } from "~/hooks/useAdminTemplateQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useDeleteTemplateMutation } from "~/hooks/useDeleteTemplateMutation";
import { useUpdateChoicePointsMutation } from "~/hooks/useUpdateChoicePointsMutation";
import { useUpdateTemplateMutation } from "~/hooks/useUpdateTemplateMutation";
import { useUpdateTemplateStatusMutation } from "~/hooks/useUpdateTemplateStatusMutation";
import type { TemplateStatus } from "~/lib/api/types";

export const Route = createFileRoute("/admin/templates/$id/edit")({
	component: EditTemplatePage,
});

interface TemplateFormData {
	title: string;
	description: string;
	base_tropes: string;
	estimated_scenes: number;
	cover_gradient: string;
}

function EditTemplatePage() {
	const navigate = useNavigate();
	const { id } = Route.useParams();

	const [formData, setFormData] = useState<TemplateFormData | null>(null);
	const [choicePoints, setChoicePoints] = useState<ChoicePoint[]>([]);
	const [formError, setFormError] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showStatusDialog, setShowStatusDialog] = useState(false);
	const [pendingStatus, setPendingStatus] = useState<TemplateStatus | null>(
		null,
	);

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Fetch template
	const {
		data: templateData,
		isLoading: templateLoading,
		error,
	} = useAdminTemplateQuery(id, !!userData);

	// Initialize form data when template loads
	if (templateData?.template && !formData) {
		setFormData({
			title: templateData.template.title,
			description: templateData.template.description,
			base_tropes: templateData.template.base_tropes.join(", "),
			estimated_scenes: templateData.template.estimated_scenes,
			cover_gradient: templateData.template.cover_gradient,
		});
		// Initialize choice points if they exist
		if (templateData.template.choicePoints) {
			setChoicePoints(templateData.template.choicePoints);
		}
	}

	// Update template mutation
	const updateMutation = useUpdateTemplateMutation(id);

	const handleUpdateSuccess = () => {
		setFormError(null);
	};

	const handleUpdateError = (error: Error) => {
		setFormError(error.message);
	};

	// Update choice points mutation
	const updateChoicePointsMutation = useUpdateChoicePointsMutation(id);

	const handleSaveChoicePoints = () => {
		setFormError(null);

		// Validate choice points
		if (choicePoints.length > 0) {
			for (const cp of choicePoints) {
				if (!cp.prompt_text.trim()) {
					setFormError("All choice points must have a prompt text");
					return;
				}
				if (cp.options.length < 2 || cp.options.length > 4) {
					setFormError("Each choice point must have 2-4 options");
					return;
				}
				for (const opt of cp.options) {
					if (!opt.text.trim() || !opt.tone.trim() || !opt.impact.trim()) {
						setFormError(
							"All option fields (text, tone, impact) must be filled",
						);
						return;
					}
				}
			}
		}

		updateChoicePointsMutation.mutate(
			{ choicePoints },
			{
				onSuccess: () => {
					setFormError(null);
				},
				onError: (error: Error) => {
					setFormError(error.message);
				},
			},
		);
	};

	// Update status mutation
	const statusMutation = useUpdateTemplateStatusMutation(id);

	const handleStatusSuccess = () => {
		setShowStatusDialog(false);
		setPendingStatus(null);
	};

	const handleStatusError = (error: Error) => {
		setFormError(error.message);
	};

	// Delete template mutation
	const deleteMutation = useDeleteTemplateMutation(id);

	const handleDeleteSuccess = () => {
		navigate({ to: "/admin/templates" });
	};

	const handleDeleteError = (error: Error) => {
		setFormError(error.message);
		setShowDeleteDialog(false);
	};

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

		updateMutation.mutate(formData, {
			onSuccess: handleUpdateSuccess,
			onError: handleUpdateError,
		});
	};

	const handleStatusChange = (status: TemplateStatus) => {
		setPendingStatus(status);
		setShowStatusDialog(true);
	};

	const confirmStatusChange = () => {
		if (pendingStatus) {
			statusMutation.mutate(pendingStatus, {
				onSuccess: handleStatusSuccess,
				onError: handleStatusError,
			});
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
		{ value: "from-amber-400 to-orange-500", label: "Amber to Orange" },
		{ value: "from-amber-500 to-yellow-600", label: "Amber to Yellow" },
		{ value: "from-blue-600 to-indigo-800", label: "Blue to Indigo" },
		{ value: "from-cyan-400 to-blue-500", label: "Cyan to Blue" },
		{ value: "from-emerald-600 to-teal-700", label: "Emerald to Teal" },
		{ value: "from-fuchsia-500 to-pink-600", label: "Fuchsia to Pink" },
		{ value: "from-gray-700 to-slate-900", label: "Gray to Slate" },
		{ value: "from-green-500 to-emerald-700", label: "Green to Emerald" },
		{ value: "from-lime-500 to-green-600", label: "Lime to Green" },
		{ value: "from-orange-600 to-red-700", label: "Orange to Red" },
		{ value: "from-purple-600 to-indigo-700", label: "Purple to Indigo" },
		{ value: "from-purple-500 to-pink-600", label: "Purple to Pink" },
		{ value: "from-purple-600 to-pink-600", label: "Purple to Pink (Alt)" },
		{ value: "from-red-700 to-black", label: "Red to Black" },
		{ value: "from-red-600 to-rose-700", label: "Red to Rose" },
		{ value: "from-rose-500 to-pink-600", label: "Rose to Pink" },
		{ value: "from-rose-400 to-red-500", label: "Rose to Red" },
		{ value: "from-sky-500 to-blue-600", label: "Sky to Blue" },
		{ value: "from-slate-600 to-gray-800", label: "Slate to Gray" },
		{ value: "from-stone-600 to-zinc-800", label: "Stone to Zinc" },
		{ value: "from-teal-500 to-cyan-700", label: "Teal to Cyan" },
		{ value: "from-violet-600 to-purple-800", label: "Violet to Purple" },
		{ value: "from-yellow-600 to-amber-700", label: "Yellow to Amber" },
		{ value: "from-yellow-600 to-orange-700", label: "Yellow to Orange" },
		{ value: "from-zinc-700 to-neutral-900", label: "Zinc to Neutral" },
	];

	return (
		<AdminLayout currentPath="/admin/templates" userRole={role}>
			<div>
				<div className="mb-6">
					<Button
						variant="ghost"
						onClick={() => navigate({ to: "/admin/templates" })}
						className="mb-4"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Templates
					</Button>
					<div className="flex items-start justify-between">
						<div className="flex flex-col gap-2">
							<Heading level="h1">Edit Template</Heading>
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
						<FormInput
							label="Title *"
							type="text"
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							required
						/>

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
						<FormInput
							label="Base Tropes *"
							type="text"
							value={formData.base_tropes}
							onChange={(e) =>
								setFormData({ ...formData, base_tropes: e.target.value })
							}
							helperText="Separate multiple tropes with commas"
							required
						/>

						{/* Estimated Scenes */}
						<FormInput
							label="Estimated Scenes *"
							type="number"
							value={formData.estimated_scenes}
							onChange={(e) =>
								setFormData({
									...formData,
									estimated_scenes: Number.parseInt(e.target.value, 10),
								})
							}
							min={1}
							max={100}
							helperText="Approximate number of scenes (1-100)"
							required
						/>

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
									className={`h-24 rounded-lg bg-linear-to-br ${formData.cover_gradient}`}
								/>
							</div>
						</div>

						{/* Save Template Changes Button */}
						<div className="pt-4 border-t border-slate-200">
							<Button
								type="submit"
								loading={updateMutation.isPending}
								variant="primary"
							>
								<Save className="w-5 h-5" />
								Save Template Changes
							</Button>
						</div>
					</form>

					{/* Choice Points Management */}
					<div className="mt-8 pt-8 border-t border-slate-200">
						<div className="mb-6">
							<h2 className="text-xl font-semibold text-slate-900 mb-2">
								Choice Points
							</h2>
							<p className="text-slate-600">
								Manage choice points that appear throughout the story. Changes
								are saved separately from template details.
							</p>
						</div>

						<ChoicePointForm
							choicePoints={choicePoints}
							onChange={setChoicePoints}
							maxScenes={formData.estimated_scenes}
						/>

						<div className="mt-6">
							<Button
								type="button"
								onClick={handleSaveChoicePoints}
								loading={updateChoicePointsMutation.isPending}
								variant="primary"
							>
								<Save className="w-5 h-5" />
								Save Choice Points
							</Button>
						</div>
					</div>

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
									associated choice points. User stories will remain but may
									have orphaned data.
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
				onConfirm={() =>
					deleteMutation.mutate(undefined, {
						onSuccess: handleDeleteSuccess,
						onError: handleDeleteError,
					})
				}
				title="Delete Template?"
				message="This action cannot be undone. All choice points will be deleted. User stories will remain but may have orphaned data."
				confirmText="Delete Template"
				loading={deleteMutation.isPending}
			/>
		</AdminLayout>
	);
}
