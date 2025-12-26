import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdmin } from "~/lib/auth/authorization";
import { syncAllTiersToStripe } from "~/lib/stripe/products";

export const Route = createFileRoute(
	"/api/admin/subscription-tiers/sync-stripe",
)({
	server: {
		handlers: {
			// POST /api/admin/subscription-tiers/sync-stripe - Manually sync all tiers to Stripe
			POST: async ({ request }) => {
				try {
					await requireAdmin(request);

					console.log("Starting manual Stripe sync for all tiers...");

					const results = await syncAllTiersToStripe();

					const successCount = results.filter((r) => r.success).length;
					const failCount = results.filter((r) => !r.success).length;

					if (failCount > 0) {
						return json(
							{
								message: `Sync completed with ${failCount} error(s)`,
								results,
								stats: { success: successCount, failed: failCount },
							},
							{ status: 207 }, // Multi-status
						);
					}

					return json({
						message: `Successfully synced ${successCount} tier(s) to Stripe`,
						results,
						stats: { success: successCount, failed: failCount },
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}
					console.error("Error syncing tiers to Stripe:", error);
					return json(
						{ error: "Failed to sync tiers to Stripe" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
