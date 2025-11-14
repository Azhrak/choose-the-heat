import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/api/client";
import type { Template } from "~/lib/api/types";

interface ChoiceOption {
	id: string;
	text: string;
	tone: string;
	impact: string;
}

interface ChoicePoint {
	id: string;
	scene_number: number;
	prompt_text: string;
	options: ChoiceOption[];
}

interface TemplateWithChoices extends Template {
	choicePoints: ChoicePoint[];
}

export const templateQueryKey = (templateId: string) =>
	["template", templateId] as const;

/**
 * Custom hook to fetch a public template with its choice points
 * Used for template detail view and story creation
 */
export function useTemplateQuery(templateId: string, enabled = true) {
	return useQuery({
		queryKey: templateQueryKey(templateId),
		queryFn: async () => {
			const result = await api.get<{ template: any }>(
				`/api/templates/${templateId}`,
			);
			// Parse options JSON string if needed
			return {
				...result,
				template: {
					...result.template,
					choicePoints:
						result.template.choicePoints?.map((cp: any) => ({
							...cp,
							options:
								typeof cp.options === "string"
									? JSON.parse(cp.options)
									: cp.options,
						})) || [],
				},
			} as { template: TemplateWithChoices };
		},
		enabled,
	});
}
