import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { AppSettings } from "~/lib/db/types";

export const appSettingsQueryKey = ["appSettings"] as const;
export const appSettingsCategoryQueryKey = (category: string) =>
	["appSettings", "category", category] as const;
export const appSettingQueryKey = (key: string) =>
	["appSettings", "key", key] as const;

/**
 * Custom hook to fetch all app settings
 * Requires admin role
 */
export function useAppSettingsQuery(params?: {
	category?: string;
	enabled?: boolean;
}) {
	const { category, enabled = true } = params || {};

	return useQuery({
		queryKey: category
			? appSettingsCategoryQueryKey(category)
			: appSettingsQueryKey,
		queryFn: () => {
			const searchParams = new URLSearchParams();
			if (category) {
				searchParams.set("category", category);
			}
			const url =
				searchParams.toString() !== ""
					? `/api/admin/settings?${searchParams.toString()}`
					: "/api/admin/settings";
			return api.get<{ settings: AppSettings[] }>(url);
		},
		enabled,
	});
}

/**
 * Custom hook to fetch a single app setting
 * Requires admin role
 */
export function useAppSettingQuery(key: string, enabled = true) {
	return useQuery({
		queryKey: appSettingQueryKey(key),
		queryFn: () =>
			api.get<{ setting: AppSettings }>(`/api/admin/settings/${key}`),
		enabled,
	});
}

/**
 * Custom hook to update multiple settings at once
 * Automatically invalidates settings queries on success
 */
export function useUpdateSettingsMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["updateSettings"],
		mutationFn: (updates: Array<{ key: string; value: string }>) =>
			api.put<{ success: boolean }>("/api/admin/settings", { updates }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appSettingsQueryKey });
		},
	});
}

/**
 * Custom hook to update a single setting
 * Automatically invalidates related queries on success
 */
export function useUpdateSettingMutation(key: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["updateSetting", key],
		mutationFn: (value: string) =>
			api.put<{ success: boolean }>(`/api/admin/settings/${key}`, { value }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appSettingQueryKey(key) });
			queryClient.invalidateQueries({ queryKey: appSettingsQueryKey });
		},
	});
}

/**
 * Custom hook to reset a setting to its default value
 * Automatically invalidates related queries on success
 */
export function useResetSettingMutation(key: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["resetSetting", key],
		mutationFn: () =>
			api.post<{ success: boolean }>(`/api/admin/settings/${key}/reset`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appSettingQueryKey(key) });
			queryClient.invalidateQueries({ queryKey: appSettingsQueryKey });
		},
	});
}

/**
 * Custom hook to export settings
 * Returns settings as a downloadable JSON object
 */
export function useExportSettingsMutation() {
	return useMutation({
		mutationKey: ["exportSettings"],
		mutationFn: async (category?: string) => {
			const searchParams = new URLSearchParams();
			if (category) {
				searchParams.set("category", category);
			}
			const url =
				searchParams.toString() !== ""
					? `/api/admin/settings/export?${searchParams.toString()}`
					: "/api/admin/settings/export";
			const data = await api.get<{
				version: string;
				exported_at: string;
				exported_by: string;
				settings: Record<string, string>;
			}>(url);
			return data;
		},
	});
}

/**
 * Custom hook to import settings from JSON
 * Automatically invalidates all settings queries on success
 */
export function useImportSettingsMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: ["importSettings"],
		mutationFn: (data: {
			version?: string;
			exported_at?: string;
			exported_by?: string;
			settings: Record<string, string>;
		}) =>
			api.post<{ success: boolean; updated: number; skipped: string[] }>(
				"/api/admin/settings/import",
				data,
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appSettingsQueryKey });
		},
	});
}
