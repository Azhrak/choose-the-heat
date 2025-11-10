import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { verifyPassword } from "~/lib/auth/password";
import { createSession, createSessionCookie } from "~/lib/auth/session";
import { getUserWithPassword } from "~/lib/db/queries/users";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const Route = createFileRoute("/api/auth/login")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const body = await request.json();
					const result = loginSchema.safeParse(body);

					if (!result.success) {
						return json({ error: "Invalid input" }, { status: 400 });
					}

					const { email, password } = result.data;

					// Get user with password
					const user = await getUserWithPassword(email);

					if (!user) {
						return json(
							{ error: "Invalid email or password" },
							{ status: 401 },
						);
					}

					// Verify password
					const validPassword = await verifyPassword(
						user.hashed_password,
						password,
					);

					if (!validPassword) {
						return json(
							{ error: "Invalid email or password" },
							{ status: 401 },
						);
					}

					// Create session
					const session = await createSession(user.id);

					return json(
						{
							success: true,
							user: {
								id: user.id,
								email: user.email,
								name: user.name,
								hasPreferences: !!user.default_preferences,
							},
						},
						{
							headers: {
								"Set-Cookie": createSessionCookie(
									session.id,
									session.expiresAt,
								),
							},
						},
					);
				} catch (error) {
					console.error("Login error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
