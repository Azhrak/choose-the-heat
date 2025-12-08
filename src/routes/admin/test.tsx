import { createFileRoute } from "@tanstack/react-router";
import { Beaker, Loader2, Volume2, Wand2 } from "lucide-react";
import { useState } from "react";
import { AdminLayout, NoPermissions } from "~/components/admin";
import { ErrorMessage } from "~/components/ErrorMessage";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import { useAppSettingsQuery } from "~/hooks/useAppSettingsQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useTestAudioGenerationMutation } from "~/hooks/useTestAudioGenerationMutation";
import { useTestTextGenerationMutation } from "~/hooks/useTestTextGenerationMutation";
import type { AIProvider } from "~/lib/ai/client";
import type { TTSProvider } from "~/lib/tts/config";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/admin/test")({
	component: TestPage,
});

function TestPage() {
	const { data: userData, isLoading: userLoading } = useCurrentUserQuery();
	const { data: aiSettingsData, isLoading: aiLoading } = useAppSettingsQuery({
		category: "ai",
	});
	const { data: ttsSettingsData, isLoading: ttsLoading } = useAppSettingsQuery({
		category: "tts",
	});

	// State for text generation
	const [selectedAIProvider, setSelectedAIProvider] =
		useState<AIProvider>("openai");
	const [selectedAIModel, setSelectedAIModel] = useState<string>("");
	const [textPrompt, setTextPrompt] = useState<string>("");
	const [generatedText, setGeneratedText] = useState<string>("");

	// State for TTS generation
	const [selectedTTSProvider, setSelectedTTSProvider] =
		useState<TTSProvider>("openai");
	const [selectedTTSModel, setSelectedTTSModel] = useState<string>("");
	const [selectedVoice, setSelectedVoice] = useState<string>("");
	const [ttsText, setTtsText] = useState<string>("");
	const [audioUrl, setAudioUrl] = useState<string>("");

	// Text generation mutation
	const textGenerationMutation = useTestTextGenerationMutation();

	// Auto-populate TTS text when text is generated
	const handleTextGenerationSuccess = (text: string) => {
		setGeneratedText(text);
		if (!ttsText) {
			setTtsText(text);
		}
	};

	// TTS generation mutation
	const ttsGenerationMutation = useTestAudioGenerationMutation();

	// Set audio URL when audio is generated
	const handleAudioGenerationSuccess = (url: string) => {
		setAudioUrl(url);
	};

	if (userLoading || aiLoading || ttsLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	if (!userData) {
		return null;
	}

	// Only admins can access this page
	if (userData.role !== "admin") {
		return (
			<NoPermissions message="You don't have permission to access the test page. This area is restricted to administrators only." />
		);
	}

	// Parse settings
	const aiSettings = aiSettingsData?.settings || [];
	const ttsSettings = ttsSettingsData?.settings || [];

	const currentAIProvider = aiSettings.find((s) => s.key === "ai.provider")
		?.value as AIProvider | undefined;
	const currentAIModel = aiSettings.find((s) => s.key === "ai.model")?.value;
	const currentTemperature = aiSettings.find(
		(s) => s.key === "ai.temperature",
	)?.value;
	const currentMaxTokens = aiSettings.find(
		(s) => s.key === "ai.max_tokens",
	)?.value;
	const currentTimeout = aiSettings.find(
		(s) => s.key === "ai.timeout_seconds",
	)?.value;

	const currentTTSProvider = ttsSettings.find((s) => s.key === "tts.provider")
		?.value as TTSProvider | undefined;
	const currentTTSModel = ttsSettings.find((s) => s.key === "tts.model")?.value;

	// Parse available models
	let availableAIModels: Record<AIProvider, string[]> = {
		openai: [],
		google: [],
		anthropic: [],
		mistral: [],
		xai: [],
		openrouter: [],
	};
	try {
		const modelsJSON = aiSettings.find(
			(s) => s.key === "ai.available_models",
		)?.value;
		if (modelsJSON) {
			availableAIModels = JSON.parse(modelsJSON);
		}
	} catch (error) {
		console.error("Failed to parse AI models:", error);
	}

	let availableTTSModels: Record<TTSProvider, string[]> = {
		openai: [],
		google: [],
		elevenlabs: [],
		azure: [],
	};
	try {
		const modelsJSON = ttsSettings.find(
			(s) => s.key === "tts.available_models",
		)?.value;
		if (modelsJSON) {
			availableTTSModels = JSON.parse(modelsJSON);
		}
	} catch (error) {
		console.error("Failed to parse TTS models:", error);
	}

	// Voice options (hardcoded based on provider)
	const availableVoices: Record<TTSProvider, { id: string; name: string }[]> = {
		openai: [
			{ id: "alloy", name: "Alloy" },
			{ id: "echo", name: "Echo" },
			{ id: "fable", name: "Fable" },
			{ id: "onyx", name: "Onyx" },
			{ id: "nova", name: "Nova" },
			{ id: "shimmer", name: "Shimmer" },
		],
		google: [
			{ id: "Enceladus", name: "Enceladus (Male)" },
			{ id: "Puck", name: "Puck (Male)" },
			{ id: "Charon", name: "Charon (Male)" },
			{ id: "Kore", name: "Kore (Female)" },
			{ id: "Fenrir", name: "Fenrir (Male)" },
			{ id: "Aoede", name: "Aoede (Female)" },
		],
		elevenlabs: [
			{ id: "Rachel", name: "Rachel" },
			{ id: "Domi", name: "Domi" },
		],
		azure: [
			{ id: "en-US-JennyNeural", name: "Jenny (Female)" },
			{ id: "en-US-GuyNeural", name: "Guy (Male)" },
			{ id: "en-US-AriaNeural", name: "Aria (Female)" },
		],
	};

	const handleGenerateText = () => {
		if (!textPrompt.trim()) {
			return;
		}
		textGenerationMutation.mutate(
			{
				prompt: textPrompt,
				provider: selectedAIProvider,
				model: selectedAIModel || availableAIModels[selectedAIProvider][0],
			},
			{
				onSuccess: handleTextGenerationSuccess,
			},
		);
	};

	const handleGenerateRandomRomance = () => {
		const randomPrompt =
			"Write a short romantic scene (under 200 words) where two strangers meet at a coffee shop during a rainstorm. Include tension, chemistry, and a hint of their immediate connection.";
		setTextPrompt(randomPrompt);
		textGenerationMutation.mutate(
			{
				prompt: randomPrompt,
				provider: selectedAIProvider,
				model: selectedAIModel || availableAIModels[selectedAIProvider][0],
			},
			{
				onSuccess: handleTextGenerationSuccess,
			},
		);
	};

	const handleGenerateAudio = () => {
		if (!ttsText.trim()) {
			return;
		}
		ttsGenerationMutation.mutate(
			{
				text: ttsText,
				provider: selectedTTSProvider,
				model: selectedTTSModel || availableTTSModels[selectedTTSProvider][0],
				voiceId: selectedVoice || availableVoices[selectedTTSProvider][0].id,
			},
			{
				onSuccess: handleAudioGenerationSuccess,
			},
		);
	};

	return (
		<AdminLayout currentPath="/admin/test" userRole={userData.role}>
			<Stack gap="lg">
				<div className="flex items-center gap-3">
					<Beaker className="w-8 h-8 text-romance-600 dark:text-romance-400" />
					<Heading level="h1">Text & Audio Generation Test</Heading>
				</div>

				<Text className="text-slate-600 dark:text-gray-400">
					Test AI text generation and TTS audio generation with different
					providers and models. Changes here don't affect app settings.
				</Text>

				{/* Current Settings Display */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Current AI Settings */}
					<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
						<Heading level="h3" className="mb-4">
							Current AI Settings
						</Heading>
						<div className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="text-slate-600 dark:text-gray-400">
									Provider:
								</span>
								<span className="font-medium text-slate-900 dark:text-gray-100">
									{currentAIProvider || "Not set"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-600 dark:text-gray-400">
									Model:
								</span>
								<span className="font-medium text-slate-900 dark:text-gray-100">
									{currentAIModel || "Not set"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-600 dark:text-gray-400">
									Temperature:
								</span>
								<span className="font-medium text-slate-900 dark:text-gray-100">
									{currentTemperature || "0.7"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-600 dark:text-gray-400">
									Max Tokens:
								</span>
								<span className="font-medium text-slate-900 dark:text-gray-100">
									{currentMaxTokens || "2000"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-600 dark:text-gray-400">
									Timeout:
								</span>
								<span className="font-medium text-slate-900 dark:text-gray-100">
									{currentTimeout || "60"}s
								</span>
							</div>
						</div>
					</div>

					{/* Current TTS Settings */}
					<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
						<Heading level="h3" className="mb-4">
							Current TTS Settings
						</Heading>
						<div className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="text-slate-600 dark:text-gray-400">
									Provider:
								</span>
								<span className="font-medium text-slate-900 dark:text-gray-100">
									{currentTTSProvider || "Not set"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-slate-600 dark:text-gray-400">
									Model:
								</span>
								<span className="font-medium text-slate-900 dark:text-gray-100">
									{currentTTSModel || "Not set"}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Text Generation Section */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
					<Heading level="h2" className="mb-6">
						Text Generation
					</Heading>

					<Stack gap="md">
						{/* Provider & Model Selection */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="ai-provider"
									className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2"
								>
									AI Provider
								</label>
								<select
									id="ai-provider"
									value={selectedAIProvider}
									onChange={(e) => {
										setSelectedAIProvider(e.target.value as AIProvider);
										setSelectedAIModel("");
									}}
									className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
								>
									<option value="openai">OpenAI</option>
									<option value="google">Google</option>
									<option value="anthropic">Anthropic</option>
									<option value="mistral">Mistral</option>
									<option value="xai">xAI</option>
									<option value="openrouter">OpenRouter</option>
								</select>
							</div>

							<div>
								<label
									htmlFor="ai-model"
									className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2"
								>
									Model
								</label>
								<select
									id="ai-model"
									value={selectedAIModel}
									onChange={(e) => setSelectedAIModel(e.target.value)}
									className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
								>
									{availableAIModels[selectedAIProvider]?.map((model) => (
										<option key={model} value={model}>
											{model}
										</option>
									))}
								</select>
							</div>
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
								value={textPrompt}
								onChange={(e) => setTextPrompt(e.target.value)}
								rows={4}
								placeholder="Enter your prompt here..."
								className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
							/>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3">
							<button
								type="button"
								onClick={handleGenerateText}
								disabled={
									!textPrompt.trim() || textGenerationMutation.isPending
								}
								className={cn(
									"flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors",
									!textPrompt.trim() || textGenerationMutation.isPending
										? "bg-slate-300 dark:bg-gray-700 text-slate-500 dark:text-gray-500 cursor-not-allowed"
										: "bg-romance-600 hover:bg-romance-700 text-white",
								)}
							>
								{textGenerationMutation.isPending ? (
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
								onClick={handleGenerateRandomRomance}
								disabled={textGenerationMutation.isPending}
								className={cn(
									"flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors",
									textGenerationMutation.isPending
										? "bg-slate-300 dark:bg-gray-700 text-slate-500 dark:text-gray-500 cursor-not-allowed"
										: "bg-purple-600 hover:bg-purple-700 text-white",
								)}
							>
								{textGenerationMutation.isPending ? (
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
						{textGenerationMutation.isError && (
							<ErrorMessage
								message={
									textGenerationMutation.error instanceof Error
										? textGenerationMutation.error.message
										: "Failed to generate text"
								}
							/>
						)}

						{/* Output Display */}
						{generatedText && (
							<div>
								<div className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
									Generated Text
								</div>
								<div className="p-4 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg">
									<p className="text-slate-900 dark:text-gray-100 whitespace-pre-wrap">
										{generatedText}
									</p>
								</div>
							</div>
						)}
					</Stack>
				</div>

				{/* TTS Generation Section */}
				<div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 p-6">
					<Heading level="h2" className="mb-6">
						Text-to-Speech Generation
					</Heading>

					<Stack gap="md">
						{/* Provider, Model & Voice Selection */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label
									htmlFor="tts-provider"
									className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2"
								>
									TTS Provider
								</label>
								<select
									id="tts-provider"
									value={selectedTTSProvider}
									onChange={(e) => {
										setSelectedTTSProvider(e.target.value as TTSProvider);
										setSelectedTTSModel("");
										setSelectedVoice("");
									}}
									className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
								>
									<option value="openai">OpenAI</option>
									<option value="google">Google</option>
									<option value="elevenlabs">ElevenLabs</option>
									<option value="azure">Azure</option>
								</select>
							</div>

							<div>
								<label
									htmlFor="tts-model"
									className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2"
								>
									Model
								</label>
								<select
									id="tts-model"
									value={selectedTTSModel}
									onChange={(e) => setSelectedTTSModel(e.target.value)}
									className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
								>
									{availableTTSModels[selectedTTSProvider]?.map((model) => (
										<option key={model} value={model}>
											{model}
										</option>
									))}
								</select>
							</div>

							<div>
								<label
									htmlFor="tts-voice"
									className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2"
								>
									Voice
								</label>
								<select
									id="tts-voice"
									value={selectedVoice}
									onChange={(e) => setSelectedVoice(e.target.value)}
									className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
								>
									{availableVoices[selectedTTSProvider]?.map((voice) => (
										<option key={voice.id} value={voice.id}>
											{voice.name}
										</option>
									))}
								</select>
							</div>
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
								value={ttsText}
								onChange={(e) => setTtsText(e.target.value)}
								rows={4}
								placeholder="Enter text to convert to speech, or generate text above..."
								className="w-full px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-romance-500"
							/>
						</div>

						{/* Generate Button */}
						<div>
							<button
								type="button"
								onClick={handleGenerateAudio}
								disabled={!ttsText.trim() || ttsGenerationMutation.isPending}
								className={cn(
									"flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors",
									!ttsText.trim() || ttsGenerationMutation.isPending
										? "bg-slate-300 dark:bg-gray-700 text-slate-500 dark:text-gray-500 cursor-not-allowed"
										: "bg-romance-600 hover:bg-romance-700 text-white",
								)}
							>
								{ttsGenerationMutation.isPending ? (
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
						{ttsGenerationMutation.isError && (
							<ErrorMessage
								message={
									ttsGenerationMutation.error instanceof Error
										? ttsGenerationMutation.error.message
										: "Failed to generate audio"
								}
							/>
						)}

						{/* Audio Player */}
						{audioUrl && (
							<div>
								<div className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
									Generated Audio
								</div>
								{/* biome-ignore lint/a11y/useMediaCaption: Admin test page for audio generation testing */}
								<audio controls src={audioUrl} className="w-full">
									Your browser does not support the audio element.
								</audio>
							</div>
						)}
					</Stack>
				</div>
			</Stack>
		</AdminLayout>
	);
}
