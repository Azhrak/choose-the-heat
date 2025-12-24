import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getSessionFromRequest } from "~/lib/auth/session";
import { getUserInvoices } from "~/lib/db/queries/billing";

export const Route = createFileRoute("/api/billing/invoices")({
	server: {
		handlers: {
			// Get user's invoices
			GET: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const url = new URL(request.url);
					const limit = parseInt(url.searchParams.get("limit") || "50", 10);
					const offset = parseInt(url.searchParams.get("offset") || "0", 10);

					const invoices = await getUserInvoices(session.userId, limit, offset);

					return json(invoices);
				} catch (error) {
					console.error("Invoices fetch error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
