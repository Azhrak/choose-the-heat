import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import {
	hashPassword,
	validatePasswordStrength,
	verifyPassword,
} from "~/lib/auth/password";
import { getSessionFromRequest } from "~/lib/auth/session";
import { db } from "~/lib/db";

const changePasswordSchema = z.object({
	currentPassword: z.string(),
	newPassword: z.string().min(8).max(128),
});

export const Route = createFileRoute("/api/profile/password")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const body = await request.json();
					const result = changePasswordSchema.safeParse(body);

					if (!result.success) {
						return json({ error: "Invalid input" }, { status: 400 });
					}

					const { currentPassword, newPassword } = result.data;

					// Get user's current password hash
					const passwordAccount = await db
						.selectFrom("password_accounts")
						.select("hashed_password")
						.where("user_id", "=", session.userId)
						.executeTakeFirst();

					if (!passwordAccount) {
						return json(
							{ error: "This account does not use password authentication" },
							{ status: 400 },
						);
					}

					// Verify current password
					const validPassword = await verifyPassword(
						passwordAccount.hashed_password,
						currentPassword,
					);

					if (!validPassword) {
						return json(
							{ error: "Current password is incorrect" },
							{ status: 401 },
						);
					}

					// Validate new password strength
					const passwordValidation = validatePasswordStrength(newPassword);
					if (!passwordValidation.valid) {
						return json(
							{
								error: "Password does not meet requirements",
								details: passwordValidation.errors,
							},
							{ status: 400 },
						);
					}

					// Hash new password
					const hashedPassword = await hashPassword(newPassword);

					// Update password
					await db
						.updateTable("password_accounts")
						.set({
							hashed_password: hashedPassword,
							updated_at: new Date(),
						})
						.where("user_id", "=", session.userId)
						.execute();

					return json({ success: true });
				} catch (error) {
					console.error("Password change error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
