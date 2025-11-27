import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { storySceneQueryKey } from "./useStorySceneQuery";

interface SceneMetadata {
	scene: {
		number: number;
		wordCount: number;
		cached: boolean;
	};
	story: {
		id: string;
		title: string;
		currentScene: number;
		estimatedScenes: number;
		status: string;
	};
	choicePoint: {
		id: string;
		promptText: string;
		options: Array<{ text: string; tone: string }>;
	} | null;
	previousChoice: number | null;
}

interface StreamingSceneState {
	content: string;
	metadata: SceneMetadata | null;
	isStreaming: boolean;
	isComplete: boolean;
	error: string | null;
}

interface CachedSceneData {
	scene: {
		number: number;
		content: string;
		wordCount: number;
		cached: boolean;
	};
	story: {
		id: string;
		title: string;
		currentScene: number;
		estimatedScenes: number;
		status: string;
	};
	choicePoint: {
		id: string;
		promptText: string;
		options: Array<{
			text: string;
			tone: string;
		}>;
	} | null;
	previousChoice: number | null;
}

export function useStreamingScene(
	storyId: string,
	sceneNumber: number | null = null,
	enabled = true,
) {
	const queryClient = useQueryClient();
	const [retryCounter, setRetryCounter] = useState(0);
	const [forceRegenerate, setForceRegenerate] = useState(false);
	const [state, setState] = useState<StreamingSceneState>({
		content: "",
		metadata: null,
		isStreaming: false,
		isComplete: false,
		error: null,
	});

	const abortControllerRef = useRef<AbortController | null>(null);

	const retry = useCallback(() => {
		// Clear cache and force refetch
		const queryKey = storySceneQueryKey(storyId, sceneNumber);
		queryClient.removeQueries({ queryKey });
		setForceRegenerate(true);
		setRetryCounter((prev) => prev + 1);
	}, [storyId, sceneNumber, queryClient]);

	useEffect(() => {
		if (!enabled) return;

		// Check if scene is already in query cache (but not during retry)
		const queryKey = storySceneQueryKey(storyId, sceneNumber);
		const cachedData = queryClient.getQueryData<CachedSceneData>(queryKey);

		if (cachedData && retryCounter === 0) {
			// Use cached data immediately - but only if it has content
			if (cachedData.scene.content?.trim()) {
				setState({
					content: cachedData.scene.content,
					metadata: {
						scene: {
							number: cachedData.scene.number,
							wordCount: cachedData.scene.wordCount,
							cached: true,
						},
						story: cachedData.story,
						choicePoint: cachedData.choicePoint,
						previousChoice: cachedData.previousChoice,
					},
					isStreaming: false,
					isComplete: true,
					error: null,
				});
				return;
			} else {
				// Cached data has empty content, clear and fetch fresh
				queryClient.removeQueries({ queryKey });
			}
		}

		// Reset state when scene changes
		setState({
			content: "",
			metadata: null,
			isStreaming: true,
			isComplete: false,
			error: null,
		});

		// Create abort controller for this request
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		const params = new URLSearchParams();
		if (sceneNumber !== null) {
			params.append("number", sceneNumber.toString());
		}
		if (forceRegenerate) {
			params.append("forceRegenerate", "true");
		}

		const url = `/api/stories/${storyId}/scene/stream?${params.toString()}`;

		// Start streaming
		let finalMetadata: SceneMetadata | null = null;
		let finalContent = "";

		fetch(url, { signal: abortController.signal })
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const reader = response.body?.getReader();
				const decoder = new TextDecoder();

				if (!reader) {
					throw new Error("No response body");
				}

				let buffer = "";

				while (true) {
					const { done, value } = await reader.read();

					if (done) {
						break;
					}

					buffer += decoder.decode(value, { stream: true });

					// Process complete SSE messages
					const lines = buffer.split("\n\n");
					buffer = lines.pop() || ""; // Keep incomplete message in buffer

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							const data = JSON.parse(line.slice(6));

							if (data.type === "metadata") {
								finalMetadata = data as SceneMetadata;
								setState((prev) => ({
									...prev,
									metadata: finalMetadata,
								}));
							} else if (data.type === "content") {
								finalContent += data.content;
								setState((prev) => ({
									...prev,
									content: prev.content + data.content,
								}));
							} else if (data.type === "done") {
								// Reset forceRegenerate flag on successful completion
								setForceRegenerate(false);
								setState((prev) => ({
									...prev,
									isStreaming: false,
									isComplete: true,
								})); // Cache the complete scene data in React Query - but only if we have content
								if (finalMetadata && finalContent.trim()) {
									const cacheData: CachedSceneData = {
										scene: {
											number: finalMetadata.scene.number,
											content: finalContent,
											wordCount: finalMetadata.scene.wordCount,
											cached: finalMetadata.scene.cached,
										},
										story: finalMetadata.story,
										choicePoint: finalMetadata.choicePoint,
										previousChoice: finalMetadata.previousChoice,
									};
									queryClient.setQueryData(queryKey, cacheData);
								} else if (!finalContent.trim()) {
									console.warn(
										"AI returned empty content for scene generation. Scene:",
										finalMetadata?.scene.number,
										"Story:",
										storyId,
									);
								}
							} else if (data.type === "error") {
								setState((prev) => ({
									...prev,
									isStreaming: false,
									isComplete: false,
									error: data.error,
								}));
							}
						}
					}
				}
			})
			.catch((error) => {
				if (error.name === "AbortError") {
					// Request was cancelled, ignore
					return;
				}
				console.error("Streaming error:", error);
				setState((prev) => ({
					...prev,
					isStreaming: false,
					isComplete: false,
					error: error instanceof Error ? error.message : "Unknown error",
				}));
			});

		// Cleanup function
		return () => {
			abortController.abort();
		};
	}, [
		storyId,
		sceneNumber,
		enabled,
		queryClient,
		retryCounter,
		forceRegenerate,
	]);

	return { ...state, retry };
}
