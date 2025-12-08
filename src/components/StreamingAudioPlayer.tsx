import { Pause, Play, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStreamingAudioPlayer } from "~/hooks/useStreamingAudioPlayer";

interface StreamChunk {
	type: "metadata" | "audio";
	metadata?: {
		estimatedDuration: number;
		format: string;
		totalChunks?: number;
		provider: string;
		audioFormat: string;
	};
	index?: number;
	isLast?: boolean;
	data?: string;
	format?: string;
}

interface StreamingAudioPlayerProps {
	storyId: string;
	sceneNumber: number;
	onClose?: () => void;
	onComplete?: (audioUrl: string) => void;
	className?: string;
}

/**
 * Audio player that streams audio chunks in real-time using MediaSource API
 * Starts playback before all chunks are downloaded
 */
export function StreamingAudioPlayer({
	storyId,
	sceneNumber,
	onClose,
	onComplete,
	className = "",
}: StreamingAudioPlayerProps) {
	const player = useStreamingAudioPlayer({
		onPlaybackStart: () => {
			console.log("[Streaming Player] Playback started");
		},
		onPlaybackEnd: () => {
			console.log("[Streaming Player] Playback ended");
		},
	});

	const [status, setStatus] = useState<
		"initializing" | "streaming" | "ready" | "error"
	>("initializing");
	const [streamProgress, setStreamProgress] = useState(0);
	const abortControllerRef = useRef<AbortController | null>(null);
	const audioChunksRef = useRef<Uint8Array[]>([]); // Keep for fallback blob creation

	// Start streaming
	const startStreaming = useCallback(async () => {
		try {
			setStatus("initializing");

			abortControllerRef.current = new AbortController();

			const response = await fetch(
				`/api/stories/${storyId}/scene/${sceneNumber}/audio-stream`,
				{
					signal: abortControllerRef.current.signal,
				},
			);

			if (!response.ok) {
				throw new Error(`Streaming failed: ${response.statusText}`);
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("No readable stream available");
			}

			const decoder = new TextDecoder();
			let buffer = "";
			let metadata: StreamChunk["metadata"] | null = null;
			let mediaSourceInitialized = false;
			let receivedChunks = 0;

			setStatus("streaming");

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (!line.trim()) continue;

					const chunk = JSON.parse(line) as StreamChunk;

					if (chunk.type === "metadata" && chunk.metadata) {
						metadata = chunk.metadata;
						console.log(
							`[Streaming Player] Starting stream: ${metadata.audioFormat} format, ${metadata.totalChunks} chunks`,
						);

						// Initialize MediaSource with appropriate MIME type
						const mimeType =
							metadata.audioFormat === "mp3"
								? 'audio/mpeg; codecs="mp3"'
								: "audio/L16;rate=24000";

						// Try to initialize MediaSource
						try {
							await player.initializeMediaSource(mimeType);
							mediaSourceInitialized = true;
							console.log(
								"[Streaming Player] MediaSource initialized successfully",
							);
						} catch (error) {
							console.warn(
								"[Streaming Player] MediaSource initialization failed, will use fallback:",
								error,
							);
							mediaSourceInitialized = false;
						}
					} else if (chunk.type === "audio" && chunk.data) {
						// Decode base64 audio data
						const audioData = atob(chunk.data);
						const bytes = new Uint8Array(audioData.length);
						for (let i = 0; i < audioData.length; i++) {
							bytes[i] = audioData.charCodeAt(i);
						}

						// Store for fallback
						audioChunksRef.current.push(bytes);

						// Add to MediaSource if initialized
						if (mediaSourceInitialized) {
							player.addChunk(bytes);
						}

						receivedChunks++;
						if (metadata?.totalChunks) {
							setStreamProgress((receivedChunks / metadata.totalChunks) * 100);
						}

						if (chunk.isLast) {
							console.log("[Streaming Player] Received final chunk");
						}
					}
				}
			}

			// Process any remaining buffer
			if (buffer.trim()) {
				try {
					const chunk = JSON.parse(buffer) as StreamChunk;
					if (chunk.type === "audio" && chunk.data) {
						const audioData = atob(chunk.data);
						const bytes = new Uint8Array(audioData.length);
						for (let i = 0; i < audioData.length; i++) {
							bytes[i] = audioData.charCodeAt(i);
						}
						audioChunksRef.current.push(bytes);
						if (mediaSourceInitialized) {
							player.addChunk(bytes);
						}
					}
				} catch (error) {
					console.warn(
						"[Streaming Player] Failed to parse final buffer:",
						error,
					);
				}
			}

			// Finalize the stream
			if (mediaSourceInitialized) {
				player.finalize();
			} else if (metadata) {
				// Fallback: create blob URL if MediaSource didn't work
				console.log("[Streaming Player] Using fallback blob URL approach");
				const totalLength = audioChunksRef.current.reduce(
					(acc, arr) => acc + arr.length,
					0,
				);
				const combined = new Uint8Array(totalLength);
				let offset = 0;
				for (const chunk of audioChunksRef.current) {
					combined.set(chunk, offset);
					offset += chunk.length;
				}

				const mimeType =
					metadata.audioFormat === "mp3" ? "audio/mp3" : "audio/L16;rate=24000";
				const blob = new Blob([combined], { type: mimeType });
				const audioUrl = URL.createObjectURL(blob);

				// Notify parent with blob URL
				if (onComplete) {
					onComplete(audioUrl);
				}
			}

			setStatus("ready");
			console.log(
				`[Streaming Player] Complete: ${audioChunksRef.current.length} chunks`,
			);
		} catch (error) {
			// Ignore abort errors (these are expected when component unmounts)
			if (error instanceof Error && error.name === "AbortError") {
				console.log("[Streaming Player] Stream aborted (expected on unmount)");
				return;
			}

			console.error("[Streaming Player] Error:", error);
			setStatus("error");
			if (error instanceof Error) {
				alert(`Streaming error: ${error.message}`);
			}
		}
	}, [storyId, sceneNumber, player, onComplete]);

	// Start streaming exactly once on mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: <run only on mount>
	useEffect(() => {
		console.log("[Streaming Player] Component mounted - starting stream");
		startStreaming();

		// Cleanup on unmount
		return () => {
			console.log("[Streaming Player] Component unmounting - aborting stream");
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			player.reset();
		};
		// We intentionally want this to run only once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Empty deps = run once on mount, cleanup on unmount

	const formatTime = (seconds: number) => {
		if (!Number.isFinite(seconds)) return "0:00";
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const progress =
		player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;

	if (status === "error" || player.error) {
		return (
			<div className={`bg-red-50 dark:bg-red-900/20 p-4 rounded ${className}`}>
				<div className="text-red-800 dark:text-red-200">
					Streaming error: {player.error || "Unknown error"}
				</div>
			</div>
		);
	}

	return (
		<div
			className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg ${className}`}
		>
			{status === "streaming" && (
				<div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
					Streaming... {Math.round(streamProgress)}%
				</div>
			)}

			<div className="flex items-center gap-4">
				{/* Play/Pause Button */}
				<button
					type="button"
					onClick={player.isPlaying ? player.pause : player.play}
					disabled={!player.isReady && status !== "ready"}
					className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
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
								disabled={!player.isReady && status !== "ready"}
								className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
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
