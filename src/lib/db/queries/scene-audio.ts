import type { Insertable, Selectable, Updateable } from "kysely";
import { sql } from "kysely";
import { db } from "~/lib/db";
import type { SceneAudio } from "../types";

export type SceneAudioRow = Selectable<SceneAudio>;
export type SceneAudioInsert = Insertable<SceneAudio>;
export type SceneAudioUpdate = Updateable<SceneAudio>;

/**
 * Get audio for a specific scene
 */
export async function getSceneAudio(
	storyId: string,
	sceneNumber: number,
): Promise<SceneAudioRow | undefined> {
	return db
		.selectFrom("scene_audio")
		.selectAll()
		.where("story_id", "=", storyId)
		.where("scene_number", "=", sceneNumber)
		.executeTakeFirst();
}

/**
 * Check if audio exists for a scene
 */
export async function hasSceneAudio(
	storyId: string,
	sceneNumber: number,
): Promise<boolean> {
	const result = await db
		.selectFrom("scene_audio")
		.select("id")
		.where("story_id", "=", storyId)
		.where("scene_number", "=", sceneNumber)
		.executeTakeFirst();

	return !!result;
}

/**
 * Save scene audio metadata
 */
export async function saveSceneAudio(
	data: SceneAudioInsert,
): Promise<SceneAudioRow> {
	return db
		.insertInto("scene_audio")
		.values(data)
		.onConflict((oc) =>
			oc.columns(["story_id", "scene_number"]).doUpdateSet({
				audio_url: data.audio_url,
				file_size: data.file_size,
				duration: data.duration,
				tts_provider: data.tts_provider,
				voice_id: data.voice_id,
				voice_name: data.voice_name,
				generated_at: sql`CURRENT_TIMESTAMP`,
			}),
		)
		.returningAll()
		.executeTakeFirstOrThrow();
}

/**
 * Delete scene audio
 */
export async function deleteSceneAudio(
	storyId: string,
	sceneNumber: number,
): Promise<void> {
	await db
		.deleteFrom("scene_audio")
		.where("story_id", "=", storyId)
		.where("scene_number", "=", sceneNumber)
		.execute();
}

/**
 * Get all audio for a story
 */
export async function getStoryAudio(storyId: string): Promise<SceneAudioRow[]> {
	return db
		.selectFrom("scene_audio")
		.selectAll()
		.where("story_id", "=", storyId)
		.orderBy("scene_number", "asc")
		.execute();
}

/**
 * Delete all audio for a story
 */
export async function deleteStoryAudio(storyId: string): Promise<number> {
	const result = await db
		.deleteFrom("scene_audio")
		.where("story_id", "=", storyId)
		.executeTakeFirst();

	return Number(result.numDeletedRows);
}
