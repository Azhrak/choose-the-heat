import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "~/lib/auth/authorization";
import {
	getSubscriptionTierByTier,
	toggleSubscriptionTierStatus,
	updateSubscriptionTier,
} from "~/lib/db/queries/admin-subscription-tiers";
import type { SubscriptionTier } from "~/lib/db/types";

// Validation schema for updating a subscription tier
const updateTierSchema = z.object({
	name: z.string().min(1).max(50).optional(),
	description: z.string().max(500).nullable().optional(),
	price_monthly: z.number().min(0).max(9999.99).optional(),
	price_yearly: z.number().min(0).max(99999.99).nullable().optional(),
	text_generations_per_day: z.number().int().min(-1).optional(), // -1 = unlimited
	voice_generations_per_day: z.number().int().min(-1).optional(), // -1 = unlimited
	features: z
		.object({
			priority_support: z.boolean().optional(),
			advanced_ai_models: z.boolean().optional(),
			early_access: z.boolean().optional(),
		})
		.optional(),
	is_active: z.boolean().optional(),
});

// Validate tier ID parameter
function validateTierId(id: string): SubscriptionTier | null {
	const validTiers = ["free", "basic", "premium", "premium_plus"];
	if (validTiers.includes(id)) {
		return id as SubscriptionTier;
	}
	return null;
}

export const Route = createFileRoute("/api/admin/subscription-tiers/$id")({
	server: {
		handlers: {
			// GET /api/admin/subscription-tiers/:id - Get tier details
			GET: async ({ request, params }) => {
				try {
					await requireAdmin(request);

					const tier = validateTierId(params.id);
					if (!tier) {
						return json({ error: "Invalid tier ID" }, { status: 400 });
					}

					const tierData = await getSubscriptionTierByTier(tier);

					if (!tierData) {
						return json({ error: "Tier not found" }, { status: 404 });
					}

					return json({ tier: tierData });
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}
					console.error("Error fetching tier:", error);
					return json({ error: "Failed to fetch tier" }, { status: 500 });
				}
			},

			// PATCH /api/admin/subscription-tiers/:id - Update tier
			PATCH: async ({ request, params }) => {
				try {
					await requireAdmin(request);

					const tier = validateTierId(params.id);
					if (!tier) {
						return json({ error: "Invalid tier ID" }, { status: 400 });
					}

					// Prevent modifying free tier pricing
					const body = await request.json();
					const validatedData = updateTierSchema.parse(body);

					if (
						tier === "free" &&
						(validatedData.price_monthly !== undefined ||
							validatedData.price_yearly !== undefined)
					) {
						return json(
							{ error: "Cannot set pricing for free tier" },
							{ status: 400 },
						);
					}

					// Convert null to undefined for description
					const updateData = {
						...validatedData,
						description:
							validatedData.description === null
								? undefined
								: validatedData.description,
					};

					const updatedTier = await updateSubscriptionTier(tier, updateData);

					return json({
						tier: updatedTier,
						message:
							"Tier updated successfully. Stripe products/prices synced.",
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}

					if (error instanceof z.ZodError) {
						return json(
							{ error: "Validation error", details: error.issues },
							{ status: 400 },
						);
					}

					const errorMessage = (error as Error).message;

					if (errorMessage.includes("not found")) {
						return json({ error: "Tier not found" }, { status: 404 });
					}

					console.error("Error updating tier:", error);
					return json({ error: "Failed to update tier" }, { status: 500 });
				}
			},

			// DELETE /api/admin/subscription-tiers/:id - Toggle tier status (soft delete)
			DELETE: async ({ request, params }) => {
				try {
					await requireAdmin(request);

					const tier = validateTierId(params.id);
					if (!tier) {
						return json({ error: "Invalid tier ID" }, { status: 400 });
					}

					const result = await toggleSubscriptionTierStatus(tier);

					const action = result.is_active ? "activated" : "deactivated";

					return json({
						message: `Tier ${action} successfully`,
						tier: result,
					});
				} catch (error) {
					if (error instanceof Response) {
						throw error;
					}

					const errorMessage = (error as Error).message;

					if (errorMessage.includes("Cannot deactivate free tier")) {
						return json(
							{ error: "Cannot deactivate free tier" },
							{ status: 400 },
						);
					}

					if (errorMessage.includes("active user")) {
						return json(
							{ error: errorMessage },
							{ status: 409 }, // Conflict
						);
					}

					if (errorMessage.includes("not found")) {
						return json({ error: "Tier not found" }, { status: 404 });
					}

					console.error("Error toggling tier status:", error);
					return json(
						{ error: "Failed to toggle tier status" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
