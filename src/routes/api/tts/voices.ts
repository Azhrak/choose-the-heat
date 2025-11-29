import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getSessionFromRequest } from "~/lib/auth/session";
import { getAllVoices } from "~/lib/tts/voices";

export const Route = createFileRoute("/api/tts/voices")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					// Validate session
					const session = await getSessionFromRequest(request);
					if (!session) {
						return json({ error: "Unauthorized" }, { status: 401 });
					}

					// Get all available voices grouped by provider
					const voices = await getAllVoices();

					return json({ voices });
				} catch (error) {
					console.error("Error fetching voices:", error);
					return json({ error: "Failed to fetch voices" }, { status: 500 });
				}
			},
		},
	},
});
