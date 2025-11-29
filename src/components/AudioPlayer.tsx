import { Pause, Play, Volume2, X } from "lucide-react";
import { useAudioPlayer } from "~/hooks/useAudioPlayer";

interface AudioPlayerProps {
	audioUrl: string;
	onClose?: () => void;
	className?: string;
}

/**
 * Floating audio player with full controls
 */
export function AudioPlayer({
	audioUrl,
	onClose,
	className = "",
}: AudioPlayerProps) {
	const player = useAudioPlayer(audioUrl);

	const formatTime = (seconds: number) => {
		if (!Number.isFinite(seconds)) return "0:00";
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const progress =
		player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;

	return (
		<div className={`bg-white dark:bg-gray-800 p-4 ${className}`}>
			<div className="flex items-center gap-4">
				{/* Play/Pause Button */}
				<button
					type="button"
					onClick={player.isPlaying ? player.pause : player.play}
					className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
					aria-label={player.isPlaying ? "Pause" : "Play"}
				>
					{player.isPlaying ? (
						<Pause className="w-6 h-6 text-gray-800 dark:text-gray-200" />
					) : (
						<Play className="w-6 h-6 text-gray-800 dark:text-gray-200" />
					)}
				</button>

				{/* Progress Bar */}
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-xs text-gray-600 dark:text-gray-400">
							{formatTime(player.currentTime)}
						</span>
						<div className="flex-1">
							<input
								type="range"
								min={0}
								max={player.duration || 100}
								value={player.currentTime}
								onChange={(e) => player.seek(Number.parseFloat(e.target.value))}
								className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
								style={{
									background: `linear-gradient(to right, rgb(219 39 119) 0%, rgb(219 39 119) ${progress}%, rgb(229 231 235) ${progress}%, rgb(229 231 235) 100%)`,
								}}
							/>
						</div>
						<span className="text-xs text-gray-600 dark:text-gray-400">
							{formatTime(player.duration)}
						</span>
					</div>
				</div>

				{/* Volume Control */}
				<div className="flex items-center gap-2">
					<Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
					<input
						type="range"
						min={0}
						max={1}
						step={0.1}
						value={player.volume}
						onChange={(e) =>
							player.setVolume(Number.parseFloat(e.target.value))
						}
						className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
					/>
				</div>

				{/* Playback Speed */}
				<select
					value={player.playbackRate}
					onChange={(e) =>
						player.setPlaybackRate(Number.parseFloat(e.target.value))
					}
					className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded px-2 py-1 cursor-pointer"
				>
					<option value={0.5}>0.5x</option>
					<option value={0.75}>0.75x</option>
					<option value={1}>1x</option>
					<option value={1.25}>1.25x</option>
					<option value={1.5}>1.5x</option>
					<option value={2}>2x</option>
				</select>

				{/* Close Button */}
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						aria-label="Close player"
					>
						<X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
					</button>
				)}
			</div>
		</div>
	);
}
