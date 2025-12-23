import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface AvailableModelsEditorProps {
	value: string;
	onChange: (value: string) => void;
	error?: string;
}

type ModelsData = Record<string, string[]>;

/**
 * AvailableModelsEditor - Editor for provider-model JSON configuration
 * Follows props object pattern (no destructuring)
 *
 * @param props.value - JSON string of available models by provider
 * @param props.onChange - Callback when value changes
 * @param props.error - Error message (optional)
 */
export function AvailableModelsEditor(props: AvailableModelsEditorProps) {
	const [newProvider, setNewProvider] = useState("");
	const [newModels, setNewModels] = useState<Record<string, string>>({});

	// Parse JSON value
	const parseValue = (): ModelsData => {
		try {
			return JSON.parse(props.value);
		} catch {
			return {};
		}
	};

	const data = parseValue();
	const providers = Object.keys(data).sort();

	const handleAddProvider = () => {
		if (!newProvider.trim() || data[newProvider]) return;

		const updated = { ...data, [newProvider.trim()]: [] };
		props.onChange(JSON.stringify(updated));
		setNewProvider("");
	};

	const handleRemoveProvider = (provider: string) => {
		const updated = { ...data };
		delete updated[provider];
		props.onChange(JSON.stringify(updated));
	};

	const handleAddModel = (provider: string) => {
		const modelName = newModels[provider]?.trim();
		if (!modelName || data[provider]?.includes(modelName)) return;

		const updated = {
			...data,
			[provider]: [...(data[provider] || []), modelName],
		};
		props.onChange(JSON.stringify(updated));
		setNewModels({ ...newModels, [provider]: "" });
	};

	const handleRemoveModel = (provider: string, modelIndex: number) => {
		const updated = {
			...data,
			[provider]: data[provider].filter((_, i) => i !== modelIndex),
		};
		props.onChange(JSON.stringify(updated));
	};

	const handleModelInputKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		provider: string,
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddModel(provider);
		}
	};

	const handleProviderInputKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddProvider();
		}
	};

	return (
		<div className="space-y-4">
			{/* Providers list */}
			<div className="space-y-4">
				{providers.map((provider) => (
					<div
						key={provider}
						className="border border-slate-200 dark:border-gray-700 rounded-lg p-4 bg-slate-50 dark:bg-gray-900"
					>
						{/* Provider header */}
						<div className="flex items-center justify-between mb-3">
							<h3 className="font-semibold text-slate-900 dark:text-gray-100 capitalize">
								{provider}
							</h3>
							<button
								type="button"
								onClick={() => handleRemoveProvider(provider)}
								className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1"
								title="Remove provider"
							>
								<Trash2 className="w-4 h-4" />
							</button>
						</div>

						{/* Models list */}
						<div className="space-y-2">
							{[...(data[provider] || [])].sort().map((model) => (
								<div
									key={model}
									className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded border border-slate-200 dark:border-gray-700"
								>
									<span className="text-sm text-slate-900 dark:text-gray-100 font-mono">
										{model}
									</span>
									<button
										type="button"
										onClick={() =>
											handleRemoveModel(provider, data[provider].indexOf(model))
										}
										className="text-slate-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
										title="Remove model"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							))}

							{/* Add model input */}
							<div className="flex gap-2 mt-2">
								<input
									type="text"
									value={newModels[provider] || ""}
									onChange={(e) =>
										setNewModels({ ...newModels, [provider]: e.target.value })
									}
									onKeyDown={(e) => handleModelInputKeyDown(e, provider)}
									placeholder="Add model name..."
									className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
								/>
								<button
									type="button"
									onClick={() => handleAddModel(provider)}
									disabled={!newModels[provider]?.trim()}
									className="px-3 py-2 bg-romance-600 text-white rounded hover:bg-romance-700 disabled:opacity-50 disabled:cursor-not-allowed"
									title="Add model"
								>
									<Plus className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Add provider */}
			<div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg p-4">
				<div className="flex gap-2">
					<input
						type="text"
						value={newProvider}
						onChange={(e) => setNewProvider(e.target.value)}
						onKeyDown={handleProviderInputKeyDown}
						placeholder="Add new provider (e.g., openai, anthropic)..."
						className="flex-1 px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
					/>
					<button
						type="button"
						onClick={handleAddProvider}
						disabled={!newProvider.trim() || !!data[newProvider]}
						className="flex items-center gap-2 px-4 py-2 bg-romance-600 text-white rounded-lg hover:bg-romance-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Plus className="w-4 h-4" />
						Add Provider
					</button>
				</div>
			</div>

			{props.error && (
				<p className="text-sm text-red-600 dark:text-red-400">{props.error}</p>
			)}
		</div>
	);
}
