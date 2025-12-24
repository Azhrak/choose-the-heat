/**
 * Provider Status System
 *
 * Determines provider readiness by checking:
 * - API key exists and is validated
 * - At least one model configured
 * - Default model is set
 */

import { listApiKeys } from "../db/queries/apiKeys";
import { getSettingsMap } from "../db/queries/settings";
import {
	getAllTextProviders,
	getAllTTSProviders,
	type ProviderMetadata,
} from "./providers";

export type ProviderStatus =
	| "ready"
	| "incomplete"
	| "invalid"
	| "unconfigured";

export interface ProviderStatusInfo {
	provider: string;
	status: ProviderStatus;
	metadata: ProviderMetadata;
	hasApiKey: boolean;
	apiKeyStatus: "valid" | "invalid" | "untested" | null;
	apiKeyError?: string | null;
	availableModels: string[];
	defaultModel?: string;
	isActive: boolean;
}

/**
 * Get comprehensive status for a single provider
 */
export async function getProviderStatus(
	providerId: string,
	category: "text" | "tts" = "text",
): Promise<ProviderStatusInfo | null> {
	const providers =
		category === "text" ? getAllTextProviders() : getAllTTSProviders();
	const metadata = providers.find((p) => p.id === providerId);

	if (!metadata) return null;

	// Get API key status
	const apiKeys = await listApiKeys();
	const apiKeyRecord = apiKeys.find((k) => k.provider === providerId);

	// Get settings
	const settingsCategory = category === "text" ? "ai" : "tts";
	const settings = await getSettingsMap({ category: settingsCategory });

	// Parse available models
	let availableModels: string[] = [];
	try {
		const modelsJson = settings[`${settingsCategory}.available_models`];
		if (modelsJson) {
			const parsed = JSON.parse(modelsJson);
			availableModels = parsed[providerId] || [];
		}
	} catch (error) {
		console.error("Failed to parse available models:", error);
	}

	// Get default model for this provider
	const defaultModel =
		settings[`${settingsCategory}.${providerId}.default_model`];

	// Check if this is the active provider
	const activeProvider = settings[`${settingsCategory}.provider`];
	const isActive = activeProvider === providerId;

	// Determine overall status
	const hasKey = !!apiKeyRecord?.encryptedKey;
	const hasModels = availableModels.length > 0;
	const apiKeyStatus = apiKeyRecord?.testStatus as
		| "valid"
		| "invalid"
		| "untested"
		| null;

	let status: ProviderStatus;
	if (!hasKey) {
		status = "unconfigured";
	} else if (apiKeyStatus === "invalid") {
		status = "invalid";
	} else if (!hasModels || !defaultModel) {
		status = "incomplete";
	} else if (apiKeyStatus === "valid") {
		status = "ready";
	} else {
		// Has key and models but untested
		status = "incomplete";
	}

	return {
		provider: providerId,
		status,
		metadata,
		hasApiKey: hasKey,
		apiKeyStatus: apiKeyStatus,
		apiKeyError: apiKeyRecord?.testError,
		availableModels,
		defaultModel,
		isActive,
	};
}

/**
 * Get status for all providers in a category
 */
export async function getAllProviderStatuses(
	category: "text" | "tts" = "text",
): Promise<ProviderStatusInfo[]> {
	const providers =
		category === "text" ? getAllTextProviders() : getAllTTSProviders();

	const statuses = await Promise.all(
		providers.map((p) => getProviderStatus(p.id, category)),
	);

	return statuses.filter((s): s is ProviderStatusInfo => s !== null);
}

/**
 * Check if a provider is complete (ready to use)
 */
export function isProviderComplete(status: ProviderStatusInfo): boolean {
	return status.status === "ready";
}

/**
 * Get a user-friendly status message
 */
export function getStatusMessage(status: ProviderStatusInfo): string {
	switch (status.status) {
		case "ready":
			return "Ready to use";
		case "unconfigured":
			return "No API key configured";
		case "invalid":
			return status.apiKeyError || "Invalid API key";
		case "incomplete":
			if (!status.hasApiKey) return "No API key";
			if (status.availableModels.length === 0) return "No models configured";
			if (!status.defaultModel) return "No default model set";
			return "Needs validation";
		default:
			return "Unknown status";
	}
}

/**
 * Get status counts for summary stats
 */
export interface ProviderStatusCounts {
	ready: number;
	incomplete: number;
	invalid: number;
	unconfigured: number;
	total: number;
}

export function getStatusCounts(
	statuses: ProviderStatusInfo[],
): ProviderStatusCounts {
	return {
		ready: statuses.filter((s) => s.status === "ready").length,
		incomplete: statuses.filter((s) => s.status === "incomplete").length,
		invalid: statuses.filter((s) => s.status === "invalid").length,
		unconfigured: statuses.filter((s) => s.status === "unconfigured").length,
		total: statuses.length,
	};
}
