import { decrypt, encrypt } from "~/lib/crypto/encryption";
import { db } from "../index";

/**
 * Supported AI providers
 */
export type APIKeyProvider =
	| "openai"
	| "google"
	| "anthropic"
	| "mistral"
	| "xai"
	| "openrouter"
	| "google_tts";

/**
 * API key test status
 */
export type TestStatus = "valid" | "invalid" | "untested";

/**
 * API key record (without decrypted key)
 */
export interface APIKeyRecord {
	id: string;
	provider: APIKeyProvider;
	encryptedKey: string; // Always masked in responses
	testStatus: TestStatus | null;
	testError: string | null;
	lastTestedAt: Date | null;
	updatedAt: Date;
	createdAt: Date;
}

/**
 * Get API key for a provider (returns decrypted key)
 * @param provider AI provider name
 * @returns Decrypted API key or null if not found
 */
export async function getApiKey(
	provider: APIKeyProvider,
): Promise<string | null> {
	const record = await db
		.selectFrom("api_keys")
		.select(["encrypted_key", "iv", "auth_tag"])
		.where("provider", "=", provider)
		.executeTakeFirst();

	if (!record || !record.encrypted_key || !record.iv || !record.auth_tag) {
		return null;
	}

	try {
		return decrypt(record.encrypted_key, record.iv, record.auth_tag);
	} catch (error) {
		console.error(`Failed to decrypt API key for ${provider}:`, error);
		throw new Error(
			`Failed to decrypt API key for ${provider}. The encryption key may have changed.`,
		);
	}
}

/**
 * List all API keys metadata (without decrypted keys)
 * @returns Array of API key records with masked keys
 */
export async function listApiKeys(): Promise<APIKeyRecord[]> {
	const records = await db
		.selectFrom("api_keys")
		.select([
			"id",
			"provider",
			"encrypted_key",
			"test_status",
			"test_error",
			"last_tested_at",
			"updated_at",
			"created_at",
		])
		.execute();

	return records.map((record) => ({
		id: record.id,
		provider: record.provider as APIKeyProvider,
		encryptedKey: record.encrypted_key ? "******" : "",
		testStatus: record.test_status as TestStatus | null,
		testError: record.test_error,
		lastTestedAt: record.last_tested_at,
		updatedAt: record.updated_at,
		createdAt: record.created_at,
	}));
}

/**
 * Update or create an API key
 * @param provider AI provider name
 * @param apiKey Plaintext API key to encrypt and store
 * @param userId User ID performing the operation
 * @param testStatus Optional test status to set
 * @param testError Optional test error message
 */
export async function updateApiKey(
	provider: APIKeyProvider,
	apiKey: string,
	userId: string,
	testStatus?: TestStatus,
	testError?: string | null,
): Promise<void> {
	const { encrypted, iv, authTag } = encrypt(apiKey);
	const now = new Date();

	// Try to update existing record first
	const result = await db
		.updateTable("api_keys")
		.set({
			encrypted_key: encrypted,
			iv,
			auth_tag: authTag,
			test_status: testStatus || "untested",
			test_error: testError || null,
			last_tested_at: testStatus ? now : null,
			updated_at: now,
			updated_by: userId,
		})
		.where("provider", "=", provider)
		.executeTakeFirst();

	// If no record was updated, insert a new one
	if (result.numUpdatedRows === 0n) {
		await db
			.insertInto("api_keys")
			.values({
				provider,
				encrypted_key: encrypted,
				iv,
				auth_tag: authTag,
				encryption_version: 1,
				test_status: testStatus || "untested",
				test_error: testError || null,
				last_tested_at: testStatus ? now : null,
				created_by: userId,
				updated_by: userId,
			})
			.execute();
	}
}

/**
 * Update test status for an API key
 * @param provider AI provider name
 * @param testStatus Test status
 * @param testError Optional error message
 */
export async function updateApiKeyTestStatus(
	provider: APIKeyProvider,
	testStatus: TestStatus,
	testError?: string | null,
): Promise<void> {
	await db
		.updateTable("api_keys")
		.set({
			test_status: testStatus,
			test_error: testError || null,
			last_tested_at: new Date(),
			updated_at: new Date(),
		})
		.where("provider", "=", provider)
		.execute();
}

/**
 * Delete an API key
 * @param provider AI provider name
 */
export async function deleteApiKey(provider: APIKeyProvider): Promise<void> {
	await db
		.updateTable("api_keys")
		.set({
			encrypted_key: "",
			iv: "",
			auth_tag: "",
			test_status: null,
			test_error: null,
			last_tested_at: null,
			updated_at: new Date(),
		})
		.where("provider", "=", provider)
		.execute();
}

/**
 * Check if an API key exists for a provider
 * @param provider AI provider name
 * @returns true if a key exists and is not empty
 */
export async function hasApiKey(provider: APIKeyProvider): Promise<boolean> {
	const record = await db
		.selectFrom("api_keys")
		.select("encrypted_key")
		.where("provider", "=", provider)
		.executeTakeFirst();

	return !!record?.encrypted_key;
}

/**
 * Mark an API key as failed during production use
 * This is different from test failures - it means the key failed during actual generation
 * @param provider AI provider name
 * @param error Error message or object
 * @param context Additional context (e.g., "scene generation", "audio generation")
 */
export async function markApiKeyAsProductionFailed(
	provider: APIKeyProvider,
	error: string | Error,
	context?: string,
): Promise<void> {
	const errorMessage =
		typeof error === "string" ? error : error.message || "Unknown error";
	const fullError = context ? `[${context}] ${errorMessage}` : errorMessage;

	console.error(
		`[API Key Failure] ${provider} key failed during production use: ${fullError}`,
	);

	await updateApiKeyTestStatus(provider, "invalid", fullError);

	// TODO: Send notification to admins (email, in-app notification, etc.)
	// For now, we're just logging and updating the database
}
