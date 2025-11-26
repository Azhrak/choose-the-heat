import { AlertTriangle } from "lucide-react";
import type { GeneratedTemplate } from "~/lib/ai/generateTemplate";
import { GRADIENT_OPTIONS } from "~/lib/constants/gradients";
import { Alert } from "../ui/Alert";
import { Stack } from "../ui/Stack";
import { Text } from "../ui/Text";

interface TemplatePreviewProps {
	template: GeneratedTemplate;
	warnings?: string[];
	allTropes?: Array<{ key: string; label: string; description: string | null }>;
}

export function TemplatePreview({
	template,
	warnings = [],
	allTropes = [],
}: TemplatePreviewProps) {
	// Get trope labels for display
	const tropeLabels = template.base_tropes.map((key) => {
		const trope = allTropes.find((t) => t.key === key);
		return trope?.label || key;
	});

	// Get gradient label
	const gradientOption = GRADIENT_OPTIONS.find(
		(g) => g.value === template.cover_gradient,
	);

	return (
		<Stack gap="md" className="max-h-[70vh] overflow-y-auto">
			{/* Warnings */}
			{warnings.length > 0 && (
				<Alert variant="warning">
					<div className="flex items-start gap-2">
						<AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
						<div>
							<Text weight="medium">Template was adjusted:</Text>
							<ul className="list-disc pl-4 mt-2 space-y-1">
								{warnings.map((warning) => (
									<li key={warning} className="text-sm">
										{warning}
									</li>
								))}
							</ul>
						</div>
					</div>
				</Alert>
			)}

			{/* Title */}
			<Stack gap="xs">
				<Text
					weight="medium"
					size="sm"
					className="text-slate-600 dark:text-gray-400"
				>
					Title
				</Text>
				<Text size="lg" weight="semibold">
					{template.title}
				</Text>
			</Stack>

			{/* Description */}
			<Stack gap="xs">
				<Text
					weight="medium"
					size="sm"
					className="text-slate-600 dark:text-gray-400"
				>
					Description
				</Text>
				<Text>{template.description}</Text>
			</Stack>

			{/* Tropes */}
			<Stack gap="xs">
				<Text
					weight="medium"
					size="sm"
					className="text-slate-600 dark:text-gray-400"
				>
					Base Tropes ({template.base_tropes.length})
				</Text>
				<div className="flex flex-wrap gap-2">
					{tropeLabels.map((label, i) => (
						<span
							key={template.base_tropes[i]}
							className="px-4 py-2 bg-romance-50 dark:bg-romance-500/20 border border-romance-200 dark:border-romance-500/30 rounded-full text-romance-700 dark:text-pink-200 font-medium"
						>
							{label}
						</span>
					))}
				</div>
			</Stack>

			{/* Estimated Scenes */}
			<Stack gap="xs">
				<Text
					weight="medium"
					size="sm"
					className="text-slate-600 dark:text-gray-400"
				>
					Estimated Scenes
				</Text>
				<Text>{template.estimated_scenes} scenes</Text>
			</Stack>

			{/* Cover Gradient */}
			<Stack gap="xs">
				<Text
					weight="medium"
					size="sm"
					className="text-slate-600 dark:text-gray-400"
				>
					Cover Gradient
				</Text>
				<div className="space-y-2">
					<div
						className={`h-32 rounded-lg bg-linear-to-br ${template.cover_gradient} shadow-sm`}
					/>
					<Text size="sm" className="text-slate-600 dark:text-gray-400">
						{gradientOption?.label || template.cover_gradient}
					</Text>
				</div>
			</Stack>

			{/* Choice Points */}
			<Stack gap="xs">
				<Text
					weight="medium"
					size="sm"
					className="text-slate-600 dark:text-gray-400"
				>
					Choice Points ({template.choicePoints.length})
				</Text>
				<div className="space-y-4">
					{template.choicePoints.map((cp, index) => (
						<div
							key={`choice-point-${cp.scene_number}-${index}`}
							className="border border-slate-200 dark:border-gray-700 rounded-lg p-4 bg-slate-50 dark:bg-gray-800/50"
						>
							<Stack gap="sm">
								{/* Choice Point Header */}
								<div className="flex items-center gap-3">
									<div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-romance-50 dark:bg-romance-500/20 border border-romance-200 dark:border-romance-500/30 rounded-full flex items-center justify-center">
										<span className="text-sm sm:text-base text-romance-700 dark:text-pink-200 font-bold">
											{cp.scene_number}
										</span>
									</div>
									<Text weight="semibold" size="sm">
										Decision at Scene {cp.scene_number}
									</Text>
								</div>

								{/* Prompt */}
								<div>
									<Text
										size="sm"
										weight="medium"
										className="text-slate-600 dark:text-gray-400 mb-1"
									>
										Decision Prompt:
									</Text>
									<Text size="sm">{cp.prompt_text}</Text>
								</div>

								{/* Options */}
								<div>
									<Text
										size="sm"
										weight="medium"
										className="text-slate-600 dark:text-gray-400 mb-2"
									>
										Options ({cp.options.length}):
									</Text>
									<div className="space-y-2">
										{cp.options.map((option, optIndex) => (
											<div
												key={option.id}
												className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-md p-3"
											>
												<div className="flex items-start gap-2">
													<span className="shrink-0 flex items-center justify-center w-6 h-6 bg-romance-100 dark:bg-romance-900/30 text-romance-700 dark:text-romance-300 rounded-full text-xs font-semibold">
														{String.fromCharCode(65 + optIndex)}
													</span>
													<Stack gap="xs" className="flex-1">
														<Text size="sm" weight="medium">
															{option.text}
														</Text>
														<div className="flex flex-wrap gap-2">
															<span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
																Tone: {option.tone}
															</span>
															<span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
																Impact: {option.impact}
															</span>
														</div>
													</Stack>
												</div>
											</div>
										))}
									</div>
								</div>
							</Stack>
						</div>
					))}
				</div>
			</Stack>
		</Stack>
	);
}
