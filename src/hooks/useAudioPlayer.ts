import { useEffect, useRef, useState } from "react";

/**
 * Hook for managing HTML5 audio playback
 */
export function useAudioPlayer(audioUrl?: string) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolumeState] = useState(1);
	const [playbackRate, setPlaybackRateState] = useState(1);

	// Initialize audio element
	useEffect(() => {
		if (typeof window === "undefined") return;

		if (!audioRef.current) {
			audioRef.current = new Audio();
		}

		const audio = audioRef.current;

		const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
		const handleLoadedMetadata = () => setDuration(audio.duration);
		const handleEnded = () => setIsPlaying(false);
		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);

		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("loadedmetadata", handleLoadedMetadata);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("play", handlePlay);
		audio.addEventListener("pause", handlePause);

		return () => {
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("play", handlePlay);
			audio.removeEventListener("pause", handlePause);
		};
	}, []);

	// Update audio source when URL changes
	useEffect(() => {
		if (!audioUrl || !audioRef.current) return;

		const audio = audioRef.current;

		// Pause current audio
		audio.pause();
		setIsPlaying(false);

		// Set new source
		audio.src = audioUrl;
		audio.load();

		return () => {
			// Cleanup on unmount
			audio.pause();
			audio.src = "";
			setIsPlaying(false);
		};
	}, [audioUrl]);

	const play = () => {
		if (audioRef.current) {
			audioRef.current.play().catch((error) => {
				console.error("Error playing audio:", error);
			});
		}
	};

	const pause = () => {
		if (audioRef.current) {
			audioRef.current.pause();
		}
	};

	const seek = (time: number) => {
		if (audioRef.current) {
			audioRef.current.currentTime = time;
		}
	};

	const setVolume = (vol: number) => {
		const clampedVolume = Math.max(0, Math.min(1, vol));
		if (audioRef.current) {
			audioRef.current.volume = clampedVolume;
		}
		setVolumeState(clampedVolume);
	};

	const setPlaybackRate = (rate: number) => {
		const clampedRate = Math.max(0.5, Math.min(2, rate));
		if (audioRef.current) {
			audioRef.current.playbackRate = clampedRate;
		}
		setPlaybackRateState(clampedRate);
	};

	return {
		isPlaying,
		currentTime,
		duration,
		volume,
		playbackRate,
		play,
		pause,
		seek,
		setVolume,
		setPlaybackRate,
	};
}
