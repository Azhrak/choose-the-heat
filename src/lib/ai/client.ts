/**
 * Multi-Provider AI Client - AI Story Generation Feature
 *
 * Initializes and manages AI provider clients (OpenAI, Google Gemini, Anthropic Claude, Mistral, xAI, OpenRouter).
 * Handles API key retrieval from encrypted storage and provider-specific configuration.
 *
 * @see docs/features/ai-story-generation.md - Complete feature documentation
 * @update-trigger When adding/removing providers or changing initialization logic, update the feature doc
 */

import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getApiKey } from "../db/queries/apiKeys";
import { type AIConfig, getAIConfig } from "./config";

/**
 * Supported AI providers
 */
export type AIProvider =
	| "openai"
	| "google"
	| "anthropic"
	| "mistral"
	| "xai"
	| "openrouter";

/**
 * Initialize AI provider based on configuration
 */
async function getAIModel(modelOverride?: string, configOverride?: AIConfig) {
	const config = configOverride || (await getAIConfig());
	const modelName = modelOverride || config.model;

	switch (config.provider) {
		case "openai": {
			// Try database first, fall back to environment variable
			const apiKey = (await getApiKey("openai")) || process.env.OPENAI_API_KEY;

			if (!apiKey) {
				throw new Error(
					"OpenAI API key not configured. " +
						"Please set it in Admin Settings > API Keys",
				);
			}
			const openai = createOpenAI({
				apiKey,
			});
			return openai(modelName);
		}

		case "google": {
			// Try database first, fall back to environment variable
			const apiKey =
				(await getApiKey("google")) || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

			if (!apiKey) {
				throw new Error(
					"Google API key not configured. " +
						"Please set it in Admin Settings > API Keys",
				);
			}
			const google = createGoogleGenerativeAI({
				apiKey,
			});
			return google(modelName);
		}

		case "anthropic": {
			// Try database first, fall back to environment variable
			const apiKey =
				(await getApiKey("anthropic")) || process.env.ANTHROPIC_API_KEY;

			if (!apiKey) {
				throw new Error(
					"Anthropic API key not configured. " +
						"Please set it in Admin Settings > API Keys",
				);
			}
			const anthropic = createAnthropic({
				apiKey,
			});
			return anthropic(modelName);
		}

		case "mistral": {
			// Try database first, fall back to environment variable
			const apiKey =
				(await getApiKey("mistral")) || process.env.MISTRAL_API_KEY;

			if (!apiKey) {
				throw new Error(
					"Mistral API key not configured. " +
						"Please set it in Admin Settings > API Keys",
				);
			}
			const mistral = createMistral({
				apiKey,
			});
			return mistral(modelName);
		}

		case "xai": {
			// Try database first, fall back to environment variable
			const apiKey = (await getApiKey("xai")) || process.env.XAI_API_KEY;

			if (!apiKey) {
				throw new Error(
					"xAI API key not configured. " +
						"Please set it in Admin Settings > API Keys",
				);
			}
			// xAI uses OpenAI-compatible API
			const xai = createOpenAI({
				apiKey,
				baseURL: "https://api.x.ai/v1",
			});
			return xai(modelName);
		}

		case "openrouter": {
			// Try database first, fall back to environment variable
			const apiKey =
				(await getApiKey("openrouter")) || process.env.OPENROUTER_API_KEY;

			if (!apiKey) {
				throw new Error(
					"OpenRouter API key not configured. " +
						"Please set it in Admin Settings > API Keys",
				);
			}
			// OpenRouter uses OpenAI-compatible API
			const openrouter = createOpenAI({
				apiKey,
				baseURL: "https://openrouter.ai/api/v1",
			});
			return openrouter(modelName);
		}

		default:
			throw new Error(`Unsupported AI provider: ${config.provider}`);
	}
}

/**
 * Get the default model for the configured provider
 */
export async function getDefaultModel(): Promise<string> {
	const config = await getAIConfig();
	return config.model;
}

/**
 * Get the current AI provider
 */
export async function getCurrentProvider(): Promise<AIProvider> {
	const config = await getAIConfig();
	return config.provider;
}

/**
 * Generate text completion using Vercel AI SDK
 *
 * The AI SDK provides:
 * - Multi-provider support (OpenAI, Google, Anthropic, Mistral, xAI)
 * - Better streaming support
 * - Unified interface across providers
 * - Built-in error handling
 * - Token usage tracking
 *
 * Configure provider via database settings (falls back to env vars)
 */
export async function generateCompletion(
	systemPrompt: string,
	userPrompt: string,
	options?: {
		model?: string;
		temperature?: number;
		maxTokens?: number;
		config?: AIConfig;
	},
): Promise<string> {
	const config = options?.config || (await getAIConfig());

	const { text } = await generateText({
		model: await getAIModel(options?.model, config),
		system: systemPrompt,
		prompt: userPrompt,
		temperature: options?.temperature ?? config.temperature,
		maxTokens: options?.maxTokens ?? config.maxTokens,
	});

	if (!text) {
		throw new Error("No content generated from AI");
	}

	return text.trim();
}
