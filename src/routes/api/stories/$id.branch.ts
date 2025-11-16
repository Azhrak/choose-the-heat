import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { getSessionFromRequest } from "~/lib/auth/session";
import { branchStory, findExistingBranch } from "~/lib/db/queries/stories";

const branchSchema = z.object({
	sceneNumber: z.number().int().positive(),
	choicePointId: z.string().uuid(),
	newChoice: z.number().int().min(0).max(3), // 0-3 for up to 4 options
});

const checkBranchSchema = z.object({
	sceneNumber: z.coerce.number().int().positive(),
	choicePointId: z.string().uuid(),
	choiceOption: z.coerce.number().int().min(0).max(3),
});

export const Route = createFileRoute("/api/stories/$id/branch")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				try {
					// Validate session
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const parentStoryId = params.id;

					// Parse query params
					const url = new URL(request.url);
					const queryParams = Object.fromEntries(url.searchParams);
					const parseResult = checkBranchSchema.safeParse(queryParams);

					if (!parseResult.success) {
						return json(
							{
								error: "Invalid query parameters",
								details: parseResult.error.format(),
							},
							{ status: 400 },
						);
					}

					const { sceneNumber, choicePointId, choiceOption } = parseResult.data;

					// Check for existing branch
					const existingBranch = await findExistingBranch(
						parentStoryId,
						session.userId,
						sceneNumber,
						choicePointId,
						choiceOption,
					);

					return json({
						exists: !!existingBranch,
						branch: existingBranch,
					});
				} catch (error) {
					console.error("Error checking for existing branch:", error);
					return json(
						{
							error: "Failed to check for existing branch",
							details: error instanceof Error ? error.message : "Unknown error",
						},
						{ status: 500 },
					);
				}
			},
			POST: async ({ request, params }) => {
				try {
					// Validate session
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const parentStoryId = params.id;

					// Parse request body
					const body = await request.json();
					const parseResult = branchSchema.safeParse(body);

					if (!parseResult.success) {
						return json(
							{
								error: "Invalid request data",
								details: parseResult.error.format(),
							},
							{ status: 400 },
						);
					}

					const { sceneNumber, choicePointId, newChoice } = parseResult.data;

					// Create the branched story
					const newStoryId = await branchStory(
						parentStoryId,
						session.userId,
						sceneNumber,
						choicePointId,
						newChoice,
					);

					return json({
						success: true,
						storyId: newStoryId,
					});
				} catch (error) {
					console.error("Error branching story:", error);
					return json(
						{
							error: "Failed to branch story",
							details: error instanceof Error ? error.message : "Unknown error",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
