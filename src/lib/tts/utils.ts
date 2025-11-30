/**
 * Split text into chunks at sentence boundaries, respecting max length
 */
export function chunkText(text: string, maxLength: number): string[] {
	if (text.length <= maxLength) {
		return [text];
	}

	const chunks: string[] = [];
	// Split on sentence boundaries (. ! ? followed by space or end of string)
	const sentences = text.match(/[^.!?]+[.!?]+[\s]?|[^.!?]+$/g) || [text];

	let currentChunk = "";

	for (const sentence of sentences) {
		// If adding this sentence would exceed the limit
		if (currentChunk.length + sentence.length > maxLength) {
			// If we have a current chunk, save it
			if (currentChunk) {
				chunks.push(currentChunk.trim());
				currentChunk = "";
			}

			// If the sentence itself is too long, split it at word boundaries
			if (sentence.length > maxLength) {
				const words = sentence.split(/\s+/);
				for (const word of words) {
					if (currentChunk.length + word.length + 1 > maxLength) {
						if (currentChunk) {
							chunks.push(currentChunk.trim());
							currentChunk = "";
						}
					}
					currentChunk += (currentChunk ? " " : "") + word;
				}
			} else {
				currentChunk = sentence;
			}
		} else {
			currentChunk += sentence;
		}
	}

	// Add any remaining chunk
	if (currentChunk.trim()) {
		chunks.push(currentChunk.trim());
	}

	return chunks;
}

/**
 * Estimate audio duration from word count
 * Assumes average reading speed of 150 words per minute
 */
export function estimateDuration(text: string): number {
	const wordCount = text.split(/\s+/).length;
	return Math.ceil((wordCount / 150) * 60);
}

/**
 * Get byte length of a string (UTF-8 encoding)
 */
function getByteLength(text: string): number {
	return Buffer.byteLength(text, "utf8");
}

/**
 * Split text into chunks at sentence boundaries, respecting max byte length
 * This is important for APIs that have byte limits rather than character limits
 */
export function chunkTextByBytes(text: string, maxBytes: number): string[] {
	if (getByteLength(text) <= maxBytes) {
		return [text];
	}

	const chunks: string[] = [];
	// Split on sentence boundaries (. ! ? followed by space or end of string)
	const sentences = text.match(/[^.!?]+[.!?]+[\s]?|[^.!?]+$/g) || [text];

	let currentChunk = "";

	for (const sentence of sentences) {
		const potentialChunk = currentChunk + sentence;

		// If adding this sentence would exceed the byte limit
		if (getByteLength(potentialChunk) > maxBytes) {
			// If we have a current chunk, save it
			if (currentChunk) {
				chunks.push(currentChunk.trim());
				currentChunk = "";
			}

			// If the sentence itself is too long, split it at word boundaries
			if (getByteLength(sentence) > maxBytes) {
				const words = sentence.split(/\s+/);
				for (const word of words) {
					const testChunk = currentChunk ? `${currentChunk} ${word}` : word;
					if (getByteLength(testChunk) > maxBytes) {
						if (currentChunk) {
							chunks.push(currentChunk.trim());
							currentChunk = "";
						}
						currentChunk = word;
					} else {
						currentChunk = testChunk;
					}
				}
			} else {
				currentChunk = sentence;
			}
		} else {
			currentChunk = potentialChunk;
		}
	}

	// Add any remaining chunk
	if (currentChunk.trim()) {
		chunks.push(currentChunk.trim());
	}

	return chunks;
}
