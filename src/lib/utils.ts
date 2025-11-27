import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Format error messages for API responses
 */
export function formatError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "An unexpected error occurred";
}

/**
 * Type guard to check if an object has a specific property
 */
export function hasProperty<T extends string>(
	obj: unknown,
	prop: T,
): obj is Record<T, unknown> {
	return typeof obj === "object" && obj !== null && prop in obj;
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate story reading progress percentage
 * Progress is based on completed scenes (currentScene - 1), not the current scene being read.
 * Shows 100% only when status is "completed" and currentScene equals totalScenes.
 * 
 * @param currentScene - The current scene number (1-based)
 * @param totalScenes - Total number of scenes in the story
 * @param status - Story status ("in-progress" or "completed")
 * @returns Object containing percentage and width for progress bar
 */
export function calculateStoryProgress(
	currentScene: number,
	totalScenes: number,
	status: "in-progress" | "completed" = "in-progress",
): { percentage: number; width: number } {
	// Progress is based on completed scenes
	// If status is completed and we're at the last scene, show 100%
	const isFullyCompleted = status === "completed" && currentScene === totalScenes;
	const completedScenes = isFullyCompleted ? totalScenes : currentScene - 1;
	const percentage = Math.round((completedScenes / totalScenes) * 100);
	const width = Math.min((completedScenes / totalScenes) * 100, 100);
	
	return { percentage, width };
}
