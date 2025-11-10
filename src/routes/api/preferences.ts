import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getSessionFromRequest } from "~/lib/auth/session";
import { db } from "~/lib/db";
import {
	GENRES,
	PACING_OPTIONS,
	TROPES,
	type UserPreferences,
} from "~/lib/types/preferences";

export const Route = createFileRoute("/api/preferences")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					// Check authentication
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					// Parse request body
					const body = await request.json();
					const { genres, tropes, spiceLevel, pacing } =
						body as UserPreferences;

					// Validate inputs
					if (!Array.isArray(genres) || genres.length === 0) {
						return json(
							{ error: "At least one genre is required" },
							{ status: 400 },
						);
					}

					if (!Array.isArray(tropes) || tropes.length === 0) {
						return json(
							{ error: "At least one trope is required" },
							{ status: 400 },
						);
					}

					// Validate genres are valid
					const invalidGenres = genres.filter(
						(g) => !GENRES.includes(g as any),
					);
					if (invalidGenres.length > 0) {
						return json({ error: "Invalid genre selection" }, { status: 400 });
					}

					// Validate tropes are valid
					const invalidTropes = tropes.filter(
						(t) => !TROPES.includes(t as any),
					);
					if (invalidTropes.length > 0) {
						return json({ error: "Invalid trope selection" }, { status: 400 });
					}

					// Validate spice level
					if (
						typeof spiceLevel !== "number" ||
						spiceLevel < 1 ||
						spiceLevel > 5
					) {
						return json({ error: "Invalid spice level" }, { status: 400 });
					}

					// Validate pacing
					if (!PACING_OPTIONS.includes(pacing as any)) {
						return json({ error: "Invalid pacing selection" }, { status: 400 });
					}

					// Save preferences to database
					await db
						.updateTable("users")
						.set({
							default_preferences: JSON.stringify({
								genres,
								tropes,
								spiceLevel,
								pacing,
							}),
							updated_at: new Date(),
						})
						.where("id", "=", session.userId)
						.execute();

					return json({
						success: true,
						preferences: { genres, tropes, spiceLevel, pacing },
					});
				} catch (error) {
					console.error("Preferences save error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},

			GET: async ({ request }) => {
				try {
					// Check authentication
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					// Get user preferences
					const user = await db
						.selectFrom("users")
						.select("default_preferences")
						.where("id", "=", session.userId)
						.executeTakeFirst();

					if (!user) {
						return json({ error: "User not found" }, { status: 404 });
					}

					return json({
						preferences: user.default_preferences || null,
					});
				} catch (error) {
					console.error("Preferences fetch error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
