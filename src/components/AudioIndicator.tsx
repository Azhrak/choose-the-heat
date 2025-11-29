import { Volume2 } from "lucide-react";
import { useAudioGeneration } from "~/hooks/useAudioGeneration";

interface AudioIndicatorProps {
	storyId: string;
	sceneNumber: number;
}

/**
 * Small indicator showing that audio is available for a scene
 */
export function AudioIndicator({ storyId, sceneNumber }: AudioIndicatorProps) {
	const { audio, isLoading } = useAudioGeneration(storyId, sceneNumber);

	// Don't show anything if audio doesn't exist or still loading
	if (!audio?.exists || isLoading) {
		return null;
	}

	return (
		<div title="Audio available">
			<Volume2
				className="w-4 h-4 text-green-500"
				aria-label="Audio available for this scene"
			/>
		</div>
	);
}
