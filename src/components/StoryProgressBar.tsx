import { Stack } from "~/components/ui/Stack";

interface StoryProgressBarProps {
	currentScene: number;
	totalScenes: number;
	showPercentage?: boolean;
}

/**
 * Reusable progress bar component for story completion tracking
 */
export function StoryProgressBar({
	currentScene,
	totalScenes,
	showPercentage = true,
}: StoryProgressBarProps) {
	const percentage = Math.round((currentScene / totalScenes) * 100);
	const width = Math.min((currentScene / totalScenes) * 100, 100);

	return (
		<Stack gap="xs">
			<div className="flex justify-between text-sm text-slate-600 dark:text-gray-300">
				<span>
					Scene {currentScene} of {totalScenes}
				</span>
				{showPercentage && <span>{percentage}%</span>}
			</div>
			<div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2">
				<div
					className="bg-romance-600 h-2 rounded-full transition-all"
					style={{ width: `${width}%` }}
				></div>
			</div>
		</Stack>
	);
}
