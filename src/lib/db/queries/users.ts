import type { GoogleUser } from "~/lib/auth/oauth";
import { db } from "~/lib/db";

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
	return db
		.selectFrom("users")
		.selectAll()
		.where("email", "=", email)
		.executeTakeFirst();
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
	return db
		.selectFrom("users")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
}

/**
 * Create a new user from Google OAuth
 */
export async function createUserFromGoogle(googleUser: GoogleUser) {
	const user = await db
		.insertInto("users")
		.values({
			email: googleUser.email,
			name: googleUser.name,
			avatar_url: googleUser.picture,
			email_verified: googleUser.email_verified,
		})
		.returning(["id", "email", "name", "avatar_url", "email_verified"])
		.executeTakeFirstOrThrow();

	// Create OAuth account record
	await db
		.insertInto("oauth_accounts")
		.values({
			user_id: user.id,
			provider: "google",
			provider_user_id: googleUser.sub,
		})
		.execute();

	return user;
}

/**
 * Get or create user from Google OAuth
 */
export async function getOrCreateGoogleUser(
	googleUser: GoogleUser,
	accessToken: string,
) {
	// Check if OAuth account exists
	const oauthAccount = await db
		.selectFrom("oauth_accounts")
		.selectAll()
		.where("provider", "=", "google")
		.where("provider_user_id", "=", googleUser.sub)
		.executeTakeFirst();

	if (oauthAccount) {
		// Update access token
		await db
			.updateTable("oauth_accounts")
			.set({
				access_token: accessToken,
			})
			.where("id", "=", oauthAccount.id)
			.execute();

		// Return existing user
		return getUserById(oauthAccount.user_id);
	}

	// Check if user exists by email (link accounts)
	const existingUser = await getUserByEmail(googleUser.email);

	if (existingUser) {
		// Link OAuth account to existing user
		await db
			.insertInto("oauth_accounts")
			.values({
				user_id: existingUser.id,
				provider: "google",
				provider_user_id: googleUser.sub,
				access_token: accessToken,
			})
			.execute();

		return existingUser;
	}

	// Create new user
	return createUserFromGoogle(googleUser);
}

/**
 * Create a user with email/password
 */
export async function createUserWithPassword(
	email: string,
	name: string,
	hashedPassword: string,
) {
	const user = await db
		.insertInto("users")
		.values({
			email,
			name,
			email_verified: false,
		})
		.returning(["id", "email", "name", "avatar_url", "email_verified"])
		.executeTakeFirstOrThrow();

	// Create password account record
	await db
		.insertInto("password_accounts")
		.values({
			user_id: user.id,
			hashed_password: hashedPassword,
		})
		.execute();

	return user;
}

/**
 * Get user with password account
 */
export async function getUserWithPassword(email: string) {
	const result = await db
		.selectFrom("users as u")
		.innerJoin("password_accounts as pa", "u.id", "pa.user_id")
		.select([
			"u.id",
			"u.email",
			"u.name",
			"u.avatar_url",
			"u.email_verified",
			"pa.hashed_password",
		])
		.where("u.email", "=", email)
		.executeTakeFirst();

	return result;
}

/**
 * Update user's default preferences
 */
export async function updateUserPreferences(userId: string, preferences: any) {
	return db
		.updateTable("users")
		.set({
			default_preferences: JSON.stringify(preferences),
			updated_at: new Date(),
		})
		.where("id", "=", userId)
		.execute();
}

/**
 * Update user profile
 */
export async function updateUserProfile(
	userId: string,
	data: { name?: string; avatar_url?: string },
) {
	return db
		.updateTable("users")
		.set({
			...data,
			updated_at: new Date(),
		})
		.where("id", "=", userId)
		.execute();
}
