import { createFileRoute } from "@tanstack/react-router";
import { Download, Save, Upload, X } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "~/components/admin/AdminLayout";
import { APIKeysSettings } from "~/components/admin/APIKeysSettings";
import { SettingsField } from "~/components/admin/SettingsField";
import {
	useAPIKeysQuery,
	useDeleteAPIKeyMutation,
	useTestAPIKeyMutation,
	useUpdateAPIKeyMutation,
} from "~/hooks/useAPIKeysQuery";
import {
	useAppSettingsQuery,
	useExportSettingsMutation,
	useImportSettingsMutation,
	useUpdateSettingsMutation,
} from "~/hooks/useAppSettingsQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import type { AppSettings } from "~/lib/db/types";
import { cn } from "~/lib/utils";

type TabId = "ai" | "prompts" | "tts" | "apikeys";

export const Route = createFileRoute("/admin/settings/")({
	component: SettingsPage,
});

function SettingsPage() {
	const { data: currentUser } = useCurrentUserQuery();
	const [activeTab, setActiveTab] = useState<TabId>("ai");
	const [editedSettings, setEditedSettings] = useState<Record<string, string>>(
		{},
	);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Query settings by category based on active tab (only for non-apikeys tabs)
	const { data: settingsData, isLoading } = useAppSettingsQuery({
		category: activeTab === "apikeys" ? "ai" : activeTab,
	});

	// API Keys queries
	const { data: apiKeysData, isLoading: isLoadingApiKeys } = useAPIKeysQuery();
	const updateApiKeyMutation = useUpdateAPIKeyMutation();
	const testApiKeyMutation = useTestAPIKeyMutation();
	const deleteApiKeyMutation = useDeleteAPIKeyMutation();

	const updateMutation = useUpdateSettingsMutation();
	const exportMutation = useExportSettingsMutation();
	const importMutation = useImportSettingsMutation();

	const settings = settingsData?.settings || [];

	const hasUnsavedChanges = Object.keys(editedSettings).length > 0;

	const handleFieldChange = (key: string, value: string) => {
		setEditedSettings((prev) => ({ ...prev, [key]: value }));
		// Clear error for this field
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[key];
			return newErrors;
		});
	};

	const handleSave = async () => {
		// Validate JSON fields
		const newErrors: Record<string, string> = {};
		const updates = Object.entries(editedSettings).map(([key, value]) => {
			const setting = settings.find((s) => s.key === key);
			if (setting?.value_type === "json") {
				try {
					JSON.parse(value);
				} catch {
					newErrors[key] = "Invalid JSON format";
				}
			}
			return { key, value };
		});

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		try {
			await updateMutation.mutateAsync(updates);
			setEditedSettings({});
			// Show success message (you might want to add a toast notification here)
			alert("Settings saved successfully!");
		} catch (error) {
			console.error("Failed to save settings:", error);
			alert(
				`Failed to save settings: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	};

	const handleCancel = () => {
		setEditedSettings({});
		setErrors({});
	};

	const handleExport = async () => {
		try {
			const data = await exportMutation.mutateAsync(activeTab);
			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: "application/json",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `settings-${activeTab}-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to export settings:", error);
			alert("Failed to export settings");
		}
	};

	const handleImport = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "application/json";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			try {
				const text = await file.text();
				const data = JSON.parse(text);

				if (!data.settings || typeof data.settings !== "object") {
					throw new Error("Invalid settings file format");
				}

				const result = await importMutation.mutateAsync(data);

				if (result.skipped.length > 0) {
					alert(
						`Import complete!\nUpdated: ${result.updated}\nSkipped: ${result.skipped.length} (${result.skipped.join(", ")})`,
					);
				} else {
					alert(`Import complete! Updated ${result.updated} settings.`);
				}
			} catch (error) {
				console.error("Failed to import settings:", error);
				alert(
					`Failed to import settings: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}
		};
		input.click();
	};

	const tabs: Array<{ id: TabId; label: string; description: string }> = [
		{
			id: "ai",
			label: "Text Generation",
			description:
				"Configure AI provider, model, and generation parameters for story creation",
		},
		{
			id: "prompts",
			label: "Prompt Configuration",
			description: "Customize spice level, pacing, and content safety rules",
		},
		{
			id: "tts",
			label: "Text-to-Speech",
			description: "Configure TTS provider, model, and voice settings",
		},
		{
			id: "apikeys",
			label: "API Keys",
			description:
				"Securely manage encrypted API keys for AI and TTS providers",
		},
	];

	const getValue = (setting: AppSettings): string => {
		return editedSettings[setting.key] ?? setting.value;
	};

	if (!currentUser) return null;

	return (
		<AdminLayout currentPath="/admin/settings" userRole={currentUser.role}>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100">
							Website Settings
						</h1>
						<p className="mt-2 text-slate-600 dark:text-gray-400">
							Configure AI generation and prompt customization
						</p>
					</div>

					{activeTab !== "apikeys" && (
						<div className="flex gap-2">
							<button
								type="button"
								onClick={handleExport}
								disabled={exportMutation.isPending}
								className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50"
							>
								<Download className="w-4 h-4" />
								Export
							</button>

							<button
								type="button"
								onClick={handleImport}
								disabled={importMutation.isPending}
								className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 disabled:opacity-50"
							>
								<Upload className="w-4 h-4" />
								Import
							</button>
						</div>
					)}
				</div>

				{/* Tabs */}
				<div className="border-b border-slate-200 dark:border-gray-700">
					<nav className="flex gap-8">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								type="button"
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"pb-4 px-1 border-b-2 font-medium text-sm transition-colors",
									activeTab === tab.id
										? "border-romance-600 text-romance-600 dark:text-romance-400"
										: "border-transparent text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-300 hover:border-slate-300 dark:hover:border-gray-600",
								)}
							>
								{tab.label}
							</button>
						))}
					</nav>
				</div>

				{/* Tab description - Hide for API Keys tab */}
				{activeTab !== "apikeys" && (
					<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<p className="text-sm text-blue-800 dark:text-blue-300">
							{tabs.find((t) => t.id === activeTab)?.description}
						</p>
					</div>
				)}

				{/* Settings Content */}
				{activeTab === "apikeys" ? (
					// API Keys Tab
					isLoadingApiKeys ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-slate-600 dark:text-gray-400">
								Loading API keys...
							</div>
						</div>
					) : (
						<APIKeysSettings
							apiKeys={apiKeysData?.keys || []}
							onUpdate={async (provider, apiKey) => {
								await updateApiKeyMutation.mutateAsync({ provider, apiKey });
							}}
							onTest={async (provider) => {
								return await testApiKeyMutation.mutateAsync(provider);
							}}
							onDelete={async (provider) => {
								await deleteApiKeyMutation.mutateAsync(provider);
							}}
						/>
					)
				) : // Other Settings Tabs
				isLoading ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-slate-600 dark:text-gray-400">
							Loading settings...
						</div>
					</div>
				) : (
					<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
						<div className="space-y-6">
							{settings.map((setting) => (
								<SettingsField
									key={setting.key}
									setting={setting}
									value={getValue(setting)}
									onChange={(value) => handleFieldChange(setting.key, value)}
									error={errors[setting.key]}
									allSettings={settings}
									getSettingValue={getValue}
								/>
							))}
						</div>
					</div>
				)}

				{/* Unsaved Changes Warning */}
				{hasUnsavedChanges && (
					<div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 shadow-lg p-4">
						<div className="max-w-7xl mx-auto flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
								<span className="text-sm font-medium text-slate-900 dark:text-gray-100">
									You have unsaved changes
								</span>
							</div>

							<div className="flex gap-3">
								<button
									type="button"
									onClick={handleCancel}
									className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-600"
								>
									<X className="w-4 h-4" />
									Cancel
								</button>

								<button
									type="button"
									onClick={handleSave}
									disabled={updateMutation.isPending}
									className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-romance-600 rounded-lg hover:bg-romance-700 disabled:opacity-50"
								>
									<Save className="w-4 h-4" />
									{updateMutation.isPending ? "Saving..." : "Save Changes"}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
