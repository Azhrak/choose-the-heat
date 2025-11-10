import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getTemplateWithChoicePoints } from "~/lib/db/queries/templates";

export const Route = createFileRoute("/api/templates/$id")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				try {
					const { id } = params;

					const template = await getTemplateWithChoicePoints(id);

					if (!template) {
						return json({ error: "Template not found" }, { status: 404 });
					}

					return json({ template });
				} catch (error) {
					console.error("Error fetching template:", error);
					return json({ error: "Failed to fetch template" }, { status: 500 });
				}
			},
		},
	},
});
