import {
	cacheScene,
	getCachedScene,
	getRecentScenes,
} from "~/lib/db/queries/scenes";
import {
	getChoicePointForScene,
	updateStoryAISettings,
} from "~/lib/db/queries/stories";
import { generateCompletion } from "./client";
import { getAIConfig, getAIConfigForStory } from "./config";
import {
	buildScenePrompt,
	buildSystemPrompt,
	getSceneLengthRange,
	parseSceneMeta,
	type StoryPreferences,
} from "./prompts";

/**
 * Context needed for scene generation
 */
export interface GenerateSceneContext {
	storyId: string;
	templateId: string;
	templateTitle: string;
	sceneNumber: number;
	estimatedScenes: number;
	preferences: StoryPreferences;
	lastChoice?: {
		text: string;
		tone: string;
	};
	aiProvider?: string | null;
	aiModel?: string | null;
	aiTemperature?: string | number | null;
}

/**
 * Generate a scene for a story
 * Uses cache if available, otherwise generates new content
 */
export async function generateScene(
	context: GenerateSceneContext,
): Promise<{ content: string; cached: boolean }> {
	const {
		storyId,
		templateId,
		templateTitle,
		sceneNumber,
		estimatedScenes,
		preferences,
		lastChoice,
		aiProvider,
		aiModel,
		aiTemperature,
	} = context;

	// Get AI config for this story (with fallback to current settings)
	const aiConfig = await getAIConfigForStory(
		aiProvider,
		aiModel,
		aiTemperature,
	);

	// If this is the first scene and the story doesn't have AI settings saved yet,
	// save the current AI settings to the story
	if (sceneNumber === 1 && (!aiProvider || !aiModel)) {
		const currentConfig = await getAIConfig();
		await updateStoryAISettings(storyId, {
			provider: currentConfig.provider,
			model: currentConfig.model,
			temperature: currentConfig.temperature,
		});
		console.log(
			`[Scene Generation] Saved AI settings to story: ${currentConfig.provider} / ${currentConfig.model} / temp=${currentConfig.temperature}`,
		);
	}

	// Log scene length preference
	console.log(
		`[Scene Generation] Story: ${storyId}, Scene: ${sceneNumber}, Scene Length Preference: ${preferences.sceneLength || "not set (defaulting to medium)"}`,
	);
	console.log("[Scene Generation] Full preferences:", preferences);

	// Check cache first
	const cachedScene = await getCachedScene(storyId, sceneNumber);

	if (cachedScene) {
		console.log(
			`[Scene Generation] Using cached scene ${sceneNumber} (${cachedScene.word_count} words)`,
		);
		return {
			content: cachedScene.content,
			cached: true,
		};
	}

	// Get recent scenes for context (last 2 scenes)
	const recentScenes = await getRecentScenes(storyId, 2);
	const previousSceneContents = recentScenes.map((s) => s.content);
	const previousMetadata = recentScenes
		.map((s) => s.metadata)
		.filter((m): m is NonNullable<typeof m> => m !== null);

	// Check if there's a choice point at this scene
	const choicePoint = await getChoicePointForScene(templateId, sceneNumber);

	// Build prompts
	const systemPrompt = await buildSystemPrompt(preferences);
	const userPrompt = buildScenePrompt({
		templateTitle,
		sceneNumber,
		previousScenes: previousSceneContents,
		previousMetadata,
		lastChoice,
		choicePoint: choicePoint
			? {
					sceneNumber: choicePoint.scene_number,
					promptText: choicePoint.prompt_text,
				}
			: undefined,
		estimatedScenes,
		sceneLength: preferences.sceneLength,
	});

	// Log the prompts being sent
	console.log("\n=== SYSTEM PROMPT ===");
	console.log(`${systemPrompt.substring(0, 500)}...`);
	console.log("\n=== USER PROMPT ===");
	console.log(userPrompt);
	console.log("=== END PROMPTS ===\n");

	// Generate with AI (using story-specific config or current settings)
	const content = await generateCompletion(systemPrompt, userPrompt, {
		config: aiConfig,
	});

	// Parse content and extract metadata
	const parsed = parseSceneMeta(content);

	// Log generated content stats
	const generatedWordCount = parsed.content.split(/\s+/).length;
	console.log(
		`[Scene Generation] Generated scene ${sceneNumber}: ${generatedWordCount} words`,
	);

	// Calculate phase for validation
	const phaseRatio = sceneNumber / estimatedScenes;
	let phase: string;
	if (sceneNumber === 1) {
		phase = "Opening";
	} else if (phaseRatio <= 0.3) {
		phase = "Early Development";
	} else if (phaseRatio <= 0.7) {
		phase = "Rising Tension";
	} else if (sceneNumber < estimatedScenes) {
		phase = "Pre-Climax";
	} else {
		phase = "Resolution";
	}

	// Validate scene length
	const validation = validateScene(
		parsed.content,
		preferences,
		phase,
		sceneNumber,
	);

	const expectedRange = getSceneLengthRange(
		preferences.sceneLength,
		phase,
		sceneNumber,
	);
	console.log(
		`[Scene Generation] Expected range: ${expectedRange.min}-${expectedRange.max} words, Got: ${generatedWordCount} words`,
	);

	if (validation.warnings.length > 0) {
		console.warn(
			`Scene ${sceneNumber} validation warnings:`,
			validation.warnings,
		);
	}

	if (!validation.valid) {
		console.error(`Scene ${sceneNumber} validation errors:`, validation.errors);
	}

	// Cache the generated scene with metadata and summary
	await cacheScene(
		storyId,
		sceneNumber,
		parsed.content,
		parsed.metadata,
		parsed.summary,
	);

	return {
		content: parsed.content,
		cached: false,
	};
}

/**
 * Validate that a scene meets quality standards
 */
export function validateScene(
	content: string,
	preferences: StoryPreferences,
	phase: string,
	sceneNumber: number,
): {
	valid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	const wordCount = content.split(/\s+/).length;

	// Get expected range based on preferences
	const { min, max } = getSceneLengthRange(
		preferences.sceneLength,
		phase,
		sceneNumber,
	);

	// Hard limits for any scene
	if (wordCount < 400) {
		errors.push("Scene is too short (minimum 400 words)");
	}

	if (wordCount > 2000) {
		errors.push("Scene is too long (maximum 2000 words)");
	}

	// Warnings for preference violations
	if (wordCount < min) {
		warnings.push(
			`Scene is shorter than requested (${wordCount} words, expected ${min}-${max})`,
		);
	}

	if (wordCount > max) {
		warnings.push(
			`Scene is longer than requested (${wordCount} words, expected ${min}-${max})`,
		);
	}

	if (content.includes("[") || content.includes("]")) {
		errors.push("Scene contains placeholder text");
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}
