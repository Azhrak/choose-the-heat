import { db } from "~/lib/db";
import type { Trope } from "~/lib/types/preferences";

/**
 * Get all novel templates
 */
export async function getAllTemplates() {
	return db
		.selectFrom("novel_templates")
		.selectAll()
		.orderBy("created_at", "desc")
		.execute();
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: string) {
	return db
		.selectFrom("novel_templates")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();
}

/**
 * Get template with its choice points
 */
export async function getTemplateWithChoicePoints(id: string) {
	const template = await getTemplateById(id);

	if (!template) {
		return null;
	}

	const choicePoints = await db
		.selectFrom("choice_points")
		.selectAll()
		.where("template_id", "=", id)
		.orderBy("scene_number", "asc")
		.execute();

	return {
		...template,
		choicePoints,
	};
}

/**
 * Get templates filtered by trope
 */
export async function getTemplatesByTrope(trope: Trope) {
	const templates = await getAllTemplates();

	// Filter templates that contain the specified trope
	return templates.filter((template) => {
		const baseTropes = template.base_tropes as string[];
		return baseTropes.includes(trope);
	});
}

/**
 * Get templates filtered by multiple tropes (match any)
 */
export async function getTemplatesByTropes(tropes: Trope[]) {
	const templates = await getAllTemplates();

	// Filter templates that contain at least one of the specified tropes
	return templates.filter((template) => {
		const baseTropes = template.base_tropes as string[];
		return tropes.some((trope) => baseTropes.includes(trope));
	});
}

/**
 * Search templates by title or description
 */
export async function searchTemplates(query: string) {
	const searchTerm = query.toLowerCase();

	const templates = await getAllTemplates();

	return templates.filter((template) => {
		return (
			template.title.toLowerCase().includes(searchTerm) ||
			template.description.toLowerCase().includes(searchTerm)
		);
	});
}
