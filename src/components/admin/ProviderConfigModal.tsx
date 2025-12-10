import { useState } from "react";
import { Save, Eye, EyeOff } from "lucide-react";
import { Modal } from "~/components/ui/Modal";
import { useToast } from "./ToastContext";
import {
	useUpdateAPIKeyMutation,
	useTestAPIKeyMutation,
} from "~/hooks/useAPIKeysQuery";
import { useUpdateSettingsMutation } from "~/hooks/useAppSettingsQuery";
import type { ProviderStatusInfo } from "~/lib/ai/providerStatus";

interface ProviderConfigModalProps {
	providerId: string;
	category: "text" | "tts";
	providerStatus: ProviderStatusInfo | undefined;
	onClose: () => void;
}

export function ProviderConfigModal({
	providerId,
	category,
	providerStatus,
	onClose,
}: ProviderConfigModalProps) {
	const { showToast } = useToast();
	const [apiKey, setApiKey] = useState("");
	const [showKey, setShowKey] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const updateApiKeyMutation = useUpdateAPIKeyMutation();
	const testApiKeyMutation = useTestAPIKeyMutation();
	const updateSettingsMutation = useUpdateSettingsMutation();

	const handleSave = async () => {
		if (!apiKey.trim()) {
			showToast({
				message: "Please enter an API key",
				type: "error",
			});
			return;
		}

		setIsSaving(true);
		try {
			// Save and test the API key
			await updateApiKeyMutation.mutateAsync({
				provider: providerId,
				apiKey: apiKey.trim(),
			});

			showToast({
				message: `${providerStatus?.metadata.name} API key saved and validated successfully`,
				type: "success",
			});

			onClose();
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to save API key",
				type: "error",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleTest = async () => {
		if (!providerStatus?.hasApiKey) {
			showToast({
				message: "No API key configured for this provider",
				type: "error",
			});
			return;
		}

		try {
			const result = await testApiKeyMutation.mutateAsync(providerId);
			if (result.valid) {
				showToast({
					message: "API key is valid",
					type: "success",
				});
			} else {
				showToast({
					message: result.error || "API key is invalid",
					type: "error",
				});
			}
		} catch (error: any) {
			showToast({
				message: error?.message || "Failed to test API key",
				type: "error",
			});
		}
	};

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title={`Configure ${providerStatus?.metadata.name || providerId}`}
			size="lg"
		>
			<div className="space-y-6">
				{/* Provider Info */}
				<div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
					<p className="text-sm text-slate-600 dark:text-gray-300">
						{providerStatus?.metadata.description}
					</p>
				</div>

				{/* API Key Section */}
				<div className="space-y-3">
					<label
						htmlFor="api-key"
						className="block text-sm font-medium text-slate-700 dark:text-gray-200"
					>
						API Key
					</label>
					<div className="relative">
						<input
							id="api-key"
							type={showKey ? "text" : "password"}
							value={apiKey}
							onChange={(e) => setApiKey(e.target.value)}
							placeholder={`Enter your ${providerStatus?.metadata.name} API key...`}
							className="w-full px-4 py-2 pr-10 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-gray-100 focus:ring-2 focus:ring-romance-500 dark:focus:ring-romance-400 focus:border-transparent"
						/>
						<button
							type="button"
							onClick={() => setShowKey(!showKey)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
						>
							{showKey ? (
								<EyeOff className="w-5 h-5" />
							) : (
								<Eye className="w-5 h-5" />
							)}
						</button>
					</div>
					<p className="text-xs text-slate-500 dark:text-gray-400">
						Your API key will be encrypted before storage
					</p>
				</div>

				{/* Current Status */}
				{providerStatus && (
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-slate-600 dark:text-gray-400">
								Current Status:
							</span>
							<span className="font-medium text-slate-900 dark:text-gray-100">
								{providerStatus.apiKeyStatus || "Not configured"}
							</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-slate-600 dark:text-gray-400">
								Models Configured:
							</span>
							<span className="font-medium text-slate-900 dark:text-gray-100">
								{providerStatus.availableModels.length}
							</span>
						</div>
						<div className="flex items-center justify-between text-sm">
							<span className="text-slate-600 dark:text-gray-400">
								Default Model:
							</span>
							<span className="font-mono text-sm text-slate-900 dark:text-gray-100">
								{providerStatus.defaultModel || "Not set"}
							</span>
						</div>
					</div>
				)}

				{/* Actions */}
				<div className="flex justify-between gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
					<div className="flex gap-2">
						{providerStatus?.hasApiKey && (
							<button
								type="button"
								onClick={handleTest}
								disabled={testApiKeyMutation.isPending}
								className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{testApiKeyMutation.isPending ? "Testing..." : "Test Existing Key"}
							</button>
						)}
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={handleSave}
							disabled={isSaving || !apiKey.trim()}
							className="px-4 py-2 bg-romance-600 text-white rounded-lg hover:bg-romance-700 dark:bg-romance-700 dark:hover:bg-romance-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<Save className="w-4 h-4" />
							{isSaving ? "Saving..." : "Save & Validate"}
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
