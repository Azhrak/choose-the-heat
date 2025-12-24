/**
 * AI Models Database Queries
 *
 * Provides CRUD operations for the ai_models table
 */

import { db } from "../index";
import type { AIModel } from "../types";

export type ModelStatus = "pending" | "enabled" | "disabled" | "deprecated";
export type ModelCategory = "text" | "tts";

export interface ModelFilters {
	provider?: string;
	category?: ModelCategory;
	status?: ModelStatus;
	limit?: number;
	offset?: number;
}

export interface CreateModelData {
	provider: string;
	category: ModelCategory;
	model_id: string;
	display_name?: string;
	description?: string;
	context_window?: number;
	supports_streaming?: boolean;
	provider_metadata?: Record<string, unknown>;
	status?: ModelStatus;
	updated_by?: string;
}

export interface UpdateModelData {
	display_name?: string;
	description?: string;
	context_window?: number;
	supports_streaming?: boolean;
	status?: ModelStatus;
	admin_notes?: string;
	provider_metadata?: Record<string, unknown>;
	enabled_at?: Date | null;
	deprecated_at?: Date | null;
	updated_by?: string;
}

/**
 * In-memory cache for enabled models per provider
 */
interface ModelCache {
	models: AIModel[];
	timestamp: number;
}

const modelCache = new Map<string, ModelCache>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Invalidate the model cache for a specific provider or all providers
 */
export function invalidateModelCache(
	provider?: string,
	category?: ModelCategory,
): void {
	if (provider && category) {
		const cacheKey = `${provider}:${category}`;
		modelCache.delete(cacheKey);
	} else {
		modelCache.clear();
	}
}

/**
 * List models with optional filtering
 */
export async function listModels(
	filters: ModelFilters = {},
): Promise<AIModel[]> {
	let query = db.selectFrom("ai_models").selectAll();

	if (filters.provider) {
		query = query.where("provider", "=", filters.provider);
	}

	if (filters.category) {
		query = query.where("category", "=", filters.category);
	}

	if (filters.status) {
		query = query.where("status", "=", filters.status);
	}

	// Order by discovered_at descending (newest first)
	query = query.orderBy("discovered_at", "desc");

	if (filters.limit) {
		query = query.limit(filters.limit);
	}

	if (filters.offset) {
		query = query.offset(filters.offset);
	}

	return await query.execute();
}

/**
 * Get a single model by ID
 */
export async function getModelById(id: string): Promise<AIModel | null> {
	const model = await db
		.selectFrom("ai_models")
		.selectAll()
		.where("id", "=", id)
		.executeTakeFirst();

	return model || null;
}

/**
 * Get a model by provider, category, and model_id
 */
export async function getModelByProviderId(
	provider: string,
	category: ModelCategory,
	modelId: string,
): Promise<AIModel | null> {
	const model = await db
		.selectFrom("ai_models")
		.selectAll()
		.where("provider", "=", provider)
		.where("category", "=", category)
		.where("model_id", "=", modelId)
		.executeTakeFirst();

	return model || null;
}

/**
 * Get all enabled models for a provider (with caching)
 */
export async function getEnabledModelsForProvider(
	provider: string,
	category: ModelCategory,
): Promise<AIModel[]> {
	const cacheKey = `${provider}:${category}`;
	const cached = modelCache.get(cacheKey);

	// Return cached data if still valid
	if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
		return cached.models;
	}

	// Query database
	const models = await db
		.selectFrom("ai_models")
		.selectAll()
		.where("provider", "=", provider)
		.where("category", "=", category)
		.where("status", "=", "enabled")
		.orderBy("model_id", "asc")
		.execute();

	// Update cache
	modelCache.set(cacheKey, {
		models,
		timestamp: Date.now(),
	});

	return models;
}

/**
 * Get the default model for a provider
 * This queries app_settings for {category}.{provider}.default_model
 */
export async function getDefaultModelForProvider(
	provider: string,
	category: ModelCategory,
): Promise<AIModel | null> {
	// Get the default model_id from app_settings
	const settingKey = `${category === "text" ? "ai" : "tts"}.${provider}.default_model`;

	const setting = await db
		.selectFrom("app_settings")
		.select("value")
		.where("key", "=", settingKey)
		.executeTakeFirst();

	if (!setting?.value) {
		// No default set, return first enabled model
		const models = await getEnabledModelsForProvider(provider, category);
		return models[0] || null;
	}

	// Get the model record
	return await getModelByProviderId(provider, category, setting.value);
}

/**
 * Create a new model
 */
export async function createModel(data: CreateModelData): Promise<AIModel> {
	const model = await db
		.insertInto("ai_models")
		.values({
			provider: data.provider,
			category: data.category,
			model_id: data.model_id,
			display_name: data.display_name,
			description: data.description,
			context_window: data.context_window,
			supports_streaming: data.supports_streaming ?? true,
			provider_metadata: data.provider_metadata
				? JSON.stringify(data.provider_metadata)
				: undefined,
			status: data.status ?? "pending",
			updated_by: data.updated_by,
		})
		.returningAll()
		.executeTakeFirstOrThrow();

	// Invalidate cache
	invalidateModelCache(data.provider, data.category);

	return model;
}

/**
 * Upsert a discovered model (insert if new, update if exists)
 */
export async function upsertDiscoveredModel(
	data: CreateModelData,
): Promise<AIModel> {
	// Check if model already exists
	const existing = await getModelByProviderId(
		data.provider,
		data.category,
		data.model_id,
	);

	if (existing) {
		// Update metadata but don't change status
		const updated = await db
			.updateTable("ai_models")
			.set({
				display_name: data.display_name || existing.display_name,
				description: data.description || existing.description,
				context_window: data.context_window || existing.context_window,
				supports_streaming:
					data.supports_streaming ?? existing.supports_streaming,
				provider_metadata: data.provider_metadata
					? JSON.stringify(data.provider_metadata)
					: existing.provider_metadata,
				updated_at: new Date(),
				updated_by: data.updated_by,
			})
			.where("id", "=", existing.id)
			.returningAll()
			.executeTakeFirstOrThrow();

		return updated;
	}

	// Create new model with status='pending' (requires admin approval)
	return await createModel({ ...data, status: "pending" });
}

/**
 * Update a model's status
 */
export async function updateModelStatus(
	id: string,
	status: ModelStatus,
	userId?: string,
): Promise<AIModel> {
	const updates: {
		status: ModelStatus;
		updated_at: Date;
		updated_by?: string;
		enabled_at?: Date;
		deprecated_at?: Date;
	} = {
		status,
		updated_at: new Date(),
		updated_by: userId,
	};

	// Set timestamp fields based on status change
	if (status === "enabled") {
		updates.enabled_at = new Date();
	} else if (status === "deprecated") {
		updates.deprecated_at = new Date();
	}

	const model = await db
		.updateTable("ai_models")
		.set(updates)
		.where("id", "=", id)
		.returningAll()
		.executeTakeFirstOrThrow();

	// Invalidate cache
	invalidateModelCache(model.provider, model.category as ModelCategory);

	return model;
}

/**
 * Update a model
 */
export async function updateModel(
	id: string,
	data: UpdateModelData,
): Promise<AIModel> {
	const updates: {
		display_name?: string;
		description?: string;
		context_window?: number;
		supports_streaming?: boolean;
		status?: ModelStatus;
		admin_notes?: string;
		provider_metadata?: string;
		enabled_at?: Date | null;
		deprecated_at?: Date | null;
		updated_by?: string;
		updated_at: Date;
	} = {
		display_name: data.display_name,
		description: data.description,
		context_window: data.context_window,
		supports_streaming: data.supports_streaming,
		status: data.status,
		admin_notes: data.admin_notes,
		enabled_at: data.enabled_at,
		deprecated_at: data.deprecated_at,
		updated_by: data.updated_by,
		updated_at: new Date(),
	};

	// Serialize provider_metadata if present
	if (data.provider_metadata) {
		updates.provider_metadata = JSON.stringify(data.provider_metadata);
	}

	const model = await db
		.updateTable("ai_models")
		.set(updates)
		.where("id", "=", id)
		.returningAll()
		.executeTakeFirstOrThrow();

	// Invalidate cache
	invalidateModelCache(model.provider, model.category as ModelCategory);

	return model;
}

/**
 * Bulk update models (e.g., approve multiple pending models)
 */
export async function bulkUpdateModels(
	ids: string[],
	updates: UpdateModelData,
): Promise<number> {
	if (ids.length === 0) return 0;

	const updateData: {
		display_name?: string;
		description?: string;
		context_window?: number;
		supports_streaming?: boolean;
		status?: ModelStatus;
		admin_notes?: string;
		provider_metadata?: string;
		enabled_at?: Date | null;
		deprecated_at?: Date | null;
		updated_by?: string;
		updated_at: Date;
	} = {
		display_name: updates.display_name,
		description: updates.description,
		context_window: updates.context_window,
		supports_streaming: updates.supports_streaming,
		status: updates.status,
		admin_notes: updates.admin_notes,
		enabled_at: updates.enabled_at,
		deprecated_at: updates.deprecated_at,
		updated_by: updates.updated_by,
		updated_at: new Date(),
	};

	// Set timestamp fields based on status change
	if (updates.status === "enabled") {
		updateData.enabled_at = new Date();
	} else if (updates.status === "deprecated") {
		updateData.deprecated_at = new Date();
	}

	// Serialize provider_metadata if present
	if (updates.provider_metadata) {
		updateData.provider_metadata = JSON.stringify(updates.provider_metadata);
	}

	const result = await db
		.updateTable("ai_models")
		.set(updateData)
		.where("id", "in", ids)
		.execute();

	// Invalidate all caches since we don't know which providers were affected
	invalidateModelCache();

	return Number(result[0]?.numUpdatedRows ?? 0);
}

/**
 * Delete a model
 */
export async function deleteModel(id: string): Promise<void> {
	const model = await getModelById(id);

	await db.deleteFrom("ai_models").where("id", "=", id).execute();

	// Invalidate cache
	if (model) {
		invalidateModelCache(model.provider, model.category as ModelCategory);
	}
}

/**
 * Count models by status for a provider
 */
export async function countModelsByStatus(
	provider: string,
	category: ModelCategory,
): Promise<Record<ModelStatus, number>> {
	const models = await db
		.selectFrom("ai_models")
		.select(["status"])
		.where("provider", "=", provider)
		.where("category", "=", category)
		.execute();

	const counts: Record<ModelStatus, number> = {
		pending: 0,
		enabled: 0,
		disabled: 0,
		deprecated: 0,
	};

	for (const model of models) {
		const status = model.status as ModelStatus;
		counts[status]++;
	}

	return counts;
}
