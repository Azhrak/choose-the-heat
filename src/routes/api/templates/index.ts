import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import {
	getAllTemplates,
	getTemplatesByTropes,
	searchTemplates,
} from "~/lib/db/queries/templates";
import type { Trope } from "~/lib/types/preferences";

export const Route = createFileRoute("/api/templates/")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					const url = new URL(request.url);
					const tropesParam = url.searchParams.get("tropes");
					const searchParam = url.searchParams.get("search");

					// If search query provided, search templates
					if (searchParam) {
						const templates = await searchTemplates(searchParam);
						return json({ templates });
					}

					// If tropes filter provided, filter by tropes
					if (tropesParam) {
						const tropes = tropesParam.split(",") as Trope[];
						const templates = await getTemplatesByTropes(tropes);
						return json({ templates });
					}

					// Otherwise, return all templates
					const templates = await getAllTemplates();
					return json({ templates });
				} catch (error) {
					console.error("Error fetching templates:", error);
					return json({ error: "Failed to fetch templates" }, { status: 500 });
				}
			},
		},
	},
});
