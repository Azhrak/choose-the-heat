import { db } from '~/lib/db'

/**
 * Get a cached scene
 */
export async function getCachedScene(storyId: string, sceneNumber: number) {
  return db
    .selectFrom('scenes')
    .selectAll()
    .where('story_id', '=', storyId)
    .where('scene_number', '=', sceneNumber)
    .executeTakeFirst()
}

/**
 * Cache a generated scene
 */
export async function cacheScene(
  storyId: string,
  sceneNumber: number,
  content: string
) {
  const wordCount = content.split(/\s+/).length

  return db
    .insertInto('scenes')
    .values({
      story_id: storyId,
      scene_number: sceneNumber,
      content,
      word_count: wordCount,
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

/**
 * Get all scenes for a story (for re-reading)
 */
export async function getStoryScenes(storyId: string) {
  return db
    .selectFrom('scenes')
    .selectAll()
    .where('story_id', '=', storyId)
    .orderBy('scene_number', 'asc')
    .execute()
}

/**
 * Get the last N scenes for context
 */
export async function getRecentScenes(storyId: string, count: number) {
  const scenes = await db
    .selectFrom('scenes')
    .selectAll()
    .where('story_id', '=', storyId)
    .orderBy('scene_number', 'desc')
    .limit(count)
    .execute()

  // Reverse to get chronological order
  return scenes.reverse()
}

/**
 * Delete all scenes for a story (if restarting)
 */
export async function deleteStoryScenes(storyId: string) {
  return db.deleteFrom('scenes').where('story_id', '=', storyId).execute()
}

/**
 * Get story statistics
 */
export async function getStoryStats(storyId: string) {
  const result = await db
    .selectFrom('scenes')
    .select((eb) => [
      eb.fn.count('id').as('sceneCount'),
      eb.fn.sum('word_count').as('totalWords'),
    ])
    .where('story_id', '=', storyId)
    .executeTakeFirst()

  return {
    sceneCount: Number(result?.sceneCount || 0),
    totalWords: Number(result?.totalWords || 0),
  }
}
