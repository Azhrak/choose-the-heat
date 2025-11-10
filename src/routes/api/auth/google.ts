import { createFileRoute } from "@tanstack/react-router";
import { generateOAuthState, generatePKCE, google, storePKCEVerifier } from "~/lib/auth/oauth";

export const Route = createFileRoute("/api/auth/google")({
	server: {
		handlers: {
			GET: async () => {
				const state = generateOAuthState();
				const { codeVerifier } = generatePKCE();
				
				// Store the code verifier for later use in the callback
				storePKCEVerifier(state, codeVerifier);
				
				// Arctic's createAuthorizationURL takes the code verifier directly
				// and generates the challenge internally
				const url = await google.createAuthorizationURL(state, codeVerifier, {
					scopes: ["email", "profile"],
				});

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
