import { createFileRoute } from "@tanstack/react-router";
import { getGoogleUser, google, verifyOAuthState } from "~/lib/auth/oauth";
import { createSession, createSessionCookie } from "~/lib/auth/session";
import { getOrCreateGoogleUser } from "~/lib/db/queries/users";

export const Route = createFileRoute("/api/auth/callback/google")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const code = url.searchParams.get("code");
				const state = url.searchParams.get("state");

				// Get state from cookie
				const cookies = request.headers.get("cookie") || "";
				const stateCookie = cookies
					.split(";")
					.find((c) => c.trim().startsWith("oauth_state="))
					?.split("=")[1];

				// Validate state
				if (!code || !state || !stateCookie || state !== stateCookie) {
					return new Response("Invalid OAuth state", { status: 400 });
				}

				if (!verifyOAuthState(state)) {
					return new Response("Invalid or expired OAuth state", {
						status: 400,
					});
				}

				try {
					// Exchange code for tokens
					const tokens = await google.validateAuthorizationCode(code);
					const googleUser = await getGoogleUser(tokens.accessToken());

					// Create or get user
					const user = await getOrCreateGoogleUser(
						googleUser,
						tokens.accessToken(),
					);

					if (!user) {
						return new Response("Failed to create user", { status: 500 });
					}

					// Create session
					const session = await createSession(user.id);

					// Check if user has completed onboarding
					const needsOnboarding = !user.default_preferences;

					// Redirect based on onboarding status
					const redirectUrl = needsOnboarding ? "/auth/onboarding" : "/browse";

					return new Response(null, {
						status: 302,
						headers: {
							Location: redirectUrl,
							"Set-Cookie": createSessionCookie(session.id, session.expiresAt),
						},
					});
				} catch (error) {
					console.error("OAuth callback error:", error);
					return new Response("Authentication failed", { status: 500 });
				}
			},
		},
	},
});
