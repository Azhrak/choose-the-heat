import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { verifyPassword } from "~/lib/auth/password";
import { getSessionFromRequest } from "~/lib/auth/session";
import { db } from "~/lib/db";

const updateProfileSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	email: z.string().email().optional(),
});

export const Route = createFileRoute("/api/profile/")({
	server: {
		handlers: {
			// Get user profile
			GET: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					// Fetch user data
					const user = await db
						.selectFrom("users")
						.select([
							"id",
							"email",
							"name",
							"avatar_url",
							"default_preferences",
							"email_verified",
							"role",
							"created_at",
						])
						.where("id", "=", session.userId)
						.executeTakeFirst();

					if (!user) {
						return json({ error: "User not found" }, { status: 404 });
					}

					return json({
						id: user.id,
						email: user.email,
						name: user.name,
						avatarUrl: user.avatar_url,
						preferences: user.default_preferences,
						emailVerified: user.email_verified,
						role: user.role,
						createdAt: user.created_at,
					});
				} catch (error) {
					console.error("Profile fetch error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},

			// Update user profile
			PATCH: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const body = await request.json();
					const result = updateProfileSchema.safeParse(body);

					if (!result.success) {
						return json({ error: "Invalid input" }, { status: 400 });
					}

					const updates: any = {
						updated_at: new Date(),
					};

					if (result.data.name !== undefined) {
						updates.name = result.data.name;
					}

					if (result.data.email !== undefined) {
						// Check if email is already taken by another user
						const existingUser = await db
							.selectFrom("users")
							.select("id")
							.where("email", "=", result.data.email)
							.where("id", "!=", session.userId)
							.executeTakeFirst();

						if (existingUser) {
							return json({ error: "Email already in use" }, { status: 409 });
						}

						updates.email = result.data.email;
						updates.email_verified = false; // Reset verification if email changes
					}

					// Update user
					const updatedUser = await db
						.updateTable("users")
						.set(updates)
						.where("id", "=", session.userId)
						.returning(["id", "email", "name", "avatar_url"])
						.executeTakeFirst();

					if (!updatedUser) {
						return json({ error: "Failed to update profile" }, { status: 500 });
					}

					return json({
						id: updatedUser.id,
						email: updatedUser.email,
						name: updatedUser.name,
						avatarUrl: updatedUser.avatar_url,
					});
				} catch (error) {
					console.error("Profile update error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},

			// Delete user account
			DELETE: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const body = await request.json();
					const { password } = body;

					if (!password) {
						return json({ error: "Password required" }, { status: 400 });
					}

					// Verify password for users with password accounts
					const passwordAccount = await db
						.selectFrom("password_accounts")
						.select("hashed_password")
						.where("user_id", "=", session.userId)
						.executeTakeFirst();

					// If user has a password account, verify the password
					if (passwordAccount) {
						const validPassword = await verifyPassword(
							passwordAccount.hashed_password,
							password,
						);

						if (!validPassword) {
							return json({ error: "Invalid password" }, { status: 401 });
						}
					}

					// Delete all user data (cascade will handle related records)
					await db
						.deleteFrom("users")
						.where("id", "=", session.userId)
						.execute();

					// Delete session
					await db
						.deleteFrom("sessions")
						.where("user_id", "=", session.userId)
						.execute();

					return json({ success: true });
				} catch (error) {
					console.error("Account deletion error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
