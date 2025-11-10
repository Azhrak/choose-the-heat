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

					let templates;

					// If both tropes and search are provided, filter by both
					if (tropesParam && searchParam) {
						const tropes = tropesParam.split(",") as Trope[];
						const tropeFiltered = await getTemplatesByTropes(tropes);
						const searchTerm = searchParam.toLowerCase();

						templates = tropeFiltered.filter((template) => {
							return (
								template.title.toLowerCase().includes(searchTerm) ||
								template.description.toLowerCase().includes(searchTerm)
							);
						});
					}
					// If only tropes filter provided
					else if (tropesParam) {
						const tropes = tropesParam.split(",") as Trope[];
						templates = await getTemplatesByTropes(tropes);
					}
					// If only search query provided
					else if (searchParam) {
						templates = await searchTemplates(searchParam);
					}
					// Otherwise, return all templates
					else {
						templates = await getAllTemplates();
					}

					return json({ templates });
				} catch (error) {
					console.error("Error fetching templates:", error);
					return json({ error: "Failed to fetch templates" }, { status: 500 });
				}
			},
		},
	},
});
