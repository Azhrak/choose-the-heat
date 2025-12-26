import { AlertCircle, Check, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllTextProviders, getAllTTSProviders } from "~/lib/ai/providers";
import type { ModelCategory } from "~/lib/db/queries/aiModels";
import type { AIModel } from "~/lib/db/types";

interface ModelManagementPanelProps {
	category: ModelCategory;
}

type ModelsByStatus = {
	pending: AIModel[];
	enabled: AIModel[];
	disabled: AIModel[];
	deprecated: AIModel[];
};

export function ModelManagementPanel(props: ModelManagementPanelProps) {
	const [selectedProvider, setSelectedProvider] = useState<string | "all">(
		"all",
	);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [models, setModels] = useState<AIModel[]>([]);
	const [defaultModels, setDefaultModels] = useState<Record<string, string>>(
		{},
	);
	const [selectedPendingModels, setSelectedPendingModels] = useState<
		Set<string>
	>(new Set());
	const [isLoading, setIsLoading] = useState(false);

	// Get providers based on category - memoize to prevent infinite loop
	const allProviders = useMemo(
		() =>
			props.category === "text" ? getAllTextProviders() : getAllTTSProviders(),
		[props.category],
	);

	// Load default model settings for each provider
	const loadDefaultModels = useCallback(async () => {
		const settingCategory = props.category === "text" ? "ai" : "tts";
		const defaults: Record<string, string> = {};

		for (const provider of allProviders) {
			try {
				const response = await fetch(
					`/api/admin/settings?category=${settingCategory}`,
				);
				if (response.ok) {
					const data = await response.json();
					const setting = data.settings?.find(
						(s: { key: string; value: string }) =>
							s.key === `${settingCategory}.${provider.id}.default_model`,
					);
					if (setting) {
						defaults[provider.id] = setting.value;
					}
				}
			} catch (error) {
				console.error(`Failed to load default for ${provider.id}:`, error);
			}
		}

		setDefaultModels(defaults);
	}, [props.category, allProviders]);

	// Load models on mount and when filters change
	const loadModels = useCallback(async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				category: props.category,
			});

			if (selectedProvider !== "all") {
				params.append("provider", selectedProvider);
			}

			const response = await fetch(`/api/admin/models?${params}`);
			if (!response.ok) throw new Error("Failed to load models");

			const data = await response.json();
			setModels(data.models || []);

			// Load default models for each provider
			await loadDefaultModels();
		} catch (error) {
			console.error("Failed to load models:", error);
		} finally {
			setIsLoading(false);
		}
	}, [props.category, selectedProvider, loadDefaultModels]);

	// Trigger model discovery
	const handleRefreshModels = async () => {
		setIsRefreshing(true);
		try {
			const response = await fetch("/api/admin/models/discover", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					provider: selectedProvider === "all" ? undefined : selectedProvider,
					category: props.category,
				}),
			});

			if (!response.ok) throw new Error("Failed to discover models");

			const data = await response.json();
			alert(
				data.message ||
					`Discovered ${data.totalNew} new models. ${data.totalErrors > 0 ? `${data.totalErrors} errors occurred.` : ""}`,
			);

			// Reload models
			await loadModels();
		} catch (error) {
			console.error("Failed to refresh models:", error);
			alert("Failed to refresh models. Please try again.");
		} finally {
			setIsRefreshing(false);
		}
	};

	// Approve a single model
	const handleApproveModel = async (modelId: string) => {
		try {
			const response = await fetch(`/api/admin/models/${modelId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "enabled" }),
			});

			if (!response.ok) throw new Error("Failed to approve model");

			// Update local state instead of reloading
			setModels((prev) =>
				prev.map((m) => (m.id === modelId ? { ...m, status: "enabled" } : m)),
			);
		} catch (error) {
			console.error("Failed to approve model:", error);
			alert("Failed to approve model");
		}
	};

	// Reject a single model
	const handleRejectModel = async (modelId: string) => {
		try {
			const response = await fetch(`/api/admin/models/${modelId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "disabled" }),
			});

			if (!response.ok) throw new Error("Failed to reject model");

			// Update local state instead of reloading
			setModels((prev) =>
				prev.map((m) => (m.id === modelId ? { ...m, status: "disabled" } : m)),
			);
		} catch (error) {
			console.error("Failed to reject model:", error);
			alert("Failed to reject model");
		}
	};

	// Bulk approve selected pending models
	const handleApproveSelected = async () => {
		if (selectedPendingModels.size === 0) return;

		try {
			const response = await fetch("/api/admin/models/", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model_ids: Array.from(selectedPendingModels),
					status: "enabled",
				}),
			});

			if (!response.ok) throw new Error("Failed to approve models");

			// Update local state instead of reloading
			const approvedIds = new Set(selectedPendingModels);
			setModels((prev) =>
				prev.map((m) =>
					approvedIds.has(m.id) ? { ...m, status: "enabled" } : m,
				),
			);
			setSelectedPendingModels(new Set());
		} catch (error) {
			console.error("Failed to approve models:", error);
			alert("Failed to approve models");
		}
	};

	// Disable an enabled model
	const handleDisableModel = async (modelId: string) => {
		try {
			const response = await fetch(`/api/admin/models/${modelId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "disabled" }),
			});

			if (!response.ok) throw new Error("Failed to disable model");

			// Update local state instead of reloading
			setModels((prev) =>
				prev.map((m) => (m.id === modelId ? { ...m, status: "disabled" } : m)),
			);
		} catch (error) {
			console.error("Failed to disable model:", error);
			alert("Failed to disable model");
		}
	};

	// Enable a disabled model
	const handleEnableModel = async (modelId: string) => {
		try {
			const response = await fetch(`/api/admin/models/${modelId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "enabled" }),
			});

			if (!response.ok) throw new Error("Failed to enable model");

			// Update local state instead of reloading
			setModels((prev) =>
				prev.map((m) => (m.id === modelId ? { ...m, status: "enabled" } : m)),
			);
		} catch (error) {
			console.error("Failed to enable model:", error);
			alert("Failed to enable model");
		}
	};

	// Set a model as default for its provider
	const handleSetDefault = async (provider: string, modelId: string) => {
		try {
			const response = await fetch("/api/admin/models/set-default", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					provider,
					category: props.category,
					model_id: modelId,
				}),
			});

			if (!response.ok) throw new Error("Failed to set default");

			// Update local state instead of reloading
			setDefaultModels((prev) => ({
				...prev,
				[provider]: modelId,
			}));
		} catch (error) {
			console.error("Failed to set default:", error);
			alert("Failed to set default model");
		}
	};

	// Toggle pending model selection
	const togglePendingSelection = (modelId: string) => {
		const newSet = new Set(selectedPendingModels);
		if (newSet.has(modelId)) {
			newSet.delete(modelId);
		} else {
			newSet.add(modelId);
		}
		setSelectedPendingModels(newSet);
	};

	// Group models by status
	const modelsByStatus: ModelsByStatus = models.reduce(
		(acc, model) => {
			if (model.status === "pending") {
				acc.pending.push(model);
			} else if (model.status === "enabled") {
				acc.enabled.push(model);
			} else if (model.status === "disabled") {
				acc.disabled.push(model);
			} else if (model.status === "deprecated") {
				acc.deprecated.push(model);
			}
			return acc;
		},
		{
			pending: [],
			enabled: [],
			disabled: [],
			deprecated: [],
		} as ModelsByStatus,
	);

	// Group enabled models by provider
	const enabledModelsByProvider = modelsByStatus.enabled.reduce(
		(acc, model) => {
			if (!acc[model.provider]) {
				acc[model.provider] = [];
			}
			acc[model.provider].push(model);
			return acc;
		},
		{} as Record<string, AIModel[]>,
	);

	// Load models when component mounts or filters change
	useEffect(() => {
		loadModels();
	}, [loadModels]);

	return (
		<div className="space-y-6">
			{/* Provider Selector and Refresh */}
			<div className="flex items-center gap-4">
				<select
					value={selectedProvider}
					onChange={(e) => setSelectedProvider(e.target.value)}
					className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100"
				>
					<option value="all">All Providers</option>
					{allProviders.map((provider) => (
						<option key={provider.id} value={provider.id}>
							{provider.name}
						</option>
					))}
				</select>

				<button
					type="button"
					onClick={handleRefreshModels}
					disabled={isRefreshing}
					className="px-4 py-2 bg-romance-600 hover:bg-romance-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<RefreshCw
						className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
					/>
					Refresh Models
				</button>
			</div>

			{isLoading ? (
				<div className="text-center py-8 text-slate-600 dark:text-gray-400">
					Loading models...
				</div>
			) : (
				<>
					{/* Pending Models Section */}
					{modelsByStatus.pending.length > 0 && (
						<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
							<h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center gap-2">
								<AlertCircle className="w-5 h-5" />
								Pending Models ({modelsByStatus.pending.length})
							</h3>
							<div className="space-y-2">
								{modelsByStatus.pending.map((model) => (
									<div
										key={model.id}
										className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded border border-yellow-200 dark:border-yellow-800"
									>
										<input
											type="checkbox"
											checked={selectedPendingModels.has(model.id)}
											onChange={() => togglePendingSelection(model.id)}
											className="w-4 h-4"
										/>
										<div className="flex-1">
											<div className="font-mono text-sm text-slate-900 dark:text-gray-100">
												{model.display_name || model.model_id}
											</div>
											<div className="text-xs text-slate-500 dark:text-gray-400">
												{model.provider} • Discovered{" "}
												{new Date(model.discovered_at).toLocaleDateString()}
											</div>
										</div>
										<button
											type="button"
											onClick={() => handleApproveModel(model.id)}
											className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
										>
											Approve
										</button>
										<button
											type="button"
											onClick={() => handleRejectModel(model.id)}
											className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
										>
											Reject
										</button>
									</div>
								))}
							</div>
							{selectedPendingModels.size > 0 && (
								<button
									type="button"
									onClick={handleApproveSelected}
									className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
								>
									Approve All Selected ({selectedPendingModels.size})
								</button>
							)}
						</div>
					)}

					{/* Enabled Models Section - Grouped by Provider */}
					{modelsByStatus.enabled.length > 0 && (
						<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
							<h3 className="font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
								<Check className="w-5 h-5" />
								Enabled Models ({modelsByStatus.enabled.length})
							</h3>
							<div className="space-y-8">
								{Object.entries(enabledModelsByProvider).map(
									([provider, providerModels]: [string, AIModel[]]) => (
										<div key={provider} className="space-y-4">
											{/* Provider Header */}
											<div className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
												<span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
													{provider}
												</span>
												<span className="text-xs text-slate-500 dark:text-slate-400">
													({providerModels.length}{" "}
													{providerModels.length === 1 ? "model" : "models"})
												</span>
											</div>

											{/* Provider's Models */}
											<div className="space-y-2 pl-2">
												{providerModels.map((model) => {
													const isDefault =
														defaultModels[model.provider] === model.model_id;
													return (
														<div
															key={model.id}
															className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded border border-green-200 dark:border-green-800"
														>
															<div className="flex-1">
																<div className="flex items-center gap-2">
																	<span className="font-mono text-sm text-slate-900 dark:text-gray-100">
																		{model.display_name || model.model_id}
																	</span>
																	{isDefault && (
																		<span className="px-2 py-0.5 bg-romance-100 dark:bg-romance-900 text-romance-700 dark:text-romance-300 text-xs rounded">
																			Default for {provider}
																		</span>
																	)}
																</div>
																<div className="text-xs text-slate-500 dark:text-gray-400">
																	{model.context_window &&
																		`${model.context_window.toLocaleString()} tokens`}
																</div>
															</div>
															{!isDefault && (
																<button
																	type="button"
																	onClick={() =>
																		handleSetDefault(
																			model.provider,
																			model.model_id,
																		)
																	}
																	className="px-3 py-1 bg-romance-600 hover:bg-romance-700 text-white rounded text-sm"
																>
																	Set as Default
																</button>
															)}
															<button
																type="button"
																onClick={() => handleDisableModel(model.id)}
																className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm"
															>
																Disable
															</button>
														</div>
													);
												})}
											</div>
										</div>
									),
								)}
							</div>
						</div>
					)}

					{/* Disabled Models Section */}
					{modelsByStatus.disabled.length > 0 && (
						<div className="bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
							<h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
								<X className="w-5 h-5" />
								Disabled Models ({modelsByStatus.disabled.length})
							</h3>
							<div className="space-y-2">
								{modelsByStatus.disabled.map((model) => (
									<div
										key={model.id}
										className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded border border-slate-200 dark:border-slate-700"
									>
										<div className="flex-1">
											<div className="font-mono text-sm text-slate-900 dark:text-gray-100">
												{model.display_name || model.model_id}
											</div>
											<div className="text-xs text-slate-500 dark:text-gray-400">
												{model.provider}
												{model.context_window &&
													` • ${model.context_window.toLocaleString()} tokens`}
											</div>
										</div>
										<button
											type="button"
											onClick={() => handleEnableModel(model.id)}
											className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
										>
											Enable
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Deprecated Models Section */}
					{modelsByStatus.deprecated.length > 0 && (
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
							<h3 className="font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
								<X className="w-5 h-5" />
								Deprecated Models ({modelsByStatus.deprecated.length})
							</h3>
							<div className="space-y-2">
								{modelsByStatus.deprecated.map((model) => (
									<div
										key={model.id}
										className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-3 rounded border border-red-200 dark:border-red-800"
									>
										<div className="flex-1">
											<div className="font-mono text-sm text-slate-900 dark:text-gray-100">
												{model.display_name || model.model_id}
											</div>
											<div className="text-xs text-slate-500 dark:text-gray-400">
												{model.provider} • Falls back to:{" "}
												{defaultModels[model.provider] || "provider default"}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Empty State */}
					{models.length === 0 && (
						<div className="text-center py-12 text-slate-600 dark:text-gray-400">
							No models found. Click "Refresh Models" to discover available
							models.
						</div>
					)}
				</>
			)}
		</div>
	);
}
