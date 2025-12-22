import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getSessionFromRequest } from "~/lib/auth/session";
import { getInvoice, getInvoiceLineItems } from "~/lib/db/queries/billing";

export const Route = createFileRoute("/api/billing/invoices/$id")({
	server: {
		handlers: {
			// Get a specific invoice with line items
			GET: async ({ request, params }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const invoice = await getInvoice(params.id, session.userId);

					if (!invoice) {
						return json({ error: "Invoice not found" }, { status: 404 });
					}

					const lineItems = await getInvoiceLineItems(params.id);

					return json({
						...invoice,
						lineItems,
					});
				} catch (error) {
					console.error("Invoice fetch error:", error);
					return json({ error: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
