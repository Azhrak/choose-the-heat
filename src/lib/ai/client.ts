import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

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
 * AI provider configuration
 */
interface AIConfig {
	provider: AIProvider;
	model: string;
}

/**
 * Get AI provider and model from environment variables
 */
function getAIConfig(): AIConfig {
	const provider = (
		process.env.AI_PROVIDER || "openai"
	).toLowerCase() as AIProvider;

	// Default models for each provider
	const defaultModels: Record<AIProvider, string> = {
		openai: process.env.OPENAI_MODEL || "gpt-4o-mini",
		google: process.env.GOOGLE_MODEL || "gemini-2.5-flash-lite",
		anthropic: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
		mistral: process.env.MISTRAL_MODEL || "mistral-medium-2508",
		xai: process.env.XAI_MODEL || "grok-4-fast-reasoning",
		openrouter: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
	};

	return {
		provider,
		model: defaultModels[provider],
	};
}

/**
 * Initialize AI provider based on configuration
 */
function getAIModel(modelOverride?: string) {
	const config = getAIConfig();
	const modelName = modelOverride || config.model;

	switch (config.provider) {
		case "openai": {
			if (!process.env.OPENAI_API_KEY) {
				throw new Error("OPENAI_API_KEY environment variable is not set");
			}
			const openai = createOpenAI({
				apiKey: process.env.OPENAI_API_KEY,
			});
			return openai(modelName);
		}

		case "google": {
			if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
				throw new Error(
					"GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set",
				);
			}
			const google = createGoogleGenerativeAI({
				apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
			});
			return google(modelName);
		}

		case "anthropic": {
			if (!process.env.ANTHROPIC_API_KEY) {
				throw new Error("ANTHROPIC_API_KEY environment variable is not set");
			}
			const anthropic = createAnthropic({
				apiKey: process.env.ANTHROPIC_API_KEY,
			});
			return anthropic(modelName);
		}

		case "mistral": {
			if (!process.env.MISTRAL_API_KEY) {
				throw new Error("MISTRAL_API_KEY environment variable is not set");
			}
			const mistral = createMistral({
				apiKey: process.env.MISTRAL_API_KEY,
			});
			return mistral(modelName);
		}

		case "xai": {
			if (!process.env.XAI_API_KEY) {
				throw new Error("XAI_API_KEY environment variable is not set");
			}
			// xAI uses OpenAI-compatible API
			const xai = createOpenAI({
				apiKey: process.env.XAI_API_KEY,
				baseURL: "https://api.x.ai/v1",
			});
			return xai(modelName);
		}

		case "openrouter": {
			if (!process.env.OPENROUTER_API_KEY) {
				throw new Error("OPENROUTER_API_KEY environment variable is not set");
			}
			// OpenRouter uses OpenAI-compatible API
			const openrouter = createOpenAI({
				apiKey: process.env.OPENROUTER_API_KEY,
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
export function getDefaultModel(): string {
	return getAIConfig().model;
}

/**
 * Get the current AI provider
 */
export function getCurrentProvider(): AIProvider {
	return getAIConfig().provider;
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
 * Configure provider via AI_PROVIDER env var (default: openai)
 * Configure model via provider-specific env var (e.g., OPENAI_MODEL, XAI_MODEL)
 */
export async function generateCompletion(
	systemPrompt: string,
	userPrompt: string,
	options?: {
		model?: string;
		temperature?: number;
		maxTokens?: number;
	},
): Promise<string> {
	const { text } = await generateText({
		model: getAIModel(options?.model),
		system: systemPrompt,
		prompt: userPrompt,
		temperature: options?.temperature ?? 0.7,
		maxTokens: options?.maxTokens ?? 2000,
	});

	if (!text) {
		throw new Error("No content generated from AI");
	}

	return text.trim();
}
