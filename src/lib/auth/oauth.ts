import { Google } from "arctic";
import { randomBytes } from "crypto";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
	throw new Error("Missing Google OAuth credentials in environment variables");
}

if (!process.env.APP_URL) {
	throw new Error("Missing APP_URL in environment variables");
}

/**
 * Google OAuth client instance
 */
export const google = new Google(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.APP_URL}/api/auth/callback/google`,
);

/**
 * OAuth state management (store temporarily)
 * In production, use Redis or similar
 */
const oauthStates = new Map<string, { expiresAt: number }>();

/**
 * PKCE code verifier storage
 * In production, use Redis or similar
 */
const pkceVerifiers = new Map<string, { verifier: string; expiresAt: number }>();

/**
 * Generate and store OAuth state
 */
export function generateOAuthState(): string {
	const state = crypto.randomUUID();
	oauthStates.set(state, {
		expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
	});

	// Cleanup expired states
	for (const [key, value] of oauthStates.entries()) {
		if (value.expiresAt < Date.now()) {
			oauthStates.delete(key);
		}
	}

	return state;
}

/**
 * Generate PKCE code verifier
 * Arctic will generate the code challenge internally
 */
export function generatePKCE(): { codeVerifier: string } {
	// Generate a random code verifier (43-128 characters)
	const codeVerifier = randomBytes(32).toString("base64url");

	return { codeVerifier };
}

/**
 * Store PKCE verifier
 */
export function storePKCEVerifier(state: string, codeVerifier: string): void {
	pkceVerifiers.set(state, {
		verifier: codeVerifier,
		expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
	});
}

/**
 * Retrieve and clear PKCE verifier
 */
export function getPKCEVerifier(state: string): string | null {
	const stored = pkceVerifiers.get(state);
	if (!stored) {
		return null;
	}

	if (stored.expiresAt < Date.now()) {
		pkceVerifiers.delete(state);
		return null;
	}

	pkceVerifiers.delete(state);
	return stored.verifier;
}

/**
 * Verify OAuth state
 */
export function verifyOAuthState(state: string): boolean {
	const stored = oauthStates.get(state);
	if (!stored) {
		return false;
	}

	if (stored.expiresAt < Date.now()) {
		oauthStates.delete(state);
		return false;
	}

	oauthStates.delete(state);
	return true;
}

/**
 * Google user info structure
 */
export interface GoogleUser {
	sub: string; // User ID
	email: string;
	name: string;
	picture: string;
	email_verified: boolean;
}

/**
 * Fetch Google user info from OAuth token
 */
export async function getGoogleUser(accessToken: string): Promise<GoogleUser> {
	const response = await fetch(
		"https://www.googleapis.com/oauth2/v3/userinfo",
		{
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		},
	);

	if (!response.ok) {
		throw new Error("Failed to fetch Google user info");
	}

	return response.json();
}
