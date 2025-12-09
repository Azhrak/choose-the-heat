/**
 * Password Hashing & Validation - Authentication Feature
 *
 * Secure password hashing using Argon2id algorithm with recommended OWASP settings.
 * Includes password strength validation and email format validation.
 *
 * @see docs/features/authentication.md - Complete feature documentation
 * @update-trigger When modifying hashing algorithm, validation rules, or security settings, update the feature doc
 */

import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2 hashing options
 * These are recommended settings for password hashing
 */
const hashingOptions = {
	memoryCost: 19456, // 19 MiB
	timeCost: 2,
	outputLen: 32,
	parallelism: 1,
};

/**
 * Hash a password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
	return hash(password, hashingOptions);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
	hash: string,
	password: string,
): Promise<boolean> {
	try {
		return await verify(hash, password, hashingOptions);
	} catch {
		return false;
	}
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
	valid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push("Password must be at least 8 characters long");
	}

	if (password.length > 128) {
		errors.push("Password must be less than 128 characters");
	}

	if (!/[a-z]/.test(password)) {
		errors.push("Password must contain at least one lowercase letter");
	}

	if (!/[A-Z]/.test(password)) {
		errors.push("Password must contain at least one uppercase letter");
	}

	if (!/[0-9]/.test(password)) {
		errors.push("Password must contain at least one number");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email) && email.length <= 255;
}
