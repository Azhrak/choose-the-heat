import type { SceneMetadata } from "~/lib/ai/prompts";
import { db } from "~/lib/db";

/**
 * Get a cached scene
 */
export async function getCachedScene(storyId: string, sceneNumber: number) {
	return db
		.selectFrom("scenes")
		.selectAll()
		.where("story_id", "=", storyId)
		.where("scene_number", "=", sceneNumber)
		.executeTakeFirst();
}

/**
 * Cache a generated scene (with duplicate handling)
 */
export async function cacheScene(
	storyId: string,
	sceneNumber: number,
	content: string,
	metadata: SceneMetadata | null = null,
	summary: string | null = null,
) {
	const wordCount = content.split(/\s+/).length;

	try {
		return await db
			.insertInto("scenes")
			.values({
				story_id: storyId,
				scene_number: sceneNumber,
				content,
				word_count: wordCount,
				metadata: metadata ? JSON.stringify(metadata) : null,
				summary,
			})
			.returning("id")
			.executeTakeFirstOrThrow();
	} catch (error: unknown) {
		// If duplicate, just return - the scene is already cached
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "23505"
		) {
			// Duplicate key error code
			return null;
		}
		throw error;
	}
}

/**
 * Get all scenes for a story (for re-reading)
 */
export async function getStoryScenes(storyId: string) {
	return db
		.selectFrom("scenes")
		.selectAll()
		.where("story_id", "=", storyId)
		.orderBy("scene_number", "asc")
		.execute();
}

/**
 * Get the last N scenes for context
 * Returns full scene content and metadata for context passing
 */
export async function getRecentScenes(storyId: string, count: number) {
	const scenes = await db
		.selectFrom("scenes")
		.select(["scene_number", "summary", "content", "metadata"])
		.where("story_id", "=", storyId)
		.orderBy("scene_number", "desc")
		.limit(count)
		.execute();

	// Reverse to get chronological order
	// Return full content for better AI consistency
	return scenes.reverse().map((scene) => ({
		scene_number: scene.scene_number,
		// Use full content for better context and consistency
		content: scene.content,
		metadata: scene.metadata as SceneMetadata | null,
	}));
}

/**
 * Delete all scenes for a story (if restarting)
 */
export async function deleteStoryScenes(storyId: string) {
	return db.deleteFrom("scenes").where("story_id", "=", storyId).execute();
}

/**
 * Delete a specific scene (for regeneration)
 */
export async function deleteScene(storyId: string, sceneNumber: number) {
	return db
		.deleteFrom("scenes")
		.where("story_id", "=", storyId)
		.where("scene_number", "=", sceneNumber)
		.execute();
}

/**
 * Get story statistics
 */
export async function getStoryStats(storyId: string) {
	const result = await db
		.selectFrom("scenes")
		.select((eb) => [
			eb.fn.count("id").as("sceneCount"),
			eb.fn.sum("word_count").as("totalWords"),
		])
		.where("story_id", "=", storyId)
		.executeTakeFirst();

	return {
		sceneCount: Number(result?.sceneCount || 0),
		totalWords: Number(result?.totalWords || 0),
	};
}

/**
 * Get scene metadata for a specific scene
 */
export async function getSceneMetadata(
	storyId: string,
	sceneNumber: number,
): Promise<SceneMetadata | null> {
	const scene = await db
		.selectFrom("scenes")
		.select("metadata")
		.where("story_id", "=", storyId)
		.where("scene_number", "=", sceneNumber)
		.executeTakeFirst();

	if (!scene?.metadata) {
		return null;
	}

	return scene.metadata as SceneMetadata;
}

/**
 * Get all metadata for a story (for analysis/progression tracking)
 */
export async function getStoryMetadataProgression(storyId: string) {
	const scenes = await db
		.selectFrom("scenes")
		.select(["scene_number", "metadata", "summary"])
		.where("story_id", "=", storyId)
		.orderBy("scene_number", "asc")
		.execute();

	return scenes.map((scene) => ({
		scene_number: scene.scene_number,
		metadata: scene.metadata as SceneMetadata | null,
		summary: scene.summary,
	}));
}
