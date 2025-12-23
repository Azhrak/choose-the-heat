import { Loader2, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/Button";
import { useAudioGeneration } from "~/hooks/useAudioGeneration";

interface AudioGenerationButtonProps {
	storyId: string;
	sceneNumber: number;
	onAudioReady?: (audioUrl: string) => void;
	onStartStreaming?: () => void;
	isSceneGenerating?: boolean;
	isSceneComplete?: boolean;
	sceneError?: string | null;
}

/**
 * Button to generate audio for a scene
 * Shows different states: generate, loading, ready
 * Disabled while scene is still being generated
 */
export function AudioGenerationButton(props: AudioGenerationButtonProps) {
	const isSceneGenerating = props.isSceneGenerating ?? false;
	const isSceneComplete = props.isSceneComplete ?? false;
	const sceneError = props.sceneError ?? null;

	const { audio, isLoading, generate, isGenerating } = useAudioGeneration(
		props.storyId,
		props.sceneNumber,
	);
	const [isQueued, setIsQueued] = useState(false);
	const [progress, setProgress] = useState(0);

	// Notify parent when audio becomes available
	useEffect(() => {
		if (audio?.audioUrl && props.onAudioReady) {
			props.onAudioReady(audio.audioUrl);
			setProgress(0); // Reset progress when audio is ready
		}
	}, [audio?.audioUrl, props.onAudioReady]);

	// Handle queued generation when scene completes
	useEffect(() => {
		if (isQueued && !isSceneGenerating) {
			if (sceneError) {
				// Cancel queued generation if scene failed
				setIsQueued(false);
			} else if (isSceneComplete) {
				// Start audio generation now that scene is ready
				setIsQueued(false);
				if (props.onStartStreaming) {
					props.onStartStreaming();
				} else {
					setProgress(0);
					generate({
						onProgress: (p) => setProgress(p),
					});
				}
			}
		}
	}, [
		isQueued,
		isSceneGenerating,
		isSceneComplete,
		sceneError,
		generate,
		props.onStartStreaming,
	]);

	// Don't show button if audio already exists
	if (audio?.exists) {
		return null;
	}

	// Show loading state while checking
	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
				<Loader2 className="w-4 h-4 animate-spin" />
				<span>Checking audio...</span>
			</div>
		);
	}

	return (
		<Button
			type="button"
			onClick={() => {
				if (isSceneGenerating) {
					// Queue audio generation to start when scene is ready
					setIsQueued(true);
				} else {
					// Trigger streaming playback
					if (props.onStartStreaming) {
						props.onStartStreaming();
					} else {
						// Fallback to old approach if no streaming callback provided
						setProgress(0);
						generate({
							onProgress: (p) => setProgress(p),
						});
					}
				}
			}}
			disabled={isGenerating}
			variant="ghost"
			size="sm"
			className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
		>
			{isGenerating ? (
				<>
					<Loader2 className="w-4 h-4 animate-spin" />
					<span>
						{progress > 0 && progress < 100
							? `Streaming... ${Math.round(progress)}%`
							: "Generating..."}
					</span>
				</>
			) : isQueued ? (
				<>
					<Loader2 className="w-4 h-4 animate-spin" />
					<span>Waiting for scene...</span>
				</>
			) : (
				<>
					<Volume2 className="w-4 h-4" />
					<span>Generate Audio</span>
				</>
			)}
		</Button>
	);
}
