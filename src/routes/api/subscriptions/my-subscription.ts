import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getSessionFromRequest } from "~/lib/auth/session";
import { getUserSubscription } from "~/lib/db/queries/subscriptions";

export const Route = createFileRoute("/api/subscriptions/my-subscription")({
	server: {
		handlers: {
			// Get current user's subscription info
			GET: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const subscription = await getUserSubscription(session.userId);
					if (!subscription) {
						return json({ error: "User not found" }, { status: 404 });
					}

					return json(subscription);
				} catch (error) {
					console.error("User subscription fetch error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
