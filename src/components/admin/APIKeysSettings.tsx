import {
	AlertTriangle,
	Check,
	Eye,
	EyeOff,
	Key,
	Loader2,
	Save,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { useToast } from "./ToastContext";

interface APIKey {
	id: string;
	provider: string;
	encryptedKey: string;
	testStatus: "valid" | "invalid" | "untested" | null;
	testError: string | null;
	lastTestedAt: Date | null;
	updatedAt: Date;
}

interface APIKeysSettingsProps {
	apiKeys: APIKey[];
	onUpdate: (provider: string, apiKey: string) => Promise<void>;
	onTest: (provider: string) => Promise<{ valid: boolean; error?: string }>;
	onDelete: (provider: string) => Promise<void>;
}

const PROVIDERS = [
	{ id: "openai", name: "OpenAI", description: "GPT models" },
	{ id: "google", name: "Google", description: "Gemini models" },
	{ id: "anthropic", name: "Anthropic", description: "Claude models" },
	{ id: "mistral", name: "Mistral AI", description: "Mistral models" },
	{ id: "xai", name: "xAI", description: "Grok models" },
	{
		id: "openrouter",
		name: "OpenRouter",
		description: "Multi-provider access",
	},
	{ id: "google_tts", name: "Google TTS", description: "Text-to-Speech API" },
] as const;

export function APIKeysSettings(props: APIKeysSettingsProps) {
	const { showToast } = useToast();
	const [editingProvider, setEditingProvider] = useState<string | null>(null);
	const [editValue, setEditValue] = useState("");
	const [showKey, setShowKey] = useState<Record<string, boolean>>({});
	const [loading, setLoading] = useState<string | null>(null);
	const [testingAll, setTestingAll] = useState(false);

	const getKeyData = (providerId: string) => {
		return props.apiKeys.find((k) => k.provider === providerId);
	};

	const handleEdit = (providerId: string) => {
		setEditingProvider(providerId);
		setEditValue("");
		setShowKey((prev) => ({ ...prev, [providerId]: true }));
	};

	const handleCancel = () => {
		setEditingProvider(null);
		setEditValue("");
	};

	const handleSave = async (providerId: string) => {
		if (!editValue.trim()) return;

		setLoading(providerId);

		try {
			await props.onUpdate(providerId, editValue);
			setEditingProvider(null);
			setEditValue("");
			showToast({
				message: `${PROVIDERS.find((p) => p.id === providerId)?.name} API key saved and validated successfully!`,
				type: "success",
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to save API key";
			showToast({ message: errorMessage, type: "error" });
		} finally {
			setLoading(null);
		}
	};

	const handleTest = async (providerId: string) => {
		setLoading(providerId);

		try {
			const result = await props.onTest(providerId);
			const providerName = PROVIDERS.find((p) => p.id === providerId)?.name;
			if (result.valid) {
				showToast({
					message: `${providerName} API key is valid and working!`,
					type: "success",
				});
			} else {
				showToast({
					message: result.error || `${providerName} API key validation failed`,
					type: "error",
				});
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to test API key";
			showToast({ message: errorMessage, type: "error" });
		} finally {
			setLoading(null);
		}
	};

	const handleTestAll = async () => {
		const providersWithKeys = PROVIDERS.filter((p) => {
			const keyData = getKeyData(p.id);
			return keyData?.encryptedKey;
		});

		if (providersWithKeys.length === 0) return;

		setTestingAll(true);

		let validCount = 0;
		let invalidCount = 0;

		for (const provider of providersWithKeys) {
			setLoading(provider.id);
			try {
				const result = await props.onTest(provider.id);
				if (result.valid) {
					validCount++;
				} else {
					invalidCount++;
				}
			} catch {
				invalidCount++;
			}
		}

		setLoading(null);
		setTestingAll(false);

		// Show summary toast
		if (invalidCount === 0) {
			showToast({
				message: `All ${validCount} API keys tested successfully!`,
				type: "success",
			});
		} else if (validCount === 0) {
			showToast({
				message: `All ${invalidCount} API keys failed validation`,
				type: "error",
			});
		} else {
			showToast({
				message: `Testing complete: ${validCount} valid, ${invalidCount} invalid`,
				type: "warning",
			});
		}
	};

	const handleDelete = async (providerId: string) => {
		const providerName = PROVIDERS.find((p) => p.id === providerId)?.name;
		if (
			!confirm(
				`Are you sure you want to delete the ${providerName} API key? This cannot be undone.`,
			)
		) {
			return;
		}

		setLoading(providerId);

		try {
			await props.onDelete(providerId);
			showToast({
				message: `${providerName} API key deleted successfully`,
				type: "success",
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to delete API key";
			showToast({ message: errorMessage, type: "error" });
		} finally {
			setLoading(null);
		}
	};

	const getStatusColor = (status: APIKey["testStatus"] | undefined) => {
		switch (status) {
			case "valid":
				return "text-green-600 dark:text-green-400";
			case "invalid":
				return "text-red-600 dark:text-red-400";
			case "untested":
				return "text-yellow-600 dark:text-yellow-400";
			default:
				return "text-slate-400 dark:text-gray-500";
		}
	};

	const getStatusIcon = (status: APIKey["testStatus"] | undefined) => {
		switch (status) {
			case "valid":
				return "🟢";
			case "invalid":
				return "🔴";
			case "untested":
				return "🟡";
			default:
				return "⚪";
		}
	};

	const getStatusText = (keyData: APIKey | undefined) => {
		if (!keyData || !keyData.encryptedKey) {
			return "Not configured";
		}
		return keyData.testStatus || "untested";
	};

	const isProductionFailure = (keyData: APIKey | undefined) => {
		if (!keyData?.testError) return false;
		// Check if error came from production use (scene generation, audio generation, etc.)
		return (
			keyData.testError.includes("[scene generation]") ||
			keyData.testError.includes("[audio generation]") ||
			keyData.testError.includes("[AI streaming]")
		);
	};

	// Check if any keys have production failures
	const hasProductionFailures = props.apiKeys.some((key) =>
		isProductionFailure(key),
	);

	// Count configured keys
	const configuredKeysCount = props.apiKeys.filter(
		(k) => k.encryptedKey,
	).length;

	return (
		<div className="space-y-6">
			<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<div className="flex items-start justify-between gap-4">
					<p className="text-sm text-blue-800 dark:text-blue-300">
						API keys are encrypted and stored securely. Configure keys for the
						AI providers you want to use. Keys are tested automatically when
						saved.
					</p>
					{configuredKeysCount > 0 && (
						<button
							type="button"
							onClick={handleTestAll}
							disabled={testingAll || loading !== null}
							className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
						>
							{testingAll ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Testing All...
								</>
							) : (
								<>
									<Check className="w-4 h-4" />
									Test All Keys ({configuredKeysCount})
								</>
							)}
						</button>
					)}
				</div>
			</div>

			{/* Production Failure Alert */}
			{hasProductionFailures && (
				<div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
					<div className="flex items-start gap-3">
						<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
						<div>
							<h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">
								Production API Key Failures Detected
							</h4>
							<p className="text-sm text-red-700 dark:text-red-400">
								One or more API keys failed during actual use (scene generation,
								audio generation, etc.). This usually means the key is invalid,
								expired, or has insufficient permissions. Please update the
								affected keys below.
							</p>
						</div>
					</div>
				</div>
			)}

			<div className="space-y-4">
				{PROVIDERS.map((provider) => {
					const keyData = getKeyData(provider.id);
					const isEditing = editingProvider === provider.id;
					const isLoading = loading === provider.id;
					const hasKey = keyData?.encryptedKey;
					const hasProductionFailure = isProductionFailure(keyData);

					return (
						<div
							key={provider.id}
							className={cn(
								"bg-white dark:bg-gray-800 border rounded-lg p-6",
								hasProductionFailure
									? "border-red-300 dark:border-red-700 border-2"
									: "border-slate-200 dark:border-gray-700",
							)}
						>
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1">
									<div className="flex items-center gap-3">
										<h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
											{provider.name}
										</h3>
										<span className="text-sm text-slate-500 dark:text-gray-400">
											{provider.description}
										</span>
									</div>
									<div className="flex items-center gap-2 mt-2">
										<span
											className={cn(
												"text-sm font-medium",
												getStatusColor(keyData?.testStatus),
											)}
										>
											{getStatusIcon(keyData?.testStatus)}{" "}
											{getStatusText(keyData)}
										</span>
										{keyData?.lastTestedAt && (
											<span className="text-xs text-slate-400 dark:text-gray-500">
												• Last tested{" "}
												{new Date(keyData.lastTestedAt).toLocaleString()}
											</span>
										)}
									</div>
									{keyData?.testError && (
										<div
											className={cn(
												"mt-2 p-3 rounded-lg border",
												hasProductionFailure
													? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
													: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
											)}
										>
											{hasProductionFailure && (
												<div className="flex items-center gap-2 mb-1">
													<AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
													<span className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase">
														Production Failure
													</span>
												</div>
											)}
											<p
												className={cn(
													"text-sm",
													hasProductionFailure
														? "text-red-700 dark:text-red-300"
														: "text-yellow-700 dark:text-yellow-300",
												)}
											>
												{keyData.testError}
											</p>
										</div>
									)}
								</div>

								{!isEditing && (
									<div className="flex gap-2">
										{hasKey && (
											<button
												type="button"
												onClick={() => handleTest(provider.id)}
												disabled={isLoading}
												className="p-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 disabled:opacity-50"
												title="Test API key"
											>
												{isLoading ? (
													<Loader2 className="w-5 h-5 animate-spin" />
												) : (
													<Check className="w-5 h-5" />
												)}
											</button>
										)}
										<button
											type="button"
											onClick={() => handleEdit(provider.id)}
											disabled={isLoading}
											className="p-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 disabled:opacity-50"
											title={hasKey ? "Edit API key" : "Add API key"}
										>
											<Key className="w-5 h-5" />
										</button>
										{hasKey && (
											<button
												type="button"
												onClick={() => handleDelete(provider.id)}
												disabled={isLoading}
												className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
												title="Delete API key"
											>
												<Trash2 className="w-5 h-5" />
											</button>
										)}
									</div>
								)}
							</div>

							{isEditing && (
								<div className="space-y-3">
									<div className="relative">
										<input
											type={showKey[provider.id] ? "text" : "password"}
											value={editValue}
											onChange={(e) => setEditValue(e.target.value)}
											placeholder={`Enter ${provider.name} API key`}
											className="w-full px-4 py-2 pr-12 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-romance-500 focus:border-transparent"
										/>
										<button
											type="button"
											onClick={() =>
												setShowKey((prev) => ({
													...prev,
													[provider.id]: !prev[provider.id],
												}))
											}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300"
										>
											{showKey[provider.id] ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>

									<div className="flex gap-2 justify-end">
										<button
											type="button"
											onClick={handleCancel}
											disabled={isLoading}
											className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-600 disabled:opacity-50"
										>
											<X className="w-4 h-4" />
											Cancel
										</button>

										<button
											type="button"
											onClick={() => handleSave(provider.id)}
											disabled={!editValue.trim() || isLoading}
											className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-romance-600 rounded-lg hover:bg-romance-700 disabled:opacity-50"
										>
											{isLoading ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													Testing...
												</>
											) : (
												<>
													<Save className="w-4 h-4" />
													Save & Test
												</>
											)}
										</button>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
