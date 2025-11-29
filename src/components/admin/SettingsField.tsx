import type { AppSettings } from "~/lib/db/types";
import { AvailableModelsEditor } from "./AvailableModelsEditor";

interface SettingsFieldProps {
	setting: AppSettings;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	allSettings?: AppSettings[];
	getSettingValue?: (setting: AppSettings) => string;
}

export function SettingsField({
	setting,
	value,
	onChange,
	error,
	allSettings,
	getSettingValue,
}: SettingsFieldProps) {
	const renderInput = () => {
		switch (setting.value_type) {
			case "boolean":
				return (
					<label className="flex items-center gap-3 cursor-pointer">
						<div className="relative">
							<input
								type="checkbox"
								checked={value === "true"}
								onChange={(e) => onChange(e.target.checked ? "true" : "false")}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-slate-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-romance-600 transition-colors" />
							<div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
						</div>
						<span className="text-sm text-slate-600 dark:text-gray-400">
							{value === "true" ? "Enabled" : "Disabled"}
						</span>
					</label>
				);

			case "number": {
				// Check if there are min/max validation rules
				const rules = setting.validation_rules as {
					min?: number;
					max?: number;
				} | null;

				return (
					<div className="space-y-2">
						<input
							type="number"
							value={value}
							onChange={(e) => onChange(e.target.value)}
							min={rules?.min}
							max={rules?.max}
							step={setting.key.includes("temperature") ? "0.1" : "1"}
							className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
						/>
						{rules && (
							<p className="text-xs text-slate-500 dark:text-gray-500">
								Range: {rules.min ?? "no min"} - {rules.max ?? "no max"}
							</p>
						)}
					</div>
				);
			}

			case "json":
				// Use custom editor for available_models field
				if (setting.key === "ai.available_models") {
					return (
						<AvailableModelsEditor
							value={value}
							onChange={onChange}
							error={error}
						/>
					);
				}

				// Use custom editor for tts.available_models field
				if (setting.key === "tts.available_models") {
					return (
						<AvailableModelsEditor
							value={value}
							onChange={onChange}
							error={error}
						/>
					);
				}

				return (
					<textarea
						value={value}
						onChange={(e) => onChange(e.target.value)}
						rows={10}
						className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-romance-500"
						placeholder='{"key": "value"}'
					/>
				);

			default: {
				// Special handling for ai.model - make it a dropdown based on selected provider
				if (setting.key === "ai.model" && allSettings && getSettingValue) {
					const providerSetting = allSettings.find(
						(s) => s.key === "ai.provider",
					);
					const availableModelsSetting = allSettings.find(
						(s) => s.key === "ai.available_models",
					);

					if (providerSetting && availableModelsSetting) {
						const currentProvider = getSettingValue(providerSetting);
						try {
							const availableModels = JSON.parse(
								getSettingValue(availableModelsSetting),
							) as Record<string, string[]>;
							const models = availableModels[currentProvider] || [];

							if (models.length > 0) {
								return (
									<select
										value={value}
										onChange={(e) => onChange(e.target.value)}
										className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
									>
										{models.sort().map((model) => (
											<option key={model} value={model}>
												{model}
											</option>
										))}
									</select>
								);
							}
						} catch (error) {
							console.error("Failed to parse available models:", error);
						}
					}
				}

				// Special handling for tts.model - make it a dropdown based on selected provider
				if (setting.key === "tts.model" && allSettings && getSettingValue) {
					const providerSetting = allSettings.find(
						(s) => s.key === "tts.provider",
					);
					const availableModelsSetting = allSettings.find(
						(s) => s.key === "tts.available_models",
					);

					if (providerSetting && availableModelsSetting) {
						const currentProvider = getSettingValue(providerSetting);
						try {
							const availableModels = JSON.parse(
								getSettingValue(availableModelsSetting),
							) as Record<string, string[]>;
							const models = availableModels[currentProvider] || [];

							if (models.length > 0) {
								return (
									<select
										value={value}
										onChange={(e) => onChange(e.target.value)}
										className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
									>
										{models.sort().map((model) => (
											<option key={model} value={model}>
												{model}
											</option>
										))}
									</select>
								);
							}
						} catch (error) {
							console.error("Failed to parse available models:", error);
						}
					}
				}

				// Special handling for tts.provider - make it a dropdown based on available providers
				if (setting.key === "tts.provider" && allSettings && getSettingValue) {
					const availableModelsSetting = allSettings.find(
						(s) => s.key === "tts.available_models",
					);

					if (availableModelsSetting) {
						try {
							const availableModels = JSON.parse(
								getSettingValue(availableModelsSetting),
							) as Record<string, string[]>;
							const providers = Object.keys(availableModels).sort();

							if (providers.length > 0) {
								return (
									<select
										value={value}
										onChange={(e) => onChange(e.target.value)}
										className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
									>
										{providers.map((provider) => (
											<option key={provider} value={provider}>
												{provider}
											</option>
										))}
									</select>
								);
							}
						} catch (error) {
							console.error("Failed to parse available models:", error);
						}
					}
				}

				// Check if this is a multi-line text field based on key patterns
				const isMultiline =
					setting.key.includes("rules") ||
					setting.key.includes("description") ||
					value.includes("\n");

				// Check if there's an enum validation
				const rules = setting.validation_rules as { enum?: string[] } | null;

				if (rules?.enum) {
					return (
						<select
							value={value}
							onChange={(e) => onChange(e.target.value)}
							className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
						>
							{rules.enum.map((option) => (
								<option key={option} value={option}>
									{option || "(empty)"}
								</option>
							))}
						</select>
					);
				}

				if (isMultiline) {
					return (
						<textarea
							value={value}
							onChange={(e) => onChange(e.target.value)}
							rows={value.split("\n").length + 2}
							className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
						/>
					);
				}

				return (
					<input
						type={setting.is_sensitive ? "password" : "text"}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
					/>
				);
			}
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="block text-sm font-medium text-slate-900 dark:text-gray-100">
						{setting.key.split(".").pop()?.replace(/_/g, " ")}
						{setting.is_sensitive && (
							<span className="ml-2 text-xs text-slate-500 dark:text-gray-500">
								(sensitive)
							</span>
						)}
					</div>
					{setting.description && (
						<p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
							{setting.description}
						</p>
					)}
				</div>
				{setting.default_value && (
					<button
						type="button"
						onClick={() => onChange(setting.default_value || "")}
						className="text-xs text-romance-600 dark:text-romance-400 hover:underline"
					>
						Reset to default
					</button>
				)}
			</div>

			{renderInput()}

			{error && (
				<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
			)}

			{setting.default_value && value !== setting.default_value && (
				<p className="text-xs text-slate-500 dark:text-gray-500">
					Default: {setting.default_value}
				</p>
			)}
		</div>
	);
}
