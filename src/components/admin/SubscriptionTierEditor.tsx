import { ExternalLink, Save } from "lucide-react";
import { useState } from "react";
import { useUpdateTierMutation } from "~/hooks/useAdminSubscriptionTiersQuery";
import type { SubscriptionTier } from "~/lib/db/types";

interface SubscriptionTierEditorProps {
	tier: {
		tier: SubscriptionTier;
		name: string;
		description: string | null;
		price_monthly: string;
		price_yearly: string | null;
		text_generations_per_day: number;
		voice_generations_per_day: number;
		features: Record<string, boolean> | null;
		is_active: boolean;
		stripe_product_id: string | null;
		stripe_price_id_monthly: string | null;
		stripe_price_id_yearly: string | null;
	};
}

export function SubscriptionTierEditor({ tier }: SubscriptionTierEditorProps) {
	const [formData, setFormData] = useState({
		name: tier.name,
		description: tier.description || "",
		price_monthly: Number(tier.price_monthly),
		price_yearly: tier.price_yearly ? Number(tier.price_yearly) : 0,
		text_generations_per_day: tier.text_generations_per_day,
		voice_generations_per_day: tier.voice_generations_per_day,
		priority_support: tier.features?.priority_support || false,
		advanced_ai_models: tier.features?.advanced_ai_models || false,
		early_access: tier.features?.early_access || false,
		is_active: tier.is_active,
	});

	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const updateMutation = useUpdateTierMutation();

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value, type } = e.target;

		if (type === "checkbox") {
			const checked = (e.target as HTMLInputElement).checked;
			setFormData((prev) => ({
				...prev,
				[name]: checked,
			}));
		} else if (type === "number") {
			setFormData((prev) => ({
				...prev,
				[name]: Number(value),
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage(null);

		try {
			await updateMutation.mutateAsync({
				tierId: tier.tier,
				data: {
					name: formData.name,
					description: formData.description || null,
					price_monthly: formData.price_monthly,
					price_yearly:
						formData.price_yearly > 0 ? formData.price_yearly : null,
					text_generations_per_day: formData.text_generations_per_day,
					voice_generations_per_day: formData.voice_generations_per_day,
					features: {
						priority_support: formData.priority_support,
						advanced_ai_models: formData.advanced_ai_models,
						early_access: formData.early_access,
					},
					is_active: formData.is_active,
				},
			});

			setMessage({
				type: "success",
				text: "Tier updated successfully! Stripe products/prices synced.",
			});

			setTimeout(() => setMessage(null), 5000);
		} catch (error) {
			setMessage({
				type: "error",
				text: error instanceof Error ? error.message : "Failed to update tier",
			});
		}
	};

	const isFree = tier.tier === "free";

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Message */}
				{message && (
					<div
						className={`p-4 rounded-lg ${
							message.type === "success"
								? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
								: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
						}`}
					>
						<p
							className={`text-sm ${
								message.type === "success"
									? "text-green-800 dark:text-green-200"
									: "text-red-800 dark:text-red-200"
							}`}
						>
							{message.text}
						</p>
					</div>
				)}

				{/* Basic Info */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
						Basic Information
					</h3>

					<div>
						<label
							htmlFor="tier-name"
							className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1"
						>
							Tier Name
						</label>
						<input
							id="tier-name"
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100"
						/>
					</div>

					<div>
						<label
							htmlFor="tier-description"
							className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1"
						>
							Description
						</label>
						<textarea
							id="tier-description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows={3}
							className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100"
						/>
					</div>
				</div>

				{/* Pricing */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
						Pricing
					</h3>

					{isFree && (
						<p className="text-sm text-orange-600 dark:text-orange-400">
							Pricing cannot be changed for the free tier.
						</p>
					)}

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="tier-price-monthly"
								className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1"
							>
								Monthly Price ($)
							</label>
							<input
								id="tier-price-monthly"
								type="number"
								name="price_monthly"
								value={formData.price_monthly}
								onChange={handleChange}
								disabled={isFree}
								min="0"
								step="0.01"
								required
								className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
							/>
						</div>

						<div>
							<label
								htmlFor="tier-price-yearly"
								className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1"
							>
								Yearly Price ($)
							</label>
							<input
								id="tier-price-yearly"
								type="number"
								name="price_yearly"
								value={formData.price_yearly}
								onChange={handleChange}
								disabled={isFree}
								min="0"
								step="0.01"
								className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
							/>
							<p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
								Set to 0 to disable yearly billing
							</p>
						</div>
					</div>
				</div>

				{/* Usage Limits */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
						Usage Limits
					</h3>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="tier-text-gens"
								className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1"
							>
								Text Generations per Day
							</label>
							<input
								id="tier-text-gens"
								type="number"
								name="text_generations_per_day"
								value={formData.text_generations_per_day}
								onChange={handleChange}
								min="-1"
								required
								className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100"
							/>
							<p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
								Use -1 for unlimited
							</p>
						</div>

						<div>
							<label
								htmlFor="tier-voice-gens"
								className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1"
							>
								Voice Generations per Day
							</label>
							<input
								id="tier-voice-gens"
								type="number"
								name="voice_generations_per_day"
								value={formData.voice_generations_per_day}
								onChange={handleChange}
								min="-1"
								required
								className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100"
							/>
							<p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
								Use -1 for unlimited, 0 for none
							</p>
						</div>
					</div>
				</div>

				{/* Features */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
						Features
					</h3>

					<div className="space-y-2">
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								name="priority_support"
								checked={formData.priority_support}
								onChange={handleChange}
								className="rounded border-slate-300 dark:border-gray-600"
							/>
							<span className="text-sm text-slate-700 dark:text-gray-300">
								Priority Support
							</span>
						</label>

						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								name="advanced_ai_models"
								checked={formData.advanced_ai_models}
								onChange={handleChange}
								className="rounded border-slate-300 dark:border-gray-600"
							/>
							<span className="text-sm text-slate-700 dark:text-gray-300">
								Advanced AI Models
							</span>
						</label>

						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								name="early_access"
								checked={formData.early_access}
								onChange={handleChange}
								className="rounded border-slate-300 dark:border-gray-600"
							/>
							<span className="text-sm text-slate-700 dark:text-gray-300">
								Early Access to Features
							</span>
						</label>
					</div>
				</div>

				{/* Status */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
						Status
					</h3>

					<label className="flex items-center gap-2">
						<input
							type="checkbox"
							name="is_active"
							checked={formData.is_active}
							onChange={handleChange}
							disabled={isFree}
							className="rounded border-slate-300 dark:border-gray-600"
						/>
						<span className="text-sm text-slate-700 dark:text-gray-300">
							Active (visible to users)
						</span>
					</label>
				</div>

				{/* Stripe Info */}
				<div className="space-y-4 border-t border-slate-200 dark:border-gray-700 pt-6">
					<h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
						Stripe Information
					</h3>

					<div className="space-y-2 text-sm">
						<div className="flex items-center justify-between">
							<span className="text-slate-600 dark:text-gray-400">
								Product ID:
							</span>
							{tier.stripe_product_id ? (
								<a
									href={`https://dashboard.stripe.com/products/${tier.stripe_product_id}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline font-mono"
								>
									{tier.stripe_product_id}
									<ExternalLink className="w-3 h-3" />
								</a>
							) : (
								<span className="text-slate-400 dark:text-gray-500">
									Not synced
								</span>
							)}
						</div>

						<div className="flex items-center justify-between">
							<span className="text-slate-600 dark:text-gray-400">
								Monthly Price ID:
							</span>
							<span className="font-mono text-slate-700 dark:text-gray-300">
								{tier.stripe_price_id_monthly || "N/A"}
							</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-slate-600 dark:text-gray-400">
								Yearly Price ID:
							</span>
							<span className="font-mono text-slate-700 dark:text-gray-300">
								{tier.stripe_price_id_yearly || "N/A"}
							</span>
						</div>
					</div>

					<p className="text-xs text-slate-500 dark:text-gray-400">
						When you save changes to pricing, new Stripe prices will be created
						automatically. Old prices are archived to preserve existing
						subscriptions.
					</p>
				</div>

				{/* Submit Button */}
				<div className="flex justify-end pt-4 border-t border-slate-200 dark:border-gray-700">
					<button
						type="submit"
						disabled={updateMutation.isPending}
						className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
					>
						<Save className="w-4 h-4" />
						{updateMutation.isPending ? "Saving..." : "Save Changes"}
					</button>
				</div>
			</form>
		</div>
	);
}
