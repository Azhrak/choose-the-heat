/**
 * Preferences for story generation
 */
export interface StoryPreferences {
  genres: string[]
  tropes: string[]
  spiceLevel: 1 | 2 | 3 | 4 | 5
  pacing: 'slow-burn' | 'fast-paced'
  protagonistTraits?: string[]
  settingPreferences?: string[]
}

/**
 * Build system prompt for romance novelist AI
 */
export function buildSystemPrompt(preferences: StoryPreferences): string {
  const { genres, tropes, spiceLevel, pacing } = preferences

  const spiceDescription = {
    1: 'sweet and clean with no explicit content',
    2: 'mild romantic tension with minimal physical intimacy',
    3: 'moderate sensuality with some physical intimacy',
    4: 'steamy with detailed romantic scenes',
    5: 'very explicit with detailed intimate content',
  }

  const pacingDescription = {
    'slow-burn': 'Develop the relationship gradually with careful attention to emotional build-up and tension',
    'fast-paced': 'Move the relationship forward with engaging momentum and quick chemistry',
  }

  return `You are an expert romance novelist specializing in ${genres.join(', ')} romance.

WRITING STYLE:
- Write in third-person limited perspective
- Use vivid, sensory details and emotional depth
- Balance dialogue, action, and internal thoughts
- Create compelling romantic tension
- ${pacingDescription[pacing]}

STORY ELEMENTS:
- Incorporate these tropes naturally: ${tropes.join(', ')}
- Heat level: ${spiceLevel}/5 (${spiceDescription[spiceLevel]})
- Focus on character development and emotional connection
- Build chemistry through meaningful interactions

FORMATTING:
- Write 800-1200 words per scene
- Use clear paragraph breaks for readability
- End scenes with emotional hooks or questions
- Maintain consistent character voices throughout

Remember: Every word should serve the romance. Show don't tell emotions, build anticipation, and make readers care deeply about whether these characters find their happily ever after.`
}

/**
 * Build user prompt for a specific scene
 */
export function buildScenePrompt(params: {
  templateTitle: string
  sceneNumber: number
  previousScenes?: string[]
  lastChoice?: {
    text: string
    tone: string
  }
  choicePoint?: {
    sceneNumber: number
    promptText: string
  }
  estimatedScenes: number
}): string {
  const {
    templateTitle,
    sceneNumber,
    previousScenes = [],
    lastChoice,
    choicePoint,
    estimatedScenes,
  } = params

  let prompt = `Story: "${templateTitle}"\nCurrent Scene: ${sceneNumber} of approximately ${estimatedScenes}\n\n`

  // Add context from previous scenes
  if (previousScenes.length > 0) {
    prompt += `RECENT CONTEXT:\n`
    previousScenes.forEach((scene, index) => {
      const sceneNum = sceneNumber - previousScenes.length + index
      prompt += `\nScene ${sceneNum} summary:\n${scene.slice(0, 300)}...\n`
    })
    prompt += `\n`
  }

  // Add last choice context
  if (lastChoice) {
    prompt += `PREVIOUS CHOICE:\nThe protagonist chose to: "${lastChoice.text}" (${lastChoice.tone} tone)\n`
    prompt += `Reflect this choice's impact in how the scene unfolds.\n\n`
  }

  // Story progression guidance
  if (sceneNumber === 1) {
    prompt += `SCENE FOCUS: Opening scene - introduce the protagonist and their world, establish the inciting incident that will lead to the romance.\n\n`
  } else if (sceneNumber <= Math.floor(estimatedScenes * 0.3)) {
    prompt += `SCENE FOCUS: Early story - develop the meet-cute or initial conflict, establish chemistry and obstacles.\n\n`
  } else if (sceneNumber <= Math.floor(estimatedScenes * 0.7)) {
    prompt += `SCENE FOCUS: Rising tension - deepen the relationship, increase romantic tension, develop subplot conflicts.\n\n`
  } else if (sceneNumber < estimatedScenes) {
    prompt += `SCENE FOCUS: Building to climax - heighten emotional stakes, bring conflicts to a head, prepare for resolution.\n\n`
  } else {
    prompt += `SCENE FOCUS: Resolution - deliver the emotional climax and happily ever after that readers crave.\n\n`
  }

  // Add choice point reminder
  if (choicePoint && choicePoint.sceneNumber === sceneNumber) {
    prompt += `IMPORTANT: End this scene with a natural pause before: "${choicePoint.promptText}"\nSet up the decision without resolving it.\n\n`
  }

  prompt += `Write scene ${sceneNumber} now (800-1200 words):`

  return prompt
}

/**
 * Extract summary from a scene (for context in next scene)
 */
export function extractSceneSummary(sceneContent: string): string {
  // Take first 300 characters as a simple summary
  // In production, you might use AI to generate a proper summary
  return sceneContent.slice(0, 300)
}
