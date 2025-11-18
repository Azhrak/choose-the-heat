import type { ChoicePoint } from "~/components/admin/ChoicePointForm";

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

export interface TemplateFormData {
	title: string;
	description: string;
	base_tropes: string[];
	estimated_scenes: number;
	cover_gradient: string;
}

/**
 * Validates template form data (basic sync validation)
 */
export function validateTemplateForm(data: TemplateFormData): ValidationResult {
	if (!data.title.trim()) {
		return { valid: false, error: "Title is required" };
	}

	if (!data.description.trim()) {
		return { valid: false, error: "Description is required" };
	}

	if (!Array.isArray(data.base_tropes) || data.base_tropes.length === 0) {
		return { valid: false, error: "At least one trope is required" };
	}

	if (data.estimated_scenes < 1 || data.estimated_scenes > 100) {
		return {
			valid: false,
			error: "Estimated scenes must be between 1 and 100",
		};
	}

	return { valid: true };
}

/**
 * Validates a single choice point option
 */
function validateChoiceOption(option: {
	text: string;
	tone: string;
	impact: string;
}): ValidationResult {
	if (!option.text.trim()) {
		return {
			valid: false,
			error: "Option text is required",
		};
	}

	if (!option.tone.trim()) {
		return {
			valid: false,
			error: "Option tone is required",
		};
	}

	if (!option.impact.trim()) {
		return {
			valid: false,
			error: "Option impact is required",
		};
	}

	return { valid: true };
}

/**
 * Validates a single choice point
 */
export function validateChoicePoint(cp: ChoicePoint): ValidationResult {
	if (!cp.prompt_text.trim()) {
		return {
			valid: false,
			error: "All choice points must have a prompt text",
		};
	}

	if (cp.options.length < 2 || cp.options.length > 4) {
		return {
			valid: false,
			error: "Each choice point must have 2-4 options",
		};
	}

	for (const option of cp.options) {
		const optionResult = validateChoiceOption(option);
		if (!optionResult.valid) {
			return optionResult;
		}
	}

	return { valid: true };
}

/**
 * Validates an array of choice points
 */
export function validateChoicePoints(
	choicePoints: ChoicePoint[],
	maxScenes?: number,
): ValidationResult {
	if (choicePoints.length === 0) {
		return { valid: true };
	}

	for (const cp of choicePoints) {
		const result = validateChoicePoint(cp);
		if (!result.valid) {
			return result;
		}

		// Validate scene_number is within valid range if maxScenes is provided
		if (maxScenes !== undefined && cp.scene_number >= maxScenes) {
			return {
				valid: false,
				error: `Scene number ${cp.scene_number} exceeds maximum scenes (${maxScenes}). Choice points must occur before the final scene.`,
			};
		}
	}

	return { valid: true };
}
