import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getSubscriptionTiers } from "~/lib/db/queries/subscriptions";

export const Route = createFileRoute("/api/subscriptions/tiers")({
	server: {
		handlers: {
			// Get all subscription tiers
			GET: async () => {
				try {
					const tiers = await getSubscriptionTiers();
					return json(tiers);
				} catch (error) {
					console.error("Subscription tiers fetch error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
