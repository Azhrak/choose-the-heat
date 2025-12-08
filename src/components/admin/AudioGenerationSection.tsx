import { Loader2, Volume2 } from "lucide-react";
import { ErrorMessage } from "~/components/ErrorMessage";
import { FormSelect } from "~/components/FormSelect";
import { Heading } from "~/components/Heading";
import { Stack } from "~/components/ui/Stack";
import type { TTSProvider } from "~/lib/tts/config";
import { cn } from "~/lib/utils";

interface AudioGenerationSectionProps {
	selectedProvider: TTSProvider;
	selectedModel: string;
	selectedVoice: string;
	availableModels: Record<TTSProvider, string[]>;
	availableVoices: Record<TTSProvider, Array<{ id: string; name: string }>>;
	ttsText: string;
	audioUrl: string;
	isGenerating: boolean;
	error: Error | null;
	onProviderChange: (provider: TTSProvider) => void;
	onModelChange: (model: string) => void;
	onVoiceChange: (voice: string) => void;
	onTextChange: (text: string) => void;
	onGenerate: () => void;
}

/**
 * TTS audio generation test section for admin test page
 * Handles text-to-speech generation with provider/model/voice selection
 */
export function AudioGenerationSection(props: AudioGenerationSectionProps) {
	const providerOptions = [
		{ value: "openai" as const, label: "OpenAI" },
		{ value: "google" as const, label: "Google" },
		{ value: "elevenlabs" as const, label: "ElevenLabs" },
		{ value: "azure" as const, label: "Azure" },
	];

	const modelOptions =
		props.availableModels[props.selectedProvider]?.map((model) => ({
			value: model,
			label: model,
		})) || [];

	const voiceOptions =
		props.availableVoices[props.selectedProvider]?.map((voice) => ({
			value: voice.id,
			label: voice.name,
		})) || [];

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
			<Heading level="h2" className="mb-6">
				Text-to-Speech Generation
			</Heading>

			<Stack gap="md">
				{/* Provider, Model & Voice Selection */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<FormSelect
						id="tts-provider"
						label="TTS Provider"
						value={props.selectedProvider}
						options={providerOptions}
						onChange={props.onProviderChange}
					/>

					<FormSelect
						id="tts-model"
						label="Model"
						value={props.selectedModel}
						options={modelOptions}
						onChange={props.onModelChange}
					/>

					<FormSelect
						id="tts-voice"
						label="Voice"
						value={props.selectedVoice}
						options={voiceOptions}
						onChange={props.onVoiceChange}
					/>
				</div>

				{/* Text Input */}
				<div>
					<label
						htmlFor="tts-text"
						className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2"
					>
						Text to Convert
					</label>
					<textarea
						id="tts-text"
						value={props.ttsText}
						onChange={(e) => props.onTextChange(e.target.value)}
						rows={4}
						placeholder="Enter text to convert to speech, or generate text above..."
						className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
					/>
				</div>

				{/* Generate Button */}
				<div>
					<button
						type="button"
						onClick={props.onGenerate}
						disabled={!props.ttsText.trim() || props.isGenerating}
						className={cn(
							"flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors",
							!props.ttsText.trim() || props.isGenerating
								? "bg-slate-300 dark:bg-gray-700 text-slate-500 dark:text-gray-500 cursor-not-allowed"
								: "bg-romance-600 hover:bg-romance-700 text-white",
						)}
					>
						{props.isGenerating ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								Generating Audio...
							</>
						) : (
							<>
								<Volume2 className="w-4 h-4" />
								Generate Audio
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
								: "Failed to generate audio"
						}
					/>
				)}

				{/* Audio Player */}
				{props.audioUrl && (
					<div>
						<div className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
							Generated Audio
						</div>
						{/* biome-ignore lint/a11y/useMediaCaption: Admin test page for audio generation testing */}
						<audio controls src={props.audioUrl} className="w-full">
							Your browser does not support the audio element.
						</audio>
					</div>
				)}
			</Stack>
		</div>
	);
}
