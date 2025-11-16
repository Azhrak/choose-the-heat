import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import type { StoryStatus } from "~/lib/api/types";
import { db } from "~/lib/db";
import type { UserPreferences } from "~/lib/types/preferences";

/**
 * Get all novel templates
 */
export async function getAllNovelTemplates() {
	return db
		.selectFrom("novel_templates")
		.selectAll()
		.orderBy("created_at", "desc")
		.execute();
}

/**
 * Get a single novel template with choice points
 */
export async function getNovelTemplateWithChoices(templateId: string) {
	return db
		.selectFrom("novel_templates as nt")
		.selectAll("nt")
		.select((eb) => [
			jsonArrayFrom(
				eb
					.selectFrom("choice_points")
					.selectAll()
					.whereRef("template_id", "=", "nt.id")
					.orderBy("scene_number", "asc"),
			).as("choicePoints"),
		])
		.where("nt.id", "=", templateId)
		.executeTakeFirst();
}

/**
 * Create a new user story with auto-generated title
 */
export async function createUserStory(
	userId: string,
	templateId: string,
	preferences: UserPreferences | null,
	customTitle?: string,
) {
	// Get template title for auto-generation
	const template = await db
		.selectFrom("novel_templates")
		.select("title")
		.where("id", "=", templateId)
		.executeTakeFirst();

	if (!template) {
		throw new Error("Template not found");
	}

	let storyTitle = customTitle;

	// Auto-generate title if not provided
	if (!storyTitle) {
		// Get all existing stories from this template by this user
		const existingStories = await db
			.selectFrom("user_stories")
			.where("user_id", "=", userId)
			.where("template_id", "=", templateId)
			.select("story_title")
			.execute();

		if (existingStories.length === 0) {
			// First story: use template title as-is
			storyTitle = template.title;
		} else {
			// Find the highest number in existing titles
			let maxNumber = 0;
			const numberPattern = new RegExp(
				`^${template.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} #(\\d+)$`,
			);

			for (const story of existingStories) {
				if (!story.story_title) continue;

				// Check if this is the base title without a number
				if (story.story_title === template.title) {
					maxNumber = Math.max(maxNumber, 1);
				} else {
					// Try to extract number from title
					const match = story.story_title.match(numberPattern);
					if (match?.[1]) {
						maxNumber = Math.max(maxNumber, Number.parseInt(match[1], 10));
					}
				}
			}

			// Generate next number
			const nextNumber = maxNumber + 1;
			storyTitle = `${template.title} #${nextNumber}`;
		}
	}

	return db
		.insertInto("user_stories")
		.values({
			user_id: userId,
			template_id: templateId,
			story_title: storyTitle,
			preferences: JSON.stringify(preferences),
			current_scene: 1,
			status: "in-progress",
		})
		.returning([
			"id",
			"user_id",
			"template_id",
			"story_title",
			"current_scene",
			"status",
		])
		.executeTakeFirstOrThrow();
}

/**
 * Get user's stories with template info
 */
export async function getUserStories(userId: string, status?: StoryStatus) {
	let query = db
		.selectFrom("user_stories as us")
		.selectAll("us")
		.select((eb) => [
			jsonObjectFrom(
				eb
					.selectFrom("novel_templates")
					.selectAll()
					.whereRef("id", "=", "us.template_id"),
			).as("template"),
			jsonObjectFrom(
				eb
					.selectFrom("user_stories as parent")
					.select(["parent.id", "parent.story_title"])
					.whereRef("parent.id", "=", "us.branched_from_story_id"),
			).as("parentStory"),
		])
		.where("us.user_id", "=", userId);

	if (status) {
		query = query.where("us.status", "=", status);
	}

	return query.orderBy("us.updated_at", "desc").execute();
}

/**
 * Get a single story with full details
 */
export async function getStoryWithDetails(storyId: string, userId: string) {
	return db
		.selectFrom("user_stories as us")
		.selectAll("us")
		.select((eb) => [
			jsonObjectFrom(
				eb
					.selectFrom("novel_templates")
					.selectAll()
					.whereRef("id", "=", "us.template_id"),
			).as("template"),
			jsonArrayFrom(
				eb
					.selectFrom("choices as c")
					.innerJoin("choice_points as cp", "c.choice_point_id", "cp.id")
					.select([
						"c.id",
						"c.selected_option",
						"c.created_at",
						"cp.scene_number",
						"cp.prompt_text",
						"cp.options",
					])
					.whereRef("c.story_id", "=", "us.id")
					.orderBy("c.created_at", "asc"),
			).as("choices"),
		])
		.where("us.id", "=", storyId)
		.where("us.user_id", "=", userId)
		.executeTakeFirst();
}

/**
 * Update story progress
 */
export async function updateStoryProgress(
	storyId: string,
	currentScene: number,
	status?: StoryStatus,
) {
	return db
		.updateTable("user_stories")
		.set({
			current_scene: currentScene,
			...(status && { status }),
			updated_at: new Date(),
		})
		.where("id", "=", storyId)
		.execute();
}

/**
 * Record a choice
 */
export async function recordChoice(
	storyId: string,
	choicePointId: string,
	selectedOption: number,
) {
	return db
		.insertInto("choices")
		.values({
			story_id: storyId,
			choice_point_id: choicePointId,
			selected_option: selectedOption,
		})
		.returning("id")
		.executeTakeFirstOrThrow();
}

/**
 * Get choice point for a scene
 */
export async function getChoicePointForScene(
	templateId: string,
	sceneNumber: number,
) {
	return db
		.selectFrom("choice_points")
		.selectAll()
		.where("template_id", "=", templateId)
		.where("scene_number", "=", sceneNumber)
		.executeTakeFirst();
}

/**
 * Get a story by ID with template info
 */
export async function getStoryById(storyId: string) {
	return db
		.selectFrom("user_stories as us")
		.selectAll("us")
		.select((eb) => [
			jsonObjectFrom(
				eb
					.selectFrom("novel_templates")
					.selectAll()
					.whereRef("id", "=", "us.template_id"),
			).as("template"),
		])
		.where("us.id", "=", storyId)
		.executeTakeFirst();
}

/**
 * Delete a user story and all associated data
 * This will cascade delete: scenes, choices, and any other related data
 */
export async function deleteUserStory(storyId: string, userId: string) {
	// Verify ownership before deleting
	const story = await db
		.selectFrom("user_stories")
		.select(["id", "user_id"])
		.where("id", "=", storyId)
		.where("user_id", "=", userId)
		.executeTakeFirst();

	if (!story) {
		throw new Error("Story not found or access denied");
	}

	// Delete the story (cascading will handle related records)
	const result = await db
		.deleteFrom("user_stories")
		.where("id", "=", storyId)
		.where("user_id", "=", userId)
		.executeTakeFirst();

	return result.numDeletedRows > 0n;
}

/**
 * Check if a branch already exists from a specific scene with a specific choice
 */
export async function findExistingBranch(
	parentStoryId: string,
	userId: string,
	branchAtScene: number,
	choicePointId: string,
	choiceOption: number,
) {
	// Find branches from this parent story at this scene
	const existingBranches = await db
		.selectFrom("user_stories as us")
		.select(["us.id", "us.story_title"])
		.where("us.user_id", "=", userId)
		.where("us.branched_from_story_id", "=", parentStoryId)
		.where("us.branched_at_scene", "=", branchAtScene)
		.execute();

	if (existingBranches.length === 0) {
		return null;
	}

	// Check each branch to see if it has the same choice at the branch point
	for (const branch of existingBranches) {
		const choice = await db
			.selectFrom("choices")
			.select("selected_option")
			.where("story_id", "=", branch.id)
			.where("choice_point_id", "=", choicePointId)
			.executeTakeFirst();

		if (choice && choice.selected_option === choiceOption) {
			return {
				id: branch.id,
				story_title: branch.story_title,
			};
		}
	}

	return null;
}

/**
 * Branch a story from a specific scene with a different choice
 * Creates a new story that copies all scenes and choices up to the branch point,
 * then records a different choice and continues from there
 */
export async function branchStory(
	parentStoryId: string,
	userId: string,
	branchAtScene: number,
	choicePointId: string,
	newChoice: number,
): Promise<string> {
	// Get the parent story
	const parentStory = await getStoryById(parentStoryId);

	if (!parentStory) {
		throw new Error("Parent story not found");
	}

	if (parentStory.user_id !== userId) {
		throw new Error("Unauthorized to branch this story");
	}

	if (!parentStory.template) {
		throw new Error("Parent story template not found");
	}

	// Verify the choice point exists and is at the branch scene
	const choicePoint = await db
		.selectFrom("choice_points")
		.selectAll()
		.where("id", "=", choicePointId)
		.where("template_id", "=", parentStory.template_id)
		.where("scene_number", "=", branchAtScene)
		.executeTakeFirst();

	if (!choicePoint) {
		throw new Error("Choice point not found at specified scene");
	}

	// Verify the new choice is valid
	const options = choicePoint.options as Array<{ text: string }>;
	if (newChoice < 0 || newChoice >= options.length) {
		throw new Error("Invalid choice option");
	}

	// Get the previous choice at this scene (if any)
	const previousChoice = await db
		.selectFrom("choices")
		.select("selected_option")
		.where("story_id", "=", parentStoryId)
		.where("choice_point_id", "=", choicePointId)
		.executeTakeFirst();

	// Verify the new choice is different from the previous choice
	if (previousChoice && previousChoice.selected_option === newChoice) {
		throw new Error("New choice must be different from the original choice");
	}

	// Generate a title for the branched story
	const branchTitle = `${parentStory.story_title || parentStory.template.title} (Branch)`;

	// Create the new branched story
	const newStory = await db
		.insertInto("user_stories")
		.values({
			user_id: userId,
			template_id: parentStory.template_id,
			story_title: branchTitle,
			preferences: parentStory.preferences,
			current_scene: branchAtScene + 1, // Start at the scene after the branch
			status: "in-progress",
			branched_from_story_id: parentStoryId,
			branched_at_scene: branchAtScene,
		})
		.returning("id")
		.executeTakeFirstOrThrow();

	const newStoryId = newStory.id;

	// Copy all scenes up to and including the branch scene
	const scenesToCopy = await db
		.selectFrom("scenes")
		.selectAll()
		.where("story_id", "=", parentStoryId)
		.where("scene_number", "<=", branchAtScene)
		.execute();

	if (scenesToCopy.length > 0) {
		await db
			.insertInto("scenes")
			.values(
				scenesToCopy.map((scene) => ({
					story_id: newStoryId,
					scene_number: scene.scene_number,
					content: scene.content,
					word_count: scene.word_count,
					metadata: scene.metadata,
					summary: scene.summary,
				})),
			)
			.execute();
	}

	// Copy all choices up to (but not including) the branch scene
	const choicesToCopy = await db
		.selectFrom("choices as c")
		.innerJoin("choice_points as cp", "c.choice_point_id", "cp.id")
		.select(["c.choice_point_id", "c.selected_option"])
		.where("c.story_id", "=", parentStoryId)
		.where("cp.scene_number", "<", branchAtScene)
		.execute();

	if (choicesToCopy.length > 0) {
		await db
			.insertInto("choices")
			.values(
				choicesToCopy.map((choice) => ({
					story_id: newStoryId,
					choice_point_id: choice.choice_point_id,
					selected_option: choice.selected_option,
				})),
			)
			.execute();
	}

	// Record the new choice at the branch point
	await recordChoice(newStoryId, choicePointId, newChoice);

	return newStoryId;
}
