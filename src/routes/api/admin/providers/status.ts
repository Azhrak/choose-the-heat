import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getAllProviderStatuses } from "~/lib/ai/providerStatus";
import { requireAdmin } from "~/lib/auth/authorization";

export const Route = createFileRoute("/api/admin/providers/status")({
	server: {
		handlers: {
			// GET /api/admin/providers/status?category=text|tts
			GET: async ({ request }) => {
				try {
					await requireAdmin(request);

					const url = new URL(request.url);
					const category = url.searchParams.get("category") || "text";

					if (category !== "text" && category !== "tts") {
						return json({ error: "Invalid category" }, { status: 400 });
					}

					const statuses = await getAllProviderStatuses(
						category as "text" | "tts",
					);

					return json({ statuses });
				} catch (error) {
					if (error instanceof Response) throw error;
					console.error("Error fetching provider statuses:", error);
					return json(
						{ error: "Failed to fetch provider statuses" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
