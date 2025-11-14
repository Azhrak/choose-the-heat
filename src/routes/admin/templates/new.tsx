import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { AdminLayout } from "~/components/admin";
import { Button } from "~/components/Button";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormInput } from "~/components/FormInput";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useCreateTemplateMutation } from "~/hooks/useCreateTemplateMutation";

export const Route = createFileRoute("/admin/templates/new")({
	component: NewTemplatePage,
});

interface TemplateFormData {
	title: string;
	description: string;
	base_tropes: string;
	estimated_scenes: number;
	cover_gradient: string;
}

function NewTemplatePage() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<TemplateFormData>({
		title: "",
		description: "",
		base_tropes: "",
		estimated_scenes: 10,
		cover_gradient: "from-purple-600 to-pink-600",
	});
	const [formError, setFormError] = useState<string | null>(null);

	// Fetch current user to get role
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();

	// Create template mutation
	const createMutation = useCreateTemplateMutation();

	const handleMutationSuccess = (data: any) => {
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

		createMutation.mutate(formData, {
			onSuccess: handleMutationSuccess,
			onError: handleMutationError,
		});
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
					<h1 className="text-3xl font-bold text-slate-900 mb-2">
						Create New Template
					</h1>
					<p className="text-slate-600">
						Create a new novel template. It will be saved as a draft.
					</p>
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
								placeholder="Describe the template..."
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
							placeholder="e.g., enemies-to-lovers, royalty, slow burn"
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
									className={`h-24 rounded-lg bg-gradient-to-br ${formData.cover_gradient}`}
								/>
							</div>
						</div>

						{/* Actions */}
						<div className="flex items-center gap-4 pt-4 border-t border-slate-200">
							<button
								type="submit"
								disabled={createMutation.isPending}
								className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{createMutation.isPending ? (
									<LoadingSpinner />
								) : (
									<>
										<Save className="w-5 h-5" />
										Create Template
									</>
								)}
							</button>
							<button
								type="button"
								onClick={() => navigate({ to: "/admin/templates" })}
								className="px-6 py-2 text-slate-600 hover:text-slate-900 transition-colors"
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</div>
		</AdminLayout>
	);
}
