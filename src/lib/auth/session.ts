import { randomBytes } from "node:crypto";
import { db } from "~/lib/db";

const SESSION_COOKIE_NAME = "session_id";
const SESSION_EXPIRY_DAYS = 30;

/**
 * Session data structure
 */
export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
}

/**
 * Generate a cryptographically secure session ID
 */
function generateSessionId(): string {
	return randomBytes(32).toString("base64url");
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<Session> {
	const sessionId = generateSessionId();
	const expiresAt = new Date(
		Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
	);

	await db
		.insertInto("sessions")
		.values({
			id: sessionId,
			user_id: userId,
			expires_at: expiresAt,
		})
		.execute();

	return {
		id: sessionId,
		userId,
		expiresAt,
	};
}

/**
 * Validate and retrieve a session
 */
export async function getSession(sessionId: string): Promise<Session | null> {
	const session = await db
		.selectFrom("sessions")
		.selectAll()
		.where("id", "=", sessionId)
		.where("expires_at", ">", new Date())
		.executeTakeFirst();

	if (!session) {
		return null;
	}

	return {
		id: session.id,
		userId: session.user_id,
		expiresAt: session.expires_at,
	};
}

/**
 * Get session from request cookies
 */
export async function getSessionFromRequest(
	request: Request,
): Promise<Session | null> {
	const cookies = request.headers.get("cookie");
	if (!cookies) {
		return null;
	}

	const sessionId = getCookie(cookies, SESSION_COOKIE_NAME);
	if (!sessionId) {
		return null;
	}

	return getSession(sessionId);
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionId: string): Promise<void> {
	await db.deleteFrom("sessions").where("id", "=", sessionId).execute();
}

/**
 * Delete all sessions for a user
 */
export async function deleteUserSessions(userId: string): Promise<void> {
	await db.deleteFrom("sessions").where("user_id", "=", userId).execute();
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
	const result = await db
		.deleteFrom("sessions")
		.where("expires_at", "<=", new Date())
		.executeTakeFirst();

	return Number(result.numDeletedRows || 0);
}

/**
 * Create session cookie header
 */
export function createSessionCookie(
	sessionId: string,
	expiresAt: Date,
): string {
	return `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Secure; Expires=${expiresAt.toUTCString()}`;
}

/**
 * Create delete session cookie header
 */
export function deleteSessionCookie(): string {
	return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

/**
 * Parse cookie header and extract specific cookie
 */
function getCookie(cookieHeader: string, name: string): string | null {
	const cookies = cookieHeader.split(";").map((c) => c.trim());

	for (const cookie of cookies) {
		const [cookieName, cookieValue] = cookie.split("=");
		if (cookieName === name) {
			return cookieValue;
		}
	}

	return null;
}

/**
 * User data from session
 */
export interface SessionUser {
	id: string;
	email: string;
	name: string | null;
	avatarUrl: string | null;
	defaultPreferences: any | null;
}

/**
 * Get user data from session
 */
export async function getUserFromSession(
	session: Session,
): Promise<SessionUser | null> {
	const user = await db
		.selectFrom("users")
		.select([
			"id",
			"email",
			"name",
			"avatar_url as avatarUrl",
			"default_preferences as defaultPreferences",
		])
		.where("id", "=", session.userId)
		.executeTakeFirst();

	if (!user) {
		return null;
	}

	return user;
}
