import { db } from "~/lib/db";
import { createAuditLog, extractChanges } from "./audit";

/**
 * Get a single setting by key
 */
export async function getSetting(key: string) {
	return db
		.selectFrom("app_settings")
		.selectAll()
		.where("key", "=", key)
		.executeTakeFirst();
}

/**
 * Get all settings, optionally filtered by category
 */
export async function getAllSettings(filters?: { category?: string }) {
	let query = db.selectFrom("app_settings").selectAll();

	if (filters?.category) {
		query = query.where("category", "=", filters.category);
	}

	return query.orderBy("category", "asc").orderBy("key", "asc").execute();
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(category: string) {
	return getAllSettings({ category });
}

/**
 * Get settings as a key-value map
 * Useful for quick lookups without sensitive value masking
 */
export async function getSettingsMap(filters?: {
	category?: string;
}): Promise<Record<string, string>> {
	const settings = await getAllSettings(filters);
	const map: Record<string, string> = {};

	for (const setting of settings) {
		map[setting.key] = setting.value;
	}

	return map;
}

/**
 * Update a single setting
 * Creates an audit log entry
 */
export async function updateSetting(
	key: string,
	value: string,
	userId: string,
): Promise<void> {
	// Get the old value for audit log
	const oldSetting = await getSetting(key);

	if (!oldSetting) {
		throw new Error(`Setting with key "${key}" not found`);
	}

	// Update the setting
	await db
		.updateTable("app_settings")
		.set({
			value,
			updated_at: new Date(),
			updated_by: userId,
		})
		.where("key", "=", key)
		.execute();

	// Create audit log
	const changes = extractChanges({ value: oldSetting.value }, { value });

	await createAuditLog({
		userId,
		action: "update",
		entityType: "setting",
		entityId: key,
		changes,
	});
}

/**
 * Bulk update multiple settings
 * Creates a single audit log entry for all changes
 */
export async function bulkUpdateSettings(
	updates: Array<{ key: string; value: string }>,
	userId: string,
): Promise<void> {
	// Get all old settings for audit log
	const keys = updates.map((u) => u.key);
	const oldSettings = await db
		.selectFrom("app_settings")
		.selectAll()
		.where("key", "in", keys)
		.execute();

	const oldSettingsMap = new Map(oldSettings.map((s) => [s.key, s]));

	// Filter out updates for settings that don't exist (skip silently)
	const validUpdates = updates.filter((update) => {
		if (!oldSettingsMap.has(update.key)) {
			console.warn(
				`[Settings] Skipping update for non-existent setting: ${update.key}`,
			);
			return false;
		}
		return true;
	});

	// If no valid updates, return early
	if (validUpdates.length === 0) {
		console.warn("[Settings] No valid settings to update");
		return;
	}

	// Update all settings in a transaction
	await db.transaction().execute(async (trx) => {
		for (const update of validUpdates) {
			await trx
				.updateTable("app_settings")
				.set({
					value: update.value,
					updated_at: new Date(),
					updated_by: userId,
				})
				.where("key", "=", update.key)
				.execute();
		}

		// Create a single audit log for bulk update
		const allChanges: Record<string, { old: string; new: string }> = {};
		for (const update of validUpdates) {
			const oldSetting = oldSettingsMap.get(update.key);
			if (oldSetting && oldSetting.value !== update.value) {
				allChanges[update.key] = {
					old: oldSetting.value,
					new: update.value,
				};
			}
		}

		if (Object.keys(allChanges).length > 0) {
			await createAuditLog({
				userId,
				action: "bulk_update",
				entityType: "setting",
				entityId: "bulk",
				changes: allChanges,
			});
		}
	});
}

/**
 * Reset a setting to its default value
 * Creates an audit log entry
 */
export async function resetSettingToDefault(
	key: string,
	userId: string,
): Promise<void> {
	const setting = await getSetting(key);

	if (!setting) {
		throw new Error(`Setting with key "${key}" not found`);
	}

	if (!setting.default_value) {
		throw new Error(`Setting "${key}" has no default value`);
	}

	await updateSetting(key, setting.default_value, userId);

	// The audit log is already created by updateSetting
	// but we'll add a note that this was a reset action
	await createAuditLog({
		userId,
		action: "reset_to_default",
		entityType: "setting",
		entityId: key,
		changes: {
			value: { old: setting.value, new: setting.default_value },
		},
	});
}

/**
 * Get settings for export
 * Returns settings as a clean object without metadata
 */
export async function getSettingsForExport(filters?: {
	category?: string;
}): Promise<Record<string, string>> {
	return getSettingsMap(filters);
}

/**
 * Import settings from a key-value map
 * Only updates settings that exist in the database
 * Creates audit logs for all changes
 */
export async function importSettings(
	settingsMap: Record<string, string>,
	userId: string,
): Promise<{ updated: number; skipped: string[] }> {
	const updates: Array<{ key: string; value: string }> = [];
	const skipped: string[] = [];

	// Validate all keys exist
	const keys = Object.keys(settingsMap);
	const existingSettings = await db
		.selectFrom("app_settings")
		.selectAll()
		.where("key", "in", keys)
		.execute();

	const existingKeys = new Set(existingSettings.map((s) => s.key));

	for (const [key, value] of Object.entries(settingsMap)) {
		if (existingKeys.has(key)) {
			updates.push({ key, value });
		} else {
			skipped.push(key);
		}
	}

	if (updates.length > 0) {
		await bulkUpdateSettings(updates, userId);
	}

	return {
		updated: updates.length,
		skipped,
	};
}

/**
 * Parse a setting value based on its type
 */
export function parseSettingValue(setting: {
	value: string;
	value_type: string;
}): string | number | boolean | unknown {
	switch (setting.value_type) {
		case "number":
			return Number.parseFloat(setting.value);
		case "boolean":
			return setting.value === "true";
		case "json":
			try {
				return JSON.parse(setting.value);
			} catch {
				return setting.value;
			}
		default:
			return setting.value;
	}
}

/**
 * Get a parsed setting value by key
 */
export async function getParsedSetting(
	key: string,
): Promise<string | number | boolean | unknown | null> {
	const setting = await getSetting(key);
	if (!setting) {
		return null;
	}
	return parseSettingValue(setting);
}

/**
 * Upsert a setting (insert or update)
 * Creates an audit log entry
 */
export async function upsertSetting(data: {
	key: string;
	value: string;
	value_type: string;
	category: string;
	description?: string;
	updated_by: string;
}): Promise<void> {
	const existing = await getSetting(data.key);

	if (existing) {
		// Update existing setting
		await updateSetting(data.key, data.value, data.updated_by);
	} else {
		// Insert new setting
		await db
			.insertInto("app_settings")
			.values({
				key: data.key,
				value: data.value,
				value_type: data.value_type,
				category: data.category,
				description: data.description,
				updated_by: data.updated_by,
			})
			.execute();

		// Create audit log
		await createAuditLog({
			userId: data.updated_by,
			action: "create",
			entityType: "setting",
			entityId: data.key,
			changes: { value: { old: null, new: data.value } },
		});
	}
}
