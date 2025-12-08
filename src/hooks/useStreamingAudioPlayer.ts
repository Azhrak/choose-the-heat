import { useCallback, useEffect, useRef, useState } from "react";

interface StreamingAudioPlayerOptions {
	onProgress?: (progress: number) => void;
	onPlaybackStart?: () => void;
	onPlaybackEnd?: () => void;
}

/**
 * Hook for playing audio using MediaSource API for true streaming playback
 * Allows audio to start playing before all chunks are downloaded
 */
export function useStreamingAudioPlayer(
	options: StreamingAudioPlayerOptions = {},
) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const mediaSourceRef = useRef<MediaSource | null>(null);
	const sourceBufferRef = useRef<SourceBuffer | null>(null);
	const chunksQueueRef = useRef<Uint8Array[]>([]);
	const isAppendingRef = useRef(false);

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolumeState] = useState(1);
	const [playbackRate, setPlaybackRateState] = useState(1);
	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize audio element
	useEffect(() => {
		if (typeof window === "undefined") return;

		if (!audioRef.current) {
			audioRef.current = new Audio();
		}

		const audio = audioRef.current;

		const handleTimeUpdate = () => {
			setCurrentTime(audio.currentTime);
			if (options.onProgress && audio.duration) {
				options.onProgress((audio.currentTime / audio.duration) * 100);
			}
		};
		const handleLoadedMetadata = () => setDuration(audio.duration);
		const handleEnded = () => {
			setIsPlaying(false);
			options.onPlaybackEnd?.();
		};
		const handlePlay = () => {
			setIsPlaying(true);
			options.onPlaybackStart?.();
		};
		const handlePause = () => setIsPlaying(false);
		const handleError = () => {
			setError("Audio playback error");
			setIsPlaying(false);
		};

		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("loadedmetadata", handleLoadedMetadata);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("play", handlePlay);
		audio.addEventListener("pause", handlePause);
		audio.addEventListener("error", handleError);

		return () => {
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("play", handlePlay);
			audio.removeEventListener("pause", handlePause);
			audio.removeEventListener("error", handleError);
		};
	}, [options]);

	// Process chunk queue
	const processChunkQueue = useCallback(() => {
		if (
			!sourceBufferRef.current ||
			isAppendingRef.current ||
			chunksQueueRef.current.length === 0
		) {
			return;
		}

		isAppendingRef.current = true;
		const chunk = chunksQueueRef.current.shift();

		if (chunk) {
			try {
				sourceBufferRef.current.appendBuffer(chunk as BufferSource);
			} catch (error) {
				console.error("[Streaming Audio] Error appending buffer:", error);
				setError("Failed to append audio data");
				isAppendingRef.current = false;
			}
		}
	}, []);

	// Initialize MediaSource for streaming
	const initializeMediaSource = useCallback(
		(mimeType: string) => {
			if (!audioRef.current) return null;

			// Check if MediaSource is supported
			if (typeof MediaSource === "undefined") {
				setError("MediaSource API not supported in this browser");
				return null;
			}

			// Check if the MIME type is supported
			if (!MediaSource.isTypeSupported(mimeType)) {
				console.warn(
					`[Streaming Audio] MIME type ${mimeType} not supported, falling back to blob`,
				);
				setError(`Format ${mimeType} not supported for streaming`);
				return null;
			}

			const mediaSource = new MediaSource();
			mediaSourceRef.current = mediaSource;

			const objectUrl = URL.createObjectURL(mediaSource);
			audioRef.current.src = objectUrl;

			return new Promise<SourceBuffer>((resolve, reject) => {
				mediaSource.addEventListener("sourceopen", () => {
					try {
						const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
						sourceBufferRef.current = sourceBuffer;

						sourceBuffer.addEventListener("updateend", () => {
							isAppendingRef.current = false;
							processChunkQueue();

							// Auto-play once we have enough data
							if (
								!isPlaying &&
								audioRef.current &&
								audioRef.current.buffered.length > 0
							) {
								const bufferedSeconds =
									audioRef.current.buffered.end(0) -
									audioRef.current.buffered.start(0);
								// Start playing when we have at least 2 seconds buffered
								if (bufferedSeconds >= 2) {
									audioRef.current
										.play()
										.catch((err) =>
											console.error("[Streaming Audio] Auto-play failed:", err),
										);
								}
							}
						});

						sourceBuffer.addEventListener("error", () => {
							reject(new Error("SourceBuffer error"));
						});

						setIsReady(true);
						resolve(sourceBuffer);
					} catch (error) {
						reject(error);
					}
				});

				mediaSource.addEventListener("error", () => {
					reject(new Error("MediaSource error"));
				});
			});
		},
		[isPlaying, processChunkQueue],
	);

	// Add audio chunk to the stream
	const addChunk = useCallback(
		(chunk: Uint8Array) => {
			if (!sourceBufferRef.current) {
				console.warn(
					"[Streaming Audio] SourceBuffer not ready, queueing chunk",
				);
				chunksQueueRef.current.push(chunk);
				return;
			}

			chunksQueueRef.current.push(chunk);
			processChunkQueue();
		},
		[processChunkQueue],
	);

	// Finalize the stream (no more chunks coming)
	const finalize = useCallback(() => {
		if (!mediaSourceRef.current || !sourceBufferRef.current) return;

		// Wait for all chunks to be appended
		const checkAndFinalize = () => {
			if (
				sourceBufferRef.current &&
				!sourceBufferRef.current.updating &&
				chunksQueueRef.current.length === 0
			) {
				try {
					if (
						mediaSourceRef.current &&
						mediaSourceRef.current.readyState === "open"
					) {
						mediaSourceRef.current.endOfStream();
						console.log("[Streaming Audio] Stream finalized");
					}
				} catch (error) {
					console.error("[Streaming Audio] Error finalizing stream:", error);
				}
			} else {
				// Check again in 100ms
				setTimeout(checkAndFinalize, 100);
			}
		};

		checkAndFinalize();
	}, []);

	// Reset the player
	const reset = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.src = "";
		}

		if (mediaSourceRef.current) {
			try {
				if (mediaSourceRef.current.readyState === "open") {
					mediaSourceRef.current.endOfStream();
				}
			} catch (_error) {
				// Ignore errors during cleanup
			}
			mediaSourceRef.current = null;
		}

		sourceBufferRef.current = null;
		chunksQueueRef.current = [];
		isAppendingRef.current = false;
		setIsReady(false);
		setIsPlaying(false);
		setError(null);
	}, []);

	// Playback controls
	const play = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.play().catch((error) => {
				console.error("[Streaming Audio] Error playing audio:", error);
				setError("Failed to play audio");
			});
		}
	}, []);

	const pause = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
		}
	}, []);

	const seek = useCallback((time: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = time;
		}
	}, []);

	const setVolume = useCallback((vol: number) => {
		const clampedVolume = Math.max(0, Math.min(1, vol));
		if (audioRef.current) {
			audioRef.current.volume = clampedVolume;
		}
		setVolumeState(clampedVolume);
	}, []);

	const setPlaybackRate = useCallback((rate: number) => {
		const clampedRate = Math.max(0.5, Math.min(2, rate));
		if (audioRef.current) {
			audioRef.current.playbackRate = clampedRate;
		}
		setPlaybackRateState(clampedRate);
	}, []);

	return {
		// State
		isPlaying,
		currentTime,
		duration,
		volume,
		playbackRate,
		isReady,
		error,

		// Controls
		play,
		pause,
		seek,
		setVolume,
		setPlaybackRate,

		// Streaming controls
		initializeMediaSource,
		addChunk,
		finalize,
		reset,
	};
}
