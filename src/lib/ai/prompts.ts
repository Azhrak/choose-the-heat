import { getSettingsMap } from "../db/queries/settings";
import { getGenderGuidance, selectCharacterName } from "./character-names";

/**
 * Preferences for story generation
 */
export interface StoryPreferences {
	genres: string[];
	tropes: string[];
	spiceLevel: 1 | 2 | 3 | 4 | 5;
	pacing: "slow-burn" | "fast-paced";
	sceneLength?: "short" | "medium" | "long" | number; // preset or custom word count
	povCharacterGender?:
		| "male"
		| "female"
		| "non-binary"
		| "genderqueer"
		| "trans-man"
		| "trans-woman"
		| "agender"
		| "genderfluid";
	protagonistTraits?: string[];
	settingPreferences?: string[];
	protagonistName?: string; // Optional override - if not provided, auto-selected from name lists
}

/**
 * Prompt settings cache
 */
interface PromptSettingsCache {
	data: Record<string, string> | null;
	timestamp: number;
}

const promptCache: PromptSettingsCache = {
	data: null,
	timestamp: 0,
};

const PROMPT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get prompt settings from database with caching
 */
async function getPromptSettings(): Promise<Record<string, string>> {
	const now = Date.now();
	if (promptCache.data && now - promptCache.timestamp < PROMPT_CACHE_TTL) {
		return promptCache.data;
	}

	try {
		const settings = await getSettingsMap({ category: "prompts" });
		promptCache.data = settings;
		promptCache.timestamp = now;
		return settings;
	} catch (error) {
		console.error("Failed to load prompt settings:", error);
		return {};
	}
}

/**
 * Get spice level description from settings or fallback to hardcoded
 */
async function getSpiceLevelDescription(
	level: 1 | 2 | 3 | 4 | 5,
): Promise<string> {
	const settings = await getPromptSettings();
	const key = `prompts.spice_level_${level}`;

	// Fallback descriptions
	const fallbacks: Record<number, string> = {
		1: "Sweet / clean: no explicit sensual detail.",
		2: "Mild: romantic tension, light kissing only.",
		3: "Moderate: sensuality, implied intimacy; fade before explicit anatomical detail.",
		4: "Steamy: explicit romantic intimacy with tasteful descriptive detail.",
		5: "Explicit: detailed intimate scenes, emotionally grounded and consensual.",
	};

	return settings[key] || fallbacks[level];
}

/**
 * Get pacing description from settings or fallback to hardcoded
 */
async function getPacingDescription(
	pacing: "slow-burn" | "fast-paced",
): Promise<string> {
	const settings = await getPromptSettings();
	const key = `prompts.pacing_${pacing.replace("-", "_")}`;

	const fallbacks = {
		"slow-burn":
			"Gradual escalation: sustained tension, delayed gratification, layered micro-shifts.",
		"fast-paced":
			"Brisk escalation: rapid chemistry beats, early sparks, tight scene economy.",
	};

	return settings[key] || fallbacks[pacing];
}

/**
 * Get consent rules from settings or fallback to hardcoded
 */
async function getConsentRules(spiceLevel: 1 | 2 | 3 | 4 | 5): Promise<string> {
	const settings = await getPromptSettings();

	if (spiceLevel <= 2) {
		return (
			settings["prompts.consent_rules_1_2"] ||
			"No explicit anatomical descriptions. Keep intimacy implied or restrained."
		);
	}

	if (spiceLevel === 3) {
		return (
			settings["prompts.consent_rules_3"] ||
			"Stop before explicit anatomical detail. Focus on sensory suggestion and emotional resonance."
		);
	}

	if (spiceLevel === 4) {
		return (
			settings["prompts.consent_rules_4"] ||
			"Explicit allowed; maintain emotional context, mutual consent, and aftercare cues when appropriate."
		);
	}

	return (
		settings["prompts.consent_rules_5"] ||
		"Explicit allowed; avoid gratuitous mechanical detail—always tie intimacy to emotion, consent, and character growth."
	);
}

/**
 * Get content safety rules from settings or fallback to hardcoded
 */
async function getContentSafetyRules(): Promise<string> {
	const settings = await getPromptSettings();

	return (
		settings["prompts.content_safety_rules"] ||
		`DO NOT include, depict, or imply ANY of the following:
- Characters under 18 years of age in ANY context (romantic, intimate, or otherwise)
- Ambiguous age references—ALL characters must be explicitly adult (18+)
- Non-consensual sexual acts or coercion of any kind
- Incest or pseudo-incest (step-relations, adoptive, "not blood related" scenarios)
- Bestiality or any non-human romantic/sexual content
- Extreme violence, gore, torture, or sadism
- Glamorized self-harm, suicide ideation, or eating disorders
- Illegal activities presented positively
- Racial, ethnic, or discriminatory stereotypes

ALL romantic and intimate characters MUST be clearly established as adults (minimum 18 years old).
Use contextual cues: career, education completion, independent living, mature decision-making.`
	);
}

/**
 * Build system prompt for romance novelist AI
 */
export async function buildSystemPrompt(
	preferences: StoryPreferences,
): Promise<string> {
	const {
		genres,
		tropes,
		spiceLevel,
		pacing,
		protagonistTraits,
		settingPreferences,
		sceneLength,
		povCharacterGender,
		protagonistName,
	} = preferences;

	// Get configurable descriptions from settings
	const spiceDescription = await getSpiceLevelDescription(spiceLevel);
	const pacingDescription = await getPacingDescription(pacing);
	const consentRules = await getConsentRules(spiceLevel);
	const contentSafetyRules = await getContentSafetyRules();

	const traitLine = protagonistTraits?.length
		? `Primary protagonist traits: ${protagonistTraits.join(", ")}. Reflect through action, micro-thoughts, and subtext (avoid flat exposition).`
		: "(No explicit trait list provided; infer a grounded, multi-dimensional protagonist.)";

	const settingLine = settingPreferences?.length
		? `Setting flavor anchors: ${settingPreferences.join(", ")}. Surface via sensory/environmental texture (sound, light, seasonal or spatial details).`
		: "(Use a grounded, sensorially rich setting appropriate to genre blend.)";

	// POV character gender guidance
	const genderGuidance = povCharacterGender
		? getGenderGuidance(povCharacterGender)
		: "Protagonist gender identity is flexible; establish it naturally through context, pronouns, and character self-perception.";

	// Character name guidance - name should already be set in preferences from story creation
	// If somehow missing, we'll still generate one, but this should be rare
	const selectedName =
		protagonistName || selectCharacterName(povCharacterGender);
	const nameGuidance = selectedName
		? `The protagonist's name is ${selectedName}. Use this name consistently when introducing and referring to the protagonist throughout the story.`
		: "Generate an appropriate name for the protagonist based on the genre and setting.";

	// Scene length guidance
	const lengthGuidance = getSceneLengthGuidance(sceneLength);

	return `You are a professional romance novelist writing high-quality interactive scenes blending: ${genres.join(", ")}.

CRITICAL LENGTH REQUIREMENT:
${lengthGuidance}
This is a STRICT requirement. Do NOT exceed this range under any circumstances.

STYLE & VOICE:
- Third-person limited POV (single POV per scene)
- Show emotions via micro-reactions (breath, temperature shifts, gestures) & context—avoid blunt labels
- Balance: dialogue / internal thought / action / setting (approx 30/25/30/15, flexible)
- Vary sentence rhythm; avoid monotonous clause chains
- ${pacingDescription}

ROMANCE & TENSION:
- Tropes to weave organically (no checklist feel): ${tropes.join(", ")}
- Heat level: ${spiceLevel}/5 (${spiceDescription})
- ${consentRules}
- Consent must be explicit or unmistakably enthusiastic; no coercion or dubious ambiguity

CHARACTER & SETTING:
${traitLine}
${settingLine}
${genderGuidance}
${nameGuidance}

CONTINUITY & ECONOMY:
- CHARACTER TRACKING: When introducing a character for the first time, establish their key traits, appearance, and mannerisms. In subsequent appearances, reference established details and show character evolution rather than restating descriptions.
- POV CONSISTENCY: Maintain single POV per scene. Stay deeply rooted in the POV character's thoughts, perceptions, and emotional responses. Show other characters only through the POV character's observations.
- SETTING CONTINUITY: Ground each scene in a specific location. Build on previously established environmental details. Make location transitions clear and purposeful.
- Avoid redundant backstory recaps; only reference prior events if it advances emotional stakes
- Maintain internal logic from prior scenes and choices
- Track introduced characters, their established traits, and relationship dynamics

PROSE GUARDRAILS:
- BEGIN IMMEDIATELY WITH NARRATIVE PROSE—no preambles, no meta commentary like "Here is a scene..." or "This is a story about..."
- Write ONLY the scene itself—never describe what you're about to write or summarize what you wrote
- No meta commentary about 'the story' or 'this scene'
- No bracketed placeholders
- Descriptive but not purple; metaphors precise & sparing
- Hooks vary (question, sensory sting, unresolved gesture, emotional inversion)
- ADHERE STRICTLY TO WORD COUNT REQUIREMENT (see top of prompt)

CONTENT SAFETY (STRICTLY PROHIBITED):
${contentSafetyRules}

OUTPUT FORMAT:
- Pure narrative only (no outlines, bullet lists, analysis)
- WORD COUNT: Strictly within the specified range at the top of this prompt
- End with a clean hook—no artificial summary

Remember: Advance emotional connection, escalate or deepen tension, reward reader investment with authentic interiority.`;
}

/**
 * Build user prompt for a specific scene
 */
export function buildScenePrompt(params: {
	templateTitle: string;
	sceneNumber: number;
	previousScenes?: string[];
	previousMetadata?: SceneMetadata[]; // Metadata from recent scenes for character/setting context
	lastChoice?: { text: string; tone: string };
	choicePoint?: { sceneNumber: number; promptText: string };
	estimatedScenes: number;
	sceneLength?: "short" | "medium" | "long" | number;
}): string {
	const {
		templateTitle,
		sceneNumber,
		previousScenes = [],
		previousMetadata = [],
		lastChoice,
		choicePoint,
		estimatedScenes,
		sceneLength,
	} = params;

	const phaseRatio = sceneNumber / estimatedScenes;
	let phase: string;
	let objectives: string[];

	if (sceneNumber === 1) {
		phase = "Opening";
		objectives = [
			"Introduce protagonist by name organically (no dossier)",
			"Seed initial unmet desire or vulnerability",
			"Plant first faint spark OR obstacle toward romance",
		];
	} else if (phaseRatio <= 0.3) {
		phase = "Early Development";
		objectives = [
			"Escalate chemistry or friction from prior beat",
			"Reveal subtle personal flaw / conflicting motivation",
			"Introduce minor obstacle foreshadowing deeper conflict",
		];
	} else if (phaseRatio <= 0.7) {
		phase = "Rising Tension";
		objectives = [
			"Sharpen emotional stakes and mutual awareness",
			"Layer complexity: misreads, partial vulnerability",
			"Advance unresolved thread without resolving it",
		];
	} else if (sceneNumber < estimatedScenes) {
		phase = "Pre-Climax";
		objectives = [
			"Tighten pressure on core emotional dilemma",
			"Force protagonist to confront avoided truth",
			"Amplify urgency while holding final payoff",
		];
	} else {
		phase = "Resolution";
		objectives = [
			"Deliver earned emotional payoff",
			"Resolve primary tension authentically",
			"Leave resonant final beat (HEA / HFN tone)",
		];
	}

	const objectivesBlock = objectives.map((o) => `- ${o}`).join("\n");

	// Build character continuity context from previous scenes
	let characterContext = "";
	if (previousMetadata.length > 0) {
		const introducedCharacters = new Set<string>();
		const povCharacters: string[] = [];
		const recentLocations: string[] = [];

		for (const meta of previousMetadata) {
			if (meta.key_characters) {
				for (const char of meta.key_characters.split(",")) {
					introducedCharacters.add(char.trim());
				}
			}
			if (meta.pov_character) {
				povCharacters.push(meta.pov_character);
			}
			if (meta.setting_location) {
				recentLocations.push(meta.setting_location);
			}
		}

		if (introducedCharacters.size > 0) {
			characterContext += `ESTABLISHED CHARACTERS: ${Array.from(introducedCharacters).join(", ")}\n`;
			characterContext +=
				"These characters have already been introduced. Maintain their established traits, appearance, and mannerisms. Do NOT reintroduce them with full descriptions.\n\n";
		}

		if (povCharacters.length > 0) {
			const lastPOV = povCharacters[povCharacters.length - 1];
			characterContext += `RECENT POV: ${lastPOV}\n`;
			characterContext +=
				"Maintain consistent POV unless there's a deliberate perspective shift. Stay in one character's head per scene.\n\n";
		}

		if (recentLocations.length > 0) {
			const lastLocation = recentLocations[recentLocations.length - 1];
			characterContext += `RECENT SETTING: ${lastLocation}\n`;
			characterContext +=
				"If the scene continues in the same location, build on established details. If location changes, make the transition clear and logical.\n\n";
		}
	}

	let contextSection = "";
	if (previousScenes.length > 0) {
		contextSection += "PREVIOUS SCENE CONTENT (for continuity):\n";
		contextSection +=
			"Use these scenes to maintain consistency in character behavior, setting details, tone, and ongoing plot threads.\n\n";
		previousScenes.forEach((scene, idx) => {
			const num = sceneNumber - previousScenes.length + idx;
			contextSection += `=== Scene ${num} ===\n${scene}\n\n`;
		});
	}

	let choiceImpact = "";
	if (lastChoice) {
		choiceImpact = `PRIOR PLAYER CHOICE: "${lastChoice.text}" (tone: ${lastChoice.tone}).\nIntegrate consequences implicitly via behavior, mood shift, or situational configuration. Do NOT restate the choice verbatim inside narration.\n\n`;
	}

	let choiceDirective = "";
	if (choicePoint && choicePoint.sceneNumber === sceneNumber) {
		choiceDirective = `UPCOMING DECISION SETUP: End BEFORE resolving: "${choicePoint.promptText}".\nBuild escalation toward this decision; end on poised tension (gesture, silence, sensory cue)—avoid forced question if unnatural.\n\n`;
	}

	// Calculate word target based on scene length preference
	const lengthRange = getSceneLengthRange(sceneLength, phase, sceneNumber);

	return `STORY: "${templateTitle}"
SCENE: ${sceneNumber} / ~${estimatedScenes}
PHASE: ${phase}

⚠️ CRITICAL WORD COUNT REQUIREMENT: ${lengthRange.min}-${lengthRange.max} words ⚠️
You MUST write exactly within this range. Count words as you write and stop when you reach the upper limit.

OBJECTIVES:
${objectivesBlock}

${characterContext}${contextSection}${choiceImpact}${choiceDirective}BEGIN WRITING THE SCENE NOW:
- Start IMMEDIATELY with the first sentence of the narrative prose
- DO NOT write any preamble like "Here is..." or "This scene..." or similar meta text
- Write ONLY the scene content itself (no meta, no lists, no outlines)
- Remember: ${lengthRange.min}-${lengthRange.max} words MAXIMUM
- After completing the narrative prose, include the metadata section below

After the narrative, include a metadata section:
<SCENE_META>
emotional_beat: [brief description, e.g., tentative trust building]
tension_threads: [unresolved tensions, comma-separated, e.g., secret identity, past trauma]
relationship_progress: [numeric -5 to +5, where negative is regression, positive is advancement]
key_moment: [single defining moment of this scene in 5-8 words]
key_characters: [comma-separated list of characters who appear in this scene]
pov_character: [name of the POV character for this scene]
setting_location: [where this scene takes place, e.g., coffee shop, protagonist's apartment]
</SCENE_META>`;
}

/**
 * Scene metadata structure
 */
export interface SceneMetadata {
	emotional_beat?: string;
	tension_threads?: string;
	relationship_progress?: number;
	key_moment?: string;
	key_characters?: string; // Comma-separated list of characters present in scene
	pov_character?: string; // Whose perspective the scene is told from
	setting_location?: string; // Where the scene takes place
}

/**
 * Get scene length guidance text for system prompt
 */
export function getSceneLengthGuidance(
	sceneLength: "short" | "medium" | "long" | number | undefined,
): string {
	if (typeof sceneLength === "number") {
		const min = Math.floor(sceneLength * 0.85);
		const max = Math.floor(sceneLength * 1.15);
		return `Each scene must be ${min}-${max} words. Count carefully and stop when you reach this limit.`;
	}

	const ranges = {
		short: { min: 500, max: 700, description: "concise, punchy" },
		medium: { min: 800, max: 1100, description: "balanced, immersive" },
		long: { min: 1100, max: 1500, description: "detailed, expansive" },
	};

	const range = ranges[sceneLength || "medium"];
	return `Each scene must be ${range.min}-${range.max} words (${range.description} pacing). Count carefully and stop when you reach this limit.`;
}

/**
 * Calculate word count range based on scene length preference and phase
 */
export function getSceneLengthRange(
	sceneLength: "short" | "medium" | "long" | number | undefined,
	_phase: string,
	_sceneNumber: number,
): { min: number; max: number; target: string } {
	// If custom word count provided, use it with ±15% flexibility
	if (typeof sceneLength === "number") {
		const min = Math.floor(sceneLength * 0.85);
		const max = Math.floor(sceneLength * 1.15);
		return { min, max, target: `Aim ${min}–${max} words` };
	}

	// Fixed ranges that match the guidance given to the AI
	// These do not vary by phase to ensure consistency
	const ranges = {
		short: { min: 500, max: 700 },
		medium: { min: 800, max: 1100 },
		long: { min: 1100, max: 1500 },
	};

	const range = ranges[sceneLength || "medium"];

	return {
		min: range.min,
		max: range.max,
		target: `Aim ${range.min}–${range.max} words`,
	};
}

/**
 * Parsed scene with separated content and metadata
 */
export interface ParsedScene {
	content: string;
	metadata: SceneMetadata | null;
	summary: string;
}

/**
 * Strip surrounding quotes from a string value
 */
function stripQuotes(value: string): string {
	const trimmed = value.trim();
	// Remove surrounding quotes (single or double)
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'")) ||
		(trimmed.startsWith("“") && trimmed.endsWith("”")) ||
		(trimmed.startsWith("‘") && trimmed.endsWith("’"))
	) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

/**
 * Parse SCENE_META block from generated content
 */
export function parseSceneMeta(rawContent: string): ParsedScene {
	const metaRegex = /<SCENE_META>([\s\S]*?)<\/SCENE_META>/i;
	const match = rawContent.match(metaRegex);

	let metadata: SceneMetadata | null = null;
	let content = rawContent;

	if (match) {
		const metaBlock = match[1].trim();
		content = rawContent.replace(metaRegex, "").trim();

		// Parse metadata fields
		metadata = {};

		const emotionalBeatMatch = metaBlock.match(/emotional_beat:\s*(.+)/i);
		if (emotionalBeatMatch) {
			metadata.emotional_beat = stripQuotes(emotionalBeatMatch[1]);
		}

		const tensionMatch = metaBlock.match(/tension_threads:\s*(.+)/i);
		if (tensionMatch) {
			metadata.tension_threads = stripQuotes(tensionMatch[1]);
		}

		const progressMatch = metaBlock.match(
			/relationship_progress:\s*([+-]?\d+)/i,
		);
		if (progressMatch) {
			metadata.relationship_progress = parseInt(progressMatch[1], 10);
		}

		const keyMomentMatch = metaBlock.match(/key_moment:\s*(.+)/i);
		if (keyMomentMatch) {
			metadata.key_moment = stripQuotes(keyMomentMatch[1]);
		}

		const keyCharactersMatch = metaBlock.match(/key_characters:\s*(.+)/i);
		if (keyCharactersMatch) {
			metadata.key_characters = stripQuotes(keyCharactersMatch[1]);
		}

		const povCharacterMatch = metaBlock.match(/pov_character:\s*(.+)/i);
		if (povCharacterMatch) {
			metadata.pov_character = stripQuotes(povCharacterMatch[1]);
		}

		const settingLocationMatch = metaBlock.match(/setting_location:\s*(.+)/i);
		if (settingLocationMatch) {
			metadata.setting_location = stripQuotes(settingLocationMatch[1]);
		}
	}

	// Generate summary from metadata or fallback to heuristic
	const summary = generateSummaryFromMeta(content, metadata);

	return {
		content,
		metadata,
		summary,
	};
}

/**
 * Generate summary from metadata or fallback to heuristic
 */
function generateSummaryFromMeta(
	content: string,
	metadata: SceneMetadata | null,
): string {
	if (metadata) {
		const parts: string[] = [];

		if (metadata.emotional_beat) {
			parts.push(metadata.emotional_beat);
		}

		if (metadata.key_moment) {
			parts.push(metadata.key_moment);
		}

		if (metadata.tension_threads) {
			parts.push(`tensions: ${metadata.tension_threads}`);
		}

		if (parts.length > 0) {
			return parts.join(" | ");
		}
	}

	// Fallback to heuristic if no metadata
	return extractSceneSummaryHeuristic(content);
}

/**
 * Extract summary from a scene (for context in next scene)
 * Now uses metadata if available, falls back to heuristic
 */
export function extractSceneSummary(sceneContent: string): string {
	const parsed = parseSceneMeta(sceneContent);
	return parsed.summary;
}

/**
 * Heuristic summary fallback: derive up to 3 short fragments
 */
function extractSceneSummaryHeuristic(sceneContent: string): string {
	// Heuristic summary: derive up to 3 short fragments
	const normalized = sceneContent.replace(/\s+/g, " ").trim();
	const sentences = normalized.split(/(?<=[.!?])\s+/).slice(0, 6);
	const joined = sentences.join(" ").toLowerCase();
	const bullets: string[] = [];

	if (joined.includes("kiss") || joined.includes("touch"))
		bullets.push("physical spark grows");
	if (joined.includes("argu") || joined.includes("tension"))
		bullets.push("conflict escalates");
	if (joined.includes("secret") || joined.includes("reveal"))
		bullets.push("partial reveal");
	if (
		joined.includes("fear") ||
		joined.includes("anxious") ||
		joined.includes("nervous")
	)
		bullets.push("emotional vulnerability");
	if (bullets.length === 0) bullets.push("relationship advances subtly");

	return bullets.slice(0, 3).join(" | ");
}
