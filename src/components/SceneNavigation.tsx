import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/Button";

interface SceneNavigationProps {
	currentScene: number;
	totalScenes: number;
	hasChoicePoint: boolean;
	hasAlreadyMadeChoice: boolean;
	onNavigateScene: (sceneNumber: number) => void;
}

export function SceneNavigation({
	currentScene,
	totalScenes,
	hasChoicePoint,
	hasAlreadyMadeChoice,
	onNavigateScene,
}: SceneNavigationProps) {
	return (
		<div className="flex items-center justify-between">
			<Button
				type="button"
				onClick={() => onNavigateScene(currentScene - 1)}
				disabled={currentScene === 1}
				variant="ghost"
				size="sm"
				className="text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
			>
				<ChevronLeft className="w-4 h-4" />
				Previous Scene
			</Button>

			<Button
				type="button"
				onClick={() => onNavigateScene(currentScene + 1)}
				disabled={
					currentScene >= totalScenes ||
					(hasChoicePoint && !hasAlreadyMadeChoice)
				}
				variant="ghost"
				size="sm"
				className="text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400"
				title={
					hasChoicePoint && !hasAlreadyMadeChoice
						? "Make a choice to unlock the next scene"
						: ""
				}
			>
				Next Scene
				<ChevronRight className="w-4 h-4" />
			</Button>
		</div>
	);
}
