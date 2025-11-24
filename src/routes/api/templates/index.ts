import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import {
	getPublishedTemplates,
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
					const pageParam = url.searchParams.get("page");
					const limitParam = url.searchParams.get("limit");

					// Parse pagination parameters
					const page = pageParam ? Number.parseInt(pageParam, 10) : 1;
					const limit = limitParam ? Number.parseInt(limitParam, 10) : 15;

					// Validate pagination parameters
					const validPage = page > 0 ? page : 1;
					const validLimit = limit > 0 && limit <= 100 ? limit : 15;

					let templates: Awaited<ReturnType<typeof getPublishedTemplates>>;

					// If both tropes and search are provided, filter by both
					if (tropesParam && searchParam) {
						const tropes = tropesParam.split(",") as Trope[];
						const tropeFiltered = await getTemplatesByTropes(tropes);
						const searchTerm = searchParam.toLowerCase();

						// Filter for published templates only
						templates = tropeFiltered.filter((template) => {
							const isPublished = template.status === "published";
							const matchesSearch =
								template.title.toLowerCase().includes(searchTerm) ||
								template.description.toLowerCase().includes(searchTerm);
							return isPublished && matchesSearch;
						});
					}
					// If only tropes filter provided
					else if (tropesParam) {
						const tropes = tropesParam.split(",") as Trope[];
						const allTropeFiltered = await getTemplatesByTropes(tropes);
						// Filter for published templates only
						templates = allTropeFiltered.filter(
							(template) => template.status === "published",
						);
					}
					// If only search query provided
					else if (searchParam) {
						const allSearchResults = await searchTemplates(searchParam);
						// Filter for published templates only
						templates = allSearchResults.filter(
							(template) => template.status === "published",
						);
					}
					// Otherwise, return all published templates
					else {
						templates = await getPublishedTemplates();
					}

					// Calculate pagination
					const totalCount = templates.length;
					const totalPages = Math.ceil(totalCount / validLimit);
					const startIndex = (validPage - 1) * validLimit;
					const endIndex = startIndex + validLimit;
					const paginatedTemplates = templates.slice(startIndex, endIndex);

					return json({
						templates: paginatedTemplates,
						pagination: {
							page: validPage,
							limit: validLimit,
							totalCount,
							totalPages,
							hasNextPage: validPage < totalPages,
							hasPreviousPage: validPage > 1,
						},
					});
				} catch (error) {
					console.error("Error fetching templates:", error);
					return json({ error: "Failed to fetch templates" }, { status: 500 });
				}
			},
		},
	},
});
