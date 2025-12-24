import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import {
	discoverAllModels,
	discoverModelsForProvider,
} from "~/lib/ai/modelDiscovery";
import { requireAdmin } from "~/lib/auth/authorization";
import type { ModelCategory } from "~/lib/db/queries/aiModels";

export const Route = createFileRoute("/api/admin/models/discover")({
	server: {
		handlers: {
			// POST /api/admin/models/discover
			// Body: { provider?: string, category: 'text' | 'tts', force?: boolean }
			POST: async ({ request }) => {
				try {
					const _user = await requireAdmin(request);

					const body = await request.json();
					const { provider, category, force: _force } = body;

					if (!category || (category !== "text" && category !== "tts")) {
						return json(
							{ error: "Invalid or missing category" },
							{ status: 400 },
						);
					}

					// Discover models
					let results: Awaited<
						ReturnType<typeof discoverModelsForProvider>
					>[] = [];
					if (provider) {
						// Single provider
						const result = await discoverModelsForProvider(
							provider,
							category as ModelCategory,
						);
						results = [result];
					} else {
						// All providers
						results = await discoverAllModels(category as ModelCategory);
					}

					// Calculate totals
					const totalNew = results.reduce(
						(sum, r) => sum + r.newModels.length,
						0,
					);
					const totalErrors = results.reduce(
						(sum, r) => sum + r.errors.length,
						0,
					);

					return json({
						results,
						totalNew,
						totalErrors,
						message:
							totalNew > 0
								? `Discovered ${totalNew} new models`
								: "No new models found",
					});
				} catch (error) {
					if (error instanceof Response) throw error;
					console.error("Error discovering models:", error);
					return json(
						{
							error: "Failed to discover models",
							details: error instanceof Error ? error.message : String(error),
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
