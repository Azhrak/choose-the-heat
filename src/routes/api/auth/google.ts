import { createFileRoute } from "@tanstack/react-router";
import {
	generateOAuthState,
	generatePKCE,
	google,
	storePKCEVerifier,
} from "~/lib/auth/oauth";

export const Route = createFileRoute("/api/auth/google")({
	server: {
		handlers: {
			GET: async () => {
				const state = generateOAuthState();
				const { codeVerifier } = generatePKCE();

				// Store the code verifier for later use in the callback
				storePKCEVerifier(state, codeVerifier);

				// Arctic v3: scopes are passed as the third parameter directly
				const url = google.createAuthorizationURL(state, codeVerifier, [
					"email",
					"profile",
				]);

				return new Response(null, {
					status: 302,
					headers: {
						Location: url.toString(),
						"Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
					},
				});
			},
		},
	},
});
