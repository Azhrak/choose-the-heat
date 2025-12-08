import { Beaker, Loader2, Wand2 } from "lucide-react";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormSelect } from "~/components/FormSelect";
import { Heading } from "~/components/Heading";
import { Stack } from "~/components/ui/Stack";
import type { AIProvider } from "~/lib/ai/client";
import { cn } from "~/lib/utils";

interface TextGenerationSectionProps {
	selectedProvider: AIProvider;
	selectedModel: string;
	availableModels: Record<AIProvider, string[]>;
	textPrompt: string;
	generatedText: string;
	isGenerating: boolean;
	error: Error | null;
	onProviderChange: (provider: AIProvider) => void;
	onModelChange: (model: string) => void;
	onPromptChange: (prompt: string) => void;
	onGenerate: () => void;
	onGenerateRandom: () => void;
}

/**
 * Text generation test section for admin test page
 * Handles AI text generation with provider/model selection
 */
export function TextGenerationSection(props: TextGenerationSectionProps) {
	const providerOptions = [
		{ value: "openai" as const, label: "OpenAI" },
		{ value: "google" as const, label: "Google" },
		{ value: "anthropic" as const, label: "Anthropic" },
		{ value: "mistral" as const, label: "Mistral" },
		{ value: "xai" as const, label: "xAI" },
		{ value: "openrouter" as const, label: "OpenRouter" },
	];

	const modelOptions =
		props.availableModels[props.selectedProvider]?.map((model) => ({
			value: model,
			label: model,
		})) || [];

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
			<Heading level="h2" className="mb-6">
				Text Generation
			</Heading>

			<Stack gap="md">
				{/* Provider & Model Selection */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FormSelect
						id="ai-provider"
						label="AI Provider"
						value={props.selectedProvider}
						options={providerOptions}
						onChange={props.onProviderChange}
					/>

					<FormSelect
						id="ai-model"
						label="Model"
						value={props.selectedModel}
						options={modelOptions}
						onChange={props.onModelChange}
					/>
				</div>

				{/* Prompt Input */}
				<div>
					<label
						htmlFor="text-prompt"
						className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2"
					>
						Prompt
					</label>
					<textarea
						id="text-prompt"
						value={props.textPrompt}
						onChange={(e) => props.onPromptChange(e.target.value)}
						rows={4}
						placeholder="Enter your prompt here..."
						className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
					/>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3">
					<button
						type="button"
						onClick={props.onGenerate}
						disabled={!props.textPrompt.trim() || props.isGenerating}
						className={cn(
							"flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors",
							!props.textPrompt.trim() || props.isGenerating
								? "bg-slate-300 dark:bg-gray-700 text-slate-500 dark:text-gray-500 cursor-not-allowed"
								: "bg-romance-600 hover:bg-romance-700 text-white",
						)}
					>
						{props.isGenerating ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Generating...
							</>
						) : (
							<>
								<Wand2 className="w-4 h-4" />
								Generate Text
							</>
						)}
					</button>

					<button
						type="button"
						onClick={props.onGenerateRandom}
						disabled={props.isGenerating}
						className={cn(
							"flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors",
							props.isGenerating
								? "bg-slate-300 dark:bg-gray-700 text-slate-500 dark:text-gray-500 cursor-not-allowed"
								: "bg-purple-600 hover:bg-purple-700 text-white",
						)}
					>
						{props.isGenerating ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Generating...
							</>
						) : (
							<>
								<Beaker className="w-4 h-4" />
								Random Romance Sample
							</>
						)}
					</button>
				</div>

				{/* Error Display */}
				{props.error && (
					<ErrorMessage
						message={
							props.error instanceof Error
								? props.error.message
								: "Failed to generate text"
						}
					/>
				)}

				{/* Output Display */}
				{props.generatedText && (
					<div>
						<div className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
							Generated Text
						</div>
						<div className="p-4 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg">
							<p className="text-slate-900 dark:text-gray-100 whitespace-pre-wrap">
								{props.generatedText}
							</p>
						</div>
					</div>
				)}
			</Stack>
		</div>
	);
}
