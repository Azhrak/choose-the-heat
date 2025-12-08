import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/api/client";

interface AudioMetadata {
	exists: boolean;
	audioUrl: string;
	fileSize: number;
	duration: number;
	provider: string;
	voice: {
		id: string;
		name: string;
	};
}

interface StreamMetadata {
	estimatedDuration: number;
	format: string;
	totalChunks?: number;
	provider: string;
	audioFormat: string;
	pcmSpecs?: {
		sampleRate: number;
		bitDepth: number;
		channels: number;
	};
}

interface StreamChunk {
	type: "metadata" | "audio";
	metadata?: StreamMetadata;
	index?: number;
	isLast?: boolean;
	data?: string;
	format?: string;
}

/**
 * Generate audio using streaming endpoint
 * Returns null if streaming is not supported (fallback to non-streaming)
 */
async function generateStreamingAudio(
	storyId: string,
	sceneNumber: number,
	onProgress?: (progress: number) => void,
): Promise<AudioMetadata | null> {
	try {
		const response = await fetch(
			`/api/stories/${storyId}/scene/${sceneNumber}/audio-stream`,
		);

		if (!response.ok) {
			// Check if error is due to unsupported provider
			const text = await response.text();
			if (text.includes("not yet supported")) {
				console.log(
					"[Audio Stream] Provider doesn't support streaming, falling back to non-streaming",
				);
				return null; // Signal to fallback
			}
			throw new Error(`Streaming failed: ${response.statusText}`);
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("No readable stream available");
		}

		const decoder = new TextDecoder();
		let metadata: StreamMetadata | null = null;
		const audioChunks: Uint8Array[] = [];
		let receivedChunks = 0;
		let buffer = ""; // Buffer for incomplete lines

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			// Prepend any buffered incomplete line from previous iteration
			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");

			// Save the last line (might be incomplete) for next iteration
			buffer = lines.pop() || "";

			for (const line of lines) {
				if (!line.trim()) continue;

				const chunk = JSON.parse(line) as StreamChunk;

				if (chunk.type === "metadata" && chunk.metadata) {
					metadata = chunk.metadata;
					console.log(
						`[Audio Stream] Starting stream: ${metadata.audioFormat} format, ${metadata.totalChunks} chunks`,
					);
				} else if (chunk.type === "audio" && chunk.data) {
					// Decode base64 audio data
					const audioData = atob(chunk.data);
					const bytes = new Uint8Array(audioData.length);
					for (let i = 0; i < audioData.length; i++) {
						bytes[i] = audioData.charCodeAt(i);
					}
					audioChunks.push(bytes);

					receivedChunks++;
					if (metadata?.totalChunks && onProgress) {
						onProgress((receivedChunks / metadata.totalChunks) * 100);
					}

					if (chunk.isLast) {
						console.log("[Audio Stream] Received final chunk");
					}
				}
			}
		}

		// Process any remaining buffered data
		if (buffer.trim()) {
			try {
				const chunk = JSON.parse(buffer) as StreamChunk;
				if (chunk.type === "metadata" && chunk.metadata) {
					metadata = chunk.metadata;
				} else if (chunk.type === "audio" && chunk.data) {
					const audioData = atob(chunk.data);
					const bytes = new Uint8Array(audioData.length);
					for (let i = 0; i < audioData.length; i++) {
						bytes[i] = audioData.charCodeAt(i);
					}
					audioChunks.push(bytes);
					receivedChunks++;
				}
			} catch (error) {
				console.warn("[Audio Stream] Failed to parse final buffer:", error);
			}
		}

		if (!metadata) {
			throw new Error("No metadata received from stream");
		}

		// Combine all audio chunks into a single blob
		const totalLength = audioChunks.reduce((acc, arr) => acc + arr.length, 0);
		const combined = new Uint8Array(totalLength);
		let offset = 0;
		for (const chunk of audioChunks) {
			combined.set(chunk, offset);
			offset += chunk.length;
		}

		// Create blob with appropriate MIME type
		const mimeType =
			metadata.audioFormat === "mp3" ? "audio/mp3" : "audio/L16;rate=24000";
		const blob = new Blob([combined], { type: mimeType });
		const audioUrl = URL.createObjectURL(blob);

		console.log(
			`[Audio Stream] Complete: ${audioChunks.length} chunks, ${totalLength} bytes`,
		);

		// Return metadata in the same format as non-streaming
		return {
			exists: true,
			audioUrl,
			fileSize: totalLength,
			duration: metadata.estimatedDuration,
			provider: metadata.provider,
			voice: {
				id: "streaming", // We don't get voice details from streaming
				name: "Streaming Voice",
			},
		};
	} catch (error) {
		console.error("[Audio Stream] Error:", error);
		throw error;
	}
}

/**
 * Hook for managing audio generation for a scene
 */
export function useAudioGeneration(storyId: string, sceneNumber: number) {
	const queryClient = useQueryClient();
	const queryKey = ["scene-audio", storyId, sceneNumber];

	// Query to check if audio exists
	const audioQuery = useQuery({
		queryKey,
		queryFn: async (): Promise<AudioMetadata | null> => {
			try {
				const response = await api.get(
					`/api/stories/${storyId}/scene/${sceneNumber}/audio`,
				);
				return response as AudioMetadata;
			} catch (error) {
				console.error("Error fetching audio:", error);
				return null;
			}
		},
		enabled: !!storyId && sceneNumber > 0,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Mutation for generating audio with streaming support and fallback
	const generateMutation = useMutation({
		mutationFn: async (options?: {
			voice?: string;
			onProgress?: (progress: number) => void;
		}) => {
			// Try streaming first
			try {
				console.log("[Audio Generation] Attempting streaming...");
				const streamResult = await generateStreamingAudio(
					storyId,
					sceneNumber,
					options?.onProgress,
				);

				// If streaming returned null, fallback to non-streaming
				if (streamResult === null) {
					console.log("[Audio Generation] Falling back to non-streaming...");
					const params = new URLSearchParams({ generate: "true" });
					if (options?.voice) {
						params.append("voice", options.voice);
					}
					const response = await api.get(
						`/api/stories/${storyId}/scene/${sceneNumber}/audio?${params.toString()}`,
					);
					return response as AudioMetadata;
				}

				return streamResult;
			} catch (error) {
				// If streaming fails completely, fallback to non-streaming
				console.warn(
					"[Audio Generation] Streaming failed, falling back to non-streaming:",
					error,
				);
				const params = new URLSearchParams({ generate: "true" });
				if (options?.voice) {
					params.append("voice", options.voice);
				}
				const response = await api.get(
					`/api/stories/${storyId}/scene/${sceneNumber}/audio?${params.toString()}`,
				);
				return response as AudioMetadata;
			}
		},
		onSuccess: () => {
			// Invalidate query to refetch
			queryClient.invalidateQueries({ queryKey });
		},
	});

	return {
		audio: audioQuery.data,
		isLoading: audioQuery.isLoading,
		isError: audioQuery.isError,
		generate: generateMutation.mutate,
		isGenerating: generateMutation.isPending,
	};
}
