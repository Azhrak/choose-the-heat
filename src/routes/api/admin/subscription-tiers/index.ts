import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import {
	getAllSubscriptionTiers,
	getSubscriptionTierStats,
} from "~/lib/db/queries/admin-subscription-tiers";

export const Route = createFileRoute("/api/admin/subscription-tiers/")({
	server: {
		handlers: {
			// GET /api/admin/subscription-tiers - Get all subscription tiers
			GET: async ({ request }) => {
				try {
					// Require admin role
					await requireAdmin(request);

					// Fetch all tiers and stats
					const [tiers, stats] = await Promise.all([
						getAllSubscriptionTiers(),
						getSubscriptionTierStats(),
					]);

					return json({
						tiers,
						stats,
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error; // Re-throw 401/403 responses
					}
					console.error("Error fetching subscription tiers:", error);
					return json(
						{ error: "Failed to fetch subscription tiers" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
