import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "~/components/admin/AdminLayout";
import type { ChoicePoint } from "~/components/admin/ChoicePointForm";
import { ChoicePointForm } from "~/components/admin/ChoicePointForm";
import { ConfirmDialog } from "~/components/admin/ConfirmDialog";
import { StatusBadge } from "~/components/admin/StatusBadge";
import { TemplateStatusManager } from "~/components/admin/TemplateStatusManager";
import { TropeSelector } from "~/components/admin/TropeSelector";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { FormTextarea } from "~/components/FormTextarea";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import { useAdminTemplateQuery } from "~/hooks/useAdminTemplateQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useDeleteTemplateMutation } from "~/hooks/useDeleteTemplateMutation";
import { useUpdateChoicePointsMutation } from "~/hooks/useUpdateChoicePointsMutation";
import { useUpdateTemplateMutation } from "~/hooks/useUpdateTemplateMutation";
import { useUpdateTemplateStatusMutation } from "~/hooks/useUpdateTemplateStatusMutation";
import type { TemplateStatus } from "~/lib/api/types";
import { GRADIENT_OPTIONS } from "~/lib/constants/gradients";
import {
	type TemplateFormData,
	validateChoicePoints,
	validateTemplateForm,
} from "~/lib/validation/templates";

export const Route = createFileRoute("/admin/templates/$id/edit")({
	component: EditTemplatePage,
});

function EditTemplatePage() {
	const navigate = useNavigate();
	const { id } = Route.useParams();

	const [formData, setFormData] = useState<TemplateFormData | null>(null);
	const [choicePoints, setChoicePoints] = useState<ChoicePoint[]>([]);
	const [formError, setFormError] = useState<string | null>(null);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
			base_tropes: templateData.template.base_tropes,
			estimated_scenes: templateData.template.estimated_scenes,
			cover_gradient: templateData.template.cover_gradient,
		});
		// Initialize choice points if they exist
		if (templateData.template.choicePoints) {
			// Sanitize scene numbers that exceed the valid range
			const maxSceneNumber = templateData.template.estimated_scenes - 1;
			const sanitizedChoicePoints = templateData.template.choicePoints.map(
				(cp) => {
					// If scene_number is invalid (>= estimated_scenes), clamp it to maxSceneNumber
					if (cp.scene_number >= templateData.template.estimated_scenes) {
						return {
							...cp,
							scene_number: Math.min(cp.scene_number, maxSceneNumber),
						};
					}
					return cp;
				},
			);
			setChoicePoints(sanitizedChoicePoints);
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
		const validationResult = validateChoicePoints(
			choicePoints,
			formData?.estimated_scenes,
		);
		if (!validationResult.valid) {
			setFormError(validationResult.error || "Invalid choice points");
			return;
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

	const handleStatusChange = (status: TemplateStatus) => {
		setFormError(null);
		statusMutation.mutate(status, {
			onError: (error: Error) => {
				setFormError(error.message);
			},
		});
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
		const validationResult = validateTemplateForm(formData);
		if (!validationResult.valid) {
			setFormError(validationResult.error || "Invalid form data");
			return;
		}

		updateMutation.mutate(formData, {
			onSuccess: handleUpdateSuccess,
			onError: handleUpdateError,
		});
	};

	return (
		<AdminLayout currentPath="/admin/templates" userRole={role}>
			<Stack gap="md">
				<Stack gap="sm">
					<Button
						variant="ghost"
						onClick={() => navigate({ to: "/admin/templates" })}
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Templates
					</Button>
					<div className="flex items-start justify-between">
						<div className="flex flex-col gap-2">
							<Heading level="h1">Edit Template</Heading>
							<Text>Update template details and manage its status.</Text>
						</div>
						<StatusBadge status={template.status} />
					</div>
				</Stack>

				<div className="max-w-3xl">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Error Message */}
						{formError && (
							<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
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
						<FormTextarea
							label="Description *"
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							rows={4}
							required
						/>
						{/* Base Tropes */}
						<TropeSelector
							label="Base Tropes"
							selectedTropeKeys={formData.base_tropes}
							onChange={(tropeKeys) =>
								setFormData({ ...formData, base_tropes: tropeKeys })
							}
							helperText="Select one or more tropes that define this story template"
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
						<Stack gap="xs">
							<label
								htmlFor="gradient"
								className="block text-sm font-medium text-slate-900 dark:text-gray-100"
							>
								Cover Gradient *
							</label>
							{!GRADIENT_OPTIONS.find(
								(opt) => opt.value === formData.cover_gradient,
							) && (
								<div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
									<p className="text-sm text-amber-800 dark:text-amber-300">
										Warning: Current gradient "{formData.cover_gradient}" is not
										in the available options. Please select a valid gradient.
									</p>
								</div>
							)}
							<select
								id="gradient"
								value={formData.cover_gradient}
								onChange={(e) =>
									setFormData({ ...formData, cover_gradient: e.target.value })
								}
								className="w-full px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
								required
							>
								{GRADIENT_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
							<div>
								<div
									className={`h-24 rounded-lg bg-linear-to-br ${formData.cover_gradient}`}
								/>
							</div>
						</Stack>
						{/* Save Template Changes Button */}
						<div className="pt-4 border-t border-slate-200 dark:border-gray-700">
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
					<div className="mt-8 pt-8 border-t border-slate-200 dark:border-gray-700 space-y-6">
						<Stack gap="xs">
							<Heading level="h2" size="subsection">
								Choice Points
							</Heading>
							<Text>
								Manage choice points that appear throughout the story. Changes
								are saved separately from template details.
							</Text>
						</Stack>

						<ChoicePointForm
							choicePoints={choicePoints}
							onChange={setChoicePoints}
							maxScenes={formData.estimated_scenes}
						/>

						<div>
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
					<div className="mt-8 pt-8 border-t border-slate-200 dark:border-gray-700 space-y-4">
						<Heading level="h2" size="subsection">
							Status Management
						</Heading>
						<TemplateStatusManager
							currentStatus={template.status}
							onStatusChange={handleStatusChange}
							isLoading={statusMutation.isPending}
						/>
					</div>

					{/* Danger Zone (Admin Only) */}
					{role === "admin" && (
						<div className="mt-8 pt-8 border-t border-red-200 dark:border-red-700 space-y-4">
							<Heading level="h2" size="subsection" variant="danger">
								Danger Zone
							</Heading>
							<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 space-y-4">
								<p className="text-sm text-red-800 dark:text-red-300">
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
			</Stack>

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
