import { generateCompletion } from './client'
import { buildSystemPrompt, buildScenePrompt, type StoryPreferences } from './prompts'
import {
  getCachedScene,
  cacheScene,
  getRecentScenes,
} from '~/lib/db/queries/scenes'
import { getChoicePointForScene } from '~/lib/db/queries/stories'

/**
 * Context needed for scene generation
 */
export interface GenerateSceneContext {
  storyId: string
  templateId: string
  templateTitle: string
  sceneNumber: number
  estimatedScenes: number
  preferences: StoryPreferences
  lastChoice?: {
    text: string
    tone: string
  }
}

/**
 * Generate a scene for a story
 * Uses cache if available, otherwise generates new content
 */
export async function generateScene(
  context: GenerateSceneContext
): Promise<{ content: string; cached: boolean }> {
  const {
    storyId,
    templateId,
    templateTitle,
    sceneNumber,
    estimatedScenes,
    preferences,
    lastChoice,
  } = context

  // Check cache first
  const cachedScene = await getCachedScene(storyId, sceneNumber)

  if (cachedScene) {
    return {
      content: cachedScene.content,
      cached: true,
    }
  }

  // Get recent scenes for context (last 2 scenes)
  const recentScenes = await getRecentScenes(storyId, 2)
  const previousSceneContents = recentScenes.map((s) => s.content)

  // Check if there's a choice point at this scene
  const choicePoint = await getChoicePointForScene(templateId, sceneNumber)

  // Build prompts
  const systemPrompt = buildSystemPrompt(preferences)
  const userPrompt = buildScenePrompt({
    templateTitle,
    sceneNumber,
    previousScenes: previousSceneContents,
    lastChoice,
    choicePoint: choicePoint
      ? {
          sceneNumber: choicePoint.scene_number,
          promptText: choicePoint.prompt_text,
        }
      : undefined,
    estimatedScenes,
  })

  // Generate with OpenAI
  const content = await generateCompletion(systemPrompt, userPrompt, {
    temperature: 0.8, // Higher temperature for more creative writing
    maxTokens: 2000, // ~1500 words
  })

  // Cache the generated scene
  await cacheScene(storyId, sceneNumber, content)

  return {
    content,
    cached: false,
  }
}

/**
 * Validate that a scene meets quality standards
 */
export function validateScene(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  const wordCount = content.split(/\s+/).length

  if (wordCount < 500) {
    errors.push('Scene is too short (minimum 500 words)')
  }

  if (wordCount > 2000) {
    errors.push('Scene is too long (maximum 2000 words)')
  }

  if (content.includes('[') || content.includes(']')) {
    errors.push('Scene contains placeholder text')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
