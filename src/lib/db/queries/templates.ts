import { db } from "~/lib/db";
import type { TemplateStatus } from "~/lib/db/types";
import type { Trope } from "~/lib/types/preferences";
import { createAuditLog, extractChanges } from "./audit";

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
 * Get paginated templates for admin management
 * Returns both the templates for the current page and the total count
 */
export async function getAllTemplatesPaginated(params: {
	page: number;
	limit: number;
	status?: TemplateStatus;
	sortBy?:
		| "title"
		| "status"
		| "estimated_scenes"
		| "created_at"
		| "updated_at";
	sortOrder?: "asc" | "desc";
	search?: string;
}) {
	const {
		page,
		limit,
		status,
		sortBy = "updated_at",
		sortOrder = "desc",
		search,
	} = params;
	const offset = (page - 1) * limit;

	// Build base query
	let query = db.selectFrom("novel_templates");

	// Apply status filter if provided
	if (status) {
		query = query.where("status", "=", status);
	}

	// Apply search filter if provided
	if (search?.trim()) {
		const searchTerm = `%${search.trim().toLowerCase()}%`;
		query = query.where((eb) =>
			eb.or([
				eb("title", "ilike", searchTerm),
				eb("description", "ilike", searchTerm),
			]),
		);
	}

	// Get total count
	const countResult = await query
		.select(({ fn }) => fn.count<number>("id").as("total"))
		.executeTakeFirst();

	const total = Number(countResult?.total || 0);

	// Get paginated templates with sorting
	const templates = await query
		.selectAll()
		.orderBy(sortBy, sortOrder)
		.limit(limit)
		.offset(offset)
		.execute();

	return {
		templates,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
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

/**
 * Get templates by status
 */
export async function getTemplatesByStatus(status: TemplateStatus) {
	return db
		.selectFrom("novel_templates")
		.selectAll()
		.where("status", "=", status)
		.orderBy("created_at", "desc")
		.execute();
}

/**
 * Get all published templates (for public browsing)
 */
export async function getPublishedTemplates() {
	return getTemplatesByStatus("published");
}

/**
 * Create a new template (admin/editor only)
 */
export async function createTemplate(
	template: {
		title: string;
		description: string;
		base_tropes: string[];
		estimated_scenes: number;
		cover_gradient: string;
		status?: TemplateStatus;
	},
	userId: string,
) {
	const [newTemplate] = await db
		.insertInto("novel_templates")
		.values({
			...template,
			status: template.status || "draft",
		})
		.returning(["id", "title", "status"])
		.execute();

	// Log the creation
	await createAuditLog({
		userId,
		action: "create_template",
		entityType: "template",
		entityId: newTemplate.id,
		changes: { created: template },
	});

	return newTemplate;
}

/**
 * Create a new template with choice points (admin/editor only)
 */
export async function createTemplateWithChoicePoints(
	template: {
		title: string;
		description: string;
		base_tropes: string[];
		estimated_scenes: number;
		cover_gradient: string;
		status?: TemplateStatus;
	},
	choicePoints: Array<{
		scene_number: number;
		prompt_text: string;
		options: Array<{
			id: string;
			text: string;
			tone: string;
			impact: string;
		}>;
	}>,
	userId: string,
) {
	// Use a transaction to ensure atomicity
	return await db.transaction().execute(async (trx) => {
		// Create the template
		const [newTemplate] = await trx
			.insertInto("novel_templates")
			.values({
				...template,
				status: template.status || "draft",
			})
			.returning(["id", "title", "status"])
			.execute();

		// Create choice points if any
		if (choicePoints.length > 0) {
			await trx
				.insertInto("choice_points")
				.values(
					choicePoints.map((cp) => ({
						template_id: newTemplate.id,
						scene_number: cp.scene_number,
						prompt_text: cp.prompt_text,
						options: JSON.stringify(cp.options),
					})),
				)
				.execute();
		}

		// Log the creation
		await createAuditLog({
			userId,
			action: "create_template",
			entityType: "template",
			entityId: newTemplate.id,
			changes: {
				created: {
					...template,
					choicePoints: choicePoints.length,
				},
			},
		});

		return newTemplate;
	});
}

/**
 * Update template
 */
export async function updateTemplate(
	templateId: string,
	updates: {
		title?: string;
		description?: string;
		base_tropes?: string[];
		estimated_scenes?: number;
		cover_gradient?: string;
		status?: TemplateStatus;
	},
	userId: string,
) {
	// Get old template for audit log
	const oldTemplate = await getTemplateById(templateId);

	if (!oldTemplate) {
		throw new Error("Template not found");
	}

	// Update template
	const [updatedTemplate] = await db
		.updateTable("novel_templates")
		.set({
			...updates,
			updated_at: new Date(),
		})
		.where("id", "=", templateId)
		.returning(["id", "title", "status"])
		.execute();

	// Log the update with changes
	const changes = extractChanges(oldTemplate, { ...oldTemplate, ...updates });

	await createAuditLog({
		userId,
		action: "update_template",
		entityType: "template",
		entityId: templateId,
		changes,
	});

	return updatedTemplate;
}

/**
 * Update template status (publish, archive, draft)
 */
export async function updateTemplateStatus(
	templateId: string,
	status: TemplateStatus,
	userId: string,
) {
	const updates: {
		status: TemplateStatus;
		updated_at: Date;
		archived_at?: Date;
		archived_by?: string;
	} = {
		status,
		updated_at: new Date(),
	};

	// If archiving, set archived_at and archived_by
	if (status === "archived") {
		updates.archived_at = new Date();
		updates.archived_by = userId;
	}

	const [updatedTemplate] = await db
		.updateTable("novel_templates")
		.set(updates)
		.where("id", "=", templateId)
		.returning(["id", "title", "status"])
		.execute();

	// Log the status change
	await createAuditLog({
		userId,
		action: `${status}_template`,
		entityType: "template",
		entityId: templateId,
		changes: { status: { old: null, new: status } },
	});

	return updatedTemplate;
}

/**
 * Bulk update template status
 */
export async function bulkUpdateTemplateStatus(
	templateIds: string[],
	status: TemplateStatus,
	userId: string,
) {
	const updates: {
		status: TemplateStatus;
		updated_at: Date;
		archived_at?: Date;
		archived_by?: string;
	} = {
		status,
		updated_at: new Date(),
	};

	// If archiving, set archived_at and archived_by
	if (status === "archived") {
		updates.archived_at = new Date();
		updates.archived_by = userId;
	}

	// Update all templates in one query
	const result = await db
		.updateTable("novel_templates")
		.set(updates)
		.where("id", "in", templateIds)
		.execute();

	const updatedCount =
		result.length > 0
			? Number(result[0].numUpdatedRows || templateIds.length)
			: 0;

	// Log the bulk status change
	await createAuditLog({
		userId,
		action: `bulk_${status}_templates`,
		entityType: "template",
		entityId: templateIds[0], // Use first ID as reference
		changes: {
			status: { old: null, new: status },
			templateIds,
			count: updatedCount,
		},
	});

	return {
		updatedCount,
	};
}

/**
 * Bulk delete templates (admin only)
 */
export async function bulkDeleteTemplates(
	templateIds: string[],
	userId: string,
) {
	// Get templates info for audit log
	const templates = await db
		.selectFrom("novel_templates")
		.select(["id", "title", "status"])
		.where("id", "in", templateIds)
		.execute();

	if (templates.length === 0) {
		throw new Error("No templates found");
	}

	// Delete all templates in one query (cascade will handle choice_points)
	const result = await db
		.deleteFrom("novel_templates")
		.where("id", "in", templateIds)
		.execute();

	const deletedCount =
		result.length > 0
			? Number(result[0].numDeletedRows || templates.length)
			: 0;

	// Log the bulk deletion
	await createAuditLog({
		userId,
		action: "bulk_delete_templates",
		entityType: "template",
		entityId: templateIds[0], // Use first ID as reference
		changes: {
			deleted: templates.map((t) => ({
				id: t.id,
				title: t.title,
				status: t.status,
			})),
			count: deletedCount,
		},
	});

	return {
		deletedCount,
	};
}

/**
 * Delete template (admin only)
 */
export async function deleteTemplate(templateId: string, userId: string) {
	// Get template info for audit log
	const template = await getTemplateById(templateId);

	if (!template) {
		throw new Error("Template not found");
	}

	// Delete the template (cascade will handle choice_points)
	await db.deleteFrom("novel_templates").where("id", "=", templateId).execute();

	// Log the deletion
	await createAuditLog({
		userId,
		action: "delete_template",
		entityType: "template",
		entityId: templateId,
		changes: {
			deleted: {
				title: template.title,
				status: template.status,
			},
		},
	});
}

/**
 * Get template count by status
 */
export async function getTemplateCountByStatus() {
	const result = await db
		.selectFrom("novel_templates")
		.select(({ fn }) => ["status", fn.count<number>("id").as("count")])
		.groupBy("status")
		.execute();

	return result.reduce(
		(acc, row) => {
			acc[row.status as TemplateStatus] = Number(row.count);
			return acc;
		},
		{} as Record<TemplateStatus, number>,
	);
}

/**
 * Update choice points for a template
 * Replaces all existing choice points with the new ones
 */
export async function updateChoicePoints(
	templateId: string,
	choicePoints: Array<{
		scene_number: number;
		prompt_text: string;
		options: Array<{
			id: string;
			text: string;
			tone: string;
			impact: string;
		}>;
	}>,
	userId: string,
) {
	return await db.transaction().execute(async (trx) => {
		// Delete existing choice points
		await trx
			.deleteFrom("choice_points")
			.where("template_id", "=", templateId)
			.execute();

		// Insert new choice points if any
		if (choicePoints.length > 0) {
			await trx
				.insertInto("choice_points")
				.values(
					choicePoints.map((cp) => ({
						template_id: templateId,
						scene_number: cp.scene_number,
						prompt_text: cp.prompt_text,
						options: JSON.stringify(cp.options),
					})),
				)
				.execute();
		}

		// Log the update
		await createAuditLog({
			userId,
			action: "update_template_choice_points",
			entityType: "template",
			entityId: templateId,
			changes: {
				choicePoints: {
					old: null,
					new: choicePoints.length,
				},
			},
		});
	});
}
