import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { type AIConfig, getAIConfig } from "./config";

/**
 * Initialize AI provider based on configuration
 */
async function getAIModel(modelOverride?: string, configOverride?: AIConfig) {
	const config = configOverride || (await getAIConfig());
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

	const result = streamText({
		model: await getAIModel(options?.model, config),
		system: systemPrompt,
		prompt: userPrompt,
		temperature: options?.temperature ?? config.temperature,
		maxTokens: options?.maxTokens ?? config.maxTokens,
	});

	return result.textStream;
}
