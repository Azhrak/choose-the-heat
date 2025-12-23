import { Stack } from "~/components/ui/Stack";
import { calculateStoryProgress } from "~/lib/utils";

interface StoryProgressBarProps {
	currentScene: number;
	totalScenes: number;
	showPercentage?: boolean;
	status?: "in-progress" | "completed";
}

/**
 * Reusable progress bar component for story completion tracking
 * Progress is based on completed scenes (currentScene - 1), not the current scene being read.
 * Shows 100% only when status is "completed" and currentScene equals totalScenes.
 */
export function StoryProgressBar(props: StoryProgressBarProps) {
	const showPercentage = props.showPercentage ?? true;
	const status = props.status ?? "in-progress";

	const { percentage, width } = calculateStoryProgress(
		props.currentScene,
		props.totalScenes,
		status,
	);

	return (
		<Stack gap="xs">
			<div className="flex justify-between text-sm text-slate-600 dark:text-gray-300">
				<span>
					Scene {props.currentScene} of {props.totalScenes}
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
