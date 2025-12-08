import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import {
	type APIKeyProvider,
	getApiKey,
	markApiKeyAsProductionFailed,
} from "../db/queries/apiKeys";
import { type AIConfig, getAIConfig } from "./config";

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
 * Stream text completion using Vercel AI SDK
 * Returns a text stream that can be piped to the response
 *
 * Configure provider via database settings (falls back to env vars)
 */
export async function streamCompletion(
	systemPrompt: string,
	userPrompt: string,
	options?: {
		model?: string;
		temperature?: number;
		maxTokens?: number;
		config?: AIConfig;
	},
) {
	const config = options?.config || (await getAIConfig());

	console.log(
		`[AI Streaming] Provider: ${config.provider}, Model: ${options?.model || config.model}`,
	);

	try {
		// Workaround for Google Gemini: some models don't handle system prompts well
		// Combine system and user prompts for Google
		const isGoogle = config.provider === "google";
		const combinedPrompt = isGoogle
			? `${systemPrompt}\n\n${userPrompt}`
			: userPrompt;

		console.log(
			`[AI Streaming] Using ${isGoogle ? "combined" : "separate"} prompts for ${config.provider}`,
		);

		const result = await streamText({
			model: await getAIModel(options?.model, config),
			system: isGoogle ? undefined : systemPrompt,
			prompt: combinedPrompt,
			temperature: options?.temperature ?? config.temperature,
			maxTokens: options?.maxTokens ?? config.maxTokens,
		});

		console.log(
			`[AI Streaming] Stream initialized successfully for ${config.provider}`,
		);

		// Log finish reason and warnings when available (after stream completes)
		result.finishReason.then((reason) => {
			console.log(
				`[AI Streaming] Finish reason for ${config.provider}:`,
				reason,
			);

			// If the stream finished due to content filter or error, mark key as potentially failed
			if (reason === "content-filter" || reason === "error") {
				markApiKeyAsProductionFailed(
					config.provider as APIKeyProvider,
					`Stream ended with reason: ${reason}`,
					"AI streaming",
				).catch((err) => {
					console.error("Failed to mark API key as failed:", err);
				});
			}
		});

		result.warnings.then((warnings) => {
			if (warnings && warnings.length > 0) {
				console.warn(
					`[AI Streaming] Warnings from ${config.provider}:`,
					warnings,
				);
			}
		});

		return result.textStream;
	} catch (error) {
		console.error(`[AI Streaming] Error with ${config.provider}:`, error);

		// Mark API key as failed when we get an error
		markApiKeyAsProductionFailed(
			config.provider as APIKeyProvider,
			error instanceof Error ? error : String(error),
			"AI streaming",
		).catch((err) => {
			console.error("Failed to mark API key as failed:", err);
		});

		throw error;
	}
}
