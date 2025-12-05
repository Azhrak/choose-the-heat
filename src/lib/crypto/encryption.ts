import crypto from "node:crypto";

/**
 * Encryption configuration
 */
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes for GCM mode
const _AUTH_TAG_LENGTH = 16; // 16 bytes authentication tag
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment variable
 */
function getEncryptionKey(): Buffer {
	const encryptionKey = process.env.ENCRYPTION_KEY;

	if (!encryptionKey) {
		throw new Error(
			"ENCRYPTION_KEY environment variable is not set. " +
				"Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"",
		);
	}

	try {
		const key = Buffer.from(encryptionKey, "base64");
		if (key.length !== KEY_LENGTH) {
			throw new Error(
				`Encryption key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 8} bits), got ${key.length} bytes`,
			);
		}
		return key;
	} catch (_error) {
		throw new Error(
			`Invalid ENCRYPTION_KEY format. Expected base64-encoded ${KEY_LENGTH}-byte key. ` +
				`Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
		);
	}
}

/**
 * Encrypt a string using AES-256-GCM
 * @returns Object containing the encrypted data, IV, and auth tag
 */
export function encrypt(plaintext: string): {
	encrypted: string;
	iv: string;
	authTag: string;
} {
	const key = getEncryptionKey();
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

	let encrypted = cipher.update(plaintext, "utf8", "base64");
	encrypted += cipher.final("base64");

	const authTag = cipher.getAuthTag();

	return {
		encrypted,
		iv: iv.toString("hex"),
		authTag: authTag.toString("hex"),
	};
}

/**
 * Decrypt a string using AES-256-GCM
 * @param encrypted Base64-encoded encrypted data
 * @param iv Hex-encoded initialization vector
 * @param authTag Hex-encoded authentication tag
 * @returns Decrypted plaintext string
 */
export function decrypt(
	encrypted: string,
	iv: string,
	authTag: string,
): string {
	const key = getEncryptionKey();
	const decipher = crypto.createDecipheriv(
		ALGORITHM,
		key,
		Buffer.from(iv, "hex"),
	);

	decipher.setAuthTag(Buffer.from(authTag, "hex"));

	let decrypted = decipher.update(encrypted, "base64", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}

/**
 * Generate a new encryption key and output it in the correct format
 * This is a helper function for setting up the ENCRYPTION_KEY environment variable
 */
export function generateEncryptionKey(): void {
	const key = crypto.randomBytes(KEY_LENGTH).toString("base64");
	console.log(`ENCRYPTION_KEY=${key}`);
	console.log("\nAdd this to your .env file to enable API key encryption.");
}
