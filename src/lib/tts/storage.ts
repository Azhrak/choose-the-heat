/**
 * Google Cloud Storage Integration - Text-to-Speech Feature
 *
 * Manages audio file upload to GCS with signed URLs and lifecycle policies.
 * Implements 90-day audio retention and 7-day signed URL expiry.
 *
 * @see docs/features/text-to-speech.md - Complete feature documentation
 * @update-trigger When modifying GCS configuration, lifecycle policies, or signed URL generation, update the feature doc
 */

import crypto from "node:crypto";
import { Storage } from "@google-cloud/storage";
import { getTTSConfig } from "./config";

/**
 * Options for uploading audio to GCS
 */
export interface UploadAudioOptions {
	audioBuffer: Buffer;
	storyId: string;
	sceneNumber: number;
	provider: string;
	voiceId: string;
}

/**
 * Initialize Google Cloud Storage client
 */
function getStorageClient(): Storage {
	const serviceAccountJson = process.env.GCS_SERVICE_ACCOUNT_JSON;

	if (!serviceAccountJson) {
		throw new Error("GCS_SERVICE_ACCOUNT_JSON environment variable is not set");
	}

	try {
		const credentials = JSON.parse(serviceAccountJson);
		return new Storage({ credentials });
	} catch (error) {
		throw new Error(
			`Failed to parse GCS service account JSON: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Upload audio file to Google Cloud Storage
 * Returns the GCS path (gs://bucket/path format) for permanent storage
 * Signed URLs should be generated on-demand using generateSignedUrl()
 */
export async function uploadAudioToGCS(
	options: UploadAudioOptions,
): Promise<string> {
	const { audioBuffer, storyId, sceneNumber, provider, voiceId } = options;

	// Get TTS config for bucket info
	const config = await getTTSConfig();
	const bucketName = config.gcsBucketName;

	if (!bucketName) {
		throw new Error("GCS bucket name is not configured");
	}

	// Generate filename with hash to ensure uniqueness
	const hash = crypto
		.createHash("md5")
		.update(`${storyId}-${sceneNumber}-${provider}-${voiceId}`)
		.digest("hex")
		.substring(0, 8);

	const filename = `${config.gcsBucketPath}${storyId}/scene-${sceneNumber}-${hash}.mp3`;

	console.log(`[TTS Storage] Uploading to GCS: ${bucketName}/${filename}`);

	try {
		// Initialize storage client
		const storage = getStorageClient();
		const bucket = storage.bucket(bucketName);
		const file = bucket.file(filename);

		// Upload file with metadata
		await file.save(audioBuffer, {
			metadata: {
				contentType: "audio/mpeg",
				metadata: {
					storyId,
					sceneNumber: sceneNumber.toString(),
					provider,
					voiceId,
					createdAt: new Date().toISOString(),
				},
				cacheControl: "public, max-age=31536000", // Cache for 1 year
			},
		});

		// Return GCS path (gs://bucket/path format)
		// Signed URLs will be generated on-demand when serving audio
		const gcsPath = `gs://${bucketName}/${filename}`;
		console.log(`[TTS Storage] Upload successful: ${gcsPath}`);

		return gcsPath;
	} catch (error) {
		console.error("[TTS Storage] Upload failed:", error);
		throw new Error(
			`Failed to upload audio to GCS: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Generate a signed URL from a GCS path
 * Signed URLs expire after 7 days, so regenerate them on-demand
 */
export async function generateSignedUrl(gcsPath: string): Promise<string> {
	try {
		// Parse GCS path (gs://bucket/path/to/file.mp3)
		const gcsPattern = /^gs:\/\/([^/]+)\/(.+)$/;
		const match = gcsPath.match(gcsPattern);

		if (!match) {
			throw new Error(`Invalid GCS path format: ${gcsPath}`);
		}

		const [, bucketName, filename] = match;

		// Initialize storage client
		const storage = getStorageClient();
		const bucket = storage.bucket(bucketName);
		const file = bucket.file(filename);

		// Generate signed URL (valid for 7 days)
		const [signedUrl] = await file.getSignedUrl({
			action: "read",
			expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		return signedUrl;
	} catch (error) {
		console.error("[TTS Storage] Failed to generate signed URL:", error);
		throw new Error(
			`Failed to generate signed URL: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Delete audio file from Google Cloud Storage
 * Accepts either GCS path (gs://bucket/path) or signed URL
 */
export async function deleteAudioFromGCS(audioUrl: string): Promise<void> {
	try {
		let bucketName: string;
		let filename: string;

		// Check if it's a GCS path (gs://bucket/path) or signed URL
		if (audioUrl.startsWith("gs://")) {
			const gcsPattern = /^gs:\/\/([^/]+)\/(.+)$/;
			const match = audioUrl.match(gcsPattern);

			if (!match) {
				throw new Error(`Invalid GCS path format: ${audioUrl}`);
			}

			[, bucketName, filename] = match;
		} else {
			// Extract bucket and filename from signed URL
			// Format: https://storage.googleapis.com/{bucket}/{filename}?X-Goog-Algorithm=...
			const urlPattern = /https:\/\/storage\.googleapis\.com\/([^/]+)\/([^?]+)/;
			const match = audioUrl.match(urlPattern);

			if (!match) {
				throw new Error(`Invalid GCS URL format: ${audioUrl}`);
			}

			[, bucketName, filename] = match;
		}

		console.log(`[TTS Storage] Deleting from GCS: ${bucketName}/${filename}`);

		// Initialize storage client
		const storage = getStorageClient();
		const bucket = storage.bucket(bucketName);
		const file = bucket.file(filename);

		// Delete file
		await file.delete();

		console.log(`[TTS Storage] Delete successful: ${filename}`);
	} catch (error) {
		console.error("[TTS Storage] Delete failed:", error);
		throw new Error(
			`Failed to delete audio from GCS: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

/**
 * Delete all audio files for a user's stories
 * Used for "clear all audio" functionality
 */
export async function deleteAllUserAudio(userId: string): Promise<number> {
	// This would require querying all story IDs for the user first
	// For now, this is a placeholder
	// TODO: Implement after database queries are ready
	console.log(
		`[TTS Storage] deleteAllUserAudio not yet implemented for user: ${userId}`,
	);
	return 0;
}

/**
 * Background job to clean up audio files older than 90 days
 * Should be run as a cron job or scheduled task
 */
export async function cleanupOldAudio(): Promise<number> {
	const config = await getTTSConfig();
	const bucketName = config.gcsBucketName;

	if (!bucketName) {
		console.warn(
			"[TTS Storage] GCS bucket name not configured, skipping cleanup",
		);
		return 0;
	}

	try {
		const storage = getStorageClient();
		const bucket = storage.bucket(bucketName);

		// Get all files in the audio path
		const [files] = await bucket.getFiles({
			prefix: config.gcsBucketPath,
		});

		const ninetyDaysAgo = new Date();
		ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

		let deletedCount = 0;

		for (const file of files) {
			const [metadata] = await file.getMetadata();
			const customCreatedAt = metadata.metadata?.createdAt;
			const createdAt =
				customCreatedAt && typeof customCreatedAt === "string"
					? new Date(customCreatedAt)
					: metadata.timeCreated && typeof metadata.timeCreated === "string"
						? new Date(metadata.timeCreated)
						: new Date();

			if (createdAt < ninetyDaysAgo) {
				console.log(
					`[TTS Storage] Deleting old file: ${file.name} (created ${createdAt.toISOString()})`,
				);
				await file.delete();
				deletedCount++;
			}
		}

		console.log(
			`[TTS Storage] Cleanup complete: deleted ${deletedCount} files`,
		);
		return deletedCount;
	} catch (error) {
		console.error("[TTS Storage] Cleanup failed:", error);
		throw new Error(
			`Failed to cleanup old audio: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
