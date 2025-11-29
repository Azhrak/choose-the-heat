import type { TTSProvider, Voice } from "./config";
import { getAvailableVoices as getAvailableVoicesFromConfig } from "./config";

/**
 * Get available voices for a specific provider
 * For most providers, this returns the static list from config
 * For ElevenLabs, this would fetch from their API
 */
export async function getAvailableVoices(
	provider?: TTSProvider,
): Promise<Voice[]> {
	// For now, just return from config
	// TODO: Implement ElevenLabs API fetching
	return getAvailableVoicesFromConfig(provider);
}

/**
 * Get all available voices grouped by provider
 */
export async function getAllVoices(): Promise<Record<TTSProvider, Voice[]>> {
	const [openai, google, elevenlabs, azure] = await Promise.all([
		getAvailableVoices("openai"),
		getAvailableVoices("google"),
		getAvailableVoices("elevenlabs"),
		getAvailableVoices("azure"),
	]);

	return {
		openai,
		google,
		elevenlabs,
		azure,
	};
}

/**
 * Fetch ElevenLabs voices from their API
 * TODO: Implement when ElevenLabs is fully integrated
 */
async function _fetchElevenLabsVoices(): Promise<Voice[]> {
	const apiKey = process.env.ELEVENLABS_API_KEY;

	if (!apiKey) {
		console.warn("ELEVENLABS_API_KEY not set, using default voices");
		return [
			{ id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" },
			{ id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
		];
	}

	// TODO: Implement actual API call
	// const response = await fetch('https://api.elevenlabs.io/v1/voices', {
	//   headers: { 'xi-api-key': apiKey }
	// });
	// const data = await response.json();
	// return data.voices.map(v => ({ id: v.voice_id, name: v.name }));

	return [
		{ id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel" },
		{ id: "AZnzlk1XvdvUeBnXmlld", name: "Domi" },
	];
}
