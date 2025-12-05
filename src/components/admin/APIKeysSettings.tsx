import {
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
] as const;

export function APIKeysSettings({
	apiKeys,
	onUpdate,
	onTest,
	onDelete,
}: APIKeysSettingsProps) {
	const [editingProvider, setEditingProvider] = useState<string | null>(null);
	const [editValue, setEditValue] = useState("");
	const [showKey, setShowKey] = useState<Record<string, boolean>>({});
	const [loading, setLoading] = useState<string | null>(null);
	const [testResults, setTestResults] = useState<Record<string, string>>({});

	const getKeyData = (providerId: string) => {
		return apiKeys.find((k) => k.provider === providerId);
	};

	const handleEdit = (providerId: string) => {
		setEditingProvider(providerId);
		setEditValue("");
		setShowKey((prev) => ({ ...prev, [providerId]: true }));
	};

	const handleCancel = () => {
		setEditingProvider(null);
		setEditValue("");
		setTestResults({});
	};

	const handleSave = async (providerId: string) => {
		if (!editValue.trim()) return;

		setLoading(providerId);
		setTestResults({});

		try {
			await onUpdate(providerId, editValue);
			setEditingProvider(null);
			setEditValue("");
			setTestResults({
				[providerId]: "API key saved and validated successfully!",
			});
		} catch (error) {
			setTestResults({
				[providerId]:
					error instanceof Error ? error.message : "Failed to save API key",
			});
		} finally {
			setLoading(null);
		}
	};

	const handleTest = async (providerId: string) => {
		setLoading(providerId);
		setTestResults({});

		try {
			const result = await onTest(providerId);
			setTestResults({
				[providerId]: result.valid
					? "API key is valid and working!"
					: result.error || "API key validation failed",
			});
		} catch (error) {
			setTestResults({
				[providerId]:
					error instanceof Error ? error.message : "Failed to test API key",
			});
		} finally {
			setLoading(null);
		}
	};

	const handleDelete = async (providerId: string) => {
		if (
			!confirm(
				`Are you sure you want to delete the ${providerId} API key? This cannot be undone.`,
			)
		) {
			return;
		}

		setLoading(providerId);
		setTestResults({});

		try {
			await onDelete(providerId);
			setTestResults({ [providerId]: "API key deleted successfully" });
		} catch (error) {
			setTestResults({
				[providerId]:
					error instanceof Error ? error.message : "Failed to delete API key",
			});
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

	return (
		<div className="space-y-6">
			<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
				<p className="text-sm text-blue-800 dark:text-blue-300">
					API keys are encrypted and stored securely. Configure keys for the AI
					providers you want to use. Keys are tested automatically when saved.
				</p>
			</div>

			<div className="space-y-4">
				{PROVIDERS.map((provider) => {
					const keyData = getKeyData(provider.id);
					const isEditing = editingProvider === provider.id;
					const isLoading = loading === provider.id;
					const hasKey = keyData?.encryptedKey;

					return (
						<div
							key={provider.id}
							className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-6"
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
										<p className="text-sm text-red-600 dark:text-red-400 mt-1">
											{keyData.testError}
										</p>
									)}
									{testResults[provider.id] && (
										<p
											className={cn(
												"text-sm mt-1",
												testResults[provider.id].includes("success")
													? "text-green-600 dark:text-green-400"
													: "text-red-600 dark:text-red-400",
											)}
										>
											{testResults[provider.id]}
										</p>
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
