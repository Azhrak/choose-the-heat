import { useState } from "react";
import {
	getAllTextProviders,
	getAllTTSProviders,
	type ProviderMetadata,
} from "~/lib/ai/providers";

interface AvailableModelsEditorProps {
	value: string;
	onChange: (value: string) => void;
	onChangeMultiple?: (changes: Record<string, string>) => void;
	allSettings?: { key: string; value: string }[];
	category: "ai" | "tts";
	error?: string;
}

type ModelsData = Record<string, string[]>;

export function AvailableModelsEditor(props: AvailableModelsEditorProps) {
	// Get providers based on category
	const allProviders: ProviderMetadata[] =
		props.category === "ai" ? getAllTextProviders() : getAllTTSProviders();

	// Get default model for a provider from settings
	const getDefaultModel = (providerId: string): string | undefined => {
		if (!props.allSettings) return undefined;
		const settingKey =
			props.category === "ai"
				? `ai.text.default_model.${providerId}`
				: `ai.tts.default_model.${providerId}`;
		const setting = props.allSettings.find((s) => s.key === settingKey);
		return setting?.value;
	};

	// Parse JSON value
	const parseValue = (): ModelsData => {
		try {
			return JSON.parse(props.value);
		} catch {
			return {};
		}
	};

	const data = parseValue();

	const handleToggleModel = (providerId: string, model: string) => {
		const currentModels = data[providerId] || [];
		const isAvailable = currentModels.includes(model);

		const updated = {
			...data,
			[providerId]: isAvailable
				? currentModels.filter((m) => m !== model)
				: [...currentModels, model],
		};
		props.onChange(JSON.stringify(updated));
	};

	const handleSetDefaultModel = (providerId: string, model: string) => {
		if (!props.onChangeMultiple) return;

		const settingKey =
			props.category === "ai"
				? `ai.text.default_model.${providerId}`
				: `ai.tts.default_model.${providerId}`;

		const changes = { [settingKey]: model };
		props.onChangeMultiple(changes);
	};

	return (
		<div className="space-y-4">
			{allProviders.map((provider) => {
				const availableModels = data[provider.id] || [];
				const defaultModel = getDefaultModel(provider.id);

				return (
					<div
						key={provider.id}
						className="border border-slate-200 dark:border-gray-700 rounded-lg p-4 bg-slate-50 dark:bg-gray-900"
					>
						{/* Provider header */}
						<div className="mb-3">
							<h3 className="font-semibold text-slate-900 dark:text-gray-100">
								{provider.name}
							</h3>
							<p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
								{provider.description}
							</p>
						</div>

						{/* Models list */}
						<div className="space-y-1.5">
							{provider.supportedModels.map((model) => {
								const isAvailable = availableModels.includes(model);
								const isDefault = defaultModel === model;

								return (
									<div
										key={model}
										className="flex items-center gap-3 bg-white dark:bg-gray-800 px-3 py-2.5 rounded border border-slate-200 dark:border-gray-700"
									>
										{/* Checkbox for availability */}
										<label className="flex items-center gap-2 flex-1 cursor-pointer">
											<input
												type="checkbox"
												checked={isAvailable}
												onChange={() => handleToggleModel(provider.id, model)}
												className="w-4 h-4 text-romance-600 border-slate-300 dark:border-gray-600 rounded focus:ring-romance-500 focus:ring-2"
											/>
											<span className="text-sm text-slate-900 dark:text-gray-100 font-mono">
												{model}
											</span>
										</label>

										{/* Radio button for default */}
										<label
											className={`flex items-center gap-1.5 text-xs ${
												isAvailable
													? "text-slate-600 dark:text-gray-400 cursor-pointer"
													: "text-slate-400 dark:text-gray-600 cursor-not-allowed"
											}`}
											title={
												isAvailable ? "Set as default" : "Enable model first"
											}
										>
											<input
												type="radio"
												name={`default-${provider.id}`}
												checked={isDefault}
												disabled={!isAvailable}
												onChange={() =>
													handleSetDefaultModel(provider.id, model)
												}
												className="w-3.5 h-3.5 text-romance-600 border-slate-300 dark:border-gray-600 focus:ring-romance-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
											/>
											<span className="font-medium">Default</span>
										</label>
									</div>
								);
							})}
						</div>

						{/* Current default indicator */}
						{defaultModel && (
							<div className="mt-3 px-3 py-2 bg-romance-50 dark:bg-romance-900/20 border border-romance-200 dark:border-romance-800 rounded text-xs">
								<span className="text-romance-700 dark:text-romance-300 font-medium">
									Current default:
								</span>{" "}
								<span className="text-romance-900 dark:text-romance-100 font-mono">
									{defaultModel}
								</span>
							</div>
						)}
					</div>
				);
			})}

			{props.error && (
				<p className="text-sm text-red-600 dark:text-red-400">{props.error}</p>
			)}

			<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
				<p className="text-xs text-blue-800 dark:text-blue-300">
					<strong>Tip:</strong> Check models to make them available for
					selection, then use the "Default" radio button to set which model is
					used by default for each provider.
				</p>
			</div>
		</div>
	);
}
