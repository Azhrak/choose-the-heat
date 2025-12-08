import { createFileRoute } from "@tanstack/react-router";
import { Beaker } from "lucide-react";
import { useState } from "react";
import { AdminLayout, NoPermissions } from "~/components/admin";
import { AudioGenerationSection } from "~/components/admin/AudioGenerationSection";
import { CurrentSettingsDisplay } from "~/components/admin/CurrentSettingsDisplay";
import { TextGenerationSection } from "~/components/admin/TextGenerationSection";
import { Heading } from "~/components/Heading";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { Stack } from "~/components/ui/Stack";
import { Text } from "~/components/ui/Text";
import { useAppSettingsQuery } from "~/hooks/useAppSettingsQuery";
import { useCurrentUserQuery } from "~/hooks/useCurrentUserQuery";
import { useTestAudioGenerationMutation } from "~/hooks/useTestAudioGenerationMutation";
import { useTestTextGenerationMutation } from "~/hooks/useTestTextGenerationMutation";
import type { AIProvider } from "~/lib/ai/client";
import { TTS_VOICES } from "~/lib/constants/tts-voices";
import type { TTSProvider } from "~/lib/tts/config";

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

	// Use centralized voice options from constants
	const availableVoices = TTS_VOICES;

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

				<CurrentSettingsDisplay
					aiSettings={{
						provider: currentAIProvider,
						model: currentAIModel,
						temperature: currentTemperature,
						maxTokens: currentMaxTokens,
						timeout: currentTimeout,
					}}
					ttsSettings={{
						provider: currentTTSProvider,
						model: currentTTSModel,
					}}
				/>

				<TextGenerationSection
					selectedProvider={selectedAIProvider}
					selectedModel={selectedAIModel}
					availableModels={availableAIModels}
					textPrompt={textPrompt}
					generatedText={generatedText}
					isGenerating={textGenerationMutation.isPending}
					error={textGenerationMutation.error}
					onProviderChange={(provider) => {
						setSelectedAIProvider(provider);
						setSelectedAIModel("");
					}}
					onModelChange={setSelectedAIModel}
					onPromptChange={setTextPrompt}
					onGenerate={handleGenerateText}
					onGenerateRandom={handleGenerateRandomRomance}
				/>

				<AudioGenerationSection
					selectedProvider={selectedTTSProvider}
					selectedModel={selectedTTSModel}
					selectedVoice={selectedVoice}
					availableModels={availableTTSModels}
					availableVoices={availableVoices}
					ttsText={ttsText}
					audioUrl={audioUrl}
					isGenerating={ttsGenerationMutation.isPending}
					error={ttsGenerationMutation.error}
					onProviderChange={(provider) => {
						setSelectedTTSProvider(provider);
						setSelectedTTSModel("");
						setSelectedVoice("");
					}}
					onModelChange={setSelectedTTSModel}
					onVoiceChange={setSelectedVoice}
					onTextChange={setTtsText}
					onGenerate={handleGenerateAudio}
				/>
			</Stack>
		</AdminLayout>
	);
}
