/**
 * Model Discovery Service
 *
 * Fetches available models from provider APIs and syncs them to the database.
 * Handles provider-specific implementations for model listing.
 */

import type { ModelCategory } from "../db/queries/aiModels";
import {
	type CreateModelData,
	upsertDiscoveredModel,
} from "../db/queries/aiModels";
import { getApiKey } from "../db/queries/apiKeys";
import type { TTSProvider } from "../tts/config";
import type { AIProvider } from "./client";

export interface ModelInfo {
	model_id: string;
	display_name?: string;
	description?: string;
	context_window?: number;
	supports_streaming?: boolean;
	provider_metadata?: Record<string, unknown>;
}

export interface ModelDiscoveryResult {
	provider: string;
	category: ModelCategory;
	discovered: ModelInfo[];
	newModels: ModelInfo[];
	errors: string[];
}

/**
 * Discover models for OpenAI
 * Uses the openai.models.list() API
 */
async function discoverOpenAIModels(
	category: ModelCategory,
): Promise<ModelInfo[]> {
	const apiKey = await getApiKey("openai");
	if (!apiKey) {
		throw new Error("OpenAI API key not configured");
	}

	if (category === "tts") {
		// OpenAI TTS models are fixed
		return [
			{
				model_id: "tts-1",
				display_name: "TTS-1",
				supports_streaming: true,
			},
			{
				model_id: "tts-1-hd",
				display_name: "TTS-1 HD",
				supports_streaming: true,
			},
		];
	}

	// Text generation models - use OpenAI SDK
	try {
		const { OpenAI } = await import("openai");
		const openai = new OpenAI({ apiKey });

		const models = await openai.models.list();

		// Filter for GPT models only
		const gptModels = models.data
			.filter((m) => m.id.startsWith("gpt-") && !m.id.includes("instruct"))
			.map((m) => ({
				model_id: m.id,
				display_name: m.id
					.toUpperCase()
					.replace(/-/g, " ")
					.replace(/GPT /g, "GPT-"),
				supports_streaming: true,
				provider_metadata: {
					created: m.created,
					owned_by: m.owned_by,
				},
			}));

		return gptModels;
	} catch (error) {
		console.error("Failed to discover OpenAI models:", error);
		throw error;
	}
}

/**
 * Discover models for Google Gemini
 * Uses curated list (Google SDK model listing is complex)
 */
async function discoverGoogleModels(
	category: ModelCategory,
): Promise<ModelInfo[]> {
	if (category === "tts") {
		// Google TTS models
		return [
			{
				model_id: "gemini-2.5-flash-tts",
				display_name: "Gemini 2.5 Flash TTS",
				supports_streaming: true,
			},
			{
				model_id: "gemini-2.5-flash-lite-preview-tts",
				display_name: "Gemini 2.5 Flash Lite Preview TTS",
				supports_streaming: true,
			},
		];
	}

	// Text generation models - curated list
	return [
		{
			model_id: "gemini-2.5-flash-lite",
			display_name: "Gemini 2.5 Flash Lite",
			description: "Fastest, most cost-effective model",
			context_window: 1000000,
			supports_streaming: true,
		},
		{
			model_id: "gemini-1.5-pro",
			display_name: "Gemini 1.5 Pro",
			description: "Best quality for complex tasks",
			context_window: 2000000,
			supports_streaming: true,
		},
		{
			model_id: "gemini-1.5-flash",
			display_name: "Gemini 1.5 Flash",
			description: "Fast and versatile",
			context_window: 1000000,
			supports_streaming: true,
		},
	];
}

/**
 * Discover models for Anthropic Claude
 * Anthropic doesn't have a model listing API, so we use a curated list
 */
async function discoverAnthropicModels(): Promise<ModelInfo[]> {
	// Curated list of Anthropic models (no API for listing)
	return [
		{
			model_id: "claude-3-5-sonnet-20241022",
			display_name: "Claude 3.5 Sonnet",
			description: "Most intelligent model for complex tasks",
			context_window: 200000,
			supports_streaming: true,
		},
		{
			model_id: "claude-3-opus-20240229",
			display_name: "Claude 3 Opus",
			description: "Powerful model for highly complex tasks",
			context_window: 200000,
			supports_streaming: true,
		},
		{
			model_id: "claude-3-haiku-20240307",
			display_name: "Claude 3 Haiku",
			description: "Fast and compact model",
			context_window: 200000,
			supports_streaming: true,
		},
		{
			model_id: "claude-haiku-4-5",
			display_name: "Claude 4.5 Haiku",
			description: "Latest Haiku model",
			context_window: 200000,
			supports_streaming: true,
		},
	];
}

/**
 * Discover models for Mistral
 * Uses Mistral's models endpoint (OpenAI-compatible)
 */
async function discoverMistralModels(): Promise<ModelInfo[]> {
	const apiKey = await getApiKey("mistral");
	if (!apiKey) {
		throw new Error("Mistral API key not configured");
	}

	try {
		// Use OpenAI SDK with Mistral's base URL
		const { OpenAI } = await import("openai");
		const mistral = new OpenAI({
			apiKey,
			baseURL: "https://api.mistral.ai/v1",
		});

		const models = await mistral.models.list();

		const mistralModels = models.data.map((m) => ({
			model_id: m.id,
			display_name: m.id
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" "),
			supports_streaming: true,
			provider_metadata: {
				created: m.created,
				owned_by: m.owned_by,
			},
		}));

		return mistralModels;
	} catch (error) {
		console.error("Failed to discover Mistral models:", error);
		throw error;
	}
}

/**
 * Discover models for xAI Grok
 * Uses OpenAI-compatible endpoint
 */
async function discoverXAIModels(): Promise<ModelInfo[]> {
	const apiKey = await getApiKey("xai");
	if (!apiKey) {
		throw new Error("xAI API key not configured");
	}

	try {
		// Try to use OpenAI-compatible models endpoint
		const { OpenAI } = await import("openai");
		const xai = new OpenAI({
			apiKey,
			baseURL: "https://api.x.ai/v1",
		});

		const models = await xai.models.list();

		const xaiModels = models.data.map((m) => ({
			model_id: m.id,
			display_name: m.id
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" "),
			supports_streaming: true,
			provider_metadata: {
				created: m.created,
				owned_by: m.owned_by,
			},
		}));

		return xaiModels;
	} catch (_error) {
		// Fallback to curated list if API doesn't support listing
		console.warn("xAI models endpoint not available, using curated list");
		return [
			{
				model_id: "grok-4-fast-reasoning",
				display_name: "Grok 4 Fast Reasoning",
				supports_streaming: true,
			},
			{
				model_id: "grok-2",
				display_name: "Grok 2",
				supports_streaming: true,
			},
			{
				model_id: "grok-beta",
				display_name: "Grok Beta",
				supports_streaming: true,
			},
		];
	}
}

/**
 * Discover models for OpenRouter
 * Uses OpenRouter's models API
 */
async function discoverOpenRouterModels(): Promise<ModelInfo[]> {
	const apiKey = await getApiKey("openrouter");
	if (!apiKey) {
		throw new Error("OpenRouter API key not configured");
	}

	try {
		// OpenRouter has its own models API
		const response = await fetch("https://openrouter.ai/api/v1/models", {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!response.ok) {
			throw new Error(`OpenRouter API error: ${response.statusText}`);
		}

		const data = (await response.json()) as {
			data: {
				id: string;
				name?: string;
				description?: string;
				context_length?: number;
				pricing?: unknown;
				top_provider?: unknown;
			}[];
		};

		const openRouterModels = data.data.map((m) => ({
			model_id: m.id,
			display_name: m.name || m.id,
			description: m.description,
			context_window: m.context_length,
			supports_streaming: true,
			provider_metadata: {
				pricing: m.pricing,
				top_provider: m.top_provider,
			},
		}));

		return openRouterModels;
	} catch (error) {
		console.error("Failed to discover OpenRouter models:", error);
		throw error;
	}
}

/**
 * Discover models for ElevenLabs (TTS voices)
 */
async function discoverElevenLabsVoices(): Promise<ModelInfo[]> {
	const apiKey = await getApiKey("elevenlabs");
	if (!apiKey) {
		throw new Error("ElevenLabs API key not configured");
	}

	try {
		const response = await fetch("https://api.elevenlabs.io/v1/voices", {
			headers: {
				"xi-api-key": apiKey,
			},
		});

		if (!response.ok) {
			throw new Error(`ElevenLabs API error: ${response.statusText}`);
		}

		const data = (await response.json()) as {
			voices: {
				voice_id?: string;
				name: string;
				description?: string;
				category?: string;
				labels?: unknown;
			}[];
		};

		const voices = data.voices.map((v) => ({
			model_id: v.name, // Use name as model_id for consistency
			display_name: v.name,
			description: v.description,
			supports_streaming: false,
			provider_metadata: {
				voice_id: v.voice_id,
				category: v.category,
				labels: v.labels,
			},
		}));

		return voices;
	} catch (error) {
		console.error("Failed to discover ElevenLabs voices:", error);
		throw error;
	}
}

/**
 * Discover models for Azure TTS
 * Returns curated list (Azure has too many voices to list dynamically)
 */
async function discoverAzureVoices(): Promise<ModelInfo[]> {
	// Curated list of popular Azure voices
	return [
		{
			model_id: "en-US-JennyNeural",
			display_name: "Jenny Neural (en-US)",
			description: "Female voice, US English",
			supports_streaming: false,
		},
		{
			model_id: "en-US-GuyNeural",
			display_name: "Guy Neural (en-US)",
			description: "Male voice, US English",
			supports_streaming: false,
		},
		{
			model_id: "en-US-AriaNeural",
			display_name: "Aria Neural (en-US)",
			description: "Female voice, US English",
			supports_streaming: false,
		},
		{
			model_id: "en-US-DavisNeural",
			display_name: "Davis Neural (en-US)",
			description: "Male voice, US English",
			supports_streaming: false,
		},
		{
			model_id: "en-US-JaneNeural",
			display_name: "Jane Neural (en-US)",
			description: "Female voice, US English",
			supports_streaming: false,
		},
	];
}

/**
 * Discover models for a specific provider
 */
export async function discoverModelsForProvider(
	provider: string,
	category: ModelCategory,
): Promise<ModelDiscoveryResult> {
	const result: ModelDiscoveryResult = {
		provider,
		category,
		discovered: [],
		newModels: [],
		errors: [],
	};

	try {
		// Provider-specific discovery
		let models: ModelInfo[] = [];

		if (category === "text") {
			switch (provider as AIProvider) {
				case "openai":
					models = await discoverOpenAIModels("text");
					break;
				case "google":
					models = await discoverGoogleModels("text");
					break;
				case "anthropic":
					models = await discoverAnthropicModels();
					break;
				case "mistral":
					models = await discoverMistralModels();
					break;
				case "xai":
					models = await discoverXAIModels();
					break;
				case "openrouter":
					models = await discoverOpenRouterModels();
					break;
				default:
					throw new Error(`Unsupported text provider: ${provider}`);
			}
		} else {
			// TTS
			switch (provider as TTSProvider) {
				case "openai":
					models = await discoverOpenAIModels("tts");
					break;
				case "google":
					models = await discoverGoogleModels("tts");
					break;
				case "elevenlabs":
					models = await discoverElevenLabsVoices();
					break;
				case "azure":
					models = await discoverAzureVoices();
					break;
				default:
					throw new Error(`Unsupported TTS provider: ${provider}`);
			}
		}

		result.discovered = models;

		// Upsert discovered models to database
		for (const model of models) {
			try {
				const modelData: CreateModelData = {
					provider,
					category,
					model_id: model.model_id,
					display_name: model.display_name,
					description: model.description,
					context_window: model.context_window,
					supports_streaming: model.supports_streaming,
					provider_metadata: model.provider_metadata,
				};

				const dbModel = await upsertDiscoveredModel(modelData);

				// If it was newly created (status='pending'), add to newModels
				if (dbModel.status === "pending") {
					result.newModels.push(model);
				}
			} catch (error) {
				result.errors.push(
					`Failed to upsert model ${model.model_id}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	} catch (error) {
		result.errors.push(
			`Failed to discover models: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	return result;
}

/**
 * Discover models for all providers in a category
 */
export async function discoverAllModels(
	category: ModelCategory,
): Promise<ModelDiscoveryResult[]> {
	const providers =
		category === "text"
			? ([
					"openai",
					"google",
					"anthropic",
					"mistral",
					"xai",
					"openrouter",
				] as AIProvider[])
			: (["openai", "google", "elevenlabs", "azure"] as TTSProvider[]);

	const results: ModelDiscoveryResult[] = [];

	// Run discoveries in parallel
	const promises = providers.map((provider) =>
		discoverModelsForProvider(provider, category),
	);

	const settled = await Promise.allSettled(promises);

	for (const result of settled) {
		if (result.status === "fulfilled") {
			results.push(result.value);
		} else {
			console.error("Provider discovery failed:", result.reason);
		}
	}

	return results;
}
