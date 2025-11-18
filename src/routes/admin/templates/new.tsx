import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { AdminLayout, ChoicePointForm } from "~/components/admin";
import type { ChoicePoint } from "~/components/admin/ChoicePointForm";
import { TropeSelector } from "~/components/admin/TropeSelector";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useCreateTemplateMutation } from "~/hooks/useCreateTemplateMutation";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { GRADIENT_OPTIONS } from "~/lib/constants/gradients";
import {
	type TemplateFormData,
	validateChoicePoints,
	validateTemplateForm,
} from "~/lib/validation/templates";

export const Route = createFileRoute("/admin/templates/new")({
	component: NewTemplatePage,
});

interface ExtendedTemplateFormData extends TemplateFormData {
	choicePoints: ChoicePoint[];
}

interface CreateTemplateResponse {
	template: {
		id: string;
	};
}

function NewTemplatePage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<ExtendedTemplateFormData>({
		title: "",
		description: "",
		base_tropes: [],
		estimated_scenes: 10,
		cover_gradient: "from-purple-600 to-pink-600",
		choicePoints: [],
	});
	const [formError, setFormError] = useState<string | null>(null);

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Create template mutation
	const createMutation = useCreateTemplateMutation();

	const handleMutationSuccess = (data: CreateTemplateResponse) => {
		navigate({ to: `/admin/templates/${data.template.id}/edit` });
	};

	const handleMutationError = (error: Error) => {
		setFormError(error.message);
	};

	if (userLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	if (!userData) {
		return null;
	}

	const { role } = userData;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		// Validate template form
		const templateValidation = validateTemplateForm(formData);
		if (!templateValidation.valid) {
			setFormError(templateValidation.error || "Invalid form data");
			return;
		}

		// Validate choice points
		const choicePointsValidation = validateChoicePoints(
			formData.choicePoints,
			formData.estimated_scenes,
		);
		if (!choicePointsValidation.valid) {
			setFormError(choicePointsValidation.error || "Invalid choice points");
			return;
		}

		createMutation.mutate(formData, {
			onSuccess: handleMutationSuccess,
			onError: handleMutationError,
		});
	};

	return (
		<AdminLayout currentPath="/admin/templates" userRole={role}>
			<div className="space-y-6">
				<div className="space-y-4">
					<Button
						variant="ghost"
						onClick={() => navigate({ to: "/admin/templates" })}
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Templates
					</Button>
					<div className="flex flex-col gap-2">
						<Heading level="h1">Create New Template</Heading>
						<p className="text-slate-600">
							Create a new novel template. It will be saved as a draft.
						</p>
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
							placeholder="e.g., Royal Romance Adventure"
							required
						/>

						{/* Description */}
						<div className="space-y-2">
							<label
								htmlFor="description"
								className="block text-sm font-medium text-slate-900"
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
								placeholder="Describe the template..."
								required
							/>
						</div>

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
						<div className="space-y-2">
							<label
								htmlFor="gradient"
								className="block text-sm font-medium text-slate-900"
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
						</div>

						{/* Choice Points */}
						<div className="pt-6 border-t border-slate-200">
							<ChoicePointForm
								choicePoints={formData.choicePoints}
								onChange={(choicePoints) =>
									setFormData({ ...formData, choicePoints })
								}
								maxScenes={formData.estimated_scenes}
							/>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-4 pt-4 border-t border-slate-200">
							<Button
								type="submit"
								loading={createMutation.isPending}
								variant="primary"
							>
								<Save className="w-5 h-5" />
								Create Template
							</Button>
							<Button
								type="button"
								onClick={() => navigate({ to: "/admin/templates" })}
								variant="ghost"
							>
								Cancel
							</Button>
						</div>
					</form>
				</div>
			</div>
		</AdminLayout>
	);
}
