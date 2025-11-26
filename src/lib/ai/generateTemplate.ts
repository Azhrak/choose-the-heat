import type { ChoicePoint } from "~/components/admin/ChoicePointForm";
import { GRADIENT_OPTIONS } from "~/lib/constants/gradients";
import type { getAllTropes } from "~/lib/db/queries/tropes";
import { generateCompletion } from "./client";

/**
 * Trope result type from database queries
 */
type TropeResult = Awaited<ReturnType<typeof getAllTropes>>[number];

/**
 * Input for template generation
 */
export interface GenerateTemplateInput {
	mode: "prompt" | "trope-based" | "random";
	prompt?: string; // For 'prompt' mode
	selectedTropes?: string[]; // For 'trope-based' mode (1-5 tropes)
}

/**
 * Generated template structure
 */
export interface GeneratedTemplate {
	title: string;
	description: string;
	base_tropes: string[]; // 2-5 trope keys
	estimated_scenes: number; // 6-15 scenes
	cover_gradient: string; // Tailwind gradient class
	choicePoints: ChoicePoint[];
}

/**
 * Build system prompt for template generation
 */
function buildSystemPrompt(
	availableTropes: TropeResult[],
	validGradients: string[],
): string {
	const tropeList = availableTropes
		.map((t) => `${t.key} (${t.label})`)
		.join(", ");
	const gradientList = validGradients.join(", ");

	return `You are an expert romance novel template designer. Generate a complete, compelling romance novel template as valid JSON.

REQUIRED JSON SCHEMA:
{
  "title": string (2-60 chars, compelling romance title that hooks readers),
  "description": string (50-200 chars, enticing description that sells the premise),
  "base_tropes": string[] (select 2-5 tropes from available list),
  "estimated_scenes": number (6-15, based on story complexity),
  "cover_gradient": string (select ONE from gradient options),
  "choicePoints": array of EXACTLY 3-4 choice points [
    {
      "scene_number": number (1 to estimated_scenes-1, must be in ascending order),
      "prompt_text": string (compelling decision prompt that creates tension),
      "options": array of 2-4 options [
        {
          "id": string (generate a random UUID v4),
          "text": string (clear, engaging choice text),
          "tone": string (e.g., "bold", "cautious", "playful", "honest", "guarded"),
          "impact": string (e.g., "advances relationship", "creates tension", "reveals vulnerability")
        }
      ]
    }
  ]
}

AVAILABLE TROPES:
${tropeList}

AVAILABLE GRADIENTS:
${gradientList}

STRICT CONSTRAINTS:
1. Tropes: MUST select 2-5 tropes from the available list above (use the trope KEY, not label)
2. Gradients: MUST select ONE gradient class from the list above (exact match required)
3. Choice Points: MUST generate EXACTLY 3 or 4 choice points
4. Scene Numbers: Must be in ascending order and less than estimated_scenes
5. Choice Point Options: Each choice point must have 2-4 options
6. Estimated Scenes: Must be between 6-15
   - 6-8 scenes: Quick, focused romance stories
   - 10-12 scenes: Balanced narrative with development
   - 13-15 scenes: Complex plots with multiple arcs
7. Each option MUST have: id (UUID), text, tone, impact
8. Choice Point Distribution: Space choice points evenly across story arc
   - Early development (~20% through story)
   - Middle tension (~50% through story)
   - Late conflict/resolution (~80% through story)

QUALITY GUIDELINES:
- Title: Evocative, genre-appropriate, memorable
- Description: Hook the reader with conflict, chemistry, and stakes
- Trope Selection: Choose complementary tropes that create interesting dynamics
- Choice Points: Make decisions meaningful with clear consequences
- Options: Each option should feel distinct with different tones and impacts
- Scene Count: Match complexity to story scope

OUTPUT FORMAT:
Return ONLY valid JSON. No markdown code blocks, no explanations, no additional text.
Just the raw JSON object matching the schema above.`;
}

/**
 * Build user prompt based on generation mode
 */
function buildUserPrompt(
	input: GenerateTemplateInput,
	availableTropes: TropeResult[],
): string {
	switch (input.mode) {
		case "prompt": {
			if (!input.prompt) {
				throw new Error("Prompt is required for 'prompt' mode");
			}
			return `Generate a romance template based on this concept: "${input.prompt}"

Create a compelling romance novel template that brings this concept to life. Select appropriate tropes, craft an engaging title and description, choose a fitting gradient, and create meaningful choice points that let readers shape the story.

Generate the complete template as JSON now.`;
		}

		case "trope-based": {
			if (!input.selectedTropes || input.selectedTropes.length === 0) {
				throw new Error(
					"At least one trope is required for 'trope-based' mode",
				);
			}

			// Get trope labels for context
			const selectedTropeLabels = input.selectedTropes
				.map((key) => {
					const trope = availableTropes.find((t) => t.key === key);
					return trope ? `${trope.label} (${trope.key})` : key;
				})
				.join(", ");

			return `Generate a romance template using these tropes: ${selectedTropeLabels}

These tropes MUST be included in the base_tropes array. You may add 1-2 additional complementary tropes from the available list if they enhance the story, but the selected tropes are mandatory.

Create a compelling title, description, and meaningful choice points that showcase these tropes. Choose an appropriate scene count and gradient.

Generate the complete template as JSON now.`;
		}

		case "random": {
			return `Generate a creative surprise romance template with an unexpected and delightful trope combination.

Be creative! Mix tropes in interesting ways, create a unique premise, and surprise me with engaging choice points. Pick a gradient that matches the story's mood.

Generate the complete template as JSON now.`;
		}

		default: {
			throw new Error(`Unknown generation mode: ${input.mode}`);
		}
	}
}

/**
 * Parse JSON from AI response (handles markdown code blocks)
 */
function parseJSON(response: string): unknown {
	// Try to extract JSON from markdown code blocks
	const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
	if (codeBlockMatch) {
		return JSON.parse(codeBlockMatch[1].trim());
	}

	// Try parsing as-is
	try {
		return JSON.parse(response.trim());
	} catch {
		// Try to find JSON object in response
		const jsonMatch = response.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]);
		}
		throw new Error("No valid JSON found in AI response");
	}
}

/**
 * Validate basic structure of generated template
 */
function validateTemplateStructure(data: unknown): data is GeneratedTemplate {
	if (!data || typeof data !== "object") {
		throw new Error("Response is not an object");
	}

	const template = data as Partial<GeneratedTemplate>;

	// Check required fields
	if (!template.title || typeof template.title !== "string") {
		throw new Error("Missing or invalid 'title' field");
	}

	if (!template.description || typeof template.description !== "string") {
		throw new Error("Missing or invalid 'description' field");
	}

	if (
		!Array.isArray(template.base_tropes) ||
		template.base_tropes.length === 0
	) {
		throw new Error("Missing or invalid 'base_tropes' field");
	}

	if (
		!template.estimated_scenes ||
		typeof template.estimated_scenes !== "number"
	) {
		throw new Error("Missing or invalid 'estimated_scenes' field");
	}

	if (!template.cover_gradient || typeof template.cover_gradient !== "string") {
		throw new Error("Missing or invalid 'cover_gradient' field");
	}

	if (!Array.isArray(template.choicePoints)) {
		throw new Error("Missing or invalid 'choicePoints' field");
	}

	// Validate choice points structure
	for (const [index, cp] of template.choicePoints.entries()) {
		if (typeof cp.scene_number !== "number") {
			throw new Error(
				`Choice point ${index + 1}: Missing or invalid 'scene_number'`,
			);
		}

		if (!cp.prompt_text || typeof cp.prompt_text !== "string") {
			throw new Error(
				`Choice point ${index + 1}: Missing or invalid 'prompt_text'`,
			);
		}

		if (!Array.isArray(cp.options) || cp.options.length < 2) {
			throw new Error(
				`Choice point ${index + 1}: Must have at least 2 options`,
			);
		}

		for (const [optIndex, option] of cp.options.entries()) {
			if (!option.id || typeof option.id !== "string") {
				throw new Error(
					`Choice point ${index + 1}, option ${optIndex + 1}: Missing or invalid 'id'`,
				);
			}

			if (!option.text || typeof option.text !== "string") {
				throw new Error(
					`Choice point ${index + 1}, option ${optIndex + 1}: Missing or invalid 'text'`,
				);
			}

			if (!option.tone || typeof option.tone !== "string") {
				throw new Error(
					`Choice point ${index + 1}, option ${optIndex + 1}: Missing or invalid 'tone'`,
				);
			}

			if (!option.impact || typeof option.impact !== "string") {
				throw new Error(
					`Choice point ${index + 1}, option ${optIndex + 1}: Missing or invalid 'impact'`,
				);
			}
		}
	}

	return true;
}

/**
 * Generate a complete novel template using AI
 */
export async function generateTemplate(
	input: GenerateTemplateInput,
	availableTropes: TropeResult[],
): Promise<GeneratedTemplate> {
	// Build prompts
	const validGradients = GRADIENT_OPTIONS.map((g) => g.value);
	const systemPrompt = buildSystemPrompt(availableTropes, validGradients);
	const userPrompt = buildUserPrompt(input, availableTropes);

	console.log("[Template Generation] Starting generation...");
	console.log(`[Template Generation] Mode: ${input.mode}`);
	if (input.mode === "prompt") {
		console.log(`[Template Generation] Prompt: ${input.prompt}`);
	} else if (input.mode === "trope-based") {
		console.log(
			`[Template Generation] Selected tropes: ${input.selectedTropes?.join(", ")}`,
		);
	}

	// Generate with AI
	const response = await generateCompletion(systemPrompt, userPrompt, {
		temperature: 0.7, // Balanced creativity
		maxTokens: 2000, // Sufficient for complete template
	});

	console.log("[Template Generation] AI response received");

	// Parse JSON response
	let parsedData: unknown;
	try {
		parsedData = parseJSON(response);
		console.log("[Template Generation] JSON parsed successfully");
	} catch (error) {
		console.error("[Template Generation] Failed to parse JSON:", error);
		console.error("[Template Generation] Response was:", response);
		throw new Error(
			`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}

	// Validate structure
	try {
		validateTemplateStructure(parsedData);
		console.log("[Template Generation] Structure validation passed");
	} catch (error) {
		console.error("[Template Generation] Structure validation failed:", error);
		console.error("[Template Generation] Parsed data:", parsedData);
		throw new Error(
			`Generated template has invalid structure: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}

	const template = parsedData as GeneratedTemplate;

	console.log("[Template Generation] Generated template:");
	console.log(`  Title: ${template.title}`);
	console.log(`  Tropes: ${template.base_tropes.join(", ")}`);
	console.log(`  Scenes: ${template.estimated_scenes}`);
	console.log(`  Choice Points: ${template.choicePoints.length}`);

	return template;
}
