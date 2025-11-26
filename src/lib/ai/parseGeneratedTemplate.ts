import type { getAllTropes } from "~/lib/db/queries/tropes";
import type { GeneratedTemplate } from "./generateTemplate";

/**
 * Trope result type from database queries
 */
type TropeResult = Awaited<ReturnType<typeof getAllTropes>>[number];

/**
 * Validation result with sanitized template and warnings
 */
export interface ValidationResult {
	valid: boolean;
	sanitized: GeneratedTemplate | null;
	errors: string[];
	warnings: string[];
}

/**
 * Validate and sanitize a generated template
 * Auto-fixes issues where possible and returns warnings
 */
export async function validateAndSanitizeTemplate(
	rawTemplate: GeneratedTemplate,
	allTropes: TropeResult[],
	validGradients: string[],
): Promise<ValidationResult> {
	const errors: string[] = [];
	const warnings: string[] = [];
	const sanitized = { ...rawTemplate };

	console.log("[Template Validation] Starting validation...");

	// 1. Validate title
	if (sanitized.title.length < 2 || sanitized.title.length > 60) {
		errors.push(
			`Title length must be between 2-60 characters (got ${sanitized.title.length})`,
		);
	}

	// 2. Validate description
	if (sanitized.description.length < 50 || sanitized.description.length > 200) {
		warnings.push(
			`Description should be 50-200 characters (got ${sanitized.description.length})`,
		);
	}

	// 3. Validate and sanitize tropes
	const validTropeKeys = allTropes.map((t) => t.key);
	const validatedTropes: string[] = [];
	const invalidTropes: string[] = [];

	for (const tropeKey of sanitized.base_tropes) {
		if (validTropeKeys.includes(tropeKey)) {
			validatedTropes.push(tropeKey);
		} else {
			invalidTropes.push(tropeKey);
		}
	}

	if (invalidTropes.length > 0) {
		warnings.push(
			`Removed invalid tropes: ${invalidTropes.join(", ")} (not in database)`,
		);
	}

	sanitized.base_tropes = validatedTropes;

	if (validatedTropes.length === 0) {
		errors.push("At least one valid trope is required");
	} else if (validatedTropes.length > 5) {
		const removed = validatedTropes.splice(5);
		warnings.push(`Removed excess tropes (max 5): ${removed.join(", ")}`);
	}

	// 4. Validate and sanitize estimated_scenes
	if (sanitized.estimated_scenes < 6) {
		warnings.push(
			`Estimated scenes increased from ${sanitized.estimated_scenes} to 6 (minimum)`,
		);
		sanitized.estimated_scenes = 6;
	} else if (sanitized.estimated_scenes > 15) {
		warnings.push(
			`Estimated scenes reduced from ${sanitized.estimated_scenes} to 15 (maximum)`,
		);
		sanitized.estimated_scenes = 15;
	}

	// 5. Validate and sanitize cover gradient
	if (!validGradients.includes(sanitized.cover_gradient)) {
		warnings.push(
			`Invalid gradient "${sanitized.cover_gradient}" replaced with default (from-purple-600 to-pink-600)`,
		);
		sanitized.cover_gradient = "from-purple-600 to-pink-600";
	}

	// 6. Validate choice points count
	if (sanitized.choicePoints.length < 3) {
		errors.push(
			`Must have at least 3 choice points (got ${sanitized.choicePoints.length}). Please regenerate.`,
		);
	} else if (sanitized.choicePoints.length > 4) {
		const removed = sanitized.choicePoints.splice(4);
		warnings.push(
			`Removed ${removed.length} excess choice points (max 4 allowed)`,
		);
	}

	// 7. Validate and sanitize choice points
	for (let i = 0; i < sanitized.choicePoints.length; i++) {
		const cp = sanitized.choicePoints[i];
		const cpLabel = `Choice point ${i + 1}`;

		// Validate scene number
		if (cp.scene_number < 1) {
			warnings.push(
				`${cpLabel}: Scene number ${cp.scene_number} adjusted to 1 (minimum)`,
			);
			cp.scene_number = 1;
		} else if (cp.scene_number >= sanitized.estimated_scenes) {
			const newSceneNum = sanitized.estimated_scenes - 1;
			warnings.push(
				`${cpLabel}: Scene number ${cp.scene_number} adjusted to ${newSceneNum} (must be before final scene)`,
			);
			cp.scene_number = newSceneNum;
		}

		// Check ascending order
		if (
			i > 0 &&
			cp.scene_number <= sanitized.choicePoints[i - 1].scene_number
		) {
			const prevScene = sanitized.choicePoints[i - 1].scene_number;
			cp.scene_number = Math.min(prevScene + 1, sanitized.estimated_scenes - 1);
			warnings.push(
				`${cpLabel}: Scene number adjusted to ${cp.scene_number} to maintain ascending order`,
			);
		}

		// Validate prompt text
		if (!cp.prompt_text || cp.prompt_text.trim().length === 0) {
			errors.push(`${cpLabel}: Prompt text is required`);
		}

		// Validate options
		if (!cp.options || cp.options.length < 2) {
			errors.push(`${cpLabel}: Must have at least 2 options`);
		} else if (cp.options.length > 4) {
			const removed = cp.options.splice(4);
			warnings.push(
				`${cpLabel}: Removed ${removed.length} excess options (max 4 allowed)`,
			);
		}

		// Validate each option
		if (cp.options) {
			for (let j = 0; j < cp.options.length; j++) {
				const option = cp.options[j];
				const optLabel = `${cpLabel}, option ${j + 1}`;

				if (!option.id || option.id.trim().length === 0) {
					errors.push(`${optLabel}: ID is required`);
				}

				if (!option.text || option.text.trim().length === 0) {
					errors.push(`${optLabel}: Text is required`);
				}

				if (!option.tone || option.tone.trim().length === 0) {
					errors.push(`${optLabel}: Tone is required`);
				}

				if (!option.impact || option.impact.trim().length === 0) {
					errors.push(`${optLabel}: Impact is required`);
				}
			}
		}
	}

	const valid = errors.length === 0;

	console.log(
		`[Template Validation] Validation ${valid ? "passed" : "failed"}`,
	);
	console.log(`[Template Validation] Errors: ${errors.length}`);
	console.log(`[Template Validation] Warnings: ${warnings.length}`);

	if (errors.length > 0) {
		console.error("[Template Validation] Errors:", errors);
	}

	if (warnings.length > 0) {
		console.warn("[Template Validation] Warnings:", warnings);
	}

	return {
		valid,
		sanitized: valid ? sanitized : null,
		errors,
		warnings,
	};
}
