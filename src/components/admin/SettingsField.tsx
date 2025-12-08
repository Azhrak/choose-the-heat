import type { AppSettings } from "~/lib/db/types";
import { AvailableModelsEditor } from "./AvailableModelsEditor";

interface SettingsFieldProps {
	setting: AppSettings;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	allSettings?: AppSettings[];
	getSettingValue?: (setting: AppSettings) => string;
	onChangeMultiple?: (changes: Record<string, string>) => void;
}

export function SettingsField(props: SettingsFieldProps) {
	const renderInput = () => {
		switch (props.setting.value_type) {
			case "boolean":
				return (
					<label className="flex items-center gap-3 cursor-pointer">
						<div className="relative">
							<input
								type="checkbox"
								checked={props.value === "true"}
								onChange={(e) =>
									props.onChange(e.target.checked ? "true" : "false")
								}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-slate-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-romance-600 transition-colors" />
							<div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
						</div>
						<span className="text-sm text-slate-600 dark:text-gray-400">
							{props.value === "true" ? "Enabled" : "Disabled"}
						</span>
					</label>
				);

			case "number": {
				// Check if there are min/max validation rules
				const rules = props.setting.validation_rules as {
					min?: number;
					max?: number;
				} | null;

				return (
					<div className="space-y-2">
						<input
							type="number"
							value={props.value}
							onChange={(e) => props.onChange(e.target.value)}
							min={rules?.min}
							max={rules?.max}
							step={props.setting.key.includes("temperature") ? "0.1" : "1"}
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
				if (props.setting.key === "ai.available_models") {
					return (
						<AvailableModelsEditor
							value={props.value}
							onChange={props.onChange}
							error={props.error}
						/>
					);
				}

				// Use custom editor for tts.available_models field
				if (props.setting.key === "tts.available_models") {
					return (
						<AvailableModelsEditor
							value={props.value}
							onChange={props.onChange}
							error={props.error}
						/>
					);
				}

				return (
					<textarea
						value={props.value}
						onChange={(e) => props.onChange(e.target.value)}
						rows={10}
						className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-romance-500"
						placeholder='{"key": "value"}'
					/>
				);

			default: {
				// Special handling for ai.model - make it a dropdown based on selected provider
				if (
					props.setting.key === "ai.model" &&
					props.allSettings &&
					props.getSettingValue
				) {
					const providerSetting = props.allSettings.find(
						(s) => s.key === "ai.provider",
					);
					const availableModelsSetting = props.allSettings.find(
						(s) => s.key === "ai.available_models",
					);

					if (providerSetting && availableModelsSetting) {
						const currentProvider = props.getSettingValue(providerSetting);
						try {
							const availableModels = JSON.parse(
								props.getSettingValue(availableModelsSetting),
							) as Record<string, string[]>;
							const models = availableModels[currentProvider] || [];

							if (models.length > 0) {
								return (
									<select
										value={props.value}
										onChange={(e) => props.onChange(e.target.value)}
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
				if (
					props.setting.key === "tts.model" &&
					props.allSettings &&
					props.getSettingValue
				) {
					const providerSetting = props.allSettings.find(
						(s) => s.key === "tts.provider",
					);
					const availableModelsSetting = props.allSettings.find(
						(s) => s.key === "tts.available_models",
					);

					if (providerSetting && availableModelsSetting) {
						const currentProvider = props.getSettingValue(providerSetting);
						try {
							const availableModels = JSON.parse(
								props.getSettingValue(availableModelsSetting),
							) as Record<string, string[]>;
							const models = availableModels[currentProvider] || [];

							if (models.length > 0) {
								return (
									<select
										value={props.value}
										onChange={(e) => props.onChange(e.target.value)}
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
				if (
					props.setting.key === "tts.provider" &&
					props.allSettings &&
					props.getSettingValue
				) {
					const availableModelsSetting = props.allSettings.find(
						(s) => s.key === "tts.available_models",
					);

					if (availableModelsSetting) {
						try {
							const availableModels = JSON.parse(
								props.getSettingValue(availableModelsSetting),
							) as Record<string, string[]>;
							const providers = Object.keys(availableModels).sort();

							if (providers.length > 0) {
								return (
									<select
										value={props.value}
										onChange={(e) => {
											const newProvider = e.target.value;
											if (props.onChangeMultiple) {
												const models = availableModels[newProvider] || [];
												const firstModel = models[0] || "";
												// Update both provider and model
												props.onChangeMultiple({
													"tts.provider": newProvider,
													"tts.model": firstModel,
												});
											} else {
												props.onChange(newProvider);
											}
										}}
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
					props.setting.key.includes("rules") ||
					props.setting.key.includes("description") ||
					props.value.includes("\n");

				// Check if there's an enum validation
				const rules = props.setting.validation_rules as {
					enum?: string[];
				} | null;

				if (rules?.enum) {
					// Special handling for ai.provider - auto-update model when provider changes
					if (
						props.setting.key === "ai.provider" &&
						props.allSettings &&
						props.getSettingValue &&
						props.onChangeMultiple
					) {
						const availableModelsSetting = props.allSettings.find(
							(s) => s.key === "ai.available_models",
						);

						if (availableModelsSetting) {
							return (
								<select
									value={props.value}
									onChange={(e) => {
										const newProvider = e.target.value;
										try {
											if (props.getSettingValue && props.onChangeMultiple) {
												const availableModels = JSON.parse(
													props.getSettingValue(availableModelsSetting),
												) as Record<string, string[]>;
												const models = availableModels[newProvider] || [];
												const firstModel = models[0] || "";

												// Update both provider and model
												props.onChangeMultiple({
													"ai.provider": newProvider,
													"ai.model": firstModel,
												});
											}
										} catch (error) {
											console.error("Failed to parse available models:", error);
											props.onChange(newProvider);
										}
									}}
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
					}

					return (
						<select
							value={props.value}
							onChange={(e) => props.onChange(e.target.value)}
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
							value={props.value}
							onChange={(e) => props.onChange(e.target.value)}
							rows={props.value.split("\n").length + 2}
							className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
						/>
					);
				}

				return (
					<input
						type={props.setting.is_sensitive ? "password" : "text"}
						value={props.value}
						onChange={(e) => props.onChange(e.target.value)}
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
						{props.setting.key.split(".").pop()?.replace(/_/g, " ")}
						{props.setting.is_sensitive && (
							<span className="ml-2 text-xs text-slate-500 dark:text-gray-500">
								(sensitive)
							</span>
						)}
					</div>
					{props.setting.description && (
						<p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
							{props.setting.description}
						</p>
					)}
				</div>
				{props.setting.default_value && (
					<button
						type="button"
						onClick={() => props.onChange(props.setting.default_value || "")}
						className="text-xs text-romance-600 dark:text-romance-400 hover:underline"
					>
						Reset to default
					</button>
				)}
			</div>

			{renderInput()}

			{props.error && (
				<p className="text-sm text-red-600 dark:text-red-400">{props.error}</p>
			)}

			{props.setting.default_value &&
				props.value !== props.setting.default_value && (
					<p className="text-xs text-slate-500 dark:text-gray-500">
						Default: {props.setting.default_value}
					</p>
				)}
		</div>
	);
}
