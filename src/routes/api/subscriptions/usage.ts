import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getSessionFromRequest } from "~/lib/auth/session";
import { getUserUsage } from "~/lib/db/queries/subscriptions";

export const Route = createFileRoute("/api/subscriptions/usage")({
	server: {
		handlers: {
			// Get current user's usage for today
			GET: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const usage = await getUserUsage(session.userId);

					// Return zero usage if no record exists yet
					if (!usage) {
						return json({
							text_generations: 0,
							voice_generations: 0,
							date: new Date().toISOString().split("T")[0],
						});
					}

					return json(usage);
				} catch (error) {
					console.error("User usage fetch error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
