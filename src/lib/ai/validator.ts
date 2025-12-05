import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { APIKeyProvider } from "../db/queries/apiKeys";

/**
 * Test models for each provider (cheapest/fastest)
 * TODO: Update models as providers evolve
 */
const TEST_MODELS: Record<APIKeyProvider, string> = {
	openai: "gpt-4o-mini",
	google: "gemini-2.5-flash-lite",
	anthropic: "claude-haiku-4-5",
	mistral: "mistral-small-latest",
	xai: "grok-4-fast-non-reasoning",
	openrouter: "arcee-ai/trinity-mini:free",
};

/**
 * Validate an API key by making a minimal API call
 * @param provider AI provider name
 * @param apiKey API key to validate
 * @returns Object with valid flag and optional error message
 */
export async function validateApiKey(
	provider: APIKeyProvider,
	apiKey: string,
): Promise<{ valid: boolean; error?: string }> {
	try {
		const model = TEST_MODELS[provider];

		switch (provider) {
			case "openai": {
				const openai = createOpenAI({ apiKey });
				await generateText({
					model: openai(model),
					prompt: "Say OK",
					maxTokens: 10,
				});
				return { valid: true };
			}

			case "google": {
				const google = createGoogleGenerativeAI({ apiKey });
				await generateText({
					model: google(model),
					prompt: "Say OK",
					maxTokens: 10,
				});
				return { valid: true };
			}

			case "anthropic": {
				const anthropic = createAnthropic({ apiKey });
				await generateText({
					model: anthropic(model),
					prompt: "Say OK",
					maxTokens: 10,
				});
				return { valid: true };
			}

			case "mistral": {
				const mistral = createMistral({ apiKey });
				await generateText({
					model: mistral(model),
					prompt: "Say OK",
					maxTokens: 10,
				});
				return { valid: true };
			}

			case "xai": {
				const xai = createOpenAI({
					apiKey,
					baseURL: "https://api.x.ai/v1",
				});
				await generateText({
					model: xai(model),
					prompt: "Say OK",
					maxTokens: 10,
				});
				return { valid: true };
			}

			case "openrouter": {
				const openrouter = createOpenAI({
					apiKey,
					baseURL: "https://openrouter.ai/api/v1",
				});
				await generateText({
					model: openrouter(model),
					prompt: "Say OK",
					maxTokens: 10,
				});
				return { valid: true };
			}

			default:
				return {
					valid: false,
					error: `Unsupported provider: ${provider}`,
				};
		}
	} catch (error: unknown) {
		// Handle common error types
		const typedError = error as {
			status?: number;
			statusCode?: number;
			message?: string;
		};

		if (typedError.status === 401 || typedError.statusCode === 401) {
			return {
				valid: false,
				error: "Invalid API key - authentication failed",
			};
		}

		if (typedError.status === 403 || typedError.statusCode === 403) {
			return {
				valid: false,
				error: "API key does not have required permissions",
			};
		}

		// Rate limit errors mean the key is valid, just rate limited
		if (typedError.status === 429 || typedError.statusCode === 429) {
			return { valid: true };
		}

		// Return the full error message for other errors
		const errorMessage =
			typedError.message ||
			(error instanceof Error ? error.message : String(error));
		return {
			valid: false,
			error: errorMessage,
		};
	}
}
