import type { GoogleUser } from "~/lib/auth/oauth";
import { db } from "~/lib/db";
import type { UserRole } from "~/lib/db/types";
import type { UserPreferences } from "~/lib/types/preferences";
import { createAuditLog, extractChanges } from "./audit";

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
			"u.default_preferences",
			"pa.hashed_password",
		])
		.where("u.email", "=", email)
		.executeTakeFirst();

	return result;
}

/**
 * Update user's default preferences
 */
export async function updateUserPreferences(
	userId: string,
	preferences: UserPreferences,
) {
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

/**
 * Get all users with pagination (admin only)
 */
export interface GetUsersFilters {
	role?: UserRole;
	search?: string;
	limit?: number;
	offset?: number;
}

export async function getAllUsers(filters: GetUsersFilters = {}) {
	let query = db
		.selectFrom("users")
		.select([
			"id",
			"email",
			"name",
			"avatar_url",
			"role",
			"email_verified",
			"created_at",
			"updated_at",
		])
		.orderBy("created_at", "desc");

	// Filter by role
	if (filters.role) {
		query = query.where("role", "=", filters.role);
	}

	// Search by email or name
	if (filters.search) {
		const searchTerm = `%${filters.search.toLowerCase()}%`;
		query = query.where((eb) =>
			eb.or([
				eb("email", "ilike", searchTerm),
				eb("name", "ilike", searchTerm),
			]),
		);
	}

	// Pagination
	if (filters.limit) {
		query = query.limit(filters.limit);
	}

	if (filters.offset) {
		query = query.offset(filters.offset);
	}

	return query.execute();
}

/**
 * Get user count with filters
 */
export async function getUserCount(
	filters: Omit<GetUsersFilters, "limit" | "offset"> = {},
) {
	let query = db
		.selectFrom("users")
		.select(({ fn }) => [fn.count<number>("id").as("count")]);

	if (filters.role) {
		query = query.where("role", "=", filters.role);
	}

	if (filters.search) {
		const searchTerm = `%${filters.search.toLowerCase()}%`;
		query = query.where((eb) =>
			eb.or([
				eb("email", "ilike", searchTerm),
				eb("name", "ilike", searchTerm),
			]),
		);
	}

	const result = await query.executeTakeFirst();
	return Number(result?.count || 0);
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
	userId: string,
	newRole: UserRole,
	adminUserId: string,
) {
	// Get old user data for audit log
	const oldUser = await getUserById(userId);

	if (!oldUser) {
		throw new Error("User not found");
	}

	// Update role
	await db
		.updateTable("users")
		.set({
			role: newRole,
			updated_at: new Date(),
		})
		.where("id", "=", userId)
		.execute();

	// Log the change
	await createAuditLog({
		userId: adminUserId,
		action: "update_user_role",
		entityType: "user",
		entityId: userId,
		changes: {
			role: { old: oldUser.role, new: newRole },
			email: oldUser.email,
		},
	});

	return getUserById(userId);
}

/**
 * Update user details (admin only)
 */
export async function updateUser(
	userId: string,
	updates: {
		email?: string;
		name?: string;
		role?: UserRole;
	},
	adminUserId: string,
) {
	// Get old user data for audit log
	const oldUser = await getUserById(userId);

	if (!oldUser) {
		throw new Error("User not found");
	}

	// Check if email is being changed and if it's already taken
	if (updates.email && updates.email !== oldUser.email) {
		const existingUser = await getUserByEmail(updates.email);
		if (existingUser) {
			throw new Error("Email already in use");
		}
	}

	// Update user
	await db
		.updateTable("users")
		.set({
			...updates,
			updated_at: new Date(),
		})
		.where("id", "=", userId)
		.execute();

	// Log the changes
	const changes = extractChanges(oldUser, { ...oldUser, ...updates });

	await createAuditLog({
		userId: adminUserId,
		action: "update_user",
		entityType: "user",
		entityId: userId,
		changes,
	});

	return getUserById(userId);
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string, adminUserId: string) {
	// Get user info for audit log
	const user = await getUserById(userId);

	if (!user) {
		throw new Error("User not found");
	}

	// Delete user (cascade will handle related records)
	await db.deleteFrom("users").where("id", "=", userId).execute();

	// Log the deletion
	await createAuditLog({
		userId: adminUserId,
		action: "delete_user",
		entityType: "user",
		entityId: userId,
		changes: {
			deleted: {
				email: user.email,
				name: user.name,
				role: user.role,
			},
		},
	});
}

/**
 * Get user count by role
 */
export async function getUserCountByRole() {
	const result = await db
		.selectFrom("users")
		.select(({ fn }) => ["role", fn.count<number>("id").as("count")])
		.groupBy("role")
		.execute();

	return result.reduce(
		(acc, row) => {
			acc[row.role as UserRole] = Number(row.count);
			return acc;
		},
		{} as Record<UserRole, number>,
	);
}

/**
 * Get verified user count
 */
export async function getUserVerifiedCount() {
	const result = await db
		.selectFrom("users")
		.select(({ fn }) => [fn.count<number>("id").as("count")])
		.where("email_verified", "=", true)
		.executeTakeFirst();

	return Number(result?.count || 0);
}

/**
 * Update user's default TTS settings
 */
export async function updateUserDefaultTTS(
	userId: string,
	settings: {
		provider: string;
		voiceId: string;
		voiceName: string;
	},
) {
	return db
		.updateTable("users")
		.set({
			default_tts_provider: settings.provider,
			default_tts_voice_id: settings.voiceId,
			default_tts_voice_name: settings.voiceName,
			updated_at: new Date(),
		})
		.where("id", "=", userId)
		.execute();
}

/**
 * Get user's default TTS settings
 */
export async function getUserDefaultTTS(userId: string): Promise<{
	provider?: string;
	voiceId?: string;
	voiceName?: string;
} | null> {
	const result = await db
		.selectFrom("users")
		.select([
			"default_tts_provider",
			"default_tts_voice_id",
			"default_tts_voice_name",
		])
		.where("id", "=", userId)
		.executeTakeFirst();

	if (!result) {
		return null;
	}

	return {
		provider: result.default_tts_provider || undefined,
		voiceId: result.default_tts_voice_id || undefined,
		voiceName: result.default_tts_voice_name || undefined,
	};
}
