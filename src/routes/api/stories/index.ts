import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { z } from "zod";
import { getSessionFromRequest } from "~/lib/auth/session";
import { createUserStory } from "~/lib/db/queries/stories";
import { validateTropeKeys } from "~/lib/db/queries/tropes";
import {
	GENRES,
	PACING_OPTIONS,
	POV_CHARACTER_GENDER_OPTIONS,
	SCENE_LENGTH_OPTIONS,
	type SpiceLevel,
} from "~/lib/types/preferences";

const createStorySchema = z.object({
	templateId: z.string().uuid(),
	storyTitle: z.string().max(255).optional(),
	preferences: z
		.object({
			genres: z.array(z.enum(GENRES)),
			tropes: z.array(z.string()),
			spiceLevel: z.number().int().min(1).max(5) as z.ZodType<SpiceLevel>,
			pacing: z.enum(PACING_OPTIONS),
			sceneLength: z.enum(SCENE_LENGTH_OPTIONS).optional(),
			povCharacterGender: z.enum(POV_CHARACTER_GENDER_OPTIONS).optional(),
		})
		.optional(),
});

export const Route = createFileRoute("/api/stories/")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					const body = await request.json();
					const result = createStorySchema.safeParse(body);

					if (!result.success) {
						return json(
							{ error: "Invalid request data", details: result.error.issues },
							{ status: 400 },
						);
					}

					const { templateId, storyTitle, preferences } = result.data;

					// Validate tropes if present
					if (preferences?.tropes) {
						const { valid, invalidKeys } = await validateTropeKeys(
							preferences.tropes,
						);
						if (!valid) {
							return json(
								{ error: `Invalid tropes: ${invalidKeys.join(", ")}` },
								{ status: 400 },
							);
						}
					}

					// Create the user story with optional preference overrides and custom title
					const story = await createUserStory(
						session.userId,
						templateId,
						preferences || null,
						storyTitle,
					);

					return json(
						{ story },
						{
							status: 201,
						},
					);
				} catch (error) {
					console.error("Error creating story:", error);
					return json(
						{ error: "Failed to create story" },
						{
							status: 500,
						},
					);
				}
			},
		},
	},
});
